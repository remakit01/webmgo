'use client';

import React, { useEffect, useId, useState } from 'react';
import { Check, Link2, Lock, LockOpen, TriangleAlert } from 'lucide-react';
import { isValidSlug, slugify } from '@remak/shared/slug';
import { inputClass } from './form-styles';

/**
 * Ô đường dẫn (slug) dùng chung:
 * - Mặc định khoá & tự sinh từ tiêu đề (bỏ dấu tiếng Việt) — chỉ khi bản ghi chưa có slug.
 * - Mở khoá để sửa tay; kiểm tra trùng qua `checkAvailable` (debounce).
 * - Bài đã đăng đổi slug: cảnh báo (máy chủ tự tạo redirect 301 từ đường dẫn cũ).
 */
export default function SlugField({
  value,
  onChange,
  sourceText,
  prefix,
  autoFromSource,
  published,
  checkAvailable,
}: {
  value: string;
  onChange: (slug: string) => void;
  /** Văn bản sinh slug (tiêu đề) */
  sourceText: string;
  /** Phần URL đứng trước slug, vd "remak.vn/tin-tuc/" */
  prefix: string;
  /** true = tự sinh theo tiêu đề (bản ghi mới chưa có slug) */
  autoFromSource: boolean;
  published?: boolean;
  checkAvailable?: (slug: string) => Promise<{ available: boolean; suggestion: string }>;
}) {
  const id = useId();
  const [locked, setLocked] = useState(true);
  const [check, setCheck] = useState<{ slug: string; available: boolean; suggestion: string } | null>(null);
  const [initial] = useState(value);

  // Tự sinh theo tiêu đề khi đang khoá và bản ghi chưa có slug riêng
  useEffect(() => {
    if (locked && autoFromSource) {
      const next = slugify(sourceText);
      if (next !== value) onChange(next);
    }
  }, [locked, autoFromSource, sourceText, value, onChange]);

  useEffect(() => {
    if (!checkAvailable || !isValidSlug(value)) return;
    const t = setTimeout(() => {
      checkAvailable(value)
        .then((r) => setCheck({ slug: value, ...r }))
        .catch(() => setCheck(null));
    }, 450);
    return () => clearTimeout(t);
  }, [value, checkAvailable]);

  const valid = value === '' || isValidSlug(value);
  const status = check && check.slug === value ? check : null;
  const changedAfterPublish = published && initial && value !== initial;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
        <Link2 size={13} aria-hidden="true" /> Đường dẫn (slug)
      </label>
      <div className="flex items-stretch rounded-lg border border-slate-300 bg-white overflow-hidden focus-within:border-[#5F8A03] focus-within:ring-1 focus-within:ring-[#5F8A03]">
        <span className="hidden sm:flex items-center px-3 text-[11px] text-slate-500 bg-slate-50 border-r border-slate-200 whitespace-nowrap">
          {prefix}
        </span>
        <input
          id={id}
          value={value}
          readOnly={locked}
          onChange={(e) => onChange(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
          onBlur={() => !locked && onChange(slugify(value) || value)}
          aria-invalid={!valid || (status ? !status.available : false)}
          className={`${inputClass} border-0 rounded-none focus:ring-0 ${locked ? 'text-slate-500 bg-slate-50/50' : ''}`}
          spellCheck={false}
        />
        <button
          type="button"
          onClick={() => setLocked((l) => !l)}
          className="px-3 text-slate-500 hover:text-[#5F8A03] border-l border-slate-200 cursor-pointer"
          aria-label={locked ? 'Mở khoá để sửa đường dẫn' : 'Khoá đường dẫn'}
          title={locked ? 'Mở khoá để sửa đường dẫn' : 'Khoá đường dẫn'}
        >
          {locked ? <Lock size={14} /> : <LockOpen size={14} />}
        </button>
      </div>

      {!valid ? (
        <p className="text-[11px] font-semibold text-rose-600">Chỉ dùng chữ thường không dấu, số và dấu gạch ngang</p>
      ) : status && !status.available ? (
        <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1.5 flex-wrap">
          <TriangleAlert size={12} aria-hidden="true" /> Đường dẫn đã được dùng.
          <button type="button" onClick={() => onChange(status.suggestion)} className="underline cursor-pointer">
            Dùng “{status.suggestion}”
          </button>
        </p>
      ) : status?.available ? (
        <p className="text-[11px] font-semibold text-[#4E7202] flex items-center gap-1">
          <Check size={12} aria-hidden="true" /> Đường dẫn dùng được
        </p>
      ) : null}
      {changedAfterPublish && (
        <p className="text-[11px] text-amber-700">
          Bài đã đăng: đường dẫn cũ <code className="font-mono">{initial}</code> sẽ tự chuyển hướng (301) sang đường dẫn mới.
        </p>
      )}
    </div>
  );
}
