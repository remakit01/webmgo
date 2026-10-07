'use client';
import { CheckCircle2, XCircle, Minus, ArrowRight } from 'lucide-react';
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

      {/* =========================================================================
          1. PHIÊN BẢN MOBILE (< lg): PHƯƠNG ÁN 3 - BẢNG CUỘN NGANG TỐI ƯU HÓA
             (Cột tiêu chí ghim cố định 130px, cuộn ngang mượt mà, ghim bóng đổ rõ ràng)
         ========================================================================= */}
      <div className="block lg:hidden space-y-3.5">

        {/* Mobile scroll hint */}
        <p className="text-[11px] text-center text-slate-400 select-none">
          ← Vuốt ngang để đối chiếu vật liệu →
        </p>

        {/* Khung Bảng Cuộn Ngang Tối Ưu Cho Màn Hình Nhỏ */}
        <div className="bg-white rounded-2xl border-2 border-slate-300 overflow-hidden shadow-sm">
          <div className="overflow-x-auto scroll-smooth scrollbar-thin">
            <table className="w-full text-left border-collapse" style={{ minWidth: 650 }}>

              {/* THEAD MOBILE */}
              <thead>
                <tr className="border-b-2 border-slate-300">
                  {/* Cột 1: Ghim cố định mép trái 130px */}
                  <th
                    scope="col"
                    className="sticky left-0 z-20 bg-slate-100 px-3.5 py-3 w-[130px] min-w-[130px] max-w-[130px] text-xs font-extrabold text-slate-900 uppercase tracking-wider border-r-2 border-slate-300 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.12)] align-middle"
                  >
                    Chỉ tiêu
                  </th>

                  {/* Cột 2: Tấm MGO Remak - Cột tâm điểm màu xanh */}
                  <th
                    scope="col"
                    className="px-3.5 py-3 bg-[#5F8A03] border-r border-[#4E7202] text-center w-[180px] min-w-[180px]"
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-extrabold text-white text-xs">Tấm MGO Remak®</span>
                      <span className="text-[10px] font-bold text-lime-200">Chuẩn A1 IBST</span>
                    </div>
                  </th>

                  {/* Cột 3: Cemboard */}
                  <th
                    scope="col"
                    className="px-3 py-3 bg-slate-50 text-center w-[170px] min-w-[170px] border-r border-slate-300"
                  >
                    <span className="font-bold text-slate-800 text-xs">Cemboard Xi Măng</span>
                  </th>

                  {/* Cột 4: Thạch Cao */}
                  <th
                    scope="col"
                    className="px-3 py-3 bg-slate-50 text-center w-[170px] min-w-[170px]"
                  >
                    <span className="font-bold text-slate-800 text-xs">Thạch Cao Chống Cháy</span>
                  </th>
                </tr>
              </thead>

              {/* TBODY MOBILE */}
              <tbody>
                {MATERIAL_COMPARISONS.map((row) => {
                  const mgo = splitCell(row.mgoRemak);
                  const cem = splitCell(row.cemboard);
                  const gyp = splitCell(row.gypsum);

                  return (
                    <tr key={row.feature} className="border-b border-slate-200">

                      {/* Cột 1 ghim cố định mép trái */}
                      <td className="sticky left-0 z-10 bg-slate-50 px-3.5 py-3 text-xs font-bold text-slate-800 align-top border-r-2 border-slate-300 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.12)] leading-snug">
                        {row.feature}
                      </td>

                      {/* Cột 2: MGO Remak (Nền xanh nhạt, nổi bật vượt trội) */}
                      <td className="px-3.5 py-3 bg-[#F4F9E8] border-r border-slate-300 align-top">
                        <div className="flex items-start gap-1.5">
                          <CheckCircle2 size={15} className="text-[#5F8A03] flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-xs text-slate-900 leading-snug">{mgo.key}</div>
                            {mgo.detail && (
                              <div className="text-[11px] text-slate-600 mt-0.5 leading-snug font-normal">
                                {mgo.detail}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Cột 3: Cemboard */}
                      <td className="px-3 py-3 bg-white align-top border-r border-slate-300">
                        <div className="flex items-start gap-1.5">
                          <Minus size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-xs text-slate-800 leading-snug">{cem.key}</div>
                            {cem.detail && (
                              <div className="text-[11px] text-slate-500 mt-0.5 leading-snug font-normal">
                                {cem.detail}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Cột 4: Thạch Cao */}
                      <td className="px-3 py-3 bg-white align-top">
                        <div className="flex items-start gap-1.5">
                          <XCircle size={15} className="text-rose-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-xs text-slate-700 leading-snug">{gyp.key}</div>
                            {gyp.detail && (
                              <div className="text-[11px] text-slate-500 mt-0.5 leading-snug font-normal">
                                {gyp.detail}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                    </tr>
                  );
                })}

                {/* HÀNG VERDICT KẾT QUẢ MOBILE */}
                <tr className="bg-slate-900 text-white">
                  <td className="sticky left-0 z-10 bg-slate-900 px-3.5 py-3 text-[11px] font-black uppercase tracking-wider text-white border-r-2 border-slate-700 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.25)]">
                    Kết quả
                  </td>
                  <td className="px-3.5 py-3 bg-[#5F8A03] text-center border-r border-[#4E7202]">
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle2 size={14} className="text-white" />
                      <span className="font-black text-white text-xs">7/7 Vượt trội</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center border-r border-slate-800">
                    <div className="flex items-center justify-center gap-1">
                      <Minus size={13} className="text-amber-400" />
                      <span className="text-amber-300 text-[11px] font-bold">0/7 Thua</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <XCircle size={13} className="text-rose-400" />
                      <span className="text-rose-300 text-[11px] font-bold">0/7 Hạn chế</span>
                    </div>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </div>


      {/* =========================================================================
          2. PHIÊN BẢN DESKTOP (>= lg): GIỮ NGUYÊN 100% BẢN GỐC HIỆN TẠI
             (Bảng 4 cột chuẩn mực, sticky header/cột, verdict row, không thay đổi)
         ========================================================================= */}
      <div className="hidden lg:block bg-white rounded-3xl border border-slate-300 overflow-hidden shadow-lg">
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
      </div>
    </section>
  );
}
