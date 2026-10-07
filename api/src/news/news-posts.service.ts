import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Locale } from '@remak/shared/locale';
import { normalizePage, toPaginated, type Paginated } from '@remak/shared/pagination';
import { resolveStatusOnPublish } from '@remak/shared/publishing';
import { readingMinutes, toPlainText, validateRichDoc, type RichDoc } from '@remak/shared/rich-content';
import { isValidSlug, slugify } from '@remak/shared/slug';
import type { NewsPostCms, NewsPostListItemCms } from '@remak/shared/contracts/news';
import { PrismaService } from '../prisma/prisma.service.js';
import { MediaService } from '../storage/media.service.js';
import { StorageService } from '../storage/storage.service.js';
import { ContentCacheService } from '../content-cache/content-cache.service.js';
import { SlugRedirectService } from '../slug-redirect/slug-redirect.service.js';
import { NewsStatsService } from '../news-stats/news-stats.service.js';
import { dayKeyToUtcRange } from '@remak/shared/date';
import { assertUpdated, assertVersion } from '../common/versioning.js';
import { resolveUniqueSlug } from '../common/unique-slug.js';
import type { NewsPostTranslation, Prisma, TranslationOrigin } from '../generated/prisma/client.js';
import type {
  CreateNewsPostDto,
  NewsPostListQueryDto,
  NewsTranslationDto,
  PublishNewsDto,
  UpdateNewsPostDto,
} from './dto/news-post.dto.js';
import { cmsListSelect, cmsPostInclude, toPostCms, toPostListItemCms } from './news.mapper.js';
import {
  NEWS_COVER_PREFIX,
  NEWS_INVALIDATE,
  NEWS_MEDIA_PREFIX,
  NEWS_SLUG_ENTITY,
} from './news.constants.js';

const LIVE = { deletedAt: null };
/** Trạng thái có thể đang/sắp hiển thị công khai -> sửa thì phải xoá cache + revalidate */
const VISIBLE_STATUSES = new Set(['PUBLISHED', 'SCHEDULED']);

const blankToNull = (v: string | null | undefined) => (v === undefined ? undefined : v === null || v.trim() === '' ? null : v.trim());

@Injectable()
export class NewsPostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaService,
    private readonly storage: StorageService,
    private readonly cache: ContentCacheService,
    private readonly slugRedirects: SlugRedirectService,
    private readonly stats: NewsStatsService,
  ) {}

  // ── Đọc ─────────────────────────────────────────────────────────────────

  async list(query: NewsPostListQueryDto): Promise<Paginated<NewsPostListItemCms>> {
    const { page, pageSize, skip, take } = normalizePage(query.page, query.pageSize);
    const locale = query.locale ?? 'vi';
    const and: Prisma.NewsPostWhereInput[] = [{ deletedAt: query.trash ? { not: null } : null }];
    if (query.categoryId) and.push({ categoryId: query.categoryId });
    if (query.featured) and.push({ isFeatured: true });
    if (query.status) and.push({ translations: { some: { locale, status: query.status } } });
    if (query.missing) and.push({ translations: { none: { locale: query.missing } } });
    if (query.q?.trim()) {
      and.push({ translations: { some: { title: { contains: query.q.trim(), mode: 'insensitive' } } } });
    }
    // Khoảng ngày cập nhật theo GIỜ VIỆT NAM: [00:00 VN ngày đầu, 00:00 VN ngày sau ngày cuối)
    if (query.fromDate || query.toDate) {
      const range = dayKeyToUtcRange(query.fromDate?.slice(0, 10), query.toDate?.slice(0, 10));
      if (range.gte || range.lt) and.push({ updatedAt: range });
    }
    // Có / chưa có lượt xem: mọi thời gian -> cột đếm sẵn; theo kỳ -> EXISTS trên bảng ngày (PK post_id, ~1ms/trang)
    if (query.views) {
      if (query.viewsDays) {
        const statsWhere: Prisma.NewsPostDailyStatWhereInput = { views: { gt: 0 }, day: { gte: this.stats.sinceDay(query.viewsDays) } };
        and.push({ dailyStats: query.views === 'has_views' ? { some: statsWhere } : { none: statsWhere } });
      } else {
        and.push({ viewCount: query.views === 'has_views' ? { gt: 0 } : 0 });
      }
    }
    const where: Prisma.NewsPostWhereInput = { AND: and };
    const byViews = query.sort === 'views_desc' || query.sort === 'views_asc';

    // Sắp theo lượt xem TRONG KỲ: phải gộp bảng ngày -> xử lý riêng
    if (byViews && query.viewsDays) {
      return this.listByViews(where, query.sort as 'views_desc' | 'views_asc', query.viewsDays, page, pageSize, skip, take);
    }

    const [rows, total] = await Promise.all([
      this.prisma.newsPost.findMany({
        where,
        orderBy: byViews
          ? // Mọi thời gian: ORDER BY cột đếm sẵn, phân trang ngay trong DB
            [{ viewCount: query.sort === 'views_desc' ? 'desc' : 'asc' }, { updatedAt: 'desc' }]
          : query.trash
            ? { deletedAt: 'desc' }
            : query.featured
              ? [{ featuredOrder: { sort: 'asc', nulls: 'last' } }, { updatedAt: 'desc' }]
              : { updatedAt: 'desc' },
        skip,
        take,
        select: cmsListSelect,
      }),
      this.prisma.newsPost.count({ where }),
    ]);
    const views = await this.stats.viewsForPosts(
      rows.map((r) => r.id),
      query.viewsDays,
    );
    return toPaginated(
      rows.map((r) => toPostListItemCms(r, views.get(r.id))),
      total,
      page,
      pageSize,
    );
  }

  /**
   * Sắp theo lượt xem TRONG KỲ: lượt xem nằm ở bảng thống kê gộp ngày nên không ORDER BY trực tiếp được —
   * lấy id các bài khớp bộ lọc (cột nhẹ), cộng lượt xem 1 lần, sắp, cắt trang rồi mới đọc chi tiết đúng các bài của trang.
   * Hợp với quy mô CMS (vài trăm – vài nghìn bài).
   */
  private async listByViews(
    where: Prisma.NewsPostWhereInput,
    sort: 'views_desc' | 'views_asc',
    days: number,
    page: number,
    pageSize: number,
    skip: number,
    take: number,
  ): Promise<Paginated<NewsPostListItemCms>> {
    const ids = await this.prisma.newsPost.findMany({ where, orderBy: { updatedAt: 'desc' }, select: { id: true } });
    const views = await this.stats.viewsForPosts(
      ids.map((r) => r.id),
      days,
    );
    const score = (id: string) => views.get(id)?.viewsInPeriod ?? 0;
    // sort ổn định: cùng lượt xem thì giữ thứ tự mới cập nhật
    const ordered = [...ids].sort((a, b) => (sort === 'views_desc' ? score(b.id) - score(a.id) : score(a.id) - score(b.id)));
    const pageIds = ordered.slice(skip, skip + take).map((r) => r.id);
    const rows = await this.prisma.newsPost.findMany({ where: { id: { in: pageIds } }, select: cmsListSelect });
    const byId = new Map(rows.map((r) => [r.id, r]));
    return toPaginated(
      pageIds.flatMap((id) => {
        const row = byId.get(id);
        return row ? [toPostListItemCms(row, views.get(id))] : [];
      }),
      ids.length,
      page,
      pageSize,
    );
  }

  async get(id: string): Promise<NewsPostCms> {
    const post = await this.prisma.newsPost.findUnique({ where: { id }, include: cmsPostInclude });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    return toPostCms(post);
  }

  /** Kiểm tra slug còn trống + gợi ý slug không trùng (CMS gọi khi gõ) */
  async checkSlug(locale: Locale, slug: string, excludeId?: string) {
    const normalized = slugify(slug);
    const isTaken = (s: string) => this.isSlugTaken(locale, s, excludeId);
    const suggestion = await resolveUniqueSlug({ fromText: normalized || slug, isTaken });
    return {
      slug,
      valid: isValidSlug(slug),
      available: isValidSlug(slug) && !(await isTaken(slug)),
      suggestion,
    };
  }

  // ── Tạo / sửa ───────────────────────────────────────────────────────────

  async create(dto: CreateNewsPostDto, userId: string): Promise<NewsPostCms> {
    await this.assertRefs(dto);
    const translation = await this.buildTranslationData('vi', dto.translation, undefined);

    const post = await this.prisma.newsPost.create({
      data: {
        categoryId: dto.categoryId,
        authorId: dto.authorId ?? null,
        isFeatured: dto.isFeatured ?? false,
        featuredOrder: dto.featuredOrder ?? null,
        createdById: userId,
        updatedById: userId,
        translations: { create: { locale: 'vi', ...translation } },
        tags: dto.tagIds?.length ? { createMany: { data: unique(dto.tagIds).map((tagId) => ({ tagId })) } } : undefined,
      },
    });
    return this.get(post.id);
  }

  /** Sửa thông tin chung (chuyên mục, tác giả, tag, nổi bật) — If-Match theo phiên bản bài */
  async update(id: string, dto: UpdateNewsPostDto, ifMatch: string | undefined, userId: string): Promise<NewsPostCms> {
    const post = await this.getLiveOrThrow(id);
    assertVersion(ifMatch, post.updatedAt);
    await this.assertRefs(dto);

    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.newsPost.updateMany({
        where: { id, updatedAt: post.updatedAt, ...LIVE },
        data: {
          categoryId: dto.categoryId,
          authorId: dto.authorId === undefined ? undefined : dto.authorId,
          isFeatured: dto.isFeatured,
          featuredOrder: dto.featuredOrder === undefined ? undefined : dto.featuredOrder,
          updatedById: userId,
        },
      });
      assertUpdated(count);
      if (dto.tagIds) {
        await tx.newsPostTag.deleteMany({ where: { postId: id } });
        if (dto.tagIds.length) {
          await tx.newsPostTag.createMany({ data: unique(dto.tagIds).map((tagId) => ({ postId: id, tagId })) });
        }
      }
    });
    await this.afterChange(post.translations);
    return this.get(id);
  }

  /**
   * Tạo/sửa nội dung một ngôn ngữ. If-Match theo phiên bản của CHÍNH bản dịch đó,
   * nên người sửa bản tiếng Anh không chặn người sửa bản tiếng Việt và ngược lại.
   */
  async upsertTranslation(id: string, locale: Locale, dto: NewsTranslationDto, ifMatch: string | undefined): Promise<NewsPostCms> {
    const post = await this.getLiveOrThrow(id);
    const existing = post.translations.find((t) => t.locale === locale);
    const vi = post.translations.find((t) => t.locale === 'vi');
    if (existing) assertVersion(ifMatch, existing.updatedAt);
    if (locale !== 'vi' && !vi) throw new BadRequestException('Bài chưa có bản tiếng Việt');

    const data = await this.buildTranslationData(locale, dto, existing, id);
    // Bản dịch mới tạo (không qua AI) coi như dịch từ bản tiếng Việt hiện tại
    const sourceUpdatedAt =
      locale === 'vi'
        ? null
        : dto.sourceUpdatedAt
          ? new Date(dto.sourceUpdatedAt)
          : (existing?.sourceUpdatedAt ?? vi!.contentUpdatedAt);

    await this.prisma.$transaction(async (tx) => {
      if (existing) {
        const { count } = await tx.newsPostTranslation.updateMany({
          where: { postId: id, locale, updatedAt: existing.updatedAt },
          data: { ...data, sourceUpdatedAt },
        });
        assertUpdated(count);
        // Bài đã từng đăng đổi slug -> giữ slug cũ để 301 (link cũ, SEO)
        if (existing.firstPublishedAt && existing.slug !== data.slug) {
          await this.slugRedirects.record(NEWS_SLUG_ENTITY, locale, existing.slug, data.slug, id, tx);
        }
      } else {
        await tx.newsPostTranslation.create({ data: { postId: id, locale, ...data, sourceUpdatedAt } });
      }
      // Slug mới trùng slug cũ của bài khác -> slug đang dùng thắng, bỏ redirect kia
      await this.slugRedirects.release(NEWS_SLUG_ENTITY, locale, data.slug, tx);
    });

    if (existing && VISIBLE_STATUSES.has(existing.status)) await this.cache.invalidate(NEWS_INVALIDATE);
    return this.get(id);
  }

  /**
   * Đặt danh sách bài nổi bật trên trang chủ theo đúng thứ tự (thay toàn bộ danh sách cũ).
   * Chỉ nhận bài chưa xoá; bài chưa xuất bản vẫn lưu được nhưng chỉ hiện khi đã xuất bản.
   */
  async setFeatured(ids: string[]) {
    const unique_ = unique(ids);
    if (unique_.length !== ids.length) throw new BadRequestException('Danh sách bài nổi bật bị trùng');
    const found = await this.prisma.newsPost.count({ where: { id: { in: ids }, ...LIVE } });
    if (found !== ids.length) throw new BadRequestException('Có bài không tồn tại hoặc đã bị xoá');

    await this.prisma.$transaction([
      this.prisma.newsPost.updateMany({
        where: { isFeatured: true, id: { notIn: ids } },
        data: { isFeatured: false, featuredOrder: null },
      }),
      ...ids.map((id, index) =>
        this.prisma.newsPost.update({ where: { id }, data: { isFeatured: true, featuredOrder: index } }),
      ),
    ]);
    await this.cache.invalidate(NEWS_INVALIDATE);
    return this.list({ featured: true, pageSize: 50 });
  }

  // ── Xuất bản ────────────────────────────────────────────────────────────

  async publish(id: string, locale: Locale, dto: PublishNewsDto, ifMatch: string | undefined): Promise<NewsPostCms> {
    const post = await this.getLiveOrThrow(id);
    const t = this.getTranslationOrThrow(post, locale);
    assertVersion(ifMatch, t.updatedAt);

    const problems: string[] = [];
    if (!t.title.trim()) problems.push('thiếu tiêu đề');
    if (!t.sapo.trim()) problems.push('thiếu sapo');
    if (!t.contentText.trim()) problems.push('nội dung đang trống');
    if (!post.coverImageUrl) problems.push('chưa có ảnh đại diện');
    else if (!t.coverAlt.trim()) problems.push('ảnh đại diện thiếu mô tả (alt)');
    if (locale !== 'vi') {
      const vi = post.translations.find((x) => x.locale === 'vi');
      if (!vi || !VISIBLE_STATUSES.has(vi.status)) problems.push('cần xuất bản bản tiếng Việt trước');
    }
    if (problems.length) throw new BadRequestException(`Chưa thể xuất bản: ${problems.join('; ')}`);

    const { status, publishedAt } = resolveStatusOnPublish(dto.publishedAt ? new Date(dto.publishedAt) : undefined);
    const { count } = await this.prisma.newsPostTranslation.updateMany({
      where: { postId: id, locale, updatedAt: t.updatedAt },
      data: {
        status,
        publishedAt,
        firstPublishedAt: status === 'PUBLISHED' ? (t.firstPublishedAt ?? publishedAt) : t.firstPublishedAt,
      },
    });
    assertUpdated(count);
    await this.cache.invalidate(NEWS_INVALIDATE);
    return this.get(id);
  }

  /** Gỡ bài về nháp. Gỡ bản tiếng Việt thì gỡ luôn các bản dịch (bản dịch không đứng một mình). */
  unpublish(id: string, locale: Locale, ifMatch: string | undefined) {
    return this.setOffline(id, locale, 'DRAFT', ifMatch);
  }

  archive(id: string, locale: Locale, ifMatch: string | undefined) {
    return this.setOffline(id, locale, 'ARCHIVED', ifMatch);
  }

  private async setOffline(id: string, locale: Locale, status: 'DRAFT' | 'ARCHIVED', ifMatch: string | undefined) {
    const post = await this.getLiveOrThrow(id);
    const t = this.getTranslationOrThrow(post, locale);
    assertVersion(ifMatch, t.updatedAt);

    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.newsPostTranslation.updateMany({
        where: { postId: id, locale, updatedAt: t.updatedAt },
        data: { status },
      });
      assertUpdated(count);
      if (locale === 'vi') {
        await tx.newsPostTranslation.updateMany({
          where: { postId: id, locale: { not: 'vi' }, status: { in: ['PUBLISHED', 'SCHEDULED'] } },
          data: { status: 'DRAFT' },
        });
      }
    });
    await this.cache.invalidate(NEWS_INVALIDATE);
    return this.get(id);
  }

  // ── Ảnh đại diện ────────────────────────────────────────────────────────

  async updateCover(id: string, file: Express.Multer.File | undefined, ifMatch: string | undefined, userId: string) {
    if (!file) throw new BadRequestException('Thiếu file ảnh (field "image")');
    const post = await this.getLiveOrThrow(id);
    assertVersion(ifMatch, post.updatedAt);

    const upload = await this.media.uploadImage(NEWS_COVER_PREFIX, file.buffer);
    try {
      const { count } = await this.prisma.newsPost.updateMany({
        where: { id, updatedAt: post.updatedAt, ...LIVE },
        data: {
          coverImageKey: upload.imageKey,
          coverImageUrl: upload.imageUrl,
          coverImages: upload.images as unknown as Prisma.InputJsonValue,
          updatedById: userId,
        },
      });
      assertUpdated(count);
    } catch (err) {
      await this.media.removeImage(upload.imageKey);
      throw err;
    }
    if (post.coverImageKey) await this.media.removeImage(post.coverImageKey);
    await this.afterChange(post.translations);
    return this.get(id);
  }

  // ── Thùng rác ───────────────────────────────────────────────────────────

  async remove(id: string, userId: string) {
    const post = await this.getLiveOrThrow(id);
    await this.prisma.newsPost.update({ where: { id }, data: { deletedAt: new Date(), deletedById: userId } });
    await this.afterChange(post.translations);
    return { success: true };
  }

  async restore(id: string) {
    const post = await this.prisma.newsPost.findFirst({ where: { id, deletedAt: { not: null } }, include: { translations: true } });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết trong thùng rác');
    await this.prisma.newsPost.update({ where: { id }, data: { deletedAt: null, deletedById: null } });
    await this.afterChange(post.translations);
    return this.get(id);
  }

  /** Xoá vĩnh viễn (chỉ ADMIN, bài phải ở thùng rác): DB + redirect slug + ảnh đại diện */
  async purge(id: string) {
    const post = await this.prisma.newsPost.findFirst({ where: { id, deletedAt: { not: null } } });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết trong thùng rác');
    await this.prisma.$transaction(async (tx) => {
      await this.slugRedirects.removeFor(NEWS_SLUG_ENTITY, id, tx);
      await tx.newsPost.delete({ where: { id } });
    });
    if (post.coverImageKey) await this.media.removeImage(post.coverImageKey);
    return { success: true };
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private async getLiveOrThrow(id: string) {
    const post = await this.prisma.newsPost.findFirst({ where: { id, ...LIVE }, include: { translations: true } });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    return post;
  }

  private getTranslationOrThrow<T extends { locale: string }>(post: { translations: T[] }, locale: Locale): T {
    const t = post.translations.find((x) => x.locale === locale);
    if (!t) throw new NotFoundException(`Bài chưa có bản ${locale === 'vi' ? 'tiếng Việt' : 'tiếng Anh'}`);
    return t;
  }

  private isSlugTaken(locale: Locale, slug: string, excludePostId?: string) {
    return this.prisma.newsPostTranslation
      .count({ where: { locale, slug, ...(excludePostId ? { postId: { not: excludePostId } } : {}) } })
      .then((n) => n > 0);
  }

  /** Chuẩn hoá dữ liệu bản dịch: kiểm tra ảnh trong nội dung, sinh plain text / thời gian đọc / slug */
  private async buildTranslationData(
    locale: Locale,
    dto: NewsTranslationDto,
    existing: Pick<NewsPostTranslation, 'slug' | 'origin' | 'contentText' | 'title' | 'sapo'> | undefined,
    postId?: string,
  ) {
    const imageCheck = validateRichDoc(dto.content, {
      isAllowedImageSrc: (src) => this.storage.isOwnPublicUrl(src, NEWS_MEDIA_PREFIX),
    });
    if (!imageCheck.ok) throw new BadRequestException(`content: ${imageCheck.error}`);

    const contentText = toPlainText(dto.content as RichDoc);
    const slug = await resolveUniqueSlug({
      // Giữ slug cũ khi không gửi slug — đổi tiêu đề không tự đổi URL bài đã có
      explicit: dto.slug || existing?.slug,
      fromText: dto.title,
      isTaken: (s) => this.isSlugTaken(locale, s, postId),
    });
    // Biên tập viên lưu lại bản AI (không gửi origin) = đã duyệt bản AI
    const origin: TranslationOrigin = dto.origin ?? (existing?.origin === 'AI' ? 'AI_REVIEWED' : (existing?.origin ?? 'HUMAN'));
    const textChanged =
      !existing || existing.contentText !== contentText || existing.title !== dto.title || existing.sapo !== dto.sapo;

    return {
      title: dto.title,
      slug,
      sapo: dto.sapo,
      content: dto.content as unknown as Prisma.InputJsonValue,
      contentText,
      readingMinutes: readingMinutes(contentText),
      coverAlt: dto.coverAlt ?? '',
      coverCaption: blankToNull(dto.coverCaption) ?? null,
      focusKeyword: blankToNull(dto.focusKeyword) ?? null,
      seoTitle: blankToNull(dto.seoTitle) ?? null,
      seoDescription: blankToNull(dto.seoDescription) ?? null,
      ogImageUrl: blankToNull(dto.ogImageUrl) ?? null,
      noindex: dto.noindex ?? false,
      sourceName: blankToNull(dto.sourceName) ?? null,
      sourceUrl: blankToNull(dto.sourceUrl) ?? null,
      origin,
      ...(textChanged ? { contentUpdatedAt: new Date() } : {}),
    };
  }

  /** Chuyên mục / tác giả / tag phải tồn tại — báo lỗi rõ thay vì lỗi khoá ngoại */
  private async assertRefs(dto: { categoryId?: string; authorId?: string | null; tagIds?: string[] }) {
    const [category, author, tagCount] = await Promise.all([
      dto.categoryId ? this.prisma.newsCategory.count({ where: { id: dto.categoryId } }) : 1,
      dto.authorId ? this.prisma.newsAuthor.count({ where: { id: dto.authorId } }) : 1,
      dto.tagIds?.length ? this.prisma.newsTag.count({ where: { id: { in: unique(dto.tagIds) } } }) : 0,
    ]);
    if (!category) throw new BadRequestException('Chuyên mục không tồn tại');
    if (!author) throw new BadRequestException('Tác giả không tồn tại');
    if (dto.tagIds?.length && tagCount !== unique(dto.tagIds).length) throw new BadRequestException('Có tag không tồn tại');
  }

  /** Bài đang/sắp hiển thị công khai thì xoá cache + revalidate; bài nháp không ảnh hưởng site */
  private async afterChange(translations: { status: string }[]) {
    if (translations.some((t) => VISIBLE_STATUSES.has(t.status))) await this.cache.invalidate(NEWS_INVALIDATE);
  }
}

const unique = <T>(items: T[]) => [...new Set(items)];
