'use client';

import React from 'react';
import { ArrowDown, ArrowUp, PenLine, Plus, Trash2 } from 'lucide-react';
import { AI_WRITER_LIMITS, type AiOutlineSection } from '@remak/shared/contracts/ai-writer';
import { inputClass } from '@/cms/components/shared/form-styles';

export interface EditableOutline {
  titleOptions: string[];
  titleIndex: number;
  sapo: string;
  seoTitle: string;
  seoDescription: string;
  sections: AiOutlineSection[];
  faq: string[];
}

const move = <T,>(list: T[], from: number, to: number) => {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

const iconBtn = 'p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed';

/** B3: duyệt & sửa dàn ý trước khi AI viết */
export default function OutlineStep({
  outline,
  onChange,
  onPickTitle,
  onBack,
  onWrite,
  busy,
}: {
  outline: EditableOutline;
  onChange: (next: EditableOutline) => void;
  onPickTitle: (index: number) => void;
  onBack: () => void;
  onWrite: () => void;
  busy: boolean;
}) {
  const setSection = (i: number, patch: Partial<AiOutlineSection>) =>
    onChange({ ...outline, sections: outline.sections.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const validSections = outline.sections.filter((s) => s.heading.trim());

  return (
    <div className="space-y-5">
      <fieldset className="space-y-1.5">
        <legend className="text-xs font-bold text-slate-800 mb-1">Tiêu đề (đã điền vào form — chọn phương án khác nếu muốn)</legend>
        {outline.titleOptions.map((t, i) => (
          <label key={i} className={`flex items-start gap-2 rounded-lg border px-2.5 py-2 text-xs cursor-pointer ${outline.titleIndex === i ? 'border-[#7CB305] bg-[#F4F9E8]' : 'border-slate-200 hover:bg-slate-50'}`}>
            <input type="radio" name="ai-title" checked={outline.titleIndex === i} onChange={() => onPickTitle(i)} className="accent-[#5F8A03] mt-0.5" />
            <span className="font-semibold text-slate-800">{t}</span>
            <span className="ml-auto text-[10px] text-slate-400 tabular-nums">{t.length}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-bold text-slate-800 mb-1">
          Dàn ý ({validSections.length}/{AI_WRITER_LIMITS.sections} mục)
        </legend>
        <ol className="space-y-2">
          {outline.sections.map((s, i) => (
            <li key={i} className={`rounded-lg border border-slate-200 bg-white p-2 space-y-1.5 ${s.level === 3 ? 'ml-5' : ''}`}>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSection(i, { level: s.level === 2 ? 3 : 2 })}
                  disabled={i === 0}
                  title="Đổi H2 / H3"
                  className="shrink-0 w-8 py-1 rounded text-[10px] font-black bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer disabled:cursor-not-allowed"
                >
                  H{s.level}
                </button>
                <input
                  value={s.heading}
                  maxLength={200}
                  onChange={(e) => setSection(i, { heading: e.target.value })}
                  aria-label={`Tiêu đề mục ${i + 1}`}
                  className="flex-1 min-w-0 text-xs font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-[#5F8A03] focus:outline-none py-1"
                />
                <button type="button" className={iconBtn} onClick={() => onChange({ ...outline, sections: move(outline.sections, i, i - 1) })} disabled={i === 0} aria-label="Lên">
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  className={iconBtn}
                  onClick={() => onChange({ ...outline, sections: move(outline.sections, i, i + 1) })}
                  disabled={i === outline.sections.length - 1}
                  aria-label="Xuống"
                >
                  <ArrowDown size={13} />
                </button>
                <button type="button" className={`${iconBtn} hover:text-rose-600`} onClick={() => onChange({ ...outline, sections: outline.sections.filter((_, j) => j !== i) })} aria-label="Xoá mục">
                  <Trash2 size={13} />
                </button>
              </div>
              <textarea
                rows={Math.max(2, s.points.length)}
                value={s.points.join('\n')}
                onChange={(e) => setSection(i, { points: e.target.value.split('\n').slice(0, AI_WRITER_LIMITS.pointsPerSection) })}
                aria-label={`Ý cần viết của mục ${i + 1} (mỗi dòng một ý)`}
                placeholder="Mỗi dòng một ý cần viết"
                className={`${inputClass} text-[11px] leading-relaxed py-1.5`}
              />
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() => onChange({ ...outline, sections: [...outline.sections, { level: 2, heading: '', points: [] }] })}
          disabled={outline.sections.length >= AI_WRITER_LIMITS.sections}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5F8A03] hover:underline cursor-pointer disabled:opacity-50"
        >
          <Plus size={12} aria-hidden="true" /> Thêm mục
        </button>
      </fieldset>

      <fieldset className="space-y-1.5">
        <legend className="text-xs font-bold text-slate-800 mb-1">Câu hỏi FAQ cuối bài</legend>
        {outline.faq.map((q, i) => (
          <div key={i} className="flex items-center gap-1">
            <input
              value={q}
              maxLength={AI_WRITER_LIMITS.itemLength}
              onChange={(e) => onChange({ ...outline, faq: outline.faq.map((x, j) => (j === i ? e.target.value : x)) })}
              aria-label={`Câu hỏi FAQ ${i + 1}`}
              className={`${inputClass} text-xs py-1.5`}
            />
            <button type="button" className={`${iconBtn} hover:text-rose-600`} onClick={() => onChange({ ...outline, faq: outline.faq.filter((_, j) => j !== i) })} aria-label="Xoá câu hỏi">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange({ ...outline, faq: [...outline.faq, ''] })}
          disabled={outline.faq.length >= AI_WRITER_LIMITS.faq}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5F8A03] hover:underline cursor-pointer disabled:opacity-50"
        >
          <Plus size={12} aria-hidden="true" /> Thêm câu hỏi
        </button>
      </fieldset>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onBack} disabled={busy} className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50">
          Quay lại
        </button>
        <button
          type="button"
          onClick={onWrite}
          disabled={busy || !validSections.length}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PenLine size={14} aria-hidden="true" /> Viết bài ({validSections.length} mục)
        </button>
      </div>
    </div>
  );
}
