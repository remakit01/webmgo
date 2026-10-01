'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  LayoutTemplate,
  Layers, 
  Boxes, 
  Inbox, 
  FileCode2, 
  Building2, 
  Scale, 
  ChevronRight,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { logoutWithApi } from '../lib/api-auth';

const HOMEPAGE_SUBMENU = [
  { id: 'banners', name: 'Biểu Ngữ Trang Chủ', href: '/admin/homepage/banners' },
  { id: 'hero', name: 'Tiêu Đề & Điểm Nhấn', href: '/admin/homepage/hero' },
  { id: 'benefits', name: 'Đặc Tính Nổi Bật', href: '/admin/homepage/benefits' },
  { id: 'spec-matrix', name: 'Bảng Quy Cách Độ Dày', href: '/admin/homepage/spec-matrix' },
  { id: 'comparison', name: 'So Sánh Vật Liệu', href: '/admin/homepage/comparison' },
  { id: 'applications', name: 'Giải Pháp Ứng Dụng', href: '/admin/homepage/applications' },
  { id: 'sample-request', name: 'Đăng Ký Mẫu Thử', href: '/admin/homepage/sample-request' },
  { id: 'projects-news', name: 'Dự Án & Tin Tức', href: '/admin/homepage/projects-news' },
  { id: 'calculator', name: 'Dự Toán Chi Phí', href: '/admin/homepage/calculator' },
  { id: 'faq', name: 'Câu Hỏi Thường Gặp', href: '/admin/homepage/faq' },
];

const MENU_ITEMS = [
  {
    name: 'Tổng Quan',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Trang Chủ',
    href: '/admin/homepage',
    icon: LayoutTemplate,
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
    name: 'Yêu Cầu Mẫu Thử',
    href: '/admin/sample-requests',
    icon: Inbox,
  },
  {
    name: 'Hồ Sơ & Chứng Chỉ',
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

  const isHomepageActive = pathname.startsWith('/admin/homepage');
  const [isHomeSubmenuOpen, setIsHomeSubmenuOpen] = useState(isHomepageActive);

  useEffect(() => {
    if (pathname.startsWith('/admin/homepage')) {
      setIsHomeSubmenuOpen(true);
    }
  }, [pathname]);

  const handleLogout = async () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị?')) {
      await logoutWithApi();
      router.push('/admin/login');
      router.refresh();
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-300 text-slate-700 flex flex-col flex-shrink-0 h-screen sticky top-0 select-none shadow-xs admin-typography">
      
      {/* Logo thương hiệu */}
      <div className="h-16 px-5 flex items-center justify-center border-b border-slate-300 flex-shrink-0">
        <Link href="/admin" className="flex items-center justify-center">
          <img 
            src="/Logo_remak_800.png" 
            alt="Remak Vietnam" 
            className="h-9 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Danh mục điều hướng */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {MENU_ITEMS.map((item) => {
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          const Icon = item.icon;

          // Render mục Trang Chủ kèm Submenu 10 mục con
          if (item.href === '/admin/homepage') {
            return (
              <div key={item.href} className="space-y-1">
                <div
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                    isHomepageActive
                      ? 'bg-[#5F8A03] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  onClick={() => setIsHomeSubmenuOpen(!isHomeSubmenuOpen)}
                >
                  <Link 
                    href="/admin/homepage/banners" 
                    onClick={(e) => e.stopPropagation()} 
                    className="flex items-center gap-3 flex-1"
                  >
                    <Icon size={18} className={isHomepageActive ? 'text-white' : 'text-slate-500'} />
                    <span>{item.name}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsHomeSubmenuOpen(!isHomeSubmenuOpen);
                    }}
                    className="p-1 rounded hover:bg-black/10 transition-transform"
                    aria-label="Đóng mở menu con"
                  >
                    <ChevronDown
                      size={15}
                      className={`transition-transform duration-200 ${
                        isHomeSubmenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Submenu 10 mục con của Trang Chủ: sạch sẽ, không badge, gạch dọc prefix khi active */}
                {isHomeSubmenuOpen && (
                  <div className="pl-3 py-1 space-y-0.5 border-l-2 border-slate-300 ml-5">
                    {HOMEPAGE_SUBMENU.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.id}
                          href={sub.href}
                          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors ${
                            isSubActive
                              ? 'bg-slate-100 text-slate-950 font-bold shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          {/* Gạch dọc prefix thay thế cho số thứ tự khi đang active tại trang đó */}
                          <span
                            className={`w-1 h-4 rounded-full transition-all shrink-0 ${
                              isSubActive ? 'bg-[#5F8A03]' : 'bg-transparent'
                            }`}
                          />
                          <span className="truncate">{sub.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-[#5F8A03] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500'} />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Nút thoát & liên kết trang ngoài */}
      <div className="p-3 border-t border-slate-300 bg-slate-50/50 space-y-1.5 flex-shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors border border-slate-300"
        >
          <span>Xem trang chủ ngoài</span>
          <ChevronRight size={14} className="text-slate-400" />
        </a>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors border border-rose-300 cursor-pointer"
        >
          <LogOut size={14} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
