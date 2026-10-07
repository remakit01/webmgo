import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { LOCALES, type Locale } from '@remak/shared/locale';
import type { NewsAuthorCms, NewsCategoryCms, NewsCategoryColor, NewsTagCms } from '@remak/shared/contracts/news';
import { PrismaService } from '../prisma/prisma.service.js';
import { ContentCacheService } from '../content-cache/content-cache.service.js';
import { assertUpdated, assertVersion, versionOf } from '../common/versioning.js';
import { resolveUniqueSlug } from '../common/unique-slug.js';
import type { Prisma } from '../generated/prisma/client.js';
import type {
  CategoryTranslationDto,
  TagTranslationDto,
  UpsertNewsAuthorDto,
  UpsertNewsCategoryDto,
  UpsertNewsTagDto,
} from './dto/news-taxonomy.dto.js';
import { NEWS_INVALIDATE } from './news.constants.js';

const nullable = (v: string | null | undefined) => (v && v.trim() ? v.trim() : null);

/** Chuyên mục, tag, tác giả của Tin tức — mỗi loại có bản dịch vi/en */
@Injectable()
export class NewsTaxonomyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: ContentCacheService,
  ) {}

  // ── Chuyên mục ──────────────────────────────────────────────────────────

  async listCategories(): Promise<NewsCategoryCms[]> {
    const [rows, trashed] = await Promise.all([
      this.prisma.newsCategory.findMany({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
        include: { translations: true, _count: { select: { posts: { where: { deletedAt: null } } } } },
      }),
      // Bài trong thùng rác vẫn chặn xoá chuyên mục (FK Restrict) -> CMS cần biết để giải thích nút Xoá bị khoá
      this.prisma.newsPost.groupBy({ by: ['categoryId'], where: { deletedAt: { not: null } }, _count: { _all: true } }),
    ]);
    const trashedBy = new Map(trashed.map((t) => [t.categoryId, t._count._all]));
    return rows.map((r) => ({
      id: r.id,
      color: r.color as NewsCategoryColor,
      sortOrder: r.sortOrder,
      isActive: r.isActive,
      postCount: r._count.posts,
      trashedPostCount: trashedBy.get(r.id) ?? 0,
      version: versionOf(r),
      translations: Object.fromEntries(
        r.translations.map((t) => [
          t.locale,
          { name: t.name, slug: t.slug, description: t.description, seoTitle: t.seoTitle, seoDescription: t.seoDescription },
        ]),
      ),
    }));
  }

  async createCategory(dto: UpsertNewsCategoryDto) {
    const translations = await this.categoryTranslations(dto, undefined);
    const last = await this.prisma.newsCategory.aggregate({ _max: { sortOrder: true } });
    const created = await this.prisma.newsCategory.create({
      data: {
        color: dto.color,
        sortOrder: dto.sortOrder ?? (last._max.sortOrder ?? -1) + 1,
        isActive: dto.isActive ?? true,
        translations: { create: translations },
      },
    });
    await this.cache.invalidate(NEWS_INVALIDATE);
    return this.findCategory(created.id);
  }

  async updateCategory(id: string, dto: UpsertNewsCategoryDto, ifMatch?: string) {
    const existing = await this.prisma.newsCategory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy chuyên mục');
    assertVersion(ifMatch, existing.updatedAt);
    const translations = await this.categoryTranslations(dto, id);

    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.newsCategory.updateMany({
        where: { id, updatedAt: existing.updatedAt },
        data: { color: dto.color, sortOrder: dto.sortOrder, isActive: dto.isActive },
      });
      assertUpdated(count);
      await tx.newsCategoryTranslation.deleteMany({ where: { categoryId: id } });
      await tx.newsCategoryTranslation.createMany({ data: translations.map((t) => ({ ...t, categoryId: id })) });
    });
    await this.cache.invalidate(NEWS_INVALIDATE);
    return this.findCategory(id);
  }

  /**
   * Sắp lại thứ tự: ids = toàn bộ chuyên mục theo thứ tự mới.
   * SQL thô một lệnh (nguyên tử) và KHÔNG đổi updated_at: thứ tự không phải nội dung của form sửa,
   * nên form đang mở (If-Match theo updated_at) không bị báo xung đột oan.
   */
  async reorderCategories(ids: string[]): Promise<NewsCategoryCms[]> {
    const existing = await this.prisma.newsCategory.findMany({ select: { id: true } });
    const known = new Set(existing.map((r) => r.id));
    if (ids.length !== known.size || ids.some((id) => !known.has(id))) {
      throw new ConflictException('Danh sách chuyên mục vừa thay đổi — tải lại trang rồi sắp lại');
    }
    await this.prisma.$executeRaw`
      UPDATE news_categories AS c SET sort_order = o.ord - 1
      FROM unnest(${ids}::text[]) WITH ORDINALITY AS o(id, ord)
      WHERE c.id = o.id`;
    await this.cache.invalidate(NEWS_INVALIDATE);
    return this.listCategories();
  }

  async removeCategory(id: string) {
    const posts = await this.prisma.newsPost.count({ where: { categoryId: id } });
    if (posts > 0) {
      throw new ConflictException(`Chuyên mục còn ${posts} bài viết (kể cả trong thùng rác) — hãy chuyển bài sang chuyên mục khác trước`);
    }
    await this.prisma.newsCategory.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Không tìm thấy chuyên mục');
    });
    await this.cache.invalidate(NEWS_INVALIDATE);
    return { success: true };
  }

  private async findCategory(id: string) {
    const all = await this.listCategories();
    return all.find((c) => c.id === id)!;
  }

  private async categoryTranslations(dto: UpsertNewsCategoryDto, excludeId: string | undefined) {
    const rows: Prisma.NewsCategoryTranslationCreateManyCategoryInput[] = [];
    for (const locale of LOCALES) {
      const t: CategoryTranslationDto | null | undefined = dto.translations[locale];
      if (!t) continue;
      const slug = await resolveUniqueSlug({
        explicit: t.slug,
        fromText: t.name,
        isTaken: async (s) =>
          (await this.prisma.newsCategoryTranslation.count({
            where: { locale, slug: s, ...(excludeId ? { categoryId: { not: excludeId } } : {}) },
          })) > 0,
      });
      rows.push({
        locale,
        name: t.name,
        slug,
        description: nullable(t.description),
        seoTitle: nullable(t.seoTitle),
        seoDescription: nullable(t.seoDescription),
      });
    }
    return rows;
  }

  // ── Tag ─────────────────────────────────────────────────────────────────

  async listTags(q?: string): Promise<NewsTagCms[]> {
    const rows = await this.prisma.newsTag.findMany({
      where: q?.trim() ? { translations: { some: { name: { contains: q.trim(), mode: 'insensitive' } } } } : undefined,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 200,
      include: { translations: true, _count: { select: { posts: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      postCount: r._count.posts,
      version: versionOf(r),
      translations: Object.fromEntries(r.translations.map((t) => [t.locale, { name: t.name, slug: t.slug }])),
    }));
  }

  async createTag(dto: UpsertNewsTagDto) {
    const translations = await this.tagTranslations(dto, undefined);
    const tag = await this.prisma.newsTag.create({ data: { translations: { create: translations } } });
    return (await this.listTagsByIds([tag.id]))[0];
  }

  async updateTag(id: string, dto: UpsertNewsTagDto, ifMatch?: string) {
    const existing = await this.prisma.newsTag.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy tag');
    assertVersion(ifMatch, existing.updatedAt);
    const translations = await this.tagTranslations(dto, id);
    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.newsTag.updateMany({ where: { id, updatedAt: existing.updatedAt }, data: { updatedAt: new Date() } });
      assertUpdated(count);
      await tx.newsTagTranslation.deleteMany({ where: { tagId: id } });
      await tx.newsTagTranslation.createMany({ data: translations.map((t) => ({ ...t, tagId: id })) });
    });
    await this.cache.invalidate(NEWS_INVALIDATE);
    return (await this.listTagsByIds([id]))[0];
  }

  async removeTag(id: string) {
    await this.prisma.newsTag.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Không tìm thấy tag');
    });
    await this.cache.invalidate(NEWS_INVALIDATE);
    return { success: true };
  }

  private async listTagsByIds(ids: string[]): Promise<NewsTagCms[]> {
    const rows = await this.prisma.newsTag.findMany({
      where: { id: { in: ids } },
      include: { translations: true, _count: { select: { posts: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      postCount: r._count.posts,
      version: versionOf(r),
      translations: Object.fromEntries(r.translations.map((t) => [t.locale, { name: t.name, slug: t.slug }])),
    }));
  }

  private async tagTranslations(dto: UpsertNewsTagDto, excludeId: string | undefined) {
    const rows: { locale: Locale; name: string; slug: string }[] = [];
    for (const locale of LOCALES) {
      const t: TagTranslationDto | null | undefined = dto.translations[locale];
      if (!t) continue;
      const slug = await resolveUniqueSlug({
        explicit: t.slug,
        fromText: t.name,
        isTaken: async (s) =>
          (await this.prisma.newsTagTranslation.count({
            where: { locale, slug: s, ...(excludeId ? { tagId: { not: excludeId } } : {}) },
          })) > 0,
      });
      rows.push({ locale, name: t.name, slug });
    }
    return rows;
  }

  // ── Tác giả ─────────────────────────────────────────────────────────────

  async listAuthors(): Promise<NewsAuthorCms[]> {
    const rows = await this.prisma.newsAuthor.findMany({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      include: { translations: true, _count: { select: { posts: { where: { deletedAt: null } } } } },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      avatarUrl: r.avatarUrl,
      isActive: r.isActive,
      postCount: r._count.posts,
      version: versionOf(r),
      translations: Object.fromEntries(r.translations.map((t) => [t.locale, { jobTitle: t.jobTitle, bio: t.bio }])),
    }));
  }

  async createAuthor(dto: UpsertNewsAuthorDto) {
    const author = await this.prisma.newsAuthor.create({
      data: {
        name: dto.name,
        avatarUrl: nullable(dto.avatarUrl),
        isActive: dto.isActive ?? true,
        translations: { create: this.authorTranslations(dto) },
      },
    });
    return (await this.listAuthors()).find((a) => a.id === author.id)!;
  }

  async updateAuthor(id: string, dto: UpsertNewsAuthorDto, ifMatch?: string) {
    const existing = await this.prisma.newsAuthor.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy tác giả');
    assertVersion(ifMatch, existing.updatedAt);
    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.newsAuthor.updateMany({
        where: { id, updatedAt: existing.updatedAt },
        data: { name: dto.name, avatarUrl: nullable(dto.avatarUrl), isActive: dto.isActive },
      });
      assertUpdated(count);
      if (dto.translations) {
        await tx.newsAuthorTranslation.deleteMany({ where: { authorId: id } });
        await tx.newsAuthorTranslation.createMany({ data: this.authorTranslations(dto).map((t) => ({ ...t, authorId: id })) });
      }
    });
    await this.cache.invalidate(NEWS_INVALIDATE);
    return (await this.listAuthors()).find((a) => a.id === id)!;
  }

  /** Xoá tác giả: các bài của tác giả này chuyển về "không ghi tác giả" (ON DELETE SET NULL) */
  async removeAuthor(id: string) {
    await this.prisma.newsAuthor.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Không tìm thấy tác giả');
    });
    await this.cache.invalidate(NEWS_INVALIDATE);
    return { success: true };
  }

  private authorTranslations(dto: UpsertNewsAuthorDto) {
    return LOCALES.flatMap((locale) => {
      const t = dto.translations?.[locale];
      if (!t || (!nullable(t.jobTitle) && !nullable(t.bio))) return [];
      return [{ locale, jobTitle: nullable(t.jobTitle), bio: nullable(t.bio) }];
    });
  }
}
