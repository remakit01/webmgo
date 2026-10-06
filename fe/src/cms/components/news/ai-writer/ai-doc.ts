// Hàm thuần cho trợ lý "Viết cùng AI": ghép các phần AI gửi về thành một bài, gỡ link AI chèn.

import { EMPTY_RICH_DOC, toPlainText, type RichDoc, type RichNode } from '@remak/shared/rich-content';

/** Các phần bài do AI viết, giữ theo vị trí trong dàn ý (mục nào xong trước vẫn đứng đúng chỗ) */
export interface AiDocSlots {
  summary?: RichNode[];
  sections: (RichNode[] | undefined)[];
  faq?: RichNode[];
  references?: RichNode[];
}

export const emptySlots = (total: number): AiDocSlots => ({ sections: Array.from({ length: total }, () => undefined) });

/** Ghép: tóm tắt -> các mục theo thứ tự dàn ý -> FAQ -> tài liệu tham khảo */
export function assembleAiDoc(slots: AiDocSlots): RichDoc {
  const content = [
    ...(slots.summary ?? []),
    ...slots.sections.flatMap((s) => s ?? []),
    ...(slots.faq ?? []),
    ...(slots.references ?? []),
  ];
  return content.length ? { type: 'doc', content } : EMPTY_RICH_DOC;
}

/** Bài đã có chữ (để hỏi trước khi AI ghi đè) */
export const docHasText = (doc: RichDoc) => toPlainText(doc).trim().length > 0;

/** Gỡ mọi link trỏ tới href (giữ nguyên chữ) */
export function removeLink(doc: RichDoc, href: string): RichDoc {
  const visit = (node: RichNode): RichNode => {
    const marks = node.marks?.filter((m) => !(m.type === 'link' && m.attrs?.href === href));
    const next: RichNode = { ...node };
    if (node.marks) {
      if (marks?.length) next.marks = marks;
      else delete next.marks;
    }
    if (node.content) next.content = node.content.map(visit);
    return next;
  };
  return { type: 'doc', content: doc.content.map(visit) };
}

/** Bài còn chứa link tới href không */
export function hasLink(doc: RichDoc, href: string): boolean {
  const visit = (node: RichNode): boolean =>
    !!node.marks?.some((m) => m.type === 'link' && m.attrs?.href === href) || !!node.content?.some(visit);
  return doc.content.some(visit);
}
