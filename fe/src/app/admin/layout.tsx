'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getAdminSession } from '@/lib/admin-auth';

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

    const session = getAdminSession();
    if (!session) {
      router.replace('/admin/login');
    } else {
      setAuthorized(true);
    }
  }, [pathname, isLoginPage, router]);

  // Đang kiểm tra auth
  if (authorized === null && !isLoginPage) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#5F8A03] border-t-transparent rounded-full animate-spin" />
          <span>Đang xác thực quyền truy cập CMS...</span>
        </div>
      </div>
    );
  }

  // Trang đăng nhập hiển thị toàn màn hình không có sidebar
  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-950">{children}</div>;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 antialiased">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
