import type { Metadata } from 'next';
import { SampleRequestHero, SampleRequestBenefits, SampleRequestClientView } from '@/components/sample-request';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';

export const metadata: Metadata = {
  title: 'Nhận Mẫu Thử Miễn Phí | Remak® MGO FireOFF',
  description: 'Nhận mẫu tấm MGO FireOFF thực tế, kèm hồ sơ kỹ thuật đầy đủ. Giao miễn phí trong 3 ngày làm việc đến 63 tỉnh thành. Không thanh toán, không ràng buộc.',
};

export default async function SampleRequestPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale as Locale);
  return (
    <>
      <SampleRequestHero />
      <SampleRequestBenefits />
      <SampleRequestClientView />
    </>
  );
}
