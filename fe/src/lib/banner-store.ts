export interface BannerSlide {
  id: number;
  image: string;
  alt: string;
  link?: string;
  title: string;
  active?: boolean;
  order?: number;
}

export interface BannerSwiperConfig {
  autoPlayInterval: number; // in milliseconds (default: 3500)
  pauseOnHover: boolean;
  showDots: boolean;
}

export const DEFAULT_BANNERS: BannerSlide[] = [
  {
    id: 1,
    image: '/images/banners/banner-1-tam-op.png',
    alt: 'Tấm ốp chống cháy MGO - Nhanh chóng, Dễ dàng, Bền bỉ, Tiết kiệm năng lượng',
    link: '/san-pham/tam-mgo',
    title: 'Tấm ốp chống cháy MGO',
    active: true,
    order: 1,
  },
  {
    id: 2,
    image: '/images/banners/banner-2-chiu-lua.png',
    alt: 'Tấm chống cháy chịu lửa 3 giờ - 100% không amiăng - Vật liệu không cháy',
    link: '/san-pham/tam-mgo',
    title: 'Tấm chống cháy chịu lửa 3 giờ',
    active: true,
    order: 2,
  },
  {
    id: 3,
    image: '/images/banners/banner-3-lot-san.png',
    alt: 'Tấm MGO lót sàn - Độ bền vượt trội và chi phí hiệu quả - Nền sàn hèm khóa độc đáo',
    link: '/giai-phap-ung-dung#san-mgo',
    title: 'Tấm MGO lót sàn',
    active: true,
    order: 3,
  },
];

export const DEFAULT_SWIPER_CONFIG: BannerSwiperConfig = {
  autoPlayInterval: 3500,
  pauseOnHover: true,
  showDots: false,
};

export const BANNER_IMAGE_PRESETS = [
  { label: 'Banner 1: Tấm Ốp Chống Cháy (Mặc định)', path: '/images/banners/banner-1-tam-op.png' },
  { label: 'Banner 2: Chịu Lửa 3 Giờ PCCC', path: '/images/banners/banner-2-chiu-lua.png' },
  { label: 'Banner 3: Tấm MGO Lót Sàn Chịu Tải', path: '/images/banners/banner-3-lot-san.png' },
  { label: 'Banner Bọc Cấu Kiện Thép / Ống Gió', path: '/images/banner-bc.jpg' },
  { label: 'Tấm MGO Kết Cấu Sợi Thủy Tinh', path: '/images/mgo-mesh.jpg' },
  { label: 'Ứng Dụng Bọc Ống Gió Thực Tế', path: '/images/mgo-duct.jpg' },
  { label: 'Ứng Dụng Vách Ngăn Cháy Thực Tế', path: '/images/mgo-wall.jpg' },
];

const BANNERS_STORAGE_KEY = 'remak_cms_banners';
const SWIPER_CONFIG_KEY = 'remak_cms_swiper_config';

/**
 * Lấy danh sách banner từ CMS Storage (hoặc fallback mặc định)
 */
export function getBannerSlides(): BannerSlide[] {
  if (typeof window === 'undefined') return DEFAULT_BANNERS;
  try {
    const raw = localStorage.getItem(BANNERS_STORAGE_KEY);
    if (!raw) return DEFAULT_BANNERS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_BANNERS;
  } catch {
    return DEFAULT_BANNERS;
  }
}

/**
 * Lưu danh sách banner vào CMS Storage và phát sự kiện đồng bộ
 */
export function saveBannerSlides(banners: BannerSlide[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(banners));
    window.dispatchEvent(new CustomEvent('remak_banners_updated', { detail: banners }));
  } catch (err) {
    console.error('Failed to save banners to localStorage:', err);
  }
}

/**
 * Lấy cấu hình swiper
 */
export function getSwiperConfig(): BannerSwiperConfig {
  if (typeof window === 'undefined') return DEFAULT_SWIPER_CONFIG;
  try {
    const raw = localStorage.getItem(SWIPER_CONFIG_KEY);
    if (!raw) return DEFAULT_SWIPER_CONFIG;
    return { ...DEFAULT_SWIPER_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SWIPER_CONFIG;
  }
}

/**
 * Lưu cấu hình swiper
 */
export function saveSwiperConfig(config: BannerSwiperConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SWIPER_CONFIG_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('remak_swiper_config_updated', { detail: config }));
  } catch (err) {
    console.error('Failed to save swiper config:', err);
  }
}

/**
 * Reset về dữ liệu ban đầu
 */
export function resetBannersToDefault(): { banners: BannerSlide[]; config: BannerSwiperConfig } {
  saveBannerSlides(DEFAULT_BANNERS);
  saveSwiperConfig(DEFAULT_SWIPER_CONFIG);
  return {
    banners: DEFAULT_BANNERS,
    config: DEFAULT_SWIPER_CONFIG,
  };
}
