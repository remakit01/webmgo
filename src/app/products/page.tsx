'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Flame, 
  Wind, 
  Layers, 
  Music, 
  ShieldCheck, 
  Award, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  Package, 
  PhoneCall, 
  Download,
  Filter,
} from 'lucide-react';
import { PRODUCTS, PRODUCT_ACCESSORIES, MGO_SPECS } from '@/data/products';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedThickness, setSelectedThickness] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Tất cả sản phẩm', icon: Layers },
    { id: 'duct', label: 'Bọc Ống Gió PCCC', icon: Wind },
    { id: 'wall', label: 'Vách & Trần Chống Cháy', icon: Flame },
    { id: 'floor', label: 'Lót Sàn Chịu Tải', icon: Layers },
    { id: 'acoustic', label: 'Tiêu Âm & Trang Trí', icon: Music },
  ];

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesThickness = selectedThickness === 'all' || product.thicknessList.includes(selectedThickness);
    return matchesCategory && matchesThickness;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* 1. BREADCRUMB NAVIGATION */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-3 text-xs text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#5F8A03] transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">Sản phẩm Tấm MGO Remak®</span>
        </div>
      </div>

      {/* 2. HERO BANNER - CHỨNG MINH SẢN PHẨM ĐÃ KIỂM CHỨNG */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white py-14 lg:py-20 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#7CB305]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#F26522]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#A0D911] text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldCheck size={16} />
              <span>Sản phẩm đạt chuẩn kiểm định PCCC QCVN 06:2022/BXD</span>
            </div>
            
            <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight">
              Hệ Thống Tấm Magie Oxit (MGO) <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A0D911] via-lime-300 to-[#F26522]">
                Remak® FireOFF Đã Kiểm Chứng
              </span>
            </h1>

            <p className="text-base lg:text-lg text-slate-300 mb-8 leading-relaxed">
              Dòng vật liệu chống cháy vô cơ thế hệ mới đã vượt qua các bài đốt mẫu thực tế tại Viện KHCN Xây Dựng (IBST) 
              và Cục Cảnh sát PCCC & CNCH. Cam kết 100% công thức muối Sulfate (MOS) Zero-Chloride – Không rỉ sét ốc vít, không toát mồ hôi muối.
            </p>

            {/* TRUST BADGES */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/15">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#7CB305]/20 flex items-center justify-center text-[#A0D911] flex-shrink-0">
                  <Flame size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Class A1</div>
                  <div className="text-[11px] text-slate-400">Không bắt lửa 1200°C</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F26522]/20 flex items-center justify-center text-[#F26522] flex-shrink-0">
                  <Wind size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">EI 30 – EI 180</div>
                  <div className="text-[11px] text-slate-400">Đốt thực tế IBST</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Award size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Zero Chloride</div>
                  <div className="text-[11px] text-slate-400">Không rỉ sét ốc vít</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <FileText size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">QCVN 06:2022</div>
                  <div className="text-[11px] text-slate-400">Nghiệm thu 100%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BỘ LỌC TƯƠNG TÁC (CATEGORY & THICKNESS FILTER) */}
      <section className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#5F8A03] text-white shadow-sm shadow-[#5F8A03]/30'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <IconComponent size={14} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Thickness Quick Filter */}
            <div className="flex items-center gap-2 flex-shrink-0 text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Filter size={13} />
                Độ dày:
              </span>
              <div className="flex items-center gap-1 overflow-x-auto">
                {['all', '5mm', '8mm', '10mm', '12mm', '15mm', '18mm'].map((th) => (
                  <button
                    key={th}
                    onClick={() => setSelectedThickness(th)}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      selectedThickness === th
                        ? 'bg-[#F26522] text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {th === 'all' ? 'Tất cả' : th}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. LƯỚI SẢN PHẨM CHÍNH (PRODUCT GRID) */}
      <section className="py-12 max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Danh Sách Dòng Sản Phẩm ({filteredProducts.length})
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Tất cả sản phẩm đều có đầy đủ biên bản thử nghiệm đốt mẫu và chứng nhận xuất xưởng CO/CQ
            </p>
          </div>
          <Link
            href="/bao-gia"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FEF3EC] text-[#F26522] hover:bg-[#F26522] hover:text-white font-bold text-xs transition-colors"
          >
            <PhoneCall size={14} />
            <span>Tải Báo Giá Dự Án 2026</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, idx) => (
            <ScrollReveal key={product.id} delay={idx * 80}>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full group hover:border-[#7CB305]/40">
                
                {/* Product Image & Badges */}
                <div className="relative h-56 bg-slate-100 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-60" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {product.badge && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#F26522] text-white shadow-xs">
                        {product.badge}
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/95 text-[#5F8A03] backdrop-blur-xs shadow-xs">
                      {product.categoryLabel}
                    </span>
                  </div>

                  {/* Fire Rating Pill */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="font-bold flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-xs">
                      <Flame size={13} className="text-[#F26522]" />
                      {product.fireRating}
                    </span>
                    <span className="text-[11px] bg-emerald-600/90 px-2 py-1 rounded-md font-semibold">
                      {product.density}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#5F8A03] transition-colors leading-snug">
                      <Link href={`/san-pham/${product.slug}`}>
                        {product.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {product.tagline}
                    </p>

                    {/* Thickness Available */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Độ dày quy chuẩn (1220 x 2440mm):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {product.thicknessList.map((th) => (
                          <span 
                            key={th}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold"
                          >
                            {th}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Highlights bullet points */}
                    <div className="mt-4 space-y-1.5">
                      {product.highlights.slice(0, 2).map((item, hIdx) => (
                        <div key={hIdx} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle2 size={13} className="text-[#5F8A03] flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions CTA */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                    <Link
                      href={`/san-pham/${product.slug}`}
                      className="flex-1 text-center py-2.5 px-3 rounded-xl bg-[#F4F9E8] hover:bg-[#5F8A03] text-[#5F8A03] hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Xem thông số & Cấu tạo</span>
                      <ArrowRight size={13} />
                    </Link>
                    <a
                      href="tel:0902441981"
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-[#F26522] hover:bg-[#FEF3EC] text-slate-600 hover:text-[#F26522] transition-colors"
                      title="Gọi tư vấn kỹ thuật ngay"
                    >
                      <PhoneCall size={16} />
                    </a>
                  </div>

                </div>

              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 5. BẢNG TRA CỨU ĐỘ DÀY & QUY CÁCH CHUẨN THI CÔNG */}
      <section className="py-14 bg-white border-y border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#5F8A03] uppercase tracking-wider bg-[#F4F9E8] px-3 py-1 rounded-full">
              Kỹ Sư & Nhà Thầu Tra Cứu Nhanh
            </span>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mt-3">
              Bảng Thông Số Độ Dày & Khối Lượng Tiêu Chuẩn
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Kích thước tấm tiêu chuẩn: 1.220mm x 2.440mm (Diện tích 2.977 m²/tấm) – Tỷ trọng 963 kg/m³
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3.5 px-4 whitespace-nowrap">Độ dày</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Trọng lượng/tấm</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Giới hạn chịu lửa</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Độ bền uốn</th>
                  <th className="py-3.5 px-4">Ứng dụng tiêu chuẩn khuyến nghị</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MGO_SPECS.map((spec) => (
                  <tr key={spec.thickness} className="hover:bg-[#F4F9E8]/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-mono text-xs">
                        {spec.thickness}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                      {spec.weightPerSheet}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF3EC] text-[#F26522] font-bold text-[11px]">
                        <Flame size={12} />
                        {spec.fireRating}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                      {spec.flexuralStrength || '18 MPa'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {spec.standardApplication}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <Link 
                        href="/bao-gia"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-[11px] transition-colors"
                      >
                        Báo giá tấm {spec.thickness}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. PHỤ KIỆN THI CÔNG PCCC ĐỒNG BỘ */}
      <section id="phu-kien-dong-bo" className="py-14 max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold text-[#F26522] uppercase tracking-wider bg-[#FEF3EC] px-3 py-1 rounded-full">
              Đồng Bộ Hệ Thống Nghiệm Thu
            </span>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mt-3">
              Phụ Kiện Chống Cháy Đồng Bộ Đã Thẩm Định
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Để công trình đạt nghiệm thu PCCC thực tế, việc sử dụng vít chống ăn mòn và keo chống cháy nở phồng đồng bộ là bắt buộc.
            </p>
          </div>
          <a
            href="tel:0902441981"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#5F8A03] hover:underline"
          >
            <span>Tư vấn định mức vật tư phụ kiện ({'>'})</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRODUCT_ACCESSORIES.map((acc) => (
            <div key={acc.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FEF3EC] text-[#F26522] flex items-center justify-center mb-4">
                  <Package size={24} />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#F26522]">
                  {acc.role}
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {acc.name}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {acc.description}
                </p>
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div><strong>Quy cách:</strong> {acc.spec}</div>
                  <div><strong>Đóng gói:</strong> {acc.packaging}</div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href="tel:0902441981"
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <PhoneCall size={13} />
                  <span>Đặt mua cùng tấm MGO</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CTA DOWNLOAD DOSSIER & TEST REPORT */}
      <section className="py-14 bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 text-white">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="rounded-3xl bg-white/5 border border-white/10 p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 backdrop-blur-md">
            <div className="max-w-2xl">
              <span className="px-3 py-1 rounded-full bg-[#7CB305]/20 text-[#A0D911] text-xs font-bold uppercase tracking-wider">
                Hồ Sơ Pháp Lý Đầy Đủ
              </span>
              <h2 className="text-2xl lg:text-4xl font-extrabold text-white mt-3">
                Cần Tải Trọn Bộ Kết Quả Thử Nghiệm PCCC & Catalogue 2026?
              </h2>
              <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                Remak cung cấp đầy đủ bản sao công chứng kết quả thử nghiệm đốt mẫu của Viện Khoa học Công nghệ Xây dựng (IBST), 
                chứng nhận Cục PCCC, bảng chỉ số cơ lý và tài liệu hướng dẫn bọc ống gió phục vụ làm hồ sơ thầu.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-shrink-0">
              <Link
                href="/bao-gia"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#F26522] hover:bg-[#D95314] text-white font-bold text-sm transition-all shadow-lg shadow-[#F26522]/30 flex items-center justify-center gap-2"
              >
                <Download size={16} />
                <span>Tải Hồ Sơ Kiểm Định PDF</span>
              </Link>
              <a
                href="tel:0902441981"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/20 flex items-center justify-center gap-2"
              >
                <PhoneCall size={16} />
                <span>Hotline: 0902.441.981</span>
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
