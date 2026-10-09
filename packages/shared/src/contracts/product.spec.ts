import { describe, expect, it } from 'vitest';
import {
  SCHEMA_AVAILABILITY,
  STOCK_STATUSES,
  certificateStatus,
  compareProducts,
  discountPercent,
  emptyExtensionFor,
  emptyProductInput,
  emptyVariantInput,
  estimateSheetWeightKg,
  formatFireRating,
  formatRange,
  hasPublicPrice,
  isCorrosionProof,
  isReservedProductSlug,
  meetsTargetEi,
  priceRange,
  productInputErrors,
  productStockStatus,
  SPEC_OPTION_GROUPS,
  SPEC_OPTION_GROUP_LABEL,
  isValidSpecOptionCode,
  optionLabel,
  specOptionCodeFrom,
  specOptionCodesOf,
  toSpecView,
  weightMismatch,
  type TechnicalSpecRow,
  type VariantOffer,
  type VariantSpec,
} from './product.js';

// Số liệu thật từ docs/catalog-mgo (01_ve_remak_fireoff_mgo.md, 03_3_tam_san_mgo_cha_nham.md)
const STANDARD_TDS: TechnicalSpecRow = {
  standardSizes: [{ widthMm: 1220, lengthMm: 2440 }],
  edgeProfile: 'SQUARE',
  coreColor: 'OFF_WHITE',
  surfaceFinish: 'SMOOTH',
  densityMinKgM3: 950,
  densityMaxKgM3: 1150,
  densityReductionPct: null,
  flexuralMinMpa: 15,
  flexuralMaxMpa: 25,
  flexuralCrossMinMpa: 10,
  screwHoldingRating: 'EXCELLENT',
  reactionToFireClass: 'A1',
  fireClassStandards: ['ASTM E84', 'EN 13501-1', 'UL 055'],
  maxTemperatureC: 2852,
  thermalConductivityWmk: 0.169,
  soundReductionMinDb: 35,
  soundReductionMaxDb: 52,
  waterAbsorptionMaxPct: 15,
  thicknessSwellingMaxPct: 0.08,
  moldResistant: true,
  crystalPhase: 'PHASE_517',
  mgoContentMinPct: 70,
  chlorideMaxPct: null,
  asbestosFree: true,
  formaldehydeMgL: 0,
  vocLevel: 'VERY_LOW',
  greenCertifications: ['LEED', 'GREEN STAR'],
};
const FLOOR_TDS: TechnicalSpecRow = { ...STANDARD_TDS, densityMinKgM3: 1200, densityMaxKgM3: 1250, flexuralMinMpa: 25, flexuralMaxMpa: null, chlorideMaxPct: 0.01 };

const variant = (t: number, kg: number | null, eiMin: number | null, eiMax: number | null, extra: Partial<VariantSpec> = {}): VariantSpec => ({
  thicknessMm: t,
  widthMm: 1220,
  lengthMm: 2440,
  weightKg: kg,
  densityKgM3: null,
  fireRatingMinMinutes: eiMin,
  fireRatingMaxMinutes: eiMax,
  flexuralMinMpa: null,
  ...extra,
});
const STANDARD_VARIANTS = [variant(5, 19, 30, 30), variant(8, 28, 45, 60), variant(12, 42, 120, 150), variant(18, 62, 180, 180, { isActive: false })];

describe('toSpecView — 5 sub-model, không bịa dữ liệu', () => {
  it('gom đúng nhóm; EI cao nhất suy ra từ độ dày đang bán', () => {
    const v = toSpecView(STANDARD_TDS, STANDARD_VARIANTS);
    expect(v.physical.edgeProfile).toBe('SQUARE');
    expect(v.mechanical.densityMinKgM3).toBe(950);
    expect(v.thermalFire.maxTemperatureC).toBe(2852);
    expect(v.thermalFire.maxFireRatingMinutes).toBe(150); // 18mm đang ẩn -> không tính
    expect(v.acousticMoisture.soundReductionMaxDb).toBe(52);
    expect(v.chemistrySafety.crystalPhase).toBe('PHASE_517');
    expect(v.extension).toBeNull();
  });

  it('chưa có độ dày nào thử nghiệm -> EI null (không gán mặc định 60)', () => {
    expect(toSpecView(STANDARD_TDS, [variant(10, 35, null, null)]).thermalFire.maxFireRatingMinutes).toBeNull();
  });
});

describe('hiển thị khoảng số', () => {
  it('khoảng / chặn dưới / chặn trên / bằng nhau / thiếu', () => {
    expect(formatRange(950, 1150, 'kg/m³')).toBe('950 – 1.150 kg/m³');
    expect(formatRange(25, null, 'MPa')).toBe('≥ 25 MPa');
    expect(formatRange(null, 15, '%', 'vi', { strictMax: true })).toBe('< 15 %');
    expect(formatRange(0.169, 0.169, 'W/(m·K)')).toBe('0,169 W/(m·K)');
    expect(formatRange(1200, 1250, 'kg/m³', 'en')).toBe('1,200 – 1,250 kg/m³');
    expect(formatRange(null, null, 'MPa')).toBeNull();
  });

  it('nhãn EI', () => {
    expect(formatFireRating(45, 60)).toBe('EI 45 – EI 60');
    expect(formatFireRating(180, 180)).toBe('EI 180');
    expect(formatFireRating(null, null)).toBeNull();
  });

  it('nhãn danh mục thông số: mã chưa có nhãn hiện chính mã', () => {
    const labels = { CRYSTAL_PHASE: { PHASE_517: 'Pha tinh thể 517' } };
    expect(optionLabel(labels, 'CRYSTAL_PHASE', 'PHASE_517')).toBe('Pha tinh thể 517');
    expect(optionLabel(labels, 'CRYSTAL_PHASE', 'NEW_PHASE')).toBe('NEW_PHASE');
    expect(optionLabel(labels, 'VOC_LEVEL', 'LOW')).toBe('LOW');
  });
});

describe('danh mục thông số — mã giá trị', () => {
  it('sinh mã từ nhãn tiếng Việt', () => {
    expect(specOptionCodeFrom('Hèm âm dương')).toBe('HEM_AM_DUONG');
    expect(specOptionCodeFrom('  Xám bê-tông 2 ')).toBe('XAM_BE_TONG_2');
    expect(specOptionCodeFrom('Đỏ')).toBe('DO');
  });

  it('kiểm mã hợp lệ', () => {
    expect(isValidSpecOptionCode('PHASE_517')).toBe(true);
    expect(isValidSpecOptionCode('phase')).toBe(false);
    expect(isValidSpecOptionCode('A__B')).toBe(false);
    expect(isValidSpecOptionCode('')).toBe(false);
    expect(isValidSpecOptionCode('A'.repeat(41))).toBe(false);
  });

  it('liệt kê mọi mã form đang dùng kèm nhóm + đường dẫn lỗi', () => {
    const p = emptyProductInput('t1');
    p.technicalSpec.crystalPhase = 'PHASE_517';
    p.floor = { edgeProfiles: ['SHIPLAP'], floorSizes: [], suitableFloorings: ['WOOD'], moistureResistantFloor: null, sandedSurface: null };
    p.decorative = {
      customPrintSupported: false,
      options: [{ finishType: 'HPL', scratchResistance: 'HIGH', translations: {} }],
    };
    expect(specOptionCodesOf(p)).toEqual([
      { group: 'CRYSTAL_PHASE', path: 'technicalSpec.crystalPhase', code: 'PHASE_517' },
      { group: 'EDGE_PROFILE', path: 'floor.edgeProfiles', code: 'SHIPLAP' },
      { group: 'SUITABLE_FLOORING', path: 'floor.suitableFloorings', code: 'WOOD' },
      { group: 'DECORATIVE_FINISH', path: 'decorative.options.0.finishType', code: 'HPL' },
      { group: 'SCRATCH_RESISTANCE', path: 'decorative.options.0.scratchResistance', code: 'HIGH' },
    ]);
  });

  it('đủ 11 nhóm, mỗi nhóm có tên tiếng Việt', () => {
    expect(SPEC_OPTION_GROUPS).toHaveLength(11);
    for (const g of SPEC_OPTION_GROUPS) expect(SPEC_OPTION_GROUP_LABEL[g].name).toBeTruthy();
  });
});

describe('so sánh (thay method của class)', () => {
  const standard = toSpecView(STANDARD_TDS, STANDARD_VARIANTS);
  const floor = toSpecView(FLOOR_TDS, [variant(18, null, 180, 180)]);

  it('tấm sàn chịu uốn tốt hơn, nặng hơn, chịu lửa lâu hơn', () => {
    expect(compareProducts(floor, standard)).toEqual({
      fireRatingDiffMinutes: 30,
      flexural: 'stronger',
      soundDiffDb: 0,
      isLighter: false,
      corrosionSafety: { a: true, b: null }, // tấm tiêu chuẩn chưa có số clorua -> null, không đoán
    });
  });

  it('đạt EI mục tiêu', () => {
    expect(meetsTargetEi(STANDARD_VARIANTS, 120)).toBe(true);
    expect(meetsTargetEi(STANDARD_VARIANTS, 180)).toBe(false); // 18mm đang ẩn
    expect(meetsTargetEi([variant(10, 35, null, null)], 60)).toBeNull();
  });

  it('chống gỉ theo hàm lượng clorua', () => {
    expect(isCorrosionProof(floor.chemistrySafety)).toBe(true);
    expect(isCorrosionProof({ ...floor.chemistrySafety, chlorideMaxPct: 0.04 })).toBe(false);
  });
});

describe('giá', () => {
  const o = (p: Partial<VariantOffer>): VariantOffer => ({ priceMode: 'FIXED', priceVnd: 195_000, compareAtPriceVnd: null, stockStatus: 'IN_STOCK', ...p });

  it('giá công khai + khoảng giá + % giảm', () => {
    expect(hasPublicPrice(o({ priceMode: 'CONTACT', priceVnd: null }))).toBe(false);
    expect(hasPublicPrice(o({ stockStatus: 'OUT_OF_STOCK' }))).toBe(true);
    expect(hasPublicPrice(o({ stockStatus: 'DISCONTINUED' }))).toBe(false);
    expect(priceRange([o({ priceVnd: 125_000 }), o({}), o({ priceMode: 'CONTACT', priceVnd: null })])).toEqual({ low: 125_000, high: 195_000, count: 2 });
    expect(priceRange([o({ priceMode: 'CONTACT', priceVnd: null })])).toBeNull();
    expect(discountPercent(o({ compareAtPriceVnd: 230_000 }))).toBe(15);
  });

  it('tình trạng chung + schema.org', () => {
    expect(productStockStatus([o({ stockStatus: 'OUT_OF_STOCK' }), o({ stockStatus: 'PRE_ORDER' })])).toBe('PRE_ORDER');
    expect(productStockStatus([])).toBe('OUT_OF_STOCK');
    for (const s of STOCK_STATUSES) expect(SCHEMA_AVAILABILITY[s]).toMatch(/^https:\/\/schema\.org\//);
  });
});

describe('kiểm tra số liệu catalog', () => {
  it('khối lượng ước tính tấm 1220×2440', () => {
    expect(estimateSheetWeightKg(8, 1220, 2440, 1050)).toBe(25);
    expect(estimateSheetWeightKg(8, 1220, 2440, null)).toBeNull();
  });

  it('phát hiện mâu thuẫn của catalog: 5mm ghi 19 kg nhưng tỷ trọng 950–1.150 chỉ ra ~15,6 kg', () => {
    const r = weightMismatch(variant(5, 19, 30, 30), toSpecView(STANDARD_TDS, []).mechanical);
    expect(r?.expectedKg).toBe(15.6);
    expect(r!.ratio).toBeGreaterThan(0.15);
    // 12mm 42 kg khớp tỷ trọng (~37,5 kg, lệch ~12%) -> không cảnh báo
    expect(weightMismatch(variant(12, 42, 120, 150), toSpecView(STANDARD_TDS, []).mechanical)).toBeNull();
  });
});

describe('chứng chỉ', () => {
  it('còn hạn / sắp hết (≤ 60 ngày) / hết hạn / không thời hạn', () => {
    expect(certificateStatus('2027-06-01', '2026-10-08')).toBe('VALID');
    expect(certificateStatus('2026-11-30', '2026-10-08')).toBe('EXPIRING');
    expect(certificateStatus('2026-10-01', '2026-10-08')).toBe('EXPIRED');
    expect(certificateStatus(null, '2026-10-08')).toBe('NO_EXPIRY');
  });
});

describe('productInputErrors — kiểm lỗi form dùng chung api / CMS', () => {
  it('form trống: chỉ thiếu tên', () => {
    expect(productInputErrors(emptyProductInput('t1'), 'NONE')).toEqual({ 'translations.vi.name': 'Nhập tên sản phẩm tiếng Việt' });
  });

  it('chưa chọn loại sản phẩm', () => {
    expect(productInputErrors(emptyProductInput(), 'NONE').typeId).toBe('Chọn loại sản phẩm');
  });

  it('bắt lỗi giá / khoảng / trùng / mặc định / sai phần mở rộng', () => {
    const p = emptyProductInput('t1');
    p.translations.vi.name = 'Tấm';
    p.translations.vi.status = 'PUBLISHED';
    p.technicalSpec.densityMinKgM3 = 1150;
    p.technicalSpec.densityMaxKgM3 = 950;
    p.variants = [
      { ...emptyVariantInput(8), priceMode: 'FIXED', isDefault: true },
      { ...emptyVariantInput(8), priceVnd: 200, compareAtPriceVnd: 100, isDefault: true, fireRatingMinMinutes: 90, fireRatingMaxMinutes: 60 },
    ];
    p.floor = emptyExtensionFor('FLOOR').floor;
    expect(Object.keys(productInputErrors(p, 'NONE')).sort()).toEqual([
      'floor',
      'technicalSpec.densityMaxKgM3',
      'translations.vi.summary',
      'variants',
      'variants.0.priceVnd',
      'variants.1.compareAtPriceVnd',
      'variants.1.fireRatingMaxMinutes',
      'variants.1.thicknessMm',
    ]);
  });

  it('bản tiếng Anh không xuất bản trước bản tiếng Việt', () => {
    const p = emptyProductInput('t1');
    p.translations.vi.name = 'Tấm';
    p.translations.en = { ...p.translations.vi, name: 'Board', summary: 'x', status: 'PUBLISHED' };
    expect(productInputErrors(p, 'NONE')['translations.en.status']).toBe('Xuất bản bản tiếng Việt trước');
  });

  it('phần mở rộng trống đúng mẫu form', () => {
    expect(emptyExtensionFor('SIP').sip).not.toBeNull();
    expect(emptyExtensionFor('NONE')).toEqual({ sip: null, floor: null, decorative: null });
  });

  it('khối SIP chỉ hợp lệ với mẫu form SIP', () => {
    const p = { ...emptyProductInput('t1'), ...emptyExtensionFor('SIP') };
    p.translations.vi.name = 'Panel';
    expect(productInputErrors(p, 'SIP').sip).toBeUndefined();
    expect(productInputErrors(p, 'NONE').sip).toBe('Thông số SIP chỉ dùng cho loại Panel SIP');
  });
});

describe('isReservedProductSlug — slug dành cho trang loại sản phẩm', () => {
  it('chặn đoạn đường dẫn trang loại theo đúng ngôn ngữ', () => {
    expect(isReservedProductSlug('vi', 'loai')).toBe(true);
    expect(isReservedProductSlug('en', 'type')).toBe(true);
    expect(isReservedProductSlug('vi', 'type')).toBe(false);
    expect(isReservedProductSlug('vi', 'loai-tam')).toBe(false);
  });
});
