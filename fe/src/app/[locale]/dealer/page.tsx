import type { Metadata } from 'next';
import Link from '@/components/ui/LocaleLink';
import {
  Star, TrendingUp, Headphones, Megaphone,
  ClipboardCheck, Handshake, Award,
  PhoneCall, CheckCircle2, ArrowRight,
} from 'lucide-react';
import DealerStats from '@/components/dealer/DealerStats';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';

export const metadata: Metadata = {
  title: 'Chính Sách Đại Lý | Remak® MGO FireOFF',
  description: 'Trở thành đại lý phân phối tấm MGO Remak® FireOFF. Chiết khấu hấp dẫn, hỗ trợ kỹ thuật và marketing đầy đủ.',
};

const TIERS = [
  {
    id: 'silver',
    name: 'Đại Lý Bạc',
    badge: 'bg-slate-100 text-slate-600 border border-slate-200',
    barColor: 'from-slate-300 to-slate-400',
    condition: 'Doanh số từ 200 triệu / quý',
    discount: '12–15%',
    benefits: [
      'Chiết khấu 12–15% trên giá niêm yết',
      'Hỗ trợ kỹ thuật qua hotline & Zalo',
      'Catalogue & tài liệu kỹ thuật miễn phí',
      'Đào tạo kỹ thuật thi công cơ bản',
      'Ưu tiên giao hàng trong 3 ngày',
    ],
  },
  {
    id: 'gold',
    name: 'Đại Lý Vàng',
    badge: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    barColor: 'from-yellow-400 to-yellow-500',
    condition: 'Doanh số từ 500 triệu / quý',
    discount: '16–20%',
    featured: true,
    benefits: [
      'Chiết khấu 16–20% trên giá niêm yết',
      'Kỹ sư hỗ trợ tại hiện trường theo yêu cầu',
      'Biển hiệu & vật phẩm trưng bày miễn phí',
      'Đào tạo kỹ thuật nâng cao mỗi quý',
      'Giao hàng ưu tiên trong 24 giờ',
      'Hỗ trợ co-branding hồ sơ dự thầu',
    ],
  },
  {
    id: 'platinum',
    name: 'Đại Lý Bạch Kim',
    badge: 'bg-[#F4F9E8] text-[#5F8A03] border border-[#7CB305]/30',
    barColor: 'from-[#7CB305] to-[#5F8A03]',
    condition: 'Doanh số từ 1 tỷ / quý',
    discount: '21–25%',
    benefits: [
      'Chiết khấu 21–25% trên giá niêm yết',
      'Kỹ sư đồng hành cố định theo dự án',
      'Hỗ trợ marketing 100% chi phí vật phẩm',
      'Quyền phân phối độc quyền theo tỉnh',
      'Đào tạo nhân viên kinh doanh tại chỗ',
      'Chia sẻ database khách hàng tiềm năng',
      'Ưu tiên giao hàng ngay trong ngày',
    ],
  },
];

const STEPS = [
  { n: 1, icon: ClipboardCheck, title: 'Nộp đơn đăng ký', desc: 'Điền form đăng ký đại lý hoặc liên hệ hotline. Cung cấp thông tin công ty, lĩnh vực kinh doanh và khu vực hoạt động.' },
  { n: 2, icon: Headphones, title: 'Tư vấn & xét duyệt', desc: 'Chuyên viên Remak liên hệ trong 24 giờ để tìm hiểu nhu cầu và xét duyệt hồ sơ theo tiêu chí đối tác.' },
  { n: 3, icon: Handshake, title: 'Ký hợp đồng đại lý', desc: 'Ký hợp đồng chính thức, thống nhất chiết khấu, hạn mức công nợ, chính sách bảo hành và quy trình đặt hàng.' },
  { n: 4, icon: Award, title: 'Kích hoạt & nhận hỗ trợ', desc: 'Nhận bộ vật phẩm ra mắt, đào tạo kỹ thuật và truy cập portal đại lý. Bắt đầu kinh doanh ngay trong tuần đầu.' },
];

const POLICIES = [
  { title: 'Chính sách bảo hành', items: ['Bảo hành 5 năm cho sản phẩm lỗi từ nhà máy', 'Đổi trả trong vòng 30 ngày nếu sản phẩm không đúng spec', 'Hỗ trợ xử lý khiếu nại trong 48 giờ làm việc'] },
  { title: 'Chính sách thanh toán', items: ['Thanh toán chuyển khoản trước 100% cho đơn đầu tiên', 'Hạn mức công nợ 30 ngày từ đơn thứ 2 (sau xét duyệt)', 'Chiết khấu thanh toán sớm 1% nếu trả trước hạn 15 ngày'] },
  { title: 'Chính sách vận chuyển', items: ['Giao hàng toàn quốc bằng xe tải chuyên dụng', 'Phí vận chuyển miễn phí cho đơn từ 50 triệu trở lên', 'Bảo hiểm hàng hóa trong quá trình vận chuyển'] },
];

export default async function DaiLyPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale as Locale);
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 pt-16 pb-14 px-4">
        <div className="max-w-[1440px] mx-auto lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Trở Thành Đại Lý
              <span className="block text-[#7CB305]">Remak® MGO FireOFF</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Tham gia mạng lưới phân phối vật liệu chống cháy hàng đầu Việt Nam.
              Chiết khấu cạnh tranh, hỗ trợ kỹ thuật và marketing đầy đủ.
            </p>
          </div>

          <DealerStats />
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12 space-y-16">

        {/* Section 1: Tiers */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-slate-900">3 Cấp Độ Đại Lý</h2>
            <p className="text-sm text-slate-500 mt-2">Chọn cấp phù hợp — nâng cấp tự động khi đạt doanh số</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`relative bg-white rounded-3xl border overflow-hidden transition-all ${
                  tier.featured
                    ? 'border-yellow-300 shadow-xl shadow-yellow-100 scale-[1.02]'
                    : 'border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {tier.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2.5 py-1 rounded-xl bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase tracking-wide">
                      Phổ biến nhất
                    </span>
                  </div>
                )}
                <div className={`h-1.5 bg-gradient-to-r ${tier.barColor}`} />
                <div className="p-6">
                  <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold mb-4 ${tier.badge}`}>
                    {tier.name}
                  </span>
                  <div className="text-3xl font-black text-slate-900 mb-1">{tier.discount}</div>
                  <div className="text-xs text-slate-500 mb-1">chiết khấu</div>
                  <div className="flex items-center gap-1.5 mb-5">
                    <TrendingUp size={12} className="text-[#5F8A03]" />
                    <span className="text-xs text-slate-500">{tier.condition}</span>
                  </div>
                  <ul className="space-y-2.5">
                    {tier.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 size={13} className="text-[#5F8A03] flex-shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Process */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-slate-900">Quy Trình Đăng Ký Đại Lý</h2>
            <p className="text-sm text-slate-500 mt-2">Hoàn tất trong 3–5 ngày làm việc</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.n} className="bg-white rounded-2xl border border-slate-200 p-5 relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F4F9E8] flex items-center justify-center flex-shrink-0">
                      <Icon size={17} className="text-[#5F8A03]" />
                    </div>
                    <span className="text-2xl font-black text-slate-100">0{step.n}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                  {step.n < 4 && (
                    <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <ArrowRight size={16} className="text-slate-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Policies */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-slate-900">Chính Sách Hợp Tác</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {POLICIES.map((pol) => (
              <div key={pol.title} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Megaphone size={15} className="text-[#5F8A03]" />
                  <h3 className="text-sm font-bold text-slate-900">{pol.title}</h3>
                </div>
                <ul className="space-y-2.5">
                  {pol.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                      <CheckCircle2 size={12} className="text-[#5F8A03] flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/20 text-center">
          <h3 className="text-2xl font-extrabold text-white mb-3">Sẵn Sàng Trở Thành Đại Lý?</h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed mb-7">
            Liên hệ ngay để được tư vấn cấp đại lý phù hợp và nhận bộ tài liệu giới thiệu đối tác miễn phí.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="tel:0902441981"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-sm transition-colors"
            >
              <PhoneCall size={16} />
              Gọi ngay: 0902.441.981
            </a>
            <Link
              href="/bao-gia"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-colors"
            >
              <ArrowRight size={16} />
              Đăng Ký Qua Form
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
