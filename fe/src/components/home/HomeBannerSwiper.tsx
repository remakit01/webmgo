'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { BannerSwiperConfig, PublicBanner } from '@/lib/api';

interface HomeBannerSwiperProps {
  banners: PublicBanner[];
  config: BannerSwiperConfig;
}

const SIZES = '100vw';

function srcSet(banner: PublicBanner, format: 'webp' | 'avif') {
  return banner.images
    .filter((v) => v.format === format)
    .sort((a, b) => a.width - b.width)
    .map((v) => `${v.url} ${v.width}w`)
    .join(', ');
}

function BannerPicture({ banner, priority }: { banner: PublicBanner; priority: boolean }) {
  const avif = srcSet(banner, 'avif');
  const webp = srcSet(banner, 'webp');
  return (
    <picture>
      {avif && <source type="image/avif" srcSet={avif} sizes={SIZES} />}
      {webp && <source type="image/webp" srcSet={webp} sizes={SIZES} />}
      <img
        src={banner.imageUrl}
        alt={banner.alt}
        className="w-full h-full object-cover object-center"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
      />
    </picture>
  );
}

/**
 * HomeBannerSwiper:
 * - Dữ liệu banner + cấu hình lấy từ API (server component truyền xuống qua props, ISR)
 * - Tự động trượt, vuốt chạm trên mobile; không nút trái/phải, không thanh tiến trình
 */
export default function HomeBannerSwiper({ banners: activeBanners, config }: HomeBannerSwiperProps) {
  const intervalTime = config.autoPlayInterval;
  const isPauseOnHover = config.pauseOnHover;
  const displayDots = config.showDots;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Quản lý vuốt chạm trên Mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Danh sách đổi (sau revalidate) -> tránh index vượt quá độ dài
  useEffect(() => {
    setCurrentIndex((prev) => (prev >= activeBanners.length ? 0 : prev));
  }, [activeBanners.length]);

  // Tự động chạy slider (Auto play)
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    if (isPauseOnHover && (isHovered || isFocused)) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [activeBanners.length, intervalTime, isPauseOnHover, isHovered, isFocused]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;

    if (diff > 45) {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    } else if (diff < -45) {
      setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (activeBanners.length === 0) return null;

  return (
    <section 
      aria-label="Banner"
      className="relative w-full overflow-hidden select-none bg-slate-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* KHUNG CHỨA SWIPER FULL-WIDTH 100% HẾT SECTION */}
      <div className="relative w-full overflow-hidden group">
        
        {/* THANH TRƯỢT CÁC SLIDE (TRANSITION HARDWARE-ACCELERATED) */}
        <div 
          className="flex w-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {activeBanners.map((banner, index) => (
            <div 
              key={banner.id}
              className="w-full flex-shrink-0 relative aspect-[1024/342]"
            >
              {banner.linkUrl ? (
                <Link
                  href={banner.linkUrl}
                  className="block w-full h-full relative cursor-pointer"
                  title={banner.title}
                >
                  <BannerPicture banner={banner} priority={index === 0} />
                </Link>
              ) : (
                <div className="w-full h-full relative">
                  <BannerPicture banner={banner} priority={index === 0} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CHẤM CHỈ SỐ NHỎ GỌN (TÙY CHỌN BẬT TẮT QUA CMS) */}
        {displayDots && activeBanners.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-10 bg-slate-900/40 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-auto">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Chuyển đến ảnh ${idx + 1}`}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex 
                    ? 'w-6 sm:w-8 bg-white shadow-sm' 
                    : 'w-1.5 sm:w-2 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
