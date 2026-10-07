'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { NewsListQuery } from '@/cms/lib/news-api';
import { parseNewsListQuery, serializeNewsListQuery } from './news-list-query';

/**
 * Trạng thái bộ lọc danh sách bài nằm trên URL (nguồn sự thật duy nhất):
 * tải lại trang, bấm Quay lại từ trang sửa bài, gửi link cho đồng nghiệp đều giữ bộ lọc.
 * Ghi bằng history.replaceState (Next đồng bộ useSearchParams): URL đổi NGAY nên hai lần đổi liền nhau
 * không đè mất nhau (router.replace cập nhật trễ), và không chồng thêm lịch sử trình duyệt.
 */
export function useNewsListQuery() {
  const params = useSearchParams();
  const pathname = usePathname();
  const search = params.toString();
  const query = useMemo(() => parseNewsListQuery(new URLSearchParams(search)), [search]);

  const setQuery = useCallback(
    (next: NewsListQuery | ((cur: NewsListQuery) => NewsListQuery)) => {
      const cur = parseNewsListQuery(new URLSearchParams(window.location.search));
      const value = typeof next === 'function' ? next(cur) : next;
      const qs = serializeNewsListQuery(value);
      window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname],
  );

  /** Đổi một phần bộ lọc; mặc định về trang 1 */
  const patch = useCallback((p: Partial<NewsListQuery>) => setQuery((cur) => ({ ...cur, ...p, page: p.page ?? 1 })), [setQuery]);

  return { query, setQuery, patch };
}
