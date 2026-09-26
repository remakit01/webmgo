'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, SearchX, RotateCcw } from 'lucide-react';
import { 
  ApplicationHero, 
  ApplicationFilterTabs, 
  ApplicationCard, 
  ApplicationComparisonTable,
  ApplicationQcvnGuide,
  ApplicationBoqCalculator,
  ApplicationCadDownload,
  ApplicationProcess 
} from '@/components/applications';
import SampleRequestForm from '@/components/shared/SampleRequestForm';
import { APPLICATIONS } from '@/data/applications';

const BATCH_SIZE = 4; // Mặc định hiển thị mỗi đợt 4 giải pháp (2x2)

export default function ApplicationsClientView() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEi, setSelectedEi] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);

  // Lọc đa chiều: theo Category + Search Query + Cấp EI
  const filteredApplications = useMemo(() => {
    return APPLICATIONS.filter((app) => {
      // 1. Lọc theo category
      const matchCategory = activeCategory === 'all' || app.category === activeCategory;
      if (!matchCategory) return false;

      // 2. Lọc theo cấp EI
      const matchEi = selectedEi === 'all' || app.fireRating.includes(selectedEi);
      if (!matchEi) return false;

      // 3. Lọc theo từ khóa tìm kiếm
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inTitle = app.title.toLowerCase().includes(query);
        const inTagline = app.tagline.toLowerCase().includes(query);
        const inDesc = app.description.toLowerCase().includes(query);
        const inProjects = app.typicalProjects.toLowerCase().includes(query);
        const inRating = app.fireRating.toLowerCase().includes(query);
        const inFeatures = app.keyFeatures.some((f) => f.toLowerCase().includes(query));
        return inTitle || inTagline || inDesc || inProjects || inRating || inFeatures;
      }

      return true;
    });
  }, [activeCategory, searchQuery, selectedEi]);

  // Cắt mảng hiển thị theo số lượng visibleCount hiện tại
  const displayedApplications = filteredApplications.slice(0, visibleCount);
  const hasMore = visibleCount < filteredApplications.length;
  const canCollapse = visibleCount > BATCH_SIZE && filteredApplications.length > BATCH_SIZE;

  // Xử lý khi đổi category hoặc tìm kiếm
  const handleSelectCategory = (cat: string) => {
    setActiveCategory(cat);
    setVisibleCount(BATCH_SIZE);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setVisibleCount(BATCH_SIZE);
  };

  const handleSelectEi = (ei: string) => {
    setSelectedEi(ei);
    setVisibleCount(BATCH_SIZE);
  };

  const handleResetFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setSelectedEi('all');
    setVisibleCount(BATCH_SIZE);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + BATCH_SIZE);
  };

  const handleCollapse = () => {
    setVisibleCount(BATCH_SIZE);
    const el = document.getElementById('solutions-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Tính % thanh tiến trình đã hiển thị
  const progressPercent = Math.min(100, Math.round((displayedApplications.length / (filteredApplications.length || 1)) * 100));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* 1. HERO SECTION */}
      <ApplicationHero />

      {/* 2. MAIN SOLUTIONS GRID SECTION */}
      <section id="solutions-grid" className="py-14 max-w-[1440px] mx-auto px-4 lg:px-8 space-y-8">
        
        {/* Interactive Filter Tabs + Live Search + EI Filter */}
        <ApplicationFilterTabs
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          filteredCount={filteredApplications.length}
          totalCount={APPLICATIONS.length}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedEi={selectedEi}
          onSelectEi={handleSelectEi}
        />

        {/* Empty State when 0 matches */}
        {filteredApplications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <SearchX size={26} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Không Tìm Thấy Giải Pháp Phù Hợp
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Không có giải pháp nào khớp với từ khóa hoặc bộ lọc đã chọn.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RotateCcw size={14} />
              <span>Đặt Lại Bộ Lọc</span>
            </button>
          </div>
        ) : (
          <>
            {/* Applications Grid: 4 items (2x2) per batch */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {displayedApplications.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))}
            </div>

            {/* Progressive Disclosure / Load More Section */}
            {filteredApplications.length > BATCH_SIZE && (
              <div className="pt-4 flex flex-col items-center justify-center space-y-3">
                
                {/* Progress Bar & Counter */}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>
                    Đang hiển thị <strong className="text-slate-900 font-bold">{displayedApplications.length}</strong> / {filteredApplications.length} giải pháp
                  </span>
                  <div className="w-28 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#5F8A03] transition-all duration-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons: Tải Thêm / Thu Gọn */}
                <div className="flex items-center gap-2">
                  {hasMore && (
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      className="px-6 py-3 rounded-2xl bg-white hover:bg-[#F4F9E8] border border-slate-200 hover:border-[#7CB305]/60 text-slate-800 hover:text-[#5F8A03] font-bold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer group"
                    >
                      <span>Tải Thêm Giải Pháp (+{filteredApplications.length - visibleCount})</span>
                      <ChevronDown size={16} className="text-slate-400 group-hover:text-[#5F8A03] transition-colors" />
                    </button>
                  )}

                  {canCollapse && (
                    <button
                      type="button"
                      onClick={handleCollapse}
                      className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Thu Gọn</span>
                      <ChevronUp size={15} />
                    </button>
                  )}
                </div>

              </div>
            )}
          </>
        )}

      </section>

      {/* 3. HEAD-TO-HEAD MATERIAL COMPARISON (MGO VS GYPSUM VS CEMBOARD) */}
      <ApplicationComparisonTable />

      {/* 4. INTERACTIVE QCVN 06:2022/BXD FIRE CODE LOOKUP */}
      <ApplicationQcvnGuide />

      {/* 5. INTERACTIVE BOQ & MATERIAL ESTIMATOR */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <ApplicationBoqCalculator />
      </div>

      {/* 6. AUTOCAD DWG & IBST FURNACE TEST CERTIFICATE DOWNLOADS */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <ApplicationCadDownload />
      </div>

      {/* 7. 4-STEP ENGINEERING & APPROVAL PROCESS */}
      <ApplicationProcess />

      {/* 8. SAMPLE REQUEST & CONTACT FORM */}
      <section className="py-12">
        <SampleRequestForm 
          title="Nhận Hộp Mẫu Thử & Hồ Sơ Đốt Lò IBST"
          subtitle="Remak gửi miễn phí mẫu tấm thực tế và hồ sơ kiểm định công chứng tận công trình."
        />
      </section>

    </div>
  );
}
