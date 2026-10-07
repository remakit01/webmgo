import React from 'react';
import { PUBLISH_STATUS_LABELS, type PublishStatus } from '@remak/shared/publishing';

const STYLES: Record<PublishStatus | 'MISSING' | 'STALE', string> = {
  PUBLISHED: 'bg-[#F4F9E8] text-[#4E7202] border-[#7CB305]/40',
  SCHEDULED: 'bg-sky-50 text-sky-700 border-sky-200',
  DRAFT: 'bg-slate-100 text-slate-600 border-slate-300',
  ARCHIVED: 'bg-slate-50 text-slate-600 border-slate-300',
  MISSING: 'bg-white text-slate-600 border-dashed border-slate-400',
  STALE: 'bg-amber-50 text-amber-800 border-amber-300',
};

/** Badge trạng thái xuất bản dùng chung (bài viết, sau này sản phẩm/dự án...) */
export default function StatusBadge({
  status,
  prefix,
  stale,
  className = '',
}: {
  /** null = chưa có bản dịch */
  status: PublishStatus | null;
  /** Nhãn ngắn phía trước, vd "VI", "EN" */
  prefix?: string;
  /** Bản dịch cũ hơn bản gốc */
  stale?: boolean;
  className?: string;
}) {
  const key = status === null ? 'MISSING' : stale ? 'STALE' : status;
  const label = status === null ? 'Chưa có bản dịch' : stale ? `${PUBLISH_STATUS_LABELS[status]} · Cần cập nhật bản dịch` : PUBLISH_STATUS_LABELS[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-semibold whitespace-nowrap ${STYLES[key]} ${className}`}
      title={stale ? 'Bản tiếng Việt đã sửa sau lần dịch gần nhất' : undefined}
    >
      {prefix && <span className="font-black tracking-wide">{prefix}</span>}
      {label}
    </span>
  );
}
