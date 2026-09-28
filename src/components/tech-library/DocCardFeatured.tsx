'use client';

import { Download, Package, Calendar } from 'lucide-react';
import type { DocumentItem } from '@/data/documents';
import { TYPE_CONFIG, CERT_BADGE_COLORS, TYPE_ACCENT_BAR, handleDownload } from './config';

export default function DocCardFeatured({ doc }: { doc: DocumentItem }) {
  const cfg = TYPE_CONFIG[doc.type];
  const Icon = cfg.icon;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top accent */}
      <div className={`h-1.5 ${TYPE_ACCENT_BAR[doc.type] ?? 'bg-slate-300'}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Icon + format badge */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
            <Icon size={20} className={cfg.iconColor} />
          </div>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
            {doc.format}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#5F8A03] transition-colors leading-snug mb-2 line-clamp-2 flex-1">
          {doc.title}
        </h3>

        {/* Description */}
        <p className="text-[11px] text-slate-500 leading-relaxed mb-3 line-clamp-2">
          {doc.description}
        </p>

        {/* Cert badges */}
        {doc.certBadges.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {doc.certBadges.map(b => (
              <span key={b} className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${CERT_BADGE_COLORS[b] ?? 'bg-slate-100 text-slate-600'}`}>
                {b}
              </span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-4">
          <Package size={11} />
          <span>{doc.size}</span>
          <span className="text-slate-300">·</span>
          <Calendar size={11} />
          <span>{doc.updatedAt}</span>
        </div>

        {/* Download button */}
        <button
          onClick={() => handleDownload(doc.downloadUrl, doc.title)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white transition-all ${cfg.downloadBg} ${cfg.downloadHover} hover:shadow-md cursor-pointer`}
        >
          <Download size={13} />
          Tải Xuống
        </button>
      </div>
    </div>
  );
}
