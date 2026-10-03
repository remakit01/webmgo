import type { Metadata } from 'next';
import QuoteClient from './QuoteClient';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';

export const metadata: Metadata = {
  title: 'Báo Giá Tấm MGO Remak® FireOFF | Nhận Báo Giá Trong 2 Giờ',
  description: 'Yêu cầu báo giá tấm MGO chống cháy Remak® FireOFF. Kỹ sư PCCC tư vấn và gửi báo giá chi tiết kèm hồ sơ kỹ thuật IBST trong vòng 2 giờ làm việc.',
};

export default async function BaoGiaPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale as Locale);
  return <QuoteClient />;
}
