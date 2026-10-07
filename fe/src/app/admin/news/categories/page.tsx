'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { FolderPlus } from 'lucide-react';
import { AdminPage, AdminPageBand, AdminPageBody } from '@/cms/components/layout/AdminPage';
import { useConfirm, useToast } from '@/cms/components/ConfirmDialog';
import CategoryEditor from '@/cms/components/news/categories/CategoryEditor';
import CategoryTable from '@/cms/components/news/categories/CategoryTable';
import { emptyCategoryForm, toCategoryForm, type CategoryForm } from '@/cms/components/news/categories/category-form';
import { fetchCurrentUser } from '@/cms/lib/api-auth';
import { newsApi } from '@/cms/lib/news-api';
import type { NewsCategoryCms } from '@/types/news';

// useSearchParams (deep link ?edit=) cần ranh giới Suspense (Next 16)
export default function AdminNewsCategoriesPage() {
  return (
    <Suspense fallback={null}>
      <CategoriesPage />
    </Suspense>
  );
}

let editorKey = 0;

function CategoriesPage() {
  const confirm = useConfirm();
  const showToast = useToast();
  const params = useSearchParams();
  const pathname = usePathname();
  const [items, setItems] = useState<NewsCategoryCms[] | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState<{ key: number; form: CategoryForm } | null>(null);
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
    (form: CategoryForm) => {
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
      newsApi
        .categories()
        .then((list) => {
          setItems(list);
          return list;
        })
        .catch((err: unknown) => {
          showToast(err instanceof Error ? err.message : 'Không tải được chuyên mục', 'error');
          return null;
        }),
    [showToast],
  );

  useEffect(() => {
    void load().then((list) => {
      const edit = initialEdit.current;
      if (edit === 'new') open(emptyCategoryForm());
      else if (edit) {
        const found = list?.find((c) => c.id === edit);
        if (found) open(toCategoryForm(found));
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
      description: 'Những gì bạn vừa nhập cho chuyên mục đang mở sẽ mất.',
      confirmText: 'Bỏ thay đổi',
      variant: 'warning',
      onConfirm: action,
    });
  };

  const move = async (c: NewsCategoryCms, dir: -1 | 1) => {
    if (!items) return;
    const from = items.findIndex((x) => x.id === c.id);
    const to = from + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    setItems(next); // cập nhật ngay trên giao diện
    setReordering(true);
    try {
      setItems(await newsApi.reorderCategories(next.map((x) => x.id)));
      setAnnounce(`Đã chuyển “${c.translations.vi?.name}” ${dir < 0 ? 'lên' : 'xuống'} vị trí ${to + 1}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không đổi được thứ tự', 'error');
      await load();
    } finally {
      setReordering(false);
    }
  };

  const remove = (c: NewsCategoryCms) =>
    confirm({
      title: 'Xoá chuyên mục?',
      description: `Chuyên mục “${c.translations.vi?.name}” sẽ bị xoá vĩnh viễn, không khôi phục được.`,
      confirmText: 'Xoá chuyên mục',
      variant: 'danger',
      onConfirm: async () => {
        await newsApi.removeCategory(c.id);
        if (editing?.form.id === c.id) close();
        await load();
      },
      successMessage: 'Đã xoá chuyên mục',
    });

  const onSaved = async (saved: NewsCategoryCms, created: boolean) => {
    showToast(created ? 'Đã tạo chuyên mục' : 'Đã lưu chuyên mục', 'success');
    open(toCategoryForm(saved)); // giữ khung mở với bản vừa lưu (version mới)
    await load();
  };

  const reloadLatest = async () => {
    const list = await load();
    const id = editing?.form.id;
    const latest = id ? list?.find((c) => c.id === id) : null;
    if (latest) open(toCategoryForm(latest));
    else close();
  };

  const active = items?.filter((c) => c.isActive).length ?? 0;

  return (
    <AdminPage title="Chuyên Mục Tin Tức" subtitle="Tên, đường dẫn, màu nhãn và thứ tự chuyên mục theo từng ngôn ngữ">
      <AdminPageBand
        title={
          <p className="text-sm text-slate-700" aria-live="polite">
            {items ? (
              <>
                <strong className="text-slate-900">{items.length}</strong> chuyên mục · {active} đang hiển thị
                {items.length - active > 0 && ` · ${items.length - active} đang ẩn`}
              </>
            ) : (
              'Đang tải…'
            )}
          </p>
        }
        label="Chuyên mục"
        actions={
          <button
            type="button"
            onClick={() => guard(() => open(emptyCategoryForm()))}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#4E7202] px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#3F5E02] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03]"
          >
            <FolderPlus size={14} aria-hidden="true" /> Thêm chuyên mục
          </button>
        }
      />

      <AdminPageBody className="grid grid-cols-[minmax(0,1fr)_400px] items-start gap-6">
        <div className="min-w-0 space-y-2">
          <CategoryTable
            items={items}
            editingId={editing?.form.id ?? null}
            isAdmin={isAdmin}
            reordering={reordering}
            onMove={move}
            onEdit={(c) => {
              if (editing?.form.id !== c.id) guard(() => open(toCategoryForm(c)));
            }}
            onDelete={remove}
            onAdd={() => guard(() => open(emptyCategoryForm()))}
          />
          <p className="sr-only" aria-live="polite">
            {announce}
          </p>
        </div>

        {editing ? (
          <CategoryEditor
            key={editing.key}
            initial={editing.form}
            onClose={() => guard(close)}
            onSaved={onSaved}
            onDirtyChange={setDirty}
            onReloadLatest={reloadLatest}
          />
        ) : (
          <div className="sticky top-[calc(var(--admin-sticky-top)+1.5rem)] rounded-xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-slate-800">Chưa chọn chuyên mục</p>
            <p className="mt-1 text-sm text-slate-600">Bấm biểu tượng bút ở một dòng để sửa, hoặc “Thêm chuyên mục”.</p>
          </div>
        )}
      </AdminPageBody>
    </AdminPage>
  );
}
