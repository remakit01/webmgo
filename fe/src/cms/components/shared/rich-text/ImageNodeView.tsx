'use client';

import React, { useRef, useState, useCallback } from 'react';
import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';
import {
  AlertCircle,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Maximize2,
  RotateCcw,
} from 'lucide-react';

/** Ảnh trong bài: hỗ trợ kéo thả co dãn trực tiếp, chọn kích thước nhanh, chữ ôm quanh ảnh (text wrap), sửa alt và chú thích */
export default function ImageNodeView({ node, updateAttributes, selected, editor }: ReactNodeViewProps) {
  const { src, alt, caption, width, height, align = 'center' } = node.attrs as {
    src: string;
    alt: string | null;
    caption: string | null;
    width: number | null;
    height: number | null;
    align?: 'left' | 'right' | 'center';
  };

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  // Trạng thái đang kéo co dãn
  const [resizing, setResizing] = useState<{
    direction: 'left' | 'right';
    startX: number;
    startWidth: number;
    aspectRatio: number;
    currentWidth: number;
  } | null>(null);

  const missingAlt = !alt?.trim();
  const editable = editor.isEditable;

  // Bắt đầu kéo co dãn
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, direction: 'left' | 'right') => {
    if (!editable) return;
    e.preventDefault();
    e.stopPropagation();

    const img = imgRef.current;
    if (!img) return;

    const currentW = img.offsetWidth;
    const currentH = img.offsetHeight;
    const ratio = (img.naturalWidth && img.naturalHeight)
      ? img.naturalWidth / img.naturalHeight
      : currentW / (currentH || 1);

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setResizing({
      direction,
      startX: e.clientX,
      startWidth: currentW,
      aspectRatio: ratio,
      currentWidth: currentW,
    });
  };

  // Di chuyển chuột khi đang kéo
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!resizing) return;
    e.preventDefault();

    const deltaX = resizing.direction === 'right'
      ? e.clientX - resizing.startX
      : resizing.startX - e.clientX;

    const parentW = containerRef.current?.parentElement?.offsetWidth || 850;
    // Giới hạn chiều rộng từ 160px đến tối đa container
    const maxAllowed = align === 'center' ? parentW : Math.min(parentW * 0.75, 650);
    const newWidth = Math.max(160, Math.min(maxAllowed, Math.round(resizing.startWidth + deltaX)));

    setResizing((prev) => prev ? { ...prev, currentWidth: newWidth } : null);
  };

  // Nhả chuột kết thúc kéo co dãn
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!resizing) return;
    e.preventDefault();

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Bỏ qua nếu pointer capture đã giải phóng
    }

    const finalWidth = resizing.currentWidth;
    const finalHeight = Math.round(finalWidth / resizing.aspectRatio);

    // Cập nhật thuộc tính node trong TipTap
    updateAttributes({
      width: finalWidth,
      height: finalHeight,
    });

    setResizing(null);
  };

  // Đặt kích thước theo phần trăm container
  const setPresetPercent = useCallback((percent: number | null) => {
    if (!editable) return;
    if (percent === null) {
      // Trở về 100% tự động (nếu đang ở giữa)
      updateAttributes({ width: null, height: null });
      return;
    }

    const parentW = containerRef.current?.parentElement?.offsetWidth || 800;
    const img = imgRef.current;
    const ratio = (img?.naturalWidth && img?.naturalHeight)
      ? img.naturalWidth / img.naturalHeight
      : 16 / 9;

    const targetWidth = Math.round((parentW * percent) / 100);
    const targetHeight = Math.round(targetWidth / ratio);

    updateAttributes({
      width: targetWidth,
      height: targetHeight,
    });
  }, [editable, updateAttributes]);

  // Đổi bố cục ôm chữ (Text wrap alignment)
  const setWrapAlign = (newAlign: 'left' | 'right' | 'center') => {
    if (!editable) return;

    // Nếu chuyển sang ôm chữ (left/right) mà chưa có width, gán kích thước mặc định 420px để chữ ôm ngay
    if ((newAlign === 'left' || newAlign === 'right') && !width) {
      const parentW = containerRef.current?.parentElement?.offsetWidth || 800;
      const defaultW = Math.min(420, Math.round(parentW * 0.5));
      const img = imgRef.current;
      const ratio = (img?.naturalWidth && img?.naturalHeight)
        ? img.naturalWidth / img.naturalHeight
        : 16 / 9;
      updateAttributes({
        align: newAlign,
        width: defaultW,
        height: Math.round(defaultW / ratio),
      });
      return;
    }

    updateAttributes({ align: newAlign });
  };

  // Chiều rộng hiển thị (ưu tiên lúc đang kéo, rồi tới width lưu, hoặc 100%)
  const displayWidth = resizing ? resizing.currentWidth : (width ?? undefined);

  // CSS wrapper tương ứng theo vị trí căn chỉnh / Text wrap
  let wrapperAlignmentClass = 'my-6 clear-both';
  if (align === 'left') {
    wrapperAlignmentClass = 'my-3 mr-6 mb-4 float-left clear-left max-w-[65%]';
  } else if (align === 'right') {
    wrapperAlignmentClass = 'my-3 ml-6 mb-4 float-right clear-right max-w-[65%]';
  }

  return (
    <NodeViewWrapper
      as="figure"
      ref={containerRef}
      className={`group relative rounded-xl transition-all ${wrapperAlignmentClass} ${
        selected ? 'ring-2 ring-[#7CB305] ring-offset-2' : ''
      }`}
      data-drag-handle
    >
      {/* Khung bao bọc ảnh & các điều khiển */}
      <div
        className="relative mx-auto transition-all duration-75 ease-out select-none"
        style={{
          width: displayWidth ? `${displayWidth}px` : (align === 'center' ? '100%' : '380px'),
          maxWidth: '100%',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ảnh MinIO trong editor CMS */}
        <img
          ref={imgRef}
          src={src}
          alt={alt ?? ''}
          style={{ width: '100%', height: 'auto' }}
          className={`rounded-lg border border-slate-200 block shadow-sm ${
            resizing ? 'pointer-events-none' : ''
          }`}
          draggable={false}
        />

        {/* Badge hiển thị kích thước realtime khi đang kéo hoặc khi chọn ảnh */}
        {(resizing || (selected && width)) && (
          <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded shadow z-30 pointer-events-none">
            {displayWidth} px
          </div>
        )}

        {/* Thanh công cụ Preset nhanh kích thước & Bố cục Text Wrap (hiển thị khi chọn ảnh) */}
        {selected && editable && !resizing && (
          <div
            contentEditable={false}
            className="absolute top-2 left-2 z-30 flex flex-wrap items-center gap-1 bg-white/95 backdrop-blur border border-slate-200/90 shadow-md rounded-lg p-1 text-[11px]"
          >
            {/* Cụm căn chỉnh Text Wrap (ôm chữ) */}
            <div className="flex items-center gap-0.5 pr-1 border-r border-slate-200">
              <button
                type="button"
                title="Bọc trái (Chữ ôm xung quanh bên phải ảnh)"
                onClick={() => setWrapAlign('left')}
                className={`p-1 rounded transition-colors ${
                  align === 'left' ? 'bg-[#5F8A03] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <AlignLeft size={14} />
              </button>
              <button
                type="button"
                title="Độc lập (Tách dòng riêng ở giữa, không ôm chữ)"
                onClick={() => setWrapAlign('center')}
                className={`p-1 rounded transition-colors ${
                  align === 'center' ? 'bg-[#5F8A03] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <AlignCenter size={14} />
              </button>
              <button
                type="button"
                title="Bọc phải (Chữ ôm xung quanh bên trái ảnh)"
                onClick={() => setWrapAlign('right')}
                className={`p-1 rounded transition-colors ${
                  align === 'right' ? 'bg-[#5F8A03] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <AlignRight size={14} />
              </button>
            </div>

            {/* Cụm kích cỡ nhanh */}
            <span className="text-slate-500 font-semibold px-0.5">Cỡ:</span>
            {align === 'center' && (
              <button
                type="button"
                onClick={() => setPresetPercent(null)}
                className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
                  !width ? 'bg-[#5F8A03] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Full
              </button>
            )}
            <button
              type="button"
              onClick={() => setPresetPercent(70)}
              className="px-1.5 py-0.5 rounded font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              70%
            </button>
            <button
              type="button"
              onClick={() => setPresetPercent(50)}
              className="px-1.5 py-0.5 rounded font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => setPresetPercent(35)}
              className="px-1.5 py-0.5 rounded font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              35%
            </button>

            {width && (
              <button
                type="button"
                title="Đặt lại chiều rộng mặc định"
                onClick={() => setPresetPercent(null)}
                className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors ml-0.5 border-l border-slate-200 pl-1.5"
              >
                <RotateCcw size={12} />
              </button>
            )}
          </div>
        )}

        {/* Điểm neo kéo thả co dãn (Drag-to-resize handles) */}
        {selected && editable && (
          <>
            {/* Handle góc dưới bên phải */}
            <div
              role="slider"
              aria-label="Kéo co dãn ảnh góc phải"
              tabIndex={0}
              onPointerDown={(e) => handlePointerDown(e, 'right')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="absolute -bottom-2 -right-2 w-5 h-5 bg-[#5F8A03] border-2 border-white rounded-full shadow-lg cursor-nwse-resize z-40 hover:scale-125 active:scale-110 transition-transform flex items-center justify-center text-white touch-none"
              title="Nhấn giữ và kéo chuột để thay đổi kích thước ảnh"
            >
              <Maximize2 size={10} className="rotate-90 pointer-events-none" />
            </div>

            {/* Handle góc dưới bên trái */}
            <div
              role="slider"
              aria-label="Kéo co dãn ảnh góc trái"
              tabIndex={0}
              onPointerDown={(e) => handlePointerDown(e, 'left')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="absolute -bottom-2 -left-2 w-5 h-5 bg-[#5F8A03] border-2 border-white rounded-full shadow-lg cursor-nesw-resize z-40 hover:scale-125 active:scale-110 transition-transform flex items-center justify-center text-white touch-none"
              title="Nhấn giữ và kéo chuột để thay đổi kích thước ảnh"
            >
              <Maximize2 size={10} className="pointer-events-none" />
            </div>
          </>
        )}
      </div>

      {/* Chú thích ảnh & Alt SEO */}
      <div className="mt-2.5 grid gap-1.5 max-w-full mx-auto" contentEditable={false}>
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
