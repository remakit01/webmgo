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
import { PRODUCTS, MGO_SPECS, getThicknessData } from '@/data/products';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { 
  ProductCard, 
  ProductTabsFilter, 
  ProductFireTestProof,
  ProductSolutionFinder,
  ProductCompareBar,
  ProductCompareModal 
} from '@/components/products';
import { FilterState } from '@/components/products/ProductTabsFilter';
import { ComparisonTable, MaterialCalculator, SampleRequestForm } from '@/components/shared';
import { formatNumber } from '@/lib/utils';

export default function ProductsPage() {
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    thickness: 'all',
    fireRating: 'all',
    search: '',
    sortBy: 'featured',
  });

  // State so sánh sản phẩm (kiểu TGDĐ - tối đa 3 sản phẩm, lưu kèm độ dày đã chọn)
  const [compareSelections, setCompareSelections] = useState<Record<string, string>>({});
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const handleToggleCompare = (productId: string, thickness?: string) => {
    setCompareSelections((prev) => {
      if (prev[productId]) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      if (Object.keys(prev).length >= 3) {
        alert('Bạn chỉ có thể so sánh tối đa 3 sản phẩm cùng lúc để đảm bảo hiển thị chi tiết tốt nhất.');
        return prev;
      }
      const prod = PRODUCTS.find((p) => p.id === productId);
      const chosenThickness = thickness || prod?.thicknessList[0] || '8mm';
      return { ...prev, [productId]: chosenThickness };
    });
  };

  const handleThicknessChange = (productId: string, thickness: string) => {
    setCompareSelections((prev) => {
      if (prev[productId]) {
        return { ...prev, [productId]: thickness };
      }
      return prev;
    });
  };

  const handleRemoveCompare = (productId: string) => {
    setCompareSelections((prev) => {
      const next = { ...prev };
      delete next[productId];
      if (Object.keys(next).length < 2) {
        setIsCompareModalOpen(false);
      }
      return next;
    });
  };

  const handleClearCompare = () => {
    setCompareSelections({});
    setIsCompareModalOpen(false);
  };

  const selectedCompareProducts = PRODUCTS.filter((p) => p.id in compareSelections);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      thickness: 'all',
      fireRating: 'all',
      search: '',
      sortBy: 'featured',
    });
  };

  // Filtered and sorted products
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = filters.category === 'all' || product.category === filters.category;
    const matchesThickness = filters.thickness === 'all' || product.thicknessList.includes(filters.thickness);
    const matchesFireRating = filters.fireRating === 'all' || product.fireRating.includes(filters.fireRating);
    
    const query = filters.search.trim().toLowerCase();
    const matchesSearch = query === '' || 
      product.name.toLowerCase().includes(query) ||
      product.tagline.toLowerCase().includes(query) ||
      product.categoryLabel.toLowerCase().includes(query) ||
      product.thicknessList.some(th => th.toLowerCase().includes(query));

    return matchesCategory && matchesThickness && matchesFireRating && matchesSearch;
  }).sort((a, b) => {
    if (filters.sortBy === 'featured') {
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    }
    if (filters.sortBy === 'bestseller') {
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0) || (b.reviewsCount || 0) - (a.reviewsCount || 0);
    }
    if (filters.sortBy === 'discount') {
      return (b.discountPercent || 0) - (a.discountPercent || 0);
    }
    if (filters.sortBy === 'new') {
      return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    }
    if (filters.sortBy === 'price-asc') {
      return (a.basePrice || 0) - (b.basePrice || 0);
    }
    if (filters.sortBy === 'price-desc') {
      return (b.basePrice || 0) - (a.basePrice || 0);
    }
    return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
  });

  const counts = {
    all: PRODUCTS.length,
    duct: PRODUCTS.filter((p) => p.category === 'duct').length,
    wall: PRODUCTS.filter((p) => p.category === 'wall').length,
    floor: PRODUCTS.filter((p) => p.category === 'floor').length,
    acoustic: PRODUCTS.filter((p) => p.category === 'acoustic').length,
  };

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
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white pt-14 pb-16 lg:pt-20 lg:pb-24 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#7CB305]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#F26522]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#A0D911] text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldCheck size={16} />
              <span>Sản phẩm đạt chuẩn kiểm định PCCC QCVN 06:2022/BXD</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight">
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

      {/* 3. BỘ TÌM GIẢI PHÁP NHANH 3S (SOLUTION FINDER CHUẨN QUỐC TẾ) */}
      <ProductSolutionFinder />

      {/* 4. BỘ LỌC TƯƠNG TÁC (CATEGORY TABS & QUICK FILTER PILLS) */}
      <ProductTabsFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        counts={counts}
        totalResults={filteredProducts.length}
      />

      {/* 5. LƯỚI SẢN PHẨM CHÍNH (PRODUCT GRID CÂN ĐỐI 2 HÀNG X 3 CỘT) */}
      <section className="py-12 max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Danh Mục Sản Phẩm Tấm MGO ({filteredProducts.length})
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

        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, idx) => (
              <ScrollReveal key={product.id} delay={idx * 70}>
                <ProductCard 
                  product={product} 
                  defaultThickness={filters.thickness !== 'all' ? filters.thickness : undefined} 
                  selectedThickness={compareSelections[product.id]}
                  isCompared={product.id in compareSelections}
                  onToggleCompare={(thickness) => handleToggleCompare(product.id, thickness)}
                  onThicknessChange={(thickness) => handleThicknessChange(product.id, thickness)}
                />
              </ScrollReveal>
            ))}
          </div>

          {/* BẢNG SO SÁNH TRỰC TIẾP ĐẶT NGAY DƯỚI DANH SÁCH SẢN PHẨM */}
          {selectedCompareProducts.length >= 2 && (
            <div className="mt-12 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-sm animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#5F8A03] bg-[#F4F9E8] px-3 py-1 rounded-full">
                    Đối chiếu nhanh bên dưới
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-2">
                    Bảng So Sánh Kỹ Thuật {selectedCompareProducts.length} Dòng Tấm MGO Bạn Đã Chọn
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearCompare}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Xóa so sánh
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCompareModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-[#5F8A03] text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>Mở Bảng So Sánh Đầy Đủ</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Bảng so sánh rút gọn */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-3 px-4 w-44">Sản phẩm</th>
                      <th className="py-3 px-4">Chịu lửa PCCC</th>
                      <th className="py-3 px-4">Độ dày</th>
                      <th className="py-3 px-4">Tỷ trọng & Khối lượng</th>
                      <th className="py-3 px-4">Chống ăn mòn đinh vít</th>
                      <th className="py-3 px-4">Giá nhà máy</th>
                      <th className="py-3 px-4 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedCompareProducts.map((prod) => {
                      const activeTh = compareSelections[prod.id] || prod.thicknessList[0] || '8mm';
                      const thData = getThicknessData(activeTh, prod);

                      return (
                        <tr key={prod.id} className="hover:bg-[#F4F9E8]/30 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <img src={prod.image} alt={prod.name} className="w-9 h-9 rounded-lg object-cover border border-slate-200" />
                              <div>
                                <div className="font-bold text-slate-900 line-clamp-1">{prod.shortName || prod.name}</div>
                                <span className="text-[10px] text-[#5F8A03] font-semibold">{prod.categoryLabel}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-[#F26522] whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEF3EC]">
                              <Flame size={12} />
                              <span>{thData.fire || prod.fireRating}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex flex-wrap items-center gap-1">
                              {prod.thicknessList.map((th) => {
                                const isSelected = th === activeTh;
                                return (
                                  <button
                                    key={th}
                                    type="button"
                                    onClick={() => handleThicknessChange(prod.id, th)}
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#7CB305] text-white shadow-2xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                    title={`Đổi sang ${th}`}
                                  >
                                    {th}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                            <div>{prod.density}</div>
                            <div className="text-[10px] text-slate-500 font-normal">({thData.weight})</div>
                          </td>
                          <td className="py-3 px-4">
                            {prod.id === 'mgo-mos-sulfate' ? (
                              <span className="font-bold text-emerald-600">Zero-Chloride (MOS)</span>
                            ) : (
                              <span className="text-slate-600">An toàn kim loại</span>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-extrabold text-[#F26522] text-sm">
                              {formatNumber(thData.price)} đ
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              Độ dày: {activeTh}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <Link 
                              href={`/san-pham/${prod.slug}`} 
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-[#5F8A03] text-white font-bold text-[11px] transition-colors"
                            >
                              <span>Xem</span>
                              <ArrowRight size={11} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </>
        ) : (
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 max-w-lg mx-auto space-y-4 my-8 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
              <Filter size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Không tìm thấy sản phẩm phù hợp</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Không có sản phẩm nào thỏa mãn các bộ lọc bạn đã chọn. Vui lòng điều chỉnh lại độ dày hoặc xóa bộ lọc để xem toàn bộ danh mục.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-[#5F8A03] text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}
      </section>

      {/* 6. BẢNG ĐỐI CHUẨN KỸ THUẬT: TẤM MGO VS CÁC VẬT LIỆU TRUYỀN THỐNG (ĐẨY LÊN VỊ TRÍ CHIẾN LƯỢC) */}
      <section className="py-14 bg-white border-y border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <ComparisonTable id="so-sanh-mgo" />
        </div>
      </section>

      {/* 7. BẰNG CHỨNG THỬ NGHIỆM ĐỐT MẪU THỰC TẾ TẠI VIỆN IBST (TRUST PROOF) */}
      <ProductFireTestProof />

      {/* 8. BẢNG TRA CỨU ĐỘ DÀY & QUY CÁCH CHUẨN THI CÔNG */}
      <section className="py-14 bg-white border-b border-slate-200">
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
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-bold">
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

      {/* 9. DỰ TOÁN BÓC TÁCH KHỐI LƯỢNG & SỐ TẤM MGO THEO DIỆN TÍCH (M²) */}
      <section className="py-14 bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <MaterialCalculator id="du-toan-mgo" />
        </div>
      </section>

      {/* 10. FORM ĐĂNG KÝ HỘP MẪU THỬ TẤM MGO MIỄN PHÍ TẬN NƠI */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <SampleRequestForm />
        </div>
      </section>

      {/* 11. CTA DOWNLOAD DOSSIER & TEST REPORT */}
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

      {/* 12. THANH SO SÁNH NỔI DƯỚI ĐÁY & POPUP SO SÁNH ĐỐI ĐẦU CHUẨN TGDĐ */}
      <ProductCompareBar
        selectedProducts={selectedCompareProducts}
        selectedThicknesses={compareSelections}
        onRemoveProduct={handleRemoveCompare}
        onClearAll={handleClearCompare}
        onOpenModal={() => {
          if (selectedCompareProducts.length >= 2) {
            setIsCompareModalOpen(true);
          }
        }}
      />

      <ProductCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        products={selectedCompareProducts}
        selectedThicknesses={compareSelections}
        onSelectThickness={(id, th) => handleThicknessChange(id, th)}
        onRemoveProduct={handleRemoveCompare}
        onAddProduct={(id) => handleToggleCompare(id)}
      />

    </div>
  );
}
