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
  ChevronRight,
  LogOut,
  User
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
    <aside className="w-64 bg-white border-r-2 border-slate-200 text-slate-700 flex flex-col flex-shrink-0 h-screen sticky top-0 select-none shadow-xs">
      
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b-2 border-slate-200 flex-shrink-0">
        <Link href="/admin" className="flex items-center gap-2 group">
          <img 
            src="/Logo_remak_800.png" 
            alt="Remak Vietnam" 
            className="h-8 w-auto object-contain"
          />
          <span className="text-[10px] px-2 py-0.5 bg-[#7CB305]/15 text-[#5F8A03] rounded-md font-bold border-2 border-[#7CB305]/40">CMS</span>
        </Link>
      </div>

      {/* Logged in User Bar */}
      {session?.user && (
        <div className="px-4 py-2.5 bg-slate-50 border-b-2 border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white border-2 border-slate-200 shadow-2xs flex items-center justify-center text-[#5F8A03] flex-shrink-0">
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
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#7CB305]/15 text-[#5F8A03] border-2 border-[#7CB305]/40">
            {session.user.role}
          </span>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        <div className="px-3 pb-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
          Phân Hệ Quản Trị
        </div>

        {MENU_ITEMS.map((item) => {
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 border-2 ${
                isActive
                  ? 'bg-gradient-to-r from-[#7CB305] to-[#5F8A03] text-white shadow-md shadow-[#5F8A03]/25 border-[#5F8A03]'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-transparent hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={17} className={isActive ? 'text-white' : 'text-slate-500'} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#F26522] text-white shadow-xs border border-white/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* System Status & Logout */}
      <div className="p-3 border-t-2 border-slate-200 bg-slate-50/60 space-y-2 flex-shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all border-2 border-slate-200 shadow-2xs"
        >
          <span>Xem Website</span>
          <ChevronRight size={14} className="text-slate-400" />
        </a>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs font-bold transition-all border-2 border-rose-200 cursor-pointer"
        >
          <LogOut size={14} />
          <span>Đăng Xuất</span>
        </button>
      </div>
    </aside>
  );
}
