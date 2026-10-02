'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/cms');

  // Nếu đang ở trang Admin hoặc CMS, render trực tiếp children không bị bọc bởi Header/Footer và thẻ main của Landing Page
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-full flex flex-col bg-[#F8FAFC] text-slate-800">
      {/* Skip to Main Content Link chuẩn Web Interface Guidelines */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#5F8A03] focus:text-white focus:rounded-lg focus:font-bold focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        Chuyển đến nội dung chính
      </a>
      <Header />
      <main id="main-content" className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
