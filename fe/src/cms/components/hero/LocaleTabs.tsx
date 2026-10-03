'use client';

import React, { useRef } from 'react';

export type CmsLocale = 'vi' | 'en';

interface TabInfo {
  locale: CmsLocale;
  label: string;
  hint: string;
  dirty: boolean;
  /** Tiến độ dịch (chỉ tab bản dịch) */
  progress?: { done: number; total: number };
}

/** Tab ngôn ngữ chuẩn WAI-ARIA: role tablist/tab, phím ←/→/Home/End để chuyển. */
export default function LocaleTabs({
  tabs,
  active,
  onChange,
  panelId,
}: {
  tabs: TabInfo[];
  active: CmsLocale;
  onChange: (locale: CmsLocale) => void;
  panelId: string;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const focusTab = (index: number) => {
    const tab = tabs[(index + tabs.length) % tabs.length];
    onChange(tab.locale);
    refs.current[tab.locale]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') focusTab(index + 1);
    else if (e.key === 'ArrowLeft') focusTab(index - 1);
    else if (e.key === 'Home') focusTab(0);
    else if (e.key === 'End') focusTab(tabs.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div role="tablist" aria-label="Ngôn ngữ nội dung" className="flex flex-wrap gap-2.5 font-sans">
      {tabs.map((tab, i) => {
        const selected = tab.locale === active;
        const complete = tab.progress && tab.progress.done === tab.progress.total;
        return (
          <button
            key={tab.locale}
            ref={(el) => {
              refs.current[tab.locale] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${tab.locale}`}
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.locale)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5F8A03] focus-visible:ring-offset-1 ${
              selected
                ? 'border-[#5F8A03] bg-[#F4F9E8] shadow-2xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <span
              className={`text-[11px] font-black uppercase w-7 h-7 rounded-lg flex items-center justify-center ${
                selected ? 'bg-[#5F8A03] text-white' : 'bg-slate-100 text-slate-500'
              }`}
              aria-hidden="true"
            >
              {tab.locale}
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                {tab.label}
                {tab.dirty && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#F26522] animate-pulse" aria-hidden="true" />
                    <span className="sr-only">(có thay đổi chưa lưu)</span>
                  </>
                )}
              </span>
              <span className="block text-[11px] text-slate-500 font-medium">{tab.hint}</span>
            </span>
            {tab.progress && (
              <span
                className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  complete
                    ? 'bg-[#F4F9E8] text-[#5F8A03] border-[#7CB305]/40'
                    : 'bg-orange-50 text-[#EA580C] border-orange-200'
                }`}
              >
                Đã dịch {tab.progress.done}/{tab.progress.total}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
