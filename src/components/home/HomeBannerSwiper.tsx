'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export interface BannerSlide {
  id: number;
  image: string;
  alt: string;
  link?: string;
  title: string;
}

// Danh sách banner lấy từ thư mục public/images/banners/
export const defaultBanners: BannerSlide[] = [
  {
    id: 1,
    image: '/images/banners/banner-1-tam-op.png',
    alt: 'Tấm ốp chống cháy MGO - Nhanh chóng, Dễ dàng, Bền bỉ, Tiết kiệm năng lượng',
    link: '/san-pham/tam-mgo',
    title: 'Tấm ốp chống cháy MGO',
  },
  {
    id: 2,
    image: '/images/banners/banner-2-chiu-lua.png',
    alt: 'Tấm chống cháy chịu lửa 3 giờ - 100% không amiăng - Vật liệu không cháy',
    link: '/san-pham/tam-mgo',
    title: 'Tấm chống cháy chịu lửa 3 giờ',
  },
  {
    id: 3,
    image: '/images/banners/banner-3-lot-san.png',
    alt: 'Tấm MGO lót sàn - Độ bền vượt trội và chi phí hiệu quả - Nền sàn hèm khóa độc đáo',
    link: '/ung-dung#san-mgo',
    title: 'Tấm MGO lót sàn',
  },
];

interface HomeBannerSwiperProps {
  banners?: BannerSlide[];
  autoPlayInterval?: number; // Thời gian tự động chuyển (ms), mặc định 3500ms
  showDots?: boolean;
}

/**
 * Component HomeBannerSwiper:
 * - Tự động trượt (Auto Sliding / Infinite Loop)
 * - KHÔNG CÓ nút bấm trái/phải (No left/right action buttons)
 * - KHÔNG CÓ thanh tiến trình (No progress bar)
 * - Tương thích mượt mà kéo/vuốt trên điện thoại (Touch Swipe)
 */
export default function HomeBannerSwiper({
  banners = defaultBanners,
  autoPlayInterval = 3500,
  showDots = true,
}: HomeBannerSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Quản lý vuốt chạm trên Mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Tự động chạy slider (Auto play)
  useEffect(() => {
    if (banners.length <= 1 || isHovered || isFocused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [banners.length, autoPlayInterval, isHovered, isFocused]);

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
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    } 
    // Vuốt sang phải (prev slide)
    else if (diff < -45) {
      setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
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
          {banners.map((banner, index) => (
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

        {/* CHẤM CHỈ SỐ NHỎ GỌN (TÙY CHỌN, HOÀN TOÀN KHÔNG CÓ PROGRESS BAR & KHÔNG CÓ ACTION TRÁI PHẢI) */}
        {showDots && banners.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-10 bg-slate-900/40 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-auto">
            {banners.map((_, idx) => (
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
