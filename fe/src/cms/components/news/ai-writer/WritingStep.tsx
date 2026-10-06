'use client';

import React from 'react';
import { Check, Gauge, Link2, Loader2, TriangleAlert, Unlink } from 'lucide-react';
import type { AiLinkSuggestion, AiQualityScores } from '@remak/shared/contracts/ai-writer';

export interface WritingState {
  running: boolean;
  /** Đã kết thúc (xong hoặc huỷ) */
  finished: boolean;
  cancelled: boolean;
  total: number;
  sectionsDone: number;
  summaryDone: boolean;
  faqDone: boolean;
  warnings: string[];
  links: (AiLinkSuggestion & { removed?: boolean })[];
  /** Điểm nội dung trước / sau vòng tự sửa + việc AI đã sửa */
  quality: { before: AiQualityScores; after: AiQualityScores; fixes: string[] } | null;
}

export const INITIAL_WRITING: WritingState = {
  running: false,
  finished: false,
  cancelled: false,
  total: 0,
  sectionsDone: 0,
  summaryDone: false,
  faqDone: false,
  warnings: [],
  links: [],
  quality: null,
};

const QUALITY_LABEL: [keyof AiQualityScores, string][] = [
  ['seo', 'SEO'],
  ['aeo', 'AEO'],
  ['geo', 'GEO'],
];

const scoreTone = (n: number) => (n >= 80 ? 'text-[#4E7202]' : n >= 50 ? 'text-amber-600' : 'text-rose-600');

/** B4: tiến trình viết (nội dung hiện dần trong editor) + gợi ý link nội bộ để duyệt */
export default function WritingStep({
  state,
  hasFaq,
  onCancel,
  onRemoveLink,
  onBackToOutline,
  onClose,
}: {
  state: WritingState;
  hasFaq: boolean;
  onCancel: () => void;
  onRemoveLink: (href: string) => void;
  onBackToOutline: () => void;
  onClose: () => void;
}) {
  // Tổng việc: tóm tắt + các mục + FAQ (nếu có)
  const totalJobs = state.total + 1 + (hasFaq ? 1 : 0);
  const doneJobs = state.sectionsDone + (state.summaryDone ? 1 : 0) + (state.faqDone ? 1 : 0);
  const percent = state.finished && !state.cancelled ? 100 : Math.round((doneJobs / Math.max(1, totalJobs)) * 100);
  // Gộp theo trang đích: "Gỡ" gỡ mọi chỗ trỏ tới trang đó
  const groups = [...new Set(state.links.map((l) => l.href))].map((href) => {
    const items = state.links.filter((l) => l.href === href);
    return { href, title: items[0].title, removed: items.every((l) => l.removed), anchors: [...new Set(items.map((l) => l.anchorText))] , count: items.length };
  });

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-end justify-between gap-2">
          <p aria-live="polite" className="text-sm font-bold text-slate-900">
            {state.running
              ? state.total
                ? `Đang viết… ${state.sectionsDone}/${state.total} mục`
                : 'Đang chuẩn bị…'
              : state.cancelled
                ? `Đã dừng — giữ ${state.sectionsDone}/${state.total} mục đã viết`
                : 'Đã viết xong — nội dung đã chèn vào editor'}
          </p>
          <span className="text-xl font-black tabular-nums text-[#5F8A03]">{percent}%</span>
        </div>
        <div role="progressbar" aria-label="Tiến trình viết bài" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div className={`h-full rounded-full bg-gradient-to-r from-[#7CB305] to-[#5F8A03] transition-[width] duration-500 ${state.running ? 'animate-pulse' : ''}`} style={{ width: `${percent}%` }} />
        </div>
        <ul className="text-[11px] text-slate-600 space-y-0.5">
          <li className="flex items-center gap-1.5">{state.summaryDone ? <Check size={12} className="text-[#5F8A03]" /> : <Loader2 size={12} className={state.running ? 'animate-spin' : ''} />} Hộp &ldquo;Tóm tắt nhanh&rdquo;</li>
          <li className="flex items-center gap-1.5">
            {state.total && state.sectionsDone === state.total ? <Check size={12} className="text-[#5F8A03]" /> : <Loader2 size={12} className={state.running ? 'animate-spin' : ''} />} Các mục theo dàn ý ({state.sectionsDone}/{state.total})
          </li>
          {hasFaq && (
            <li className="flex items-center gap-1.5">{state.faqDone ? <Check size={12} className="text-[#5F8A03]" /> : <Loader2 size={12} className={state.running ? 'animate-spin' : ''} />} Khối FAQ</li>
          )}
        </ul>
        {state.running && (
          <button type="button" onClick={onCancel} className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
            Dừng (giữ các mục đã viết)
          </button>
        )}
      </div>

      {state.quality && (
        <section className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 space-y-1.5" aria-label="Điểm nội dung sau khi AI tự sửa">
          <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Gauge size={13} className="text-[#5F8A03]" aria-hidden="true" /> Điểm nội dung
          </h3>
          <p className="flex items-center gap-3 text-xs tabular-nums flex-wrap">
            {QUALITY_LABEL.map(([key, label]) => {
              const { before, after } = state.quality!;
              return (
                <span key={key}>
                  <span className="font-semibold text-slate-600">{label}</span>{' '}
                  {before[key] !== after[key] && <span className="text-slate-400 line-through mr-1">{before[key]}</span>}
                  <strong className={scoreTone(after[key])}>{after[key]}</strong>
                </span>
              );
            })}
          </p>
          {state.quality.fixes.length > 0 ? (
            <ul className="text-[11px] text-slate-600 space-y-0.5">
              <li className="font-semibold text-slate-700">AI đã tự sửa:</li>
              {state.quality.fixes.map((f, i) => (
                <li key={i}>• {f}</li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-slate-500">Không cần / không cải thiện được bằng tự sửa — xem gợi ý ở khung “Tối ưu SEO · AEO · GEO”.</p>
          )}
          <p className="text-[10px] text-slate-400">Chỉ tính phần nội dung (chưa gồm tác giả, đường dẫn, ô SEO).</p>
        </section>
      )}

      {state.finished && (
        <div role="note" className="flex gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-[11px] text-amber-900">
          <TriangleAlert size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <p>
              <strong>Bài do AI viết — chưa lưu.</strong> Hãy đọc duyệt, kiểm chứng số liệu và tên tiêu chuẩn, thêm lời trích dẫn thật của kỹ sư Remak (AI không tự bịa trích dẫn), rồi mới Lưu nháp.
            </p>
            {state.warnings.map((w, i) => (
              <p key={i}>• {w}</p>
            ))}
          </div>
        </div>
      )}

      {state.links.length > 0 && (
        <section className="space-y-1.5">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Link2 size={13} aria-hidden="true" /> Link nội bộ AI đã chèn ({groups.filter((g) => !g.removed).length} trang)
          </h3>
          <ul className="space-y-1">
            {groups.map((l) => (
              <li key={l.href} className={`flex items-start gap-2 rounded-lg border px-2.5 py-1.5 ${l.removed ? 'border-slate-200 bg-slate-50 opacity-60' : 'border-slate-200 bg-white'}`}>
                <div className="flex-1 min-w-0 text-[11px]">
                  <p className="font-semibold text-slate-800">
                    {l.anchors.map((a) => `“${a}”`).join(', ')}
                    {l.count > 1 && <span className="font-normal text-slate-500"> · {l.count} chỗ</span>}
                  </p>
                  <p className="text-slate-500 truncate">→ {l.title} <span className="text-slate-400">({l.href})</span></p>
                </div>
                {l.removed ? (
                  <span className="text-[10px] text-slate-500 shrink-0 pt-0.5">Đã gỡ</span>
                ) : (
                  <button type="button" onClick={() => onRemoveLink(l.href)} className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 cursor-pointer">
                    <Unlink size={12} aria-hidden="true" /> Gỡ
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {state.finished && (
        <div className="flex gap-2">
          <button type="button" onClick={onBackToOutline} className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
            Sửa dàn ý & viết lại
          </button>
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold cursor-pointer">
            Đóng & duyệt bài
          </button>
        </div>
      )}
    </div>
  );
}
