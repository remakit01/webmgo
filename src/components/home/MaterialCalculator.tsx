'use client';

import React, { useState } from 'react';
import { Calculator, Phone, ArrowRight } from 'lucide-react';
import { calculateMgoMaterials } from '@/lib/calculator';
import { formatNumber } from '@/lib/utils';
import SectionHeading from '@/components/ui/SectionHeading';

export default function MaterialCalculator() {
  const [area, setArea] = useState<number>(50);
  const [selectedThickness, setSelectedThickness] = useState<number>(10);
  const [applicationType, setApplicationType] = useState<string>('duct');

  const result = calculateMgoMaterials(area, selectedThickness);

  return (
    <section id="du-toan" className="max-w-[1440px] mx-auto px-4 lg:px-8">
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl">
        <SectionHeading 
          badge="BÓC TÁCH KHỐI LƯỢNG"
          badgeColor="green"
          title="Dự Toán Vật Tư Online"
        />

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
                  2. Diện tích thi công:
                </label>
                <span className="text-lg font-bold text-[#F26522]">{area} m²</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="500" 
                step="5"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="w-full accent-[#7CB305] cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>5 m²</span>
                <span>100 m²</span>
                <span>250 m²</span>
                <span>500 m²</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">
                3. Độ dày tấm (mm):
              </label>
              <div className="grid grid-cols-6 gap-2">
                {[5, 8, 10, 12, 15, 18].map((th) => (
                  <button
                    key={th}
                    type="button"
                    onClick={() => setSelectedThickness(th)}
                    className={`py-2 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                      selectedThickness === th 
                        ? 'border-[#F26522] bg-[#FEF3EC] text-[#F26522]' 
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
          <div className="lg:col-span-6 bg-slate-900 text-white p-6 sm:p-8 rounded-2xl flex flex-col justify-between shadow-xl">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-4 flex items-center justify-between">
                <span>BÓC TÁCH KHỐI LƯỢNG ƯỚC TÍNH</span>
                <span className="text-[#7CB305] bg-[#7CB305]/10 px-2 py-0.5 rounded text-xs font-semibold">+5% Hao Hụt</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-800">
                <div className="bg-slate-800/60 p-4 rounded-xl">
                  <div className="text-xs text-slate-400">Số tấm cần dùng</div>
                  <div className="text-3xl font-bold text-[#7CB305] mt-1">{result.totalSheets} <span className="text-sm font-normal text-white">tấm</span></div>
                  <div className="text-xs text-slate-400 mt-0.5">Kích thước 1.22 x 2.44m</div>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl">
                  <div className="text-xs text-slate-400">Tổng trọng lượng</div>
                  <div className="text-3xl font-bold text-[#F26522] mt-1">{formatNumber(result.estWeightKg)} <span className="text-sm font-normal text-white">kg</span></div>
                  <div className="text-xs text-slate-400 mt-0.5">Để tính tải trọng xe</div>
                </div>
              </div>

              <div className="space-y-3 pt-6 text-xs text-slate-300">
                <div className="flex justify-between items-center">
                  <span>Vít tự khoan chống rỉ:</span>
                  <span className="font-bold text-white text-sm">~{formatNumber(result.estScrews)} con</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Băng lưới sợi thủy tinh:</span>
                  <span className="font-bold text-white text-sm">~{result.estTapeRolls} cuộn (50m)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tiêu chuẩn chịu lửa:</span>
                  <span className="font-bold text-[#7CB305] text-sm">
                    {selectedThickness >= 12 ? 'EI 120' : selectedThickness >= 8 ? 'EI 60 - EI 90' : 'EI 15 - EI 30'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800 space-y-3">
              <a 
                href="#mau-thu"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F26522] to-[#EA580C] text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-500/30 transition-all cursor-pointer"
              >
                <span>Nhận Báo Giá Theo Dự Toán Này</span>
                <ArrowRight size={16} />
              </a>

              <a 
                href="tel:0902441981"
                className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Phone size={14} className="text-[#7CB305]" />
                <span>Hotline kỹ thuật: 0902.441.981</span>
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
