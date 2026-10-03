'use client';

import React, { useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { inputClass } from './hero-form';

interface TranslatableFieldProps {
  label: string;
  source: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  maxLength?: number;
  placeholder?: string;
  error?: string;
}

/**
 * Ô nhập bản dịch tối giản:
 * - Không có chữ "Gốc (VI):", không có nhãn rườm rà.
 * - Nội dung gốc hiển thị trực tiếp làm placeholder tự nhiên.
 * - Chuẩn Brand Remak với focus ring xanh #5F8A03.
 */
export default function TranslatableField({
  label,
  source,
  value,
  onChange,
  multiline,
  maxLength,
  placeholder,
  error,
}: TranslatableFieldProps) {
  const id = useId();
  const hasTranslation = value.trim() !== '';

  const common = {
    id,
    value,
    maxLength,
    placeholder: placeholder ?? (source || 'Nhập bản dịch tiếng Anh…'),
    'aria-describedby': error ? `${id}-error` : undefined,
    'aria-invalid': error ? true : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs font-bold text-slate-700">
          {label}
        </label>
        {hasTranslation && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            title="Xóa bản dịch này"
          >
            Xoá bản dịch
          </button>
        )}
      </div>

      {multiline ? (
        <textarea rows={3} {...common} className={`${inputClass} leading-relaxed`} />
      ) : (
        <input type="text" {...common} className={inputClass} />
      )}

      {error && (
        <p id={`${id}-error`} role="alert" className="flex items-center gap-1 text-[11px] font-semibold text-rose-600">
          <AlertCircle size={12} aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}
