'use client';

import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SampleRequestFormProps {
  id?: string;
  title?: string;
  subtitle?: string;
}

export default function SampleRequestForm({
  id = 'mau-thu',
  title = 'Đăng Ký Nhận Hộp Mẫu Thử',
  subtitle = 'Hộp mẫu gồm đủ các độ dày (5mm – 18mm), catalogue kỹ thuật và kết quả đốt mẫu IBST gửi tận tay bạn.',
}: SampleRequestFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id={id} className="max-w-[1440px] mx-auto px-4 lg:px-8">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
        
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#7CB305]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F26522]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
              {title} <br />
              <span className="text-[#F26522]">Tấm MGO Remak® Miễn Phí</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              {subtitle}
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

          <div
            className="lg:col-span-5 bg-white text-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl"
            aria-live="polite"
            role="status"
          >
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="sample-name" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Họ và tên người nhận *
                  </label>
                  <input
                    id="sample-name"
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#7CB305]"
                  />
                </div>

                <div>
                  <label htmlFor="sample-phone" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Số điện thoại nhận hàng *
                  </label>
                  <input
                    id="sample-phone"
                    type="tel"
                    required
                    placeholder="0902 xxx xxx"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#7CB305]"
                  />
                </div>

                <div>
                  <label htmlFor="sample-address" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Địa chỉ nhận mẫu *
                  </label>
                  <input
                    id="sample-address"
                    type="text"
                    required
                    placeholder="Số nhà, tên đường, Quận/Huyện, Tỉnh/TP"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#7CB305]"
                  />
                </div>

                <div>
                  <label htmlFor="sample-purpose" className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Mục đích sử dụng chính
                  </label>
                  <select id="sample-purpose" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#7CB305] text-slate-600">
                    <option value="duct">Bọc ống gió PCCC</option>
                    <option value="wall">Vách ngăn cách âm chống cháy</option>
                    <option value="floor">Lót sàn chịu lực gác lửng</option>
                    <option value="door">Lõi cửa chống cháy</option>
                    <option value="other">KTS / Nhà thầu xem mẫu nghiên cứu</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 bg-[#F26522] hover:bg-[#D95314] text-white font-bold rounded-xl shadow-lg transition-colors text-sm"
                >
                  Gửi Yêu Cầu Nhận Mẫu Ngay
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
