'use client';

import React, { useId } from 'react';
import AiBadge from './AiBadge';
import { inputClass } from './form-styles';

const TITLE_IDEAL = 60;
const DESC_IDEAL = 160;

function Counter({ length, ideal, max }: { length: number; ideal: number; max: number }) {
  const color = length === 0 ? 'text-slate-400' : length > max ? 'text-rose-600' : length > ideal ? 'text-amber-600' : 'text-[#4E7202]';
  return (
    <span className={`text-[11px] font-semibold tabular-nums ${color}`}>
      {length}/{ideal}
    </span>
  );
}

/**
 * Khung SEO dùng chung: tiêu đề + mô tả meta (đếm ký tự theo ngưỡng Google), xem trước kết quả tìm kiếm, noindex.
 * Bỏ trống = dùng tiêu đề / sapo của nội dung (fallback hiển thị mờ trong ô).
 */
export default function SeoPanel({
  url,
  seoTitle,
  seoDescription,
  fallbackTitle,
  fallbackDescription,
  noindex,
  onChange,
  titleMax = 120,
  descriptionMax = 320,
  aiFilled,
}: {
  url: string;
  seoTitle: string;
  seoDescription: string;
  fallbackTitle: string;
  fallbackDescription: string;
  /** Bỏ trống = không có lựa chọn noindex (vd chuyên mục) */
  noindex?: boolean;
  onChange: (patch: { seoTitle?: string; seoDescription?: string; noindex?: boolean }) => void;
  titleMax?: number;
  descriptionMax?: number;
  /** Ô do AI điền, người dùng chưa sửa -> hiện nhãn "AI" */
  aiFilled?: { seoTitle?: boolean; seoDescription?: boolean };
}) {
  const titleId = useId();
  const descId = useId();
  const shownTitle = seoTitle || fallbackTitle || 'Tiêu đề bài viết';
  const shownDesc = seoDescription || fallbackDescription || 'Mô tả ngắn sẽ hiển thị dưới tiêu đề trên Google.';

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor={titleId} className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            Tiêu đề SEO {aiFilled?.seoTitle && <AiBadge />}
          </label>
          <Counter length={(seoTitle || fallbackTitle).length} ideal={TITLE_IDEAL} max={titleMax} />
        </div>
        <input
          id={titleId}
          value={seoTitle}
          maxLength={titleMax}
          placeholder={fallbackTitle || 'Bỏ trống = dùng tiêu đề bài'}
          onChange={(e) => onChange({ seoTitle: e.target.value })}
          className={inputClass}
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor={descId} className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            Mô tả SEO (meta description) {aiFilled?.seoDescription && <AiBadge />}
          </label>
          <Counter length={(seoDescription || fallbackDescription).length} ideal={DESC_IDEAL} max={descriptionMax} />
        </div>
        <textarea
          id={descId}
          rows={3}
          value={seoDescription}
          maxLength={descriptionMax}
          placeholder={fallbackDescription || 'Bỏ trống = dùng sapo'}
          onChange={(e) => onChange({ seoDescription: e.target.value })}
          className={`${inputClass} leading-relaxed`}
        />
      </div>

      {/* Xem trước kết quả Google */}
      <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-0.5" aria-label="Xem trước kết quả tìm kiếm Google">
        <p className="text-[11px] text-slate-500 truncate">{url}</p>
        <p className="text-[15px] leading-snug text-[#1a0dab] line-clamp-1">{shownTitle}</p>
        <p className="text-xs leading-relaxed text-slate-600 line-clamp-2">{shownDesc}</p>
      </div>

      {noindex !== undefined && (
        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={noindex}
            onChange={(e) => onChange({ noindex: e.target.checked })}
            className="accent-[#5F8A03]"
          />
          Ẩn khỏi Google (noindex)
        </label>
      )}
    </div>
  );
}
