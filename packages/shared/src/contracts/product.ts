// Sản phẩm tấm MgO — Composition Architecture (docs/catalog-mgo/MODEL_COMPOSITION_ARCHITECTURE.md) viết bằng
// interface + hàm thuần (KHÔNG dùng class): dữ liệu đi qua API / Server→Client Component là JSON thuần.
// Quy tắc: thiếu dữ liệu = null — KHÔNG có giá trị mặc định (không bịa tỷ trọng / EI cho sản phẩm chưa thử nghiệm).
// Giá trị enum khớp Prisma (api/prisma/schema.prisma). Danh sách giá trị thông số (kiểu cạnh, màu lõi, pha tinh thể…)
// KHÔNG khai báo ở đây — là dữ liệu bảng spec_options, quản lý ở CMS "Danh Mục Thông Số"; sản phẩm lưu mã (code).

import type { Locale } from '../locale.js';
import { formatNumber } from '../date.js';
import { slugify } from '../slug.js';

type L10n = Record<Locale, string>;

// ─── Enum (khớp Prisma) ──────────────────────────────────────────────────────

/**
 * Mẫu form thông số riêng của một Loại sản phẩm. Loại sản phẩm là dữ liệu (CMS thêm/sửa/xoá);
 * chỉ danh sách mẫu này cố định vì mỗi mẫu có bảng DB + ô nhập riêng.
 */
export const PRODUCT_SPEC_PROFILES = ['NONE', 'SIP', 'FLOOR', 'DECORATIVE'] as const;
export type ProductSpecProfile = (typeof PRODUCT_SPEC_PROFILES)[number];

export const PRICE_MODES = ['FIXED', 'CONTACT'] as const;
export type PriceMode = (typeof PRICE_MODES)[number];

export const STOCK_STATUSES = ['IN_STOCK', 'LIMITED', 'PRE_ORDER', 'BACK_ORDER', 'OUT_OF_STOCK', 'DISCONTINUED'] as const;
export type StockStatus = (typeof STOCK_STATUSES)[number];

export const SALE_UNITS = ['SHEET', 'M2'] as const;
export type SaleUnit = (typeof SALE_UNITS)[number];

/** Mã giá trị danh mục thông số (bảng spec_options) — vd 'TONGUE_GROOVE' */
export type EdgeProfile = string;
export type SipCoreMaterial = string;
export type DecorativeFinishType = string;

// ─── Danh mục thông số (bảng spec_options, quản lý trong CMS) ───────────────

/** Nhóm giá trị — cố định vì mỗi nhóm gắn với cột thông số cụ thể; giá trị trong nhóm là dữ liệu */
export const SPEC_OPTION_GROUPS = [
  'EDGE_PROFILE',
  'CORE_COLOR',
  'SURFACE_FINISH',
  'SCREW_HOLDING',
  'CRYSTAL_PHASE',
  'VOC_LEVEL',
  'SUITABLE_FLOORING',
  'SIP_CORE_MATERIAL',
  'LOAD_BEARING',
  'DECORATIVE_FINISH',
  'SCRATCH_RESISTANCE',
] as const;
export type SpecOptionGroup = (typeof SPEC_OPTION_GROUPS)[number];

/** Tên nhóm + trường dùng nhóm đó (hiện ở CMS) */
export const SPEC_OPTION_GROUP_LABEL: Record<SpecOptionGroup, { name: string; fields: string }> = {
  EDGE_PROFILE: { name: 'Kiểu cạnh', fields: 'Thông số chung › Kiểu cạnh · Tấm sàn › Kiểu cạnh ghép' },
  CORE_COLOR: { name: 'Màu cốt tấm', fields: 'Thông số chung › Màu cốt tấm' },
  SURFACE_FINISH: { name: 'Bề mặt', fields: 'Thông số chung › Bề mặt' },
  SCREW_HOLDING: { name: 'Khả năng bám vít', fields: 'Thông số chung › Khả năng bám vít' },
  CRYSTAL_PHASE: { name: 'Pha tinh thể', fields: 'Thông số chung › Pha tinh thể' },
  VOC_LEVEL: { name: 'Mức VOC', fields: 'Thông số chung › Mức VOC' },
  SUITABLE_FLOORING: { name: 'Lớp phủ sàn phù hợp', fields: 'Tấm sàn › Lớp phủ sàn phù hợp' },
  SIP_CORE_MATERIAL: { name: 'Vật liệu lõi SIP', fields: 'Panel SIP › Vật liệu lõi' },
  LOAD_BEARING: { name: 'Khả năng chịu lực', fields: 'Panel SIP › Khả năng chịu lực' },
  DECORATIVE_FINISH: { name: 'Loại hoàn thiện bề mặt', fields: 'Tấm trang trí › Loại hoàn thiện' },
  SCRATCH_RESISTANCE: { name: 'Chống trầy', fields: 'Tấm trang trí › Chống trầy' },
};

export const SPEC_OPTION_CODE_MAX = 40;
export const SPEC_OPTION_LABEL_MAX = 100;
const SPEC_OPTION_CODE_PATTERN = /^[A-Z0-9]+(_[A-Z0-9]+)*$/;

/** Mã: chữ in hoa không dấu, số, gạch dưới đơn — vd PHASE_517 */
export const isValidSpecOptionCode = (code: string): boolean => code.length > 0 && code.length <= SPEC_OPTION_CODE_MAX && SPEC_OPTION_CODE_PATTERN.test(code);

/** Gợi ý mã từ nhãn tiếng Việt: "Hèm âm dương" -> HEM_AM_DUONG */
export const specOptionCodeFrom = (label: string): string => slugify(label, SPEC_OPTION_CODE_MAX).replace(/-/g, '_').toUpperCase();

/** CMS: một giá trị trong danh mục */
export interface SpecOptionCms {
  id: string;
  group: SpecOptionGroup;
  code: string;
  sortOrder: number;
  isActive: boolean;
  /** Số sản phẩm đang dùng (kể cả trong thùng rác) — > 0 thì không xoá được */
  usageCount: number;
  version: string;
  labels: Partial<Record<Locale, string>>;
}

export interface SpecOptionInput {
  group: SpecOptionGroup;
  /** bỏ trống = sinh từ nhãn tiếng Việt; chỉ dùng khi tạo — không đổi được sau đó */
  code?: string;
  isActive: boolean;
  /** en = null: web /en dùng nhãn tiếng Việt */
  labels: { vi: string; en: string | null };
}

/** Nhãn theo 1 ngôn ngữ: nhóm -> mã -> nhãn */
export type SpecOptionLabels = Partial<Record<SpecOptionGroup, Record<string, string>>>;

/** Nhãn hiển thị của mã; chưa có nhãn -> hiện chính mã */
export const optionLabel = (labels: SpecOptionLabels, group: SpecOptionGroup, code: string): string => labels[group]?.[code] ?? code;

// ─── Nhãn vi/en ──────────────────────────────────────────────────────────────

export const PRODUCT_SPEC_PROFILE_LABEL: Record<ProductSpecProfile, L10n> = {
  NONE: { vi: 'Không có thông số riêng', en: 'None' },
  SIP: { vi: 'Panel SIP', en: 'SIP panel' },
  FLOOR: { vi: 'Tấm sàn', en: 'Floor board' },
  DECORATIVE: { vi: 'Tấm trang trí', en: 'Decorative board' },
};

export const STOCK_STATUS_LABEL: Record<StockStatus, L10n> = {
  IN_STOCK: { vi: 'Còn hàng', en: 'In stock' },
  LIMITED: { vi: 'Sắp hết hàng', en: 'Limited stock' },
  PRE_ORDER: { vi: 'Đặt trước', en: 'Pre-order' },
  BACK_ORDER: { vi: 'Đang về hàng', en: 'Back order' },
  OUT_OF_STOCK: { vi: 'Hết hàng', en: 'Out of stock' },
  DISCONTINUED: { vi: 'Ngừng kinh doanh', en: 'Discontinued' },
};

/** schema.org ItemAvailability — JSON-LD Offer */
export const SCHEMA_AVAILABILITY: Record<StockStatus, string> = {
  IN_STOCK: 'https://schema.org/InStock',
  LIMITED: 'https://schema.org/LimitedAvailability',
  PRE_ORDER: 'https://schema.org/PreOrder',
  BACK_ORDER: 'https://schema.org/BackOrder',
  OUT_OF_STOCK: 'https://schema.org/OutOfStock',
  DISCONTINUED: 'https://schema.org/Discontinued',
};

export const SALE_UNIT_LABEL: Record<SaleUnit, L10n> = { SHEET: { vi: 'tấm', en: 'sheet' }, M2: { vi: 'm²', en: 'm²' } };

// ─── 5 sub-model (Composition) ───────────────────────────────────────────────

export interface SheetSize {
  widthMm: number;
  lengthMm: number;
}

export interface PhysicalDimensions {
  standardSizes: SheetSize[];
  edgeProfile: EdgeProfile | null;
  coreColor: string | null;
  surfaceFinish: string | null;
}

export interface MechanicalSpecs {
  densityMinKgM3: number | null;
  densityMaxKgM3: number | null;
  densityReductionPct: number | null;
  flexuralMinMpa: number | null;
  flexuralMaxMpa: number | null;
  flexuralCrossMinMpa: number | null;
  screwHoldingRating: string | null;
}

export interface ThermalFireSpecs {
  reactionToFireClass: string | null;
  fireClassStandards: string[];
  maxTemperatureC: number | null;
  thermalConductivityWmk: number | null;
  /** Giới hạn chịu lửa cao nhất trong các độ dày đang bán (suy ra, không lưu) */
  maxFireRatingMinutes: number | null;
}

export interface AcousticMoistureSpecs {
  soundReductionMinDb: number | null;
  soundReductionMaxDb: number | null;
  waterAbsorptionMaxPct: number | null;
  thicknessSwellingMaxPct: number | null;
  moldResistant: boolean | null;
}

export interface ChemistrySafetySpecs {
  crystalPhase: string | null;
  mgoContentMinPct: number | null;
  chlorideMaxPct: number | null;
  asbestosFree: boolean | null;
  formaldehydeMgL: number | null;
  vocLevel: string | null;
  greenCertifications: string[];
}

export interface SipExtension {
  type: 'SIP';
  coreMaterials: SipCoreMaterial[];
  coreThicknessMinMm: number | null;
  coreThicknessMaxMm: number | null;
  facingThicknessesMm: number[];
  maxWidthMm: number | null;
  maxLengthMm: number | null;
  loadBearing: string | null;
}

export interface FloorExtension {
  type: 'FLOOR';
  edgeProfiles: EdgeProfile[];
  floorSizes: SheetSize[];
  suitableFloorings: string[];
  moistureResistantFloor: boolean | null;
  sandedSurface: boolean | null;
}

export interface DecorativeExtension {
  type: 'DECORATIVE';
  customPrintSupported: boolean;
  finishTypes: DecorativeFinishType[];
}

export type ProductExtension = SipExtension | FloorExtension | DecorativeExtension | null;

/** Thông số tổ hợp của một dòng tấm */
export interface ProductSpecView {
  physical: PhysicalDimensions;
  mechanical: MechanicalSpecs;
  thermalFire: ThermalFireSpecs;
  acousticMoisture: AcousticMoistureSpecs;
  chemistrySafety: ChemistrySafetySpecs;
  extension: ProductExtension;
}

/** Thông số theo độ dày (phần dùng để tính / so sánh) */
export interface VariantSpec {
  thicknessMm: number;
  widthMm: number;
  lengthMm: number;
  weightKg: number | null;
  densityKgM3: number | null;
  fireRatingMinMinutes: number | null;
  fireRatingMaxMinutes: number | null;
  flexuralMinMpa: number | null;
  isActive?: boolean;
}

/** Hàng TDS (cột DB, số đã chuyển từ Decimal sang number) */
export type TechnicalSpecRow = PhysicalDimensions & MechanicalSpecs & Omit<ThermalFireSpecs, 'maxFireRatingMinutes'> & AcousticMoistureSpecs & ChemistrySafetySpecs;

/** Gom cột TDS + các độ dày + phần mở rộng thành 5 sub-model */
export function toSpecView(row: TechnicalSpecRow, variants: readonly VariantSpec[], extension: ProductExtension = null): ProductSpecView {
  return {
    physical: { standardSizes: row.standardSizes, edgeProfile: row.edgeProfile, coreColor: row.coreColor, surfaceFinish: row.surfaceFinish },
    mechanical: {
      densityMinKgM3: row.densityMinKgM3,
      densityMaxKgM3: row.densityMaxKgM3,
      densityReductionPct: row.densityReductionPct,
      flexuralMinMpa: row.flexuralMinMpa,
      flexuralMaxMpa: row.flexuralMaxMpa,
      flexuralCrossMinMpa: row.flexuralCrossMinMpa,
      screwHoldingRating: row.screwHoldingRating,
    },
    thermalFire: {
      reactionToFireClass: row.reactionToFireClass,
      fireClassStandards: row.fireClassStandards,
      maxTemperatureC: row.maxTemperatureC,
      thermalConductivityWmk: row.thermalConductivityWmk,
      maxFireRatingMinutes: maxFireRatingMinutes(variants),
    },
    acousticMoisture: {
      soundReductionMinDb: row.soundReductionMinDb,
      soundReductionMaxDb: row.soundReductionMaxDb,
      waterAbsorptionMaxPct: row.waterAbsorptionMaxPct,
      thicknessSwellingMaxPct: row.thicknessSwellingMaxPct,
      moldResistant: row.moldResistant,
    },
    chemistrySafety: {
      crystalPhase: row.crystalPhase,
      mgoContentMinPct: row.mgoContentMinPct,
      chlorideMaxPct: row.chlorideMaxPct,
      asbestosFree: row.asbestosFree,
      formaldehydeMgL: row.formaldehydeMgL,
      vocLevel: row.vocLevel,
      greenCertifications: row.greenCertifications,
    },
    extension,
  };
}

/** EI cao nhất trong các độ dày đang bán (null nếu chưa có độ dày nào được thử nghiệm) */
export function maxFireRatingMinutes(variants: readonly VariantSpec[]): number | null {
  const v = variants.filter((x) => x.isActive !== false && x.fireRatingMaxMinutes != null).map((x) => x.fireRatingMaxMinutes!);
  return v.length ? Math.max(...v) : null;
}

// ─── Hiển thị khoảng số ─────────────────────────────────────────────────────

/**
 * Khoảng số -> chữ: (950, 1150) "950 – 1.150 kg/m³" · (25, null) "≥ 25 MPa" · (null, 15) "< 15 %" (strictMax) / "≤ 15 %"
 * · (x, x) "x". Không có số -> null (giao diện hiện "—" hoặc ẩn).
 */
export function formatRange(min: number | null, max: number | null, unit: string, locale: Locale = 'vi', opts: { strictMax?: boolean } = {}): string | null {
  const n = (x: number) => formatNumber(x, locale);
  const u = unit ? (unit === '%' ? ' %' : ` ${unit}`) : '';
  if (min != null && max != null) return min === max ? `${n(min)}${u}` : `${n(min)} – ${n(max)}${u}`;
  if (min != null) return `≥ ${n(min)}${u}`;
  if (max != null) return `${opts.strictMax ? '<' : '≤'} ${n(max)}${u}`;
  return null;
}

/** Nhãn EI từ phút: (45, 60) "EI 45 – EI 60" · (180, 180) "EI 180" */
export function formatFireRating(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null && min !== max) return `EI ${min} – EI ${max}`;
  return `EI ${max ?? min}`;
}

// ─── So sánh (từ các method trong tài liệu) — thiếu dữ liệu -> null, không đoán ─

/** Chênh lệch phút chịu lửa (dương = a tốt hơn) */
export function compareFireMinutes(a: ThermalFireSpecs, b: ThermalFireSpecs): number | null {
  return a.maxFireRatingMinutes == null || b.maxFireRatingMinutes == null ? null : a.maxFireRatingMinutes - b.maxFireRatingMinutes;
}

/** Có độ dày nào đạt EI mục tiêu (vd nghiệm thu EI 90) */
export function meetsTargetEi(variants: readonly VariantSpec[], targetMinutes: number): boolean | null {
  const max = maxFireRatingMinutes(variants);
  return max == null ? null : max >= targetMinutes;
}

/** So cường độ uốn tối thiểu */
export function compareFlexural(a: MechanicalSpecs, b: MechanicalSpecs): 'stronger' | 'weaker' | 'equal' | null {
  if (a.flexuralMinMpa == null || b.flexuralMinMpa == null) return null;
  return a.flexuralMinMpa > b.flexuralMinMpa ? 'stronger' : a.flexuralMinMpa < b.flexuralMinMpa ? 'weaker' : 'equal';
}

/** Tỷ trọng đại diện = trung bình min/max (nếu chỉ có 1 đầu thì dùng đầu đó) */
export function densityMid(m: MechanicalSpecs): number | null {
  if (m.densityMinKgM3 != null && m.densityMaxKgM3 != null) return (m.densityMinKgM3 + m.densityMaxKgM3) / 2;
  return m.densityMinKgM3 ?? m.densityMaxKgM3;
}

/** a nhẹ hơn b (giảm tải) */
export function isLighter(a: MechanicalSpecs, b: MechanicalSpecs): boolean | null {
  const da = densityMid(a);
  const db = densityMid(b);
  return da == null || db == null ? null : da < db;
}

/** Chênh lệch dB cách âm tối đa (dương = a cách âm tốt hơn) */
export function compareSoundInsulation(a: AcousticMoistureSpecs, b: AcousticMoistureSpecs): number | null {
  const x = a.soundReductionMaxDb ?? a.soundReductionMinDb;
  const y = b.soundReductionMaxDb ?? b.soundReductionMinDb;
  return x == null || y == null ? null : x - y;
}

/** Ngưỡng clorua coi là không gây gỉ vít / khung thép (Zero-Chloride) */
export const CORROSION_SAFE_CHLORIDE_PCT = 0.02;

export function isCorrosionProof(c: ChemistrySafetySpecs): boolean | null {
  return c.chlorideMaxPct == null ? null : c.chlorideMaxPct <= CORROSION_SAFE_CHLORIDE_PCT;
}

export interface ProductComparison {
  fireRatingDiffMinutes: number | null;
  flexural: 'stronger' | 'weaker' | 'equal' | null;
  soundDiffDb: number | null;
  isLighter: boolean | null;
  corrosionSafety: { a: boolean | null; b: boolean | null };
}

/** So sánh chéo 2 dòng tấm (compareWith trong tài liệu) */
export function compareProducts(a: ProductSpecView, b: ProductSpecView): ProductComparison {
  return {
    fireRatingDiffMinutes: compareFireMinutes(a.thermalFire, b.thermalFire),
    flexural: compareFlexural(a.mechanical, b.mechanical),
    soundDiffDb: compareSoundInsulation(a.acousticMoisture, b.acousticMoisture),
    isLighter: isLighter(a.mechanical, b.mechanical),
    corrosionSafety: { a: isCorrosionProof(a.chemistrySafety), b: isCorrosionProof(b.chemistrySafety) },
  };
}

// ─── Giá / chào hàng ─────────────────────────────────────────────────────────

export interface VariantOffer {
  priceMode: PriceMode;
  priceVnd: number | null;
  compareAtPriceVnd: number | null;
  stockStatus: StockStatus;
  isActive?: boolean;
}

/** Có giá công khai (CONTACT / chưa có giá / ngừng KD / đang ẩn -> không xuất giá ra web & Google) */
export function hasPublicPrice(v: VariantOffer): v is VariantOffer & { priceVnd: number } {
  return v.isActive !== false && v.priceMode === 'FIXED' && (v.priceVnd ?? 0) > 0 && v.stockStatus !== 'DISCONTINUED';
}

export function discountPercent(v: VariantOffer): number | null {
  if (!hasPublicPrice(v) || !v.compareAtPriceVnd || v.compareAtPriceVnd <= v.priceVnd) return null;
  return Math.round((1 - v.priceVnd / v.compareAtPriceVnd) * 100);
}

/** Khoảng giá (thẻ "từ … đ" + JSON-LD AggregateOffer); không có giá công khai -> null ("Liên hệ báo giá") */
export function priceRange(variants: readonly VariantOffer[]): { low: number; high: number; count: number } | null {
  const prices = variants.filter(hasPublicPrice).map((v) => v.priceVnd);
  return prices.length ? { low: Math.min(...prices), high: Math.max(...prices), count: prices.length } : null;
}

/** Tình trạng chung = tốt nhất trong các độ dày đang bán */
export function productStockStatus(variants: readonly VariantOffer[]): StockStatus {
  const active = variants.filter((v) => v.isActive !== false);
  return STOCK_STATUSES.find((s) => active.some((v) => v.stockStatus === s)) ?? 'OUT_OF_STOCK';
}

// ─── Kiểm tra số liệu (CMS cảnh báo, không chặn) ─────────────────────────────

/** Nhãn quy cách khi chưa đặt tên: "Tấm 8mm" / "8mm board" */
export function defaultVariantLabelOf(thicknessMm: number, locale: Locale): string {
  const t = `${Number(thicknessMm)}mm`;
  return locale === 'vi' ? `Tấm ${t}` : `${t} board`;
}

export function sheetAreaM2(widthMm: number, lengthMm: number): number {
  return Math.round(((widthMm * lengthMm) / 1_000_000) * 1000) / 1000;
}

/** Khối lượng ước tính một tấm (kg) = thể tích × tỷ trọng */
export function estimateSheetWeightKg(thicknessMm: number, widthMm: number, lengthMm: number, densityKgM3: number | null): number | null {
  if (densityKgM3 == null) return null;
  return Math.round(((thicknessMm * widthMm * lengthMm) / 1e9) * densityKgM3 * 10) / 10;
}

/** Ngưỡng lệch kg/tấm so với ước tính từ tỷ trọng để CMS cảnh báo */
export const WEIGHT_MISMATCH_THRESHOLD = 0.15;

/**
 * kg/tấm nhập tay có lệch quá ngưỡng so với ước tính từ tỷ trọng không (tỷ trọng của độ dày, nếu không có thì
 * trung bình khoảng tỷ trọng của dòng). null = không đủ dữ liệu để kiểm.
 */
export function weightMismatch(v: VariantSpec, line: MechanicalSpecs): { expectedKg: number; ratio: number } | null {
  const density = v.densityKgM3 ?? densityMid(line);
  if (v.weightKg == null || density == null) return null;
  const expectedKg = estimateSheetWeightKg(v.thicknessMm, v.widthMm, v.lengthMm, density)!;
  const ratio = Math.round((v.weightKg / expectedKg - 1) * 1000) / 1000;
  return Math.abs(ratio) > WEIGHT_MISMATCH_THRESHOLD ? { expectedKg, ratio } : null;
}

// ─── Chứng chỉ ───────────────────────────────────────────────────────────────

export type CertificateStatus = 'VALID' | 'EXPIRING' | 'EXPIRED' | 'NO_EXPIRY';
export const CERTIFICATE_EXPIRING_DAYS = 60;

/** Trạng thái chứng chỉ tính từ ngày hết hạn (DayKey 'YYYY-MM-DD' hoặc null) — không lưu tay */
export function certificateStatus(expiryDate: string | null, today: string): CertificateStatus {
  if (!expiryDate) return 'NO_EXPIRY';
  const days = (Date.parse(`${expiryDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000;
  if (days < 0) return 'EXPIRED';
  return days <= CERTIFICATE_EXPIRING_DAYS ? 'EXPIRING' : 'VALID';
}

// ─── Hợp đồng API (api trả, fe dùng) ─────────────────────────────────────────

/** Tag revalidate trang sản phẩm (fe: /api/revalidate) */
export const PRODUCTS_REVALIDATE_TAG = 'products';

export interface ProductVariantPublic {
  id: string;
  sku: string | null;
  label: string;
  recommendedUse: string | null;
  thicknessMm: number;
  widthMm: number;
  lengthMm: number;
  areaM2: number;
  weightKg: number | null;
  densityKgM3: number | null;
  fireRatingMinMinutes: number | null;
  fireRatingMaxMinutes: number | null;
  fireRatingLabel: string | null;
  flexuralMinMpa: number | null;
  isPopular: boolean;
  isDefault: boolean;
  priceMode: PriceMode;
  /** null khi không có giá công khai (liên hệ báo giá / ngừng KD) */
  priceVnd: number | null;
  compareAtPriceVnd: number | null;
  discountPercent: number | null;
  saleUnit: SaleUnit;
  /** DayKey 'YYYY-MM-DD' */
  priceValidUntil: string | null;
  stockStatus: StockStatus;
  leadTimeDays: number | null;
  minOrderQty: number | null;
}

// ─── Loại sản phẩm (bảng product_types, quản lý trong CMS) ───────────────────

/** Loại sản phẩm theo 1 ngôn ngữ — gắn vào sản phẩm trả ra web */
export interface ProductTypeRef {
  id: string;
  specProfile: ProductSpecProfile;
  name: string;
  /** rỗng = loại không có trang ở ngôn ngữ này (chưa dịch / đang ẩn) — không đặt link */
  slug: string;
}

/** Trang loại trên web */
export interface ProductTypePublic extends ProductTypeRef {
  description: string | null;
  seo: { title: string; description: string };
  /** slug theo từng ngôn ngữ có bản dịch — hreflang / đổi ngôn ngữ */
  alternates: Partial<Record<Locale, string>>;
}

export interface ProductTypeSitemapEntry {
  slugs: Partial<Record<Locale, string>>;
}

export interface ProductTypeTranslationCms {
  name: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

/** CMS: một dòng trong màn Loại sản phẩm */
export interface ProductTypeCms {
  id: string;
  specProfile: ProductSpecProfile;
  sortOrder: number;
  isActive: boolean;
  /** Số sản phẩm chưa xoá */
  productCount: number;
  /** Số sản phẩm trong thùng rác — vẫn chặn xoá loại */
  trashedProductCount: number;
  version: string;
  translations: Partial<Record<Locale, ProductTypeTranslationCms>>;
}

export interface ProductTypeTranslationInput {
  name: string;
  /** bỏ trống = tự sinh từ tên */
  slug?: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface ProductTypeInput {
  specProfile: ProductSpecProfile;
  isActive: boolean;
  /** en = null: chưa có bản tiếng Anh (loại không hiện ở web /en) */
  translations: { vi: ProductTypeTranslationInput; en: ProductTypeTranslationInput | null };
}

export const PRODUCT_TYPE_LIMITS = { name: 100, slug: 120, description: 500, seoTitle: 120, seoDescription: 320 } as const;

/** Đoạn đường dẫn trang loại: /san-pham/loai/<slug> ⇄ /en/products/type/<slug> */
export const PRODUCT_TYPE_PATH_SEGMENT: Record<Locale, string> = { vi: 'loai', en: 'type' };

/** Slug sản phẩm trùng đoạn đường dẫn trang loại thì trang sản phẩm bị che — không cho dùng */
export function isReservedProductSlug(locale: Locale, slug: string): boolean {
  return slug === PRODUCT_TYPE_PATH_SEGMENT[locale];
}

export interface ProductListItemPublic {
  id: string;
  type: ProductTypeRef;
  slug: string;
  name: string;
  tagline: string | null;
  summary: string;
  badge: string | null;
  coverImageUrl: string | null;
  coverAlt: string;
  isFeatured: boolean;
  thicknessesMm: number[];
  fireRating: { min: number | null; max: number | null } | null;
  priceRange: { low: number; high: number; count: number } | null;
  stockStatus: StockStatus;
  /** slug theo từng ngôn ngữ đã xuất bản — hreflang / đổi ngôn ngữ */
  alternates: Partial<Record<Locale, string>>;
}

export interface DecorativeFinishOptionPublic {
  finishType: DecorativeFinishType;
  scratchResistance: string | null;
  name: string;
  description: string | null;
  patterns: string[];
  suitableAreas: string[];
}

export interface CertificatePublic {
  id: string;
  name: string;
  description: string | null;
  certificateNo: string | null;
  issuingBody: string | null;
  testStandard: string | null;
  result: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  fileUrl: string | null;
  /** chỉ áp cho các độ dày này (rỗng = cả dòng) */
  thicknessesMm: number[];
}

export interface ProductDetailPublic extends ProductListItemPublic {
  /** RichDoc */
  description: unknown;
  highlights: string[];
  advantages: { title: string; desc: string }[];
  faqs: { q: string; a: string }[];
  gallery: { url: string; alt: string }[];
  spec: ProductSpecView | null;
  variants: ProductVariantPublic[];
  decorativeOptions: DecorativeFinishOptionPublic[];
  certificates: CertificatePublic[];
  /** Nhãn (theo ngôn ngữ đang xem) của mọi mã danh mục thông số sản phẩm dùng */
  optionLabels: SpecOptionLabels;
  seo: { title: string; description: string; ogImageUrl: string | null; noindex: boolean };
  updatedAt: string;
}

/** GET /products/public/:slug — slug cũ / slug ngôn ngữ khác trả { redirect } để fe 301 */
export type ProductBySlugResponse = { product: ProductDetailPublic } | { redirect: string };

/** GET /products/public/types/:slug — slug cũ / slug ngôn ngữ khác trả { redirect } */
export type ProductTypeBySlugResponse = { type: ProductTypePublic; products: ProductListItemPublic[] } | { redirect: string };

export interface ProductSitemapEntry {
  slugs: Partial<Record<Locale, string>>;
  updatedAt: string;
}

/** CMS: dòng trong danh sách sản phẩm */
export interface ProductListItemCms {
  id: string;
  /** name = tên tiếng Việt của loại */
  type: { id: string; name: string; specProfile: ProductSpecProfile };
  coverImageUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
  variantCount: number;
  priceRange: { low: number; high: number; count: number } | null;
  stockStatus: StockStatus;
  locales: Partial<Record<Locale, { name: string; slug: string; status: string }>>;
  updatedAt: string;
  deletedAt?: string | null;
}

// ─── Form CMS / body API ghi (một hình dạng dùng chung) ─────────────────────

export const PRODUCT_PUBLISH_STATUSES = ['DRAFT', 'PUBLISHED'] as const;
export type ProductPublishStatus = (typeof PRODUCT_PUBLISH_STATUSES)[number];

export const PRODUCT_LIMITS = {
  name: 200,
  slug: 160,
  tagline: 200,
  summary: 600,
  listItems: 30,
  listItemText: 500,
  seoTitle: 120,
  seoDescription: 320,
  variants: 60,
} as const;

export interface ProductTranslationInput {
  status: ProductPublishStatus;
  name: string;
  /** bỏ trống = tự sinh từ tên */
  slug: string | null;
  tagline: string | null;
  summary: string;
  /** RichDoc */
  description: unknown;
  highlights: string[];
  advantages: { title: string; desc: string }[];
  faqs: { q: string; a: string }[];
  coverAlt: string;
  seoTitle: string | null;
  seoDescription: string | null;
  focusKeyword: string | null;
  noindex: boolean;
}

export interface ProductVariantInput {
  /** có = sửa dòng cũ (giữ liên kết chứng chỉ / dự án); null = thêm mới */
  id: string | null;
  sku: string | null;
  thicknessMm: number;
  widthMm: number;
  lengthMm: number;
  weightKg: number | null;
  densityKgM3: number | null;
  fireRatingMinMinutes: number | null;
  fireRatingMaxMinutes: number | null;
  fireRatingLabel: string | null;
  flexuralMinMpa: number | null;
  isPopular: boolean;
  isDefault: boolean;
  isActive: boolean;
  priceMode: PriceMode;
  priceVnd: number | null;
  compareAtPriceVnd: number | null;
  saleUnit: SaleUnit;
  /** DayKey */
  priceValidUntil: string | null;
  stockStatus: StockStatus;
  leadTimeDays: number | null;
  minOrderQty: number | null;
  translations: Partial<Record<Locale, { label: string | null; recommendedUse: string | null }>>;
}

export type TechnicalSpecInput = TechnicalSpecRow & { extraSpecs: { key: string; value: string; unit?: string }[] };

export type SipSpecInput = Omit<SipExtension, 'type'>;
export type FloorSpecInput = Omit<FloorExtension, 'type'>;
export interface DecorativeOptionInput {
  finishType: DecorativeFinishType;
  scratchResistance: string | null;
  translations: Partial<Record<Locale, { name: string; description: string | null; patterns: string[]; suitableAreas: string[] }>>;
}
export interface DecorativeSpecInput {
  customPrintSupported: boolean;
  options: DecorativeOptionInput[];
}

export interface ProductInput {
  /** id bảng product_types */
  typeId: string;
  isFeatured: boolean;
  translations: { vi: ProductTranslationInput; en: ProductTranslationInput | null };
  technicalSpec: TechnicalSpecInput;
  variants: ProductVariantInput[];
  sip: SipSpecInput | null;
  floor: FloorSpecInput | null;
  decorative: DecorativeSpecInput | null;
}

/** CMS: bản ghi đầy đủ để sửa (cùng hình dạng ProductInput + thông tin chỉ đọc) */
export interface ProductCms extends ProductInput {
  id: string;
  /** If-Match */
  version: string;
  coverImageUrl: string | null;
  sortOrder: number;
  /** slug đang dùng + ngày đăng theo ngôn ngữ */
  published: Partial<Record<Locale, { slug: string; status: string; publishedAt: string | null }>>;
  /**
   * Mọi khối thông số riêng đang lưu trong DB, kể cả khối không khớp mẫu của loại hiện tại (đang ẩn).
   * CMS dùng khi đổi sang loại có mẫu đó để hiện lại dữ liệu cũ thay vì form trống (tránh ghi đè).
   */
  storedExtensions: Pick<ProductInput, 'sip' | 'floor' | 'decorative'>;
  updatedAt: string;
}

/** Phần mở rộng hợp lệ cho từng mẫu form */
export const EXTENSION_OF_PROFILE: Partial<Record<ProductSpecProfile, 'sip' | 'floor' | 'decorative'>> = {
  SIP: 'sip',
  FLOOR: 'floor',
  DECORATIVE: 'decorative',
};

/**
 * Mọi mã danh mục thông số form đang dùng, kèm nhóm + đường dẫn trường (khoá lỗi) —
 * API kiểm mã có trong danh mục, đọc nhãn cho trang web.
 */
export function specOptionCodesOf(p: ProductInput): { group: SpecOptionGroup; path: string; code: string }[] {
  const out: { group: SpecOptionGroup; path: string; code: string }[] = [];
  const one = (group: SpecOptionGroup, path: string, code: string | null | undefined) => {
    if (code) out.push({ group, path, code });
  };
  const many = (group: SpecOptionGroup, path: string, codes: string[]) => codes.forEach((code) => one(group, path, code));
  const s = p.technicalSpec;
  one('EDGE_PROFILE', 'technicalSpec.edgeProfile', s.edgeProfile);
  one('CORE_COLOR', 'technicalSpec.coreColor', s.coreColor);
  one('SURFACE_FINISH', 'technicalSpec.surfaceFinish', s.surfaceFinish);
  one('SCREW_HOLDING', 'technicalSpec.screwHoldingRating', s.screwHoldingRating);
  one('CRYSTAL_PHASE', 'technicalSpec.crystalPhase', s.crystalPhase);
  one('VOC_LEVEL', 'technicalSpec.vocLevel', s.vocLevel);
  if (p.floor) {
    many('EDGE_PROFILE', 'floor.edgeProfiles', p.floor.edgeProfiles);
    many('SUITABLE_FLOORING', 'floor.suitableFloorings', p.floor.suitableFloorings);
  }
  if (p.sip) {
    many('SIP_CORE_MATERIAL', 'sip.coreMaterials', p.sip.coreMaterials);
    one('LOAD_BEARING', 'sip.loadBearing', p.sip.loadBearing);
  }
  p.decorative?.options.forEach((o, i) => {
    one('DECORATIVE_FINISH', `decorative.options.${i}.finishType`, o.finishType);
    one('SCRATCH_RESISTANCE', `decorative.options.${i}.scratchResistance`, o.scratchResistance);
  });
  return out;
}

const rangeOk = (min: number | null | undefined, max: number | null | undefined) => min == null || max == null || min <= max;

/**
 * Kiểm lỗi nghiệp vụ form sản phẩm — dùng chung: API chặn lưu, CMS báo lỗi tại ô.
 * Khoá lỗi theo đường dẫn trường: "translations.vi.name", "variants.2.priceVnd", "technicalSpec.densityMaxKgM3"…
 * `specProfile` = mẫu form của loại đã chọn (loại là dữ liệu DB nên bên gọi tra rồi truyền vào).
 * (CHECK trong DB là lớp chặn cuối; hàm này cho thông báo dễ hiểu.)
 */
export function productInputErrors(p: ProductInput, specProfile: ProductSpecProfile): Record<string, string> {
  const e: Record<string, string> = {};
  if (!p.typeId) e['typeId'] = 'Chọn loại sản phẩm';
  const vi = p.translations.vi;
  const en = p.translations.en;
  if (!vi.name.trim()) e['translations.vi.name'] = 'Nhập tên sản phẩm tiếng Việt';
  if (en && !en.name.trim()) e['translations.en.name'] = 'Có bản tiếng Anh thì phải có tên tiếng Anh';
  if (vi.status === 'PUBLISHED' && !vi.summary.trim()) e['translations.vi.summary'] = 'Cần tóm tắt trước khi xuất bản';
  if (en?.status === 'PUBLISHED' && !en.summary.trim()) e['translations.en.summary'] = 'Cần tóm tắt trước khi xuất bản';
  if (en?.status === 'PUBLISHED' && vi.status !== 'PUBLISHED') e['translations.en.status'] = 'Xuất bản bản tiếng Việt trước';

  const s = p.technicalSpec;
  if (!rangeOk(s.densityMinKgM3, s.densityMaxKgM3)) e['technicalSpec.densityMaxKgM3'] = 'Tỷ trọng tối đa phải ≥ tối thiểu';
  if (!rangeOk(s.flexuralMinMpa, s.flexuralMaxMpa)) e['technicalSpec.flexuralMaxMpa'] = 'Cường độ uốn tối đa phải ≥ tối thiểu';
  if (!rangeOk(s.soundReductionMinDb, s.soundReductionMaxDb)) e['technicalSpec.soundReductionMaxDb'] = 'Cách âm tối đa phải ≥ tối thiểu';

  const seen = new Set<string>();
  let defaults = 0;
  p.variants.forEach((v, i) => {
    const k = `variants.${i}`;
    if (!(v.thicknessMm > 0)) e[`${k}.thicknessMm`] = 'Độ dày phải > 0';
    if (!(v.widthMm > 0) || !(v.lengthMm > 0)) e[`${k}.widthMm`] = 'Nhập khổ tấm (mm)';
    const key = `${v.thicknessMm}|${v.widthMm}|${v.lengthMm}`;
    if (seen.has(key)) e[`${k}.thicknessMm`] = 'Trùng độ dày + khổ với dòng khác';
    seen.add(key);
    if (v.priceMode === 'FIXED' && !(v.priceVnd != null && v.priceVnd > 0)) e[`${k}.priceVnd`] = 'Nhập giá (> 0) hoặc chọn "Liên hệ báo giá"';
    if (v.compareAtPriceVnd != null && !(v.priceVnd != null && v.compareAtPriceVnd > v.priceVnd)) e[`${k}.compareAtPriceVnd`] = 'Giá gốc phải lớn hơn giá bán';
    if (!rangeOk(v.fireRatingMinMinutes, v.fireRatingMaxMinutes)) e[`${k}.fireRatingMaxMinutes`] = 'EI tối đa phải ≥ tối thiểu';
    if (v.isDefault) defaults++;
  });
  if (defaults > 1) e['variants'] = 'Chỉ chọn 1 độ dày mặc định';

  const ext = EXTENSION_OF_PROFILE[specProfile];
  if (p.sip && ext !== 'sip') e['sip'] = 'Thông số SIP chỉ dùng cho loại Panel SIP';
  if (p.floor && ext !== 'floor') e['floor'] = 'Thông số sàn chỉ dùng cho loại Tấm sàn';
  if (p.decorative && ext !== 'decorative') e['decorative'] = 'Lớp hoàn thiện chỉ dùng cho loại Tấm trang trí';
  if (p.sip && !rangeOk(p.sip.coreThicknessMinMm, p.sip.coreThicknessMaxMm)) e['sip.coreThicknessMaxMm'] = 'Lõi tối đa phải ≥ tối thiểu';
  if (p.decorative) {
    const types = p.decorative.options.map((o) => o.finishType);
    if (new Set(types).size !== types.length) e['decorative.options'] = 'Mỗi loại hoàn thiện chỉ một lần';
  }
  return e;
}

export function emptyTranslationInput(): ProductTranslationInput {
  return {
    status: 'DRAFT',
    name: '',
    slug: null,
    tagline: null,
    summary: '',
    description: { type: 'doc', content: [{ type: 'paragraph' }] },
    highlights: [],
    advantages: [],
    faqs: [],
    coverAlt: '',
    seoTitle: null,
    seoDescription: null,
    focusKeyword: null,
    noindex: false,
  };
}

/** Form trống cho sản phẩm mới */
export function emptyProductInput(typeId = ''): ProductInput {
  return {
    typeId,
    isFeatured: false,
    translations: { vi: emptyTranslationInput(), en: null },
    technicalSpec: {
      standardSizes: [{ widthMm: 1220, lengthMm: 2440 }],
      edgeProfile: null,
      coreColor: null,
      surfaceFinish: null,
      densityMinKgM3: null,
      densityMaxKgM3: null,
      densityReductionPct: null,
      flexuralMinMpa: null,
      flexuralMaxMpa: null,
      flexuralCrossMinMpa: null,
      screwHoldingRating: null,
      reactionToFireClass: null,
      fireClassStandards: [],
      maxTemperatureC: null,
      thermalConductivityWmk: null,
      soundReductionMinDb: null,
      soundReductionMaxDb: null,
      waterAbsorptionMaxPct: null,
      thicknessSwellingMaxPct: null,
      moldResistant: null,
      crystalPhase: null,
      mgoContentMinPct: null,
      chlorideMaxPct: null,
      asbestosFree: null,
      formaldehydeMgL: null,
      vocLevel: null,
      greenCertifications: [],
      extraSpecs: [],
    },
    variants: [],
    sip: null,
    floor: null,
    decorative: null,
  };
}

/** Dòng độ dày mới (khổ chuẩn 1220×2440, liên hệ báo giá) */
export function emptyVariantInput(thicknessMm = 10): ProductVariantInput {
  return {
    id: null,
    sku: null,
    thicknessMm,
    widthMm: 1220,
    lengthMm: 2440,
    weightKg: null,
    densityKgM3: null,
    fireRatingMinMinutes: null,
    fireRatingMaxMinutes: null,
    fireRatingLabel: null,
    flexuralMinMpa: null,
    isPopular: false,
    isDefault: false,
    isActive: true,
    priceMode: 'CONTACT',
    priceVnd: null,
    compareAtPriceVnd: null,
    saleUnit: 'SHEET',
    priceValidUntil: null,
    stockStatus: 'IN_STOCK',
    leadTimeDays: null,
    minOrderQty: null,
    translations: {},
  };
}

/** Phần mở rộng trống theo mẫu form (khi đổi loại sản phẩm trong CMS) */
export function emptyExtensionFor(profile: ProductSpecProfile): Pick<ProductInput, 'sip' | 'floor' | 'decorative'> {
  const ext = EXTENSION_OF_PROFILE[profile];
  return {
    sip:
      ext === 'sip'
        ? { coreMaterials: [], coreThicknessMinMm: null, coreThicknessMaxMm: null, facingThicknessesMm: [], maxWidthMm: null, maxLengthMm: null, loadBearing: null }
        : null,
    floor: ext === 'floor' ? { edgeProfiles: [], floorSizes: [], suitableFloorings: [], moistureResistantFloor: null, sandedSurface: null } : null,
    decorative: ext === 'decorative' ? { customPrintSupported: false, options: [] } : null,
  };
}

// ─── AI dịch tự động (Gemini) ────────────────────────────────────────────────

/**
 * Sự kiện tiến trình AI dịch sản phẩm (luồng NDJSON: mỗi dòng một JSON)
 * prepare -> progress (sau mỗi lô Gemini) -> assemble -> result | error
 */
export type ProductAiDraftEvent =
  /** Đã đọc dữ liệu: số ô cần dịch (tiêu đề, tóm tắt, SEO, RichText, highlights, FAQ) và tổng ký tự */
  | { type: 'prepare'; fields: number; chars: number; blocks: number; images: number }
  /** done/total ô đã có bản dịch, batchesDone/batchesTotal lô gọi Gemini */
  | { type: 'progress'; done: number; total: number; cached: number; batchesDone: number; batchesTotal: number }
  /** Đang ghép bản dịch vào cấu trúc RichDoc, mảng danh sách và sinh slug tiếng Anh */
  | { type: 'assemble' }
  | { type: 'result'; draft: ProductAiDraft }
  | { type: 'error'; status: number; message: string };

/** Bản nháp tiếng Anh do AI dịch từ bản tiếng Việt (chưa lưu) */
export interface ProductAiDraft extends ProductTranslationInput {
  origin: 'AI';
  /** Số khối phải bỏ định dạng vì AI trả thẻ sai — CMS nhắc kiểm tra lại */
  fallbackBlocks: number;
  sourceUpdatedAt?: string;
}

export interface ProductAiDraftRequest {
  /** Bản tiếng Việt gửi từ form client (nếu có, ưu tiên dịch bản này thay vì đọc DB) */
  sourceVi?: ProductTranslationInput;
  /** Slug tiếng Anh hiện tại (nếu có thì giữ nguyên để không đổi URL) */
  currentEnSlug?: string | null;
}
