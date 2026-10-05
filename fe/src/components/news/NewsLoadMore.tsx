'use client';

import React, { useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { NewsListItem, NewsListResponse } from '@remak/shared/contracts/news';
import { API_URL } from '@/lib/api';
import { NewsRow } from './NewsCards';

/**
 * "Xem thêm bài viết": trang đầu đã render sẵn ở server (SEO), các trang sau tải thêm từ API public trên trình duyệt.
 * Bài trùng với phần đã hiển thị (hero, nổi bật) được bỏ qua.
 */
export default function NewsLoadMore({
  category,
  startPage,
  totalPages,
  pageSize,
  excludeIds,
}: {
  category?: string;
  /** Trang đã render ở server */
  startPage: number;
  totalPages: number;
  pageSize: number;
  excludeIds: string[];
}) {
  const t = useTranslations('News');
  const locale = useLocale();
  const [items, setItems] = useState<NewsListItem[]>([]);
  const [page, setPage] = useState(startPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadNext = async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({ locale, page: String(page + 1), pageSize: String(pageSize) });
      if (category) params.set('category', category);
      const res = await fetch(`${API_URL}/news/public/posts?${params}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as NewsListResponse;
      const seen = new Set([...excludeIds, ...items.map((i) => i.id)]);
      setItems((cur) => [...cur, ...data.items.filter((i) => !seen.has(i.id))]);
      setPage(data.page);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {items.length > 0 && (
        <div className="divide-y divide-slate-200 pt-5 border-t border-slate-200">
          {items.map((item) => (
            <NewsRow key={item.id} item={item} readingLabel={t('readingTime', { minutes: item.readingMinutes })} readMoreLabel={t('readMore')} />
          ))}
        </div>
      )}
      {page < totalPages && (
        <div className="pt-6 border-t border-slate-200 text-center space-y-2">
          <button
            type="button"
            onClick={loadNext}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-800 text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60 group"
          >
            {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <ChevronDown size={16} className="text-slate-500 group-hover:translate-y-0.5 transition-transform" aria-hidden="true" />}
            {loading ? t('loading') : t('loadMore')}
          </button>
          {error && <p role="alert" className="text-xs text-rose-600">{t('loadError')}</p>}
        </div>
      )}
    </>
  );
}
