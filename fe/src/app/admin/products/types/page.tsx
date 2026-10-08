'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Layers } from 'lucide-react';
import type { ProductTypeCms } from '@remak/shared/contracts/product';
import { AdminPage, AdminPageBand, AdminPageBody } from '@/cms/components/layout/AdminPage';
import { useConfirm, useToast } from '@/cms/components/ConfirmDialog';
import ProductTypeEditor from '@/cms/components/products/types/ProductTypeEditor';
import ProductTypeTable from '@/cms/components/products/types/ProductTypeTable';
import { emptyProductTypeForm, toProductTypeForm, type ProductTypeForm } from '@/cms/components/products/types/product-type-form';
import { fetchCurrentUser } from '@/cms/lib/api-auth';
import { productsApi } from '@/cms/lib/products-api';

// useSearchParams (deep link ?edit=) cần ranh giới Suspense (Next 16)
export default function AdminProductTypesPage() {
  return (
    <Suspense fallback={null}>
      <ProductTypesPage />
    </Suspense>
  );
}

let editorKey = 0;

function ProductTypesPage() {
  const confirm = useConfirm();
  const showToast = useToast();
  const params = useSearchParams();
  const pathname = usePathname();
  const [items, setItems] = useState<ProductTypeCms[] | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState<{ key: number; form: ProductTypeForm } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [announce, setAnnounce] = useState('');
  const initialEdit = useRef(params.get('edit'));

  // Deep link: ?edit=<id> | ?edit=new — giữ khi tải lại trang; replaceState không chồng lịch sử
  const setEditUrl = useCallback(
    (value: string | null) => window.history.replaceState(null, '', value ? `${pathname}?edit=${value}` : pathname),
    [pathname],
  );

  const open = useCallback(
    (form: ProductTypeForm) => {
      setEditing({ key: ++editorKey, form });
      setDirty(false);
      setEditUrl(form.id ?? 'new');
    },
    [setEditUrl],
  );
  const close = useCallback(() => {
    setEditing(null);
    setDirty(false);
    setEditUrl(null);
  }, [setEditUrl]);

  const load = useCallback(
    () =>
      productsApi
        .types()
        .then((list) => {
          setItems(list);
          return list;
        })
        .catch((err: unknown) => {
          showToast(err instanceof Error ? err.message : 'Không tải được loại sản phẩm', 'error');
          return null;
        }),
    [showToast],
  );

  useEffect(() => {
    void load().then((list) => {
      const edit = initialEdit.current;
      if (edit === 'new') open(emptyProductTypeForm());
      else if (edit) {
        const found = list?.find((t) => t.id === edit);
        if (found) open(toProductTypeForm(found));
        else setEditUrl(null);
      }
    });
    fetchCurrentUser().then((u) => setIsAdmin(u?.role === 'ADMIN')).catch(() => setIsAdmin(false));
  }, [load, open, setEditUrl]);

  // Rời trang khi còn thay đổi chưa lưu -> trình duyệt hỏi lại
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  /** Đang có thay đổi chưa lưu -> hỏi trước khi bỏ */
  const guard = (action: () => void) => {
    if (!dirty) return action();
    confirm({
      title: 'Bỏ thay đổi chưa lưu?',
      description: 'Những gì bạn vừa nhập cho loại sản phẩm đang mở sẽ mất.',
      confirmText: 'Bỏ thay đổi',
      variant: 'warning',
      onConfirm: action,
    });
  };

  const move = async (t: ProductTypeCms, dir: -1 | 1) => {
    if (!items) return;
    const from = items.findIndex((x) => x.id === t.id);
    const to = from + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    setItems(next); // cập nhật ngay trên giao diện
    setReordering(true);
    try {
      setItems(await productsApi.reorderTypes(next.map((x) => x.id)));
      setAnnounce(`Đã chuyển “${t.translations.vi?.name}” ${dir < 0 ? 'lên' : 'xuống'} vị trí ${to + 1}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không đổi được thứ tự', 'error');
      await load();
    } finally {
      setReordering(false);
    }
  };

  const remove = (t: ProductTypeCms) =>
    confirm({
      title: 'Xoá loại sản phẩm?',
      description: `Loại “${t.translations.vi?.name}” sẽ bị xoá vĩnh viễn, trang loại trên website trả 404.`,
      confirmText: 'Xoá loại',
      variant: 'danger',
      onConfirm: async () => {
        await productsApi.removeType(t.id);
        if (editing?.form.id === t.id) close();
        await load();
      },
      successMessage: 'Đã xoá loại sản phẩm',
    });

  const onSaved = async (saved: ProductTypeCms, created: boolean) => {
    showToast(created ? 'Đã tạo loại sản phẩm' : 'Đã lưu loại sản phẩm', 'success');
    open(toProductTypeForm(saved)); // giữ khung mở với bản vừa lưu (version mới)
    await load();
  };

  const reloadLatest = async () => {
    const list = await load();
    const id = editing?.form.id;
    const latest = id ? list?.find((t) => t.id === id) : null;
    if (latest) open(toProductTypeForm(latest));
    else close();
  };

  const active = items?.filter((t) => t.isActive).length ?? 0;
  const editingCount = items?.find((t) => t.id === editing?.form.id)?.productCount ?? 0;

  return (
    <AdminPage title="Loại Sản Phẩm" subtitle="Tên, đường dẫn, mẫu thông số và thứ tự loại sản phẩm theo từng ngôn ngữ">
      <AdminPageBand
        title={
          <p className="text-sm text-slate-700" aria-live="polite">
            {items ? (
              <>
                <strong className="text-slate-900">{items.length}</strong> loại · {active} đang hiển thị
                {items.length - active > 0 && ` · ${items.length - active} đang ẩn`}
              </>
            ) : (
              'Đang tải…'
            )}
          </p>
        }
        label="Loại sản phẩm"
        actions={
          <button
            type="button"
            onClick={() => guard(() => open(emptyProductTypeForm()))}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#4E7202] px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#3F5E02] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03]"
          >
            <Layers size={14} aria-hidden="true" /> Thêm loại sản phẩm
          </button>
        }
      />

      <AdminPageBody className="grid grid-cols-[minmax(0,1fr)_400px] items-start gap-6">
        <div className="min-w-0 space-y-2">
          <ProductTypeTable
            items={items}
            editingId={editing?.form.id ?? null}
            isAdmin={isAdmin}
            reordering={reordering}
            onMove={move}
            onEdit={(t) => {
              if (editing?.form.id !== t.id) guard(() => open(toProductTypeForm(t)));
            }}
            onDelete={remove}
            onAdd={() => guard(() => open(emptyProductTypeForm()))}
          />
          <p className="sr-only" aria-live="polite">
            {announce}
          </p>
        </div>

        {editing ? (
          <ProductTypeEditor
            key={editing.key}
            initial={editing.form}
            productCount={editingCount}
            onClose={() => guard(close)}
            onSaved={onSaved}
            onDirtyChange={setDirty}
            onReloadLatest={reloadLatest}
          />
        ) : (
          <div className="sticky top-[calc(var(--admin-sticky-top)+1.5rem)] rounded-xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-slate-800">Chưa chọn loại sản phẩm</p>
            <p className="mt-1 text-sm text-slate-600">Bấm biểu tượng bút ở một dòng để sửa, hoặc “Thêm loại sản phẩm”.</p>
          </div>
        )}
      </AdminPageBody>
    </AdminPage>
  );
}
