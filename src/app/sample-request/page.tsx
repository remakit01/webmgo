import type { Metadata } from 'next';
import { SampleRequestHero, SampleRequestBenefits, SampleRequestClientView } from '@/components/sample-request';

export const metadata: Metadata = {
  title: 'Nhận Mẫu Thử Miễn Phí | Remak® MGO FireOFF',
  description: 'Nhận mẫu tấm MGO FireOFF thực tế, kèm hồ sơ kỹ thuật đầy đủ. Giao miễn phí trong 3 ngày làm việc đến 63 tỉnh thành. Không thanh toán, không ràng buộc.',
};

export default function SampleRequestPage() {
  return (
    <>
      <SampleRequestHero />
      <SampleRequestBenefits />
      <SampleRequestClientView />
    </>
  );
}
