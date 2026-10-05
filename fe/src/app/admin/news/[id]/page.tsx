'use client';

import { useParams } from 'next/navigation';
import NewsEditor from '@/cms/components/news/NewsEditor';

export default function AdminNewsEditPage() {
  const { id } = useParams<{ id: string }>();
  // key: đổi bài (vd sau khi tạo mới) thì dựng lại form từ đầu
  return <NewsEditor key={id} postId={id} />;
}
