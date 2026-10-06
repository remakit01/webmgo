'use client';

import React from 'react';
import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';
import { MessageCircleQuestion, Plus, Trash2 } from 'lucide-react';
import { FAQ_QUESTION_MAX } from '@remak/shared/rich-content';

/** Khung khối FAQ: tiêu đề + danh sách câu hỏi (faqItem) + nút thêm câu hỏi */
export function FaqNodeView({ node, editor, getPos }: ReactNodeViewProps) {
  const addItem = () => {
    const pos = getPos();
    if (typeof pos !== 'number') return;
    // Chèn câu hỏi mới vào cuối khối FAQ (trước thẻ đóng)
    editor
      .chain()
      .focus()
      .insertContentAt(pos + node.nodeSize - 1, { type: 'faqItem', attrs: { question: '' }, content: [{ type: 'paragraph' }] })
      .run();
  };

  return (
    <NodeViewWrapper className="my-6 rounded-xl border border-slate-300 bg-slate-50/60 p-4">
      <div contentEditable={false} className="flex items-center justify-between gap-2 mb-3 select-none">
        <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-slate-700">
          <MessageCircleQuestion size={15} className="text-[#5F8A03]" aria-hidden="true" /> Câu hỏi thường gặp (FAQ)
        </p>
        {editor.isEditable && (
          <button type="button" onClick={addItem} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-300 bg-white text-[11px] font-semibold text-slate-700 hover:text-[#5F8A03] cursor-pointer">
            <Plus size={12} aria-hidden="true" /> Thêm câu hỏi
          </button>
        )}
      </div>
      <NodeViewContent className="space-y-3" />
      <p contentEditable={false} className="mt-3 text-[11px] text-slate-500 select-none">
        Mỗi câu trả lời 40–80 từ, trả lời thẳng. Khối này tạo dữ liệu FAQPage cho Google và các trợ lý AI.
      </p>
    </NodeViewWrapper>
  );
}

/** Một cặp hỏi–đáp: câu hỏi là ô nhập (attr), câu trả lời soạn như nội dung thường */
export function FaqItemNodeView({ node, updateAttributes, deleteNode, editor }: ReactNodeViewProps) {
  const question = (node.attrs.question as string) ?? '';
  return (
    <NodeViewWrapper className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
      <div contentEditable={false} className="flex items-center gap-2 mb-1.5">
        <span className="text-[11px] font-black text-[#5F8A03] shrink-0">Hỏi</span>
        <input
          value={question}
          readOnly={!editor.isEditable}
          maxLength={FAQ_QUESTION_MAX}
          onChange={(e) => updateAttributes({ question: e.target.value })}
          placeholder="Câu hỏi người đọc hay tìm, vd: Tấm MGO dày bao nhiêu là đủ cho ống gió EI 60?"
          aria-label="Câu hỏi FAQ"
          aria-invalid={!question.trim()}
          className="flex-1 min-w-0 text-sm font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-[#5F8A03] focus:outline-none py-0.5 aria-[invalid=true]:border-rose-300"
        />
        {editor.isEditable && (
          <button type="button" onClick={deleteNode} aria-label="Xoá câu hỏi" className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer">
            <Trash2 size={13} />
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <span contentEditable={false} className="text-[11px] font-black text-slate-400 shrink-0 select-none pt-1">Đáp</span>
        <NodeViewContent className="flex-1 min-w-0 text-sm [&_p]:my-1" />
      </div>
    </NodeViewWrapper>
  );
}
