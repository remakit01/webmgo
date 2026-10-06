'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2, Sparkles, X } from 'lucide-react';
import type { AiResearchEvent, AiResearchResult } from '@remak/shared/contracts/ai-writer';
import { aiWriterApi } from '@/cms/lib/ai-writer-api';
import { aiKnowledgeApi } from '@/cms/lib/ai-knowledge-api';
import { ApiError } from '@/cms/lib/api-client';
import { useToast } from '@/cms/components/ConfirmDialog';
import { assembleAiDoc, emptySlots, hasLink, removeLink, type AiDocSlots } from './ai-doc';
import KeywordStep, { type KeywordForm } from './KeywordStep';
import ResearchStep, { type ResearchSelection } from './ResearchStep';
import OutlineStep, { type EditableOutline } from './OutlineStep';
import WritingStep, { INITIAL_WRITING, type WritingState } from './WritingStep';
import { AI_FIELD_LABEL, type AiFillField, type AiFillPatch, type AiWriterHost } from './types';

type Step = 'keyword' | 'research' | 'outline' | 'writing';

const STEPS: { key: Step; label: string }[] = [
  { key: 'keyword', label: 'Keyword' },
  { key: 'research', label: 'Nghiên cứu' },
  { key: 'outline', label: 'Dàn ý' },
  { key: 'writing', label: 'Viết' },
];

const STAGE_LABEL: Record<Extract<AiResearchEvent, { type: 'stage' }>['stage'], string> = {
  knowledge: 'Đang tra cứu kho kiến thức nội bộ & bài đã đăng…',
  searching: 'Đang tìm trên Google…',
  fallback: 'Không tìm Google được — AI tổng hợp từ kiến thức sẵn có…',
  structuring: 'Đang tổng hợp ý chính, câu hỏi, keyword phụ…',
  checking: 'Đang kiểm tra bài trùng chủ đề trên site…',
};

const firstN = (n: number, length: number) => new Set(Array.from({ length: Math.min(n, length) }, (_, i) => i));
const pick = <T,>(items: T[], set: Set<number>) => items.filter((_, i) => set.has(i));

/** Thông báo lỗi AI cho người viết (theo mã HTTP) */
function describeError(err: unknown): string {
  const status = err instanceof ApiError ? err.status : 500;
  const message = err instanceof Error ? err.message : '';
  if (status === 429) return 'Bạn gọi AI quá nhiều lần trong một phút. Đợi khoảng 1 phút rồi thử lại.';
  if (status === 503) return `${message || 'AI chưa được cấu hình'}. Vui lòng báo quản trị kỹ thuật.`;
  if (status === 0) return 'Không kết nối được tới máy chủ. Kiểm tra mạng rồi thử lại.';
  return message || 'AI đang bận, vui lòng thử lại.';
}

/**
 * Panel "Viết cùng AI" (drawer phải): keyword -> nghiên cứu -> dàn ý -> viết.
 * Mỗi bước điền thẳng vào form qua `host`; không tự lưu, không tự xuất bản.
 */
export default function AiWriterPanel({ open, onClose, host }: { open: boolean; onClose: () => void; host: AiWriterHost }) {
  const showToast = useToast();
  const [step, setStep] = useState<Step>('keyword');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<KeywordForm>({ keyword: host.initialKeyword, secondary: '', audience: 'contractor', length: 'medium', notes: '' });
  const [research, setResearch] = useState<AiResearchResult | null>(null);
  const [selection, setSelection] = useState<ResearchSelection>({
    keyPoints: new Set(),
    keywords: new Set(),
    questions: new Set(),
    knowledge: new Set(),
    articles: new Set(),
    suggestions: new Set(),
  });
  const [tagsBusy, setTagsBusy] = useState(false);
  const [suggestionsBusy, setSuggestionsBusy] = useState(false);
  const [savedSuggestions, setSavedSuggestions] = useState<Set<number>>(new Set());
  const [outline, setOutline] = useState<EditableOutline | null>(null);
  const [writing, setWriting] = useState<WritingState>(INITIAL_WRITING);
  // Ô người dùng đã tự nhập — AI không ghi đè, giữ đề xuất để người dùng chủ động dùng
  const [suggestions, setSuggestions] = useState<AiFillPatch>({});
  const abortRef = useRef<AbortController | null>(null);

  // Rời trang / đóng editor khi AI đang chạy -> ngắt kết nối để server dừng gọi Gemini
  useEffect(() => () => abortRef.current?.abort(), []);

  // Esc đóng panel (không huỷ việc đang chạy)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      // Esc trong hộp xác nhận / dialog khác chỉ đóng dialog đó, không đóng panel phía sau
      if (e.key !== 'Escape' || e.defaultPrevented || document.querySelector('dialog[open], [role="alertdialog"], [aria-modal="true"]')) return;
      onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const newAbort = () => {
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    return abort;
  };

  /** Điền ô; ô bị bỏ qua (người dùng đã gõ) -> lưu thành đề xuất */
  const fill = (patch: AiFillPatch, options?: { force?: boolean }) => {
    const skipped = host.fill(patch, options);
    setSuggestions((s) => {
      const next = { ...s };
      for (const key of Object.keys(patch) as AiFillField[]) {
        if (skipped.includes(key)) next[key] = patch[key];
        else delete next[key];
      }
      return next;
    });
  };

  // ── B1: Nghiên cứu ─────────────────────────────────────────────────────

  const runResearch = async () => {
    const abort = newAbort();
    setBusy(STAGE_LABEL.searching);
    setError(null);
    try {
      let result: AiResearchResult | null = null;
      await aiWriterApi.research(
        {
          keyword: form.keyword.trim(),
          secondaryKeywords: form.secondary.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 10),
          audience: form.audience,
          notes: form.notes.trim() || undefined,
        },
        (event) => {
          if (event.type === 'stage') setBusy(STAGE_LABEL[event.stage]);
          else if (event.type === 'error') throw new ApiError(event.message, event.status);
          else result = event.research;
        },
        abort.signal,
      );
      const r = result as AiResearchResult | null;
      if (!r) throw new ApiError('AI không trả kết quả, vui lòng thử lại', 502);
      setResearch(r);
      setSelection({
        keyPoints: firstN(6, r.keyPoints.length),
        keywords: firstN(4, r.relatedKeywords.length),
        questions: firstN(4, r.questions.length),
        knowledge: firstN(r.knowledge.length, r.knowledge.length),
        articles: firstN(r.relatedArticles.length, r.relatedArticles.length),
        suggestions: new Set(),
      });
      setSavedSuggestions(new Set());
      setOutline(null);
      fill({ focusKeyword: r.keyword });
      host.setFanOut(r.fanOutQueries);
      setStep('research');
    } catch (err) {
      if (!abort.signal.aborted) setError(describeError(err));
    } finally {
      if (abortRef.current === abort) abortRef.current = null;
      setBusy(null);
    }
  };

  const applyTags = async () => {
    if (!research) return;
    setTagsBusy(true);
    try {
      const added = await host.addTags(pick(research.relatedKeywords, selection.keywords));
      showToast(added ? `Đã gắn ${added} tag` : 'Các tag này đã có trong bài', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không gắn được tag', 'error');
    } finally {
      setTagsBusy(false);
    }
  };

  const saveSuggestions = async () => {
    if (!research) return;
    const indexes = [...selection.suggestions].filter((i) => !savedSuggestions.has(i));
    if (!indexes.length) return;
    setSuggestionsBusy(true);
    try {
      const r = await aiKnowledgeApi.acceptSuggestions(indexes.map((i) => research.knowledgeSuggestions[i]));
      setSavedSuggestions((s) => new Set([...s, ...indexes]));
      showToast(
        `Đã lưu ${r.created.length} mẩu vào kho kiến thức${r.skipped ? ` (${r.skipped} mẩu trùng nên bỏ qua)` : ''}`,
        'success',
      );
    } catch (err) {
      showToast(describeError(err), 'error');
    } finally {
      setSuggestionsBusy(false);
    }
  };

  /** Id kiến thức / bài đã chọn — server tải lại nội dung theo id */
  const contextIds = () =>
    research
      ? {
          knowledgeIds: pick(research.knowledge, selection.knowledge).map((k) => k.id),
          articleIds: pick(research.relatedArticles, selection.articles).map((a) => a.postId),
        }
      : {};

  // ── B2: Dàn ý ─────────────────────────────────────────────────────────

  const runOutline = async () => {
    if (!research) return;
    const abort = newAbort();
    setBusy('Đang lập dàn ý, tiêu đề, sapo, SEO…');
    setError(null);
    try {
      const o = await aiWriterApi.outline(
        {
          keyword: research.keyword,
          audience: form.audience,
          length: form.length,
          keyPoints: pick(research.keyPoints, selection.keyPoints),
          questions: pick(research.questions, selection.questions),
          researchText: research.researchText,
          sources: research.sources,
          notes: form.notes.trim() || undefined,
          ...contextIds(),
        },
        abort.signal,
      );
      setOutline({ titleOptions: o.titleOptions, titleIndex: 0, sapo: o.sapo, seoTitle: o.seoTitle, seoDescription: o.seoDescription, sections: o.sections, faq: o.faq.map((f) => f.question) });
      fill({ title: o.titleOptions[0], sapo: o.sapo, seoTitle: o.seoTitle, seoDescription: o.seoDescription, coverAlt: o.coverAlt, focusKeyword: research.keyword });
      if (o.categoryId && !host.setCategory(o.categoryId)) {
        const name = host.categories.find((c) => c.id === o.categoryId)?.name;
        if (name) showToast(`AI đề xuất chuyên mục "${name}" — giữ chuyên mục bạn đã chọn`, 'info');
      }
      setStep('outline');
    } catch (err) {
      if (!abort.signal.aborted) setError(describeError(err));
    } finally {
      if (abortRef.current === abort) abortRef.current = null;
      setBusy(null);
    }
  };

  // ── B3: Viết ──────────────────────────────────────────────────────────

  const runDraft = async () => {
    if (!research || !outline) return;
    const sections = outline.sections
      .map((s) => ({ ...s, heading: s.heading.trim(), points: s.points.map((p) => p.trim()).filter(Boolean) }))
      .filter((s) => s.heading);
    if (sections.length) sections[0] = { ...sections[0], level: 2 };
    const faq = outline.faq.map((q) => q.trim()).filter(Boolean);
    if (!(await host.confirmReplaceContent())) return;

    const abort = newAbort();
    const slots: AiDocSlots = emptySlots(sections.length);
    const push = () => host.setContent(assembleAiDoc(slots));
    setError(null);
    setStep('writing');
    setWriting({ ...INITIAL_WRITING, running: true, total: sections.length });
    host.setWriting(true);
    try {
      await aiWriterApi.draft(
        {
          keyword: research.keyword,
          audience: form.audience,
          length: form.length,
          title: outline.titleOptions[outline.titleIndex] ?? outline.titleOptions[0],
          sapo: outline.sapo,
          seoTitle: outline.seoTitle || undefined,
          seoDescription: outline.seoDescription || undefined,
          fanOutQueries: research.fanOutQueries,
          sections,
          faq: faq.map((question) => ({ question })),
          researchText: research.researchText,
          sources: research.sources,
          notes: form.notes.trim() || undefined,
          ...contextIds(),
        },
        (event) => {
          switch (event.type) {
            case 'summary':
              slots.summary = event.nodes;
              push();
              setWriting((w) => ({ ...w, summaryDone: true }));
              break;
            case 'section':
              // Mục có thể được gửi lại sau vòng tự sửa: thay đúng vị trí, đếm theo số mục đã có
              slots.sections[event.index] = event.nodes;
              push();
              setWriting((w) => ({ ...w, sectionsDone: slots.sections.filter(Boolean).length }));
              break;
            case 'quality':
              setWriting((w) => ({ ...w, quality: { before: event.before, after: event.after, fixes: event.fixes } }));
              break;
            case 'faq':
              slots.faq = event.nodes;
              push();
              setWriting((w) => ({ ...w, faqDone: true }));
              break;
            case 'references':
              slots.references = event.nodes;
              push();
              break;
            case 'result':
              setWriting((w) => ({ ...w, warnings: event.warnings, links: event.linkSuggestions }));
              break;
            case 'error':
              throw new ApiError(event.message, event.status);
          }
        },
        abort.signal,
      );
      setWriting((w) => ({ ...w, running: false, finished: true }));
    } catch (err) {
      if (abort.signal.aborted) {
        setWriting((w) => ({ ...w, running: false, finished: true, cancelled: true }));
      } else {
        setWriting((w) => ({ ...w, running: false, finished: w.sectionsDone > 0, cancelled: w.sectionsDone > 0 }));
        setError(describeError(err));
        if (!slots.sections.some(Boolean)) setStep('outline');
      }
    } finally {
      if (abortRef.current === abort) abortRef.current = null;
      host.setWriting(false);
    }
  };

  const removeSuggestedLink = (href: string) => {
    const doc = host.getContent();
    if (hasLink(doc, href)) host.setContent(removeLink(doc, href));
    setWriting((w) => ({ ...w, links: w.links.map((l) => (l.href === href ? { ...l, removed: true } : l)) }));
  };

  const cancel = () => abortRef.current?.abort();
  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const pending = Object.entries(suggestions).filter(([, v]) => v) as [AiFillField, string][];

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="ai-writer-title"
      inert={!open}
      className={`fixed top-0 right-0 z-40 h-full w-full sm:w-[440px] bg-white border-l border-slate-300 shadow-2xl flex flex-col transition-transform duration-300 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <header className="px-5 pt-4 pb-3 border-b border-slate-200 space-y-3">
        <div className="flex items-start gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center shrink-0">
            <Sparkles size={16} aria-hidden="true" />
          </span>
          <div className="flex-1 min-w-0">
            <h2 id="ai-writer-title" className="text-sm font-bold text-slate-900">Viết cùng AI</h2>
            <p className="text-[11px] text-slate-500">AI điền thẳng vào form bản tiếng Việt; bạn duyệt rồi mới lưu.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng panel" className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <ol className="flex items-center gap-1" aria-label="Các bước">
          {STEPS.map((s, i) => (
            <li key={s.key} className="flex-1">
              <span
                aria-current={i === stepIndex ? 'step' : undefined}
                className={`block text-center text-[10px] font-bold uppercase tracking-wide py-1 rounded ${
                  i === stepIndex ? 'bg-[#5F8A03] text-white' : i < stepIndex ? 'bg-[#F4F9E8] text-[#4E7202]' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {i + 1}. {s.label}
              </span>
            </li>
          ))}
        </ol>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {error && (
          <div role="alert" className="flex gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-800">
            <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {pending.length > 0 && (
          <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 space-y-1.5">
            <p className="text-[11px] font-bold text-sky-900">Bạn đã tự nhập các ô dưới đây nên AI không ghi đè:</p>
            {pending.map(([field, value]) => (
              <div key={field} className="flex items-start gap-2 text-[11px]">
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sky-900">{AI_FIELD_LABEL[field]}:</span> <span className="text-sky-800">{value}</span>
                </div>
                <button type="button" onClick={() => fill({ [field]: value }, { force: true })} className="shrink-0 font-semibold text-[#4E7202] hover:underline cursor-pointer">
                  Dùng đề xuất AI
                </button>
              </div>
            ))}
          </div>
        )}

        {busy && (
          <div aria-live="polite" className="flex items-center justify-between gap-2 rounded-lg border border-[#7CB305]/40 bg-[#F4F9E8] px-3 py-2.5">
            <span className="flex items-center gap-2 text-xs font-semibold text-[#4E7202]">
              <Loader2 size={14} className="animate-spin" aria-hidden="true" /> {busy}
            </span>
            <button type="button" onClick={cancel} className="text-[11px] font-semibold text-slate-600 hover:text-rose-600 cursor-pointer">
              Huỷ
            </button>
          </div>
        )}

        {step === 'keyword' && <KeywordStep form={form} onChange={(p) => setForm((f) => ({ ...f, ...p }))} onSubmit={runResearch} busy={!!busy} />}
        {step === 'research' && research && (
          <ResearchStep
            research={research}
            selection={selection}
            onSelectionChange={setSelection}
            onApplyTags={applyTags}
            tagsBusy={tagsBusy}
            onSaveSuggestions={saveSuggestions}
            savedSuggestions={savedSuggestions}
            suggestionsBusy={suggestionsBusy}
            onBack={() => setStep('keyword')}
            onNext={runOutline}
            busy={!!busy}
          />
        )}
        {step === 'outline' && outline && (
          <OutlineStep
            outline={outline}
            onChange={setOutline}
            onPickTitle={(i) => {
              setOutline({ ...outline, titleIndex: i });
              fill({ title: outline.titleOptions[i] }, { force: true });
            }}
            onBack={() => setStep('research')}
            onWrite={runDraft}
            busy={!!busy || writing.running}
          />
        )}
        {step === 'writing' && (
          <WritingStep
            state={writing}
            hasFaq={!!outline?.faq.some((q) => q.trim())}
            onCancel={cancel}
            onRemoveLink={removeSuggestedLink}
            onBackToOutline={() => setStep('outline')}
            onClose={onClose}
          />
        )}
      </div>
    </aside>
  );
}
