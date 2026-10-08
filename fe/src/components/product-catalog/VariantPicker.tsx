'use client';

import React, { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Clock, FileText, Flame, Package, PhoneCall, Star } from 'lucide-react';
import { STOCK_STATUS_LABEL, formatFireRating, type ProductVariantPublic } from '@remak/shared/contracts/product';
import Link from '@/components/ui/LocaleLink';
import type { Locale } from '@/i18n/routing';
import { STOCK_TONE } from './CatalogCard';
import { HOTLINE, HOTLINE_TEL, formatDay, formatMm, formatNum, formatVnd, quoteHref, unitLabel } from './format';

/**
 * Chọn độ dày -> hiện giá, tình trạng, chịu lửa, khối lượng của độ dày đó + nút báo giá.
 * Không có giá công khai (liên hệ / ngừng KD) thì chỉ hiện "Liên hệ báo giá".
 */
export default function VariantPicker({ variants, slug, locale }: { variants: ProductVariantPublic[]; slug: string; locale: Locale }) {
  const t = useTranslations('Products');
  const ids = useId();
  const [selectedId, setSelectedId] = useState(() => (variants.find((v) => v.isDefault) ?? variants[0])?.id);
  const v = variants.find((x) => x.id === selectedId) ?? variants[0];

  const ctas = (
    <div className="flex flex-col gap-2.5 sm:flex-row">
      <Link
        href={quoteHref(slug, v?.thicknessMm)}
        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#F26522] px-6 text-sm font-bold text-white shadow-lg shadow-[#F26522]/25 transition-colors hover:bg-[#D95314] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F26522]"
      >
        <FileText size={17} aria-hidden="true" /> {t('requestQuote')}
      </Link>
      <a
        href={HOTLINE_TEL}
        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-800 transition-colors hover:border-[#7CB305] hover:text-[#3F5E02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03]"
      >
        <PhoneCall size={17} aria-hidden="true" /> {t('callHotline', { phone: HOTLINE })}
      </a>
    </div>
  );

  if (!v) return ctas;

  const fire = v.fireRatingLabel || formatFireRating(v.fireRatingMinMinutes, v.fireRatingMaxMinutes);
  const unit = unitLabel(v, locale);

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-sm font-bold text-slate-900">{t('chooseThickness')}</legend>
        <div className="flex flex-wrap gap-2">
          {variants.map((x) => {
            const on = x.id === v.id;
            return (
              <label
                key={x.id}
                className={`relative inline-flex h-11 min-w-[4.5rem] cursor-pointer items-center justify-center gap-1 rounded-xl border-2 px-3 text-sm font-bold tabular-nums transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#5F8A03] ${
                  on ? 'border-[#4E7202] bg-[#F4F9E8] text-[#3F5E02]' : 'border-slate-200 bg-white text-slate-700 hover:border-[#7CB305]'
                }`}
              >
                <input type="radio" name={`${ids}-variant`} value={x.id} checked={on} onChange={() => setSelectedId(x.id)} className="sr-only" />
                {formatMm(x.thicknessMm, locale)}
                {x.isPopular && <Star size={12} className="fill-[#F26522] text-[#F26522]" aria-label={t('popular')} />}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5" aria-live="polite">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-700">{v.label}</p>
            {v.priceVnd !== null ? (
              <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
                <span className="text-3xl font-black tabular-nums text-[#C2410C]">{formatVnd(v.priceVnd, locale)}</span>
                <span className="text-sm font-semibold text-slate-600">{t('perUnit', { unit })}</span>
                {v.compareAtPriceVnd !== null && (
                  <>
                    <s className="text-sm tabular-nums text-slate-500">{formatVnd(v.compareAtPriceVnd, locale)}</s>
                    {v.discountPercent !== null && <span className="rounded-md bg-rose-600 px-1.5 py-0.5 text-xs font-bold text-white">-{v.discountPercent}%</span>}
                  </>
                )}
              </p>
            ) : (
              <p className="mt-1 text-2xl font-black text-slate-900">{t('contactPrice')}</p>
            )}
          </div>
          <span className={`rounded-lg border px-2.5 py-1 text-sm font-bold ${STOCK_TONE[v.stockStatus]}`}>{STOCK_STATUS_LABEL[v.stockStatus][locale]}</span>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-slate-200 pt-4 text-sm">
          <div>
            <dt className="text-xs font-semibold text-slate-600">{t('fireRating')}</dt>
            <dd className="flex items-center gap-1 font-bold text-slate-900">
              <Flame size={14} className="text-[#F26522]" aria-hidden="true" /> {fire ?? t('notTested')}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-600">{t('size')}</dt>
            <dd className="font-bold tabular-nums text-slate-900">
              {formatNum(v.widthMm, locale)} × {formatNum(v.lengthMm, locale)} mm
            </dd>
          </div>
          {v.weightKg !== null && (
            <div>
              <dt className="text-xs font-semibold text-slate-600">{t('weight')}</dt>
              <dd className="font-bold tabular-nums text-slate-900">~{formatNum(v.weightKg, locale)} kg</dd>
            </div>
          )}
          {v.flexuralMinMpa !== null && (
            <div>
              <dt className="text-xs font-semibold text-slate-600">{t('flexural')}</dt>
              <dd className="font-bold tabular-nums text-slate-900">≥ {formatNum(v.flexuralMinMpa, locale)} MPa</dd>
            </div>
          )}
        </dl>

        {(v.leadTimeDays !== null || v.minOrderQty !== null || v.priceValidUntil) && (
          <ul className="space-y-1 text-xs text-slate-700">
            {v.leadTimeDays !== null && (
              <li className="flex items-center gap-1.5">
                <Clock size={13} aria-hidden="true" /> {t('leadTime', { days: v.leadTimeDays })}
              </li>
            )}
            {v.minOrderQty !== null && (
              <li className="flex items-center gap-1.5">
                <Package size={13} aria-hidden="true" /> {t('minOrder', { qty: v.minOrderQty, unit })}
              </li>
            )}
            {v.priceValidUntil && v.priceVnd !== null && <li>{t('priceValidUntil', { date: formatDay(v.priceValidUntil, locale) })}</li>}
          </ul>
        )}
        {v.recommendedUse && (
          <p className="text-sm text-slate-700">
            <strong className="font-bold text-slate-900">{t('recommendedUse')}:</strong> {v.recommendedUse}
          </p>
        )}
        {v.priceVnd !== null && <p className="text-xs text-slate-500">{t('vatNote')}</p>}
      </div>

      {ctas}
    </div>
  );
}
