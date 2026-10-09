import React from 'react';
import { useTranslations } from 'next-intl';
import { Award, CheckCircle2, ChevronDown, ExternalLink, Star } from 'lucide-react';
import {
  STOCK_STATUS_LABEL,
  formatFireRating,
  optionLabel,
  type CertificatePublic,
  type DecorativeFinishOptionPublic,
  type SpecOptionLabels,
  type ProductVariantPublic,
} from '@remak/shared/contracts/product';
import type { Locale } from '@/i18n/routing';
import { formatDay, formatMm, formatNum, formatVnd, unitLabel } from './format';

export function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-5 border-b border-slate-200 pb-3 text-xl font-extrabold text-slate-900 lg:text-2xl">
      {children}
    </h2>
  );
}

/** Bảng quy cách & giá mọi độ dày (cuộn ngang trên điện thoại) */
export function VariantTable({ variants, locale }: { variants: ProductVariantPublic[]; locale: Locale }) {
  const t = useTranslations('Products');
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <caption className="sr-only">{t('variantsCaption')}</caption>
        <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-600">
          <tr>
            <th scope="col" className="px-4 py-3">{t('thickness')}</th>
            <th scope="col" className="px-4 py-3">{t('size')}</th>
            <th scope="col" className="px-4 py-3 text-right">{t('weight')}</th>
            <th scope="col" className="px-4 py-3">{t('fireRating')}</th>
            <th scope="col" className="px-4 py-3 text-right">{t('price')}</th>
            <th scope="col" className="px-4 py-3">{t('stock')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {variants.map((v) => (
            <tr key={v.id}>
              <th scope="row" className="px-4 py-3 font-extrabold tabular-nums text-slate-900">
                <span className="inline-flex items-center gap-1">
                  {formatMm(v.thicknessMm, locale)}
                  {v.isPopular && <Star size={12} className="fill-[#F26522] text-[#F26522]" aria-label={t('popular')} />}
                </span>
                {v.recommendedUse && <span className="mt-0.5 block max-w-xs text-xs font-normal text-slate-600">{v.recommendedUse}</span>}
              </th>
              <td className="px-4 py-3 tabular-nums text-slate-700">
                {formatNum(v.widthMm, locale)} × {formatNum(v.lengthMm, locale)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-700">{v.weightKg !== null ? `~${formatNum(v.weightKg, locale)} kg` : '—'}</td>
              <td className="px-4 py-3 font-bold text-[#C2410C]">{v.fireRatingLabel || formatFireRating(v.fireRatingMinMinutes, v.fireRatingMaxMinutes) || <span className="font-normal text-slate-500">{t('notTested')}</span>}</td>
              <td className="px-4 py-3 text-right tabular-nums">
                {v.priceVnd !== null ? (
                  <span className="font-bold text-slate-900">
                    {formatVnd(v.priceVnd, locale)}
                    <span className="font-normal text-slate-600">{t('perUnit', { unit: unitLabel(v, locale) })}</span>
                  </span>
                ) : (
                  <span className="text-slate-600">{t('contactPrice')}</span>
                )}
              </td>
              <td className="px-4 py-3 text-xs font-semibold text-slate-700">{STOCK_STATUS_LABEL[v.stockStatus][locale]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdvantageGrid({ items }: { items: { title: string; desc: string }[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((a, i) => (
        <li key={i} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-5">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-[#5F8A03]" aria-hidden="true" />
          <div>
            <h3 className="font-bold text-slate-900">{a.title}</h3>
            {a.desc && <p className="mt-1 text-sm leading-relaxed text-slate-600">{a.desc}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DecorativeOptions({
  options,
  customPrint,
  labels,
}: {
  options: DecorativeFinishOptionPublic[];
  customPrint: boolean;
  /** Nhãn danh mục thông số theo ngôn ngữ đang xem (API) */
  labels: SpecOptionLabels;
}) {
  const t = useTranslations('Products');
  return (
    <div className="space-y-4">
      <ul className="grid gap-4 sm:grid-cols-2">
        {options.map((o) => (
          <li key={o.finishType} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#4E7202]">{optionLabel(labels, 'DECORATIVE_FINISH', o.finishType)}</p>
            <h3 className="mt-1 font-extrabold text-slate-900">{o.name}</h3>
            {o.description && <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{o.description}</p>}
            <dl className="mt-3 space-y-1.5 text-sm">
              {o.patterns.length > 0 && (
                <div>
                  <dt className="text-xs font-semibold text-slate-600">{t('patterns')}</dt>
                  <dd className="font-medium text-slate-800">{o.patterns.join(', ')}</dd>
                </div>
              )}
              {o.suitableAreas.length > 0 && (
                <div>
                  <dt className="text-xs font-semibold text-slate-600">{t('suitableAreas')}</dt>
                  <dd className="font-medium text-slate-800">{o.suitableAreas.join(', ')}</dd>
                </div>
              )}
            </dl>
            {o.scratchResistance && <p className="mt-2 text-xs font-semibold text-slate-700">{t('scratchResistance', { level: optionLabel(labels, 'SCRATCH_RESISTANCE', o.scratchResistance) })}</p>}
          </li>
        ))}
      </ul>
      {customPrint && <p className="rounded-xl border border-[#7CB305]/40 bg-[#F4F9E8] px-4 py-3 text-sm font-semibold text-[#3F5E02]">{t('customPrintCta')}</p>}
    </div>
  );
}

export function CertificateList({ items, locale }: { items: CertificatePublic[]; locale: Locale }) {
  const t = useTranslations('Products');
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((c) => (
        <li key={c.id} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-5">
          <Award size={22} className="mt-0.5 shrink-0 text-[#F26522]" aria-hidden="true" />
          <div className="min-w-0 space-y-2">
            <h3 className="font-extrabold text-slate-900">{c.name}</h3>
            {c.description && <p className="text-sm text-slate-600">{c.description}</p>}
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              {(
                [
                  [t('certNo'), c.certificateNo],
                  [t('certIssuer'), c.issuingBody],
                  [t('certStandard'), c.testStandard],
                  [t('certResult'), c.result],
                  [t('certIssued'), c.issueDate && formatDay(c.issueDate, locale)],
                  [t('certExpiry'), c.expiryDate && formatDay(c.expiryDate, locale)],
                ] as const
              ).map(([label, value]) =>
                value ? (
                  <React.Fragment key={label}>
                    <dt className="text-slate-600">{label}</dt>
                    <dd className="font-semibold text-slate-900">{value}</dd>
                  </React.Fragment>
                ) : null,
              )}
            </dl>
            {c.thicknessesMm.length > 0 && <p className="text-xs text-slate-600">{t('certAppliesTo', { list: c.thicknessesMm.map((mm) => formatMm(mm, locale)).join(', ') })}</p>}
            {c.fileUrl && (
              <a href={c.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-[#4E7202] hover:underline">
                {t('certView')} <ExternalLink size={13} aria-hidden="true" />
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** FAQ dạng mở / đóng (details), không cần JavaScript */
export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {items.map((f, i) => (
        <details key={i} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-bold text-slate-900 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-[#5F8A03] [&::-webkit-details-marker]:hidden">
            {f.q}
            <ChevronDown size={18} className="shrink-0 text-slate-500 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
          </summary>
          <p className="whitespace-pre-line px-5 pb-5 text-sm leading-relaxed text-slate-700">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
