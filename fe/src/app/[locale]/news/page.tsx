import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import NewsIndexView, { NEWS_PAGE_SIZE } from '@/components/news/NewsIndexView';
import type { Locale } from '@/i18n/routing';
import { getNewsCategories, getNewsList } from '@/lib/api';
import { indexable, localizedAlternates } from '@/lib/seo';

// ISR: dựng tĩnh, làm mới tối đa mỗi 60s; CMS lưu/xuất bản -> API gọi /api/revalidate (tag "news") làm mới ngay
export const revalidate = 60;

/** Bài nổi bật: 5 bài khối tiêu điểm + tối đa 8 bài "Đáng chú ý" */
const FEATURED_LIMIT = 13;

export async function generateMetadata({ params }: PageProps<'/[locale]/news'>): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: 'News' });
  const latest = await getNewsList(locale, { pageSize: 1 });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: localizedAlternates({ vi: '/tin-tuc', en: '/en/news' }, locale),
    openGraph: { title: t('metaTitle'), description: t('metaDescription'), type: 'website' },
    // /en/news chỉ cho index khi đã có bài tiếng Anh
    ...(locale === 'en' ? { robots: indexable((latest?.total ?? 0) > 0) } : {}),
  };
}

export default async function NewsPage({ params }: PageProps<'/[locale]/news'>) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);

  const [categories, latest, featured] = await Promise.all([
    getNewsCategories(locale),
    getNewsList(locale, { pageSize: NEWS_PAGE_SIZE }),
    getNewsList(locale, { featured: true, pageSize: FEATURED_LIMIT }),
  ]);

  return (
    <NewsIndexView
      locale={locale}
      categories={categories ?? []}
      latest={latest ?? { items: [], page: 1, pageSize: NEWS_PAGE_SIZE, total: 0, totalPages: 1 }}
      featured={featured?.items ?? []}
    />
  );
}
