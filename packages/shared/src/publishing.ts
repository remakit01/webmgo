// Vòng đời xuất bản nội dung (dùng chung cho Tin tức và các loại nội dung sau này), tách riêng theo từng ngôn ngữ.

export const PUBLISH_STATUSES = ['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'] as const;
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

export const PUBLISH_STATUS_LABELS: Record<PublishStatus, string> = {
  DRAFT: 'Nháp',
  SCHEDULED: 'Lên lịch',
  PUBLISHED: 'Đã xuất bản',
  ARCHIVED: 'Lưu trữ',
};

/**
 * Trạng thái khi bấm "Xuất bản": thời điểm ở tương lai -> SCHEDULED (cron tự đăng), còn lại -> PUBLISHED.
 * Không truyền thời điểm -> đăng ngay. Cho phép ngày trong quá khứ (nhập bài cũ giữ nguyên ngày đăng gốc).
 */
export function resolveStatusOnPublish(
  publishedAt: Date | undefined,
  now: Date = new Date(),
): { status: 'PUBLISHED' | 'SCHEDULED'; publishedAt: Date } {
  const at = publishedAt ?? now;
  return { status: at.getTime() > now.getTime() ? 'SCHEDULED' : 'PUBLISHED', publishedAt: at };
}

/** Bản dịch đang hiển thị công khai: đã xuất bản và đã tới giờ đăng */
export function isPubliclyVisible(
  row: { status: PublishStatus; publishedAt: Date | string | null },
  now: Date = new Date(),
): boolean {
  return row.status === 'PUBLISHED' && row.publishedAt !== null && new Date(row.publishedAt).getTime() <= now.getTime();
}
