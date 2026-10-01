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
  User
} from 'lucide-react';
import { getAuthSession, logoutWithApi, AuthSession } from '@/lib/api-auth';

const MENU_ITEMS = [
  {
    name: 'Tổng Quan',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Sản Phẩm MGO',
    href: '/products',
    icon: Boxes,
  },
  {
    name: 'Giải Pháp Thi Công',
    href: '/applications',
    icon: Layers,
  },
  {
    name: 'Yêu Cầu Mẫu & Báo Giá',
    href: '/sample-requests',
    icon: Inbox,
    badge: 'Mới',
  },
  {
    name: 'Hồ Sơ & Chứng Chỉ IBST',
    href: '/tech-library',
    icon: FileCode2,
  },
  {
    name: 'Dự Án Tiêu Biểu',
    href: '/projects',
    icon: Building2,
  },
  {
    name: 'So Sánh Vật Liệu',
    href: '/comparisons',
    icon: Scale,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    setSession(getAuthSession());
  }, []);

  const handleLogout = async () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống CMS?')) {
      await logoutWithApi();
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col flex-shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7CB305] to-[#5F8A03] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[#5F8A03]/30">
            R
          </div>
          <div>
            <div className="font-extrabold text-white text-sm tracking-wide flex items-center gap-1.5">
              <span>Remak® MGO</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#5F8A03] text-white rounded font-bold">CMS</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Hệ Quản Trị Nội Dung</div>
          </div>
        </Link>
      </div>

      {/* Logged in User Bar */}
      {session?.user && (
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[#A0D911] flex-shrink-0">
              <User size={14} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate max-w-[120px]">
                {session.user.username ? `@${session.user.username}` : session.user.email}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[120px]" title={session.user.email}>
                {session.user.email}
              </div>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#5F8A03]/20 text-[#A0D911] border border-[#5F8A03]/30">
            {session.user.role}
          </span>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Phân Hệ Quản Trị
        </div>

        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                isActive
                  ? 'bg-[#5F8A03] text-white shadow-sm shadow-[#5F8A03]/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={17} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-[#F26522] text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* System Status & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2 flex-shrink-0">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700/60"
        >
          <div className="flex items-center gap-2">
            <ExternalLink size={14} className="text-[#A0D911]" />
            <span>Mở Website Live (3000)</span>
          </div>
          <ChevronRight size={14} className="text-slate-500" />
        </a>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-bold transition-all border border-rose-500/20 cursor-pointer"
        >
          <LogOut size={14} />
          <span>Đăng Xuất Khỏi CMS</span>
        </button>

        <div className="flex items-center gap-2 px-1 text-[10px] text-slate-400 pt-0.5">
          <ShieldCheck size={13} className="text-[#5F8A03]" />
          <span>Remak FireOFF • PCCC QCVN 06</span>
        </div>
      </div>
    </aside>
  );
}
