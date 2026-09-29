import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { MGO_SPECS } from '@/data/products';

const GROUPS = [
  { id: 'duct',  label: 'Ống Gió & PCCC',        color: '#F26522' },
  { id: 'wall',  label: 'Vách Ngăn & Bọc Thép',  color: '#5F8A03' },
  { id: 'floor', label: 'Lót Sàn Chịu Lực',      color: '#475569' },
] as const;

export default function ProductThicknessTable() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mt-3">
          Bảng Thông Số Độ Dày & Quy Cách Chuẩn Thi Công
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Kích thước tấm tiêu chuẩn: 1.220 × 2.440 mm (2,977 m²/tấm) · Tỷ trọng 963 kg/m³
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full text-left border-collapse" style={{ minWidth: 680 }}>

          {/* THEAD */}
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th scope="col" className="bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[110px]">
                Độ dày
              </th>
              <th scope="col" className="bg-[#FEF3EC] px-4 py-4 text-center border-l-2 border-r-2 border-[#F26522]/30 w-[160px]">
                <span className="text-[10px] font-extrabold text-[#F26522] uppercase tracking-wider">Chịu lửa (EI)</span>
              </th>
              <th scope="col" className="bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-l border-slate-200 whitespace-nowrap">
                Trọng lượng
              </th>
              <th scope="col" className="bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-l border-slate-200 whitespace-nowrap">
                Độ bền uốn
              </th>
              <th scope="col" className="bg-slate-50 px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-l border-slate-200">
                Ứng dụng khuyến nghị
              </th>
              <th scope="col" className="bg-slate-50 px-4 py-4 text-center border-l border-slate-200 w-[100px]" />
            </tr>
          </thead>

          <tbody>
            {GROUPS.map(group => {
              const rows = MGO_SPECS.filter(s => s.category === group.id);
              return (
                <React.Fragment key={group.id}>
                  {/* Group header */}
                  <tr className="bg-slate-100 border-y border-slate-200">
                    <td colSpan={6} className="px-4 py-2">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: group.color }} />
                        {group.label}
                      </div>
                    </td>
                  </tr>

                  {/* Data rows */}
                  {rows.map(spec => {
                    const apps = spec.standardApplication.split('•').map(a => a.trim()).filter(Boolean);
                    return (
                      <tr key={spec.thickness} className="group hover:bg-slate-50/80 transition-colors duration-100">
                        {/* Thickness */}
                        <td className="px-4 py-3.5 border-b border-slate-200">
                          <div className="flex items-center gap-2.5">
                            <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: group.color }} />
                            <div>
                              <span className="font-black text-slate-900 text-sm">{spec.thickness}</span>
                              {spec.isPopular && (
                                <div className="text-[9px] font-black text-[#F26522] mt-0.5">BÁN CHẠY</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* EI — highlighted */}
                        <td className="px-4 py-3.5 text-center bg-[#FEF3EC]/40 group-hover:bg-[#FEF3EC] border-l-2 border-r-2 border-b border-b-slate-200 border-[#F26522]/15 transition-colors duration-100">
                          <span className="inline-block bg-[#F26522] text-white text-[11px] font-black px-2.5 py-1 rounded-full whitespace-nowrap">
                            {spec.fireRating}
                          </span>
                        </td>

                        {/* Weight */}
                        <td className="px-4 py-3.5 text-xs font-bold text-slate-800 border-l border-b border-slate-200 whitespace-nowrap">
                          {spec.weightPerSheet}
                        </td>

                        {/* Strength */}
                        <td className="px-4 py-3.5 text-xs font-bold text-[#5F8A03] border-l border-b border-slate-200 whitespace-nowrap">
                          {spec.flexuralStrength || '≥ 18 MPa'}
                        </td>

                        {/* Applications */}
                        <td className="px-4 py-3.5 border-l border-b border-slate-200">
                          <div className="flex flex-wrap gap-1">
                            {apps.slice(0, 2).map((a, j) => (
                              <span key={j} className="text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md leading-snug font-medium">
                                {a}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* CTA */}
                        <td className="px-4 py-3.5 border-l border-b border-slate-200 text-center">
                          <Link
                            href="/bao-gia"
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#5F8A03] hover:bg-[#4A7002] text-white font-bold text-[11px] transition-colors whitespace-nowrap"
                          >
                            Báo giá <ArrowRight size={11} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}

            {/* Verdict row */}
            <tr className="border-t-2 border-slate-300 bg-slate-800">
              <td colSpan={2} className="px-4 py-3.5 text-white text-xs font-black uppercase tracking-wider">
                6 quy cách · 1220 × 2440 mm
              </td>
              <td className="px-4 py-3.5 text-slate-300 text-xs border-l border-slate-700">
                963 kg/m³
              </td>
              <td className="px-4 py-3.5 text-slate-300 text-xs border-l border-slate-700">
                ≥ 18–22 MPa
              </td>
              <td colSpan={2} className="px-4 py-3.5 text-xs border-l border-slate-700">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={13} className="text-[#7CB305]" />
                  <span className="text-[#7CB305] font-bold">Đạt QCVN 06:2022/BXD</span>
                  <span className="text-slate-400">· Kiểm định tại Viện IBST</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="sm:hidden text-[11px] text-center text-slate-400 mt-2">
        ← Vuốt ngang để xem đầy đủ →
      </p>
    </div>
  );
}
