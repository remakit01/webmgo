import Link from 'next/link';
import {
  Shield, Award, FlameKindling, Wrench,
  PhoneCall, Send, Package,
  Zap, Users,
} from 'lucide-react';
import AboutLocations from './AboutLocations';

/* ── Section 2: Company Story ── */
function CompanyStory() {
  return (
    <div className="bg-white border-b border-slate-100">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Left */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#5F8A03] mb-3">Về chúng tôi</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">
              Remak Group — Chuyên Sâu Vật Liệu Chống Cháy
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              <strong className="text-slate-900">Công Ty Cổ Phần Xây Dựng Và Nội Thất Remak</strong> (MST: 0105817310)
              là nhà sản xuất và cung ứng hàng đầu Việt Nam trong lĩnh vực vật liệu chịu nhiệt và chống cháy vô cơ.
              Hệ sản phẩm MGO FireOFF là mảng chuyên biệt tập trung hoàn toàn vào các giải pháp PCCC:
              bọc ống gió, vách ngăn cháy và sàn kỹ thuật chịu lực.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Với nhà máy tại KCN Bình Phú (Phú Thọ) và mạng lưới kho hàng từ Hà Nội đến TP.HCM,
              Remak đảm bảo giao hàng đúng tiến độ cho mọi dự án, kèm hồ sơ kỹ thuật đầy đủ được
              kiểm định bởi Viện IBST và Cục Cảnh Sát PCCC & CNCH.
            </p>

          </div>

          {/* Right — Why MGO */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Tại sao chọn MGO FireOFF?</p>
            <div className="space-y-3">
              {[
                { icon: Zap,      title: 'Vô cơ 100%',              desc: 'Khoáng Magie Oxit chịu lửa 1.200°C, không cháy, không khói độc Euroclass A1' },
                { icon: Shield,   title: 'Kiểm định IBST thực tế',  desc: 'Đốt lò thử nghiệm theo QCVN 06:2022 — biên bản có công chứng, không chỉ khai báo' },
                { icon: Wrench,   title: 'Thi công nhanh gọn',      desc: 'Cắt vít trực tiếp, không cần khoan mồi, nhẹ hơn thạch cao 35%' },
                { icon: Users,    title: 'Hỗ trợ kỹ sư tận nơi',   desc: 'Đội kỹ thuật PCCC hỗ trợ từ thiết kế bản vẽ đến nghiệm thu hiện trường' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#F4F9E8] flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-[#5F8A03]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{title}</p>
                    <p className="text-[11px] text-slate-500 leading-snug">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Section 3: Certifications ── */
const CERTS = [
  {
    name: 'IBST',
    full: 'Viện KHCN Xây Dựng',
    desc: 'Đốt lò thực tế đạt EI 30–180. Biên bản kiểm định có công chứng, đầy đủ cho hồ sơ PCCC.',
    borderCls: 'border-[#5F8A03]/40',
    bgCls: 'bg-[#F4F9E8]',
    iconCls: 'text-[#5F8A03]',
    badgeCls: 'bg-[#5F8A03] text-white',
  },
  {
    name: 'ISO 1182',
    full: 'Tiêu chuẩn quốc tế',
    desc: 'Thử không cháy (non-combustibility) — phân loại Euroclass A1, mức cao nhất về an toàn cháy nổ.',
    borderCls: 'border-amber-400/40',
    bgCls: 'bg-amber-50',
    iconCls: 'text-amber-600',
    badgeCls: 'bg-amber-500 text-white',
  },
  {
    name: 'QUATEST 3',
    full: 'Trung tâm 3 Bộ KHCN',
    desc: 'Kiểm tra cơ lý, kháng ẩm, uốn gãy — đảm bảo chất lượng tấm đồng nhất theo lô sản xuất.',
    borderCls: 'border-orange-400/40',
    bgCls: 'bg-orange-50',
    iconCls: 'text-orange-600',
    badgeCls: 'bg-orange-500 text-white',
  },
  {
    name: 'BXD',
    full: 'Bộ Xây Dựng',
    desc: 'Công bố hợp quy QCVN 06:2022/BXD — đủ điều kiện sử dụng trong công trình dân dụng và công nghiệp.',
    borderCls: 'border-blue-400/40',
    bgCls: 'bg-blue-50',
    iconCls: 'text-blue-600',
    badgeCls: 'bg-blue-600 text-white',
  },
];

function Certifications() {
  return (
    <div className="bg-slate-50 border-b border-slate-100">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12 lg:py-14">
        <div className="text-center mb-8">

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">4 Chứng Nhận Chính Thức</h2>
          
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CERTS.map(c => (
            <div key={c.name} className={`bg-white rounded-2xl border p-5 ${c.borderCls}`}>
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${c.bgCls}`}>
                <Award size={18} className={c.iconCls} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${c.badgeCls}`}>{c.name}</span>
              </div>
              <p className="text-[11px] font-bold text-slate-500 mb-1">{c.full}</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link
            href="/thu-vien-tai-lieu"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#5F8A03] hover:text-[#7CB305] transition-colors"
          >
            Xem toàn bộ hồ sơ kiểm định miễn phí →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Section 4: Values ── */
const VALUES = [
  { icon: FlameKindling, title: 'Kiểm định bằng lửa thật',  badge: 'EI 30 – EI 180',  desc: 'Không quảng cáo trên giấy — mỗi cấp EI đều có biên bản đốt lò IBST thực tế kèm video kiểm chứng.', color: 'text-[#F26522]', bg: 'bg-[#FEF3EC]', accent: 'bg-[#F26522]' },
  { icon: Shield,        title: 'Zero-Chloride',             badge: '100% MgSO₄',       desc: '100% muối Sulfate (MgSO₄) — loại trừ hoàn toàn ăn mòn vít, ốc và tôn kẽm. Hết rỉ sét sau 5–10 năm.', color: 'text-[#5F8A03]', bg: 'bg-[#F4F9E8]', accent: 'bg-[#5F8A03]' },
  { icon: Package,       title: 'Hồ sơ đầy đủ',             badge: '4 loại chứng nhận', desc: 'CAD, IBST, ISO, QUATEST, giấy phép BXD — cung cấp trọn gói cho chủ đầu tư, ban PCCC và tư vấn thiết kế.', color: 'text-blue-600', bg: 'bg-blue-50', accent: 'bg-blue-500' },
  { icon: Users,         title: 'Đồng hành đến nghiệm thu', badge: '200+ công trình',   desc: 'Kỹ sư Remak hỗ trợ từ bản vẽ thi công đến lúc ký biên bản nghiệm thu PCCC — không bỏ lại giữa dự án.', color: 'text-purple-600', bg: 'bg-purple-50', accent: 'bg-purple-500' },
];

function Values() {
  return (
    <div className="bg-white border-b border-slate-100">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12 lg:py-14">
        <div className="text-center mb-10">

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Điều Chúng Tôi Cam Kết</h2>

        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VALUES.map(({ icon: Icon, title, badge, desc, color, bg, accent }) => (
            <div key={title} className="group bg-white rounded-2xl border border-slate-200 hover:border-transparent hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden">
              <div className={`h-1 w-full ${accent}`} />
              <div className="p-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${bg} group-hover:scale-105 transition-transform duration-200`}>
                  <Icon size={22} className={color} />
                </div>
                <div className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mb-2 ${bg} ${color}`}>{badge}</div>
                <h3 className="text-sm font-black text-slate-900 mb-2 leading-snug">{title}</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Section 5: Locations — rendered by AboutLocations client component ── */

/* ── Section 6: CTA Banner ── */
function CtaBanner() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10">
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-500/20">
        <div className="space-y-1.5 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-bold text-white">Sẵn Sàng Làm Việc Với Chúng Tôi?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Kỹ sư Remak sẽ liên hệ trong 2 giờ làm việc — tư vấn kỹ thuật, báo giá và gửi hồ sơ IBST miễn phí.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0 w-full md:w-auto">
          <a
            href="tel:0902441981"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <PhoneCall size={15} />
            0902.441.981
          </a>
          <Link
            href="/bao-gia"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/20 flex items-center justify-center gap-2"
          >
            <Send size={15} />
            Nhận Báo Giá Ngay
          </Link>
          <Link
            href="/nhan-mau-thu"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/20 flex items-center justify-center gap-2"
          >
            <Package size={15} />
            Nhận Mẫu Thử
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Main export ── */
export default function AboutContent() {
  return (
    <>
      <CompanyStory />
      <Certifications />
      <Values />
      <AboutLocations />
      <CtaBanner />
    </>
  );
}
