import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Phân trang gọn: « Trước | Trang x/y (tổng N) | Sau » — dùng chung cho mọi danh sách CMS */
export default function Pagination({
  page,
  totalPages,
  total,
  onChange,
  disabled,
}: {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}) {
  const btn =
    'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors';
  return (
    <nav aria-label="Phân trang" className="flex items-center justify-between gap-3 flex-wrap text-xs text-slate-600">
      <span>
        Tổng <strong className="text-slate-900">{total}</strong> mục
      </span>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} onClick={() => onChange(page - 1)} disabled={disabled || page <= 1}>
          <ChevronLeft size={14} aria-hidden="true" /> Trước
        </button>
        <span className="font-semibold text-slate-800 tabular-nums" aria-current="page">
          Trang {page}/{totalPages}
        </span>
        <button type="button" className={btn} onClick={() => onChange(page + 1)} disabled={disabled || page >= totalPages}>
          Sau <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
