'use client';

import React, { useState, useMemo } from 'react';
import { PhoneCall, FileCheck } from 'lucide-react';
import { PROJECTS, PROJECT_CATEGORIES } from '@/data/projects';
import ProjectCard, { ProjectCardFeatured } from './ProjectCard';

export default function ProjectsClientView() {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = useMemo(() => {
    return activeCategory === 'all'
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const isAll = activeCategory === 'all';
  const featuredProject = isAll ? filtered[0] : null;
  const gridProjects = isAll ? filtered.slice(1) : filtered;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Filter + Grid section */}
      <section className="py-12 max-w-[1440px] mx-auto px-4 lg:px-8 space-y-8">

        {/* Filter header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Danh Mục Dự Án</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Đang hiển thị <strong className="text-slate-900">{filtered.length}</strong> / {PROJECTS.length} dự án
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {PROJECT_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#5F8A03] text-white border-[#5F8A03] shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured hero card (chỉ khi "Tất Cả") */}
        {featuredProject && (
          <div>
            <ProjectCardFeatured project={featuredProject} />
          </div>
        )}

        {/* Projects Grid */}
        {gridProjects.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {gridProjects.map((project, idx) => {
              const isLoneLastItem =
                idx === gridProjects.length - 1 && gridProjects.length % 2 !== 0;
              return (
                <div
                  key={project.id}
                  className={isLoneLastItem ? 'lg:col-span-2 lg:flex lg:justify-center' : ''}
                >
                  <div className={isLoneLastItem ? 'w-full lg:max-w-[calc(50%-0.75rem)]' : ''}>
                    <ProjectCard project={project} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* Trust / CTA Banner */}
      <section className="py-8 px-4 lg:px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-500/20">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Cần Hồ Sơ Tham Chiếu Công Trình Tương Tự?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Remak cung cấp bộ hồ sơ năng lực có biên bản đốt lò IBST công chứng,
                danh mục dự án tham chiếu và bản vẽ CAD phục vụ giai đoạn đệ trình vật tư.
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
              <a
                href="/bao-gia"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/20 flex items-center justify-center gap-2"
              >
                <FileCheck size={15} />
                <span>Nhận Hồ Sơ Năng Lực</span>
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
