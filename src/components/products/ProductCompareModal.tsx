'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  X, 
  CheckCircle2, 
  Flame, 
  Scale, 
  ShieldCheck, 
  PhoneCall, 
  ArrowRight,
  Layers,
  Award,
  Plus,
  ThermometerSnowflake,
  FileCheck
} from 'lucide-react';
import { ProductItem } from '@/types';
import { PRODUCTS, getThicknessData } from '@/data/products';
import { formatNumber } from '@/lib/utils';

interface ProductCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  selectedThicknesses?: Record<string, string>;
  onSelectThickness?: (productId: string, thickness: string) => void;
  onRemoveProduct: (id: string) => void;
  onAddProduct?: (id: string) => void;
}

export default function ProductCompareModal({
  isOpen,
  onClose,
  products,
  selectedThicknesses,
  onSelectThickness,
  onRemoveProduct,
  onAddProduct,
}: ProductCompareModalProps) {
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Khóa cuộn trang nền và lắng nghe phím Escape
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Tự động đóng modal nếu chỉ còn dưới 2 sản phẩm trong bảng so sánh
  useEffect(() => {
    if (isOpen && products.length < 2) {
      onClose();
    }
  }, [isOpen, products.length, onClose]);

  if (!isOpen || products.length < 2) return null;

  // Danh sách sản phẩm còn lại có thể thêm vào bảng so sánh (tối đa 3)
  const availableToAdd = PRODUCTS.filter((p) => !products.some((sp) => sp.id === p.id));
  const canAddMore = products.length < 3 && availableToAdd.length > 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <div 
        ref={modalContentRef}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-7xl xl:max-w-[1380px] max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-modal-title"
      >
        {/* 1. MODAL HEADER */}
        <div className="px-6 py-4.5 sm:px-8 sm:py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7CB305] shadow-[0_0_8px_#7CB305]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A0D911]">
                Bảng Đối Chiếu Kỹ Thuật Đối Đầu
              </span>
            </div>
            <h2 id="compare-modal-title" className="text-lg sm:text-2xl font-extrabold text-white mt-1 leading-snug">
              So Sánh Trực Tiếp Các Dòng Tấm MGO Remak® ({products.length} sản phẩm)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
              Đối chiếu thông số khả năng chịu lửa, độ dày, tải trọng và tỷ trọng phục vụ lập hồ sơ thầu dự án
            </p>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer flex-shrink-0 ml-3"
            aria-label="Đóng bảng so sánh"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. MODAL BODY (RỘNG RÃI, THOÁNG MẮT, HẠN CHẾ XUỐNG DÒNG) */}
        <div className="flex-1 overflow-y-auto overflow-x-auto bg-slate-50">
          <table className="w-full text-left text-xs border-collapse min-w-[950px]">
            
            {/* STICKY HEADER - GHIM CỐ ĐỊNH ẢNH, TÊN, GIÁ KHI CUỘN */}
            <thead className="sticky top-0 z-30 shadow-md">
              <tr className="border-b border-slate-200">
                
                {/* Cột tiêu đề góc trái rộng rãi hơn */}
                <th className="p-4 sm:p-5 w-60 min-w-[240px] bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider align-bottom border-r border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    Tiêu Chí Kỹ Thuật
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal mt-0.5 whitespace-nowrap">
                    Chuẩn IBST & QCVN 06:2022
                  </div>
                </th>

                {/* Các cột sản phẩm rộng 280px-360px */}
                {products.map((prod) => {
                  const currentActiveTh = selectedThicknesses?.[prod.id] || prod.thicknessList[0] || '8mm';
                  const thData = getThicknessData(currentActiveTh, prod);
                  const pricePerM2 = Math.round(thData.price / 2.977);

                  return (
                    <th key={prod.id} className="p-4 sm:p-5 min-w-[280px] bg-white border-r border-slate-200 align-top">
                      {/* Ảnh sản phẩm tràn viền với nút Xóa tinh tế ở góc phải */}
                      <div className="relative h-44 sm:h-48 w-full rounded-2xl overflow-hidden bg-slate-100 mb-3 border border-slate-200/90 group shadow-2xs">
                        <img 
                          src={prod.image} 
                          alt={prod.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent opacity-40 pointer-events-none" />

                        {products.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onRemoveProduct(prod.id)}
                            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-slate-900/70 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer transition-all shadow-md backdrop-blur-xs z-10 hover:scale-110"
                            title="Xóa khỏi bảng so sánh"
                            aria-label={`Xóa ${prod.name}`}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      <div className="font-extrabold text-slate-900 text-sm sm:text-[15px] leading-snug min-h-[2.6rem]" title={prod.name}>
                        {prod.shortName || prod.name}
                      </div>

                      {/* Hộp Giá Bán Trong Sticky Header - Bắt chuẩn theo độ dày đã chọn */}
                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-baseline justify-between gap-2">
                        <div>
                          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                            Giá ({currentActiveTh}):
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-[#F26522]">
                              {formatNumber(thData.price)} đ
                            </span>
                            <span className="text-xs text-slate-400 font-normal"> /tấm</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-[#5F8A03] bg-[#F4F9E8] px-2.5 py-0.5 rounded-md border border-[#5F8A03]/20 whitespace-nowrap">
                          ~{formatNumber(pricePerM2)} đ/m²
                        </span>
                      </div>
                    </th>
                  );
                })}

                {/* Ô trống mời thêm sản phẩm (nếu < 3) */}
                {canAddMore && onAddProduct && (
                  <th className="p-4 w-48 bg-slate-50/80 align-middle text-center border-r border-dashed border-slate-300">
                    <div className="flex flex-col items-center justify-center p-2 text-center">
                      <div className="w-9 h-9 rounded-full bg-white border border-slate-300 text-slate-400 flex items-center justify-center mb-1.5 shadow-xs">
                        <Plus size={16} />
                      </div>
                      <span className="font-bold text-slate-700 text-xs mb-1.5">
                        Thêm sản phẩm so sánh
                      </span>
                      <select
                        aria-label="Chọn thêm sản phẩm so sánh"
                        onChange={(e) => {
                          if (e.target.value) {
                            onAddProduct(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="w-full text-[11px] p-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-700 cursor-pointer shadow-xs focus:ring-2 focus:ring-[#7CB305] focus:outline-hidden"
                        defaultValue=""
                      >
                        <option value="" disabled>+ Chọn tấm MGO...</option>
                        {availableToAdd.map((ap) => (
                          <option key={ap.id} value={ap.id}>
                            {ap.shortName || ap.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </th>
                )}
              </tr>
            </thead>

            {/* BẢNG CÁC DÒNG THÔNG SỐ SO SÁNH (TYPOGRAPHY NÂNG CẤP) */}
            <tbody className="divide-y divide-slate-200/80 bg-white text-slate-700">
              
              {/* 1. Giới hạn chịu lửa (PCCC) */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-bold text-slate-800 bg-slate-50/90 border-r border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FEF3EC] text-[#F26522] flex items-center justify-center flex-shrink-0">
                      <Flame size={15} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Giới hạn chịu lửa (PCCC)</div>
                      <div className="text-[10px] text-slate-500 font-normal">QCVN 06:2022/BXD</div>
                    </div>
                  </div>
                </td>
                {products.map((prod) => {
                  const currentActiveTh = selectedThicknesses?.[prod.id] || prod.thicknessList[0] || '8mm';
                  const currentThData = getThicknessData(currentActiveTh, prod);
                  return (
                    <td key={prod.id} className="p-4 sm:p-5 border-r border-slate-200">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FEF3EC] text-[#F26522] font-black text-xs border border-[#F26522]/20 whitespace-nowrap">
                        <Flame size={13} />
                        <span>{currentThData.fire || prod.fireRating}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1.5 font-medium whitespace-nowrap">
                        Theo độ dày <strong className="text-slate-800">{currentActiveTh}</strong> • Cấp <strong className="text-slate-800">Class A1</strong>
                      </div>
                    </td>
                  );
                })}
                {canAddMore && onAddProduct && <td className="p-4 sm:p-5 border-r border-dashed border-slate-200 bg-slate-50/30" />}
              </tr>

              {/* 2. Dải độ dày sẵn kho - TƯƠNG TÁC CLICK ĐỘ DÀY TRỰC TIẾP */}
              <tr className="hover:bg-slate-50/80 transition-colors bg-slate-50/30">
                <td className="p-4 font-bold text-slate-800 bg-slate-50/90 border-r border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center flex-shrink-0">
                      <Layers size={15} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Dải độ dày sẵn kho</div>
                      <div className="text-[10px] text-slate-500 font-normal">Click chọn để cập nhật giá & PCCC</div>
                    </div>
                  </div>
                </td>
                {products.map((prod) => {
                  const currentActiveTh = selectedThicknesses?.[prod.id] || prod.thicknessList[0] || '8mm';
                  const currentThData = getThicknessData(currentActiveTh, prod);
                  return (
                    <td key={prod.id} className="p-4 border-r border-slate-200">
                      <div className="flex flex-wrap gap-1.5">
                        {prod.thicknessList.map((th) => {
                          const isSelected = th === currentActiveTh;
                          return (
                            <button
                              key={th}
                              type="button"
                              onClick={() => onSelectThickness && onSelectThickness(prod.id, th)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                isSelected
                                  ? 'bg-[#7CB305] text-white border-[#7CB305] shadow-xs scale-105 ring-2 ring-[#7CB305]/30'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                              }`}
                              title={`Chọn độ dày ${th}`}
                            >
                              {th}
                            </button>
                          );
                        })}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-2 font-medium">
                        Đang chọn: <strong className="text-[#5F8A03]">{currentActiveTh}</strong> ({currentThData.weight})
                      </div>
                    </td>
                  );
                })}
                {canAddMore && onAddProduct && <td className="p-4 border-r border-dashed border-slate-200 bg-slate-50/30" />}
              </tr>

              {/* 3. Tỷ trọng tiêu chuẩn */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-bold text-slate-800 bg-slate-50/90 border-r border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Scale size={15} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Tỷ trọng tiêu chuẩn</div>
                      <div className="text-[10px] text-slate-500 font-normal">Khối lượng thể tích</div>
                    </div>
                  </div>
                </td>
                {products.map((prod) => {
                  const currentActiveTh = selectedThicknesses?.[prod.id] || prod.thicknessList[0] || '8mm';
                  const currentThData = getThicknessData(currentActiveTh, prod);
                  return (
                    <td key={prod.id} className="p-4 sm:p-5 border-r border-slate-200">
                      <div className="text-sm font-extrabold text-slate-900 whitespace-nowrap">
                        {prod.density}
                      </div>
                      <div className="text-[11px] text-[#5F8A03] font-semibold mt-0.5 whitespace-nowrap">
                        Tấm {currentActiveTh}: <strong>{currentThData.weight}</strong>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">
                        Nhẹ hơn Cemboard ~30-35%
                      </div>
                    </td>
                  );
                })}
                {canAddMore && onAddProduct && <td className="p-4 sm:p-5 border-r border-dashed border-slate-200 bg-slate-50/30" />}
              </tr>

              {/* 4. Độ bền uốn cực hạn */}
              <tr className="hover:bg-slate-50/80 transition-colors bg-slate-50/30">
                <td className="p-4 sm:p-5 font-bold text-slate-800 bg-slate-50/90 border-r border-slate-200">
                  <div className="font-bold text-slate-900 text-xs whitespace-nowrap">Độ bền uốn cực hạn</div>
                  <div className="text-[10px] text-slate-500 font-normal whitespace-nowrap">Flexural Strength</div>
                </td>
                {products.map((prod) => (
                  <td key={prod.id} className="p-4 sm:p-5 border-r border-slate-200">
                    <div className="text-sm font-extrabold text-slate-900 whitespace-nowrap">
                      {prod.flexuralStrength || '18 – 22 MPa'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 whitespace-nowrap">
                      Cốt lưới sợi thủy tinh chống nứt vỡ
                    </div>
                  </td>
                ))}
                {canAddMore && onAddProduct && <td className="p-4 sm:p-5 border-r border-dashed border-slate-200 bg-slate-50/30" />}
              </tr>

              {/* 5. Khả năng chống rỉ sét & Clorua */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-bold text-slate-800 bg-slate-50/90 border-r border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck size={15} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Chống ăn mòn đinh vít</div>
                      <div className="text-[10px] text-slate-500 font-normal">Hàm lượng muối Clorua</div>
                    </div>
                  </div>
                </td>
                {products.map((prod) => (
                  <td key={prod.id} className="p-4 border-r border-slate-200">
                    {prod.id === 'mgo-mos-sulfate' ? (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700">
                          <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                          <span>100% Zero-Chloride (MOS)</span>
                        </div>
                        <span className="text-[11px] text-emerald-700 mt-1 block leading-relaxed">
                          Công nghệ Magie Oxysulfate cam kết không rỉ sét ốc vít vĩnh viễn
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-slate-900 text-xs">
                          An toàn kim loại chuẩn Remak
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Clorua tự do &lt; 0.05% tiêu chuẩn, an toàn tôn kẽm
                        </div>
                      </div>
                    )}
                  </td>
                ))}
                {canAddMore && onAddProduct && <td className="p-4 border-r border-dashed border-slate-200 bg-slate-50/30" />}
              </tr>

              {/* 6. Hệ số dẫn nhiệt */}
              <tr className="hover:bg-slate-50/80 transition-colors bg-slate-50/30">
                <td className="p-4 sm:p-5 font-bold text-slate-800 bg-slate-50/90 border-r border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <ThermometerSnowflake size={15} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs whitespace-nowrap">Hệ số dẫn nhiệt (k-value)</div>
                      <div className="text-[10px] text-slate-500 font-normal whitespace-nowrap">Khả năng cách nhiệt</div>
                    </div>
                  </div>
                </td>
                {products.map((prod) => (
                  <td key={prod.id} className="p-4 sm:p-5 border-r border-slate-200">
                    <div className="font-extrabold text-slate-900 text-sm whitespace-nowrap">
                      {prod.thermalConductivity || '0.169 W/(m·K)'}
                    </div>
                    <div className="text-[11px] text-[#5F8A03] font-semibold mt-0.5 whitespace-nowrap">
                      Cách nhiệt gấp 5 lần Thạch cao &amp; Cemboard
                    </div>
                  </td>
                ))}
                {canAddMore && onAddProduct && <td className="p-4 sm:p-5 border-r border-dashed border-slate-200 bg-slate-50/30" />}
              </tr>

              {/* 7. Ứng dụng tối ưu */}
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 sm:p-5 font-bold text-slate-800 bg-slate-50/90 border-r border-slate-200">
                  <div className="font-bold text-slate-900 text-xs whitespace-nowrap">Ứng dụng tối ưu nhất</div>
                  <div className="text-[10px] text-slate-500 font-normal whitespace-nowrap">Khuyến nghị kỹ sư PCCC</div>
                </td>
                {products.map((prod) => (
                  <td key={prod.id} className="p-4 sm:p-5 border-r border-slate-200 text-xs text-slate-700 leading-relaxed font-normal">
                    {prod.tagline}
                  </td>
                ))}
                {canAddMore && onAddProduct && <td className="p-4 sm:p-5 border-r border-dashed border-slate-200 bg-slate-50/30" />}
              </tr>

              {/* 8. Tiêu chuẩn kiểm định - CHUẨN FONT BE VIETNAM PRO, COLOR & SIZE ĐỒNG BỘ */}
              <tr className="hover:bg-slate-50/80 transition-colors bg-slate-50/30">
                <td className="p-4 sm:p-5 font-bold text-slate-800 bg-slate-50/90 border-r border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center flex-shrink-0 border border-[#7CB305]/20 shadow-2xs">
                      <Award size={16} />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs sm:text-[13px] whitespace-nowrap">Tiêu chuẩn kiểm định</div>
                      <div className="text-[11px] text-slate-500 font-normal whitespace-nowrap mt-0.5">Hồ sơ pháp lý đệ trình thầu</div>
                    </div>
                  </div>
                </td>
                {products.map((prod) => (
                  <td key={prod.id} className="p-4 sm:p-5 border-r border-slate-200 align-top">
                    <div className="grid grid-cols-2 gap-2">
                      {prod.testedStandards.map((std, sIdx) => {
                        const isSpanFull = prod.testedStandards.length === 3 && sIdx === 2;
                        return (
                          <div 
                            key={sIdx} 
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-[#F4F9E8] border border-slate-200/90 hover:border-[#7CB305]/40 text-slate-800 hover:text-[#5F8A03] text-xs font-semibold shadow-2xs transition-all ${
                              isSpanFull ? 'col-span-2' : 'col-span-1'
                            }`}
                            title={std}
                          >
                            <CheckCircle2 size={13} className="text-[#5F8A03] flex-shrink-0" />
                            <span className="truncate">{std}</span>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                ))}
                {canAddMore && onAddProduct && <td className="p-4 sm:p-5 border-r border-dashed border-slate-200 bg-slate-50/30" />}
              </tr>

              {/* 9. Nút hành động */}
              <tr className="bg-slate-100/60">
                <td className="p-4 sm:p-5 font-bold text-slate-800 bg-slate-100 border-r border-slate-200 align-middle">
                  <div className="font-bold text-slate-900 text-xs whitespace-nowrap">Hành Động Trực Tiếp</div>
                  <div className="text-[10px] text-slate-500 whitespace-nowrap">Xem hồ sơ &amp; báo giá dự án</div>
                </td>
                {products.map((prod) => (
                  <td key={prod.id} className="p-4 sm:p-5 border-r border-slate-200">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link
                        href={`/san-pham/${prod.slug}`}
                        onClick={onClose}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-[#5F8A03] text-white font-bold text-center transition-colors text-xs flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
                      >
                        <span>Xem Chi Tiết</span>
                        <ArrowRight size={13} />
                      </Link>
                      <Link
                        href="/bao-gia"
                        onClick={onClose}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#FEF3EC] hover:bg-[#F26522] text-[#F26522] hover:text-white font-bold text-center transition-colors text-xs flex items-center justify-center gap-1 whitespace-nowrap"
                      >
                        <PhoneCall size={12} />
                        <span>Báo Giá Dự Án</span>
                      </Link>
                    </div>
                  </td>
                ))}
                {canAddMore && onAddProduct && <td className="p-4 sm:p-5 border-r border-dashed border-slate-200 bg-slate-50/30" />}
              </tr>

            </tbody>
          </table>
        </div>

        {/* 3. MODAL FOOTER */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#5F8A03] flex-shrink-0" />
            <span className="font-medium text-slate-600">
              Mọi sản phẩm đều có bản sao kiểm định đốt mẫu thực tế tại Viện IBST và CO/CQ nhà máy Remak.
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              href="/bao-gia"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#F26522] hover:bg-[#D95314] text-white font-extrabold text-xs text-center transition-all shadow-md shadow-[#F26522]/20 flex items-center justify-center gap-1.5"
            >
              <span>Tải Toàn Bộ Báo Giá &amp; Hồ Sơ (PDF)</span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
