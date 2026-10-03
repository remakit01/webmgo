import type { Metadata } from 'next';
import { AboutHero, AboutContent } from '@/components/about';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';

export const metadata: Metadata = {
  title: 'Giới Thiệu | Remak® MGO FireOFF',
  description: 'Công Ty Cổ Phần Xây Dựng Và Nội Thất Remak — Chuyên gia vật liệu chống cháy MGO FireOFF, kiểm định IBST, tin dùng tại hơn 200 công trình PCCC toàn quốc.',
};

export default async function GioiThieuPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale as Locale);
  return (
    <>
      <AboutHero />
      <AboutContent />
    </>
  );
}
