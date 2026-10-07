'use client';

import React, { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import NewsEditor from '@/cms/components/news/NewsEditor';
import type { Locale } from '@remak/shared/locale';

export default function AdminNewsEditPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <Suspense fallback={null}>
      <NewsEditWrapper id={id} />
    </Suspense>
  );
}

function NewsEditWrapper({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const rawLocale = searchParams.get('locale') || searchParams.get('tab');
  const initialTab: Locale = rawLocale === 'en' ? 'en' : 'vi';

  // key: đổi bài hoặc đổi tab qua URL thì khởi tạo lại editor với tab tương ứng
  return <NewsEditor key={`${id}-${initialTab}`} postId={id} initialTab={initialTab} />;
}
