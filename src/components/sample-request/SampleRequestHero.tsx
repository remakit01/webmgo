import Link from 'next/link';
import { Package, FileText, Flame, BadgeDollarSign, CheckCircle2 } from 'lucide-react';
import SampleRequestStats from './SampleRequestStats';

const WHAT_YOU_GET = [
  { icon: Package,          text: 'Tấm MGO FireOFF 300×300mm thực tế' },
  { icon: FileText,         text: 'TDS kỹ thuật đầy đủ thông số' },
  { icon: Flame,            text: 'Biên bản thử nghiệm IBST kèm theo' },
  { icon: BadgeDollarSign,  text: 'Báo giá ưu đãi riêng sau khi nhận mẫu' },
];

export default function SampleRequestHero() {
  return (
    <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 pt-8 pb-12 lg:pt-12 lg:pb-16">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-8">
          <Link href="/" className="hover:text-[#F26522] transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="font-semibold text-slate-200">Nhận Mẫu Thử</span>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — Copy */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Nhận Mẫu Thử
              <span className="block text-[#F26522]">Miễn Phí</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 max-w-lg">
              Trải nghiệm chất lượng tấm MGO Remak® FireOFF trước khi đặt hàng —
              giao tận nơi, không cần thanh toán, kèm đầy đủ hồ sơ kỹ thuật.
            </p>

            {/* Stat chips */}
            <SampleRequestStats />
          </div>

          {/* Right — What you get */}
          <div className="hidden lg:block">
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-4">
              Bạn nhận được
            </p>
            <div className="border border-[#F26522]/30 bg-[#F26522]/5 rounded-2xl p-5 space-y-4">
              {WHAT_YOU_GET.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#F26522]/20 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-[#F26522]" />
                  </div>
                  <p className="text-sm text-slate-200 leading-snug pt-1">{text}</p>
                </div>
              ))}
            </div>

            {/* Trust note */}
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 size={13} className="text-[#7CB305] flex-shrink-0" />
              <span>Không cần thanh toán · Giao trong 3 ngày làm việc · Có thể đặt nhiều loại</span>
            </div>
          </div>

        </div>

        {/* Mobile: what you get strip */}
        <div className="mt-8 lg:hidden">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-3">Bạn nhận được:</p>
          <div className="flex flex-wrap gap-2">
            {WHAT_YOU_GET.map(({ icon: Icon, text }) => (
              <span key={text} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 border border-[#F26522]/20 text-[11px] text-slate-300">
                <Icon size={11} className="text-[#F26522]" />
                {text.split(' ').slice(0, 4).join(' ')}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
