'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Languages, Trash2 } from 'lucide-react';
import type { Locale } from '@remak/shared/locale';
import { slugify } from '@remak/shared/slug';
import { PRODUCT_LIMITS, type ProductInput, type ProductTranslationInput } from '@remak/shared/contracts/product';
import type { RichDoc } from '@/types/news';
import LocaleTabs from '@/cms/components/shared/LocaleTabs';
import SeoPanel from '@/cms/components/shared/SeoPanel';
import Skeleton from '@/cms/components/ui/Skeleton';
import { productsApi } from '@/cms/lib/products-api';
import { productPath, productsIndexPath } from '@/lib/product-paths';
import { BareInput, RepeatList, Section, TagsField, TextField, labelClass } from './fields';
import { blankToNull, fieldId } from './product-form';

// TipTap chỉ tải ở CMS, phía trình duyệt
const RichTextEditor = dynamic(() => import('@/cms/components/shared/rich-text/RichTextEditor'), {
  ssr: false,
  loading: () => <Skeleton className="h-[320px] w-full rounded-xl" />,
});

const PANEL_ID = 'product-locale-panel';
const L = PRODUCT_LIMITS;

/** Nội dung theo ngôn ngữ: tên, đường dẫn, tóm tắt, mô tả, điểm nổi bật, ưu điểm, FAQ, SEO */
export default function ProductContentSection({
  translations,
  published,
  tab,
  onTab,
  onChange,
  onAddEn,
  onRemoveEn,
  errors,
}: {
  translations: ProductInput['translations'];
  /** slug đang chạy trên web theo ngôn ngữ (cảnh báo khi đổi) */
  published: Partial<Record<Locale, { slug: string; status: string }>>;
  tab: Locale;
  onTab: (l: Locale) => void;
  onChange: (l: Locale, patch: Partial<ProductTranslationInput>) => void;
  onAddEn: () => void;
  onRemoveEn: () => void;
  errors: Record<string, string>;
}) {
  const t = tab === 'vi' ? translations.vi : translations.en;
  const p = (f: string) => `translations.${tab}.${f}`;
  const set = (patch: Partial<ProductTranslationInput>) => onChange(tab, patch);
  const tabHasError = (l: Locale) => Object.keys(errors).some((k) => k.startsWith(`translations.${l}.`));

  const slugShown = t ? t.slug?.trim() || slugify(t.name) : '';
  const live = published[tab];
  const slugChanged = !!live && live.status === 'PUBLISHED' && !!slugShown && slugShown !== live.slug;

  return (
    <Section
      id="content"
      title="Nội dung"
      description="Phần khách đọc trên trang sản phẩm. Thông số và giá nhập ở các phần bên dưới, dùng chung cho cả hai ngôn ngữ."
      actions={
        <LocaleTabs
          panelId={PANEL_ID}
          active={tab}
          onChange={onTab}
          tabs={[
            { locale: 'vi', label: 'Tiếng Việt', hint: tabHasError('vi') ? 'có lỗi' : undefined },
            { locale: 'en', label: 'English', hint: !translations.en ? 'chưa có' : tabHasError('en') ? 'có lỗi' : undefined },
          ]}
        />
      }
    >
      <div id={PANEL_ID} role="tabpanel" aria-labelledby={`tab-${tab}`} className="space-y-5">
        {!t ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <Languages size={22} className="mx-auto text-slate-500" aria-hidden="true" />
            <p className="mt-2 text-sm font-semibold text-slate-900">Chưa có bản tiếng Anh</p>
            <p className="mt-1 text-sm text-slate-600">Trang /en/products sẽ không hiện sản phẩm này cho tới khi bản tiếng Anh được xuất bản.</p>
            <button
              type="button"
              onClick={onAddEn}
              className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#4E7202] px-4 text-sm font-semibold text-white hover:bg-[#3F5E02] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03]"
            >
              Tạo bản tiếng Anh
            </button>
          </div>
        ) : (
          <>
            <TextField path={p('name')} label="Tên sản phẩm" required={tab === 'vi' || !!translations.en} value={t.name} onChange={(name) => set({ name })} errors={errors} maxLength={L.name} />

            <div className="space-y-1">
              <label htmlFor={fieldId(p('slug'))} className={labelClass}>
                Đường dẫn
              </label>
              <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-[#5F8A03] focus-within:ring-1 focus-within:ring-[#5F8A03]">
                <span className="flex shrink-0 items-center border-r border-slate-200 bg-slate-50 px-2.5 font-mono text-xs text-slate-600">
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
                  className="min-w-0 flex-1 px-2.5 py-2.5 font-mono text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
                />
              </div>
              <p id={`${fieldId(p('slug'))}-hint`} className={`text-xs ${slugChanged ? 'font-medium text-amber-800' : 'text-slate-600'}`}>
                {slugChanged
                  ? `Đổi đường dẫn đang chạy: link cũ ${productPath(tab, live!.slug)} sẽ tự chuyển (301) sang link mới.`
                  : 'Bỏ trống = tự sinh từ tên. Trùng với sản phẩm khác thì tự thêm số.'}
              </p>
            </div>

            <TextField path={p('tagline')} label="Câu khẩu hiệu" hint="Một dòng ngắn dưới tên, vd “Chống cháy A1 – không amiăng”." value={t.tagline ?? ''} onChange={(v) => set({ tagline: blankToNull(v) })} errors={errors} maxLength={L.tagline} />
            <TextField
              path={p('summary')}
              label="Tóm tắt"
              required={t.status === 'PUBLISHED'}
              hint="2–3 câu, hiện ở danh sách sản phẩm và làm mô tả Google khi chưa nhập SEO."
              rows={3}
              value={t.summary}
              onChange={(summary) => set({ summary })}
              errors={errors}
              maxLength={L.summary}
            />

            <div className="space-y-1">
              <span id={`${fieldId(p('description'))}-label`} className={labelClass}>
                Mô tả chi tiết
              </span>
              <div id={fieldId(p('description'))} tabIndex={-1} className="overflow-hidden rounded-lg border border-slate-300">
                <RichTextEditor
                  key={tab}
                  value={t.description as RichDoc}
                  onChange={(description) => set({ description })}
                  onUploadImage={productsApi.uploadContentImage}
                  ariaLabel={`Mô tả chi tiết (${tab === 'vi' ? 'tiếng Việt' : 'tiếng Anh'})`}
                  embedded
                />
              </div>
              {errors[p('description')] && <p className="text-xs font-medium text-rose-700">{errors[p('description')]}</p>}
            </div>

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
                <div className="space-y-1.5">
                  <BareInput label={`Tiêu đề ưu điểm ${i + 1}`} placeholder="Tiêu đề" value={a.title} onChange={(title) => setA({ ...a, title })} />
                  <BareInput label={`Mô tả ưu điểm ${i + 1}`} placeholder="Mô tả" rows={2} value={a.desc} onChange={(desc) => setA({ ...a, desc })} />
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
                <div className="space-y-1.5">
                  <BareInput label={`Câu hỏi ${i + 1}`} placeholder="Câu hỏi" value={f.q} onChange={(q) => setF({ ...f, q })} />
                  <BareInput label={`Trả lời ${i + 1}`} placeholder="Trả lời" rows={2} value={f.a} onChange={(a) => setF({ ...f, a })} />
                </div>
              )}
            />

            <TextField path={p('coverAlt')} label="Mô tả ảnh đại diện (alt)" hint="Mô tả nội dung ảnh cho người khiếm thị và Google Hình ảnh." value={t.coverAlt} onChange={(coverAlt) => set({ coverAlt })} errors={errors} maxLength={200} />

            <details className="group rounded-lg border border-slate-200">
              <summary className="flex cursor-pointer list-none items-center justify-between px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-[#5F8A03] [&::-webkit-details-marker]:hidden">
                <span>
                  SEO Google <span className="font-normal text-slate-600">(tuỳ chọn)</span>
                </span>
                <span className="text-slate-600 transition-transform group-open:rotate-90 motion-reduce:transition-none" aria-hidden="true">
                  ›
                </span>
              </summary>
              <div className="space-y-4 border-t border-slate-200 p-3.5">
                <SeoPanel
                  url={`remak.vn${productPath(tab, slugShown || '...')}`}
                  seoTitle={t.seoTitle ?? ''}
                  seoDescription={t.seoDescription ?? ''}
                  fallbackTitle={t.name}
                  fallbackDescription={t.summary}
                  noindex={t.noindex}
                  titleMax={L.seoTitle}
                  descriptionMax={L.seoDescription}
                  onChange={(patch) =>
                    set({
                      ...(patch.seoTitle !== undefined && { seoTitle: blankToNull(patch.seoTitle) }),
                      ...(patch.seoDescription !== undefined && { seoDescription: blankToNull(patch.seoDescription) }),
                      ...(patch.noindex !== undefined && { noindex: patch.noindex }),
                    })
                  }
                />
                <TextField path={p('focusKeyword')} label="Từ khoá chính" hint="vd “tấm chống cháy MgO”." value={t.focusKeyword ?? ''} onChange={(v) => set({ focusKeyword: blankToNull(v) })} errors={errors} maxLength={120} />
              </div>
            </details>

            {tab === 'en' && (
              <div className="flex justify-end border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={onRemoveEn}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 text-xs font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-rose-500"
                >
                  <Trash2 size={13} aria-hidden="true" /> Bỏ bản tiếng Anh
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Section>
  );
}
