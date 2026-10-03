// Kiểu dữ liệu nội dung trang chủ do API NestJS trả về (khớp api/src/banners, api/src/homepage)

export interface ImageVariant {
  width: number;
  format: 'webp' | 'avif';
  url: string;
}

/** Ảnh đã upload qua API: nhiều cỡ × WebP/AVIF + URL dự phòng cho <img src> */
export interface ResponsiveImage {
  imageUrl: string;
  images: ImageVariant[];
}

// ─── Banner ──────────────────────────────────────────────────────────────────

/** @deprecated dùng ImageVariant */
export type BannerImageVariant = ImageVariant;

export interface PublicBanner extends ResponsiveImage {
  id: string;
  title: string;
  subtitle: string | null;
  alt: string;
  ctaText: string | null;
  linkUrl: string | null;
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

// ─── Hero (Tiêu đề & điểm nhấn) ───────────────────────────────────────────────

/** Màu nhấn chỉ trong bảng màu brand — khớp HERO_ACCENTS ở API */
export const HERO_ACCENTS = ['orange', 'green-dark', 'green', 'slate'] as const;
export type HeroAccent = (typeof HERO_ACCENTS)[number];

export interface HeroCta {
  text: string;
  link: string;
}

export interface HeroStat {
  value: string;
  label: string;
  sublabel: string;
  accent: HeroAccent;
}

export interface HeroMediaText {
  frameTitle: string;
  badge: string;
  alt: string;
}

/** Phần nội dung CMS sửa được (body của PUT /homepage/hero) */
export interface HeroContent {
  title: string;
  subtitle: string;
  /** 1–3 đoạn; hỗ trợ **in đậm** */
  paragraphs: string[];
  primaryCta: HeroCta;
  secondaryCta: HeroCta | null;
  stats: HeroStat[];
  media: HeroMediaText;
}

export interface HomeHero extends HeroContent {
  image: (ResponsiveImage & { imageKey: string }) | null;
}

/** Bản dịch hero (vd tiếng Anh): mọi trường tuỳ chọn, rỗng = dùng tiếng Việt */
export interface HeroTranslation {
  title?: string;
  subtitle?: string;
  paragraphs?: string[];
  primaryCta?: Partial<HeroCta>;
  secondaryCta?: Partial<HeroCta>;
  stats?: { value?: string; label?: string; sublabel?: string }[];
  media?: Partial<HeroMediaText>;
}

/** GET /homepage/hero (CMS): bản gốc tiếng Việt + bản dịch thô (chưa ghép) + ảnh dùng chung */
export interface HomeHeroForCms {
  vi: HeroContent | null;
  en: HeroTranslation;
  image: HomeHero['image'];
  /** Phiên bản (updatedAt) từng phần — gửi lại qua header If-Match khi lưu để chống ghi đè lẫn nhau */
  versions: { vi: string | null; en: string | null; image: string | null };
}
