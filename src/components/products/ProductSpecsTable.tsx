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
        <h2 className="text-2xl font-bold text-slate-900 mt-2">
          Bảng Thông Số Kỹ Thuật Chi Tiết
        </h2>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <tbody className="divide-y divide-slate-100">
            {specsTable.map((row, rIdx) => (
              <tr 
                key={rIdx} 
                className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60 hover:bg-[#F4F9E8]/30 transition-colors'}
              >
                <td className="py-3.5 px-5 font-bold text-slate-700 w-1/3">
                  {row.label}
                </td>
                <td className="py-3.5 px-5 text-slate-900 font-medium">
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
