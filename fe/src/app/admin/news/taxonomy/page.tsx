'use client';

import React, { useEffect, useState } from 'react';
import { Check, Loader2, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import AdminHeader from '@/cms/components/AdminHeader';
import { useConfirm, useToast } from '@/cms/components/ConfirmDialog';
import ImageUploadField from '@/cms/components/shared/ImageUploadField';
import { inputClass } from '@/cms/components/shared/form-styles';
import Skeleton from '@/cms/components/ui/Skeleton';
import { fetchCurrentUser } from '@/cms/lib/api-auth';
import { isConflict } from '@/cms/lib/api-client';
import { newsApi, uploadContentImage, type AuthorInput } from '@/cms/lib/news-api';
import type { NewsAuthorCms, NewsTagCms } from '@/types/news';

type Tab = 'tags' | 'authors';
const errorText = (err: unknown) =>
  isConflict(err) ? 'Dữ liệu vừa được người khác sửa — đã tải lại bản mới nhất' : err instanceof Error ? err.message : 'Thao tác thất bại';

export default function AdminNewsTaxonomyPage() {
  const [tab, setTab] = useState<Tab>('tags');
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    fetchCurrentUser().then((u) => setIsAdmin(u?.role === 'ADMIN')).catch(() => setIsAdmin(false));
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <AdminHeader title="Tag & Tác Giả" subtitle="Tag gắn bài viết và hồ sơ tác giả (chức danh, tiểu sử) theo từng ngôn ngữ" />
      <div className="p-4 sm:p-6 space-y-4">
        <div role="tablist" aria-label="Loại dữ liệu" className="inline-flex gap-1 bg-slate-200/60 p-1 rounded-lg">
          {(
            [
              ['tags', 'Tag bài viết'],
              ['authors', 'Tác giả'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-md text-xs font-bold cursor-pointer ${tab === id ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === 'tags' ? <TagsPanel /> : <AuthorsPanel isAdmin={isAdmin} />}
      </div>
    </div>
  );
}

// ─── Tag ────────────────────────────────────────────────────────────────────

function TagsPanel() {
  const confirm = useConfirm();
  const showToast = useToast();
  const [tags, setTags] = useState<NewsTagCms[] | null>(null);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<{ id: string | null; vi: string; en: string; version: string | null } | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = (search = q) =>
    newsApi
      .tags(search)
      .then(setTags)
      .catch((err: unknown) => showToast(errorText(err), 'error'));

  useEffect(() => {
    const t = setTimeout(() => void reload(q), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tải lại theo từ khoá
  }, [q]);

  const save = async () => {
    if (!editing || !editing.vi.trim()) return showToast('Nhập tên tag tiếng Việt', 'error');
    setSaving(true);
    const body = { translations: { vi: { name: editing.vi.trim() }, en: editing.en.trim() ? { name: editing.en.trim() } : null } };
    try {
      if (editing.id) await newsApi.updateTag(editing.id, body, editing.version!);
      else await newsApi.createTag(body);
      setEditing(null);
      showToast('Đã lưu tag', 'success');
    } catch (err) {
      showToast(errorText(err), 'error');
    } finally {
      setSaving(false);
      void reload();
    }
  };

  const remove = (t: NewsTagCms) =>
    confirm({
      title: 'Xoá tag?',
      description: `Tag “${t.translations.vi?.name}” sẽ bị gỡ khỏi ${t.postCount} bài viết.`,
      confirmText: 'Xoá tag',
      variant: 'danger',
      onConfirm: async () => {
        await newsApi.removeTag(t.id);
        await reload();
      },
      successMessage: 'Đã xoá tag',
    });

  const editRow = (
    <div className="flex items-center gap-2 flex-wrap">
      <input autoFocus value={editing?.vi ?? ''} onChange={(e) => setEditing((s) => s && { ...s, vi: e.target.value })} placeholder="Tên tiếng Việt *" aria-label="Tên tag tiếng Việt" className={`${inputClass} flex-1 min-w-40`} />
      <input value={editing?.en ?? ''} onChange={(e) => setEditing((s) => s && { ...s, en: e.target.value })} placeholder="English name" aria-label="Tên tag tiếng Anh" className={`${inputClass} flex-1 min-w-40`} lang="en" />
      <button type="button" onClick={save} disabled={saving} aria-label="Lưu tag" className="p-2 rounded-lg bg-[#5F8A03] text-white cursor-pointer disabled:opacity-50">
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
      </button>
      <button type="button" onClick={() => setEditing(null)} aria-label="Huỷ" className="p-2 rounded-lg border border-slate-300 text-slate-600 cursor-pointer">
        <X size={14} />
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden max-w-4xl">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tag…" aria-label="Tìm tag" className="w-60 pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]" />
        </div>
        <button type="button" onClick={() => setEditing({ id: null, vi: '', en: '', version: null })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold cursor-pointer">
          <Plus size={13} aria-hidden="true" /> Thêm tag
        </button>
      </div>
      {editing && !editing.id && <div className="px-4 py-3 border-b border-slate-100 bg-[#F4F9E8]/50">{editRow}</div>}
      <ul className="divide-y divide-slate-100">
        {!tags && Array.from({ length: 6 }, (_, i) => <li key={i} className="px-4 py-3"><Skeleton className="h-5 w-full rounded" /></li>)}
        {tags?.length === 0 && <li className="px-4 py-10 text-center text-xs text-slate-500">Không có tag nào</li>}
        {tags?.map((t) =>
          editing?.id === t.id ? (
            <li key={t.id} className="px-4 py-3 bg-[#F4F9E8]/50">{editRow}</li>
          ) : (
            <li key={t.id} className="px-4 py-2.5 flex items-center gap-3 text-xs">
              <span className="flex-1 min-w-0">
                <span className="font-semibold text-slate-800">{t.translations.vi?.name}</span>
                <span className="ml-2 text-slate-500" lang="en">{t.translations.en?.name ?? <em className="text-amber-700">chưa dịch</em>}</span>
              </span>
              <span className="text-slate-500 tabular-nums">{t.postCount} bài</span>
              <button type="button" onClick={() => setEditing({ id: t.id, vi: t.translations.vi?.name ?? '', en: t.translations.en?.name ?? '', version: t.version })} aria-label="Sửa tag" className="p-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-[#5F8A03] cursor-pointer">
                <Pencil size={13} />
              </button>
              <button type="button" onClick={() => remove(t)} aria-label="Xoá tag" className="p-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-rose-600 cursor-pointer">
                <Trash2 size={13} />
              </button>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

// ─── Tác giả ────────────────────────────────────────────────────────────────

interface AuthorForm {
  id: string | null;
  version: string | null;
  name: string;
  avatarUrl: string;
  isActive: boolean;
  vi: { jobTitle: string; bio: string };
  en: { jobTitle: string; bio: string };
}

const EMPTY_AUTHOR: AuthorForm = { id: null, version: null, name: '', avatarUrl: '', isActive: true, vi: { jobTitle: '', bio: '' }, en: { jobTitle: '', bio: '' } };

function AuthorsPanel({ isAdmin }: { isAdmin: boolean }) {
  const confirm = useConfirm();
  const showToast = useToast();
  const [authors, setAuthors] = useState<NewsAuthorCms[] | null>(null);
  const [form, setForm] = useState<AuthorForm | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = () =>
    newsApi
      .authors()
      .then(setAuthors)
      .catch((err: unknown) => showToast(errorText(err), 'error'));

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ tải lần đầu
  }, []);

  const open = (a: NewsAuthorCms | null) => {
    setAvatarFile(null);
    setForm(
      a
        ? {
            id: a.id,
            version: a.version,
            name: a.name,
            avatarUrl: a.avatarUrl ?? '',
            isActive: a.isActive,
            vi: { jobTitle: a.translations.vi?.jobTitle ?? '', bio: a.translations.vi?.bio ?? '' },
            en: { jobTitle: a.translations.en?.jobTitle ?? '', bio: a.translations.en?.bio ?? '' },
          }
        : EMPTY_AUTHOR,
    );
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !form.name.trim()) return showToast('Nhập tên tác giả', 'error');
    setSaving(true);
    try {
      const avatarUrl = avatarFile ? (await uploadContentImage(avatarFile)).url : form.avatarUrl || null;
      const body: AuthorInput = {
        name: form.name.trim(),
        avatarUrl,
        isActive: form.isActive,
        translations: { vi: form.vi, en: form.en },
      };
      if (form.id) await newsApi.updateAuthor(form.id, body, form.version!);
      else await newsApi.createAuthor(body);
      setForm(null);
      showToast('Đã lưu tác giả', 'success');
    } catch (err) {
      showToast(errorText(err), 'error');
    } finally {
      setSaving(false);
      void reload();
    }
  };

  const remove = (a: NewsAuthorCms) =>
    confirm({
      title: 'Xoá tác giả?',
      description: `${a.postCount} bài của “${a.name}” sẽ chuyển về “không ghi tác giả”.`,
      confirmText: 'Xoá tác giả',
      variant: 'danger',
      onConfirm: async () => {
        await newsApi.removeAuthor(a.id);
        await reload();
      },
      successMessage: 'Đã xoá tác giả',
    });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-6 items-start">
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900">Tác giả</h2>
          <button type="button" onClick={() => open(null)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold cursor-pointer">
            <Plus size={13} aria-hidden="true" /> Thêm tác giả
          </button>
        </div>
        <ul className="divide-y divide-slate-100">
          {!authors && Array.from({ length: 4 }, (_, i) => <li key={i} className="px-4 py-3"><Skeleton className="h-10 w-full rounded" /></li>)}
          {authors?.length === 0 && <li className="px-4 py-10 text-center text-xs text-slate-500">Chưa có tác giả</li>}
          {authors?.map((a) => (
            <li key={a.id} className={`px-4 py-3 flex items-center gap-3 text-xs ${form?.id === a.id ? 'bg-[#F4F9E8]/60' : ''}`}>
              {a.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- ảnh MinIO trong CMS
                <img src={a.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-200" />
              ) : (
                <span className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500">{a.name.charAt(0)}</span>
              )}
              <span className="flex-1 min-w-0">
                <span className="block font-semibold text-slate-800">
                  {a.name} {!a.isActive && <span className="text-[10px] uppercase text-slate-400">(ẩn)</span>}
                </span>
                <span className="block text-slate-500 truncate">{a.translations.vi?.jobTitle ?? '—'}</span>
              </span>
              <span className="text-slate-500 tabular-nums">{a.postCount} bài</span>
              <button type="button" onClick={() => open(a)} aria-label="Sửa tác giả" className="p-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-[#5F8A03] cursor-pointer">
                <Pencil size={13} />
              </button>
              {isAdmin && (
                <button type="button" onClick={() => remove(a)} aria-label="Xoá tác giả" className="p-1.5 rounded text-slate-500 hover:bg-slate-100 hover:text-rose-600 cursor-pointer">
                  <Trash2 size={13} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {form ? (
        <form onSubmit={save} className="bg-white rounded-xl border border-slate-300 shadow-2xs p-5 space-y-4 xl:sticky xl:top-20">
          <h2 className="text-sm font-bold text-slate-900">{form.id ? 'Sửa tác giả' : 'Tác giả mới'}</h2>
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-700">Tên hiển thị * (không dịch)</span>
            <input value={form.name} maxLength={120} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </label>
          <ImageUploadField label="Ảnh đại diện" aspect="aspect-square max-w-32" currentUrl={form.avatarUrl || null} file={avatarFile} onPick={setAvatarFile} onClear={() => setAvatarFile(null)} />
          {(['vi', 'en'] as const).map((l) => (
            <fieldset key={l} className="space-y-2 rounded-lg border border-slate-200 p-3" lang={l}>
              <legend className="px-1 text-[11px] font-black uppercase tracking-wide text-slate-500">{l === 'vi' ? 'Tiếng Việt' : 'English'}</legend>
              <input value={form[l].jobTitle} maxLength={120} placeholder={l === 'vi' ? 'Chức danh, vd: Kỹ sư PCCC' : 'Job title, e.g. Fire safety engineer'} aria-label={`Chức danh (${l})`} onChange={(e) => setForm({ ...form, [l]: { ...form[l], jobTitle: e.target.value } })} className={inputClass} />
              <textarea rows={3} value={form[l].bio} maxLength={1000} placeholder={l === 'vi' ? 'Tiểu sử ngắn (kinh nghiệm, chứng chỉ) — tăng độ tin cậy E-E-A-T' : 'Short bio'} aria-label={`Tiểu sử (${l})`} onChange={(e) => setForm({ ...form, [l]: { ...form[l], bio: e.target.value } })} className={inputClass} />
            </fieldset>
          ))}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input type="checkbox" className="accent-[#5F8A03]" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Đang hoạt động (hiện trong danh sách chọn tác giả)
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setForm(null)} className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">Huỷ</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5">
              {saving && <Loader2 size={13} className="animate-spin" />} Lưu tác giả
            </button>
          </div>
        </form>
      ) : (
        <div className="hidden xl:block rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">Chọn tác giả để sửa, hoặc bấm “Thêm tác giả”.</div>
      )}
    </div>
  );
}
