import type { Metadata } from 'next';
import type { Locale } from '@/i18n/routing';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mgo.remak.vn').replace(/\/+$/, '');

export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

/**
 * canonical + hreflang cho trang có bản ở nhiều ngôn ngữ (Localized URLs).
 * Chỉ khai báo ngôn ngữ thực sự có bản (bài chưa dịch thì không có hreflang en); x-default trỏ về tiếng Việt.
 * Đường dẫn tương đối — layout đã đặt metadataBase.
 */
export function localizedAlternates(paths: Partial<Record<Locale, string>>, current: Locale): Metadata['alternates'] {
  const languages: Record<string, string> = {};
  for (const [locale, path] of Object.entries(paths)) if (path) languages[locale] = path;
  const xDefault = paths.vi ?? paths[current];
  if (Object.keys(languages).length > 1 && xDefault) languages['x-default'] = xDefault;
  return { canonical: paths[current], languages };
}

/**
 * Trang /en đang noindex ở layout (nội dung phần lớn còn tiếng Việt); trang có nội dung tiếng Anh thật
 * (vd bài viết đã dịch & xuất bản) ghi đè để cho index.
 */
export const indexable = (index: boolean): Metadata['robots'] => ({ index, follow: true });
