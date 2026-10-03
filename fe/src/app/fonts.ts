import { Be_Vietnam_Pro } from 'next/font/google';

// Font dùng chung cho 2 root layout: web khách hàng (app/[locale]) và CMS (app/admin)
export const beVietnamPro = Be_Vietnam_Pro({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-be-vietnam-pro',
});
