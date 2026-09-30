'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  Layers, 
  FileSpreadsheet, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  PhoneCall,
  Info,
  RefreshCw,
  Sliders
} from 'lucide-react';

interface BoqOption {
  id: string;
  name: string;
  defaultThickness: string;
  fireRatings: string[];
  mgoLayers: number; // số lớp tấm MGO
  rockwoolThick: string;
  screwsPerSqm: number;
  framingFactor: number; // mét dài xương trên m2
  wasteFactor: number; // % hao hụt
  unitName: string;
}

const BOQ_OPTIONS: BoqOption[] = [
  {
    id: 'duct',
    name: 'Bọc Ống Gió PCCC (Ductwork)',
    defaultThickness: '8mm hoặc 10mm',
    fireRatings: ['EI 30', 'EI 45', 'EI 60', 'EI 90', 'EI 120'],
    mgoLayers: 1,
    rockwoolThick: '50mm (60 - 80kg/m³)',
    screwsPerSqm: 24,
    framingFactor: 2.8,
    wasteFactor: 1.08,
    unitName: 'm² diện tích tôn ống',
  },
  {
    id: 'wall',
    name: 'Vách Ngăn Chống Cháy (Karaoke / Bar / Hành Lang)',
    defaultThickness: '10mm hoặc 12mm',
    fireRatings: ['EI 60', 'EI 90', 'EI 120'],
    mgoLayers: 2, // 2 mặt vách
    rockwoolThick: '50mm (60kg/m³)',
    screwsPerSqm: 40,
    framingFactor: 3.5,
    wasteFactor: 1.06,
    unitName: 'm² diện tích tường vách',
  },
  {
    id: 'floor',
    name: 'Sàn Chịu Lực Nhà Thép / Gác Lửng',
    defaultThickness: '18mm hoặc 20mm',
    fireRatings: ['REI 60', 'REI 120', 'REI 180'],
    mgoLayers: 1,
    rockwoolThick: '50mm lót đáy chống ồn',
    screwsPerSqm: 28,
    framingFactor: 3.2,
    wasteFactor: 1.05,
    unitName: 'm² mặt sàn xây dựng',
  },
  {
    id: 'factory',
    name: 'Vách Ngăn Cháy Kho Xưởng Công Nghiệp',
    defaultThickness: '12mm hoặc 15mm',
    fireRatings: ['EI 90', 'EI 120', 'EI 150'],
    mgoLayers: 2,
    rockwoolThick: '50mm (80 - 100kg/m³)',
    screwsPerSqm: 36,
    framingFactor: 3.8,
    wasteFactor: 1.06,
    unitName: 'm² tường ngăn khoang cháy',
  },
];

const PRESET_AREAS = [50, 100, 200, 500, 1000];

export default function ApplicationBoqCalculator({
  defaultAppId = 'duct',
  compact = false,
}: {
  defaultAppId?: string;
  compact?: boolean;
}) {
  const [selectedAppId, setSelectedAppId] = useState(defaultAppId);
  const [area, setArea] = useState<number>(100);
  const [selectedEi, setSelectedEi] = useState<string>('EI 60');
  const [isCopied, setIsCopied] = useState(false);
  const inputId = useId();

  const currentOption = BOQ_OPTIONS.find((opt) => opt.id === selectedAppId) || BOQ_OPTIONS[0];

  // Tính toán số lượng vật tư
  const sheetArea = 1.22 * 2.44; // 2.977 m2/tấm
  const totalMgoSqm = area * currentOption.mgoLayers * currentOption.wasteFactor;
  const totalMgoSheets = Math.ceil(totalMgoSqm / sheetArea);
  
  // Bông Rockwool (kiện 6 tấm 1.2m x 0.6m = 4.32 m2/kiện)
  const totalRockwoolSqm = Math.ceil(area * 1.05);
  const totalRockwoolPacks = Math.ceil(totalRockwoolSqm / 4.32);

  // Khung xương (mét dài thanh thép C/U hoặc nẹp V)
  const totalFramingMeters = Math.ceil(area * currentOption.framingFactor);

  // Vít Dacromet chống rỉ (hộp 500 con)
  const totalScrews = Math.ceil(area * currentOption.screwsPerSqm);
  const totalScrewBoxes = Math.ceil(totalScrews / 500);

  // Keo chống cháy Remak FireSeal (1 tuýp 310ml bắn ~8m mép mí)
  const totalSealantTubes = Math.ceil((totalMgoSheets * 7) / 8);

  // Xử lý sao chép bảng kê
  const handleCopyBoq = () => {
    const summaryText = `BẢNG DỰ TOÁN BÓC TÁCH VẬT TƯ PCCC REMAK:
Ứng dụng: ${currentOption.name}
Diện tích: ${area} ${currentOption.unitName}
Cấp chịu lửa mục tiêu: ${selectedEi}
1. Tấm MGO Remak® (${currentOption.defaultThickness}): ${totalMgoSheets} tấm (kèm hao hụt ${Math.round((currentOption.wasteFactor - 1) * 100)}%)
2. Bông khoáng Rockwool ${currentOption.rockwoolThick}: ${totalRockwoolSqm} m² (~${totalRockwoolPacks} kiện)
3. Khung xương kẽm định hình: ${totalFramingMeters} mét dài
4. Vít tự khoan Dacromet chống rỉ: ${totalScrews.toLocaleString('vi-VN')} con (~${totalScrewBoxes} hộp 500c)
5. Keo chống cháy Remak® FireSeal (310ml): ${totalSealantTubes} tuýp
* Hotline hỗ trợ kỹ sư Remak: 0902.441.981`;

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <section className={`rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs ${compact ? 'p-5 sm:p-6' : 'p-6 sm:p-10 my-12'}`}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Tính Định Mức Vật Tư Hệ Chống Cháy MGO
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Nhập diện tích để tự động xuất bảng khối lượng tấm MGO, bông Rockwool và phụ kiện đồng bộ
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleCopyBoq}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isCopied ? (
              <>
                <CheckCircle2 size={15} className="text-[#5F8A03]" />
                <span className="text-[#5F8A03]">Đã Sao Chép!</span>
              </>
            ) : (
              <>
                <FileSpreadsheet size={15} className="text-slate-600" />
                <span>Sao Chép Bảng Kê</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Controls (Left) & Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        
        {/* LEFT COLUMN: CONTROLS & INPUTS (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Select Application */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Cấu Kiện Thi Công
            </label>
            <div className="grid grid-cols-1 gap-2">
              {BOQ_OPTIONS.map((opt) => {
                const isSelected = selectedAppId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedAppId(opt.id);
                      setSelectedEi(opt.fireRatings[0]);
                    }}
                    className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#5F8A03] bg-[#F4F9E8] text-[#5F8A03] shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{opt.name}</span>
                    {isSelected && <CheckCircle2 size={16} className="text-[#5F8A03] flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Fire Rating */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Cấp Chịu Lửa (EI)
            </label>
            <div className="flex flex-wrap gap-2">
              {currentOption.fireRatings.map((ei) => (
                <button
                  key={ei}
                  type="button"
                  onClick={() => setSelectedEi(ei)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    selectedEi === ei
                      ? 'bg-[#F26522] text-white border-[#F26522] shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {ei}
                </button>
              ))}
            </div>
          </div>

          {/* Area Slider & Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor={inputId} className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                3. Nhập Khối Lượng Thi Công ({currentOption.unitName})
              </label>
              <div className="flex items-center gap-1">
                <input
                  id={inputId}
                  type="number"
                  min="5"
                  max="10000"
                  value={area || ''}
                  onChange={(e) => setArea(Math.max(0, Number(e.target.value)))}
                  className="w-20 px-2 py-1 text-right font-black text-sm text-[#5F8A03] border border-slate-300 rounded-lg focus:outline-none focus:border-[#5F8A03]"
                />
                <span className="text-xs font-semibold text-slate-500">m²</span>
              </div>
            </div>

            {/* Range Slider */}
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={area || 10}
              onChange={(e) => setArea(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#5F8A03]"
            />

            {/* Quick preset buttons */}
            <div className="flex items-center justify-between gap-1 pt-2">
              {PRESET_AREAS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setArea(preset)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer border transition-colors ${
                    area === preset
                      ? 'bg-[#5F8A03] text-white border-[#5F8A03]'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {preset} m²
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
            <Info size={16} className="text-[#5F8A03] flex-shrink-0 mt-0.5" />
            <span>
              Công thức đã bao gồm <strong>{Math.round((currentOption.wasteFactor - 1) * 100)}% hệ số hao hụt</strong> cắt ghép mí và phụ kiện đồng bộ theo định mức thực tế của nhà thầu Remak.
            </span>
          </div>

        </div>

        {/* RIGHT COLUMN: ITEMIZED BOQ RESULTS (7 COLS) */}
        <div className="lg:col-span-7 bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Kết Quả Bóc Tách Dự Toán Cho:
              </div>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                {area} m² • {currentOption.name} • {selectedEi}
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#FEF3EC] text-[#F26522] font-black text-xs border border-[#F26522]/30">
              Chuẩn QCVN 06
            </span>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* 1. MGO Sheets (Highlighted) */}
            <div className="sm:col-span-2 p-4 rounded-xl bg-white border-2 border-[#7CB305]/60 shadow-xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#5F8A03] uppercase">
                  <Layers size={14} />
                  <span>Tấm Chống Cháy MGO Remak® ({currentOption.defaultThickness})</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Quy cách chuẩn: 1.220 x 2.440 mm ({sheetArea.toFixed(2)} m²/tấm)
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-slate-900">
                  {totalMgoSheets} <span className="text-xs font-bold text-slate-500">tấm</span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  ≈ {totalMgoSqm.toFixed(1)} m²
                </div>
              </div>
            </div>

            {/* 2. Rockwool */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-xs font-bold text-slate-700">
                Bông Khoáng Rockwool
              </div>
              <div className="text-[11px] text-slate-400 mb-2">
                {currentOption.rockwoolThick}
              </div>
              <div className="text-lg font-black text-slate-900">
                {totalRockwoolSqm} <span className="text-xs font-bold text-slate-500">m²</span>
              </div>
              <div className="text-[11px] text-slate-500">
                ≈ {totalRockwoolPacks} kiện (6 tấm/kiện)
              </div>
            </div>

            {/* 3. Framing */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-xs font-bold text-slate-700">
                Khung Xương Thép Kẽm
              </div>
              <div className="text-[11px] text-slate-400 mb-2">
                Hệ xương C/U hoặc nẹp V định hình
              </div>
              <div className="text-lg font-black text-slate-900">
                {totalFramingMeters.toLocaleString('vi-VN')} <span className="text-xs font-bold text-slate-500">mét dài</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Tiêu chuẩn bước xương 400mm
              </div>
            </div>

            {/* 4. Dacromet Screws */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-xs font-bold text-slate-700">
                Vít Tự Khoan Dacromet
              </div>
              <div className="text-[11px] text-slate-400 mb-2">
                Mạ hợp kim nhôm kẽm chống rỉ sét
              </div>
              <div className="text-lg font-black text-slate-900">
                {totalScrews.toLocaleString('vi-VN')} <span className="text-xs font-bold text-slate-500">con</span>
              </div>
              <div className="text-[11px] text-slate-500">
                ≈ {totalScrewBoxes} hộp (500 con/hộp)
              </div>
            </div>

            {/* 5. Fire Sealant */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-xs font-bold text-slate-700">
                Keo Chống Cháy Remak® FireSeal
              </div>
              <div className="text-[11px] text-slate-400 mb-2">
                Trám kín khít giáp mí ngăn khói độc
              </div>
              <div className="text-lg font-black text-slate-900">
                {totalSealantTubes} <span className="text-xs font-bold text-slate-500">tuýp</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Tuýp 310ml tiêu chuẩn
              </div>
            </div>

          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href={`/bao-gia?app=${selectedAppId}&area=${area}&ei=${encodeURIComponent(selectedEi)}&sheets=${totalMgoSheets}`}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#F26522] hover:bg-[#D95314] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-[#F26522]/20 flex items-center justify-center gap-2"
            >
              <span>Nhận Báo Giá Dự Toán Này</span>
              <ArrowRight size={15} />
            </Link>

            <a
              href="tel:0902441981"
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
            >
              <PhoneCall size={15} className="text-[#5F8A03]" />
              <span>Kỹ Sư Dự Toán: 0902.441.981</span>
            </a>
          </div>

        </div>

      </div>

    </section>
  );
}
