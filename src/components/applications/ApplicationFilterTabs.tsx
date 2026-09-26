'use client';

import React from 'react';
import { Search, X, Flame } from 'lucide-react';
import { APPLICATION_CATEGORIES } from '@/data/applications';

interface ApplicationFilterTabsProps {
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
  filteredCount: number;
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedEi: string;
  onSelectEi: (ei: string) => void;
}

const EI_FILTERS = [
  { id: 'all', label: 'Tất Cả Cấp EI' },
  { id: 'EI 30', label: 'EI 30 – 45' },
  { id: 'EI 60', label: 'EI 60' },
  { id: 'EI 90', label: 'EI 90' },
  { id: 'EI 120', label: 'EI 120' },
  { id: 'EI 180', label: 'EI 150 – 180' },
];

export default function ApplicationFilterTabs({
  activeCategory,
  onSelectCategory,
  filteredCount,
  totalCount,
  searchQuery,
  onSearchChange,
  selectedEi,
  onSelectEi,
}: ApplicationFilterTabsProps) {
  return (
    <div className="space-y-4">
      
      {/* Top Bar: Title & Live Search Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Danh Mục Giải Pháp Thi Công
          </h2>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên, ống gió, vách, EI..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:border-[#5F8A03] focus:ring-1 focus:ring-[#5F8A03] transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
        {APPLICATION_CATEGORIES.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectCategory(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
                isActive
                  ? 'bg-[#5F8A03] text-white border-[#5F8A03] shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Quick Filter: Fire Rating EI Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-400 font-semibold text-[11px] flex items-center gap-1 pr-1 flex-shrink-0">
          <Flame size={13} className="text-[#F26522]" />
          <span>Lọc Cấp EI:</span>
        </span>
        {EI_FILTERS.map((ei) => {
          const isSelected = selectedEi === ei.id;
          return (
            <button
              key={ei.id}
              type="button"
              onClick={() => onSelectEi(ei.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer border transition-colors ${
                isSelected
                  ? 'bg-[#FEF3EC] text-[#F26522] border-[#F26522]/40 font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {ei.label}
            </button>
          );
        })}
      </div>

    </div>
  );
}
