// Client gọi API NestJS dùng cho trang public (server component, SSG/ISR).
// Frontend chỉ đi qua API — không truy cập DB trực tiếp.
import type { HomeBanners, HomeHero } from '@/types/homepage';
import type { Locale } from '@/i18n/routing';

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

/** GET dữ liệu public, cache ISR 60s theo tag (API gọi /api/revalidate với tag này khi CMS lưu). */
async function getPublic<T>(path: string, tag: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: [tag] },
    });
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
