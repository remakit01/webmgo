import React from 'react';
import { ChevronRight, FileText } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { NewsCategoryPublic, NewsListItem, NewsListResponse } from '@remak/shared/contracts/news';
import Link from '@/components/ui/LocaleLink';
import JsonLd from '@/components/shared/JsonLd';
import type { Locale } from '@/i18n/routing';
import { absoluteUrl } from '@/lib/seo';
import { newsCategoryPath, newsIndexPath } from '@/lib/news-paths';
import { NewsRow, NewsTile, NewsCoverImage } from './NewsCards';
import NewsCarousel from './NewsCarousel';
import NewsLoadMore from './NewsLoadMore';
import PopularNews from './PopularNews';

export const NEWS_PAGE_SIZE = 12;

/**
 * Thân trang Tin tức (dùng chung cho /tin-tuc và /tin-tuc/chuyen-muc/[slug]).
 * Dữ liệu đã lấy ở page (Server Component, ISR); phần tương tác (cuộn, xem thêm) là client island nhỏ.
 */
export default async function NewsIndexView({
  locale,
  categories,
  latest,
  featured,
  activeCategory,
}: {
  locale: Locale;
  categories: NewsCategoryPublic[];
  latest: NewsListResponse;
  /** Bài nổi bật (chỉ trang tổng) — 5 bài đầu lên khối tiêu điểm, phần còn lại vào "Đáng chú ý" */
  featured: NewsListItem[];
  activeCategory?: NewsCategoryPublic;
}) {
  const t = await getTranslations('News');
  const isIndex = !activeCategory;

  // Khối tiêu điểm: bài nổi bật, thiếu thì bù bằng bài mới nhất
  const hero: NewsListItem[] = [];
  if (isIndex) {
    for (const item of [...featured.slice(0, 5), ...latest.items]) {
      if (hero.length >= 5) break;
      if (!hero.some((h) => h.id === item.id)) hero.push(item);
    }
  }
  const heroIds = new Set(hero.map((h) => h.id));
  const highlights = isIndex ? featured.slice(5).filter((i) => !heroIds.has(i.id)) : [];
  const feed = latest.items.filter((i) => !heroIds.has(i.id));
  const [main, ...sides] = hero;

  const title = activeCategory?.name ?? t('title');
  const breadcrumb = [
    { name: t('home'), path: locale === 'vi' ? '/' : '/en' },
    { name: t('title'), path: newsIndexPath(locale) },
    ...(activeCategory ? [{ name: activeCategory.name, path: newsCategoryPath(locale, activeCategory.slug) }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-10">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumb.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, item: absoluteUrl(b.path) })),
        }}
      />
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-8 sm:space-y-10">
        {/* Breadcrumb + tiêu đề + chuyên mục */}
        <header className="space-y-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#5F8A03] transition-colors">{t('home')}</Link>
            <ChevronRight size={14} className="text-slate-400 shrink-0" aria-hidden="true" />
            {activeCategory ? (
              <>
                <Link href="/tin-tuc" className="hover:text-[#5F8A03] transition-colors">{t('title')}</Link>
                <ChevronRight size={14} className="text-slate-400 shrink-0" aria-hidden="true" />
                <span className="text-[#5F8A03] font-bold" aria-current="page">{activeCategory.name}</span>
              </>
            ) : (
              <span className="text-[#5F8A03] font-bold" aria-current="page">{t('title')}</span>
            )}
          </nav>

          <h1 className={activeCategory ? 'text-2xl sm:text-3xl font-black text-slate-900 tracking-tight' : 'sr-only'}>{title}</h1>
          {activeCategory?.description && <p className="text-sm text-slate-600 max-w-3xl">{activeCategory.description}</p>}

          <nav aria-label={t('categoriesLabel')} className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
            {[{ id: 'all', slug: '', name: t('allCategories') }, ...categories].map((cat) => {
              const active = cat.id === 'all' ? isIndex : cat.id === activeCategory?.id;
              return (
                <Link
                  key={cat.id}
                  href={cat.id === 'all' ? '/tin-tuc' : `/tin-tuc/chuyen-muc/${cat.slug}`}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-remak-green-dark text-white border-remak-green-dark font-bold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:text-slate-900 font-semibold'
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </nav>
        </header>

        {/* Khối tiêu điểm: 2 tin phụ trái - 1 tin chính giữa - 2 tin phụ phải */}
        {main && (
          <section aria-label={t('highlights')} className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
            <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-5 content-between">
              {sides.slice(0, 2).map((item) => (
                <NewsTile key={item.id} item={item} sizes="(min-width: 1024px) 22vw, 50vw" />
              ))}
            </div>
            <article className="lg:col-span-6 order-first lg:order-none flex flex-col group">
              <Link href={`/tin-tuc/${main.slug}`} className="block relative w-full aspect-[16/10] overflow-hidden rounded-lg bg-slate-100" tabIndex={-1} aria-hidden="true">
                <NewsCoverImage item={main} sizes="(min-width: 1024px) 45vw, 100vw" priority className="transition-transform duration-700 group-hover:scale-[1.03]" />
              </Link>
              <h2 className="text-lg sm:text-xl lg:text-[22px] font-black text-slate-900 leading-tight line-clamp-2 mt-3 group-hover:text-remak-green-dark transition-colors">
                <Link href={`/tin-tuc/${main.slug}`}>{main.title}</Link>
              </h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-2">{main.sapo}</p>
            </article>
            <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-5 content-between">
              {sides.slice(2, 4).map((item) => (
                <NewsTile key={item.id} item={item} sizes="(min-width: 1024px) 22vw, 50vw" />
              ))}
            </div>
          </section>
        )}

        {highlights.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">{t('highlights')}</h2>
            <NewsCarousel>
              {highlights.map((item) => (
                <NewsTile key={item.id} item={item} sizes="(min-width: 1024px) 25vw, 260px" />
              ))}
            </NewsCarousel>
          </section>
        )}

        {/* Xem nhiều nhất 7 ngày — chỉ ở trang Tin tức chính */}
        {isIndex && <PopularNews locale={locale} variant="strip" />}

        {/* Dòng thời gian tin mới */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">{activeCategory ? activeCategory.name : t('latest')}</h2>
          {feed.length === 0 && !main ? (
            <div className="border border-slate-200 rounded-xl p-8 text-center space-y-3 bg-white">
              <FileText size={36} className="mx-auto text-slate-400" aria-hidden="true" />
              <p className="text-sm font-semibold text-slate-700">{t('empty')}</p>
              {activeCategory && (
                <Link href="/tin-tuc" className="inline-block px-4 py-2 bg-remak-green-dark text-white font-bold text-xs rounded-lg hover:bg-remak-green transition-colors">
                  {t('viewAllNews')}
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {feed.map((item) => (
                <NewsRow key={item.id} item={item} readingLabel={t('readingTime', { minutes: item.readingMinutes })} readMoreLabel={t('readMore')} />
              ))}
            </div>
          )}
          <NewsLoadMore
            category={activeCategory?.slug}
            startPage={latest.page}
            totalPages={latest.totalPages}
            pageSize={latest.pageSize}
            excludeIds={[...heroIds, ...feed.map((f) => f.id)]}
          />
        </section>
      </div>
    </div>
  );
}
