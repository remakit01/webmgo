// Client gọi API NestJS dùng cho trang public (server component, SSG/ISR).
// Frontend chỉ đi qua API — không truy cập DB trực tiếp.

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const API_URL = rawApiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

export const REVALIDATE_SECONDS = 60;

export interface BannerImageVariant {
  width: number;
  format: 'webp' | 'avif';
  url: string;
}

export interface PublicBanner {
  id: string;
  title: string;
  subtitle: string | null;
  alt: string;
  ctaText: string | null;
  linkUrl: string | null;
  imageUrl: string;
  images: BannerImageVariant[];
}

export interface BannerSwiperConfig {
  autoPlayInterval: number;
  pauseOnHover: boolean;
  showDots: boolean;
}

export interface HomeBanners {
  banners: PublicBanner[];
  swiper: BannerSwiperConfig;
}

/**
 * Production runtime: ném lỗi để lần revalidate ISR thất bại giữ nguyên bản trang cũ đã cache
 * (không ghi đè bằng trang thiếu dữ liệu). Lúc build và khi dev: trả null để trang vẫn render.
 */
function shouldSwallowApiError() {
  return process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV !== 'production';
}

/** Lấy banner trang chủ (ISR 60s, tag "banners" để CMS revalidate on-demand). */
export async function getHomeBanners(): Promise<HomeBanners | null> {
  try {
    const res = await fetch(`${API_URL}/banners/public`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: ['banners'] },
    });
    if (!res.ok) throw new Error(`GET /banners/public -> HTTP ${res.status}`);
    return (await res.json()) as HomeBanners;
  } catch (err) {
    if (!shouldSwallowApiError()) throw err;
    console.warn(`[api] Không lấy được banner từ ${API_URL}: ${(err as Error).message}`);
    return null;
  }
}
