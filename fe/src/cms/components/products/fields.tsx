'use client';

import React, { useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react';
import IconAction from '@/cms/components/shared/IconAction';
import { inputClass } from '@/cms/components/shared/form-styles';
import { fieldId } from './product-form';

// Ô nhập dùng trong form Sản phẩm. Mỗi ô nhận `path` = khoá lỗi (vd "variants.0.priceVnd"):
// id DOM sinh từ path để trang focus đúng ô khi lưu bị lỗi; lỗi hiện ngay dưới ô.

export const labelClass = 'text-xs font-bold text-slate-700';
const input = `${inputClass} text-sm`;

type Errors = Record<string, string>;

function Field({
  path,
  label,
  hint,
  errors,
  required,
  children,
  className = '',
}: {
  path: string;
  label: ReactNode;
  hint?: ReactNode;
  errors?: Errors;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const id = fieldId(path);
  const error = errors?.[path];
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={id} className={labelClass}>
        {label} {required && <span className="text-rose-700">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-slate-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="text-xs font-medium text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}

/** aria cho ô: invalid + mô tả trỏ tới lỗi / gợi ý */
const aria = (path: string, errors?: Errors, hint?: boolean) => {
  const id = fieldId(path);
  const error = errors?.[path];
  return {
    id,
    'aria-invalid': !!error || undefined,
    'aria-describedby': error ? `${id}-err` : hint ? `${id}-hint` : undefined,
  };
};

export function TextField({
  path,
  label,
  value,
  onChange,
  errors,
  hint,
  required,
  maxLength,
  placeholder,
  rows,
  mono,
  className,
}: {
  path: string;
  label: ReactNode;
  value: string;
  onChange: (v: string) => void;
  errors?: Errors;
  hint?: ReactNode;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  /** có = textarea */
  rows?: number;
  mono?: boolean;
  className?: string;
}) {
  const props = { ...aria(path, errors, !!hint), value, maxLength, placeholder, required, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value) };
  return (
    <Field path={path} label={label} hint={hint} errors={errors} required={required} className={className}>
      {rows ? <textarea rows={rows} {...props} className={`${input} leading-relaxed`} /> : <input {...props} className={`${input} ${mono ? 'font-mono' : ''}`} />}
      {maxLength && value.length > maxLength * 0.9 && (
        <p className="text-right text-xs font-semibold tabular-nums text-amber-700">
          {value.length}/{maxLength}
        </p>
      )}
    </Field>
  );
}

const toNumber = (raw: string): number | null => {
  const s = raw.trim().replace(',', '.');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

/**
 * Ô số: giữ chuỗi đang gõ (cho phép "0," / "1.") và chỉ đẩy số ra ngoài khi hợp lệ; trống = null (chưa có số liệu).
 * Nhận dấu phẩy thập phân kiểu Việt.
 */
export function NumberField({
  path,
  label,
  value,
  onChange,
  errors,
  hint,
  unit,
  required,
  integer,
  placeholder,
  className,
}: {
  path: string;
  label: ReactNode;
  value: number | null;
  onChange: (v: number | null) => void;
  errors?: Errors;
  hint?: ReactNode;
  unit?: string;
  required?: boolean;
  integer?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const [text, setText] = useState(value == null ? '' : String(value));
  const [focused, setFocused] = useState(false);
  // Giá trị đổi từ ngoài (tải lại / hoàn tác) khi không gõ -> hiện theo giá trị mới
  const shown = focused ? text : value == null ? '' : String(value);
  return (
    <Field path={path} label={label} hint={hint} errors={errors} required={required} className={className}>
      <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-[#5F8A03] focus-within:ring-1 focus-within:ring-[#5F8A03] has-[[aria-invalid=true]]:border-rose-400">
        <input
          {...aria(path, errors, !!hint)}
          inputMode={integer ? 'numeric' : 'decimal'}
          value={shown}
          placeholder={placeholder ?? '—'}
          onFocus={() => {
            setText(value == null ? '' : String(value));
            setFocused(true);
          }}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            const raw = integer ? e.target.value.replace(/[^\d]/g, '') : e.target.value.replace(/[^\d.,-]/g, '');
            setText(raw);
            onChange(toNumber(raw));
          }}
          className="min-w-0 flex-1 px-3 py-2.5 text-sm font-medium tabular-nums text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        {unit && <span className="flex shrink-0 items-center border-l border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-600">{unit}</span>}
      </div>
    </Field>
  );
}

/** Khoảng min – max (≥ 25 → chỉ min; < 15 → chỉ max) */
export function RangeField({
  pathMin,
  pathMax,
  label,
  min,
  max,
  onChange,
  errors,
  unit,
  hint,
}: {
  pathMin: string;
  pathMax: string;
  label: string;
  min: number | null;
  max: number | null;
  onChange: (min: number | null, max: number | null) => void;
  errors?: Errors;
  unit?: string;
  hint?: string;
}) {
  return (
    <fieldset className="space-y-1">
      <legend className={labelClass}>{label}</legend>
      <div className="grid grid-cols-2 gap-2">
        <NumberField path={pathMin} label={<span className="font-semibold text-slate-600">Từ</span>} value={min} onChange={(v) => onChange(v, max)} errors={errors} unit={unit} />
        <NumberField path={pathMax} label={<span className="font-semibold text-slate-600">Đến</span>} value={max} onChange={(v) => onChange(min, v)} errors={errors} unit={unit} />
      </div>
      {hint && <p className="text-xs text-slate-600">{hint}</p>}
    </fieldset>
  );
}

export function SelectField<T extends string>({
  path,
  label,
  value,
  options,
  onChange,
  errors,
  hint,
  emptyLabel = '— Chưa có —',
  className,
}: {
  path: string;
  label: ReactNode;
  value: T | null;
  options: readonly { value: T; label: string }[];
  onChange: (v: T | null) => void;
  errors?: Errors;
  hint?: ReactNode;
  /** null = bắt buộc chọn */
  emptyLabel?: string | null;
  className?: string;
}) {
  return (
    <Field path={path} label={label} hint={hint} errors={errors} className={className}>
      <select
        {...aria(path, errors, !!hint)}
        value={value ?? ''}
        onChange={(e) => onChange((e.target.value || null) as T | null)}
        className={`${input} cursor-pointer`}
      >
        {emptyLabel !== null && <option value="">{emptyLabel}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/** Có / Không / Chưa rõ — null nghĩa là chưa có số liệu, không hiện trên web */
export function TriStateField({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean | null) => void }) {
  const opts: { v: boolean | null; text: string }[] = [
    { v: true, text: 'Có' },
    { v: false, text: 'Không' },
    { v: null, text: 'Chưa rõ' },
  ];
  return (
    <fieldset className="space-y-1">
      <legend className={labelClass}>{label}</legend>
      <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5">
        {opts.map((o) => (
          <button
            key={String(o.v)}
            type="button"
            aria-pressed={value === o.v}
            onClick={() => onChange(o.v)}
            className={`h-8 rounded-md px-3 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03] ${
              value === o.v ? (o.v === null ? 'bg-slate-200 text-slate-800' : 'bg-[#4E7202] text-white') : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {o.text}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Switch({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <span id={`${id}-label`} className="block text-sm font-semibold text-slate-900">
          {label}
        </span>
        {hint && (
          <span id={`${id}-hint`} className="block text-xs text-slate-600">
            {hint}
          </span>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03] ${
          checked ? 'bg-[#4E7202]' : 'bg-slate-400'
        }`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

/** Chọn nhiều từ danh sách cố định (nút bật/tắt) */
export function ChipsField<T extends string>({
  label,
  options,
  value,
  onChange,
  errors,
  path,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: readonly T[];
  onChange: (v: T[]) => void;
  errors?: Errors;
  path?: string;
}) {
  const toggle = (v: T) => onChange(value.includes(v) ? value.filter((x) => x !== v) : options.map((o) => o.value).filter((x) => x === v || value.includes(x)));
  const error = path ? errors?.[path] : undefined;
  return (
    <fieldset className="space-y-1.5" id={path ? fieldId(path) : undefined} tabIndex={error ? -1 : undefined}>
      <legend className={labelClass}>{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = value.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(o.value)}
              className={`h-8 rounded-full border px-3 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03] ${
                on ? 'border-[#4E7202] bg-[#F4F9E8] text-[#3F5E02]' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {on && <span aria-hidden="true">✓ </span>}
              {o.label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs font-medium text-rose-700">{error}</p>}
    </fieldset>
  );
}

/** Danh sách chữ tự do (tiêu chuẩn, chứng nhận xanh…): gõ rồi Enter để thêm */
export function TagsField({ id, label, value, onChange, placeholder, hint }: { id: string; label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string; hint?: string }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft('');
  };
  return (
    <div className="space-y-1">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 bg-white p-1.5 focus-within:border-[#5F8A03] focus-within:ring-1 focus-within:ring-[#5F8A03]">
        {value.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-slate-50 py-0.5 pl-2 pr-0.5 text-xs font-semibold text-slate-800">
            {v}
            <button
              type="button"
              aria-label={`Bỏ “${v}”`}
              onClick={() => onChange(value.filter((x) => x !== v))}
              className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-600 hover:bg-slate-200 hover:text-slate-900 cursor-pointer"
            >
              <X size={12} aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          placeholder={value.length ? '' : placeholder}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add();
            } else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={add}
          className="min-w-[8rem] flex-1 px-1.5 py-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>
      <p id={`${id}-hint`} className="text-xs text-slate-600">
        {hint ?? 'Gõ rồi nhấn Enter để thêm.'}
      </p>
    </div>
  );
}

/**
 * Danh sách các mục có cấu trúc (ưu điểm, FAQ, khổ tấm…): thêm / xoá / đổi thứ tự bằng ▲ ▼.
 * renderItem vẽ các ô của một mục.
 */
export function RepeatList<T>({
  label,
  items,
  onChange,
  newItem,
  renderItem,
  itemName,
  max = 30,
  hint,
}: {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  newItem: () => T;
  renderItem: (item: T, set: (patch: T) => void, index: number) => ReactNode;
  itemName: string;
  max?: number;
  hint?: string;
}) {
  const move = (i: number, d: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <fieldset className="space-y-2">
      <legend className={labelClass}>
        {label} <span className="font-normal text-slate-600">({items.length})</span>
      </legend>
      {hint && <p className="text-xs text-slate-600">{hint}</p>}
      {items.length > 0 && (
        <ol className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-2.5">
              <span className="mt-2 w-5 shrink-0 text-center text-xs font-bold tabular-nums text-slate-600" aria-hidden="true">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">{renderItem(item, (v) => onChange(items.map((x, j) => (j === i ? v : x))), i)}</div>
              <div className="flex shrink-0 items-center">
                <IconAction label={`Chuyển ${itemName} ${i + 1} lên`} icon={ArrowUp} disabled={i === 0} onClick={() => move(i, -1)} />
                <IconAction label={`Chuyển ${itemName} ${i + 1} xuống`} icon={ArrowDown} disabled={i === items.length - 1} onClick={() => move(i, 1)} />
                <IconAction label={`Xoá ${itemName} ${i + 1}`} icon={Trash2} danger onClick={() => onChange(items.filter((_, j) => j !== i))} tipAlign="end" />
              </div>
            </li>
          ))}
        </ol>
      )}
      <button
        type="button"
        disabled={items.length >= max}
        onClick={() => onChange([...items, newItem()])}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-dashed border-slate-400 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-[#5F8A03] hover:text-[#3F5E02] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03]"
      >
        <Plus size={14} aria-hidden="true" /> Thêm {itemName}
      </button>
    </fieldset>
  );
}

/** Ô nhỏ không nhãn hiển thị (dùng trong RepeatList); nhãn cho trình đọc màn hình qua aria-label */
export function BareInput({ label, value, onChange, placeholder, rows }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return rows ? (
    <textarea aria-label={label} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${input} leading-relaxed`} />
  ) : (
    <input aria-label={label} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={input} />
  );
}

/** Ô số nhỏ không nhãn hiển thị (khổ tấm trong RepeatList) */
export function BareNumber({ label, value, onChange, unit }: { label: string; value: number | null; onChange: (v: number | null) => void; unit?: string }) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-[#5F8A03] focus-within:ring-1 focus-within:ring-[#5F8A03]">
      <input
        aria-label={label}
        inputMode="numeric"
        value={value ?? ''}
        onChange={(e) => onChange(toNumber(e.target.value.replace(/[^\d]/g, '')))}
        className="min-w-0 flex-1 px-3 py-2 text-sm tabular-nums text-slate-900 focus:outline-none"
      />
      {unit && <span className="flex items-center border-l border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-600">{unit}</span>}
    </div>
  );
}

/** Thẻ một phần của form, có id neo cho mục lục */
export function Section({ id, title, description, actions, children }: { id: string; title: string; description?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 rounded-xl border border-slate-300 bg-white shadow-2xs">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
        <div>
          <h2 id={`${id}-title`} className="text-sm font-bold text-slate-900">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-xs text-slate-600">{description}</p>}
        </div>
        {actions}
      </div>
      <div className="space-y-5 p-5">{children}</div>
    </section>
  );
}
