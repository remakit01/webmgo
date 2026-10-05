import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';
import { ContentCacheService } from '../content-cache/content-cache.service.js';
import { NEWS_INVALIDATE } from './news.constants.js';

/**
 * Đăng bài hẹn giờ: mỗi phút chuyển bản dịch SCHEDULED đã tới giờ sang PUBLISHED, rồi xoá cache + revalidate fe.
 * KHÔNG dùng lock Redis: Redis chết thì lock luôn thất bại và bài hẹn giờ sẽ không bao giờ lên.
 * Lệnh cập nhật idempotent (điều kiện status = 'SCHEDULED'), nhiều instance cùng chạy cũng không đăng trùng.
 */
@Injectable()
export class NewsSchedulerService {
  private readonly logger = new Logger(NewsSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: ContentCacheService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE, { name: 'news-publish-scheduled' })
  async run() {
    try {
      await this.publishDue();
    } catch (err) {
      this.logger.error(`Đăng bài hẹn giờ lỗi: ${(err as Error).message}`);
    }
  }

  /** @returns số bản dịch vừa được đăng */
  async publishDue(now = new Date()): Promise<number> {
    const due = await this.prisma.newsPostTranslation.findMany({
      where: { status: 'SCHEDULED', publishedAt: { lte: now } },
      select: { postId: true, locale: true, publishedAt: true, firstPublishedAt: true },
    });
    if (!due.length) return 0;

    await this.prisma.$transaction(
      due.map((t) =>
        this.prisma.newsPostTranslation.updateMany({
          // Điều kiện status: biên tập viên vừa gỡ lịch trong lúc job chạy thì không đăng đè
          where: { postId: t.postId, locale: t.locale, status: 'SCHEDULED' },
          data: { status: 'PUBLISHED', firstPublishedAt: t.firstPublishedAt ?? t.publishedAt },
        }),
      ),
    );
    await this.cache.invalidate(NEWS_INVALIDATE);
    this.logger.log(`Đã đăng ${due.length} bản tin hẹn giờ`);
    return due.length;
  }
}
