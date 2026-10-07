// Chuyển bản ghi Prisma -> hợp đồng dữ liệu @remak/shared/contracts/news (một chỗ duy nhất định nghĩa hình dạng JSON trả ra).

import type { Locale } from '@remak/shared/locale';
import { isTranslationStale } from '@remak/shared/translation';
import type { RichDoc } from '@remak/shared/rich-content';
import type {
  ImageVariant,
  NewsAuthorPublic,
  NewsCategoryColor,
  NewsCategoryPublic,
  NewsListItem,
  NewsPostCms,
  NewsPostListItemCms,
  NewsTagPublic,
  NewsTranslationCms,
} from '@remak/shared/contracts/news';
import type { Prisma } from '../generated/prisma/client.js';

const iso = (d: Date) => d.toISOString();
const isoOrNull = (d: Date | null) => (d ? d.toISOString() : null);

/** Bản dịch đúng ngôn ngữ, thiếu thì dùng tiếng Việt (chuyên mục/tag/tác giả chưa dịch vẫn hiển thị được) */
export function pickLocale<T extends { locale: string }>(rows: T[], locale: Locale): T | undefined {
  return rows.find((r) => r.locale === locale) ?? rows.find((r) => r.locale === 'vi') ?? rows[0];
}

/** Chỉ lấy bản dịch cần thiết: ngôn ngữ đang xem + tiếng Việt làm dự phòng */
export const localeFilter = (locale: Locale) => ({ where: { locale: { in: locale === 'vi' ? ['vi' as const] : [locale, 'vi' as const] } } });

// ─── Chuyên mục / tag / tác giả ─────────────────────────────────────────────

export const categorySelect = (locale: Locale) =>
  ({ id: true, color: true, translations: localeFilter(locale) }) satisfies Prisma.NewsCategorySelect;

type CategoryRow = Prisma.NewsCategoryGetPayload<{ select: ReturnType<typeof categorySelect> }>;

export function toCategoryPublic(row: CategoryRow, locale: Locale): NewsCategoryPublic {
  const t = pickLocale(row.translations, locale);
  return {
    id: row.id,
    slug: t?.slug ?? '',
    name: t?.name ?? '',
    description: t?.description ?? null,
    color: row.color as NewsCategoryColor,
    seoTitle: t?.seoTitle ?? null,
    seoDescription: t?.seoDescription ?? null,
  };
}

export const tagSelect = (locale: Locale) => ({ id: true, translations: localeFilter(locale) }) satisfies Prisma.NewsTagSelect;
type TagRow = Prisma.NewsTagGetPayload<{ select: ReturnType<typeof tagSelect> }>;

export function toTagPublic(row: TagRow, locale: Locale): NewsTagPublic {
  const t = pickLocale(row.translations, locale);
  return { id: row.id, slug: t?.slug ?? '', name: t?.name ?? '' };
}

export const authorSelect = (locale: Locale) =>
  ({ id: true, name: true, avatarUrl: true, translations: localeFilter(locale) }) satisfies Prisma.NewsAuthorSelect;
type AuthorRow = Prisma.NewsAuthorGetPayload<{ select: ReturnType<typeof authorSelect> }>;

export function toAuthorPublic(row: AuthorRow, locale: Locale): NewsAuthorPublic {
  // Chức danh/tiểu sử không fallback sang tiếng Việt ở trang tiếng Anh: thiếu thì ẩn
  const t = row.translations.find((r) => r.locale === locale);
  return { id: row.id, name: row.name, avatarUrl: row.avatarUrl, jobTitle: t?.jobTitle ?? null, bio: t?.bio ?? null };
}

// ─── Bài viết public ─────────────────────────────────────────────────────────

export const listItemSelect = (locale: Locale) =>
  ({
    locale: true,
    slug: true,
    title: true,
    sapo: true,
    publishedAt: true,
    readingMinutes: true,
    coverAlt: true,
    coverCaption: true,
    post: {
      select: {
        id: true,
        isFeatured: true,
        coverImageUrl: true,
        coverImages: true,
        category: { select: categorySelect(locale) },
      },
    },
  }) satisfies Prisma.NewsPostTranslationSelect;

export type ListItemRow = Prisma.NewsPostTranslationGetPayload<{ select: ReturnType<typeof listItemSelect> }>;

export function toListItem(row: ListItemRow, locale: Locale): NewsListItem {
  return {
    id: row.post.id,
    locale: row.locale,
    slug: row.slug,
    title: row.title,
    sapo: row.sapo,
    publishedAt: iso(row.publishedAt!),
    readingMinutes: row.readingMinutes,
    isFeatured: row.post.isFeatured,
    category: toCategoryPublic(row.post.category, locale),
    cover: row.post.coverImageUrl
      ? {
          url: row.post.coverImageUrl,
          images: (row.post.coverImages as ImageVariant[] | null) ?? [],
          alt: row.coverAlt || row.title,
          caption: row.coverCaption,
        }
      : null,
  };
}

// ─── CMS ─────────────────────────────────────────────────────────────────────

export const cmsPostInclude = {
  translations: true,
  tags: { select: { tagId: true } },
} satisfies Prisma.NewsPostInclude;

type CmsPostRow = Prisma.NewsPostGetPayload<{ include: typeof cmsPostInclude }>;
type TranslationRow = CmsPostRow['translations'][number];

export function toTranslationCms(t: TranslationRow): NewsTranslationCms {
  return {
    locale: t.locale,
    status: t.status,
    publishedAt: isoOrNull(t.publishedAt),
    firstPublishedAt: isoOrNull(t.firstPublishedAt),
    title: t.title,
    slug: t.slug,
    sapo: t.sapo,
    content: t.content as unknown as RichDoc,
    readingMinutes: t.readingMinutes,
    coverAlt: t.coverAlt,
    coverCaption: t.coverCaption,
    focusKeyword: t.focusKeyword,
    seoTitle: t.seoTitle,
    seoDescription: t.seoDescription,
    ogImageUrl: t.ogImageUrl,
    noindex: t.noindex,
    sourceName: t.sourceName,
    sourceUrl: t.sourceUrl,
    origin: t.origin,
    contentUpdatedAt: iso(t.contentUpdatedAt),
    sourceUpdatedAt: isoOrNull(t.sourceUpdatedAt),
    updatedAt: iso(t.updatedAt),
    version: iso(t.updatedAt),
  };
}

export function toPostCms(row: CmsPostRow): NewsPostCms {
  return {
    id: row.id,
    categoryId: row.categoryId,
    authorId: row.authorId,
    tagIds: row.tags.map((t) => t.tagId),
    isFeatured: row.isFeatured,
    featuredOrder: row.featuredOrder,
    cover: row.coverImageUrl
      ? { url: row.coverImageUrl, images: (row.coverImages as ImageVariant[] | null) ?? [] }
      : null,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
    deletedAt: isoOrNull(row.deletedAt),
    version: iso(row.updatedAt),
    translations: Object.fromEntries(row.translations.map((t) => [t.locale, toTranslationCms(t)])),
  };
}

export const cmsListSelect = {
  id: true,
  categoryId: true,
  coverImageUrl: true,
  isFeatured: true,
  updatedAt: true,
  deletedAt: true,
  category: { select: { translations: { where: { locale: 'vi' as const }, select: { name: true } } } },
  translations: {
    select: {
      locale: true,
      status: true,
      publishedAt: true,
      slug: true,
      title: true,
      contentUpdatedAt: true,
      sourceUpdatedAt: true,
    },
  },
} satisfies Prisma.NewsPostSelect;

type CmsListRow = Prisma.NewsPostGetPayload<{ select: typeof cmsListSelect }>;

export function toPostListItemCms(row: CmsListRow, views?: { views: number; viewsInPeriod: number }): NewsPostListItemCms {
  const vi = row.translations.find((t) => t.locale === 'vi');
  return {
    id: row.id,
    title: vi?.title ?? row.translations[0]?.title ?? '',
    categoryId: row.categoryId,
    categoryName: row.category.translations[0]?.name ?? '',
    coverUrl: row.coverImageUrl,
    isFeatured: row.isFeatured,
    updatedAt: iso(row.updatedAt),
    deletedAt: isoOrNull(row.deletedAt),
    views: views?.views ?? 0,
    viewsInPeriod: views?.viewsInPeriod ?? 0,
    locales: Object.fromEntries(
      row.translations.map((t) => [
        t.locale,
        {
          status: t.status,
          publishedAt: isoOrNull(t.publishedAt),
          slug: t.slug,
          title: t.title,
          stale: t.locale !== 'vi' && !!vi && isTranslationStale(vi.contentUpdatedAt, t.sourceUpdatedAt),
        },
      ]),
    ),
  };
}
