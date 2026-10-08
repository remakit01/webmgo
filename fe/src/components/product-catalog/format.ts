import { SALE_UNIT_LABEL, type ProductVariantPublic } from '@remak/shared/contracts/product';
import type { Locale } from '@/i18n/routing';

/** Hotline bán hàng (cùng số với Header) */
export const HOTLINE = '0902.441.981';
export const HOTLINE_TEL = 'tel:0902441981';

const intlLocale = (locale: Locale) => (locale === 'vi' ? 'vi-VN' : 'en-US');

/** 195000 -> "195.000 đ" (vi) / "195,000 VND" (en) */
export const formatVnd = (n: number, locale: Locale) =>
  `${new Intl.NumberFormat(intlLocale(locale)).format(n)} ${locale === 'vi' ? 'đ' : 'VND'}`;

export const formatNum = (n: number, locale: Locale, digits = 2) =>
  new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits: digits }).format(n);

export const formatMm = (n: number, locale: Locale) => `${formatNum(n, locale, 1)}mm`;

/** "2026-12-31" -> "31/12/2026" | "Dec 31, 2026" */
export const formatDay = (day: string, locale: Locale) =>
  new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: locale === 'vi' ? 'short' : 'medium', timeZone: 'UTC' }).format(new Date(`${day}T00:00:00Z`));

export const unitLabel = (v: Pick<ProductVariantPublic, 'saleUnit'>, locale: Locale) => SALE_UNIT_LABEL[v.saleUnit][locale];

/** URL trang báo giá kèm sản phẩm + độ dày đang chọn (form báo giá điền sẵn) */
export const quoteHref = (slug: string, thicknessMm?: number) =>
  `/bao-gia?san-pham=${encodeURIComponent(slug)}${thicknessMm ? `&do-day=${thicknessMm}` : ''}`;
