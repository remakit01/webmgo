'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Flame, 
  Layers, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Building2, 
  ArrowRight,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { ApplicationItem } from '@/types';

interface ApplicationCardProps {
  application: ApplicationItem;
}

export default function ApplicationCard({ application }: ApplicationCardProps) {
  const [showLayers, setShowLayers] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-[#7CB305]/50 transition-all duration-300 flex flex-col justify-between">
      
      {/* 1. TOP MEDIA & HERO OVERLAYS */}
      <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-900 group">
        <img
          src={application.image}
          alt={application.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
        />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <span className="px-3 py-1 rounded-xl bg-white/95 text-[#5F8A03] text-xs font-bold backdrop-blur-md shadow-md">
            {application.categoryLabel}
          </span>
          <span className="px-3 py-1 rounded-xl bg-[#F26522] text-white text-xs font-bold shadow-md flex items-center gap-1.5">
            <Flame size={14} />
            <span>{application.fireRating}</span>
          </span>
        </div>

        {/* Bottom Overlay Info */}
        <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Scale size={16} className="text-[#A0D911]" />
            <span className="font-semibold text-white truncate max-w-xs">{application.weightAdvantage}</span>
          </div>
          <span className="text-[11px] text-slate-300 hidden sm:inline-block">Đốt mẫu IBST</span>
        </div>
      </div>

      {/* 2. CARD CONTENT BODY */}
      <div className="p-5 sm:p-6 space-y-4 flex-grow">
        
        {/* Title & Tagline */}
        <div>
          <Link href={`/giai-phap-ung-dung/${application.slug}`} className="group/title block">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover/title:text-[#5F8A03] transition-colors leading-snug">
              {application.title}
            </h3>
          </Link>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {application.tagline}
          </p>
        </div>

        {/* Thickness & Weight Specs (Compact Bar) */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600 flex items-center gap-1.5">
            <Layers size={14} className="text-[#5F8A03]" />
            <span>Độ dày:</span>
          </span>
          <span className="font-bold text-[#5F8A03] bg-[#F4F9E8] px-2.5 py-0.5 rounded-md border border-[#7CB305]/30">
            {application.recommendedThickness}
          </span>
        </div>

        {/* 3 Key Highlights (Concise & Scannable) */}
        <div className="space-y-1.5 pt-1">
          {application.keyFeatures.slice(0, 3).map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
              <CheckCircle2 size={14} className="text-[#5F8A03] flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1">{feat}</span>
            </div>
          ))}
        </div>

        {/* Typical Projects */}
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
          <Building2 size={13} className="text-slate-400 flex-shrink-0" />
          <span className="truncate"><strong>Ứng dụng:</strong> {application.typicalProjects}</span>
        </div>

      </div>

      {/* 3. CARD ACTION FOOTER */}
      <div className="p-5 pt-0 flex items-center gap-2.5">
        <Link
          href={`/giai-phap-ung-dung/${application.slug}`}
          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-[#F4F9E8] text-slate-800 hover:text-[#5F8A03] font-bold text-xs transition-colors border border-slate-200 flex items-center justify-center gap-1.5"
        >
          <span>Xem Giải Pháp</span>
          <ArrowRight size={13} />
        </Link>

        <Link
          href="/bao-gia"
          className="py-2.5 px-4 rounded-xl bg-[#F26522] hover:bg-[#D95314] text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
        >
          <FileText size={13} />
          <span>Báo Giá</span>
        </Link>
      </div>

    </div>
  );
}
