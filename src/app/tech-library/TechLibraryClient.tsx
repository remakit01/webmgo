'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText, Download, FileCode2, FileCheck2, Shield,
  BookOpen, Search, ChevronRight, PhoneCall, Star,
  ArrowRight,
} from 'lucide-react';
import { DOCUMENTS, DOC_TYPES, type DocType } from '@/data/documents';

const TYPE_CONFIG: Record<DocType | 'all', {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  badge: string;
  badgeText: string;
  rowBorder: string;
}> = {
  all: {
    icon: FileText, iconBg: 'bg-slate-100', iconColor: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-600', badgeText: 'Tài liệu',
    rowBorder: 'hover:border-l-slate-400',
  },
  cad: {
    icon: FileCode2, iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
    badge: 'bg-blue-50 text-blue-700 border border-blue-100', badgeText: 'CAD',
    rowBorder: 'hover:border-l-blue-400',
  },
  ibst: {
    icon: FileCheck2, iconBg: 'bg-[#FEF3EC]', iconColor: 'text-[#D95314]',
    badge: 'bg-[#FEF3EC] text-[#D95314] border border-[#F26522]/20', badgeText: 'IBST',
    rowBorder: 'hover:border-l-[#F26522]',
  },
  cert: {
    icon: Shield, iconBg: 'bg-[#F4F9E8]', iconColor: 'text-[#5F8A03]',
    badge: 'bg-[#F4F9E8] text-[#5F8A03] border border-[#7CB305]/20', badgeText: 'Chứng chỉ',
    rowBorder: 'hover:border-l-[#7CB305]',
  },
  guide: {
    icon: BookOpen, iconBg: 'bg-slate-100', iconColor: 'text-slate-700',
    badge: 'bg-slate-100 text-slate-600 border border-slate-200', badgeText: 'Hướng dẫn',
    rowBorder: 'hover:border-l-slate-500',
  },
};

const CERT_BADGE_COLORS: Record<string, string> = {
  'IBST':          'bg-[#FEF3EC] text-[#D95314] border border-[#F26522]/20',
  'QUATEST 3':     'bg-slate-100 text-slate-600 border border-slate-200',
  'ISO 1182':      'bg-blue-50 text-blue-700 border border-blue-100',
  'Bureau Veritas':'bg-purple-50 text-purple-700 border border-purple-100',
  'TCVN 9311':     'bg-[#F4F9E8] text-[#5F8A03] border border-[#7CB305]/20',
  'BXD':           'bg-slate-100 text-slate-600 border border-slate-200',
};

function handleDownload(url: string, title: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = title;
  a.click();
}

export default function TechLibraryClient() {
  const [activeType, setActiveType] = useState<DocType | 'all'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return DOCUMENTS.filter((d) => {
      const matchType = activeType === 'all' || d.type === activeType;
      const matchQ = !q || d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q);
      return matchType && matchQ;
    });
  }, [activeType, query]);

  const featured = useMemo(() => DOCUMENTS.filter((d) => d.featured), []);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: DOCUMENTS.length };
    for (const d of DOCUMENTS) map[d.type] = (map[d.type] || 0) + 1;
    return map;
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 pt-16 pb-14 px-4">
        <div className="max-w-[1440px] mx-auto lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight size={12} />
            <span className="text-white">Thư Viện Kiểm Định</span>
          </nav>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#5F8A03] flex items-center justify-center flex-shrink-0">
              <FileText size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
                Thư Viện Kiểm Định PCCC
              </h1>
              <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                Biên bản đốt lò IBST công chứng, bản vẽ CAD thi công và chứng chỉ quốc tế.
                Tải miễn phí — dùng trực tiếp cho đệ trình vật tư và nghiệm thu PCCC.
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-xl mt-6">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tài liệu... (EI 60, CAD, IBST, chứng nhận...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white/15 focus:border-white/40 transition-all"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { n: `${DOCUMENTS.length}+`, label: 'Tài liệu kỹ thuật' },
              { n: '6',                    label: 'Mức EI có IBST' },
              { n: '4',                    label: 'Chứng chỉ quốc tế' },
              { n: '100%',                 label: 'Miễn phí tải về' },
            ].map(({ n, label }) => (
              <div key={label} className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-center">
                <div className="text-xl font-black text-white">{n}</div>
                <div className="text-xs text-slate-300 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10 space-y-10">

        {/* Featured documents */}
        {!query && activeType === 'all' && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <Star size={15} className="text-[#F26522]" />
              <h2 className="text-base font-extrabold text-slate-900">Tài Liệu Được Tải Nhiều Nhất</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map((doc) => {
                const cfg = TYPE_CONFIG[doc.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={doc.id}
                    className="group bg-white rounded-2xl border border-slate-200 hover:border-[#7CB305]/40 hover:shadow-md transition-all p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className={`w-9 h-9 rounded-xl ${cfg.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={16} className={cfg.iconColor} />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${cfg.badge}`}>
                        {doc.format}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-[#5F8A03] transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{doc.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400">{doc.size}</span>
                      <button
                        type="button"
                        onClick={() => handleDownload(doc.downloadUrl, doc.title)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5F8A03] hover:text-[#7CB305] transition-colors cursor-pointer"
                      >
                        <Download size={12} />
                        Tải xuống
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Filter tabs + document list */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {DOC_TYPES.map((t) => {
                const isActive = activeType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveType(t.id as DocType | 'all')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-[#5F8A03] text-white border-[#5F8A03] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {counts[t.id] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-slate-400 whitespace-nowrap">{filtered.length} tài liệu</span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-400 text-sm">Không tìm thấy tài liệu phù hợp.</p>
              <button
                type="button"
                onClick={() => { setQuery(''); setActiveType('all'); }}
                className="mt-3 text-xs font-bold text-[#5F8A03] hover:underline cursor-pointer"
              >
                Xoá bộ lọc
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
              {filtered.map((doc, idx) => {
                const cfg = TYPE_CONFIG[doc.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={doc.id}
                    className={`flex items-center gap-4 px-5 py-4 border-l-2 border-transparent ${cfg.rowBorder} hover:bg-slate-50 transition-all ${
                      idx < filtered.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl ${cfg.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={15} className={cfg.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900 truncate">{doc.title}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md hidden sm:inline ${cfg.badge}`}>
                          {cfg.badgeText}
                        </span>
                        {doc.certBadges.map((badge) => (
                          <span
                            key={badge}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md hidden md:inline ${CERT_BADGE_COLORS[badge] ?? 'bg-slate-100 text-slate-500'}`}
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{doc.description}</p>
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-0.5 flex-shrink-0">
                      <span className="text-[11px] text-slate-400">{doc.format} · {doc.size}</span>
                      <span className="text-[11px] text-slate-300">Cập nhật {doc.updatedAt}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownload(doc.downloadUrl, doc.title)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-[#7CB305] hover:bg-[#F4F9E8] text-slate-600 hover:text-[#5F8A03] text-xs font-bold transition-all flex-shrink-0 cursor-pointer"
                    >
                      <Download size={12} />
                      <span className="hidden sm:inline">Tải</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Request document CTA */}
        <section className="border border-dashed border-slate-300 rounded-3xl p-6 sm:p-8 bg-white flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Không tìm thấy tài liệu cần thiết?</h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-md leading-relaxed">
              Kỹ sư Remak sẽ chuẩn bị tài liệu theo yêu cầu dự án cụ thể — biên bản IBST công chứng, CAD hoàn công hoặc hồ sơ năng lực đầy đủ.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 flex-shrink-0">
            <a href="tel:0902441981" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white text-xs font-bold transition-colors">
              <PhoneCall size={14} />
              0902.441.981
            </a>
            <Link href="/bao-gia" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors">
              <ArrowRight size={14} />
              Yêu Cầu Tài Liệu
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
