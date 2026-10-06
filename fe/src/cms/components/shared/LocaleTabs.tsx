'use client';

import React, { useRef } from 'react';

export type CmsLocale = 'vi' | 'en';

interface TabInfo {
  locale: CmsLocale;
  label: string;
  hint?: string;
  dirty?: boolean;
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
    <div
      role="tablist"
      aria-label="Ngôn ngữ nội dung"
      className="inline-flex items-center p-1 bg-slate-100/90 rounded-lg border border-slate-300 gap-1 font-sans"
    >
      {tabs.map((tab, i) => {
        const selected = tab.locale === active;
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
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5F8A03] focus-visible:ring-offset-1 flex items-center gap-1.5 ${
              selected
                ? 'bg-white text-[#5F8A03] border border-slate-300 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
            }`}
          >
            {tab.label}
            {tab.dirty && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"
                title="Có thay đổi chưa lưu"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
