import { toLocalePath } from '@/i18n/paths';
import type { Locale } from '@/i18n/routing';

// URL Sản phẩm theo ngôn ngữ: slug là slug CỦA NGÔN NGỮ ĐÓ (/san-pham/<slug-vi>, /en/products/<slug-en>).

export const productsIndexPath = (locale: Locale) => toLocalePath('/san-pham', locale);
export const productPath = (locale: Locale, slug: string) => toLocalePath(`/san-pham/${slug}`, locale);
/** Trang loại: /san-pham/loai/<slug-vi> ⇄ /en/products/type/<slug-en> */
export const productTypePath = (locale: Locale, slug: string) => toLocalePath(`/san-pham/loai/${slug}`, locale);
