'use client';

import { useState, useEffect, useRef } from 'react';
import { DOCUMENTS } from '@/data/documents';

interface StatDef {
  value: string;
  label: string;
}

const STATS: StatDef[] = [
  { value: String(DOCUMENTS.length), label: 'Tài liệu' },
  { value: '6',                       label: 'Mức EI kiểm định' },
  { value: '4',                       label: 'Chứng chỉ quốc tế' },
  { value: '100%',                    label: 'Miễn phí' },
];

function parseValue(val: string): { num: number; suffix: string } {
  const m = val.match(/^([\d.]+)(.*)$/);
  return m ? { num: parseFloat(m[1]), suffix: m[2] } : { num: 0, suffix: val };
}

function AnimatedStat({ value, label }: StatDef) {
  const { num, suffix } = parseValue(value);
  const [count, setCount] = useState(0);
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
    <div ref={ref} className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-center">
      <div className="text-xl font-black text-white tabular-nums">
        {display}{suffix}
      </div>
      <div className="text-xs text-slate-300 mt-0.5">{label}</div>
    </div>
  );
}

export default function TechLibraryStats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
      {STATS.map(stat => (
        <AnimatedStat key={stat.label} {...stat} />
      ))}
    </div>
  );
}
