import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';

export const metadata: Metadata = {
  title: 'Sản Phẩm Tấm MGO Remak® FireOFF - Chống Cháy A1 Chuẩn PCCC QCVN 06:2022',
  description: 'Danh mục đầy đủ tấm chống cháy MGO Remak® FireOFF: bọc ống gió PCCC, vách ngăn chống cháy, lót sàn chịu lực, tiêu âm. Giá nhà máy, đã kiểm định IBST, giao hàng toàn quốc.',
  alternates: {
    canonical: '/san-pham',
  },
};

export default async function ProductsLayout({ children, params }: LayoutProps<'/[locale]/products'>) {
  setRequestLocale((await params).locale as Locale);
  return children;
}
