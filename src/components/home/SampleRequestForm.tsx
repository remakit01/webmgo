'use client';

import React, { useState } from 'react';
import { Package, CheckCircle2 } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';

export default function SampleRequestForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="mau-thu" className="max-w-[1440px] mx-auto px-4 lg:px-8">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
        
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#7CB305]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F26522]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-block text-xs font-bold text-[#7CB305] uppercase tracking-wider bg-[#7CB305]/20 px-3 py-1 rounded-full">
              DÀNH CHO CHỦ ĐẦU TƯ & NHÀ THẦU
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
              Đăng Ký Nhận Hộp Mẫu Thử <br />
              <span className="text-[#F26522]">Tấm MGO Remak® Miễn Phí</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Hộp mẫu gồm đủ các độ dày (5mm – 18mm), catalogue kỹ thuật và kết quả đốt mẫu IBST gửi tận tay bạn.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#7CB305]" />
                <span>Miễn phí 100% mẫu thử & cước vận chuyển</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#7CB305]" />
                <span>Giao hỏa tốc 24h toàn quốc</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white text-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl">
            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 bg-[#F4F9E8] text-[#5F8A03] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Đăng Ký Thành Công!</h3>
                <p className="text-xs text-slate-600">
                  Chuyên viên kỹ thuật Remak sẽ liên hệ xác nhận địa chỉ và gửi mẫu thử trong vòng 24h.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Package size={20} className="text-[#F26522]" />
                  <span>Điền Thông Tin Nhận Mẫu</span>
                </h3>
                <p className="text-xs text-slate-500 mb-5">Hộp mẫu sẽ được gửi phát nhanh đến công trình/văn phòng của bạn</p>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Nguyễn Văn A" 
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#7CB305] focus:ring-1 focus:ring-[#7CB305]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="0988 xxx xxx" 
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#7CB305] focus:ring-1 focus:ring-[#7CB305]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tên đơn vị / Dự án</label>
                    <input 
                      type="text" 
                      placeholder="Công ty CP Xây Dựng ABC..." 
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#7CB305] focus:ring-1 focus:ring-[#7CB305]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ nhận hàng *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Số nhà, đường, quận/huyện, tỉnh thành..." 
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#7CB305] focus:ring-1 focus:ring-[#7CB305]"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#F26522] to-[#EA580C] text-white font-bold text-sm shadow-md hover:shadow-orange-500/30 transition-all cursor-pointer"
                  >
                    Gửi Yêu Cầu Nhận Mẫu Thử
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
