'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/cms/components/AdminSidebar';
import { getAuthSession } from '@/cms/lib/api-auth';

export default function AdminLayout({
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

    const session = getAuthSession();
    if (!session) {
      router.replace('/admin/login');
    } else {
      setAuthorized(true);
    }
  }, [pathname, isLoginPage, router]);

  // Loading state when checking authentication
  if (authorized === null && !isLoginPage) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-800 text-xs font-bold select-none admin-typography">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 border-2 border-[#7CB305] border-t-transparent rounded-full animate-spin" />
          <span>Đang xác thực quyền truy cập CMS Remak...</span>
        </div>
      </div>
    );
  }

  // Login page: renders fullscreen without sidebar
  if (isLoginPage) {
    return <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 admin-typography">{children}</div>;
  }

  // Authenticated layout with Sidebar
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased font-sans admin-typography">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
