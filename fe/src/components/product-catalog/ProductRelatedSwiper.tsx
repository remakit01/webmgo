'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ProductListItemPublic } from '@remak/shared/contracts/product';
import type { Locale } from '@/i18n/routing';
import CatalogCard from './CatalogCard';

interface ProductRelatedSwiperProps {
  items: ProductListItemPublic[];
  locale: Locale;
}

/**
 * Swiper cho mục "Sản phẩm khác":
 * - Bỏ dòng footer ở dưới item (giá / xem chi tiết) -> Thẻ card siêu gọn gàng, thanh thoát
 * - Bố trí 2 nút bấm Swiper tại Header của Section và hai bên sườn Section
 * - Vuốt chạm mượt mà trên mobile/tablet (Touch swipe + CSS Snap)
 * - Ẩn hoàn toàn thanh cuộn scrollbar trên mọi trình duyệt
 */
export default function ProductRelatedSwiper({ items, locale }: ProductRelatedSwiperProps) {
  const t = useTranslations('Products');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Cập nhật trạng thái nút bấm Trái/Phải
  const checkScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScrollState();
    el.addEventListener('scroll', checkScrollState, { passive: true });
    window.addEventListener('resize', checkScrollState);

    return () => {
      el.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [checkScrollState, items.length]);

  // Cuộn mượt khi bấm nút
  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollAmount = Math.max(el.clientWidth * 0.75, 300);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* ── HEADER CỦA SECTION: TIÊU ĐỀ ── */}
      <div className="border-b border-slate-200 pb-3">
        <h2 id="san-pham-khac" className="text-xl font-extrabold text-slate-900 lg:text-2xl">
          {t('relatedTitle')}
        </h2>
      </div>

      {/* ── KHUNG SWIPER CHỨA CÁC ITEM ── */}
      <div className="relative group/swiper">
        {/* Nút bấm sườn Trái nổi bật */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-800 shadow-lg backdrop-blur-xs transition-all hover:scale-105 hover:border-[#4E7202] hover:text-[#3F5E02] focus-visible:outline-2 focus-visible:outline-[#4E7202]"
            aria-label="Cuộn sang trái"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
        )}

        {/* Nút bấm sườn Phải nổi bật */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-800 shadow-lg backdrop-blur-xs transition-all hover:scale-105 hover:border-[#4E7202] hover:text-[#3F5E02] focus-visible:outline-2 focus-visible:outline-[#4E7202]"
            aria-label="Cuộn sang phải"
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        )}

        {/* Danh sách các item (ẩn triệt để thanh cuộn scrollbar) */}
        <div
          ref={scrollRef}
          role="region"
          aria-labelledby="san-pham-khac"
          className="flex items-stretch gap-5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth snap-x snap-mandatory py-2 -mx-4 px-4 sm:-mx-0 sm:px-0"
          tabIndex={0}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="flex w-[280px] sm:w-[320px] lg:w-[calc(33.333%-14px)] xl:w-[calc(25%-16px)] shrink-0 snap-start"
            >
              {/* Đã bỏ phần footer ở dưới item để card thanh thoát, gọn gàng */}
              <CatalogCard item={item} locale={locale} hideFooter />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
