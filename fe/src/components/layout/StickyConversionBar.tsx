'use client';

import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
interface StickyConversionBarProps {
  onOpenQuoteModal?: () => void;
}

export default function StickyConversionBar({ onOpenQuoteModal }: StickyConversionBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Hiện thanh khi cuộn qua 350px
      if (window.scrollY > 350) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAction = () => {
    if (onOpenQuoteModal) {
      onOpenQuoteModal();
    } else {
      window.location.href = '/bao-gia';
    }
  };

  if (!visible) return null;

  return (
    <div
      aria-label="Thanh liên hệ nhanh"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-white/10 px-4 py-2.5 sm:py-3 shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)' }}
    >
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">

        {/* Cột trái (Desktop): Thông điệp định vị & Cam kết */}
        <div className="hidden md:flex items-center gap-3">
          <span />
          <div className="text-xs text-white">
            <span className="text-slate-300 font-medium">Báo giá sỉ trực tiếp từ nhà máy Hà Nội & TP.HCM</span>
          </div>
        </div>

        {/* Cột phải / Toàn màn hình (Mobile): Nhóm nút hành động */}
        <div className="w-full md:w-auto flex items-center justify-end gap-2.5">
          {/* Nút gọi Hotline */}
          <a
            href="tel:0902441981"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs sm:text-sm font-bold transition-all h-[42px]"
          >
            <Phone size={14} className="text-[#F26522]" />
            <span className="whitespace-nowrap">Hotline: 0902.441.981</span>
          </a>

          {/* Nút Nhận Báo Giá Nhanh */}
          <button
            type="button"
            onClick={handleAction}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F26522] to-[#EA580C] hover:from-[#EA580C] hover:to-[#D95314] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50 hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap h-[42px]"
          >
            <span>Nhận Báo Giá</span>
          </button>
        </div>

      </div>
    </div>
  );
}
