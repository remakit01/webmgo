'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Flame, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Scale, 
  ShieldCheck, 
  Star,
  TrendingUp,
  Tag,
  Check
} from 'lucide-react';
import { ProductItem } from '@/types';
import { formatNumber } from '@/lib/utils';
import { getThicknessData } from '@/data/products';

interface ProductCardProps {
  product: ProductItem;
  defaultThickness?: string;
  selectedThickness?: string;
  isCompared?: boolean;
  onToggleCompare?: (thickness: string) => void;
  onThicknessChange?: (thickness: string) => void;
}

const COMPARE_ADVANTAGES: Record<string, string> = {
  'mgo-ductboard': 'Nhẹ hơn Cemboard 35%, bọc kín khít không sinh bụi',
  'mgo-standard-fireproof': 'Chịu nhiệt 1200°C gấp 5x Thạch cao, kháng nước 100%',
  'mgo-structural-floor': 'Tải trọng >800kg/m², êm ái hơn sàn Cemboard',
  'mgo-acoustic-deco': 'Đạt Class A1 PCCC, thay thế mút xốp dễ cháy',
  'mgo-mos-sulfate': 'Zero-Chloride 100%, không rỉ sét ốc vít khung thép',
  'mgo-steel-protection': 'Tiết kiệm 50% chi phí so với sơn chống cháy phồng',
};

export default function ProductCard({ 
  product, 
  defaultThickness,
  selectedThickness,
  isCompared = false,
  onToggleCompare,
  onThicknessChange
}: ProductCardProps) {
  const initialThickness = (selectedThickness && product.thicknessList.includes(selectedThickness))
    ? selectedThickness
    : (defaultThickness && product.thicknessList.includes(defaultThickness))
      ? defaultThickness
      : product.thicknessList[0] || '8mm';

  const [activeThickness, setActiveThickness] = useState<string>(initialThickness);

  // Đồng bộ khi selectedThickness từ ngoài (so sánh / modal) thay đổi
  React.useEffect(() => {
    if (selectedThickness && product.thicknessList.includes(selectedThickness)) {
      setActiveThickness(selectedThickness);
    }
  }, [selectedThickness, product.thicknessList]);

  const handleSelectThickness = (th: string) => {
    setActiveThickness(th);
    if (onThicknessChange && isCompared) {
      onThicknessChange(th);
    }
  };

  const currentData = getThicknessData(activeThickness, product);

  const discount = Math.round(((currentData.original - currentData.price) / currentData.original) * 100);
  const pricePerM2 = Math.round(currentData.price / 2.977);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group hover:border-[#7CB305]/60 relative">
      
      {/* 1. PRODUCT IMAGE & BADGES */}
      <div className="relative h-60 bg-slate-100 overflow-hidden">
        <Link href={`/san-pham/${product.slug}`} className="block w-full h-full">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-70 pointer-events-none" />
        
        {/* Top Badges (Giảm giá, Bán chạy, Mới & Ngành Hàng) */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-start justify-between gap-2 pointer-events-none">
          <div className="flex flex-wrap items-center gap-1.5">
            {discount > 0 && (
              <span className="px-2 py-0.5 rounded-lg text-[11px] font-black bg-red-600 text-white shadow-sm flex items-center gap-1">
                <Tag size={10} />
                <span>-{discount}%</span>
              </span>
            )}
            {product.isBestSeller && (
              <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-[#F26522] text-white shadow-sm flex items-center gap-1">
                <TrendingUp size={11} />
                <span>Bán chạy</span>
              </span>
            )}
            {product.isNew && (
              <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                <Sparkles size={11} />
                <span>Mới</span>
              </span>
            )}
          </div>

          {/* Ngành hàng chuẩn (Hệ Ống Gió PCCC, Vách Ngăn & Trần...) luôn nổi bật trên ảnh */}
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/95 text-[#5F8A03] backdrop-blur-xs shadow-xs border border-white/60 whitespace-nowrap">
            {product.categoryLabel}
          </span>
        </div>

        {/* Bottom Specs Bar inside Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs pointer-events-none">
          <span className="font-bold flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-xs">
            <Flame size={13} className="text-[#F26522]" />
            <span>{currentData.fire}</span>
          </span>
          <span className="text-[11px] bg-[#5F8A03]/90 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
            <Scale size={11} />
            <span>{currentData.weight}</span>
          </span>
        </div>
      </div>

      {/* 2. CARD BODY */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          
          {/* Warehouse status & Rating */}
          <div className="flex items-center justify-between text-[11px] font-semibold mb-2">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span>{product.ratingScore || '5.0'}</span>
              <span className="text-slate-400 font-normal">({product.reviewsCount || 120} dự án)</span>
            </div>
            <span className="flex items-center gap-1 text-[#5F8A03]">
              <ShieldCheck size={12} />
              <span>Sẵn kho HN & HCM</span>
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#5F8A03] transition-colors leading-snug">
            <Link href={`/san-pham/${product.slug}`}>
              {product.name}
            </Link>
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {product.tagline}
          </p>

          {/* Quick Comparison Highlight Badge (Ưu thế đối chuẩn) */}
          {COMPARE_ADVANTAGES[product.id] && (
            <div className="mt-2.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-center gap-1.5">
              <Scale size={12} className="text-[#5F8A03] flex-shrink-0" />
              <span className="truncate">
                <strong className="text-slate-800 font-semibold">Ưu thế:</strong> {COMPARE_ADVANTAGES[product.id]}
              </span>
            </div>
          )}

          {/* Interactive Thickness Variant Chips (Kiểu chọn dung lượng TGDĐ) */}
          <div className="mt-3.5 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <span>ĐỘ DÀY SẴN KHO:</span>
              <span className="text-[#F26522] font-bold lowercase">{activeThickness}</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {product.thicknessList.map((th) => {
                const isSelected = activeThickness === th;
                return (
                  <button
                    key={th}
                    type="button"
                    onClick={() => handleSelectThickness(th)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#7CB305] text-white border-[#7CB305] shadow-xs scale-105'
                        : 'bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200'
                    }`}
                  >
                    {th}
                  </button>
                );
              })}
            </div>
          </div>

          {/* E-COMMERCE PRICE BOX (GIÁ BÁN HÀNG CỰC KỲ RÕ RÀNG) */}
          <div className="mt-3.5 p-3 rounded-2xl bg-gradient-to-r from-amber-50/60 to-orange-50/60 border border-amber-200/50 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                Giá nhà máy ({activeThickness}):
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-extrabold text-[#F26522]">
                  {formatNumber(currentData.price)} đ
                </span>
                <span className="text-[11px] text-slate-500 font-normal">/tấm</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 line-through block">
                {formatNumber(currentData.original)} đ
              </span>
              <span className="text-[10px] font-bold text-[#5F8A03] bg-white px-2 py-0.5 rounded-full border border-[#7CB305]/30">
                ~{formatNumber(pricePerM2)} đ/m²
              </span>
            </div>
          </div>

        </div>

        {/* 3. CARD FOOTER ACTIONS (CHI TIẾT + NÚT SO SÁNH) */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <Link
            href={`/san-pham/${product.slug}`}
            className="flex-1 text-center py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-[#5F8A03] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Chi Tiết</span>
            <ArrowRight size={13} />
          </Link>

          {/* Nút So Sánh Chuyên Nghiệp - Đặt chuẩn tại hàng Action Footer */}
          {onToggleCompare && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleCompare(activeThickness);
              }}
              className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isCompared
                  ? 'bg-[#5F8A03] text-white border-[#5F8A03] shadow-md shadow-[#5F8A03]/25 scale-102'
                  : 'border-slate-200 hover:border-[#5F8A03] hover:bg-[#F4F9E8] text-slate-700 hover:text-[#5F8A03]'
              }`}
              title={isCompared ? 'Bỏ chọn so sánh' : 'Thêm vào so sánh'}
              aria-label={isCompared ? 'Đã chọn so sánh' : 'So sánh sản phẩm'}
            >
              {isCompared ? (
                <>
                  <Check size={14} className="text-white" />
                  <span>Đã chọn</span>
                </>
              ) : (
                <>
                  <Scale size={14} className="text-slate-500" />
                  <span>So sánh</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
