// Phân trang dùng chung cho API danh sách (CMS + public) và phía fe.

export const PAGE_SIZE_DEFAULT = 20;
export const PAGE_SIZE_MAX = 100;

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Chuẩn hoá page/pageSize từ query (thiếu, âm, vượt trần) và tính skip/take cho truy vấn DB */
export function normalizePage(page?: number, pageSize?: number) {
  const safePage = Number.isInteger(page) && page! > 0 ? page! : 1;
  const safeSize = Number.isInteger(pageSize) && pageSize! > 0 ? Math.min(pageSize!, PAGE_SIZE_MAX) : PAGE_SIZE_DEFAULT;
  return { page: safePage, pageSize: safeSize, skip: (safePage - 1) * safeSize, take: safeSize };
}

export function toPaginated<T>(items: T[], total: number, page: number, pageSize: number): Paginated<T> {
  return { items, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}
