import type { Locale } from '@remak/shared/locale';
import { toDayKey } from '@remak/shared/date';
import {
  defaultVariantLabelOf,
  discountPercent,
  emptyProductInput,
  emptyTranslationInput,
  hasPublicPrice,
  maxFireRatingMinutes,
  priceRange,
  productStockStatus,
  sheetAreaM2,
  toSpecView,
  type CertificatePublic,
  type DecorativeFinishOptionPublic,
  type ProductDetailPublic,
  type ProductExtension,
  type ProductListItemCms,
  type ProductCms,
  type ProductListItemPublic,
  type ProductTranslationInput,
  type ProductVariantInput,
  type ProductVariantPublic,
  type SheetSize,
  type TechnicalSpecRow,
  type VariantOffer,
  type VariantSpec,
} from '@remak/shared/contracts/product';
import type { Prisma } from '../generated/prisma/client.js';

/** Decimal (Prisma) -> number; null giữ null */
const num = (d: Prisma.Decimal | null | undefined): number | null => (d == null ? null : Number(d));
const asArray = <T>(v: Prisma.JsonValue): T[] => (Array.isArray(v) ? (v as unknown as T[]) : []);
const dayKey = (d: Date | null) => (d ? toDayKey(d) : null);

/** Một truy vấn đọc đủ dữ liệu trang chi tiết (tránh N+1) */
export const productDetailInclude = {
  translations: true,
  technicalSpec: true,
  variants: { where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], include: { translations: true, certificates: { include: { certificate: { include: { translations: true } } } } } },
  sipSpec: true,
  floorSpec: true,
  decorativeSpec: true,
  decorativeOptions: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], include: { translations: true } },
  certificates: { orderBy: [{ sortOrder: 'asc' }, { certificateId: 'asc' }], include: { certificate: { include: { translations: true } } } },
} satisfies Prisma.ProductInclude;

/** Danh sách: bản dịch + các độ dày đang bán (giá, EI, tình trạng) */
export const productListInclude = {
  translations: true,
  variants: { where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
} satisfies Prisma.ProductInclude;

type DetailRow = Prisma.ProductGetPayload<{ include: typeof productDetailInclude }>;
type ListRow = Prisma.ProductGetPayload<{ include: typeof productListInclude }>;
type VariantRow = ListRow['variants'][number];
type TranslationRow = ListRow['translations'][number];

const offerOf = (v: VariantRow): VariantOffer => ({
  priceMode: v.priceMode,
  priceVnd: v.priceVnd,
  compareAtPriceVnd: v.compareAtPriceVnd,
  stockStatus: v.stockStatus,
  isActive: v.isActive,
});

const specOf = (v: VariantRow): VariantSpec => ({
  thicknessMm: Number(v.thicknessMm),
  widthMm: v.widthMm,
  lengthMm: v.lengthMm,
  weightKg: num(v.weightKg),
  densityKgM3: v.densityKgM3,
  fireRatingMinMinutes: v.fireRatingMinMinutes,
  fireRatingMaxMinutes: v.fireRatingMaxMinutes,
  flexuralMinMpa: num(v.flexuralMinMpa),
  isActive: v.isActive,
});

/** slug của các bản dịch đã xuất bản (hreflang) */
export function publishedSlugs(translations: TranslationRow[], now = new Date()): Partial<Record<Locale, string>> {
  return Object.fromEntries(
    translations.filter((t) => t.status === 'PUBLISHED' && (!t.publishedAt || t.publishedAt <= now)).map((t) => [t.locale, t.slug]),
  );
}

export function toListItemPublic(p: ListRow, tr: TranslationRow, now = new Date()): ProductListItemPublic {
  const specs = p.variants.map(specOf);
  const fireMins = specs.map((s) => s.fireRatingMinMinutes).filter((x): x is number => x != null);
  const fireMax = maxFireRatingMinutes(specs);
  return {
    id: p.id,
    productType: p.productType,
    slug: tr.slug,
    name: tr.name,
    shortName: tr.shortName,
    tagline: tr.tagline,
    summary: tr.summary,
    badge: null,
    coverImageUrl: p.coverImageUrl,
    coverAlt: tr.coverAlt || tr.name,
    isFeatured: p.isFeatured,
    thicknessesMm: [...new Set(specs.map((s) => s.thicknessMm))].sort((a, b) => a - b),
    fireRating: fireMax == null ? null : { min: fireMins.length ? Math.min(...fireMins) : null, max: fireMax },
    priceRange: priceRange(p.variants.map(offerOf)),
    stockStatus: productStockStatus(p.variants.map(offerOf)),
    alternates: publishedSlugs(p.translations, now),
  };
}

export function toVariantPublic(v: DetailRow['variants'][number], locale: Locale): ProductVariantPublic {
  const tr = v.translations.find((t) => t.locale === locale) ?? v.translations.find((t) => t.locale === 'vi');
  const offer = offerOf(v);
  const isPublic = hasPublicPrice(offer);
  const thicknessMm = Number(v.thicknessMm);
  return {
    id: v.id,
    sku: v.sku,
    label: tr?.label || defaultVariantLabelOf(thicknessMm, locale),
    recommendedUse: tr?.recommendedUse ?? null,
    thicknessMm,
    widthMm: v.widthMm,
    lengthMm: v.lengthMm,
    areaM2: sheetAreaM2(v.widthMm, v.lengthMm),
    weightKg: num(v.weightKg),
    densityKgM3: v.densityKgM3,
    fireRatingMinMinutes: v.fireRatingMinMinutes,
    fireRatingMaxMinutes: v.fireRatingMaxMinutes,
    fireRatingLabel: v.fireRatingLabel,
    flexuralMinMpa: num(v.flexuralMinMpa),
    isPopular: v.isPopular,
    isDefault: v.isDefault,
    priceMode: v.priceMode,
    // Không có giá công khai -> không lộ giá nội bộ ra web
    priceVnd: isPublic ? v.priceVnd : null,
    compareAtPriceVnd: isPublic ? v.compareAtPriceVnd : null,
    discountPercent: discountPercent(offer),
    saleUnit: v.saleUnit,
    priceValidUntil: isPublic ? dayKey(v.priceValidUntil) : null,
    stockStatus: v.stockStatus,
    leadTimeDays: v.leadTimeDays,
    minOrderQty: v.minOrderQty,
  };
}

function extensionOf(p: DetailRow): ProductExtension {
  if (p.productType === 'SIP_PANEL' && p.sipSpec) {
    const s = p.sipSpec;
    return {
      type: 'SIP',
      coreMaterials: s.coreMaterials,
      coreThicknessMinMm: s.coreThicknessMinMm,
      coreThicknessMaxMm: s.coreThicknessMaxMm,
      facingThicknessesMm: s.facingThicknessesMm,
      maxWidthMm: s.maxWidthMm,
      maxLengthMm: s.maxLengthMm,
      loadBearing: s.loadBearing,
    };
  }
  if (p.productType === 'FLOOR' && p.floorSpec) {
    const f = p.floorSpec;
    return {
      type: 'FLOOR',
      edgeProfiles: f.edgeProfiles,
      floorSizes: asArray<SheetSize>(f.floorSizes),
      suitableFloorings: f.suitableFloorings,
      moistureResistantFloor: f.moistureResistantFloor,
      sandedSurface: f.sandedSurface,
    };
  }
  if (p.productType === 'DECORATIVE' && p.decorativeSpec) {
    return { type: 'DECORATIVE', customPrintSupported: p.decorativeSpec.customPrintSupported, finishTypes: p.decorativeOptions.map((o) => o.finishType) };
  }
  return null;
}

function techRowOf(s: NonNullable<DetailRow['technicalSpec']>): TechnicalSpecRow {
  return {
    standardSizes: asArray<SheetSize>(s.standardSizes),
    edgeProfile: s.edgeProfile,
    coreColor: s.coreColor,
    surfaceFinish: s.surfaceFinish,
    densityMinKgM3: s.densityMinKgM3,
    densityMaxKgM3: s.densityMaxKgM3,
    densityReductionPct: num(s.densityReductionPct),
    flexuralMinMpa: num(s.flexuralMinMpa),
    flexuralMaxMpa: num(s.flexuralMaxMpa),
    flexuralCrossMinMpa: num(s.flexuralCrossMinMpa),
    screwHoldingRating: s.screwHoldingRating,
    reactionToFireClass: s.reactionToFireClass,
    fireClassStandards: s.fireClassStandards,
    maxTemperatureC: s.maxTemperatureC,
    thermalConductivityWmk: num(s.thermalConductivityWmk),
    soundReductionMinDb: s.soundReductionMinDb,
    soundReductionMaxDb: s.soundReductionMaxDb,
    waterAbsorptionMaxPct: num(s.waterAbsorptionMaxPct),
    thicknessSwellingMaxPct: num(s.thicknessSwellingMaxPct),
    moldResistant: s.moldResistant,
    crystalPhase: s.crystalPhase,
    mgoContentMinPct: num(s.mgoContentMinPct),
    chlorideMaxPct: num(s.chlorideMaxPct),
    asbestosFree: s.asbestosFree,
    formaldehydeMgL: num(s.formaldehydeMgL),
    vocLevel: s.vocLevel,
    greenCertifications: s.greenCertifications,
  };
}

/** Chứng chỉ công khai còn hạn (cả dòng + riêng từng độ dày) */
function certificatesOf(p: DetailRow, locale: Locale, today: string): CertificatePublic[] {
  type Cert = DetailRow['certificates'][number]['certificate'];
  const all = new Map<string, Cert>(p.certificates.map((pc) => [pc.certificateId, pc.certificate]));
  const variantThickness = new Map<string, number[]>();
  for (const v of p.variants) {
    for (const vc of v.certificates) {
      all.set(vc.certificateId, vc.certificate);
      variantThickness.set(vc.certificateId, [...(variantThickness.get(vc.certificateId) ?? []), Number(v.thicknessMm)]);
    }
  }
  const lineIds = new Set(p.certificates.map((c) => c.certificateId));
  const pick = (c: Cert) => {
    const tr = c.translations.find((t) => t.locale === locale) ?? c.translations.find((t) => t.locale === 'vi');
    return {
      id: c.id,
      name: tr?.name ?? c.testStandard ?? c.result ?? '',
      description: tr?.description ?? null,
      certificateNo: c.certificateNo,
      issuingBody: c.issuingBody,
      testStandard: c.testStandard,
      result: c.result,
      issueDate: dayKey(c.issueDate),
      expiryDate: dayKey(c.expiryDate),
      fileUrl: c.fileUrl,
      thicknessesMm: lineIds.has(c.id) ? [] : (variantThickness.get(c.id) ?? []),
    };
  };
  return [...all.values()]
    .filter((c) => c.isPublic && (!c.expiryDate || toDayKey(c.expiryDate) >= today))
    .map(pick);
}

export function toDetailPublic(p: DetailRow, tr: TranslationRow, locale: Locale, now = new Date()): ProductDetailPublic {
  const base = toListItemPublic(p, tr, now);
  const gallery = asArray<{ url: string }>(p.gallery);
  const decorativeOptions: DecorativeFinishOptionPublic[] = p.decorativeOptions.map((o) => {
    const t = o.translations.find((x) => x.locale === locale) ?? o.translations.find((x) => x.locale === 'vi');
    return {
      finishType: o.finishType,
      scratchResistance: o.scratchResistance,
      name: t?.name ?? o.finishType,
      description: t?.description ?? null,
      patterns: t?.patterns ?? [],
      suitableAreas: t?.suitableAreas ?? [],
    };
  });
  return {
    ...base,
    tradeName: p.tradeName,
    description: tr.description,
    highlights: tr.highlights,
    advantages: asArray<{ title: string; desc: string }>(tr.advantages),
    faqs: asArray<{ q: string; a: string }>(tr.faqs),
    gallery: gallery.map((g, i) => ({ url: g.url, alt: tr.galleryAlts[i] || tr.name })),
    spec: p.technicalSpec ? toSpecView(techRowOf(p.technicalSpec), p.variants.map(specOf), extensionOf(p)) : null,
    variants: p.variants.map((v) => toVariantPublic(v, locale)),
    decorativeOptions,
    certificates: certificatesOf(p, locale, toDayKey(now)),
    seo: {
      title: tr.seoTitle || tr.name,
      description: tr.seoDescription || tr.summary.slice(0, 160),
      ogImageUrl: tr.ogImageUrl ?? p.coverImageUrl,
      noindex: tr.noindex,
    },
    updatedAt: (tr.updatedAt > p.updatedAt ? tr.updatedAt : p.updatedAt).toISOString(),
  };
}

export function toListItemCms(p: ListRow): ProductListItemCms {
  return {
    id: p.id,
    productType: p.productType,
    tradeName: p.tradeName,
    coverImageUrl: p.coverImageUrl,
    isFeatured: p.isFeatured,
    sortOrder: p.sortOrder,
    variantCount: p.variants.length,
    priceRange: priceRange(p.variants.map(offerOf)),
    stockStatus: productStockStatus(p.variants.map(offerOf)),
    locales: Object.fromEntries(p.translations.map((t) => [t.locale, { name: t.name, slug: t.slug, status: t.status }])),
    updatedAt: p.updatedAt.toISOString(),
  };
}

// ─── CMS: bản ghi -> form (cùng hình dạng ProductInput) ───────────────────

const trInput = (t: TranslationRow): ProductTranslationInput => ({
  status: t.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
  name: t.name,
  shortName: t.shortName,
  slug: t.slug,
  tagline: t.tagline,
  summary: t.summary,
  description: t.description,
  highlights: t.highlights,
  advantages: asArray<{ title: string; desc: string }>(t.advantages),
  faqs: asArray<{ q: string; a: string }>(t.faqs),
  coverAlt: t.coverAlt,
  seoTitle: t.seoTitle,
  seoDescription: t.seoDescription,
  focusKeyword: t.focusKeyword,
  noindex: t.noindex,
});

export function toProductCms(p: DetailRow): ProductCms {
  const vi = p.translations.find((t) => t.locale === 'vi');
  const en = p.translations.find((t) => t.locale === 'en');
  const s = p.technicalSpec;
  const ext = extensionOf(p);
  const variants: ProductVariantInput[] = p.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    thicknessMm: Number(v.thicknessMm),
    widthMm: v.widthMm,
    lengthMm: v.lengthMm,
    weightKg: num(v.weightKg),
    densityKgM3: v.densityKgM3,
    fireRatingMinMinutes: v.fireRatingMinMinutes,
    fireRatingMaxMinutes: v.fireRatingMaxMinutes,
    fireRatingLabel: v.fireRatingLabel,
    flexuralMinMpa: num(v.flexuralMinMpa),
    isPopular: v.isPopular,
    isDefault: v.isDefault,
    isActive: v.isActive,
    priceMode: v.priceMode,
    priceVnd: v.priceVnd,
    compareAtPriceVnd: v.compareAtPriceVnd,
    saleUnit: v.saleUnit,
    priceValidUntil: dayKey(v.priceValidUntil),
    stockStatus: v.stockStatus,
    leadTimeDays: v.leadTimeDays,
    minOrderQty: v.minOrderQty,
    translations: Object.fromEntries(v.translations.map((t) => [t.locale, { label: t.label, recommendedUse: t.recommendedUse }])),
  }));
  return {
    id: p.id,
    version: p.updatedAt.toISOString(),
    coverImageUrl: p.coverImageUrl,
    sortOrder: p.sortOrder,
    updatedAt: p.updatedAt.toISOString(),
    published: Object.fromEntries(p.translations.map((t) => [t.locale, { slug: t.slug, status: t.status, publishedAt: t.publishedAt?.toISOString() ?? null }])),
    productType: p.productType,
    tradeName: p.tradeName,
    isFeatured: p.isFeatured,
    translations: { vi: vi ? trInput(vi) : emptyTranslationInput(), en: en ? trInput(en) : null },
    technicalSpec: s ? { ...techRowOf(s), extraSpecs: asArray<{ key: string; value: string; unit?: string }>(s.extraSpecs) } : emptyProductInput(p.productType).technicalSpec,
    variants,
    sip: ext?.type === 'SIP' ? (({ type: _t, ...rest }) => rest)(ext) : null,
    floor: ext?.type === 'FLOOR' ? (({ type: _t, ...rest }) => rest)(ext) : null,
    decorative:
      p.productType === 'DECORATIVE' && p.decorativeSpec
        ? {
            customPrintSupported: p.decorativeSpec.customPrintSupported,
            options: p.decorativeOptions.map((o) => ({
              finishType: o.finishType,
              scratchResistance: o.scratchResistance,
              translations: Object.fromEntries(
                o.translations.map((t) => [t.locale, { name: t.name, description: t.description, patterns: t.patterns, suitableAreas: t.suitableAreas }]),
              ),
            })),
          }
        : null,
  };
}
