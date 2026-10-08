import { Injectable } from '@nestjs/common';
import type { Locale } from '@remak/shared/locale';
import { isValidSlug } from '@remak/shared/slug';
import type { ProductBySlugResponse, ProductListItemPublic, ProductSitemapEntry } from '@remak/shared/contracts/product';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import { productDetailInclude, productListInclude, publishedSlugs, toDetailPublic, toListItemPublic } from './products.mapper.js';
import { PRODUCT_SLUG_ENTITY, PRODUCTS_CACHE_PREFIX, PRODUCTS_CACHE_TTL } from './products.constants.js';
import { SlugRedirectService } from '../slug-redirect/slug-redirect.service.js';

/** Bản dịch hiển thị công khai: đã xuất bản, đã tới giờ, sản phẩm chưa bị xoá */
const visibleTranslation = (locale: Locale, now = new Date()) =>
  ({ locale, status: 'PUBLISHED', publishedAt: { lte: now } }) satisfies Prisma.ProductTranslationWhereInput;

const cacheKey = (...parts: string[]) => `${PRODUCTS_CACHE_PREFIX}public:${parts.join(':')}`;

/** Trang web: danh sách, chi tiết theo slug, sitemap — cache Redis (Redis chết thì đọc thẳng DB) */
@Injectable()
export class ProductsPublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly slugRedirects: SlugRedirectService,
  ) {}

  list(locale: Locale): Promise<ProductListItemPublic[]> {
    return this.redis.cacheOrLoad(cacheKey('list', locale), PRODUCTS_CACHE_TTL, async () => {
      const now = new Date();
      // 1 truy vấn: sản phẩm + bản dịch + độ dày (không N+1)
      const rows = await this.prisma.product.findMany({
        where: { deletedAt: null, translations: { some: visibleTranslation(locale, now) } },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        include: productListInclude,
      });
      return rows.map((p) => toListItemPublic(p, p.translations.find((t) => t.locale === locale)!, now));
    });
  }

  /** Chi tiết theo slug của ngôn ngữ; slug cũ / slug ngôn ngữ khác -> { redirect }; không có -> null (controller trả 404) */
  async bySlug(slug: string, locale: Locale): Promise<ProductBySlugResponse | null> {
    if (!isValidSlug(slug)) return null;
    return this.redis.cacheOrLoad(cacheKey('slug', locale, slug), PRODUCTS_CACHE_TTL, async () => {
      const now = new Date();
      const p = await this.prisma.product.findFirst({
        where: { deletedAt: null, translations: { some: { ...visibleTranslation(locale, now), slug } } },
        include: productDetailInclude,
      });
      if (p) return { product: toDetailPublic(p, p.translations.find((t) => t.locale === locale)!, locale, now) };

      // Slug cũ cùng ngôn ngữ, hoặc slug của ngôn ngữ khác (vd /en/products/<slug-vi>) -> 301 sang slug đúng ngôn ngữ
      const owner =
        (await this.slugRedirects.resolve(PRODUCT_SLUG_ENTITY, locale, slug)) ??
        (await this.prisma.productTranslation.findFirst({
          where: { slug, locale: { not: locale }, product: { deletedAt: null } },
          select: { productId: true },
        }))?.productId;
      if (!owner) return null;
      const current = await this.prisma.productTranslation.findFirst({
        where: { ...visibleTranslation(locale, now), productId: owner, product: { deletedAt: null } },
        select: { slug: true },
      });
      return current && current.slug !== slug ? { redirect: current.slug } : null;
    });
  }

  sitemap(): Promise<ProductSitemapEntry[]> {
    return this.redis.cacheOrLoad(cacheKey('sitemap'), PRODUCTS_CACHE_TTL, async () => {
      const now = new Date();
      const rows = await this.prisma.product.findMany({
        where: { deletedAt: null, translations: { some: { status: 'PUBLISHED', publishedAt: { lte: now } } } },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        select: { updatedAt: true, translations: true },
      });
      return rows.map((p) => {
        const latest = p.translations.reduce((d, t) => (t.updatedAt > d ? t.updatedAt : d), p.updatedAt);
        return { slugs: publishedSlugs(p.translations, now), updatedAt: latest.toISOString() };
      });
    });
  }
}
