'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Wind, 
  Flame, 
  Layers, 
  ShieldAlert, 
  Music, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Calculator,
  ChevronRight
} from 'lucide-react';

interface SolutionOption {
  id: string;
  label: string;
  icon: React.ElementType;
  defaultThickness: string;
  recommendedProductSlug: string;
  recommendedProductName: string;
  ratingMap: Record<string, { thickness: string; rating: string; desc: string }>;
}

const SOLUTIONS: SolutionOption[] = [
  {
    id: 'duct',
    label: 'Bọc Ống Gió PCCC',
    icon: Wind,
    defaultThickness: '8mm',
    recommendedProductSlug: 'tam-mgo-boc-ong-gio-pccc',
    recommendedProductName: 'MGO Bọc Ống Gió PCCC Remak® DuctBoard',
    ratingMap: {
      'ei30': { thickness: '5mm', rating: 'EI 30', desc: 'Ống cấp gió tươi, ống khói áp lực thấp' },
      'ei60': { thickness: '8mm', rating: 'EI 45 - EI 60', desc: 'Hút khói hành lang, tầng hầm tiêu chuẩn IBST' },
      'ei120': { thickness: '10mm - 12mm', rating: 'EI 90 - EI 120', desc: 'Trục ống đứng kỹ thuật xuyên tầng cao ốc' },
    },
  },
  {
    id: 'wall',
    label: 'Vách & Trần Ngăn Cháy',
    icon: Flame,
    defaultThickness: '10mm',
    recommendedProductSlug: 'tam-mgo-tieu-chuan-chong-chay',
    recommendedProductName: 'MGO Tiêu Chuẩn Chống Cháy Remak® Standard',
    ratingMap: {
      'ei30': { thickness: '8mm', rating: 'EI 45', desc: 'Vách ngăn phòng khách sạn, căn hộ cao cấp' },
      'ei60': { thickness: '10mm', rating: 'EI 60 - EI 90', desc: 'Vách ngăn hành lang thoát hiểm, phòng họp' },
      'ei120': { thickness: '12mm - 15mm', rating: 'EI 120 - EI 150', desc: 'Vách nhà xưởng công nghiệp, kho hóa chất' },
    },
  },
  {
    id: 'floor',
    label: 'Lót Sàn Chịu Tải Gác Lửng',
    icon: Layers,
    defaultThickness: '18mm',
    recommendedProductSlug: 'tam-mgo-lot-san-chiu-luc',
    recommendedProductName: 'MGO Lót Sàn Chịu Lực Remak® Structural Floor',
    ratingMap: {
      'ei30': { thickness: '15mm', rating: 'EI 120 (Tải 600kg/m²)', desc: 'Gác lửng dân dụng, quán cafe, văn phòng' },
      'ei60': { thickness: '18mm', rating: 'EI 180 (Tải 850kg/m²)', desc: 'Sàn nhà xưởng lắp ghép, kho lưu trữ' },
      'ei120': { thickness: '20mm', rating: 'EI 180 (Tải >1000kg/m²)', desc: 'Sàn nâng Data Center, phòng đặt máy chủ' },
    },
  },
  {
    id: 'steel',
    label: 'Bọc Dầm Cột Thép',
    icon: ShieldAlert,
    defaultThickness: '12mm',
    recommendedProductSlug: 'tam-mgo-boc-dam-cot-thep',
    recommendedProductName: 'MGO Bọc Dầm Cột Thép Remak® SteelGuard',
    ratingMap: {
      'ei30': { thickness: '10mm', rating: 'R30 - R45', desc: 'Khung nhà kho xưởng tiêu chuẩn nhỏ' },
      'ei60': { thickness: '12mm', rating: 'R60 - R90', desc: 'Cột dầm thép nhà máy công nghệ cao' },
      'ei120': { thickness: '15mm', rating: 'R120 - R180', desc: 'Tòa nhà kết cấu thép nhiều tầng, trung tâm thương mại' },
    },
  },
  {
    id: 'acoustic',
    label: 'Tiêu Âm Phòng Hát / Bar',
    icon: Music,
    defaultThickness: '10mm',
    recommendedProductSlug: 'tam-mgo-trang-tri-tieu-am',
    recommendedProductName: 'MGO Tiêu Âm & Trang Trí Remak® DecoAcoustic',
    ratingMap: {
      'ei30': { thickness: '10mm', rating: 'Class A (NRC 0.65)', desc: 'Vách tiêu âm phòng hát Karaoke gia đình' },
      'ei60': { thickness: '12mm', rating: 'Class A1 (NRC 0.75)', desc: 'Tổ hợp Bar, Lounge, phòng thu âm đạt kiểm định' },
      'ei120': { thickness: '12mm Phủ Melamine', rating: 'Class A1 (NRC 0.85)', desc: 'Hội trường lớn, trung tâm hội nghị đa năng' },
    },
  },
];

const RATINGS = [
  { id: 'ei30', label: 'EI 30 – EI 45', sublabel: 'Hạng mục cơ bản' },
  { id: 'ei60', label: 'EI 60 – EI 90', sublabel: 'Hạng mục phổ biến nhất' },
  { id: 'ei120', label: 'EI 120 – EI 180', sublabel: 'Hạng mục cao cấp / chịu lực' },
];

export default function ProductSolutionFinder() {
  const [selectedApp, setSelectedApp] = useState<string>('duct');
  const [selectedRating, setSelectedRating] = useState<string>('ei60');

  const currentSolution = SOLUTIONS.find((s) => s.id === selectedApp) || SOLUTIONS[0];
  const currentDetail = currentSolution.ratingMap[selectedRating] || currentSolution.ratingMap['ei60'];

  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 -mt-6 sm:-mt-8 relative z-20 mb-8">
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-200/90 backdrop-blur-md">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7CB305] animate-pulse" />
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wide">
              Bộ Tìm Giải Pháp Tấm MGO Nhanh (Solution Finder 3s)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Chọn nhu cầu để xem ngay độ dày & dòng sản phẩm đạt chuẩn PCCC
          </span>
        </div>

        {/* 2 BƯỚC CHỌN NHANH */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* BƯỚC 1: CHỌN ỨNG DỤNG */}
          <div className="lg:col-span-4 space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              1. Bạn Cần Chống Cháy Cho Hạng Mục Nào?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {SOLUTIONS.map((sol) => {
                const IconComponent = sol.icon;
                const isSelected = selectedApp === sol.id;
                return (
                  <button
                    key={sol.id}
                    type="button"
                    onClick={() => setSelectedApp(sol.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#F4F9E8] text-[#5F8A03] border-[#7CB305] shadow-xs'
                        : 'bg-slate-50/80 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-[#7CB305] text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      <IconComponent size={14} />
                    </div>
                    <span className="truncate">{sol.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BƯỚC 2: CHỌN CẤP CHỐNG CHÁY */}
          <div className="lg:col-span-3 space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              2. Giới Hạn Chịu Lửa Yêu Cầu?
            </label>
            <div className="flex flex-col gap-2">
              {RATINGS.map((rat) => {
                const isSelected = selectedRating === rat.id;
                return (
                  <button
                    key={rat.id}
                    type="button"
                    onClick={() => setSelectedRating(rat.id)}
                    className={`p-3 rounded-xl text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#FEF3EC] text-[#F26522] border-[#F26522] shadow-xs'
                        : 'bg-slate-50/80 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold">{rat.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{rat.sublabel}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BƯỚC 3: KẾT QUẢ ĐỀ XUẤT */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 flex flex-col justify-between border border-slate-700 shadow-md">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-[#7CB305]/20 text-[#A0D911] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} />
                  Giải Pháp Đạt Chuẩn Đề Xuất
                </span>
                <span className="text-xs font-extrabold text-[#F26522]">
                  {currentDetail.rating}
                </span>
              </div>

              <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                {currentSolution.recommendedProductName}
              </h4>
              
              <div className="mt-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Độ dày khuyến nghị:</span>
                  <span className="font-extrabold text-[#A0D911] text-sm px-2 py-0.5 rounded bg-white/10">
                    {currentDetail.thickness}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={14} className="text-[#A0D911] flex-shrink-0 mt-0.5" />
                  <span>{currentDetail.desc}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/10 flex items-center gap-2">
              <Link
                href={`/san-pham/${currentSolution.recommendedProductSlug}`}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-[#5F8A03]/30"
              >
                <span>Xem Chi Tiết Dòng Này</span>
                <ArrowRight size={13} />
              </Link>
              <Link
                href="/bao-gia"
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors whitespace-nowrap"
              >
                Nhận Báo Giá Dự Án
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
