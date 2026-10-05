// Ngôn ngữ nội dung của hệ thống — nguồn duy nhất cho api (DTO, Prisma enum) và fe (next-intl routing, CMS).

export const LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'vi';

/** Múi giờ hiển thị ngày giờ cho người dùng (dữ liệu trong DB luôn là UTC/timestamptz) */
export const DISPLAY_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const INTL_LOCALE: Record<Locale, string> = { vi: 'vi-VN', en: 'en-US' };

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

/**
 * Định dạng ngày theo ngôn ngữ: vi → "05/10/2026", en → "Oct 5, 2026".
 * Nhận ISO string hoặc Date; ngày không hợp lệ trả chuỗi rỗng.
 */
export function formatDate(value: string | Date, locale: Locale): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const options: Intl.DateTimeFormatOptions =
    locale === 'vi'
      ? { day: '2-digit', month: '2-digit', year: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' };
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], { ...options, timeZone: DISPLAY_TIME_ZONE }).format(date);
}
