import { MetadataRoute } from 'next';
import { PRODUCTS } from '@/data/products';
import { routing } from '@/i18n/routing';
import { getNewsCategories, getNewsSitemap } from '@/lib/api';
import { newsCategoryPath, newsPostPath } from '@/lib/news-paths';

// Sitemap làm mới cùng nhịp ISR để bài mới xuất hiện sớm
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mgo.remak.vn';
  const currentDate = new Date();

  const productRoutes: MetadataRoute.Sitemap = PRODUCTS.map((product) => ({
    url: `${baseUrl}/san-pham/${product.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/san-pham`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/giai-phap-ung-dung`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/du-an`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bao-gia`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/dai-ly`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/thu-vien-tai-lieu`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/huong-dan-thi-cong`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tin-tuc`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Tin tức: mỗi bài một URL / ngôn ngữ đã xuất bản, kèm hreflang tới bản ngôn ngữ kia (slug theo ngôn ngữ)
  const [newsEntries, ...categoryLists] = await Promise.all([
    getNewsSitemap(),
    ...routing.locales.map((l) => getNewsCategories(l)),
  ]);
  const newsRoutes: MetadataRoute.Sitemap = (newsEntries ?? []).flatMap((entry) => {
    const languages = Object.fromEntries(
      Object.entries(entry.slugs).map(([l, slug]) => [l, `${baseUrl}${newsPostPath(l as (typeof routing.locales)[number], slug!)}`]),
    );
    return Object.values(languages).map((url) => ({
      url,
      lastModified: new Date(entry.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      ...(Object.keys(languages).length > 1 ? { alternates: { languages } } : {}),
    }));
  });
  const hasEnglishNews = (newsEntries ?? []).some((e) => e.slugs.en);
  const categoryRoutes: MetadataRoute.Sitemap = routing.locales.flatMap((l, i) =>
    l === 'en' && !hasEnglishNews
      ? []
      : (categoryLists[i] ?? []).map((c) => ({
          url: `${baseUrl}${newsCategoryPath(l, c.slug)}`,
          lastModified: currentDate,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        })),
  );
  const newsIndexEn: MetadataRoute.Sitemap = hasEnglishNews
    ? [{ url: `${baseUrl}/en/news`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.7, alternates: { languages: { vi: `${baseUrl}/tin-tuc`, en: `${baseUrl}/en/news` } } }]
    : [];

  return [...staticRoutes, ...productRoutes, ...newsIndexEn, ...categoryRoutes, ...newsRoutes];
}
