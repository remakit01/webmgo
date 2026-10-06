// Chuyển nội dung inline của một khối RichDoc <-> chuỗi có thẻ giữ chỗ cho LLM:
//   <b> <i> <u> <s> <code> <sub> <sup> <br/> và link.
// Link có 2 chế độ:
// - Đánh số <a1>…</a1> (dịch máy): attrs link lấy lại từ bản gốc theo số, AI không thể đổi href.
// - <a href="…">…</a> (AI viết bài): chỉ giữ href nằm trong whitelist; href lạ -> bỏ link, giữ chữ.
// Chuỗi trả về có thẻ sai (thiếu/thừa/lệch/lạ) -> parseInline trả null để caller dùng chữ thuần.

import type { RichMark, RichMarkType, RichNode } from './rich-content.js';

const MARK_TAGS: Partial<Record<RichMarkType, string>> = {
  bold: 'b',
  italic: 'i',
  underline: 'u',
  strike: 's',
  code: 'code',
  subscript: 'sub',
  superscript: 'sup',
};
const TAG_MARKS = Object.fromEntries(Object.entries(MARK_TAGS).map(([m, t]) => [t, m])) as Record<string, RichMarkType>;

export const escapeInlineText = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const unescapeInlineText = (s: string) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

export type LinkAttrs = RichMark['attrs'];

/** Chuỗi có thẻ giữ chỗ cho nội dung inline; links[i] = attrs của thẻ <a{i+1}> */
export function serializeInline(nodes: RichNode[]): { text: string; links: LinkAttrs[] } {
  const links: LinkAttrs[] = [];
  const linkIndex = new Map<string, number>();
  let out = '';
  for (const node of nodes) {
    if (node.type === 'hardBreak') {
      out += '<br/>';
      continue;
    }
    if (node.type !== 'text' || !node.text) continue;
    const tags: string[] = [];
    for (const mark of node.marks ?? []) {
      if (mark.type === 'link') {
        const key = JSON.stringify(mark.attrs ?? {});
        if (!linkIndex.has(key)) {
          links.push(mark.attrs);
          linkIndex.set(key, links.length);
        }
        tags.push(`a${linkIndex.get(key)}`);
      } else if (MARK_TAGS[mark.type]) {
        tags.push(MARK_TAGS[mark.type]!);
      }
    }
    out += tags.map((t) => `<${t}>`).join('') + escapeInlineText(node.text) + [...tags].reverse().map((t) => `</${t}>`).join('');
  }
  return { text: out, links };
}

export interface ParseInlineOptions {
  /** Chế độ đánh số <aN>: attrs link theo thứ tự */
  links?: LinkAttrs[];
  /** Chế độ <a href="...">: href được phép (ngoài danh sách -> bỏ link, giữ chữ) */
  allowHref?: (href: string) => boolean;
}

type Frame = { tag: string; mark: RichMark | null };

/** Dựng lại nội dung inline từ chuỗi có thẻ; thẻ không hợp lệ -> null */
export function parseInline(text: string, options: ParseInlineOptions = {}): RichNode[] | null {
  const links = options.links ?? [];
  const tokens = text.match(/<\/?[a-z0-9]+(?:\s+href\s*=\s*"[^"]*")?\s*\/?>|[^<]+|</gi) ?? [];
  const stack: Frame[] = [];
  const nodes: RichNode[] = [];
  for (const token of tokens) {
    const tag = /^<(\/?)([a-z0-9]+)(?:\s+href\s*=\s*"([^"]*)")?\s*(\/?)>$/i.exec(token);
    if (!tag) {
      const value = unescapeInlineText(token);
      if (!value) continue;
      const marks = stack.flatMap((f) => (f.mark ? [f.mark] : []));
      nodes.push(marks.length ? { type: 'text', text: value, marks } : { type: 'text', text: value });
      continue;
    }
    const [, closing, name, href, selfClosing] = tag;
    const lower = name.toLowerCase();
    if (lower === 'br') {
      nodes.push({ type: 'hardBreak' });
      continue;
    }
    if (selfClosing) return null;
    if (closing) {
      if (stack.pop()?.tag !== lower) return null;
      continue;
    }

    let mark: RichMark | null;
    if (lower === 'a') {
      if (href === undefined || !options.allowHref) return null;
      const target = unescapeInlineText(href).trim();
      mark = options.allowHref(target) ? { type: 'link', attrs: { href: target } } : null;
    } else if (/^a\d+$/.test(lower)) {
      const attrs = links[Number(lower.slice(1)) - 1];
      if (attrs === undefined) return null;
      mark = { type: 'link', attrs };
    } else if (TAG_MARKS[lower]) {
      if (href !== undefined) return null;
      mark = { type: TAG_MARKS[lower] };
    } else {
      return null;
    }
    stack.push({ tag: lower, mark });
  }
  return stack.length ? null : mergeAdjacent(nodes);
}

/** Gộp các text node liền nhau có cùng định dạng (do thẻ lặp như <b>a</b><b>b</b>) */
function mergeAdjacent(nodes: RichNode[]): RichNode[] {
  const out: RichNode[] = [];
  for (const node of nodes) {
    const prev = out[out.length - 1];
    if (prev && prev.type === 'text' && node.type === 'text' && JSON.stringify(prev.marks ?? []) === JSON.stringify(node.marks ?? [])) {
      prev.text = (prev.text ?? '') + (node.text ?? '');
    } else {
      out.push({ ...node });
    }
  }
  return out;
}

/** Bỏ mọi thẻ, giữ chữ (dự phòng khi thẻ hỏng) */
export function plainInline(text: string): RichNode[] {
  const plain = unescapeInlineText(text.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '')).trim();
  return plain ? [{ type: 'text', text: plain }] : [];
}
