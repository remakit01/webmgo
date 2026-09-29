'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Droplets, Feather, ShieldCheck, Package, Calculator } from 'lucide-react';

export default function HomeHeroSection() {

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC] pt-6 pb-16">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-7 space-y-6">
            


            {/* 2. Tiêu đề chính lớn */}
            <h1 className="animate-hero-fade-up delay-200 text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              Tấm Chống Cháy MGO Remak®
              <span className="block text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-600 mt-2">
                Bảo vệ kết cấu PCCC chuyên sâu
              </span>
            </h1>

            {/* 3. Đoạn mô tả kỹ thuật */}
            <div className="animate-hero-fade-up delay-300 max-w-2xl text-base text-slate-600 leading-relaxed space-y-3">
              <p>
                Khoáng vô cơ Magie Oxit chịu lửa <strong>1.200°C</strong>, kháng ẩm tuyệt đối và chống ăn mòn. Đốt thử nghiệm đạt chuẩn kiểm định IBST cho ống gió, vách ngăn và sàn chịu tải.
              </p>
              <p>
                Sản xuất từ MgO gốc Sulfate (MgSO₄) — loại bỏ hoàn toàn ăn mòn vít ốc và hiện tượng &quot;chảy nước&quot; mùa nồm ẩm của MGO gốc Clorua truyền thống. Nhẹ hơn Cemboard 30%, dễ cắt khoan, không chứa Amiăng, không phát thải VOC.
              </p>
              <p>
                Ứng dụng: bọc ống gió PCCC, vách ngăn chống cháy, lót sàn chịu tải và lõi cửa thép. Đạt chuẩn PCCC QCVN 06:2022/BXD, hồ sơ nghiệm thu đầy đủ.
              </p>
            </div>


            {/* 4. Nút Call-To-Action xuất hiện đồng bộ */}
            <div className="animate-hero-fade-up delay-400 flex flex-wrap gap-4 pt-2">
              <Link
                href="/nhan-mau-thu"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#F26522] to-[#EA580C] text-white font-bold text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Package size={18} />
                <span>Nhận Mẫu Thử Miễn Phí</span>
              </Link>

              <a 
                href="#du-toan" 
                className="px-6 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-800 font-bold text-base hover:border-[#7CB305] hover:text-[#5F8A03] hover:bg-[#F4F9E8] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Calculator size={18} className="text-[#7CB305]" />
                <span>Dự Toán Khối Lượng (m²)</span>
              </a>
            </div>

            {/* 5. 4 Trust Stat Cards */}
            <div className="animate-hero-fade-up delay-500 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                {/* Card 1 — Chống Cháy */}
                <div className="group rounded-2xl bg-white border border-slate-200 border-t-4 hover:border-[#F26522] p-4 hover:-translate-y-0.5 transition-all duration-200" style={{ borderTopColor: '#F26522' }}>
                  <Flame size={16} className="mb-2.5 text-[#F26522]" />
                  <div className="text-2xl font-black leading-none tracking-tight text-[#F26522]">1.200°C</div>
                  <div className="text-[11px] font-bold mt-1.5 text-slate-800">Chịu nhiệt</div>
                  <div className="text-[10px] mt-0.5 text-slate-400">Chống Cháy A1</div>
                </div>

                {/* Card 2 — Kháng Nước */}
                <div className="group rounded-2xl bg-white border border-slate-200 border-t-4 hover:border-[#5F8A03] p-4 hover:-translate-y-0.5 transition-all duration-200" style={{ borderTopColor: '#5F8A03' }}>
                  <Droplets size={16} className="mb-2.5 text-[#5F8A03]" />
                  <div className="text-2xl font-black leading-none tracking-tight text-[#5F8A03]">0%</div>
                  <div className="text-[11px] font-bold mt-1.5 text-slate-800">Trương nở ẩm</div>
                  <div className="text-[10px] mt-0.5 text-slate-400">Kháng nước tuyệt đối</div>
                </div>

                {/* Card 3 — Siêu Nhẹ */}
                <div className="group rounded-2xl bg-white border border-slate-200 border-t-4 hover:border-slate-600 p-4 hover:-translate-y-0.5 transition-all duration-200" style={{ borderTopColor: '#475569' }}>
                  <Feather size={16} className="mb-2.5 text-slate-500" />
                  <div className="text-2xl font-black leading-none tracking-tight text-slate-800">-30%</div>
                  <div className="text-[11px] font-bold mt-1.5 text-slate-800">Nhẹ hơn Cemboard</div>
                  <div className="text-[10px] mt-0.5 text-slate-400">Thi công nhanh hơn</div>
                </div>

                {/* Card 4 — Zero Chloride */}
                <div className="group rounded-2xl bg-white border border-slate-200 border-t-4 hover:border-[#7CB305] p-4 hover:-translate-y-0.5 transition-all duration-200" style={{ borderTopColor: '#7CB305' }}>
                  <ShieldCheck size={16} className="mb-2.5 text-[#7CB305]" />
                  <div className="text-2xl font-black leading-none tracking-tight text-[#7CB305]">Zero</div>
                  <div className="text-[11px] font-bold mt-1.5 text-slate-800">Chloride</div>
                  <div className="text-[10px] mt-0.5 text-slate-400">0% rỉ sét đinh vít</div>
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
