'use client';

import React from 'react';
import { Check, X, ShieldAlert, Sparkles, Award } from 'lucide-react';

const COMPARISON_CRITERIA = [
  {
    feature: 'Chịu Nhiệt & Chống Cháy',
    mgo: '1.200°C – Class A1 (EI 30 – EI 180)',
    gypsum: '~600°C (Mất nước sau 45 phút)',
    cemboard: '~800°C (Dễ nổ vỡ khi sốc nhiệt)',
  },
  {
    feature: 'Kháng Ẩm & Nước Đọng',
    mgo: 'Kháng nước 100%, không mục nát',
    gypsum: 'Hút ẩm mạnh, dễ ố mủn',
    cemboard: 'Ngậm nước, tăng tải trọng trần',
  },
  {
    feature: 'Ăn Mòn Tôn Kẽm & Ty Treo',
    mgo: '0% Chloride – Triệt tiêu rỉ sét',
    gypsum: 'Toát ẩm axit làm rỉ ốc vít',
    cemboard: 'Tính kiềm cao gây oxy hóa',
  },
  {
    feature: 'Trọng Lượng Hệ Thống',
    mgo: 'Tối ưu – Nhẹ hơn thạch cao 35%',
    gypsum: 'Nặng nề, dễ võng ống gió',
    cemboard: 'Rất nặng (1.300 kg/m³)',
  },
  {
    feature: 'Gia Công & Bắn Vít',
    mgo: 'Bắn vít tự khoan, dễ cắt rọc',
    gypsum: 'Dễ sứt mẻ mép góc tấm',
    cemboard: 'Bắt buộc khoan mồi, bụi cứng',
  },
  {
    feature: 'Khói Độc & An Toàn',
    mgo: '0% Khói độc, 0% Amiăng, 0% Formaldehyde',
    gypsum: 'Khói đen từ lớp giấy bọc ngoài',
    cemboard: 'Chứa tinh thể bụi Silica',
  },
];

export default function ApplicationComparisonTable() {
  return (
    <section className="py-12 bg-white border-t border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            So Sánh Đối Đầu: MGO Remak® vs Vật Liệu Khác
          </h2>
        </div>

        {/* Responsive Comparison Table */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 px-5 bg-slate-100 text-slate-800 font-bold uppercase text-xs w-1/4">
                    Tiêu Chí So Sánh
                  </th>
                  <th className="py-4 px-5 bg-[#F4F9E8] text-[#5F8A03] font-extrabold uppercase text-xs w-1/3 border-x-2 border-[#7CB305]">
                    <div className="flex items-center gap-1.5">
                      <Award size={16} className="text-[#5F8A03]" />
                      <span>Tấm MGO Remak® FireOFF (Tối Ưu)</span>
                    </div>
                  </th>
                  <th className="py-4 px-4 bg-slate-50 text-slate-700 font-bold uppercase text-xs w-1/5">
                    Thạch Cao Chống Cháy
                  </th>
                  <th className="py-4 px-4 bg-slate-50 text-slate-700 font-bold uppercase text-xs w-1/5">
                    Tấm Xi Măng (Cemboard)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMPARISON_CRITERIA.map((row, idx) => (
                  <tr 
                    key={idx}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50 hover:bg-[#F4F9E8]/30 transition-colors'}
                  >
                    {/* Tiêu chí */}
                    <td className="py-4 px-5 font-bold text-slate-900">
                      {row.feature}
                    </td>

                    {/* Remak MGO (Winning Column) */}
                    <td className="py-4 px-5 bg-[#F4F9E8]/40 border-x-2 border-[#7CB305]/40 text-slate-900 font-semibold">
                      <div className="flex items-start gap-2">
                        <Check size={16} className="text-[#5F8A03] flex-shrink-0 mt-0.5" />
                        <span>{row.mgo}</span>
                      </div>
                    </td>

                    {/* Thạch cao */}
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      <div className="flex items-start gap-2">
                        <X size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <span>{row.gypsum}</span>
                      </div>
                    </td>

                    {/* Cemboard */}
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      <div className="flex items-start gap-2">
                        <X size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>{row.cemboard}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footnote highlight */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>* Dữ liệu đối chiếu dựa trên kết quả đo kiểm vật lý tại phòng thí nghiệm LAS-XD và thử nghiệm đốt lò thực tế Viện IBST.</span>
          <span className="font-bold text-[#5F8A03]">Remak cam kết đền bù nếu sản phẩm ăn mòn kim loại</span>
        </div>

      </div>
    </section>
  );
}
