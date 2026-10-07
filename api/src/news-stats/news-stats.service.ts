import { createHash } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Locale } from '@remak/shared/locale';
import type {
  NewsPostStats,
  NewsStatsDay,
  NewsStatsOverview,
  NewsStatsTotals,
  NewsViewResult,
  PopularNewsItem,
} from '@remak/shared/contracts/news-stats';
import { classifyTraffic, hostOf, isBotUserAgent, TRAFFIC_SOURCES, type TrafficSource } from '@remak/shared/traffic-source';
import { addDays, toDayKey } from '@remak/shared/date';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { NEWS_CACHE_PREFIX } from '../news/news.constants.js';
import type { TrackReadDto, TrackViewDto } from './dto/news-stats.dto.js';

/** Cùng người đọc (IP + trình duyệt) xem lại một bài trong khoảng này chỉ tính 1 lượt */
const DEDUPE_SECONDS = 30 * 60;
/** Kẹp thời gian đọc một lượt (tab bỏ quên không làm lệch trung bình) */
const MAX_READ_SECONDS = 30 * 60;
const POPULAR_TTL = 5 * 60;

export interface RequestMeta {
  ip: string;
  userAgent: string | undefined;
}

/** "YYYY-MM-DD" theo giờ Việt Nam (giữ tên cũ cho test / nơi gọi) */
export const vnDay = (date: Date) => toDayKey(date);
/** Ngày (Date 00:00 UTC — kiểu @db.Date) cách hôm nay `back` ngày theo giờ Việt Nam */
const dayStart = (now: Date, back: number) => new Date(`${addDays(toDayKey(now), -back)}T00:00:00.000Z`);
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

const totals = (views: number, reads: number, readSeconds: number): NewsStatsTotals => ({
  views,
  reads,
  readRate: views ? Math.min(1, reads / views) : 0,
  avgReadSeconds: views ? Math.round(readSeconds / views) : 0,
});

const num = (v: number | bigint | null | undefined) => Number(v ?? 0);

/**
 * Lượt xem bài Tin tức: ghi gộp theo ngày / ngôn ngữ / nguồn (không lưu từng lượt, không lưu IP),
 * chống đếm trùng bằng Redis (Redis lỗi vẫn đếm), bỏ qua bot. Cùng phục vụ "Xem nhiều", thống kê CMS, Dashboard.
 */
@Injectable()
export class NewsStatsService {
  private readonly siteHost: string | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    config: ConfigService,
  ) {
    this.siteHost = hostOf(config.get<string>('feUrl', ''));
  }

  // ─── Ghi nhận (public) ───────────────────────────────────────────────────

  async trackView(postId: string, dto: TrackViewDto, meta: RequestMeta, now = new Date()): Promise<NewsViewResult> {
    await this.assertVisible(postId, dto.locale, now);
    if (!isBotUserAgent(meta.userAgent) && (await this.firstTime('seen', postId, dto.locale, meta, now))) {
      await this.increment(postId, dto.locale, now, this.sourceOf(dto), { views: 1 });
    }
    return { views: await this.totalViews(postId) };
  }

  async trackRead(postId: string, dto: TrackReadDto, meta: RequestMeta, now = new Date()): Promise<void> {
    if (isBotUserAgent(meta.userAgent)) return;
    await this.assertVisible(postId, dto.locale, now);
    // pagehide có thể bắn nhiều lần (bfcache) -> mỗi người đọc / bài / 30 phút chỉ ghi 1 lần
    if (!(await this.firstTime('read', postId, dto.locale, meta, now))) return;
    const seconds = Math.min(MAX_READ_SECONDS, Math.max(0, Math.round(dto.seconds)));
    await this.increment(postId, dto.locale, now, this.sourceOf(dto), { reads: dto.completed ? 1 : 0, readSeconds: seconds });
  }

  private sourceOf(dto: TrackViewDto): TrafficSource {
    return classifyTraffic({ referrer: dto.referrer, utmSource: dto.utm, siteHost: this.siteHost });
  }

  /** Bài (ngôn ngữ đó) đang hiển thị công khai — không ghi số cho bài nháp / đã gỡ / id lạ */
  private async assertVisible(postId: string, locale: Locale, now: Date) {
    const found = await this.prisma.newsPostTranslation.findFirst({
      where: { postId, locale, status: 'PUBLISHED', publishedAt: { lte: now }, post: { deletedAt: null } },
      select: { postId: true },
    });
    if (!found) throw new NotFoundException('Không tìm thấy bài viết');
  }

  /** true: lần đầu trong DEDUPE_SECONDS; Redis lỗi (null) -> coi như lần đầu (vẫn đếm, không làm hỏng request) */
  private async firstTime(kind: 'seen' | 'read', postId: string, locale: Locale, meta: RequestMeta, now: Date) {
    // Băm cả ngày vào khoá: không giữ IP thô trong Redis
    const hash = createHash('sha1').update(`${meta.ip}|${meta.userAgent ?? ''}|${postId}|${locale}|${vnDay(now)}`).digest('hex');
    return (await this.redis.setIfAbsent(`views:${kind}:${hash}`, DEDUPE_SECONDS)) !== false;
  }

  /**
   * Một lệnh SQL duy nhất (CTE): upsert dòng ngày + tăng news_posts.view_count — luôn khớp nhau,
   * không đọc-rồi-ghi, transaction ngắn. Lượt đọc (views = 0) không chạm news_posts.
   */
  private async increment(postId: string, locale: Locale, now: Date, source: TrafficSource, add: { views?: number; reads?: number; readSeconds?: number }) {
    const views = add.views ?? 0;
    const reads = add.reads ?? 0;
    const readSeconds = add.readSeconds ?? 0;
    await this.prisma.$executeRaw`
      WITH "stat" AS (
        INSERT INTO "news_post_daily_stats" ("post_id", "locale", "day", "source", "views", "reads", "read_seconds")
        VALUES (${postId}, ${locale}::"content_locale", ${vnDay(now)}::date, ${source}::"traffic_source", ${views}, ${reads}, ${readSeconds})
        ON CONFLICT ("post_id", "locale", "day", "source") DO UPDATE SET
          "views" = "news_post_daily_stats"."views" + EXCLUDED."views",
          "reads" = "news_post_daily_stats"."reads" + EXCLUDED."reads",
          "read_seconds" = "news_post_daily_stats"."read_seconds" + EXCLUDED."read_seconds"
      )
      UPDATE "news_posts" SET "view_count" = "view_count" + ${views} WHERE "id" = ${postId} AND ${views}::int > 0`;
  }

  /** Tổng lượt xem của bài (mọi ngôn ngữ) — đọc cột đếm sẵn, không cộng bảng ngày */
  async totalViews(postId: string): Promise<number> {
    const post = await this.prisma.newsPost.findUnique({ where: { id: postId }, select: { viewCount: true } });
    return post?.viewCount ?? 0;
  }

  // ─── Xem nhiều (public) ──────────────────────────────────────────────────

  popular(locale: Locale, days = 7, limit = 5, now = new Date()): Promise<PopularNewsItem[]> {
    return this.redis.cacheOrLoad(`${NEWS_CACHE_PREFIX}stats:popular:${locale}:${days}:${limit}`, POPULAR_TTL, async () => {
      const ranked = await this.prisma.newsPostDailyStat.groupBy({
        by: ['postId'],
        where: { locale, day: { gte: dayStart(now, days - 1) } },
        _sum: { views: true },
        orderBy: { _sum: { views: 'desc' } },
        take: limit * 3, // dư để bỏ bài đã gỡ / chưa hiển thị
      });
      return this.withTitles(ranked.map((r) => ({ postId: r.postId, locale, views: num(r._sum.views) })), now, limit);
    });
  }

  /** Gắn tiêu đề / slug / ảnh của bản dịch đang hiển thị; bỏ bài không còn hiển thị */
  private async withTitles(rows: { postId: string; locale: Locale; views: number }[], now: Date, limit: number): Promise<PopularNewsItem[]> {
    if (!rows.length) return [];
    const translations = await this.prisma.newsPostTranslation.findMany({
      where: {
        postId: { in: [...new Set(rows.map((r) => r.postId))] },
        status: 'PUBLISHED',
        publishedAt: { lte: now },
        post: { deletedAt: null },
      },
      select: { postId: true, locale: true, slug: true, title: true, post: { select: { coverImageUrl: true } } },
    });
    const byKey = new Map(translations.map((t) => [`${t.postId}|${t.locale}`, t]));
    return rows
      .filter((r) => r.views > 0)
      .flatMap((r) => {
        const t = byKey.get(`${r.postId}|${r.locale}`);
        return t ? [{ postId: r.postId, locale: r.locale, slug: t.slug, title: t.title, coverUrl: t.post.coverImageUrl, views: r.views }] : [];
      })
      .slice(0, limit);
  }

  // ─── Thống kê CMS ────────────────────────────────────────────────────────

  /** Ngày bắt đầu của kỳ `days` ngày gần nhất (gồm hôm nay, giờ Việt Nam) — dùng cho bộ lọc ngoài module */
  sinceDay(days: number, now = new Date()): Date {
    return dayStart(now, days - 1);
  }

  /**
   * Tổng lượt xem & lượt xem trong kỳ `days` (bỏ trống = bằng tổng) cho danh sách bài CMS —
   * tối đa 2 truy vấn cho cả danh sách (không N+1): tổng đọc cột view_count, kỳ thì gộp bảng ngày.
   */
  async viewsForPosts(postIds: string[], days?: number, now = new Date()): Promise<Map<string, { views: number; viewsInPeriod: number }>> {
    const out = new Map<string, { views: number; viewsInPeriod: number }>();
    if (!postIds.length) return out;
    const [all, recent] = await Promise.all([
      // Tổng: cột đếm sẵn (không SUM bảng ngày)
      this.prisma.newsPost.findMany({ where: { id: { in: postIds } }, select: { id: true, viewCount: true } }),
      days
        ? this.prisma.newsPostDailyStat.groupBy({
            by: ['postId'],
            where: { postId: { in: postIds }, day: { gte: dayStart(now, days - 1) } },
            _sum: { views: true },
          })
        : Promise.resolve(null),
    ]);
    for (const r of all) out.set(r.id, { views: r.viewCount, viewsInPeriod: days ? 0 : r.viewCount });
    for (const r of recent ?? []) out.set(r.postId, { views: out.get(r.postId)?.views ?? 0, viewsInPeriod: num(r._sum.views) });
    return out;
  }

  async postStats(postId: string, locale: Locale = 'vi', days = 30, now = new Date()): Promise<NewsPostStats> {
    const post = await this.prisma.newsPost.findUnique({ where: { id: postId }, select: { id: true } });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    const since = dayStart(now, days - 1);
    const sum = { views: true, reads: true, readSeconds: true } as const;
    const [allTime, period, daily, sources] = await Promise.all([
      this.prisma.newsPostDailyStat.aggregate({ where: { postId, locale }, _sum: sum }),
      this.prisma.newsPostDailyStat.aggregate({ where: { postId, locale, day: { gte: since } }, _sum: sum }),
      this.prisma.newsPostDailyStat.groupBy({ by: ['day'], where: { postId, locale, day: { gte: since } }, _sum: { views: true, reads: true } }),
      this.prisma.newsPostDailyStat.groupBy({ by: ['source'], where: { postId, locale, day: { gte: since } }, _sum: { views: true } }),
    ]);
    return {
      locale,
      days,
      allTime: totals(num(allTime._sum.views), num(allTime._sum.reads), num(allTime._sum.readSeconds)),
      period: totals(num(period._sum.views), num(period._sum.reads), num(period._sum.readSeconds)),
      daily: fillDays(daily.map((d) => ({ day: isoDay(d.day), views: num(d._sum.views), reads: num(d._sum.reads) })), now, days),
      sources: orderSources(sources.map((s) => ({ source: s.source, views: num(s._sum.views) }))),
    };
  }

  async overview(days = 30, now = new Date()): Promise<NewsStatsOverview> {
    const since = dayStart(now, days - 1);
    const prevSince = dayStart(now, days * 2 - 1);
    const sum = { views: true, reads: true, readSeconds: true } as const;
    const [period, previous, daily, sources, top] = await Promise.all([
      this.prisma.newsPostDailyStat.aggregate({ where: { day: { gte: since } }, _sum: sum }),
      this.prisma.newsPostDailyStat.aggregate({ where: { day: { gte: prevSince, lt: since } }, _sum: sum }),
      this.prisma.newsPostDailyStat.groupBy({ by: ['day'], where: { day: { gte: since } }, _sum: { views: true, reads: true } }),
      this.prisma.newsPostDailyStat.groupBy({ by: ['source'], where: { day: { gte: since } }, _sum: { views: true } }),
      this.prisma.newsPostDailyStat.groupBy({
        by: ['postId', 'locale'],
        where: { day: { gte: since } },
        _sum: { views: true, reads: true },
        orderBy: { _sum: { views: 'desc' } },
        take: 20,
      }),
    ]);
    const readsByKey = new Map(top.map((t) => [`${t.postId}|${t.locale}`, num(t._sum.reads)]));
    const titled = await this.withTitles(
      top.map((t) => ({ postId: t.postId, locale: t.locale, views: num(t._sum.views) })),
      now,
      10,
    );
    return {
      days,
      period: totals(num(period._sum.views), num(period._sum.reads), num(period._sum.readSeconds)),
      previous: totals(num(previous._sum.views), num(previous._sum.reads), num(previous._sum.readSeconds)),
      daily: fillDays(daily.map((d) => ({ day: isoDay(d.day), views: num(d._sum.views), reads: num(d._sum.reads) })), now, days),
      sources: orderSources(sources.map((s) => ({ source: s.source, views: num(s._sum.views) }))),
      topPosts: titled.map((p) => ({ ...p, reads: readsByKey.get(`${p.postId}|${p.locale}`) ?? 0 })),
    };
  }
}

/** Đủ `days` ngày liên tục (ngày không có lượt = 0) để vẽ biểu đồ */
function fillDays(rows: NewsStatsDay[], now: Date, days: number): NewsStatsDay[] {
  const byDay = new Map(rows.map((r) => [r.day, r]));
  return Array.from({ length: days }, (_, i) => {
    const day = isoDay(dayStart(now, days - 1 - i));
    return byDay.get(day) ?? { day, views: 0, reads: 0 };
  });
}

/** Mọi nguồn (kể cả 0), sắp nhiều -> ít */
function orderSources(rows: { source: TrafficSource; views: number }[]) {
  const byKey = new Map(rows.map((r) => [r.source, r.views]));
  return TRAFFIC_SOURCES.map((source) => ({ source, views: byKey.get(source) ?? 0 })).sort((a, b) => b.views - a.views);
}
