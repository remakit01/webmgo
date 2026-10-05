'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { ImagePlus, Loader2, RefreshCw, X } from 'lucide-react';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif';
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Ô chọn ảnh dùng chung: kéo-thả hoặc bấm chọn, xem trước ngay, báo kích thước thật.
 * Nhận mọi kích thước ảnh; chỉ chặn sai định dạng hoặc > 10MB (giới hạn của API).
 */
export default function ImageUploadField({
  label,
  currentUrl,
  file,
  onPick,
  onClear,
  uploading,
  hint,
  aspect = 'aspect-[1200/630]',
}: {
  label: string;
  /** Ảnh đang lưu trên máy chủ */
  currentUrl?: string | null;
  /** Ảnh vừa chọn, chưa lưu */
  file: File | null;
  onPick: (file: File) => void;
  onClear: () => void;
  uploading?: boolean;
  hint?: string;
  aspect?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- đồng bộ URL xem trước theo file được chọn
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
      setPreviewUrl(null);
    };
  }, [file]);

  const pick = (picked: File | undefined) => {
    if (!picked) return;
    if (!ACCEPT.split(',').includes(picked.type)) return setError('Chỉ nhận ảnh JPEG, PNG, WebP hoặc AVIF');
    if (picked.size > MAX_BYTES) return setError('Ảnh vượt quá 10MB');
    setError(null);
    onPick(picked);
  };

  const shown = previewUrl ?? currentUrl ?? null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="text-xs font-bold text-slate-700">
          {label}
        </label>
        {size && <span className="text-[11px] text-slate-500 tabular-nums">{size.w}×{size.h}px</span>}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files?.[0]);
        }}
        className={`relative ${aspect} w-full rounded-lg border-2 border-dashed overflow-hidden transition-colors ${
          dragging ? 'border-[#5F8A03] bg-[#F4F9E8]' : 'border-slate-300 bg-slate-50'
        }`}
      >
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh blob/MinIO xem trước trong CMS
          <img
            src={shown}
            alt=""
            onLoad={(e) => setSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-[#5F8A03] cursor-pointer"
          >
            <ImagePlus size={22} aria-hidden="true" />
            <span className="text-xs font-semibold">Kéo thả hoặc bấm để chọn ảnh</span>
          </button>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#5F8A03]" aria-label="Đang tải ảnh lên" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <RefreshCw size={12} aria-hidden="true" /> {shown ? 'Đổi ảnh' : 'Chọn ảnh'}
        </button>
        {file && (
          <button
            type="button"
            onClick={() => {
              setSize(null);
              onClear();
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-600 cursor-pointer"
          >
            <X size={12} aria-hidden="true" /> Bỏ ảnh vừa chọn
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-[11px] font-semibold text-rose-600">
          {error}
        </p>
      )}
      {hint && !error && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}
