'use client';

import React, { useDeferredValue, useId, useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { analyzeContent, type CheckStatus, type ContentScore, type ContentScoreInput } from '@remak/shared/content-score';
import AiBadge from '@/cms/components/shared/AiBadge';
import { inputClass } from '@/cms/components/shared/form-styles';

type GroupKey = keyof ContentScore;

const GROUPS: { key: GroupKey; label: string; hint: string }[] = [
  { key: 'seo', label: 'SEO', hint: 'Xếp hạng trên Google tìm kiếm truyền thống.' },
  { key: 'aeo', label: 'AEO', hint: 'Sẵn sàng làm câu trả lời trực tiếp: Google AI Overviews, đoạn trích nổi bật, trợ lý giọng nói.' },
  { key: 'geo', label: 'GEO', hint: 'Khả năng được ChatGPT, Gemini, Perplexity, Claude trích dẫn làm nguồn.' },
];

const STATUS_ORDER: Record<CheckStatus, number> = { bad: 0, warn: 1, good: 2 };

const STATUS_ICON: Record<CheckStatus, React.ReactNode> = {
  good: <CheckCircle2 size={14} className="text-[#5F8A03] shrink-0 mt-px" aria-label="Đạt" />,
  warn: <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-px" aria-label="Nên cải thiện" />,
  bad: <XCircle size={14} className="text-rose-500 shrink-0 mt-px" aria-label="Chưa đạt" />,
};

const scoreColor = (score: number) => (score >= 80 ? 'text-[#4E7202] border-[#7CB305]' : score >= 50 ? 'text-amber-600 border-amber-400' : 'text-rose-600 border-rose-400');

/**
 * Keyword chính + điểm SEO / AEO / GEO (chấm ngay trên trình duyệt bằng analyzeContent của shared).
 * Điểm chỉ để gợi ý, không chặn lưu hay xuất bản.
 */
export default function ContentScorePanel({
  keyword,
  keywordFromAi,
  onKeywordChange,
  input,
}: {
  keyword: string;
  keywordFromAi?: boolean;
  onKeywordChange: (value: string) => void;
  input: Omit<ContentScoreInput, 'keyword'>;
}) {
  const keywordId = useId();
  const [active, setActive] = useState<GroupKey>('seo');
  // Nội dung bài chấm sau một nhịp (deferred) — không làm chậm editor khi bài dài
  const doc = useDeferredValue(input.doc);
  const { title, slug, sapo, seoTitle, seoDescription, locale, author, publishedAt, updatedAt, fanOutQueries } = input;
  const score = useMemo(
    () => analyzeContent({ keyword, title, slug, sapo, seoTitle, seoDescription, doc, locale, author, publishedAt, updatedAt, fanOutQueries }),
    [keyword, title, slug, sapo, seoTitle, seoDescription, doc, locale, author, publishedAt, updatedAt, fanOutQueries],
  );
  const group = score[active];
  const checks = [...group.checks].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.weight - a.weight);

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label htmlFor={keywordId} className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          Keyword chính {keywordFromAi && <AiBadge />}
        </label>
        <input
          id={keywordId}
          value={keyword}
          maxLength={100}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="vd: tấm MGO bọc ống gió"
          className={inputClass}
        />
        <p className="text-[11px] text-slate-500">Cụm từ chính người đọc gõ để tìm bài này. Dùng để chấm điểm, không hiển thị trên trang.</p>
      </div>

      <div role="tablist" aria-label="Điểm tối ưu nội dung" className="grid grid-cols-3 gap-2">
        {GROUPS.map((g) => {
          const s = score[g.key].score;
          const selected = active === g.key;
          return (
            <button
              key={g.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(g.key)}
              className={`flex flex-col items-center gap-0.5 rounded-lg border px-2 py-2 cursor-pointer transition-colors ${
                selected ? 'border-slate-900 bg-slate-50' : 'border-slate-300 bg-white hover:border-slate-400'
              }`}
            >
              <span className={`text-lg font-black tabular-nums leading-none border-b-2 pb-0.5 ${scoreColor(s)}`}>{s}</span>
              <span className="text-[11px] font-bold text-slate-700">{g.label}</span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="space-y-2">
        <p className="text-[11px] text-slate-500">{GROUPS.find((g) => g.key === active)?.hint}</p>
        <ul className="space-y-1.5">
          {checks.map((c) => (
            <li key={c.id} className="flex gap-1.5 text-xs leading-relaxed text-slate-700">
              {STATUS_ICON[c.status]}
              <span>{c.message}</span>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-slate-400">Điểm chỉ để gợi ý, không chặn việc xuất bản.</p>
      </div>
    </div>
  );
}
