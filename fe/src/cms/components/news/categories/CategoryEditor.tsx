'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AlertCircle, Loader2, RefreshCw, X } from 'lucide-react';
import type { Locale } from '@remak/shared/locale';
import { slugify } from '@remak/shared/slug';
import LocaleTabs from '@/cms/components/shared/LocaleTabs';
import SeoPanel from '@/cms/components/shared/SeoPanel';
import { inputClass } from '@/cms/components/shared/form-styles';
import { isConflict } from '@/cms/lib/api-client';
import { newsApi } from '@/cms/lib/news-api';
import { CATEGORY_COLOR_STYLES } from '@/lib/news-category-colors';
import type { NewsCategoryCms } from '@/types/news';
import ColorSwatchPicker from './ColorSwatchPicker';
import {
  CATEGORY_PATH_PREFIX,
  DESCRIPTION_MAX,
  NAME_MAX,
  SLUG_MAX,
  categoryPath,
  isCategoryDirty,
  toCategoryInput,
  validateCategory,
  type CategoryErrors,
  type CategoryField,
  type CategoryForm,
  type CategoryTranslationForm,
} from './category-form';

const ERROR_ORDER: (keyof CategoryErrors)[] = ['vi.name', 'vi.slug', 'en.name', 'en.slug'];
const fieldLabel = 'text-xs font-bold text-slate-700';

function Counter({ value, max }: { value: string; max: number }) {
  const near = value.length > max * 0.9;
  return (
    <span className={`text-xs tabular-nums ${near ? 'font-semibold text-amber-700' : 'text-slate-600'}`} aria-hidden="true">
      {value.length}/{max}
    </span>
  );
}

/**
 * Khung tạo / sửa chuyên mục (desktop, dính bên phải danh sách).
 * - Lỗi báo ngay dưới ô (aria-invalid + aria-describedby); lưu khi có lỗi -> chuyển tab + focus ô sai đầu tiên.
 * - Theo dõi thay đổi chưa lưu (báo cho trang để hỏi trước khi đóng / chuyển chuyên mục).
 * - Không có ô "Thứ tự": đổi thứ tự bằng ▲ ▼ ở danh sách.
 */
export default function CategoryEditor({
  initial,
  onClose,
  onSaved,
  onDirtyChange,
  onReloadLatest,
}: {
  initial: CategoryForm;
  onClose: () => void;
  onSaved: (saved: NewsCategoryCms, created: boolean) => void;
  onDirtyChange: (dirty: boolean) => void;
  /** Bản trên máy chủ đã đổi (409) -> bỏ thay đổi, mở lại bản mới nhất */
  onReloadLatest: () => void;
}) {
  const ids = useId();
  const [form, setForm] = useState(initial);
  const [tab, setTab] = useState<Locale>('vi');
  const [errors, setErrors] = useState<CategoryErrors>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<{ message: string; conflict: boolean } | null>(null);
  // Ô cần focus sau khi lưu bị lỗi (tab có thể phải đổi trước) — ref để không phải setState trong effect
  const focusFieldRef = useRef<string | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const dirty = useMemo(() => isCategoryDirty(form, initial), [form, initial]);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  // Focus ô sai sau khi lỗi + tab đã render xong
  useEffect(() => {
    if (!focusFieldRef.current) return;
    document.getElementById(focusFieldRef.current)?.focus();
    focusFieldRef.current = null;
  }, [errors, tab]);

  const tr = form.translations[tab];
  const fieldId = (l: Locale, f: CategoryField | 'description') => `${ids}-${l}-${f}`;
  const err = (f: CategoryField) => errors[`${tab}.${f}`];

  const setTr = (patch: Partial<CategoryTranslationForm>) => {
    setForm((cur) => ({ ...cur, translations: { ...cur.translations, [tab]: { ...cur.translations[tab], ...patch } } }));
    // Sửa ô nào thì bỏ lỗi ô đó
    setErrors((cur) => {
      const next = { ...cur };
      for (const k of Object.keys(patch)) delete next[`${tab}.${k}` as keyof CategoryErrors];
      return next;
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateCategory(form);
    setErrors(found);
    const first = ERROR_ORDER.find((k) => found[k]);
    if (first) {
      const [l, f] = first.split('.') as [Locale, CategoryField];
      focusFieldRef.current = fieldId(l, f);
      setTab(l);
      return;
    }
    setSaving(true);
    setApiError(null);
    try {
      const input = toCategoryInput(form);
      const saved = form.id ? await newsApi.updateCategory(form.id, input, form.version!) : await newsApi.createCategory(input);
      onSaved(saved, !form.id);
    } catch (error) {
      const conflict = isConflict(error);
      setApiError({
        conflict,
        message: conflict
          ? 'Chuyên mục vừa được người khác sửa. Nội dung bạn nhập vẫn còn trên màn hình — chép lại phần cần giữ rồi tải bản mới nhất.'
          : error instanceof Error
            ? error.message
            : 'Lưu thất bại',
      });
      requestAnimationFrame(() => alertRef.current?.focus());
    } finally {
      setSaving(false);
    }
  };

  const viName = form.translations.vi.name.trim();
  const enMissing = !form.translations.en.name.trim();
  const previewName = (tab === 'en' && form.translations.en.name.trim()) || viName || 'Tên chuyên mục';
  const slugPreview = tr.slug.trim() || slugify(tr.name) || '';

  return (
    <form
      onSubmit={save}
      noValidate
      aria-labelledby={`${ids}-title`}
      className="sticky top-[calc(var(--admin-sticky-top)+1.5rem)] flex max-h-[calc(100vh-10rem)] flex-col rounded-xl border border-slate-300 bg-white shadow-2xs"
    >
      {/* Đầu khung */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
        <h2 id={`${ids}-title`} className="min-w-0 truncate text-sm font-bold text-slate-900">
          {form.id ? `Sửa: ${initial.translations.vi.name || 'chuyên mục'}` : 'Chuyên mục mới'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng khung sửa"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03]"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
        {apiError && (
          <div
            ref={alertRef}
            tabIndex={-1}
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-rose-300 bg-rose-50 px-3.5 py-3 text-sm text-rose-800 focus:outline-none"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div className="flex-1 space-y-2">
              <p>{apiError.message}</p>
              {apiError.conflict && (
                <button
                  type="button"
                  onClick={onReloadLatest}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 text-xs font-semibold text-rose-800 hover:bg-rose-100 cursor-pointer"
                >
                  <RefreshCw size={13} aria-hidden="true" /> Tải bản mới nhất
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Chung cho mọi ngôn ngữ ── */}
        <fieldset className="space-y-3">
          <legend className="sr-only">Thiết lập chung</legend>
          <div className="space-y-2">
            <span id={`${ids}-color`} className={fieldLabel}>
              Màu nhãn
            </span>
            <ColorSwatchPicker labelledBy={`${ids}-color`} value={form.color} onChange={(color) => setForm((f) => ({ ...f, color }))} />
            <p className="flex items-center gap-2 text-xs text-slate-600">
              Xem trước:
              <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-bold ${CATEGORY_COLOR_STYLES[form.color].chip}`}>
                {previewName}
              </span>
            </p>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
            <div>
              <span id={`${ids}-active`} className="block text-sm font-semibold text-slate-900">
                Hiển thị trên website
              </span>
              <span id={`${ids}-active-hint`} className="block text-xs text-slate-600">
                {form.isActive ? 'Có trong menu và bộ lọc Tin tức.' : 'Đang ẩn: không có trong menu và bộ lọc Tin tức.'}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.isActive}
              aria-labelledby={`${ids}-active`}
              aria-describedby={`${ids}-active-hint`}
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03] ${
                form.isActive ? 'bg-[#4E7202]' : 'bg-slate-400'
              }`}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </fieldset>

        {/* ── Theo ngôn ngữ ── */}
        <div className="space-y-3 border-t border-slate-200 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <LocaleTabs
              panelId={`${ids}-panel`}
              active={tab}
              onChange={setTab}
              tabs={[
                { locale: 'vi', label: 'Tiếng Việt' },
                { locale: 'en', label: 'Tiếng Anh', hint: enMissing ? 'chưa dịch' : undefined },
              ]}
            />
          </div>
          {tab === 'en' && (
            <p className="text-xs text-slate-600">Bỏ trống tên tiếng Anh = trang tiếng Anh dùng tên tiếng Việt.</p>
          )}

          <div id={`${ids}-panel`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor={fieldId(tab, 'name')} className={fieldLabel}>
                  Tên chuyên mục {tab === 'vi' && <span className="text-rose-700">*</span>}
                </label>
                <Counter value={tr.name} max={NAME_MAX} />
              </div>
              <input
                id={fieldId(tab, 'name')}
                value={tr.name}
                maxLength={NAME_MAX}
                required={tab === 'vi'}
                aria-invalid={!!err('name')}
                aria-describedby={err('name') ? `${fieldId(tab, 'name')}-err` : undefined}
                onChange={(e) => setTr({ name: e.target.value })}
                className={`${inputClass} text-sm`}
              />
              {err('name') && (
                <p id={`${fieldId(tab, 'name')}-err`} className="text-xs font-medium text-rose-700">
                  {err('name')}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor={fieldId(tab, 'slug')} className={fieldLabel}>
                Đường dẫn
              </label>
              <div
                className={`flex items-stretch overflow-hidden rounded-lg border bg-white focus-within:ring-1 ${
                  err('slug') ? 'border-rose-400 focus-within:ring-rose-400' : 'border-slate-300 focus-within:border-[#5F8A03] focus-within:ring-[#5F8A03]'
                }`}
              >
                <span className="flex shrink-0 items-center border-r border-slate-200 bg-slate-50 px-2.5 font-mono text-xs text-slate-600">
                  {CATEGORY_PATH_PREFIX[tab]}
                </span>
                <input
                  id={fieldId(tab, 'slug')}
                  value={tr.slug}
                  maxLength={SLUG_MAX}
                  placeholder={slugify(tr.name) || 'tu-sinh-tu-ten'}
                  aria-invalid={!!err('slug')}
                  aria-describedby={`${fieldId(tab, 'slug')}-hint${err('slug') ? ` ${fieldId(tab, 'slug')}-err` : ''}`}
                  onChange={(e) => setTr({ slug: e.target.value.toLowerCase() })}
                  onBlur={() => tr.slug && setTr({ slug: slugify(tr.slug) })}
                  className="min-w-0 flex-1 px-2.5 py-2.5 font-mono text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
                />
              </div>
              <p id={`${fieldId(tab, 'slug')}-hint`} className="text-xs text-slate-600">
                {tr.slug.trim() ? 'Đổi đường dẫn: link cũ tới chuyên mục sẽ không còn đúng.' : 'Bỏ trống = tự sinh từ tên.'}
                {slugPreview && (
                  <>
                    {' '}
                    Trang: <span className="font-mono text-slate-800">{categoryPath(tab, slugPreview)}</span>
                  </>
                )}
              </p>
              {err('slug') && (
                <p id={`${fieldId(tab, 'slug')}-err`} className="text-xs font-medium text-rose-700">
                  {err('slug')}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor={fieldId(tab, 'description')} className={fieldLabel}>
                  Mô tả
                </label>
                <Counter value={tr.description} max={DESCRIPTION_MAX} />
              </div>
              <textarea
                id={fieldId(tab, 'description')}
                rows={3}
                value={tr.description}
                maxLength={DESCRIPTION_MAX}
                placeholder="Giới thiệu ngắn, hiện ở đầu trang chuyên mục"
                onChange={(e) => setTr({ description: e.target.value })}
                className={`${inputClass} text-sm leading-relaxed`}
              />
            </div>

            <details className="group rounded-lg border border-slate-200">
              <summary className="flex cursor-pointer list-none items-center justify-between px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-[#5F8A03] [&::-webkit-details-marker]:hidden">
                <span>
                  SEO Google <span className="font-normal text-slate-600">(tuỳ chọn)</span>
                </span>
                <span className="text-slate-600 transition-transform group-open:rotate-90 motion-reduce:transition-none" aria-hidden="true">
                  ›
                </span>
              </summary>
              <div className="border-t border-slate-200 p-3.5">
                <SeoPanel
                  url={`remak.vn${categoryPath(tab, slugPreview || '...')}`}
                  seoTitle={tr.seoTitle}
                  seoDescription={tr.seoDescription}
                  fallbackTitle={tr.name || (tab === 'en' ? form.translations.vi.name : '')}
                  fallbackDescription={tr.description}
                  onChange={(p) => setTr(p)}
                />
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Chân khung */}
      <div className="flex items-center justify-between gap-3 rounded-b-xl border-t border-slate-200 bg-slate-50 px-5 py-3">
        <p className="text-xs font-semibold text-amber-800" aria-live="polite">
          {dirty ? 'Có thay đổi chưa lưu' : ''}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03]"
          >
            Huỷ
          </button>
          <button
            type="submit"
            disabled={saving || (!dirty && !!form.id)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#4E7202] px-4 text-sm font-semibold text-white hover:bg-[#3F5E02] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03]"
          >
            {saving && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
            {saving ? 'Đang lưu…' : form.id ? 'Lưu thay đổi' : 'Tạo chuyên mục'}
          </button>
        </div>
      </div>
    </form>
  );
}
