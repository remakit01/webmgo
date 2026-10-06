'use client';

import React from 'react';
import Link from 'next/link';
import { BookPlus, BrainCircuit, ExternalLink, FileWarning, ListTree, Loader2, Pin, Tags, TriangleAlert } from 'lucide-react';
import { AI_KNOWLEDGE_KIND_LABEL } from '@remak/shared/contracts/ai-knowledge';
import type { AiResearchResult } from '@remak/shared/contracts/ai-writer';

export interface ResearchSelection {
  keyPoints: Set<number>;
  keywords: Set<number>;
  questions: Set<number>;
  /** Kiến thức nội bộ dùng cho bài (index trong research.knowledge) */
  knowledge: Set<number>;
  /** Bài đã đăng liên quan dùng làm ngữ cảnh / link */
  articles: Set<number>;
  /** Kiến thức mới từ web định lưu vào kho */
  suggestions: Set<number>;
}

const toggle = (set: Set<number>, i: number) => {
  const next = new Set(set);
  if (next.has(i)) next.delete(i);
  else next.add(i);
  return next;
};

function CheckList({
  title,
  items,
  selected,
  onToggle,
  action,
}: {
  title: string;
  items: string[];
  selected: Set<number>;
  onToggle: (i: number) => void;
  action?: React.ReactNode;
}) {
  if (!items.length) return null;
  return (
    <fieldset className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <legend className="text-xs font-bold text-slate-800">
          {title} <span className="font-normal text-slate-500">({selected.size}/{items.length})</span>
        </legend>
        {action}
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i}>
            <label className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed cursor-pointer rounded-md px-1.5 py-1 hover:bg-slate-50">
              <input type="checkbox" checked={selected.has(i)} onChange={() => onToggle(i)} className="accent-[#5F8A03] mt-0.5 shrink-0" />
              <span>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

/** B2: duyệt kết quả nghiên cứu — chọn ý chính, keyword phụ (gắn tag), câu hỏi; xem nguồn & bài trùng */
export default function ResearchStep({
  research,
  selection,
  onSelectionChange,
  onApplyTags,
  tagsBusy,
  onSaveSuggestions,
  savedSuggestions,
  suggestionsBusy,
  onBack,
  onNext,
  busy,
}: {
  research: AiResearchResult;
  selection: ResearchSelection;
  onSelectionChange: (next: ResearchSelection) => void;
  onApplyTags: () => void;
  tagsBusy: boolean;
  /** Lưu các kiến thức mới đã tick vào kho "Kiến thức AI" */
  onSaveSuggestions: () => void;
  /** Index các đề xuất đã lưu vào kho */
  savedSuggestions: Set<number>;
  suggestionsBusy: boolean;
  onBack: () => void;
  onNext: () => void;
  busy: boolean;
}) {
  return (
    <div className="space-y-5">
      {!research.grounded && (
        <div role="note" className="flex gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-[11px] text-amber-900">
          <TriangleAlert size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            <strong>Không tìm Google được lúc này</strong> — AI tổng hợp từ kiến thức sẵn có, <strong>không có nguồn web</strong>. Số liệu, tiêu chuẩn trong bài cần kiểm chứng kỹ trước khi đăng.
          </span>
        </div>
      )}

      {research.duplicates.length > 0 && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 space-y-1.5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-rose-800">
            <FileWarning size={14} aria-hidden="true" /> Site đã có bài cùng chủ đề — cân nhắc cập nhật bài cũ thay vì viết mới
          </p>
          <ul className="space-y-0.5">
            {research.duplicates.map((d) => (
              <li key={d.id} className="text-[11px] text-rose-900">
                <Link href={`/admin/news/${d.id}`} target="_blank" className="underline hover:text-rose-700">{d.title}</Link>
                <span className="text-rose-600"> · {d.status === 'PUBLISHED' ? 'đã đăng' : d.status === 'DRAFT' ? 'nháp' : d.status.toLowerCase()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {research.summary && <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 rounded-lg px-3 py-2.5">{research.summary}</p>}

      {/* Kiến thức nội bộ (kho "Kiến thức AI") — nguồn đúng nhất về sản phẩm Remak */}
      <fieldset className="space-y-1.5 rounded-lg border border-[#7CB305]/40 bg-[#F4F9E8]/50 p-2.5">
        <legend className="px-1 text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <BrainCircuit size={13} className="text-[#5F8A03]" aria-hidden="true" /> Kiến thức nội bộ AI dùng ({selection.knowledge.size}/{research.knowledge.length})
        </legend>
        <p className="text-[10px] text-slate-500">
          Tìm theo {research.retrieval === 'hybrid' ? 'ngữ nghĩa + từ khoá' : 'từ khoá'} trong kho “Kiến thức AI”. Bỏ tick mẩu không hợp với bài.
        </p>
        {research.knowledge.length === 0 ? (
          <p className="text-[11px] text-amber-800">Kho chưa có kiến thức liên quan — thông số sản phẩm Remak sẽ được đánh dấu [cần kiểm chứng].</p>
        ) : (
          <ul className="space-y-0.5">
            {research.knowledge.map((k, i) => (
              <li key={k.id}>
                <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer rounded-md px-1.5 py-1 hover:bg-white">
                  <input
                    type="checkbox"
                    checked={selection.knowledge.has(i)}
                    onChange={() => onSelectionChange({ ...selection, knowledge: toggle(selection.knowledge, i) })}
                    className="accent-[#5F8A03] mt-0.5 shrink-0"
                  />
                  <span>
                    {k.pinned && <Pin size={10} className="inline text-amber-600 mr-1" aria-label="Luôn dùng" />}
                    {k.title} <span className="text-[10px] text-slate-400">· {AI_KNOWLEDGE_KIND_LABEL[k.kind]}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <CheckList
        title="Bài đã đăng liên quan (ngữ cảnh + link nội bộ)"
        items={research.relatedArticles.map((a) => a.title)}
        selected={selection.articles}
        onToggle={(i) => onSelectionChange({ ...selection, articles: toggle(selection.articles, i) })}
      />

      <CheckList
        title="Ý chính đưa vào bài"
        items={research.keyPoints}
        selected={selection.keyPoints}
        onToggle={(i) => onSelectionChange({ ...selection, keyPoints: toggle(selection.keyPoints, i) })}
      />
      <CheckList
        title="Câu hỏi người đọc hay hỏi (làm mục / FAQ)"
        items={research.questions}
        selected={selection.questions}
        onToggle={(i) => onSelectionChange({ ...selection, questions: toggle(selection.questions, i) })}
      />
      <CheckList
        title="Keyword phụ"
        items={research.relatedKeywords}
        selected={selection.keywords}
        onToggle={(i) => onSelectionChange({ ...selection, keywords: toggle(selection.keywords, i) })}
        action={
          <button
            type="button"
            onClick={onApplyTags}
            disabled={!selection.keywords.size || tagsBusy}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-300 bg-white text-[11px] font-semibold text-slate-700 hover:text-[#5F8A03] cursor-pointer disabled:opacity-50"
          >
            <Tags size={12} aria-hidden="true" /> Gắn thành tag
          </button>
        }
      />

      {research.knowledgeSuggestions.length > 0 && (
        <fieldset className="space-y-1.5 rounded-lg border border-violet-200 bg-violet-50/50 p-2.5">
          <legend className="px-1 text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <BookPlus size={13} className="text-violet-600" aria-hidden="true" /> Kiến thức mới từ web — lưu vào kho để AI dùng lần sau?
          </legend>
          <p className="text-[10px] text-slate-500">Chỉ tick thông tin bạn đã kiểm tra nguồn. Lưu xong có thể sửa ở trang “Kiến thức AI”.</p>
          <ul className="space-y-1">
            {research.knowledgeSuggestions.map((s, i) => {
              const saved = savedSuggestions.has(i);
              return (
                <li key={i}>
                  <label className={`flex items-start gap-2 text-xs rounded-md px-1.5 py-1 ${saved ? 'opacity-60' : 'cursor-pointer hover:bg-white'}`}>
                    <input
                      type="checkbox"
                      disabled={saved}
                      checked={saved || selection.suggestions.has(i)}
                      onChange={() => onSelectionChange({ ...selection, suggestions: toggle(selection.suggestions, i) })}
                      className="accent-violet-600 mt-0.5 shrink-0"
                    />
                    <span className="min-w-0">
                      <span className="block font-semibold text-slate-800">
                        {s.title} <span className="font-normal text-[10px] text-slate-400">· {AI_KNOWLEDGE_KIND_LABEL[s.kind]}</span>
                        {saved && <span className="ml-1 text-[10px] font-bold text-violet-700">Đã lưu</span>}
                      </span>
                      <span className="block text-slate-600">{s.content}</span>
                      <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-[10px] text-sky-700 hover:underline break-all">
                        <ExternalLink size={10} aria-hidden="true" /> {s.sourceTitle || s.sourceUrl}
                      </a>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={onSaveSuggestions}
            disabled={suggestionsBusy || ![...selection.suggestions].some((i) => !savedSuggestions.has(i))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold cursor-pointer disabled:opacity-50"
          >
            {suggestionsBusy ? <Loader2 size={12} className="animate-spin" /> : <BookPlus size={12} aria-hidden="true" />} Lưu vào kho kiến thức
          </button>
        </fieldset>
      )}

      {research.sources.length > 0 && (
        <details className="group">
          <summary className="text-xs font-bold text-slate-800 cursor-pointer">Nguồn Google ({research.sources.length})</summary>
          <ul className="mt-1.5 space-y-1">
            {research.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-sky-700 hover:underline break-all">
                  <ExternalLink size={11} className="shrink-0" aria-hidden="true" /> {s.title}
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}
      {/* Điều khoản Grounding with Google Search: phải hiển thị nguyên văn gợi ý tìm kiếm của Google */}
      {research.searchEntryPointHtml && (
        <iframe
          title="Gợi ý tìm kiếm của Google"
          sandbox="allow-popups allow-popups-to-escape-sandbox"
          srcDoc={research.searchEntryPointHtml}
          className="w-full h-20 border-0 rounded-lg bg-white"
        />
      )}

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onBack} disabled={busy} className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50">
          Đổi keyword
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={busy || !selection.keyPoints.size}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ListTree size={14} aria-hidden="true" /> Tạo dàn ý
        </button>
      </div>
    </div>
  );
}
