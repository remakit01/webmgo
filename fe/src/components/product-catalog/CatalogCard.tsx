'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, Check, Flame, Layers, Plus, Star } from 'lucide-react';
import { STOCK_STATUS_LABEL, formatFireRating, type ProductListItemPublic } from '@remak/shared/contracts/product';
import Link from '@/components/ui/LocaleLink';
import ResponsivePicture from '@/components/ui/ResponsivePicture';
import type { Locale } from '@/i18n/routing';
import { formatMm, formatVnd } from './format';

export const STOCK_TONE: Record<string, string> = {
  IN_STOCK: 'bg-[#F4F9E8] text-[#3F5E02] border-[#7CB305]/40',
  LIMITED: 'bg-amber-50 text-amber-800 border-amber-300',
  PRE_ORDER: 'bg-sky-50 text-sky-800 border-sky-300',
  BACK_ORDER: 'bg-sky-50 text-sky-800 border-sky-300',
  OUT_OF_STOCK: 'bg-rose-50 text-rose-800 border-rose-300',
  DISCONTINUED: 'bg-slate-100 text-slate-700 border-slate-300',
};

/** Ảnh sản phẩm; chưa có ảnh -> khối nền trung tính (không ảnh giả) */
export function ProductImage({ url, alt, sizes, priority, className = '' }: { url: string | null; alt: string; sizes: string; priority?: boolean; className?: string }) {
  if (!url) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 ${className}`} aria-hidden="true">
        <Layers size={40} className="text-slate-300" />
      </div>
    );
  }
  return <ResponsivePicture image={{ imageUrl: url, images: [] }} alt={alt} sizes={sizes} priority={priority} className={`h-full w-full object-cover ${className}`} />;
}

/** Giá ở thẻ: "Từ 195.000 đ" hoặc "Liên hệ báo giá" */
export function PriceLine({ item, locale }: { item: Pick<ProductListItemPublic, 'priceRange'>; locale: Locale }) {
  const t = useTranslations('Products');
  if (!item.priceRange) return <span className="font-bold text-slate-700">{t('contactPrice')}</span>;
  const { low, high } = item.priceRange;
  return <span className="font-extrabold text-[#C2410C]">{low === high ? formatVnd(low, locale) : t('priceFrom', { price: formatVnd(low, locale) })}</span>;
}

export default function CatalogCard({
  item,
  locale,
  compared = false,
  compareDisabled = false,
  onToggleCompare,
  priority,
}: {
  item: ProductListItemPublic;
  locale: Locale;
  compared?: boolean;
  compareDisabled?: boolean;
  /** Bỏ trống = không có nút so sánh (vd mục "Sản phẩm khác") */
  onToggleCompare?: () => void;
  priority?: boolean;
}) {
  const t = useTranslations('Products');
  const href = `/san-pham/${item.slug}`;
  const fire = item.fireRating ? formatFireRating(item.fireRating.min, item.fireRating.max) : null;
  const titleId = `product-${item.id}-title`;

  return (
    <article aria-labelledby={titleId} className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-shadow hover:shadow-md">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <ProductImage url={item.coverImageUrl} alt="" sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" priority={priority} className="transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {item.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#F26522] px-2 py-0.5 text-xs font-bold text-white shadow-sm">
              <Star size={12} className="fill-current" aria-hidden="true" /> {t('featured')}
            </span>
          )}
          {item.badge && <span className="rounded-md bg-slate-900/85 px-2 py-0.5 text-xs font-bold text-white">{item.badge}</span>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#4E7202]">{item.type.name}</p>
          <h3 id={titleId} className="mt-1 text-lg font-extrabold leading-snug text-slate-900">
            <Link href={href} className="hover:text-[#4E7202] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-[#5F8A03]">
              {item.name}
            </Link>
          </h3>
          {item.tagline && <p className="mt-1 text-sm text-slate-600">{item.tagline}</p>}
        </div>

        <dl className="space-y-1.5 text-sm">
          {item.thicknessesMm.length > 0 && (
            <div className="flex items-start gap-2">
              <dt className="sr-only">{t('thickness')}</dt>
              <Layers size={15} className="mt-0.5 shrink-0 text-slate-500" aria-hidden="true" />
              <dd className="flex flex-wrap gap-1">
                {item.thicknessesMm.map((mm) => (
                  <span key={mm} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-slate-700">
                    {formatMm(mm, locale)}
                  </span>
                ))}
              </dd>
            </div>
          )}
          <div className="flex items-center gap-2">
            <dt className="sr-only">{t('fireRating')}</dt>
            <Flame size={15} className="shrink-0 text-[#F26522]" aria-hidden="true" />
            <dd className={`text-sm font-bold ${fire ? 'text-slate-900' : 'font-medium text-slate-500'}`}>{fire ?? t('notTested')}</dd>
          </div>
        </dl>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="space-y-1 text-sm">
            <PriceLine item={item} locale={locale} />
            {/* Chưa có độ dày (hàng theo dự án, liên hệ báo giá) -> không có tình trạng kho để hiện */}
            {item.thicknessesMm.length > 0 && (
              <span className={`block w-fit rounded-md border px-2 py-0.5 text-xs font-semibold ${STOCK_TONE[item.stockStatus]}`}>{STOCK_STATUS_LABEL[item.stockStatus][locale]}</span>
            )}
          </div>
          <Link
            href={href}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition-colors hover:bg-[#4E7202] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03]"
          >
            {t('viewDetail')} <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        {onToggleCompare && (
        <button
          type="button"
          aria-pressed={compared}
          disabled={compareDisabled && !compared}
          onClick={onToggleCompare}
          aria-label={compared ? t('compareRemove', { name: item.name }) : t('compareAdd', { name: item.name })}
          title={compareDisabled && !compared ? t('compareLimit', { max: 3 }) : undefined}
          className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-[#5F8A03] ${
            compared ? 'border-[#4E7202] bg-[#F4F9E8] text-[#3F5E02]' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {compared ? <Check size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />} {t('compare')}
        </button>
        )}
      </div>
    </article>
  );
}
