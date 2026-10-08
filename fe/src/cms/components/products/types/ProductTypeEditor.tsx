'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, Loader2, RefreshCw, X } from 'lucide-react';
import type { Locale } from '@remak/shared/locale';
import { slugify } from '@remak/shared/slug';
import { PRODUCT_SPEC_PROFILES, PRODUCT_SPEC_PROFILE_LABEL, type ProductSpecProfile, type ProductTypeCms } from '@remak/shared/contracts/product';
import LocaleTabs from '@/cms/components/shared/LocaleTabs';
import SeoPanel from '@/cms/components/shared/SeoPanel';
import { inputClass } from '@/cms/components/shared/form-styles';
import { isConflict } from '@/cms/lib/api-client';
import { productsApi } from '@/cms/lib/products-api';
import { productTypePath } from '@/lib/product-paths';
import {
  DESCRIPTION_MAX,
  NAME_MAX,
  PRODUCT_TYPE_PATH_PREFIX,
  SLUG_MAX,
  isProductTypeDirty,
  toProductTypeInput,
  validateProductType,
  type ProductTypeErrors,
  type ProductTypeField,
  type ProductTypeForm,
  type ProductTypeTranslationForm,
} from './product-type-form';

const ERROR_ORDER: (keyof ProductTypeErrors)[] = ['vi.name', 'vi.slug', 'en.name', 'en.slug'];
const fieldLabel = 'text-xs font-bold text-slate-700';

/** Mô tả ngắn từng mẫu form — giúp chọn đúng khi tạo loại mới */
const PROFILE_HINT: Record<ProductSpecProfile, string> = {
  NONE: 'Chỉ dùng bảng thông số chung (tỷ trọng, chống cháy, độ dày…).',
  SIP: 'Thêm khối Panel SIP: lõi cách nhiệt, độ dày lõi, khổ tối đa.',
  FLOOR: 'Thêm khối Tấm sàn: hèm khoá, khổ sàn, lớp phủ sàn phù hợp.',
  DECORATIVE: 'Thêm khối Tấm trang trí: lớp hoàn thiện bề mặt, in theo mẫu.',
};

function Counter({ value, max }: { value: string; max: number }) {
  const near = value.length > max * 0.9;
  return (
    <span className={`text-xs tabular-nums ${near ? 'font-semibold text-amber-700' : 'text-slate-600'}`} aria-hidden="true">
      {value.length}/{max}
    </span>
  );
}

/**
 * Khung tạo / sửa loại sản phẩm (desktop, dính bên phải danh sách).
 * - Lỗi báo ngay dưới ô; lưu khi có lỗi -> chuyển tab + focus ô sai đầu tiên.
 * - Đổi mẫu form khi loại đang có sản phẩm -> cảnh báo (khối thông số riêng cũ của sản phẩm sẽ bị ẩn).
 */
export default function ProductTypeEditor({
  initial,
  productCount,
  onClose,
  onSaved,
  onDirtyChange,
  onReloadLatest,
}: {
  initial: ProductTypeForm;
  /** Số sản phẩm đang thuộc loại (0 với loại mới) */
  productCount: number;
  onClose: () => void;
  onSaved: (saved: ProductTypeCms, created: boolean) => void;
  onDirtyChange: (dirty: boolean) => void;
  /** Bản trên máy chủ đã đổi (409) -> bỏ thay đổi, mở lại bản mới nhất */
  onReloadLatest: () => void;
}) {
  const ids = useId();
  const [form, setForm] = useState(initial);
  const [tab, setTab] = useState<Locale>('vi');
  const [errors, setErrors] = useState<ProductTypeErrors>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<{ message: string; conflict: boolean } | null>(null);
  const focusFieldRef = useRef<string | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const dirty = useMemo(() => isProductTypeDirty(form, initial), [form, initial]);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  useEffect(() => {
    if (!focusFieldRef.current) return;
    document.getElementById(focusFieldRef.current)?.focus();
    focusFieldRef.current = null;
  }, [errors, tab]);

  const tr = form.translations[tab];
  const fieldId = (l: Locale, f: ProductTypeField | 'description') => `${ids}-${l}-${f}`;
  const err = (f: ProductTypeField) => errors[`${tab}.${f}`];

  const setTr = (patch: Partial<ProductTypeTranslationForm>) => {
    setForm((cur) => ({ ...cur, translations: { ...cur.translations, [tab]: { ...cur.translations[tab], ...patch } } }));
    setErrors((cur) => {
      const next = { ...cur };
      for (const k of Object.keys(patch)) delete next[`${tab}.${k}` as keyof ProductTypeErrors];
      return next;
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateProductType(form);
    setErrors(found);
    const first = ERROR_ORDER.find((k) => found[k]);
    if (first) {
      const [l, f] = first.split('.') as [Locale, ProductTypeField];
      focusFieldRef.current = fieldId(l, f);
      setTab(l);
      return;
    }
    setSaving(true);
    setApiError(null);
    try {
      const input = toProductTypeInput(form);
      const saved = form.id ? await productsApi.updateType(form.id, input, form.version!) : await productsApi.createType(input);
      onSaved(saved, !form.id);
    } catch (error) {
      const conflict = isConflict(error);
      setApiError({
        conflict,
        message: conflict
          ? 'Loại sản phẩm vừa được người khác sửa. Nội dung bạn nhập vẫn còn trên màn hình — chép lại phần cần giữ rồi tải bản mới nhất.'
          : error instanceof Error
            ? error.message
            : 'Lưu thất bại',
      });
      requestAnimationFrame(() => alertRef.current?.focus());
    } finally {
      setSaving(false);
    }
  };

  const enMissing = !form.translations.en.name.trim();
  const slugPreview = tr.slug.trim() || slugify(tr.name) || '';
  const profileChanged = !!form.id && form.specProfile !== initial.specProfile && productCount > 0;

  return (
    <form
      onSubmit={save}
      noValidate
      aria-labelledby={`${ids}-title`}
      className="sticky top-[calc(var(--admin-sticky-top)+1.5rem)] flex max-h-[calc(100vh-10rem)] flex-col rounded-xl border border-slate-300 bg-white shadow-2xs"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
        <h2 id={`${ids}-title`} className="min-w-0 truncate text-sm font-bold text-slate-900">
          {form.id ? `Sửa: ${initial.translations.vi.name || 'loại sản phẩm'}` : 'Loại sản phẩm mới'}
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
          <div className="space-y-1">
            <label htmlFor={`${ids}-profile`} className={fieldLabel}>
              Mẫu thông số riêng
            </label>
            <select
              id={`${ids}-profile`}
              value={form.specProfile}
              aria-describedby={`${ids}-profile-hint`}
              onChange={(e) => setForm((f) => ({ ...f, specProfile: e.target.value as ProductSpecProfile }))}
              className={`${inputClass} text-sm`}
            >
              {PRODUCT_SPEC_PROFILES.map((p) => (
                <option key={p} value={p}>
                  {PRODUCT_SPEC_PROFILE_LABEL[p].vi}
                </option>
              ))}
            </select>
            <p id={`${ids}-profile-hint`} className="text-xs text-slate-600">
              {PROFILE_HINT[form.specProfile]}
            </p>
            {profileChanged && (
              <p role="status" className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                Loại đang có {productCount} sản phẩm — đổi mẫu thông số sẽ ẩn khối thông số riêng hiện có của các sản phẩm này (vẫn giữ
                trong hệ thống, hiện lại khi đổi về mẫu cũ).
              </p>
            )}
          </div>

          <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
            <div>
              <span id={`${ids}-active`} className="block text-sm font-semibold text-slate-900">
                Hiển thị trên website
              </span>
              <span id={`${ids}-active-hint`} className="block text-xs text-slate-600">
                {form.isActive ? 'Có trong bộ lọc Sản phẩm và có trang riêng.' : 'Đang ẩn: không có trong bộ lọc, trang loại trả 404.'}
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
          <LocaleTabs
            panelId={`${ids}-panel`}
            active={tab}
            onChange={setTab}
            tabs={[
              { locale: 'vi', label: 'Tiếng Việt' },
              { locale: 'en', label: 'English', hint: enMissing ? 'chưa dịch' : undefined },
            ]}
          />
          {tab === 'en' && <p className="text-xs text-slate-600">Bỏ trống tên tiếng Anh = loại không hiện ở website tiếng Anh.</p>}

          <div id={`${ids}-panel`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor={fieldId(tab, 'name')} className={fieldLabel}>
                  Tên loại sản phẩm {tab === 'vi' && <span className="text-rose-700">*</span>}
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
                  {PRODUCT_TYPE_PATH_PREFIX[tab]}
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
                {tr.slug.trim() ? 'Đổi đường dẫn: link cũ tự chuyển sang đường dẫn mới.' : 'Bỏ trống = tự sinh từ tên.'}
                {slugPreview && (
                  <>
                    {' '}
                    Trang: <span className="font-mono text-slate-800">{productTypePath(tab, slugPreview)}</span>
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
                placeholder="Giới thiệu ngắn, hiện ở đầu trang loại sản phẩm"
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
                  url={`remak.vn${productTypePath(tab, slugPreview || '...')}`}
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
            {saving ? 'Đang lưu…' : form.id ? 'Lưu thay đổi' : 'Tạo loại sản phẩm'}
          </button>
        </div>
      </div>
    </form>
  );
}
