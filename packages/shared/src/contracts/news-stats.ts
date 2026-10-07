// Hợp đồng API thống kê lượt xem bài Tin tức (api/src/news-stats <-> fe).

import type { Locale } from '../locale.js';
import type { TrafficSource } from '../traffic-source.js';

export const NEWS_STATS_DAYS = [7, 30, 90] as const;

/** Số liệu một ngày */
export interface NewsStatsDay {
  /** YYYY-MM-DD (giờ Việt Nam) */
  day: string;
  views: number;
  reads: number;
}

export interface NewsStatsTotals {
  views: number;
  /** Lượt đọc tới 75% bài */
  reads: number;
  /** reads / views (0–1) */
  readRate: number;
  /** Thời gian đọc trung bình mỗi lượt có ghi nhận (giây) */
  avgReadSeconds: number;
}

/** Thống kê một bài (theo ngôn ngữ) — khung thống kê trong trang sửa bài */
export interface NewsPostStats {
  locale: Locale;
  days: number;
  /** Từ trước tới nay */
  allTime: NewsStatsTotals;
  /** Trong `days` ngày gần nhất */
  period: NewsStatsTotals;
  daily: NewsStatsDay[];
  sources: { source: TrafficSource; views: number }[];
}

/** Bài xem nhiều (public + Dashboard) */
export interface PopularNewsItem {
  postId: string;
  locale: Locale;
  slug: string;
  title: string;
  coverUrl: string | null;
  views: number;
}

/** Báo cáo Tin tức trên trang Tổng Quan CMS */
export interface NewsStatsOverview {
  days: number;
  period: NewsStatsTotals;
  /** Cùng số ngày ngay trước kỳ (để tính ±%) */
  previous: NewsStatsTotals;
  daily: NewsStatsDay[];
  sources: { source: TrafficSource; views: number }[];
  topPosts: (PopularNewsItem & { reads: number })[];
}

/** Trả về sau khi ghi một lượt xem — tổng lượt xem bài (mọi ngôn ngữ) để hiện trên trang */
export interface NewsViewResult {
  views: number;
}
