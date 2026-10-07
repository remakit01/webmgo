import React from 'react';
import { formatNumber } from '@remak/shared/date';
import { TRAFFIC_SOURCE_LABEL, type TrafficSource } from '@remak/shared/traffic-source';

/**
 * Lượt xem theo nguồn truy cập: thanh ngang một màu (màu không mang nghĩa — nhãn chữ là định danh),
 * số và % viết bằng chữ cạnh mỗi thanh. Nguồn 0 lượt vẫn liệt kê để thấy "chưa có lượt từ AI".
 */
export default function SourceBars({ sources, highlight = ['SEARCH', 'AI'] }: { sources: { source: TrafficSource; views: number }[]; highlight?: TrafficSource[] }) {
  const total = sources.reduce((n, s) => n + s.views, 0);
  const max = Math.max(1, ...sources.map((s) => s.views));
  return (
    <ul className="space-y-2" aria-label="Lượt xem theo nguồn truy cập">
      {sources.map((s) => {
        const pct = total ? Math.round((s.views / total) * 100) : 0;
        return (
          <li key={s.source} className="space-y-0.5">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className={highlight.includes(s.source) ? 'font-bold text-slate-900' : 'text-slate-600'}>{TRAFFIC_SOURCE_LABEL[s.source]}</span>
              <span className="tabular-nums text-slate-700">
                {formatNumber(s.views)} <span className="text-slate-400">· {pct}%</span>
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden" aria-hidden="true">
              <div className="h-full rounded-full bg-[#5F8A03]" style={{ width: `${(s.views / max) * 100}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
