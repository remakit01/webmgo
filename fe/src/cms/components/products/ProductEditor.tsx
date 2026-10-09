'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Image as ImageIcon,
  Layers,
  ListTree,
  Loader2,
  RefreshCw,
  Save,
  Send,
  SlidersHorizontal,
  Sparkles,
  Star,
  type LucideIcon,
} from 'lucide-react';
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
  type SpecOptionCms,
} from '@remak/shared/contracts/product';
import { useConfirm, useToast } from '@/cms/components/ConfirmDialog';
import { AdminPageBody } from '@/cms/components/layout/AdminPage';
import AiTranslateDialog, { type AiTranslateState } from '@/cms/components/shared/AiTranslateDialog';
import { describeAiError } from '@/cms/components/shared/ai-error';
import ImageUploadField from '@/cms/components/shared/ImageUploadField';
import LocaleTabs from '@/cms/components/shared/LocaleTabs';
import Skeleton from '@/cms/components/ui/Skeleton';
import StatusBadge from '@/cms/components/shared/StatusBadge';
import { ApiError, isConflict } from '@/cms/lib/api-client';
import { productsApi } from '@/cms/lib/products-api';
import { productPath } from '@/lib/product-paths';
import { SelectField } from './fields';
import ProductContentSection from './ProductContentSection';
import ProductExtensionSection from './ProductExtensionSection';
import ProductPublishPanel from './ProductPublishPanel';
import ProductSpecSection from './ProductSpecSection';
import ProductVariantsSection from './ProductVariantsSection';
import { SECTIONS, errorTarget, fieldId, firstErrorKey, isFormDirty, toProductInput, type SectionId } from './product-form';

type Banner = { message: string; conflict: boolean } | null;
const LOCALES: Locale[] = ['vi', 'en'];

/** Panel cài đặt bên cột phải — kế thừa phong cách NewsEditor */
function SidebarPanel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border border-slate-300 shadow-2xs focus-within:z-20 relative overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 rounded-t-xl">
        <h2 className="text-xs font-bold text-slate-800 flex items-center gap-2">
          {Icon && <Icon size={14} className="text-[#5F8A03]" aria-hidden="true" />}
          {title}
        </h2>
      </div>
      <div className="p-4 space-y-3.5">{children}</div>
    </section>
  );
}

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
  // Danh mục thông số (màn “Danh Mục Thông Số”) — lựa chọn cho kiểu cạnh, màu lõi, pha tinh thể…
  const [specOptions, setSpecOptions] = useState<SpecOptionCms[] | null>(null);
  const [typesError, setTypesError] = useState<string | null>(null);

  const loadTypes = useCallback(() => {
    setTypesError(null);
    Promise.all([productsApi.types(), productsApi.specOptions()])
      .then(([list, opts]) => {
        setTypes(list);
        setSpecOptions(opts);
        // Sản phẩm mới: chọn sẵn loại đầu tiên đang hiển thị (đặt cả initial để form không bị coi là đã sửa)
        if (productId) return;
        const first = list.find((t) => t.isActive) ?? list[0];
        if (!first) return;
        const withType = (f: ProductInput) => (f.typeId ? f : { ...f, typeId: first.id, ...emptyExtensionFor(first.specProfile) });
        setInitial(withType);
        setForm(withType);
      })
      .catch((err: unknown) => setTypesError(err instanceof Error ? err.message : 'Không tải được loại sản phẩm / danh mục thông số'));
  }, [productId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- tải danh sách loại khi mở trang
    loadTypes();
  }, [loadTypes]);

  const typeOf = (id: string) => types?.find((t) => t.id === id);
  const profileOf = (id: string): ProductSpecProfile => typeOf(id)?.specProfile ?? 'NONE';
  const profile = profileOf(form.typeId);

  // Quản lý huy hiệu AI, kết quả dịch AI và cảnh báo lệch nội dung khi tiếng Việt bị sửa sau khi dịch
  const [aiFilledKeys, setAiFilledKeys] = useState<Set<string>>(new Set());
  const [aiViSnapshot, setAiViSnapshot] = useState<string | null>(null);
  const [enStaleDismissed, setEnStaleDismissed] = useState(false);
  const [aiResult, setAiResult] = useState<{ fallbackBlocks: number } | null>(null);
  const [aiState, setAiState] = useState<AiTranslateState | null>(null);
  const aiAbort = useRef<AbortController | null>(null);

  const apply = useCallback((p: ProductCms) => {
    const input = toProductInput(p);
    setCms(p);
    setInitial(input);
    setForm(input);
    setCoverFile(null);
    setAiResult(null);
    setAiFilledKeys(new Set());
    if (input.translations.vi) {
      setAiViSnapshot(JSON.stringify(input.translations.vi));
    }
    setEnStaleDismissed(false);
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

  // Chuẩn hoá: nếu tab tiếng Anh chưa có tên / sapo thì không bắt lỗi form và gửi en: null
  const normalizedForm = useMemo((): ProductInput => {
    const en = form.translations.en;
    const hasEnData = !!en && (!!en.name.trim() || !!en.summary.trim() || !!en.tagline?.trim());
    return {
      ...form,
      translations: {
        vi: form.translations.vi,
        en: hasEnData ? en : null,
      },
    };
  }, [form]);

  const dirty = useMemo(() => isFormDirty(form, initial) || !!coverFile, [form, initial, coverFile]);
  const errors = useMemo(() => (showErrors ? productInputErrors(normalizedForm, profile) : {}), [showErrors, normalizedForm, profile]);

  const enStale = useMemo(() => {
    if (!aiViSnapshot || enStaleDismissed || !form.translations.en?.name?.trim()) return false;
    return JSON.stringify(form.translations.vi) !== aiViSnapshot;
  }, [aiViSnapshot, enStaleDismissed, form.translations]);

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
  const setTr = (l: Locale, patch: Partial<ProductTranslationInput>) => {
    if (l === 'en') {
      setAiFilledKeys((prev) => {
        if (prev.size === 0) return prev;
        const next = new Set(prev);
        Object.keys(patch).forEach((k) => next.delete(k));
        return next;
      });
    }
    setForm((f) => {
      const cur = l === 'vi' ? f.translations.vi : (f.translations.en ?? emptyTranslationInput());
      return { ...f, translations: { ...f.translations, [l]: { ...cur, ...patch } } };
    });
  };

  const changeType = (typeId: string) => {
    const next = profileOf(typeId);
    const same = EXTENSION_OF_PROFILE[profile] === EXTENSION_OF_PROFILE[next];
    // Khối của mẫu mới đã có trong DB (đang ẩn) -> hiện lại dữ liệu cũ thay vì form trống, lưu không ghi đè
    const stored = cms?.storedExtensions;
    const restored = (ext: Pick<ProductInput, 'sip' | 'floor' | 'decorative'>) => ({
      sip: ext.sip && stored?.sip ? stored.sip : ext.sip,
      floor: ext.floor && stored?.floor ? stored.floor : ext.floor,
      decorative: ext.decorative && stored?.decorative ? stored.decorative : ext.decorative,
    });
    const doIt = () => setForm((f) => ({ ...f, typeId, ...(same ? {} : restored(emptyExtensionFor(next))) }));
    const hasExt = !!(form.sip || form.floor || form.decorative);
    if (hasExt && !same) {
      confirm({
        title: 'Đổi loại sản phẩm?',
        description: `Thông số riêng của “${typeOf(form.typeId)?.translations.vi?.name ?? 'loại hiện tại'}” sẽ được ẩn đi (vẫn giữ trong hệ thống, hiện lại khi chọn loại có cùng mẫu thông số).`,
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
      onConfirm: () => {
        setForm((f) => ({ ...f, translations: { ...f.translations, en: null } }));
        setAiFilledKeys(new Set());
      },
    });

  // ── AI Dịch tự động (Gemini) ───────────────────────────────────────────
  /** Chép nguyên văn bản tiếng Việt sang bản tiếng Anh để tự biên tập */
  const copyViToEn = () => {
    const vi = form.translations.vi;
    if (!vi.name.trim()) {
      showToast('Chưa có nội dung tiếng Việt để sao chép', 'warning');
      return;
    }
    setForm((f) => ({
      ...f,
      translations: {
        ...f.translations,
        en: {
          status: f.translations.en?.status ?? 'DRAFT',
          name: vi.name,
          slug: f.translations.en?.slug ?? (vi.slug ? `${vi.slug}-en` : null),
          tagline: vi.tagline,
          summary: vi.summary,
          description: vi.description,
          highlights: [...(vi.highlights ?? [])],
          advantages: (vi.advantages ?? []).map((a) => ({ ...a })),
          faqs: (vi.faqs ?? []).map((q) => ({ ...q })),
          coverAlt: vi.coverAlt,
          seoTitle: vi.seoTitle,
          seoDescription: vi.seoDescription,
          focusKeyword: vi.focusKeyword,
          noindex: vi.noindex,
        },
      },
    }));
    setAiFilledKeys(new Set());
    setAiViSnapshot(JSON.stringify(vi));
    setEnStaleDismissed(false);
    setTab('en');
    showToast('Đã chép nội dung bản tiếng Việt sang tiếng Anh', 'success');
  };

  /** Chạy AI dịch sang tiếng Anh kèm dialog tiến trình thời gian thực */
  const runAiTranslate = async () => {
    const vi = form.translations.vi;
    if (!vi.name.trim()) {
      showToast('Vui lòng nhập tên sản phẩm tiếng Việt trước khi dịch AI', 'warning');
      return;
    }

    const en = form.translations.en;
    const hasEnContent = !!en && (!!en.name.trim() || !!en.summary.trim());
    if (hasEnContent) {
      const ok = await confirm({
        title: 'Thay bản tiếng Anh bằng bản AI dịch?',
        description: 'Nội dung tiếng Anh đang có trên form sẽ được thay bằng bản dịch mới (chưa lưu cho tới khi bạn bấm Lưu). Đường dẫn tiếng Anh hiện tại được giữ nguyên.',
        confirmText: 'Dịch lại bằng AI',
        variant: 'warning',
      });
      if (!ok) return;
    }

    aiAbort.current?.abort();
    const abort = new AbortController();
    aiAbort.current = abort;
    setAiResult(null);
    const startedAt = Date.now();
    setAiState({ phase: 'connecting', startedAt });

    try {
      await productsApi.aiDraftStream(
        cms?.id ?? 'new',
        {
          sourceVi: form.translations.vi,
          currentEnSlug: form.translations.en?.slug,
        },
        (event) => {
          if (event.type === 'prepare') {
            setAiState((s) => s && { ...s, phase: 'prepare', prepare: event, lastEventAt: Date.now() });
          } else if (event.type === 'progress') {
            setAiState((s) => s && { ...s, phase: 'translate', progress: event, lastEventAt: Date.now() });
          } else if (event.type === 'assemble') {
            setAiState((s) => s && { ...s, phase: 'assemble' });
          } else if (event.type === 'error') {
            setAiState((s) => s && { ...s, phase: 'error', finishedAt: Date.now(), error: describeAiError(event.status, event.message) });
          } else if (event.type === 'result') {
            const draftAi = event.draft;
            setForm((f) => ({
              ...f,
              translations: {
                ...f.translations,
                en: {
                  status: f.translations.en?.status ?? 'DRAFT',
                  name: draftAi.name,
                  slug: draftAi.slug,
                  tagline: draftAi.tagline,
                  summary: draftAi.summary,
                  description: draftAi.description,
                  highlights: draftAi.highlights,
                  advantages: draftAi.advantages,
                  faqs: draftAi.faqs,
                  coverAlt: draftAi.coverAlt,
                  seoTitle: draftAi.seoTitle,
                  seoDescription: draftAi.seoDescription,
                  focusKeyword: draftAi.focusKeyword,
                  noindex: draftAi.noindex,
                },
              },
            }));
            setAiResult({ fallbackBlocks: draftAi.fallbackBlocks });
            setAiFilledKeys(new Set(['name', 'slug', 'tagline', 'summary', 'description', 'highlights', 'advantages', 'faqs', 'coverAlt', 'seoTitle', 'seoDescription', 'focusKeyword']));
            setAiViSnapshot(JSON.stringify(form.translations.vi));
            setEnStaleDismissed(false);
            setTab('en');
            setAiState((s) => s && { ...s, phase: 'done', finishedAt: Date.now(), fallbackBlocks: draftAi.fallbackBlocks });
            showToast('Đã dịch xong — kiểm tra lại trước khi lưu', 'success');
          }
        },
        abort.signal,
      );
    } catch (err) {
      if (abort.signal.aborted) {
        setAiState(null);
        showToast('Đã huỷ dịch — bản tiếng Anh giữ nguyên như trước', 'info');
      } else {
        setAiState((s) => s && {
          ...s,
          phase: 'error',
          finishedAt: Date.now(),
          error: describeAiError(err instanceof ApiError ? err.status : 500, err instanceof Error ? err.message : ''),
        });
      }
    } finally {
      if (aiAbort.current === abort) aiAbort.current = null;
    }
  };

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
  const save = async (overrideForm?: ProductInput, action: 'save' | 'publish' | 'unpublish' = 'save') => {
    // Mẫu thông số đi theo loại: chưa có danh sách loại thì không kiểm / lưu được đúng
    if (!types || !specOptions) return;
    const formToSave = overrideForm ?? normalizedForm;
    const found = productInputErrors(formToSave, profile);
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
      let saved = cms ? await productsApi.update(cms.id, formToSave, cms.version) : await productsApi.create(formToSave);
      if (coverFile) saved = await productsApi.updateCover(saved.id, coverFile, saved.version);
      apply(saved);
      setShowErrors(false);
      
      if (!cms) {
        showToast('Đã tạo sản phẩm', 'success');
        router.replace(`/admin/products/${saved.id}`);
      } else if (action === 'publish') {
        showToast('Đã xuất bản — trang web cập nhật trong giây lát', 'success');
      } else if (action === 'unpublish') {
        showToast('Đã chuyển về bản nháp', 'success');
      } else {
        showToast('Đã lưu nháp', 'success');
      }
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

  const handlePublishLocale = async () => {
    const cur = tab === 'vi' ? form.translations.vi : (form.translations.en ?? emptyTranslationInput());
    const nextForm: ProductInput = {
      ...normalizedForm,
      translations: {
        ...normalizedForm.translations,
        [tab]: {
          ...cur,
          status: 'PUBLISHED',
        },
      },
    };
    setForm(nextForm);
    await save(nextForm, 'publish');
  };

  const handleUnpublishLocale = async () => {
    const cur = tab === 'vi' ? form.translations.vi : (form.translations.en ?? emptyTranslationInput());
    const nextForm: ProductInput = {
      ...normalizedForm,
      translations: {
        ...normalizedForm.translations,
        [tab]: {
          ...cur,
          status: 'DRAFT',
        },
      },
    };
    setForm(nextForm);
    await save(nextForm, 'unpublish');
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
        <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-5 py-4 text-sm text-rose-900 shadow-2xs">
          <p className="font-bold">{loadError}</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => void load()} className="h-9 rounded-lg border border-rose-300 bg-white px-3.5 text-sm font-bold text-rose-800 hover:bg-rose-100 cursor-pointer transition-colors shadow-2xs">
              Thử lại
            </button>
            <Link href="/admin/products" className="inline-flex h-9 items-center rounded-lg px-3.5 text-sm font-bold text-slate-700 hover:text-slate-900 hover:underline">
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

  const currentStatus = form.translations[tab]?.status ?? null;
  const viLive = form.translations.vi?.status === 'PUBLISHED';
  const tabHasError = (l: Locale) => Object.keys(errors).some((k) => k.startsWith(`translations.${l}.`));

  return (
    <div className="flex min-h-full grow shrink-0 flex-col bg-slate-50">
      {/* ── TOP ACTION BAR (STICKY) ── */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-300 bg-white px-4 sm:px-6 shadow-2xs">
        {/* Left: Quay lại & Trạng thái & Tiêu đề sản phẩm */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => leave('/admin/products')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#5F8A03] hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
            title="Quay lại danh sách sản phẩm"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            <span className="hidden sm:inline">Quay lại danh sách</span>
          </button>

          <span className="w-px h-5 bg-slate-200 shrink-0" aria-hidden="true" />

          <div className="flex items-center gap-2 min-w-0">
            <StatusBadge status={currentStatus} />
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[130px] sm:max-w-[200px] md:max-w-xs lg:max-w-sm hidden md:block" title={title}>
              {title}
            </h1>
          </div>
        </div>

        {/* Center: Chuyển ngôn ngữ WAI-ARIA & Thông tin loại / biến thể */}
        <div className="hidden lg:flex items-center gap-3.5 mx-2">
          <LocaleTabs
            panelId="product-locale-panel"
            active={tab}
            onChange={setTab}
            tabs={[
              { locale: 'vi', label: 'Tiếng Việt', hint: tabHasError('vi') ? 'có lỗi' : undefined },
              { locale: 'en', label: 'Tiếng Anh', hint: tabHasError('en') ? 'có lỗi' : undefined },
            ]}
          />

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 tabular-nums px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300">
            <Layers size={13} className="text-[#5F8A03]" aria-hidden="true" />
            <span>{typeName || 'Chưa chọn loại'}</span>
            <span className="text-slate-300">·</span>
            <span>{form.variants.length} độ dày</span>
          </div>
        </div>

        {/* Right: Thao tác chính: Trạng thái đồng bộ + Lưu nháp + Xuất bản */}
        <div className="flex items-center gap-2 shrink-0">
          <div aria-live="polite">
            {errorCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-800 shadow-2xs">
                <AlertCircle size={14} className="shrink-0 text-rose-600" aria-hidden="true" />
                <span className="hidden sm:inline">{errorCount} lỗi cần sửa</span>
                <span className="sm:hidden">{errorCount} lỗi</span>
              </span>
            ) : dirty ? (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
                <span className="hidden sm:inline">Có thay đổi chưa lưu</span>
                <span className="sm:hidden">Chưa lưu</span>
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-500 hidden sm:inline">Đã đồng bộ</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || !types || !specOptions || (!dirty && !!cms)}
            aria-keyshortcuts="Control+S"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : <Save size={13} aria-hidden="true" />}
            <span>Lưu nháp</span>
          </button>

          <button
            type="button"
            disabled={saving || !types || !specOptions || (tab === 'en' && !viLive)}
            onClick={() => void handlePublishLocale()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-remak-orange hover:bg-remak-orange-dark text-white text-xs font-bold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {saving ? <Loader2 size={13} className="animate-spin" aria-hidden="true" /> : <Send size={13} aria-hidden="true" />}
            <span>{currentStatus === 'PUBLISHED' ? 'Cập nhật' : 'Xuất bản'}</span>
          </button>
        </div>
      </header>

      {/* Sub-bar cho Mobile & Tablet */}
      <div className="lg:hidden px-4 py-2 border-b border-slate-300 flex items-center justify-between gap-2 bg-white">
        <LocaleTabs
          panelId="product-locale-panel"
          active={tab}
          onChange={setTab}
          tabs={[
            { locale: 'vi', label: 'Tiếng Việt', hint: tabHasError('vi') ? 'có lỗi' : undefined },
            { locale: 'en', label: 'Tiếng Anh', hint: tabHasError('en') ? 'có lỗi' : undefined },
          ]}
        />
        <span className="text-[11px] font-semibold text-slate-600 tabular-nums">
          {typeName} · {form.variants.length} độ dày
        </span>
      </div>

      <AdminPageBody className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-6">
        <div className="min-w-0 space-y-6">
          {typesError && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3.5 text-sm text-rose-900 shadow-2xs">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
              <div className="flex-1 space-y-2">
                <p className="font-medium">Không tải được loại sản phẩm / danh mục thông số ({typesError}) — chưa lưu được sản phẩm.</p>
                <button
                  type="button"
                  onClick={loadTypes}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 text-xs font-bold text-rose-800 hover:bg-rose-100 cursor-pointer transition-colors shadow-2xs"
                >
                  <RefreshCw size={13} aria-hidden="true" /> Thử lại
                </button>
              </div>
            </div>
          )}
          {banner && (
            <div ref={bannerRef} tabIndex={-1} role="alert" className="flex items-start gap-3 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3.5 text-sm text-rose-900 shadow-2xs focus:outline-none">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
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
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 text-xs font-bold text-rose-800 hover:bg-rose-100 cursor-pointer transition-colors shadow-2xs"
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
            onRemoveEn={removeEn}
            onAiTranslate={() => void runAiTranslate()}
            onCopyViToEn={copyViToEn}
            isAiTranslating={aiState?.phase === 'connecting' || aiState?.phase === 'prepare' || aiState?.phase === 'translate' || aiState?.phase === 'assemble'}
            aiResult={aiResult}
            errors={errors}
            isAi={(field) => tab === 'en' && aiFilledKeys.has(field)}
            enStale={enStale}
            onDismissStale={() => setEnStaleDismissed(true)}
          />
          <ProductVariantsSection
            variants={form.variants}
            onChange={(variants) => setForm((f) => ({ ...f, variants }))}
            mechanical={form.technicalSpec}
            expanded={expanded}
            onExpand={setExpanded}
            errors={errors}
          />
          <ProductSpecSection spec={form.technicalSpec} variants={form.variants} options={specOptions ?? []} onChange={(patch) => setForm((f) => ({ ...f, technicalSpec: { ...f.technicalSpec, ...patch } }))} errors={errors} />
          {EXTENSION_OF_PROFILE[profile] && (
            <ProductExtensionSection form={form} typeName={typeName} options={specOptions ?? []} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} errors={errors} />
          )}
        </div>

        <aside className="sticky top-20 space-y-4" aria-label="Thiết lập sản phẩm">
          {/* Group 1: Xuất bản */}
          <SidebarPanel title="Xuất bản" icon={Send}>
            <ProductPublishPanel
              key={`${tab}-${form.translations[tab]?.status ?? 'none'}`}
              locale={tab}
              form={form}
              cms={cms}
              busy={saving}
              onUnpublish={() => void handleUnpublishLocale()}
            />
          </SidebarPanel>

          {/* Group 2: Thiết lập */}
          <SidebarPanel title="Thiết lập" icon={SlidersHorizontal}>
            <div className="space-y-3.5">
              <SelectField<string>
                path="typeId"
                label="Loại sản phẩm"
                emptyLabel={types ? (form.typeId ? null : '— Chọn loại —') : 'Đang tải...'}
                value={form.typeId || null}
                options={typeOptions}
                onChange={(t) => t && changeType(t)}
                errors={errors}
                hint={
                  <Link href="/admin/products/types" target="_blank" className="inline-flex items-center gap-1 font-bold text-[#4E7202] hover:underline">
                    Quản lý loại <ExternalLink size={12} aria-label="(mở tab mới)" />
                  </Link>
                }
              />
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="accent-[#5F8A03] rounded h-4 w-4 cursor-pointer"
                    checked={form.isFeatured}
                    onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                  />
                  <Star size={13} className="text-amber-500 fill-amber-500 shrink-0" aria-hidden="true" />
                  <span>Sản phẩm nổi bật (hiển thị trang chủ & đầu danh sách)</span>
                </label>
              </div>
              <Link href="/admin/products/spec-options" target="_blank" className="inline-flex items-center gap-1 text-xs font-bold text-[#4E7202] hover:underline">
                Quản lý danh mục thông số<ExternalLink size={12} aria-label="(mở tab mới)" />
              </Link>
            </div>
          </SidebarPanel>

          {/* Group 3: Ảnh đại diện */}
          <SidebarPanel title="Ảnh đại diện" icon={ImageIcon}>
            <ImageUploadField
              label="Tải ảnh lên"
              currentUrl={cms?.coverImageUrl}
              file={coverFile}
              onPick={setCoverFile}
              onClear={() => setCoverFile(null)}
              uploading={saving && !!coverFile}
              aspect="aspect-[4/3]"
              hint="Ảnh tấm sản phẩm, nền sáng. Lưu cùng nút “Lưu”."
            />
          </SidebarPanel>

          {/* Group 4: Mục lục form */}
          <SidebarPanel title="Mục lục form" icon={ListTree}>
            <ul className="space-y-1 text-sm">
              {visibleSections.map((s) => {
                const n = sectionErrors(s.id);
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="flex items-center justify-between rounded-lg px-2.5 py-2 font-bold text-slate-800 hover:bg-slate-100 hover:text-[#4E7202] border border-transparent hover:border-slate-200 transition-colors focus-visible:outline-2 focus-visible:outline-[#4E7202]"
                    >
                      <span>{s.label}</span>
                      {n > 0 && <span className="rounded-full border border-rose-300 bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800">{n} lỗi</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
          </SidebarPanel>
        </aside>
      </AdminPageBody>

      <AiTranslateDialog
        open={!!aiState}
        state={aiState}
        title="Dịch sản phẩm sang tiếng Anh bằng AI"
        onCancel={() => {
          aiAbort.current?.abort();
          setAiState(null);
        }}
        onClose={() => setAiState(null)}
        onRetry={() => void runAiTranslate()}
        onCopySource={() => {
          setAiState(null);
          copyViToEn();
        }}
      />
    </div>
  );
}
