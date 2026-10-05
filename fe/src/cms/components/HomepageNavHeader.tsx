'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

const HOMEPAGE_TABS = [
  { id: 'banners', name: '1. Banner Slider (To)', href: '/admin/homepage/banners', feAnchor: '#homepage-banners' },
  { id: 'hero', name: '2. Hero Intro & Badges', href: '/admin/homepage/hero', feAnchor: '#homepage-hero' },
  { id: 'benefits', name: '3. 4 Đặc Tính Vượt Trội', href: '/admin/homepage/benefits', feAnchor: '#homepage-benefits' },
  { id: 'spec-matrix', name: '4. Bảng Thông Số MGO', href: '/admin/homepage/spec-matrix', feAnchor: '#homepage-spec-matrix' },
  { id: 'comparison', name: '5. Đối Chuẩn Vật Liệu', href: '/admin/homepage/comparison', feAnchor: '#homepage-comparison' },
  { id: 'applications', name: '6. 4 Ứng Dụng Hàng Đầu', href: '/admin/homepage/applications', feAnchor: '#homepage-applications' },
  { id: 'sample-request', name: '7. Hộp Mẫu Thử Miễn Phí', href: '/admin/homepage/sample-request', feAnchor: '#homepage-sample-request' },
  { id: 'projects', name: '8. Dự Án Tiêu Biểu', href: '/admin/homepage/projects', feAnchor: '#du-an-va-tin-tuc' },
  { id: 'news', name: '9. Tin Tức Trang Chủ', href: '/admin/homepage/news', feAnchor: '#du-an-va-tin-tuc' },
  { id: 'calculator', name: '10. Dự Toán Vật Tư', href: '/admin/homepage/calculator', feAnchor: '#homepage-calculator' },
  { id: 'faq', name: '11. Hỏi Đáp FAQ SEO', href: '/admin/homepage/faq', feAnchor: '#homepage-faq' },
];

interface HomepageNavHeaderProps {
  currentId: string;
}

export default function HomepageNavHeader({ currentId }: HomepageNavHeaderProps) {
  const currentTab = HOMEPAGE_TABS.find(t => t.id === currentId) || HOMEPAGE_TABS[0];

  return (
    <div className="space-y-3.5 pb-2 border-b border-slate-200">
      {/* Top bar: Breadcrumb & Xem ngoài FE */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600">
          <span className="text-slate-400">Trang Chủ CMS</span>
          <span className="text-slate-300">/</span>
          <span className="text-[#5F8A03] font-black">{currentTab.name}</span>
        </div>

        <a
          href={`/${currentTab.feAnchor}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition-colors"
        >
          <span>Xem Section Ngoài FE</span>
          <ExternalLink size={13} />
        </a>
      </div>

      {/* Tabs navigation 11 menu con chuyển nhanh */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {HOMEPAGE_TABS.map((tab) => {
          const isActive = tab.id === currentId;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-[#5F8A03] text-white border-[#5F8A03] shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
