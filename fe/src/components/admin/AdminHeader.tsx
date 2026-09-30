'use client';

import React from 'react';
import { Search, Bell, User, CheckCircle2, LogOut } from 'lucide-react';
import { clearAdminSession, getAdminSession } from '@/lib/admin-auth';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function AdminHeader({ 
  title = 'Bảng Điều Khiển Quản Trị', 
  subtitle = 'Chào mừng trở lại! Dưới đây là thông số & dữ liệu vận hành hệ thống.' 
}: AdminHeaderProps) {
  const router = useRouter();
  const session = getAdminSession();

  const handleLogout = () => {
    clearAdminSession();
    router.push('/admin/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div>
        <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
          {title}
        </h1>
        <p className="text-[11px] text-slate-500 hidden sm:block">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Sync Status Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4F9E8] border border-[#7CB305]/30 text-[11px] font-bold text-[#5F8A03]">
          <CheckCircle2 size={13} />
          <span>Đồng bộ Live</span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Thông báo"
          className="relative w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F26522]" />
        </button>

        {/* User Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            <User size={15} />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-none">
              {session?.name || 'Admin Remak'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {session?.email || 'admin@remak.vn'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
