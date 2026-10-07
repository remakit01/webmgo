'use client';

import React, { useId } from 'react';
import { addDays, addMonths, endOfMonth, startOfMonth, todayKey, type DayKey } from '@remak/shared/date';
import DateField from './DateField';

// ─── Mốc ngày nhanh (tính trên DayKey giờ Việt Nam, không theo giờ máy) ─────

export const DATE_PRESETS = ['today', '7d', '30d', 'this_month', 'last_month'] as const;
export type DatePreset = (typeof DATE_PRESETS)[number];

export const DATE_PRESET_LABEL: Record<DatePreset, string> = {
  today: 'Hôm nay',
  '7d': '7 ngày qua',
  '30d': '30 ngày qua',
  this_month: 'Tháng này',
  last_month: 'Tháng trước',
};

export function presetRange(preset: DatePreset, today: DayKey = todayKey()): { from: DayKey; to: DayKey } {
  switch (preset) {
    case 'today':
      return { from: today, to: today };
    case '7d':
      return { from: addDays(today, -6), to: today };
    case '30d':
      return { from: addDays(today, -29), to: today };
    case 'this_month':
      return { from: startOfMonth(today), to: endOfMonth(today) };
    case 'last_month': {
      const prev = addMonths(startOfMonth(today), -1);
      return { from: prev, to: endOfMonth(prev) };
    }
  }
}

/** Khoảng ngày khớp mốc nhanh nào (không khớp -> 'custom', chưa chọn -> 'all') */
export function matchPreset(from?: DayKey, to?: DayKey, today: DayKey = todayKey()): DatePreset | 'custom' | 'all' {
  if (!from && !to) return 'all';
  return (
    DATE_PRESETS.find((p) => {
      const r = presetRange(p, today);
      return r.from === from && r.to === to;
    }) ?? 'custom'
  );
}

/**
 * Khoảng ngày: chọn nhanh (Hôm nay, 7 ngày qua…) hoặc gõ / chọn lịch "Từ ngày" → "Đến ngày".
 * Hai ô ràng nhau (Từ ≤ Đến). Giá trị là DayKey giờ Việt Nam.
 */
export default function DateRangeField({
  label,
  from,
  to,
  onChange,
}: {
  label: string;
  from?: DayKey;
  to?: DayKey;
  onChange: (range: { from?: DayKey; to?: DayKey }) => void;
}) {
  const presetId = useId();
  const preset = matchPreset(from, to);

  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 text-xs font-semibold text-slate-700">{label}</legend>
      <div className="flex items-start gap-2">
        <label htmlFor={presetId} className="sr-only">
          Chọn nhanh {label.toLowerCase()}
        </label>
        <select
          id={presetId}
          value={preset}
          onChange={(e) => {
            const v = e.target.value as DatePreset | 'all' | 'custom';
            if (v === 'all') onChange({});
            else if (v !== 'custom') onChange(presetRange(v));
          }}
          className="h-10 shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-[#5F8A03] focus:outline-none focus:ring-2 focus:ring-[#5F8A03]/40 w-40"
        >
          <option value="all">Mọi thời gian</option>
          {DATE_PRESETS.map((p) => (
            <option key={p} value={p}>
              {DATE_PRESET_LABEL[p]}
            </option>
          ))}
          <option value="custom" disabled>
            Tuỳ chọn ngày
          </option>
        </select>
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <div className="min-w-0 flex-1">
            <DateField label="Từ ngày" hideLabel value={from} max={to} onChange={(v) => onChange({ from: v, to })} />
          </div>
          <span className="mt-2.5 text-sm text-slate-500" aria-hidden="true">
            →
          </span>
          <div className="min-w-0 flex-1">
            <DateField label="Đến ngày" hideLabel align="right" value={to} min={from} onChange={(v) => onChange({ from, to: v })} />
          </div>
        </div>
      </div>
    </fieldset>
  );
}
