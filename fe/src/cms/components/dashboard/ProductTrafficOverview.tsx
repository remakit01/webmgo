'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Boxes } from 'lucide-react';
import { formatNumber as fmt } from '@remak/shared/date';
import { PRODUCT_STATS_DAYS, type ProductStatsOverview } from '@remak/shared/contracts/product-stats';
import type { TrafficSource } from '@remak/shared/traffic-source';
import DailyBars from '@/cms/components/shared/charts/DailyBars';
import SourceBars from '@/cms/components/shared/charts/SourceBars';
import PeriodDelta, { periodChange } from '@/cms/components/shared/charts/PeriodDelta';
import Skeleton from '@/cms/components/ui/Skeleton';
import { productsApi } from '@/cms/lib/products-api';

const sourceViews = (o: ProductStatsOverview, source: TrafficSource) => o.sources.find((s) => s.source === source)?.views ?? 0;

/** Khu "Sản phẩm" trên trang Tổng Quan: lượt xem trang sản phẩm, theo ngày, theo nguồn, sản phẩm xem nhiều nhất */
export default function ProductTrafficOverview() {
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<ProductStatsOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    productsApi
      .overview(days)
      .then((d) => alive && setData(d))
      .catch((err: unknown) => alive && setError(err instanceof Error ? err.message : 'Không tải được thống kê sản phẩm'));
    return () => {
      alive = false;
    };
  }, [days]);

  const cards = (o: ProductStatsOverview): { label: string; value: string; delta?: number | null; hint: string }[] => [
    { label: 'Lượt xem', value: fmt(o.views), delta: periodChange(o.views, o.previousViews), hint: `${days} ngày` },
    { label: 'Từ Google', value: fmt(sourceViews(o, 'SEARCH')), hint: 'hiệu quả SEO' },
    { label: 'Từ trợ lý AI', value: fmt(sourceViews(o, 'AI')), hint: 'ChatGPT, Perplexity, Gemini… (GEO)' },
    { label: 'Từ trang trong web', value: fmt(sourceViews(o, 'INTERNAL')), hint: 'đi từ trang chủ, tin tức…' },
  ];

  return (
    <section aria-labelledby="product-traffic-title" className="bg-white rounded-xl border border-slate-300 shadow-2xs p-5 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 id="product-traffic-title" className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Boxes size={16} className="text-[#5F8A03]" aria-hidden="true" /> Sản phẩm — lượt xem & nguồn truy cập
        </h2>
        <div role="group" aria-label="Khoảng thời gian" className="inline-flex rounded-md border border-slate-300 overflow-hidden">
          {PRODUCT_STATS_DAYS.map((d) => (
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
                  {c.delta !== undefined && <PeriodDelta value={c.delta} />}
                </dd>
                <dd className="text-[11px] text-slate-500">{c.hint}</dd>
              </div>
            ))}
          </dl>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800">Lượt xem theo ngày</h3>
              <DailyBars
                label={`Lượt xem sản phẩm ${days} ngày gần nhất`}
                unit="lượt xem"
                height={170}
                points={data.daily.map((d) => ({ day: d.day, value: d.views }))}
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800">Nguồn truy cập</h3>
              <SourceBars sources={data.sources} />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800">Sản phẩm xem nhiều nhất</h3>
            {data.topProducts.length === 0 ? (
              <p className="text-xs text-slate-500">Chưa có lượt xem trong {days} ngày qua.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-200">
                      <th scope="col" className="py-2 pr-2 w-8">#</th>
                      <th scope="col" className="py-2 pr-2">Sản phẩm</th>
                      <th scope="col" className="py-2 text-right">Lượt xem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.topProducts.map((p, i) => (
                      <tr key={`${p.productId}-${p.locale}`}>
                        <td className="py-2 pr-2 text-slate-400 tabular-nums">{i + 1}</td>
                        <td className="py-2 pr-2">
                          <Link href={`/admin/products/${p.productId}`} className="font-semibold text-slate-800 hover:text-[#5F8A03] line-clamp-1">
                            {p.name}
                          </Link>
                          <span className="text-[10px] uppercase text-slate-400">{p.locale}</span>
                        </td>
                        <td className="py-2 text-right tabular-nums font-semibold text-slate-900">{fmt(p.views)}</td>
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
