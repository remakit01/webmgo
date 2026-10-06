'use client';

import React, { useId } from 'react';
import { Search } from 'lucide-react';
import {
  AI_WRITER_AUDIENCES,
  AI_WRITER_AUDIENCE_LABEL,
  AI_WRITER_LENGTHS,
  AI_WRITER_LENGTH_WORDS,
  AI_WRITER_LIMITS,
  type AiWriterAudience,
  type AiWriterLength,
} from '@remak/shared/contracts/ai-writer';
import { inputClass } from '@/cms/components/shared/form-styles';

export interface KeywordForm {
  keyword: string;
  secondary: string;
  audience: AiWriterAudience;
  length: AiWriterLength;
  notes: string;
}

const LENGTH_LABEL: Record<AiWriterLength, string> = { short: 'Ngắn', medium: 'Vừa', long: 'Dài' };

/** B1: keyword + yêu cầu bài viết */
export default function KeywordStep({
  form,
  onChange,
  onSubmit,
  busy,
}: {
  form: KeywordForm;
  onChange: (patch: Partial<KeywordForm>) => void;
  onSubmit: () => void;
  busy: boolean;
}) {
  const id = useId();
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (form.keyword.trim() && !busy) onSubmit();
      }}
    >
      <div className="space-y-1">
        <label htmlFor={`${id}-kw`} className="text-xs font-bold text-slate-700">Keyword chính *</label>
        <input
          id={`${id}-kw`}
          value={form.keyword}
          maxLength={AI_WRITER_LIMITS.keyword}
          onChange={(e) => onChange({ keyword: e.target.value })}
          placeholder="vd: tấm MGO bọc ống gió"
          className={inputClass}
          autoFocus
        />
      </div>
      <div className="space-y-1">
        <label htmlFor={`${id}-sec`} className="text-xs font-bold text-slate-700">Keyword phụ</label>
        <input
          id={`${id}-sec`}
          value={form.secondary}
          onChange={(e) => onChange({ secondary: e.target.value })}
          placeholder="Cách nhau bằng dấu phẩy, vd: ống gió EI 60, vách ngăn chống cháy"
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor={`${id}-aud`} className="text-xs font-bold text-slate-700">Người đọc</label>
          <select id={`${id}-aud`} value={form.audience} onChange={(e) => onChange({ audience: e.target.value as AiWriterAudience })} className={inputClass}>
            {AI_WRITER_AUDIENCES.map((a) => (
              <option key={a} value={a}>{AI_WRITER_AUDIENCE_LABEL[a]}</option>
            ))}
          </select>
        </div>
        <fieldset className="space-y-1">
          <legend className="text-xs font-bold text-slate-700 mb-1">Độ dài</legend>
          <div className="flex rounded-lg border border-slate-300 overflow-hidden">
            {AI_WRITER_LENGTHS.map((l) => (
              <label key={l} className={`flex-1 text-center px-1 py-1.5 text-[11px] font-semibold cursor-pointer ${form.length === l ? 'bg-[#5F8A03] text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>
                <input type="radio" name={`${id}-len`} value={l} checked={form.length === l} onChange={() => onChange({ length: l })} className="sr-only" />
                {LENGTH_LABEL[l]}
                <span className="block text-[10px] font-normal opacity-80">~{AI_WRITER_LENGTH_WORDS[l].toLocaleString('vi-VN')} từ</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="space-y-1">
        <label htmlFor={`${id}-notes`} className="text-xs font-bold text-slate-700">Ý chính / ghi chú cho AI</label>
        <textarea
          id={`${id}-notes`}
          rows={4}
          value={form.notes}
          maxLength={AI_WRITER_LIMITS.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="vd: nhấn mạnh hồ sơ nghiệm thu; thông số tấm Remak dày 12 mm đạt EI 60 tại IBST (AI chỉ dùng thông số sản phẩm bạn ghi ở đây)"
          className={`${inputClass} leading-relaxed`}
        />
        <p className="text-[11px] text-slate-500">Thông số sản phẩm Remak (độ dày, EI, chứng nhận…) chỉ được AI dùng khi bạn ghi ở đây.</p>
      </div>
      <button
        type="submit"
        disabled={!form.keyword.trim() || busy}
        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Search size={14} aria-hidden="true" /> Nghiên cứu keyword
      </button>
    </form>
  );
}
