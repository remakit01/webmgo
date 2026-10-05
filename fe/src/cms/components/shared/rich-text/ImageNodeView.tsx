'use client';

import React from 'react';
import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';
import { AlertCircle } from 'lucide-react';

/** Ảnh trong bài: sửa alt (bắt buộc, cho SEO/người khiếm thị) và chú thích ngay dưới ảnh như báo điện tử */
export default function ImageNodeView({ node, updateAttributes, selected, editor }: ReactNodeViewProps) {
  const { src, alt, caption } = node.attrs as { src: string; alt: string | null; caption: string | null };
  const missingAlt = !alt?.trim();
  const editable = editor.isEditable;

  return (
    <NodeViewWrapper as="figure" className={`my-5 rounded-lg ${selected ? 'ring-2 ring-[#7CB305] ring-offset-2' : ''}`} data-drag-handle>
      {/* eslint-disable-next-line @next/next/no-img-element -- ảnh MinIO trong editor CMS */}
      <img src={src} alt={alt ?? ''} className="w-full h-auto rounded-lg border border-slate-200" draggable={false} />
      <div className="mt-2 grid gap-1.5" contentEditable={false}>
        <input
          value={caption ?? ''}
          readOnly={!editable}
          onChange={(e) => updateAttributes({ caption: e.target.value || null })}
          placeholder="Chú thích ảnh (hiển thị dưới ảnh, có thể bỏ trống)"
          className="w-full text-center text-xs italic text-slate-600 bg-transparent border-b border-dashed border-slate-200 focus:border-[#5F8A03] focus:outline-none py-1"
        />
        <label className={`flex items-center gap-2 text-[11px] ${missingAlt ? 'text-rose-600' : 'text-slate-500'}`}>
          {missingAlt && <AlertCircle size={12} aria-hidden="true" />}
          <span className="font-bold shrink-0">Mô tả ảnh (alt) *</span>
          <input
            value={alt ?? ''}
            readOnly={!editable}
            onChange={(e) => updateAttributes({ alt: e.target.value })}
            placeholder="Mô tả nội dung ảnh, vd: Tấm MGO bọc ống gió tại công trình"
            aria-invalid={missingAlt}
            className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-800 focus:outline-none focus:border-[#5F8A03]"
          />
        </label>
      </div>
    </NodeViewWrapper>
  );
}
