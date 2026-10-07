// Ngôn ngữ nội dung của hệ thống — nguồn duy nhất cho api (DTO, Prisma enum) và fe (next-intl routing, CMS).

export const LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'vi';

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

// Ngày tháng: xem ./date.ts (re-export để code cũ `import { formatDate } from '@remak/shared/locale'` vẫn chạy)
export { DISPLAY_TIME_ZONE, formatDate } from './date.js';
