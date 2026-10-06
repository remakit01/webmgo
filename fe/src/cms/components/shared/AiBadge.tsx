import React from 'react';
import { Sparkles } from 'lucide-react';

/** Nhãn nhỏ đánh dấu ô do AI điền (mất đi khi người dùng sửa ô) */
export default function AiBadge() {
  return (
    <span
      title="Do AI điền — hãy đọc duyệt"
      className="inline-flex items-center gap-0.5 rounded px-1 py-px text-[9px] font-black uppercase tracking-wide bg-[#F4F9E8] text-[#4E7202] border border-[#7CB305]/40"
    >
      <Sparkles size={9} aria-hidden="true" /> AI
    </span>
  );
}
