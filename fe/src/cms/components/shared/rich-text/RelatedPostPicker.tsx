'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import type { NewsPostListItemCms } from '@/types/news';
import { newsApi } from '@/cms/lib/news-api';
import StatusBadge from '../StatusBadge';

/** Hộp thoại tìm & chọn bài viết để chèn khối "Bài liên quan" */
export default function RelatedPostPicker({
  open,
  excludeId,
  onPick,
  onClose,
}: {
  open: boolean;
  excludeId?: string;
  onPick: (postId: string) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState('');
  const [items, setItems] = useState<NewsPostListItemCms[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      setLoading(true);
      newsApi
        .list({ q, pageSize: 20 })
        .then((r) => setItems(r.items.filter((i) => i.id !== excludeId)))
        .catch(() => setItems([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q, open, excludeId]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby="related-picker-title"
      className="w-[min(640px,calc(100vw-32px))] rounded-xl border border-slate-300 p-0 shadow-2xl backdrop:bg-slate-900/40 m-auto"
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
        <h2 id="related-picker-title" className="text-sm font-bold text-slate-900">Chèn bài liên quan</h2>
        <button type="button" onClick={onClose} aria-label="Đóng" className="p-1 rounded text-slate-500 hover:bg-slate-100 cursor-pointer">
          <X size={16} />
        </button>
      </div>
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tiêu đề bài viết…"
            aria-label="Tìm bài viết"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100" aria-busy={loading}>
          {loading && (
            <li className="py-6 flex justify-center text-slate-400">
              <Loader2 className="animate-spin" size={18} aria-label="Đang tìm" />
            </li>
          )}
          {!loading && items.length === 0 && <li className="py-6 text-center text-xs text-slate-500">Không có bài phù hợp</li>}
          {!loading &&
            items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onPick(item.id)}
                  className="w-full text-left px-2 py-2.5 rounded-md hover:bg-[#F4F9E8] flex items-center gap-3 cursor-pointer"
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-semibold text-slate-800 truncate">{item.title}</span>
                    <span className="block text-[11px] text-slate-500">{item.categoryName}</span>
                  </span>
                  <StatusBadge prefix="VI" status={item.locales.vi?.status ?? null} />
                </button>
              </li>
            ))}
        </ul>
        <p className="text-[11px] text-slate-500">
          Hộp chỉ hiện trên trang khi bài được chọn đã xuất bản ở cùng ngôn ngữ; tiêu đề và đường dẫn tự lấy theo ngôn ngữ người đọc.
        </p>
      </div>
    </dialog>
  );
}
