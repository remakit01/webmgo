'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { getAuthSession } from '@/lib/api-auth';

export default function AuthShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (isLoginPage) {
      setAuthorized(true);
      return;
    }

    const session = getAuthSession();
    if (!session) {
      router.replace('/login');
    } else {
      setAuthorized(true);
    }
  }, [pathname, isLoginPage, router]);

  // Loading state when checking session
  if (authorized === null && !isLoginPage) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center text-white text-xs font-bold">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 border-2 border-[#5F8A03] border-t-transparent rounded-full animate-spin" />
          <span>Đang xác thực phiên quản trị CMS...</span>
        </div>
      </div>
    );
  }

  // Fullscreen for login page
  if (isLoginPage) {
    return <div className="min-h-screen w-full">{children}</div>;
  }

  // Authenticated layout with Sidebar
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
