import React from 'react';
import { useTranslations } from 'next-intl';
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
      id: 'physical',
      rows: [
        [s('standardSizes'), list(ph.standardSizes.map((z) => size(z.widthMm, z.lengthMm)))],
        [s('edgeProfile'), opt('EDGE_PROFILE', ph.edgeProfile)],
        [s('coreColor'), opt('CORE_COLOR', ph.coreColor)],
        [s('surfaceFinish'), opt('SURFACE_FINISH', ph.surfaceFinish)],
      ],
    },
    {
      id: 'mechanical',
      rows: [
        [s('density'), formatRange(me.densityMinKgM3, me.densityMaxKgM3, 'kg/m³', locale)],
        [s('densityReduction'), me.densityReductionPct === null ? null : t('lighterBy', { pct: formatNum(me.densityReductionPct, locale) })],
        [s('flexural'), formatRange(me.flexuralMinMpa, me.flexuralMaxMpa, 'MPa', locale)],
        [s('flexuralCross'), formatRange(me.flexuralCrossMinMpa, null, 'MPa', locale)],
        [s('screwHolding'), opt('SCREW_HOLDING', me.screwHoldingRating)],
      ],
    },
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
        [s('soundReduction'), formatRange(am.soundReductionMinDb, am.soundReductionMaxDb, 'dB', locale)],
        [s('waterAbsorption'), formatRange(null, am.waterAbsorptionMaxPct, '%', locale, { strictMax: true })],
        [s('thicknessSwelling'), formatRange(null, am.thicknessSwellingMaxPct, '%', locale)],
        [s('moldResistant'), yesNo(am.moldResistant)],
      ],
    },
    {
      id: 'chemistrySafety',
      rows: [
        [s('crystalPhase'), opt('CRYSTAL_PHASE', cs.crystalPhase)],
        [s('mgoContent'), formatRange(cs.mgoContentMinPct, null, '%', locale)],
        [s('chloride'), formatRange(null, cs.chlorideMaxPct, '%', locale)],
        [s('asbestosFree'), yesNo(cs.asbestosFree)],
        [s('formaldehyde'), n(cs.formaldehydeMgL, 'mg/L')],
        [s('voc'), opt('VOC_LEVEL', cs.vocLevel)],
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

  if (!groups.length) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{t('specsCaption', { name })}</caption>
        {groups.map((g) => (
          <tbody key={g.id}>
            <tr className="bg-slate-50">
              <th colSpan={2} scope="colgroup" className="border-t border-slate-200 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-[#3F5E02] first:border-t-0">
                {tg(g.id)}
              </th>
            </tr>
            {g.rows.map(([label, value]) => (
              <tr key={label} className="border-t border-slate-100">
                <th scope="row" className="w-2/5 px-5 py-2.5 font-medium text-slate-600">
                  {label}
                </th>
                <td className="px-5 py-2.5 font-semibold tabular-nums text-slate-900">{value}</td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}
