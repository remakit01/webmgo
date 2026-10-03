'use client';

import React from 'react';
import Link from '@/components/ui/LocaleLink';
import { useLocale } from 'next-intl';
import { toLocalePath } from '@/i18n/paths';
import { MapPin, Ruler, Flame, ArrowRight, ArrowUpRight } from 'lucide-react';
import { ProjectItem } from '@/types';

export const CATEGORY_ACCENTS: Record<ProjectItem['category'], {
  bar: string;
  badge: string;
  badgeText: string;
  statBg: string;
  statText: string;
  hoverBorder: string;
}> = {
  kcn: {
    bar:         'bg-gradient-to-r from-[#7CB305] to-[#5F8A03]',
    badge:       'bg-[#5F8A03]',
    badgeText:   'text-white',
    statBg:      'bg-[#F4F9E8]',
    statText:    'text-[#5F8A03]',
    hoverBorder: 'hover:border-[#7CB305]/50',
  },
  commercial: {
    bar:         'bg-gradient-to-r from-[#F26522] to-[#D95314]',
    badge:       'bg-[#D95314]',
    badgeText:   'text-white',
    statBg:      'bg-[#FEF3EC]',
    statText:    'text-[#D95314]',
    hoverBorder: 'hover:border-[#F26522]/50',
  },
  residential: {
    bar:         'bg-gradient-to-r from-blue-500 to-blue-700',
    badge:       'bg-blue-600',
    badgeText:   'text-white',
    statBg:      'bg-blue-50',
    statText:    'text-blue-700',
    hoverBorder: 'hover:border-blue-400/50',
  },
  infrastructure: {
    bar:         'bg-gradient-to-r from-slate-500 to-slate-700',
    badge:       'bg-slate-700',
    badgeText:   'text-white',
    statBg:      'bg-slate-100',
    statText:    'text-slate-700',
    hoverBorder: 'hover:border-slate-400/50',
  },
};

function getSolutionHref(project: ProjectItem) {
  return project.applicationSlug
    ? `/giai-phap-ung-dung/${project.applicationSlug}`
    : '/giai-phap-ung-dung';
}

/* ── Standard card ── */
export default function ProjectCard({ project }: { project: ProjectItem }) {
  const accent = CATEGORY_ACCENTS[project.category];
  const locale = useLocale();
  // Điều hướng bằng window.location -> phải tự đổi URL theo ngôn ngữ (LocaleLink không xử lý được chỗ này)
  const href = toLocalePath(getSolutionHref(project), locale);

  return (
    <Link
      href={`/du-an/${project.slug}`}
      className={`group block bg-white rounded-3xl border border-slate-200 shadow-sm ${accent.hoverBorder} hover:shadow-xl transition-all duration-300 overflow-hidden h-full`}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        <img
          src={project.image}
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
        {/* Single badge: category only */}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-md ${accent.badge} ${accent.badgeText}`}>
          {project.categoryLabel}
        </span>
        {/* Year — bottom right, subtle */}
        <span className="absolute bottom-3 right-3 text-[11px] font-semibold text-white/80">
          {project.completedYear}
        </span>
      </div>

      {/* Accent bar */}
      <div className={`h-[3px] ${accent.bar}`} />

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base sm:text-[17px] font-extrabold text-slate-900 group-hover:text-[#5F8A03] transition-colors leading-snug mb-2">
          {project.name}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
          <MapPin size={13} className="text-[#F26522] flex-shrink-0" />
          <span className="truncate">{project.location}</span>
          <span className="text-slate-300 mx-0.5">·</span>
          <span className="flex-shrink-0">{project.completedYear}</span>
        </div>

        {/* 2 stat chips */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className={`rounded-2xl p-3 ${accent.statBg}`}>
            <div className="flex items-center gap-1 mb-1">
              <Ruler size={11} className="text-slate-400" />
              <span className="text-[10px] text-slate-400 font-medium">Diện tích</span>
            </div>
            <div className={`text-sm font-black ${accent.statText}`}>{project.scale}</div>
          </div>
          <div className={`rounded-2xl p-3 ${accent.statBg}`}>
            <div className="flex items-center gap-1 mb-1">
              <Flame size={11} className="text-[#F26522]" />
              <span className="text-[10px] text-slate-400 font-medium">Chịu lửa</span>
            </div>
            <div className={`text-sm font-black ${accent.statText}`}>{project.fireRating}</div>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed flex-1 mb-4 line-clamp-2">
          {project.application}
        </p>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 font-medium truncate">{project.client}</span>
          <span
            onClick={(e) => { e.preventDefault(); window.location.href = href; }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-[#5F8A03] text-slate-600 group-hover:text-white text-xs font-bold transition-all duration-200 flex-shrink-0"
          >
            Giải pháp
            <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Featured / hero card ── */
export function ProjectCardFeatured({ project }: { project: ProjectItem }) {
  const accent = CATEGORY_ACCENTS[project.category];
  const locale = useLocale();
  // Điều hướng bằng window.location -> phải tự đổi URL theo ngôn ngữ (LocaleLink không xử lý được chỗ này)
  const href = toLocalePath(getSolutionHref(project), locale);

  return (
    <Link
      href={`/du-an/${project.slug}`}
      className={`group block bg-white rounded-3xl border border-slate-200 shadow-sm ${accent.hoverBorder} hover:shadow-2xl transition-all duration-300 overflow-hidden`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[320px]">
        {/* Image — left col on desktop */}
        <div className="relative overflow-hidden bg-slate-100 aspect-[4/3] lg:aspect-auto lg:min-h-[320px]">
          <img
            src={project.image}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/20 lg:to-white/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent lg:hidden" />

          {/* Featured label */}
          <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold border border-white/30">
            ✦ Dự Án Nổi Bật
          </span>

          {/* Category — bottom left */}
          <span className={`absolute bottom-4 left-4 px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-md ${accent.badge} ${accent.badgeText}`}>
            {project.categoryLabel}
          </span>
        </div>

        {/* Content — right col */}
        <div className="flex flex-col justify-center p-7 lg:p-8">
          <div className="mb-4">
            <h3 className="text-xl lg:text-2xl font-black text-slate-900 group-hover:text-[#5F8A03] transition-colors leading-snug mb-2.5">
              {project.name}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin size={14} className="text-[#F26522] flex-shrink-0" />
              <span>{project.location}</span>
              <span className="text-slate-300 mx-1">·</span>
              <span>{project.completedYear}</span>
            </div>
          </div>

          {/* 2 stat chips */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className={`rounded-2xl p-4 ${accent.statBg}`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Ruler size={12} className="text-slate-400" />
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Diện tích</span>
              </div>
              <div className={`text-lg font-black ${accent.statText}`}>{project.scale}</div>
            </div>
            <div className={`rounded-2xl p-4 ${accent.statBg}`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Flame size={12} className="text-[#F26522]" />
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Chịu lửa</span>
              </div>
              <div className={`text-lg font-black ${accent.statText}`}>{project.fireRating}</div>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed mb-6 line-clamp-2">
            {project.application}
          </p>

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400 font-medium">{project.client}</span>
            <span
              onClick={(e) => { e.preventDefault(); window.location.href = href; }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5F8A03] group-hover:bg-[#7CB305] text-white text-xs font-bold transition-colors flex-shrink-0"
            >
              Xem giải pháp
              <ArrowUpRight size={13} />
            </span>
          </div>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className={`h-[3px] ${accent.bar}`} />
    </Link>
  );
}
