// Hợp đồng API thống kê lượt xem trang Sản phẩm (api/src/products <-> CMS). Chỉ dùng nội bộ CMS, web không hiện số.

import type { Locale } from '../locale.js';
import type { TrafficSource } from '../traffic-source.js';

export const PRODUCT_STATS_DAYS = [7, 30, 90] as const;

/** Kỳ mặc định của cột "lượt xem gần đây" ở danh sách sản phẩm CMS */
export const PRODUCT_LIST_VIEW_DAYS = 30;

/** Số liệu một ngày */
export interface ProductStatsDay {
  /** YYYY-MM-DD (giờ Việt Nam) */
  day: string;
  views: number;
}

/** Sản phẩm xem nhiều trong kỳ (theo từng ngôn ngữ) */
export interface TopProductItem {
  productId: string;
  locale: Locale;
  name: string;
  coverUrl: string | null;
  views: number;
}

/** Báo cáo Sản phẩm trên trang Tổng Quan CMS */
export interface ProductStatsOverview {
  days: number;
  /** Tổng lượt xem trong kỳ */
  views: number;
  /** Cùng số ngày ngay trước kỳ (để tính ±%) */
  previousViews: number;
  daily: ProductStatsDay[];
  sources: { source: TrafficSource; views: number }[];
  topProducts: TopProductItem[];
}
