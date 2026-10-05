// Tách nội dung rich text thành các đoạn để dịch máy (Gemini), rồi ghép bản dịch lại đúng cấu trúc.
// - Mỗi KHỐI chữ (đoạn văn, tiêu đề — kể cả trong danh sách, trích dẫn, ô bảng, hộp lưu ý) là một đoạn, để câu không bị cắt.
// - Định dạng trong câu chuyển thành thẻ giữ chỗ: <b> <i> <u> <s> <code> <a1>…</a1> <br/>; ảnh, bảng, video, link giữ nguyên.
// - Alt và chú thích ảnh cũng được dịch.
// Bản dịch trả thẻ sai (thiếu/thừa/lệch) -> khối đó dùng chữ thuần (bỏ định dạng), không làm hỏng tài liệu.

import type { RichDoc, RichMark, RichMarkType, RichNode } from './rich-content.js';

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

const TEXT_BLOCKS = new Set(['paragraph', 'heading']);

const escapeText = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const unescapeText = (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

/** Chuỗi có thẻ giữ chỗ cho nội dung inline của một khối; links[i] = attrs link của thẻ <a{i+1}> */
function serializeInline(nodes: RichNode[]): { text: string; links: RichMark['attrs'][] } {
  const links: RichMark['attrs'][] = [];
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
    out += tags.map((t) => `<${t}>`).join('') + escapeText(node.text) + [...tags].reverse().map((t) => `</${t}>`).join('');
  }
  return { text: out, links };
}

/** Dựng lại nội dung inline từ chuỗi đã dịch; thẻ không hợp lệ -> null */
function parseInline(text: string, links: RichMark['attrs'][]): RichNode[] | null {
  const tokens = text.match(/<\/?[a-z0-9]+\s*\/?>|[^<]+|</gi) ?? [];
  const stack: string[] = [];
  const nodes: RichNode[] = [];
  for (const token of tokens) {
    const tag = /^<(\/?)([a-z0-9]+)\s*(\/?)>$/i.exec(token);
    if (!tag) {
      const value = unescapeText(token);
      if (!value) continue;
      const marks: RichMark[] = stack.map((t) =>
        t.startsWith('a') && t !== 'a' ? { type: 'link', attrs: links[Number(t.slice(1)) - 1] } : { type: TAG_MARKS[t] },
      );
      nodes.push(marks.length ? { type: 'text', text: value, marks } : { type: 'text', text: value });
      continue;
    }
    const [, closing, name, selfClosing] = tag;
    const lower = name.toLowerCase();
    if (lower === 'br') {
      nodes.push({ type: 'hardBreak' });
      continue;
    }
    const isLink = /^a\d+$/.test(lower) && links[Number(lower.slice(1)) - 1] !== undefined;
    if (!isLink && !TAG_MARKS[lower]) return null;
    if (selfClosing) return null;
    if (closing) {
      if (stack.pop() !== lower) return null;
    } else {
      stack.push(lower);
    }
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

const plainFallback = (text: string): RichNode[] => {
  const plain = unescapeText(text.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '')).trim();
  return plain ? [{ type: 'text', text: plain }] : [];
};

/** Duyệt tài liệu theo đúng một thứ tự cố định để khoá đoạn khi tách và khi ghép khớp nhau */
function walk(doc: RichDoc, visit: (node: RichNode, key: { block: string; alt: string; caption: string }) => void) {
  let block = 0;
  let image = 0;
  const go = (node: RichNode) => {
    if (TEXT_BLOCKS.has(node.type)) {
      visit(node, { block: `t${block++}`, alt: '', caption: '' });
      return;
    }
    if (node.type === 'image') {
      const n = image++;
      visit(node, { block: '', alt: `alt${n}`, caption: `cap${n}` });
      return;
    }
    (node.content ?? []).forEach(go);
  };
  doc.content.forEach(go);
}

/** { khoá: chuỗi cần dịch } — khối rỗng không có khoá */
export function collectSegments(doc: RichDoc): Record<string, string> {
  const segments: Record<string, string> = {};
  walk(doc, (node, key) => {
    if (key.block) {
      const { text } = serializeInline(node.content ?? []);
      if (text.replace(/<[^>]*>/g, '').trim()) segments[key.block] = text;
      return;
    }
    const alt = node.attrs?.alt;
    const caption = node.attrs?.caption;
    if (typeof alt === 'string' && alt.trim()) segments[key.alt] = alt;
    if (typeof caption === 'string' && caption.trim()) segments[key.caption] = caption;
  });
  return segments;
}

/** Tài liệu mới với các đoạn đã dịch (đoạn thiếu bản dịch giữ nguyên bản gốc). Không sửa `doc` truyền vào. */
export function applySegments(doc: RichDoc, translated: Record<string, string>): { doc: RichDoc; fallbackBlocks: string[] } {
  const copy = JSON.parse(JSON.stringify(doc)) as RichDoc; // tài liệu là JSON thuần
  const fallbackBlocks: string[] = [];
  walk(copy, (node, key) => {
    if (key.block) {
      const t = translated[key.block];
      if (t === undefined) return;
      const { links } = serializeInline(node.content ?? []);
      const parsed = parseInline(t, links);
      if (!parsed) fallbackBlocks.push(key.block);
      node.content = parsed ?? plainFallback(t);
      if (!node.content.length) delete node.content;
      return;
    }
    if (translated[key.alt] !== undefined) node.attrs = { ...node.attrs, alt: translated[key.alt] };
    if (translated[key.caption] !== undefined) node.attrs = { ...node.attrs, caption: translated[key.caption] };
  });
  return { doc: copy, fallbackBlocks };
}
