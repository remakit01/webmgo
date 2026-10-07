'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowUp, ArrowUpDown, ExternalLink, FileText, ImageOff, Pencil, RotateCcw, SearchX, Star, Trash2 } from 'lucide-react';
import type { NewsListSort } from '@remak/shared/contracts/news';
import { formatDayKey, formatNumber, formatTime, toDayKey } from '@remak/shared/date';
import IconAction from '@/cms/components/shared/IconAction';
import StatusBadge from '@/cms/components/shared/StatusBadge';
import Skeleton from '@/cms/components/ui/Skeleton';
import type { NewsListQuery } from '@/cms/lib/news-api';
import type { NewsPostListItemCms } from '@/types/news';
import { publicPath } from '../news-form';

type Item = NewsPostListItemCms;

interface Props {
  items: Item[] | null;
  loading: boolean;
  query: NewsListQuery;
  isAdmin: boolean;
  hasActiveFilters: boolean;
  onSort: (sort: NewsListSort | undefined) => void;
  onClearFilters: () => void;
  onTrash: (item: Item) => void;
  onRestore: (item: Item) => void;
  onPurge: (item: Item) => void;
}

const day = (iso: string) => formatDayKey(toDayKey(iso));
const periodText = (days?: number) => (days ? `${days} ngày qua` : 'Từ trước tới nay');

/**
 * Bảng danh sách bài viết CMS (desktop): 5 cột, tiêu đề bảng dính ngay dưới dải công cụ khi cuộn
 * (top = --admin-sticky-top), cột Lượt xem / Cập nhật bấm để sắp xếp (aria-sort).
 */
export default function NewsListTable(props: Props) {
  const { items, loading, query } = props;
  const inTrash = Boolean(query.trash);
  const sort = query.sort ?? 'updated';
  const sortCaption =
    sort === 'views_desc' ? 'xem nhiều nhất' : sort === 'views_asc' ? 'xem ít nhất' : inTrash ? 'mới xoá gần nhất' : query.featured ? 'thứ tự nổi bật' : 'mới cập nhật';

  if (!loading && items?.length === 0) return <EmptyState {...props} />;

  return (
    <div aria-busy={loading}>
      <table className="w-full min-w-[960px] border-collapse text-left text-sm">
        <caption className="sr-only">Danh sách bài viết, sắp theo {sortCaption}</caption>
        <thead className="sticky top-[var(--admin-sticky-top)] z-10 bg-slate-100 text-xs font-semibold text-slate-700 shadow-[inset_0_-1px_0_var(--color-slate-300)]">
          <tr>
            <th scope="col" className="px-5 py-3">
              Bài viết
            </th>
            <th scope="col" className="w-52 px-4 py-3">
              Trạng thái xuất bản
            </th>
            <ViewsHeader {...props} inTrash={inTrash} />
            <UpdatedHeader {...props} inTrash={inTrash} />
            <th scope="col" className="w-36 px-5 py-3 text-right">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items === null
            ? Array.from({ length: 6 }, (_, i) => (
                <tr key={i}>
                  <td className="px-5 py-4">
                    <div className="flex gap-3">
                      <Skeleton className="h-[54px] w-24 shrink-0 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-4 w-24 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-10 w-36 rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="ml-auto h-5 w-14 rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-8 w-24 rounded" />
                  </td>
                  <td className="px-5 py-4">
                    <Skeleton className="ml-auto h-8 w-28 rounded" />
                  </td>
                </tr>
              ))
            : items.map((item) => (
                <tr key={item.id} className={`align-top transition-colors hover:bg-slate-50 ${loading ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-4">
                    <PostCell item={item} inTrash={inTrash} />
                  </td>
                  <td className="px-4 py-4">
                    <StatusCell item={item} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <ViewsCell item={item} periodDays={query.viewsDays} />
                  </td>
                  <td className="px-4 py-4">
                    <UpdatedCell item={item} inTrash={inTrash} />
                  </td>
                  <td className="px-5 py-3">
                    <RowActions item={item} inTrash={inTrash} {...props} />
                  </td>
                </tr>
              ))}
        </tbody>
      </table>

    </div>
  );
}

// ─── Tiêu đề cột sắp xếp được ───────────────────────────────────────────────

function SortButton({
  label,
  hint,
  dir,
  onClick,
  align = 'left',
}: {
  label: string;
  hint?: string;
  dir: 'ascending' | 'descending' | 'none';
  onClick: () => void;
  align?: 'left' | 'right';
}) {
  const Icon = dir === 'descending' ? ArrowDown : dir === 'ascending' ? ArrowUp : ArrowUpDown;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mx-2 inline-flex cursor-pointer items-start gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-[#5F8A03] ${
        align === 'right' ? 'flex-row-reverse text-right' : ''
      }`}
    >
      <span className="flex flex-col">
        <span className="whitespace-nowrap">{label}</span>
        {hint && <span className="whitespace-nowrap font-normal text-slate-600">{hint}</span>}
      </span>
      <Icon size={14} aria-hidden="true" className={`mt-0.5 shrink-0 ${dir === 'none' ? 'text-slate-400' : 'text-[#4E7202]'}`} />
    </button>
  );
}

function ViewsHeader({ query, onSort, inTrash }: Props & { inTrash: boolean }) {
  const dir = query.sort === 'views_desc' ? 'descending' : query.sort === 'views_asc' ? 'ascending' : 'none';
  if (inTrash) {
    return (
      <th scope="col" className="w-36 px-4 py-3 text-right">
        Lượt xem
      </th>
    );
  }
  return (
    <th scope="col" aria-sort={dir} className="w-36 px-4 py-2 text-right">
      <SortButton
        label="Lượt xem"
        hint={periodText(query.viewsDays)}
        dir={dir}
        align="right"
        // Xem nhiều nhất -> xem ít nhất -> bỏ (về mới cập nhật)
        onClick={() => onSort(dir === 'none' ? 'views_desc' : dir === 'descending' ? 'views_asc' : undefined)}
      />
    </th>
  );
}

function UpdatedHeader({ query, onSort, inTrash }: Props & { inTrash: boolean }) {
  if (inTrash) {
    return (
      <th scope="col" aria-sort="descending" className="w-40 px-4 py-3">
        Đã xoá lúc
      </th>
    );
  }
  const active = !query.sort && !query.featured;
  return (
    <th scope="col" aria-sort={active ? 'descending' : 'none'} className="w-40 px-4 py-2">
      <SortButton label="Cập nhật" hint="Mới nhất trước" dir={active ? 'descending' : 'none'} onClick={() => onSort(undefined)} />
    </th>
  );
}

// ─── Ô dữ liệu ──────────────────────────────────────────────────────────────

function PostCell({ item, inTrash }: { item: Item; inTrash: boolean }) {
  return (
    <div className="flex min-w-0 gap-3">
      <div className="aspect-video w-24 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
        {item.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh thumbnail MinIO trong CMS
          <img src={item.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-slate-500">
            <ImageOff size={16} aria-hidden="true" />
            <span className="text-xs">Chưa có ảnh</span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        {inTrash ? (
          <p className="line-clamp-3 font-semibold leading-snug text-slate-800" title={item.title}>
            {item.title}
          </p>
        ) : (
          <Link
            href={`/admin/news/${item.id}`}
            title={item.title}
            className="line-clamp-3 font-semibold leading-snug text-slate-900 underline-offset-2 transition-colors hover:text-[#4E7202] hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-[#5F8A03]"
          >
            {item.title}
          </Link>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{item.categoryName}</span>
          {item.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
              <Star size={12} aria-hidden="true" className="fill-amber-400 text-amber-500" />
              Nổi bật
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusCell({ item, inline }: { item: Item; inline?: boolean }) {
  const rows = [
    { label: 'Tiếng Việt', short: 'VI', t: item.locales.vi },
    { label: 'Tiếng Anh', short: 'EN', t: item.locales.en },
  ];
  if (inline) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {rows.map((r) => (
          <StatusBadge key={r.short} prefix={r.short} status={r.t?.status ?? null} stale={r.t?.stale} />
        ))}
      </div>
    );
  }
  return (
    <dl className="space-y-1.5">
      {rows.map((r) => (
        <div key={r.short}>
          <dt className="text-xs text-slate-600">{r.label}</dt>
          <dd className="mt-0.5">
            <StatusBadge status={r.t?.status ?? null} stale={r.t?.stale} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ViewsCell({ item, periodDays }: { item: Item; periodDays?: number }) {
  return (
    <div className="tabular-nums">
      <span className={`block text-base font-bold ${item.viewsInPeriod ? 'text-slate-900' : 'text-slate-500'}`}>
        {formatNumber(item.viewsInPeriod)}
        <span className="sr-only"> lượt xem {periodText(periodDays).toLowerCase()}</span>
      </span>
      {periodDays && <span className="mt-0.5 block text-xs text-slate-600">Tổng {formatNumber(item.views)}</span>}
    </div>
  );
}

function UpdatedCell({ item, inTrash }: { item: Item; inTrash: boolean }) {
  const at = inTrash && item.deletedAt ? item.deletedAt : item.updatedAt;
  const published = item.locales.vi?.status === 'PUBLISHED' ? item.locales.vi.publishedAt : null;
  return (
    <div className="tabular-nums">
      <time dateTime={at} className="block font-medium text-slate-800">
        {day(at)}
      </time>
      <span className="block text-xs text-slate-600">{formatTime(at)}</span>
      {!inTrash && published && <span className="mt-1 block text-xs text-slate-600">Đăng {day(published)}</span>}
    </div>
  );
}

function EditLocaleDropdown({ item }: { item: Item }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const vi = item.locales.vi;
  const en = item.locales.en;

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Chọn ngôn ngữ để sửa bài viết"
        title="Sửa bài viết (chọn ngôn ngữ)"
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#5F8A03] ${
          open ? 'bg-[#F4F9E8] text-[#4E7202] ring-2 ring-[#7CB305]/40' : 'text-slate-600 hover:bg-slate-100 hover:text-[#4E7202]'
        }`}
      >
        <Pencil size={17} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Tùy chọn ngôn ngữ chỉnh sửa"
          className="absolute right-0 top-full mt-1.5 z-30 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 mb-1">
            Chọn bản dịch để chỉnh sửa
          </div>

          {/* Bản Tiếng Việt */}
          <Link
            href={`/admin/news/${item.id}?locale=vi`}
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-100 hover:text-[#4E7202]"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-6 items-center justify-center rounded bg-red-100 text-[10px] font-black text-red-700">
                VI
              </span>
              <span className="font-semibold text-slate-900">Tiếng Việt</span>
            </div>
            <StatusBadge status={vi?.status ?? null} stale={vi?.stale} className="text-[11px] py-0 px-1.5" />
          </Link>

          {/* Bản Tiếng Anh */}
          <Link
            href={`/admin/news/${item.id}?locale=en`}
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-100 hover:text-[#4E7202]"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-6 items-center justify-center rounded bg-blue-100 text-[10px] font-black text-blue-700">
                EN
              </span>
              <span className="font-semibold text-slate-900">Tiếng Anh</span>
            </div>
            <StatusBadge status={en?.status ?? null} stale={en?.stale} className="text-[11px] py-0 px-1.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

function ViewWebsiteDropdown({ item }: { item: Item }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const vi = item.locales.vi;
  const en = item.locales.en;
  const isViPublished = vi?.status === 'PUBLISHED' && Boolean(vi?.slug);
  const isEnPublished = en?.status === 'PUBLISHED' && Boolean(en?.slug);

  if (!isViPublished && !isEnPublished) return null;

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Xem bài viết trên website"
        title="Xem trên website (chọn ngôn ngữ)"
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#5F8A03] ${
          open ? 'bg-[#F4F9E8] text-[#4E7202] ring-2 ring-[#7CB305]/40' : 'text-slate-600 hover:bg-slate-100 hover:text-[#4E7202]'
        }`}
      >
        <ExternalLink size={17} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Tùy chọn xem bài viết trên website"
          className="absolute right-0 top-full mt-1.5 z-30 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 mb-1">
            Xem trên website (tab mới)
          </div>

          {/* Bản Tiếng Việt */}
          {isViPublished ? (
            <a
              href={publicPath('vi', vi.slug)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-100 hover:text-[#4E7202]"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-6 items-center justify-center rounded bg-red-100 text-[10px] font-black text-red-700">
                  VI
                </span>
                <span className="font-semibold text-slate-900">Tiếng Việt</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4E7202]">
                Mở xem <ExternalLink size={11} />
              </span>
            </a>
          ) : (
            <div className="flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-400 opacity-60">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-6 items-center justify-center rounded bg-slate-100 text-[10px] font-black text-slate-500">
                  VI
                </span>
                <span>Tiếng Việt</span>
              </div>
              <span className="text-[11px] italic text-slate-400">Chưa xuất bản</span>
            </div>
          )}

          {/* Bản Tiếng Anh */}
          {isEnPublished ? (
            <a
              href={publicPath('en', en.slug)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-100 hover:text-[#4E7202]"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-6 items-center justify-center rounded bg-blue-100 text-[10px] font-black text-blue-700">
                  EN
                </span>
                <span className="font-semibold text-slate-900">Tiếng Anh</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4E7202]">
                Mở xem <ExternalLink size={11} />
              </span>
            </a>
          ) : (
            <div className="flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-400 opacity-60">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-6 items-center justify-center rounded bg-slate-100 text-[10px] font-black text-slate-500">
                  EN
                </span>
                <span>Tiếng Anh</span>
              </div>
              <span className="text-[11px] italic text-slate-400">{en ? 'Chưa xuất bản' : 'Chưa có bản dịch'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RowActions({ item, inTrash, isAdmin, onTrash, onRestore, onPurge }: Props & { item: Item; inTrash: boolean }) {
  return (
    <div className="flex items-center justify-end gap-1">
      {inTrash ? (
        <>
          <IconAction label="Khôi phục" icon={RotateCcw} onClick={() => onRestore(item)} tipAlign={isAdmin ? 'center' : 'end'} />
          {isAdmin && <IconAction label="Xoá vĩnh viễn" icon={Trash2} danger onClick={() => onPurge(item)} tipAlign="end" />}
        </>
      ) : (
        <>
          <EditLocaleDropdown item={item} />
          <ViewWebsiteDropdown item={item} />
          <IconAction label="Chuyển vào thùng rác" icon={Trash2} danger onClick={() => onTrash(item)} tipAlign="end" />
        </>
      )}
    </div>
  );
}

// ─── Trống ──────────────────────────────────────────────────────────────────

function EmptyState({ query, hasActiveFilters, onClearFilters }: Props) {
  const [Icon, title, text] = query.trash
    ? [Trash2, 'Thùng rác trống', 'Hiện không có bài viết nào bị chuyển vào thùng rác.']
    : hasActiveFilters
      ? [SearchX, 'Không có bài viết khớp bộ lọc', 'Thử đổi từ khoá tìm kiếm hoặc bỏ bớt bộ lọc.']
      : query.featured
        ? [Star, 'Chưa có bài viết nổi bật', 'Mở một bài viết và bật “Bài nổi bật” để bài hiện ở đây.']
        : [FileText, 'Chưa có bài viết nào', 'Bấm “Viết bài mới” ở góc trên để soạn bài đầu tiên.'];
  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-500">
        <Icon size={24} aria-hidden="true" />
      </div>
      <h2 className="mt-3 text-sm font-semibold text-slate-900">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-4 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-[#5F8A03]"
        >
          <RotateCcw size={14} aria-hidden="true" /> Xoá bộ lọc
        </button>
      )}
    </div>
  );
}
