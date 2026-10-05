'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Info, Sparkles, X } from 'lucide-react';
import type { TranslationGroup } from './hero-form';

interface TranslatePickerDialogProps {
  groups: TranslationGroup[];
  onConfirm: (keys: string[]) => void;
  onClose: () => void;
}

/** Checkbox hỗ trợ trạng thái "một phần" (indeterminate) cho nhóm cha */
function TriCheckbox({
  checked,
  indeterminate,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={label}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 accent-[#5F8A03] cursor-pointer shrink-0"
    />
  );
}

/**
 * Dialog chọn ô để AI dịch.
 * Quy tắc: ô KHÔNG tích -> giữ nguyên giá trị; ô ĐƯỢC tích -> AI dịch và ghi đè. Mặc định không tích ô nào.
 */
export default function TranslatePickerDialog({ groups, onConfirm, onClose }: TranslatePickerDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(groups.map((g) => g.id)));

  const allEntries = useMemo(() => groups.flatMap((g) => g.entries), [groups]);
  const overwriteCount = allEntries.filter((e) => selected.has(e.key) && e.value.trim() !== '').length;
  const untranslatedKeys = allEntries.filter((e) => e.value.trim() === '').map((e) => e.key);

  // Focus vào dialog khi mở, trả focus về nút gọi khi đóng; Esc để đóng
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [onClose]);

  const setMany = (keys: string[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => (on ? next.add(k) : next.delete(k)));
      return next;
    });

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Lựa chọn hiện tại khớp với nút chọn nhanh nào -> nút đó ở trạng thái active
  const sameAs = (keys: string[]) => keys.length === selected.size && keys.every((k) => selected.has(k));
  const activeQuick =
    selected.size === 0
      ? 'none'
      : sameAs(allEntries.map((e) => e.key))
        ? 'all'
        : untranslatedKeys.length > 0 && sameAs(untranslatedKeys)
          ? 'untranslated'
          : null;

  const quickBtn = (active: boolean) =>
    `inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
      active
        ? 'border-[#5F8A03] bg-[#F4F9E8] text-[#5F8A03] ring-1 ring-[#5F8A03]/30'
        : 'border-slate-300 bg-white text-slate-700 hover:border-[#7CB305] hover:text-[#5F8A03]'
    }`;
  // Số đếm trong nút chọn nhanh: màu thương hiệu
  const countBadge = 'px-1.5 py-px rounded-md bg-[#5F8A03] text-white text-[10px] font-bold tabular-nums';

  // Portal ra <body>: nếu khối cha có transform/filter/animation, `fixed` sẽ bị neo theo khối cha
  // (dialog tràn theo bề rộng form, không nằm giữa màn hình)
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-[1px] p-4"
      onMouseDown={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        // Gọn: tối đa 560px, cao tối đa 80% màn hình (danh sách bên trong tự cuộn)
        className="w-full max-w-[560px] max-h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 font-sans focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-slate-100">
          <div>
            <h2 id={titleId} className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sparkles size={16} className="text-[#5F8A03]" aria-hidden="true" /> Chọn nội dung cần dịch bằng AI
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ô được tích sẽ được dịch từ tiếng Việt và <strong>ghi đè</strong> bản dịch hiện có. Ô không tích giữ nguyên.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Chọn nhanh */}
        <div className="flex items-center gap-2 flex-wrap px-4 py-2 border-b border-slate-100 bg-slate-50/60">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">Chọn nhanh:</span>
          <button
            type="button"
            className={quickBtn(activeQuick === 'untranslated')}
            aria-pressed={activeQuick === 'untranslated'}
            disabled={untranslatedKeys.length === 0}
            onClick={() => setSelected(new Set(untranslatedKeys))}
          >
            Ô chưa dịch <span className={countBadge}>{untranslatedKeys.length}</span>
          </button>
          <button
            type="button"
            className={quickBtn(activeQuick === 'all')}
            aria-pressed={activeQuick === 'all'}
            onClick={() => setSelected(new Set(allEntries.map((e) => e.key)))}
          >
            Tất cả <span className={countBadge}>{allEntries.length}</span>
          </button>
          <button
            type="button"
            className={quickBtn(activeQuick === 'none')}
            aria-pressed={activeQuick === 'none'}
            onClick={() => setSelected(new Set())}
          >
            Bỏ chọn
          </button>
        </div>

        {/* Danh sách nhóm */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {groups.map((group) => {
            const keys = group.entries.map((e) => e.key);
            const count = keys.filter((k) => selected.has(k)).length;
            const isOpen = expanded.has(group.id);
            return (
              <fieldset key={group.id} className="rounded-xl border border-slate-300">
                <legend className="sr-only">{group.title}</legend>
                <div className="flex items-center gap-3 px-3 py-2">
                  <TriCheckbox
                    label={`Chọn cả nhóm ${group.title}`}
                    checked={count === keys.length}
                    indeterminate={count > 0 && count < keys.length}
                    onChange={(on) => setMany(keys, on)}
                  />
                  <button
                    type="button"
                    onClick={() => toggleExpanded(group.id)}
                    aria-expanded={isOpen}
                    className="flex-1 flex items-center justify-between gap-2 text-left cursor-pointer"
                  >
                    <span className="text-sm font-bold text-slate-900">{group.title}</span>
                    <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                      {count}/{keys.length} ô
                      <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </span>
                  </button>
                </div>

                {isOpen && (
                  <ul className="border-t border-slate-100 divide-y divide-slate-100">
                    {group.entries.map((entry) => {
                      const checked = selected.has(entry.key);
                      const hasTranslation = entry.value.trim() !== '';
                      return (
                        <li key={entry.key}>
                          <label className="flex items-start gap-3 px-3 py-2 pl-9 cursor-pointer hover:bg-slate-50">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => setMany([entry.key], e.target.checked)}
                              className="w-4 h-4 mt-0.5 accent-[#5F8A03] cursor-pointer shrink-0"
                            />
                            <span className="flex-1 min-w-0">
                              <span className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-800">{entry.label}</span>
                                {hasTranslation ? (
                                  <span
                                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                                      checked
                                        ? 'bg-orange-50 text-[#EA580C] border-orange-200'
                                        : 'bg-[#F4F9E8] text-[#5F8A03] border-[#7CB305]/30'
                                    }`}
                                  >
                                    {checked ? 'Sẽ ghi đè' : 'Đã có bản dịch'}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-slate-50 text-slate-500 border-slate-200">
                                    Chưa dịch
                                  </span>
                                )}
                              </span>
                              <span className="block text-[11px] text-slate-500 truncate mt-0.5" title={entry.source}>
                                {entry.source}
                              </span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </fieldset>
            );
          })}

          <p className="flex items-start gap-1.5 text-[11px] text-slate-500 pt-1">
            <Info size={13} className="shrink-0 mt-px text-slate-400" aria-hidden="true" />
            Đường dẫn của các nút không cần dịch — trang tiếng Anh tự đổi sang link /en tương ứng.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 flex-wrap px-4 py-3 border-t border-slate-100">
          <span className="text-xs text-slate-600" aria-live="polite">
            {selected.size === 0
              ? 'Chưa chọn ô nào'
              : `Dịch ${selected.size} ô${overwriteCount ? ` (${overwriteCount} ô sẽ bị ghi đè)` : ''}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Huỷ
            </button>
            <button
              type="button"
              disabled={selected.size === 0}
              onClick={() => onConfirm(allEntries.filter((e) => selected.has(e.key)).map((e) => e.key))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles size={13} aria-hidden="true" /> Dịch {selected.size} ô
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
