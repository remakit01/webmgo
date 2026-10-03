import { defineRouting } from 'next-intl/routing';

/**
 * Cấu hình ngôn ngữ web khách hàng.
 * - Tiếng Việt mặc định, KHÔNG tiền tố: giữ nguyên toàn bộ URL hiện có (SEO).
 * - Tiếng Anh dưới /en với slug tiếng Anh.
 * `pathnames` là nguồn duy nhất của bảng URL: key = thư mục trong app/[locale], value = URL theo ngôn ngữ.
 * Thêm route public mới -> thêm vào đây (thay cho rewrites cũ trong next.config.ts).
 */
export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  localePrefix: 'as-needed',
  // Không tự đổi ngôn ngữ theo trình duyệt/cookie: "/" luôn là tiếng Việt, người dùng chủ động bấm EN
  localeDetection: false,
  localeCookie: false,
  // Chưa phát hreflang khi nội dung trang /en còn tiếng Việt (bật lại khi đã dịch nội dung)
  alternateLinks: false,
  pathnames: {
    '/': '/',
    '/products': { vi: '/san-pham', en: '/products' },
    '/products/[slug]': { vi: '/san-pham/[slug]', en: '/products/[slug]' },
    '/applications': { vi: '/giai-phap-ung-dung', en: '/applications' },
    '/applications/[slug]': { vi: '/giai-phap-ung-dung/[slug]', en: '/applications/[slug]' },
    '/projects': { vi: '/du-an', en: '/projects' },
    '/projects/[slug]': { vi: '/du-an/[slug]', en: '/projects/[slug]' },
    '/tech-library': { vi: '/thu-vien-tai-lieu', en: '/tech-library' },
    '/construction-guide': { vi: '/huong-dan-thi-cong', en: '/construction-guide' },
    '/quote': { vi: '/bao-gia', en: '/quote' },
    '/dealer': { vi: '/dai-ly', en: '/dealer' },
    '/sample-request': { vi: '/nhan-mau-thu', en: '/sample-request' },
    '/about': { vi: '/gioi-thieu', en: '/about' },
    '/news': { vi: '/tin-tuc', en: '/news' },
    '/news/[slug]': { vi: '/tin-tuc/[slug]', en: '/news/[slug]' },
    '/faq': '/faq',
  },
});

export type Locale = (typeof routing.locales)[number];
