'use client';

import React from 'react';
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
  Sliders,
  Sparkles,
  HelpCircle,
  FolderKanban
} from 'lucide-react';
import { clearAdminSession } from '@/lib/admin-auth';

interface NavGroup {
  groupName: string;
  items: {
    name: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
    isHot?: boolean;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupName: 'Tổng Quan',
    items: [
      { name: 'Dashboard Thống Kê', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    groupName: 'Giao Diện Trang Chủ',
    items: [
      { 
        name: 'Banner Slider (Swiper)', 
        href: '/admin/homepage/banners', 
        icon: Sliders,
        badge: 'Live',
        isHot: true 
      },
      { name: 'Hero & Trust Badges', href: '/admin/homepage/hero', icon: Sparkles },
      { name: 'Hỏi Đáp FAQ SEO', href: '/admin/homepage/faq', icon: HelpCircle },
    ],
  },
  {
    groupName: 'Sản Phẩm & Kỹ Thuật',
    items: [
      { name: 'Sản Phẩm MGO', href: '/admin/products', icon: Boxes },
      { name: 'Giải Pháp Thi Công', href: '/admin/applications', icon: Layers },
      { name: 'So Sánh Đối Đầu', href: '/admin/comparisons', icon: Scale },
    ],
  },
  {
    groupName: 'Hồ Sơ & Truyền Thông',
    items: [
      { name: 'Hồ Sơ & Chứng Chỉ IBST', href: '/admin/tech-library', icon: FileCode2 },
      { name: 'Dự Án Tiêu Biểu', href: '/admin/projects', icon: Building2 },
    ],
  },
  {
    groupName: 'Khách Hàng & Báo Giá',
    items: [
      { 
        name: 'Yêu Cầu Mẫu Thử', 
        href: '/admin/sample-requests', 
        icon: Inbox, 
        badge: 'Mới' 
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?')) {
      clearAdminSession();
      router.push('/admin/login');
    }
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col flex-shrink-0 h-screen sticky top-0 select-none z-40">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5">
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

      {/* Navigation List by Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {NAV_GROUPS.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {group.groupName}
            </div>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-[#5F8A03] text-white shadow-sm shadow-[#5F8A03]/30'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon 
                        size={16} 
                        className={`flex-shrink-0 ${
                          isActive 
                            ? 'text-white' 
                            : item.isHot 
                              ? 'text-[#A0D911]' 
                              : 'text-slate-400'
                        }`} 
                      />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider flex-shrink-0 ${
                        isActive
                          ? 'bg-white text-[#5F8A03]'
                          : item.isHot
                            ? 'bg-[#5F8A03] text-white'
                            : 'bg-[#F26522] text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Link & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2 flex-shrink-0">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700/60"
        >
          <div className="flex items-center gap-2">
            <ExternalLink size={14} className="text-[#A0D911]" />
            <span>Mở Trang Chủ Live</span>
          </div>
          <ChevronRight size={14} className="text-slate-500" />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-bold transition-all border border-rose-500/20 cursor-pointer"
        >
          <LogOut size={14} />
          <span>Đăng Xuất</span>
        </button>

        <div className="flex items-center gap-2 px-1 text-[10px] text-slate-400 pt-0.5">
          <ShieldCheck size={13} className="text-[#5F8A03]" />
          <span>Remak FireOFF • QCVN 06:2022</span>
        </div>
      </div>
    </aside>
  );
}
