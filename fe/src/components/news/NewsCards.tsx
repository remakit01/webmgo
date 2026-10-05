import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { formatDate } from '@remak/shared/locale';
import type { NewsListItem } from '@remak/shared/contracts/news';
import Link from '@/components/ui/LocaleLink';
import ResponsivePicture from '@/components/ui/ResponsivePicture';
import { CATEGORY_COLOR_STYLES } from '@/lib/news-category-colors';

// Thẻ bài viết dùng chung cho trang Tin tức, chuyên mục và trang chủ.
// href viết `/tin-tuc/<slug của ngôn ngữ đang xem>` — LocaleLink tự đổi sang /en/news/... ở trang tiếng Anh.

export function NewsCoverImage({
  item,
  sizes,
  priority,
  className = '',
}: {
  item: Pick<NewsListItem, 'cover' | 'title'>;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!item.cover) return <div className={`w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 ${className}`} aria-hidden="true" />;
  return (
    <ResponsivePicture
      image={{ imageUrl: item.cover.url, images: item.cover.images }}
      alt={item.cover.alt || item.title}
      sizes={sizes}
      priority={priority}
      className={`w-full h-full object-cover ${className}`}
    />
  );
}

export function CategoryChip({ category, link = true }: { category: NewsListItem['category']; link?: boolean }) {
  const cls = `inline-block px-2.5 py-0.5 rounded-md border text-[11px] font-bold ${CATEGORY_COLOR_STYLES[category.color]?.chip ?? CATEGORY_COLOR_STYLES.slate.chip}`;
  if (!link || !category.slug) return <span className={cls}>{category.name}</span>;
  return (
    <Link href={`/tin-tuc/chuyen-muc/${category.slug}`} className={`${cls} hover:opacity-80`}>
      {category.name}
    </Link>
  );
}

export function NewsMeta({ item, readingLabel }: { item: NewsListItem; readingLabel: string }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-slate-500 font-medium">
      <time dateTime={item.publishedAt}>{formatDate(item.publishedAt, item.locale)}</time>
      <span className="inline-flex items-center gap-1">
        <Clock size={12} aria-hidden="true" /> {readingLabel}
      </span>
    </p>
  );
}

/** Ô bài dạng dọc (ảnh trên, tiêu đề dưới) — tin phụ / carousel */
export function NewsTile({ item, sizes, titleClass = 'text-sm', priority }: { item: NewsListItem; sizes: string; titleClass?: string; priority?: boolean }) {
  return (
    <article className="group flex flex-col">
      <Link href={`/tin-tuc/${item.slug}`} className="block aspect-[16/10] overflow-hidden rounded-lg bg-slate-100" tabIndex={-1} aria-hidden="true">
        <NewsCoverImage item={item} sizes={sizes} priority={priority} className="transition-transform duration-500 group-hover:scale-105" />
      </Link>
      <h3 className={`${titleClass} font-bold text-slate-900 leading-snug line-clamp-3 mt-2.5 group-hover:text-remak-green-dark transition-colors`}>
        <Link href={`/tin-tuc/${item.slug}`}>{item.title}</Link>
      </h3>
    </article>
  );
}

/** Dòng bài dạng ngang (ảnh trái, nội dung phải) — dòng thời gian tin mới */
export function NewsRow({ item, readingLabel, readMoreLabel }: { item: NewsListItem; readingLabel: string; readMoreLabel: string }) {
  return (
    <article className="group py-5 first:pt-0 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
      <Link href={`/tin-tuc/${item.slug}`} className="w-full sm:w-60 lg:w-72 shrink-0 aspect-[16/10] overflow-hidden rounded-lg bg-slate-100" tabIndex={-1} aria-hidden="true">
        <NewsCoverImage item={item} sizes="(min-width: 1024px) 288px, (min-width: 640px) 240px, 100vw" className="transition-transform duration-500 group-hover:scale-105" />
      </Link>
      <div className="flex-1 min-w-0 flex flex-col gap-2 sm:self-stretch">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryChip category={item.category} />
          <NewsMeta item={item} readingLabel={readingLabel} />
        </div>
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-remak-green-dark transition-colors">
          <Link href={`/tin-tuc/${item.slug}`}>{item.title}</Link>
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{item.sapo}</p>
        <Link href={`/tin-tuc/${item.slug}`} className="mt-auto inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-remak-green-dark hover:text-remak-green w-fit">
          {readMoreLabel} <ArrowRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
