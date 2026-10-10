// Phần dùng chung của bộ đếm lượt xem (Tin tức, Sản phẩm): chống đếm trùng, ngày theo giờ Việt Nam, sắp nguồn truy cập.

import { createHash } from 'node:crypto';
import type { Locale } from '@remak/shared/locale';
import { addDays, toDayKey } from '@remak/shared/date';
import { TRAFFIC_SOURCES, type TrafficSource } from '@remak/shared/traffic-source';
import type { RedisService } from '../redis/redis.service.js';

/** Cùng người xem (IP + trình duyệt) xem lại một trang trong khoảng này chỉ tính 1 lượt */
export const VIEW_DEDUPE_SECONDS = 30 * 60;

export interface RequestMeta {
  ip: string;
  userAgent: string | undefined;
}

/** Ngày (Date 00:00 UTC — kiểu @db.Date) cách hôm nay `back` ngày theo giờ Việt Nam */
export const statsDayStart = (now: Date, back: number) => new Date(`${addDays(toDayKey(now), -back)}T00:00:00.000Z`);

export const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/**
 * true: lần đầu trong VIEW_DEDUPE_SECONDS; Redis lỗi (null) -> coi như lần đầu (vẫn đếm, không làm hỏng request).
 * Băm cả ngày vào khoá: không giữ IP thô trong Redis.
 */
export async function isFirstVisit(redis: RedisService, kind: string, targetId: string, locale: Locale, meta: RequestMeta, now: Date) {
  const hash = createHash('sha1').update(`${meta.ip}|${meta.userAgent ?? ''}|${targetId}|${locale}|${toDayKey(now)}`).digest('hex');
  return (await redis.setIfAbsent(`views:${kind}:${hash}`, VIEW_DEDUPE_SECONDS)) !== false;
}

/** Đủ `days` ngày liên tục (ngày không có lượt dùng `empty`) để vẽ biểu đồ */
export function fillDays<T extends { day: string }>(rows: T[], now: Date, days: number, empty: (day: string) => T): T[] {
  const byDay = new Map(rows.map((r) => [r.day, r]));
  return Array.from({ length: days }, (_, i) => {
    const day = isoDay(statsDayStart(now, days - 1 - i));
    return byDay.get(day) ?? empty(day);
  });
}

/** Mọi nguồn (kể cả 0), sắp nhiều -> ít */
export function orderSources(rows: { source: TrafficSource; views: number }[]) {
  const byKey = new Map(rows.map((r) => [r.source, r.views]));
  return TRAFFIC_SOURCES.map((source) => ({ source, views: byKey.get(source) ?? 0 })).sort((a, b) => b.views - a.views);
}
