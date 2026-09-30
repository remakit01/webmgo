import type { Metadata } from 'next';
import QuoteClient from './QuoteClient';

export const metadata: Metadata = {
  title: 'Báo Giá Tấm MGO Remak® FireOFF | Nhận Báo Giá Trong 2 Giờ',
  description: 'Yêu cầu báo giá tấm MGO chống cháy Remak® FireOFF. Kỹ sư PCCC tư vấn và gửi báo giá chi tiết kèm hồ sơ kỹ thuật IBST trong vòng 2 giờ làm việc.',
};

export default function BaoGiaPage() {
  return <QuoteClient />;
}
