'use client';

import React, { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { slugify } from '@remak/shared/slug';
import type { NewsTagCms } from '@/types/news';

/** Chọn tag: gõ để lọc, Enter chọn tag đầu tiên hoặc tạo tag mới (tiếng Việt, dịch sau ở "Tag & Tác Giả") */
export default function TagPicker({
  allTags,
  selected,
  onChange,
  onCreate,
}: {
  allTags: NewsTagCms[];
  selected: string[];
  onChange: (ids: string[]) => void;
  onCreate: (name: string) => Promise<NewsTagCms>;
}) {
  const [text, setText] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const byId = useMemo(() => new Map(allTags.map((t) => [t.id, t])), [allTags]);
  const needle = slugify(text);
  const suggestions = useMemo(
    () =>
      needle
        ? allTags.filter((t) => !selected.includes(t.id) && (t.translations.vi?.slug ?? '').includes(needle)).slice(0, 8)
        : [],
    [allTags, needle, selected],
  );
  const exact = allTags.find((t) => t.translations.vi?.slug === needle);

  const add = (id: string) => {
    onChange([...new Set([...selected, id])].sort());
    setText('');
  };

  const create = async () => {
    if (!text.trim()) return;
    if (exact) return add(exact.id);
    setCreating(true);
    setError(null);
    try {
      add((await onCreate(text.trim())).id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tạo được tag');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {selected.map((id) => (
          <span key={id} className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700">
            {byId.get(id)?.translations.vi?.name ?? '…'}
            <button type="button" onClick={() => onChange(selected.filter((x) => x !== id))} aria-label={`Bỏ tag ${byId.get(id)?.translations.vi?.name ?? ''}`} className="p-0.5 rounded hover:bg-slate-200 cursor-pointer">
              <X size={10} />
            </button>
          </span>
        ))}
        {selected.length === 0 && <span className="text-[11px] text-slate-400">Chưa có tag</span>}
      </div>
      <div className="relative">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (suggestions[0] && !exact) add(suggestions[0].id);
              else void create();
            }
          }}
          placeholder="Gõ tên tag, Enter để thêm"
          aria-label="Thêm tag"
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
        />
        {text.trim() && (
          <div className="absolute z-20 left-0 right-0 mt-1 rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
            {suggestions.map((t) => (
              <button key={t.id} type="button" onClick={() => add(t.id)} className="block w-full text-left px-3 py-2 text-xs hover:bg-[#F4F9E8] cursor-pointer">
                {t.translations.vi?.name}
              </button>
            ))}
            {!exact && (
              <button type="button" onClick={() => void create()} disabled={creating} className="flex w-full items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#5F8A03] hover:bg-[#F4F9E8] border-t border-slate-100 cursor-pointer disabled:opacity-50">
                <Plus size={12} aria-hidden="true" /> Tạo tag “{text.trim()}”
              </button>
            )}
          </div>
        )}
      </div>
      {error && <p role="alert" className="text-[11px] font-semibold text-rose-600">{error}</p>}
    </div>
  );
}
