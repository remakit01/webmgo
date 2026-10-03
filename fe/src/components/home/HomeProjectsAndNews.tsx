import React from 'react';
import Link from '@/components/ui/LocaleLink';
import { 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Calendar, 
  Clock, 
  Building2, 
  Newspaper,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { FEATURED_PROJECTS } from '@/data/products';

// Dữ liệu dự án
const HERO_PROJECT = FEATURED_PROJECTS[0]; // Samsung Electronics
const SIDE_PROJECTS = FEATURED_PROJECTS.slice(1, 3); // Lotte Mall & Viettel IDC

// Dữ liệu tin tức & kiến thức kỹ thuật PCCC
const HERO_NEWS = {
  id: 'quy-chuan-qcvn-06-2022-ong-gio-vach-ngan',
  title: 'Quy Chuẩn QCVN 06:2022/BXD: Tiêu Chí Nghiệm Thu Ống Gió & Vách Ngăn Chống Cháy',
  category: 'Tiêu Chuẩn PCCC',
  categoryColor: 'bg-[#FEF3EC] text-[#D95314] border-[#F26522]/30',
  date: '15/09/2026',
  readTime: '5 phút đọc',
  desc: 'Phân tích chi tiết quy trình thử nghiệm đốt mẫu thực tế, giới hạn chịu lửa EI30 – EI120 và điều kiện nghiệm thu tại công trình.',
  image: '/images/mgo-duct.jpg',
  link: '/tin-tuc/quy-chuan-qcvn-06-2022-ong-gio-vach-ngan',
};

const SIDE_NEWS = [
  {
    id: 'cong-nghe-zero-rust-khong-an-mon-kim-loai',
    title: 'Công Nghệ Zero Rust: Vì Sao MGO Remak Không Gây Rỉ Sét Tôn Mạ Kẽm?',
    category: 'Kỹ Thuật Vật Liệu',
    categoryColor: 'bg-[#F4F9E8] text-[#5F8A03] border-[#7CB305]/30',
    date: '08/09/2026',
    readTime: '4 phút đọc',
    image: '/images/mgo-board.jpg',
    link: '/tin-tuc/cong-nghe-zero-rust-khong-an-mon-kim-loai',
  },
  {
    id: 'ket-qua-dot-thu-nghiem-vach-ei-120-ibst',
    title: 'Kết Quả Đốt Thử Nghiệm Thực Tế Hệ Vách MGO Đạt Chuẩn EI 120 Tại Viện IBST',
    category: 'Thử Nghiệm Thực Tế',
    categoryColor: 'bg-purple-50 text-purple-700 border-purple-200',
    date: '28/08/2026',
    readTime: '6 phút đọc',
    image: '/images/mgo-wall.jpg',
    link: '/tin-tuc/ket-qua-dot-thu-nghiem-vach-ei-120-ibst',
  },
];

export default function HomeProjectsAndNews() {
  return (
    <section 
      id="du-an-va-tin-tuc" 
      aria-label="Dự Án Tiêu Biểu và Tin Tức Kỹ Thuật PCCC"
      className="max-w-[1440px] mx-auto px-4 lg:px-8"
    >
      {/* 2 CỘT SONG SONG TRÊN CÙNG 1 HÀNG */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
        
        {/* ========================================================================= */}
        {/* CỘT 1 (BÊN TRÁI): DỰ ÁN TIÊU BIỂU                                         */}
        {/* ========================================================================= */}
        <div className="flex flex-col justify-between space-y-6">
          
          {/* Header Cột Dự Án */}
          <div className="flex items-end justify-between border-b-2 border-slate-200 pb-4">
            <div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Dự Án Tiêu Biểu
              </h2>
            </div>
            <Link 
              href="/du-an" 
              className="text-xs sm:text-sm font-bold text-[#5F8A03] hover:text-[#7CB305] flex items-center gap-1 transition-colors group"
            >
              <span>Xem tất cả ({FEATURED_PROJECTS.length})</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Dự Án Tiêu Điểm Lớn (Hero Project) */}
          <div className="bg-white rounded-2xl overflow-hidden border-2 border-slate-200 shadow-xs hover:shadow-xl hover:border-[#7CB305]/60 hover:-translate-y-1 transition-all duration-200 group flex flex-col justify-between">
            <div className="relative h-60 sm:h-64 overflow-hidden bg-slate-100">
              <img
                src={HERO_PROJECT.image}
                alt={HERO_PROJECT.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />

              {/* Tag phân loại */}
              <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-xs font-bold text-slate-900 shadow-sm border border-slate-200/50">
                  {HERO_PROJECT.category}
                </span>
                {HERO_PROJECT.isNew && (
                  <span className="px-2 py-0.5 rounded-full bg-[#5F8A03] text-white text-[10px] font-black tracking-wide shadow-sm">
                    MỚI
                  </span>
                )}
              </div>

              {/* Badge PCCC EI */}
              <div className="absolute bottom-3.5 right-3.5 px-3 py-1 rounded-lg bg-[#F26522] text-white text-xs font-black shadow-md flex items-center gap-1.5">
                <ShieldCheck size={14} />
                <span>{HERO_PROJECT.fireRating}</span>
              </div>

              {/* Tên dự án nổi trên nền gradient ảnh */}
              <div className="absolute bottom-3.5 left-3.5 right-24 text-white">
                <h3 className="font-extrabold text-lg sm:text-xl leading-tight drop-shadow-sm group-hover:text-[#A0D911] transition-colors">
                  {HERO_PROJECT.name}
                </h3>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <MapPin size={14} className="text-[#7CB305] shrink-0" />
                <span>{HERO_PROJECT.location}</span>
                <span className="text-slate-300">•</span>
                <span className="font-bold text-slate-700">Quy mô: {HERO_PROJECT.scale}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                Hạng mục: {HERO_PROJECT.application}. Được chủ đầu tư và tư vấn giám sát nghiệm thu phòng cháy chữa cháy tuyệt đối.
              </p>
              <div className="pt-2 border-t border-slate-100">
                <Link
                  href={HERO_PROJECT.link}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#5F8A03] group-hover:translate-x-1 transition-transform"
                >
                  <span>Xem Chi Tiết Dự Án</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* 2 Dự Án Danh Sách Ngang Phía Dưới */}
          <div className="space-y-3">
            {SIDE_PROJECTS.map((project) => (
              <Link
                key={project.id}
                href={project.link}
                className="group bg-white rounded-2xl p-3.5 sm:p-4 border-2 border-slate-200 shadow-xs hover:shadow-lg hover:border-[#7CB305]/60 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4"
              >
                <div className="w-24 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.2 bg-[#F26522] text-white text-[9px] font-black rounded">
                    {project.fireRating}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {project.category}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-slate-400 truncate">{project.location}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug group-hover:text-[#5F8A03] transition-colors truncate">
                    {project.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {project.scale} · {project.application}
                  </p>
                </div>

                <ChevronRight size={16} className="text-slate-400 group-hover:text-[#5F8A03] group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            ))}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* CỘT 2 (BÊN PHẢI): TIN TỨC & KIẾN THỨC KỸ THUẬT PCCC                       */}
        {/* ========================================================================= */}
        <div className="flex flex-col justify-between space-y-6">
          
          {/* Header Cột Tin Tức */}
          <div className="flex items-end justify-between border-b-2 border-slate-200 pb-4">
            <div>
          
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Tin Tức &amp; Kỹ Thuật
              </h2>
            </div>
            <Link 
              href="/tin-tuc" 
              className="text-xs sm:text-sm font-bold text-[#F26522] hover:text-[#D95314] flex items-center gap-1 transition-colors group"
            >
              <span>Xem tất cả bài viết</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Tin Tức Tiêu Điểm Lớn (Hero Article) */}
          <div className="bg-white rounded-2xl overflow-hidden border-2 border-slate-200 shadow-xs hover:shadow-xl hover:border-[#F26522]/60 hover:-translate-y-1 transition-all duration-200 group flex flex-col justify-between">
            <div className="relative h-60 sm:h-64 overflow-hidden bg-slate-100">
              <img
                src={HERO_NEWS.image}
                alt={HERO_NEWS.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />

              {/* Tag chuyên mục */}
              <div className="absolute top-3.5 left-3.5">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm border ${HERO_NEWS.categoryColor}`}>
                  {HERO_NEWS.category}
                </span>
              </div>

              {/* Thời gian đăng & đọc */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-xs text-white/95 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#F26522]" />
                  <span>{HERO_NEWS.date}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-[#A0D911]" />
                  <span>{HERO_NEWS.readTime}</span>
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-[#F26522] transition-colors line-clamp-2">
                {HERO_NEWS.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed font-normal">
                {HERO_NEWS.desc}
              </p>
              <div className="pt-2 border-t border-slate-100">
                <Link
                  href={HERO_NEWS.link}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#F26522] group-hover:translate-x-1 transition-transform"
                >
                  <span>Đọc Toàn Bộ Bài Viết</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* 2 Tin Tức Danh Sách Ngang Phía Dưới */}
          <div className="space-y-3">
            {SIDE_NEWS.map((article) => (
              <Link
                key={article.id}
                href={article.link}
                className="group bg-white rounded-2xl p-3.5 sm:p-4 border-2 border-slate-200 shadow-xs hover:shadow-lg hover:border-[#F26522]/60 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4"
              >
                <div className="w-24 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${article.categoryColor}`}>
                      {article.category}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <Calendar size={11} />
                      {article.date}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug group-hover:text-[#F26522] transition-colors line-clamp-1">
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#F26522] mt-0.5">
                    <span>Xem bài viết</span>
                    <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                <ChevronRight size={16} className="text-slate-400 group-hover:text-[#F26522] group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
