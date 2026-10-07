'use client';

import React from 'react';
import { X } from 'lucide-react';
import { formatNumber } from '@remak/shared/date';
import type { FilterChip } from './news-list-query';

/**
 * Dòng tóm tắt: số bài khớp (đọc cho trình đọc màn hình qua aria-live) + chip từng bộ lọc đang bật (✕ để bỏ) + "Xoá tất cả".
 * Chip nhiều thì xuống dòng, không cắt chữ.
 */
export default function FilterChips({
  chips,
  total,
  loading,
  onRemove,
  onClearAll,
}: {
  chips: FilterChip[];
  total: number | null;
  loading: boolean;
  onRemove: (chip: FilterChip) => void;
  onClearAll?: () => void;
}) {
  const summary = total === null ? 'Đang tải…' : `${formatNumber(total)} bài${chips.length ? ' khớp bộ lọc' : ''}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p aria-live="polite" aria-atomic="true" className={`mr-1 text-sm font-semibold tabular-nums ${loading ? 'text-slate-500' : 'text-slate-900'}`}>
        {summary}
      </p>
      {chips.length > 0 && (
        <ul className="flex flex-wrap items-center gap-2" aria-label="Bộ lọc đang bật">
          {chips.map((chip) => (
            <li
              key={chip.id}
              className="inline-flex h-8 max-w-full items-center gap-1 rounded-full border border-[#5F8A03]/30 bg-[#F4F9E8] pl-3 pr-1 text-xs font-medium text-[#3F5E02]"
            >
              <span className="break-words">{chip.label}</span>
              <button
                type="button"
                onClick={() => onRemove(chip)}
                aria-label={`Bỏ lọc ${chip.label}`}
                className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#4E7202] transition-colors hover:bg-[#5F8A03] hover:text-white focus-visible:outline-2 focus-visible:outline-[#5F8A03]"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="h-8 cursor-pointer rounded-lg px-2.5 text-xs font-semibold text-slate-700 underline-offset-2 transition-colors hover:bg-slate-100 hover:text-slate-900 hover:underline focus-visible:outline-2 focus-visible:outline-[#5F8A03]"
        >
          Xoá tất cả
        </button>
      )}
    </div>
  );
}
