import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import NewsIndexView, { NEWS_PAGE_SIZE } from '@/components/news/NewsIndexView';
import { SetLocaleAlternates } from '@/components/layout/LocaleAlternates';
import { routing, type Locale } from '@/i18n/routing';
import { getNewsCategories, getNewsList } from '@/lib/api';
import { newsCategoryPath } from '@/lib/news-paths';
import { indexable, localizedAlternates } from '@/lib/seo';

export const revalidate = 60;

type Props = PageProps<'/[locale]/news/category/[slug]'>;

/** Chuyên mục theo slug của ngôn ngữ đang xem, kèm slug của chuyên mục đó ở mọi ngôn ngữ (hreflang, đổi ngôn ngữ) */
async function loadCategory(locale: Locale, slug: string) {
  const lists = await Promise.all(routing.locales.map((l) => getNewsCategories(l)));
  const current = lists[routing.locales.indexOf(locale)]?.find((c) => c.slug === slug);
  if (!current) return null;
  const paths = Object.fromEntries(
    routing.locales.map((l, i) => {
      const c = lists[i]?.find((x) => x.id === current.id);
      return [l, c ? newsCategoryPath(l, c.slug) : undefined];
    }),
  ) as Partial<Record<Locale, string>>;
  return { category: current, categories: lists[routing.locales.indexOf(locale)] ?? [], paths };
}

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const categories = await getNewsCategories(params.locale as Locale);
  return (categories ?? []).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const data = await loadCategory(locale, slug);
  if (!data) return {};
  const t = await getTranslations({ locale, namespace: 'News' });
  const title = data.category.seoTitle || `${data.category.name} | ${t('title')} Remak®`;
  const description = data.category.seoDescription || data.category.description || t('metaDescription');
  return {
    title,
    description,
    alternates: localizedAlternates(data.paths, locale),
    openGraph: { title, description, type: 'website' },
    ...(locale === 'en' ? { robots: indexable(true) } : {}),
  };
}

export default async function NewsCategoryPage({ params }: Props) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  setRequestLocale(locale);
  const data = await loadCategory(locale, slug);
  if (!data) notFound();

  const latest = await getNewsList(locale, { category: slug, pageSize: NEWS_PAGE_SIZE });
  return (
    <>
      <SetLocaleAlternates paths={{ vi: data.paths.vi ?? '/tin-tuc', en: data.paths.en ?? '/en/news' }} />
      <NewsIndexView
        locale={locale}
        categories={data.categories}
        latest={latest ?? { items: [], page: 1, pageSize: NEWS_PAGE_SIZE, total: 0, totalPages: 1 }}
        featured={[]}
        activeCategory={data.category}
      />
    </>
  );
}
