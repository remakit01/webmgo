'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  PhoneCall, 
  CheckCircle2, 
  Info, 
  Weight, 
  Sparkles,
  Layers
} from 'lucide-react';
import { ProductItem } from '@/types';
import { MGO_SPECS } from '@/data/products';

interface ProductQuickInfoProps {
  product: ProductItem;
}

export default function ProductQuickInfo({ product }: ProductQuickInfoProps) {
  const [selectedThickness, setSelectedThickness] = useState<string>(
    product.thicknessList[0] || '8mm'
  );

  // Tìm thông số độ dày tương ứng trong MGO_SPECS để hiển thị thông tin động
  const currentSpec = MGO_SPECS.find((s) => s.thickness === selectedThickness) || {
    thickness: selectedThickness,
    weightPerSheet: 'Đang cập nhật',
    fireRating: product.fireRating,
    standardApplication: product.tagline,
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER INFO */}
      <div>
        <span className="text-xs font-bold text-[#F26522] uppercase tracking-wider">
          {product.tradeMark}
        </span>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-1 leading-snug">
          {product.name}
        </h1>
        <p className="text-sm font-medium text-slate-600 mt-2 leading-relaxed">
          {product.tagline}
        </p>
      </div>

      {/* QUICK SPECS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <div>
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Quy cách chuẩn</div>
          <div className="text-xs font-bold text-slate-900 mt-0.5">{product.dimension}</div>
        </div>
        <div>
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Tỷ trọng danh định</div>
          <div className="text-xs font-bold text-slate-900 mt-0.5">{product.density}</div>
        </div>
        <div>
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Hệ số dẫn nhiệt (k)</div>
          <div className="text-xs font-bold text-slate-900 mt-0.5">{product.thermalConductivity}</div>
        </div>
      </div>

      {/* DYNAMIC THICKNESS SELECTOR (NGƯỜI DÙNG CLICK CHỌN ĐỘ DÀY) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={14} className="text-[#5F8A03]" />
            <span>Chọn độ dày quy chuẩn:</span>
          </span>
          <span className="text-xs font-semibold text-[#5F8A03]">
            {selectedThickness} ({currentSpec.weightPerSheet})
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.thicknessList.map((th) => {
            const isSelected = selectedThickness === th;
            return (
              <button
                key={th}
                type="button"
                onClick={() => setSelectedThickness(th)}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#5F8A03] text-white shadow-md shadow-[#5F8A03]/30 scale-[1.03]'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-[#7CB305]'}`} />
                <span>{th}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Detail for Selected Thickness */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-1 bg-slate-50 p-2.5 rounded-xl">
          <div><strong>Trọng lượng tấm:</strong> {currentSpec.weightPerSheet}</div>
          <div><strong>Khuyến nghị:</strong> {currentSpec.standardApplication}</div>
        </div>
      </div>

      {/* HIGHLIGHT BULLET POINTS */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Đặc điểm kiểm chứng nổi bật:
        </div>
        {product.highlights.map((h, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
            <CheckCircle2 size={15} className="text-[#5F8A03] flex-shrink-0 mt-0.5" />
            <span>{h}</span>
          </div>
        ))}
      </div>

      {/* CTA BUTTONS */}
      <div className="pt-4 flex flex-col sm:flex-row gap-3">
        <Link
          href="/bao-gia"
          className="flex-1 py-3.5 px-6 rounded-xl bg-[#F26522] hover:bg-[#D95314] text-white font-bold text-sm transition-all shadow-md shadow-[#F26522]/30 flex items-center justify-center gap-2"
        >
          <FileText size={16} />
          <span>Yêu Cầu Báo Giá & Hồ Sơ Nghiệm Thu</span>
        </Link>
        <a
          href="tel:0902441981"
          className="py-3.5 px-6 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-sm transition-all shadow-md shadow-[#5F8A03]/30 flex items-center justify-center gap-2"
        >
          <PhoneCall size={16} />
          <span>0902.441.981</span>
        </a>
      </div>

      <div className="text-[11px] text-slate-500 italic flex items-center gap-1.5">
        <Info size={13} className="text-slate-400" />
        <span>Hỗ trợ gửi mẫu vật liệu thực tế tận chân công trình miễn phí toàn quốc.</span>
      </div>

    </div>
  );
}
