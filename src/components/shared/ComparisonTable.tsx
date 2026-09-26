import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { MATERIAL_COMPARISONS } from '@/data/products';
import SectionHeading from '@/components/ui/SectionHeading';

interface ComparisonTableProps {
  id?: string;
  showHeading?: boolean;
}

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

      {/* BẢNG ĐỐI CHUẨN KỸ THUẬT CHI TIẾT */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th scope="col" className="p-5 w-[22%]">Chỉ Tiêu Kỹ Thuật Nghiệm Thu</th>
                <th scope="col" className="p-5 w-[32%] bg-[#7CB305] border-x-2 border-[#5F8A03] text-center relative">
                  <span className="font-extrabold text-sm text-white">Tấm MGO Remak® FireOFF</span>
                </th>
                <th scope="col" className="p-5 w-[23%] text-center text-slate-900">Tấm Cemboard Xi Măng</th>
                <th scope="col" className="p-5 w-[23%] border-l-2 border-[#7CB305] text-center text-slate-900">Tấm Thạch Cao Chống Cháy</th>
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
                  <td className="p-5 border-l-2 border-[#7CB305]/30 text-slate-600 text-xs sm:text-sm">
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
