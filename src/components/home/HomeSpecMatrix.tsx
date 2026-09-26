'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layers, ArrowRight, Download, Filter, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';
import { MGO_SPECS } from '@/data/products';
import SectionHeading from '@/components/ui/SectionHeading';

type FilterCategory = 'all' | 'duct' | 'wall' | 'floor';

const FILTER_TABS: { id: FilterCategory; label: string; count: string }[] = [
  { id: 'all', label: 'Tất cả độ dày', count: '6 quy cách' },
  { id: 'duct', label: 'Ống gió PCCC', count: '5 & 8mm' },
  { id: 'wall', label: 'Vách ngăn', count: '10 & 12mm' },
  { id: 'floor', label: 'Lót sàn', count: '15 & 18mm' },
];

export default function HomeSpecMatrix() {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');

  const filteredSpecs = activeCategory === 'all' 
    ? MGO_SPECS 
    : MGO_SPECS.filter((spec) => spec.category === activeCategory);

  return (
    <section 
      id="thong-so-ky-thuat"
      aria-label="Bảng Thông Số Kỹ Thuật Tấm MGO Remak"
      className="max-w-[1440px] mx-auto px-4 lg:px-8"
    >
      <SectionHeading title="Bảng Thông Số Kỹ Thuật Tấm MGO Remak" />

      {/* BỘ LỌC THEO MỤC ĐÍCH THI CÔNG DÀNH CHO KỸ SƯ / NHÀ THẦU */}
      <div
        className="flex flex-wrap items-center justify-center gap-2 mb-8"
        role="tablist"
        aria-label="Lọc theo quy cách thi công"
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 border ${
                isActive
                  ? 'bg-[#7CB305] text-white border-[#7CB305] shadow-md shadow-green-600/20 scale-[1.02]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Filter size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span>{tab.label}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* LƯỚI QUY CÁCH ĐỘ DÀY CHI TIẾT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSpecs.map((item, idx) => (
          <div 
            key={idx} 
            className={`relative bg-white rounded-3xl p-6 sm:p-7 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between ${
              item.isPopular 
                ? 'border-[#7CB305] shadow-md ring-2 ring-[#7CB305]/20' 
                : 'border-slate-200/90'
            }`}
          >
            {item.isPopular && (
              <span className="absolute -top-3 left-6 px-3.5 py-1 rounded-full bg-[#7CB305] text-white text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Flame size={12} />
                <span>Quy Cách Phổ Biến</span>
              </span>
            )}

            <div>
              {/* Header card độ dày */}
              <div className="flex items-center justify-between mb-5 pt-1">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Độ dày tấm
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mt-0.5">
                    {item.thickness}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center shadow-inner">
                  <Layers size={24} />
                </div>
              </div>

              {/* Bảng thông số đo lường thực tế */}
              <div className="space-y-2.5 text-xs pb-5 border-b border-slate-100">
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Khối lượng tấm:</span>
                  <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                    {item.weightPerSheet}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Tỷ trọng danh định:</span>
                  <span className="font-semibold text-slate-800">{item.density}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Cường độ chịu uốn:</span>
                  <span className="font-semibold text-[#5F8A03]">{item.flexuralStrength || '≥ 18 MPa'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Khả năng chịu lửa:</span>
                  <span className="font-bold text-[#F26522] bg-[#FEF3EC] px-2.5 py-0.5 rounded-full">
                    {item.fireRating}
                  </span>
                </div>
              </div>

              {/* Ứng dụng thi công tiêu biểu */}
              <div className="pt-4">
                <div className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#7CB305]" />
                  <span>Ứng dụng thi công:</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {item.standardApplication}
                </p>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="pt-5 mt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Link 
                href="/san-pham" 
                className="py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                title="Xem thông số kỹ thuật chi tiết"
              >
                <Download size={13} />
                <span>Datasheet</span>
              </Link>

              <Link 
                href="/bao-gia" 
                className="py-2.5 px-2 rounded-xl bg-[#7CB305] hover:bg-[#689904] text-white text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1"
              >
                <span>Báo Giá</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* KHỐI CAM KẾT CHẤT LƯỢNG NHÀ MÁY PHÍA DƯỚI BẢNG */}
      <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900">
              Gia công theo yêu cầu thiết kế
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Nhà máy nhận cắt kích thước đặc thù, phay cạnh âm dương và soi rãnh theo bản vẽ công trình.
            </div>
          </div>
        </div>

        <Link
          href="#bao-gia-vat-tu"
          className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-[#7CB305] text-slate-800 hover:text-[#5F8A03] text-xs font-bold transition-all whitespace-nowrap shadow-sm"
        >
          Tư Vấn Kỹ Thuật →
        </Link>
      </div>
    </section>
  );
}
