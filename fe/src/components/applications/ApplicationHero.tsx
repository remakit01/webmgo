'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Download, 
  ChevronDown 
} from 'lucide-react';

export default function ApplicationHero() {
  const scrollToSolutions = () => {
    const el = document.getElementById('solutions-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-white via-[#F4F9E8]/40 to-slate-50 border-b border-slate-200 overflow-hidden pt-8 pb-14 lg:pt-12 lg:pb-20">
      
      {/* Background Decorative Rings */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#7CB305]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#F26522]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        
        {/* Breadcrumb Mini */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-[#5F8A03] transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">Giải pháp ứng dụng</span>
        </div>

        {/* Hero Main Content */}
        <div className="max-w-4xl mx-auto text-center space-y-5">
          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Các Giải Pháp & Ứng Dụng Thực Tế Tấm MGO Remak®
          </h1>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={scrollToSolutions}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-sm transition-all shadow-md shadow-[#5F8A03]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Xem Các Giải Pháp</span>
              <ChevronDown size={16} />
            </button>

            <Link
              href="/bao-gia"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F26522] hover:bg-[#D95314] text-white font-bold text-sm transition-all shadow-md shadow-[#F26522]/25 flex items-center justify-center gap-2"
            >
              <Download size={16} />
              <span>Tải Hồ Sơ Kiểm Định PCCC</span>
            </Link>
          </div>

        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-10 pt-6 border-t border-slate-200/80">
          
          <div className="rounded-2xl bg-white border border-slate-200 shadow-2xs text-center overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#7CB305] to-[#5F8A03]" />
            <div className="p-3.5">
              <div className="text-2xl sm:text-3xl font-black text-[#5F8A03]">5+</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">Hệ Ứng Dụng</div>
              <div className="text-[11px] text-slate-500">Ống gió, vách, sàn, trần, cửa</div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-2xs text-center overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#F26522] to-[#D95314]" />
            <div className="p-3.5">
              <div className="text-2xl sm:text-3xl font-black text-[#F26522]">EI 30 – 180</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">Giới Hạn Chịu Lửa</div>
              <div className="text-[11px] text-slate-500">Đốt lò thực tế Viện IBST</div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-2xs text-center overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#7CB305] to-[#5F8A03]" />
            <div className="p-3.5">
              <div className="text-2xl sm:text-3xl font-black text-[#5F8A03]">1.200°C</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">Không Cháy (A1)</div>
              <div className="text-[11px] text-slate-500">100% gốc khoáng vô cơ</div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-2xs text-center overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-slate-500 to-slate-700" />
            <div className="p-3.5">
              <div className="text-2xl sm:text-3xl font-black text-slate-800">0% Rỉ Sét</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">Không Muối Clorua</div>
              <div className="text-[11px] text-slate-500">Bảo vệ an toàn tôn kẽm & ty treo</div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
