'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Download, ShieldCheck, Filter } from 'lucide-react';
import { MGO_SPECS, THICKNESS_DATA } from '@/data/products';
import SectionHeading from '@/components/ui/SectionHeading';

type FilterCategory = 'all' | 'duct' | 'wall' | 'floor';

const FILTER_TABS: { id: FilterCategory; label: string; count: string }[] = [
  { id: 'all',   label: 'Tất cả độ dày', count: '6 quy cách' },
  { id: 'duct',  label: 'Ống gió PCCC',  count: '5 & 8mm'    },
  { id: 'wall',  label: 'Vách ngăn',     count: '10 & 12mm'  },
  { id: 'floor', label: 'Lót sàn',       count: '15 & 18mm'  },
];

const CATEGORY_ACCENT: Record<FilterCategory, string> = {
  all:   'bg-slate-800',
  duct:  'bg-slate-800',
  wall:  'bg-slate-800',
  floor: 'bg-slate-800',
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

  return (
    <section
      id="thong-so-ky-thuat"
      aria-label="Bảng Thông Số Kỹ Thuật Tấm MGO Remak"
      className="max-w-[1440px] mx-auto px-4 lg:px-8"
    >
      <SectionHeading title="Bảng Thông Số Kỹ Thuật Tấm MGO Remak" />

      {/* Filter tabs */}
      <div
        className="flex flex-wrap items-center justify-center gap-2 mb-8"
        role="tablist"
        aria-label="Lọc theo quy cách thi công"
      >
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
              <Filter size={13} className={isActive ? 'text-white' : 'text-slate-400'} />
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

      {/* ── Comparison Table ── */}
      <div className="relative">
        {/* Mobile scroll hint — fade right edge */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent z-30 rounded-r-2xl sm:hidden" />
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full border-collapse" style={{ minWidth: specs.length * 130 + 160 }}>

          {/* ── HEADER ROW — thickness numbers ── */}
          <thead>
            <tr>
              {/* Sticky label cell */}
              <th
                scope="col"
                className={`sticky left-0 z-20 px-5 py-4 text-left w-40 ${CATEGORY_ACCENT[activeCategory]}`}
              >
                <div className="text-white text-[10px] font-bold uppercase tracking-widest">
                  Độ dày
                </div>
              </th>

              {specs.map((spec, i) => {
                const priceData = THICKNESS_DATA[spec.thickness];
                return (
                  <th
                    key={spec.thickness}
                    scope="col"
                    onMouseEnter={() => setHoveredCol(i)}
                    onMouseLeave={() => setHoveredCol(null)}
                    className={`px-4 py-4 text-center border-l border-white/10 transition-colors duration-150 ${CATEGORY_ACCENT[activeCategory]} ${hoveredCol === i ? 'brightness-110' : ''}`}
                  >
                    <div className="text-2xl font-black leading-none text-white">
                      {spec.thickness.replace('mm', '')}
                      <span className={`text-base font-bold transition-colors duration-150 ${hoveredCol === i ? 'text-[#7CB305]' : 'text-white/60'}`}>mm</span>
                    </div>
                    {priceData && (
                      <div className="text-[11px] mt-1.5 font-bold text-white/70">
                        từ {formatPrice(priceData.price)}/tấm
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {/* ── ROW 1: Khả năng chịu lửa ── */}
            <tr className="bg-[#FEF3EC]/20">
              <td className="sticky left-0 z-10 bg-[#FEF3EC]/80 px-5 py-3.5 text-xs font-bold text-slate-700 whitespace-nowrap border-r border-b border-slate-200">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-[#F26522]" />
                  Chịu lửa (EI)
                </div>
              </td>
              {specs.map((spec, i) => (
                <td key={spec.thickness} onMouseEnter={() => setHoveredCol(i)} onMouseLeave={() => setHoveredCol(null)}
                  className={`px-3 py-3.5 text-center border-l border-b border-slate-200 transition-colors duration-100 ${hoveredCol === i ? 'bg-[#F4F9E8]' : ''}`}>
                  <span className="inline-block bg-[#F26522] text-white text-[11px] font-black px-2.5 py-1 rounded-full whitespace-nowrap">
                    {spec.fireRating}
                  </span>
                </td>
              ))}
            </tr>

            {/* ── ROW 2: Khối lượng ── */}
            <tr className="bg-white">
              <td className="sticky left-0 z-10 bg-white px-5 py-3 text-xs font-semibold text-slate-600 whitespace-nowrap border-r border-b border-slate-200">
                Khối lượng / tấm
              </td>
              {specs.map((spec, i) => (
                <td key={spec.thickness} onMouseEnter={() => setHoveredCol(i)} onMouseLeave={() => setHoveredCol(null)}
                  className={`px-3 py-3 text-center text-xs font-bold text-slate-800 border-l border-b border-slate-200 transition-colors duration-100 ${hoveredCol === i ? 'bg-[#F4F9E8]' : ''}`}>
                  {spec.weightPerSheet}
                </td>
              ))}
            </tr>

            {/* ── ROW 3: Tỷ trọng ── */}
            <tr className="bg-slate-50/60">
              <td className="sticky left-0 z-10 bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-600 whitespace-nowrap border-r border-b border-slate-200">
                Tỷ trọng
              </td>
              {specs.map((spec, i) => (
                <td key={spec.thickness} onMouseEnter={() => setHoveredCol(i)} onMouseLeave={() => setHoveredCol(null)}
                  className={`px-3 py-3 text-center text-xs text-slate-700 border-l border-b border-slate-200 transition-colors duration-100 ${hoveredCol === i ? 'bg-[#F4F9E8]' : ''}`}>
                  {spec.density}
                </td>
              ))}
            </tr>

            {/* ── ROW 4: Cường độ uốn ── */}
            <tr className="bg-white">
              <td className="sticky left-0 z-10 bg-white px-5 py-3 text-xs font-semibold text-slate-600 whitespace-nowrap border-r border-b border-slate-200">
                Cường độ uốn
              </td>
              {specs.map((spec, i) => (
                <td key={spec.thickness} onMouseEnter={() => setHoveredCol(i)} onMouseLeave={() => setHoveredCol(null)}
                  className={`px-3 py-3 text-center text-xs font-bold text-[#5F8A03] border-l border-b border-slate-200 transition-colors duration-100 ${hoveredCol === i ? 'bg-[#F4F9E8]' : ''}`}>
                  {spec.flexuralStrength || '≥ 18 MPa'}
                </td>
              ))}
            </tr>

            {/* ── ROW 5: Ứng dụng chính ── */}
            <tr className="bg-slate-50/60">
              <td className="sticky left-0 z-10 bg-slate-50 px-5 py-3.5 text-xs font-semibold text-slate-600 whitespace-nowrap border-r border-b border-slate-200 align-top">
                Ứng dụng chính
              </td>
              {specs.map((spec, i) => {
                const apps = spec.standardApplication.split('•').map(a => a.trim()).filter(Boolean);
                return (
                  <td key={spec.thickness} onMouseEnter={() => setHoveredCol(i)} onMouseLeave={() => setHoveredCol(null)}
                    className={`px-3 py-3.5 text-center align-top border-l border-b border-slate-200 transition-colors duration-100 ${hoveredCol === i ? 'bg-[#F4F9E8]' : ''}`}>
                    <ul className="space-y-1">
                      {apps.slice(0, 2).map((a, j) => (
                        <li key={j} className="text-[10px] text-slate-600 leading-snug bg-white border border-slate-100 rounded-lg px-2 py-1">
                          {a}
                        </li>
                      ))}
                    </ul>
                  </td>
                );
              })}
            </tr>

            {/* ── ROW 6: Actions ── */}
            <tr className="bg-slate-50">
              <td className="sticky left-0 z-10 bg-slate-50 px-5 py-4 border-r border-slate-200" />
              {specs.map((spec, i) => (
                <td key={spec.thickness} onMouseEnter={() => setHoveredCol(i)} onMouseLeave={() => setHoveredCol(null)}
                  className={`px-3 py-4 border-l border-slate-200 transition-colors duration-100 ${hoveredCol === i ? 'bg-[#F4F9E8]' : ''}`}>
                  <div className="flex flex-col gap-1.5">
                    <Link href="/san-pham"
                      className="flex items-center justify-center gap-1 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-[11px] font-bold transition-colors">
                      <Download size={11} /> Datasheet
                    </Link>
                    <Link href="/bao-gia"
                      className="flex items-center justify-center gap-1 py-2 rounded-xl bg-[#5F8A03] hover:bg-[#4A7002] text-white text-[11px] font-bold transition-all">
                      Báo Giá <ArrowRight size={11} />
                    </Link>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      </div>

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
