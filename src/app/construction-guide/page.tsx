import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Hammer, Play, CheckCircle2, AlertTriangle,
  ChevronRight, PhoneCall, ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hướng Dẫn Thi Công | Remak® MGO FireOFF',
  description: 'Quy trình thi công chuẩn cho tấm MGO Remak® FireOFF: bọc ống gió PCCC, vách ngăn cháy, sàn chịu lực. Video + bản vẽ + lưu ý kỹ thuật.',
};

const GUIDES = [
  {
    id: 'duct',
    title: 'Bọc Ống Gió PCCC',
    subtitle: 'EI 30 · EI 60 · EI 90 · EI 120',
    color: 'from-[#F26522] to-[#D95314]',
    accent: 'text-[#D95314]',
    accentBg: 'bg-[#FEF3EC]',
    steps: [
      { n: 1, title: 'Kiểm tra & chuẩn bị ống gió', desc: 'Làm sạch bề mặt, xử lý điểm rỉ sét, đo kích thước thực tế và xác định vị trí ty treo trước khi thi công.' },
      { n: 2, title: 'Trải lớp bông khoáng Rockwool', desc: 'Cắt bông khoáng theo chu vi ống, dán bằng keo chịu nhiệt, quấn chặt để không có khe hở. Độ dày theo mức EI yêu cầu.' },
      { n: 3, title: 'Lắp tấm MGO FireOFF DuctBoard', desc: 'Cắt tấm theo khổ, bọc quanh lớp bông khoáng, giữ mép thẳng. Bắn vít tự khoan đầu dù mỗi 15cm dọc theo cạnh dài.' },
      { n: 4, title: 'Xử lý mối ghép và góc', desc: 'Trám kín khe nối bằng keo silicon chống cháy Remak® FireSeal, dán băng cốt sợi thủy tinh, gia cố góc ngoài bằng bead nhôm.' },
      { n: 5, title: 'Lắp đai khung gia cường', desc: 'Bắt đai tôn mạ kẽm mỗi 50cm (EI 60) hoặc 40cm (EI 90-120) để chống biến dạng khi chịu nhiệt.' },
      { n: 6, title: 'Kiểm tra & nghiệm thu', desc: 'Gõ thử bề mặt tấm (âm thanh chắc, không rỗng), kiểm tra khe hở bằng thước lá ≤ 0.5mm, chụp ảnh lưu hồ sơ.' },
    ],
    notes: [
      'Không bỏ lớp bông khoáng khi muốn tiết kiệm — ảnh hưởng trực tiếp đến chỉ số EI',
      'Khoảng cách vít tối đa 15cm — vít thưa hơn gây bong tấm khi chịu nhiệt',
      'Dùng keo FireSeal chuyên dụng, không thay bằng silicone xây dựng thông thường',
    ],
  },
  {
    id: 'wall',
    title: 'Vách Ngăn Chống Cháy',
    subtitle: 'EI 60 · EI 90 · EI 120',
    color: 'from-[#7CB305] to-[#5F8A03]',
    accent: 'text-[#5F8A03]',
    accentBg: 'bg-[#F4F9E8]',
    steps: [
      { n: 1, title: 'Đánh dấu & lắp khung sàn-trần', desc: 'Đánh dấu tim vách theo bản vẽ, bắn tắc kê nở khung UW/TW mỗi 60cm vào sàn và trần bê tông.' },
      { n: 2, title: 'Dựng cột đứng CW', desc: 'Cắt thanh CW đúng chiều cao, cắm vào khung UW mỗi 40cm (EI 120) hoặc 60cm (EI 60). Kiểm tra thẳng đứng bằng nivo.' },
      { n: 3, title: 'Lắp bông khoáng điền vào lõi', desc: 'Nhét bông khoáng Rockwool 50-100mm vào giữa hai lớp khung — bắt buộc cho EI 90 và EI 120.' },
      { n: 4, title: 'Bắn tấm MGO mặt thứ nhất', desc: 'Đặt tấm theo chiều đứng (không nằm ngang), bắn vít dọc theo cột đứng mỗi 15cm. Tấm cách sàn 10mm.' },
      { n: 5, title: 'Bắn tấm MGO mặt thứ hai', desc: 'Lặp lại phía đối diện, bù mối nối tấm so với mặt đầu (offset 600mm). EI 120: bắn thêm lớp tấm thứ 2 tăng cứng.' },
      { n: 6, title: 'Trám kín & hoàn thiện', desc: 'Trát keo FireSeal toàn bộ mối nối, dán băng cốt sợi 2 mặt, trát phẳng bằng compound, mài nhẵn sau 24h.' },
    ],
    notes: [
      'Tấm phải cách sàn 10mm — điền keo FireSeal vào khe, không cho tấm chạm sàn',
      'Offset mối nối 2 mặt tối thiểu 600mm để tránh điểm yếu xuyên thấu nhiệt',
      'Dùng vít tự khoan 3.5×25mm — không dùng vít thạch cao ngắn hơn',
    ],
  },
  {
    id: 'floor',
    title: 'Sàn Kỹ Thuật Chịu Lực',
    subtitle: 'REI 120 · REI 180',
    color: 'from-slate-500 to-slate-700',
    accent: 'text-slate-700',
    accentBg: 'bg-slate-100',
    steps: [
      { n: 1, title: 'Lắp dầm đỡ thép mạ kẽm', desc: 'Bố trí dầm chính theo bản vẽ, khoảng cách tùy tải trọng thiết kế (400-600mm). Hàn hoặc bu-lông neo vào khung kết cấu.' },
      { n: 2, title: 'Lắp dầm phụ vuông góc', desc: 'Bổ sung dầm phụ để chia ô lưới ≤ 400×400mm, đảm bảo không có điểm uốn vượt quá khả năng chịu lực tấm.' },
      { n: 3, title: 'Đặt tấm MGO lên dầm', desc: 'Cắt tấm theo module (thường 600×600mm hoặc 600×1200mm), đặt lên dầm, đảm bảo mép tấm nằm trên dầm đỡ.' },
      { n: 4, title: 'Neo cố định tấm', desc: 'Bắn vít tự khoan vào dầm thép tại 4 góc và mỗi 20cm theo cạnh. Không để tấm nổi không cố định.' },
      { n: 5, title: 'Xử lý mối nối', desc: 'Trám keo FireSeal toàn bộ khe giữa các tấm (≤ 3mm). Dán băng cốt sợi phủ lên mối nối.' },
      { n: 6, title: 'Lớp hoàn thiện bề mặt', desc: 'Phủ nhựa epoxy chịu lực (nếu yêu cầu) hoặc để nguyên bề mặt tấm làm nền sàn công nghiệp.' },
    ],
    notes: [
      'Tải trọng tối đa 850 kg/m² — không vượt quá giới hạn này khi chất hàng',
      'Khoảng cách dầm đỡ phải tính theo tải trọng thực tế, không dùng khoảng cách cố định',
      'Tấm dày 18mm cho REI 180 — không dùng tấm 15mm khi yêu cầu REI 180',
    ],
  },
];

export default function ConstructionGuidePage() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 pt-16 pb-14 px-4">
        <div className="max-w-[1440px] mx-auto lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight size={12} />
            <span className="text-white">Hướng Dẫn Thi Công</span>
          </nav>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#5F8A03] flex items-center justify-center flex-shrink-0">
              <Hammer size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
                Hướng Dẫn Thi Công Chuẩn Thợ
              </h1>
              <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                Quy trình từng bước cho 3 hệ thi công chính — bọc ống gió, vách ngăn cháy và sàn kỹ thuật.
                Đúng kỹ thuật, đạt nghiệm thu PCCC ngay lần đầu.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            {GUIDES.map((g) => (
              <a key={g.id} href={`#guide-${g.id}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors">
                <Play size={12} />
                {g.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12 space-y-16">

        {GUIDES.map((guide) => (
          <section key={guide.id} id={`guide-${guide.id}`}>

            {/* Guide header */}
            <div className="flex items-start gap-4 mb-8">
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${guide.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <Hammer size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">{guide.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{guide.subtitle}</p>
              </div>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {guide.steps.map((step) => (
                <div key={step.n} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`w-7 h-7 rounded-full bg-gradient-to-br ${guide.color} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>
                      {step.n}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{step.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className={`${guide.accentBg} rounded-2xl p-5 border border-slate-200/60`}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={15} className={`${guide.accent} flex-shrink-0`} />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Lưu ý quan trọng</span>
              </div>
              <ul className="space-y-2">
                {guide.notes.map((note) => (
                  <li key={note} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 size={13} className={`${guide.accent} flex-shrink-0 mt-0.5`} />
                    {note}
                  </li>
                ))}
              </ul>
            </div>

          </section>
        ))}

        {/* CTA */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-extrabold text-white">Cần Hỗ Trợ Kỹ Thuật Tại Công Trình?</h3>
            <p className="text-xs text-slate-300 mt-2 max-w-xl leading-relaxed">
              Kỹ sư Remak hỗ trợ trực tiếp tại hiện trường, kiểm tra kỹ thuật thi công và hướng dẫn xử lý sự cố.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 flex-shrink-0">
            <a href="tel:0902441981" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white text-xs font-bold transition-colors">
              <PhoneCall size={14} />
              0902.441.981
            </a>
            <Link href="/thu-vien-tai-lieu" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors">
              <ArrowRight size={14} />
              Tải Bản Vẽ CAD
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
