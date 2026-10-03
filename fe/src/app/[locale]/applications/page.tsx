import type { Metadata } from 'next';
import { ApplicationsClientView } from '@/components/applications';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';

export const metadata: Metadata = {
  title: 'Ứng Dụng Tấm Chống Cháy MGO Remak® FireOFF - Chuẩn PCCC QCVN 06:2022/BXD',
  description: 'Khám phá các giải pháp ứng dụng tấm MGO Remak: Ốp bọc ống gió PCCC, vách ngăn chống cháy karaoke, lót sàn chịu lực, tường bao che ngoại thất và làm lõi cửa chống cháy.',
  openGraph: {
    title: 'Giải Pháp & Ứng Dụng Tấm Chống Cháy MGO Remak® FireOFF',
    description: 'Hệ thống giải pháp chống cháy lan EI 30 - EI 180 cho ống gió PCCC, vách tiêu âm và sàn chịu lực.',
    images: ['/images/mgo-duct.jpg'],
  },
};

export default async function ApplicationsPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale as Locale);
  return <ApplicationsClientView />;
}
