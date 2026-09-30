import type { Metadata } from 'next';
import { AboutHero, AboutContent } from '@/components/about';

export const metadata: Metadata = {
  title: 'Giới Thiệu | Remak® MGO FireOFF',
  description: 'Công Ty Cổ Phần Xây Dựng Và Nội Thất Remak — Chuyên gia vật liệu chống cháy MGO FireOFF, kiểm định IBST, tin dùng tại hơn 200 công trình PCCC toàn quốc.',
};

export default function GioiThieuPage() {
  return (
    <>
      <AboutHero />
      <AboutContent />
    </>
  );
}
