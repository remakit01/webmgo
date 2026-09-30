'use client';

import React from 'react';
import { Search, Bell, User, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ 
  title = 'Bảng Điều Khiển Quản Trị', 
  subtitle = 'Chào mừng trở lại! Dưới đây là thông số & dữ liệu vận hành hệ thống.' 
}: HeaderProps) {
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
        {/* Search */}
        <div className="relative hidden md:block w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm nhanh dữ liệu..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 rounded-lg border border-slate-200 focus:outline-none focus:border-[#5F8A03] transition-all"
          />
        </div>

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
            <div className="text-xs font-bold text-slate-900 leading-none">Admin Remak</div>
            <div className="text-[10px] text-slate-500 mt-0.5">admin@remak.vn</div>
          </div>
        </div>
      </div>
    </header>
  );
}
