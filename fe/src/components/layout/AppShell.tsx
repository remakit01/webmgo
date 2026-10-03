'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Header from './Header';
import Footer from './Footer';

// Khung web khách hàng (Header + main + Footer). CMS có root layout riêng ở app/admin nên không đi qua đây.
export default function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations('Common');

  return (
    <div className="min-h-full flex flex-col bg-[#F8FAFC] text-slate-800">
      {/* Skip to Main Content Link chuẩn Web Interface Guidelines */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#5F8A03] focus:text-white focus:rounded-lg focus:font-bold focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        {t('skipToContent')}
      </a>
      <Header />
      <main id="main-content" className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
