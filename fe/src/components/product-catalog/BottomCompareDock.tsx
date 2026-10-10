'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Plus, X, ChevronDown, ChevronUp, Scale } from 'lucide-react';
import { useProductCompare } from '@/hooks/use-product-compare';
import { toLocalePath } from '@/i18n/paths';
import type { Locale } from '@/i18n/routing';

interface BottomCompareDockProps {
  locale?: Locale;
}

export default function BottomCompareDock({ locale = 'vi' }: BottomCompareDockProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    compareItems,
    removeFromCompare,
    clearCompare,
    isDockCollapsed,
    setIsDockCollapsed,
    setIsSearchModalOpen,
    totalSlots,
  } = useProductCompare();

  const [hasScrolled, setHasScrolled] = useState(false);

  // Theo dõi cuộn trang: nếu cuộn > 350px thì thanh StickyConversionBar đã hiện
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 350);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Kiểm tra nếu đang ở trang so sánh chi tiết
  const isComparePage = pathname ? pathname.includes('/so-sanh') || pathname.includes('/compare') : false;

  // Ẩn dock hoàn toàn nếu không có sản phẩm nào HOẶC đang ở trong chính trang so sánh chi tiết
  if (compareItems.length === 0 || isComparePage) return null;

  // Điều kiện để so sánh: từ 2 sản phẩm trở lên
  const canCompare = compareItems.length >= 2;
  const emptySlotsCount = Math.max(0, totalSlots - compareItems.length);

  // Xử lý chuyển hướng đến trang so sánh riêng biệt
  const handleGoToCompare = () => {
    if (!canCompare) return;
    const slugs = compareItems.map((item) => item.slug).join(',');
    const targetUrl = toLocalePath(`/so-sanh?items=${encodeURIComponent(slugs)}`, locale);
    router.push(targetUrl);
  };

  // Trạng thái thu gọn: Hiển thị pill nổi độc lập ở góc phải màn hình, có nút mở lại và nút xóa ✕
  if (isDockCollapsed) {
    return (
      <div
        className={`fixed right-4 sm:right-8 z-50 animate-in slide-in-from-bottom-2 duration-200 transition-all ${
          hasScrolled ? 'bottom-[68px] sm:bottom-[72px]' : 'bottom-4'
        }`}
      >
        <div className="flex items-center rounded-full bg-white text-slate-900 border border-slate-300 shadow-2xl overflow-hidden hover:border-[#F26522] transition-all">
          <button
            type="button"
            onClick={() => setIsDockCollapsed(false)}
            aria-label="Mở lại bảng so sánh"
            className="flex items-center gap-2 pl-3.5 pr-2.5 py-2.5 hover:bg-slate-50 transition-all cursor-pointer text-xs font-bold group select-none"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-50 text-[#F26522]">
              <Scale size={12} />
            </div>
            <span>So sánh ({compareItems.length})</span>
            <ChevronUp size={14} className="text-slate-400 group-hover:text-[#F26522] transition-colors" />
          </button>

          <div className="w-[1px] h-4 bg-slate-200 shrink-0" />

          <button
            type="button"
            onClick={clearCompare}
            aria-label="Xóa tất cả sản phẩm so sánh"
            title="Xóa danh sách so sánh"
            className="px-3 py-2.5 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside
      aria-label="Thanh so sánh sản phẩm nổi"
      className="fixed bottom-0 inset-x-0 z-50 pointer-events-none select-none animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="mx-auto max-w-[1440px] px-4 lg:px-8 pointer-events-auto">
        <div
          className="flex items-center justify-between gap-3 sm:gap-4 rounded-t-2xl border-t border-x border-slate-200/90 bg-white p-2.5 sm:p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] w-full"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)' }}
        >
          {/* Dải 3 Slots Sản Phẩm Chuẩn Thế Giới Di Động - Chia đều 3 cột cân đối tuyệt đối */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-5 flex-1 min-w-0 mr-3 sm:mr-5 pt-2 pb-1 px-1">
            {/* 1. Các Slots đã có sản phẩm */}
            {compareItems.map((item) => (
              <div
                key={item.id}
                className="relative flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2 sm:p-2.5 w-full h-[56px] shadow-2xs group min-w-0"
              >
                {/* Nút X tròn xóa sản phẩm - Luôn luôn hiển thị rõ ràng */}
                <button
                  type="button"
                  onClick={() => removeFromCompare(item.id)}
                  aria-label={`Xóa ${item.name} khỏi so sánh`}
                  title={`Xóa ${item.name} khỏi so sánh`}
                  className="absolute -top-2 -right-2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-slate-600 hover:bg-red-600 text-white ring-2 ring-white shadow-sm transition-all cursor-pointer active:scale-90"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>

                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg border border-slate-200/80 bg-slate-50 overflow-hidden shrink-0 p-1 flex items-center justify-center">
                  <img
                    src={item.coverImageUrl || '/Logo_remak_800.png'}
                    alt={item.name}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="min-w-0 flex-1 pr-1.5">
                  <p
                    className="text-xs font-semibold text-slate-800 line-clamp-2 leading-tight overflow-hidden text-ellipsis"
                    title={item.name}
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.name}
                  </p>
                </div>
              </div>
            ))}

            {/* 2. Các Slots trống nét đứt (+ Thêm sản phẩm) - Chia đều kích thước với ô đã chọn */}
            {Array.from({ length: emptySlotsCount }).map((_, idx) => (
              <button
                key={`empty-slot-${idx}`}
                type="button"
                onClick={() => setIsSearchModalOpen(true)}
                className="flex items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-slate-300/80 bg-white hover:border-[#F26522] hover:bg-orange-50/20 text-slate-500 hover:text-[#F26522] w-full h-[56px] text-xs font-semibold transition-all cursor-pointer group min-w-0"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-slate-400 group-hover:border-[#F26522] group-hover:bg-[#F26522] group-hover:text-white transition-colors shrink-0">
                  <Plus size={14} strokeWidth={2.5} />
                </div>
                <span className="truncate">Thêm sản phẩm</span>
              </button>
            ))}
          </div>

          {/* Cụm Nút Hành Động Bên Phải: [ So Sánh Ngay ] rồi đến [ Thu gọn ] */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 pl-1">
            {/* Nút Hành Động "So Sánh Ngay": Mặc định disable khi < 2 sản phẩm, thỏa mãn (>= 2) thì hiện màu brand cam */}
            <button
              type="button"
              disabled={!canCompare}
              onClick={handleGoToCompare}
              aria-label={canCompare ? 'Mở trang so sánh chi tiết' : 'Cần chọn từ 2 sản phẩm trở lên để so sánh'}
              title={canCompare ? 'Chuyển sang trang so sánh chi tiết' : 'Vui lòng chọn từ 2 sản phẩm trở lên để so sánh'}
              className={`flex items-center justify-center px-4 sm:px-6 h-[52px] rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 select-none whitespace-nowrap ${
                canCompare
                  ? 'bg-[#F26522] hover:bg-[#D95314] text-white shadow-md shadow-[#F26522]/25 cursor-pointer active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-90'
              }`}
            >
              <span>So Sánh Ngay</span>
            </button>

            {/* Nút Thu gọn */}
            <button
              type="button"
              onClick={() => setIsDockCollapsed(true)}
              aria-label="Thu gọn thanh so sánh"
              title="Thu gọn bảng so sánh"
              className="flex items-center justify-center gap-1 px-3 sm:px-3.5 h-[52px] rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <span className="hidden sm:inline">Thu gọn</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
