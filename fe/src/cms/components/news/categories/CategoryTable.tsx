'use client';

import React from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, FolderPlus, Pencil, Trash2 } from 'lucide-react';
import { formatNumber } from '@remak/shared/date';
import IconAction from '@/cms/components/shared/IconAction';
import Skeleton from '@/cms/components/ui/Skeleton';
import { CATEGORY_COLOR_STYLES } from '@/lib/news-category-colors';
import type { NewsCategoryCms } from '@/types/news';
import { categoryPath } from './category-form';

type Category = NewsCategoryCms;

/** Lý do không xoá được (null = xoá được) — khớp điều kiện ở API: còn bài, kể cả bài trong thùng rác */
export function deleteBlockedReason(c: Category): string | null {
  const total = c.postCount + c.trashedPostCount;
  if (!total) return null;
  const trash = c.trashedPostCount ? ` (${c.trashedPostCount} trong thùng rác)` : '';
  return `Còn ${total} bài${trash} — chuyển bài sang chuyên mục khác trước`;
}

/**
 * Bảng chuyên mục: thứ tự (▲ ▼ đổi chỗ, không cần kéo thả), tên song ngữ + đường dẫn, số bài, hiển thị, thao tác.
 * Desktop CMS.
 */
export default function CategoryTable({
  items,
  editingId,
  isAdmin,
  reordering,
  onMove,
  onEdit,
  onDelete,
  onAdd,
}: {
  items: Category[] | null;
  editingId: string | null;
  isAdmin: boolean;
  reordering: boolean;
  onMove: (c: Category, dir: -1 | 1) => void;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onAdd: () => void;
}) {
  if (items?.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xs px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-500">
          <FolderPlus size={24} aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-slate-900">Chưa có chuyên mục nào</h2>
        <p className="mt-1.5 text-sm text-slate-600">Tạo chuyên mục để phân loại bài viết tin tức.</p>
        <button
          type="button"
          onClick={onAdd}
          className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#4E7202] px-4 text-sm font-semibold text-white hover:bg-[#3F5E02] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03]"
        >
          <FolderPlus size={16} aria-hidden="true" /> Thêm chuyên mục
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-clip">
      <table className="w-full border-collapse text-left text-sm" aria-busy={reordering}>
        <caption className="sr-only">Chuyên mục tin tức, theo thứ tự hiển thị trên website</caption>
        <thead className="bg-slate-100 text-xs font-semibold text-slate-700 shadow-[inset_0_-1px_0_var(--color-slate-300)]">
          <tr>
            <th scope="col" className="w-28 px-4 py-3">Thứ tự</th>
            <th scope="col" className="px-4 py-3">Chuyên mục</th>
            <th scope="col" className="w-28 px-4 py-3 text-right">Bài viết</th>
            <th scope="col" className="w-32 px-4 py-3">Hiển thị</th>
            <th scope="col" className="w-28 px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items === null
            ? Array.from({ length: 5 }, (_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4"><Skeleton className="h-8 w-20 rounded" /></td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-40 rounded" />
                    <Skeleton className="mt-2 h-4 w-56 rounded" />
                  </td>
                  <td className="px-4 py-4"><Skeleton className="ml-auto h-5 w-10 rounded" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-6 w-20 rounded" /></td>
                  <td className="px-4 py-4"><Skeleton className="ml-auto h-8 w-20 rounded" /></td>
                </tr>
              ))
            : items.map((c, i) => {
                const vi = c.translations.vi;
                const en = c.translations.en;
                const name = vi?.name ?? '(chưa đặt tên)';
                const editing = editingId === c.id;
                const blocked = deleteBlockedReason(c);
                return (
                  <tr
                    key={c.id}
                    aria-current={editing || undefined}
                    className={`align-top transition-colors ${editing ? 'bg-[#F4F9E8] shadow-[inset_3px_0_0_#4E7202]' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        <IconAction
                          label={i === 0 ? 'Đã ở đầu danh sách' : `Chuyển “${name}” lên`}
                          icon={ArrowUp}
                          disabled={i === 0 || reordering}
                          onClick={() => onMove(c, -1)}
                        />
                        <span className="w-6 text-center text-sm font-semibold tabular-nums text-slate-800" aria-label={`Vị trí ${i + 1}`}>
                          {i + 1}
                        </span>
                        <IconAction
                          label={i === items.length - 1 ? 'Đã ở cuối danh sách' : `Chuyển “${name}” xuống`}
                          icon={ArrowDown}
                          disabled={i === items.length - 1 || reordering}
                          onClick={() => onMove(c, 1)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-md border px-2 py-0.5 text-sm font-bold ${CATEGORY_COLOR_STYLES[c.color].chip}`}>{name}</span>
                      <p className="mt-1 text-xs text-slate-700">
                        {en ? (
                          <>
                            <span className="font-semibold text-slate-600">EN:</span> {en.name}
                          </>
                        ) : (
                          <span className="inline-flex rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-800">
                            Chưa có tên tiếng Anh
                          </span>
                        )}
                      </p>
                      {vi?.description && (
                        <p className="mt-1 max-w-xl truncate text-xs text-slate-600" title={vi.description}>
                          {vi.description}
                        </p>
                      )}
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        {(['vi', 'en'] as const).map((l) => {
                          const t = c.translations[l];
                          if (!t) return null;
                          const path = categoryPath(l, t.slug);
                          // Gọn: "VI ky-thuat ↗" (tiền tố đã biết), đường dẫn đầy đủ ở title + aria-label
                          const content = (
                            <>
                              <span className="font-sans font-semibold text-slate-600">{l.toUpperCase()}</span> {t.slug}
                            </>
                          );
                          return c.isActive ? (
                            <a
                              key={l}
                              href={path}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={path}
                              aria-label={`Xem ${path} trên website (mở tab mới)`}
                              className="inline-flex max-w-full items-baseline gap-1 break-all font-mono text-[#4E7202] underline-offset-2 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-[#5F8A03]"
                            >
                              <span>{content}</span>
                              <span aria-hidden="true">↗</span>
                            </a>
                          ) : (
                            <span key={l} title={`${path} (chuyên mục đang ẩn)`} className="break-all font-mono text-slate-600">
                              {content}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span className={`block text-base font-bold ${c.postCount ? 'text-slate-900' : 'text-slate-500'}`}>{formatNumber(c.postCount)}</span>
                      {c.trashedPostCount > 0 && <span className="block text-xs text-slate-600">+{formatNumber(c.trashedPostCount)} trong thùng rác</span>}
                    </td>
                    <td className="px-4 py-3">
                      {c.isActive ? (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-[#7CB305]/40 bg-[#F4F9E8] px-2 py-0.5 text-xs font-semibold text-[#3F5E02]">
                          <Eye size={13} aria-hidden="true" /> Đang hiện
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          <EyeOff size={13} aria-hidden="true" /> Đang ẩn
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <IconAction label={`Sửa “${name}”`} icon={Pencil} onClick={() => onEdit(c)} tipAlign={isAdmin ? 'center' : 'end'} />
                        {isAdmin && (
                          <IconAction
                            label={blocked ? `Không xoá được: ${blocked}` : `Xoá “${name}”`}
                            icon={Trash2}
                            danger
                            disabled={!!blocked}
                            onClick={() => onDelete(c)}
                            tipAlign="end"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
}
