'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Scale, Activity, Wrench, Layers } from 'lucide-react';
import { MGO_SPECS, THICKNESS_DATA } from '@/data/products';
import SectionHeading from '@/components/ui/SectionHeading';

type FilterCategory = 'all' | 'duct' | 'wall' | 'floor';

const FILTER_TABS: { id: FilterCategory; label: string; count: string }[] = [
  { id: 'all',   label: 'Tất cả',       count: '6 quy cách' },
  { id: 'duct',  label: 'Ống gió PCCC', count: '5 & 8mm'    },
  { id: 'wall',  label: 'Vách ngăn',    count: '10 & 12mm'  },
  { id: 'floor', label: 'Lót sàn',      count: '15 & 18mm'  },
];

const CATEGORY_COLOR: Record<string, string> = {
  duct:  '#F26522',
  wall:  '#5F8A03',
  floor: '#475569',
};

function formatPrice(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

export default function HomeSpecMatrix() {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const specs = activeCategory === 'all'
    ? MGO_SPECS
    : MGO_SPECS.filter(s => s.category === activeCategory);

  const colCount = specs.length + 1;

  return (
    <section
      id="thong-so-ky-thuat"
      aria-label="Bảng Thông Số Kỹ Thuật Tấm MGO Remak"
      className="max-w-[1440px] mx-auto px-4 lg:px-8"
    >
      <SectionHeading title="Bảng Thông Số Kỹ Thuật Tấm MGO Remak" />

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8" role="tablist" aria-label="Lọc theo quy cách thi công">
        {FILTER_TABS.map(tab => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 border ${
                isActive
                  ? 'bg-[#5F8A03] text-white border-[#5F8A03] shadow-md shadow-green-600/20 scale-[1.02]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
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

      {/* Table */}
      <div className="relative">
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent z-30 rounded-r-2xl sm:hidden" />
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full border-collapse" style={{ minWidth: specs.length * 130 + 160 }}>

            {/* HEADER */}
            <thead>
              <tr className="border-b-2 border-slate-200">
                {/* Sticky label column */}
                <th scope="col" className="sticky left-0 z-20 bg-white p-0 w-44 border-r border-slate-200">
                  <div className="h-1.5 w-full bg-slate-100" />
                  <div className="px-5 py-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Độ dày</span>
                  </div>
                </th>

                {specs.map((spec, i) => {
                  const priceData = THICKNESS_DATA[spec.thickness];
                  const catColor = CATEGORY_COLOR[spec.category] ?? '#5F8A03';
                  return (
                    <th
                      key={spec.thickness}
                      scope="col"
                      onMouseEnter={() => setHoveredCol(i)}
                      onMouseLeave={() => setHoveredCol(null)}
                      className={`text-center p-0 border-l border-slate-200 transition-colors duration-150 min-w-[120px] ${
                        hoveredCol === i ? 'bg-[#F4F9E8]' : 'bg-slate-50'
                      }`}
                    >
                      {/* Category color bar */}
                      <div className="h-1.5 w-full" style={{ backgroundColor: catColor }} />
                      <div className="px-4 py-3">
                        <div className="text-2xl font-black text-slate-900 leading-none">
                          {spec.thickness.replace('mm', '')}
                          <span className="text-sm font-bold text-slate-400">mm</span>
                        </div>
                        <div className="mt-2">
                          <span className="inline-block bg-[#F26522] text-white text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                            {spec.fireRating}
                          </span>
                        </div>
                        {priceData && (
                          <div className="text-[11px] mt-1.5 font-semibold text-slate-500 whitespace-nowrap">
                            từ {formatPrice(priceData.price)}/tấm
                          </div>
                        )}
                        {spec.isPopular && (
                          <div className="inline-block text-[9px] font-black text-[#F26522] bg-[#FEF3EC] px-2 py-0.5 rounded-full mt-1.5">
                            BÁN CHẠY
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {/* ROW 1: Chịu lửa */}
              <tr className="bg-[#FEF3EC]/20">
                <td className="sticky left-0 z-10 bg-[#FEF3EC]/80 px-5 py-3.5 text-xs font-bold text-slate-700 whitespace-nowrap border-r border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-[#F26522]" />
                    Chịu lửa (EI)
                  </div>
                </td>
                {specs.map((spec, i) => (
                  <td key={spec.thickness}
                    onMouseEnter={() => setHoveredCol(i)} onMouseLeave={() => setHoveredCol(null)}
                    className={`px-3 py-3.5 text-center border-l border-b border-slate-200 transition-colors duration-100 ${hoveredCol === i ? 'bg-[#F4F9E8]' : ''}`}>
                    <span className="inline-block bg-[#F26522] text-white text-[11px] font-black px-2.5 py-1 rounded-full whitespace-nowrap">
                      {spec.fireRating}
                    </span>
                  </td>
                ))}
              </tr>

              {/* ROW 2: Khối lượng */}
              <tr className="bg-white">
                <td className="sticky left-0 z-10 bg-white px-5 py-3 text-xs font-semibold text-slate-600 whitespace-nowrap border-r border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Scale size={13} className="text-slate-400" />
                    Khối lượng / tấm
                  </div>
                </td>
                {specs.map((spec, i) => (
                  <td key={spec.thickness}
                    onMouseEnter={() => setHoveredCol(i)} onMouseLeave={() => setHoveredCol(null)}
                    className={`px-3 py-3 text-center text-xs font-bold text-slate-800 border-l border-b border-slate-200 transition-colors duration-100 ${hoveredCol === i ? 'bg-[#F4F9E8]' : ''}`}>
                    {spec.weightPerSheet}
                  </td>
                ))}
              </tr>

              {/* ROW 3: Tỷ trọng */}
              <tr className="bg-slate-50/60">
                <td className="sticky left-0 z-10 bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-600 whitespace-nowrap border-r border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Layers size={13} className="text-slate-400" />
                    Tỷ trọng
                  </div>
                </td>
                {specs.map((spec, i) => (
                  <td key={spec.thickness}
                    onMouseEnter={() => setHoveredCol(i)} onMouseLeave={() => setHoveredCol(null)}
                    className={`px-3 py-3 text-center text-xs text-slate-700 border-l border-b border-slate-200 transition-colors duration-100 ${hoveredCol === i ? 'bg-[#F4F9E8]' : ''}`}>
                    {spec.density}
                  </td>
                ))}
              </tr>

              {/* ROW 4: Cường độ uốn */}
              <tr className="bg-white">
                <td className="sticky left-0 z-10 bg-white px-5 py-3 text-xs font-semibold text-slate-600 whitespace-nowrap border-r border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Activity size={13} className="text-[#5F8A03]" />
                    Cường độ uốn
                  </div>
                </td>
                {specs.map((spec, i) => (
                  <td key={spec.thickness}
                    onMouseEnter={() => setHoveredCol(i)} onMouseLeave={() => setHoveredCol(null)}
                    className={`px-3 py-3 text-center text-xs font-bold text-[#5F8A03] border-l border-b border-slate-200 transition-colors duration-100 ${hoveredCol === i ? 'bg-[#F4F9E8]' : ''}`}>
                    {spec.flexuralStrength || '≥ 18 MPa'}
                  </td>
                ))}
              </tr>

              {/* Divider between tech specs and application */}
              <tr><td colSpan={colCount} className="h-px bg-slate-200 p-0" /></tr>

              {/* ROW 5: Ứng dụng */}
              <tr className="bg-slate-50/60">
                <td className="sticky left-0 z-10 bg-slate-50 px-5 py-3.5 text-xs font-semibold text-slate-600 whitespace-nowrap border-r border-b border-slate-200 align-top">
                  <div className="flex items-center gap-1.5">
                    <Wrench size={13} className="text-slate-400" />
                    Ứng dụng chính
                  </div>
                </td>
                {specs.map((spec, i) => {
                  const apps = spec.standardApplication.split('•').map(a => a.trim()).filter(Boolean);
                  return (
                    <td key={spec.thickness}
                      onMouseEnter={() => setHoveredCol(i)} onMouseLeave={() => setHoveredCol(null)}
                      className={`px-3 py-3.5 align-top border-l border-b border-slate-200 transition-colors duration-100 ${hoveredCol === i ? 'bg-[#F4F9E8]' : ''}`}>
                      <ul className="space-y-1.5">
                        {apps.slice(0, 2).map((a, j) => (
                          <li key={j} className="flex items-start gap-1 text-[11px] text-slate-700 leading-snug">
                            <span className="text-[#5F8A03] font-bold mt-0.5 flex-shrink-0">•</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  );
                })}
              </tr>

              {/* ROW 6: CTA */}
              <tr className="bg-slate-50">
                <td className="sticky left-0 z-10 bg-slate-50 px-5 py-4 border-r border-slate-200" />
                {specs.map((spec, i) => (
                  <td key={spec.thickness}
                    onMouseEnter={() => setHoveredCol(i)} onMouseLeave={() => setHoveredCol(null)}
                    className={`px-3 py-4 border-l border-slate-200 transition-colors duration-100 ${hoveredCol === i ? 'bg-[#F4F9E8]' : ''}`}>
                    <Link
                      href="/bao-gia"
                      className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-[#5F8A03] hover:bg-[#4A7002] text-white text-[11px] font-bold w-full transition-all"
                    >
                      Báo Giá <ArrowRight size={11} />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile scroll hint */}
      <p className="sm:hidden text-[11px] text-center text-slate-400 mt-2">
        ← Vuốt ngang để xem đủ {MGO_SPECS.length} quy cách →
      </p>

      {/* Bottom note */}
      <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={19} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Gia công theo yêu cầu thiết kế</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Cắt kích thước đặc thù, phay cạnh âm dương, soi rãnh theo bản vẽ công trình.
            </div>
          </div>
        </div>
        <Link
          href="/bao-gia"
          className="flex-shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-[#7CB305] text-slate-800 hover:text-[#5F8A03] text-xs font-bold transition-all shadow-sm whitespace-nowrap"
        >
          Tư Vấn Kỹ Thuật <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  );
}
