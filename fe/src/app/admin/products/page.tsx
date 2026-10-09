'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import type { ProductListItemCms } from '@remak/shared/contracts/product';
import { AdminPage, AdminPageBand, AdminPageBody } from '@/cms/components/layout/AdminPage';
import { useConfirm, useToast } from '@/cms/components/ConfirmDialog';
import ProductTable from '@/cms/components/products/ProductTable';
import { fetchCurrentUser } from '@/cms/lib/api-auth';
import { productsApi } from '@/cms/lib/products-api';

export default function AdminProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPage />
    </Suspense>
  );
}

function ProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inTrash = searchParams.get('trash') === 'true';

  const confirm = useConfirm();
  const showToast = useToast();
  const [items, setItems] = useState<ProductListItemCms[] | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [announce, setAnnounce] = useState('');

  const load = useCallback(
    () =>
      productsApi
        .list({ trash: inTrash })
        .then(setItems)
        .catch((err: unknown) => showToast(err instanceof Error ? err.message : 'Không tải được sản phẩm', 'error')),
    [inTrash, showToast],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    fetchCurrentUser()
      .then((u) => setIsAdmin(u?.role === 'ADMIN'))
      .catch(() => setIsAdmin(false));
  }, []);

  const toggleTrash = () => {
    if (inTrash) {
      router.push(pathname);
    } else {
      router.push(`${pathname}?trash=true`);
    }
  };

  const move = async (p: ProductListItemCms, dir: -1 | 1) => {
    if (!items || inTrash) return;
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

  const moveToTrash = (p: ProductListItemCms) =>
    confirm({
      title: 'Chuyển sản phẩm vào thùng rác?',
      description: `“${p.locales.vi?.name || p.id}” sẽ bị ẩn khỏi website ngay (cả bản tiếng Anh). Bạn có thể khôi phục trong thùng rác.`,
      confirmText: 'Chuyển vào thùng rác',
      variant: 'warning',
      onConfirm: async () => {
        await productsApi.remove(p.id);
        await load();
      },
      successMessage: 'Đã chuyển sản phẩm vào thùng rác',
    });

  const restore = (p: ProductListItemCms) =>
    confirm({
      title: 'Khôi phục sản phẩm?',
      description: `“${p.locales.vi?.name || p.id}” sẽ trở lại danh sách với trạng thái xuất bản như trước khi xoá.`,
      confirmText: 'Khôi phục',
      variant: 'info',
      onConfirm: async () => {
        await productsApi.restore(p.id);
        await load();
      },
      successMessage: 'Đã khôi phục sản phẩm',
    });

  const purge = (p: ProductListItemCms) =>
    confirm({
      title: 'Xoá vĩnh viễn sản phẩm?',
      description: `“${p.locales.vi?.name || p.id}”, mọi bản dịch, thông số kỹ thuật và độ dày sẽ bị xoá hẳn khỏi cơ sở dữ liệu, không thể khôi phục.`,
      confirmText: 'Xoá vĩnh viễn',
      variant: 'danger',
      onConfirm: async () => {
        await productsApi.purge(p.id);
        await load();
      },
      successMessage: 'Đã xoá vĩnh viễn sản phẩm',
    });

  const published = items?.filter((p) => p.locales.vi?.status === 'PUBLISHED').length ?? 0;
  const missingEn = items?.filter((p) => !p.locales.en).length ?? 0;
  const add = () => router.push('/admin/products/new');

  return (
    <AdminPage
      title={inTrash ? 'Thùng Rác Sản Phẩm' : 'Sản Phẩm MGO'}
      subtitle={
        inTrash
          ? 'Danh sách các dòng sản phẩm đã bị ẩn. Bạn có thể khôi phục hoặc xoá vĩnh viễn.'
          : 'Dòng tấm, độ dày, giá, thông số kỹ thuật và thứ tự hiển thị trên website'
      }
    >
      <AdminPageBand
        title={
          <p className="text-sm text-slate-700" aria-live="polite">
            {items ? (
              inTrash ? (
                <>
                  <strong className="text-rose-900">{items.length}</strong> sản phẩm trong thùng rác · Đã bị ẩn khỏi website
                </>
              ) : (
                <>
                  <strong className="text-slate-900">{items.length}</strong> sản phẩm · {published} đang hiện trên web
                  {missingEn > 0 && ` · ${missingEn} chưa có bản tiếng Anh`}
                </>
              )
            ) : (
              'Đang tải…'
            )}
          </p>
        }
        label={inTrash ? 'Thùng rác sản phẩm' : 'Sản phẩm'}
        actions={
          <>
            <button
              type="button"
              onClick={toggleTrash}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03] ${
                inTrash
                  ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Trash2 size={13} aria-hidden="true" />
              {inTrash ? 'Quay lại danh sách' : 'Thùng rác'}
            </button>
            {!inTrash && (
              <button
                type="button"
                onClick={add}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#4E7202] px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#3F5E02] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03]"
              >
                Thêm sản phẩm
              </button>
            )}
          </>
        }
      />
      <AdminPageBody>
        <ProductTable
          items={items}
          isAdmin={isAdmin}
          reordering={reordering}
          inTrash={inTrash}
          onMove={move}
          onDelete={moveToTrash}
          onRestore={restore}
          onPurge={purge}
          onAdd={add}
          onBackToList={toggleTrash}
        />
        <p className="sr-only" aria-live="polite">
          {announce}
        </p>
      </AdminPageBody>
    </AdminPage>
  );
}
