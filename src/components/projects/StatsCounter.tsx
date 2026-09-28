'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Building2, LayoutGrid, MapPin, Award } from 'lucide-react';

interface StatDef {
  value: string;
  label: string;
  icon: React.ElementType;
}

const STATS: StatDef[] = [
  { value: '200+',  label: 'Dự án hoàn thành', icon: Building2 },
  { value: '1.2M+', label: 'M² đã thi công',   icon: LayoutGrid },
  { value: '32',    label: 'Tỉnh thành',        icon: MapPin    },
  { value: '10+',   label: 'Năm kinh nghiệm',  icon: Award     },
];

function parseValue(val: string): { num: number; suffix: string } {
  const m = val.match(/^([\d.]+)(.*)$/);
  return m ? { num: parseFloat(m[1]), suffix: m[2] } : { num: 0, suffix: '' };
}

function AnimatedStat({ value, label, icon: Icon }: StatDef) {
  const { num, suffix } = parseValue(value);
  const [count, setCount]   = useState(0);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount((1 - Math.pow(1 - progress, 3)) * num);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, num]);

  const display = Number.isInteger(num)
    ? Math.round(count).toString()
    : count.toFixed(1);

  return (
    <div ref={ref} className="flex flex-col items-center text-center px-5 py-6 group cursor-default transition-colors hover:bg-white/5">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 bg-white/10 group-hover:bg-[#5F8A03] group-hover:shadow-lg group-hover:shadow-[#5F8A03]/30">
        <Icon size={17} className="text-slate-300 group-hover:text-white transition-colors duration-300" />
      </div>
      <div className="text-3xl sm:text-4xl font-black tabular-nums leading-none mb-2 transition-colors duration-300 text-white group-hover:text-[#7CB305]">
        {display}{suffix}
      </div>
      <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wide leading-snug group-hover:text-slate-300 transition-colors duration-300">
        {label}
      </div>
    </div>
  );
}

export default function StatsCounter() {
  return (
    <div className="flex flex-col sm:flex-row items-stretch rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm divide-y sm:divide-y-0 sm:divide-x divide-white/10">
      {STATS.map((stat) => (
        <div key={stat.label} className="flex-1">
          <AnimatedStat {...stat} />
        </div>
      ))}
    </div>
  );
}
