'use client';

import React, { useMemo, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { AlertCircle, ChevronDown, Copy, FileText, Info, Loader2, Sparkles, Trash2 } from 'lucide-react';
import type { Locale } from '@remak/shared/locale';
import { slugify } from '@remak/shared/slug';
import {
  PRODUCT_LIMITS,
  emptyTranslationInput,
  type ProductInput,
  type ProductTranslationInput,
} from '@remak/shared/contracts/product';
import type { RichDoc } from '@/types/news';
import AiBadge from '@/cms/components/shared/AiBadge';
import SeoPanel from '@/cms/components/shared/SeoPanel';
import Skeleton from '@/cms/components/ui/Skeleton';
import { productsApi } from '@/cms/lib/products-api';
import { productPath, productsIndexPath } from '@/lib/product-paths';
import { BareInput, RepeatList, TagsField, TextField, labelClass } from './fields';
import { blankToNull, fieldId } from './product-form';

// TipTap chỉ tải ở CMS, phía trình duyệt
const RichTextEditor = dynamic(() => import('@/cms/components/shared/rich-text/RichTextEditor'), {
  ssr: false,
  loading: () => <Skeleton className="h-[320px] w-full rounded-xl" />,
});

const PANEL_ID = 'product-locale-panel';
const L = PRODUCT_LIMITS;

/** Khối thông báo / cảnh báo nhỏ gọn */
function Notice({ tone, children }: { tone: 'brand' | 'warning' | 'info'; children: ReactNode }) {
  const isBrand = tone === 'brand';
  const isWarning = tone === 'warning';
  return (
    <div
      role="status"
      className={`rounded-xl border px-4 py-3 text-xs flex items-start gap-2.5 shadow-2xs ${
        isBrand
          ? 'border-[#7CB305]/40 bg-[#F4F9E8]/80 text-[#2B4001]'
          : isWarning
            ? 'border-amber-300 bg-amber-50/90 text-amber-900'
            : 'border-sky-300 bg-sky-50/80 text-sky-900'
      }`}
    >
      {isBrand ? (
        <Info size={16} className="text-[#5F8A03] shrink-0 mt-0.5" aria-hidden="true" />
      ) : isWarning ? (
        <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
      ) : (
        <Info size={16} className="text-sky-600 shrink-0 mt-0.5" aria-hidden="true" />
      )}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

/** Nội dung theo ngôn ngữ: tên, đường dẫn, tóm tắt, mô tả, điểm nổi bật, ưu điểm, FAQ, SEO */
export default function ProductContentSection({
  translations,
  published,
  tab,
  onTab,
  onChange,
  onRemoveEn,
  onAiTranslate,
  onCopyViToEn,
  isAiTranslating,
  aiResult,
  errors,
  isAi,
  enStale,
  onDismissStale,
}: {
  translations: ProductInput['translations'];
  /** slug đang chạy trên web theo ngôn ngữ (cảnh báo khi đổi) */
  published: Partial<Record<Locale, { slug: string; status: string }>>;
  tab: Locale;
  onTab: (l: Locale) => void;
  onChange: (l: Locale, patch: Partial<ProductTranslationInput>) => void;
  onAddEn?: () => void;
  onRemoveEn: () => void;
  onAiTranslate?: () => void;
  onCopyViToEn?: () => void;
  isAiTranslating?: boolean;
  aiResult?: { fallbackBlocks: number } | null;
  errors: Record<string, string>;
  isAi?: (field: string) => boolean;
  enStale?: boolean;
  onDismissStale?: () => void;
}) {
  const emptyEn = useMemo(() => emptyTranslationInput(), []);
  // Luôn đảm bảo `t` tồn tại — bên tab English không bao giờ bị ẩn trường
  const t = tab === 'vi' ? translations.vi : (translations.en ?? emptyEn);
  const p = (f: string) => `translations.${tab}.${f}`;
  const set = (patch: Partial<ProductTranslationInput>) => onChange(tab, patch);
  const tabHasError = (l: Locale) => Object.keys(errors).some((k) => k.startsWith(`translations.${l}.`));

  const slugShown = t.slug?.trim() || slugify(t.name);
  const live = published[tab];
  const slugChanged = !!live && live.status === 'PUBLISHED' && !!slugShown && slugShown !== live.slug;
  const hasEnContent = !!translations.en && (!!translations.en.name.trim() || !!translations.en.summary.trim());

  return (
    <section id="content" aria-label="Nội dung sản phẩm" className="scroll-mt-24 space-y-5">
      <div id={PANEL_ID} role="tabpanel" aria-labelledby={`tab-${tab}`} className="space-y-5">
        {/* ── THANH TRỢ GIÚP DỊCH THUẬT & ĐỐI CHIẾU Ở TAB ENGLISH ── */}
        {tab === 'en' && (
          <div className="space-y-3">
            {/* 1. Cảnh báo bản tiếng Việt đã sửa sau lần dịch gần nhất */}
            {enStale && (
              <Notice tone="warning">
                <div className="flex items-center justify-between gap-3 flex-wrap w-full">
                  <span>Bản tiếng Việt đã sửa sau lần dịch gần nhất — hãy cập nhật bản tiếng Anh cho khớp.</span>
                  {onDismissStale && (
                    <button
                      type="button"
                      onClick={onDismissStale}
                      className="font-bold underline cursor-pointer text-amber-950 hover:text-amber-800 transition-colors"
                    >
                      Đánh dấu đã cập nhật
                    </button>
                  )}
                </div>
              </Notice>
            )}

            {/* 3. Thanh Gradient AI chuẩn theo thiết kế */}
            <div className="rounded-xl border border-[#7CB305]/40 bg-gradient-to-r from-[#F4F9E8] via-[#FAFDF5] to-white p-3.5 sm:p-4 shadow-2xs">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs text-slate-700 min-w-0">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                    <Sparkles size={15} className="text-[#5F8A03]" aria-hidden="true" /> Dịch tự động bằng AI (Gemini)
                  </p>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-slate-600">
                    Dịch cả tiêu đề, sapo, nội dung, alt/chú thích ảnh và SEO; giữ nguyên ảnh, bảng, video, link. Điền trực tiếp vào form — bạn duyệt rồi mới lưu.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {onCopyViToEn && (
                    <button
                      type="button"
                      onClick={onCopyViToEn}
                      disabled={isAiTranslating}
                      className="inline-flex h-9 items-center gap-1.5 px-3 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs transition-colors disabled:opacity-50"
                    >
                      <Copy size={13} aria-hidden="true" /> Chép bản Việt để tự dịch
                    </button>
                  )}
                  {onAiTranslate && (
                    <button
                      type="button"
                      onClick={onAiTranslate}
                      disabled={isAiTranslating}
                      className="inline-flex h-9 items-center gap-1.5 px-4 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      {isAiTranslating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                      <span>{isAiTranslating ? 'Đang dịch…' : hasEnContent ? 'Dịch lại bằng AI' : 'Dịch bằng AI'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Cảnh báo bản nháp do AI dịch chưa lưu */}
            {aiResult && (
              <Notice tone="warning">
                <strong>Bản nháp do AI dịch — chưa lưu.</strong> Hãy đọc duyệt thuật ngữ, số liệu và tên tiêu chuẩn trước khi bấm <strong>Lưu nháp</strong> hoặc <strong>Xuất bản</strong>.
                {aiResult.fallbackBlocks > 0 && ` Có ${aiResult.fallbackBlocks} đoạn AI làm mất định dạng (đậm/nghiêng/link) — kiểm tra lại các đoạn đó.`}
              </Notice>
            )}

            {/* 5. Bản tiếng Việt để đối chiếu khi dịch (Accordion) */}
            {translations.vi?.name && (
              <details className="group rounded-xl border border-slate-300 bg-white overflow-hidden shadow-2xs">
                <summary className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer list-none select-none transition-colors">
                  <span className="flex items-center gap-1.5">
                    <FileText size={13} className="text-[#5F8A03]" aria-hidden="true" />
                    Bản tiếng Việt để đối chiếu khi dịch
                  </span>
                  <ChevronDown size={14} className="text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div lang="vi" className="p-4 space-y-2 text-sm text-slate-700 border-t border-slate-200 bg-white">
                  <p className="text-base font-bold text-slate-900">{translations.vi.name}</p>
                  {translations.vi.tagline && <p className="italic text-xs text-slate-600 font-medium">Khẩu hiệu: “{translations.vi.tagline}”</p>}
                  {translations.vi.summary && <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">{translations.vi.summary}</p>}
                  {translations.vi.slug && (
                    <p className="text-[11px] text-slate-500 font-mono">
                      Đường dẫn: {productsIndexPath('vi')}/{translations.vi.slug}
                    </p>
                  )}
                </div>
              </details>
            )}
          </div>
        )}

        {/* ── KHỐI CANVAS SOẠN THẢO TẬP TRUNG (TIÊU ĐỀ + SLUG + TAGLINE + SAPO + TIPTAP) ── */}
        <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 space-y-4">
            {/* 1. Tiêu đề sản phẩm (Canvas Header) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor={fieldId(p('name'))} className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wide">
                  Tiêu đề sản phẩm <span className="text-rose-500">*</span>
                  {isAi?.('name') && <AiBadge />}
                </label>
                <span className={`text-[11px] font-semibold tabular-nums ${(t.name?.length ?? 0) > L.name ? 'text-rose-600' : (t.name?.length ?? 0) === 0 ? 'text-slate-400' : 'text-slate-500'}`}>
                  {(t.name?.length ?? 0)}/{L.name} ký tự
                </span>
              </div>
              <textarea
                id={fieldId(p('name'))}
                rows={2}
                value={t.name}
                maxLength={L.name}
                onChange={(e) => set({ name: e.target.value.replace(/\n/g, ' ') })}
                placeholder={tab === 'vi' ? 'Nhập tên sản phẩm tiếng Việt (vd: Tấm Magie Oxide Remak MGO B1)…' : 'Tiếng Anh product title (e.g. Remak MGO Fireproof Board)…'}
                aria-invalid={!!errors[p('name')]}
                spellCheck={false}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 hover:border-slate-400 text-lg sm:text-xl font-bold text-slate-900 bg-white placeholder:text-slate-300 focus:outline-none focus:border-[#5F8A03] focus:ring-1 focus:ring-[#5F8A03] transition-colors leading-snug resize-none"
              />
              {errors[p('name')] && (
                <p role="alert" className="text-xs font-semibold text-rose-600">{errors[p('name')]}</p>
              )}
            </div>

            {/* 2. Đường dẫn (Slug) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor={fieldId(p('slug'))} className={labelClass}>
                  <span className="flex items-center gap-1.5">
                    Đường dẫn (URL Slug)
                    {isAi?.('slug') && <AiBadge />}
                  </span>
                </label>
              </div>
              <div className="flex h-10 items-stretch overflow-hidden rounded-lg border border-slate-300 bg-white hover:border-slate-400 focus-within:border-[#4E7202] focus-within:ring-2 focus-within:ring-[#4E7202]/20 transition-colors">
                <span className="flex shrink-0 items-center border-r border-slate-200 bg-slate-100/90 px-3 font-mono text-xs font-semibold text-slate-700 select-none">
                  {productsIndexPath(tab)}/
                </span>
                <input
                  id={fieldId(p('slug'))}
                  value={t.slug ?? ''}
                  maxLength={L.slug}
                  placeholder={slugify(t.name) || 'tu-sinh-tu-ten'}
                  aria-describedby={`${fieldId(p('slug'))}-hint`}
                  onChange={(e) => set({ slug: blankToNull(e.target.value.toLowerCase()) })}
                  onBlur={() => t.slug && set({ slug: blankToNull(slugify(t.slug)) })}
                  className="min-w-0 flex-1 px-3.5 font-mono text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
              </div>
              <p id={`${fieldId(p('slug'))}-hint`} className={`text-xs ${slugChanged ? 'rounded-md border border-amber-300 bg-amber-50 p-2 font-semibold text-amber-900' : 'font-normal text-slate-500'}`}>
                {slugChanged
                  ? `Đổi đường dẫn đang chạy: link cũ ${productPath(tab, live!.slug)} sẽ tự chuyển (301) sang link mới.`
                  : 'Bỏ trống = tự sinh từ tên. Trùng với sản phẩm khác thì tự thêm số.'}
              </p>
            </div>

            {/* 3. Câu khẩu hiệu */}
            <TextField
              path={p('tagline')}
              label={
                <span className="flex items-center gap-1.5">
                  Câu khẩu hiệu
                  {isAi?.('tagline') && <AiBadge />}
                </span>
              }
              hint="Một dòng ngắn dưới tên, vd “Chống cháy A1 – không amiăng”."
              value={t.tagline ?? ''}
              onChange={(v) => set({ tagline: blankToNull(v) })}
              errors={errors}
              maxLength={L.tagline}
            />

            {/* 4. Tóm tắt (Sapo) */}
            <TextField
              path={p('summary')}
              label={
                <span className="flex items-center gap-1.5">
                  Tóm tắt (Sapo)
                  {isAi?.('summary') && <AiBadge />}
                </span>
              }
              required={t.status === 'PUBLISHED'}
              hint="2–3 câu, hiện ở danh sách sản phẩm và làm mô tả Google khi chưa nhập SEO."
              rows={3}
              value={t.summary}
              onChange={(summary) => set({ summary })}
              errors={errors}
              maxLength={L.summary}
            />
          </div>

          {/* 5. Mô tả chi tiết (TipTap RichTextEditor) — liền khối Canvas */}
          <div className="border-t border-slate-300">
            <div className="px-5 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <span id={`${fieldId(p('description'))}-label`} className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                Mô tả chi tiết bài viết
                {isAi?.('description') && <AiBadge />}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Định dạng phong phú (TipTap)</span>
            </div>
            <div id={fieldId(p('description'))} tabIndex={-1} className="overflow-hidden">
              <RichTextEditor
                key={tab}
                value={t.description as RichDoc}
                onChange={(description) => set({ description })}
                onUploadImage={productsApi.uploadContentImage}
                ariaLabel={`Mô tả chi tiết (${tab === 'vi' ? 'tiếng Việt' : 'tiếng Anh'})`}
                embedded
              />
            </div>
            {errors[p('description')] && (
              <p className="px-5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border-t border-rose-200">
                {errors[p('description')]}
              </p>
            )}
          </div>
        </div>

        {/* ── CÁC PHẦN BỔ TRỢ NỘI DUNG ── */}
        <TagsField
          id={fieldId(p('highlights'))}
          label="Điểm nổi bật"
          value={t.highlights}
          onChange={(highlights) => set({ highlights: highlights.slice(0, L.listItems) })}
          placeholder="vd Chống cháy EI 30 – EI 180"
          hint="Các ý ngắn hiện dạng gạch đầu dòng ở đầu trang. Gõ rồi nhấn Enter."
        />

        <RepeatList
          label="Ưu điểm"
          itemName="ưu điểm"
          items={t.advantages}
          max={L.listItems}
          newItem={() => ({ title: '', desc: '' })}
          onChange={(advantages) => set({ advantages })}
          renderItem={(a, setA, i) => (
            <div className="space-y-2">
              <BareInput label={`Tiêu đề ưu điểm ${i + 1}`} placeholder="Tiêu đề ưu điểm" value={a.title} onChange={(title) => setA({ ...a, title })} />
              <BareInput label={`Mô tả ưu điểm ${i + 1}`} placeholder="Mô tả ưu điểm ngắn gọn..." rows={2} value={a.desc} onChange={(desc) => setA({ ...a, desc })} />
            </div>
          )}
        />

        <RepeatList
          label="Câu hỏi thường gặp"
          itemName="câu hỏi"
          items={t.faqs}
          max={L.listItems}
          newItem={() => ({ q: '', a: '' })}
          onChange={(faqs) => set({ faqs })}
          hint="Hiện cuối trang và đưa vào dữ liệu có cấu trúc FAQ cho Google."
          renderItem={(f, setF, i) => (
            <div className="space-y-2">
              <BareInput label={`Câu hỏi ${i + 1}`} placeholder="Câu hỏi thường gặp" value={f.q} onChange={(q) => setF({ ...f, q })} />
              <BareInput label={`Trả lời ${i + 1}`} placeholder="Câu trả lời chi tiết..." rows={2} value={f.a} onChange={(a) => setF({ ...f, a })} />
            </div>
          )}
        />

        <TextField
          path={p('coverAlt')}
          label={
            <span className="flex items-center gap-1.5">
              Mô tả ảnh đại diện (alt)
              {isAi?.('coverAlt') && <AiBadge />}
            </span>
          }
          hint="Mô tả nội dung ảnh cho người khiếm thị và Google Hình ảnh."
          value={t.coverAlt}
          onChange={(coverAlt) => set({ coverAlt })}
          errors={errors}
          maxLength={200}
        />

        <details className="group rounded-xl border border-slate-300 bg-white overflow-hidden shadow-2xs">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-bold text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-[#4E7202] [&::-webkit-details-marker]:hidden select-none transition-colors">
            <span className="flex items-center gap-1.5">
              SEO Google <span className="font-normal text-slate-500">(tuỳ chọn)</span>
              {(isAi?.('seoTitle') || isAi?.('seoDescription')) && <AiBadge />}
            </span>
            <span className="text-slate-600 transition-transform group-open:rotate-90 motion-reduce:transition-none text-sm font-bold" aria-hidden="true">
              ›
            </span>
          </summary>
          <div className="space-y-4 border-t border-slate-200 bg-slate-50/50 p-4">
            <SeoPanel
              url={`remak.vn${productPath(tab, slugShown || '...')}`}
              seoTitle={t.seoTitle ?? ''}
              seoDescription={t.seoDescription ?? ''}
              fallbackTitle={t.name}
              fallbackDescription={t.summary}
              noindex={t.noindex}
              titleMax={L.seoTitle}
              descriptionMax={L.seoDescription}
              aiFilled={
                tab === 'en'
                  ? {
                      seoTitle: !!isAi?.('seoTitle'),
                      seoDescription: !!isAi?.('seoDescription'),
                    }
                  : undefined
              }
              onChange={(patch) =>
                set({
                  ...(patch.seoTitle !== undefined && { seoTitle: blankToNull(patch.seoTitle) }),
                  ...(patch.seoDescription !== undefined && { seoDescription: blankToNull(patch.seoDescription) }),
                  ...(patch.noindex !== undefined && { noindex: patch.noindex }),
                })
              }
            />
            <TextField
              path={p('focusKeyword')}
              label={
                <span className="flex items-center gap-1.5">
                  Từ khoá chính
                  {isAi?.('focusKeyword') && <AiBadge />}
                </span>
              }
              hint="vd “tấm chống cháy MgO”."
              value={t.focusKeyword ?? ''}
              onChange={(v) => set({ focusKeyword: blankToNull(v) })}
              errors={errors}
              maxLength={120}
            />
          </div>
        </details>

        {tab === 'en' && hasEnContent && (
          <div className="flex justify-end border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onRemoveEn}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3.5 text-xs font-bold text-rose-700 hover:bg-rose-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-rose-500 transition-colors"
            >
              <Trash2 size={13} aria-hidden="true" /> Bỏ bản tiếng Anh
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
