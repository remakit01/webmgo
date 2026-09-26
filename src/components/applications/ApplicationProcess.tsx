'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  FileCheck2, 
  Layers, 
  Wrench, 
  ShieldCheck, 
  PhoneCall 
} from 'lucide-react';

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Xác Định Cấp EI',
    desc: 'Tư vấn chọn đúng độ dày 5 - 18mm theo chuẩn QCVN 06:2022, tối ưu chi phí vật tư.',
    icon: Layers,
    badge: 'Đúng quy chuẩn',
  },
  {
    step: '02',
    title: 'Lắp Khung & Bông',
    desc: 'Thi công khung xương thép khẩu độ 400 - 600mm, chèn bông Rockwool tỷ trọng chuẩn.',
    icon: Wrench,
    badge: 'Đúng kỹ thuật',
  },
  {
    step: '03',
    title: 'Bắn Vít & Trét Keo',
    desc: 'Bắn so le mạch, trét keo chống cháy Remak® FireSeal ngăn 100% khói độc xâm nhập.',
    icon: ShieldCheck,
    badge: 'Kín khít tuyệt đối',
  },
  {
    step: '04',
    title: 'Nghiệm Thu PCCC',
    desc: 'Cung cấp trọn bộ biên bản thử nghiệm đốt lò IBST công chứng và CO/CQ xuất xưởng.',
    icon: FileCheck2,
    badge: 'Nghiệm thu 100%',
  },
];

export default function ApplicationProcess() {
  return (
    <section className="py-14 bg-slate-50">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Quy Trình 4 Bước Đạt Chuẩn Nghiệm Thu PCCC
          </h2>
        </div>

        {/* 4 Process Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROCESS_STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-[#7CB305] transition-all relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black text-slate-200">
                      {item.step}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F4F9E8] text-[#5F8A03] text-[11px] font-bold">
                      {item.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center mb-4">
                    <Icon size={22} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-[#5F8A03]">
                  <CheckCircle2 size={14} />
                  <span>Cam kết đúng tiêu chuẩn</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Direct Engineer Hotline Support Banner */}
        <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Cần Tư Vấn Thiết Kế Bản Vẽ & Biện Pháp Thi Công PCCC?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Đội ngũ kỹ sư PCCC Remak sẵn sàng hỗ trợ bóc tách khối lượng và cung cấp bản vẽ chi tiết miễn phí.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href="tel:0902441981"
              className="py-3 px-6 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-sm transition-all shadow-md shadow-[#5F8A03]/30 flex items-center gap-2"
            >
              <PhoneCall size={16} />
              <span>Hotline: 0902.441.981</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
