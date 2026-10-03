import Link from '@/components/ui/LocaleLink';
import { Shield, FileCheck2, FileCode2, BookOpen } from 'lucide-react';
import TechLibraryStats from './TechLibraryStats';

const CERT_AUTHORITIES = [
  { name: 'IBST', sub: 'Viện KHCN Xây dựng', color: 'border-[#7CB305] bg-[#F4F9E8]/10 text-[#7CB305]' },
  { name: 'ISO 1182', sub: 'Không cháy lan', color: 'border-amber-400 bg-amber-400/10 text-amber-300' },
  { name: 'QUATEST 3', sub: 'Trung tâm 3', color: 'border-orange-400 bg-orange-400/10 text-orange-300' },
  { name: 'BXD', sub: 'Bộ Xây Dựng', color: 'border-rose-400 bg-rose-400/10 text-rose-300' },
];

export default function TechLibraryHero() {
  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 pt-8 pb-12 lg:pt-12 lg:pb-16">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-8">
          <Link href="/" className="hover:text-[#7CB305] transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="font-semibold text-slate-200">Thư Viện Tài Liệu</span>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — Copy */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Thư Viện Tài Liệu
              <span className="block text-[#7CB305]">Kỹ Thuật & Kiểm Định</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 max-w-lg">
              Hồ sơ IBST · Bản vẽ CAD · Chứng chỉ quốc tế — đầy đủ, có công chứng, miễn phí tải xuống
            </p>

            {/* Animated stats */}
            <TechLibraryStats />
          </div>

          {/* Right — Cert authority grid */}
          <div className="hidden lg:block">
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-4">
              Kiểm định & công nhận bởi
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CERT_AUTHORITIES.map(cert => (
                <div
                  key={cert.name}
                  className={`flex flex-col gap-1.5 p-4 rounded-2xl border ${cert.color} backdrop-blur-sm`}
                >
                  <Shield size={18} className="opacity-80" />
                  <span className="text-base font-black leading-none">{cert.name}</span>
                  <span className="text-[10px] opacity-70 font-medium leading-snug">{cert.sub}</span>
                </div>
              ))}
            </div>

            {/* Doc type preview strip */}
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              {[
                { icon: FileCode2, label: 'CAD / DWG', color: 'text-blue-400' },
                { icon: FileCheck2, label: 'Biên Bản IBST', color: 'text-[#7CB305]' },
                { icon: Shield, label: 'Chứng Chỉ', color: 'text-amber-400' },
                { icon: BookOpen, label: 'Hướng Dẫn', color: 'text-purple-400' },
              ].map(({ icon: Icon, label, color }) => (
                <span key={label} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-300">
                  <Icon size={12} className={color} />
                  {label}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Mobile: cert badges strip */}
        <div className="flex flex-wrap items-center gap-2 mt-8 lg:hidden">
          <span className="text-[10px] text-slate-500 font-medium">Kiểm định bởi:</span>
          {CERT_AUTHORITIES.map(cert => (
            <span key={cert.name} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${cert.color}`}>
              <Shield size={10} />
              {cert.name}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
