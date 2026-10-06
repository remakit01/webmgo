'use client';

import React, { useId } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import {
  AI_WRITER_AUDIENCES,
  AI_WRITER_AUDIENCE_LABEL,
  AI_WRITER_LENGTHS,
  AI_WRITER_LENGTH_WORDS,
  AI_WRITER_LIMITS,
  type AiWriterAudience,
  type AiWriterLength,
} from '@remak/shared/contracts/ai-writer';

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
      {/* ── HÀNG 1: KEYWORD CHÍNH & KEYWORD PHỤ (ĐỒNG ĐỀU h-11, BORDER 1PX, FOCUS ĐỔI MÀU, KHÔNG SHADOW) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Keyword chính */}
        <div className="space-y-1.5">
          <label htmlFor={`${id}-kw`} className="text-xs font-bold text-slate-900">
            Keyword chính <span className="text-rose-600">*</span>
          </label>
          <input
            id={`${id}-kw`}
            value={form.keyword}
            maxLength={AI_WRITER_LIMITS.keyword}
            onChange={(e) => onChange({ keyword: e.target.value })}
            placeholder="vd: tấm MGO bọc ống gió"
            autoFocus
            className="h-11 w-full px-3.5 rounded-lg border border-slate-300 hover:border-slate-400 focus:border-[#5F8A03] focus:outline-none text-sm font-semibold text-slate-900 bg-white placeholder:text-slate-500 transition-colors"
          />
        </div>

        {/* Keyword phụ */}
        <div className="space-y-1.5">
          <label htmlFor={`${id}-sec`} className="text-xs font-bold text-slate-900">
            Keyword phụ
          </label>
          <input
            id={`${id}-sec`}
            value={form.secondary}
            onChange={(e) => onChange({ secondary: e.target.value })}
            placeholder="vd: ống gió EI 60, vách chống cháy"
            className="h-11 w-full px-3.5 rounded-lg border border-slate-300 hover:border-slate-400 focus:border-[#5F8A03] focus:outline-none text-sm font-semibold text-slate-900 bg-white placeholder:text-slate-500 transition-colors"
          />
        </div>
      </div>

      {/* ── HÀNG 2: NGƯỜI ĐỌC & ĐỘ DÀI (ĐỒNG ĐỀU h-11, BORDER 1PX, FOCUS ĐỔI MÀU, KHÔNG SHADOW) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Người đọc */}
        <div className="space-y-1.5">
          <label htmlFor={`${id}-aud`} className="block text-xs font-bold text-slate-900">
            Người đọc
          </label>
          <div className="relative">
            <select
              id={`${id}-aud`}
              value={form.audience}
              onChange={(e) => onChange({ audience: e.target.value as AiWriterAudience })}
              className="h-11 w-full pl-3.5 pr-10 rounded-lg border border-slate-300 hover:border-slate-400 focus:border-[#5F8A03] focus:outline-none text-sm font-semibold text-slate-900 bg-white transition-colors appearance-none cursor-pointer"
            >
              {AI_WRITER_AUDIENCES.map((a) => (
                <option key={a} value={a} className="font-medium text-slate-900">
                  {AI_WRITER_AUDIENCE_LABEL[a]}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Độ dài bài viết */}
        <fieldset className="space-y-1.5">
          <legend className="block text-xs font-bold text-slate-900">Độ dài</legend>
          <div className="h-11 flex items-stretch rounded-lg border border-slate-300 bg-slate-50/70 p-1 overflow-hidden">
            {AI_WRITER_LENGTHS.map((l) => (
              <label
                key={l}
                className={`flex-1 flex flex-col justify-center items-center px-1 rounded-md cursor-pointer transition-colors ${
                  form.length === l
                    ? 'bg-[#5F8A03] text-white font-bold'
                    : 'text-slate-700 hover:bg-white hover:text-slate-900 font-semibold'
                }`}
              >
                <input
                  type="radio"
                  name={`${id}-len`}
                  value={l}
                  checked={form.length === l}
                  onChange={() => onChange({ length: l })}
                  className="sr-only"
                />
                <span className="text-xs leading-none">{LENGTH_LABEL[l]}</span>
                <span className="text-[10px] font-normal leading-none mt-1 opacity-90 tabular-nums">
                  ~{AI_WRITER_LENGTH_WORDS[l].toLocaleString('vi-VN')} từ
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* ── HÀNG 3: Ý CHÍNH / GHI CHÚ CHO AI ── */}
      <div className="space-y-1.5">
        <label htmlFor={`${id}-notes`} className="text-xs font-bold text-slate-900">
          Ý chính / ghi chú cho AI
        </label>
        <textarea
          id={`${id}-notes`}
          rows={3}
          value={form.notes}
          maxLength={AI_WRITER_LIMITS.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="vd: nhấn mạnh hồ sơ nghiệm thu; thông số tấm Remak dày 12 mm đạt EI 60 tại IBST..."
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 hover:border-slate-400 focus:border-[#5F8A03] focus:outline-none text-sm font-semibold text-slate-900 bg-white placeholder:text-slate-500 transition-colors leading-relaxed"
        />
        <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2.5 leading-relaxed">
          <strong className="text-slate-800">Lưu ý:</strong> Thông số sản phẩm Remak (độ dày, EI, chứng nhận…) chỉ được AI dùng khi bạn ghi ở đây.
        </p>
      </div>

      {/* ── NÚT BẮT ĐẦU NGHIÊN CỨU KEYWORD ── */}
      <button
        type="submit"
        disabled={!form.keyword.trim() || busy}
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Search size={16} aria-hidden="true" />
        <span>Nghiên cứu keyword</span>
      </button>
    </form>
  );
}
