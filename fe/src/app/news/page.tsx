'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Newspaper, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Search, 
  FileText, 
  ChevronRight, 
  ShieldCheck, 
  PhoneCall, 
  Building2 
} from 'lucide-react';
import { NEWS_ARTICLES, NEWS_CATEGORIES } from '@/data/news';

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = NEWS_ARTICLES.filter((article) => {
    const matchCategory =
      selectedCategory === 'all' || article.categorySlug === selectedCategory;
    const matchSearch =
      searchQuery.trim() === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchCategory && matchSearch;
  });

  const heroArticle = NEWS_ARTICLES.find((a) => a.isHero) || NEWS_ARTICLES[0];
  const listArticles = filteredArticles.filter((a) => a.id !== heroArticle.id);

  return (
    <div className="min-h-screen bg-slate-50 py-10 lg:py-16">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-12">
        
        {/* ========================================================================= */}
        {/* 1. HEADER & BREADCRUMB                                                    */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#5F8A03] transition-colors">
              Trang Chủ
            </Link>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-slate-900 font-bold">Tin Tức &amp; Kỹ Thuật PCCC</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-200 pb-6">
            <div className="max-w-3xl space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Tin Tức &amp; Kiến Thức Kỹ Thuật
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Cập nhật quy chuẩn PCCC QCVN 06:2022/BXD, phương pháp thử nghiệm đốt mẫu thực tế tại IBST, hướng dẫn thi công bọc ống gió và cẩm nang nghiệm thu công trình.
              </p>
            </div>

            {/* Ô tìm kiếm */}
            <div className="relative w-full md:w-80 shrink-0">
              <input
                type="text"
                placeholder="Tìm bài viết, quy chuẩn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border-2 border-slate-300 rounded-xl focus:outline-hidden focus:border-[#7CB305] text-slate-800 placeholder-slate-400 shadow-xs"
              />
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          {/* Thanh phân loại Category */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2">
            {NEWS_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border-2 ${
                    isActive
                      ? 'bg-[#5F8A03] text-white border-[#5F8A03] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. BÀI VIẾT NỔI BẬT (HERO ARTICLE) - Chỉ hiện khi ở tab "all" và không tìm kiếm */}
        {/* ========================================================================= */}
        {selectedCategory === 'all' && searchQuery.trim() === '' && (
          <div className="bg-white rounded-2xl overflow-hidden border-2 border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 group">
            <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto overflow-hidden bg-slate-100">
              <img
                src={heroArticle.image}
                alt={heroArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent lg:hidden" />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm border ${heroArticle.categoryColor}`}>
                  {heroArticle.category}
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="hidden lg:flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${heroArticle.categoryColor}`}>
                    {heroArticle.category}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">•</span>
                  <span className="text-xs text-slate-500 font-semibold">{heroArticle.author}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-[#F26522]" />
                    {heroArticle.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-[#7CB305]" />
                    {heroArticle.readTime}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight group-hover:text-[#5F8A03] transition-colors">
                  <Link href={`/tin-tuc/${heroArticle.slug}`}>
                    {heroArticle.title}
                  </Link>
                </h2>

                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {heroArticle.desc}
                </p>
              </div>

              <div className="pt-4 border-t-2 border-slate-100 flex items-center justify-between">
                <Link
                  href={`/tin-tuc/${heroArticle.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5F8A03] text-white text-xs sm:text-sm font-bold hover:bg-[#7CB305] transition-colors shadow-xs"
                >
                  <span>Đọc Toàn Bộ Bài Viết</span>
                  <ArrowRight size={15} />
                </Link>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                  <ShieldCheck size={14} className="text-[#7CB305]" />
                  <span>Chuẩn IBST</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. LƯỚI DANH SÁCH BÀI VIẾT (CARDS GRID)                                   */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              {searchQuery.trim() !== ''
                ? `Kết quả tìm kiếm (${filteredArticles.length})`
                : selectedCategory === 'all'
                ? 'Các Bài Viết Mới Nhất'
                : `Danh Mục: ${NEWS_CATEGORIES.find((c) => c.id === selectedCategory)?.label}`}
            </h3>
            <span className="text-xs font-bold text-slate-500">
              Tổng số {filteredArticles.length} bài viết
            </span>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-300 space-y-3">
              <FileText size={40} className="mx-auto text-slate-400" />
              <p className="text-slate-700 font-bold">Không tìm thấy bài viết phù hợp</p>
              <p className="text-xs text-slate-500">Hãy thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục khác.</p>
              <button
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                Xem tất cả bài viết
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {(selectedCategory === 'all' && searchQuery.trim() === '' ? listArticles : filteredArticles).map((article) => (
                <article
                  key={article.id}
                  className="bg-white rounded-2xl overflow-hidden border-2 border-slate-200 shadow-xs hover:shadow-xl hover:border-[#5F8A03]/60 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3.5 left-3.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-sm border ${article.categoryColor}`}>
                          {article.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-[#F26522]" />
                          {article.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-[#7CB305]" />
                          {article.readTime}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-[#5F8A03] transition-colors line-clamp-2">
                        <Link href={`/tin-tuc/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal">
                        {article.desc}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/tin-tuc/${article.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5F8A03] group-hover:translate-x-1 transition-transform"
                    >
                      <span>Đọc tiếp</span>
                      <ArrowRight size={13} />
                    </Link>
                    <span className="text-[11px] text-slate-400 font-medium truncate max-w-[120px]">
                      {article.author}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. BANNER HỖ TRỢ KỸ THUẬT & HỒ SƠ PCCC                                    */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white border-2 border-slate-800 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F26522] text-white">
              HỖ TRỢ DỰ ÁN PCCC
            </span>
            <h3 className="text-xl sm:text-2xl font-black">
              Bạn Cần Cung Cấp Hồ Sơ Kiểm Định &amp; Bản Vẽ Chi Tiết?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Đội ngũ kỹ sư PCCC của Remak sẵn sàng hỗ trợ bóc tách khối lượng, tư vấn giải pháp bọc ống gió và vách ngăn đạt chuẩn QCVN 06:2022/BXD.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/nhan-mau-thu"
              className="px-5 py-3 rounded-xl bg-white text-slate-900 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors shadow-xs"
            >
              Nhận Hộp Mẫu Thử
            </Link>
            <a
              href="tel:0902441981"
              className="px-5 py-3 rounded-xl bg-[#F26522] text-white text-xs sm:text-sm font-bold hover:bg-[#D95314] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <PhoneCall size={15} />
              <span>0902.441.981</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
