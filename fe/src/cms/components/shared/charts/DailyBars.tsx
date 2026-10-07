'use client';

import React, { useId, useState } from 'react';
import { formatDayShort, formatNumber } from '@remak/shared/date';

export interface DailyPoint {
  /** YYYY-MM-DD */
  day: string;
  value: number;
  /** Dòng phụ trong tooltip, vd "12 lượt đọc hết" */
  detail?: string;
}

/** Màu cột: xanh thương hiệu đã kiểm (tương phản ≥ 3:1 trên nền trắng — dataviz validator) */
const BAR = '#5F8A03';
const BAR_HOVER = '#4E7202';

/**
 * Biểu đồ cột theo ngày (một chuỗi số liệu): cột mảnh bo 4px phía trên, khe 2px, lưới nhạt,
 * tooltip khi rê / chạm từng cột, kèm bảng số liệu ẩn cho trình đọc màn hình.
 */
export default function DailyBars({ points, label, unit, height = 140 }: { points: DailyPoint[]; label: string; unit: string; height?: number }) {
  const id = useId();
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...points.map((p) => p.value));
  // Trục: 0, nửa, max làm tròn đẹp
  const top = niceCeil(max);
  const n = points.length || 1;
  const gap = n > 40 ? 1 : 2;
  const current = active !== null ? points[active] : null;

  return (
    <figure className="space-y-1.5" aria-labelledby={`${id}-cap`}>
      <figcaption id={`${id}-cap`} className="sr-only">
        {label}
      </figcaption>
      <div className="relative" style={{ height }} onMouseLeave={() => setActive(null)}>
        {/* Lưới ngang nhạt + nhãn trục */}
        {[1, 0.5, 0].map((f) => (
          <div key={f} className="absolute left-0 right-0 flex items-center gap-1" style={{ top: `${(1 - f) * 100}%`, transform: 'translateY(-50%)' }} aria-hidden="true">
            <span className="w-8 shrink-0 text-right text-[10px] tabular-nums text-slate-400">{formatShort(top * f)}</span>
            <span className={`flex-1 border-t ${f === 0 ? 'border-slate-300' : 'border-dashed border-slate-200'}`} />
          </div>
        ))}
        <div className="absolute inset-y-0 left-9 right-0 flex items-end" style={{ columnGap: gap }} aria-hidden="true">
          {points.map((p, i) => (
            <div
              key={p.day}
              className="relative flex-1 h-full flex items-end cursor-default"
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(active === i ? null : i)}
            >
              <div
                className="w-full rounded-t-[4px] transition-colors"
                style={{ height: `${(p.value / top) * 100}%`, minHeight: p.value ? 2 : 0, background: active === i ? BAR_HOVER : BAR }}
              />
            </div>
          ))}
        </div>
        {current && (
          <div
            role="status"
            className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] text-white shadow-lg"
            style={{ left: `calc(2.25rem + (100% - 2.25rem) * ${(active! + 0.5) / n})` }}
          >
            <span className="font-semibold">{formatDayShort(current.day)}</span>: {formatNumber(current.value)} {unit}
            {current.detail && <span className="block text-slate-300">{current.detail}</span>}
          </div>
        )}
      </div>
      <div className="ml-9 flex justify-between text-[10px] text-slate-400 tabular-nums" aria-hidden="true">
        <span>{points[0] && formatDayShort(points[0].day)}</span>
        <span>{points.at(-1) && formatDayShort(points.at(-1)!.day)}</span>
      </div>
      {/* Bảng số liệu cho trình đọc màn hình */}
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Ngày</th>
            <th scope="col">{unit}</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.day}>
              <td>{formatDayShort(p.day)}</td>
              <td>{p.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

function niceCeil(v: number) {
  if (v <= 5) return 5;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

const formatShort = (v: number) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : String(Math.round(v)));
