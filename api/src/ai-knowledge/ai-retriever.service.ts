import { Injectable, Logger } from '@nestjs/common';
import type { AiRetrieveResult } from '@remak/shared/contracts/ai-knowledge';
import { bm25Rank, cosine, expandQuery, rrfFuse } from '@remak/shared/text-rank';
import { GeminiService } from '../ai/gemini.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { DOMAIN_SYNONYMS, SOURCE_KNOWLEDGE, SOURCE_NEWS, knowledgeText, newsChunks } from './ai-knowledge.text.js';

export type RetrieveResult = AiRetrieveResult;
export type KnowledgeFact = AiRetrieveResult['facts'][number];
export type ArticleSnippet = AiRetrieveResult['articles'][number];

export interface RetrieveQuery {
  keyword: string;
  secondary?: string[];
  notes?: string;
}

export interface RetrieveOptions {
  factLimit?: number;
  articleLimit?: number;
  /** Tổng ký tự nội dung kiến thức đưa vào prompt */
  charBudget?: number;
  signal?: AbortSignal;
}

/** Số ứng viên mỗi bảng xếp hạng đưa vào RRF */
const POOL = 40;
/** Vector gần nhất phải đạt mức này, và không kém hạng nhất quá SEMANTIC_GAP — tránh kéo kiến thức lạc đề */
const SEMANTIC_MIN = 0.5;
const SEMANTIC_GAP = 0.15;
const EXCERPT_CHARS = 600;

const kId = (id: string) => `k:${id}`;
const nId = (postId: string, chunk: number) => `n:${postId}:${chunk}`;

/**
 * Tra cứu kiến thức nội bộ cho trợ lý viết bài: kho "Kiến thức AI" + đoạn của bài Tin tức đã đăng.
 * Tìm lai: BM25 không dấu (luôn có) + cosine embedding (khi có) -> gộp RRF. Mẩu "ghim" luôn được đưa vào.
 */
@Injectable()
export class AiRetrieverService {
  private readonly logger = new Logger(AiRetrieverService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService,
  ) {}

  async retrieve(query: RetrieveQuery, options: RetrieveOptions = {}): Promise<RetrieveResult> {
    const factLimit = options.factLimit ?? 12;
    const articleLimit = options.articleLimit ?? 4;
    const charBudget = options.charBudget ?? 12_000;
    const text = [query.keyword, ...(query.secondary ?? []), (query.notes ?? '').slice(0, 500)].filter(Boolean).join('\n');

    const [knowledge, news] = await Promise.all([
      this.prisma.aiKnowledge.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, kind: true, title: true, content: true, tags: true, sourceUrl: true, pinned: true },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        take: 3000,
      }),
      this.prisma.newsPostTranslation.findMany({
        where: { locale: 'vi', status: 'PUBLISHED', publishedAt: { lte: new Date() }, post: { deletedAt: null } },
        select: { postId: true, title: true, slug: true, sapo: true, contentText: true },
        orderBy: [{ publishedAt: 'desc' }, { postId: 'desc' }],
        take: 500,
      }),
    ]);

    const newsChunkMap = new Map<string, { post: (typeof news)[number]; text: string }>();
    for (const post of news) newsChunks(post).forEach((chunk, i) => newsChunkMap.set(nId(post.postId, i), { post, text: chunk }));
    const docs = [
      ...knowledge.map((k) => ({ id: kId(k.id), text: knowledgeText(k) })),
      ...[...newsChunkMap.entries()].map(([id, c]) => ({ id, text: c.text })),
    ];

    const keywordRank = bm25Rank(expandQuery(text, DOMAIN_SYNONYMS), docs)
      .slice(0, POOL)
      .map((h) => h.id);
    const semanticRank = await this.semanticRank(text, options.signal);
    const mode: RetrieveResult['mode'] = semanticRank ? 'hybrid' : 'keyword';
    const fused = rrfFuse(semanticRank ? [keywordRank, semanticRank] : [keywordRank]).map((h) => h.id);

    // Kiến thức: ghim trước, rồi theo thứ hạng gộp, trong giới hạn số mẩu và ký tự
    const byId = new Map(knowledge.map((k) => [kId(k.id), k]));
    const ordered = [...knowledge.filter((k) => k.pinned).map((k) => kId(k.id)), ...fused.filter((id) => byId.has(id))];
    const facts: KnowledgeFact[] = [];
    const seen = new Set<string>();
    let used = 0;
    for (const id of ordered) {
      const k = byId.get(id);
      if (!k || seen.has(id)) continue;
      if (facts.length >= factLimit || (used + k.content.length > charBudget && facts.length > 0)) break;
      seen.add(id);
      used += k.content.length;
      facts.push({ id: k.id, kind: k.kind, title: k.title, content: k.content, sourceUrl: k.sourceUrl, pinned: k.pinned });
    }

    // Bài cũ: đoạn hạng cao nhất của mỗi bài
    const articles: ArticleSnippet[] = [];
    const seenPosts = new Set<string>();
    for (const id of fused) {
      const c = newsChunkMap.get(id);
      if (!c || seenPosts.has(c.post.postId)) continue;
      seenPosts.add(c.post.postId);
      articles.push({ postId: c.post.postId, title: c.post.title, slug: c.post.slug, excerpt: c.text.slice(c.post.title.length + 1, c.post.title.length + 1 + EXCERPT_CHARS) });
      if (articles.length >= articleLimit) break;
    }
    return { mode, facts, articles };
  }

  /** Thứ hạng theo ngữ nghĩa; null khi không dùng được (chưa có key / lỗi / hết quota / chưa lập chỉ mục) */
  private async semanticRank(text: string, signal?: AbortSignal): Promise<string[] | null> {
    if (!this.gemini.client) return null;
    try {
      const rows = await this.prisma.aiEmbedding.findMany({
        where: { model: this.gemini.embeddingModel },
        select: { sourceType: true, sourceId: true, chunk: true, vector: true },
      });
      if (!rows.length) return null;
      const [queryVector] = await this.gemini.embed([text], 'RETRIEVAL_QUERY', { budgetMs: 15_000, signal });
      const scored = rows
        .map((r) => ({
          id: r.sourceType === SOURCE_KNOWLEDGE ? kId(r.sourceId) : r.sourceType === SOURCE_NEWS ? nId(r.sourceId, r.chunk) : '',
          score: cosine(queryVector, r.vector),
        }))
        .filter((r) => r.id)
        .sort((a, b) => b.score - a.score);
      const best = scored[0]?.score ?? 0;
      // Kiến thức có nhiều đoạn: giữ đoạn điểm cao nhất (id trùng)
      return [...new Set(scored.filter((r) => r.score >= SEMANTIC_MIN && r.score >= best - SEMANTIC_GAP).map((r) => r.id))].slice(0, POOL);
    } catch (err) {
      if (signal?.aborted) throw err;
      this.logger.warn(`Tìm theo ngữ nghĩa lỗi, dùng tìm từ khoá: ${(err as Error).message}`);
      return null;
    }
  }

  /** Tải lại kiến thức theo id (bước dàn ý / viết — không tin nội dung client gửi) */
  async factsByIds(ids: string[]): Promise<KnowledgeFact[]> {
    if (!ids.length) return [];
    const rows = await this.prisma.aiKnowledge.findMany({
      where: { id: { in: ids }, status: 'ACTIVE' },
      select: { id: true, kind: true, title: true, content: true, sourceUrl: true, pinned: true },
    });
    const order = new Map(ids.map((id, i) => [id, i]));
    return rows.sort((a, b) => order.get(a.id)! - order.get(b.id)!);
  }
}
