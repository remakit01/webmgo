'use client';

import React from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, ListPlus, Pencil, Trash2 } from 'lucide-react';
import { formatNumber } from '@remak/shared/date';
import type { SpecOptionCms } from '@remak/shared/contracts/product';
import IconAction from '@/cms/components/shared/IconAction';
import Skeleton from '@/cms/components/ui/Skeleton';

/** Lý do không xoá được (null = xoá được) — khớp điều kiện ở API: đang có sản phẩm dùng, kể cả trong thùng rác */
export const deleteBlockedReason = (o: SpecOptionCms): string | null =>
  o.usageCount ? `Đang dùng ở ${o.usageCount} sản phẩm — tắt thay vì xoá` : null;

/** Bảng giá trị của 1 nhóm: thứ tự (▲ ▼), nhãn vi/en, mã, số sản phẩm dùng, hiển thị, thao tác. Desktop CMS. */
export default function SpecOptionTable({
  items,
  editingId,
  isAdmin,
  reordering,
  onMove,
  onEdit,
  onDelete,
  onAdd,
}: {
  items: SpecOptionCms[] | null;
  editingId: string | null;
  isAdmin: boolean;
  reordering: boolean;
  onMove: (o: SpecOptionCms, dir: -1 | 1) => void;
  onEdit: (o: SpecOptionCms) => void;
  onDelete: (o: SpecOptionCms) => void;
  onAdd: () => void;
}) {
  if (items?.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xs px-6 py-14 text-center">
        <h2 className="text-sm font-semibold text-slate-900">Nhóm này chưa có giá trị nào</h2>
        <p className="mt-1.5 text-sm text-slate-600">Thêm giá trị để chọn được trong form sản phẩm.</p>
        <button
          type="button"
          onClick={onAdd}
          className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#4E7202] px-4 text-sm font-semibold text-white hover:bg-[#3F5E02] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03]"
        >
          <ListPlus size={16} aria-hidden="true" /> Thêm giá trị
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-clip">
      <table className="w-full border-collapse text-left text-sm" aria-busy={reordering}>
        <caption className="sr-only">Giá trị của nhóm, theo thứ tự hiện trong form sản phẩm</caption>
        <thead className="bg-slate-100 text-xs font-semibold text-slate-700 shadow-[inset_0_-1px_0_var(--color-slate-300)]">
          <tr>
            <th scope="col" className="w-28 px-4 py-3">Thứ tự</th>
            <th scope="col" className="px-4 py-3">Nhãn</th>
            <th scope="col" className="w-44 px-4 py-3">Mã</th>
            <th scope="col" className="w-24 px-4 py-3 text-right">Sản phẩm</th>
            <th scope="col" className="w-28 px-4 py-3">Hiển thị</th>
            <th scope="col" className="w-24 px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items === null
            ? Array.from({ length: 4 }, (_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4"><Skeleton className="h-8 w-20 rounded" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-5 w-40 rounded" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-5 w-28 rounded" /></td>
                  <td className="px-4 py-4"><Skeleton className="ml-auto h-5 w-8 rounded" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-6 w-20 rounded" /></td>
                  <td className="px-4 py-4"><Skeleton className="ml-auto h-8 w-16 rounded" /></td>
                </tr>
              ))
            : items.map((o, i) => {
                const name = o.labels.vi ?? o.code;
                const editing = editingId === o.id;
                const blocked = deleteBlockedReason(o);
                return (
                  <tr
                    key={o.id}
                    aria-current={editing || undefined}
                    className={`align-top transition-colors ${editing ? 'bg-[#F4F9E8] shadow-[inset_3px_0_0_#4E7202]' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        <IconAction
                          label={i === 0 ? 'Đã ở đầu danh sách' : `Chuyển “${name}” lên`}
                          icon={ArrowUp}
                          disabled={i === 0 || reordering}
                          onClick={() => onMove(o, -1)}
                        />
                        <span className="w-6 text-center text-sm font-semibold tabular-nums text-slate-800" aria-label={`Vị trí ${i + 1}`}>
                          {i + 1}
                        </span>
                        <IconAction
                          label={i === items.length - 1 ? 'Đã ở cuối danh sách' : `Chuyển “${name}” xuống`}
                          icon={ArrowDown}
                          disabled={i === items.length - 1 || reordering}
                          onClick={() => onMove(o, 1)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{name}</p>
                      <p className="mt-0.5 text-xs text-slate-700">
                        {o.labels.en ? (
                          <>
                            <span className="font-semibold text-slate-600">EN:</span> {o.labels.en}
                          </>
                        ) : (
                          <span className="inline-flex rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-800">Chưa có tên tiếng Anh</span>
                        )}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700 break-all">{o.code}</td>
                    <td className={`px-4 py-3 text-right tabular-nums font-bold ${o.usageCount ? 'text-slate-900' : 'text-slate-500'}`}>{formatNumber(o.usageCount)}</td>
                    <td className="px-4 py-3">
                      {o.isActive ? (
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
                        <IconAction label={`Sửa “${name}”`} icon={Pencil} onClick={() => onEdit(o)} tipAlign={isAdmin ? 'center' : 'end'} />
                        {isAdmin && (
                          <IconAction
                            label={blocked ? `Không xoá được: ${blocked}` : `Xoá “${name}”`}
                            icon={Trash2}
                            danger
                            disabled={!!blocked}
                            onClick={() => onDelete(o)}
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
