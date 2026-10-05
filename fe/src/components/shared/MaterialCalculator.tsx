'use client';

import React from 'react';
import SectionHeading from '@/components/ui/SectionHeading';
import MaterialChatInterface from './MaterialChatInterface';
import {
  Sparkles,
  ShieldCheck,
  Percent,
  Factory,
  Phone,
  Maximize2,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface MaterialCalculatorProps {
  id?: string;
  showHeading?: boolean;
}

export default function MaterialCalculator({
  id = 'du-toan-vat-tu',
  showHeading = true,
}: MaterialCalculatorProps) {
  const handleOpenFloatingPopup = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-material-chat'));
    }
  };

  return (
    <section id={id} aria-label="Dự Toán Vật Tư Online" className="max-w-[1440px] mx-auto px-4 lg:px-8">
      {showHeading && <SectionHeading title="Dự Toán Vật Tư Online" />}

      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-700 shadow-2xl text-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* CỘT TRÁI: GIỚI THIỆU TRỢ LÝ KỸ THUẬT REMAK & 3 LỢI ÍCH */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5F8A03]/20 text-[#7CB305] text-xs font-bold border border-[#7CB305]/30">
                <Sparkles size={13} className="text-[#F26522]" />
                <span>Trợ Lý Bóc Tách Kỹ Sư Remak®</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
                Bóc Tách Khối Lượng & Chi Phí Tấm MGO Trong 30 Giây
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Không cần tra cứu bảng thông số phức tạp. Trực tiếp trò chuyện với trợ lý kỹ thuật Remak® để nhận kết quả bóc tách số lượng tấm, độ dày PCCC và dự toán kinh phí chuẩn xác ngay tức thì.
              </p>
            </div>

            {/* 3 ĐIỂM CỐT LÕI */}
            <div className="space-y-3.5">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#7CB305]/40 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-[#5F8A03]/20 text-[#7CB305] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white">
                    Tư Vấn Chuẩn PCCC QCVN 06:2022
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-300 mt-0.5 leading-snug">
                    Tự động đề xuất độ dày tấm tối ưu từ EI 30 đến EI 120 cho từng hạng mục công trình.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#7CB305]/40 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-[#F26522]/20 text-[#F26522] flex items-center justify-center shrink-0 mt-0.5">
                  <Percent size={18} />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white">
                    Tối Ưu 5% Hao Hụt Thi Công
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-300 mt-0.5 leading-snug">
                    Đã gồm số lượng đinh vít chuyên dụng, khung xương và keo nở ngăn khói chống cháy.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#7CB305]/40 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Factory size={18} />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white">
                    Báo Giá Xuất Xưởng Từ Nhà Máy
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-300 mt-0.5 leading-snug">
                    Chiết khấu cao nhất theo số lượng đơn hàng, sẵn hàng tại tổng kho Hà Nội & TP.HCM.
                  </div>
                </div>
              </div>
            </div>

            {/* HÀNH ĐỘNG HỖ TRỢ */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleOpenFloatingPopup}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Maximize2 size={15} className="text-[#7CB305]" />
                <span>Mở Dạng Chat Popup Nổi</span>
              </button>

              <a
                href="tel:0902441981"
                className="py-3 px-4 rounded-xl bg-[#F26522]/20 hover:bg-[#F26522]/30 border border-[#F26522]/40 text-[#F26522] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Phone size={14} />
                <span>Kỹ Sư: 0902.441.981</span>
              </a>
            </div>
          </div>

          {/* CỘT PHẢI: KHUNG CHAT LIVE TƯƠNG TÁC THÔNG MINH */}
          <div className="lg:col-span-7">
            <MaterialChatInterface onExpandPopup={handleOpenFloatingPopup} />
          </div>

        </div>
      </div>
    </section>
  );
}
