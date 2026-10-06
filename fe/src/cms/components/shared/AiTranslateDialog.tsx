'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, Copy, Loader2, RotateCcw, Sparkles, X } from 'lucide-react';
import type { AiErrorInfo } from './ai-error';

export type AiTranslatePhase = 'connecting' | 'prepare' | 'translate' | 'assemble' | 'done' | 'error';

export interface AiTranslateState {
  phase: AiTranslatePhase;
  startedAt: number;
  finishedAt?: number;
  /** Thời điểm nhận sự kiện gần nhất — để thanh tiến trình nhích dần khi đang chờ một lô */
  lastEventAt?: number;
  prepare?: { fields: number; chars: number; blocks: number; images: number };
  progress?: { done: number; total: number; cached: number; batchesDone: number; batchesTotal: number };
  /** Số đoạn AI làm mất định dạng (đậm/nghiêng/link) */
  fallbackBlocks?: number;
  error?: AiErrorInfo;
}

const fmtTime = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Số lô chạy song song phía API (TranslationService BATCH_CONCURRENCY) */
const PARALLEL_BATCHES = 3;

/**
 * % tổng: kết nối 2%, đọc bài 8%, dịch 8→92% theo số mục đã dịch, ghép bài 96%, xong 100%.
 * Trong lúc chờ các lô đang chạy, thanh nhích dần (chậm lại theo thời gian) nhưng không vượt mốc thật kế tiếp —
 * số liệu hiển thị bằng chữ luôn là số thật.
 */
function percentOf(state: AiTranslateState, now: number): number {
  if (state.phase === 'done') return 100;
  if (state.phase === 'assemble') return 96;
  const p = state.progress;
  if (!p || p.total === 0) return state.phase === 'prepare' || state.phase === 'translate' ? 8 : 2;
  const real = 8 + (p.done / p.total) * 84;
  const pendingBatches = p.batchesTotal - p.batchesDone;
  if (pendingBatches <= 0 || p.done >= p.total) return Math.round(real);
  // Chỉ nhích tới mốc "thêm một lô xong" (không phải cả các lô song song) để khi lô xong, mốc thật không thấp hơn
  const perBatch = (p.total - p.cached) / p.batchesTotal;
  const next = 8 + (Math.min(p.total, p.done + perBatch) / p.total) * 84;
  const waited = Math.max(0, now - (state.lastEventAt ?? state.startedAt));
  const creep = 0.9 * (1 - Math.exp(-waited / 12_000)); // ~60% sau 12s, tối đa 90% khoảng tới mốc kế tiếp
  return Math.round(real + (next - real) * creep);
}

/**
 * Dialog tiến trình AI dịch (dùng chung mọi màn dịch dài): các bước, thanh %, thời gian đã chạy & ước tính còn lại.
 * Đang chạy: "Huỷ dịch" (Esc cũng huỷ). Xong: tóm tắt + "Xem bản dịch". Lỗi: thông báo + thử lại / chép nguyên văn.
 */
export default function AiTranslateDialog({
  open,
  state,
  title = 'Dịch sang tiếng Anh bằng AI',
  onCancel,
  onClose,
  onRetry,
  onCopySource,
}: {
  open: boolean;
  state: AiTranslateState | null;
  title?: string;
  onCancel: () => void;
  onClose: () => void;
  onRetry: () => void;
  onCopySource?: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [now, setNow] = useState(() => Date.now());
  // % đã hiển thị của lượt dịch hiện tại (run = startedAt) — thanh tiến trình không bao giờ lùi
  const [shown, setShown] = useState({ run: 0, value: 0 });
  const running = !!state && state.phase !== 'done' && state.phase !== 'error';

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Đồng hồ thời gian chạy + ghi nhận % đã hiển thị (chỉ khi đang dịch)
  useEffect(() => {
    if (!running || !state) return;
    const t = setInterval(() => {
      const at = Date.now();
      setNow(at);
      setShown((cur) => ({
        run: state.startedAt,
        value: Math.max(cur.run === state.startedAt ? cur.value : 0, percentOf(state, at)),
      }));
    }, 500);
    return () => clearInterval(t);
  }, [running, state]);

  if (!state) return <dialog ref={ref} className="hidden" />;

  const floor = shown.run === state.startedAt ? shown.value : 0;
  const percent = Math.max(floor, percentOf(state, now));
  const elapsed = (state.finishedAt ?? now) - state.startedAt;
  const p = state.progress;
  // Ước tính còn lại theo tốc độ các ô đã dịch thật (không tính ô lấy lại từ bộ nhớ dịch)
  const translatedNow = p ? p.done - p.cached : 0;
  const remainingFields = p ? p.total - p.done : 0;
  const eta = p && translatedNow > 0 && remainingFields > 0 ? (elapsed / translatedNow) * remainingFields : null;

  const stepState = (step: 'prepare' | 'translate' | 'assemble' | 'done') => {
    const order = ['connecting', 'prepare', 'translate', 'assemble', 'done'];
    const current = state.phase === 'error' ? order.indexOf(state.progress ? 'translate' : 'prepare') : order.indexOf(state.phase);
    const idx = order.indexOf(step);
    if (state.phase === 'error' && idx === current) return 'error';
    if (idx < current || state.phase === 'done') return 'done';
    if (idx === current) return 'active';
    return 'todo';
  };

  const steps: { key: 'prepare' | 'translate' | 'assemble' | 'done'; label: string; detail?: string }[] = [
    {
      key: 'prepare',
      label: 'Đọc bài tiếng Việt & tách đoạn',
      detail: state.prepare
        ? `${state.prepare.blocks} đoạn văn/tiêu đề · ${state.prepare.images} ảnh · ${state.prepare.chars.toLocaleString('vi-VN')} ký tự`
        : undefined,
    },
    {
      key: 'translate',
      label: 'Dịch nội dung (Gemini)',
      detail: p
        ? `${p.done}/${p.total} mục${p.batchesTotal ? ` · lô ${p.batchesDone}/${p.batchesTotal}` : ''}${p.cached ? ` · ${p.cached} mục dùng lại bản đã dịch` : ''}`
        : undefined,
    },
    { key: 'assemble', label: 'Ghép bản dịch vào bài & tạo đường dẫn tiếng Anh', detail: 'Giữ nguyên ảnh, bảng, video, link và định dạng' },
    { key: 'done', label: 'Hoàn tất — điền vào form để bạn duyệt', detail: 'Chưa lưu gì cho tới khi bạn bấm Lưu nháp' },
  ];

  const statusText =
    state.phase === 'done'
      ? `Đã dịch xong trong ${fmtTime(elapsed)}`
      : state.phase === 'error'
        ? state.error?.title ?? 'Không dịch được'
        : state.phase === 'connecting'
          ? 'Đang kết nối dịch vụ AI…'
          : state.phase === 'assemble'
            ? 'Đang ghép bản dịch…'
            : p
              ? p.batchesTotal > p.batchesDone
                ? `Đang chờ Gemini trả lời lô ${p.batchesDone + 1}${Math.min(p.batchesTotal, p.batchesDone + PARALLEL_BATCHES) > p.batchesDone + 1 ? `–${Math.min(p.batchesTotal, p.batchesDone + PARALLEL_BATCHES)}` : ''}/${p.batchesTotal}…`
                : `Đã dịch ${p.done}/${p.total} mục`
              : 'Đang đọc bài…';

  return (
    <dialog
      ref={ref}
      aria-labelledby="ai-translate-title"
      aria-describedby="ai-translate-status"
      onCancel={(e) => {
        e.preventDefault();
        if (running) onCancel();
        else onClose();
      }}
      className="w-[min(560px,calc(100vw-32px))] rounded-2xl border border-slate-300 p-0 shadow-2xl backdrop:bg-slate-900/50 m-auto"
    >
      <div className="px-6 pt-5 pb-4 border-b border-slate-200 flex items-start gap-3">
        <span className="w-9 h-9 rounded-xl bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center shrink-0">
          <Sparkles size={18} aria-hidden="true" />
        </span>
        <div className="flex-1 min-w-0">
          <h2 id="ai-translate-title" className="text-sm font-bold text-slate-900">{title}</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Gemini dịch theo thuật ngữ MGO/PCCC của Remak; bài dài có thể mất 1–2 phút.</p>
        </div>
        {!running && (
          <button type="button" onClick={onClose} aria-label="Đóng" className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Thanh tiến trình */}
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-3">
            <p id="ai-translate-status" aria-live="polite" className={`text-sm font-bold ${state.phase === 'error' ? 'text-rose-700' : 'text-slate-900'}`}>
              {statusText}
            </p>
            <span className="text-2xl font-black tabular-nums text-[#5F8A03]">{percent}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Tiến trình dịch"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden"
          >
            <div
              className={`h-full rounded-full transition-[width] duration-500 ease-out ${
                state.phase === 'error' ? 'bg-rose-400' : state.phase === 'done' ? 'bg-[#5F8A03]' : 'bg-gradient-to-r from-[#7CB305] to-[#5F8A03]'
              } ${running ? 'animate-pulse' : ''}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
            <span>Đã chạy {fmtTime(elapsed)}</span>
            {running && <span>{eta !== null ? `Còn khoảng ${fmtTime(eta)}` : 'Đang ước tính thời gian…'}</span>}
          </div>
        </div>

        {/* Các bước */}
        <ol className="space-y-3">
          {steps.map((step, i) => {
            const s = stepState(step.key);
            return (
              <li key={step.key} className="flex items-start gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                    s === 'done'
                      ? 'bg-[#5F8A03] text-white'
                      : s === 'active'
                        ? 'bg-[#F4F9E8] text-[#5F8A03] ring-2 ring-[#7CB305]'
                        : s === 'error'
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-slate-100 text-slate-400'
                  }`}
                  aria-hidden="true"
                >
                  {s === 'done' ? <Check size={13} /> : s === 'active' ? <Loader2 size={13} className="animate-spin" /> : s === 'error' ? <AlertCircle size={13} /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className={`block text-xs font-semibold ${s === 'todo' ? 'text-slate-400' : 'text-slate-800'}`}>
                    {step.label}
                    <span className="sr-only">
                      {s === 'done' ? ' (xong)' : s === 'active' ? ' (đang chạy)' : s === 'error' ? ' (lỗi)' : ' (chờ)'}
                    </span>
                  </span>
                  {step.detail && s !== 'todo' && <span className="block text-[11px] text-slate-500 mt-0.5">{step.detail}</span>}
                </span>
              </li>
            );
          })}
        </ol>

        {state.phase === 'error' && state.error && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">{state.error.message}</div>
        )}
        {state.phase === 'done' && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 space-y-1">
            <p>
              <strong>Bản dịch đã điền vào tab English — chưa lưu.</strong> Hãy đọc duyệt thuật ngữ, số liệu, tên tiêu chuẩn trước khi lưu.
            </p>
            {!!state.fallbackBlocks && <p>Có {state.fallbackBlocks} đoạn AI làm mất định dạng (đậm/nghiêng/link) — kiểm tra lại các đoạn đó.</p>}
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex items-center justify-end gap-2">
        {running ? (
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer">
            Huỷ dịch
          </button>
        ) : state.phase === 'error' ? (
          <>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer">
              Đóng
            </button>
            {state.error?.action === 'copy' && onCopySource ? (
              <button type="button" onClick={onCopySource} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold cursor-pointer">
                <Copy size={13} aria-hidden="true" /> Chép nguyên văn tiếng Việt
              </button>
            ) : (
              <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold cursor-pointer">
                <RotateCcw size={13} aria-hidden="true" /> Thử lại
              </button>
            )}
          </>
        ) : (
          <button type="button" autoFocus onClick={onClose} className="px-5 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold cursor-pointer">
            Xem bản dịch
          </button>
        )}
      </div>
    </dialog>
  );
}
