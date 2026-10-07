'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminPage, AdminPageBand, AdminPageBody } from '@/cms/components/layout/AdminPage';
import { useConfirm, useToast } from '@/cms/components/ConfirmDialog';
import Pagination from '@/cms/components/shared/Pagination';
import { fetchCurrentUser } from '@/cms/lib/api-auth';
import { newsApi } from '@/cms/lib/news-api';
import NewsListFilters from '@/cms/components/news/list/NewsListFilters';
import NewsListTable from '@/cms/components/news/list/NewsListTable';
import { CLEAR_ALL_FILTERS, activeFilterChips } from '@/cms/components/news/list/news-list-query';
import { useNewsListQuery } from '@/cms/components/news/list/useNewsListQuery';
import type { NewsCategoryCms, NewsPostListItemCms, Paginated } from '@/types/news';

type NewsTab = 'all' | 'featured';

// useSearchParams cần ranh giới Suspense (Next 16)
export default function AdminNewsListPage() {
  return (
    <Suspense fallback={null}>
      <NewsListPage />
    </Suspense>
  );
}

function NewsListPage() {
  const confirm = useConfirm();
  const showToast = useToast();
  // Kết quả gắn với khoá truy vấn: đang tải = khoá hiện tại chưa có kết quả
  const [result, setResult] = useState<{ key: string; data: Paginated<NewsPostListItemCms> } | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const [categories, setCategories] = useState<NewsCategoryCms[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const { query, setQuery, patch } = useNewsListQuery();

  const inTrash = Boolean(query.trash);
  const activeTab: NewsTab = query.featured && !inTrash ? 'featured' : 'all';

  const key = JSON.stringify([query, reloadTick]);
  useEffect(() => {
    let cancelled = false;
    newsApi
      .list(query)
      .then((data) => !cancelled && setResult({ key, data }))
      .catch((err: unknown) => {
        if (cancelled) return;
        showToast(err instanceof Error ? err.message : 'Không tải được danh sách', 'error');
        setResult((r) => (r ? { ...r, key } : r));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key đã gồm query + reloadTick
  }, [key, showToast]);
  const data = result?.data ?? null;
  const loading = result?.key !== key;
  const reload = () => setReloadTick((t) => t + 1);

  useEffect(() => {
    newsApi.categories().then(setCategories).catch(() => setCategories([]));
    fetchCurrentUser().then((u) => setIsAdmin(u?.role === 'ADMIN')).catch(() => setIsAdmin(false));
  }, []);

  const handleTabChange = (tab: NewsTab) => {
    if (tab === 'featured') {
      patch({ trash: undefined, featured: true });
    } else {
      patch({ trash: undefined, featured: undefined });
    }
  };

  const toggleTrash = () => {
    if (inTrash) {
      patch({ trash: undefined, featured: undefined });
    } else {
      // Thùng rác không có trạng thái xuất bản / lượt xem -> bỏ các bộ lọc đó
      patch({ trash: true, featured: undefined, status: undefined, locale: undefined, missing: undefined, views: undefined, viewsDays: undefined, sort: undefined });
    }
  };

  const hasActiveFilters = activeFilterChips(query, () => undefined).length > 0 || Boolean(query.sort);
  const resetAllFilters = () => patch(CLEAR_ALL_FILTERS);

  const moveToTrash = (item: NewsPostListItemCms) =>
    confirm({
      title: 'Chuyển bài viết vào thùng rác?',
      description: (
        <>
          Bài <strong>“{item.title}”</strong> sẽ bị ẩn khỏi website ngay (cả bản tiếng Việt và tiếng Anh). Bạn có thể khôi phục trong thùng rác.
        </>
      ),
      confirmText: 'Chuyển vào thùng rác',
      variant: 'warning',
      onConfirm: async () => {
        await newsApi.remove(item.id);
        reload();
      },
      successMessage: 'Đã chuyển bài viết vào thùng rác',
    });

  const restore = (item: NewsPostListItemCms) =>
    confirm({
      title: 'Khôi phục bài viết?',
      description: 'Bài trở lại danh sách với trạng thái xuất bản như trước khi xoá.',
      confirmText: 'Khôi phục',
      variant: 'info',
      onConfirm: async () => {
        await newsApi.restore(item.id);
        reload();
      },
      successMessage: 'Đã khôi phục bài viết',
    });

  const purge = (item: NewsPostListItemCms) =>
    confirm({
      title: 'Xoá vĩnh viễn bài viết?',
      description: (
        <>
          Bài <strong>“{item.title}”</strong>, mọi bản dịch và ảnh đại diện sẽ bị xoá hẳn, <strong>không thể khôi phục</strong>.
        </>
      ),
      confirmText: 'Xoá vĩnh viễn',
      variant: 'danger',
      onConfirm: async () => {
        await newsApi.purge(item.id);
        reload();
      },
      successMessage: 'Đã xoá vĩnh viễn bài viết',
    });

  return (
    <AdminPage title="Bài Viết Tin Tức" subtitle="Soạn, dịch và xuất bản bài viết tiếng Việt / tiếng Anh">
      {/* ── DẢI CÔNG CỤ (dính dưới header khi cuộn): tab · hành động · tìm kiếm & bộ lọc (trạng thái nằm trên URL) ── */}
      <AdminPageBand
        sticky
        label="Tìm kiếm và lọc bài viết"
        title={
          <div role="group" aria-label="Loại danh sách" className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-300">
            <button
              type="button"
              onClick={() => handleTabChange('all')}
              aria-pressed={!inTrash && activeTab === 'all'}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03] ${
                !inTrash && activeTab === 'all' ? 'bg-[#4E7202] text-white shadow-xs' : 'text-slate-700 hover:bg-white hover:text-slate-900'
              }`}
            >
              Tất cả bài viết
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('featured')}
              aria-pressed={!inTrash && activeTab === 'featured'}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03] ${
                !inTrash && activeTab === 'featured' ? 'bg-[#4E7202] text-white shadow-xs' : 'text-slate-700 hover:bg-white hover:text-slate-900'
              }`}
            >
              Bài nổi bật
            </button>
          </div>
        }
        actions={
          <>
            <button
              type="button"
              onClick={toggleTrash}
              className={`inline-flex items-center px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03] ${
                inTrash ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {inTrash ? 'Quay lại danh sách' : 'Thùng rác'}
            </button>
            <Link
              href="/admin/news/new"
              className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03]"
            >
              Viết bài mới
            </Link>
          </>
        }
      >
        <NewsListFilters query={query} patch={patch} categories={categories} total={data?.total ?? null} loading={loading} />
      </AdminPageBand>

      <AdminPageBody>
        {/* overflow-clip: giữ bo góc mà tiêu đề bảng vẫn dính khi cuộn */}
        <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-clip">
          <NewsListTable
            items={data?.items ?? null}
            loading={loading}
            query={query}
            isAdmin={isAdmin}
            hasActiveFilters={hasActiveFilters}
            onSort={(sort) => patch({ sort })}
            onClearFilters={resetAllFilters}
            onTrash={moveToTrash}
            onRestore={restore}
            onPurge={purge}
          />
          {data && data.total > 0 && (
            <div className="px-6 py-4 border-t border-slate-300 bg-slate-50">
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                total={data.total}
                disabled={loading}
                onChange={(page) => setQuery((cur) => ({ ...cur, page }))}
              />
            </div>
          )}
        </div>
      </AdminPageBody>
    </AdminPage>
  );
}
