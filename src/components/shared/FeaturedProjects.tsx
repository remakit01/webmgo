import React from 'react';
import Link from 'next/link';
import { MapPin, ShieldCheck, ArrowRight } from 'lucide-react';
import { FEATURED_PROJECTS } from '@/data/products';
import { FeaturedProject } from '@/types';
import SectionHeading from '@/components/ui/SectionHeading';

interface FeaturedProjectsProps {
  id?: string;
  projects?: FeaturedProject[];
  showHeading?: boolean;
}

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
          badge="DỰ ÁN TIÊU BIỂU"
          badgeColor="orange"
          title="Công Trình Đã Nghiệm Thu PCCC"
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {projects.map((project) => (
          <div 
            key={project.id}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
          >
            <div>
              {/* Ảnh công trình */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img 
                  src={project.image} 
                  alt={project.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                
                {/* Badge phân loại */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-xs font-bold text-slate-800 shadow-sm">
                  {project.category}
                </div>

                {/* Badge EI */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-[#F26522] text-white text-xs font-bold shadow-md flex items-center gap-1">
                  <ShieldCheck size={13} />
                  <span>{project.fireRating}</span>
                </div>
              </div>

              {/* Chi tiết dự án */}
              <div className="p-5 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-[#F26522] transition-colors">
                  {project.name}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <MapPin size={14} className="text-[#7CB305] flex-shrink-0" />
                  <span className="truncate">{project.location}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Quy mô:</span>
                    <span className="font-bold text-[#5F8A03]">{project.scale}</span>
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-2 pt-1 border-t border-slate-200/60 font-medium">
                    {project.application}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer card */}
            <div className="p-5 pt-0">
              <Link 
                href="/ung-dung"
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-[#F4F9E8] text-slate-700 hover:text-[#5F8A03] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Xem giải pháp</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
