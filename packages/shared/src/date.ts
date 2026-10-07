// Ngày tháng dùng chung api / fe — mặc định dd/mm/yyyy theo GIỜ VIỆT NAM, không phụ thuộc ngôn ngữ / múi giờ của máy.
// - Định dạng tiếng Việt ghép tay (không qua ICU) -> server và trình duyệt luôn ra cùng chuỗi (không lệch hydration).
// - "Ngày" trong UI / bộ lọc là DayKey 'YYYY-MM-DD' theo giờ VN; chỉ đổi sang mốc UTC khi truy vấn DB (dayKeyToUtcRange).

import type { Locale } from './locale.js';

/** Múi giờ hiển thị ngày giờ cho người dùng (dữ liệu trong DB luôn là UTC/timestamptz) */
export const DISPLAY_TIME_ZONE = 'Asia/Ho_Chi_Minh';
/** Việt Nam: UTC+7 cố định (không có giờ mùa hè) */
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Ngày theo giờ VN dạng 'YYYY-MM-DD' — so sánh / sắp xếp được bằng chuỗi */
export type DayKey = string;

const DAY_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;
const pad = (n: number) => String(n).padStart(2, '0');

const toDate = (value: string | Date | number): Date | null => {
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Date "giả" mà các trường UTC = giờ VN (chỉ dùng để đọc ngày/giờ VN) */
const vnShift = (d: Date) => new Date(d.getTime() + VN_OFFSET_MS);

/** Chuỗi có phải DayKey hợp lệ (ngày có thật) */
export function isDayKey(value: unknown): value is DayKey {
  if (typeof value !== 'string') return false;
  const m = DAY_KEY.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = new Date(Date.UTC(y, mo - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d;
}

/** Date / ISO -> ngày theo giờ VN; không hợp lệ -> '' */
export function toDayKey(value: string | Date | number): DayKey {
  const d = toDate(value);
  return d ? vnShift(d).toISOString().slice(0, 10) : '';
}

export const todayKey = (now: Date = new Date()): DayKey => toDayKey(now);

/** DayKey -> Date 00:00 UTC cùng ngày (chỉ để tính toán lịch, không phải mốc thời gian thật) */
const keyToUtc = (key: DayKey) => new Date(`${key}T00:00:00.000Z`);
const utcToKey = (d: Date): DayKey => d.toISOString().slice(0, 10);

export const addDays = (key: DayKey, n: number): DayKey => utcToKey(new Date(keyToUtc(key).getTime() + n * DAY_MS));

/** Cộng tháng, kẹp về ngày cuối tháng (31/01 + 1 tháng = 28 hoặc 29/02) */
export function addMonths(key: DayKey, n: number): DayKey {
  const d = keyToUtc(key);
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d.getUTCDate(), last));
  return utcToKey(target);
}

export const startOfMonth = (key: DayKey): DayKey => `${key.slice(0, 8)}01`;
export const endOfMonth = (key: DayKey): DayKey => {
  const d = keyToUtc(key);
  return utcToKey(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)));
};

/** Thứ trong tuần của DayKey, tuần bắt đầu Thứ Hai: 0 = T2 … 6 = CN */
export const weekdayMonFirst = (key: DayKey) => (keyToUtc(key).getUTCDay() + 6) % 7;

// ─── Định dạng ──────────────────────────────────────────────────────────────

/** '2026-10-07' -> '07/10/2026' */
export function formatDayKey(key: DayKey): string {
  const m = DAY_KEY.exec(key);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

/** '2026-10-07' -> '07/10' (trục biểu đồ) */
export function formatDayShort(key: DayKey): string {
  const m = DAY_KEY.exec(key);
  return m ? `${m[3]}/${m[2]}` : '';
}

/**
 * Ngày theo ngôn ngữ, giờ VN: vi -> "05/10/2026", en -> "Oct 5, 2026".
 * Nhận ISO string / Date; không hợp lệ -> ''.
 */
export function formatDate(value: string | Date, locale: Locale = 'vi'): string {
  const d = toDate(value);
  if (!d) return '';
  if (locale === 'vi') return formatDayKey(toDayKey(d));
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: DISPLAY_TIME_ZONE }).format(d);
}

/** Ngày giờ, giờ VN, 24 giờ: vi -> "07/10/2026 14:30", en -> "Oct 7, 2026, 14:30" */
export function formatDateTime(value: string | Date, locale: Locale = 'vi'): string {
  const d = toDate(value);
  if (!d) return '';
  const v = vnShift(d);
  const time = `${pad(v.getUTCHours())}:${pad(v.getUTCMinutes())}`;
  return locale === 'vi' ? `${formatDayKey(toDayKey(d))} ${time}` : `${formatDate(d, 'en')}, ${time}`;
}

/** Chỉ giờ:phút theo giờ VN, 24 giờ ("14:30") */
export function formatTime(value: string | Date): string {
  const d = toDate(value);
  if (!d) return '';
  const v = vnShift(d);
  return `${pad(v.getUTCHours())}:${pad(v.getUTCMinutes())}`;
}

/** Nhãn khoảng ngày: "01/10/2026 – 07/10/2026", "Từ 01/10/2026", "Đến 07/10/2026", "" */
export function formatDateRange(from?: DayKey | null, to?: DayKey | null): string {
  if (from && to) return from === to ? formatDayKey(from) : `${formatDayKey(from)} – ${formatDayKey(to)}`;
  if (from) return `Từ ${formatDayKey(from)}`;
  if (to) return `Đến ${formatDayKey(to)}`;
  return '';
}

/** Số có phân cách hàng nghìn: vi "1.234.567", en "1,234,567" (ghép tay — giống nhau trên mọi máy) */
export function formatNumber(n: number, locale: Locale = 'vi'): string {
  if (!Number.isFinite(n)) return '';
  const sign = n < 0 ? '-' : '';
  const [int, frac] = Math.abs(n).toString().split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, locale === 'vi' ? '.' : ',');
  return frac ? `${sign}${grouped}${locale === 'vi' ? ',' : '.'}${frac}` : `${sign}${grouped}`;
}

// ─── Nhập liệu ──────────────────────────────────────────────────────────────

/**
 * Đọc ngày người dùng gõ (luôn ngày trước tháng): "7/10/2026", "07-10-2026", "07.10.2026", "2026-10-07".
 * Ngày không có thật (31/02) / sai dạng -> null.
 */
export function parseDate(input: string): DayKey | null {
  const s = input.trim();
  if (isDayKey(s)) return s;
  const m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(s);
  if (!m) return null;
  const key = `${m[3]}-${pad(Number(m[2]))}-${pad(Number(m[1]))}`;
  return isDayKey(key) ? key : null;
}

/**
 * Khoảng ngày (giờ VN) -> mốc UTC cho truy vấn DB: [00:00 VN của `from`, 00:00 VN ngày sau `to`).
 * Ví dụ ngày 07/10/2026 = [2026-10-06T17:00Z, 2026-10-07T17:00Z).
 */
export function dayKeyToUtcRange(from?: DayKey | null, to?: DayKey | null): { gte?: Date; lt?: Date } {
  const range: { gte?: Date; lt?: Date } = {};
  if (from && isDayKey(from)) range.gte = new Date(keyToUtc(from).getTime() - VN_OFFSET_MS);
  if (to && isDayKey(to)) range.lt = new Date(keyToUtc(addDays(to, 1)).getTime() - VN_OFFSET_MS);
  return range;
}
