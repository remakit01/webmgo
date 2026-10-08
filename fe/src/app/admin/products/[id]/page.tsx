'use client';

import { useParams } from 'next/navigation';
import ProductEditor from '@/cms/components/products/ProductEditor';

export default function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>();
  // key: chuyển sang sản phẩm khác thì khởi tạo lại form
  return <ProductEditor key={id} productId={id} />;
}
