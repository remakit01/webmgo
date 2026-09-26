import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';

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
    <section className="py-12 sm:py-16 bg-white border-t border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">

        <SectionHeading
          title="So Sánh Đối Đầu: MGO Remak®"
          titleHighlight="vs Vật Liệu Khác"
        />

        {/* BẢNG ĐỐI CHUẨN KỸ THUẬT CHI TIẾT */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th scope="col" className="p-5 w-[22%]">Tiêu Chí So Sánh</th>
                  <th scope="col" className="p-5 w-[32%] bg-[#7CB305] border-x-2 border-[#5F8A03] text-center relative">
                    <span className="font-extrabold text-sm text-white">Tấm MGO Remak® FireOFF</span>
                  </th>
                  <th scope="col" className="p-5 w-[23%] text-center text-slate-900">Thạch Cao Chống Cháy</th>
                  <th scope="col" className="p-5 w-[23%] border-l-2 border-[#7CB305] text-center text-slate-900">Tấm Xi Măng (Cemboard)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {COMPARISON_CRITERIA.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    {/* Tiêu chí */}
                    <td className="p-5 font-bold text-slate-900 bg-slate-50/40 text-xs sm:text-sm">
                      {row.feature}
                    </td>

                    {/* Remak MGO (Winning Column) */}
                    <td className="p-5 bg-[#F4F9E8]/40 border-x-2 border-[#7CB305]/30 font-semibold text-slate-900 text-xs sm:text-sm">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 size={18} className="text-[#7CB305] flex-shrink-0 mt-0.5" />
                        <span>{row.mgo}</span>
                      </div>
                    </td>

                    {/* Thạch cao */}
                    <td className="p-5 text-slate-600 text-xs sm:text-sm">
                      <div className="flex items-start gap-2">
                        <XCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
                        <span>{row.gypsum}</span>
                      </div>
                    </td>

                    {/* Cemboard */}
                    <td className="p-5 border-l-2 border-[#7CB305]/30 text-slate-600 text-xs sm:text-sm">
                      <div className="flex items-start gap-2">
                        <XCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>{row.cemboard}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


      </div>
    </section>
  );
}
