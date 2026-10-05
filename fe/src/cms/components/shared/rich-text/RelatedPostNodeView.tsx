'use client';

import React, { useEffect, useState } from 'react';
import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';
import { Newspaper, Trash2 } from 'lucide-react';
import { newsApi } from '@/cms/lib/news-api';

/** Hộp "Bài liên quan" trong editor: hiển thị tiêu đề bài được chèn (đọc từ API), xoá khối bằng nút */
export default function RelatedPostNodeView({ node, deleteNode, selected, editor }: ReactNodeViewProps) {
  const postId = node.attrs.postId as string | null;
  const [title, setTitle] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!postId) return;
    let cancelled = false;
    newsApi
      .get(postId)
      .then((p) => !cancelled && setTitle(p.translations.vi?.title ?? '(chưa có tiêu đề)'))
      .catch(() => !cancelled && setMissing(true));
    return () => {
      cancelled = true;
    };
  }, [postId]);

  return (
    <NodeViewWrapper
      contentEditable={false}
      data-drag-handle
      className={`my-5 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 select-none ${selected ? 'ring-2 ring-[#7CB305]' : ''}`}
    >
      <Newspaper size={18} className="text-[#5F8A03] shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-wider text-[#5F8A03]">Bài liên quan</p>
        <p className={`text-sm font-semibold truncate ${missing ? 'text-rose-600' : 'text-slate-800'}`}>
          {missing ? 'Bài viết không còn tồn tại — khối sẽ tự ẩn trên trang' : (title ?? 'Đang tải…')}
        </p>
      </div>
      {editor.isEditable && (
        <button
          type="button"
          onClick={deleteNode}
          className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-white cursor-pointer"
          aria-label="Xoá hộp bài liên quan"
        >
          <Trash2 size={14} />
        </button>
      )}
    </NodeViewWrapper>
  );
}
