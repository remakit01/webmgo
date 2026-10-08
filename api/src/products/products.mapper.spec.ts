import { describe, expect, it } from 'vitest';
import { Prisma } from '../generated/prisma/client.js';
import { toDetailPublic, toListItemCms, toListItemPublic, toProductCms } from './products.mapper.js';

const D = (n: number) => new Prisma.Decimal(n);
const NOW = new Date('2026-10-08T03:00:00Z');

const tr = (locale: 'vi' | 'en', over: Record<string, unknown> = {}) => ({
  productId: 'p1',
  locale,
  status: 'PUBLISHED',
  publishedAt: new Date('2026-10-01T00:00:00Z'),
  name: locale === 'vi' ? 'Tấm chống cháy' : 'Fire board',
  slug: locale === 'vi' ? 'tam-chong-chay' : 'fire-board',
  tagline: null,
  summary: 'Tóm tắt',
  description: { type: 'doc', content: [] },
  highlights: [],
  advantages: [{ title: 'A', desc: 'B' }],
  faqs: [],
  coverAlt: '',
  galleryAlts: [],
  focusKeyword: null,
  seoTitle: null,
  seoDescription: null,
  ogImageUrl: null,
  noindex: false,
  origin: 'HUMAN',
  contentUpdatedAt: NOW,
  sourceUpdatedAt: null,
  createdAt: NOW,
  updatedAt: new Date('2026-10-05T00:00:00Z'),
  ...over,
});

const variant = (id: string, t: number, over: Record<string, unknown> = {}) => ({
  id,
  productId: 'p1',
  sku: null,
  thicknessMm: D(t),
  widthMm: 1220,
  lengthMm: 2440,
  weightKg: D(28),
  densityKgM3: null,
  fireRatingMinMinutes: 45,
  fireRatingMaxMinutes: 60,
  fireRatingLabel: 'EI 45 – EI 60',
  flexuralMinMpa: D(18),
  isPopular: false,
  isDefault: false,
  isActive: true,
  sortOrder: 0,
  priceMode: 'CONTACT',
  priceVnd: null,
  compareAtPriceVnd: null,
  saleUnit: 'SHEET',
  priceValidUntil: null,
  stockStatus: 'IN_STOCK',
  leadTimeDays: null,
  minOrderQty: null,
  createdAt: NOW,
  updatedAt: NOW,
  translations: [],
  certificates: [],
  ...over,
});

const cert = (id: string, expiry: string | null, isPublic = true) => ({
  id,
  certificateNo: 'KĐ-01',
  issuingBody: 'IBST',
  testStandard: 'QCVN 06:2022/BXD',
  result: 'EI 90',
  issueDate: new Date('2025-01-01'),
  expiryDate: expiry ? new Date(expiry) : null,
  fileKey: null,
  fileUrl: 'https://cdn/x.pdf',
  isPublic,
  sortOrder: 0,
  createdAt: NOW,
  updatedAt: NOW,
  translations: [{ certificateId: id, locale: 'vi', name: `Chứng chỉ ${id}`, description: null }],
});

const productType = (id: string, specProfile: string, en = true) => ({
  id,
  specProfile,
  sortOrder: 0,
  isActive: true,
  createdAt: NOW,
  updatedAt: NOW,
  translations: [
    { typeId: id, locale: 'vi', name: `Loại ${id}`, slug: `loai-${id}`, description: null, seoTitle: null, seoDescription: null },
    ...(en ? [{ typeId: id, locale: 'en', name: `Type ${id}`, slug: `type-${id}`, description: null, seoTitle: null, seoDescription: null }] : []),
  ],
});

function product(over: Record<string, unknown> = {}) {
  return {
    id: 'p1',
    typeId: 'pt_standard',
    type: productType('pt_standard', 'NONE'),
    coverImageKey: null,
    coverImageUrl: null,
    gallery: [],
    isFeatured: true,
    sortOrder: 0,
    createdAt: NOW,
    updatedAt: new Date('2026-10-02T00:00:00Z'),
    deletedAt: null,
    translations: [tr('vi'), tr('en', { status: 'DRAFT' })],
    technicalSpec: null,
    sipSpec: null,
    floorSpec: { productId: 'p1', edgeProfiles: ['TONGUE_GROOVE'], floorSizes: [], suitableFloorings: [], moistureResistantFloor: true, sandedSurface: true, updatedAt: NOW },
    decorativeSpec: null,
    decorativeOptions: [],
    certificates: [],
    variants: [
      variant('v8', 8),
      variant('v12', 12, { priceMode: 'FIXED', priceVnd: 295_000, compareAtPriceVnd: 345_000, fireRatingMinMinutes: 120, fireRatingMaxMinutes: 150, priceValidUntil: new Date('2026-12-31') }),
    ],
    ...over,
  } as never;
}

describe('products.mapper — danh sách public', () => {
  it('độ dày, dải EI, khoảng giá chỉ từ quy cách có giá công khai, hreflang chỉ bản đã xuất bản', () => {
    const p = product();
    const item = toListItemPublic(p, (p as { translations: unknown[] }).translations[0] as never, NOW);
    expect(item.thicknessesMm).toEqual([8, 12]);
    expect(item.fireRating).toEqual({ min: 45, max: 150 });
    expect(item.priceRange).toEqual({ low: 295_000, high: 295_000, count: 1 });
    expect(item.alternates).toEqual({ vi: 'tam-chong-chay' }); // bản EN còn nháp -> không có
  });

  it('loại sản phẩm theo ngôn ngữ đang xem; thiếu bản dịch thì dùng tiếng Việt', () => {
    const p = product();
    expect(toListItemPublic(p, tr('en') as never, NOW).type).toEqual({ id: 'pt_standard', specProfile: 'NONE', name: 'Type pt_standard', slug: 'type-pt_standard' });
    const viOnly = product({ type: productType('pt_custom', 'NONE', false) });
    expect(toListItemPublic(viOnly, tr('en') as never, NOW).type.name).toBe('Loại pt_custom');
  });

  it('loại không có trang ở ngôn ngữ đang xem (chưa dịch / đang ẩn) -> slug rỗng, web không đặt link', () => {
    const viOnly = product({ type: productType('pt_custom', 'NONE', false) });
    expect(toListItemPublic(viOnly, tr('en') as never, NOW).type.slug).toBe('');
    const hidden = product({ type: { ...productType('pt_custom', 'NONE'), isActive: false } });
    expect(toListItemPublic(hidden, tr('vi') as never, NOW).type.slug).toBe('');
  });
});

describe('products.mapper — chi tiết public', () => {
  it('liên hệ báo giá: không lộ giá; có giá: kèm % giảm + hạn giá', () => {
    const p = product({ variants: [variant('v8', 8, { priceVnd: 999 }), variant('v12', 12, { priceMode: 'FIXED', priceVnd: 295_000, compareAtPriceVnd: 345_000, priceValidUntil: new Date('2026-12-31') })] });
    const d = toDetailPublic(p, (p as { translations: unknown[] }).translations[0] as never, 'vi', NOW);
    expect(d.variants[0]).toMatchObject({ label: 'Tấm 8mm', priceMode: 'CONTACT', priceVnd: null, areaM2: 2.977, weightKg: 28 });
    expect(d.variants[1]).toMatchObject({ priceVnd: 295_000, compareAtPriceVnd: 345_000, discountPercent: 14, priceValidUntil: '2026-12-31' });
  });

  it('nhãn quy cách tiếng Anh tự sinh khi chưa đặt tên', () => {
    const p = product();
    const d = toDetailPublic(p, tr('en') as never, 'en', NOW);
    expect(d.variants[0].label).toBe('8mm board');
  });

  it('chứng chỉ: chỉ công khai + còn hạn; chứng chỉ riêng độ dày ghi rõ độ dày', () => {
    const p = product({
      certificates: [
        { productId: 'p1', certificateId: 'c-ok', sortOrder: 0, certificate: cert('c-ok', '2027-06-01') },
        { productId: 'p1', certificateId: 'c-exp', sortOrder: 1, certificate: cert('c-exp', '2026-01-01') },
        { productId: 'p1', certificateId: 'c-hidden', sortOrder: 2, certificate: cert('c-hidden', null, false) },
      ],
      variants: [variant('v12', 12, { certificates: [{ variantId: 'v12', certificateId: 'c-12', certificate: cert('c-12', null) }] })],
    });
    const d = toDetailPublic(p, (p as { translations: unknown[] }).translations[0] as never, 'vi', NOW);
    expect(d.certificates.map((c) => [c.id, c.thicknessesMm])).toEqual([
      ['c-ok', []],
      ['c-12', [12]],
    ]);
  });

  it('phần mở rộng theo đúng loại; SEO lấy mặc định từ tên / tóm tắt', () => {
    const floor = product({ typeId: 'pt_floor', type: productType('pt_floor', 'FLOOR'), technicalSpec: { productId: 'p1', standardSizes: [], edgeProfile: null, coreColor: null, surfaceFinish: null, densityMinKgM3: 1200, densityMaxKgM3: 1250, densityReductionPct: null, flexuralMinMpa: D(25), flexuralMaxMpa: null, flexuralCrossMinMpa: null, screwHoldingRating: null, reactionToFireClass: 'A1', fireClassStandards: [], maxTemperatureC: null, thermalConductivityWmk: null, soundReductionMinDb: null, soundReductionMaxDb: null, waterAbsorptionMaxPct: null, thicknessSwellingMaxPct: null, moldResistant: null, crystalPhase: null, mgoContentMinPct: null, chlorideMaxPct: null, asbestosFree: true, formaldehydeMgL: null, vocLevel: null, greenCertifications: [], extraSpecs: [], updatedAt: NOW } });
    const d = toDetailPublic(floor, (floor as { translations: unknown[] }).translations[0] as never, 'vi', NOW);
    expect(d.spec?.extension).toMatchObject({ type: 'FLOOR', edgeProfiles: ['TONGUE_GROOVE'] });
    expect(d.spec?.mechanical.flexuralMinMpa).toBe(25);
    expect(d.spec?.thermalFire.maxTemperatureC).toBeNull(); // không bịa
    expect(d.seo).toEqual({ title: 'Tấm chống cháy', description: 'Tóm tắt', ogImageUrl: null, noindex: false });
    // STANDARD có floorSpec "lạc" -> không trả phần mở rộng sai loại
    const std = product();
    expect(toDetailPublic(std, (std as { translations: unknown[] }).translations[0] as never, 'vi', NOW).spec).toBeNull();
  });
});

describe('products.mapper — CMS', () => {
  it('trạng thái từng ngôn ngữ + số quy cách', () => {
    const c = toListItemCms(product());
    expect(c.variantCount).toBe(2);
    expect(c.type).toEqual({ id: 'pt_standard', name: 'Loại pt_standard', specProfile: 'NONE' });
    expect(c.locales).toEqual({ vi: { name: 'Tấm chống cháy', slug: 'tam-chong-chay', status: 'PUBLISHED' }, en: { name: 'Fire board', slug: 'fire-board', status: 'DRAFT' } });
  });

  it('form sửa: khối không khớp mẫu của loại thì ẩn, nhưng vẫn trả ở storedExtensions để chọn lại loại không mất dữ liệu', () => {
    const p = product({ technicalSpec: null }); // loại NONE nhưng còn floorSpec cũ trong DB
    const cms = toProductCms(p);
    expect(cms.floor).toBeNull();
    expect(cms.storedExtensions.floor).toMatchObject({ edgeProfiles: ['TONGUE_GROOVE'], sandedSurface: true });
    expect(cms.storedExtensions.sip).toBeNull();
  });
});
