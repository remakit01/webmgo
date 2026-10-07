'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { NEWS_LIST_VIEW_DAYS, NEWS_LIST_VIEW_FILTERS, type NewsListSort } from '@remak/shared/contracts/news';
import { PUBLISH_STATUSES, PUBLISH_STATUS_LABELS, type PublishStatus } from '@remak/shared/publishing';
import DateRangeField from '@/cms/components/shared/date/DateRangeField';
import type { NewsListQuery } from '@/cms/lib/news-api';
import type { NewsCategoryCms } from '@/types/news';
import FilterChips from './FilterChips';
import { CLEAR_ALL_FILTERS, VIEWS_FILTER_LABEL, activeFilterChips } from './news-list-query';

const SORT_LABEL: Record<NewsListSort, string> = {
  updated: 'Mới cập nhật',
  views_desc: 'Xem nhiều nhất',
  views_asc: 'Xem ít nhất',
};

const fieldLabel = 'mb-1 block text-xs font-semibold text-slate-700';
const selectClass =
  'h-10 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 transition-colors focus:border-[#5F8A03] focus:outline-none focus:ring-2 focus:ring-[#5F8A03]/40';

/**
 * Thanh bộ lọc danh sách bài — nội dung của dải công cụ dính (AdminPageBand sticky), chỉ cho desktop:
 * - Hàng chính: Tìm kiếm · Sắp xếp · nút "Bộ lọc (N)".
 * - Khung bộ lọc: nằm trong dải, mở thì đẩy bảng bài viết xuống dưới. Đóng bằng nút "Bộ lọc", Esc hoặc bấm ra ngoài.
 * - Dòng tóm tắt: số bài + chip bộ lọc đang bật (luôn thấy dù khung đóng).
 */
export default function NewsListFilters({
  query,
  patch,
  categories,
  total,
  loading,
}: {
  query: NewsListQuery;
  patch: (p: Partial<NewsListQuery>) => void;
  categories: NewsCategoryCms[];
  total: number | null;
  loading: boolean;
}) {
  const ids = useId();
  const inTrash = Boolean(query.trash);

  // Ô tìm: gõ xong 400ms mới đưa lên URL; URL đổi từ ngoài (chip ✕, Xoá tất cả) -> cập nhật ô
  const [q, setQ] = useState(query.q ?? '');
  const [urlQ, setUrlQ] = useState(query.q);
  if (urlQ !== query.q) {
    setUrlQ(query.q);
    setQ(query.q ?? '');
  }
  useEffect(() => {
    const t = setTimeout(() => {
      const v = q.trim() || undefined;
      if (v !== query.q) patch({ q: v });
    }, 400);
    return () => clearTimeout(t);
  }, [q, query.q, patch]);

  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  // Bấm ra ngoài khung (trừ nút mở) -> đóng
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !buttonRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.translations.vi?.name;
  const chips = activeFilterChips(query, categoryName);
  const panelCount = chips.filter((c) => c.id !== 'q').length;
  const sort = query.sort ?? 'updated';

  return (
    <div>
      {/* Hàng chính */}
      <div className="flex items-end gap-3 px-6 py-4">
        <div className="min-w-0 flex-1">
          <label htmlFor={`${ids}-q`} className={fieldLabel}>
            Tìm kiếm
          </label>
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              id={`${ids}-q`}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tiêu đề bài viết…"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[#5F8A03] focus:outline-none focus:ring-2 focus:ring-[#5F8A03]/40 [&::-webkit-search-cancel-button]:hidden"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                aria-label="Xoá từ khoá"
                className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-[#5F8A03]"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-end gap-3">
          {!inTrash && (
            <div className="w-56 shrink-0">
              <label htmlFor={`${ids}-sort`} className={fieldLabel}>
                Sắp xếp
              </label>
              <select
                id={`${ids}-sort`}
                value={sort}
                onChange={(e) => patch({ sort: e.target.value === 'updated' ? undefined : (e.target.value as NewsListSort) })}
                className={selectClass}
              >
                {(Object.keys(SORT_LABEL) as NewsListSort[]).map((s) => (
                  <option key={s} value={s}>
                    {SORT_LABEL[s]}
                    {s !== 'updated' && query.viewsDays ? ` (${query.viewsDays} ngày)` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            type="button"
            ref={buttonRef}
            onClick={() => setOpen(!open)}
            onKeyDown={(e) => e.key === 'Escape' && open && close(false)}
            aria-expanded={open}
            aria-controls={`${ids}-panel`}
            className={`inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03] ${
              panelCount ? 'border-[#5F8A03] bg-[#F4F9E8] text-[#3F5E02]' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            Bộ lọc
            {panelCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#5F8A03] px-1.5 text-xs font-bold text-white">
                <span className="sr-only">đang bật </span>
                {panelCount}
              </span>
            )}
            <ChevronDown size={16} aria-hidden="true" className={`transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Khung bộ lọc */}
      <div
        ref={panelRef}
        id={`${ids}-panel`}
        role="region"
        aria-label="Bộ lọc"
        hidden={!open}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && !e.defaultPrevented) {
            e.stopPropagation();
            close(true);
          }
        }}
        className="border-t border-slate-200 bg-slate-50/60 px-6 py-5"
      >
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label htmlFor={`${ids}-cat`} className={fieldLabel}>
              Chuyên mục
            </label>
            <select id={`${ids}-cat`} value={query.categoryId ?? ''} onChange={(e) => patch({ categoryId: e.target.value || undefined })} className={selectClass}>
              <option value="">Tất cả chuyên mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.translations.vi?.name}
                </option>
              ))}
            </select>
          </div>

          {!inTrash && (
            <>
              <div>
                <label htmlFor={`${ids}-status`} className={fieldLabel}>
                  Trạng thái xuất bản
                </label>
                <select
                  id={`${ids}-status`}
                  value={query.status ? `${query.locale ?? 'vi'}:${query.status}` : ''}
                  onChange={(e) => {
                    const [locale, status] = e.target.value.split(':') as ['vi' | 'en', PublishStatus];
                    patch(e.target.value ? { locale, status } : { locale: undefined, status: undefined });
                  }}
                  className={selectClass}
                >
                  <option value="">Mọi trạng thái</option>
                  {(['vi', 'en'] as const).map((loc) => (
                    <optgroup key={loc} label={loc === 'vi' ? 'Bản tiếng Việt' : 'Bản tiếng Anh'}>
                      {PUBLISH_STATUSES.map((s) => (
                        <option key={s} value={`${loc}:${s}`}>
                          {loc.toUpperCase()} · {PUBLISH_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <span className={fieldLabel} id={`${ids}-tr`}>
                  Bản dịch
                </span>
                <label className="flex h-10 cursor-pointer items-center gap-2.5 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 transition-colors hover:bg-slate-50 focus-within:ring-2 focus-within:ring-[#5F8A03]/40">
                  <input
                    type="checkbox"
                    aria-describedby={`${ids}-tr`}
                    className="h-4 w-4 cursor-pointer accent-[#5F8A03]"
                    checked={query.missing === 'en'}
                    onChange={(e) => patch({ missing: e.target.checked ? 'en' : undefined })}
                  />
                  Chỉ bài chưa dịch tiếng Anh
                </label>
              </div>
            </>
          )}

          <div>
            <label htmlFor={`${ids}-days`} className={fieldLabel}>
              Lượt xem tính trong
            </label>
            <select
              id={`${ids}-days`}
              value={query.viewsDays ?? ''}
              onChange={(e) => patch({ viewsDays: e.target.value ? (Number(e.target.value) as (typeof NEWS_LIST_VIEW_DAYS)[number]) : undefined })}
              className={selectClass}
            >
              <option value="">Mọi thời gian</option>
              {NEWS_LIST_VIEW_DAYS.map((d) => (
                <option key={d} value={d}>
                  {d} ngày qua
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <DateRangeField
              label="Ngày cập nhật"
              from={query.fromDate}
              to={query.toDate}
              onChange={({ from, to }) => patch({ fromDate: from, toDate: to })}
            />
          </div>

          <div>
            <label htmlFor={`${ids}-views`} className={fieldLabel}>
              Lượt xem
            </label>
            <select
              id={`${ids}-views`}
              value={query.views ?? ''}
              onChange={(e) => patch({ views: (e.target.value || undefined) as NewsListQuery['views'] })}
              aria-describedby={`${ids}-views-hint`}
              className={selectClass}
            >
              <option value="">Mọi bài</option>
              {NEWS_LIST_VIEW_FILTERS.map((v) => (
                <option key={v} value={v}>
                  {VIEWS_FILTER_LABEL[v]}
                </option>
              ))}
            </select>
            <p id={`${ids}-views-hint`} className="mt-1 text-xs text-slate-600">
              {query.viewsDays ? `Tính trong ${query.viewsDays} ngày qua` : 'Tính từ trước tới nay'}
            </p>
          </div>
        </div>
      </div>

      {/* Tóm tắt + chip */}
      <div className="border-t border-slate-200 px-6 py-3">
        <FilterChips
          chips={chips}
          total={total}
          loading={loading}
          onRemove={(chip) => patch(chip.clear)}
          onClearAll={chips.length > 0 || query.sort ? () => patch(CLEAR_ALL_FILTERS) : undefined}
        />
      </div>
    </div>
  );
}
