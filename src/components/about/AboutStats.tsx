'use client';

import { useState, useEffect, useRef } from 'react';

type StatDef = { value: string; label: string };

const STATS: StatDef[] = [
  { value: '200+', label: 'Công trình' },
  { value: '32',   label: 'Tỉnh thành' },
  { value: '10+',  label: 'Năm kinh nghiệm' },
  { value: '100%', label: 'Đạt nghiệm thu' },
];

function parseValue(value: string): { num: number; suffix: string } {
  const match = value.match(/^(\d+)(.*)$/);
  if (!match) return { num: 0, suffix: value };
  return { num: parseInt(match[1], 10), suffix: match[2] };
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

  return (
    <div ref={ref} className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-center">
      <div className="text-xl font-black text-white tabular-nums">{Math.round(count)}{suffix}</div>
      <div className="text-xs text-slate-300 mt-0.5">{label}</div>
    </div>
  );
}

export default function AboutStats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {STATS.map(stat => <AnimatedStat key={stat.label} {...stat} />)}
    </div>
  );
}
