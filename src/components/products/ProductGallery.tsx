'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Maximize2, 
  Play, 
  Pause 
} from 'lucide-react';

interface ProductGalleryProps {
  productName: string;
  images: string[];
  fireRating: string;
  density: string;
  flexuralStrength: string;
  badge?: string;
  categoryLabel: string;
  testedStandards: string[];
  autoPlayInterval?: number;
}

/**
 * Component Thư Viện Ảnh Sản Phẩm Tương Tác:
 * - Tự động trượt ảnh (Auto Swiper) với thời gian tuỳ chỉnh
 * - Tạm dừng khi rê chuột (Pause on hover)
 * - Cho phép người dùng click đổi ảnh ngay lập tức qua thumbnail hoặc mũi tên trái/phải
 * - Hỗ trợ vuốt chạm trên thiết bị di động (Touch Swipe)
 * - Đầy đủ tem chứng nhận kiểm định PCCC và thông số cơ lý overlay
 */
export default function ProductGallery({
  productName,
  images,
  fireRating,
  density,
  flexuralStrength,
  badge,
  categoryLabel,
  testedStandards,
  autoPlayInterval = 4000,
}: ProductGalleryProps) {
  // Đảm bảo luôn có ít nhất 1 ảnh
  const gallery = images && images.length > 0 ? images : ['/images/mgo-duct.jpg'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Xử lý vuốt chạm (Touch swipe) trên màn hình cảm ứng
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Tự động chuyển ảnh (Auto Swiper)
  useEffect(() => {
    if (gallery.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % gallery.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [gallery.length, isPaused, autoPlayInterval]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % gallery.length);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;

    // Vuốt sang trái -> Ảnh tiếp theo
    if (diff > 40) {
      handleNext();
    }
    // Vuốt sang phải -> Ảnh trước đó
    else if (diff < -40) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="space-y-4 select-none">
      
      {/* 1. KHUNG ẢNH CHÍNH (MAIN PREVIEW SWIPER) */}
      <div 
        className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-lg aspect-4/3 cursor-pointer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slider Track */}
        <div 
          className="flex w-full h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {gallery.map((imgSrc, idx) => (
            <div 
              key={idx} 
              className="w-full h-full flex-shrink-0 relative overflow-hidden bg-slate-100"
            >
              <img 
                src={imgSrc} 
                alt={`${productName} - Ảnh ${idx + 1}`}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>

        {/* Nút điều hướng Trái / Phải (Prev / Next Buttons) */}
        {gallery.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Xem ảnh trước"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 shadow-md z-20 cursor-pointer"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Xem ảnh kế tiếp"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 shadow-md z-20 cursor-pointer"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Overlay Badges ở góc trên */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10 pointer-events-none">
          {badge && (
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#F26522] text-white shadow-md">
              {badge}
            </span>
          )}
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-white/95 text-[#5F8A03] backdrop-blur-md shadow-md">
            {categoryLabel}
          </span>
        </div>

        {/* Trạng thái Auto-play Indicator nhỏ gọn góc trên bên phải */}
        {gallery.length > 1 && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white text-[11px] font-medium">
            <span>{currentIndex + 1} / {gallery.length}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#7CB305] animate-pulse" />
          </div>
        )}

        {/* Overlay Thông Số Kiểm Định Ở Đáy Ảnh */}
        <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/10 text-white flex items-center justify-between text-xs z-10 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F26522]/20 flex items-center justify-center text-[#F26522] flex-shrink-0">
              <Flame size={18} />
            </div>
            <div>
              <div className="font-bold text-white text-xs sm:text-sm">{fireRating}</div>
              <div className="text-[11px] text-slate-300">Cấp không bắt lửa Class A1</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-[#A0D911] text-xs sm:text-sm">{density}</div>
            <div className="text-[11px] text-slate-300">Độ bền uốn {flexuralStrength}</div>
          </div>
        </div>

      </div>

      {/* 2. THANH THUMBNAIL (NGƯỜI DÙNG CLICK ĐỔI ẢNH TRỰC TIẾP) */}
      {gallery.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
          {gallery.map((imgSrc, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleThumbnailClick(idx)}
                aria-label={`Xem ảnh ${idx + 1}`}
                className={`relative rounded-xl overflow-hidden aspect-4/3 bg-slate-100 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'ring-2 ring-[#7CB305] ring-offset-2 scale-[1.03] shadow-md opacity-100'
                    : 'opacity-65 hover:opacity-100 hover:scale-[1.01] border border-slate-200'
                }`}
              >
                <img 
                  src={imgSrc} 
                  alt={`${productName} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover" 
                />
                {isActive && (
                  <div className="absolute inset-0 bg-[#7CB305]/10 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. KHỐI CHỨNG NHẬN & TIÊU CHUẨN THỬ NGHIỆM ĐÃ ĐẠT */}
      <div className="p-4 rounded-2xl bg-[#F4F9E8] border border-[#7CB305]/30">
        <div className="text-xs font-bold text-[#5F8A03] uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <ShieldCheck size={16} />
          <span>Chứng nhận & Tiêu chuẩn thử nghiệm đã đạt:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {testedStandards.map((std, idx) => (
            <span 
              key={idx} 
              className="px-2.5 py-1 rounded-md bg-white border border-[#7CB305]/30 text-xs font-semibold text-slate-700 shadow-2xs"
            >
              ✓ {std}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
