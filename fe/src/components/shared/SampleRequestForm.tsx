'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight, Phone, FileText } from 'lucide-react';

interface SampleRequestFormProps {
  id?: string;
  href?: string;
  title?: string;
  subtitle?: string;
}

const TRUST_ITEMS = [
  'Miễn phí 100% mẫu thử & cước vận chuyển',
  'Giao hỏa tốc 24h toàn quốc',
  'Kèm catalogue kỹ thuật & kết quả đốt mẫu IBST',
];

const STATS = [
  { target: 200, suffix: '+', label: 'Công trình' },
  { target: 32,  suffix: '',  label: 'Tỉnh/TP' },
  { target: 100, suffix: '%', label: 'Nghiệm thu' },
];

function useCountUp(target: number, duration = 1400, triggered = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!triggered) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // ease-out cubic
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
      <div className="text-xl font-black text-white tabular-nums">
        {count}{suffix}
      </div>
      <div className="text-[11px] text-slate-400">{label}</div>
    </div>
  );
}

export default function SampleRequestForm({
  id = 'mau-thu',
  href = '/nhan-mau-thu',
  title,
  subtitle,
}: SampleRequestFormProps) {
  const statsRef = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); observer.disconnect(); } },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id={id} className="max-w-[1440px] mx-auto px-4 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">

        {/* Ambient glows */}
        <div className="pointer-events-none absolute -top-24 right-0 w-[480px] h-[480px] rounded-full bg-[#7CB305]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-0 w-[480px] h-[480px] rounded-full bg-[#F26522]/10 blur-3xl" />

        <div className="relative z-10 px-8 py-14 sm:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ── LEFT: Copy ── */}
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              {title ? (
                title
              ) : (
                <>
                  Nhận Mẫu Thực Tế<br />
                  <span className="text-[#F26522]">Tấm MGO Remak®</span>
                </>
              )}
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-md">
              {subtitle || 'Bộ mẫu gồm đủ các độ dày 5mm – 18mm, catalogue kỹ thuật đầy đủ và kết quả đốt thử nghiệm IBST — gửi tận tay trong 24h.'}
            </p>

            {/* Trust list */}
            <ul className="space-y-2.5">
              {TRUST_ITEMS.map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 size={15} className="flex-shrink-0 text-[#7CB305]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Animated stat row */}
            <div ref={statsRef} className="flex items-center gap-6 pt-2 border-t border-white/10">
              {STATS.map(s => (
                <AnimatedStat key={s.label} {...s} triggered={triggered} />
              ))}
            </div>
          </div>

          {/* ── RIGHT: CTA Card ── */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-8 flex flex-col gap-5">
            <div className="text-center space-y-1.5">
              <div className="text-base font-bold text-white">Đăng ký nhận mẫu ngay</div>
            </div>

            {/* Primary CTA */}
            <Link
              href={href}
              className="group flex items-center justify-center gap-2.5 w-full py-4 rounded-xl bg-[#F26522] hover:bg-[#D95314] text-white font-bold text-base shadow-lg shadow-orange-600/30 hover:shadow-orange-600/50 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Package size={18} />
              <span>Nhận Mẫu Thử Miễn Phí</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[11px] text-slate-500">hoặc</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Secondary actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="tel:0901000000"
                className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl border border-white/20 text-slate-300 hover:border-white/40 hover:text-white text-xs font-bold transition-all"
              >
                <Phone size={13} />
                <span>Gọi tư vấn</span>
              </a>
              <Link
                href="/catalogue"
                className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl border border-white/20 text-slate-300 hover:border-white/40 hover:text-white text-xs font-bold transition-all"
              >
                <FileText size={13} />
                <span>Tải Catalogue</span>
              </Link>
            </div>

            {/* Security note */}
            <p className="text-center text-[11px] text-slate-500 leading-relaxed">
              Thông tin được bảo mật. Chuyên viên kỹ thuật liên hệ xác nhận trong 2h làm việc.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
