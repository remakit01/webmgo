'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X, Scale, Check, Loader2 } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import { useProductCompare } from '@/hooks/use-product-compare';
import { formatVnd } from './format';
import type { Locale } from '@/i18n/routing';
import { toLocalePath } from '@/i18n/paths';
import type { ProductListItemPublic } from '@remak/shared/contracts/product';

interface CompareSearchModalProps {
  locale?: Locale;
}

export default function CompareSearchModal({ locale = 'vi' }: CompareSearchModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSearchModalOpen, setIsSearchModalOpen, addToCompare, isInCompare, compareItems, totalSlots } =
    useProductCompare();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [products, setProducts] = useState<ProductListItemPublic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedThicknesses, setSelectedThicknesses] = useState<Record<string, number>>({});

  // Tự động nhận diện locale từ pathname nếu có
  const effectiveLocale: Locale = pathname?.startsWith('/en') ? 'en' : locale;

  useBodyScrollLock(isSearchModalOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounce tìm kiếm 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Tải danh sách tất cả sản phẩm khi mở modal
  useEffect(() => {
    if (!isSearchModalOpen) return;

    let isSubscribed = true;
    setIsLoading(true);

    const directApi =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '').replace(/\/+$/, '') || 'http://localhost:4000';

    fetch(`/api/products?locale=${effectiveLocale}`)
      .then((res) => {
        if (!res.ok) throw new Error('Proxy failed');
        return res.json();
      })
      .catch(() => {
        return fetch(`${directApi}/products/public?locale=${effectiveLocale}`).then((res) => {
          if (!res.ok) throw new Error('Direct API failed');
          return res.json();
        });
      })
      .then((data: ProductListItemPublic[]) => {
        if (isSubscribed) {
          setProducts(Array.isArray(data) ? data : []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('[CompareSearchModal] Lỗi tải sản phẩm:', err);
        if (isSubscribed) {
          setIsLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [isSearchModalOpen, effectiveLocale]);

  // Lọc sản phẩm theo từ khóa (khi searchQuery rỗng sẽ hiện TẤT CẢ sản phẩm)
  const filteredProducts = useMemo(() => {
    if (!debouncedQuery) return products;
    return products.filter((p) => {
      const matchName = p.name.toLowerCase().includes(debouncedQuery);
      const matchType = p.type?.name?.toLowerCase().includes(debouncedQuery);
      const matchSummary = p.summary?.toLowerCase().includes(debouncedQuery);
      const matchThickness = p.thicknessesMm?.some((th) => `${th}mm`.includes(debouncedQuery));
      return matchName || matchType || matchSummary || matchThickness;
    });
  }, [products, debouncedQuery]);

  // Xử lý khi người dùng chọn sản phẩm để so sánh
  const handleSelectProduct = (p: ProductListItemPublic) => {
    const added = addToCompare({
      id: p.id,
      slug: p.slug,
      name: p.name,
      coverImageUrl: p.coverImageUrl,
      priceVnd: p.priceRange?.low ?? null,
      typeName: p.type?.name,
      thicknessesMm: p.thicknessesMm,
      summary: p.summary,
    });

    if (added) {
      setIsSearchModalOpen(false);

      // Nếu đang đứng tại trang So Sánh chi tiết (/so-sanh hoặc /compare), tự động cập nhật URL để tải ngay sản phẩm mới vào bảng
      if (pathname?.includes('/so-sanh') || pathname?.includes('/compare')) {
        const currentSlugs = compareItems.map((item) => item.slug).filter((slug) => slug !== p.slug);
        const nextSlugs = [...currentSlugs, p.slug].slice(0, 3);
        router.push(toLocalePath(`/so-sanh?items=${encodeURIComponent(nextSlugs.join(','))}`, effectiveLocale));
      }
    }
  };

  if (!mounted || !isSearchModalOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Thêm sản phẩm vào bảng so sánh"
      onClick={() => setIsSearchModalOpen(false)}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden h-[92vh] max-h-[92vh] animate-in zoom-in-95 duration-150"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 sm:px-6 bg-slate-50/80">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Thêm sản phẩm so sánh</span>
              {products.length > 0 && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {products.length} sản phẩm
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Đã chọn <strong className="text-[#F26522]">{compareItems.length}</strong>/{totalSlots} sản phẩm
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsSearchModalOpen(false)}
            aria-label="Đóng tìm kiếm"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Input Tìm kiếm Debounce */}
        <div className="p-3.5 sm:px-6 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên tấm, loại sản phẩm (vd: chống cháy, bọc ống gió, lót sàn, Remak MGO)..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/20 focus:outline-hidden transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Danh sách sản phẩm dạng Grid Card Đứng chuẩn Thế Giới Di Động */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 bg-slate-50/40">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 size={36} className="animate-spin text-[#2f80ed] mb-3" />
              <p className="text-sm font-medium">Đang tải danh sách sản phẩm...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <p className="text-base font-semibold text-slate-700">Không tìm thấy sản phẩm phù hợp</p>
              <p className="text-xs text-slate-400 mt-1">Vui lòng thử tìm với từ khóa khác</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4.5">
              {filteredProducts.map((p) => {
                const selected = isInCompare(p.id);

                return (
                  <div
                    key={p.id}
                    className={`flex flex-col justify-between rounded-2xl border bg-white p-3.5 sm:p-4 transition-all group ${
                      selected
                        ? 'border-blue-400 shadow-md ring-1 ring-blue-300'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
                    }`}
                  >
                    <div>
                      {/* 1. Ảnh sản phẩm lớn ở trung tâm */}
                      <div className="h-40 sm:h-48 w-full flex items-center justify-center p-2 mb-2 relative">
                        <img
                          src={p.coverImageUrl || '/Logo_remak_800.png'}
                          alt={p.name}
                          className="max-h-full max-w-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* 2. Badges tiện ích & ưu đãi chuẩn TGDD */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          Chống cháy A1
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          Sẵn kho giao ngay
                        </span>
                      </div>

                      {/* 3. Tên sản phẩm in đậm 2 dòng căn lề trái */}
                      <h4
                        className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug min-h-[34px] sm:min-h-[40px]"
                        title={p.name}
                      >
                        {p.name}
                      </h4>

                      {/* 4. Thông số quy cách tóm tắt (Spec pills) */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 font-medium">
                          1.220 × 2.440 mm
                        </span>
                        {p.type?.name && (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 font-medium truncate max-w-[130px]">
                            {p.type.name}
                          </span>
                        )}
                      </div>

                      {/* 5. Dải chip độ dày: mỗi hàng 4 chip, xuống dòng căn start, click chọn được */}
                      {(() => {
                        const thicknesses =
                          p.thicknessesMm && p.thicknessesMm.length > 0
                            ? p.thicknessesMm
                            : [6, 8, 10, 12];
                        const activeTh = selectedThicknesses[p.id] ?? thicknesses[0];

                        return (
                          <div className="grid grid-cols-4 gap-1.5 mt-2.5">
                            {thicknesses.map((th) => {
                              const isActive = activeTh === th;
                              return (
                                <button
                                  key={th}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedThicknesses((prev) => ({
                                      ...prev,
                                      [p.id]: th,
                                    }));
                                  }}
                                  className={`py-1 px-1 text-center text-[11px] sm:text-xs rounded-lg border transition-all cursor-pointer font-semibold select-none ${
                                    isActive
                                      ? 'border-[#2f80ed] text-[#2f80ed] bg-blue-50/70 shadow-2xs ring-1 ring-[#2f80ed]/30'
                                      : 'border-slate-200 text-slate-700 bg-white hover:border-slate-300 hover:bg-slate-50'
                                  }`}
                                  title={`Chọn độ dày ${th}mm`}
                                >
                                  {th}mm
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Phần Chân Card: Giá bán, Đánh giá và Nút So sánh chuẩn TGDD */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      {/* Giá bán đỏ lớn kèm giá gạch ngang */}
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="text-sm sm:text-base lg:text-lg font-bold text-[#d70018]">
                          {p.priceRange ? formatVnd(p.priceRange.low, effectiveLocale) : 'Liên hệ báo giá'}
                        </span>
                        {p.priceRange?.high && p.priceRange.high > p.priceRange.low && (
                          <span className="text-[11px] text-slate-400 line-through">
                            {formatVnd(p.priceRange.high, effectiveLocale)}
                          </span>
                        )}
                      </div>

                      {/* Nút So sánh ở góc chân card */}
                      <div className="mt-3 flex items-center justify-end">
                        {selected ? (
                          <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 select-none">
                            <Check size={14} className="text-emerald-500" />
                            <span>Đã thêm so sánh</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSelectProduct(p)}
                            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#2f80ed] hover:text-[#1a64c4] hover:underline cursor-pointer transition-colors"
                          >
                            <Scale size={15} className="text-[#2f80ed]" />
                            <span>So sánh</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
