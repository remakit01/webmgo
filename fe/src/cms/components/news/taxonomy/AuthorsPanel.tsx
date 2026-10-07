'use client';

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { AlertTriangle, CircleCheck, EyeOff, Pencil, Trash2, UserPlus } from 'lucide-react';
import { formatNumber } from '@remak/shared/date';
import { useConfirm, useToast } from '@/cms/components/ConfirmDialog';
import IconAction from '@/cms/components/shared/IconAction';
import Skeleton from '@/cms/components/ui/Skeleton';
import { newsApi } from '@/cms/lib/news-api';
import type { NewsAuthorCms } from '@/types/news';
import AuthorEditor from './AuthorEditor';
import { emptyAuthorForm, hasProfile, toAuthorForm, type AuthorForm } from './author-form';

export interface AuthorsPanelHandle {
  add: () => void;
}

let editorKey = 0;

/**
 * Tab Tác giả: danh sách (ảnh, chức danh, trạng thái, nhắc thiếu tiểu sử) + khung sửa dính bên phải.
 * Deep link ?edit=<id|new> do trang cha ghi (onEditChange).
 */
const AuthorsPanel = forwardRef<
  AuthorsPanelHandle,
  {
    isAdmin: boolean;
    initialEdit: string | null;
    onEditChange: (edit: string | null) => void;
    onDirtyChange: (dirty: boolean) => void;
    onTotal: (n: number) => void;
  }
>(function AuthorsPanel({ isAdmin, initialEdit, onEditChange, onDirtyChange, onTotal }, ref) {
  const confirm = useConfirm();
  const showToast = useToast();
  const [items, setItems] = useState<NewsAuthorCms[] | null>(null);
  const [editing, setEditing] = useState<{ key: number; form: AuthorForm } | null>(null);
  const [dirty, setDirty] = useState(false);
  const firstEdit = useRef(initialEdit);

  const reportDirty = useCallback(
    (d: boolean) => {
      setDirty(d);
      onDirtyChange(d);
    },
    [onDirtyChange],
  );

  const open = useCallback(
    (form: AuthorForm) => {
      setEditing({ key: ++editorKey, form });
      reportDirty(false);
      onEditChange(form.id ?? 'new');
    },
    [onEditChange, reportDirty],
  );
  const close = useCallback(() => {
    setEditing(null);
    reportDirty(false);
    onEditChange(null);
  }, [onEditChange, reportDirty]);

  const load = useCallback(
    () =>
      newsApi
        .authors()
        .then((list) => {
          setItems(list);
          onTotal(list.length);
          return list;
        })
        .catch((err: unknown) => {
          showToast(err instanceof Error ? err.message : 'Không tải được tác giả', 'error');
          return null;
        }),
    [showToast, onTotal],
  );

  useEffect(() => {
    void load().then((list) => {
      const edit = firstEdit.current;
      firstEdit.current = null;
      if (edit === 'new') open(emptyAuthorForm());
      else if (edit) {
        const found = list?.find((a) => a.id === edit);
        if (found) open(toAuthorForm(found));
        else onEditChange(null);
      }
    });
  }, [load, open, onEditChange]);

  const guard = (action: () => void) => {
    if (!dirty) return action();
    confirm({ title: 'Bỏ thay đổi chưa lưu?', description: 'Những gì bạn vừa nhập cho tác giả đang mở sẽ mất.', confirmText: 'Bỏ thay đổi', variant: 'warning', onConfirm: action });
  };

  useImperativeHandle(ref, () => ({ add: () => guard(() => open(emptyAuthorForm())) }));

  const remove = (a: NewsAuthorCms) =>
    confirm({
      title: 'Xoá tác giả?',
      description: a.postCount
        ? `${a.postCount} bài của “${a.name}” sẽ chuyển về “không ghi tác giả”. Không khôi phục được.`
        : `Tác giả “${a.name}” chưa đứng tên bài nào.`,
      confirmText: 'Xoá tác giả',
      variant: 'danger',
      onConfirm: async () => {
        await newsApi.removeAuthor(a.id);
        if (editing?.form.id === a.id) close();
        await load();
      },
      successMessage: 'Đã xoá tác giả',
    });

  const onSaved = async (saved: NewsAuthorCms, created: boolean) => {
    showToast(created ? 'Đã tạo tác giả' : 'Đã lưu tác giả', 'success');
    open(toAuthorForm(saved));
    await load();
  };

  const reloadLatest = async () => {
    const list = await load();
    const latest = editing?.form.id ? list?.find((a) => a.id === editing.form.id) : null;
    if (latest) open(toAuthorForm(latest));
    else close();
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_400px] items-start gap-6">
      {items?.length === 0 ? (
        <div className="rounded-xl border border-slate-300 bg-white px-6 py-16 text-center shadow-2xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-500">
            <UserPlus size={24} aria-hidden="true" />
          </div>
          <h2 className="mt-3 text-sm font-semibold text-slate-900">Chưa có tác giả nào</h2>
          <p className="mt-1.5 text-sm text-slate-600">Tác giả có chức danh và tiểu sử giúp bài viết đáng tin hơn với Google và AI.</p>
          <button
            type="button"
            onClick={() => open(emptyAuthorForm())}
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#4E7202] px-4 text-sm font-semibold text-white hover:bg-[#3F5E02] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03]"
          >
            <UserPlus size={16} aria-hidden="true" /> Thêm tác giả
          </button>
        </div>
      ) : (
        <div className="overflow-clip rounded-xl border border-slate-300 bg-white shadow-2xs">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Tác giả bài viết</caption>
            <thead className="bg-slate-100 text-xs font-semibold text-slate-700 shadow-[inset_0_-1px_0_var(--color-slate-300)]">
              <tr>
                <th scope="col" className="px-4 py-3">Tác giả</th>
                <th scope="col" className="w-44 px-4 py-3">Hồ sơ</th>
                <th scope="col" className="w-24 px-4 py-3 text-right">Bài viết</th>
                <th scope="col" className="w-28 px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items === null
                ? Array.from({ length: 4 }, (_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <Skeleton className="h-5 w-48 rounded" />
                        </div>
                      </td>
                      <td className="px-4 py-3"><Skeleton className="h-6 w-28 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="ml-auto h-5 w-8 rounded" /></td>
                      <td className="px-4 py-3"><Skeleton className="ml-auto h-8 w-20 rounded" /></td>
                    </tr>
                  ))
                : items.map((a) => {
                    const current = editing?.form.id === a.id;
                    const vi = a.translations.vi;
                    const en = a.translations.en;
                    return (
                      <tr
                        key={a.id}
                        aria-current={current || undefined}
                        className={`align-top transition-colors ${current ? 'bg-[#F4F9E8] shadow-[inset_3px_0_0_#4E7202]' : 'hover:bg-slate-50'}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-3">
                            {a.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element -- ảnh MinIO trong CMS
                              <img src={a.avatarUrl} alt="" className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover" />
                            ) : (
                              <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-remak-green-light text-base font-black text-remak-green-dark">
                                {a.name.charAt(0)}
                              </span>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">{a.name}</p>
                              {vi?.jobTitle && <p className="text-xs text-slate-700">{vi.jobTitle}</p>}
                              {en?.jobTitle && (
                                <p className="text-xs text-slate-600" lang="en">
                                  <span className="font-semibold">EN:</span> {en.jobTitle}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col items-start gap-1">
                            {a.isActive ? (
                              <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-[#7CB305]/40 bg-[#F4F9E8] px-2 py-0.5 text-xs font-semibold text-[#3F5E02]">
                                <CircleCheck size={13} aria-hidden="true" /> Đang hoạt động
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                <EyeOff size={13} aria-hidden="true" /> Đã ẩn
                              </span>
                            )}
                            {!hasProfile(vi) && (
                              <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                                <AlertTriangle size={13} aria-hidden="true" /> Chưa có tiểu sử
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <span className={`text-base font-bold ${a.postCount ? 'text-slate-900' : 'text-slate-500'}`}>{formatNumber(a.postCount)}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex justify-end gap-1">
                            <IconAction
                              label={`Sửa “${a.name}”`}
                              icon={Pencil}
                              onClick={() => {
                                if (!current) guard(() => open(toAuthorForm(a)));
                              }}
                              tipAlign={isAdmin ? 'center' : 'end'}
                            />
                            {isAdmin && <IconAction label={`Xoá “${a.name}”`} icon={Trash2} danger onClick={() => remove(a)} tipAlign="end" />}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      )}

      {editing ? (
        <AuthorEditor
          key={editing.key}
          initial={editing.form}
          onClose={() => guard(close)}
          onSaved={onSaved}
          onDirtyChange={reportDirty}
          onReloadLatest={reloadLatest}
        />
      ) : (
        <div className="sticky top-[calc(var(--admin-sticky-top)+1.5rem)] rounded-xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center">
          <p className="text-sm font-semibold text-slate-800">Chưa chọn tác giả</p>
          <p className="mt-1 text-sm text-slate-600">Bấm biểu tượng bút ở một dòng để sửa, hoặc “Thêm tác giả”.</p>
        </div>
      )}
    </div>
  );
});

export default AuthorsPanel;
