'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import {
  formatFireRating,
  formatRange,
  optionLabel,
  type ProductSpecView,
  type SpecOptionGroup,
  type SpecOptionLabels,
  type ProductVariantPublic,
} from '@remak/shared/contracts/product';
import type { Locale } from '@/i18n/routing';
import { formatNum } from './format';

type Row = [label: string, value: string | null];

/**
 * Bảng thông số kỹ thuật theo 5 nhóm (+ thông số riêng theo loại).
 * 3 nhóm đầu tiên mặc định mở, các nhóm còn lại mặc định đóng và có nút dropdown để xem.
 * Chỉ hiện dòng có số liệu — không có số thì không hiện, không điền mặc định.
 */
export default function SpecSheet({
  spec,
  variants,
  name,
  labels,
  locale,
}: {
  spec: ProductSpecView;
  variants: ProductVariantPublic[];
  name: string;
  /** Nhãn danh mục thông số theo ngôn ngữ đang xem (API) */
  labels: SpecOptionLabels;
  locale: Locale;
}) {
  const t = useTranslations('Products');
  const s = useTranslations('Products.spec');
  const tg = useTranslations('Products.specGroup');
  const yesNo = (v: boolean | null) => (v === null ? null : v ? t('yes') : t('no'));
  // Mã danh mục -> nhãn (CMS "Danh Mục Thông Số"); chưa có nhãn thì hiện mã
  const opt = (group: SpecOptionGroup, code: string | null) => (code ? optionLabel(labels, group, code) : null);
  const n = (v: number | null, unit: string, digits?: number) => (v === null ? null : `${formatNum(v, locale, digits)} ${unit}`);
  const list = (v: readonly string[]) => (v.length ? v.join(', ') : null);
  const size = (w: number, l: number) => `${formatNum(w, locale)} × ${formatNum(l, locale)} mm`;

  const { physical: ph, mechanical: me, thermalFire: tf, acousticMoisture: am, chemistrySafety: cs, extension: ext } = spec;
  // Dải EI của cả dòng lấy từ các độ dày đang bán (một nguồn sự thật)
  const eiMin = variants.reduce<number | null>((m, v) => (v.fireRatingMinMinutes == null ? m : m == null ? v.fireRatingMinMinutes : Math.min(m, v.fireRatingMinMinutes)), null);

  const raw: { id: Parameters<typeof tg>[0]; rows: Row[] }[] = [
    {
      id: 'thermalFire',
      rows: [
        [s('reactionToFire'), tf.reactionToFireClass],
        [s('fireRating'), formatFireRating(eiMin, tf.maxFireRatingMinutes)],
        [s('fireStandards'), list(tf.fireClassStandards)],
        [s('maxTemperature'), n(tf.maxTemperatureC, '°C', 0)],
        [s('thermalConductivity'), n(tf.thermalConductivityWmk, 'W/(m·K)', 4)],
      ],
    },
    {
      id: 'acousticMoisture',
      rows: [
        [s('moldResistant'), yesNo(am.moldResistant)],
        [s('waterAbsorption'), formatRange(null, am.waterAbsorptionMaxPct, '%', locale, { strictMax: true })],
        [s('thicknessSwelling'), formatRange(null, am.thicknessSwellingMaxPct, '%', locale)],
        [s('soundReduction'), formatRange(am.soundReductionMinDb, am.soundReductionMaxDb, 'dB', locale)],
      ],
    },
    {
      id: 'physical',
      rows: [
        [s('standardSizes'), list(ph.standardSizes.map((z) => size(z.widthMm, z.lengthMm)))],
        [s('edgeProfile'), opt('EDGE_PROFILE', ph.edgeProfile)],
        [s('surfaceFinish'), opt('SURFACE_FINISH', ph.surfaceFinish)],
        [s('coreColor'), opt('CORE_COLOR', ph.coreColor)],
      ],
    },
    {
      id: 'mechanical',
      rows: [
        [s('screwHolding'), opt('SCREW_HOLDING', me.screwHoldingRating)],
        [s('flexural'), formatRange(me.flexuralMinMpa, me.flexuralMaxMpa, 'MPa', locale)],
        [s('flexuralCross'), formatRange(me.flexuralCrossMinMpa, null, 'MPa', locale)],
        [s('density'), formatRange(me.densityMinKgM3, me.densityMaxKgM3, 'kg/m³', locale)],
        [s('densityReduction'), me.densityReductionPct === null ? null : t('lighterBy', { pct: formatNum(me.densityReductionPct, locale) })],
      ],
    },
    {
      id: 'chemistrySafety',
      rows: [
        [s('asbestosFree'), yesNo(cs.asbestosFree)],
        [s('formaldehyde'), n(cs.formaldehydeMgL, 'mg/L')],
        [s('voc'), opt('VOC_LEVEL', cs.vocLevel)],
        [s('mgoContent'), formatRange(cs.mgoContentMinPct, null, '%', locale)],
        [s('crystalPhase'), opt('CRYSTAL_PHASE', cs.crystalPhase)],
        [s('chloride'), formatRange(null, cs.chlorideMaxPct, '%', locale)],
        [s('greenCertifications'), list(cs.greenCertifications)],
      ],
    },
    {
      id: 'extension',
      rows:
        ext?.type === 'SIP'
          ? [
              [s('coreMaterials'), list(ext.coreMaterials.map((m) => optionLabel(labels, 'SIP_CORE_MATERIAL', m)))],
              [s('coreThickness'), formatRange(ext.coreThicknessMinMm, ext.coreThicknessMaxMm, 'mm', locale)],
              [s('facingThicknesses'), ext.facingThicknessesMm.length ? `${ext.facingThicknessesMm.map((v) => formatNum(v, locale)).join(', ')} mm` : null],
              [s('maxSize'), ext.maxWidthMm && ext.maxLengthMm ? size(ext.maxWidthMm, ext.maxLengthMm) : null],
              [s('loadBearing'), opt('LOAD_BEARING', ext.loadBearing)],
            ]
          : ext?.type === 'FLOOR'
            ? [
                [s('edgeProfiles'), list(ext.edgeProfiles.map((e) => optionLabel(labels, 'EDGE_PROFILE', e)))],
                [s('suitableFloorings'), list(ext.suitableFloorings.map((f) => optionLabel(labels, 'SUITABLE_FLOORING', f)))],
                [s('floorSizes'), list(ext.floorSizes.map((z) => size(z.widthMm, z.lengthMm)))],
                [s('moistureResistantFloor'), yesNo(ext.moistureResistantFloor)],
                [s('sandedSurface'), yesNo(ext.sandedSurface)],
              ]
            : ext?.type === 'DECORATIVE'
              ? [[s('customPrint'), yesNo(ext.customPrintSupported)]]
              : [],
    },
  ];
  const groups = raw
    .map((g) => ({ ...g, rows: g.rows.filter((r): r is [string, string] => !!r[1]) }))
    .filter((g) => g.rows.length);

  // 3 nhóm đầu tiên mặc định mở (idx < 3), các nhóm còn lại mặc định đóng
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    groups.forEach((g, idx) => {
      init[g.id] = idx < 3;
    });
    return init;
  });

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!groups.length) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs divide-y divide-slate-200">
      <span className="sr-only">{t('specsCaption', { name })}</span>
      {groups.map((g, idx) => {
        const isOpen = openGroups[g.id] ?? (idx < 3);

        return (
          <div key={g.id} className="transition-colors">
            <button
              type="button"
              onClick={() => toggleGroup(g.id)}
              className="group w-full py-3.5 text-left bg-slate-50/75 hover:bg-slate-100/80 transition-colors cursor-pointer select-none"
              aria-expanded={isOpen}
            >
              <div className="mx-auto flex max-w-3xl items-center justify-between px-4 sm:px-6">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-[#3F5E02]">
                  {tg(g.id)}
                </span>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-xs border border-slate-200/80 group-hover:border-slate-300 transition-colors">
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#3F5E02]' : 'text-slate-500'
                    }`}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-slate-100 bg-white py-2 sm:py-3">
                <div className="mx-auto max-w-3xl px-4 sm:px-6">
                  <table className="w-full border-collapse text-xs sm:text-sm">
                    <tbody>
                      {g.rows.map(([label, value]) => (
                        <tr key={label} className="border-t border-slate-100 first:border-t-0 hover:bg-slate-50/60 transition-colors">
                          <th scope="row" className="w-1/2 py-2.5 pr-4 text-left font-medium text-slate-600 sm:pr-6">
                            {label.endsWith(':') ? label : `${label}:`}
                          </th>
                          <td className="w-1/2 py-2.5 pl-4 text-left font-semibold tabular-nums text-slate-900 sm:pl-6">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
