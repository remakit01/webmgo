'use client';

import React from 'react';
import { Bell, Search, Plus, Sparkles } from 'lucide-react';

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
    <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>{title}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#7CB305]" />
        </h1>
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm dữ liệu CMS..."
            className="w-64 pl-9 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#7CB305] focus:bg-white transition-all"
          />
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#7CB305] to-[#5F8A03] hover:brightness-105 text-white text-xs font-bold shadow-sm shadow-[#5F8A03]/30 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>{actionText}</span>
          </button>
        )}
      </div>
    </header>
  );
}
