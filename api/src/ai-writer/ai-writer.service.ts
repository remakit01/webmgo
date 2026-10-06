import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  AI_WRITER_LIMITS as L,
  SITE_LINK_TARGETS,
  type AiDraftEvent,
  type AiDraftRequest,
  type AiDuplicatePost,
  type AiLinkSuggestion,
  type AiOutline,
  type AiOutlineRequest,
  type AiOutlineSection,
  type AiResearchEvent,
  type AiResearchRequest,
  type AiResearchResult,
  type AiWriterSource,
} from '@remak/shared/contracts/ai-writer';
import {
  AI_KNOWLEDGE_KINDS,
  type AiKnowledgeKind,
  type AiKnowledgeSuggestion,
} from '@remak/shared/contracts/ai-knowledge';
import {
  analyzeContent,
  contentScores,
  normalizeText,
  type ContentScore,
} from '@remak/shared/content-score';
import { overlapRatio } from '@remak/shared/text-rank';
import { isInternalLink, isSafeLink } from '@remak/shared/link';
import {
  AI_SECTION_SCHEMA,
  aiBlocksToValidNodes,
  readAiBlocks,
  type AiBlock,
  type AiUsedLink,
} from '@remak/shared/rich-ai';
import {
  nodeText,
  toPlainText,
  validateRichDoc,
  type RichDoc,
  type RichNode,
} from '@remak/shared/rich-content';
import { slugify } from '@remak/shared/slug';
import { GeminiService, InvalidAiOutputError } from '../ai/gemini.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiRetrieverService } from '../ai-knowledge/ai-retriever.service.js';
import { DUPLICATE_OVERLAP } from '../ai-knowledge/ai-knowledge.service.js';
import {
  FAQ_SCHEMA,
  MODEL_ONLY_RESEARCH_HEADER,
  OUTLINE_SCHEMA,
  OUTLINE_SYSTEM,
  REFERENCES_HEADING,
  RESEARCH_MODEL_SYSTEM,
  RESEARCH_SCHEMA,
  RESEARCH_SYSTEM,
  STRUCTURE_SYSTEM,
  SUMMARY_SCHEMA,
  VERIFY_MARK,
  WRITER_SYSTEM,
  faqPrompt,
  outlinePrompt,
  revisePrompt,
  researchPrompt,
  sectionPrompt,
  structurePrompt,
  summaryPrompt,
  type DraftContext,
  type InternalKnowledge,
} from './ai-writer.prompts.js';

/** Người dùng huỷ (đóng kết nối) — controller kết thúc luồng, không báo lỗi */
export class AiWriterAbortedError extends Error {}

interface StreamOptions<E> {
  onEvent?: (event: E) => void;
  signal?: AbortSignal;
}

// Tìm Google + tổng hợp lâu hơn một lần dịch
const GROUNDED_TIMEOUT_MS = 60_000;
const GROUNDED_BUDGET_MS = 120_000;
const WRITE_TIMEOUT_MS = 60_000;
const WRITE_BUDGET_MS = 120_000;
/** Số lời gọi Gemini chạy song song khi viết bài */
const WRITE_CONCURRENCY = 3;
/** Số bài đã đăng đưa vào danh sách link nội bộ cho AI */
const INTERNAL_POST_LINKS = 12;
const DUPLICATE_LIMIT = 5;
/** Tối đa số mẩu kiến thức mới từ web đề xuất mỗi lần nghiên cứu */
const SUGGESTION_LIMIT = 6;
const SUGGESTION_KINDS = new Set<string>([
  'MARKET',
  'SPEC',
  'CERTIFICATION',
  'PROCESS',
  'OTHER',
]);
const REDIRECT_HOST = 'vertexaisearch.cloud.google.com';

const clip = (s: unknown, max: number) =>
  typeof s === 'string' ? s.trim().slice(0, max) : '';
const clipList = (
  v: unknown,
  maxItems: number,
  maxLen: number = L.itemLength,
) =>
  Array.isArray(v)
    ? v
        .map((x) => clip(x, maxLen))
        .filter(Boolean)
        .slice(0, maxItems)
    : [];

/** Mức khớp chủ đề: tỉ lệ từ của keyword có trong văn bản (không dấu) */
function topicMatch(keyword: string, text: string): number {
  const words = normalizeText(keyword)
    .split(' ')
    .filter((w) => w.length >= 2);
  if (!words.length) return 0;
  const hay = ` ${normalizeText(text)} `;
  return words.filter((w) => hay.includes(` ${w} `)).length / words.length;
}

const isAborted = (signal?: AbortSignal) => !!signal?.aborted;

// ─── Tự sửa chất lượng (PR6) ────────────────────────────────────────────────

/** Điểm mục tiêu mỗi nhóm SEO / AEO / GEO (phần nội dung) — dưới mức này thì AI tự sửa 1 lượt */
const QUALITY_TARGET = 80;
/** Số mục tối đa AI viết lại trong lượt tự sửa */
const MAX_REVISIONS = 3;
/** Số bài liên quan được chấm để chọn bài mẫu; điểm trung bình tối thiểu để làm mẫu */
const EXEMPLAR_POOL = 20;
const EXEMPLAR_MIN_SCORE = 70;

type QualityScores = { seo: number; aeo: number; geo: number };

interface DraftSlots {
  summary: RichNode[] | null;
  /** Thân từng mục (không gồm tiêu đề mục) theo thứ tự dàn ý */
  sections: (RichNode[] | null)[];
  faq: RichNode[] | null;
  /** Link AI đã chèn theo mục (-1 tóm tắt, -2 FAQ) */
  links: Map<number, AiUsedLink[]>;
}

interface RevisionInstruction {
  /** Nhãn ngắn hiển thị cho biên tập viên */
  label: string;
  /** Yêu cầu chi tiết gửi AI */
  text: string;
}

const headingNode = (section: AiOutlineSection): RichNode => ({
  type: 'heading',
  attrs: { level: section.level },
  content: [{ type: 'text', text: section.heading }],
});

/** Ghép bài như CMS: tóm tắt -> các mục -> FAQ -> tài liệu tham khảo */
function assembleDraft(
  slots: DraftSlots,
  sections: AiOutlineSection[],
  references: RichNode[],
): RichDoc {
  const content = [
    ...(slots.summary ?? []),
    ...sections.flatMap((s, i) =>
      slots.sections[i] ? [headingNode(s), ...slots.sections[i]!] : [],
    ),
    ...(slots.faq ?? []),
    ...references,
  ];
  return {
    type: 'doc',
    content: content.length ? content : [{ type: 'paragraph' }],
  };
}

const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;
const plainOf = (nodes: RichNode[] | null) =>
  toPlainText({ type: 'doc', content: nodes ?? [] });

/**
 * Từ các mục kiểm chưa đạt -> việc sửa cụ thể cho từng mục bài (chỉ những việc AI sửa được trong nội dung mục).
 * Trả tối đa MAX_REVISIONS mục, ưu tiên mục có nhiều việc nhất.
 */
function planRevisions(
  analysis: ContentScore,
  slots: DraftSlots,
  sections: AiOutlineSection[],
  keyword: string,
): { index: number; instructions: RevisionInstruction[] }[] {
  const failing = new Map(
    [...analysis.seo.checks, ...analysis.aeo.checks, ...analysis.geo.checks]
      .filter((c) => c.status !== 'good')
      .map((c) => [c.id, c]),
  );
  const byIndex = new Map<number, RevisionInstruction[]>();
  const add = (index: number, instruction: RevisionInstruction) => {
    if (index < 0 || !slots.sections[index]) return;
    const list = byIndex.get(index) ?? [];
    if (!list.some((i) => i.label === instruction.label))
      list.push(instruction);
    byIndex.set(index, list);
  };
  const kw = normalizeText(keyword);
  const occurrences = (i: number) =>
    kw
      ? ` ${normalizeText(plainOf(slots.sections[i]))} `.split(` ${kw} `)
          .length - 1
      : 0;
  const written = sections.map((_, i) => i).filter((i) => slots.sections[i]);

  if (failing.has('aeo-answer-first')) {
    for (const i of written) {
      if (sections[i].level !== 2) continue;
      const first = slots.sections[i]![0];
      const words =
        first?.type === 'paragraph' ? wordCount(plainOf([first])) : 0;
      if (words < 15 || words > 60) {
        add(i, {
          label: 'mở đầu bằng câu trả lời trực tiếp',
          text: 'Khối đầu tiên phải là MỘT đoạn văn 40–60 từ trả lời thẳng câu hỏi của tiêu đề mục, rồi mới giải thích.',
        });
      }
    }
  }
  if (failing.has('geo-definition') && written.length) {
    add(written[0], {
      label: 'thêm câu định nghĩa',
      text: `Câu đầu tiên của mục là câu định nghĩa rõ ràng dạng "${keyword} là …".`,
    });
  }
  const stuffing =
    failing.get('seo-density')?.status === 'bad' ||
    failing.get('geo-no-stuffing')?.status === 'bad';
  if (stuffing) {
    for (const i of [...written]
      .sort((a, b) => occurrences(b) - occurrences(a))
      .slice(0, 2)) {
      add(i, {
        label: 'giảm lặp keyword',
        text: `Giảm lặp lại cụm "${keyword}" (tối đa 1–2 lần trong mục); dùng đại từ, từ đồng nghĩa, viết tự nhiên.`,
      });
    }
  } else if (failing.get('seo-density')?.status === 'warn' && written.length) {
    add(written[0], {
      label: 'nhắc keyword tự nhiên',
      text: `Nhắc tự nhiên cụm "${keyword}" 1–2 lần trong mục.`,
    });
  }
  if (failing.get('seo-intro-kw')?.status === 'bad' && written.length) {
    add(written[0], {
      label: 'đưa keyword vào đoạn đầu',
      text: `Đoạn văn đầu tiên của mục phải chứa cụm "${keyword}".`,
    });
  }
  if (failing.has('aeo-paragraphs')) {
    for (const i of written) {
      if (
        (slots.sections[i] ?? []).some(
          (n) => n.type === 'paragraph' && wordCount(plainOf([n])) > 120,
        )
      ) {
        add(i, {
          label: 'tách đoạn dài',
          text: 'Tách các đoạn dài hơn 100 từ thành nhiều đoạn ngắn, mỗi đoạn một ý.',
        });
      }
    }
  }
  if (failing.has('aeo-structured') && written.length) {
    const longest = [...written].sort(
      (a, b) =>
        wordCount(plainOf(slots.sections[b])) -
        wordCount(plainOf(slots.sections[a])),
    )[0];
    add(longest, {
      label: 'trình bày bằng danh sách/bảng',
      text: 'Trình bày phần liệt kê / quy trình bằng danh sách (bullets hoặc numbered), so sánh nhiều tiêu chí bằng bảng.',
    });
  }
  if (failing.has('geo-statistics')) {
    for (const i of written
      .filter((i) => !/\d/.test(plainOf(slots.sections[i])))
      .slice(0, 2)) {
      add(i, {
        label: 'bổ sung số liệu có nguồn',
        text: 'Bổ sung số liệu cụ thể (độ dày, EI, °C, %, kg/m³...) CÓ trong KIẾN THỨC NỘI BỘ hoặc TÀI LIỆU NGHIÊN CỨU, ghi rõ nguồn; tuyệt đối không bịa số.',
      });
    }
  }
  const entity = failing.get('geo-entity');
  if (entity && written.length)
    add(written[0], { label: 'nêu rõ thực thể', text: entity.message });
  if (failing.has('geo-verify-marks')) {
    for (const i of written.filter((i) =>
      plainOf(slots.sections[i]).includes(VERIFY_MARK),
    )) {
      add(i, {
        label: `xử lý ${VERIFY_MARK}`,
        text: `Thay từng chỗ ${VERIFY_MARK} bằng thông tin CÓ trong KIẾN THỨC NỘI BỘ / TÀI LIỆU NGHIÊN CỨU; nếu không có thì viết lại câu đó chung chung, bỏ con số không có nguồn (không giữ dấu ${VERIFY_MARK}).`,
      });
    }
  }
  return [...byIndex.entries()]
    .sort((a, b) => b[1].length - a[1].length || a[0] - b[0])
    .slice(0, MAX_REVISIONS)
    .map(([index, instructions]) => ({ index, instructions }));
}

/** Khung bài: tiêu đề mục + câu mở đầu ngay sau mỗi H2 (≤ 25 từ) */
function skeletonOf(doc: RichDoc): string {
  const lines: string[] = [];
  const content = doc?.content ?? [];
  content.forEach((node, i) => {
    if (node.type !== 'heading') return;
    const level = Number(node.attrs?.level ?? 2);
    lines.push(`${level === 2 ? 'H2' : '   H3'}: ${nodeText(node).trim()}`);
    const next = content[i + 1];
    if (level === 2 && next?.type === 'paragraph') {
      const first =
        nodeText(next)
          .trim()
          .split(/(?<=[.!?])\s/)[0] ?? '';
      lines.push(`      → ${first.split(/\s+/).slice(0, 25).join(' ')}`);
    }
  });
  return lines.slice(0, 30).join('\n');
}

@Injectable()
export class AiWriterService {
  private readonly logger = new Logger(AiWriterService.name);

  constructor(
    private readonly gemini: GeminiService,
    private readonly prisma: PrismaService,
    private readonly retriever: AiRetrieverService,
  ) {}

  // ─── B1: Nghiên cứu ──────────────────────────────────────────────────────

  async research(
    req: AiResearchRequest,
    options: StreamOptions<AiResearchEvent> = {},
  ): Promise<AiResearchResult> {
    const { onEvent, signal } = options;
    const call = {
      signal,
      timeoutMs: GROUNDED_TIMEOUT_MS,
      budgetMs: GROUNDED_BUDGET_MS,
    };

    // Tra cứu kho "Kiến thức AI" + bài đã đăng trước — đưa vào mọi bước sau (nghiên cứu Google lẫn model)
    onEvent?.({ type: 'stage', stage: 'knowledge' });
    const retrieved = await this.guard(signal, () =>
      this.retriever.retrieve(
        {
          keyword: req.keyword,
          secondary: req.secondaryKeywords,
          notes: req.notes,
        },
        { signal },
      ),
    );
    const knowledge: InternalKnowledge = {
      facts: retrieved.facts,
      articles: retrieved.articles,
    };

    onEvent?.({ type: 'stage', stage: 'searching' });
    const grounded = await this.searchOrFallback(req, call, onEvent, knowledge);
    const researchText = grounded.text.slice(0, L.researchText);
    const rawSources = grounded.sources.slice(0, L.sources);

    onEvent?.({ type: 'stage', stage: 'structuring' });
    const [structured, sources] = await this.guard(signal, () =>
      Promise.all([
        this.gemini.generateJson(
          {
            system: STRUCTURE_SYSTEM,
            contents: structurePrompt(req.keyword, researchText, {
              knowledge,
              sources: grounded.isGrounded ? rawSources : [],
            }),
            schema: RESEARCH_SCHEMA,
            parse: (data) => {
              const d = (data ?? {}) as Record<string, unknown>;
              const keyPoints = clipList(d.keyPoints, L.listItems);
              if (!keyPoints.length)
                throw new InvalidAiOutputError('Thiếu ý chính');
              return {
                summary: clip(d.summary, 1000),
                keyPoints,
                relatedKeywords: clipList(
                  d.relatedKeywords,
                  L.listItems,
                  L.keyword,
                ),
                questions: clipList(d.questions, L.listItems),
                fanOutQueries: clipList(d.fanOutQueries, L.listItems),
                newFacts: Array.isArray(d.newFacts)
                  ? (d.newFacts as unknown[])
                  : [],
              };
            },
          },
          { signal },
        ),
        this.resolveSources(rawSources, signal),
      ]),
    );
    const { newFacts, ...structuredRest } = structured;
    // Chế độ chỉ dùng model (không nguồn) KHÔNG đề xuất kiến thức — tránh "học" thông tin AI bịa
    const knowledgeSuggestions = grounded.isGrounded
      ? await this.toSuggestions(newFacts, sources)
      : [];

    onEvent?.({ type: 'stage', stage: 'checking' });
    const duplicates = await this.findDuplicates(req.keyword);

    return {
      keyword: req.keyword,
      ...structuredRest,
      grounded: grounded.isGrounded,
      retrieval: retrieved.mode,
      knowledge: retrieved.facts.map((f) => ({
        id: f.id,
        kind: f.kind,
        title: f.title,
        pinned: f.pinned,
      })),
      relatedArticles: retrieved.articles.map((a) => ({
        postId: a.postId,
        title: a.title,
        slug: a.slug,
      })),
      knowledgeSuggestions,
      researchText,
      sources,
      searchEntryPointHtml: grounded.searchEntryPointHtml,
      duplicates,
    };
  }

  /**
   * Kiến thức mới AI trích từ nghiên cứu Google -> đề xuất (chưa lưu). Chỉ giữ mục có số nguồn hợp lệ,
   * loại mục trùng với kho hiện có hoặc trùng nhau.
   */
  private async toSuggestions(
    raw: unknown[],
    sources: AiWriterSource[],
  ): Promise<AiKnowledgeSuggestion[]> {
    if (!raw.length || !sources.length) return [];
    const existing = await this.prisma.aiKnowledge.findMany({
      where: { status: 'ACTIVE' },
      select: { title: true, content: true },
    });
    const corpus = existing.map((e) => `${e.title}\n${e.content}`);
    const out: AiKnowledgeSuggestion[] = [];
    for (const item of raw) {
      const f = (item ?? {}) as Record<string, unknown>;
      const index =
        typeof f.sourceIndex === 'number' ? Math.round(f.sourceIndex) : 0;
      const source = sources[index - 1];
      const title = clip(f.title, 200);
      const content = clip(f.content, 4000);
      const kind = (
        SUGGESTION_KINDS.has(String(f.kind)) &&
        (AI_KNOWLEDGE_KINDS as readonly string[]).includes(String(f.kind))
          ? f.kind
          : 'OTHER'
      ) as AiKnowledgeKind;
      if (!source || !title || !content) continue;
      const text = `${title}\n${content}`;
      if (corpus.some((c) => overlapRatio(text, c) >= DUPLICATE_OVERLAP))
        continue;
      corpus.push(text);
      out.push({
        kind,
        title,
        content,
        sourceUrl: source.url,
        sourceTitle: source.title.slice(0, 300),
      });
      if (out.length >= SUGGESTION_LIMIT) break;
    }
    return out;
  }

  /** Tải lại kiến thức nội bộ đã chọn ở bước nghiên cứu (theo id — không tin văn bản từ client) */
  private async loadKnowledge(
    knowledgeIds: string[] = [],
    articleIds: string[] = [],
  ): Promise<InternalKnowledge> {
    const [facts, posts] = await Promise.all([
      this.retriever.factsByIds(knowledgeIds.slice(0, L.knowledgeIds)),
      articleIds.length
        ? this.prisma.newsPostTranslation.findMany({
            where: {
              postId: { in: articleIds.slice(0, L.articleIds) },
              locale: 'vi',
              status: 'PUBLISHED',
              post: { deletedAt: null },
            },
            select: { title: true, slug: true, sapo: true },
          })
        : Promise.resolve([]),
    ]);
    return {
      facts,
      articles: posts.map((p) => ({
        title: p.title,
        slug: p.slug,
        excerpt: p.sapo,
      })),
    };
  }

  /**
   * Tìm Google (Grounding); lỗi (hết quota Search, quá tải, hết giờ...) -> tự chuyển sang tổng hợp bằng kiến thức
   * của model, không nguồn. Huỷ hoặc lỗi cấu hình (thiếu/sai key) thì dừng luôn, không chuyển.
   */
  private async searchOrFallback(
    req: AiResearchRequest,
    call: { signal?: AbortSignal; timeoutMs: number; budgetMs: number },
    onEvent?: (event: AiResearchEvent) => void,
    knowledge?: InternalKnowledge,
  ) {
    const prompt = researchPrompt({ ...req, knowledge });
    try {
      const result = await this.guard(call.signal, () =>
        this.gemini.generateGrounded({ system: RESEARCH_SYSTEM, prompt }, call),
      );
      return { ...result, isGrounded: true };
    } catch (err) {
      if (
        err instanceof AiWriterAbortedError ||
        err instanceof ServiceUnavailableException
      )
        throw err;
      this.logger.warn(
        `Google Search lỗi, chuyển sang nghiên cứu bằng model: ${(err as Error).message}`,
      );
      onEvent?.({
        type: 'stage',
        stage: 'fallback',
        message:
          'Không tìm Google được lúc này — AI tổng hợp từ kiến thức sẵn có, không kèm nguồn web.',
      });
      const text = await this.guard(call.signal, () =>
        this.gemini.generateText(
          { system: RESEARCH_MODEL_SYSTEM, prompt },
          call,
        ),
      );
      return {
        text: `${MODEL_ONLY_RESEARCH_HEADER}\n${text}`,
        sources: [] as AiWriterSource[],
        searchEntryPointHtml: null,
        webSearchQueries: [] as string[],
        isGrounded: false,
      };
    }
  }

  /**
   * Link nguồn của Grounding là link chuyển hướng tạm của Google -> đổi sang URL thật (đọc header Location)
   * để đặt vào "Tài liệu tham khảo". Chỉ gọi tới đúng host chuyển hướng của Google; lỗi thì giữ link gốc.
   */
  private async resolveSources(
    sources: AiWriterSource[],
    signal?: AbortSignal,
  ): Promise<AiWriterSource[]> {
    return Promise.all(
      sources.map(async (s) => {
        try {
          if (new URL(s.url).hostname !== REDIRECT_HOST) return s;
          const timeout = AbortSignal.timeout(5_000);
          const res = await fetch(s.url, {
            method: 'HEAD',
            redirect: 'manual',
            signal: signal ? AbortSignal.any([timeout, signal]) : timeout,
          });
          const location = res.headers.get('location');
          return location && /^https?:\/\//.test(location)
            ? { ...s, url: location }
            : s;
        } catch {
          return s;
        }
      }),
    );
  }

  /** Bài (bản tiếng Việt, chưa xoá) có tiêu đề / keyword chính trùng chủ đề */
  async findDuplicates(keyword: string): Promise<AiDuplicatePost[]> {
    const rows = await this.prisma.newsPostTranslation.findMany({
      where: { locale: 'vi', post: { deletedAt: null } },
      select: {
        postId: true,
        title: true,
        slug: true,
        status: true,
        focusKeyword: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 1000,
    });
    const kw = normalizeText(keyword);
    return rows
      .map((r) => ({
        r,
        score:
          r.focusKeyword && normalizeText(r.focusKeyword) === kw
            ? 2
            : topicMatch(keyword, `${r.title} ${r.focusKeyword ?? ''}`),
      }))
      .filter((x) => x.score >= 0.75)
      .sort((a, b) => b.score - a.score)
      .slice(0, DUPLICATE_LIMIT)
      .map(({ r }) => ({
        id: r.postId,
        title: r.title,
        slug: r.slug,
        status: r.status,
      }));
  }

  // ─── B2: Dàn ý ───────────────────────────────────────────────────────────

  async outline(
    req: AiOutlineRequest,
    signal?: AbortSignal,
  ): Promise<AiOutline> {
    const [categories, knowledge, exemplars] = await Promise.all([
      this.categories(),
      this.loadKnowledge(req.knowledgeIds, req.articleIds),
      this.exemplars(req.keyword),
    ]);
    const categoryIds = new Set(categories.map((c) => c.id));
    return this.gemini.generateJson(
      {
        system: OUTLINE_SYSTEM,
        contents: outlinePrompt({ ...req, categories, knowledge, exemplars }),
        schema: OUTLINE_SCHEMA,
        temperature: 0.5,
        parse: (data) => {
          const d = (data ?? {}) as Record<string, unknown>;
          const titleOptions = clipList(d.titleOptions, 3, 200);
          const sections = this.readSections(d.sections);
          if (!titleOptions.length || sections.length < 2)
            throw new InvalidAiOutputError('Dàn ý thiếu tiêu đề hoặc mục');
          const categoryId = clip(d.categoryId, 50);
          return {
            titleOptions,
            slug: slugify(clip(d.slug, 200) || titleOptions[0]),
            sapo: clip(d.sapo, 1000),
            categoryId: categoryIds.has(categoryId) ? categoryId : null,
            seoTitle: clip(d.seoTitle, 120),
            seoDescription: clip(d.seoDescription, 320),
            coverAlt: clip(d.coverAlt, 300),
            sections,
            faq: (Array.isArray(d.faq) ? d.faq : [])
              .map((f) =>
                clip((f as { question?: unknown })?.question, L.itemLength),
              )
              .filter(Boolean)
              .slice(0, L.faq)
              .map((question) => ({ question })),
          };
        },
      },
      { signal, timeoutMs: WRITE_TIMEOUT_MS, budgetMs: WRITE_BUDGET_MS },
    );
  }

  private readSections(value: unknown): AiOutlineSection[] {
    if (!Array.isArray(value)) return [];
    const sections = value
      .map((raw) => {
        const s = (raw ?? {}) as Record<string, unknown>;
        return {
          level: s.level === 3 ? 3 : 2,
          heading: clip(s.heading, 200),
          points: clipList(s.points, L.pointsPerSection),
        } as AiOutlineSection;
      })
      .filter((s) => s.heading)
      .slice(0, L.sections);
    // Mục đầu tiên luôn là H2 (H3 phải nằm dưới một H2)
    if (sections[0]) sections[0].level = 2;
    return sections;
  }

  private async categories() {
    const rows = await this.prisma.newsCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        translations: { where: { locale: 'vi' }, select: { name: true } },
      },
    });
    return rows.map((c) => ({
      id: c.id,
      name: c.translations[0]?.name ?? c.id,
    }));
  }

  // ─── B3: Viết bài ────────────────────────────────────────────────────────

  /**
   * Viết từng mục theo dàn ý (song song WRITE_CONCURRENCY), gửi ngay mỗi mục xong để CMS chèn dần vào editor.
   * Thứ tự sự kiện: start -> summary / section (theo thứ tự xong) / faq -> references -> result.
   * Một mục lỗi (AI quá tải, sai định dạng) không làm hỏng cả bài: mục đó có đoạn giữ chỗ + cảnh báo.
   */
  async draft(
    req: AiDraftRequest,
    options: StreamOptions<AiDraftEvent> = {},
  ): Promise<void> {
    const { onEvent, signal } = options;
    const sections = this.readSections(req.sections);
    const [siteLinks, knowledge, exemplars] = await Promise.all([
      this.linkTargets(req.keyword),
      this.loadKnowledge(req.knowledgeIds, req.articleIds),
      this.exemplars(req.keyword),
    ]);
    // Trang của kiến thức nội bộ đã dùng (sản phẩm, giải pháp, dự án...) + bài liên quan đã chọn -> được phép đặt link
    const knowledgeLinks = [
      ...knowledge.facts
        .filter((f) => f.sourceUrl && isInternalLink(f.sourceUrl))
        .map((f) => ({ href: f.sourceUrl!, title: f.title })),
      ...knowledge.articles.map((a) => ({
        href: `/tin-tuc/${a.slug}`,
        title: a.title,
      })),
    ];
    const links = [
      ...new Map(
        [...knowledgeLinks, ...siteLinks].map((l) => [l.href, l]),
      ).values(),
    ];
    const internal = new Map(links.map((l) => [l.href, l.title]));
    const external = new Set(req.sources.map((s) => s.url));
    const allowHref = (href: string) =>
      internal.has(href) || (external.has(href) && isSafeLink(href));
    const ctx: DraftContext = { ...req, sections, links, knowledge, exemplars };

    // Các phần đã viết — giữ ở server để chấm điểm & tự sửa sau khi viết xong
    const slots: DraftSlots = {
      summary: null,
      sections: sections.map(() => null),
      faq: null,
      links: new Map(),
    };
    const warnings: string[] = [];
    let failedSections = 0;
    const emit = (event: AiDraftEvent) => {
      if (event.type === 'faq') slots.faq = event.nodes;
      onEvent?.(event);
    };

    emit({ type: 'start', total: sections.length });

    const tasks: (() => Promise<void>)[] = [
      async () => {
        const result = await this.optional(signal, () =>
          this.gemini.generateJson(
            {
              system: WRITER_SYSTEM,
              contents: summaryPrompt(ctx),
              schema: SUMMARY_SCHEMA,
              parse: (data) => {
                const items = clipList(
                  (data as { items?: unknown })?.items,
                  6,
                  500,
                );
                if (!items.length)
                  throw new InvalidAiOutputError('Tóm tắt rỗng');
                const converted = aiBlocksToValidNodes(
                  [{ type: 'callout', variant: 'summary', items }],
                  { allowHref },
                );
                if (!converted.ok || !converted.nodes.length)
                  throw new InvalidAiOutputError('Tóm tắt không hợp lệ');
                return converted;
              },
            },
            { signal, timeoutMs: WRITE_TIMEOUT_MS, budgetMs: WRITE_BUDGET_MS },
          ),
        );
        if (!result)
          return void warnings.push(
            'Chưa tạo được hộp "Tóm tắt nhanh" — hãy tự viết 3–5 ý ở đầu bài.',
          );
        slots.summary = result.nodes;
        slots.links.set(-1, result.links);
        emit({ type: 'summary', nodes: result.nodes });
      },
      ...sections.map((section, index) => async () => {
        const result = await this.writeBlocks(
          sectionPrompt(ctx, index),
          { allowHref, minHeadingLevel: section.level + 1 },
          signal,
        );
        let body = result?.nodes ?? [];
        if (!result || !body.length) {
          failedSections++;
          warnings.push(
            `Mục "${section.heading}" chưa viết được — hãy viết tay hoặc chạy lại.`,
          );
          body = [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: `${VERIFY_MARK} Mục này AI chưa viết được.`,
                },
              ],
            },
          ];
        } else {
          slots.links.set(index, result.links);
        }
        slots.sections[index] = body;
        emit({
          type: 'section',
          index,
          total: sections.length,
          nodes: [headingNode(section), ...body],
        });
      }),
    ];
    if (req.faq.length)
      tasks.push(() =>
        this.writeFaq(
          ctx,
          req.faq.map((f) => f.question),
          allowHref,
          signal,
          emit,
          warnings,
          (_n, l) => slots.links.set(-2, l),
        ),
      );

    await this.runPool(tasks, signal);
    if (failedSections === sections.length) {
      throw new BadGatewayException(
        'Dịch vụ AI đang quá tải, chưa viết được mục nào — vui lòng thử lại sau ít phút',
      );
    }

    const references = this.referenceNodes(req.sources);
    // Chấm điểm phần nội dung, mục nào kéo điểm xuống thì AI sửa 1 lượt (chỉ giữ nếu điểm không giảm)
    await this.improve(req, ctx, slots, references, allowHref, emit, signal);

    if (references.length) emit({ type: 'references', nodes: references });

    const verifyMarks =
      JSON.stringify([slots.summary, slots.sections, slots.faq]).split(
        VERIFY_MARK,
      ).length - 1;
    if (verifyMarks)
      warnings.unshift(
        `Có ${verifyMarks} chỗ đánh dấu ${VERIFY_MARK} — cần kiểm tra số liệu/tiêu chuẩn trước khi xuất bản.`,
      );
    const seen = new Set<string>();
    const linkSuggestions: AiLinkSuggestion[] = [...slots.links.entries()]
      .flatMap(([sectionIndex, list]) =>
        list.map((link) => ({ link, sectionIndex })),
      )
      .filter(({ link }) => internal.has(link.href))
      .filter(({ link, sectionIndex }) => {
        const key = `${sectionIndex}|${link.href}`;
        return seen.has(key) ? false : (seen.add(key), true);
      })
      .map(({ link, sectionIndex }) => ({
        href: link.href,
        anchorText: link.text,
        sectionIndex,
        title: internal.get(link.href) ?? link.href,
      }));
    emit({ type: 'result', linkSuggestions, warnings });
  }

  /** Điểm nội dung (bỏ mục cần tác giả / ngày / ô SEO) của bài đang ghép */
  private scoreDraft(
    req: AiDraftRequest,
    slots: DraftSlots,
    sections: AiOutlineSection[],
    references: RichNode[],
  ) {
    const doc = assembleDraft(slots, sections, references);
    const analysis = analyzeContent({
      keyword: req.keyword,
      title: req.title,
      slug: slugify(req.title),
      sapo: req.sapo,
      seoTitle: req.seoTitle,
      seoDescription: req.seoDescription,
      doc,
      locale: 'vi',
      fanOutQueries: req.fanOutQueries,
    });
    return { analysis, scores: contentScores(analysis) };
  }

  /**
   * Vòng tự sửa: chấm bài -> nhóm điểm nào dưới QUALITY_TARGET thì lập danh sách sửa theo mục -> AI viết lại tối đa
   * MAX_REVISIONS mục (song song) -> chấm lại; tổng điểm giảm thì bỏ bản sửa. Luôn gửi sự kiện quality (trước / sau).
   */
  private async improve(
    req: AiDraftRequest,
    ctx: DraftContext,
    slots: DraftSlots,
    references: RichNode[],
    allowHref: (href: string) => boolean,
    emit: (event: AiDraftEvent) => void,
    signal?: AbortSignal,
  ) {
    const sections = ctx.sections;
    const before = this.scoreDraft(req, slots, sections, references);
    const needs =
      before.scores.seo < QUALITY_TARGET ||
      before.scores.aeo < QUALITY_TARGET ||
      before.scores.geo < QUALITY_TARGET;
    const plan = needs
      ? planRevisions(before.analysis, slots, sections, req.keyword)
      : [];
    if (!plan.length) {
      emit({
        type: 'quality',
        before: before.scores,
        after: before.scores,
        fixes: [],
      });
      return;
    }

    const revised = await Promise.all(
      plan.map(async ({ index, instructions }) => {
        const section = sections[index];
        const current = toPlainText({
          type: 'doc',
          content: slots.sections[index] ?? [],
        });
        const result = await this.writeBlocks(
          revisePrompt(ctx, index, current, instructions),
          { allowHref, minHeadingLevel: section.level + 1 },
          signal,
        );
        return result?.nodes.length
          ? { index, nodes: result.nodes, links: result.links, instructions }
          : null;
      }),
    );
    const accepted = revised.filter((r): r is NonNullable<typeof r> => !!r);
    if (!accepted.length) {
      emit({
        type: 'quality',
        before: before.scores,
        after: before.scores,
        fixes: [],
      });
      return;
    }

    const trial: DraftSlots = { ...slots, sections: [...slots.sections] };
    for (const r of accepted) trial.sections[r.index] = r.nodes;
    const after = this.scoreDraft(req, trial, sections, references);
    const sum = (s: QualityScores) => s.seo + s.aeo + s.geo;
    // Chỉ nhận bản sửa khi tổng điểm TĂNG và không sinh lỗi đỏ mới (vd nhồi keyword) dù phần khác tăng điểm
    const badIds = (a: ContentScore) =>
      new Set(
        [...a.seo.checks, ...a.aeo.checks, ...a.geo.checks]
          .filter((c) => c.status === 'bad')
          .map((c) => c.id),
      );
    const beforeBad = badIds(before.analysis);
    const newBad = [...badIds(after.analysis)].filter(
      (id) => !beforeBad.has(id),
    );
    if (sum(after.scores) <= sum(before.scores) || newBad.length) {
      this.logger.warn(
        `Bản tự sửa không tốt hơn (${sum(before.scores)} -> ${sum(after.scores)}, lỗi mới: ${newBad.join(', ') || 'không'}) — giữ bản gốc`,
      );
      emit({
        type: 'quality',
        before: before.scores,
        after: before.scores,
        fixes: [],
      });
      return;
    }
    for (const r of accepted) {
      slots.sections[r.index] = r.nodes;
      slots.links.set(r.index, r.links);
      emit({
        type: 'section',
        index: r.index,
        total: sections.length,
        nodes: [headingNode(sections[r.index]), ...r.nodes],
      });
    }
    emit({
      type: 'quality',
      before: before.scores,
      after: after.scores,
      fixes: accepted.flatMap((r) =>
        r.instructions.map(
          (i) => `Mục "${sections[r.index].heading}": ${i.label}`,
        ),
      ),
    });
  }

  /**
   * Bài mẫu: chấm điểm nội dung các bài đã đăng liên quan nhất, lấy 1–2 bài điểm cao làm "khung" (tiêu đề mục +
   * câu mở đầu) để AI học cấu trúc / văn phong — không chép nội dung.
   */
  async exemplars(keyword: string): Promise<string> {
    try {
      return await this.buildExemplars(keyword);
    } catch (err) {
      // Bài mẫu chỉ là gợi ý thêm — lỗi thì bỏ qua, không làm hỏng việc viết
      this.logger.warn(`Không chọn được bài mẫu: ${(err as Error).message}`);
      return '';
    }
  }

  private async buildExemplars(keyword: string): Promise<string> {
    // Bước 1: xếp hạng liên quan chỉ bằng cột nhẹ (tiêu đề, keyword) — không kéo nội dung JSON của mọi bài
    const candidates = await this.prisma.newsPostTranslation.findMany({
      where: { locale: 'vi', status: 'PUBLISHED', publishedAt: { lte: new Date() }, post: { deletedAt: null } },
      select: { postId: true, title: true, focusKeyword: true },
      orderBy: { publishedAt: 'desc' },
      take: 300,
    });
    const top = candidates
      .map((p, i) => ({ p, rel: topicMatch(keyword, `${p.title} ${p.focusKeyword ?? ''}`) - i / 10_000 }))
      .sort((a, b) => b.rel - a.rel)
      .slice(0, EXEMPLAR_POOL)
      .map(({ p }) => p.postId);
    if (!top.length) return '';
    // Bước 2: chỉ đọc nội dung của EXEMPLAR_POOL bài được chọn để chấm điểm
    const posts = await this.prisma.newsPostTranslation.findMany({
      where: { locale: 'vi', postId: { in: top } },
      select: { title: true, slug: true, sapo: true, content: true, focusKeyword: true },
    });
    const scored = posts
      .filter((p) => Array.isArray((p.content as { content?: unknown } | null)?.content))
      .map((p) => {
        const doc = p.content as unknown as RichDoc;
        const s = contentScores(analyzeContent({ keyword: p.focusKeyword || keyword, title: p.title, slug: p.slug, sapo: p.sapo, doc, locale: 'vi' }));
        return { p, doc, s, total: s.seo + s.aeo + s.geo };
      })
      .filter((x) => x.total / 3 >= EXEMPLAR_MIN_SCORE)
      .sort((a, b) => b.total - a.total)
      .slice(0, 2);
    return scored
      .map(
        ({ p, doc, s }) =>
          `Bài mẫu "${p.title}" (SEO ${s.seo} · AEO ${s.aeo} · GEO ${s.geo}):\n${skeletonOf(doc)}`,
      )
      .join('\n\n');
  }

  private async writeFaq(
    ctx: DraftContext,
    questions: string[],
    allowHref: (href: string) => boolean,
    signal: AbortSignal | undefined,
    onEvent: ((e: AiDraftEvent) => void) | undefined,
    warnings: string[],
    track: (nodes: RichNode[], links: AiUsedLink[]) => void,
  ) {
    const answers = await this.optional(signal, () =>
      this.gemini.generateJson(
        {
          system: WRITER_SYSTEM,
          contents: faqPrompt(ctx, questions),
          schema: FAQ_SCHEMA,
          parse: (data) => {
            const items = (data as { items?: unknown })?.items;
            if (!Array.isArray(items))
              throw new InvalidAiOutputError('FAQ sai cấu trúc');
            return items.map((i) =>
              clip((i as { answer?: unknown })?.answer, 2000),
            );
          },
        },
        { signal, timeoutMs: WRITE_TIMEOUT_MS, budgetMs: WRITE_BUDGET_MS },
      ),
    );
    if (!answers)
      return void warnings.push(
        'Chưa viết được câu trả lời FAQ — hãy thêm khối FAQ và tự trả lời.',
      );
    const usedLinks: AiUsedLink[] = [];
    // Câu hỏi lấy theo dàn ý (biên tập viên đã duyệt), câu trả lời theo thứ tự AI trả về
    const items: RichNode[] = questions.flatMap((question, i) => {
      const answer = answers[i];
      if (!answer) return [];
      const converted = aiBlocksToValidNodes(
        [{ type: 'paragraph', text: answer }],
        { allowHref },
      );
      if (!converted.ok || !converted.nodes.length) return [];
      usedLinks.push(...converted.links);
      return [
        {
          type: 'faqItem',
          attrs: { question: question.slice(0, 300) },
          content: converted.nodes,
        } as RichNode,
      ];
    });
    if (!items.length)
      return void warnings.push(
        'Chưa viết được câu trả lời FAQ — hãy thêm khối FAQ và tự trả lời.',
      );
    const nodes: RichNode[] = [{ type: 'faq', content: items }];
    if (!validateRichDoc({ type: 'doc', content: nodes }).ok)
      return void warnings.push('Khối FAQ AI viết không hợp lệ — hãy tự thêm.');
    track(nodes, usedLinks);
    onEvent?.({ type: 'faq', nodes });
  }

  /** Một lần gọi viết khối nội dung; lỗi tạm thời / sai định dạng -> null (mục đó dùng đoạn giữ chỗ) */
  private async writeBlocks(
    contents: string,
    convert: { allowHref: (href: string) => boolean; minHeadingLevel?: number },
    signal?: AbortSignal,
  ) {
    return this.optional(signal, () =>
      this.gemini.generateJson(
        {
          system: WRITER_SYSTEM,
          contents,
          schema: AI_SECTION_SCHEMA,
          temperature: 0.4,
          parse: (data) => {
            const blocks: AiBlock[] | null = readAiBlocks(data);
            if (!blocks)
              throw new InvalidAiOutputError('Khối nội dung sai cấu trúc');
            const result = aiBlocksToValidNodes(blocks, convert);
            if (!result.ok) throw new InvalidAiOutputError(result.error);
            return result;
          },
        },
        { signal, timeoutMs: WRITE_TIMEOUT_MS, budgetMs: WRITE_BUDGET_MS },
      ),
    );
  }

  /** "Tài liệu tham khảo": danh sách link nguồn Google (không cần AI) */
  private referenceNodes(sources: AiWriterSource[]): RichNode[] {
    const items: RichNode[] = sources
      .filter((s) => isSafeLink(s.url) && /^https?:\/\//.test(s.url))
      .map((s) => ({
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: s.title || s.url,
                marks: [{ type: 'link', attrs: { href: s.url } }],
              },
            ],
          },
        ],
      }));
    if (!items.length) return [];
    const nodes: RichNode[] = [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: REFERENCES_HEADING }],
      },
      { type: 'bulletList', content: items },
    ];
    return validateRichDoc({ type: 'doc', content: nodes }).ok ? nodes : [];
  }

  /** Link nội bộ AI được dùng: trang cố định của site + bài đã đăng liên quan nhất tới keyword */
  async linkTargets(
    keyword: string,
  ): Promise<{ href: string; title: string }[]> {
    const now = new Date();
    const posts = await this.prisma.newsPostTranslation.findMany({
      where: {
        locale: 'vi',
        status: 'PUBLISHED',
        publishedAt: { lte: now },
        post: { deletedAt: null },
      },
      select: {
        title: true,
        slug: true,
        focusKeyword: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 300,
    });
    const ranked = posts
      .map((p, i) => ({
        p,
        score:
          topicMatch(keyword, `${p.title} ${p.focusKeyword ?? ''}`) -
          i / 10_000,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, INTERNAL_POST_LINKS)
      .map(({ p }) => ({ href: `/tin-tuc/${p.slug}`, title: p.title }));
    return [...SITE_LINK_TARGETS, ...ranked];
  }

  // ─── Tiện ích ────────────────────────────────────────────────────────────

  /** Chạy các việc với tối đa WRITE_CONCURRENCY việc cùng lúc; huỷ -> dừng nhận việc mới */
  private async runPool(tasks: (() => Promise<void>)[], signal?: AbortSignal) {
    let next = 0;
    const worker = async () => {
      while (next < tasks.length) {
        if (isAborted(signal)) throw new AiWriterAbortedError();
        await tasks[next++]();
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(WRITE_CONCURRENCY, tasks.length) }, worker),
    );
    if (isAborted(signal)) throw new AiWriterAbortedError();
  }

  /** Lỗi do huỷ -> AiWriterAbortedError; lỗi khác giữ nguyên */
  private async guard<T>(
    signal: AbortSignal | undefined,
    fn: () => Promise<T>,
  ): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      if (isAborted(signal)) throw new AiWriterAbortedError();
      throw err;
    }
  }

  /** Như guard nhưng lỗi AI của một phần -> null; riêng lỗi cấu hình (thiếu/sai key) vẫn dừng cả bài */
  private async optional<T>(
    signal: AbortSignal | undefined,
    fn: () => Promise<T>,
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (err) {
      if (isAborted(signal)) throw new AiWriterAbortedError();
      if (err instanceof ServiceUnavailableException) throw err;
      this.logger.warn(`AI viết một phần bài lỗi: ${(err as Error).message}`);
      return null;
    }
  }
}
