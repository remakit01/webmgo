// Chuyển đổi dữ liệu bài viết giữa API (NewsPostCms) và bản nháp trên form soạn bài.

import type { Locale } from '@remak/shared/locale';
import { EMPTY_RICH_DOC, stableStringify, toPlainText, validateRichDoc } from '@remak/shared/rich-content';
import { isValidSlug, slugify } from '@remak/shared/slug';
import type { NewsPostCms, NewsTranslationCms, RichDoc, TranslationOrigin } from '@/types/news';
import type { NewsMetaInput, NewsTranslationInput } from '@/cms/lib/news-api';

export interface TranslationDraft {
  title: string;
  slug: string;
  sapo: string;
  content: RichDoc;
  coverAlt: string;
  coverCaption: string;
  focusKeyword: string;
  seoTitle: string;
  seoDescription: string;
  noindex: boolean;
  sourceName: string;
  sourceUrl: string;
  /** Gửi kèm khi lưu: bản nháp do AI dịch / đánh dấu đã theo kịp bản Việt */
  origin?: TranslationOrigin;
  sourceUpdatedAt?: string;
}

export interface MetaDraft {
  categoryId: string;
  authorId: string;
  tagIds: string[];
  isFeatured: boolean;
}

export const EMPTY_TRANSLATION: TranslationDraft = {
  title: '',
  slug: '',
  sapo: '',
  content: EMPTY_RICH_DOC,
  coverAlt: '',
  coverCaption: '',
  focusKeyword: '',
  seoTitle: '',
  seoDescription: '',
  noindex: false,
  sourceName: '',
  sourceUrl: '',
};

export const EMPTY_META: MetaDraft = { categoryId: '', authorId: '', tagIds: [], isFeatured: false };

export function toTranslationDraft(t: NewsTranslationCms | undefined): TranslationDraft {
  if (!t) return EMPTY_TRANSLATION;
  return {
    title: t.title,
    slug: t.slug,
    sapo: t.sapo,
    content: t.content,
    coverAlt: t.coverAlt,
    coverCaption: t.coverCaption ?? '',
    focusKeyword: t.focusKeyword ?? '',
    seoTitle: t.seoTitle ?? '',
    seoDescription: t.seoDescription ?? '',
    noindex: t.noindex,
    sourceName: t.sourceName ?? '',
    sourceUrl: t.sourceUrl ?? '',
  };
}

export function toMetaDraft(post: NewsPostCms | null): MetaDraft {
  if (!post) return EMPTY_META;
  return { categoryId: post.categoryId, authorId: post.authorId ?? '', tagIds: [...post.tagIds].sort(), isFeatured: post.isFeatured };
}

/**
 * @param savedSlug slug đang lưu trên máy chủ (undefined = bản dịch chưa từng lưu).
 * Bản dịch mới mà slug vẫn đúng bằng slug tự sinh từ tiêu đề -> không gửi slug, để máy chủ tự chọn slug
 * không trùng (thêm -2, -3...) thay vì báo lỗi trùng như slug người dùng tự nhập.
 */
export function toTranslationInput(d: TranslationDraft, savedSlug?: string): NewsTranslationInput {
  const slug = d.slug.trim();
  const autoSlug = !savedSlug && slug === slugify(d.title);
  return {
    title: d.title.trim(),
    slug: slug && !autoSlug ? slug : undefined,
    sapo: d.sapo.trim(),
    content: d.content,
    coverAlt: d.coverAlt.trim(),
    coverCaption: d.coverCaption.trim() || null,
    focusKeyword: d.focusKeyword.trim() || null,
    seoTitle: d.seoTitle.trim() || null,
    seoDescription: d.seoDescription.trim() || null,
    noindex: d.noindex,
    sourceName: d.sourceName.trim() || null,
    sourceUrl: d.sourceUrl.trim() || null,
    ...(d.origin ? { origin: d.origin } : {}),
    ...(d.sourceUpdatedAt ? { sourceUpdatedAt: d.sourceUpdatedAt } : {}),
  };
}

export function toMetaInput(d: MetaDraft): NewsMetaInput {
  return { categoryId: d.categoryId, authorId: d.authorId || null, tagIds: d.tagIds, isFeatured: d.isFeatured };
}

/** So sánh bỏ qua khác biệt không ý nghĩa: thứ tự key (JSONB), thứ tự tag (đã sort sẵn) */
export const sameJson = (a: unknown, b: unknown) => stableStringify(a) === stableStringify(b);

/** Lỗi kiểm tra trên máy (API kiểm tra lại) — khoá theo tên ô để hiển thị cạnh ô */
export function validateTranslation(d: TranslationDraft, forPublish: boolean): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!d.title.trim()) errors.title = 'Nhập tiêu đề bài viết';
  if (d.slug && !isValidSlug(d.slug)) errors.slug = 'Đường dẫn chỉ gồm chữ thường không dấu, số và gạch ngang';
  const doc = validateRichDoc(d.content);
  if (!doc.ok) errors.content = doc.error;
  if (d.sourceUrl && !/^https?:\/\//.test(d.sourceUrl.trim())) errors.sourceUrl = 'Link nguồn phải bắt đầu bằng http(s)://';
  if (forPublish) {
    if (!d.sapo.trim()) errors.sapo = 'Cần sapo trước khi xuất bản';
    if (!toPlainText(d.content).trim()) errors.content = 'Nội dung đang trống';
    if (!d.coverAlt.trim()) errors.coverAlt = 'Cần mô tả ảnh đại diện (alt) trước khi xuất bản';
  }
  return errors;
}

export const LOCALE_LABEL: Record<Locale, string> = { vi: 'tiếng Việt', en: 'tiếng Anh' };

/** URL công khai của bài theo ngôn ngữ (Localized URL: /tin-tuc/<slug-vi> ⇄ /en/news/<slug-en>) */
export const publicPath = (locale: Locale, slug: string) => (locale === 'vi' ? `/tin-tuc/${slug}` : `/en/news/${slug}`);

/** "2026-10-05T03:00:00Z" -> giá trị cho <input type="datetime-local"> theo giờ máy */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
