'use client';

import React, { useState } from 'react';
import { Calculator, Phone, ArrowRight } from 'lucide-react';
import { calculateMgoMaterials } from '@/lib/calculator';
import { formatNumber } from '@/lib/utils';
import SectionHeading from '@/components/ui/SectionHeading';

interface MaterialCalculatorProps {
  id?: string;
  showHeading?: boolean;
}

export default function MaterialCalculator({
  id = 'du-toan',
  showHeading = true,
}: MaterialCalculatorProps) {
  const [area, setArea] = useState<number>(50);
  const [selectedThickness, setSelectedThickness] = useState<number>(10);
  const [applicationType, setApplicationType] = useState<string>('duct');

  const result = calculateMgoMaterials(area, selectedThickness);

  return (
    <section id={id} className="max-w-[1440px] mx-auto px-4 lg:px-8">
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl">
        {showHeading && (
          <SectionHeading 
            title="Dự Toán Vật Tư Online"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Cột nhập thông số (Trái) */}
          <div className="lg:col-span-6 space-y-6 bg-white p-6 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                1. Ứng dụng thi công:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'duct', label: 'Bọc ống gió PCCC' },
                  { id: 'wall', label: 'Vách ngăn chống cháy' },
                  { id: 'floor', label: 'Lót sàn chịu lực' },
                  { id: 'door', label: 'Lõi cửa chống cháy' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setApplicationType(item.id);
                      if (item.id === 'floor') setSelectedThickness(18);
                      else if (item.id === 'door') setSelectedThickness(5);
                      else setSelectedThickness(10);
                    }}
                    className={`p-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      applicationType === item.id 
                        ? 'border-[#7CB305] bg-[#F4F9E8] text-[#5F8A03]' 
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-slate-800">
                  2. Diện tích cần thi công:
                </label>
                <span className="text-lg font-black text-[#5F8A03] bg-[#F4F9E8] px-3 py-1 rounded-lg">
                  {area} m²
                </span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="500" 
                step="5"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#7CB305]"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
                <span>5 m²</span>
                <span>250 m²</span>
                <span>500 m²</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                3. Độ dày tấm MGO đề xuất:
              </label>
              <div className="flex flex-wrap gap-2">
                {[5, 8, 10, 12, 15, 18].map((th) => (
                  <button
                    key={th}
                    type="button"
                    onClick={() => setSelectedThickness(th)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedThickness === th
                        ? 'bg-[#F26522] text-white border-[#F26522] shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {th}mm
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cột kết quả bóc tách (Phải) */}
          <div className="lg:col-span-6 bg-slate-900 text-white p-6 sm:p-8 rounded-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#7CB305]/20 text-[#7CB305] flex items-center justify-center">
                <Calculator size={22} />
              </div>
              <div>
                <h4 className="font-bold text-base">Bảng Dự Toán Vật Tư Tạm Tính</h4>
                <p className="text-xs text-slate-400">Đã cộng 5% hao hụt thi công tiêu chuẩn</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                <span className="text-slate-300">Tấm MGO ({selectedThickness}mm, 1.22x2.44m):</span>
                <span className="font-bold text-white text-base">{result.sheets} tấm</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                <span className="text-slate-300">Khung xương thép mạ kẽm:</span>
                <span className="font-bold text-white text-base">{result.frames} cây</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                <span className="text-slate-300">Vít tự khoan mạ chống rỉ:</span>
                <span className="font-bold text-white text-base">{result.screws} con</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                <span className="text-slate-300">Keo chống cháy nở phồng:</span>
                <span className="font-bold text-white text-base">{result.sealantTubes} tuýp</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/80">
                <span className="text-slate-300">Lưới thủy tinh chống nứt mối nối:</span>
                <span className="font-bold text-white text-base">{result.meshRolls} cuộn</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-end mb-4 bg-slate-800/50 p-4 rounded-xl">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Tổng kinh phí vật tư ước tính:</div>
                  <div className="text-2xl sm:text-3xl font-black text-[#7CB305]">
                    ~ {formatNumber(result.estimatedCost)} đ
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 italic">(Chưa gồm VAT & cước xe)</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href="tel:0902441981" 
                  className="flex-1 py-3 px-4 rounded-xl bg-[#F26522] hover:bg-[#D95314] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <Phone size={15} />
                  <span>Nhận Báo Giá Đóng Dấu Đỏ</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
