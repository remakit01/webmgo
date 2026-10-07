'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Newspaper } from 'lucide-react';
import { formatNumber as fmt } from '@remak/shared/date';
import type { NewsStatsOverview, NewsStatsTotals } from '@remak/shared/contracts/news-stats';
import DailyBars from '@/cms/components/shared/charts/DailyBars';
import SourceBars from '@/cms/components/shared/charts/SourceBars';
import Skeleton from '@/cms/components/ui/Skeleton';
import { newsApi } from '@/cms/lib/news-api';


/** % thay đổi so với kỳ trước (null nếu kỳ trước = 0) */
const change = (now: number, before: number) => (before ? Math.round(((now - before) / before) * 100) : null);

function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="text-[10px] text-slate-400">chưa có kỳ trước</span>;
  const up = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${up ? 'text-[#4E7202]' : 'text-rose-600'}`}>
      {up ? <ArrowUpRight size={12} aria-hidden="true" /> : <ArrowDownRight size={12} aria-hidden="true" />}
      {up ? '+' : ''}
      {value}% <span className="sr-only">so với kỳ trước</span>
    </span>
  );
}

const sourceViews = (o: NewsStatsOverview, source: 'AI' | 'SEARCH') => o.sources.find((s) => s.source === source)?.views ?? 0;

/** Khu "Tin tức" trên trang Tổng Quan: lượt xem, đọc hết, Google / AI, theo ngày, theo nguồn, top bài */
export default function NewsTrafficOverview() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<NewsStatsOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    newsApi
      .overview(days)
      .then((d) => alive && setData(d))
      .catch((err: unknown) => alive && setError(err instanceof Error ? err.message : 'Không tải được thống kê tin tức'));
    return () => {
      alive = false;
    };
  }, [days]);

  const cards = (o: NewsStatsOverview): { label: string; value: string; delta: number | null; hint: string }[] => {
    const p: NewsStatsTotals = o.period;
    const q: NewsStatsTotals = o.previous;
    return [
      { label: 'Lượt xem', value: fmt(p.views), delta: change(p.views, q.views), hint: `${days} ngày` },
      { label: 'Tỉ lệ đọc hết', value: `${Math.round(p.readRate * 100)}%`, delta: null, hint: `${fmt(p.reads)} lượt đọc tới 75% bài` },
      { label: 'Từ Google', value: fmt(sourceViews(o, 'SEARCH')), delta: null, hint: 'hiệu quả SEO' },
      { label: 'Từ trợ lý AI', value: fmt(sourceViews(o, 'AI')), delta: null, hint: 'ChatGPT, Perplexity, Gemini… (GEO)' },
    ];
  };

  return (
    <section aria-labelledby="news-traffic-title" className="bg-white rounded-xl border border-slate-300 shadow-2xs p-5 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 id="news-traffic-title" className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Newspaper size={16} className="text-[#5F8A03]" aria-hidden="true" /> Tin tức — lượt xem & nguồn truy cập
        </h2>
        <div role="group" aria-label="Khoảng thời gian" className="inline-flex rounded-md border border-slate-300 overflow-hidden">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={days === d}
              onClick={() => {
                setData(null);
                setDays(d);
              }}
              className={`px-3 py-1 text-xs font-semibold cursor-pointer ${days === d ? 'bg-[#5F8A03] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              {d} ngày
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-xs text-rose-700">{error}</p>
      ) : !data ? (
        <Skeleton className="h-72 w-full rounded-lg" />
      ) : (
        <>
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {cards(data).map((c) => (
              <div key={c.label} className="rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{c.label}</dt>
                <dd className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-slate-900 tabular-nums">{c.value}</span>
                  {c.label === 'Lượt xem' && <Delta value={c.delta} />}
                </dd>
                <dd className="text-[11px] text-slate-500">{c.hint}</dd>
              </div>
            ))}
          </dl>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800">Lượt xem theo ngày</h3>
              <DailyBars
                label={`Lượt xem tin tức ${days} ngày gần nhất`}
                unit="lượt xem"
                height={170}
                points={data.daily.map((d) => ({ day: d.day, value: d.views, detail: d.reads ? `${fmt(d.reads)} lượt đọc hết` : undefined }))}
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800">Nguồn truy cập</h3>
              <SourceBars sources={data.sources} />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800">Bài xem nhiều nhất</h3>
            {data.topPosts.length === 0 ? (
              <p className="text-xs text-slate-500">Chưa có lượt xem trong {days} ngày qua.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-200">
                      <th scope="col" className="py-2 pr-2 w-8">#</th>
                      <th scope="col" className="py-2 pr-2">Bài viết</th>
                      <th scope="col" className="py-2 pr-2 text-right">Lượt xem</th>
                      <th scope="col" className="py-2 text-right">Đọc hết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.topPosts.map((p, i) => (
                      <tr key={`${p.postId}-${p.locale}`}>
                        <td className="py-2 pr-2 text-slate-400 tabular-nums">{i + 1}</td>
                        <td className="py-2 pr-2">
                          <Link href={`/admin/news/${p.postId}`} className="font-semibold text-slate-800 hover:text-[#5F8A03] line-clamp-1">
                            {p.title}
                          </Link>
                          <span className="text-[10px] uppercase text-slate-400">{p.locale}</span>
                        </td>
                        <td className="py-2 pr-2 text-right tabular-nums font-semibold text-slate-900">{fmt(p.views)}</td>
                        <td className="py-2 text-right tabular-nums text-slate-600">{p.views ? `${Math.round((p.reads / p.views) * 100)}%` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
