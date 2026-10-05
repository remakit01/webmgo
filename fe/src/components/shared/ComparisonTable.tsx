import { CheckCircle2, XCircle, Minus, ArrowRight } from 'lucide-react';
import Link from '@/components/ui/LocaleLink';
import { MATERIAL_COMPARISONS } from '@/data/products';
import SectionHeading from '@/components/ui/SectionHeading';

interface ComparisonTableProps {
  id?: string;
  showHeading?: boolean;
}

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

      <div className="bg-white rounded-3xl border border-slate-300 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: 640 }}>

            {/* ── THEAD ── */}
            <thead>
              <tr className="border-b-2 border-slate-300">
                <th scope="col" className="sticky left-0 z-20 bg-slate-50 px-5 py-4 w-[200px] text-xl font-bold text-slate-900 uppercase tracking-wider">
                  Chỉ tiêu kỹ thuật
                </th>
                <th scope="col" className="px-5 py-4 bg-[#5F8A03] border-2 border-[#5F8A03] text-center w-[30%]">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="font-extrabold text-white text-sm">Tấm MGO Remak®</span>
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
              {MATERIAL_COMPARISONS.map((row) => {
                const mgo = splitCell(row.mgoRemak);
                const cem = splitCell(row.cemboard);
                const gyp = splitCell(row.gypsum);
                return (
                  <tr
                    key={row.feature}
                    className="group hover:bg-slate-50/80 transition-colors duration-100"
                  >
                    {/* Row label */}
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 px-5 py-4 text-[13px] font-bold text-slate-800 align-top border-r border-b border-slate-300 transition-colors duration-100">
                      {row.feature}
                    </td>

                    {/* MGO — WIN */}
                    <td className="px-5 py-4 bg-[#F4F9E8]/60 group-hover:bg-[#EEF7DB] border-l-2 border-r-2 border-b border-b-slate-300 border-[#5F8A03]/20 align-top transition-colors duration-100">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 size={15} className="text-[#5F8A03] flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[13px] text-slate-900">{mgo.key}</div>
                          {mgo.detail && <div className="text-xs text-slate-600 mt-0.5 leading-snug">{mgo.detail}</div>}
                        </div>
                      </div>
                    </td>

                    {/* Cemboard — PARTIAL */}
                    <td className="px-5 py-4 align-top border-b border-slate-300 transition-colors duration-100">
                      <div className="flex items-start gap-2.5">
                        <Minus size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-[13px] text-slate-800">{cem.key}</div>
                          {cem.detail && <div className="text-xs text-slate-600 mt-0.5 leading-snug">{cem.detail}</div>}
                        </div>
                      </div>
                    </td>

                    {/* Thạch Cao — LOSE */}
                    <td className="px-5 py-4 align-top border-l border-b border-slate-300 transition-colors duration-100">
                      <div className="flex items-start gap-2.5">
                        <XCircle size={15} className="text-rose-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-[13px] text-slate-700">{gyp.key}</div>
                          {gyp.detail && <div className="text-xs text-slate-600 mt-0.5 leading-snug">{gyp.detail}</div>}
                        </div>
                      </div>
                    </td>
                  </tr>
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

        {/* ── CONVERSION BRIDGE DƯỚI BẢNG SO SÁNH ── */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-700">
          <div className="space-y-1.5 text-center md:text-left">
            <h4 className="text-lg sm:text-xl font-black text-white">
              Đang Sử Dụng Thạch Cao Hoặc Cemboard Cho Dự Án?
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Chuyển sang MGO Remak giúp giảm 30% tải trọng, chống nước tuyệt đối, không rỉ sét ốc vít và đạt nghiệm thu PCCC nhanh chóng.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/bao-gia"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#F26522] to-[#EA580C] hover:from-[#EA580C] hover:to-[#D95314] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-600/30 flex items-center gap-2 hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Nhận Báo Giá Tấm MGO Remak®</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
