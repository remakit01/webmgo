// Chấm điểm nội dung theo 3 nhóm — dùng chung cho CMS (khung tối ưu của mọi bài) và API (bản nháp AI viết):
// - SEO: xếp hạng Google truyền thống (keyword, độ dài, cấu trúc, link nội bộ).
// - AEO (Answer Engine Optimization): sẵn sàng làm câu trả lời trực tiếp (AI Overviews, featured snippet).
// - GEO (Generative Engine Optimization): khả năng được ChatGPT/Gemini/Perplexity trích dẫn (số liệu có nguồn,
//   nguồn uy tín, trích dẫn chuyên gia, tác giả, độ mới; nhồi keyword bị trừ điểm).
// Điểm chỉ là GỢI Ý cho người viết — không chặn xuất bản. Nguyên tắc: viết cho người đọc, cấu trúc rõ, nguồn minh bạch.

import { isInternalLink } from './link.js';
import type { Locale } from './locale.js';
import { collectFaqItems, nodeText, toPlainText, type RichDoc, type RichNode } from './rich-content.js';
import { slugify } from './slug.js';

export type CheckStatus = 'good' | 'warn' | 'bad';

export interface ContentCheck {
  id: string;
  status: CheckStatus;
  /** Mô tả kết quả + gợi ý sửa (tiếng Việt — CMS chỉ tiếng Việt) */
  message: string;
  weight: number;
}

export interface ScoreGroup {
  score: number;
  checks: ContentCheck[];
}

export interface ContentScore {
  seo: ScoreGroup;
  aeo: ScoreGroup;
  geo: ScoreGroup;
}

export interface ContentScoreInput {
  keyword: string;
  title: string;
  slug: string;
  sapo: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  doc: RichDoc;
  locale: Locale;
  author?: { name: string; jobTitle?: string | null } | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  /** Câu hỏi liên quan AI search hay tự hỏi thêm (từ bước nghiên cứu AI) */
  fanOutQueries?: string[];
  now?: Date;
}

// ─── Tiện ích văn bản ───────────────────────────────────────────────────────

/** Chuẩn hoá để so khớp không dấu, không phân biệt hoa thường: "Tấm MGO" -> "tam mgo" */
export const normalizeText = (s: string) => slugify(s, 100_000).replace(/-/g, ' ');

const wordsOf = (s: string) => s.split(/\s+/).filter(Boolean);
const countWords = (s: string) => wordsOf(s).length;

const containsKeyword = (text: string, keyword: string) => {
  const k = normalizeText(keyword);
  return !!k && ` ${normalizeText(text)} `.includes(` ${k} `);
};

const countOccurrences = (text: string, keyword: string) => {
  const k = normalizeText(keyword);
  if (!k) return 0;
  return ` ${normalizeText(text)} `.split(` ${k} `).length - 1;
};

const QUESTION_START: Record<Locale, RegExp> = {
  vi: /^(tại sao|vì sao|làm sao|làm thế nào|như thế nào|khi nào|ở đâu|bao nhiêu|có nên|có phải|nên|cách|ai |gì )/i,
  en: /^(what|how|why|when|where|which|who|can|should|is|are|does|do)\b/i,
};
const QUESTION_INSIDE: Record<Locale, RegExp> = {
  vi: /(là gì|như thế nào|bao nhiêu|ra sao|có nên|thế nào|bao lâu|khác gì)/i,
  en: /\b(vs\.?|versus)\b/i,
};
const isQuestionHeading = (text: string, locale: Locale) =>
  text.trim().endsWith('?') || QUESTION_START[locale].test(text.trim()) || QUESTION_INSIDE[locale].test(text);

/** Câu có số liệu kỹ thuật: số + đơn vị, % hoặc chỉ số chịu lửa (EI 60, REI 120...) */
const STAT_PATTERN = /(\d[\d.,]*\s?(%|°\s?c|mm|cm|m²|m2|m³|kg|tấn|ton|phút|minutes?|giờ|hours?|năm|years?|db|mpa|kpa|w\/mk|lần|times))|\b(r?ei|e)\s?\d{2,3}\b/i;

const EXPERT_PATTERN: Record<Locale, RegExp> = {
  vi: /(—|–|\bông\b|\bbà\b|kỹ sư|\bks\.|\bts\.|\bths\.|giám đốc|chuyên gia|trưởng phòng|cho biết|chia sẻ)/i,
  en: /(—|–|\bdr\.|\beng\.|engineer|director|manager|expert|said|says|according to)/i,
};

const REFERENCE_HEADING = /(tài liệu tham khảo|nguồn tham khảo|nguồn|references|sources)/i;

/** Đánh dấu AI chèn khi thiếu nguồn — bài còn dấu này thì chưa nên đăng */
export const VERIFY_MARK = '[cần kiểm chứng]';

/** Thương hiệu / sản phẩm của site (thực thể rõ ràng giúp AI trích dẫn đúng chủ thể) */
const BRAND_PATTERN = /(remak|fireoff)/i;
/** Có nhắc QCVN/TCVN thì ít nhất một lần phải viết đủ số hiệu (vd QCVN 06:2022/BXD, TCVN 9311-8:2012) */
const STANDARD_MENTION = /\b(qcvn|tcvn)\b/i;
const STANDARD_FULL = /\b(qcvn|tcvn)\s?[\d-]+:\d{4}(\/[a-z]+)?/i;

/**
 * Mục kiểm phụ thuộc thông tin ngoài nội dung bài (tác giả, ngày, slug, SEO title/description...) —
 * bỏ khi chỉ chấm phần nội dung (vd AI tự sửa bài, chưa có các ô này).
 */
export const NON_CONTENT_CHECKS: readonly string[] = [
  'geo-author',
  'geo-freshness',
  'seo-slug-kw',
  'seo-title-length',
  'seo-seotitle-length',
  'seo-meta-length',
  'seo-meta-kw',
];

const DAY = 24 * 60 * 60 * 1000;

// ─── Phân tích cấu trúc tài liệu ────────────────────────────────────────────

interface DocFacts {
  plain: string;
  words: number;
  headings: { level: number; text: string }[];
  /** Đoạn văn ngay sau mỗi H2 (null nếu H2 không có đoạn văn theo sau) */
  firstParagraphAfterH2: (string | null)[];
  paragraphs: string[];
  internalLinks: number;
  externalDomains: Set<string>;
  hasSummary: boolean;
  hasList: boolean;
  hasTable: boolean;
  blockquotes: string[];
  hasReferenceSection: boolean;
  images: { src: string; alt: string; caption?: string }[];
}

function analyzeDoc(doc: RichDoc): DocFacts {
  const facts: DocFacts = {
    plain: toPlainText(doc),
    words: 0,
    headings: [],
    firstParagraphAfterH2: [],
    paragraphs: [],
    internalLinks: 0,
    externalDomains: new Set(),
    hasSummary: false,
    hasList: false,
    hasTable: false,
    blockquotes: [],
    hasReferenceSection: false,
    images: [],
  };
  facts.words = countWords(facts.plain);

  const visit = (node: RichNode) => {
    for (const mark of node.marks ?? []) {
      if (mark.type !== 'link' || !mark.attrs?.href) continue;
      const href = mark.attrs.href;
      if (isInternalLink(href)) facts.internalLinks++;
      else {
        // Package thuần TS (không có URL của DOM/Node) -> lấy hostname bằng regex
        const host = /^https?:\/\/(?:www\.)?([^/:?#]+)/i.exec(href)?.[1];
        if (host) facts.externalDomains.add(host.toLowerCase());
      }
    }
    switch (node.type) {
      case 'heading': {
        const text = nodeText(node).trim();
        if (text) facts.headings.push({ level: Number(node.attrs?.level ?? 2), text });
        if (REFERENCE_HEADING.test(text)) facts.hasReferenceSection = true;
        break;
      }
      case 'paragraph': {
        const text = nodeText(node).trim();
        if (text) facts.paragraphs.push(text);
        break;
      }
      case 'callout':
        if (node.attrs?.variant === 'summary') facts.hasSummary = true;
        break;
      case 'bulletList':
      case 'orderedList':
        facts.hasList = true;
        break;
      case 'table':
        facts.hasTable = true;
        break;
      case 'blockquote':
        facts.blockquotes.push(nodeText(node).trim());
        break;
      case 'image': {
        const src = typeof node.attrs?.src === 'string' ? node.attrs.src : '';
        const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt.trim() : '';
        const caption = typeof node.attrs?.caption === 'string' ? node.attrs.caption.trim() : undefined;
        facts.images.push({ src, alt, caption });
        break;
      }
    }
    (node.content ?? []).forEach(visit);
  };
  doc.content.forEach(visit);

  // Đoạn ngay sau mỗi H2 ở cấp gốc (câu trả lời đầu mục)
  doc.content.forEach((node, i) => {
    if (node.type !== 'heading' || Number(node.attrs?.level ?? 2) !== 2) return;
    const next = doc.content[i + 1];
    facts.firstParagraphAfterH2.push(next?.type === 'paragraph' ? nodeText(next).trim() : null);
  });
  return facts;
}

// ─── Tính điểm ───────────────────────────────────────────────────────────────

const VALUE: Record<CheckStatus, number> = { good: 1, warn: 0.5, bad: 0 };

/** Điểm 0–100 của một nhóm mục kiểm (trung bình có trọng số: đạt 1, cảnh báo 0,5, chưa đạt 0) */
export function scoreChecks(checks: ContentCheck[]): number {
  const total = checks.reduce((n, c) => n + c.weight, 0);
  const got = checks.reduce((n, c) => n + c.weight * VALUE[c.status], 0);
  return total ? Math.round((got / total) * 100) : 0;
}

/** Điểm chỉ tính phần nội dung (bỏ NON_CONTENT_CHECKS) */
export const contentScores = (score: ContentScore) => ({
  seo: scoreChecks(score.seo.checks.filter((c) => !NON_CONTENT_CHECKS.includes(c.id))),
  aeo: scoreChecks(score.aeo.checks.filter((c) => !NON_CONTENT_CHECKS.includes(c.id))),
  geo: scoreChecks(score.geo.checks.filter((c) => !NON_CONTENT_CHECKS.includes(c.id))),
});

function group(checks: ContentCheck[]): ScoreGroup {
  const total = checks.reduce((n, c) => n + c.weight, 0);
  const got = checks.reduce((n, c) => n + c.weight * VALUE[c.status], 0);
  return { score: total ? Math.round((got / total) * 100) : 0, checks };
}

const check = (id: string, status: CheckStatus, message: string, weight = 1): ContentCheck => ({ id, status, message, weight });

export function analyzeContent(input: ContentScoreInput): ContentScore {
  const { keyword, title, slug, sapo, doc, locale } = input;
  const kw = keyword.trim();
  const facts = analyzeDoc(doc);
  const seoTitle = (input.seoTitle || title).trim();
  const metaDescription = (input.seoDescription || sapo).trim();
  const fullText = `${title}\n${sapo}\n${facts.plain}`;
  const occurrences = kw ? countOccurrences(fullText, kw) : 0;
  // Mật độ kiểu Yoast: số lần xuất hiện cụm keyword / tổng số từ
  const density = kw && facts.words ? (occurrences / (facts.words + countWords(sapo))) * 100 : 0;
  const h2 = facts.headings.filter((h) => h.level === 2);
  const subHeadings = facts.headings.filter((h) => h.level === 2 || h.level === 3);
  const faq = collectFaqItems(doc);
  const needKw = 'Nhập "Keyword chính" để chấm mục này';

  // ── SEO ──
  const seo: ContentCheck[] = [
    !kw
      ? check('seo-title-kw', 'warn', needKw, 2)
      : containsKeyword(title, kw)
        ? check('seo-title-kw', normalizeText(title).indexOf(normalizeText(kw)) <= normalizeText(title).length / 2 ? 'good' : 'warn',
            normalizeText(title).indexOf(normalizeText(kw)) <= normalizeText(title).length / 2
              ? 'Tiêu đề chứa keyword, ở nửa đầu tiêu đề'
              : 'Tiêu đề có keyword nhưng ở cuối — đưa keyword lên gần đầu', 2)
        : check('seo-title-kw', 'bad', 'Tiêu đề chưa có keyword chính', 2),
    title.length >= 30 && title.length <= 80
      ? check('seo-title-length', 'good', `Tiêu đề dài ${title.length} ký tự — vừa phải`)
      : check('seo-title-length', 'warn', `Tiêu đề dài ${title.length} ký tự — nên 30–80 ký tự`),
    seoTitle.length >= 30 && seoTitle.length <= 60
      ? check('seo-seotitle-length', 'good', `Tiêu đề SEO ${seoTitle.length}/60 ký tự`)
      : check('seo-seotitle-length', 'warn', `Tiêu đề SEO ${seoTitle.length} ký tự — Google hiển thị khoảng 30–60 ký tự`),
    metaDescription.length >= 120 && metaDescription.length <= 160
      ? check('seo-meta-length', 'good', `Mô tả SEO ${metaDescription.length}/160 ký tự`)
      : check('seo-meta-length', 'warn', `Mô tả SEO ${metaDescription.length} ký tự — nên 120–160 ký tự`),
    !kw
      ? check('seo-meta-kw', 'warn', needKw)
      : containsKeyword(metaDescription, kw)
        ? check('seo-meta-kw', 'good', 'Mô tả SEO chứa keyword')
        : check('seo-meta-kw', 'bad', 'Mô tả SEO (hoặc sapo) chưa có keyword'),
    !kw
      ? check('seo-intro-kw', 'warn', needKw)
      : containsKeyword(`${sapo}\n${facts.paragraphs[0] ?? ''}`, kw)
        ? check('seo-intro-kw', 'good', 'Sapo/đoạn đầu có keyword')
        : check('seo-intro-kw', 'bad', 'Đưa keyword vào sapo hoặc đoạn đầu tiên'),
    !kw
      ? check('seo-heading-kw', 'warn', needKw)
      : subHeadings.some((h) => containsKeyword(h.text, kw))
        ? check('seo-heading-kw', 'good', 'Có tiêu đề mục (H2/H3) chứa keyword')
        : check('seo-heading-kw', 'warn', 'Chưa tiêu đề mục nào chứa keyword'),
    !kw
      ? check('seo-slug-kw', 'warn', needKw)
      : slug.includes(slugify(kw))
        ? check('seo-slug-kw', 'good', 'Đường dẫn chứa keyword')
        : check('seo-slug-kw', 'warn', `Đường dẫn chưa chứa "${slugify(kw)}"`),
    facts.words >= 600
      ? check('seo-length', 'good', `${facts.words} từ — đủ chiều sâu`)
      : facts.words >= 300
        ? check('seo-length', 'warn', `${facts.words} từ — bài kỹ thuật nên từ 600 từ`)
        : check('seo-length', 'bad', `${facts.words} từ — quá ngắn`),
    !kw
      ? check('seo-density', 'warn', needKw)
      : density >= 0.5 && density <= 2.5
        ? check('seo-density', 'good', `Mật độ keyword ${density.toFixed(1)}%`)
        : density < 0.5
          ? check('seo-density', 'warn', `Mật độ keyword ${density.toFixed(1)}% — hơi ít, nhắc tự nhiên thêm vài lần`)
          : check('seo-density', 'bad', `Mật độ keyword ${density.toFixed(1)}% — quá dày (nhồi keyword)`),
    facts.internalLinks >= 1
      ? check('seo-internal-link', 'good', `${facts.internalLinks} link nội bộ`)
      : check('seo-internal-link', 'bad', 'Chưa có link nội bộ tới bài/sản phẩm khác trên site'),
    h2.length >= 2
      ? check('seo-structure', 'good', `${h2.length} mục H2`)
      : check('seo-structure', 'warn', 'Chia bài thành ít nhất 2 mục H2'),
    facts.images.length >= 1
      ? check('seo-image-count', 'good', `Có ${facts.images.length} ảnh minh họa`)
      : check('seo-image-count', 'warn', 'Thêm ít nhất 1 ảnh minh họa cho bài viết'),
    facts.images.length === 0
      ? check('seo-image-alt', 'warn', 'Chưa có ảnh trong bài viết để kiểm tra thẻ alt')
      : facts.images.filter((img) => !img.alt).length === 0
        ? check('seo-image-alt', 'good', `Tất cả ${facts.images.length} ảnh đã có mô tả alt`)
        : check('seo-image-alt', 'bad', `${facts.images.filter((img) => !img.alt).length}/${facts.images.length} ảnh chưa có mô tả (alt)`),
    !kw
      ? check('seo-image-alt-kw', 'warn', needKw)
      : facts.images.length === 0
        ? check('seo-image-alt-kw', 'warn', 'Thêm ảnh có chứa keyword trong thẻ alt')
        : facts.images.some((img) => containsKeyword(img.alt, kw))
          ? check('seo-image-alt-kw', 'good', 'Có ảnh chứa keyword trong thẻ alt')
          : check('seo-image-alt-kw', 'warn', 'Thẻ alt của ảnh chưa chứa keyword chính'),
  ];

  // ── AEO ──
  const sapoWords = countWords(sapo);
  const questionRatio = subHeadings.length ? subHeadings.filter((h) => isQuestionHeading(h.text, locale)).length / subHeadings.length : 0;
  const answered = facts.firstParagraphAfterH2.filter((p) => p && countWords(p) >= 15 && countWords(p) <= 60).length;
  const answerRatio = facts.firstParagraphAfterH2.length ? answered / facts.firstParagraphAfterH2.length : 0;
  const longParagraphs = facts.paragraphs.filter((p) => countWords(p) > 120).length;
  const goodFaq = faq.filter((f) => countWords(f.answer) >= 20 && countWords(f.answer) <= 90).length;
  const faqAnswerOff = faq.filter((f) => countWords(f.answer) < 35 || countWords(f.answer) > 90).length;

  const aeo: ContentCheck[] = [
    sapoWords >= 25 && sapoWords <= 70 && (!kw || containsKeyword(sapo, kw))
      ? check('aeo-direct-answer', 'good', `Sapo ${sapoWords} từ, trả lời thẳng chủ đề`, 2)
      : check('aeo-direct-answer', sapoWords ? 'warn' : 'bad', 'Sapo nên 40–60 từ, trả lời thẳng câu hỏi chính và có keyword', 2),
    facts.hasSummary
      ? check('aeo-summary', 'good', 'Có hộp "Tóm tắt nhanh"')
      : check('aeo-summary', 'warn', 'Thêm hộp "Tóm tắt nhanh" 3–5 ý ở đầu bài'),
    questionRatio >= 0.3
      ? check('aeo-question-headings', 'good', `${Math.round(questionRatio * 100)}% tiêu đề mục dạng câu hỏi`)
      : check('aeo-question-headings', 'warn', 'Viết ít nhất 30% tiêu đề mục theo câu hỏi người đọc hay tìm (…là gì? như thế nào?)'),
    answerRatio >= 0.6
      ? check('aeo-answer-first', 'good', 'Đầu mỗi mục có câu trả lời ngắn gọn')
      : check('aeo-answer-first', h2.length ? 'warn' : 'bad', 'Mở đầu mỗi mục H2 bằng 1–2 câu trả lời trực tiếp (15–60 từ)'),
    faq.length >= 3 && goodFaq >= Math.ceil(faq.length * 0.6)
      ? check('aeo-faq', 'good', `Khối FAQ ${faq.length} câu hỏi`, 2)
      : faq.length > 0
        ? check('aeo-faq', 'warn', `FAQ có ${faq.length} câu — nên từ 3 câu, mỗi câu trả lời 40–80 từ`, 2)
        : check('aeo-faq', 'bad', 'Thêm khối FAQ (từ 3 câu hỏi thường gặp)', 2),
    facts.hasList || facts.hasTable
      ? check('aeo-structured', 'good', 'Có danh sách/bảng dễ trích xuất')
      : check('aeo-structured', 'warn', 'Dùng danh sách số cho quy trình, bảng cho so sánh/thông số'),
    longParagraphs === 0
      ? check('aeo-paragraphs', 'good', 'Đoạn văn ngắn gọn')
      : check('aeo-paragraphs', 'warn', `${longParagraphs} đoạn dài hơn 120 từ — tách nhỏ cho dễ đọc`),
    ...(faq.length
      ? [
          faqAnswerOff === 0
            ? check('aeo-faq-answers', 'good', 'Câu trả lời FAQ dài vừa (40–80 từ) để được chọn làm câu trả lời')
            : check('aeo-faq-answers', 'warn', `${faqAnswerOff}/${faq.length} câu trả lời FAQ quá ngắn hoặc quá dài — nên 40–80 từ, câu đầu trả lời thẳng`),
        ]
      : []),
  ];

  // ── GEO ──
  const sentences = `${sapo}\n${facts.plain}`.split(/(?<=[.!?])\s+|\n+/);
  const statSentences = sentences.filter((s) => STAT_PATTERN.test(s)).length;
  const sources = facts.externalDomains.size;
  const expertQuote = facts.blockquotes.some((q) => EXPERT_PATTERN[locale].test(q));
  const refDate = input.updatedAt ?? input.publishedAt;
  const ageDays = refDate ? ((input.now ?? new Date()).getTime() - new Date(refDate).getTime()) / DAY : 0;
  const kwNorm = kw ? normalizeText(kw) : '';
  const definition =
    !!kwNorm && new RegExp(`${kwNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} (la|is|are|refers to) `).test(normalizeText(facts.plain));
  const coverageText = normalizeText([...subHeadings.map((h) => h.text), ...faq.map((f) => f.question)].join(' '));
  const fanOut = (input.fanOutQueries ?? []).filter((q) => q.trim());
  const covered = fanOut.filter((q) => {
    const tokens = normalizeText(q).split(' ').filter((t) => t.length >= 3);
    return tokens.length > 0 && tokens.filter((t) => coverageText.includes(t)).length / tokens.length >= 0.6;
  }).length;

  const verifyMarks = `${title}\n${sapo}\n${facts.plain}`.split(VERIFY_MARK).length - 1;
  const brandNamed = BRAND_PATTERN.test(`${title}\n${sapo}\n${facts.plain}`);
  const standardOk = !STANDARD_MENTION.test(facts.plain) || STANDARD_FULL.test(`${sapo}\n${facts.plain}`);

  const geo: ContentCheck[] = [
    // Chỉ xuất hiện khi còn dấu cần kiểm chứng: lỗi nặng, phải xử lý trước khi đăng
    ...(verifyMarks
      ? [check('geo-verify-marks', 'bad', `Còn ${verifyMarks} chỗ "${VERIFY_MARK}" — kiểm tra nguồn, sửa hoặc xoá trước khi đăng`, 3)]
      : []),
    brandNamed && standardOk
      ? check('geo-entity', 'good', 'Thực thể rõ ràng: có tên thương hiệu, tiêu chuẩn viết đủ số hiệu')
      : check(
          'geo-entity',
          'warn',
          !brandNamed
            ? 'Nêu rõ thương hiệu Remak® / FireOFF ít nhất một lần để AI trích dẫn đúng chủ thể'
            : 'Viết đủ số hiệu tiêu chuẩn ít nhất một lần (vd QCVN 06:2022/BXD, TCVN 9311-8:2012)',
        ),
    statSentences >= 3 && (sources > 0 || facts.hasReferenceSection)
      ? check('geo-statistics', 'good', `${statSentences} câu có số liệu cụ thể, có nguồn`, 2)
      : statSentences > 0
        ? check('geo-statistics', 'warn', `${statSentences} câu có số liệu — thêm số liệu cụ thể và ghi rõ nguồn`, 2)
        : check('geo-statistics', 'bad', 'Chưa có số liệu cụ thể (EI, °C, mm, %...) — AI ưu tiên trích dẫn nội dung có số liệu', 2),
    sources >= 2
      ? check('geo-sources', 'good', `${sources} nguồn bên ngoài`, 2)
      : sources === 1
        ? check('geo-sources', 'warn', 'Mới có 1 nguồn ngoài — trích thêm tiêu chuẩn/viện/cơ quan uy tín', 2)
        : check('geo-sources', 'bad', 'Chưa dẫn nguồn ngoài (QCVN, viện thử nghiệm, nhà sản xuất...)', 2),
    expertQuote
      ? check('geo-expert-quote', 'good', 'Có trích dẫn chuyên gia')
      : check('geo-expert-quote', 'warn', 'Thêm trích dẫn của kỹ sư/chuyên gia (khối trích dẫn kèm tên, chức danh)'),
    input.author?.jobTitle
      ? check('geo-author', 'good', `Tác giả ${input.author.name} — ${input.author.jobTitle}`)
      : input.author
        ? check('geo-author', 'warn', 'Tác giả chưa có chức danh (sửa ở Tag & Tác giả)')
        : check('geo-author', 'bad', 'Chưa chọn tác giả — AI và Google đánh giá cao nội dung có chuyên gia đứng tên'),
    ageDays <= 365
      ? check('geo-freshness', 'good', refDate ? 'Nội dung còn mới (dưới 12 tháng)' : 'Bài mới')
      : check('geo-freshness', ageDays <= 730 ? 'warn' : 'bad', 'Nội dung đã hơn 12 tháng — cập nhật số liệu, tiêu chuẩn mới'),
    !kw
      ? check('geo-definition', 'warn', needKw)
      : definition
        ? check('geo-definition', 'good', 'Có câu định nghĩa rõ cho chủ đề chính')
        : check('geo-definition', 'warn', `Thêm câu định nghĩa: "${kw} là …"`),
    !kw
      ? check('geo-no-stuffing', 'warn', needKw)
      : density <= 2.5
        ? check('geo-no-stuffing', 'good', 'Không nhồi keyword')
        : check('geo-no-stuffing', 'bad', 'Nhồi keyword làm GIẢM khả năng được AI trích dẫn — viết tự nhiên hơn', 2),
    ...(fanOut.length
      ? [
          covered / fanOut.length >= 0.6
            ? check('geo-fanout', 'good', `Trả lời ${covered}/${fanOut.length} câu hỏi liên quan AI hay tìm`, 2)
            : check('geo-fanout', covered / fanOut.length >= 0.3 ? 'warn' : 'bad', `Mới phủ ${covered}/${fanOut.length} câu hỏi liên quan — thêm mục hoặc FAQ`, 2),
        ]
      : []),
  ];

  return { seo: group(seo), aeo: group(aeo), geo: group(geo) };
}
