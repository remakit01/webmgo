'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { formatNumber as fmt } from '@remak/shared/date';
import type { Locale } from '@remak/shared/locale';
import type { NewsPostStats } from '@remak/shared/contracts/news-stats';
import DailyBars from '@/cms/components/shared/charts/DailyBars';
import SourceBars from '@/cms/components/shared/charts/SourceBars';
import Skeleton from '@/cms/components/ui/Skeleton';
import { newsApi } from '@/cms/lib/news-api';

const pct = (r: number) => `${Math.round(r * 100)}%`;
const duration = (s: number) => (s >= 60 ? `${Math.floor(s / 60)} phút ${s % 60 ? `${s % 60} giây` : ''}`.trim() : `${s} giây`);

/** Thống kê một bài (ngôn ngữ đang soạn): lượt xem, đọc hết, thời gian đọc, theo ngày, theo nguồn */
export default function NewsStatsPanel({ postId, locale }: { postId: string; locale: Locale }) {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<NewsPostStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    newsApi
      .stats(postId, locale, days)
      .then((s) => {
        if (!alive) return;
        setStats(s);
        setError(null);
      })
      .catch((err: unknown) => alive && setError(err instanceof Error ? err.message : 'Không tải được thống kê'));
    return () => {
      alive = false;
    };
  }, [postId, locale, days, nonce]);

  if (error) {
    return (
      <p role="alert" className="text-xs text-rose-700">
        {error}{' '}
        <button type="button" onClick={() => setNonce((n) => n + 1)} className="underline cursor-pointer">
          Thử lại
        </button>
      </p>
    );
  }
  if (!stats || stats.locale !== locale || stats.days !== days) return <Skeleton className="h-48 w-full rounded-lg" />;

  const { allTime, period } = stats;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div role="group" aria-label="Khoảng thời gian" className="inline-flex rounded-md border border-slate-300 overflow-hidden">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={days === d}
              onClick={() => setDays(d)}
              className={`px-2.5 py-1 text-[11px] font-semibold cursor-pointer ${days === d ? 'bg-[#5F8A03] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              {d} ngày
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setNonce((n) => n + 1)} aria-label="Tải lại thống kê" className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer">
          <RefreshCw size={13} />
        </button>
      </div>

      <dl className="grid grid-cols-2 gap-2">
        {[
          ['Lượt xem', fmt(period.views), `Tổng: ${fmt(allTime.views)}`],
          ['Đọc hết bài', pct(period.readRate), `${fmt(period.reads)} lượt`],
          ['Thời gian đọc TB', duration(period.avgReadSeconds), 'mỗi lượt xem'],
          ['Từ Google & AI', fmt(stats.sources.filter((s) => s.source === 'SEARCH' || s.source === 'AI').reduce((n, s) => n + s.views, 0)), `AI: ${fmt(stats.sources.find((s) => s.source === 'AI')?.views ?? 0)}`],
        ].map(([label, value, hint]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="text-base font-black text-slate-900 tabular-nums">{value}</dd>
            <dd className="text-[10px] text-slate-500">{hint}</dd>
          </div>
        ))}
      </dl>

      {period.views === 0 ? (
        <p className="text-[11px] text-slate-500">Chưa có lượt xem trong {days} ngày qua. Lượt xem chỉ được ghi khi bài đã xuất bản.</p>
      ) : (
        <>
          <DailyBars
            label={`Lượt xem ${days} ngày gần nhất`}
            unit="lượt xem"
            points={stats.daily.map((d) => ({ day: d.day, value: d.views, detail: d.reads ? `${fmt(d.reads)} lượt đọc hết` : undefined }))}
          />
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-800">Nguồn truy cập</h3>
            <SourceBars sources={stats.sources} />
          </div>
        </>
      )}
      <p className="text-[10px] text-slate-400">Không tính bot / trình xem trước link; một người xem lại trong 30 phút chỉ tính 1 lượt.</p>
    </div>
  );
}
