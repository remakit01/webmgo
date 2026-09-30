'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  ChevronRight
} from 'lucide-react';

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

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col flex-shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
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

      {/* System Status / Quick Link to Web */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700/60"
        >
          <div className="flex items-center gap-2">
            <ExternalLink size={14} className="text-[#A0D911]" />
            <span>Xem Website Chính</span>
          </div>
          <ChevronRight size={14} className="text-slate-500" />
        </a>

        <div className="flex items-center gap-2 px-1 text-[11px] text-slate-400">
          <ShieldCheck size={14} className="text-[#5F8A03]" />
          <span>Remak FireOFF v1.0 • PCCC QCVN 06</span>
        </div>
      </div>
    </aside>
  );
}
