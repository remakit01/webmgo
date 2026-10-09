'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AlertCircle, Info, Loader2, RefreshCw, Trash2, X } from 'lucide-react';
import type { Locale } from '@remak/shared/locale';
import LocaleTabs from '@/cms/components/shared/LocaleTabs';
import ImageUploadField from '@/cms/components/shared/ImageUploadField';
import { inputClass } from '@/cms/components/shared/form-styles';
import { isConflict } from '@/cms/lib/api-client';
import { newsApi, uploadContentImage } from '@/cms/lib/news-api';
import AuthorBox from '@/components/news/AuthorBox';
import enMessages from '../../../../../messages/en.json';
import viMessages from '../../../../../messages/vi.json';
import type { NewsAuthorCms } from '@/types/news';
import {
  AUTHOR_NAME_MAX,
  BIO_MAX,
  JOB_TITLE_MAX,
  hasProfile,
  isAuthorDirty,
  toAuthorInput,
  validateAuthor,
  type AuthorForm,
  type AuthorTranslationForm,
} from './author-form';

// Nhãn hộp tác giả lấy đúng từ bản dịch của website
const ABOUT_LABEL: Record<Locale, string> = { vi: viMessages.News.aboutAuthor, en: enMessages.News.aboutAuthor };
const fieldLabel = 'text-xs font-bold text-slate-700';

function Counter({ value, max }: { value: string; max: number }) {
  return (
    <span className={`text-xs tabular-nums ${value.length > max * 0.9 ? 'font-semibold text-amber-700' : 'text-slate-600'}`} aria-hidden="true">
      {value.length}/{max}
    </span>
  );
}

/**
 * Khung tạo / sửa tác giả: tên (không dịch), ảnh, trạng thái, chức danh + tiểu sử theo ngôn ngữ,
 * xem trước hộp tác giả y như cuối bài viết (cùng component AuthorBox).
 */
export default function AuthorEditor({
  initial,
  onClose,
  onSaved,
  onDirtyChange,
  onReloadLatest,
}: {
  initial: AuthorForm;
  onClose: () => void;
  onSaved: (saved: NewsAuthorCms, created: boolean) => void;
  onDirtyChange: (dirty: boolean) => void;
  onReloadLatest: () => void;
}) {
  const ids = useId();
  const [form, setForm] = useState(initial);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [tab, setTab] = useState<Locale>('vi');
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<{ message: string; conflict: boolean } | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const dirty = useMemo(() => isAuthorDirty(form, initial, !!avatarFile), [form, initial, avatarFile]);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  // Ảnh vừa chọn -> URL tạm cho bản xem trước
  const pickedUrl = useMemo(() => (avatarFile ? URL.createObjectURL(avatarFile) : null), [avatarFile]);
  useEffect(() => () => {
    if (pickedUrl) URL.revokeObjectURL(pickedUrl);
  }, [pickedUrl]);

  const tr = form.translations[tab];
  const setTr = (patch: Partial<AuthorTranslationForm>) =>
    setForm((f) => ({ ...f, translations: { ...f.translations, [tab]: { ...f.translations[tab], ...patch } } }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateAuthor(form).name ?? null;
    setNameError(err);
    if (err) return nameRef.current?.focus();
    setSaving(true);
    setApiError(null);
    try {
      const avatarUrl = avatarFile ? (await uploadContentImage(avatarFile)).url : form.avatarUrl || null;
      const input = toAuthorInput(form, avatarUrl);
      const saved = form.id ? await newsApi.updateAuthor(form.id, input, form.version!) : await newsApi.createAuthor(input);
      onSaved(saved, !form.id);
    } catch (error) {
      const conflict = isConflict(error);
      setApiError({
        conflict,
        message: conflict
          ? 'Tác giả vừa được người khác sửa. Nội dung bạn nhập vẫn còn trên màn hình — chép lại phần cần giữ rồi tải bản mới nhất.'
          : error instanceof Error
            ? error.message
            : 'Lưu thất bại',
      });
      requestAnimationFrame(() => alertRef.current?.focus());
    } finally {
      setSaving(false);
    }
  };

  const previewName = form.name.trim() || 'Tên tác giả';
  const showsBox = hasProfile(tr);
  const enMissing = !hasProfile(form.translations.en);

  return (
    <form
      onSubmit={save}
      noValidate
      aria-labelledby={`${ids}-title`}
      className="sticky top-[calc(var(--admin-sticky-top)+1.5rem)] flex max-h-[calc(100vh-10rem)] flex-col rounded-xl border border-slate-300 bg-white shadow-2xs"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
        <h2 id={`${ids}-title`} className="min-w-0 truncate text-sm font-bold text-slate-900">
          {form.id ? `Sửa: ${initial.name}` : 'Tác giả mới'}
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
          <div ref={alertRef} tabIndex={-1} role="alert" className="flex items-start gap-2.5 rounded-lg border border-rose-300 bg-rose-50 px-3.5 py-3 text-sm text-rose-800 focus:outline-none">
            <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div className="flex-1 space-y-2">
              <p>{apiError.message}</p>
              {apiError.conflict && (
                <button type="button" onClick={onReloadLatest} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 text-xs font-semibold text-rose-800 hover:bg-rose-100 cursor-pointer">
                  <RefreshCw size={13} aria-hidden="true" /> Tải bản mới nhất
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Chung ── */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor={`${ids}-name`} className={fieldLabel}>
              Tên hiển thị <span className="text-rose-700">*</span> <span className="font-normal text-slate-600">(tên riêng, không dịch)</span>
            </label>
            <Counter value={form.name} max={AUTHOR_NAME_MAX} />
          </div>
          <input
            ref={nameRef}
            id={`${ids}-name`}
            value={form.name}
            maxLength={AUTHOR_NAME_MAX}
            aria-invalid={!!nameError}
            aria-describedby={nameError ? `${ids}-name-err` : undefined}
            onChange={(e) => {
              setForm((f) => ({ ...f, name: e.target.value }));
              if (nameError) setNameError(null);
            }}
            onBlur={() => setNameError(validateAuthor(form).name ?? null)}
            className={`${inputClass} text-sm`}
          />
          {nameError && (
            <p id={`${ids}-name-err`} className="text-xs font-medium text-rose-700">
              {nameError}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <ImageUploadField
            label="Ảnh đại diện"
            aspect="aspect-square max-w-28"
            currentUrl={form.avatarUrl || null}
            file={avatarFile}
            onPick={setAvatarFile}
            onClear={() => setAvatarFile(null)}
            hint="Ảnh vuông, rõ mặt — hiện tròn 56px cuối bài."
          />
          {form.avatarUrl && !avatarFile && (
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, avatarUrl: '' }))}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03]"
            >
              <Trash2 size={13} aria-hidden="true" /> Gỡ ảnh đại diện
            </button>
          )}
        </div>

        <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
          <div>
            <span id={`${ids}-active`} className="block text-sm font-semibold text-slate-900">
              Đang hoạt động
            </span>
            <span id={`${ids}-active-hint`} className="block text-xs text-slate-600">
              {form.isActive ? 'Có trong danh sách chọn tác giả khi viết bài.' : 'Đã ẩn: không còn trong danh sách chọn tác giả. Bài cũ vẫn giữ tên.'}
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

        {/* ── Theo ngôn ngữ ── */}
        <div className="space-y-3 border-t border-slate-200 pt-4">
          <LocaleTabs
            panelId={`${ids}-panel`}
            active={tab}
            onChange={setTab}
            tabs={[
              { locale: 'vi', label: 'Tiếng Việt' },
              { locale: 'en', label: 'Tiếng Anh', hint: enMissing ? 'chưa dịch' : undefined },
            ]}
          />
          <div id={`${ids}-panel`} role="tabpanel" aria-labelledby={`tab-${tab}`} lang={tab} className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor={`${ids}-${tab}-job`} className={fieldLabel}>
                  Chức danh
                </label>
                <Counter value={tr.jobTitle} max={JOB_TITLE_MAX} />
              </div>
              <input
                id={`${ids}-${tab}-job`}
                value={tr.jobTitle}
                maxLength={JOB_TITLE_MAX}
                placeholder={tab === 'vi' ? 'vd: Kỹ sư PCCC, 12 năm kinh nghiệm' : 'e.g. Fire safety engineer'}
                onChange={(e) => setTr({ jobTitle: e.target.value })}
                className={`${inputClass} text-sm`}
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor={`${ids}-${tab}-bio`} className={fieldLabel}>
                  Tiểu sử ngắn
                </label>
                <Counter value={tr.bio} max={BIO_MAX} />
              </div>
              <textarea
                id={`${ids}-${tab}-bio`}
                rows={4}
                value={tr.bio}
                maxLength={BIO_MAX}
                aria-describedby={`${ids}-bio-hint`}
                placeholder={tab === 'vi' ? 'Kinh nghiệm, chứng chỉ, công trình đã tham gia…' : 'Experience, certifications, notable projects…'}
                onChange={(e) => setTr({ bio: e.target.value })}
                className={`${inputClass} text-sm leading-relaxed`}
              />
              <p id={`${ids}-bio-hint`} className="text-xs text-slate-600">
                Tiểu sử cụ thể (năm kinh nghiệm, chứng chỉ) giúp Google và AI tin cậy bài viết hơn (E-E-A-T).
              </p>
            </div>

            {/* Xem trước hộp tác giả cuối bài */}
            <div className="space-y-2">
              <p className={fieldLabel}>Xem trước cuối bài viết ({tab === 'vi' ? 'tiếng Việt' : 'tiếng Anh'})</p>
              {showsBox ? (
                <AuthorBox
                  label={ABOUT_LABEL[tab]}
                  author={{ name: previewName, avatarUrl: pickedUrl ?? (form.avatarUrl || null), jobTitle: tr.jobTitle.trim() || null, bio: tr.bio.trim() || null }}
                />
              ) : (
                <p className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
                  <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                  Chưa có chức danh hoặc tiểu sử {tab === 'vi' ? 'tiếng Việt' : 'tiếng Anh'}: hộp tác giả sẽ không hiện cuối bài viết
                  {tab === 'en' ? ' tiếng Anh' : ''}.
                </p>
              )}
            </div>
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
            {saving ? 'Đang lưu…' : form.id ? 'Lưu thay đổi' : 'Tạo tác giả'}
          </button>
        </div>
      </div>
    </form>
  );
}
