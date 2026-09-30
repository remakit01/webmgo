'use client';

import React from 'react';
import {
  CheckCircle2,
  ChevronRight,
  PhoneCall
} from 'lucide-react';

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Xác Định Cấp EI',
    desc: 'Tư vấn chọn đúng độ dày 5 - 18mm theo chuẩn QCVN 06:2022, tối ưu chi phí vật tư.',
    badge: 'Đúng quy chuẩn',
  },
  {
    step: '02',
    title: 'Lắp Khung & Bông',
    desc: 'Thi công khung xương thép khẩu độ 400 - 600mm, chèn bông Rockwool tỷ trọng chuẩn.',
    badge: 'Đúng kỹ thuật',
  },
  {
    step: '03',
    title: 'Bắn Vít & Trét Keo',
    desc: 'Bắn so le mạch, trét keo chống cháy Remak® FireSeal ngăn 100% khói độc xâm nhập.',
    badge: 'Kín khít tuyệt đối',
  },
  {
    step: '04',
    title: 'Nghiệm Thu PCCC',
    desc: 'Cung cấp trọn bộ biên bản thử nghiệm đốt lò IBST công chứng và CO/CQ xuất xưởng.',
    badge: 'Nghiệm thu 100%',
  },
];

// Xen kẽ 2 tông màu thương hiệu để phân biệt từng bước, tránh cả 4 thẻ trùng 1 màu
const ACCENTS = [
  {
    bar: 'bg-gradient-to-r from-[#7CB305] to-[#5F8A03]',
    badge: 'bg-[#5F8A03]',
    tag: 'bg-[#F4F9E8] text-[#5F8A03] border-[#7CB305]/20',
    title: 'text-[#5F8A03] group-hover:text-[#7CB305]',
    cardHover: 'hover:border-[#7CB305]/60',
    connector: 'bg-[#5F8A03]',
  },
  {
    bar: 'bg-gradient-to-r from-[#F26522] to-[#D95314]',
    badge: 'bg-[#D95314]',
    tag: 'bg-[#FEF3EC] text-[#D95314] border-[#F26522]/20',
    title: 'text-[#D95314] group-hover:text-[#F26522]',
    cardHover: 'hover:border-[#F26522]/60',
    connector: 'bg-[#D95314]',
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

        {/* 4 Process Cards Grid (nối bước bằng mũi tên trên desktop) */}
        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 list-none">
          {PROCESS_STEPS.map((item, idx) => {
            const isLast = idx === PROCESS_STEPS.length - 1;
            const accent = ACCENTS[idx % ACCENTS.length];
            return (
              <li key={idx} className="relative">
                <div className={`group h-full bg-white rounded-3xl border border-slate-200 shadow-xs ${accent.cardHover} hover:shadow-lg transition-all duration-300 overflow-hidden`}>
                  {/* Thanh nhấn màu thương hiệu trên đỉnh thẻ (xen kẽ theo bước) */}
                  <div className={`h-1.5 ${accent.bar}`} />

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg ${accent.badge} text-white text-[11px] font-black tracking-wider`}>
                        BƯỚC {item.step}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${accent.tag}`}>
                        {item.badge}
                      </span>
                    </div>

                    <h3 className={`text-lg font-extrabold transition-colors duration-300 mb-2 ${accent.title}`}>
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {!isLast && (
                  <div
                    aria-hidden="true"
                    className={`hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-7 h-7 rounded-full ${accent.connector} items-center justify-center shadow-md ring-4 ring-slate-50`}
                  >
                    <ChevronRight size={14} className="text-white" />
                  </div>
                )}
              </li>
            );
          })}
        </ol>

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
