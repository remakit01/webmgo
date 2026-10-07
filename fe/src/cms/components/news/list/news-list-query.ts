// Bộ lọc danh sách bài <-> query string trên URL (deep link: tải lại / Quay lại / gửi link vẫn giữ bộ lọc).
// Hàm thuần — mọi giá trị đọc từ URL đều được kiểm bằng hằng số shared, giá trị lạ bị bỏ qua.

import { NEWS_LIST_SORTS, NEWS_LIST_VIEW_DAYS, NEWS_LIST_VIEW_FILTERS, type NewsListSort } from '@remak/shared/contracts/news';
import { formatDateRange, isDayKey } from '@remak/shared/date';
import { PUBLISH_STATUSES, PUBLISH_STATUS_LABELS, type PublishStatus } from '@remak/shared/publishing';
import type { NewsListQuery } from '@/cms/lib/news-api';

export const NEWS_PAGE_SIZE = 20;

const oneOf = <T extends string | number>(list: readonly T[], value: unknown): T | undefined =>
  (list as readonly unknown[]).includes(value) ? (value as T) : undefined;

/** URLSearchParams -> NewsListQuery (luôn có page + pageSize) */
export function parseNewsListQuery(params: URLSearchParams): NewsListQuery {
  const status = params.get('status')?.split(':') ?? [];
  const tab = params.get('tab');
  const page = Number(params.get('page'));
  const from = params.get('from');
  const to = params.get('to');
  const sort = oneOf<NewsListSort>(NEWS_LIST_SORTS, params.get('sort'));
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: NEWS_PAGE_SIZE,
    q: params.get('q')?.trim() || undefined,
    categoryId: params.get('category') || undefined,
    ...(status.length === 2 && (status[0] === 'vi' || status[0] === 'en') && oneOf(PUBLISH_STATUSES, status[1])
      ? { locale: status[0], status: status[1] as PublishStatus }
      : {}),
    missing: params.get('missing') === 'en' ? 'en' : undefined,
    fromDate: isDayKey(from) ? from : undefined,
    toDate: isDayKey(to) ? to : undefined,
    views: oneOf(NEWS_LIST_VIEW_FILTERS, params.get('views')),
    viewsDays: oneOf(NEWS_LIST_VIEW_DAYS, Number(params.get('days'))),
    sort: sort === 'updated' ? undefined : sort,
    featured: tab === 'featured' ? true : undefined,
    trash: tab === 'trash' ? true : undefined,
  };
}

/** NewsListQuery -> query string gọn (bỏ giá trị mặc định) */
export function serializeNewsListQuery(q: NewsListQuery): string {
  const p = new URLSearchParams();
  if (q.trash) p.set('tab', 'trash');
  else if (q.featured) p.set('tab', 'featured');
  if (q.q) p.set('q', q.q);
  if (q.categoryId) p.set('category', q.categoryId);
  if (q.status) p.set('status', `${q.locale ?? 'vi'}:${q.status}`);
  if (q.missing) p.set('missing', q.missing);
  if (q.fromDate) p.set('from', q.fromDate);
  if (q.toDate) p.set('to', q.toDate);
  if (q.views) p.set('views', q.views);
  if (q.viewsDays) p.set('days', String(q.viewsDays));
  if (q.sort && q.sort !== 'updated') p.set('sort', q.sort);
  if (q.page && q.page > 1) p.set('page', String(q.page));
  return p.toString();
}

// ─── Chip bộ lọc đang bật ────────────────────────────────────────────────────

export const VIEWS_FILTER_LABEL: Record<NonNullable<NewsListQuery['views']>, string> = {
  has_views: 'Đã có lượt xem',
  no_views: 'Chưa có lượt xem',
};

export interface FilterChip {
  id: string;
  /** Nhãn hiển thị, vd "Chuyên mục: Kỹ thuật" */
  label: string;
  /** Bấm ✕ -> patch này */
  clear: Partial<NewsListQuery>;
}

/** Danh sách bộ lọc đang bật (theo thứ tự trên khung bộ lọc). Sắp xếp không phải bộ lọc nên không có chip. */
export function activeFilterChips(q: NewsListQuery, categoryName: (id: string) => string | undefined): FilterChip[] {
  const chips: FilterChip[] = [];
  if (q.q) chips.push({ id: 'q', label: `Từ khoá: “${q.q}”`, clear: { q: undefined } });
  if (q.categoryId) {
    chips.push({ id: 'category', label: `Chuyên mục: ${categoryName(q.categoryId) ?? '…'}`, clear: { categoryId: undefined } });
  }
  if (q.status) {
    chips.push({
      id: 'status',
      label: `${(q.locale ?? 'vi').toUpperCase()} · ${PUBLISH_STATUS_LABELS[q.status]}`,
      clear: { status: undefined, locale: undefined },
    });
  }
  if (q.missing) chips.push({ id: 'missing', label: 'Chưa dịch EN', clear: { missing: undefined } });
  if (q.fromDate || q.toDate) {
    chips.push({ id: 'date', label: `Cập nhật: ${formatDateRange(q.fromDate, q.toDate)}`, clear: { fromDate: undefined, toDate: undefined } });
  }
  if (q.viewsDays) chips.push({ id: 'days', label: `Lượt xem tính trong ${q.viewsDays} ngày qua`, clear: { viewsDays: undefined } });
  if (q.views) chips.push({ id: 'views', label: VIEWS_FILTER_LABEL[q.views], clear: { views: undefined } });
  return chips;
}

/** Xoá mọi bộ lọc + sắp xếp, giữ tab (Tất cả / Nổi bật / Thùng rác) */
export const CLEAR_ALL_FILTERS: Partial<NewsListQuery> = {
  q: undefined,
  categoryId: undefined,
  status: undefined,
  locale: undefined,
  missing: undefined,
  fromDate: undefined,
  toDate: undefined,
  views: undefined,
  viewsDays: undefined,
  sort: undefined,
};
