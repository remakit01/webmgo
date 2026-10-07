// Nội dung rich text dạng khối (tương thích JSON của TipTap/ProseMirror) dùng chung cho mọi loại nội dung.
// - api: kiểm tra cấu trúc trước khi lưu, sinh plain text / thời gian đọc, tách đoạn để dịch AI.
// - fe: render phía server theo đúng whitelist này, sinh mục lục (TOC).
// - CMS: cấu hình editor chỉ bật đúng các khối có ở đây.
// Không lưu HTML: khối/thuộc tính nằm ngoài whitelist bị từ chối nên không có XSS từ nội dung CMS.

import { isSafeLink } from './link.js';
import { slugify } from './slug.js';

export const RICH_MARK_TYPES = ['bold', 'italic', 'underline', 'strike', 'code', 'link', 'subscript', 'superscript'] as const;
export type RichMarkType = (typeof RICH_MARK_TYPES)[number];

export const RICH_NODE_TYPES = [
  'doc',
  'paragraph',
  'heading',
  'text',
  'hardBreak',
  'bulletList',
  'orderedList',
  'listItem',
  'blockquote',
  'horizontalRule',
  'image',
  'table',
  'tableRow',
  'tableHeader',
  'tableCell',
  'youtube',
  'callout',
  'relatedPost',
  'faq',
  'faqItem',
] as const;
export type RichNodeType = (typeof RICH_NODE_TYPES)[number];

export const HEADING_LEVELS = [2, 3, 4] as const;
/** summary = hộp "Tóm tắt nhanh" (key takeaways) đầu bài — trả lời thẳng câu hỏi chính (AEO) */
export const CALLOUT_VARIANTS = ['info', 'warning', 'tip', 'summary'] as const;

/** Câu hỏi FAQ tối đa bấy nhiêu ký tự */
export const FAQ_QUESTION_MAX = 300;
export type CalloutVariant = (typeof CALLOUT_VARIANTS)[number];

export interface RichMark {
  type: RichMarkType;
  attrs?: { href?: string; target?: string | null };
}

export interface RichNode {
  type: RichNodeType;
  attrs?: Record<string, unknown>;
  content?: RichNode[];
  marks?: RichMark[];
  text?: string;
}

export interface RichDoc {
  type: 'doc';
  content: RichNode[];
}

export const EMPTY_RICH_DOC: RichDoc = { type: 'doc', content: [{ type: 'paragraph' }] };

/** Khối chứa chữ — đơn vị tách đoạn khi dịch và khi sinh plain text */
export const TEXT_BLOCK_TYPES: readonly RichNodeType[] = ['paragraph', 'heading'];

export const RICH_LIMITS = {
  maxDepth: 12,
  maxNodes: 8000,
  maxTextLength: 10_000, // một text node
  maxAltLength: 300,
  maxCaptionLength: 500,
} as const;

/** Thuộc tính được phép của từng node (attr khác bị từ chối) */
const NODE_ATTRS: Partial<Record<RichNodeType, readonly string[]>> = {
  paragraph: ['textAlign', 'align'],
  heading: ['level', 'textAlign', 'align'],
  orderedList: ['start', 'type'],
  image: ['src', 'alt', 'title', 'caption', 'width', 'height', 'align'],
  tableHeader: ['colspan', 'rowspan', 'colwidth', 'align'],
  tableCell: ['colspan', 'rowspan', 'colwidth', 'align'],
  youtube: ['src', 'start', 'width', 'height'],
  callout: ['variant'],
  relatedPost: ['postId'],
  faqItem: ['question'],
};

const TEXT_ALIGNS = ['left', 'center', 'right', 'justify', null];

const YOUTUBE_PATTERN =
  /^https:\/\/(?:www\.|m\.)?(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})(?:[?&#].*)?$/;

/** Lấy video ID 11 ký tự từ URL YouTube; URL không hợp lệ trả null */
export function youtubeId(src: string): string | null {
  return YOUTUBE_PATTERN.exec(src)?.[1] ?? null;
}

export interface RichValidateOptions {
  /** Cho phép src ảnh (vd chỉ ảnh trên MinIO của mình). Mặc định: http(s) hoặc đường dẫn nội bộ */
  isAllowedImageSrc?: (src: string) => boolean;
}

export type RichValidateResult = { ok: true } | { ok: false; error: string };

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isOptionalString = (v: unknown, max: number) => v === undefined || v === null || (typeof v === 'string' && v.length <= max);
const isOptionalPositiveInt = (v: unknown) => v === undefined || v === null || (Number.isInteger(v) && (v as number) > 0);

/**
 * Kiểm tra JSON nội dung theo whitelist. Trả lỗi đầu tiên gặp (tiếng Việt, kèm vị trí) để CMS hiển thị.
 * Không kiểm tra quan hệ cha/con chi tiết như ProseMirror — chỉ chặn node/mark/attr lạ, link/ảnh/video không an toàn.
 */
export function validateRichDoc(value: unknown, options: RichValidateOptions = {}): RichValidateResult {
  const allowImage = options.isAllowedImageSrc ?? ((src: string) => isSafeLink(src));
  let nodes = 0;

  const fail = (path: string, msg: string): RichValidateResult => ({ ok: false, error: `${path}: ${msg}` });

  function checkMarks(marks: unknown, path: string): RichValidateResult {
    if (marks === undefined) return { ok: true };
    if (!Array.isArray(marks)) return fail(path, 'marks phải là mảng');
    for (const [i, mark] of marks.entries()) {
      const p = `${path}.marks[${i}]`;
      if (!isObject(mark) || !(RICH_MARK_TYPES as readonly string[]).includes(mark.type as string)) {
        return fail(p, `định dạng chữ không được hỗ trợ (${isObject(mark) ? String(mark.type) : typeof mark})`);
      }
      if (mark.type === 'link') {
        const href = isObject(mark.attrs) ? mark.attrs.href : undefined;
        if (typeof href !== 'string' || !isSafeLink(href, { allowAnchor: true })) {
          return fail(p, 'link phải bắt đầu bằng "/", "#" hoặc http(s)://');
        }
      } else if (mark.attrs !== undefined && mark.attrs !== null && Object.keys(mark.attrs as object).length > 0) {
        return fail(p, 'định dạng chữ không nhận thuộc tính');
      }
    }
    return { ok: true };
  }

  function checkAttrs(node: Record<string, unknown>, type: RichNodeType, path: string): RichValidateResult {
    const attrs = node.attrs;
    if (attrs === undefined || attrs === null) {
      if (type === 'image' || type === 'youtube' || type === 'relatedPost' || type === 'faqItem') {
        return fail(path, 'thiếu thuộc tính bắt buộc');
      }
      return { ok: true };
    }
    if (!isObject(attrs)) return fail(path, 'attrs phải là object');
    const allowed = NODE_ATTRS[type] ?? [];
    const unknownAttr = Object.keys(attrs).find((k) => !allowed.includes(k));
    if (unknownAttr) return fail(path, `thuộc tính "${unknownAttr}" không được hỗ trợ`);

    const textAlignment = (attrs.textAlign ?? attrs.align) as string | null | undefined;
    if (textAlignment !== undefined && !TEXT_ALIGNS.includes(textAlignment)) {
      return fail(path, 'căn lề không hợp lệ');
    }
    switch (type) {
      case 'heading':
        if (!(HEADING_LEVELS as readonly unknown[]).includes(attrs.level)) return fail(path, 'chỉ hỗ trợ tiêu đề H2–H4');
        break;
      case 'orderedList':
        if (!isOptionalPositiveInt(attrs.start)) return fail(path, 'số bắt đầu danh sách không hợp lệ');
        if (!isOptionalString(attrs.type, 10)) return fail(path, 'kiểu danh sách không hợp lệ');
        break;
      case 'image':
        if (typeof attrs.src !== 'string' || !allowImage(attrs.src)) {
          return fail(path, 'ảnh phải được tải lên thư viện ảnh của hệ thống');
        }
        if (typeof attrs.alt !== 'string' || attrs.alt.trim() === '') return fail(path, 'ảnh thiếu mô tả (alt)');
        if (attrs.alt.length > RICH_LIMITS.maxAltLength) return fail(path, `alt tối đa ${RICH_LIMITS.maxAltLength} ký tự`);
        if (!isOptionalString(attrs.caption, RICH_LIMITS.maxCaptionLength)) {
          return fail(path, `chú thích ảnh tối đa ${RICH_LIMITS.maxCaptionLength} ký tự`);
        }
        if (!isOptionalString(attrs.title, RICH_LIMITS.maxAltLength)) return fail(path, 'title ảnh không hợp lệ');
        if (!isOptionalPositiveInt(attrs.width) || !isOptionalPositiveInt(attrs.height)) {
          return fail(path, 'kích thước ảnh không hợp lệ');
        }
        if (attrs.align !== undefined && attrs.align !== null && !['left', 'right', 'center'].includes(attrs.align as string)) {
          return fail(path, 'vị trí bố cục ảnh (align) không hợp lệ');
        }
        break;
      case 'tableHeader':
      case 'tableCell':
        if (!isOptionalPositiveInt(attrs.colspan) || !isOptionalPositiveInt(attrs.rowspan)) {
          return fail(path, 'colspan/rowspan không hợp lệ');
        }
        if (attrs.align !== undefined && !TEXT_ALIGNS.includes(attrs.align as string | null)) {
          return fail(path, 'căn lề ô bảng không hợp lệ');
        }
        if (attrs.colwidth !== undefined && attrs.colwidth !== null) {
          if (!Array.isArray(attrs.colwidth) || !attrs.colwidth.every((w) => Number.isInteger(w) && w > 0)) {
            return fail(path, 'độ rộng cột không hợp lệ');
          }
        }
        break;
      case 'youtube':
        if (typeof attrs.src !== 'string' || !youtubeId(attrs.src)) return fail(path, 'chỉ nhúng được video YouTube');
        if (!isOptionalPositiveInt(attrs.start) && attrs.start !== 0) return fail(path, 'thời điểm bắt đầu không hợp lệ');
        if (!isOptionalPositiveInt(attrs.width) || !isOptionalPositiveInt(attrs.height)) {
          return fail(path, 'kích thước video không hợp lệ');
        }
        break;
      case 'callout':
        if (!(CALLOUT_VARIANTS as readonly unknown[]).includes(attrs.variant)) return fail(path, 'kiểu hộp lưu ý không hợp lệ');
        break;
      case 'relatedPost':
        if (typeof attrs.postId !== 'string' || !/^[a-z0-9]{1,40}$/i.test(attrs.postId)) {
          return fail(path, 'hộp bài liên quan thiếu bài viết');
        }
        break;
      case 'faqItem':
        if (typeof attrs.question !== 'string' || !attrs.question.trim()) return fail(path, 'câu hỏi FAQ đang trống');
        if (attrs.question.length > FAQ_QUESTION_MAX) return fail(path, `câu hỏi FAQ tối đa ${FAQ_QUESTION_MAX} ký tự`);
        break;
    }
    return { ok: true };
  }

  function walk(node: unknown, path: string, depth: number): RichValidateResult {
    if (++nodes > RICH_LIMITS.maxNodes) return fail(path, `nội dung quá dài (tối đa ${RICH_LIMITS.maxNodes} khối/đoạn)`);
    if (depth > RICH_LIMITS.maxDepth) return fail(path, 'nội dung lồng nhau quá sâu');
    if (!isObject(node)) return fail(path, 'khối không hợp lệ');
    const type = node.type;
    if (typeof type !== 'string' || !(RICH_NODE_TYPES as readonly string[]).includes(type)) {
      return fail(path, `loại khối "${String(type)}" không được hỗ trợ`);
    }
    if (type === 'doc' && depth > 0) return fail(path, 'doc chỉ được ở gốc');

    const unknownKey = Object.keys(node).find((k) => !['type', 'attrs', 'content', 'marks', 'text'].includes(k));
    if (unknownKey) return fail(path, `trường "${unknownKey}" không được hỗ trợ`);

    if (type === 'text') {
      if (typeof node.text !== 'string' || node.text.length === 0) return fail(path, 'đoạn chữ rỗng');
      if (node.text.length > RICH_LIMITS.maxTextLength) return fail(path, 'đoạn chữ quá dài');
      if (node.content !== undefined) return fail(path, 'text không chứa khối con');
      return checkMarks(node.marks, path);
    }
    if (node.text !== undefined) return fail(path, 'chỉ node text mới có nội dung chữ');
    if (node.marks !== undefined) return fail(path, 'chỉ node text mới có định dạng chữ');

    const attrsResult = checkAttrs(node, type as RichNodeType, path);
    if (!attrsResult.ok) return attrsResult;

    if (node.content === undefined) return { ok: true };
    if (!Array.isArray(node.content)) return fail(path, 'content phải là mảng');
    for (const [i, child] of node.content.entries()) {
      const r = walk(child, `${path}.content[${i}]`, depth + 1);
      if (!r.ok) return r;
    }
    return { ok: true };
  }

  if (!isObject(value) || value.type !== 'doc') return fail('doc', 'nội dung phải là tài liệu (type "doc")');
  if (!Array.isArray(value.content)) return fail('doc', 'nội dung thiếu danh sách khối');
  return walk(value, 'doc', 0);
}

// ─── Đọc nội dung ────────────────────────────────────────────────────────────

/** Ghép chữ trong một node (đệ quy), hardBreak -> xuống dòng */
export function nodeText(node: RichNode): string {
  if (node.type === 'text') return node.text ?? '';
  if (node.type === 'hardBreak') return '\n';
  return (node.content ?? []).map(nodeText).join('');
}

/** Plain text của cả tài liệu (mỗi khối một dòng) — dùng cho tìm kiếm, tính thời gian đọc, meta description dự phòng */
export function toPlainText(doc: RichDoc): string {
  const lines: string[] = [];
  const visit = (node: RichNode) => {
    if (node.type === 'paragraph' || node.type === 'heading') {
      const text = nodeText(node).trim();
      if (text) lines.push(text);
      return;
    }
    if (node.type === 'faqItem') {
      const question = typeof node.attrs?.question === 'string' ? node.attrs.question.trim() : '';
      if (question) lines.push(question);
      (node.content ?? []).forEach(visit);
      return;
    }
    if (node.type === 'image') {
      const caption = typeof node.attrs?.caption === 'string' ? node.attrs.caption.trim() : '';
      if (caption) lines.push(caption);
      return;
    }
    if (node.type === 'tableCell' || node.type === 'tableHeader') {
      const text = nodeText(node).trim();
      if (text) lines.push(text);
      return;
    }
    (node.content ?? []).forEach(visit);
  };
  doc.content.forEach(visit);
  return lines.join('\n');
}

/** Số phút đọc (làm tròn lên, tối thiểu 1) — ~220 từ/phút cho văn bản kỹ thuật */
export function readingMinutes(plainText: string, wordsPerMinute = 220): number {
  const words = plainText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export interface RichHeading {
  id: string;
  text: string;
  level: number;
}

/**
 * Tiêu đề trong bài theo thứ tự, kèm id neo duy nhất (slug từ nội dung, trùng thì thêm -2, -3).
 * fe dùng cùng hàm này cho cả mục lục và thuộc tính id của thẻ h2/h3 để link neo luôn khớp.
 */
export function extractHeadings(doc: RichDoc): RichHeading[] {
  const used = new Map<string, number>();
  const headings: RichHeading[] = [];
  const visit = (node: RichNode) => {
    if (node.type === 'heading') {
      const text = nodeText(node).trim();
      if (!text) return;
      const base = slugify(text, 80) || 'muc';
      const n = (used.get(base) ?? 0) + 1;
      used.set(base, n);
      headings.push({ id: n === 1 ? base : `${base}-${n}`, text, level: Number(node.attrs?.level ?? 2) });
      return;
    }
    (node.content ?? []).forEach(visit);
  };
  doc.content.forEach(visit);
  return headings;
}

/** Id các bài được chèn qua khối "bài liên quan" (giữ thứ tự, bỏ trùng) */
export function collectRelatedPostIds(doc: RichDoc): string[] {
  const ids = new Set<string>();
  const visit = (node: RichNode) => {
    if (node.type === 'relatedPost' && typeof node.attrs?.postId === 'string') ids.add(node.attrs.postId);
    (node.content ?? []).forEach(visit);
  };
  doc.content.forEach(visit);
  return [...ids];
}

export interface FaqEntry {
  question: string;
  /** Câu trả lời dạng chữ thuần (cho JSON-LD FAQPage) */
  answer: string;
}

/** Các cặp hỏi–đáp trong khối FAQ (theo thứ tự) — sinh JSON-LD FAQPage, chấm điểm AEO */
export function collectFaqItems(doc: RichDoc): FaqEntry[] {
  const items: FaqEntry[] = [];
  const visit = (node: RichNode) => {
    if (node.type === 'faqItem') {
      const question = typeof node.attrs?.question === 'string' ? node.attrs.question.trim() : '';
      const answer = toPlainText({ type: 'doc', content: node.content ?? [] }).replace(/\n+/g, ' ').trim();
      if (question && answer) items.push({ question, answer });
      return;
    }
    (node.content ?? []).forEach(visit);
  };
  doc.content.forEach(visit);
  return items;
}

/** URL các ảnh trong bài (để dọn ảnh không còn dùng, preload...) */
export function collectImageSrcs(doc: RichDoc): string[] {
  const srcs: string[] = [];
  const visit = (node: RichNode) => {
    if (node.type === 'image' && typeof node.attrs?.src === 'string') srcs.push(node.attrs.src);
    (node.content ?? []).forEach(visit);
  };
  doc.content.forEach(visit);
  return srcs;
}

/**
 * JSON ổn định (sắp key) — so sánh nội dung không phụ thuộc thứ tự key.
 * Cần vì Postgres JSONB trả key theo thứ tự riêng, khác thứ tự editor tạo ra.
 */
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

/** Tạo tài liệu từ các đoạn văn thuần (nhập dữ liệu cũ dạng string[]) */
export function richDocFromParagraphs(paragraphs: string[]): RichDoc {
  const content: RichNode[] = paragraphs
    .map((p) => p.trim())
    .filter(Boolean)
    .map((text) => ({ type: 'paragraph', content: [{ type: 'text', text }] }));
  return { type: 'doc', content: content.length ? content : [{ type: 'paragraph' }] };
}
