'use client';

import React, { useState } from 'react';
import { 
  Scale, 
  Save, 
  CheckCircle2, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import Header from '@/components/layout/Header';

interface ComparisonRow {
  feature: string;
  mgoRemak: string;
  cemboard: string;
  gypsum: string;
}

const DEFAULT_ROWS: ComparisonRow[] = [
  {
    feature: 'Cấp chống cháy (ISO 1182 & QCVN 06)',
    mgoRemak: 'Nhóm A1 – Không cháy, chịu nhiệt 1.200°C',
    cemboard: 'Nhóm A2/B – Dễ nứt vỡ khi tiếp xúc lửa',
    gypsum: 'Cháy sém – Rã vôi bột sau 30–45 phút tiếp lửa',
  },
  {
    feature: 'Hệ số dẫn nhiệt k (cách nhiệt)',
    mgoRemak: '0.169 W/(m·K) – Cách nhiệt gấp 5 lần Cemboard',
    cemboard: '0.85 W/(m·K) – Truyền nhiệt nhanh qua mặt sau',
    gypsum: '0.25 W/(m·K) – Cách nhiệt trung bình',
  },
  {
    feature: 'Trọng lượng riêng (tỷ trọng)',
    mgoRemak: '963 kg/m³ – Nhẹ hơn Cemboard 30–35%',
    cemboard: '1.400 kg/m³ – Nặng, dễ gây võng dầm khung',
    gypsum: '800 kg/m³ – Nhẹ nhưng giòn, chịu uốn kém',
  },
  {
    feature: 'Độ bền uốn chịu lực (Flexural Strength)',
    mgoRemak: 'Khô 18 MPa – Ẩm đạt 22 MPa (càng ẩm càng chắc)',
    cemboard: '12–14 MPa – Giòn gãy khi chấn động mạnh',
    gypsum: '4–6 MPa – Rất yếu, dễ gãy vụn',
  },
  {
    feature: 'Gốc hóa học & ăn mòn ốc vít',
    mgoRemak: 'Gốc Sulfate (MgSO₄) – 0% rỉ sét ốc vít',
    cemboard: 'Gốc xi măng kiềm cao – Sinh bụi silica độc hại',
    gypsum: 'Hút ẩm – Làm rỉ ty treo và ố vàng bề mặt',
  },
  {
    feature: 'Đổ mồ hôi mùa nồm ẩm',
    mgoRemak: 'Tuyệt đối không chảy nước – Giãn nở ẩm ≤0.05%',
    cemboard: 'Ngậm nước lâu ngày – Gây ẩm mốc và võng trần',
    gypsum: 'Mềm nhũn – Biến dạng khi ngấm ẩm kéo dài',
  },
  {
    feature: 'Hồ sơ kiểm định QCVN 06',
    mgoRemak: 'IBST đầy đủ – Biên bản thử nghiệm EI 30–180',
    cemboard: 'Thiếu đồng bộ – Ít hệ ống gió đạt kiểm định',
    gypsum: 'Bọc nhiều lớp – Gây quá tải trọng ống gió',
  },
];

export default function ComparisonsManagerPage() {
  const [rows, setRows] = useState<ComparisonRow[]>(DEFAULT_ROWS);
  const [isSaved, setIsSaved] = useState(false);

  const handleCellChange = (index: number, field: keyof ComparisonRow, value: string) => {
    setRows(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
    setIsSaved(false);
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header 
        title="Cấu Hình Bảng So Sánh Vật Liệu (Đối Chuẩn Kỹ Thuật)" 
        subtitle="Chỉnh sửa nội dung đối đầu trực tiếp giữa Tấm MGO Remak®, Cemboard và Thạch cao." 
      />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#F4F9E8] text-[#5F8A03]">
              <Scale size={18} />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">Bảng So Sánh MGO Với Vật Liệu Khác</h2>
              <p className="text-xs text-slate-500">Được đồng bộ hiển thị tại Trang Chủ, Trang Sản Phẩm và Trang Ứng Dụng</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isSaved && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5F8A03] bg-[#F4F9E8] px-3 py-1.5 rounded-xl border border-[#7CB305]/30 animate-in fade-in duration-200">
                <CheckCircle2 size={15} />
                <span>Đã lưu thành công!</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Save size={15} />
              <span>Lưu Cấu Hình Bảng</span>
            </button>
          </div>
        </div>

        {/* COMPARISON EDIT TABLE */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th className="p-4 pl-6 bg-slate-50 w-[240px] text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Tiêu Chí Kỹ Thuật
                  </th>
                  <th className="p-4 bg-[#5F8A03] border-2 border-[#5F8A03] text-center w-[30%]">
                    <span className="font-extrabold text-white text-sm">Tấm MGO Remak® (Ưu Thế)</span>
                  </th>
                  <th className="p-4 bg-slate-50 text-center w-[23%] border-l border-slate-300 font-bold text-slate-800 text-sm">
                    Cemboard Xi Măng
                  </th>
                  <th className="p-4 bg-slate-50 text-center w-[23%] border-l border-slate-300 font-bold text-slate-800 text-sm">
                    Thạch Cao Chống Cháy
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 align-top">
                      <input
                        type="text"
                        value={row.feature}
                        onChange={(e) => handleCellChange(idx, 'feature', e.target.value)}
                        className="w-full font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-[#5F8A03] focus:outline-none py-1"
                      />
                    </td>
                    <td className="p-4 bg-[#F4F9E8]/50 border-l-2 border-r-2 border-[#5F8A03]/30 align-top">
                      <textarea
                        rows={2}
                        value={row.mgoRemak}
                        onChange={(e) => handleCellChange(idx, 'mgoRemak', e.target.value)}
                        className="w-full font-semibold text-slate-900 bg-transparent border border-slate-200 focus:border-[#5F8A03] rounded-lg p-2 focus:outline-none text-xs leading-relaxed"
                      />
                    </td>
                    <td className="p-4 align-top">
                      <textarea
                        rows={2}
                        value={row.cemboard}
                        onChange={(e) => handleCellChange(idx, 'cemboard', e.target.value)}
                        className="w-full text-slate-700 bg-transparent border border-slate-200 focus:border-[#5F8A03] rounded-lg p-2 focus:outline-none text-xs leading-relaxed"
                      />
                    </td>
                    <td className="p-4 border-l border-slate-200 align-top">
                      <textarea
                        rows={2}
                        value={row.gypsum}
                        onChange={(e) => handleCellChange(idx, 'gypsum', e.target.value)}
                        className="w-full text-slate-700 bg-transparent border border-slate-200 focus:border-[#5F8A03] rounded-lg p-2 focus:outline-none text-xs leading-relaxed"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
