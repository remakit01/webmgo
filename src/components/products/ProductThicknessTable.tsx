import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { MGO_SPECS } from '@/data/products';
import SectionHeading from '@/components/ui/SectionHeading';

export default function ProductThicknessTable() {
  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-8">
      <SectionHeading title="Bảng Thông Số Độ Dày & Quy Cách Chuẩn Thi Công" />
      <div className="bg-white rounded-3xl border border-slate-300 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: 700 }}>

            {/* THEAD */}
            <thead>
              <tr className="border-b-2 border-slate-300">
                <th scope="col" className="sticky left-0 z-20 bg-slate-50 px-5 py-4 w-[140px] text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Độ dày
                </th>
                <th scope="col" className="px-5 py-4 bg-[#FEF3EC] border-l-2 border-r-2 border-[#F26522]/30 text-center w-[160px]">
                  <span className="font-extrabold text-[#F26522] text-sm whitespace-nowrap">Chịu lửa (EI)</span>
                </th>
                <th scope="col" className="px-5 py-4 bg-slate-50 text-sm font-bold text-slate-800 border-l border-slate-300 whitespace-nowrap">
                  Trọng lượng
                </th>
                <th scope="col" className="px-5 py-4 bg-slate-50 text-sm font-bold text-slate-800 border-l border-slate-300 whitespace-nowrap">
                  Độ bền uốn
                </th>
                <th scope="col" className="px-5 py-4 bg-slate-50 text-sm font-bold text-slate-800 border-l border-slate-300">
                  Ứng dụng khuyến nghị
                </th>
                <th scope="col" className="px-5 py-4 bg-slate-50 border-l border-slate-300 w-[110px]" />
              </tr>
            </thead>

            <tbody>
              {MGO_SPECS.map(spec => {
                const apps = spec.standardApplication.split('•').map(a => a.trim()).filter(Boolean);
                return (
                  <tr key={spec.thickness} className="group hover:bg-slate-50/80 transition-colors duration-100">
                    {/* Thickness — sticky first col */}
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 px-5 py-4 align-top border-r border-b border-slate-300 transition-colors duration-100">
                      <div className="font-bold text-[13px] text-slate-900">{spec.thickness}</div>
                    </td>

                    {/* EI — highlighted orange */}
                    <td className="px-5 py-4 bg-[#FEF3EC]/60 group-hover:bg-[#FEF3EC] border-l-2 border-r-2 border-b border-b-slate-300 border-[#F26522]/20 text-center align-top transition-colors duration-100">
                      <span className="inline-block bg-[#F26522] text-white text-[11px] font-black px-2.5 py-1 rounded-full whitespace-nowrap">
                        {spec.fireRating}
                      </span>
                    </td>

                    {/* Weight */}
                    <td className="px-5 py-4 align-top border-l border-b border-slate-300 whitespace-nowrap">
                      <div className="font-semibold text-[13px] text-slate-800">{spec.weightPerSheet}</div>
                    </td>

                    {/* Strength */}
                    <td className="px-5 py-4 align-top border-l border-b border-slate-300 whitespace-nowrap">
                      <div className="font-semibold text-[13px] text-[#5F8A03]">{spec.flexuralStrength || '≥ 18 MPa'}</div>
                    </td>

                    {/* Applications */}
                    <td className="px-5 py-4 border-l border-b border-slate-300 align-top">
                      <div className="flex flex-wrap gap-1">
                        {apps.slice(0, 2).map((a, j) => (
                          <span key={j} className="text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md leading-snug font-medium">
                            {a}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* CTA */}
                    <td className="px-5 py-4 border-l border-b border-slate-300 align-top">
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

              {/* Verdict row */}
              <tr className="border-t-2 border-slate-300 bg-slate-800">
                <td className="sticky left-0 z-10 bg-slate-800 px-5 py-4 text-xs font-black uppercase tracking-wider text-white">
                  6 quy cách
                </td>
                <td className="px-5 py-4 bg-[#F26522] text-center border-l-2 border-r-2 border-[#F26522]">
                  <div className="flex items-center justify-center gap-1.5">
                    <ShieldCheck size={16} className="text-white" />
                    <span className="font-black text-white text-sm">5/5 Đạt</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-300 text-xs border-l border-slate-700">963 kg/m³</td>
                <td className="px-5 py-4 text-slate-300 text-xs border-l border-slate-700">≥ 18–22 MPa</td>
                <td colSpan={2} className="px-5 py-4 border-l border-slate-700">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={13} className="text-[#7CB305]" />
                    <span className="text-[#7CB305] font-bold text-sm">Đạt QCVN 06:2022/BXD</span>
                    <span className="text-slate-400 text-xs">· Kiểm định tại Viện IBST</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p className="sm:hidden text-[11px] text-center text-slate-400 mt-2">
        ← Vuốt ngang để xem đầy đủ →
      </p>
    </section>
  );
}
