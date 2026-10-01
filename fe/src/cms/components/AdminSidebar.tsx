'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Layers, 
  Boxes, 
  Inbox, 
  FileCode2, 
  Building2, 
  Scale, 
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  LogOut,
  User,
  Sparkles
} from 'lucide-react';
import { getAuthSession, logoutWithApi, AuthSession } from '../lib/api-auth';

const MENU_ITEMS = [
  {
    name: 'Tổng Quan',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Sản Phẩm MGO',
    href: '/admin/products',
    icon: Boxes,
  },
  {
    name: 'Giải Pháp Thi Công',
    href: '/admin/applications',
    icon: Layers,
  },
  {
    name: 'Yêu Cầu Mẫu & Báo Giá',
    href: '/admin/sample-requests',
    icon: Inbox,
    badge: 'Mới',
  },
  {
    name: 'Hồ Sơ & Chứng Chỉ IBST',
    href: '/admin/tech-library',
    icon: FileCode2,
  },
  {
    name: 'Dự Án Tiêu Biểu',
    href: '/admin/projects',
    icon: Building2,
  },
  {
    name: 'So Sánh Vật Liệu',
    href: '/admin/comparisons',
    icon: Scale,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    setSession(getAuthSession());
  }, []);

  const handleLogout = async () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống CMS?')) {
      await logoutWithApi();
      router.push('/admin/login');
      router.refresh();
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 text-slate-700 flex flex-col flex-shrink-0 h-screen sticky top-0 select-none shadow-xs">
      
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 flex-shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7CB305] to-[#5F8A03] text-white flex items-center justify-center font-black text-lg shadow-sm shadow-[#5F8A03]/25 group-hover:scale-105 transition-transform">
            R
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
              <span>Remak® MGO</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#7CB305]/15 text-[#5F8A03] rounded-md font-bold border border-[#7CB305]/30">CMS</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Hệ Quản Trị Dữ Liệu</div>
          </div>
        </Link>
      </div>

      {/* Logged in User Bar */}
      {session?.user && (
        <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-[#5F8A03] flex-shrink-0">
              <User size={15} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate max-w-[110px]">
                {session.user.username ? `@${session.user.username}` : session.user.email}
              </div>
              <div className="text-[10px] text-slate-500 truncate max-w-[110px]" title={session.user.email}>
                {session.user.email}
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#7CB305]/15 text-[#5F8A03] border border-[#7CB305]/30">
            {session.user.role}
          </span>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
          Phân Hệ Quản Trị
        </div>

        {MENU_ITEMS.map((item) => {
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-[#7CB305] to-[#5F8A03] text-white shadow-md shadow-[#5F8A03]/25 font-bold'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={17} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#F26522] text-white shadow-xs">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* System Status & Logout */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/60 space-y-2 flex-shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all border border-slate-200 shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <ExternalLink size={14} className="text-[#5F8A03]" />
            <span>Mở Website Live (Port 3000)</span>
          </div>
          <ChevronRight size={14} className="text-slate-400" />
        </a>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs font-bold transition-all border border-rose-200 cursor-pointer"
        >
          <LogOut size={14} />
          <span>Đăng Xuất Khỏi CMS</span>
        </button>

        <div className="flex items-center gap-1.5 px-1 text-[10px] text-slate-500 pt-0.5">
          <ShieldCheck size={13} className="text-[#5F8A03]" />
          <span>Remak FireOFF • Chuẩn QCVN 06:2022</span>
        </div>
      </div>
    </aside>
  );
}
