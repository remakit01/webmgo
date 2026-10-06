// Tách nội dung rich text thành các đoạn để dịch máy (Gemini), rồi ghép bản dịch lại đúng cấu trúc.
// - Mỗi KHỐI chữ (đoạn văn, tiêu đề — kể cả trong danh sách, trích dẫn, ô bảng, hộp lưu ý, FAQ) là một đoạn, để câu không bị cắt.
// - Định dạng trong câu chuyển thành thẻ giữ chỗ (xem rich-inline): <b> <i> <u> <s> <code> <a1>…</a1> <br/>;
//   ảnh, bảng, video, link giữ nguyên.
// - Alt / chú thích ảnh và câu hỏi FAQ cũng được dịch.
// Bản dịch trả thẻ sai (thiếu/thừa/lệch) -> khối đó dùng chữ thuần (bỏ định dạng), không làm hỏng tài liệu.

import type { RichDoc, RichNode } from './rich-content.js';
import { parseInline, plainInline, serializeInline } from './rich-inline.js';

const TEXT_BLOCKS = new Set(['paragraph', 'heading']);

type SegmentKey = { block?: string; alt?: string; caption?: string; question?: string };

/** Duyệt tài liệu theo đúng một thứ tự cố định để khoá đoạn khi tách và khi ghép khớp nhau */
function walk(doc: RichDoc, visit: (node: RichNode, key: SegmentKey) => void) {
  let block = 0;
  let image = 0;
  let faq = 0;
  const go = (node: RichNode) => {
    if (TEXT_BLOCKS.has(node.type)) {
      visit(node, { block: `t${block++}` });
      return;
    }
    if (node.type === 'image') {
      const n = image++;
      visit(node, { alt: `alt${n}`, caption: `cap${n}` });
      return;
    }
    if (node.type === 'faqItem') visit(node, { question: `q${faq++}` });
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
    const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v : null);
    if (key.alt && str(node.attrs?.alt)) segments[key.alt] = node.attrs!.alt as string;
    if (key.caption && str(node.attrs?.caption)) segments[key.caption] = node.attrs!.caption as string;
    if (key.question && str(node.attrs?.question)) segments[key.question] = node.attrs!.question as string;
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
      const parsed = parseInline(t, { links });
      if (!parsed) fallbackBlocks.push(key.block);
      node.content = parsed ?? plainInline(t);
      if (!node.content.length) delete node.content;
      return;
    }
    for (const [attr, k] of [
      ['alt', key.alt],
      ['caption', key.caption],
      ['question', key.question],
    ] as const) {
      if (k && translated[k] !== undefined) node.attrs = { ...node.attrs, [attr]: translated[k] };
    }
  });
  return { doc: copy, fallbackBlocks };
}
