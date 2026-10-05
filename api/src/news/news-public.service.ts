import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { Locale } from '@remak/shared/locale';
import { normalizePage, toPaginated } from '@remak/shared/pagination';
import { collectRelatedPostIds, type RichDoc } from '@remak/shared/rich-content';
import { isValidSlug } from '@remak/shared/slug';
import type {
  NewsCategoryPublic,
  NewsListResponse,
  NewsPostBySlugResponse,
  NewsPostPublic,
  NewsRelatedRef,
  NewsSitemapEntry,
} from '@remak/shared/contracts/news';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { SlugRedirectService } from '../slug-redirect/slug-redirect.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { NewsPublicListQueryDto } from './dto/news-public.dto.js';
import {
  authorSelect,
  categorySelect,
  listItemSelect,
  tagSelect,
  toAuthorPublic,
  toCategoryPublic,
  toListItem,
  toTagPublic,
} from './news.mapper.js';
import { NEWS_CACHE_PREFIX, NEWS_CACHE_TTL, NEWS_RELATED_LIMIT, NEWS_SLUG_ENTITY } from './news.constants.js';

/** Bản dịch hiển thị công khai: đã xuất bản, đã tới giờ, bài chưa bị xoá */
const visibleWhere = (locale: Locale, now = new Date()) =>
  ({
    locale,
    status: 'PUBLISHED',
    publishedAt: { lte: now },
    post: { deletedAt: null },
  }) satisfies Prisma.NewsPostTranslationWhereInput;

const cacheKey = (...parts: (string | number)[]) => `${NEWS_CACHE_PREFIX}public:${parts.join(':')}`;
const hash = (value: unknown) => createHash('sha1').update(JSON.stringify(value)).digest('hex').slice(0, 16);

@Injectable()
export class NewsPublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly slugRedirects: SlugRedirectService,
  ) {}

  list(query: NewsPublicListQueryDto): Promise<NewsListResponse> {
    const { locale, category, tag, featured } = query;
    const { page, pageSize, skip, take } = normalizePage(query.page, query.pageSize);
    return this.redis.cacheOrLoad(
      cacheKey('list', locale, hash({ category, tag, featured, page, pageSize })),
      NEWS_CACHE_TTL,
      async () => {
        const where: Prisma.NewsPostTranslationWhereInput = {
          ...visibleWhere(locale),
          post: {
            deletedAt: null,
            ...(featured ? { isFeatured: true } : {}),
            // Slug chuyên mục theo ngôn ngữ đang xem; chuyên mục chưa dịch thì dùng slug tiếng Việt
            ...(category
              ? { category: { translations: { some: { slug: category, locale: { in: [locale, 'vi'] } } } } }
              : {}),
            ...(tag ? { tags: { some: { tag: { translations: { some: { locale, slug: tag } } } } } } : {}),
          },
        };
        const [rows, total] = await Promise.all([
          this.prisma.newsPostTranslation.findMany({
            where,
            orderBy: featured
              ? [{ post: { featuredOrder: { sort: 'asc', nulls: 'last' } } }, { publishedAt: 'desc' }]
              : [{ publishedAt: 'desc' }],
            skip,
            take,
            select: listItemSelect(locale),
          }),
          this.prisma.newsPostTranslation.count({ where }),
        ]);
        return toPaginated(
          rows.map((r) => toListItem(r, locale)),
          total,
          page,
          pageSize,
        );
      },
    );
  }

  /** Bài theo slug của ngôn ngữ; slug cũ -> { redirect }; không có -> null (controller trả 404) */
  async bySlug(locale: Locale, slug: string): Promise<NewsPostBySlugResponse | null> {
    if (!isValidSlug(slug)) return null;
    return this.redis.cacheOrLoad(cacheKey('post', locale, slug), NEWS_CACHE_TTL, async () => {
      const post = await this.loadPost(locale, slug);
      if (post) return { post, related: await this.related(locale, post) };

      // Slug cũ cùng ngôn ngữ, hoặc slug của ngôn ngữ khác (vd /en/news/<slug-vi>) -> 301 sang slug đúng ngôn ngữ
      const owner =
        (await this.slugRedirects.resolve(NEWS_SLUG_ENTITY, locale, slug)) ??
        (await this.prisma.newsPostTranslation.findFirst({
          where: { slug, locale: { not: locale }, post: { deletedAt: null } },
          select: { postId: true },
        }))?.postId;
      if (!owner) return null;
      const current = await this.prisma.newsPostTranslation.findFirst({
        where: { ...visibleWhere(locale), postId: owner },
        select: { slug: true },
      });
      return current && current.slug !== slug ? { redirect: current.slug } : null;
    });
  }

  categories(locale: Locale): Promise<NewsCategoryPublic[]> {
    return this.redis.cacheOrLoad(cacheKey('categories', locale), NEWS_CACHE_TTL, async () => {
      const rows = await this.prisma.newsCategory.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        select: categorySelect(locale),
      });
      return rows.map((r) => toCategoryPublic(r, locale));
    });
  }

  /** Mọi bài đang hiển thị kèm slug từng ngôn ngữ — fe dựng sitemap + hreflang */
  sitemap(): Promise<NewsSitemapEntry[]> {
    return this.redis.cacheOrLoad(cacheKey('sitemap'), NEWS_CACHE_TTL, async () => {
      const now = new Date();
      const rows = await this.prisma.newsPostTranslation.findMany({
        where: { status: 'PUBLISHED', publishedAt: { lte: now }, post: { deletedAt: null } },
        select: { postId: true, locale: true, slug: true, updatedAt: true },
        orderBy: { publishedAt: 'desc' },
      });
      const byPost = new Map<string, NewsSitemapEntry>();
      for (const r of rows) {
        const entry = byPost.get(r.postId) ?? { id: r.postId, updatedAt: r.updatedAt.toISOString(), slugs: {} };
        entry.slugs[r.locale] = r.slug;
        if (r.updatedAt.toISOString() > entry.updatedAt) entry.updatedAt = r.updatedAt.toISOString();
        byPost.set(r.postId, entry);
      }
      return [...byPost.values()];
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private async loadPost(locale: Locale, slug: string): Promise<NewsPostPublic | null> {
    const t = await this.prisma.newsPostTranslation.findFirst({
      where: { ...visibleWhere(locale), slug },
      select: {
        ...listItemSelect(locale),
        content: true,
        seoTitle: true,
        seoDescription: true,
        ogImageUrl: true,
        noindex: true,
        sourceName: true,
        sourceUrl: true,
        updatedAt: true,
        post: {
          select: {
            ...listItemSelect(locale).post.select,
            author: { select: authorSelect(locale) },
            tags: { select: { tag: { select: tagSelect(locale) } } },
            translations: { select: { locale: true, slug: true, status: true, publishedAt: true } },
          },
        },
      },
    });
    if (!t) return null;

    const now = Date.now();
    const alternates = Object.fromEntries(
      t.post.translations
        .filter((x) => x.status === 'PUBLISHED' && x.publishedAt && x.publishedAt.getTime() <= now)
        .map((x) => [x.locale, x.slug]),
    );
    const content = t.content as unknown as RichDoc;
    const item = toListItem(t, locale);
    return {
      ...item,
      content,
      updatedAt: t.updatedAt.toISOString(),
      author: t.post.author ? toAuthorPublic(t.post.author, locale) : null,
      tags: t.post.tags.map((x) => toTagPublic(x.tag, locale)),
      seo: {
        title: t.seoTitle || t.title,
        description: t.seoDescription || t.sapo,
        ogImageUrl: t.ogImageUrl || t.post.coverImageUrl,
        noindex: t.noindex,
      },
      source: t.sourceName ? { name: t.sourceName, url: t.sourceUrl } : null,
      alternates,
      relatedRefs: await this.relatedRefs(locale, collectRelatedPostIds(content)),
    };
  }

  /** Bài cùng chuyên mục mới nhất (trừ bài đang xem) */
  private async related(locale: Locale, post: NewsPostPublic) {
    const rows = await this.prisma.newsPostTranslation.findMany({
      where: { ...visibleWhere(locale), postId: { not: post.id }, post: { deletedAt: null, categoryId: post.category.id } },
      orderBy: { publishedAt: 'desc' },
      take: NEWS_RELATED_LIMIT,
      select: listItemSelect(locale),
    });
    return rows.map((r) => toListItem(r, locale));
  }

  /** Thông tin bài được chèn trong nội dung — chỉ bài đang hiển thị ở cùng ngôn ngữ (bài ẩn thì khối tự ẩn) */
  private async relatedRefs(locale: Locale, ids: string[]): Promise<Record<string, NewsRelatedRef>> {
    if (!ids.length) return {};
    const rows = await this.prisma.newsPostTranslation.findMany({
      where: { ...visibleWhere(locale), postId: { in: ids } },
      select: { postId: true, slug: true, title: true, post: { select: { coverImageUrl: true } } },
    });
    return Object.fromEntries(
      rows.map((r) => [r.postId, { id: r.postId, slug: r.slug, title: r.title, coverUrl: r.post.coverImageUrl }]),
    );
  }
}
