import { Injectable } from '@nestjs/common';
import type { Locale } from '@remak/shared/locale';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';

/** Loại nội dung dùng bảng slug_redirects — thêm giá trị khi module mới cần slug lịch sử */
export type SlugEntityType = 'news_post' | 'news_category';

type Db = PrismaService | Prisma.TransactionClient;

/**
 * Lịch sử slug dùng chung: nội dung đã đăng đổi slug -> slug cũ trỏ về nội dung để fe trả 301 (giữ SEO, link cũ).
 * Nhận transaction client để ghi cùng transaction với việc đổi slug.
 */
@Injectable()
export class SlugRedirectService {
  constructor(private readonly prisma: PrismaService) {}

  /** Ghi slug cũ; đồng thời bỏ redirect trùng slug mới (đổi qua lại A -> B -> A không tạo vòng lặp) */
  async record(entityType: SlugEntityType, locale: Locale, oldSlug: string, newSlug: string, entityId: string, db: Db = this.prisma) {
    if (oldSlug === newSlug) return;
    await db.slugRedirect.deleteMany({ where: { entityType, locale, oldSlug: newSlug } });
    await db.slugRedirect.upsert({
      where: { entityType_locale_oldSlug: { entityType, locale, oldSlug } },
      create: { entityType, locale, oldSlug, entityId },
      update: { entityId, createdAt: new Date() },
    });
  }

  /** Slug mới chiếm đúng một slug cũ (của nội dung khác) -> bỏ redirect đó để slug sống luôn thắng */
  async release(entityType: SlugEntityType, locale: Locale, slug: string, db: Db = this.prisma) {
    await db.slugRedirect.deleteMany({ where: { entityType, locale, oldSlug: slug } });
  }

  /** id nội dung đang giữ slug cũ này (nếu có) */
  async resolve(entityType: SlugEntityType, locale: Locale, slug: string): Promise<string | null> {
    const row = await this.prisma.slugRedirect.findUnique({
      where: { entityType_locale_oldSlug: { entityType, locale, oldSlug: slug } },
      select: { entityId: true },
    });
    return row?.entityId ?? null;
  }

  /** Xoá mọi redirect của nội dung (khi xoá vĩnh viễn) */
  async removeFor(entityType: SlugEntityType, entityId: string, db: Db = this.prisma) {
    await db.slugRedirect.deleteMany({ where: { entityType, entityId } });
  }
}
