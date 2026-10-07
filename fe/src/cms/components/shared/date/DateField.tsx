'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  addDays,
  addMonths,
  formatDayKey,
  parseDate,
  startOfMonth,
  todayKey,
  weekdayMonFirst,
  type DayKey,
} from '@remak/shared/date';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const WEEKDAY_FULL = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'];

/**
 * Gõ số -> tự chèn "/" theo dd/mm/yyyy: "07102026" -> "07/10/2026".
 * Gõ "/" sớm vẫn được ("7/10/2026"); ngày / tháng đủ 2 số thì số tiếp theo sang phần sau.
 */
function maskDate(raw: string): string {
  if (/[^\d/]/.test(raw)) return raw.slice(0, 10); // dạng khác (07-10-2026, 2026-10-07…) -> để parseDate xử lý khi rời ô
  const parts = [''];
  for (const ch of raw) {
    const i = parts.length - 1;
    if (ch === '/') {
      if (parts[i] && i < 2) parts.push('');
    } else if (i < 2 && parts[i].length === 2) {
      parts.push(ch);
    } else if (parts[i].length < (i < 2 ? 2 : 4)) {
      parts[i] += ch;
    }
  }
  return parts.join('/');
}

const inRange = (key: DayKey, min?: DayKey, max?: DayKey) => (!min || key >= min) && (!max || key <= max);

/**
 * Ô chọn ngày luôn hiện dd/mm/yyyy (không theo ngôn ngữ trình duyệt như <input type="date">).
 * - Gõ được: "07102026", "7/10/2026", "07-10-2026"; kiểm khi rời ô / Enter, báo lỗi ngay dưới ô.
 * - Lịch bật ra: tuần bắt đầu Thứ Hai; bàn phím ← → ↑ ↓, PageUp/PageDown (tháng), Home/End (đầu/cuối tuần), Enter chọn, Esc đóng.
 * - Giá trị là DayKey 'YYYY-MM-DD' theo giờ Việt Nam (hoặc undefined) — UI không tự đổi múi giờ.
 */
export default function DateField({
  label,
  value,
  onChange,
  min,
  max,
  hideLabel,
  align = 'left',
}: {
  label: string;
  value?: DayKey;
  onChange: (value: DayKey | undefined) => void;
  min?: DayKey;
  max?: DayKey;
  hideLabel?: boolean;
  /** Mép neo của lịch bật ra (ô sát mép phải -> 'right' để lịch không tràn màn hình) */
  align?: 'left' | 'right';
}) {
  const id = useId();
  const [text, setText] = useState(value ? formatDayKey(value) : '');
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<DayKey>(startOfMonth(value ?? todayKey()));
  const [focused, setFocused] = useState<DayKey>(value ?? todayKey());
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Giá trị đổi từ ngoài (mốc nhanh, xoá bộ lọc, URL) -> cập nhật ô
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    setText(value ? formatDayKey(value) : '');
    setError(null);
  }

  const commit = (raw: string) => {
    const s = raw.trim();
    if (!s) {
      setError(null);
      if (value) onChange(undefined);
      return;
    }
    const key = parseDate(s);
    if (!key) return setError('Ngày không hợp lệ — nhập theo dạng dd/mm/yyyy');
    if (!inRange(key, min, max)) {
      return setError(min && key < min ? `Phải từ ${formatDayKey(min)} trở đi` : `Phải trước hoặc bằng ${formatDayKey(max!)}`);
    }
    setError(null);
    setText(formatDayKey(key));
    if (key !== value) onChange(key);
  };

  const openCalendar = () => {
    const start = value ?? (min && todayKey() < min ? min : todayKey());
    setFocused(start);
    setMonth(startOfMonth(start));
    setOpen(true);
  };
  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };
  const pick = (key: DayKey) => {
    if (!inRange(key, min, max)) return;
    setError(null);
    onChange(key);
    close();
  };

  // Mở lịch / đổi ngày đang chọn bằng phím -> focus đúng ô ngày
  useEffect(() => {
    if (!open) return;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${focused}"]`)?.focus();
  }, [open, focused]);

  // Bấm ra ngoài -> đóng (không giật focus)
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const move = (key: DayKey) => {
    setFocused(key);
    if (key.slice(0, 7) !== month.slice(0, 7)) setMonth(startOfMonth(key));
  };
  const onGridKey = (e: React.KeyboardEvent) => {
    const map: Record<string, () => DayKey> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      PageUp: () => addMonths(focused, -1),
      PageDown: () => addMonths(focused, 1),
      Home: () => addDays(focused, -weekdayMonFirst(focused)),
      End: () => addDays(focused, 6 - weekdayMonFirst(focused)),
    };
    if (map[e.key]) {
      e.preventDefault();
      move(map[e.key]());
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  };

  // 6 tuần x 7 ngày, bắt đầu từ Thứ Hai trước (hoặc là) ngày 1
  const first = addDays(month, -weekdayMonFirst(month));
  const days = Array.from({ length: 42 }, (_, i) => addDays(first, i));
  const today = todayKey();
  const [y, m] = month.split('-');
  const errorId = `${id}-error`;

  return (
    <div ref={wrapRef} className="relative">
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'block mb-1 text-xs font-semibold text-slate-700'}>
        {label}
      </label>
      <div
        className={`flex h-10 items-center rounded-lg border bg-white transition-colors focus-within:ring-2 focus-within:ring-[#5F8A03]/40 ${
          error ? 'border-rose-400' : 'border-slate-300 focus-within:border-[#5F8A03]'
        }`}
      >
        <input
          id={id}
          value={text}
          inputMode="numeric"
          autoComplete="off"
          placeholder="dd/mm/yyyy"
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => setText(maskDate(e.target.value))}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit(text);
            } else if (e.key === 'ArrowDown' && e.altKey) {
              e.preventDefault();
              openCalendar();
            }
          }}
          className="h-full w-full min-w-[6.5rem] flex-1 bg-transparent pl-3 text-sm tabular-nums text-slate-900 placeholder:text-slate-500 focus:outline-none"
        />
        <button
          ref={triggerRef}
          type="button"
          onClick={() => (open ? close() : openCalendar())}
          aria-label={`Mở lịch chọn ${label.toLowerCase()}`}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-[#5F8A03] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03]"
        >
          <CalendarDays size={16} aria-hidden="true" />
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-rose-700">
          {error}
        </p>
      )}

      {open && (
        <div role="dialog" aria-modal="false" aria-label={`Chọn ${label.toLowerCase()}`} className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full z-30 mt-1.5 w-[17.5rem] rounded-xl border border-slate-300 bg-white p-3 shadow-xl`}>
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => move(addMonths(focused, -1))}
              aria-label="Tháng trước"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03]"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <p aria-live="polite" className="text-sm font-bold text-slate-900">
              Tháng {Number(m)}, {y}
            </p>
            <button
              type="button"
              onClick={() => move(addMonths(focused, 1))}
              aria-label="Tháng sau"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03]"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
          <div ref={gridRef} role="grid" aria-label={`Tháng ${Number(m)}, ${y}`} onKeyDown={onGridKey}>
            <div role="row" className="grid grid-cols-7">
              {WEEKDAYS.map((d, i) => (
                <span key={d} role="columnheader" aria-label={WEEKDAY_FULL[i]} className="py-1 text-center text-xs font-semibold text-slate-500">
                  {d}
                </span>
              ))}
            </div>
            {Array.from({ length: 6 }, (_, w) => (
              <div key={w} role="row" className="grid grid-cols-7">
                {days.slice(w * 7, w * 7 + 7).map((key) => {
                  const outside = key.slice(0, 7) !== month.slice(0, 7);
                  const selected = key === value;
                  const disabled = !inRange(key, min, max);
                  return (
                    <span key={key} role="gridcell" aria-selected={selected}>
                      <button
                        type="button"
                        data-day={key}
                        tabIndex={key === focused ? 0 : -1}
                        disabled={disabled}
                        onClick={() => pick(key)}
                        aria-label={`${formatDayKey(key)}${key === today ? ' (hôm nay)' : ''}`}
                        className={`h-9 w-full rounded-md text-xs tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#5F8A03] ${
                          selected
                            ? 'bg-[#5F8A03] font-bold text-white'
                            : disabled
                              ? 'cursor-not-allowed text-slate-300'
                              : `cursor-pointer hover:bg-[#F4F9E8] ${outside ? 'text-slate-400' : 'text-slate-800'} ${key === today ? 'font-bold ring-1 ring-inset ring-[#5F8A03]' : ''}`
                        }`}
                      >
                        {Number(key.slice(8))}
                      </button>
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <button
              type="button"
              onClick={() => pick(today)}
              disabled={!inRange(today, min, max)}
              className="rounded-md px-2 py-1.5 text-xs font-semibold text-[#4E7202] hover:bg-[#F4F9E8] cursor-pointer disabled:cursor-not-allowed disabled:text-slate-300"
            >
              Hôm nay
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange(undefined);
                  close();
                }}
                className="rounded-md px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Xoá ngày
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
