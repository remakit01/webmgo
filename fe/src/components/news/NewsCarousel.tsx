'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Khung cuộn ngang có nút trái/phải; nội dung (thẻ bài) render ở server và truyền vào children */
export default function NewsCarousel({ children }: { children: React.ReactNode }) {
  const t = useTranslations('News');
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: -1 | 1) => ref.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });
  const btn =
    'absolute top-[38%] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md hover:shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:text-black transition-all cursor-pointer';

  return (
    <div className="relative">
      <button type="button" onClick={() => scroll(-1)} className={`${btn} -left-2 sm:-left-4`} aria-label={t('scrollLeft')}>
        <ChevronLeft size={20} />
      </button>
      <button type="button" onClick={() => scroll(1)} className={`${btn} -right-2 sm:-right-4`} aria-label={t('scrollRight')}>
        <ChevronRight size={20} />
      </button>
      <div ref={ref} className="flex items-start gap-4 sm:gap-5 overflow-x-auto scrollbar-none py-1 scroll-smooth snap-x [&>*]:snap-start [&>*]:w-[230px] sm:[&>*]:w-[260px] lg:[&>*]:w-[calc(25%-15px)] [&>*]:shrink-0">
        {children}
      </div>
    </div>
  );
}
