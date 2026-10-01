'use client';

import { Bell, Search, Plus } from 'lucide-react';

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
  return (
    <header className="h-16 px-6 bg-white border-b-2 border-slate-200 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
      <div>
        <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>{title}</span>
          <span className="w-2 h-2 rounded-full bg-[#7CB305]" />
        </h1>
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm dữ liệu CMS..."
            className="w-64 pl-10 pr-3.5 py-2 text-xs font-medium bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#7CB305] focus:bg-white transition-all"
          />
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
          title="Thông báo hệ thống"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F26522] animate-pulse" />
        </button>

        {/* Action Button */}
        {actionText && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7CB305] to-[#5F8A03] hover:from-[#85B90B] hover:to-[#6B9C03] text-white text-xs font-extrabold shadow-sm shadow-[#5F8A03]/25 border-2 border-[#5F8A03] transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>{actionText}</span>
          </button>
        )}
      </div>
    </header>
  );
}
