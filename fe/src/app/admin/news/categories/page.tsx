'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Locale } from '@remak/shared/locale';
import { isValidSlug, slugify } from '@remak/shared/slug';
import { AdminPage, AdminPageBody } from '@/cms/components/layout/AdminPage';
import { useConfirm, useToast } from '@/cms/components/ConfirmDialog';
import LocaleTabs from '@/cms/components/shared/LocaleTabs';
import { inputClass } from '@/cms/components/shared/form-styles';
import Skeleton from '@/cms/components/ui/Skeleton';
import { fetchCurrentUser } from '@/cms/lib/api-auth';
import { isConflict } from '@/cms/lib/api-client';
import { newsApi, type CategoryInput } from '@/cms/lib/news-api';
import { CATEGORY_COLOR_STYLES } from '@/lib/news-category-colors';
import { NEWS_CATEGORY_COLORS, type NewsCategoryCms, type NewsCategoryColor } from '@/types/news';


interface TranslationForm {
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
}
interface CategoryForm {
  id: string | null;
  version: string | null;
  color: NewsCategoryColor;
  sortOrder: number;
  isActive: boolean;
  translations: Record<Locale, TranslationForm>;
}

const EMPTY_TR: TranslationForm = { name: '', slug: '', description: '', seoTitle: '', seoDescription: '' };
const emptyForm = (sortOrder: number): CategoryForm => ({
  id: null,
  version: null,
  color: 'green',
  sortOrder,
  isActive: true,
  translations: { vi: EMPTY_TR, en: EMPTY_TR },
});

function toForm(c: NewsCategoryCms): CategoryForm {
  const tr = (l: Locale): TranslationForm => {
    const t = c.translations[l];
    return t ? { name: t.name, slug: t.slug, description: t.description ?? '', seoTitle: t.seoTitle ?? '', seoDescription: t.seoDescription ?? '' } : EMPTY_TR;
  };
  return { id: c.id, version: c.version, color: c.color, sortOrder: c.sortOrder, isActive: c.isActive, translations: { vi: tr('vi'), en: tr('en') } };
}

function toInput(f: CategoryForm): CategoryInput {
  const tr = (t: TranslationForm) => ({
    name: t.name.trim(),
    slug: t.slug.trim() || undefined,
    description: t.description.trim() || null,
    seoTitle: t.seoTitle.trim() || null,
    seoDescription: t.seoDescription.trim() || null,
  });
  return {
    color: f.color,
    sortOrder: f.sortOrder,
    isActive: f.isActive,
    // Bỏ trống tên tiếng Anh = xoá bản tiếng Anh (trang /en dùng tên tiếng Việt)
    translations: { vi: tr(f.translations.vi), en: f.translations.en.name.trim() ? tr(f.translations.en) : null },
  };
}

export default function AdminNewsCategoriesPage() {
  const confirm = useConfirm();
  const showToast = useToast();
  const [items, setItems] = useState<NewsCategoryCms[] | null>(null);
  const [form, setForm] = useState<CategoryForm | null>(null);
  const [tab, setTab] = useState<Locale>('vi');
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const reload = () =>
    newsApi
      .categories()
      .then(setItems)
      .catch((err: unknown) => showToast(err instanceof Error ? err.message : 'Không tải được chuyên mục', 'error'));

  useEffect(() => {
    void reload();
    fetchCurrentUser().then((u) => setIsAdmin(u?.role === 'ADMIN')).catch(() => setIsAdmin(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ tải lần đầu
  }, []);

  const setTr = (patch: Partial<TranslationForm>) =>
    setForm((f) => (f ? { ...f, translations: { ...f.translations, [tab]: { ...f.translations[tab], ...patch } } } : f));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (!form.translations.vi.name.trim()) {
      setTab('vi');
      return showToast('Nhập tên chuyên mục tiếng Việt', 'error');
    }
    for (const l of ['vi', 'en'] as const) {
      const s = form.translations[l].slug.trim();
      if (s && !isValidSlug(s)) {
        setTab(l);
        return showToast('Đường dẫn chỉ gồm chữ thường không dấu, số và gạch ngang', 'error');
      }
    }
    setSaving(true);
    try {
      if (form.id) await newsApi.updateCategory(form.id, toInput(form), form.version!);
      else await newsApi.createCategory(toInput(form));
      showToast(form.id ? 'Đã cập nhật chuyên mục' : 'Đã tạo chuyên mục', 'success');
      setForm(null);
      await reload();
    } catch (err) {
      showToast(isConflict(err) ? 'Chuyên mục vừa được người khác sửa — đã tải lại bản mới nhất' : err instanceof Error ? err.message : 'Lưu thất bại', 'error');
      if (isConflict(err)) {
        await reload();
        setForm(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = (c: NewsCategoryCms) =>
    confirm({
      title: 'Xoá chuyên mục?',
      description: `Chuyên mục “${c.translations.vi?.name}” sẽ bị xoá vĩnh viễn.`,
      confirmText: 'Xoá',
      variant: 'danger',
      onConfirm: async () => {
        await newsApi.removeCategory(c.id);
        await reload();
      },
      successMessage: 'Đã xoá chuyên mục',
    });

  const tr = form?.translations[tab];

  return (
    <AdminPage title="Chuyên Mục Tin Tức" subtitle="Tên, đường dẫn và mô tả chuyên mục theo từng ngôn ngữ">

      <AdminPageBody className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-6 items-start">
        <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">Danh sách chuyên mục</h2>
            <button type="button" onClick={() => { setForm(emptyForm(items?.length ?? 0)); setTab('vi'); }} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold cursor-pointer">
              <Plus size={13} aria-hidden="true" /> Thêm chuyên mục
            </button>
          </div>
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-2.5 w-12">#</th>
                <th scope="col" className="px-4 py-2.5">Tên (VI / EN)</th>
                <th scope="col" className="px-4 py-2.5">Đường dẫn</th>
                <th scope="col" className="px-4 py-2.5 w-16 text-right">Bài</th>
                <th scope="col" className="px-4 py-2.5 w-24 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!items &&
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3"><Skeleton className="h-6 w-full rounded" /></td>
                  </tr>
                ))}
              {items?.map((c) => (
                <tr key={c.id} className={form?.id === c.id ? 'bg-[#F4F9E8]/60' : 'hover:bg-slate-50/70'}>
                  <td className="px-4 py-3 text-slate-500 tabular-nums">{c.sortOrder}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-bold ${CATEGORY_COLOR_STYLES[c.color].chip}`}>{c.translations.vi?.name}</span>
                    <span className="block mt-1 text-[11px] text-slate-500">{c.translations.en?.name ?? <em className="text-amber-700">chưa có tên tiếng Anh</em>}</span>
                    {!c.isActive && <span className="text-[10px] font-bold text-slate-400 uppercase">Đang ẩn</span>}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-600 font-mono">
                    /tin-tuc?chuyen-muc={c.translations.vi?.slug}
                    {c.translations.en && <span className="block text-slate-400">/en/news?category={c.translations.en.slug}</span>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.postCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => { setForm(toForm(c)); setTab('vi'); }} aria-label="Sửa chuyên mục" className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-[#5F8A03] cursor-pointer">
                        <Pencil size={14} />
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => remove(c)}
                          disabled={c.postCount > 0}
                          title={c.postCount > 0 ? 'Chuyên mục còn bài viết — chuyển bài sang chuyên mục khác trước' : 'Xoá chuyên mục'}
                          aria-label="Xoá chuyên mục"
                          className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FORM TẠO / SỬA */}
        {form && tr ? (
          <form onSubmit={save} className="bg-white rounded-xl border border-slate-300 shadow-2xs p-5 space-y-4 xl:sticky xl:top-20">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-900">{form.id ? 'Sửa chuyên mục' : 'Chuyên mục mới'}</h2>
              <LocaleTabs panelId="category-panel" active={tab} onChange={setTab} tabs={[{ locale: 'vi', label: 'Tiếng Việt' }, { locale: 'en', label: 'English' }]} />
            </div>
            <div id="category-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="space-y-3">
              <label className="block space-y-1">
                <span className="text-xs font-bold text-slate-700">Tên chuyên mục {tab === 'vi' ? '*' : '(bỏ trống = dùng tên tiếng Việt)'}</span>
                <input value={tr.name} maxLength={100} onChange={(e) => setTr({ name: e.target.value })} className={inputClass} />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-bold text-slate-700">Đường dẫn (bỏ trống = tự sinh)</span>
                <input value={tr.slug} maxLength={120} placeholder={slugify(tr.name)} onChange={(e) => setTr({ slug: e.target.value.toLowerCase() })} onBlur={() => tr.slug && setTr({ slug: slugify(tr.slug) })} className={`${inputClass} font-mono`} />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-bold text-slate-700">Mô tả</span>
                <textarea rows={2} value={tr.description} maxLength={500} onChange={(e) => setTr({ description: e.target.value })} className={inputClass} />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-bold text-slate-700">Tiêu đề SEO</span>
                <input value={tr.seoTitle} maxLength={120} onChange={(e) => setTr({ seoTitle: e.target.value })} className={inputClass} />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-bold text-slate-700">Mô tả SEO</span>
                <textarea rows={2} value={tr.seoDescription} maxLength={320} onChange={(e) => setTr({ seoDescription: e.target.value })} className={inputClass} />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <label className="block space-y-1">
                <span className="text-xs font-bold text-slate-700">Màu nhãn</span>
                <select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value as NewsCategoryColor })} className={inputClass}>
                  {NEWS_CATEGORY_COLORS.map((c) => (
                    <option key={c} value={c}>{CATEGORY_COLOR_STYLES[c].label}</option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-bold text-slate-700">Thứ tự</span>
                <input type="number" min={0} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Math.max(0, Number(e.target.value) || 0) })} className={inputClass} />
              </label>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input type="checkbox" className="accent-[#5F8A03]" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Hiển thị trên website
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setForm(null)} className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">Huỷ</button>
              <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5">
                {saving && <Loader2 size={13} className="animate-spin" />} Lưu chuyên mục
              </button>
            </div>
          </form>
        ) : (
          <div className="hidden xl:block rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
            Chọn một chuyên mục để sửa, hoặc bấm “Thêm chuyên mục”.
          </div>
        )}
      </AdminPageBody>
    </AdminPage>
  );
}
