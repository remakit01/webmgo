'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import type { ProductListItemCms } from '@remak/shared/contracts/product';
import { AdminPage, AdminPageBand, AdminPageBody } from '@/cms/components/layout/AdminPage';
import { useConfirm, useToast } from '@/cms/components/ConfirmDialog';
import ProductTable from '@/cms/components/products/ProductTable';
import { fetchCurrentUser } from '@/cms/lib/api-auth';
import { productsApi } from '@/cms/lib/products-api';

export default function AdminProductsPage() {
  const router = useRouter();
  const confirm = useConfirm();
  const showToast = useToast();
  const [items, setItems] = useState<ProductListItemCms[] | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [announce, setAnnounce] = useState('');

  const load = useCallback(
    () =>
      productsApi
        .list()
        .then(setItems)
        .catch((err: unknown) => showToast(err instanceof Error ? err.message : 'Không tải được sản phẩm', 'error')),
    [showToast],
  );

  useEffect(() => {
    void load();
    fetchCurrentUser()
      .then((u) => setIsAdmin(u?.role === 'ADMIN'))
      .catch(() => setIsAdmin(false));
  }, [load]);

  const move = async (p: ProductListItemCms, dir: -1 | 1) => {
    if (!items) return;
    const from = items.findIndex((x) => x.id === p.id);
    const to = from + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    setItems(next); // cập nhật ngay trên giao diện
    setReordering(true);
    try {
      setItems(await productsApi.reorder(next.map((x) => x.id)));
      setAnnounce(`Đã chuyển “${p.locales.vi?.name}” ${dir < 0 ? 'lên' : 'xuống'} vị trí ${to + 1}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không đổi được thứ tự', 'error');
      await load();
    } finally {
      setReordering(false);
    }
  };

  const remove = (p: ProductListItemCms) =>
    confirm({
      title: 'Xoá sản phẩm?',
      description: `“${p.locales.vi?.name}” sẽ bị gỡ khỏi website (cả bản tiếng Anh). Dữ liệu vẫn được giữ trong hệ thống để khôi phục khi cần.`,
      confirmText: 'Xoá sản phẩm',
      variant: 'danger',
      onConfirm: async () => {
        await productsApi.remove(p.id);
        await load();
      },
      successMessage: 'Đã xoá sản phẩm',
    });

  const published = items?.filter((p) => p.locales.vi?.status === 'PUBLISHED').length ?? 0;
  const missingEn = items?.filter((p) => !p.locales.en).length ?? 0;
  const add = () => router.push('/admin/products/new');

  return (
    <AdminPage title="Sản Phẩm MGO" subtitle="Dòng tấm, độ dày, giá, thông số kỹ thuật và thứ tự hiển thị trên website">
      <AdminPageBand
        title={
          <p className="text-sm text-slate-700" aria-live="polite">
            {items ? (
              <>
                <strong className="text-slate-900">{items.length}</strong> sản phẩm · {published} đang hiện trên web
                {missingEn > 0 && ` · ${missingEn} chưa có bản tiếng Anh`}
              </>
            ) : (
              'Đang tải…'
            )}
          </p>
        }
        label="Sản phẩm"
        actions={
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#4E7202] px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#3F5E02] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03]"
          >
            <Plus size={14} aria-hidden="true" /> Thêm sản phẩm
          </button>
        }
      />
      <AdminPageBody>
        <ProductTable items={items} isAdmin={isAdmin} reordering={reordering} onMove={move} onDelete={remove} onAdd={add} />
        <p className="sr-only" aria-live="polite">
          {announce}
        </p>
      </AdminPageBody>
    </AdminPage>
  );
}
