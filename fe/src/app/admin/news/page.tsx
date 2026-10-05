'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, FilePlus2, Pencil, RotateCcw, Search, Star, Trash2, X } from 'lucide-react';
import { formatDate } from '@remak/shared/locale';
import { PUBLISH_STATUSES, PUBLISH_STATUS_LABELS, type PublishStatus } from '@remak/shared/publishing';
import AdminHeader from '@/cms/components/AdminHeader';
import { useConfirm, useToast } from '@/cms/components/ConfirmDialog';
import Pagination from '@/cms/components/shared/Pagination';
import StatusBadge from '@/cms/components/shared/StatusBadge';
import Skeleton from '@/cms/components/ui/Skeleton';
import { fetchCurrentUser } from '@/cms/lib/api-auth';
import { newsApi, type NewsListQuery } from '@/cms/lib/news-api';
import type { NewsCategoryCms, NewsPostListItemCms, Paginated } from '@/types/news';

const PAGE_SIZE = 20;
const selectClass =
  'px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#5F8A03] cursor-pointer';

export default function AdminNewsListPage() {
  const confirm = useConfirm();
  const showToast = useToast();
  // Kết quả gắn với khoá truy vấn: đang tải = khoá hiện tại chưa có kết quả (không setState đồng bộ trong effect)
  const [result, setResult] = useState<{ key: string; data: Paginated<NewsPostListItemCms> } | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const [categories, setCategories] = useState<NewsCategoryCms[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [q, setQ] = useState('');
  const [query, setQuery] = useState<NewsListQuery>({ page: 1, pageSize: PAGE_SIZE });

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

  // Tìm kiếm: gõ xong 400ms mới gọi API, về trang 1
  useEffect(() => {
    const t = setTimeout(() => setQuery((cur) => (cur.q === (q.trim() || undefined) ? cur : { ...cur, q: q.trim() || undefined, page: 1 })), 400);
    return () => clearTimeout(t);
  }, [q]);

  const patch = (p: Partial<NewsListQuery>) => setQuery((cur) => ({ ...cur, ...p, page: p.page ?? 1 }));
  const inTrash = !!query.trash;

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
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <AdminHeader title="Bài Viết Tin Tức" subtitle="Soạn, dịch và xuất bản bài viết tiếng Việt / tiếng Anh" />

      <div className="p-4 sm:p-6 space-y-4 w-full">
        {/* Thanh công cụ */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo tiêu đề…"
                aria-label="Tìm bài viết theo tiêu đề"
                className="w-64 pl-8 pr-8 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:border-[#5F8A03]"
              />
              {q && (
                <button type="button" onClick={() => setQ('')} aria-label="Xoá từ khoá" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X size={12} />
                </button>
              )}
            </div>
            <select aria-label="Lọc theo chuyên mục" value={query.categoryId ?? ''} onChange={(e) => patch({ categoryId: e.target.value || undefined })} className={selectClass}>
              <option value="">Tất cả chuyên mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.translations.vi?.name}
                </option>
              ))}
            </select>
            {!inTrash && (
              <>
                <select
                  aria-label="Lọc theo trạng thái"
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
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" className="accent-[#5F8A03]" checked={query.missing === 'en'} onChange={(e) => patch({ missing: e.target.checked ? 'en' : undefined })} />
                  Chưa có bản tiếng Anh
                </label>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => patch({ trash: !inTrash, status: undefined, locale: undefined, missing: undefined })}
              aria-pressed={inTrash}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                inTrash ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Trash2 size={13} aria-hidden="true" /> {inTrash ? 'Đang xem thùng rác — Quay lại' : 'Thùng rác'}
            </button>
            <Link href="/admin/news/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold shadow-xs">
              <FilePlus2 size={14} aria-hidden="true" /> Viết bài mới
            </Link>
          </div>
        </div>

        {/* Bảng bài viết */}
        <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-4 py-3 w-20">Ảnh</th>
                  <th scope="col" className="px-4 py-3">Tiêu đề</th>
                  <th scope="col" className="px-4 py-3 w-56">Ngôn ngữ</th>
                  <th scope="col" className="px-4 py-3 w-32">{inTrash ? 'Đã xoá' : 'Cập nhật'}</th>
                  <th scope="col" className="px-4 py-3 w-36 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && !data
                  ? Array.from({ length: 6 }, (_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3"><Skeleton className="h-10 w-16 rounded" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-3/4 rounded" /><Skeleton className="h-3 w-24 rounded mt-2" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-40 rounded" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-20 rounded" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-6 w-24 rounded ml-auto" /></td>
                      </tr>
                    ))
                  : data?.items.map((item) => {
                      const vi = item.locales.vi;
                      const en = item.locales.en;
                      return (
                        <tr key={item.id} className={`hover:bg-slate-50/70 ${loading ? 'opacity-60' : ''}`}>
                          <td className="px-4 py-3">
                            {item.coverUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element -- ảnh thumbnail MinIO trong CMS
                              <img src={item.coverUrl} alt="" className="h-10 w-16 rounded object-cover border border-slate-200" />
                            ) : (
                              <div className="h-10 w-16 rounded bg-slate-100 border border-dashed border-slate-300" />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {inTrash ? (
                              <span className="font-semibold text-slate-800 line-clamp-2">{item.title}</span>
                            ) : (
                              <Link href={`/admin/news/${item.id}`} className="font-semibold text-slate-900 hover:text-[#5F8A03] line-clamp-2">
                                {item.title}
                              </Link>
                            )}
                            <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                              <span>{item.categoryName}</span>
                              {item.isFeatured && (
                                <span className="inline-flex items-center gap-0.5 text-amber-600 font-semibold">
                                  <Star size={11} className="fill-amber-400 stroke-amber-500" aria-hidden="true" /> Nổi bật
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              <StatusBadge prefix="VI" status={vi?.status ?? null} />
                              <StatusBadge prefix="EN" status={en?.status ?? null} stale={en?.stale} />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 tabular-nums">{formatDate(inTrash && item.deletedAt ? item.deletedAt : item.updatedAt, 'vi')}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              {inTrash ? (
                                <>
                                  <IconBtn label="Khôi phục" onClick={() => restore(item)} icon={RotateCcw} />
                                  {isAdmin && <IconBtn label="Xoá vĩnh viễn" onClick={() => purge(item)} icon={Trash2} danger />}
                                </>
                              ) : (
                                <>
                                  <Link href={`/admin/news/${item.id}`} title="Sửa bài" aria-label="Sửa bài" className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-[#5F8A03]">
                                    <Pencil size={14} />
                                  </Link>
                                  {vi?.status === 'PUBLISHED' && (
                                    <a href={`/tin-tuc/${vi.slug}`} target="_blank" rel="noopener noreferrer" title="Xem trên website" aria-label="Xem trên website" className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-[#5F8A03]">
                                      <ExternalLink size={14} />
                                    </a>
                                  )}
                                  <IconBtn label="Chuyển vào thùng rác" onClick={() => moveToTrash(item)} icon={Trash2} danger />
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                {!loading && data?.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-14 text-center text-sm text-slate-500">
                      {inTrash ? 'Thùng rác trống.' : query.q || query.categoryId || query.status || query.missing ? 'Không có bài viết khớp bộ lọc.' : 'Chưa có bài viết nào — bấm “Viết bài mới” để bắt đầu.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {data && data.total > 0 && (
            <div className="px-4 py-3 border-t border-slate-200">
              <Pagination page={data.page} totalPages={data.totalPages} total={data.total} disabled={loading} onChange={(page) => setQuery((cur) => ({ ...cur, page }))} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IconBtn({ label, onClick, icon: Icon, danger }: { label: string; onClick: () => void; icon: React.ComponentType<{ size?: number }>; danger?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`p-2 rounded-md text-slate-500 hover:bg-slate-100 cursor-pointer ${danger ? 'hover:text-rose-600' : 'hover:text-[#5F8A03]'}`}
    >
      <Icon size={14} />
    </button>
  );
}
