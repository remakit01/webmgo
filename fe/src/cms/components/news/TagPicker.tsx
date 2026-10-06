'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, X, Tag as TagIcon } from 'lucide-react';
import { slugify } from '@remak/shared/slug';
import type { NewsTagCms } from '@/types/news';

/** Chọn tag: gõ để lọc hoặc chọn từ danh sách có sẵn, Enter chọn/tạo tag */
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
  const [isOpen, setIsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const byId = useMemo(() => new Map(allTags.map((t) => [t.id, t])), [allTags]);
  const needle = slugify(text);

  const unselectedTags = useMemo(
    () => allTags.filter((t) => !selected.includes(t.id)),
    [allTags, selected],
  );

  const suggestions = useMemo(() => {
    if (!needle) return unselectedTags.slice(0, 10);
    return unselectedTags
      .filter((t) => {
        const name = (t.translations.vi?.name ?? '').toLowerCase();
        const slug = t.translations.vi?.slug ?? '';
        return name.includes(text.toLowerCase()) || slug.includes(needle);
      })
      .slice(0, 10);
  }, [unselectedTags, needle, text]);

  const exact = allTags.find((t) => t.translations.vi?.slug === needle);

  const add = (id: string) => {
    onChange([...new Set([...selected, id])].sort());
    setText('');
    setError(null);
  };

  const create = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (exact) return add(exact.id);
    setCreating(true);
    setError(null);
    try {
      const created = await onCreate(trimmed);
      add(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tạo được tag');
    } finally {
      setCreating(false);
    }
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="space-y-2 relative">
      {/* Danh sách tag đã chọn */}
      <div className="flex flex-wrap gap-1.5">
        {selected.map((id) => (
          <span
            key={id}
            className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-[11px] font-semibold text-slate-700"
          >
            {byId.get(id)?.translations.vi?.name ?? '…'}
            <button
              type="button"
              onClick={() => onChange(selected.filter((x) => x !== id))}
              aria-label={`Bỏ tag ${byId.get(id)?.translations.vi?.name ?? ''}`}
              className="p-0.5 rounded hover:bg-slate-200 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={11} />
            </button>
          </span>
        ))}
        {selected.length === 0 && (
          <span className="text-[11px] text-slate-400 italic">Chưa có tag nào được chọn</span>
        )}
      </div>

      {/* Ô nhập + Dropdown danh sách */}
      <div className="relative">
        <input
          value={text}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onChange={(e) => {
            setText(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (suggestions[0] && !exact) add(suggestions[0].id);
              else void create();
            } else if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          placeholder="Chọn hoặc gõ tìm kiếm tag…"
          aria-label="Thêm tag chủ đề"
          aria-expanded={isOpen}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#5F8A03] focus:ring-1 focus:ring-[#5F8A03] transition-colors"
        />

        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1 rounded-lg border border-slate-300 bg-white shadow-xl overflow-hidden">
            {/* Header gợi ý */}
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span>{text.trim() ? 'Kết quả tìm kiếm' : 'Danh sách tag có sẵn'}</span>
              <span className="tabular-nums font-semibold">{suggestions.length} tag</span>
            </div>

            {/* Danh sách tag gợi ý */}
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
              {suggestions.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => add(t.id)}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-[#F4F9E8] hover:text-[#4E7202] transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <span className="flex items-center gap-1.5">
                    <TagIcon size={12} className="text-slate-400 group-hover:text-[#5F8A03]" />
                    {t.translations.vi?.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">#{t.translations.vi?.slug}</span>
                </button>
              ))}

              {suggestions.length === 0 && !text.trim() && (
                <div className="px-3 py-3 text-xs text-slate-400 text-center">
                  Hệ thống chưa có tag nào khả dụng. Hãy gõ tên để tạo tag mới.
                </div>
              )}

              {/* Nút tạo tag mới khi người dùng gõ từ khóa chưa có */}
              {text.trim() && !exact && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => void create()}
                  disabled={creating}
                  className="w-full flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-[#5F8A03] bg-[#F4F9E8]/50 hover:bg-[#F4F9E8] border-t border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Plus size={13} aria-hidden="true" />
                  <span>Tạo mới tag “{text.trim()}” (Enter)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p role="alert" className="text-[11px] font-semibold text-rose-600">{error}</p>}
    </div>
  );
}
