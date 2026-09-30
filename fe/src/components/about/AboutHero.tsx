import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import AboutStats from './AboutStats';

export default function AboutHero() {
  return (
    <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 pt-8 pb-12 lg:pt-12 lg:pb-16">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-8">
          <Link href="/" className="hover:text-[#7CB305] transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="font-semibold text-slate-200">Giới Thiệu</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — copy */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Về Remak®
              <span className="block text-[#7CB305]">MGO FireOFF</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 max-w-lg">
              Chuyên gia vật liệu chống cháy vô cơ thế hệ mới — kiểm định IBST thực tế,
              tin dùng tại hơn 200 công trình từ KCN, TTTM đến data center trên toàn quốc.
            </p>

            {/* Stat chips */}
            <AboutStats />
          </div>

          {/* Right — trust panel (desktop) */}
          <div className="hidden lg:block">
            <div className="border border-[#7CB305]/30 bg-[#7CB305]/5 rounded-2xl p-5 space-y-4">
              {[
                'Kiểm định đốt lò thực tế tại Viện IBST — không chỉ trên giấy',
                '100% công thức muối Sulfate (MgSO₄) Zero-Chloride — loại trừ rỉ sét',
                'Nhẹ hơn thạch cao & cemboard 35% — giảm tải trọng hệ trần',
                'Hồ sơ kỹ thuật đầy đủ, đạt nghiệm thu PCCC ngay lần đầu',
              ].map(text => (
                <div key={text} className="flex items-start gap-3">
                  <CheckCircle2 size={15} className="text-[#7CB305] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-200 leading-snug">{text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
