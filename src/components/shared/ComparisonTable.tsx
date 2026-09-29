import React from 'react';
import { CheckCircle2, XCircle, Minus } from 'lucide-react';
import { MATERIAL_COMPARISONS } from '@/data/products';
import SectionHeading from '@/components/ui/SectionHeading';

interface ComparisonTableProps {
  id?: string;
  showHeading?: boolean;
}

const GROUPS = [
  { id: 'fire', label: ' Chống Cháy' },
  { id: 'mechanical', label: ' Cơ Học & Trọng Lượng' },
  { id: 'chemical', label: ' Hóa Học & Độ Ẩm' },
  { id: 'compliance', label: ' Kiểm Định PCCC' },
] as const;

function splitCell(text: string): { key: string; detail: string } {
  const idx = text.indexOf(' – ');
  if (idx !== -1) return { key: text.slice(0, idx), detail: text.slice(idx + 3) };
  return { key: text, detail: '' };
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
        <SectionHeading title="So Sánh MGO Với Vật Liệu Khác" />
      )}

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: 640 }}>

            {/* ── THEAD ── */}
            <thead>
              <tr className="border-b-2 border-slate-300">
                <th scope="col" className="sticky left-0 z-20 bg-slate-50 px-5 py-4 w-[200px] text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Chỉ tiêu kỹ thuật
                </th>
                <th scope="col" className="px-5 py-4 bg-[#F4F9E8] border-l-2 border-r-2 border-[#5F8A03]/30 text-center w-[30%]">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="font-extrabold text-[#5F8A03] text-sm">Tấm MGO Remak®</span>

                  </div>
                </th>
                <th scope="col" className="px-5 py-4 bg-slate-50 text-center w-[22%] border-l border-slate-300">
                  <span className="font-bold text-slate-800 text-sm">Cemboard Xi Măng</span>
                </th>
                <th scope="col" className="px-5 py-4 bg-slate-50 text-center w-[22%] border-l border-slate-300">
                  <span className="font-bold text-slate-800 text-sm">Thạch Cao Chống Cháy</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {GROUPS.map(group => {
                const rows = MATERIAL_COMPARISONS.filter(r => r.category === group.id);
                return (
                  <React.Fragment key={group.id}>
                    {/* Group header */}
                    <tr className="bg-slate-100 border-y border-slate-200">
                      <td colSpan={4} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {group.label}
                      </td>
                    </tr>

                    {/* Data rows */}
                    {rows.map((row) => {
                      const mgo = splitCell(row.mgoRemak);
                      const cem = splitCell(row.cemboard);
                      const gyp = splitCell(row.gypsum);
                      return (
                        <tr
                          key={row.feature}
                          className="group hover:bg-slate-50/80 transition-colors duration-100"
                        >
                          {/* Row label */}
                          <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 px-5 py-4 text-xs font-semibold text-slate-700 align-top border-r border-b border-slate-300 transition-colors duration-100">
                            {row.feature}
                          </td>

                          {/* MGO — WIN */}
                          <td className="px-5 py-4 bg-[#F4F9E8]/60 group-hover:bg-[#EEF7DB] border-l-2 border-r-2 border-b border-b-slate-300 border-[#5F8A03]/20 align-top transition-colors duration-100">
                            <div className="flex items-start gap-2.5">
                              <CheckCircle2 size={15} className="text-[#5F8A03] flex-shrink-0 mt-0.5" />
                              <div>
                                <div className="font-bold text-[13px] text-slate-900">{mgo.key}</div>
                                {mgo.detail && <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{mgo.detail}</div>}
                              </div>
                            </div>
                          </td>

                          {/* Cemboard — PARTIAL */}
                          <td className="px-5 py-4 align-top border-b border-slate-300 transition-colors duration-100">
                            <div className="flex items-start gap-2.5">
                              <Minus size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <div className="font-medium text-[13px] text-slate-700">{cem.key}</div>
                                {cem.detail && <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{cem.detail}</div>}
                              </div>
                            </div>
                          </td>

                          {/* Thạch Cao — LOSE */}
                          <td className="px-5 py-4 align-top border-l border-b border-slate-300 transition-colors duration-100">
                            <div className="flex items-start gap-2.5">
                              <XCircle size={15} className="text-rose-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <div className="font-medium text-[13px] text-slate-600">{gyp.key}</div>
                                {gyp.detail && <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{gyp.detail}</div>}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}

              {/* ── VERDICT ROW ── */}
              <tr className="border-t-2 border-slate-300 bg-slate-800">
                <td className="sticky left-0 z-10 bg-slate-800 px-5 py-4 text-xs font-black uppercase tracking-wider text-white">
                  Kết quả
                </td>
                <td className="px-5 py-4 bg-[#5F8A03] text-center border-l-2 border-r-2 border-[#5F8A03]">
                  <div className="flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={16} className="text-white" />
                    <span className="font-black text-white text-sm">7/7 Vượt trội</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Minus size={15} className="text-amber-500" />
                    <span className="text-white text-sm font-medium">0/7 Thua toàn diện</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-center border-l border-slate-300">
                  <div className="flex items-center justify-center gap-1.5">
                    <XCircle size={15} className="text-rose-500" />
                    <span className="text-white text-sm font-medium">0/7 Không đạt</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
