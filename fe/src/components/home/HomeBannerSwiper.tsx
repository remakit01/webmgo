'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  BannerSlide, 
  DEFAULT_BANNERS, 
  DEFAULT_SWIPER_CONFIG,
  getBannerSlides, 
  getSwiperConfig 
} from '@/lib/banner-store';

export type { BannerSlide };
export const defaultBanners = DEFAULT_BANNERS;

interface HomeBannerSwiperProps {
  banners?: BannerSlide[];
  autoPlayInterval?: number; // Thời gian tự động chuyển (ms), mặc định 3500ms
  showDots?: boolean;
}

/**
 * Component HomeBannerSwiper:
 * - Đọc dữ liệu động từ CMS (Banner Store)
 * - Tự động trượt (Auto Sliding / Infinite Loop)
 * - KHÔNG CÓ nút bấm trái/phải (No left/right action buttons)
 * - KHÔNG CÓ thanh tiến trình (No progress bar)
 * - Tương thích mượt mà kéo/vuốt trên điện thoại (Touch Swipe)
 */
export default function HomeBannerSwiper({
  banners: propBanners,
  autoPlayInterval: propAutoPlayInterval,
  showDots: propShowDots,
}: HomeBannerSwiperProps) {
  // Khởi tạo ban đầu với prop hoặc mặc định để SSR không bị lệch hydration
  const [activeBanners, setActiveBanners] = useState<BannerSlide[]>(
    propBanners || DEFAULT_BANNERS
  );
  const [intervalTime, setIntervalTime] = useState<number>(
    propAutoPlayInterval || DEFAULT_SWIPER_CONFIG.autoPlayInterval
  );
  const [isPauseOnHover, setIsPauseOnHover] = useState<boolean>(
    DEFAULT_SWIPER_CONFIG.pauseOnHover
  );
  const [displayDots, setDisplayDots] = useState<boolean>(
    propShowDots !== undefined ? propShowDots : DEFAULT_SWIPER_CONFIG.showDots
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Quản lý vuốt chạm trên Mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Đọc dữ liệu CMS và đăng ký lắng nghe sự kiện đồng bộ từ CMS
  useEffect(() => {
    if (!propBanners) {
      const stored = getBannerSlides();
      const filtered = stored.filter(b => b.active !== false);
      if (filtered.length > 0) {
        setActiveBanners(filtered);
      }
    }

    if (!propAutoPlayInterval) {
      const storedConfig = getSwiperConfig();
      setIntervalTime(storedConfig.autoPlayInterval);
      setIsPauseOnHover(storedConfig.pauseOnHover);
      if (propShowDots === undefined) {
        setDisplayDots(storedConfig.showDots);
      }
    }

    // Lắng nghe cập nhật tức thời khi Admin lưu trong CMS
    const handleBannersUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<BannerSlide[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        const filtered = customEvent.detail.filter(b => b.active !== false);
        setActiveBanners(filtered.length > 0 ? filtered : DEFAULT_BANNERS);
        setCurrentIndex(0);
      }
    };

    const handleConfigUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ autoPlayInterval: number; pauseOnHover: boolean; showDots: boolean }>;
      if (customEvent.detail) {
        setIntervalTime(customEvent.detail.autoPlayInterval);
        setIsPauseOnHover(customEvent.detail.pauseOnHover);
        if (propShowDots === undefined) {
          setDisplayDots(customEvent.detail.showDots);
        }
      }
    };

    window.addEventListener('remak_banners_updated', handleBannersUpdate);
    window.addEventListener('remak_swiper_config_updated', handleConfigUpdate);

    return () => {
      window.removeEventListener('remak_banners_updated', handleBannersUpdate);
      window.removeEventListener('remak_swiper_config_updated', handleConfigUpdate);
    };
  }, [propBanners, propAutoPlayInterval, propShowDots]);

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

    // Vuốt sang trái (next slide)
    if (diff > 45) {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    } 
    // Vuốt sang phải (prev slide)
    else if (diff < -45) {
      setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section 
      aria-label="Banner Swiper Tấm MGO Remak"
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
              {banner.link ? (
                <Link 
                  href={banner.link} 
                  className="block w-full h-full relative cursor-pointer"
                  title={banner.title}
                >
                  <img 
                    src={banner.image} 
                    alt={banner.alt}
                    className="w-full h-full object-cover object-center" 
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </Link>
              ) : (
                <div className="w-full h-full relative">
                  <img 
                    src={banner.image} 
                    alt={banner.alt}
                    className="w-full h-full object-cover object-center" 
                    loading={index === 0 ? "eager" : "lazy"}
                  />
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
