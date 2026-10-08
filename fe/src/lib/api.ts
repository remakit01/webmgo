// Client gọi API NestJS dùng cho trang public (server component, SSG/ISR).
// Frontend chỉ đi qua API — không truy cập DB trực tiếp.
import type { HomeBanners, HomeHero } from '@/types/homepage';
import type { Locale } from '@/i18n/routing';
import {
  NEWS_REVALIDATE_TAG,
  type NewsCategoryPublic,
  type NewsListResponse,
  type NewsPostBySlugResponse,
  type NewsSitemapEntry,
} from '@remak/shared/contracts/news';
import type { PopularNewsItem } from '@remak/shared/contracts/news-stats';
import {
  PRODUCTS_REVALIDATE_TAG,
  type ProductBySlugResponse,
  type ProductListItemPublic,
  type ProductSitemapEntry,
  type ProductTypeBySlugResponse,
  type ProductTypeRef,
  type ProductTypeSitemapEntry,
} from '@remak/shared/contracts/product';

export type {
  BannerImageVariant,
  BannerSwiperConfig,
  HomeBanners,
  HomeHero,
  PublicBanner,
} from '@/types/homepage';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const API_URL = rawApiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

export const REVALIDATE_SECONDS = 60;

/**
 * Production runtime: ném lỗi để lần revalidate ISR thất bại giữ nguyên bản trang cũ đã cache
 * (không ghi đè bằng trang thiếu dữ liệu). Lúc build và khi dev: trả null để trang vẫn render.
 */
function shouldSwallowApiError() {
  return process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV !== 'production';
}

/**
 * GET dữ liệu public, cache ISR 60s theo tag (API gọi /api/revalidate với tag này khi CMS lưu).
 * `notFoundAsNull`: HTTP 404 là kết quả hợp lệ (vd bài không tồn tại) -> null, không coi là lỗi.
 */
async function getPublic<T>(path: string, tag: string, options: { notFoundAsNull?: boolean } = {}): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: [tag] },
    });
    if (options.notFoundAsNull && res.status === 404) return null;
    if (!res.ok) throw new Error(`GET ${path} -> HTTP ${res.status}`);
    // NestJS trả body rỗng khi giá trị là null (vd hero chưa cấu hình)
    const body = await res.text();
    return body ? (JSON.parse(body) as T) : null;
  } catch (err) {
    if (!shouldSwallowApiError()) throw err;
    console.warn(`[api] Không lấy được ${path} từ ${API_URL}: ${(err as Error).message}`);
    return null;
  }
}

/** Banner trang chủ (tag "banners"). */
export function getHomeBanners() {
  return getPublic<HomeBanners>('/banners/public', 'banners');
}

/** Tiêu đề & điểm nhấn trang chủ theo ngôn ngữ (tag "homepage-hero"). null = chưa cấu hình. */
export function getHomeHero(locale: Locale) {
  return getPublic<HomeHero>(`/homepage/hero/public?locale=${locale}`, 'homepage-hero');
}

// ─── Tin tức (tag "news") ────────────────────────────────────────────────────

const query = (params: Record<string, string | number | boolean | undefined>) =>
  new URLSearchParams(
    Object.entries(params).flatMap(([k, v]) => (v === undefined || v === false ? [] : [[k, String(v)]])),
  ).toString();

/** Danh sách bài đã xuất bản theo ngôn ngữ (lọc chuyên mục/tag/nổi bật theo slug của ngôn ngữ đó) */
export function getNewsList(
  locale: Locale,
  opts: { category?: string; tag?: string; featured?: boolean; page?: number; pageSize?: number } = {},
) {
  return getPublic<NewsListResponse>(`/news/public/posts?${query({ locale, ...opts })}`, NEWS_REVALIDATE_TAG);
}

/** Bài theo slug của ngôn ngữ: { post, related } | { redirect } (slug cũ) | null (không có) */
export function getNewsPost(locale: Locale, slug: string) {
  return getPublic<NewsPostBySlugResponse>(
    `/news/public/posts/${encodeURIComponent(slug)}?${query({ locale })}`,
    NEWS_REVALIDATE_TAG,
    { notFoundAsNull: true },
  );
}

export function getNewsCategories(locale: Locale) {
  return getPublic<NewsCategoryPublic[]>(`/news/public/categories?${query({ locale })}`, NEWS_REVALIDATE_TAG);
}

/** Bài xem nhiều nhất 7 ngày (API cache 5 phút; trang ISR theo tag "news") */
export function getPopularNews(locale: Locale) {
  return getPublic<PopularNewsItem[]>(`/news/public/popular?${query({ locale, days: 7, limit: 6 })}`, NEWS_REVALIDATE_TAG);
}

/** Mọi bài đang hiển thị kèm slug từng ngôn ngữ (sitemap + hreflang) */
export function getNewsSitemap() {
  return getPublic<NewsSitemapEntry[]>('/news/public/sitemap', NEWS_REVALIDATE_TAG);
}

// ─── Sản phẩm (tag "products") ───────────────────────────────────────────────

/** Sản phẩm đã xuất bản theo ngôn ngữ, đúng thứ tự CMS */
export function getProducts(locale: Locale) {
  return getPublic<ProductListItemPublic[]>(`/products/public?${query({ locale })}`, PRODUCTS_REVALIDATE_TAG);
}

/** Chi tiết theo slug của ngôn ngữ: { product } | { redirect } (slug cũ / slug ngôn ngữ khác) | null (không có) */
export function getProduct(locale: Locale, slug: string) {
  return getPublic<ProductBySlugResponse>(
    `/products/public/${encodeURIComponent(slug)}?${query({ locale })}`,
    PRODUCTS_REVALIDATE_TAG,
    { notFoundAsNull: true },
  );
}

/** Mọi sản phẩm đang hiển thị kèm slug từng ngôn ngữ (sitemap + hreflang) */
export function getProductsSitemap() {
  return getPublic<ProductSitemapEntry[]>('/products/public/sitemap', PRODUCTS_REVALIDATE_TAG);
}

/** Loại sản phẩm đang hiện ở ngôn ngữ này (nút lọc, trang loại), đúng thứ tự CMS */
export function getProductTypes(locale: Locale) {
  return getPublic<ProductTypeRef[]>(`/products/public/types?${query({ locale })}`, PRODUCTS_REVALIDATE_TAG);
}

/** Trang loại theo slug của ngôn ngữ: { type, products } | { redirect } | null (không có) */
export function getProductType(locale: Locale, slug: string) {
  return getPublic<ProductTypeBySlugResponse>(
    `/products/public/types/${encodeURIComponent(slug)}?${query({ locale })}`,
    PRODUCTS_REVALIDATE_TAG,
    { notFoundAsNull: true },
  );
}

/** Trang loại kèm slug từng ngôn ngữ (sitemap) */
export function getProductTypesSitemap() {
  return getPublic<ProductTypeSitemapEntry[]>('/products/public/types/sitemap', PRODUCTS_REVALIDATE_TAG);
}
