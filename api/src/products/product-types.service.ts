import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { LOCALES } from '@remak/shared/locale';
import type { ProductTypeCms, ProductTypeTranslationInput } from '@remak/shared/contracts/product';
import { PrismaService } from '../prisma/prisma.service.js';
import { ContentCacheService } from '../content-cache/content-cache.service.js';
import { SlugRedirectService } from '../slug-redirect/slug-redirect.service.js';
import { assertUpdated, assertVersion, versionOf } from '../common/versioning.js';
import { resolveUniqueSlug } from '../common/unique-slug.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { UpsertProductTypeDto } from './dto/product-type.dto.js';
import { PRODUCTS_INVALIDATE, PRODUCT_TYPE_SLUG_ENTITY } from './products.constants.js';

type TranslationRow = Prisma.ProductTypeTranslationCreateManyTypeInput;

/**
 * Loại sản phẩm (CMS): thêm / sửa / xoá / sắp thứ tự, bản dịch vi/en có slug riêng.
 * Mọi thay đổi xoá cache Sản phẩm + revalidate tag "products" (trang danh sách, trang loại, thẻ sản phẩm đều hiện tên loại).
 */
@Injectable()
export class ProductTypesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: ContentCacheService,
    private readonly slugRedirects: SlugRedirectService,
  ) {}

  async list(): Promise<ProductTypeCms[]> {
    const [rows, trashed] = await Promise.all([
      this.prisma.productType.findMany({
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        include: { translations: true, _count: { select: { products: { where: { deletedAt: null } } } } },
      }),
      // Sản phẩm trong thùng rác vẫn chặn xoá loại (FK Restrict) -> CMS cần biết để giải thích nút Xoá bị khoá
      this.prisma.product.groupBy({ by: ['typeId'], where: { deletedAt: { not: null } }, _count: { _all: true } }),
    ]);
    const trashedBy = new Map(trashed.map((t) => [t.typeId, t._count._all]));
    return rows.map((r) => ({
      id: r.id,
      specProfile: r.specProfile,
      sortOrder: r.sortOrder,
      isActive: r.isActive,
      productCount: r._count.products,
      trashedProductCount: trashedBy.get(r.id) ?? 0,
      version: versionOf(r),
      translations: Object.fromEntries(
        r.translations.map((t) => [
          t.locale,
          { name: t.name, slug: t.slug, description: t.description, seoTitle: t.seoTitle, seoDescription: t.seoDescription },
        ]),
      ),
    }));
  }

  async create(dto: UpsertProductTypeDto): Promise<ProductTypeCms> {
    const translations = await this.translationRows(dto, undefined);
    const last = await this.prisma.productType.aggregate({ _max: { sortOrder: true } });
    const created = await this.prisma.productType.create({
      data: {
        specProfile: dto.specProfile,
        isActive: dto.isActive,
        sortOrder: (last._max.sortOrder ?? -1) + 1,
        translations: { create: translations },
      },
    });
    await this.cache.invalidate(PRODUCTS_INVALIDATE);
    return this.find(created.id);
  }

  async update(id: string, dto: UpsertProductTypeDto, ifMatch?: string): Promise<ProductTypeCms> {
    const existing = await this.prisma.productType.findUnique({ where: { id }, include: { translations: true } });
    if (!existing) throw new NotFoundException('Không tìm thấy loại sản phẩm');
    assertVersion(ifMatch, existing.updatedAt);
    const translations = await this.translationRows(dto, id);

    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.productType.updateMany({
        where: { id, updatedAt: existing.updatedAt },
        data: { specProfile: dto.specProfile, isActive: dto.isActive },
      });
      assertUpdated(count);
      // Slug mới chiếm slug cũ của loại khác -> bỏ redirect đó; slug đổi -> URL cũ chuyển hướng sang URL mới
      for (const t of translations) {
        const old = existing.translations.find((o) => o.locale === t.locale);
        await this.slugRedirects.release(PRODUCT_TYPE_SLUG_ENTITY, t.locale, t.slug, tx);
        if (old && old.slug !== t.slug) {
          await this.slugRedirects.record(PRODUCT_TYPE_SLUG_ENTITY, t.locale, old.slug, t.slug, id, tx);
        }
      }
      await tx.productTypeTranslation.deleteMany({ where: { typeId: id } });
      await tx.productTypeTranslation.createMany({ data: translations.map((t) => ({ ...t, typeId: id })) });
    });
    await this.cache.invalidate(PRODUCTS_INVALIDATE);
    return this.find(id);
  }

  /** Sắp lại thứ tự: SQL thô một lệnh, KHÔNG đổi updated_at (form đang mở không bị báo xung đột oan) */
  async reorder(ids: string[]): Promise<ProductTypeCms[]> {
    const existing = await this.prisma.productType.findMany({ select: { id: true } });
    const known = new Set(existing.map((r) => r.id));
    if (ids.length !== known.size || ids.some((x) => !known.has(x))) {
      throw new ConflictException('Danh sách loại vừa thay đổi — tải lại trang rồi sắp lại');
    }
    await this.prisma.$executeRaw`
      UPDATE product_types AS t SET sort_order = o.ord - 1
      FROM unnest(${ids}::text[]) WITH ORDINALITY AS o(id, ord)
      WHERE t.id = o.id`;
    await this.cache.invalidate(PRODUCTS_INVALIDATE);
    return this.list();
  }

  async remove(id: string): Promise<{ success: true }> {
    const products = await this.prisma.product.count({ where: { typeId: id } });
    if (products > 0) {
      throw new ConflictException(`Loại còn ${products} sản phẩm (kể cả trong thùng rác) — hãy chuyển sang loại khác trước`);
    }
    await this.prisma.productType.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Không tìm thấy loại sản phẩm');
    });
    await this.slugRedirects.removeFor(PRODUCT_TYPE_SLUG_ENTITY, id);
    await this.cache.invalidate(PRODUCTS_INVALIDATE);
    return { success: true };
  }

  private async find(id: string): Promise<ProductTypeCms> {
    const found = (await this.list()).find((t) => t.id === id);
    if (!found) throw new NotFoundException('Không tìm thấy loại sản phẩm');
    return found;
  }

  private async translationRows(dto: UpsertProductTypeDto, excludeId: string | undefined): Promise<TranslationRow[]> {
    const rows: TranslationRow[] = [];
    for (const locale of LOCALES) {
      const t: ProductTypeTranslationInput | null | undefined = dto.translations[locale];
      if (!t) continue;
      const slug = await resolveUniqueSlug({
        explicit: t.slug,
        fromText: t.name,
        fallback: 'loai-san-pham',
        isTaken: async (s) =>
          (await this.prisma.productTypeTranslation.count({
            where: { locale, slug: s, ...(excludeId ? { typeId: { not: excludeId } } : {}) },
          })) > 0,
      });
      rows.push({
        locale,
        name: t.name,
        slug,
        description: t.description ?? null,
        seoTitle: t.seoTitle ?? null,
        seoDescription: t.seoDescription ?? null,
      });
    }
    return rows;
  }
}
