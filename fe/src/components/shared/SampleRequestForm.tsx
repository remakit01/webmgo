'use client';

import { useEffect, useRef, useState } from 'react';
import Link from '@/components/ui/LocaleLink';
import { 
  CheckCircle2, 
  Package, 
  ArrowRight, 
  Phone, 
  FileText, 
  Sparkles, 
  Truck, 
  ShieldCheck, 
  Clock, 
  MessageCircle,
  Award,
  Layers
} from 'lucide-react';

interface SampleRequestFormProps {
  id?: string;
  href?: string;
  title?: string;
  subtitle?: string;
  fullWidth?: boolean;
  className?: string;
}

const TRUST_FEATURES = [
  {
    icon: Package,
    title: 'Bộ 06 mẫu cắt thực tế',
    desc: 'Đầy đủ tem nhãn thông số độ dày 5mm, 8mm, 10mm, 12mm, 15mm, 18mm',
  },
  {
    icon: ShieldCheck,
    title: 'Hồ sơ kiểm định đốt lò IBST',
    desc: 'Bản sao kết quả thử nghiệm đạt chuẩn PCCC QCVN 06:2022/BXD',
  },
  {
    icon: Truck,
    title: 'Miễn phí vận chuyển 100%',
    desc: 'Giao hỏa tốc 24h - 48h tận chân công trình đến 63 tỉnh thành',
  },
  {
    icon: Clock,
    title: 'Kỹ sư hỗ trợ trong 2h',
    desc: 'Tư vấn kỹ thuật giải pháp bọc ống gió, vách ngăn, sàn chịu lực',
  },
];

const SAMPLE_BOX_ITEMS = [
  'Đầy đủ 6 mẫu cắt tấm MGO (5mm, 8mm, 10mm, 12mm, 15mm, 18mm)',
  'Bộ catalogue kỹ thuật & cẩm nang hướng dẫn thi công chuẩn',
  'Bản sao chứng thư thử nghiệm đốt lò mẫu IBST (Viện KHCN Xây dựng)',
  'Không mất phí mẫu thử — Không chịu phí vận chuyển',
];

const STATS = [
  { target: 200, suffix: '+', label: 'Dự án đã cấp mẫu' },
  { target: 63,  suffix: '',  label: 'Tỉnh/TP giao tận nơi' },
  { target: 100, suffix: '%', label: 'Nghiệm thu PCCC' },
];

function useCountUp(target: number, duration = 1400, triggered = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!triggered) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, triggered]);
  return count;
}

function AnimatedStat({ target, suffix, label, triggered }: { target: number; suffix: string; label: string; triggered: boolean }) {
  const count = useCountUp(target, 1400, triggered);
  return (
    <div>
      <div className="text-xl sm:text-2xl font-black text-white tabular-nums tracking-tight">
        {count}{suffix}
      </div>
      <div className="text-[11px] sm:text-xs text-slate-300 font-medium">{label}</div>
    </div>
  );
}

export default function SampleRequestForm({
  id = 'mau-thu',
  href = '/nhan-mau-thu',
  title,
  subtitle,
  fullWidth = true,
  className = '',
}: SampleRequestFormProps) {
  const statsRef = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { 
        if (entry.isIntersecting) { 
          setTriggered(true); 
          observer.disconnect(); 
        } 
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const content = (
    <>
      {/* Hiệu ứng ánh sáng nền ambient glows */}
      <div className="pointer-events-none absolute -top-32 right-0 w-[550px] h-[550px] rounded-full bg-[#7CB305]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-0 w-[550px] h-[550px] rounded-full bg-[#F26522]/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-3xl" />

      <div className={`relative z-10 ${fullWidth ? 'max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20' : 'px-6 py-10 sm:px-10 sm:py-14'} grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center`}>

        {/* ── CỘT TRÁI (LỢI ÍCH & MINH CHỨNG UY TÍN - 7 CỘT) ── */}
        <div className="lg:col-span-7 space-y-6">


          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
            {title ? (
              title
            ) : (
              <>
                Nhận Hộp Mẫu Thực Tế <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F26522] via-[#FF7A30] to-[#7CB305]">
                  Tấm Chống Cháy MGO Remak®
                </span>
              </>
            )}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            {subtitle || 'Gửi tận tay bộ mẫu cắt thực tế kiểm chứng độ cứng, khả năng chống cháy A1, chịu nước 100% kèm trọn bộ kết quả đốt lò IBST chuẩn QCVN 06:2022/BXD.'}
          </p>

          {/* Lưới 4 đặc quyền hộp mẫu thử */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {TRUST_FEATURES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx} 
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#5F8A03]/25 border border-[#7CB305]/40 flex items-center justify-center flex-shrink-0 text-[#7CB305] mt-0.5">
                    <Icon size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white mb-0.5">{item.title}</h3>
                    <p className="text-[11px] text-slate-300 leading-normal">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hàng số liệu tin cậy (Counter) */}
          <div ref={statsRef} className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            {STATS.map(s => (
              <AnimatedStat key={s.label} {...s} triggered={triggered} />
            ))}
          </div>

          {/* Kênh hỗ trợ trực tiếp Hotline & Zalo */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
            <span className="text-slate-400 font-medium">Cần mẫu gấp trong ngày?</span>
            <a 
              href="tel:0902441981" 
              className="inline-flex items-center gap-1.5 font-bold text-[#F26522] hover:text-[#FF7A30] transition-colors"
            >
              <Phone size={13} />
              <span>Hotline: 0902.441.981</span>
            </a>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <a 
              href="https://zalo.me/0902441981" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-[#0088FF] hover:underline"
            >
              <MessageCircle size={13} />
              <span>Chat Zalo nhận mẫu</span>
            </a>
          </div>
        </div>

        {/* ── CỘT PHẢI (CTA CARD NÂNG CẤP TRỰC QUAN - 5 CỘT) ── */}
        <div className="lg:col-span-5">
          <div className="relative bg-slate-900/85 border border-white/15 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5">
            
            {/* Header Card */}


            {/* Preview các vật phẩm có trong hộp mẫu */}
            <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4 space-y-2.5">
              <div className="text-xs font-bold text-white flex items-center gap-2 mb-2">
                <Layers size={14} className="text-[#7CB305]" />
                <span>Trọn bộ hộp mẫu bao gồm:</span>
              </div>
              <ul className="space-y-2">
                {SAMPLE_BOX_ITEMS.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-snug">
                    <CheckCircle2 size={14} className="text-[#7CB305] flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nút bấm CTA chính dẫn sang trang /nhan-mau-thu */}
            <Link
              href={href}
              className="group flex flex-col items-center justify-center w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#F26522] to-[#EA580C] hover:from-[#EA580C] hover:to-[#D95314] text-white font-bold shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center gap-2 text-sm sm:text-base">
                <Package size={18} />
                <span>ĐĂNG KÝ NHẬN MẪU THỬ MIỄN PHÍ</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
              <span className="text-[11px] font-normal text-white/85 mt-0.5">
                (Điền thông tin nhận mẫu gửi tận nơi trong 24h)
              </span>
            </Link>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[11px] text-slate-400 font-medium">hoặc kết nối khẩn cấp</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Secondary actions: Gọi Hotline & Chat Zalo & Tải tài liệu */}
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href="tel:0902441981"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-white/20 text-slate-200 hover:border-white/40 hover:text-white text-xs font-bold transition-all bg-white/5 hover:bg-white/10"
              >
                <Phone size={13} className="text-[#F26522]" />
                <span>0902.441.981</span>
              </a>
              <a
                href="https://zalo.me/0902441981"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-white/20 text-slate-200 hover:border-white/40 hover:text-white text-xs font-bold transition-all bg-white/5 hover:bg-white/10"
              >
                <MessageCircle size={13} className="text-[#0088FF]" />
                <span>Zalo Kỹ Thuật</span>
              </a>
            </div>

            {/* Link tải tài liệu kỹ thuật */}
            {/* Security & Response SLA */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-white/10 pt-3">
              <ShieldCheck size={13} className="text-[#7CB305]" />
              <span>Cam kết bảo mật. Chuyên viên kỹ thuật liên hệ trong 2h.</span>
            </div>

          </div>
        </div>

      </div>
    </>
  );

  if (!fullWidth) {
    return (
      <section id={id} className={`max-w-[1440px] mx-auto px-4 lg:px-8 ${className}`}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
          {content}
        </div>
      </section>
    );
  }

  return (
    <section 
      id={id} 
      className={`w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-y border-white/5 ${className}`}
    >
      {content}
    </section>
  );
}
