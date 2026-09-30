'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Search, X, PackageOpen, Layers, FileText, ArrowRight, Flame } from 'lucide-react';

import { PRODUCTS } from '@/data/products';
import { APPLICATIONS } from '@/data/applications';
import { DOCUMENTS } from '@/data/documents';

const SUGGESTIONS = [
  'Ống gió EI 60',
  'Vách chống cháy EI 120',
  'Tấm sàn 18mm',
  'CAD bọc ống gió',
  'Biên bản IBST',
  'Hầm đỗ xe',
];

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  category: 'product' | 'application' | 'document';
  badge?: string;
}

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function match(text: string, q: string) {
  return normalize(text).includes(normalize(q));
}

function useSearchResults(query: string): SearchResult[] {
  return useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim();
    const results: SearchResult[] = [];

    // Products
    for (const p of PRODUCTS) {
      if (
        match(p.name, q) || match(p.shortName ?? '', q) ||
        match(p.tagline ?? '', q) || match(p.fireRating ?? '', q) ||
        (p.thicknessList ?? []).some((t: string) => match(t, q))
      ) {
        results.push({
          id: `product-${p.id}`,
          title: p.shortName ?? p.name,
          subtitle: p.fireRating ?? '',
          href: `/san-pham/${p.slug}`,
          category: 'product',
          badge: p.category === 'duct' ? 'Ống gió' : p.category === 'wall' ? 'Vách ngăn' : 'Sàn',
        });
      }
    }

    // Applications
    for (const a of APPLICATIONS) {
      if (
        match(a.title, q) || match(a.tagline ?? '', q) ||
        match(a.fireRating ?? '', q) || match(a.categoryLabel ?? '', q)
      ) {
        results.push({
          id: `app-${a.id}`,
          title: a.title,
          subtitle: `${a.fireRating ?? ''} · ${a.categoryLabel ?? ''}`,
          href: `/giai-phap-ung-dung/${a.slug}`,
          category: 'application',
          badge: a.fireRating,
        });
      }
    }

    // Documents
    for (const d of DOCUMENTS) {
      if (
        match(d.title, q) || match(d.description, q) ||
        d.certBadges.some((b: string) => match(b, q))
      ) {
        results.push({
          id: `doc-${d.id}`,
          title: d.title,
          subtitle: `${d.format} · ${d.size}`,
          href: '/thu-vien-tai-lieu',
          category: 'document',
          badge: d.type === 'cad' ? 'CAD' : d.type === 'ibst' ? 'IBST' : d.type === 'cert' ? 'Chứng chỉ' : 'Hướng dẫn',
        });
      }
    }

    return results;
  }, [query]);
}

const CATEGORY_META = {
  product:     { label: 'Sản Phẩm',       icon: PackageOpen, iconCls: 'text-[#5F8A03]', bgCls: 'bg-[#F4F9E8]', badgeCls: 'bg-[#F4F9E8] text-[#5F8A03]' },
  application: { label: 'Giải Pháp',      icon: Layers,      iconCls: 'text-blue-600',  bgCls: 'bg-blue-50',   badgeCls: 'bg-blue-50 text-blue-700' },
  document:    { label: 'Tài Liệu',       icon: FileText,    iconCls: 'text-amber-600', bgCls: 'bg-amber-50',  badgeCls: 'bg-amber-50 text-amber-700' },
} as const;

type Category = keyof typeof CATEGORY_META;

const MAX_PER_CAT = 4;

function ResultGroup({ category, results, onClose }: {
  category: Category;
  results: SearchResult[];
  onClose: () => void;
}) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  const shown = results.slice(0, MAX_PER_CAT);

  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-2">
        <div className={`w-5 h-5 rounded-md flex items-center justify-center ${meta.bgCls}`}>
          <Icon size={11} className={meta.iconCls} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{meta.label}</span>
        <span className="text-[10px] text-slate-300">({results.length})</span>
      </div>
      {shown.map(r => (
        <Link
          key={r.id}
          href={r.href}
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors group"
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bgCls}`}>
            <Icon size={14} className={meta.iconCls} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 group-hover:text-[#5F8A03] transition-colors truncate">{r.title}</p>
            <p className="text-[11px] text-slate-400 truncate">{r.subtitle}</p>
          </div>
          {r.badge && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${meta.badgeCls}`}>{r.badge}</span>
          )}
          <ArrowRight size={13} className="text-slate-300 group-hover:text-[#7CB305] flex-shrink-0 transition-colors" />
        </Link>
      ))}
      {results.length > MAX_PER_CAT && (
        <Link
          href={category === 'product' ? '/san-pham' : category === 'application' ? '/giai-phap-ung-dung' : '/thu-vien-tai-lieu'}
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-[11px] text-[#5F8A03] hover:text-[#7CB305] font-semibold transition-colors"
        >
          Xem thêm {results.length - MAX_PER_CAT} kết quả
          <ArrowRight size={11} />
        </Link>
      )}
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useSearchResults(query);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      setQuery('');
      inputRef.current?.focus();
    }, 10);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const grouped = {
    product:     results.filter(r => r.category === 'product'),
    application: results.filter(r => r.category === 'application'),
    document:    results.filter(r => r.category === 'document'),
  };
  const hasResults = results.length > 0;
  const noResults = query.trim().length > 1 && !hasResults;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search size={18} className="text-[#7CB305] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Nhập độ dày (10mm), ống gió, vách EI 60, IBST..."
            className="flex-1 outline-none text-slate-800 text-sm placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center flex-shrink-0 transition-colors"
          >
            <X size={14} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto">

          {/* No query — suggestions */}
          {!query.trim() && (
            <div className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Tìm kiếm phổ biến</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-[#F4F9E8] hover:text-[#5F8A03] text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Search size={10} />
                    {s}
                  </button>
                ))}
              </div>

              {/* Quick nav */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                {([
                  { href: '/san-pham',          label: 'Sản Phẩm',  icon: PackageOpen, cls: 'text-[#5F8A03]', bg: 'bg-[#F4F9E8]' },
                  { href: '/giai-phap-ung-dung', label: 'Giải Pháp', icon: Layers,      cls: 'text-blue-600',  bg: 'bg-blue-50' },
                  { href: '/thu-vien-tai-lieu',  label: 'Tài Liệu',  icon: FileText,    cls: 'text-amber-600', bg: 'bg-amber-50' },
                ] as const).map(({ href, label, icon: Icon, cls, bg }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors text-center group"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${bg}`}>
                      <Icon size={15} className={cls} />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-800 transition-colors">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {hasResults && (
            <div className="py-2 divide-y divide-slate-50">
              {(Object.keys(grouped) as Category[]).map(cat =>
                grouped[cat].length > 0 ? (
                  <ResultGroup key={cat} category={cat} results={grouped[cat]} onClose={onClose} />
                ) : null
              )}
            </div>
          )}

          {/* No results */}
          {noResults && (
            <div className="flex flex-col items-center py-10 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Search size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-700 mb-1">Không tìm thấy kết quả</p>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Thử từ khóa khác hoặc liên hệ kỹ sư Remak để được tư vấn
              </p>
              <a
                href="tel:0902441981"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F26522] hover:bg-[#EA580C] text-white text-xs font-bold transition-colors"
              >
                <Flame size={13} />
                Gọi Hotline: 0902.441.981
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
          <span className="text-[10px] text-slate-400">
            {hasResults ? `${results.length} kết quả` : 'Tìm theo sản phẩm, giải pháp, tài liệu kỹ thuật'}
          </span>
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-slate-200 text-slate-500 font-mono text-[9px]">Esc</kbd> Đóng</span>
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-slate-200 text-slate-500 font-mono text-[9px]">↵</kbd> Mở</span>
          </div>
        </div>
      </div>
    </div>
  );
}
