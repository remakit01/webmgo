'use client';

import React, { useState, useRef } from 'react';
import Link from '@/components/ui/LocaleLink';
import { 
  ChevronRight, 
  ChevronLeft,
  FileText,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { NEWS_ARTICLES, NEWS_CATEGORIES, NewsArticle } from '@/data/news';

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(5);

  const trendingScrollRef = useRef<HTMLDivElement>(null);

  // Lọc bài viết theo Category
  const filteredArticles = selectedCategory === 'all'
    ? NEWS_ARTICLES
    : NEWS_ARTICLES.filter((article) => article.categorySlug === selectedCategory);

  const isDefaultView = selectedCategory === 'all';

  // Dữ liệu cho tầng 1: Hero Lead Showcase (3 Cột: 2 trái - 1 giữa lớn - 2 phải)
  const heroMainArticle = NEWS_ARTICLES[0] || ({} as NewsArticle);
  const heroLeftArticles = NEWS_ARTICLES.slice(1, 3);
  const heroRightArticles = NEWS_ARTICLES.slice(3, 5);

  // Dữ liệu cho tầng 3: Slider "Nhiều người đọc"
  const trendingArticles = NEWS_ARTICLES.slice(2, 8);

  // Dữ liệu cho tầng 4: Main Feed hiển thị 5 bài ban đầu và Xem thêm
  const mainFeedArticles = isDefaultView ? NEWS_ARTICLES.slice(2) : filteredArticles;
  const totalArticles = mainFeedArticles.length;
  const visibleArticles = mainFeedArticles.slice(0, visibleCount);
  const hasMore = visibleCount < totalArticles;

  // Xử lý cuộn Slider "Nhiều người đọc"
  const scrollTrending = (direction: 'left' | 'right') => {
    if (trendingScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      trendingScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setVisibleCount(5);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-10">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-8 sm:space-y-10">
        
        {/* ========================================================================= */}
        {/* HEADER: BREADCRUMB, TIÊU ĐỀ & CHUYÊN MỤC BÁO CHÍ                          */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-[#5F8A03] transition-colors">
              Trang Chủ
            </Link>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-[#5F8A03] font-bold">Tin tức</span>
          </nav>
          {/* Thanh phân loại Category */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
            {NEWS_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const isAll = cat.id === 'all';
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm whitespace-nowrap transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-[#5F8A03] text-white border-[#5F8A03] font-bold shadow-xs'
                      : isAll
                        ? 'bg-white text-slate-800 border-slate-300 hover:border-slate-400 hover:bg-slate-50 font-bold'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400 hover:text-slate-900 hover:bg-slate-50 font-normal'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TẦNG 1: HERO LEAD SHOWCASE (3 CỘT: 2 TRÁI - 1 GIỮA LỚN - 2 PHẢI)           */}
        {/* Chỉ hiển thị trọn vẹn ở chế độ mặc định (không lọc)                       */}
        {/* ========================================================================= */}
        {isDefaultView && (
          <section className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
              
              {/* CỘT TRÁI (3 CỘT): 2 BÀI BÁO PHỤ */}
              <div className="lg:col-span-3 flex flex-col justify-between gap-4 sm:gap-5">
                {heroLeftArticles.filter(Boolean).map((article) => (
                  <article key={article.id} className="group flex-1 flex flex-col">
                    <Link 
                      href={`/news/${article.slug}`}
                      className="block aspect-[16/10] overflow-hidden rounded-lg bg-slate-100 relative shrink-0"
                    >
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>

                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug group-hover:text-[#5F8A03] transition-colors line-clamp-3 mt-2">
                      <Link href={`/news/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h2>
                  </article>
                ))}
              </div>

              {/* CỘT GIỮA (6 CỘT): BÀI TIÊU ĐIỂM TRANG NHẤT LỚN NHẤT (HERO ARTICLE) */}
              <article className="lg:col-span-6 lg:order-none order-first flex flex-col h-full group">
                <Link 
                  href={`/news/${heroMainArticle.slug}`}
                  className="block relative w-full aspect-[16/10] lg:aspect-auto lg:flex-1 min-h-[220px] sm:min-h-[280px] lg:min-h-0 overflow-hidden rounded-lg bg-slate-100"
                >
                  <img
                    src={heroMainArticle.image}
                    alt={heroMainArticle.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                  />
                </Link>

                <h2 className="text-lg sm:text-xl lg:text-[22px] font-black text-slate-900 leading-tight group-hover:text-[#5F8A03] transition-colors line-clamp-2 mt-2.5 shrink-0">
                  <Link href={`/news/${heroMainArticle.slug}`}>
                    {heroMainArticle.title}
                  </Link>
                </h2>
              </article>

              {/* CỘT PHẢI (3 CỘT): 2 BÀI BÁO PHỤ TIẾP THEO */}
              <div className="lg:col-span-3 flex flex-col justify-between gap-4 sm:gap-5">
                {heroRightArticles.filter(Boolean).map((article) => (
                  <article key={article.id} className="group flex-1 flex flex-col">
                    <Link 
                      href={`/news/${article.slug}`}
                      className="block aspect-[16/10] overflow-hidden rounded-lg bg-slate-100 relative shrink-0"
                    >
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>

                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug group-hover:text-[#5F8A03] transition-colors line-clamp-3 mt-2">
                      <Link href={`/news/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h2>
                  </article>
                ))}
              </div>

            </div>
          </section>
        )}


        {/* ========================================================================= */}
        {/* TẦNG 3: SLIDER / CAROUSEL "NHIỀU NGƯỜI ĐỌC" (TRENDING ARTICLES)          */}
        {/* ========================================================================= */}
        {isDefaultView && (
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              NHIỀU NGƯỜI ĐỌC
            </h2>

            <div className="relative group/carousel">
              {/* Nút cuộn trái dạng nút tròn nổi */}
              <button
                type="button"
                onClick={() => scrollTrending('left')}
                className="absolute -left-2 sm:-left-3.5 top-[38%] -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md hover:shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:text-black hover:bg-slate-50 transition-all cursor-pointer"
                aria-label="Cuộn sang trái"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Nút cuộn phải dạng nút tròn nổi */}
              <button
                type="button"
                onClick={() => scrollTrending('right')}
                className="absolute -right-2 sm:-right-3.5 top-[38%] -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md hover:shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:text-black hover:bg-slate-50 transition-all cursor-pointer"
                aria-label="Cuộn sang phải"
              >
                <ChevronRight size={20} />
              </button>

              {/* Danh sách cuộn ngang */}
              <div 
                ref={trendingScrollRef}
                className="flex items-start gap-4 sm:gap-5 overflow-x-auto scrollbar-none py-1 scroll-smooth"
              >
                {trendingArticles.filter(Boolean).map((article) => (
                  <article
                    key={article.id}
                    className="w-[230px] sm:w-[260px] lg:w-[calc(25%-15px)] shrink-0 group flex flex-col"
                  >
                    <Link
                      href={`/news/${article.slug}`}
                      className="block aspect-[16/10] overflow-hidden rounded bg-slate-100 relative"
                    >
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#5F8A03] transition-colors line-clamp-3 leading-snug mt-2">
                      <Link href={`/news/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h3>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* TẦNG 4: DÒNG THỜI GIAN (MAIN FEED) FULL WIDTH                             */}
        {/* ========================================================================= */}
        <div className="w-full space-y-4">
          
          {/* Header của khối Main Feed */}
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
            {selectedCategory === 'all'
              ? 'TIN MỚI CẬP NHẬT'
              : NEWS_CATEGORIES.find((c) => c.id === selectedCategory)?.label?.toUpperCase() || 'TIN MỚI CẬP NHẬT'}
          </h2>

          {/* Danh sách bài viết dạng Horizontal Editorial Rows */}
          {totalArticles === 0 ? (
            <div className="border border-slate-200 rounded-xl p-8 text-center space-y-3">
              <FileText size={36} className="mx-auto text-slate-400" />
              <h3 className="text-base font-bold text-slate-800">
                Không tìm thấy bài viết kỹ thuật phù hợp
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Vui lòng chọn chuyên mục khác để hiển thị tài liệu nghiên cứu.
              </p>
              <button
                onClick={() => handleCategoryChange('all')}
                className="px-4 py-2 bg-[#5F8A03] text-white font-bold text-xs rounded-lg hover:bg-[#4A6B02] transition-colors cursor-pointer"
              >
                Xem tất cả bài viết
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {visibleArticles.map((article) => (
                <article
                  key={article.id}
                  className="group py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start"
                >
                  {/* Thumbnail bên trái - Tỉ lệ vàng báo chí cân bằng chiều cao */}
                  <Link
                    href={`/news/${article.slug}`}
                    className="w-full sm:w-60 md:w-64 lg:w-72 shrink-0 aspect-[16/10] overflow-hidden rounded bg-slate-100 relative"
                  >
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </Link>

                  {/* Nội dung bên phải - Cân bằng trọn vẹn từ đỉnh tới đáy */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between sm:self-stretch">
                    <div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 group-hover:text-[#5F8A03] transition-colors leading-snug line-clamp-2">
                        <Link href={`/news/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h3>

                      <p className="text-xs sm:text-sm md:text-[15px] text-slate-600 line-clamp-4 sm:line-clamp-5 leading-relaxed mt-2.5">
                        {article.desc}
                      </p>
                    </div>

                    {/* Điểm neo thị giác dưới đáy: Nút liên kết Xem chi tiết tinh tế */}
                    <div className="pt-3 sm:pt-0">
                      <Link
                        href={`/news/${article.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#5F8A03] hover:text-[#4A6B02] transition-colors"
                      >
                        <span>Xem chi tiết</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Nút Xem thêm bài viết */}
          {hasMore && (
            <div className="pt-6 border-t border-slate-200 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 5)}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-800 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer group"
              >
                <span>Xem thêm bài viết</span>
                <ChevronDown size={16} className="text-slate-500 group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
