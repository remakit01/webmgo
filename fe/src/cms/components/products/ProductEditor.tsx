'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, ExternalLink, Loader2, RefreshCw, Save } from 'lucide-react';
import type { Locale } from '@remak/shared/locale';
import {
  EXTENSION_OF_PROFILE,
  emptyExtensionFor,
  emptyProductInput,
  emptyTranslationInput,
  productInputErrors,
  type ProductCms,
  type ProductInput,
  type ProductPublishStatus,
  type ProductSpecProfile,
  type ProductTranslationInput,
  type ProductTypeCms,
} from '@remak/shared/contracts/product';
import { useConfirm, useToast } from '@/cms/components/ConfirmDialog';
import { AdminPageBody, ADMIN_CARD } from '@/cms/components/layout/AdminPage';
import ImageUploadField from '@/cms/components/shared/ImageUploadField';
import Skeleton from '@/cms/components/ui/Skeleton';
import { isConflict } from '@/cms/lib/api-client';
import { productsApi } from '@/cms/lib/products-api';
import { productPath } from '@/lib/product-paths';
import { SelectField, Switch } from './fields';
import ProductContentSection from './ProductContentSection';
import ProductExtensionSection from './ProductExtensionSection';
import ProductSpecSection from './ProductSpecSection';
import ProductVariantsSection from './ProductVariantsSection';
import { SECTIONS, errorTarget, fieldId, firstErrorKey, isFormDirty, toProductInput, type SectionId } from './product-form';

type Banner = { message: string; conflict: boolean } | null;
const LOCALES: Locale[] = ['vi', 'en'];

/**
 * Trang tạo / sửa sản phẩm (desktop). Một nút “Lưu” ghi toàn bộ form trong 1 lần (API: 1 transaction, If-Match).
 * - Lỗi kiểm bằng hàm dùng chung với API (productInputErrors): báo tại ô, mở đúng tab / dòng độ dày rồi focus ô sai đầu tiên.
 * - Sau lần lưu lỗi đầu tiên, lỗi tự cập nhật theo từng thay đổi.
 * - Rời trang khi còn thay đổi chưa lưu -> hỏi lại.
 */
export default function ProductEditor({ productId }: { productId?: string }) {
  const router = useRouter();
  const confirm = useConfirm();
  const showToast = useToast();

  const [cms, setCms] = useState<ProductCms | null>(null);
  const [initial, setInitial] = useState<ProductInput>(() => emptyProductInput());
  const [form, setForm] = useState<ProductInput>(() => emptyProductInput());
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(!!productId);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [tab, setTab] = useState<Locale>('vi');
  const [expanded, setExpanded] = useState<number | null>(null);
  const focusRef = useRef<string | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  // Loại sản phẩm quản lý ở màn “Loại Sản Phẩm”; mẫu form thông số riêng đi theo loại đã chọn
  const [types, setTypes] = useState<ProductTypeCms[] | null>(null);

  useEffect(() => {
    productsApi
      .types()
      .then((list) => {
        setTypes(list);
        // Sản phẩm mới: chọn sẵn loại đầu tiên đang hiển thị (đặt cả initial để form không bị coi là đã sửa)
        if (productId) return;
        const first = list.find((t) => t.isActive) ?? list[0];
        if (!first) return;
        const withType = (f: ProductInput) => (f.typeId ? f : { ...f, typeId: first.id, ...emptyExtensionFor(first.specProfile) });
        setInitial(withType);
        setForm(withType);
      })
      .catch((err: unknown) => showToast(err instanceof Error ? err.message : 'Không tải được loại sản phẩm', 'error'));
  }, [productId, showToast]);

  const typeOf = (id: string) => types?.find((t) => t.id === id);
  const profileOf = (id: string): ProductSpecProfile => typeOf(id)?.specProfile ?? 'NONE';
  const profile = profileOf(form.typeId);

  const apply = useCallback((p: ProductCms) => {
    const input = toProductInput(p);
    setCms(p);
    setInitial(input);
    setForm(input);
    setCoverFile(null);
  }, []);

  const load = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setLoadError(null);
    try {
      apply(await productsApi.get(productId));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Không tải được sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [productId, apply]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tải dữ liệu khi mở trang
    void load();
  }, [load]);

  const dirty = useMemo(() => isFormDirty(form, initial) || !!coverFile, [form, initial, coverFile]);
  const errors = useMemo(() => (showErrors ? productInputErrors(form, profile) : {}), [showErrors, form, profile]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  // Focus ô sai sau khi tab / dòng độ dày đã mở xong
  useEffect(() => {
    const id = focusRef.current;
    if (!id) return;
    focusRef.current = null;
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el?.focus({ preventScroll: true });
    });
  }, [errors, tab, expanded]);

  // ── Cập nhật form ───────────────────────────────────────────────────────
  const setTr = (l: Locale, patch: Partial<ProductTranslationInput>) =>
    setForm((f) => {
      const cur = l === 'vi' ? f.translations.vi : f.translations.en;
      if (!cur) return f;
      return { ...f, translations: { ...f.translations, [l]: { ...cur, ...patch } } };
    });

  const changeType = (typeId: string) => {
    const next = profileOf(typeId);
    const same = EXTENSION_OF_PROFILE[profile] === EXTENSION_OF_PROFILE[next];
    const doIt = () => setForm((f) => ({ ...f, typeId, ...(same ? {} : emptyExtensionFor(next)) }));
    const hasExt = !!(form.sip || form.floor || form.decorative);
    if (hasExt && !same) {
      confirm({
        title: 'Đổi loại sản phẩm?',
        description: `Thông số riêng của “${typeOf(form.typeId)?.translations.vi?.name ?? 'loại hiện tại'}” sẽ bị bỏ khi lưu.`,
        confirmText: 'Đổi loại',
        variant: 'warning',
        onConfirm: doIt,
      });
    } else doIt();
  };

  const removeEn = () =>
    confirm({
      title: 'Bỏ bản tiếng Anh?',
      description: 'Khi lưu, nội dung tiếng Anh bị xoá và sản phẩm không còn hiện ở trang /en.',
      confirmText: 'Bỏ bản tiếng Anh',
      variant: 'danger',
      onConfirm: () => setForm((f) => ({ ...f, translations: { ...f.translations, en: null } })),
    });

  /** Rời trang có hỏi khi còn thay đổi chưa lưu */
  const leave = (href: string) => {
    if (!dirty) return router.push(href);
    confirm({
      title: 'Bỏ thay đổi chưa lưu?',
      description: 'Những gì bạn vừa nhập cho sản phẩm này sẽ mất.',
      confirmText: 'Bỏ thay đổi',
      variant: 'warning',
      onConfirm: () => router.push(href),
    });
  };

  // ── Lưu ────────────────────────────────────────────────────────────────
  const save = async () => {
    const found = productInputErrors(form, profile);
    setShowErrors(true);
    const first = firstErrorKey(found);
    if (first) {
      const target = errorTarget(first);
      if (target.locale) setTab(target.locale);
      if (target.variant !== undefined) setExpanded(target.variant);
      focusRef.current = fieldId(first);
      // Lỗi không gắn với ô cụ thể (vd "variants") -> cuộn tới phần chứa
      if (!first.includes('.')) focusRef.current = target.section;
      showToast(`Còn ${Object.keys(found).length} lỗi cần sửa trước khi lưu`, 'error');
      return;
    }
    setSaving(true);
    setBanner(null);
    try {
      let saved = cms ? await productsApi.update(cms.id, form, cms.version) : await productsApi.create(form);
      if (coverFile) saved = await productsApi.updateCover(saved.id, coverFile, saved.version);
      apply(saved);
      setShowErrors(false);
      showToast(cms ? 'Đã lưu sản phẩm' : 'Đã tạo sản phẩm', 'success');
      if (!cms) router.replace(`/admin/products/${saved.id}`);
    } catch (err) {
      const conflict = isConflict(err);
      setBanner({
        conflict,
        message: conflict
          ? 'Sản phẩm vừa được người khác lưu. Nội dung bạn nhập vẫn còn trên màn hình — chép lại phần cần giữ rồi tải bản mới nhất.'
          : err instanceof Error
            ? err.message
            : 'Lưu thất bại',
      });
      requestAnimationFrame(() => bannerRef.current?.focus());
    } finally {
      setSaving(false);
    }
  };

  // Ctrl/Cmd + S
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void saveRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Hiển thị ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <AdminPageBody>
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-[480px] w-full rounded-xl" />
      </AdminPageBody>
    );
  }
  if (loadError) {
    return (
      <AdminPageBody>
        <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-5 py-4 text-sm text-rose-800">
          <p className="font-semibold">{loadError}</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => void load()} className="h-9 rounded-lg border border-rose-300 bg-white px-3 text-sm font-semibold hover:bg-rose-100 cursor-pointer">
              Thử lại
            </button>
            <Link href="/admin/products" className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold hover:underline">
              Về danh sách
            </Link>
          </div>
        </div>
      </AdminPageBody>
    );
  }

  const title = form.translations.vi.name.trim() || (cms ? 'Sửa sản phẩm' : 'Sản phẩm mới');
  const errorCount = Object.keys(errors).length;
  const sectionErrors = (s: SectionId) => Object.keys(errors).filter((k) => errorTarget(k).section === s).length;
  const visibleSections = SECTIONS.filter((s) => s.id !== 'extension' || EXTENSION_OF_PROFILE[profile]);
  const typeName = typeOf(form.typeId)?.translations.vi?.name ?? '';
  // Loại đang ẩn vẫn hiện trong danh sách nếu sản phẩm đang thuộc loại đó
  const typeOptions = (types ?? [])
    .filter((t) => t.isActive || t.id === form.typeId)
    .map((t) => ({ value: t.id, label: `${t.translations.vi?.name ?? t.id}${t.isActive ? '' : ' (đang ẩn)'}` }));

  return (
    <div className="flex min-h-full grow shrink-0 flex-col bg-slate-50">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-300 bg-white px-6 shadow-2xs">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={() => leave('/admin/products')}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-[#4E7202] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03]"
          >
            <ArrowLeft size={15} aria-hidden="true" /> Danh sách sản phẩm
          </button>
          <span className="h-5 w-px shrink-0 bg-slate-200" aria-hidden="true" />
          <h1 className="min-w-0 truncate text-sm font-bold text-slate-900" title={title}>
            {title}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <p className="text-xs font-semibold" aria-live="polite">
            {errorCount > 0 ? <span className="text-rose-700">{errorCount} lỗi cần sửa</span> : dirty ? <span className="text-amber-800">Có thay đổi chưa lưu</span> : null}
          </p>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || (!dirty && !!cms)}
            aria-keyshortcuts="Control+S"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#4E7202] px-4 text-sm font-semibold text-white hover:bg-[#3F5E02] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03]"
          >
            {saving ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
            {saving ? 'Đang lưu…' : cms ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
          </button>
        </div>
      </header>

      <AdminPageBody className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-6">
        <div className="min-w-0 space-y-6">
          {banner && (
            <div ref={bannerRef} tabIndex={-1} role="alert" className="flex items-start gap-2.5 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800 focus:outline-none">
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <div className="flex-1 space-y-2">
                <p>
                  <strong className="font-bold">Không lưu được:</strong> {banner.message}
                </p>
                {banner.conflict && (
                  <button
                    type="button"
                    onClick={() => {
                      setBanner(null);
                      void load();
                    }}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 text-xs font-semibold hover:bg-rose-100 cursor-pointer"
                  >
                    <RefreshCw size={13} aria-hidden="true" /> Tải bản mới nhất
                  </button>
                )}
              </div>
            </div>
          )}

          <ProductContentSection
            translations={form.translations}
            published={cms?.published ?? {}}
            tab={tab}
            onTab={setTab}
            onChange={setTr}
            onAddEn={() => setForm((f) => ({ ...f, translations: { ...f.translations, en: emptyTranslationInput() } }))}
            onRemoveEn={removeEn}
            errors={errors}
          />
          <ProductVariantsSection
            variants={form.variants}
            onChange={(variants) => setForm((f) => ({ ...f, variants }))}
            mechanical={form.technicalSpec}
            expanded={expanded}
            onExpand={setExpanded}
            errors={errors}
          />
          <ProductSpecSection spec={form.technicalSpec} variants={form.variants} onChange={(patch) => setForm((f) => ({ ...f, technicalSpec: { ...f.technicalSpec, ...patch } }))} errors={errors} />
          {EXTENSION_OF_PROFILE[profile] && (
            <ProductExtensionSection form={form} typeName={typeName} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} errors={errors} />
          )}
        </div>

        <aside className="sticky top-20 space-y-4" aria-label="Thiết lập sản phẩm">
          <section className={ADMIN_CARD} aria-labelledby="pub-title">
            <h2 id="pub-title" className="text-sm font-bold text-slate-900">
              Xuất bản
            </h2>
            <div className="mt-3 space-y-3">
              {LOCALES.map((l) => {
                const t = l === 'vi' ? form.translations.vi : form.translations.en;
                const live = cms?.published[l];
                const path = `translations.${l}.status`;
                return (
                  <div key={l} className="space-y-1.5">
                    {t ? (
                      <SelectField<ProductPublishStatus>
                        path={path}
                        label={l === 'vi' ? 'Tiếng Việt' : 'English'}
                        emptyLabel={null}
                        value={t.status}
                        options={[
                          { value: 'DRAFT', label: 'Nháp — chưa hiện trên web' },
                          { value: 'PUBLISHED', label: 'Xuất bản' },
                        ]}
                        onChange={(status) => status && setTr(l, { status })}
                        errors={errors}
                      />
                    ) : (
                      <p className="text-xs text-slate-600">
                        <span className="font-bold text-slate-700">English:</span> chưa có bản dịch
                      </p>
                    )}
                    {live?.status === 'PUBLISHED' && (
                      <a
                        href={productPath(l, live.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-full items-center gap-1 break-all font-mono text-xs text-[#4E7202] underline-offset-2 hover:underline"
                      >
                        {productPath(l, live.slug)} <ExternalLink size={12} className="shrink-0" aria-label="(mở tab mới)" />
                      </a>
                    )}
                  </div>
                );
              })}
              <p className="text-xs text-slate-600">Trang web cập nhật trong vòng 1 phút sau khi lưu.</p>
            </div>
          </section>

          <section className={ADMIN_CARD} aria-labelledby="setup-title">
            <h2 id="setup-title" className="text-sm font-bold text-slate-900">
              Thiết lập
            </h2>
            <div className="mt-3 space-y-3">
              <SelectField<string>
                path="typeId"
                label="Loại sản phẩm"
                emptyLabel={types ? (form.typeId ? null : '— Chọn loại —') : 'Đang tải...'}
                value={form.typeId || null}
                options={typeOptions}
                onChange={(t) => t && changeType(t)}
                errors={errors}
                hint={
                  <Link href="/admin/products/types" target="_blank" className="inline-flex items-center gap-1 font-semibold text-[#4E7202] hover:underline">
                    Quản lý loại <ExternalLink size={12} aria-label="(mở tab mới)" />
                  </Link>
                }
              />
              <Switch id="product-featured" label="Nổi bật" hint="Ưu tiên ở trang chủ và đầu danh sách." checked={form.isFeatured} onChange={(isFeatured) => setForm((f) => ({ ...f, isFeatured }))} />
            </div>
          </section>

          <section className={ADMIN_CARD} aria-label="Ảnh đại diện">
            <ImageUploadField
              label="Ảnh đại diện"
              currentUrl={cms?.coverImageUrl}
              file={coverFile}
              onPick={setCoverFile}
              onClear={() => setCoverFile(null)}
              uploading={saving && !!coverFile}
              aspect="aspect-[4/3]"
              hint="Ảnh tấm sản phẩm, nền sáng. Lưu cùng nút “Lưu”."
            />
          </section>

          <nav className={ADMIN_CARD} aria-label="Mục lục form">
            <ul className="space-y-0.5 text-sm">
              {visibleSections.map((s) => {
                const n = sectionErrors(s.id);
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="flex items-center justify-between rounded-md px-2 py-1.5 font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-[#5F8A03]"
                    >
                      {s.label}
                      {n > 0 && <span className="rounded-full bg-rose-100 px-1.5 text-xs font-bold text-rose-800">{n} lỗi</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
      </AdminPageBody>
    </div>
  );
}
