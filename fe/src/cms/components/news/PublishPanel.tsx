'use client';

import React, { useState } from 'react';
import { Archive, CalendarClock, ExternalLink, Loader2, Undo2 } from 'lucide-react';
import { formatDateTime } from '@remak/shared/date';
import type { Locale } from '@remak/shared/locale';
import type { NewsTranslationCms } from '@/types/news';
import StatusBadge from '@/cms/components/shared/StatusBadge';
import { LOCALE_LABEL, publicPath, toLocalInput } from './news-form';

/**
 * Khung xuất bản cho NGÔN NGỮ đang mở: trạng thái, hẹn giờ, Xuất bản / Gỡ / Lưu trữ.
 * Bấm Xuất bản khi còn thay đổi chưa lưu -> trang cha lưu trước rồi mới xuất bản.
 */
export default function PublishPanel({
  locale,
  translation,
  blockedReason,
  busy,
  onPublish,
  onUnpublish,
  onArchive,
}: {
  locale: Locale;
  translation: NewsTranslationCms | undefined;
  /** Lý do chưa được xuất bản (vd bản tiếng Việt chưa đăng) */
  blockedReason?: string | null;
  busy: boolean;
  onPublish: (publishedAt?: string) => void;
  onUnpublish: () => void;
  onArchive: () => void;
}) {
  const [schedule, setSchedule] = useState(false);
  const [when, setWhen] = useState(() => toLocalInput(translation?.status === 'SCHEDULED' ? translation.publishedAt : null));
  // Tính lúc người dùng chọn giờ (không gọi Date.now() khi render)
  const [whenInPast, setWhenInPast] = useState(false);
  const status = translation?.status ?? null;
  const live = status === 'PUBLISHED' || status === 'SCHEDULED';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-600">Bản {LOCALE_LABEL[locale]}</span>
        <StatusBadge status={status} />
      </div>

      {translation?.publishedAt && live && (
        <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
          <CalendarClock size={12} aria-hidden="true" />
          {status === 'SCHEDULED' ? 'Sẽ đăng lúc' : 'Đăng ngày'} {formatDateTime(translation.publishedAt)}
        </p>
      )}

      {status === 'PUBLISHED' && translation && (
        <a href={publicPath(locale, translation.slug)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5F8A03] hover:underline">
          <ExternalLink size={11} aria-hidden="true" /> Xem trên website
        </a>
      )}

      {blockedReason ? (
        <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{blockedReason}</p>
      ) : (
        <>
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input type="checkbox" className="accent-[#5F8A03]" checked={schedule} onChange={(e) => setSchedule(e.target.checked)} />
            Hẹn giờ đăng
          </label>
          {schedule && (
            <div className="space-y-1">
              <input
                type="datetime-local"
                value={when}
                onChange={(e) => {
                  setWhen(e.target.value);
                  setWhenInPast(!!e.target.value && new Date(e.target.value).getTime() <= Date.now());
                }}
                aria-label="Thời điểm đăng"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
              />
              {whenInPast && <p className="text-[11px] text-slate-500">Thời điểm đã qua: bài sẽ đăng ngay với ngày này.</p>}
            </div>
          )}
          {schedule && (
            <button
              type="button"
              disabled={busy || !when}
              onClick={() => onPublish(when ? new Date(when).toISOString() : undefined)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-remak-orange hover:bg-remak-orange-dark text-white text-xs font-bold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {busy ? <Loader2 size={13} className="animate-spin" /> : <CalendarClock size={13} />}
              <span>Lưu & lên lịch đăng</span>
            </button>
          )}
        </>
      )}

      {translation && (live || status === 'DRAFT') && (
        <div className="flex items-center gap-2 pt-1">
          {live && (
            <button type="button" disabled={busy} onClick={onUnpublish} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-slate-300 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50">
              <Undo2 size={12} aria-hidden="true" /> {status === 'SCHEDULED' ? 'Huỷ lịch' : 'Gỡ bài'}
            </button>
          )}
          <button type="button" disabled={busy} onClick={onArchive} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-slate-300 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50">
            <Archive size={12} aria-hidden="true" /> Lưu trữ
          </button>
        </div>
      )}
      {locale === 'vi' && live && (
        <p className="text-[11px] text-slate-500">Gỡ bản tiếng Việt sẽ gỡ luôn bản tiếng Anh.</p>
      )}
    </div>
  );
}
