import React from 'react';
import Link from 'next/link';

const STATS = [
  { value: '200+', label: 'Dự Án Hoàn Thành' },
  { value: '1.2M+', label: 'M² Đã Thi Công' },
  { value: '32', label: 'Tỉnh Thành' },
  { value: '10+', label: 'Năm Kinh Nghiệm' },
];

export default function ProjectsHero() {
  return (
    <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 pt-8 pb-12 lg:pt-12 lg:pb-16">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/" className="hover:text-[#7CB305] transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="font-semibold text-slate-200">Dự Án Tiêu Biểu</span>
        </div>

        {/* Main copy */}
        <div className="max-w-3xl mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Dự Án Tiêu Biểu
            <span className="block text-[#7CB305]">Đã Triển Khai Bởi Remak® FireOFF</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Hơn 200 công trình thực tế từ nhà máy KCN, trung tâm thương mại đến data center —
            tất cả đều được nghiệm thu PCCC bởi Cục Cảnh Sát PCCC & CNCH với hồ sơ IBST đầy đủ.
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white/10 border border-white/15 rounded-2xl p-4 sm:p-5 text-center backdrop-blur-sm"
            >
              <div className="text-2xl sm:text-3xl font-black text-white">{stat.value}</div>
              <div className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
