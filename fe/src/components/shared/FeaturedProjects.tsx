import React from 'react';
import Link from '@/components/ui/LocaleLink';
import { MapPin, ShieldCheck, ArrowRight } from 'lucide-react';
import { FEATURED_PROJECTS } from '@/data/products';
import { FeaturedProject } from '@/types';
import SectionHeading from '@/components/ui/SectionHeading';

interface FeaturedProjectsProps {
  id?: string;
  projects?: FeaturedProject[];
  showHeading?: boolean;
}

const CATEGORY_ACCENT_TEXT: Record<string, string> = {
  'Khu Công Nghiệp':       'text-[#F26522]',
  'Thương Mại & Dịch Vụ': 'text-[#5F8A03]',
  'Hạ Tầng Dữ Liệu':      'text-slate-600',
  'Cao Ốc Đô Thị':         'text-[#7CB305]',
};

export default function FeaturedProjects({
  id = 'du-an-tieu-bieu',
  projects = FEATURED_PROJECTS,
  showHeading = true,
}: FeaturedProjectsProps) {
  return (
    <section
      id={id}
      aria-label="Dự Án Tiêu Biểu Sử Dụng Tấm MGO Remak"
      className="max-w-[1440px] mx-auto px-4 lg:px-8"
    >
      {showHeading && (
        <SectionHeading 
          title="Dự Án Tiêu Biểu" 
          badge="CÔNG TRÌNH THỰC TẾ"
          badgeColor="green"
          subtitle="Các dự án trọng điểm công nghiệp, thương mại và hạ tầng đã nghiệm thu PCCC bằng giải pháp tấm MGO Remak."
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...projects].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)).map((project) => {
          const accentText = CATEGORY_ACCENT_TEXT[project.category] ?? 'text-[#5F8A03]';
          return (
            <div
              key={project.id}
              className="group bg-white rounded-2xl overflow-hidden border-2 border-slate-200 shadow-xs hover:shadow-xl hover:border-[#7CB305]/60 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />

                {/* MỚI + category — top left */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  {project.isNew && (
                    <div className="flex items-center gap-1.5 bg-[#5F8A03] text-white px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide shadow-md">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                      </span>
                      MỚI
                    </div>
                  )}
                  <div className="px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-xs font-bold text-slate-800 shadow-sm border border-slate-200/50">
                    {project.category}
                  </div>
                </div>

                {/* EI badge — bottom right, orange */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-[#F26522] text-white text-xs font-black shadow-md flex items-center gap-1">
                  <ShieldCheck size={13} />
                  <span>{project.fireRating}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div>
                  <h3 className={`font-bold text-slate-900 text-base group-hover:${accentText} transition-colors leading-snug`}>
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                    <MapPin size={13} className="flex-shrink-0 text-[#7CB305]" />
                    <span className="truncate">{project.location}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                    {project.scale} · {project.application}
                  </p>
                </div>

                <Link
                  href={project.link}
                  className={`text-xs font-bold ${accentText} flex items-center gap-1.5 group-hover:translate-x-1 transition-transform pt-2`}
                >
                  <span>Xem Chi Tiết Dự Án</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/du-an"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white border-2 border-slate-300 hover:border-[#7CB305] text-slate-800 hover:text-[#5F8A03] text-sm font-bold transition-all shadow-xs hover:shadow-md cursor-pointer group"
        >
          <span>Xem Toàn Bộ Dự Án Tiêu Biểu</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
