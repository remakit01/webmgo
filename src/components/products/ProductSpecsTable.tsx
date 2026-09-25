import React from 'react';

interface ProductSpecsTableProps {
  specsTable: { label: string; value: string }[];
}

export default function ProductSpecsTable({ specsTable }: ProductSpecsTableProps) {
  if (!specsTable || specsTable.length === 0) return null;

  return (
    <div>
      <div className="border-b border-slate-200 pb-3 mb-6">
        <span className="text-xs font-bold text-[#F26522] uppercase tracking-wider bg-[#FEF3EC] px-3 py-1 rounded-full">
          Chỉ Tiêu Cơ Lý
        </span>
        <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mt-2">
          Bảng Thông Số Kỹ Thuật Chi Tiết
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kết quả đo kiểm nghiệm thu mẫu tại phòng thí nghiệm chuyên ngành LAS-XD
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-slate-100">
            {specsTable.map((row, rIdx) => (
              <tr 
                key={rIdx} 
                className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70 hover:bg-[#F4F9E8]/35 transition-colors'}
              >
                <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-700 w-2/5 sm:w-1/3 text-xs sm:text-sm">
                  {row.label}
                </td>
                <td className="py-3.5 px-4 sm:px-6 text-slate-900 font-medium text-xs sm:text-sm">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
