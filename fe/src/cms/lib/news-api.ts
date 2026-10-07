'use client';

// Gọi API Tin tức từ CMS — gom một chỗ để các trang (danh sách, soạn bài, chuyên mục, trang chủ) dùng chung.

import type { Locale } from '@remak/shared/locale';
import type {
  NewsAiDraft,
  NewsAiDraftEvent,
  NewsAuthorCms,
  NewsCategoryCms,
  NewsCategoryColor,
  NewsPostCms,
  NewsPostListItemCms,
  NewsTagCms,
  Paginated,
  PublishStatus,
  RichDoc,
  TranslationOrigin,
} from '@/types/news';
import type { NewsPostStats, NewsStatsOverview } from '@remak/shared/contracts/news-stats';
import type { NEWS_LIST_VIEW_DAYS, NewsListSort, NewsListViewFilter, NewsTagFilter, NewsTagSort, NewsTagStats } from '@remak/shared/contracts/news';
import { apiFetch, apiStreamNdjson, ifMatch } from './api-client';

export interface NewsTranslationInput {
  title: string;
  slug?: string;
  sapo: string;
  content: RichDoc;
  coverAlt?: string;
  coverCaption?: string | null;
  focusKeyword?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
  noindex?: boolean;
  sourceName?: string | null;
  sourceUrl?: string | null;
  origin?: TranslationOrigin;
  sourceUpdatedAt?: string;
}

export interface NewsMetaInput {
  categoryId?: string;
  authorId?: string | null;
  tagIds?: string[];
  isFeatured?: boolean;
  featuredOrder?: number | null;
}

export interface NewsListQuery {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: PublishStatus;
  locale?: Locale;
  categoryId?: string;
  trash?: boolean;
  featured?: boolean;
  missing?: Locale;
  /** Khoảng ngày cập nhật (DayKey 'YYYY-MM-DD', giờ Việt Nam) */
  fromDate?: string;
  toDate?: string;
  views?: NewsListViewFilter;
  /** Kỳ tính lượt xem (ngày); bỏ trống = từ trước tới nay */
  viewsDays?: (typeof NEWS_LIST_VIEW_DAYS)[number];
  sort?: NewsListSort;
}

const json = (body: unknown) => JSON.stringify(body);

function toQuery(params: object) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '' && v !== false) q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const newsApi = {
  // ── Bài viết ──
  list: (query: NewsListQuery = {}) => apiFetch<Paginated<NewsPostListItemCms>>(`/news/posts${toQuery(query)}`),
  get: (id: string) => apiFetch<NewsPostCms>(`/news/posts/${id}`),
  create: (body: NewsMetaInput & { categoryId: string; translation: NewsTranslationInput }) =>
    apiFetch<NewsPostCms>('/news/posts', { method: 'POST', body: json(body) }),
  updateMeta: (id: string, body: NewsMetaInput, version: string) =>
    apiFetch<NewsPostCms>(`/news/posts/${id}`, { method: 'PATCH', body: json(body), headers: ifMatch(version) }),
  saveTranslation: (id: string, locale: Locale, body: NewsTranslationInput, version?: string | null) =>
    apiFetch<NewsPostCms>(`/news/posts/${id}/translations/${locale}`, {
      method: 'PUT',
      body: json(body),
      headers: ifMatch(version),
    }),
  publish: (id: string, locale: Locale, version: string, publishedAt?: string) =>
    apiFetch<NewsPostCms>(`/news/posts/${id}/translations/${locale}/publish`, {
      method: 'POST',
      body: json(publishedAt ? { publishedAt } : {}),
      headers: ifMatch(version),
    }),
  unpublish: (id: string, locale: Locale, version: string) =>
    apiFetch<NewsPostCms>(`/news/posts/${id}/translations/${locale}/unpublish`, { method: 'POST', headers: ifMatch(version) }),
  archive: (id: string, locale: Locale, version: string) =>
    apiFetch<NewsPostCms>(`/news/posts/${id}/translations/${locale}/archive`, { method: 'POST', headers: ifMatch(version) }),
  uploadCover: (id: string, file: File, version: string) => {
    const form = new FormData();
    form.append('image', file);
    return apiFetch<NewsPostCms>(`/news/posts/${id}/cover`, { method: 'PUT', body: form, headers: ifMatch(version) });
  },
  remove: (id: string) => apiFetch<{ success: boolean }>(`/news/posts/${id}`, { method: 'DELETE' }),
  restore: (id: string) => apiFetch<NewsPostCms>(`/news/posts/${id}/restore`, { method: 'POST' }),
  purge: (id: string) => apiFetch<{ success: boolean }>(`/news/posts/${id}/permanent`, { method: 'DELETE' }),
  slugCheck: (locale: Locale, slug: string, excludeId?: string) =>
    apiFetch<{ slug: string; valid: boolean; available: boolean; suggestion: string }>(
      `/news/posts/slug-check${toQuery({ locale, slug, excludeId })}`,
    ),
  /** AI dịch cả bài vi -> en (không lưu); có thể mất 10–60 giây với bài dài */
  aiDraft: (id: string) => apiFetch<NewsAiDraft>(`/news/posts/${id}/translations/en/ai-draft`, { method: 'POST' }),
  /** Như aiDraft nhưng nhận tiến trình từng bước (chuẩn bị -> từng lô dịch -> ghép bài -> kết quả) */
  /** Lượt xem / đọc hết / nguồn truy cập của một bài theo ngôn ngữ */
  stats: (id: string, locale: Locale, days = 30) => apiFetch<NewsPostStats>(`/news/posts/${id}/stats${toQuery({ locale, days })}`),
  /** Báo cáo Tin tức cho trang Tổng Quan */
  overview: (days = 30) => apiFetch<NewsStatsOverview>(`/news/stats/overview${toQuery({ days })}`),
  aiDraftStream: (id: string, onEvent: (event: NewsAiDraftEvent) => void, signal?: AbortSignal) =>
    apiStreamNdjson<NewsAiDraftEvent>(`/news/posts/${id}/translations/en/ai-draft/stream`, onEvent, signal),
  setFeatured: (ids: string[]) =>
    apiFetch<Paginated<NewsPostListItemCms>>('/news/posts/featured', { method: 'PUT', body: json({ ids }) }),

  // ── Chuyên mục ──
  categories: () => apiFetch<NewsCategoryCms[]>('/news/categories'),
  createCategory: (body: CategoryInput) => apiFetch<NewsCategoryCms>('/news/categories', { method: 'POST', body: json(body) }),
  updateCategory: (id: string, body: CategoryInput, version: string) =>
    apiFetch<NewsCategoryCms>(`/news/categories/${id}`, { method: 'PUT', body: json(body), headers: ifMatch(version) }),
  removeCategory: (id: string) => apiFetch<{ success: boolean }>(`/news/categories/${id}`, { method: 'DELETE' }),
  /** Toàn bộ id theo thứ tự mới; không đổi version của chuyên mục */
  reorderCategories: (ids: string[]) => apiFetch<NewsCategoryCms[]>('/news/categories/order', { method: 'PUT', body: json({ ids }) }),

  // ── Tag ──
  /** TagPicker gọi tags(q) như cũ; trang Tag dùng thêm lọc / sắp */
  tags: (q?: string, opts: { filter?: NewsTagFilter; sort?: NewsTagSort } = {}) =>
    apiFetch<NewsTagCms[]>(`/news/tags${toQuery({ q, ...opts })}`),
  tagStats: () => apiFetch<NewsTagStats>('/news/tags/stats'),
  bulkDeleteTags: (ids: string[]) => apiFetch<{ deleted: number }>('/news/tags/bulk-delete', { method: 'POST', body: json({ ids }) }),
  createTag: (body: TagInput) => apiFetch<NewsTagCms>('/news/tags', { method: 'POST', body: json(body) }),
  updateTag: (id: string, body: TagInput, version: string) =>
    apiFetch<NewsTagCms>(`/news/tags/${id}`, { method: 'PUT', body: json(body), headers: ifMatch(version) }),
  removeTag: (id: string) => apiFetch<{ success: boolean }>(`/news/tags/${id}`, { method: 'DELETE' }),

  // ── Tác giả ──
  authors: () => apiFetch<NewsAuthorCms[]>('/news/authors'),
  createAuthor: (body: AuthorInput) => apiFetch<NewsAuthorCms>('/news/authors', { method: 'POST', body: json(body) }),
  updateAuthor: (id: string, body: AuthorInput, version: string) =>
    apiFetch<NewsAuthorCms>(`/news/authors/${id}`, { method: 'PUT', body: json(body), headers: ifMatch(version) }),
  removeAuthor: (id: string) => apiFetch<{ success: boolean }>(`/news/authors/${id}`, { method: 'DELETE' }),
};

interface CategoryTranslationInput {
  name: string;
  slug?: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface CategoryInput {
  color: NewsCategoryColor;
  sortOrder?: number;
  isActive?: boolean;
  /** en null = xoá bản tiếng Anh */
  translations: { vi: CategoryTranslationInput; en?: CategoryTranslationInput | null };
}

export interface TagInput {
  translations: { vi: { name: string; slug?: string }; en?: { name: string; slug?: string } | null };
}

export interface AuthorInput {
  name: string;
  avatarUrl?: string | null;
  isActive?: boolean;
  translations?: Partial<Record<Locale, { jobTitle?: string | null; bio?: string | null }>>;
}

/** Ảnh dùng trong nội dung (editor) — trả URL ảnh WebP lớn nhất trên MinIO */
export function uploadContentImage(file: File) {
  const form = new FormData();
  form.append('image', file);
  return apiFetch<{ url: string; images: { width: number; format: string; url: string }[] }>(
    '/media/images?scope=news',
    { method: 'POST', body: form },
  );
}
