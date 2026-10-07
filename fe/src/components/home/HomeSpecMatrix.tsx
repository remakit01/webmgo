'use client';

import React, { useState } from 'react';
import Link from '@/components/ui/LocaleLink';
import { ArrowRight } from 'lucide-react';
import { MGO_SPECS } from '@/data/products';
import SectionHeading from '@/components/ui/SectionHeading';

type FilterCategory = 'all' | 'duct' | 'wall' | 'floor';

const FILTER_TABS: { id: FilterCategory; label: string }[] = [
  { id: 'all',   label: 'Tất cả' },
  { id: 'duct',  label: 'Ống gió PCCC' },
  { id: 'wall',  label: 'Vách ngăn' },
  { id: 'floor', label: 'Lót sàn' },
];

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

      {/* Filter tabs: Mobile Grid 2x2 đối xứng cân đối, Desktop 1 hàng Segmented Capsule */}
      <div className="flex justify-center mb-5 sm:mb-8" role="tablist" aria-label="Lọc theo quy cách thi công">
        <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border-2 border-slate-300 w-full max-w-sm sm:max-w-fit shadow-sm">
          {FILTER_TABS.map((tab, idx) => {
            const isActive = activeCategory === tab.id;
            const isFullWidthMobile = FILTER_TABS.length % 2 !== 0 && idx === 0;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3.5 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-center select-none flex items-center justify-center border-2 ${
                  isFullWidthMobile ? 'col-span-2' : 'col-span-1'
                } ${
                  isActive
                    ? 'bg-[#5F8A03] text-white border-[#4E7202] shadow-md shadow-[#5F8A03]/30 font-extrabold'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile scroll hint */}
      <p className="sm:hidden text-[11px] text-center text-slate-400 -mt-2 mb-3.5 select-none">
        ← Vuốt ngang để xem đủ quy cách →
      </p>

      {/* Table */}
      <div className="relative">
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent z-30 rounded-r-3xl sm:hidden" />
        <div className="bg-white rounded-3xl border border-slate-300 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: specs.length * 130 + 200 }}>

              {/* HEADER */}
              <thead>
                <tr className="border-b-2 border-slate-300">
                  {/* Sticky label column */}
                  <th scope="col" className="sticky left-0 z-20 bg-slate-50 px-5 py-4 w-[200px] text-xl font-bold text-slate-900 uppercase tracking-wider">
                    Thông số
                  </th>

                  {specs.map((spec, i) => (
                    <th
                      key={spec.thickness}
                      scope="col"
                      onMouseEnter={() => setHoveredCol(i)}
                      onMouseLeave={() => setHoveredCol(null)}
                      className={`text-center p-0 border-l border-slate-300 transition-colors duration-150 min-w-[130px] align-top ${
                        hoveredCol === i ? 'bg-[#F4F9E8]' : 'bg-slate-50'
                      }`}
                    >
                      <div className="px-4 py-4">
                        <div className={`text-2xl font-black leading-none transition-colors duration-150 ${hoveredCol === i ? 'text-[#5F8A03]' : 'text-slate-900'}`}>
                          {spec.thickness.replace('mm', '')}
                          <span className={`text-sm font-bold transition-colors duration-150 ${hoveredCol === i ? 'text-[#7CB305]' : 'text-slate-400'}`}>mm</span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* ROW 1: Chịu lửa */}
                <tr className="group hover:bg-slate-50/80 transition-colors duration-100">
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 px-5 py-4 text-[13px] font-bold text-slate-800 align-top border-r border-b border-slate-300 transition-colors duration-100">
                    Chịu lửa (EI)
                  </td>
                  {specs.map((spec, i) => (
                    <td key={spec.thickness}
                      onMouseEnter={() => setHoveredCol(i)} onMouseLeave={() => setHoveredCol(null)}
                      className={`px-3 py-4 text-center border-l border-b border-slate-300 transition-colors duration-100 ${hoveredCol === i ? 'bg-[#F4F9E8]' : 'bg-[#FEF3EC]/20'}`}>
                      <span className="inline-block bg-[#F26522] text-white text-[11px] font-black px-2.5 py-1 rounded-full whitespace-nowrap">
                        {spec.fireRating}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* ROW 2: Khối lượng */}
                <tr className="group hover:bg-slate-50/80 transition-colors duration-100">
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 px-5 py-4 text-[13px] font-bold text-slate-800 align-top border-r border-b border-slate-300 transition-colors duration-100">
                    Khối lượng / tấm
                  </td>
                  {specs.map((spec, i) => (
                    <td key={spec.thickness}
                      onMouseEnter={() => setHoveredCol(i)} onMouseLeave={() => setHoveredCol(null)}
                      className={`px-3 py-4 text-center border-l border-b border-slate-300 transition-colors duration-100 ${hoveredCol === i ? 'bg-[#F4F9E8]' : ''}`}>
                      <span className="text-[13px] font-semibold text-slate-800">{spec.weightPerSheet}</span>
                    </td>
                  ))}
                </tr>

                {/* ROW 3: Tỷ trọng */}
                <tr className="group hover:bg-slate-50/80 transition-colors duration-100">
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 px-5 py-4 text-[13px] font-bold text-slate-800 align-top border-r border-b border-slate-300 transition-colors duration-100">
                    Tỷ trọng
                  </td>
                  {specs.map((spec, i) => (
                    <td key={spec.thickness}
                      onMouseEnter={() => setHoveredCol(i)} onMouseLeave={() => setHoveredCol(null)}
                      className={`px-3 py-4 text-center border-l border-b border-slate-300 transition-colors duration-100 ${hoveredCol === i ? 'bg-[#F4F9E8]' : 'bg-slate-50/60'}`}>
                      <span className="text-[13px] font-semibold text-slate-700">{spec.density}</span>
                    </td>
                  ))}
                </tr>

                {/* ROW 4: Cường độ uốn */}
                <tr className="group hover:bg-slate-50/80 transition-colors duration-100">
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 px-5 py-4 text-[13px] font-bold text-slate-800 align-top border-r border-b border-slate-300 transition-colors duration-100">
                    Cường độ uốn
                  </td>
                  {specs.map((spec, i) => (
                    <td key={spec.thickness}
                      onMouseEnter={() => setHoveredCol(i)} onMouseLeave={() => setHoveredCol(null)}
                      className={`px-3 py-4 text-center border-l border-b border-slate-300 transition-colors duration-100 ${hoveredCol === i ? 'bg-[#F4F9E8]' : ''}`}>
                      <span className="text-[13px] font-semibold text-[#5F8A03]">{spec.flexuralStrength || '≥ 18 MPa'}</span>
                    </td>
                  ))}
                </tr>

                {/* ROW 5: Ứng dụng */}
                <tr className="group hover:bg-slate-50/80 transition-colors duration-100">
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 px-5 py-4 text-[13px] font-bold text-slate-800 align-top border-r border-b border-slate-300 transition-colors duration-100">
                    Ứng dụng chính
                  </td>
                  {specs.map((spec, i) => {
                    const apps = spec.standardApplication.split('•').map(a => a.trim()).filter(Boolean);
                    return (
                      <td key={spec.thickness}
                        onMouseEnter={() => setHoveredCol(i)} onMouseLeave={() => setHoveredCol(null)}
                        className={`px-3 py-4 align-top border-l border-b border-slate-300 transition-colors duration-100 ${hoveredCol === i ? 'bg-[#F4F9E8]' : 'bg-slate-50/60'}`}>
                        <ul className="space-y-1.5">
                          {apps.slice(0, 2).map((a, j) => (
                            <li key={j} className="flex items-start gap-1 text-xs text-slate-600 leading-snug">
                              <span className="text-[#5F8A03] font-bold mt-0.5 flex-shrink-0">•</span>
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    );
                  })}
                </tr>

              </tbody>
            </table>
          </div>

          {/* ── CONVERSION BRIDGE DƯỚI BẢNG THÔNG SỐ (1 CTA DUY NHẤT) ── */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-700">
            <div className="space-y-1.5 text-center md:text-left">
              <h4 className="text-lg sm:text-xl font-black text-white">
                Cần Tư Vấn Quy Cách & Báo Giá Tấm MGO Cho Dự Án?
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Kỹ sư Remak hỗ trợ tính toán độ dày theo tiêu chuẩn PCCC QCVN 06:2022, nhận gia công cắt phay cạnh theo bản vẽ và gửi báo giá chiết khấu trực tiếp từ nhà máy.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                href="/bao-gia"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#F26522] to-[#EA580C] hover:from-[#EA580C] hover:to-[#D95314] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-600/30 flex items-center gap-2 hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Nhận Báo Giá Tấm MGO Remak®</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
