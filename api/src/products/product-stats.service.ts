import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Locale } from '@remak/shared/locale';
import type { ProductStatsOverview, TopProductItem } from '@remak/shared/contracts/product-stats';
import { classifyTraffic, hostOf, isBotUserAgent, type TrafficSource } from '@remak/shared/traffic-source';
import { toDayKey } from '@remak/shared/date';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { fillDays, isFirstVisit, isoDay, orderSources, statsDayStart, type RequestMeta } from '../common/view-tracking.js';
import type { TrackViewDto } from '../common/track-view.dto.js';

const num = (v: number | bigint | null | undefined) => Number(v ?? 0);

/**
 * Lượt xem trang Sản phẩm (chỉ để đội nội bộ xem trong CMS, web không hiện số): ghi gộp theo ngày / ngôn ngữ / nguồn
 * như Tin tức — không lưu từng lượt, không lưu IP, chống đếm trùng 30 phút bằng Redis (Redis lỗi vẫn đếm), bỏ qua bot.
 */
@Injectable()
export class ProductStatsService {
  private readonly siteHost: string | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    config: ConfigService,
  ) {
    this.siteHost = hostOf(config.get<string>('feUrl', ''));
  }

  // ─── Ghi nhận (public) ───────────────────────────────────────────────────

  async trackView(productId: string, dto: TrackViewDto, meta: RequestMeta, now = new Date()): Promise<void> {
    if (isBotUserAgent(meta.userAgent)) return;
    await this.assertVisible(productId, dto.locale, now);
    if (!(await isFirstVisit(this.redis, 'product', productId, dto.locale, meta, now))) return;
    const source: TrafficSource = classifyTraffic({ referrer: dto.referrer, utmSource: dto.utm, siteHost: this.siteHost });
    // Một lệnh SQL (CTE): upsert dòng ngày + tăng products.view_count — luôn khớp nhau, không đọc-rồi-ghi
    await this.prisma.$executeRaw`
      WITH "stat" AS (
        INSERT INTO "product_daily_stats" ("product_id", "locale", "day", "source", "views")
        VALUES (${productId}, ${dto.locale}::"content_locale", ${toDayKey(now)}::date, ${source}::"traffic_source", 1)
        ON CONFLICT ("product_id", "locale", "day", "source") DO UPDATE SET "views" = "product_daily_stats"."views" + 1
      )
      UPDATE "products" SET "view_count" = "view_count" + 1 WHERE "id" = ${productId}`;
  }

  /** Sản phẩm (ngôn ngữ đó) đang hiển thị công khai — không ghi số cho bản nháp / đã xoá / id lạ */
  private async assertVisible(productId: string, locale: Locale, now: Date) {
    const found = await this.prisma.productTranslation.findFirst({
      where: { productId, locale, status: 'PUBLISHED', publishedAt: { lte: now }, product: { deletedAt: null } },
      select: { productId: true },
    });
    if (!found) throw new NotFoundException('Không tìm thấy sản phẩm');
  }

  // ─── Thống kê CMS ────────────────────────────────────────────────────────

  /** Lượt xem `days` ngày gần nhất của các sản phẩm (1 truy vấn cho cả danh sách, không N+1) */
  async recentViews(productIds: string[], days: number, now = new Date()): Promise<Map<string, number>> {
    if (!productIds.length) return new Map();
    const rows = await this.prisma.productDailyStat.groupBy({
      by: ['productId'],
      where: { productId: { in: productIds }, day: { gte: statsDayStart(now, days - 1) } },
      _sum: { views: true },
    });
    return new Map(rows.map((r) => [r.productId, num(r._sum.views)]));
  }

  async overview(days = 30, now = new Date()): Promise<ProductStatsOverview> {
    const since = statsDayStart(now, days - 1);
    const prevSince = statsDayStart(now, days * 2 - 1);
    const [period, previous, daily, sources, top] = await Promise.all([
      this.prisma.productDailyStat.aggregate({ where: { day: { gte: since } }, _sum: { views: true } }),
      this.prisma.productDailyStat.aggregate({ where: { day: { gte: prevSince, lt: since } }, _sum: { views: true } }),
      this.prisma.productDailyStat.groupBy({ by: ['day'], where: { day: { gte: since } }, _sum: { views: true } }),
      this.prisma.productDailyStat.groupBy({ by: ['source'], where: { day: { gte: since } }, _sum: { views: true } }),
      this.prisma.productDailyStat.groupBy({
        by: ['productId', 'locale'],
        where: { day: { gte: since } },
        _sum: { views: true },
        orderBy: [{ _sum: { views: 'desc' } }, { productId: 'asc' }, { locale: 'asc' }],
        take: 20, // dư để bỏ sản phẩm đã xoá
      }),
    ]);
    return {
      days,
      views: num(period._sum.views),
      previousViews: num(previous._sum.views),
      daily: fillDays(
        daily.map((d) => ({ day: isoDay(d.day), views: num(d._sum.views) })),
        now,
        days,
        (day) => ({ day, views: 0 }),
      ),
      sources: orderSources(sources.map((s) => ({ source: s.source, views: num(s._sum.views) }))),
      topProducts: await this.withNames(
        top.map((t) => ({ productId: t.productId, locale: t.locale, views: num(t._sum.views) })),
        10,
      ),
    };
  }

  /** Gắn tên / ảnh theo ngôn ngữ; bỏ sản phẩm đã xoá (kể cả trong thùng rác). Bản đã gỡ xuất bản vẫn giữ: số liệu là thật */
  private async withNames(rows: { productId: string; locale: Locale; views: number }[], limit: number): Promise<TopProductItem[]> {
    if (!rows.length) return [];
    const translations = await this.prisma.productTranslation.findMany({
      where: { productId: { in: [...new Set(rows.map((r) => r.productId))] }, product: { deletedAt: null } },
      select: { productId: true, locale: true, name: true, product: { select: { coverImageUrl: true } } },
    });
    const byKey = new Map(translations.map((t) => [`${t.productId}|${t.locale}`, t]));
    return rows
      .filter((r) => r.views > 0)
      .flatMap((r) => {
        const t = byKey.get(`${r.productId}|${r.locale}`);
        return t ? [{ productId: r.productId, locale: r.locale, name: t.name, coverUrl: t.product.coverImageUrl, views: r.views }] : [];
      })
      .slice(0, limit);
  }
}
