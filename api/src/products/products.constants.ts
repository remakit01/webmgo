import { PRODUCTS_REVALIDATE_TAG } from '@remak/shared/contracts/product';

/** Mọi cache public của Sản phẩm nằm dưới prefix này — một thay đổi xoá cả nhóm */
export const PRODUCTS_CACHE_PREFIX = 'products:';
export const PRODUCTS_CACHE_TTL = 60;
/** Ảnh đại diện sản phẩm trên MinIO */
export const PRODUCTS_COVER_PREFIX = 'products/covers';
export const PRODUCT_SLUG_ENTITY = 'product' as const;
export const PRODUCT_TYPE_SLUG_ENTITY = 'product_type' as const;

export const PRODUCTS_INVALIDATE = { prefixes: [PRODUCTS_CACHE_PREFIX], tags: [PRODUCTS_REVALIDATE_TAG] };
