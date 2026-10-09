'use client';

import React, { useEffect, useId, useMemo, useState } from 'react';
import { AlertCircle, Loader2, RefreshCw, X } from 'lucide-react';
import {
  SPEC_OPTION_CODE_MAX,
  SPEC_OPTION_GROUP_LABEL,
  SPEC_OPTION_LABEL_MAX,
  specOptionCodeFrom,
  type SpecOptionCms,
} from '@remak/shared/contracts/product';
import { inputClass } from '@/cms/components/shared/form-styles';
import { isConflict } from '@/cms/lib/api-client';
import { productsApi } from '@/cms/lib/products-api';
import { isSpecOptionDirty, toSpecOptionInput, validateSpecOption, type SpecOptionErrors, type SpecOptionForm } from './spec-option-form';

const fieldLabel = 'text-xs font-bold text-slate-700';

/**
 * Khung tạo / sửa giá trị danh mục thông số (desktop, dính bên phải).
 * Mã chỉ nhập khi tạo mới (gợi ý từ nhãn tiếng Việt); sau đó khoá vì sản phẩm lưu theo mã.
 */
export default function SpecOptionEditor({
  initial,
  usageCount,
  onClose,
  onSaved,
  onDirtyChange,
  onReloadLatest,
}: {
  initial: SpecOptionForm;
  usageCount: number;
  onClose: () => void;
  onSaved: (saved: SpecOptionCms, created: boolean) => void;
  onDirtyChange: (dirty: boolean) => void;
  onReloadLatest: () => void;
}) {
  const ids = useId();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<SpecOptionErrors>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<{ message: string; conflict: boolean } | null>(null);

  const dirty = useMemo(() => isSpecOptionDirty(form, initial), [form, initial]);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const isNew = !form.id;
  const codePreview = form.code.trim() || specOptionCodeFrom(form.labels.vi);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateSpecOption(form);
    setErrors(found);
    if (found.labelVi) return document.getElementById(`${ids}-vi`)?.focus();
    if (found.code) return document.getElementById(`${ids}-code`)?.focus();
    setSaving(true);
    setApiError(null);
    try {
      const input = toSpecOptionInput(form);
      const saved = form.id
        ? await productsApi.updateSpecOption(form.id, { isActive: input.isActive, labels: input.labels }, form.version!)
        : await productsApi.createSpecOption(input);
      onSaved(saved, isNew);
    } catch (error) {
      const conflict = isConflict(error) && !isNew;
      setApiError({
        conflict,
        message: conflict
          ? 'Giá trị vừa được người khác sửa. Nội dung bạn nhập vẫn còn trên màn hình — chép lại phần cần giữ rồi tải bản mới nhất.'
          : error instanceof Error
            ? error.message
            : 'Lưu thất bại',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={save}
      noValidate
      aria-labelledby={`${ids}-title`}
      className="sticky top-[calc(var(--admin-sticky-top)+1.5rem)] flex flex-col rounded-xl border border-slate-300 bg-white shadow-2xs"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
        <h2 id={`${ids}-title`} className="min-w-0 truncate text-sm font-bold text-slate-900">
          {isNew ? `Giá trị mới — ${SPEC_OPTION_GROUP_LABEL[form.group].name}` : `Sửa: ${initial.labels.vi || initial.code}`}
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

      <div className="space-y-4 px-5 py-4">
        {apiError && (
          <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-rose-300 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">
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

        <div className="space-y-1">
          <label htmlFor={`${ids}-vi`} className={fieldLabel}>
            Nhãn tiếng Việt <span className="text-rose-700">*</span>
          </label>
          <input
            id={`${ids}-vi`}
            value={form.labels.vi}
            maxLength={SPEC_OPTION_LABEL_MAX}
            required
            aria-invalid={!!errors.labelVi}
            aria-describedby={errors.labelVi ? `${ids}-vi-err` : undefined}
            onChange={(e) => {
              setForm((f) => ({ ...f, labels: { ...f.labels, vi: e.target.value } }));
              setErrors((x) => ({ ...x, labelVi: undefined }));
            }}
            className={`${inputClass} text-sm`}
          />
          {errors.labelVi && (
            <p id={`${ids}-vi-err`} className="text-xs font-medium text-rose-700">
              {errors.labelVi}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor={`${ids}-en`} className={fieldLabel}>
            Nhãn tiếng Anh
          </label>
          <input
            id={`${ids}-en`}
            value={form.labels.en}
            maxLength={SPEC_OPTION_LABEL_MAX}
            aria-describedby={`${ids}-en-hint`}
            onChange={(e) => setForm((f) => ({ ...f, labels: { ...f.labels, en: e.target.value } }))}
            className={`${inputClass} text-sm`}
          />
          <p id={`${ids}-en-hint`} className="text-xs text-slate-600">
            Bỏ trống = trang tiếng Anh dùng nhãn tiếng Việt.
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor={`${ids}-code`} className={fieldLabel}>
            Mã
          </label>
          <input
            id={`${ids}-code`}
            value={isNew ? form.code : initial.code}
            readOnly={!isNew}
            maxLength={SPEC_OPTION_CODE_MAX}
            placeholder={codePreview || 'TU_SINH_TU_NHAN'}
            aria-invalid={!!errors.code}
            aria-describedby={`${ids}-code-hint${errors.code ? ` ${ids}-code-err` : ''}`}
            onChange={(e) => {
              setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }));
              setErrors((x) => ({ ...x, code: undefined }));
            }}
            className={`${inputClass} font-mono text-sm ${isNew ? '' : 'bg-slate-100 text-slate-600'}`}
          />
          <p id={`${ids}-code-hint`} className="text-xs text-slate-600">
            {isNew
              ? `Bỏ trống = tự sinh từ nhãn tiếng Việt${codePreview ? ` (${codePreview})` : ''}. Tạo xong không đổi được.`
              : 'Không đổi được — sản phẩm đang lưu theo mã này.'}
          </p>
          {errors.code && (
            <p id={`${ids}-code-err`} className="text-xs font-medium text-rose-700">
              {errors.code}
            </p>
          )}
        </div>

        <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
          <div>
            <span id={`${ids}-active`} className="block text-sm font-semibold text-slate-900">
              Hiển thị trong form sản phẩm
            </span>
            <span id={`${ids}-active-hint`} className="block text-xs text-slate-600">
              {form.isActive
                ? 'Chọn được khi nhập thông số.'
                : `Đang ẩn: không chọn mới được${usageCount ? `; ${usageCount} sản phẩm đang dùng vẫn giữ và hiện trên web` : ''}.`}
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
            disabled={saving || (!dirty && !isNew)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#4E7202] px-4 text-sm font-semibold text-white hover:bg-[#3F5E02] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03]"
          >
            {saving && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
            {saving ? 'Đang lưu…' : isNew ? 'Tạo giá trị' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </form>
  );
}
