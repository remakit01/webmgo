'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, ChevronRight, PhoneCall, ArrowRight } from 'lucide-react';

const FAQ_GROUPS = [
  {
    group: 'Về sản phẩm MGO FireOFF',
    items: [
      {
        q: 'Tấm MGO Remak® FireOFF khác gì so với tấm thạch cao chống cháy thông thường?',
        a: 'Tấm MGO (Magie Oxit) có khả năng chịu lửa vượt trội hơn thạch cao ở cùng độ dày, không nứt vỡ khi chịu nhiệt đột ngột, kháng ẩm 100% và không có amiăng. Trọng lượng nhẹ hơn thạch cao 20-25%, thi công nhanh hơn và không cần băng lưới chống nứt bề mặt trong điều kiện ẩm.',
      },
      {
        q: 'Tấm MGO có thể dùng cho khu vực ẩm ướt như tầng hầm, phòng kỹ thuật không?',
        a: 'Có. Tấm MGO Remak® FireOFF được sản xuất theo công thức muối Sulfate (MgSO4) không hút ẩm, không biến dạng hoặc mục nát trong môi trường độ ẩm cao. Đây là ưu điểm cốt lõi so với tấm thạch cao và cemboard truyền thống.',
      },
      {
        q: 'Tấm MGO FireOFF có độ dày bao nhiêu? Chọn độ dày như thế nào?',
        a: 'Remak® FireOFF cung cấp các độ dày: 5mm (EI 30), 8mm (EI 45-60), 10mm (EI 90) và 12mm (EI 120) cho hệ bọc ống gió; 9mm và 12mm cho vách ngăn; 15mm và 18mm cho sàn chịu lực. Lựa chọn dựa trên chỉ số EI (khả năng chịu lửa theo phút) yêu cầu trong hồ sơ thiết kế PCCC.',
      },
      {
        q: 'Hồ sơ kiểm định nào đi kèm với sản phẩm?',
        a: 'Mỗi lô hàng có: (1) Chứng chỉ ISO 1182 Class A1 không cháy từ Bureau Veritas, (2) Biên bản thử nghiệm đốt lò tại Viện IBST Hà Nội có công chứng, (3) Phiếu kiểm tra chất lượng xuất xưởng. Toàn bộ có thể tải tại trang Thư viện kiểm định.',
      },
    ],
  },
  {
    group: 'Về thi công & nghiệm thu',
    items: [
      {
        q: 'Thi công bọc ống gió EI 60 cần bao nhiêu lớp vật liệu?',
        a: 'Hệ EI 60 gồm: (1) Ống gió tôn mạ kẽm, (2) Lớp bông khoáng Rockwool 40kg/m³ dày 30mm, (3) Tấm MGO FireOFF 8mm, (4) Đai tôn gia cường mỗi 50cm, (5) Keo silicon chống cháy Remak® FireSeal xử lý khe nối. Không được bỏ qua bất kỳ lớp nào — ảnh hưởng trực tiếp đến kết quả nghiệm thu.',
      },
      {
        q: 'Cơ quan PCCC có chấp nhận tấm MGO không có biên bản đốt lò IBST không?',
        a: 'Không. Theo QCVN 06:2022/BXD, vật liệu chống cháy phải có kết quả thử nghiệm từ tổ chức được Bộ Xây dựng công nhận. Remak® FireOFF có đầy đủ biên bản IBST cho tất cả mức EI từ EI 30 đến EI 120, sẵn sàng cung cấp khi đệ trình hồ sơ.',
      },
      {
        q: 'Cần kinh nghiệm gì để thi công tấm MGO đúng kỹ thuật?',
        a: 'Thợ có kinh nghiệm lắp vách khô thạch cao là đủ để chuyển sang tấm MGO. Điểm khác biệt chính: (1) Dùng lưỡi cắt chuyên dụng hoặc dao rọc, (2) Vít tự khoan đầu dù không cần khoan mồi, (3) Bắt buộc dùng keo FireSeal chuyên dụng (không dùng silicone thông thường). Remak cung cấp kỹ sư hỗ trợ kỹ thuật tại hiện trường khi cần.',
      },
      {
        q: 'Sau khi thi công xong, bao lâu có thể bắt đầu nghiệm thu PCCC?',
        a: 'Keo FireSeal cần tối thiểu 24h để đóng rắn hoàn toàn. Sau đó có thể mời đoàn kiểm tra. Remak khuyến nghị chụp ảnh từng bước thi công để có hồ sơ hoàn công đầy đủ trước khi nộp cho cơ quan PCCC.',
      },
    ],
  },
  {
    group: 'Về giá & mua hàng',
    items: [
      {
        q: 'Làm thế nào để nhận báo giá cho dự án?',
        a: 'Gửi bản vẽ PCCC hoặc thông số dự án (diện tích, mức EI, loại ứng dụng) qua Zalo/email, kỹ sư Remak sẽ tính toán và gửi báo giá trong vòng 2-4 giờ làm việc. Hotline: 0902.441.981.',
      },
      {
        q: 'Remak có cung cấp dịch vụ thi công trọn gói không?',
        a: 'Remak cung cấp vật liệu (tấm MGO, keo FireSeal, phụ kiện khung xương) và hỗ trợ kỹ thuật. Thi công được thực hiện bởi đội ngũ thầu phụ được Remak đào tạo và chứng nhận — liên hệ để kết nối với đội thi công đã quen thuộc với sản phẩm tại khu vực của bạn.',
      },
      {
        q: 'Thời gian giao hàng tấm MGO là bao lâu?',
        a: 'Hàng có sẵn kho Hà Nội và TP.HCM: giao trong 1-2 ngày. Đơn lớn (>500m²) hoặc độ dày đặc biệt: 5-7 ngày. Vận chuyển toàn quốc bằng xe tải chuyên dụng, đảm bảo tấm không bị vỡ góc.',
      },
    ],
  },
  {
    group: 'Tiêu chuẩn & pháp lý',
    items: [
      {
        q: 'Tấm MGO FireOFF đáp ứng những tiêu chuẩn PCCC nào của Việt Nam?',
        a: 'Đáp ứng: QCVN 06:2022/BXD (Quy chuẩn an toàn cháy), TCVN 9311-1:2012 và TCVN 9311-8:2012 (thử nghiệm chịu lửa), ISO 1182 Class A1 (không cháy). Biên bản thử nghiệm từ Viện IBST — đơn vị được Bộ Xây dựng chỉ định.',
      },
      {
        q: 'Chỉ số EI trong PCCC có ý nghĩa gì?',
        a: 'EI = Etanchéité (kín khói/ngọn lửa) + Isolation (cách nhiệt). Con số sau EI là thời gian chịu lửa tính bằng phút: EI 60 nghĩa là vật liệu ngăn cháy lan và duy trì nhiệt độ bề mặt đối diện dưới 140°C trong 60 phút. Đây là chỉ số bắt buộc khi thiết kế hệ PCCC.',
      },
    ],
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (key: string) => setOpen((prev) => (prev === key ? null : key));

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 pt-16 pb-14 px-4">
        <div className="max-w-[1440px] mx-auto lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight size={12} />
            <span className="text-white">Hỏi Đáp Kỹ Thuật</span>
          </nav>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#5F8A03] flex items-center justify-center flex-shrink-0">
              <HelpCircle size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
                Hỏi Đáp Kỹ Thuật PCCC
              </h1>
              <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                {FAQ_GROUPS.reduce((s, g) => s + g.items.length, 0)} câu hỏi thường gặp về sản phẩm, thi công, tiêu chuẩn và pháp lý PCCC.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 lg:px-8 py-12 space-y-10">

        {FAQ_GROUPS.map((grp) => (
          <section key={grp.group}>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <span className="flex-1 border-t border-slate-200" />
              {grp.group}
              <span className="flex-1 border-t border-slate-200" />
            </h2>
            <div className="space-y-2">
              {grp.items.map((item, i) => {
                const key = `${grp.group}-${i}`;
                const isOpen = open === key;
                return (
                  <div
                    key={key}
                    className={`bg-white rounded-2xl border transition-all ${isOpen ? 'border-[#7CB305] shadow-sm' : 'border-slate-200'}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                    >
                      <span className={`text-sm font-semibold leading-snug transition-colors ${isOpen ? 'text-[#5F8A03]' : 'text-slate-900'}`}>
                        {item.q}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 flex-shrink-0 mt-0.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#5F8A03]' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 -mt-1">
                        <div className="h-px bg-slate-100 mb-4" />
                        <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Not answered */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h3 className="text-base font-extrabold text-white">Chưa tìm được câu trả lời?</h3>
            <p className="text-xs text-slate-300 mt-1.5">Kỹ sư Remak trả lời trực tiếp trong giờ hành chính.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 flex-shrink-0">
            <a href="tel:0902441981" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white text-xs font-bold transition-colors">
              <PhoneCall size={14} />
              0902.441.981
            </a>
            <Link href="/thu-vien-tai-lieu" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors">
              <ArrowRight size={14} />
              Thư Viện Tài Liệu
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
