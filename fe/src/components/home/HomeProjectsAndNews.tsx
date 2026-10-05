import React from 'react';
import Link from '@/components/ui/LocaleLink';
import { PROJECTS } from '@/data/projects';
import { NEWS_ARTICLES } from '@/data/news';

// Dữ liệu dự án tiêu biểu (1 tiêu điểm + 4 tin vệ tinh)
const HERO_PROJECT = {
  id: PROJECTS[0].id,
  title: PROJECTS[0].name,
  desc: `${PROJECTS[0].application}. Quy mô ${PROJECTS[0].scale}, nghiệm thu PCCC ${PROJECTS[0].fireRating} tại ${PROJECTS[0].location}.`,
  image: PROJECTS[0].image,
  link: `/du-an/${PROJECTS[0].slug}`,
};

const SIDE_PROJECTS = PROJECTS.slice(1, 5).map((p) => ({
  id: p.id,
  title: p.name,
  subtitle: `Hạng mục: ${p.application} (${p.fireRating}). Quy mô ${p.scale}, nghiệm thu PCCC đạt chuẩn.`,
  link: `/du-an/${p.slug}`,
}));

// Dữ liệu tin tức (1 tiêu điểm + 4 tin vệ tinh)
const HERO_NEWS = {
  id: NEWS_ARTICLES[0].id,
  title: NEWS_ARTICLES[0].title,
  desc: NEWS_ARTICLES[0].desc,
  image: NEWS_ARTICLES[0].image,
  link: `/tin-tuc/${NEWS_ARTICLES[0].slug}`,
};

const SIDE_NEWS = NEWS_ARTICLES.slice(1, 5).map((n) => ({
  id: n.id,
  title: n.title,
  link: `/tin-tuc/${n.slug}`,
}));

export default function HomeProjectsAndNews() {
  return (
    <section 
      id="du-an-va-tin-tuc" 
      aria-label="Dự Án Tiêu Biểu và Tin Tức"
      className="max-w-[1440px] mx-auto px-4 lg:px-8 py-4 sm:py-6"
    >
      {/* 2 CỘT CHUYÊN MỤC SONG SONG (EDITORIAL MAGAZINE GRID CÓ DIVIDER ĐẬM NÉT) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
        
        {/* ========================================================================= */}
        {/* CHUYÊN MỤC 1: DỰ ÁN TIÊU BIỂU                                             */}
        {/* ========================================================================= */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Header Chuyên Mục Chuẩn Báo Chí: Tên In Hoa + Gạch Chân Màu Thương Hiệu */}
          <div className="flex items-center justify-between border-b border-slate-300">
            <Link 
              href="/du-an" 
              className="border-b-[2.5px] border-[#5F8A03] pb-2 -mb-[1px] group block"
            >
              <h2 className="text-lg sm:text-xl font-black text-[#5F8A03] group-hover:text-[#4A6B02] tracking-wide uppercase transition-colors">
                DỰ ÁN TIÊU BIỂU
              </h2>
            </Link>
            <Link 
              href="/du-an" 
              className="text-xs font-bold text-slate-500 hover:text-[#5F8A03] transition-colors pb-2"
            >
              Xem tất cả
            </Link>
          </div>

          {/* Bố Cục 2 Cột Con: 1 Tiêu Điểm Bên Trái + 4 Tin Bullet Bên Phải */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 items-stretch flex-1">
            {/* Cột Con Trái: Dự Án Tiêu Điểm (Hero Spotlight - có ảnh, tiêu đề, subtitle) */}
            <Link href={HERO_PROJECT.link} className="group flex flex-col justify-start">
              <div className="aspect-[16/10] overflow-hidden bg-slate-100 rounded-sm">
                <img
                  src={HERO_PROJECT.image}
                  alt={HERO_PROJECT.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <h3 className="mt-2.5 font-extrabold text-slate-900 text-sm sm:text-[15px] leading-snug group-hover:text-[#5F8A03] transition-colors line-clamp-2">
                {HERO_PROJECT.title}
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed line-clamp-2 sm:line-clamp-3 font-normal">
                {HERO_PROJECT.desc}
              </p>
            </Link>

            {/* Cột Con Phải: 4 Dự Án Vệ Tinh (subtitle hiện 2 dòng cân đối, rõ ràng) */}
            <div className="flex flex-col justify-between h-full pt-1 sm:pt-0">
              {SIDE_PROJECTS.map((project, idx) => (
                <Link
                  key={project.id}
                  href={project.link}
                  className={`group flex-1 flex flex-col justify-center py-2.5 sm:py-2 ${
                    idx !== SIDE_PROJECTS.length - 1 ? 'border-b border-slate-300' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#5F8A03] mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-[13.5px] font-bold text-slate-900 group-hover:text-[#5F8A03] leading-snug transition-colors line-clamp-1">
                        {project.title}
                      </h4>
                      <p className="text-[11.5px] text-slate-500 line-clamp-2 leading-relaxed mt-0.5 font-normal">
                        {project.subtitle}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CHUYÊN MỤC 2: TIN TỨC                                                     */}
        {/* ========================================================================= */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Header Chuyên Mục Chuẩn Báo Chí: Tên In Hoa + Gạch Chân Màu Thương Hiệu */}
          <div className="flex items-center justify-between border-b border-slate-300">
            <Link 
              href="/tin-tuc" 
              className="border-b-[2.5px] border-[#5F8A03] pb-2 -mb-[1px] group block"
            >
              <h2 className="text-lg sm:text-xl font-black text-[#5F8A03] group-hover:text-[#4A6B02] tracking-wide uppercase transition-colors">
                TIN TỨC
              </h2>
            </Link>
            <Link 
              href="/tin-tuc" 
              className="text-xs font-bold text-slate-500 hover:text-[#5F8A03] transition-colors pb-2"
            >
              Xem tất cả
            </Link>
          </div>

          {/* Bố Cục 2 Cột Con: 1 Tiêu Điểm Bên Trái + 4 Tin Bullet Bên Phải */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 items-stretch flex-1">
            {/* Cột Con Trái: Tin Tiêu Điểm (Hero Spotlight - có ảnh, tiêu đề, subtitle) */}
            <Link href={HERO_NEWS.link} className="group flex flex-col justify-start">
              <div className="aspect-[16/10] overflow-hidden bg-slate-100 rounded-sm">
                <img
                  src={HERO_NEWS.image}
                  alt={HERO_NEWS.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <h3 className="mt-2.5 font-extrabold text-slate-900 text-sm sm:text-[15px] leading-snug group-hover:text-[#5F8A03] transition-colors line-clamp-2">
                {HERO_NEWS.title}
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed line-clamp-2 sm:line-clamp-3 font-normal">
                {HERO_NEWS.desc}
              </p>
            </Link>

            {/* Cột Con Phải: 4 Bài Viết (có divider gạch ngang border-slate-300 đậm nét rõ ràng) */}
            <div className="flex flex-col justify-between h-full pt-1 sm:pt-0">
              {SIDE_NEWS.map((article, idx) => (
                <Link
                  key={article.id}
                  href={article.link}
                  className={`group flex-1 flex flex-col justify-center py-2.5 sm:py-2 ${
                    idx !== SIDE_NEWS.length - 1 ? 'border-b border-slate-300' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#5F8A03] mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                    <h4 className="text-xs sm:text-[13.5px] font-bold text-slate-900 group-hover:text-[#5F8A03] leading-snug transition-colors line-clamp-2">
                      {article.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
