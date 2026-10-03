import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Định tuyến ngôn ngữ: "/san-pham" -> app/[locale]/products (vi), "/en/products" -> (en)
export default createMiddleware(routing);

export const config = {
  // Bỏ qua API, CMS, file nội bộ của Next và mọi file tĩnh (có dấu chấm: .png, .xml, .txt...)
  // Lưu ý: phải là "\\." trong chuỗi JS (= \. trong regex); viết "\." sẽ thành "." và chặn mọi URL trừ "/"
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
};
