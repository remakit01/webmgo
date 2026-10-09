'use client';

import React from 'react';
import { ArrowDown, ArrowUp, Boxes, EyeOff, ImageOff, Pencil, Plus, RotateCcw, Star, Trash2 } from 'lucide-react';
import { STOCK_STATUS_LABEL, type ProductListItemCms } from '@remak/shared/contracts/product';
import IconAction from '@/cms/components/shared/IconAction';
import Skeleton from '@/cms/components/ui/Skeleton';
import { productPath } from '@/lib/product-paths';
import { formatVnd } from './product-form';

type Item = ProductListItemCms;

const STATUS_CHIP: Record<string, string> = {
  PUBLISHED: 'border-[#7CB305]/40 bg-[#F4F9E8] text-[#3F5E02]',
  DRAFT: 'border-slate-300 bg-slate-100 text-slate-700',
};

function PriceCell({ item }: { item: Item }) {
  const r = item.priceRange;
  if (!r) return <span className="text-slate-600">Liên hệ</span>;
  return <span className="font-semibold text-slate-900">{r.low === r.high ? formatVnd(r.low) : `${formatVnd(r.low)} – ${formatVnd(r.high)}`}</span>;
}

/** Bảng sản phẩm: thứ tự (▲ ▼), ảnh + tên song ngữ + trạng thái từng ngôn ngữ, loại, số độ dày, giá, tình trạng, thao tác */
export default function ProductTable({
  items,
  isAdmin,
  reordering = false,
  inTrash = false,
  onMove,
  onDelete,
  onRestore,
  onPurge,
  onAdd,
  onBackToList,
}: {
  items: Item[] | null;
  isAdmin: boolean;
  reordering?: boolean;
  inTrash?: boolean;
  onMove?: (p: Item, dir: -1 | 1) => void;
  onDelete?: (p: Item) => void;
  onRestore?: (p: Item) => void;
  onPurge?: (p: Item) => void;
  onAdd?: () => void;
  onBackToList?: () => void;
}) {
  if (items?.length === 0) {
    if (inTrash) {
      return (
        <div className="rounded-xl border border-slate-300 bg-white px-6 py-16 text-center shadow-2xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-500">
            <Trash2 size={24} aria-hidden="true" />
          </div>
          <h2 className="mt-3 text-sm font-semibold text-slate-900">Thùng rác trống</h2>
          <p className="mt-1.5 text-sm text-slate-600">Hiện không có sản phẩm nào bị chuyển vào thùng rác.</p>
          {onBackToList && (
            <button
              type="button"
              onClick={onBackToList}
              className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03]"
            >
              Quay lại danh sách
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-slate-300 bg-white px-6 py-16 text-center shadow-2xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-500">
          <Boxes size={24} aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-sm font-semibold text-slate-900">Chưa có sản phẩm nào</h2>
        <p className="mt-1.5 text-sm text-slate-600">Tạo dòng tấm đầu tiên: nội dung, độ dày, giá và thông số kỹ thuật.</p>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#4E7202] px-4 text-sm font-semibold text-white hover:bg-[#3F5E02] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03]"
          >
            <Plus size={16} aria-hidden="true" /> Thêm sản phẩm
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-clip rounded-xl border border-slate-300 bg-white shadow-2xs">
      <table className="w-full border-collapse text-left text-sm" aria-busy={reordering}>
        <caption className="sr-only">Sản phẩm, theo thứ tự hiển thị trên website</caption>
        <thead className="sticky top-[var(--admin-sticky-top)] z-10 bg-slate-100 text-xs font-semibold text-slate-700 shadow-[inset_0_-1px_0_var(--color-slate-300)]">
          <tr>
            <th scope="col" className="w-28 px-4 py-3">{inTrash ? 'STT' : 'Thứ tự'}</th>
            <th scope="col" className="px-4 py-3">Sản phẩm</th>
            <th scope="col" className="w-24 px-4 py-3 text-right">Độ dày</th>
            <th scope="col" className="px-4 py-3">Giá</th>
            <th scope="col" className="w-36 px-4 py-3">Tình trạng</th>
            <th scope="col" className="w-28 px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items === null
            ? Array.from({ length: 5 }, (_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4"><Skeleton className="h-8 w-20 rounded" /></td>
                  <td className="px-4 py-4">
                    <div className="flex gap-3">
                      <Skeleton className="h-14 w-14 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-56 rounded" />
                        <Skeleton className="mt-2 h-4 w-40 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><Skeleton className="ml-auto h-5 w-8 rounded" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-5 w-28 rounded" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-6 w-20 rounded" /></td>
                  <td className="px-4 py-4"><Skeleton className="ml-auto h-8 w-20 rounded" /></td>
                </tr>
              ))
            : items.map((p, i) => {
                const vi = p.locales.vi;
                const name = vi?.name || '(chưa đặt tên)';
                const href = `/admin/products/${p.id}`;
                return (
                  <tr key={p.id} className="align-top transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3">
                      {inTrash ? (
                        <span className="inline-block w-6 text-center text-sm font-semibold tabular-nums text-slate-500" aria-label={`STT ${i + 1}`}>
                          {i + 1}
                        </span>
                      ) : (
                        <div className="flex items-center gap-0.5">
                          <IconAction label={i === 0 ? 'Đã ở đầu danh sách' : `Chuyển “${name}” lên`} icon={ArrowUp} disabled={i === 0 || reordering} onClick={() => onMove?.(p, -1)} />
                          <span className="w-6 text-center text-sm font-semibold tabular-nums text-slate-800" aria-label={`Vị trí ${i + 1}`}>
                            {i + 1}
                          </span>
                          <IconAction label={i === items.length - 1 ? 'Đã ở cuối danh sách' : `Chuyển “${name}” xuống`} icon={ArrowDown} disabled={i === items.length - 1 || reordering} onClick={() => onMove?.(p, 1)} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                          {p.coverImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element -- ảnh nhỏ trong CMS, không cần tối ưu
                            <img src={p.coverImageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <ImageOff size={18} className="text-slate-400" aria-label="Chưa có ảnh" />
                          )}
                        </div>
                        <div className="min-w-0">
                          {inTrash ? (
                            <span className="font-bold text-slate-700">{name}</span>
                          ) : (
                            <a href={href} className="font-bold text-slate-900 hover:text-[#3F5E02] hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-[#5F8A03]">
                              {name}
                            </a>
                          )}
                          {p.isFeatured && (
                            <span className="ml-1.5 inline-flex items-center gap-0.5 align-middle text-xs font-semibold text-amber-700">
                              <Star size={12} className="fill-current" aria-hidden="true" /> Nổi bật
                            </span>
                          )}
                          <p className="mt-0.5 text-xs text-slate-600">
                            {p.type.name}
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                            {(['vi', 'en'] as const).map((l) => {
                              const t = p.locales[l];
                              if (!t) {
                                return (
                                  <span key={l} className="inline-flex rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-800">
                                    {l.toUpperCase()} chưa có
                                  </span>
                                );
                              }
                              const label = `${l.toUpperCase()} ${t.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Nháp'}`;
                              return t.status === 'PUBLISHED' && !inTrash ? (
                                <a
                                  key={l}
                                  href={productPath(l, t.slug)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={productPath(l, t.slug)}
                                  aria-label={`${label} — xem ${productPath(l, t.slug)} (mở tab mới)`}
                                  className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-semibold hover:underline ${STATUS_CHIP.PUBLISHED}`}
                                >
                                  {label} <span aria-hidden="true">↗</span>
                                </a>
                              ) : (
                                <span key={l} className={`inline-flex rounded border px-1.5 py-0.5 font-semibold ${t.status === 'PUBLISHED' ? STATUS_CHIP.PUBLISHED : STATUS_CHIP.DRAFT}`}>
                                  {label}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-base font-bold tabular-nums text-slate-900">{p.variantCount}</td>
                    <td className="px-4 py-3 text-xs tabular-nums">
                      <PriceCell item={p} />
                    </td>
                    <td className="px-4 py-3">
                      {p.variantCount ? (
                        <span className="inline-block whitespace-nowrap rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs font-semibold text-slate-800">{STOCK_STATUS_LABEL[p.stockStatus].vi}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                          <EyeOff size={13} aria-hidden="true" /> Chưa có độ dày
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        {inTrash ? (
                          <>
                            {onRestore && <IconAction label={`Khôi phục “${name}”`} icon={RotateCcw} onClick={() => onRestore(p)} tipAlign={isAdmin ? 'center' : 'end'} />}
                            {isAdmin && onPurge && <IconAction label={`Xoá vĩnh viễn “${name}”`} icon={Trash2} danger onClick={() => onPurge(p)} tipAlign="end" />}
                          </>
                        ) : (
                          <>
                            <IconAction label={`Sửa “${name}”`} icon={Pencil} href={href} tipAlign={isAdmin ? 'center' : 'end'} />
                            {isAdmin && onDelete && <IconAction label={`Chuyển “${name}” vào thùng rác`} icon={Trash2} danger onClick={() => onDelete(p)} tipAlign="end" />}
                          </>
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
