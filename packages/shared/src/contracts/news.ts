// Hợp đồng dữ liệu API Tin tức — api trả về đúng các kiểu này, fe (site public + CMS) nhận đúng các kiểu này.

import type { Locale } from '../locale.js';
import type { Paginated } from '../pagination.js';
import type { PublishStatus } from '../publishing.js';
import type { RichDoc } from '../rich-content.js';

/** Màu chuyên mục: token thương hiệu, fe tự map sang class Tailwind (không lưu class/mã màu trong DB) */
export const NEWS_CATEGORY_COLORS = ['green', 'orange', 'slate', 'blue', 'amber'] as const;
export type NewsCategoryColor = (typeof NEWS_CATEGORY_COLORS)[number];

export const TRANSLATION_ORIGINS = ['HUMAN', 'AI', 'AI_REVIEWED'] as const;
export type TranslationOrigin = (typeof TRANSLATION_ORIGINS)[number];

/** Tag revalidate ISR của mọi trang Tin tức (fe whitelist + api trigger) */
export const NEWS_REVALIDATE_TAG = 'news';

export interface ImageVariant {
  width: number;
  format: 'webp' | 'avif';
  url: string;
}

// ─── Public (site khách hàng) ───────────────────────────────────────────────

export interface NewsCategoryPublic {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  color: NewsCategoryColor;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface NewsTagPublic {
  id: string;
  slug: string;
  name: string;
}

export interface NewsAuthorPublic {
  id: string;
  name: string;
  avatarUrl: string | null;
  jobTitle: string | null;
  bio: string | null;
}

export interface NewsCoverPublic {
  url: string;
  images: ImageVariant[];
  alt: string;
  caption: string | null;
}

export interface NewsListItem {
  id: string;
  locale: Locale;
  slug: string;
  title: string;
  sapo: string;
  publishedAt: string;
  readingMinutes: number;
  isFeatured: boolean;
  category: NewsCategoryPublic;
  cover: NewsCoverPublic | null;
}

/** Bài được chèn trong nội dung qua khối "bài liên quan" (theo đúng ngôn ngữ đang xem) */
export interface NewsRelatedRef {
  id: string;
  slug: string;
  title: string;
  coverUrl: string | null;
}

export interface NewsPostPublic extends NewsListItem {
  content: RichDoc;
  /** Lần sửa nội dung cuối (không tính đổi trạng thái xuất bản) — "Cập nhật lần cuối", dateModified */
  updatedAt: string;
  author: NewsAuthorPublic | null;
  tags: NewsTagPublic[];
  seo: {
    title: string;
    description: string;
    ogImageUrl: string | null;
    noindex: boolean;
  };
  source: { name: string; url: string | null } | null;
  /** Slug của bài ở từng ngôn ngữ ĐÃ xuất bản — dùng cho hreflang và nút đổi ngôn ngữ */
  alternates: Partial<Record<Locale, string>>;
  relatedRefs: Record<string, NewsRelatedRef>;
}

export type NewsPostBySlugResponse =
  | { post: NewsPostPublic; related: NewsListItem[] }
  /** Slug cũ (đã đổi sau khi đăng) -> slug hiện tại, fe trả 301 */
  | { redirect: string };

export type NewsListResponse = Paginated<NewsListItem>;

export interface NewsSitemapEntry {
  id: string;
  updatedAt: string;
  slugs: Partial<Record<Locale, string>>;
}

// ─── CMS ─────────────────────────────────────────────────────────────────────

/**
 * Sự kiện tiến trình AI dịch bài (luồng NDJSON: mỗi dòng một JSON) — POST .../translations/en/ai-draft/stream
 * prepare -> progress (nhiều lần, sau mỗi lô Gemini) -> assemble -> result | error
 */
export type NewsAiDraftEvent =
  /** Đã đọc bài: số ô cần dịch (tiêu đề, sapo, SEO, từng đoạn/ảnh) và tổng ký tự */
  | { type: 'prepare'; fields: number; chars: number; blocks: number; images: number }
  /** done/total ô đã có bản dịch (gồm ô dùng lại từ bộ nhớ dịch — cached), batchesDone/batchesTotal lô gọi Gemini */
  | { type: 'progress'; done: number; total: number; cached: number; batchesDone: number; batchesTotal: number }
  /** Đang ghép bản dịch vào cấu trúc bài và tạo đường dẫn tiếng Anh */
  | { type: 'assemble' }
  | { type: 'result'; draft: NewsAiDraft }
  | { type: 'error'; status: number; message: string };

/** Bản nháp tiếng Anh do AI dịch từ bản tiếng Việt (chưa lưu) — POST /news/posts/:id/translations/en/ai-draft */
export interface NewsAiDraft {
  title: string;
  slug: string;
  sapo: string;
  content: RichDoc;
  coverAlt: string;
  coverCaption: string | null;
  focusKeyword: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  noindex: boolean;
  origin: 'AI';
  /** contentUpdatedAt bản tiếng Việt đã dùng để dịch — gửi lại khi lưu để theo dõi bản dịch lỗi thời */
  sourceUpdatedAt: string;
  /** Số khối phải bỏ định dạng vì AI trả thẻ sai — CMS nhắc kiểm tra lại */
  fallbackBlocks: number;
}

export interface NewsTranslationCms {
  locale: Locale;
  status: PublishStatus;
  publishedAt: string | null;
  firstPublishedAt: string | null;
  title: string;
  slug: string;
  sapo: string;
  content: RichDoc;
  readingMinutes: number;
  coverAlt: string;
  coverCaption: string | null;
  /** Keyword chính (chấm điểm SEO/AEO/GEO) */
  focusKeyword: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  noindex: boolean;
  sourceName: string | null;
  sourceUrl: string | null;
  origin: TranslationOrigin;
  /** Lần cuối nội dung chữ thay đổi (đổi trạng thái xuất bản không tính) */
  contentUpdatedAt: string;
  /** contentUpdatedAt của bản tiếng Việt lúc dịch — nhỏ hơn bản Việt hiện tại = bản dịch lỗi thời */
  sourceUpdatedAt: string | null;
  updatedAt: string;
  /** Gửi lại qua If-Match khi lưu bản dịch này */
  version: string;
}

export interface NewsPostCms {
  id: string;
  categoryId: string;
  authorId: string | null;
  tagIds: string[];
  isFeatured: boolean;
  featuredOrder: number | null;
  cover: { url: string; images: ImageVariant[] } | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  /** Gửi lại qua If-Match khi sửa thông tin chung / ảnh đại diện */
  version: string;
  translations: Partial<Record<Locale, NewsTranslationCms>>;
}

export interface NewsLocaleSummary {
  status: PublishStatus;
  publishedAt: string | null;
  slug: string;
  title: string;
  /** Bản dịch cũ hơn bản tiếng Việt hiện tại */
  stale: boolean;
}

export interface NewsPostListItemCms {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  coverUrl: string | null;
  isFeatured: boolean;
  updatedAt: string;
  deletedAt: string | null;
  locales: Partial<Record<Locale, NewsLocaleSummary>>;
  /** Tổng lượt xem từ trước tới nay (mọi ngôn ngữ) */
  views: number;
  /** Lượt xem trong kỳ đã chọn ở danh sách (viewsDays); không chọn kỳ thì bằng views */
  viewsInPeriod: number;
}

/** Kỳ tính lượt xem ở danh sách bài CMS (ngày) */
export const NEWS_LIST_VIEW_DAYS = [7, 30, 90] as const;
/** Lọc danh sách bài CMS theo lượt xem */
export const NEWS_LIST_VIEW_FILTERS = ['has_views', 'no_views'] as const;
export type NewsListViewFilter = (typeof NEWS_LIST_VIEW_FILTERS)[number];
/** Sắp xếp danh sách bài CMS */
export const NEWS_LIST_SORTS = ['updated', 'views_desc', 'views_asc'] as const;
export type NewsListSort = (typeof NEWS_LIST_SORTS)[number];

/** Lọc danh sách tag CMS: chưa có tên tiếng Anh / chưa gắn bài nào */
export const NEWS_TAG_FILTERS = ['missing_en', 'unused'] as const;
export type NewsTagFilter = (typeof NEWS_TAG_FILTERS)[number];
/** Sắp danh sách tag CMS: mới tạo (mặc định) / dùng nhiều nhất */
export const NEWS_TAG_SORTS = ['recent', 'usage'] as const;
export type NewsTagSort = (typeof NEWS_TAG_SORTS)[number];
/** Số đếm cho nút lọc tag */
export interface NewsTagStats {
  total: number;
  missingEn: number;
  unused: number;
}

/** Bản dịch của chuyên mục / tag / tác giả trong CMS */
export interface NewsCategoryTranslationCms {
  name: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface NewsCategoryCms {
  id: string;
  color: NewsCategoryColor;
  sortOrder: number;
  isActive: boolean;
  /** Số bài chưa xoá */
  postCount: number;
  /** Số bài trong thùng rác — vẫn chặn xoá chuyên mục */
  trashedPostCount: number;
  version: string;
  translations: Partial<Record<Locale, NewsCategoryTranslationCms>>;
}

export interface NewsTagCms {
  id: string;
  postCount: number;
  version: string;
  translations: Partial<Record<Locale, { name: string; slug: string }>>;
}

export interface NewsAuthorCms {
  id: string;
  name: string;
  avatarUrl: string | null;
  isActive: boolean;
  postCount: number;
  version: string;
  translations: Partial<Record<Locale, { jobTitle: string | null; bio: string | null }>>;
}
