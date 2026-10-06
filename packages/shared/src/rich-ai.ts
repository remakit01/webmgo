// Khối nội dung do AI viết (JSON đơn giản, dễ cho LLM) -> RichNode hợp lệ của editor.
// AI chỉ trả các khối trong AI_BLOCK_TYPES; chữ inline dùng thẻ của rich-inline (<b> <i> <a href="…">).
// Link chỉ giữ khi href nằm trong danh sách cho phép (allowHref) — AI không thể chèn link tuỳ ý.

import { parseInline, plainInline } from './rich-inline.js';
import { CALLOUT_VARIANTS, validateRichDoc, type CalloutVariant, type RichNode } from './rich-content.js';

export const AI_BLOCK_TYPES = ['heading', 'paragraph', 'bullets', 'numbered', 'quote', 'callout', 'table'] as const;
export type AiBlockType = (typeof AI_BLOCK_TYPES)[number];

export interface AiBlock {
  type: AiBlockType;
  /** heading / paragraph / quote / callout */
  text?: string;
  /** heading: 2–4 (bị kẹp theo minHeadingLevel) */
  level?: number;
  /** bullets / numbered / callout (dạng danh sách) */
  items?: string[];
  /** callout: info | warning | tip | summary */
  variant?: string;
  /** table: hàng đầu là tiêu đề cột */
  rows?: string[][];
}

const TABLE_MAX_COLS = 6;
const TABLE_MAX_ROWS = 30;
const LIST_MAX_ITEMS = 20;

/** JSON schema cho Gemini (responseJsonSchema): { blocks: AiBlock[] } */
export const AI_SECTION_SCHEMA = {
  type: 'object',
  properties: {
    blocks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: [...AI_BLOCK_TYPES] },
          text: { type: 'string' },
          level: { type: 'integer', enum: [3, 4] },
          items: { type: 'array', items: { type: 'string' } },
          variant: { type: 'string', enum: [...CALLOUT_VARIANTS] },
          rows: { type: 'array', items: { type: 'array', items: { type: 'string' } } },
        },
        required: ['type'],
      },
    },
  },
  required: ['blocks'],
} as const;

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');

/** Đọc { blocks } từ JSON của AI; sai cấu trúc -> null (caller coi là kết quả không hợp lệ, thử lại) */
export function readAiBlocks(data: unknown): AiBlock[] | null {
  if (typeof data !== 'object' || data === null || !Array.isArray((data as { blocks?: unknown }).blocks)) return null;
  const blocks: AiBlock[] = [];
  for (const raw of (data as { blocks: unknown[] }).blocks) {
    if (typeof raw !== 'object' || raw === null) return null;
    const b = raw as Record<string, unknown>;
    if (!(AI_BLOCK_TYPES as readonly string[]).includes(b.type as string)) return null;
    if (b.text !== undefined && typeof b.text !== 'string') return null;
    if (b.items !== undefined && !isStringArray(b.items)) return null;
    if (b.rows !== undefined && !(Array.isArray(b.rows) && b.rows.every(isStringArray))) return null;
    blocks.push({
      type: b.type as AiBlockType,
      ...(typeof b.text === 'string' ? { text: b.text } : {}),
      ...(typeof b.level === 'number' ? { level: b.level } : {}),
      ...(b.items ? { items: b.items as string[] } : {}),
      ...(typeof b.variant === 'string' ? { variant: b.variant } : {}),
      ...(b.rows ? { rows: b.rows as string[][] } : {}),
    });
  }
  return blocks;
}

export interface AiConvertOptions {
  /** href được phép trong <a href>; ngoài danh sách -> bỏ link, giữ chữ */
  allowHref: (href: string) => boolean;
  /** Cấp tiêu đề nhỏ nhất AI được dùng (mục H2 do server dựng từ dàn ý -> AI chỉ được H3/H4) */
  minHeadingLevel?: number;
}

export interface AiUsedLink {
  href: string;
  text: string;
}

export interface AiConvertResult {
  nodes: RichNode[];
  /** Link thực sự còn lại trong nội dung (sau khi lọc whitelist) */
  links: AiUsedLink[];
}

/** Chữ inline AI viết -> text node; thẻ hỏng thì về chữ thuần. Ghi nhận link còn giữ. */
function inline(text: string, options: AiConvertOptions, links: AiUsedLink[]): RichNode[] {
  const nodes = parseInline(text.trim(), { allowHref: options.allowHref }) ?? plainInline(text);
  for (const n of nodes) {
    const href = n.marks?.find((m) => m.type === 'link')?.attrs?.href;
    if (href && n.text) links.push({ href, text: n.text });
  }
  return nodes;
}

const paragraph = (content: RichNode[]): RichNode => (content.length ? { type: 'paragraph', content } : { type: 'paragraph' });

/** Đoạn văn có thể chứa nhiều đoạn cách nhau bằng dòng trống */
function paragraphs(text: string, options: AiConvertOptions, links: AiUsedLink[]): RichNode[] {
  return text
    .split(/\n\s*\n/)
    .map((part) => inline(part, options, links))
    .filter((c) => c.length)
    .map(paragraph);
}

function list(type: 'bulletList' | 'orderedList', items: string[], options: AiConvertOptions, links: AiUsedLink[]): RichNode | null {
  const listItems = items
    .slice(0, LIST_MAX_ITEMS)
    .map((item) => inline(item, options, links))
    .filter((c) => c.length)
    .map((c): RichNode => ({ type: 'listItem', content: [paragraph(c)] }));
  return listItems.length ? { type, content: listItems } : null;
}

function table(rows: string[][], options: AiConvertOptions, links: AiUsedLink[]): RichNode | null {
  const kept = rows.filter((r) => r.some((c) => c.trim())).slice(0, TABLE_MAX_ROWS);
  if (kept.length < 2) return null;
  const cols = Math.min(TABLE_MAX_COLS, Math.max(...kept.map((r) => r.length)));
  return {
    type: 'table',
    content: kept.map((row, i) => ({
      type: 'tableRow',
      content: Array.from({ length: cols }, (_, c) => ({
        type: i === 0 ? 'tableHeader' : 'tableCell',
        content: [paragraph(inline(row[c] ?? '', options, links))],
      })),
    })),
  };
}

/** Chuyển các khối AI thành RichNode; khối rỗng/không dùng được bị bỏ qua */
export function aiBlocksToRichNodes(blocks: AiBlock[], options: AiConvertOptions): AiConvertResult {
  const links: AiUsedLink[] = [];
  const minLevel = Math.min(4, Math.max(2, options.minHeadingLevel ?? 2));
  const nodes: RichNode[] = [];
  for (const b of blocks) {
    const text = b.text?.trim() ?? '';
    switch (b.type) {
      case 'heading': {
        const content = inline(text, options, links);
        if (!content.length) break;
        const level = Math.min(4, Math.max(minLevel, Math.round(b.level ?? minLevel)));
        nodes.push({ type: 'heading', attrs: { level }, content });
        break;
      }
      case 'paragraph':
        nodes.push(...paragraphs(text, options, links));
        break;
      case 'bullets':
      case 'numbered': {
        const node = list(b.type === 'bullets' ? 'bulletList' : 'orderedList', b.items ?? [], options, links);
        if (node) nodes.push(node);
        break;
      }
      case 'quote': {
        const content = paragraphs(text, options, links);
        if (content.length) nodes.push({ type: 'blockquote', content });
        break;
      }
      case 'callout': {
        const variant: CalloutVariant = (CALLOUT_VARIANTS as readonly string[]).includes(b.variant ?? '') ? (b.variant as CalloutVariant) : 'info';
        const content = [...paragraphs(text, options, links)];
        const items = b.items?.length ? list('bulletList', b.items, options, links) : null;
        if (items) content.push(items);
        if (content.length) nodes.push({ type: 'callout', attrs: { variant }, content });
        break;
      }
      case 'table': {
        const node = table(b.rows ?? [], options, links);
        if (node) nodes.push(node);
        break;
      }
    }
  }
  return { nodes, links };
}

/** Như aiBlocksToRichNodes, đồng thời bắt buộc qua validateRichDoc (cùng luật với lúc lưu bài) */
export function aiBlocksToValidNodes(
  blocks: AiBlock[],
  options: AiConvertOptions,
): ({ ok: true } & AiConvertResult) | { ok: false; error: string } {
  const result = aiBlocksToRichNodes(blocks, options);
  const check = validateRichDoc({ type: 'doc', content: result.nodes.length ? result.nodes : [{ type: 'paragraph' }] });
  return check.ok ? { ok: true, ...result } : { ok: false, error: check.error };
}
