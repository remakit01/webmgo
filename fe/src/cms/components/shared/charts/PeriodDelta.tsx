import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

/** % thay đổi so với kỳ trước (null nếu kỳ trước = 0) */
export const periodChange = (now: number, before: number) => (before ? Math.round(((now - before) / before) * 100) : null);

/** Nhãn tăng / giảm so với kỳ trước trên thẻ số liệu Tổng Quan */
export default function PeriodDelta({ value }: { value: number | null }) {
  if (value === null) return <span className="text-[10px] text-slate-400">chưa có kỳ trước</span>;
  const up = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${up ? 'text-[#4E7202]' : 'text-rose-600'}`}>
      {up ? <ArrowUpRight size={12} aria-hidden="true" /> : <ArrowDownRight size={12} aria-hidden="true" />}
      {up ? '+' : ''}
      {value}% <span className="sr-only">so với kỳ trước</span>
    </span>
  );
}
