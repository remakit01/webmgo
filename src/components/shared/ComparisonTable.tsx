import React from 'react';
import { CheckCircle2, XCircle, ShieldCheck, Flame, Scale, Droplet } from 'lucide-react';
import { MATERIAL_COMPARISONS } from '@/data/products';
import SectionHeading from '@/components/ui/SectionHeading';

interface ComparisonTableProps {
  id?: string;
  showHeading?: boolean;
}

const SUMMARY_METRICS = [
  {
    icon: Scale,
    title: 'Nhẹ hơn 35%',
    color: 'green',
  },
  {
    icon: Flame,
    title: 'Cách nhiệt x5',
    color: 'orange',
  },
  {
    icon: Droplet,
    title: 'Không rỉ sét',
    color: 'green',
  },
  {
    icon: ShieldCheck,
    title: 'Chuẩn QCVN 06',
    color: 'orange',
  },
];

export default function ComparisonTable({
  id = 'so-sanh-vat-lieu',
  showHeading = true,
}: ComparisonTableProps) {
  return (
    <section 
      id={id}
      aria-label="So Sánh Tấm MGO Với Vật Liệu Truyền Thống"
      className="max-w-[1440px] mx-auto px-4 lg:px-8"
    >
      {showHeading && (
        <SectionHeading 
          title="So Sánh MGO Với Vật Liệu Khác"
        />
      )}

      {/* 4 THẺ TÓM TẮT GIÁ TRỊ VƯỢT TRỘI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {SUMMARY_METRICS.map((metric, mIdx) => {
          const Icon = metric.icon;
          const isOrange = metric.color === 'orange';
          return (
            <div 
              key={mIdx}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isOrange ? 'bg-[#FEF3EC] text-[#F26522]' : 'bg-[#F4F9E8] text-[#5F8A03]'
              }`}>
                <Icon size={20} />
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-900">
                {metric.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* BẢNG ĐỐI CHUẨN KỸ THUẬT CHI TIẾT */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="p-5 w-[28%]">Chỉ Tiêu Kỹ Thuật Nghiệm Thu</th>
                <th className="p-5 w-[36%] bg-[#F4F9E8] text-[#5F8A03] border-x-2 border-[#7CB305] relative">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#7CB305] animate-pulse"></span>
                      <span className="font-extrabold text-sm text-[#3E5C02]">Tấm MGO Remak® FireOFF</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#7CB305] text-white text-[10px] font-black tracking-wider uppercase">
                      Lựa Chọn Số 1 PCCC
                    </span>
                  </div>
                </th>
                <th className="p-5 w-[18%]">Tấm Cemboard Xi Măng</th>
                <th className="p-5 w-[18%]">Tấm Thạch Cao Chống Cháy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {MATERIAL_COMPARISONS.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-5 font-bold text-slate-900 bg-slate-50/40 text-xs sm:text-sm">
                    {row.feature}
                  </td>
                  <td className="p-5 bg-[#F4F9E8]/40 border-x-2 border-[#7CB305]/30 font-semibold text-slate-900 text-xs sm:text-sm">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={18} className="text-[#7CB305] flex-shrink-0 mt-0.5" />
                      <span>{row.mgoRemak}</span>
                    </div>
                  </td>
                  <td className="p-5 text-slate-600 text-xs sm:text-sm">
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0"></span>
                      <span>{row.cemboard}</span>
                    </div>
                  </td>
                  <td className="p-5 text-slate-600 text-xs sm:text-sm">
                    <div className="flex items-start gap-2">
                      <XCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
                      <span>{row.gypsum}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
