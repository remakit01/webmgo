import React from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowLeft, ChevronRight, Clock, FileCheck, PhoneCall } from 'lucide-react';
import { formatDate } from '@remak/shared/locale';
import { collectFaqItems, extractHeadings } from '@remak/shared/rich-content';
import Link from '@/components/ui/LocaleLink';
import JsonLd from '@/components/shared/JsonLd';
import { SetLocaleAlternates } from '@/components/layout/LocaleAlternates';
import RichContent from '@/components/news/RichContent';
import ShareButtons from '@/components/news/ShareButtons';
import NewsViewTracker from '@/components/news/NewsViewTracker';
import PopularNews from '@/components/news/PopularNews';
import { CategoryChip, NewsCoverImage, NewsTile } from '@/components/news/NewsCards';
import { routing, type Locale } from '@/i18n/routing';
import { getNewsList, getNewsPost } from '@/lib/api';
import { newsCategoryPath, newsIndexPath, newsPostPath } from '@/lib/news-paths';
import { absoluteUrl, indexable, localizedAlternates } from '@/lib/seo';
import AuthorBox, { hasAuthorBox } from '@/components/news/AuthorBox';

// ISR 60s. Chỉ dựng sẵn các bài mới nhất; bài khác dựng lần đầu có người xem (dynamicParams mặc định true)
export const revalidate = 60;
const PREBUILD_LIMIT = 20;

type Props = PageProps<'/[locale]/news/[slug]'>;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const list = await getNewsList(params.locale as Locale, { pageSize: PREBUILD_LIMIT });
  return (list?.items ?? []).map((item) => ({ slug: item.slug }));
}

/** Đường dẫn bài ở mọi ngôn ngữ ĐÃ xuất bản (hreflang + nút đổi ngôn ngữ) */
function alternatePaths(alternates: Partial<Record<Locale, string>>) {
  return Object.fromEntries(
    routing.locales.flatMap((l) => (alternates[l] ? [[l, newsPostPath(l, alternates[l]!)]] : [])),
  ) as Partial<Record<Locale, string>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const data = await getNewsPost(locale, slug);
  if (!data || 'redirect' in data) return {};
  const { post } = data;
  const t = await getTranslations({ locale, namespace: 'News' });
  const ogImage = post.seo.ogImageUrl ?? undefined;
  return {
    title: `${post.seo.title} | ${t('title')} Remak®`,
    description: post.seo.description,
    alternates: localizedAlternates(alternatePaths(post.alternates), locale),
    openGraph: {
      type: 'article',
      title: post.seo.title,
      description: post.seo.description,
      url: newsPostPath(locale, post.slug),
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      section: post.category.name,
      tags: post.tags.map((tag) => tag.name),
      ...(ogImage ? { images: [{ url: ogImage, alt: post.cover?.alt ?? post.title }] } : {}),
    },
    twitter: { card: 'summary_large_image', title: post.seo.title, description: post.seo.description, ...(ogImage ? { images: [ogImage] } : {}) },
    // Bài đã xuất bản ở ngôn ngữ này là nội dung thật -> cho index (kể cả /en), trừ khi biên tập viên chọn noindex
    robots: indexable(!post.seo.noindex),
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  setRequestLocale(locale);

  const data = await getNewsPost(locale, slug);
  if (!data) notFound();
  // Slug cũ (đổi sau khi đăng) -> 301 sang slug hiện tại, giữ SEO và link cũ
  if ('redirect' in data) permanentRedirect(newsPostPath(locale, data.redirect));

  const { post, related } = data;
  const t = await getTranslations('News');
  const tCommon = await getTranslations('Common');
  const headings = extractHeadings(post.content).filter((h) => h.level <= 3);
  const paths = alternatePaths(post.alternates);
  const url = absoluteUrl(newsPostPath(locale, post.slug));
  const readingLabel = t('readingTime', { minutes: post.readingMinutes });
  const faqItems = collectFaqItems(post.content);
  // Hiện "Cập nhật lần cuối" khi nội dung được sửa sau ngày đăng hơn 1 ngày (tín hiệu độ mới cho Google / AI)
  const updatedLater = new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() > 24 * 60 * 60 * 1000;

  return (
    <div className="min-h-screen bg-slate-50 py-8 lg:py-12">
      {/* Nút đổi ngôn ngữ: sang đúng bài ở ngôn ngữ kia; bài chưa dịch -> về trang Tin tức của ngôn ngữ đó */}
      <SetLocaleAlternates paths={{ vi: paths.vi ?? newsIndexPath('vi'), en: paths.en ?? newsIndexPath('en') }} />
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: post.title,
            description: post.seo.description,
            inLanguage: locale,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            mainEntityOfPage: url,
            ...(post.cover ? { image: [post.cover.url] } : {}),
            articleSection: post.category.name,
            keywords: post.tags.map((tag) => tag.name).join(', ') || undefined,
            author: post.author
              ? {
                  '@type': 'Person',
                  name: post.author.name,
                  ...(post.author.jobTitle ? { jobTitle: post.author.jobTitle } : {}),
                  ...(post.author.bio ? { description: post.author.bio } : {}),
                  ...(post.author.avatarUrl ? { image: post.author.avatarUrl } : {}),
                  worksFor: { '@type': 'Organization', name: 'Remak® Vietnam' },
                }
              : { '@type': 'Organization', name: 'Remak®' },
            publisher: { '@type': 'Organization', '@id': absoluteUrl('/#organization'), name: 'Remak® Vietnam', logo: { '@type': 'ImageObject', url: absoluteUrl('/Logo_remak_800.png') } },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: t('home'), item: absoluteUrl(locale === 'vi' ? '/' : '/en') },
              { '@type': 'ListItem', position: 2, name: t('title'), item: absoluteUrl(newsIndexPath(locale)) },
              { '@type': 'ListItem', position: 3, name: post.category.name, item: absoluteUrl(newsCategoryPath(locale, post.category.slug)) },
              { '@type': 'ListItem', position: 4, name: post.title, item: url },
            ],
          },
          // Khối FAQ trong bài -> FAQPage (giúp Google & trợ lý AI trích câu trả lời)
          ...(faqItems.length
            ? [
                {
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  inLanguage: locale,
                  mainEntity: faqItems.map((f) => ({
                    '@type': 'Question',
                    name: f.question,
                    acceptedAnswer: { '@type': 'Answer', text: f.answer },
                  })),
                },
              ]
            : []),
        ]}
      />

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 pb-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-[#5F8A03] transition-colors">{t('home')}</Link>
            <ChevronRight size={13} className="text-slate-400 shrink-0" aria-hidden="true" />
            <Link href="/tin-tuc" className="hover:text-[#5F8A03] transition-colors">{t('title')}</Link>
            <ChevronRight size={13} className="text-slate-400 shrink-0" aria-hidden="true" />
            <Link
              href={`/tin-tuc/chuyen-muc/${post.category.slug}`}
              className="text-[#5F8A03] font-bold hover:underline transition-colors"
              aria-current="page"
            >
              {post.category.name}
            </Link>
          </nav>
          <Link href="/tin-tuc" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5F8A03] hover:text-[#7CB305] shrink-0 transition-colors">
            <ArrowLeft size={14} aria-hidden="true" /> {t('backToList')}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <article className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-10 border-2 border-slate-200 shadow-xs space-y-7">
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-semibold">
                <CategoryChip category={post.category} />
                {post.author && (
                  <>
                    <span className="text-slate-300" aria-hidden="true">•</span>
                    <span>{post.author.name}</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight">{post.title}</h1>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
                {updatedLater && (
                  <time dateTime={post.updatedAt} className="text-remak-green-dark font-semibold">
                    {t('updatedAt', { date: formatDate(post.updatedAt, locale) })}
                  </time>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={13} className="text-remak-green" aria-hidden="true" /> {readingLabel}
                </span>
                <NewsViewTracker postId={post.id} locale={locale} bodyId="news-article-body" />
              </p>
            </header>

            {/* Sapo */}
            <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">{post.sapo}</p>

            {post.cover && (
              <figure className="space-y-2">
                <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                  <NewsCoverImage item={post} sizes="(min-width: 1024px) 60vw, 100vw" priority />
                </div>
                {post.cover.caption && <figcaption className="text-center text-xs italic text-slate-500">{post.cover.caption}</figcaption>}
              </figure>
            )}

            {headings.length >= 3 && (
              <nav aria-label={t('toc')} className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500 mb-2">{t('toc')}</p>
                <ol className="space-y-1.5 text-sm">
                  {headings.map((h) => (
                    <li key={h.id} className={h.level === 3 ? 'pl-4' : ''}>
                      <a href={`#${h.id}`} className="text-slate-700 hover:text-remak-green-dark font-medium">{h.text}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <div id="news-article-body">
              <RichContent doc={post.content} relatedRefs={post.relatedRefs} />
            </div>

            {post.source && (
              <p className="text-right text-sm font-semibold text-slate-600">
                {post.source.url ? (
                  <a href={post.source.url} target="_blank" rel="noopener noreferrer nofollow" className="hover:text-remak-green-dark underline underline-offset-2">
                    {t('by', { name: post.source.name })}
                  </a>
                ) : (
                  t('by', { name: post.source.name })
                )}
              </p>
            )}

            {/* Hộp tác giả (E-E-A-T): chuyên gia đứng tên bài */}
            {post.author && hasAuthorBox(post.author) && <AuthorBox author={post.author} label={t('aboutAuthor')} />}

            <footer className="pt-6 border-t-2 border-slate-100 space-y-4">
              {post.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 mr-1">{t('tags')}:</span>
                  {post.tags.map((tag) => (
                    <span key={tag.id} className="px-3 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200">
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}
              <ShareButtons url={url} title={post.title} />
            </footer>
          </article>

          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-xs space-y-4">
              <h2 className="font-black text-slate-900 text-lg border-b border-slate-100 pb-3">{t('consultTitle')}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{t('consultText')}</p>
              <div className="space-y-2.5">
                <a href="tel:0902441981" className="w-full py-3 px-4 rounded-xl bg-remak-orange hover:bg-remak-orange-dark text-white text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors">
                  <PhoneCall size={16} aria-hidden="true" /> {tCommon('hotline', { phone: '0902.441.981' })}
                </a>
                <Link href="/nhan-mau-thu" className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold border-2 border-slate-300 flex items-center justify-center gap-2 transition-colors">
                  <FileCheck size={16} className="text-remak-green-dark" aria-hidden="true" /> {t('sampleCta')}
                </Link>
              </div>
            </div>

            {related.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-xs space-y-4">
                <h2 className="font-black text-slate-900 text-lg border-b border-slate-100 pb-3">{t('related')}</h2>
                <div className="space-y-5">
                  {related.map((item) => (
                    <NewsTile key={item.id} item={item} sizes="(min-width: 1024px) 25vw, 100vw" titleClass="text-sm" />
                  ))}
                </div>
              </div>
            )}

            <PopularNews locale={locale} excludeId={post.id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
