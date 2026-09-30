'use client';

import React, { useState } from 'react';
import { Scale, X, ArrowRight, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { ProductItem } from '@/types';
import { formatNumber } from '@/lib/utils';
import { getThicknessData } from '@/data/products';

interface ProductCompareBarProps {
  selectedProducts: ProductItem[];
  selectedThicknesses?: Record<string, string>;
  onRemoveProduct: (id: string) => void;
  onClearAll: () => void;
  onOpenModal: () => void;
}

export default function ProductCompareBar({
  selectedProducts,
  selectedThicknesses,
  onRemoveProduct,
  onClearAll,
  onOpenModal,
}: ProductCompareBarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (selectedProducts.length === 0) return null;

  const totalSlots = 3;
  const emptySlotsCount = Math.max(0, totalSlots - selectedProducts.length);

  // If collapsed, show a sleek docked tab at the bottom right
  if (isCollapsed) {
    return (
      <div className="fixed bottom-0 right-4 sm:right-8 z-40 animate-in slide-in-from-bottom-2 duration-200">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-t-2xl bg-slate-900 text-white border-t border-x border-slate-700 shadow-2xl hover:bg-slate-800 transition-colors cursor-pointer text-xs font-bold"
        >
          <Scale size={15} className="text-[#A0D911]" />
          <span>Bảng so sánh ({selectedProducts.length})</span>
          <ChevronUp size={16} className="text-slate-400" />
        </button>
      </div>
    );
  }

  const canCompare = selectedProducts.length >= 2;

  return (
    <aside 
      aria-label="Thanh so sánh sản phẩm sát đáy"
      className="fixed bottom-0 left-0 right-0 z-40 w-full bg-slate-950/95 backdrop-blur-xl text-white border-t border-slate-700/80 shadow-[0_-10px_30px_rgba(0,0,0,0.35)] animate-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
    >
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        
        {/* DESKTOP & TABLET VIEW */}
        <div className="hidden sm:flex items-center justify-between gap-4">
          
          {/* Left Title & Collapse */}
          <div className="flex items-center gap-3 flex-shrink-0 pr-3 border-r border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-[#5F8A03]/20 text-[#A0D911] flex items-center justify-center flex-shrink-0">
              <Scale size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  So sánh ({selectedProducts.length}/{totalSlots})
                </span>
                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Thu gọn thanh so sánh"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-slate-400">Chọn tối đa 3 tấm MGO</span>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={onClearAll}
                  className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 size={11} />
                  <span>Xóa tất cả</span>
                </button>
              </div>
            </div>
          </div>

          {/* Center: 3 Selected Product Slots */}
          <div className="flex-1 grid grid-cols-3 gap-2.5 max-w-2xl">
            {selectedProducts.map((prod) => {
              const activeTh = selectedThicknesses?.[prod.id] || prod.thicknessList[0] || '8mm';
              const thData = getThicknessData(activeTh, prod);

              return (
                <div 
                  key={prod.id}
                  className="group relative flex items-center gap-2 p-1.5 pr-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all text-xs"
                >
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 border border-white/20">
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white text-[11px] truncate leading-tight" title={prod.name}>
                      {prod.shortName || prod.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold text-white bg-[#5F8A03] px-1.5 py-0.2 rounded">
                        {activeTh}
                      </span>
                      <span className="text-[10px] text-[#A0D911] font-semibold">
                        {formatNumber(thData.price)} đ
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveProduct(prod.id)}
                    className="w-6 h-6 rounded-full bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors flex-shrink-0"
                    title="Bỏ chọn"
                    aria-label={`Bỏ chọn ${prod.name}`}
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}

            {Array.from({ length: emptySlotsCount }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-dashed border-slate-700/80 text-slate-500 text-xs bg-slate-900/30 select-none"
              >
                <Plus size={13} className="text-slate-600" />
                <span className="text-[11px] text-slate-400">Chọn thêm tấm MGO</span>
              </div>
            ))}
          </div>

          {/* Right Action Button - Chỉ cho phép mở khi có ít nhất 2 sản phẩm */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              disabled={!canCompare}
              onClick={() => {
                if (canCompare) {
                  onOpenModal();
                }
              }}
              className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 uppercase tracking-wider whitespace-nowrap ${
                canCompare
                  ? 'bg-[#5F8A03] hover:bg-[#7CB305] text-white hover:text-slate-950 shadow-lg shadow-[#5F8A03]/30 cursor-pointer'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed opacity-80'
              }`}
              title={canCompare ? 'Mở bảng so sánh chi tiết' : 'Vui lòng chọn ít nhất 2 sản phẩm để so sánh đối đầu'}
            >
              <span>{canCompare ? 'So Sánh Chi Tiết' : 'Chọn thêm 1 tấm để so sánh'}</span>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                canCompare ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
              }`}>
                {selectedProducts.length}
              </span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>

        {/* MOBILE VIEW (< 640px) */}
        <div className="sm:hidden flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 overflow-x-auto scrollbar-none py-0.5">
            {selectedProducts.map((prod) => (
              <div key={prod.id} className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 border border-white/20">
                  <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveProduct(prod.id)}
                  aria-label={`Bỏ chọn ${prod.name}`}
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {Array.from({ length: emptySlotsCount }).map((_, idx) => (
              <div
                key={`empty-mob-${idx}`}
                className="w-10 h-10 rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-slate-600 flex-shrink-0"
              >
                <Plus size={14} />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={onClearAll}
              className="p-2 text-slate-400 hover:text-red-400"
              title="Xóa tất cả"
            >
              <Trash2 size={15} />
            </button>
            <button
              type="button"
              disabled={!canCompare}
              onClick={() => {
                if (canCompare) {
                  onOpenModal();
                }
              }}
              className={`px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1 whitespace-nowrap ${
                canCompare
                  ? 'bg-[#5F8A03] text-white shadow-md cursor-pointer'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed opacity-80'
              }`}
            >
              <span>{canCompare ? `So Sánh (${selectedProducts.length})` : 'Cần ≥ 2 tấm'}</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
}
