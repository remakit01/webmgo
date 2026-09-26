import React from 'react';
import Link from 'next/link';
import { Flame, Droplets, Feather, ShieldCheck, Sparkles, Package, Calculator, CheckCircle2 } from 'lucide-react';

export default function HomeHeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC] pt-6 pb-16">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            


            {/* 2. Tiêu đề chính lớn */}
            <h1 className="animate-hero-fade-up delay-200 text-3xl sm:text-4xl lg:text-[46px] font-bold text-slate-900 leading-[1.18] tracking-tight">
              Tấm Chống Cháy MGO Remak®
              <span className="block text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-600 mt-2">
                Bảo vệ kết cấu PCCC chuyên sâu
              </span>
            </h1>

            {/* 3. Đoạn mô tả kỹ thuật */}
            <p className="animate-hero-fade-up delay-300 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Khoáng vô cơ Magie Oxit chịu lửa <strong>1.200°C</strong>, kháng ẩm tuyệt đối và chống ăn mòn. Đốt thử nghiệm đạt chuẩn kiểm định IBST cho ống gió, vách ngăn và sàn chịu tải.
            </p>

            {/* 4. Nút Call-To-Action xuất hiện đồng bộ */}
            <div className="animate-hero-fade-up delay-400 flex flex-wrap gap-4 pt-2">
              <a 
                href="#mau-thu" 
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#F26522] to-[#EA580C] text-white font-bold text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Package size={18} />
                <span>Nhận Mẫu Thử Miễn Phí</span>
              </a>

              <a 
                href="#du-toan" 
                className="px-6 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-800 font-bold text-base hover:border-[#7CB305] hover:text-[#5F8A03] hover:bg-[#F4F9E8] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Calculator size={18} className="text-[#7CB305]" />
                <span>Dự Toán Khối Lượng (m²)</span>
              </a>
            </div>

            {/* 5. 4 Trust Badges xuất hiện tiếp nối */}
            <div className="animate-hero-fade-up delay-500 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-[#FEF3EC] text-[#F26522] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                  <Flame size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Chống Cháy A1</div>
                  <div className="text-xs text-slate-500">Chịu lửa 1.200°C</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                  <Droplets size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Kháng Nước</div>
                  <div className="text-xs text-slate-500">0% trương nở ẩm</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-[#FEF3EC] text-[#F26522] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                  <Feather size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Siêu Nhẹ</div>
                  <div className="text-xs text-slate-500">Nhẹ hơn Cemboard 30%</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Gốc Sulfate</div>
                  <div className="text-xs text-slate-500">0% rỉ sét đinh vít</div>
                </div>
              </div>
            </div>

          </div>

          {/* CỘT PHẢI: KHUNG TRÌNH DIỄN SẢN PHẨM CHUẨN THIẾT KẾ B2B (KHÔNG CHE KHUẤT ẢNH, GỌN GÀNG TINH TẾ) */}
          <div className="lg:col-span-5">
            <div className="animate-hero-scale-in delay-300 bg-white rounded-3xl p-3.5 sm:p-4 shadow-xl border border-slate-200/90 transition-all duration-500 hover:shadow-2xl">
              
              {/* Card Header: Tiêu đề mẫu + Badge bảo hành gọn gàng bên trong khung */}
              <div className="flex items-center justify-between px-2 py-1.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#7CB305]"></span>
                  <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                    Cấu Trúc Tấm MGO Thực Tế
                  </span>
                </div>
              </div>

              {/* Hình ảnh sản phẩm thông thoáng 100%, KHÔNG BỊ BẤT KỲ BADGE NÀO CHE KHUẤT */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-[4/3] group">
                <img 
                  src="/images/mgo-mesh.jpg" 
                  alt="Tấm chống cháy MGO Remak kết cấu sợi lưới thủy tinh đa tầng"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              </div>

              {/* Thông tin kiểm định và nghiệm thu đặt trang trọng BÊN DƯỚI ẢNH */}
              <div className="mt-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7CB305] text-white flex items-center justify-center flex-shrink-0 font-extrabold text-xs shadow-sm">
                    PCCC
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Đốt thử nghiệm thực tế tại Viện IBST
                    </div>
                    <div className="text-xs text-slate-500">
                      QCVN 06:2022/BXD • Hồ sơ nghiệm thu đầy đủ
                    </div>
                  </div>
                </div>

                <span className="hidden sm:inline-block text-xs font-bold text-[#F26522] bg-[#FEF3EC] border border-[#F26522]/20 px-2.5 py-1 rounded-lg flex-shrink-0">
                  CO/CQ Đầy Đủ
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
