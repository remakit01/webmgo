'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Star, X, PhoneCall, ArrowRight } from 'lucide-react';
import { DOCUMENTS, type DocType } from '@/data/documents';
import { TYPE_CONFIG } from './config';
import TechLibraryCategoryCards from './TechLibraryCategoryCards';
import DocCard from './DocCard';
import DocCardFeatured from './DocCardFeatured';

export default function TechLibraryClientView() {
  const [activeType, setActiveType] = useState<DocType | 'all'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let docs = activeType === 'all' ? DOCUMENTS : DOCUMENTS.filter(d => d.type === activeType);
    if (query.trim()) {
      const q = query.toLowerCase();
      docs = docs.filter(d =>
        d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q),
      );
    }
    return docs;
  }, [activeType, query]);

  const featured = useMemo(() => DOCUMENTS.filter(d => d.featured), []);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: DOCUMENTS.length };
    for (const d of DOCUMENTS) {
      map[d.type] = (map[d.type] ?? 0) + 1;
    }
    return map;
  }, []);

  const showFeatured = !query && activeType === 'all';

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Search bar strip */}
      <div className="bg-white border-b border-slate-200 px-4 lg:px-8 py-4">
        <div className="max-w-[1440px] mx-auto">
          <div className="relative max-w-xl">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm tài liệu... (VD: EI60, ống gió, ISO 1182)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#7CB305] focus:bg-white transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10 space-y-10">

        {/* Category Cards */}
        <TechLibraryCategoryCards
          activeType={activeType}
          counts={counts}
          onSelect={setActiveType}
        />

        {/* Featured Section */}
        {showFeatured && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <Star size={16} className="text-amber-500 fill-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">Tài Liệu Được Tải Nhiều Nhất</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {featured.map(doc => (
                <DocCardFeatured key={doc.id} doc={doc} />
              ))}
            </div>
          </section>
        )}

        {/* Document Grid */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {activeType === 'all' ? 'Tất Cả Tài Liệu' : TYPE_CONFIG[activeType].label}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {filtered.length === 0 ? 'Không có kết quả' : (
                  <>Hiển thị <strong className="text-slate-800">{filtered.length}</strong> tài liệu</>
                )}
              </p>
            </div>
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
              <Search size={36} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium mb-1">Không tìm thấy tài liệu phù hợp</p>
              <p className="text-xs text-slate-400 mb-4">Thử từ khoá khác hoặc xoá bộ lọc</p>
              <button
                onClick={() => { setQuery(''); setActiveType('all'); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <X size={13} />
                Xoá bộ lọc
              </button>
            </div>
          )}

          {/* Cards grid */}
          {filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(doc => (
                <DocCard key={doc.id} doc={doc} />
              ))}
            </div>
          )}
        </section>

        {/* CTA Banner */}
        <section className="py-2">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-500/20">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Không Tìm Thấy Tài Liệu Cần Thiết?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Remak cung cấp bộ hồ sơ năng lực đầy đủ theo yêu cầu — biên bản IBST công chứng,
                bản vẽ CAD hoàn công và danh mục dự án tham chiếu cho từng công trình cụ thể.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0 w-full md:w-auto">
              <a
                href="tel:0902441981"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <PhoneCall size={15} />
                <span>Hotline Kỹ Thuật: 0902.441.981</span>
              </a>
              <Link
                href="/bao-gia"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/20 flex items-center justify-center gap-2"
              >
                <ArrowRight size={15} />
                <span>Nhận Hồ Sơ Theo Yêu Cầu</span>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
