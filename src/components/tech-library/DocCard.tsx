'use client';

import { Download, Package } from 'lucide-react';
import type { DocumentItem } from '@/data/documents';
import { TYPE_CONFIG, CERT_BADGE_COLORS, handleDownload } from './config';

export default function DocCard({ doc }: { doc: DocumentItem }) {
  const cfg = TYPE_CONFIG[doc.type];
  const Icon = cfg.icon;

  return (
    <div className="group bg-white rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top accent stripe */}
      <div className={`h-[3px] w-full transition-colors duration-300 ${
        doc.type === 'cad'   ? 'bg-blue-400/0 group-hover:bg-blue-400' :
        doc.type === 'ibst'  ? 'bg-[#7CB305]/0 group-hover:bg-[#7CB305]' :
        doc.type === 'cert'  ? 'bg-amber-400/0 group-hover:bg-amber-400' :
        'bg-purple-400/0 group-hover:bg-purple-400'
      }`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header: icon + type badge + format */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
              <Icon size={16} className={cfg.iconColor} />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${cfg.badge}`}>
              {cfg.badgeText}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">{doc.format}</span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#5F8A03] transition-colors leading-snug mb-1.5 line-clamp-2">
          {doc.title}
        </h3>

        {/* Description */}
        <p className="text-[11px] text-slate-500 leading-relaxed mb-3 line-clamp-2 flex-1">
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

        {/* Meta + Download */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <Package size={11} />
            <span>{doc.size}</span>
            <span className="text-slate-300">·</span>
            <span>{doc.updatedAt}</span>
          </div>
          <button
            onClick={() => handleDownload(doc.downloadUrl, doc.title)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-[#5F8A03] text-slate-600 group-hover:text-white text-[11px] font-bold transition-all duration-200 flex-shrink-0 cursor-pointer"
          >
            <Download size={11} />
            Tải về
          </button>
        </div>
      </div>
    </div>
  );
}
