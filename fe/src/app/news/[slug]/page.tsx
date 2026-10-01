import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  PhoneCall, 
  Share2,
  FileCheck,
  Building2
} from 'lucide-react';
import { NEWS_ARTICLES } from '@/data/news';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return NEWS_ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = NEWS_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return {
      title: 'Không Tìm Thấy Bài Viết | Remak® MGO FireOFF',
    };
  }

  return {
    title: `${article.title} | Remak® MGO FireOFF`,
    description: article.desc,
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = NEWS_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = NEWS_ARTICLES.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 py-10 lg:py-16">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-10">
        
        {/* ========================================================================= */}
        {/* 1. BREADCRUMB & BACK LINK                                                 */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-200 pb-4">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-[#5F8A03] transition-colors">
              Trang Chủ
            </Link>
            <ChevronRight size={13} className="text-slate-400 shrink-0" />
            <Link href="/tin-tuc" className="hover:text-[#5F8A03] transition-colors">
              Tin Tức &amp; Kỹ Thuật
            </Link>
            <ChevronRight size={13} className="text-slate-400 shrink-0" />
            <span className="text-slate-800 font-bold truncate max-w-[200px] sm:max-w-[400px]">
              {article.title}
            </span>
          </nav>

          <Link
            href="/tin-tuc"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5F8A03] hover:text-[#7CB305] transition-colors shrink-0"
          >
            <ArrowLeft size={14} />
            <span>Quay lại danh sách</span>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* 2. NỘI DUNG CHÍNH (LAYOUT 2 CỘT: 8 CỘT NỘI DUNG + 4 CỘT SIDEBAR)         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* CỘT TRÁI (NỘI DUNG BÀI VIẾT) */}
          <article className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-10 border-2 border-slate-200 shadow-xs space-y-8">
            
            {/* Header bài viết */}
            <div className="space-y-4 border-b-2 border-slate-100 pb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${article.categoryColor}`}>
                  {article.category}
                </span>
                <span className="text-xs text-slate-400 font-semibold">•</span>
                <span className="text-xs text-slate-600 font-semibold">{article.author}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                {article.title}
              </h1>

              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#F26522]" />
                  <span>{article.date}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-[#7CB305]" />
                  <span>{article.readTime}</span>
                </span>
              </div>
            </div>

            {/* Ảnh đại diện lớn */}
            <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 aspect-video bg-slate-100">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Đoạn mở đầu tóm tắt */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border-l-4 border-[#7CB305] text-slate-700 font-medium text-sm sm:text-base leading-relaxed">
              {article.desc}
            </div>

            {/* Nội dung chi tiết các đoạn */}
            <div className="space-y-5 text-slate-700 text-sm sm:text-base leading-relaxed">
              {article.content.map((paragraph, idx) => (
                <p key={idx} className="font-normal">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Hộp cam kết kỹ thuật Remak */}
            <div className="bg-[#F4F9E8] rounded-xl p-5 sm:p-6 border-2 border-[#7CB305]/30 space-y-3">
              <div className="flex items-center gap-2 text-[#5F8A03] font-bold text-sm sm:text-base">
                <ShieldCheck size={20} />
                <span>Cam Kết Kỹ Thuật Từ Remak® FireOFF</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#7CB305] shrink-0 mt-0.5" />
                  <span>Đầy đủ kết quả thử nghiệm đốt mẫu thực tế tại Viện IBST đạt chỉ số EI30 đến EI180.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#7CB305] shrink-0 mt-0.5" />
                  <span>Công nghệ Magie Sulfate cao cấp triệt tiêu hiện tượng ăn mòn rỉ sét kim loại (Zero Rust).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#7CB305] shrink-0 mt-0.5" />
                  <span>Cung cấp hồ sơ pháp lý xuất xưởng CO/CQ hỗ trợ nghiệm thu bàn giao PCCC nhanh chóng.</span>
                </li>
              </ul>
            </div>

            {/* Tags bài viết */}
            <div className="pt-6 border-t-2 border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">Chủ đề:</span>
              {article.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>

          </article>

          {/* CỘT PHẢI (SIDEBAR: TƯ VẤN + BÀI VIẾT LIÊN QUAN) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Box liên hệ tư vấn nhanh */}
            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-xs space-y-4">
              <h3 className="font-black text-slate-900 text-lg border-b border-slate-100 pb-3">
                Tư Vấn Kỹ Thuật PCCC
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bạn cần bản vẽ biện pháp thi công bọc ống gió hoặc vách ngăn EI cho dự án cụ thể? Hãy liên hệ ngay với kỹ sư Remak.
              </p>
              <div className="space-y-2.5 pt-1">
                <a
                  href="tel:0902441981"
                  className="w-full py-3 px-4 rounded-xl bg-[#F26522] hover:bg-[#D95314] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <PhoneCall size={16} />
                  <span>Hotline: 0902.441.981</span>
                </a>
                <Link
                  href="/nhan-mau-thu"
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold border-2 border-slate-300 flex items-center justify-center gap-2 transition-colors"
                >
                  <FileCheck size={16} className="text-[#5F8A03]" />
                  <span>Đăng Ký Nhận Hộp Mẫu Thử</span>
                </Link>
              </div>
            </div>

            {/* Box bài viết liên quan */}
            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-xs space-y-4">
              <h3 className="font-black text-slate-900 text-lg border-b border-slate-100 pb-3">
                Bài Viết Liên Quan
              </h3>
              <div className="space-y-4">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/tin-tuc/${rel.slug}`}
                    className="group block space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <span>{rel.category}</span>
                      <span>•</span>
                      <span>{rel.date}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#5F8A03] transition-colors line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>

          </aside>

        </div>

      </div>
    </div>
  );
}
