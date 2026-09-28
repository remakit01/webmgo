'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Ruler, Flame, CalendarCheck, ArrowRight } from 'lucide-react';
import { ProjectItem } from '@/types';

const CATEGORY_ACCENTS: Record<ProjectItem['category'], {
  bar: string;
  badge: string;
  badgeText: string;
}> = {
  kcn: {
    bar: 'bg-gradient-to-r from-[#7CB305] to-[#5F8A03]',
    badge: 'bg-[#5F8A03]',
    badgeText: 'text-white',
  },
  commercial: {
    bar: 'bg-gradient-to-r from-[#F26522] to-[#D95314]',
    badge: 'bg-[#D95314]',
    badgeText: 'text-white',
  },
  residential: {
    bar: 'bg-gradient-to-r from-blue-500 to-blue-700',
    badge: 'bg-blue-600',
    badgeText: 'text-white',
  },
  infrastructure: {
    bar: 'bg-gradient-to-r from-slate-500 to-slate-700',
    badge: 'bg-slate-700',
    badgeText: 'text-white',
  },
};

const CARD_HOVER: Record<ProjectItem['category'], string> = {
  kcn:            'hover:border-[#7CB305]/50',
  commercial:     'hover:border-[#F26522]/50',
  residential:    'hover:border-blue-400/50',
  infrastructure: 'hover:border-slate-400/50',
};

export default function ProjectCard({ project }: { project: ProjectItem }) {
  const accent = CATEGORY_ACCENTS[project.category];
  const hoverBorder = CARD_HOVER[project.category];
  const href = project.applicationSlug
    ? `/giai-phap-ung-dung/${project.applicationSlug}`
    : '/giai-phap-ung-dung';

  return (
    <div className={`group bg-white rounded-3xl border border-slate-200 shadow-sm ${hoverBorder} hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full`}>

      {/* Project Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        <img
          src={project.image}
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

        {/* Overlay badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${accent.badge} ${accent.badgeText} shadow-md`}>
            {project.categoryLabel}
          </span>
          <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#F26522] text-white shadow-md">
            {project.fireRating}
          </span>
        </div>

        {/* Year badge bottom-right */}
        <div className="absolute bottom-3 right-3">
          <span className="px-2.5 py-1 rounded-xl bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold flex items-center gap-1">
            <CalendarCheck size={11} />
            {project.completedYear}
          </span>
        </div>
      </div>

      {/* Top color bar */}
      <div className={`h-1.5 ${accent.bar}`} />

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1">

        {/* Project Name */}
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-[#5F8A03] transition-colors leading-snug mb-2">
          {project.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
          <MapPin size={13} className="text-[#F26522] flex-shrink-0" />
          <span>{project.location}</span>
        </div>

        {/* Info Strip: 3 cells */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-slate-50 rounded-xl p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Ruler size={11} className="text-slate-400" />
            </div>
            <div className="text-xs font-black text-slate-900">{project.scale}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Diện tích</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Flame size={11} className="text-[#F26522]" />
            </div>
            <div className="text-xs font-black text-slate-900">{project.fireRating}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Chịu lửa</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 text-center">
            <div className="text-xs font-black text-slate-900">{project.completedYear}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Hoàn thành</div>
          </div>
        </div>

        {/* Application summary */}
        <p className="text-xs text-slate-500 leading-relaxed flex-1 mb-4">
          <span className="font-semibold text-slate-700">Ứng dụng: </span>
          {project.application}
        </p>

        {/* Client + CTA */}
        <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 font-medium truncate">
            {project.client}
          </span>
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 group-hover:bg-[#5F8A03] text-slate-700 group-hover:text-white text-xs font-bold transition-all duration-200 flex-shrink-0"
          >
            <span>Xem Giải Pháp</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
