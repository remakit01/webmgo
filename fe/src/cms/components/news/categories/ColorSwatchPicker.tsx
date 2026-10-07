'use client';

import React, { useRef } from 'react';
import { Check } from 'lucide-react';
import { CATEGORY_COLOR_STYLES } from '@/lib/news-category-colors';
import { NEWS_CATEGORY_COLORS, type NewsCategoryColor } from '@/types/news';

/**
 * Chọn màu nhãn chuyên mục: nhóm ô màu chuẩn WAI-ARIA radiogroup
 * (Tab vào nhóm, ← → ↑ ↓ đổi màu, focus đi theo ô đang chọn). Mỗi ô có tên màu (không dựa vào màu để nhận biết).
 */
export default function ColorSwatchPicker({
  value,
  onChange,
  labelledBy,
}: {
  value: NewsCategoryColor;
  onChange: (color: NewsCategoryColor) => void;
  labelledBy: string;
}) {
  const refs = useRef<Partial<Record<NewsCategoryColor, HTMLButtonElement | null>>>({});

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const i = NEWS_CATEGORY_COLORS.indexOf(value);
    const next = NEWS_CATEGORY_COLORS[(i + step + NEWS_CATEGORY_COLORS.length) % NEWS_CATEGORY_COLORS.length];
    onChange(next);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} onKeyDown={onKeyDown} className="flex flex-wrap gap-2">
      {NEWS_CATEGORY_COLORS.map((c) => {
        const selected = c === value;
        return (
          <button
            key={c}
            ref={(el) => {
              refs.current[c] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(c)}
            className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#5F8A03] ${
              CATEGORY_COLOR_STYLES[c].chip
            } ${selected ? 'ring-2 ring-[#4E7202] ring-offset-1' : 'opacity-80 hover:opacity-100'}`}
          >
            {selected && <Check size={14} aria-hidden="true" />}
            {CATEGORY_COLOR_STYLES[c].label}
          </button>
        );
      })}
    </div>
  );
}
