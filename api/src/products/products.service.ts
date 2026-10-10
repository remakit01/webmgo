import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { LOCALES, type Locale } from '@remak/shared/locale';
import { validateRichDoc } from '@remak/shared/rich-content';
import {
  EXTENSION_OF_PROFILE,
  isReservedProductSlug,
  productInputErrors,
  specOptionCodesOf,
  type ProductCms,
  type ProductInput,
  type ProductListItemCms,
  type ProductSpecProfile,
} from '@remak/shared/contracts/product';
import { PRODUCT_LIST_VIEW_DAYS } from '@remak/shared/contracts/product-stats';
import { PrismaService } from '../prisma/prisma.service.js';
import { ContentCacheService } from '../content-cache/content-cache.service.js';
import { MediaService } from '../storage/media.service.js';
import { SlugRedirectService } from '../slug-redirect/slug-redirect.service.js';
import { assertUpdated, assertVersion } from '../common/versioning.js';
import { resolveUniqueSlug } from '../common/unique-slug.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { ProductInputDto } from './dto/product-input.dto.js';
import { productDetailInclude, productListInclude, toListItemCms, toProductCms } from './products.mapper.js';
import { PRODUCTS_COVER_PREFIX, PRODUCTS_INVALIDATE, PRODUCT_SLUG_ENTITY } from './products.constants.js';
import { SpecOptionsService } from './spec-options.service.js';
import { ProductStatsService } from './product-stats.service.js';

type Tx = Prisma.TransactionClient;
const LIVE = { deletedAt: null } as const;

const json = (v: unknown) => v as Prisma.InputJsonValue;

/**
 * CMS Sản phẩm. Một lần "Lưu" ghi toàn bộ form (gốc + bản dịch + thông số + độ dày + phần mở rộng) trong 1 transaction,
 * khoá lạc quan bằng If-Match (updatedAt của bản ghi gốc). Ghi xong xoá cache + revalidate trang web.
 */
@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: ContentCacheService,
    private readonly media: MediaService,
    private readonly slugRedirects: SlugRedirectService,
    private readonly specOptions: SpecOptionsService,
    private readonly stats: ProductStatsService,
  ) {}

  // ── Đọc ─────────────────────────────────────────────────────────────────

  async list(opts: { trash?: boolean } = {}): Promise<ProductListItemCms[]> {
    const where = opts.trash ? { deletedAt: { not: null } } : LIVE;
    const orderBy = opts.trash
      ? [{ deletedAt: 'desc' as const }, { id: 'asc' as const }]
      : [{ sortOrder: 'asc' as const }, { id: 'asc' as const }];
    const rows = await this.prisma.product.findMany({
      where,
      orderBy,
      include: productListInclude,
    });
    const recent = await this.stats.recentViews(
      rows.map((r) => r.id),
      PRODUCT_LIST_VIEW_DAYS,
    );
    return rows.map((r) => toListItemCms(r, recent.get(r.id) ?? 0));
  }

  async get(id: string): Promise<ProductCms> {
    const p = await this.prisma.product.findFirst({
      where: { id, ...LIVE },
      include: { ...productDetailInclude, variants: { ...productDetailInclude.variants, where: undefined } },
    });
    if (!p) throw new NotFoundException('Không tìm thấy sản phẩm');
    return toProductCms(p);
  }

  // ── Ghi ─────────────────────────────────────────────────────────────────

  async create(dto: ProductInputDto): Promise<ProductCms> {
    const profile = await this.assertValid(dto);
    const last = await this.prisma.product.aggregate({ where: LIVE, _max: { sortOrder: true } });
    const id = await this.prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: { typeId: dto.typeId, isFeatured: dto.isFeatured, sortOrder: (last._max.sortOrder ?? -1) + 1 },
      });
      await this.writeAll(tx, p.id, dto, profile, new Map());
      return p.id;
    });
    await this.cache.invalidate(PRODUCTS_INVALIDATE);
    return this.get(id);
  }

  async update(id: string, dto: ProductInputDto, ifMatch: string | undefined): Promise<ProductCms> {
    const profile = await this.assertValid(dto);
    const existing = await this.prisma.product.findFirst({ where: { id, ...LIVE }, include: { translations: true } });
    if (!existing) throw new NotFoundException('Không tìm thấy sản phẩm');
    assertVersion(ifMatch, existing.updatedAt);
    await this.prisma.$transaction(async (tx) => {
      // Khoá lạc quan: chỉ ghi khi chưa ai lưu xen vào
      const { count } = await tx.product.updateMany({
        where: { id, updatedAt: existing.updatedAt, ...LIVE },
        data: { typeId: dto.typeId, isFeatured: dto.isFeatured, updatedAt: new Date() },
      });
      assertUpdated(count);
      await this.writeAll(tx, id, dto, profile, new Map(existing.translations.map((t) => [t.locale, t])));
    });
    await this.cache.invalidate(PRODUCTS_INVALIDATE);
    return this.get(id);
  }

  /** Xoá mềm (chuyển vào thùng rác, ẩn khỏi web, giữ dữ liệu) */
  async remove(id: string) {
    const { count } = await this.prisma.product.updateMany({ where: { id, ...LIVE }, data: { deletedAt: new Date() } });
    if (!count) throw new NotFoundException('Không tìm thấy sản phẩm');
    await this.cache.invalidate(PRODUCTS_INVALIDATE);
    return { success: true };
  }

  /** Khôi phục từ thùng rác */
  async restore(id: string) {
    const p = await this.prisma.product.findFirst({ where: { id, deletedAt: { not: null } } });
    if (!p) throw new NotFoundException('Không tìm thấy sản phẩm trong thùng rác');
    await this.prisma.product.update({ where: { id }, data: { deletedAt: null } });
    await this.cache.invalidate(PRODUCTS_INVALIDATE);
    return { success: true };
  }

  /** Xoá vĩnh viễn (chỉ ADMIN, sản phẩm phải trong thùng rác): DB + redirect slug + ảnh đại diện */
  async purge(id: string) {
    const p = await this.prisma.product.findFirst({ where: { id, deletedAt: { not: null } } });
    if (!p) throw new NotFoundException('Không tìm thấy sản phẩm trong thùng rác');
    await this.prisma.$transaction(async (tx) => {
      await this.slugRedirects.removeFor(PRODUCT_SLUG_ENTITY, id, tx);
      await tx.product.delete({ where: { id } });
    });
    if (p.coverImageKey) await this.media.removeImage(p.coverImageKey);
    await this.cache.invalidate(PRODUCTS_INVALIDATE);
    return { success: true };
  }

  /** Sắp lại thứ tự: SQL thô, KHÔNG đổi updated_at (form đang mở không bị báo xung đột oan) */
  async reorder(ids: string[]): Promise<ProductListItemCms[]> {
    const existing = await this.prisma.product.findMany({ where: LIVE, select: { id: true } });
    const known = new Set(existing.map((r) => r.id));
    if (ids.length !== known.size || ids.some((x) => !known.has(x))) {
      throw new ConflictException('Danh sách sản phẩm vừa thay đổi — tải lại trang rồi sắp lại');
    }
    await this.prisma.$executeRaw`
      UPDATE products AS p SET sort_order = o.ord - 1
      FROM unnest(${ids}::text[]) WITH ORDINALITY AS o(id, ord)
      WHERE p.id = o.id`;
    await this.cache.invalidate(PRODUCTS_INVALIDATE);
    return this.list();
  }

  async updateCover(id: string, file: Express.Multer.File | undefined, ifMatch: string | undefined): Promise<ProductCms> {
    if (!file) throw new BadRequestException('Thiếu file ảnh (field "image")');
    const p = await this.prisma.product.findFirst({ where: { id, ...LIVE } });
    if (!p) throw new NotFoundException('Không tìm thấy sản phẩm');
    assertVersion(ifMatch, p.updatedAt);
    const upload = await this.media.uploadImage(PRODUCTS_COVER_PREFIX, file.buffer);
    try {
      const { count } = await this.prisma.product.updateMany({
        where: { id, updatedAt: p.updatedAt, ...LIVE },
        data: { coverImageKey: upload.imageKey, coverImageUrl: upload.imageUrl },
      });
      assertUpdated(count);
    } catch (err) {
      await this.media.removeImage(upload.imageKey);
      throw err;
    }
    if (p.coverImageKey) await this.media.removeImage(p.coverImageKey);
    await this.cache.invalidate(PRODUCTS_INVALIDATE);
    return this.get(id);
  }

  // ── Nội bộ ──────────────────────────────────────────────────────────────

  /** Kiểm form; mẫu form thông số lấy theo loại đã chọn (loại là dữ liệu DB) */
  private async assertValid(dto: ProductInput): Promise<ProductSpecProfile> {
    const type = dto.typeId ? await this.prisma.productType.findUnique({ where: { id: dto.typeId }, select: { specProfile: true } }) : null;
    if (dto.typeId && !type) throw new BadRequestException('Loại sản phẩm không tồn tại');
    const profile = type?.specProfile ?? 'NONE';
    const errors = productInputErrors(dto, profile);
    for (const l of LOCALES) {
      const t = dto.translations[l];
      if (!t) continue;
      const r = validateRichDoc(t.description);
      if (!r.ok) errors[`translations.${l}.description`] = r.error;
      if (t.slug && isReservedProductSlug(l, t.slug)) {
        errors[`translations.${l}.slug`] = `Đường dẫn "${t.slug}" dành cho trang loại sản phẩm, hãy chọn đường dẫn khác`;
      }
    }
    // Mã thông số phải có trong danh mục (kể cả đang tắt — sản phẩm cũ vẫn lưu được)
    const codes = await this.specOptions.codesByGroup();
    for (const { group, path, code } of specOptionCodesOf(dto)) {
      if (!codes.get(group)?.has(code)) errors[path] ??= `Giá trị "${code}" không có trong danh mục thông số`;
    }
    if (Object.keys(errors).length) {
      throw new BadRequestException({ message: Object.values(errors)[0], errors });
    }
    return profile;
  }

  private async writeAll(
    tx: Tx,
    productId: string,
    dto: ProductInputDto,
    profile: ProductSpecProfile,
    oldTr: Map<Locale, { slug: string; status: string; publishedAt: Date | null }>,
  ) {
    await this.writeTranslations(tx, productId, dto, oldTr);
    const { extraSpecs, standardSizes, ...spec } = dto.technicalSpec;
    const specData = { ...spec, standardSizes: json(standardSizes), extraSpecs: json(extraSpecs) };
    await tx.productTechnicalSpec.upsert({ where: { productId }, create: { productId, ...specData }, update: specData });
    await this.writeVariants(tx, productId, dto);
    await this.writeExtensions(tx, productId, dto, profile);
  }

  private async writeTranslations(tx: Tx, productId: string, dto: ProductInputDto, oldTr: Map<Locale, { slug: string; status: string; publishedAt: Date | null }>) {
    const now = new Date();
    for (const locale of LOCALES) {
      const t = dto.translations[locale];
      const old = oldTr.get(locale);
      if (!t) {
        // Bỏ bản tiếng Anh: xoá bản dịch (tiếng Việt luôn bắt buộc ở DTO)
        if (old) await tx.productTranslation.delete({ where: { productId_locale: { productId, locale } } });
        continue;
      }
      const slug = await resolveUniqueSlug({
        explicit: t.slug,
        fromText: t.name,
        fallback: 'tam-mgo',
        // Slug sinh từ tên trùng đoạn đường dẫn trang loại (vd tên "Loại") -> coi như đã dùng, thêm hậu tố
        isTaken: async (s) =>
          isReservedProductSlug(locale, s) || (await tx.productTranslation.count({ where: { locale, slug: s, productId: { not: productId } } })) > 0,
      });
      // Slug mới chiếm slug cũ của sản phẩm khác -> bỏ redirect đó; slug đã xuất bản đổi -> ghi 301
      await this.slugRedirects.release(PRODUCT_SLUG_ENTITY, locale, slug, tx);
      if (old && old.status === 'PUBLISHED' && old.slug !== slug) {
        await this.slugRedirects.record(PRODUCT_SLUG_ENTITY, locale, old.slug, slug, productId, tx);
      }
      const data = {
        status: t.status,
        // Lần đầu xuất bản mới đặt ngày đăng; về nháp thì giữ ngày cũ (xuất bản lại không đổi)
        publishedAt: t.status === 'PUBLISHED' ? (old?.publishedAt ?? now) : (old?.publishedAt ?? null),
        name: t.name,
        slug,
        tagline: t.tagline,
        summary: t.summary,
        description: json(t.description),
        highlights: t.highlights,
        advantages: json(t.advantages),
        faqs: json(t.faqs),
        coverAlt: t.coverAlt,
        seoTitle: t.seoTitle,
        seoDescription: t.seoDescription,
        focusKeyword: t.focusKeyword,
        noindex: t.noindex,
        contentUpdatedAt: now,
      };
      await tx.productTranslation.upsert({
        where: { productId_locale: { productId, locale } },
        create: { productId, locale, ...data },
        update: data,
      });
    }
  }

  /** Độ dày: sửa theo id (giữ liên kết chứng chỉ / dự án), thêm dòng mới, xoá dòng không còn trong form */
  private async writeVariants(tx: Tx, productId: string, dto: ProductInputDto) {
    const current = await tx.productVariant.findMany({ where: { productId }, select: { id: true } });
    const currentIds = new Set(current.map((v) => v.id));
    const keep = new Set(dto.variants.map((v) => v.id).filter((x): x is string => !!x && currentIds.has(x)));
    await tx.productVariant.deleteMany({ where: { productId, id: { notIn: [...keep] } } });
    // Tránh vi phạm "≤ 1 mặc định" / "độ dày + khổ duy nhất" khi hoán đổi giữa các dòng trong cùng lần lưu
    if (keep.size) {
      await tx.productVariant.updateMany({ where: { productId }, data: { isDefault: false } });
      // Dời tạm khổ tấm của các dòng cũ (vẫn > 0, thoả CHECK) để không trùng unique với giá trị mới trong lúc ghi từng dòng
      await tx.$executeRaw`UPDATE product_variants SET width_mm = width_mm + 1000000 WHERE product_id = ${productId}`;
    }
    for (const [i, v] of dto.variants.entries()) {
      const data = {
        sku: v.sku,
        thicknessMm: v.thicknessMm,
        widthMm: v.widthMm,
        lengthMm: v.lengthMm,
        weightKg: v.weightKg,
        densityKgM3: v.densityKgM3,
        fireRatingMinMinutes: v.fireRatingMinMinutes,
        fireRatingMaxMinutes: v.fireRatingMaxMinutes,
        fireRatingLabel: v.fireRatingLabel,
        flexuralMinMpa: v.flexuralMinMpa,
        isPopular: v.isPopular,
        isDefault: v.isDefault,
        isActive: v.isActive,
        sortOrder: i,
        priceMode: v.priceMode,
        priceVnd: v.priceVnd,
        compareAtPriceVnd: v.compareAtPriceVnd,
        saleUnit: v.saleUnit,
        priceValidUntil: v.priceValidUntil ? new Date(`${v.priceValidUntil}T00:00:00Z`) : null,
        stockStatus: v.stockStatus,
        leadTimeDays: v.leadTimeDays,
        minOrderQty: v.minOrderQty,
      };
      const variantId =
        v.id && keep.has(v.id) ? (await tx.productVariant.update({ where: { id: v.id }, data })).id : (await tx.productVariant.create({ data: { productId, ...data } })).id;
      await tx.productVariantTranslation.deleteMany({ where: { variantId } });
      const rows = LOCALES.flatMap((locale) => {
        const t = v.translations[locale];
        return t && (t.label || t.recommendedUse) ? [{ variantId, locale, label: t.label, recommendedUse: t.recommendedUse }] : [];
      });
      if (rows.length) await tx.productVariantTranslation.createMany({ data: rows });
    }
  }

  /**
   * Phần mở rộng: chỉ ghi khối khớp mẫu thông số của loại hiện tại. Khối của mẫu khác GIỮ NGUYÊN trong DB
   * (web / CMS đã ẩn theo specProfile) — đổi mẫu của loại hay đổi loại rồi đổi lại không mất dữ liệu.
   */
  private async writeExtensions(tx: Tx, productId: string, dto: ProductInputDto, profile: ProductSpecProfile) {
    const ext = EXTENSION_OF_PROFILE[profile];
    if (ext === 'sip') {
      if (dto.sip) await tx.sipPanelSpec.upsert({ where: { productId }, create: { productId, ...dto.sip }, update: dto.sip });
      else await tx.sipPanelSpec.deleteMany({ where: { productId } });
    }

    if (ext === 'floor') {
      if (dto.floor) {
        const data = { ...dto.floor, floorSizes: json(dto.floor.floorSizes) };
        await tx.floorBoardSpec.upsert({ where: { productId }, create: { productId, ...data }, update: data });
      } else await tx.floorBoardSpec.deleteMany({ where: { productId } });
    }

    if (ext !== 'decorative') return;
    await tx.decorativeFinishOption.deleteMany({ where: { productId } });
    if (dto.decorative) {
      await tx.decorativeFinishSpec.upsert({
        where: { productId },
        create: { productId, customPrintSupported: dto.decorative.customPrintSupported },
        update: { customPrintSupported: dto.decorative.customPrintSupported },
      });
      for (const [i, o] of dto.decorative.options.entries()) {
        await tx.decorativeFinishOption.create({
          data: {
            productId,
            finishType: o.finishType,
            scratchResistance: o.scratchResistance,
            sortOrder: i,
            translations: {
              create: LOCALES.flatMap((locale) => {
                const t = o.translations[locale];
                return t ? [{ locale, name: t.name, description: t.description, patterns: t.patterns, suitableAreas: t.suitableAreas }] : [];
              }),
            },
          },
        });
      }
    } else await tx.decorativeFinishSpec.deleteMany({ where: { productId } });
  }
}
