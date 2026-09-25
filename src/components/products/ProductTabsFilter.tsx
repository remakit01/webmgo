'use client';

import React from 'react';
import { 
  Layers, 
  Wind, 
  Flame, 
  Music, 
  Search, 
  X, 
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  TrendingUp,
  Tag,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export interface FilterState {
  category: string;
  thickness: string;
  fireRating: string;
  search: string;
  sortBy: string;
}

interface ProductTabsFilterProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onResetFilters: () => void;
  counts: {
    all: number;
    duct: number;
    wall: number;
    floor: number;
    acoustic: number;
  };
  totalResults: number;
}

export const CATEGORIES = [
  { id: 'all', label: 'Tất cả tấm MGO', icon: Layers },
  { id: 'duct', label: 'Bọc Ống Gió PCCC', icon: Wind },
  { id: 'wall', label: 'Vách, Trần & Bọc Thép', icon: Flame },
  { id: 'floor', label: 'Lót Sàn Chịu Tải', icon: Layers },
  { id: 'acoustic', label: 'Tiêu Âm & Trang Trí', icon: Music },
];

export const THICKNESS_OPTIONS = [
  { id: 'all', label: 'Tất cả độ dày' },
  { id: '5mm', label: '5mm (EI 30)' },
  { id: '8mm', label: '8mm (EI 45-60)' },
  { id: '10mm', label: '10mm (EI 90)' },
  { id: '12mm', label: '12mm (EI 120)' },
  { id: '15mm', label: '15mm (Sàn tải)' },
  { id: '18mm', label: '18mm (Sàn nặng)' },
];

export const SORT_BUTTONS = [
  { id: 'featured', label: 'Nổi bật', icon: Sparkles },
  { id: 'bestseller', label: 'Bán chạy', icon: TrendingUp },
  { id: 'discount', label: 'Giảm giá', icon: Tag },
  { id: 'new', label: 'Mới', icon: Clock },
  { id: 'price-asc', label: 'Giá thấp → cao', icon: ArrowUpRight },
  { id: 'price-desc', label: 'Giá cao → thấp', icon: ArrowDownRight },
];

export default function ProductTabsFilter({
  filters,
  onFilterChange,
  onResetFilters,
  counts,
  totalResults,
}: ProductTabsFilterProps) {
  const hasActiveFilters = 
    filters.category !== 'all' || 
    filters.thickness !== 'all' || 
    filters.fireRating !== 'all' || 
    filters.search.trim() !== '';

  const handleCategoryClick = (catId: string) => {
    onFilterChange('category', catId);
  };

  return (
    <section className="sticky top-16 md:top-20 z-30 bg-white/98 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-3.5 space-y-3">
        
        {/* ROW 1: TABS DANH MỤC LỚN (THEO CHUẨN THẾ GIỚI DI ĐỘNG) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            const isActive = filters.category === cat.id;
            const count = counts[cat.id as keyof typeof counts] || 0;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20 scale-[1.02]'
                    : 'bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                  isActive ? 'bg-white/20 text-[#A0D911]' : 'text-slate-500'
                }`}>
                  <IconComponent size={14} />
                </div>
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ROW 2: SEARCH BOX + QUICK THICKNESS FILTER PILLS */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              placeholder="Tìm theo độ dày hoặc ứng dụng (vd: 8mm, ống gió, vách, dầm thép)..."
              className="w-full pl-9 pr-8 py-2 bg-slate-100 hover:bg-slate-150 focus:bg-white border border-transparent focus:border-[#7CB305] rounded-xl text-xs text-slate-800 placeholder-slate-400 transition-all outline-none"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => onFilterChange('search', '')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Filter Pills (Độ dày) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none text-xs">
            <span className="text-slate-400 font-bold mr-1 hidden sm:inline whitespace-nowrap">Lọc độ dày:</span>
            {THICKNESS_OPTIONS.map((item) => {
              const isSelected = filters.thickness === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onFilterChange('thickness', item.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#F26522] text-white border-[#F26522] shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-600 border-slate-200/60 hover:bg-slate-200 hover:text-slate-800'
                  }`}
                >
                  {item.id === 'all' ? 'Tất cả dày' : item.id}
                </button>
              );
            })}
          </div>

        </div>

        {/* ROW 3: THANH SẮP XẾP BÁN HÀNG CHUYÊN NGHIỆP (NỔI BẬT, BÁN CHẠY, GIẢM GIÁ, MỚI, GIÁ) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
              <ArrowUpDown size={13} className="text-[#F26522]" />
              <span>Sắp xếp theo:</span>
            </span>

            {SORT_BUTTONS.map((btn) => {
              const IconComponent = btn.icon;
              const isActive = filters.sortBy === btn.id;

              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => onFilterChange('sortBy', btn.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#5F8A03] text-white border-[#5F8A03] shadow-xs shadow-[#5F8A03]/30 scale-[1.03]'
                      : 'bg-slate-100 text-slate-600 border-slate-200/70 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <IconComponent size={12} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Hiển thị <strong className="text-slate-900">{totalResults}</strong> dòng sản phẩm Tấm MGO
          </div>

        </div>

        {/* ROW 4: ACTIVE FILTER TAGS & RESET (HIỂN THỊ KHI ĐANG LỌC) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 font-medium mr-1">Đang lọc:</span>

              {filters.category !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F4F9E8] text-[#5F8A03] border border-[#7CB305]/30 font-bold">
                  <span>{CATEGORIES.find(c => c.id === filters.category)?.label}</span>
                  <button type="button" onClick={() => onFilterChange('category', 'all')} className="hover:text-red-500 cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}

              {filters.thickness !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FEF3EC] text-[#F26522] border border-[#F26522]/30 font-bold">
                  <span>Dày: {filters.thickness}</span>
                  <button type="button" onClick={() => onFilterChange('thickness', 'all')} className="hover:text-red-500 cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}

              {filters.search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-200 text-slate-800 font-semibold">
                  <span>Từ khóa: "{filters.search}"</span>
                  <button type="button" onClick={() => onFilterChange('search', '')} className="hover:text-red-500 cursor-pointer">
                    <X size={12} />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline ml-2 cursor-pointer"
              >
                <RotateCcw size={11} />
                <span>Xóa tất cả</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
