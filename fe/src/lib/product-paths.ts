import { toLocalePath } from '@/i18n/paths';
import type { Locale } from '@/i18n/routing';

// URL Sản phẩm theo ngôn ngữ: slug là slug CỦA NGÔN NGỮ ĐÓ (/san-pham/<slug-vi>, /en/products/<slug-en>).

export const productsIndexPath = (locale: Locale) => toLocalePath('/san-pham', locale);
export const productPath = (locale: Locale, slug: string) => toLocalePath(`/san-pham/${slug}`, locale);
