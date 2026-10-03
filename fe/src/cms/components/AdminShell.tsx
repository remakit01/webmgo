'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/cms/components/AdminSidebar';
import PageLoadingBar from '@/cms/components/PageLoadingBar';
import { ConfirmDialogProvider } from '@/cms/components/ConfirmDialog';
import { fetchCurrentUser } from '@/cms/lib/api-auth';

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setAuthorized(true);
      return;
    }

    let cancelled = false;
    fetchCurrentUser()
      .then((user) => {
        if (cancelled) return;
        if (user) setAuthorized(true);
        else router.replace('/admin/login');
      })
      .catch(() => {
        if (!cancelled) router.replace('/admin/login');
      });
    return () => {
      cancelled = true;
    };
  }, [pathname, isLoginPage, router]);

  // Loading state when checking authentication
  if (authorized === null && !isLoginPage) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 select-none admin-typography">
        <div className="flex flex-col items-center gap-3.5 animate-in fade-in duration-200">
          <div className="w-9 h-9 border-[3px] border-slate-200 border-t-[#5F8A03] rounded-full animate-spin" />
          <p className="text-xs sm:text-sm font-semibold text-slate-600 tracking-tight">
            Đang tải, vui lòng đợi...
          </p>
        </div>
      </div>
    );
  }

  // Login page: renders fullscreen without sidebar
  if (isLoginPage) {
    return <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 admin-typography">{children}</div>;
  }

  // Authenticated layout with Sidebar & Global Confirm Dialog Root
  return (
    <ConfirmDialogProvider>
      <PageLoadingBar />
      <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased font-sans admin-typography">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {children}
        </div>
      </div>
    </ConfirmDialogProvider>
  );
}
