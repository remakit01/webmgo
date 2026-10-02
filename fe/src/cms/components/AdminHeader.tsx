'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Search, Plus, User } from 'lucide-react';
import { fetchCurrentUser, type AuthUser } from '../lib/api-auth';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
}

export default function AdminHeader({
  title,
  subtitle,
  actionText,
  onAction,
}: AdminHeaderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetchCurrentUser().then(setUser).catch(() => setUser(null));
  }, []);

  return (
    <header className="h-16 px-6 bg-white border-b border-slate-300 flex items-center justify-between sticky top-0 z-30 flex-shrink-0 admin-typography">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Ô tìm kiếm dữ liệu */}
        <div className="relative hidden md:block">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm dữ liệu..."
            className="w-64 pl-9 pr-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#5F8A03] focus:bg-white transition-all"
          />
        </div>

        {/* Nút thông báo */}
        <button
          type="button"
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
          title="Thông báo hệ thống"
        >
          <Bell size={17} />
        </button>

        {/* Thông tin tài khoản quản trị */}
        {user && (
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-300">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-[#5F8A03] flex-shrink-0">
              <User size={15} />
            </div>
            <div className="hidden sm:block text-left min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                {user.username ? `@${user.username}` : user.email}
              </div>
              <div className="text-[11px] text-slate-400 font-normal truncate max-w-[140px]" title={user.email}>
                {user.email}
              </div>
            </div>
          </div>
        )}

        {/* Nút tác vụ nếu có */}
        {actionText && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Plus size={15} />
            <span>{actionText}</span>
          </button>
        )}
      </div>
    </header>
  );
}
