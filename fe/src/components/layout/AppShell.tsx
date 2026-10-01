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
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
