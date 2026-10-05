import { NEWS_REVALIDATE_TAG } from '@remak/shared/contracts/news';

/** Mọi cache public của Tin tức nằm dưới prefix này — một thay đổi xoá cả nhóm (danh sách, bài, chuyên mục) */
export const NEWS_CACHE_PREFIX = 'news:';
export const NEWS_CACHE_TTL = 60;
export const NEWS_INVALIDATE = { prefixes: [NEWS_CACHE_PREFIX], tags: [NEWS_REVALIDATE_TAG] };

export const NEWS_SLUG_ENTITY = 'news_post' as const;

/** Ảnh đại diện bài viết — nhận mọi kích thước (CMS chỉ gợi ý ≥ 1200×630 cho ảnh chia sẻ đẹp) */
export const NEWS_COVER_PREFIX = 'news/covers';
/** Ảnh trong nội dung phải nằm dưới prefix public này (upload qua POST /media/images?scope=news) */
export const NEWS_MEDIA_PREFIX = 'news/';

export const NEWS_RELATED_LIMIT = 3;
