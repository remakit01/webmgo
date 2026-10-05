import { toLocalePath } from '@/i18n/paths';
import type { Locale } from '@/i18n/routing';

// URL Tin tức theo ngôn ngữ (Localized URLs): slug là slug CỦA NGÔN NGỮ ĐÓ.
// Viết theo mẫu URL tiếng Việt rồi đổi bằng toLocalePath: /tin-tuc/<slug-en> -> /en/news/<slug-en>.
// Trong component dùng LocaleLink với href `/tin-tuc/${slug}` cũng cho cùng kết quả.

export const newsIndexPath = (locale: Locale) => toLocalePath('/tin-tuc', locale);
export const newsPostPath = (locale: Locale, slug: string) => toLocalePath(`/tin-tuc/${slug}`, locale);
export const newsCategoryPath = (locale: Locale, slug: string) => toLocalePath(`/tin-tuc/chuyen-muc/${slug}`, locale);
