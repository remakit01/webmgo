'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ListPlus } from 'lucide-react';
import { SPEC_OPTION_GROUPS, SPEC_OPTION_GROUP_LABEL, type SpecOptionCms, type SpecOptionGroup } from '@remak/shared/contracts/product';
import { AdminPage, AdminPageBand, AdminPageBody } from '@/cms/components/layout/AdminPage';
import { useConfirm, useToast } from '@/cms/components/ConfirmDialog';
import SpecOptionEditor from '@/cms/components/products/spec-options/SpecOptionEditor';
import SpecOptionTable from '@/cms/components/products/spec-options/SpecOptionTable';
import { emptySpecOptionForm, toSpecOptionForm, type SpecOptionForm } from '@/cms/components/products/spec-options/spec-option-form';
import { fetchCurrentUser } from '@/cms/lib/api-auth';
import { productsApi } from '@/cms/lib/products-api';

// useSearchParams (deep link ?group=) cần ranh giới Suspense (Next 16)
export default function AdminSpecOptionsPage() {
  return (
    <Suspense fallback={null}>
      <SpecOptionsPage />
    </Suspense>
  );
}

let editorKey = 0;
const isGroup = (v: string | null): v is SpecOptionGroup => !!v && (SPEC_OPTION_GROUPS as readonly string[]).includes(v);

function SpecOptionsPage() {
  const confirm = useConfirm();
  const showToast = useToast();
  const params = useSearchParams();
  const pathname = usePathname();
  // Deep link ?group= chỉ đọc lúc mở trang
  const [group, setGroup] = useState<SpecOptionGroup>(() => {
    const g = params.get('group');
    return isGroup(g) ? g : SPEC_OPTION_GROUPS[0];
  });
  const [items, setItems] = useState<SpecOptionCms[] | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState<{ key: number; form: SpecOptionForm } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [announce, setAnnounce] = useState('');

  const load = useCallback(
    () =>
      productsApi
        .specOptions()
        .then((list) => {
          setItems(list);
          return list;
        })
        .catch((err: unknown) => {
          showToast(err instanceof Error ? err.message : 'Không tải được danh mục thông số', 'error');
          return null;
        }),
    [showToast],
  );

  useEffect(() => {
    void load();
    fetchCurrentUser().then((u) => setIsAdmin(u?.role === 'ADMIN')).catch(() => setIsAdmin(false));
  }, [load]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const open = (form: SpecOptionForm) => {
    setEditing({ key: ++editorKey, form });
    setDirty(false);
  };
  const close = () => {
    setEditing(null);
    setDirty(false);
  };

  /** Đang có thay đổi chưa lưu -> hỏi trước khi bỏ */
  const guard = (action: () => void) => {
    if (!dirty) return action();
    confirm({
      title: 'Bỏ thay đổi chưa lưu?',
      description: 'Những gì bạn vừa nhập cho giá trị đang mở sẽ mất.',
      confirmText: 'Bỏ thay đổi',
      variant: 'warning',
      onConfirm: action,
    });
  };

  const selectGroup = (g: SpecOptionGroup) =>
    guard(() => {
      setGroup(g);
      close();
      window.history.replaceState(null, '', `${pathname}?group=${g}`);
    });

  const groupItems = items?.filter((o) => o.group === group) ?? null;

  const move = async (o: SpecOptionCms, dir: -1 | 1) => {
    if (!groupItems) return;
    const from = groupItems.findIndex((x) => x.id === o.id);
    const to = from + dir;
    if (to < 0 || to >= groupItems.length) return;
    const next = [...groupItems];
    [next[from], next[to]] = [next[to], next[from]];
    setItems((all) => (all ? [...all.filter((x) => x.group !== group), ...next] : all)); // cập nhật ngay trên giao diện
    setReordering(true);
    try {
      setItems(await productsApi.reorderSpecOptions(group, next.map((x) => x.id)));
      setAnnounce(`Đã chuyển “${o.labels.vi ?? o.code}” ${dir < 0 ? 'lên' : 'xuống'} vị trí ${to + 1}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không đổi được thứ tự', 'error');
      await load();
    } finally {
      setReordering(false);
    }
  };

  const remove = (o: SpecOptionCms) =>
    confirm({
      title: 'Xoá giá trị?',
      description: `“${o.labels.vi ?? o.code}” sẽ bị xoá khỏi danh mục ${SPEC_OPTION_GROUP_LABEL[o.group].name}.`,
      confirmText: 'Xoá giá trị',
      variant: 'danger',
      onConfirm: async () => {
        await productsApi.removeSpecOption(o.id);
        if (editing?.form.id === o.id) close();
        await load();
      },
      successMessage: 'Đã xoá giá trị',
    });

  const onSaved = async (saved: SpecOptionCms, created: boolean) => {
    showToast(created ? 'Đã thêm giá trị' : 'Đã lưu giá trị', 'success');
    open(toSpecOptionForm(saved));
    await load();
  };

  const reloadLatest = async () => {
    const list = await load();
    const latest = list?.find((o) => o.id === editing?.form.id);
    if (latest) open(toSpecOptionForm(latest));
    else close();
  };

  const countOf = (g: SpecOptionGroup) => items?.filter((o) => o.group === g).length;
  const editingUsage = items?.find((o) => o.id === editing?.form.id)?.usageCount ?? 0;

  return (
    <AdminPage title="Danh Mục Thông Số" subtitle="Giá trị chọn được cho thông số sản phẩm: kiểu cạnh, màu lõi, pha tinh thể, mức VOC…">
      <AdminPageBand
        title={
          <p className="text-sm text-slate-700" aria-live="polite">
            <strong className="text-slate-900">{SPEC_OPTION_GROUP_LABEL[group].name}</strong> · dùng ở {SPEC_OPTION_GROUP_LABEL[group].fields}
          </p>
        }
        label="Danh mục thông số"
        actions={
          <button
            type="button"
            onClick={() => guard(() => open(emptySpecOptionForm(group)))}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#4E7202] px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#3F5E02] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03]"
          >
            <ListPlus size={14} aria-hidden="true" /> Thêm giá trị
          </button>
        }
      />

      <AdminPageBody className="grid grid-cols-[220px_minmax(0,1fr)_360px] items-start gap-6">
        <nav aria-label="Nhóm danh mục" className="sticky top-[calc(var(--admin-sticky-top)+1.5rem)] rounded-xl border border-slate-300 bg-white p-2 shadow-2xs">
          <ul className="space-y-0.5">
            {SPEC_OPTION_GROUPS.map((g) => {
              const on = g === group;
              return (
                <li key={g}>
                  <button
                    type="button"
                    aria-current={on || undefined}
                    onClick={() => selectGroup(g)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03] ${
                      on ? 'bg-[#F4F9E8] font-bold text-[#3F5E02]' : 'font-medium text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{SPEC_OPTION_GROUP_LABEL[g].name}</span>
                    <span className="text-xs tabular-nums text-slate-500">{countOf(g) ?? ''}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0 space-y-2">
          <SpecOptionTable
            items={groupItems}
            editingId={editing?.form.id ?? null}
            isAdmin={isAdmin}
            reordering={reordering}
            onMove={move}
            onEdit={(o) => {
              if (editing?.form.id !== o.id) guard(() => open(toSpecOptionForm(o)));
            }}
            onDelete={remove}
            onAdd={() => guard(() => open(emptySpecOptionForm(group)))}
          />
          <p className="sr-only" aria-live="polite">
            {announce}
          </p>
        </div>

        {editing ? (
          <SpecOptionEditor
            key={editing.key}
            initial={editing.form}
            usageCount={editingUsage}
            onClose={() => guard(close)}
            onSaved={onSaved}
            onDirtyChange={setDirty}
            onReloadLatest={reloadLatest}
          />
        ) : (
          <div className="sticky top-[calc(var(--admin-sticky-top)+1.5rem)] rounded-xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-slate-800">Chưa chọn giá trị</p>
            <p className="mt-1 text-sm text-slate-600">Bấm biểu tượng bút ở một dòng để sửa, hoặc “Thêm giá trị”.</p>
          </div>
        )}
      </AdminPageBody>
    </AdminPage>
  );
}
