'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Eye, EyeOff, Filter, Loader2, RefreshCw } from 'lucide-react';
import { NextIntlClientProvider } from 'next-intl';
import AdminHeader from '@/cms/components/AdminHeader';
import { useToast } from '@/cms/components/ConfirmDialog';
import { apiFetch, ApiError } from '@/cms/lib/api-client';
import HomeHeroSection from '@/components/home/HomeHeroSection';
import { mergeHeroTranslation } from '@remak/shared/hero-i18n';
import type { HeroContent, HomeHeroForCms } from '@/types/homepage';
import HeroViForm from '@/cms/components/hero/HeroViForm';
import HeroEnForm from '@/cms/components/hero/HeroEnForm';
import LocaleTabs, { type CmsLocale } from '@/cms/components/shared/LocaleTabs';
import Skeleton from '@/cms/components/ui/Skeleton';
import {
  EMPTY_CONTENT,
  ifMatch,
  isTranslated,
  linkErrors,
  toTranslationDraft,
  translatableEntries,
  translationPatch,
  type HeroTranslationDraft,
} from '@/cms/components/hero/hero-form';

const PANEL_ID = 'hero-locale-panel';

export default function AdminHeroManagerPage() {
  const showToast = useToast();
  const [saved, setSaved] = useState<HomeHeroForCms>({
    vi: null,
    en: {},
    image: null,
    versions: { vi: null, en: null, image: null },
  });
  const [draftVi, setDraftVi] = useState<HeroContent>(EMPTY_CONTENT);
  const [draftEn, setDraftEn] = useState<HeroTranslationDraft>(toTranslationDraft(EMPTY_CONTENT, {}));
  const [tab, setTab] = useState<CmsLocale>('vi');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [fileError, setFileError] = useState<string | null>(null);
  // conflict = 409: người khác đã lưu trong lúc đang sửa -> cần tải bản mới nhất
  const [apiError, setApiError] = useState<{ tab: CmsLocale; message: string; conflict: boolean } | null>(null);
  // Bộ lọc "chỉ hiện trường chưa dịch": chụp tập khoá lúc bật để ô không biến mất khi đang gõ
  const [untranslatedFilter, setUntranslatedFilter] = useState<Set<string> | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const applySaved = (data: HomeHeroForCms) => {
    setSaved(data);
    const vi = data.vi ?? EMPTY_CONTENT;
    setDraftVi(vi);
    setDraftEn(toTranslationDraft(vi, data.en));
  };

  useEffect(() => {
    const startTime = Date.now();
    apiFetch<HomeHeroForCms>('/homepage/hero')
      .then(applySaved)
      .catch((err: unknown) => showToast(err instanceof Error ? err.message : 'Không tải được dữ liệu', 'error'))
      .finally(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 350 - elapsed);
        setTimeout(() => setLoading(false), remaining);
      });
  }, [showToast]);

  const savedVi = saved.vi ?? EMPTY_CONTENT;
  const savedEnDraft = useMemo(() => toTranslationDraft(savedVi, saved.en), [savedVi, saved.en]);
  const viDirty = file !== null || JSON.stringify(draftVi) !== JSON.stringify(savedVi);
  const enDirty = JSON.stringify(draftEn) !== JSON.stringify(savedEnDraft);
  const isDirty = viDirty || enDirty;

  const entries = useMemo(() => translatableEntries(draftVi, draftEn), [draftVi, draftEn]);
  const progress = { done: entries.filter(isTranslated).length, total: entries.length };

  // Lỗi định dạng link (kiểm tra ngay trên máy, API kiểm tra lại): khoá "en." cho tab tiếng Anh
  const errors = useMemo(
    () =>
      linkErrors({
        'primaryCta.link': draftVi.primaryCta.link,
        ...(draftVi.secondaryCta ? { 'secondaryCta.link': draftVi.secondaryCta.link } : {}),
        'en.primaryCta.link': draftEn.primaryCta.link,
        'en.secondaryCta.link': draftEn.secondaryCta.link,
      }),
    [draftVi, draftEn],
  );

  // Rời trang khi còn thay đổi chưa lưu -> trình duyệt hỏi lại
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  // Chấp nhận mọi ảnh sản phẩm hợp lệ, không giới hạn kích thước tối thiểu
  const handlePickFile = (picked: File) => {
    const url = URL.createObjectURL(picked);
    const img = new Image();
    img.onload = () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(picked);
      setPreviewUrl(url);
      setFileError(null);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setFileError('Không đọc được tệp ảnh này');
    };
    img.src = url;
  };

  const discardFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(undefined);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const errorKeys = Object.keys(errors);
    if (errorKeys.length) {
      setTab(errorKeys[0].startsWith('en.') ? 'en' : 'vi');
      showToast('Vui lòng sửa các ô đang báo lỗi', 'error');
      return;
    }
    if (!saved.image && !file) {
      setTab('vi');
      setFileError('Vui lòng chọn ảnh sản phẩm cho khung bên phải');
      return;
    }

    setSaving(true);
    let step: CmsLocale = 'vi';
    // Mỗi phần ghi kèm phiên bản đang sửa (If-Match); phần nào lưu xong thì cập nhật ngay vào `saved`
    // để nếu bước sau lỗi, phần đã lưu không bị coi là "chưa lưu" nữa.
    let current = saved;
    try {
      if (JSON.stringify(draftVi) !== JSON.stringify(savedVi)) {
        // PUT: thay toàn bộ bản tiếng Việt (mọi trường bắt buộc)
        current = await apiFetch<HomeHeroForCms>('/homepage/hero', {
          method: 'PUT',
          headers: ifMatch(current.versions.vi),
          body: JSON.stringify(draftVi),
        });
        setSaved(current);
      }
      if (enDirty) {
        step = 'en';
        // PATCH: chỉ gửi các nhóm trường đã đổi
        current = await apiFetch<HomeHeroForCms>('/homepage/hero/translations/en', {
          method: 'PATCH',
          headers: ifMatch(current.versions.en),
          body: JSON.stringify(translationPatch(draftEn, savedEnDraft)),
        });
        setSaved(current);
      }
      if (file) {
        step = 'vi';
        const form = new FormData();
        form.append('image', file);
        current = await apiFetch<HomeHeroForCms>('/homepage/hero/image', {
          method: 'PUT',
          headers: ifMatch(current.versions.image),
          body: form,
        });
        discardFile();
      }
      applySaved(current);
      setUntranslatedFilter(null);
      showToast('Đã lưu — trang chủ tiếng Việt và tiếng Anh đã được cập nhật', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lưu không thành công';
      const conflict = err instanceof ApiError && err.status === 409;
      setTab(step);
      setApiError({ tab: step, message, conflict });
      showToast(conflict ? 'Có người khác vừa lưu nội dung này' : message, 'error');
    } finally {
      setSaving(false);
    }
  };

  /** Bỏ thay đổi đang sửa, tải bản mới nhất từ máy chủ (sau khi bị 409) */
  const handleReloadLatest = async () => {
    try {
      applySaved(await apiFetch<HomeHeroForCms>('/homepage/hero'));
      discardFile();
      setApiError(null);
      showToast('Đã tải bản mới nhất', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không tải được dữ liệu', 'error');
    }
  };

  const handleDiscard = () => {
    applySaved(saved);
    discardFile();
    setFileError(null);
    setApiError(null);
  };

  const toggleFilter = () =>
    setUntranslatedFilter((cur) => (cur ? null : new Set(entries.filter((en) => !isTranslated(en)).map((en) => en.key))));

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
        <AdminHeader
          title="Quản Lý Tiêu Đề & Điểm Nhấn"
          subtitle="Quản trị tiêu đề chính, mô tả kỹ thuật và các cam kết chất lượng ở đầu trang chủ"
        />

        {/* Khung Xem Trước Skeleton 1:1 */}
        <div className="w-full bg-white border-b border-slate-300 select-none font-sans">
          <div className="px-6 py-3 border-b border-slate-300 bg-white flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-7 w-36 rounded-lg" />
          </div>
          <Skeleton className="w-full h-64 sm:h-72 rounded-none" />
        </div>

        {/* Khối Form Nhập Liệu Skeleton 1:1 */}
        <div className="p-6 space-y-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-5 border border-slate-300 shadow-2xs space-y-4">
              <Skeleton className="h-4 w-44 rounded" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-3 pt-2">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-300 shadow-2xs space-y-4">
              <Skeleton className="h-4 w-52 rounded" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <Skeleton className="h-64 sm:h-80 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const previewHero =
    tab === 'en'
      ? { ...mergeHeroTranslation(draftVi, draftEn), image: saved.image }
      : { ...draftVi, image: saved.image };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <AdminHeader
        title="Quản Lý Tiêu Đề & Điểm Nhấn"
        subtitle="Quản trị tiêu đề chính, mô tả kỹ thuật và các cam kết chất lượng ở đầu trang chủ"
      />

      {/* KHUNG XEM TRƯỚC HERO - FULL WIDTH 100%, KHÔNG CÓ BORDER TOP (CHUẨN BANNERS) */}
      <div className="w-full bg-white border-b border-slate-300 select-none font-sans">
        <div className="px-6 py-3 border-b border-slate-300 bg-white flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-sm font-bold text-slate-900">
            Xem trước trực tiếp
          </h3>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              {showPreview ? (
                <>
                  <EyeOff size={13} /> Thu gọn xem trước
                </>
              ) : (
                <>
                  <Eye size={13} /> Mở rộng xem trước
                </>
              )}
            </button>
          </div>
        </div>

        {showPreview ? (
          <div className="pointer-events-none select-none w-full bg-slate-900 overflow-hidden" lang={tab}>
            {/* CMS không chạy dưới [locale] -> cấp ngữ cảnh ngôn ngữ cho link trong bản xem trước */}
            <NextIntlClientProvider locale={tab} messages={{}}>
              <HomeHeroSection hero={previewHero} previewImageUrl={previewUrl} />
            </NextIntlClientProvider>
          </div>
        ) : (
          <div className="px-6 py-3 text-center text-xs text-slate-500 bg-slate-50 flex items-center justify-center gap-2">
            <span>Bản xem trước đang thu gọn.</span>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="font-bold text-[#5F8A03] hover:underline cursor-pointer"
            >
              Hiện xem trước
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="p-6 space-y-6 w-full" noValidate={tab === 'en'}>

        {/* CHỌN NGÔN NGỮ & BỘ LỌC DỊCH (ĐẶT NGAY TRÊN FORM) */}
        <div className="flex items-end justify-between gap-3 flex-wrap pt-1">
          <LocaleTabs
            panelId={PANEL_ID}
            active={tab}
            onChange={setTab}
            tabs={[
              { locale: 'vi', label: 'Tiếng Việt' },
              { locale: 'en', label: 'English' },
            ]}
          />
          {tab === 'en' && progress.total > 0 && (
            <button
              type="button"
              onClick={toggleFilter}
              aria-pressed={untranslatedFilter !== null}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer shadow-2xs ${
                untranslatedFilter
                  ? 'border-[#7CB305]/50 bg-[#F4F9E8] text-[#5F8A03]'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter size={13} aria-hidden="true" />
              {untranslatedFilter ? `Đang lọc ${untranslatedFilter.size} trường chưa dịch — Hiện tất cả` : 'Chỉ hiện trường chưa dịch'}
            </button>
          )}
        </div>

        {apiError && apiError.tab === tab && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs text-rose-700 font-sans">
            <AlertCircle size={15} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span className="flex-1">
              <strong className="font-bold">Không lưu được {tab === 'en' ? 'bản tiếng Anh' : 'bản tiếng Việt'}:</strong>{' '}
              {apiError.message}
              {apiError.conflict && (
                <span className="block mt-1 text-rose-600">
                  Nội dung bạn đang sửa vẫn còn trên màn hình — hãy chép lại phần cần giữ trước khi tải bản mới.
                </span>
              )}
            </span>
            {apiError.conflict && (
              <button
                type="button"
                onClick={handleReloadLatest}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 bg-white text-rose-700 font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <RefreshCw size={13} aria-hidden="true" /> Tải bản mới nhất
              </button>
            )}
          </div>
        )}

        <div role="tabpanel" id={PANEL_ID} aria-labelledby={`tab-${tab}`}>
          {tab === 'vi' ? (
            <HeroViForm
              draft={draftVi}
              setDraft={setDraftVi}
              image={saved.image}
              file={file}
              previewUrl={previewUrl}
              fileError={fileError}
              onPickFile={handlePickFile}
              onDiscardFile={discardFile}
              errors={errors}
            />
          ) : progress.total === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-slate-300 text-center text-sm text-slate-600 font-sans">
              Hãy nhập và lưu bản tiếng Việt trước — bản tiếng Anh được dịch từ bản tiếng Việt.
            </div>
          ) : (
            <HeroEnForm
              vi={draftVi}
              draft={draftEn}
              setDraft={setDraftEn}
              image={saved.image}
              previewUrl={previewUrl}
              errors={errors}
              visibleKeys={untranslatedFilter}
            />
          )}
        </div>

        {/* THANH LƯU CỐ ĐỊNH CHUẨN BRAND REMAK */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-300 shadow-lg flex items-center justify-end gap-2.5 flex-wrap font-sans">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={!isDirty || saving}
            className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Huỷ thay đổi
          </button>
          <button
            type="submit"
            disabled={!isDirty || saving}
            className="px-5 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            Lưu & Cập Nhật Trang Chủ
          </button>
        </div>
      </form>
    </div>
  );
}
