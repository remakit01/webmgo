'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { logoutWithApi } from '../lib/api-auth';
import { useConfirm } from './ConfirmDialog';

const HOMEPAGE_SUBMENU = [
  { id: 'banners', name: 'Banner Trang Chủ', href: '/admin/homepage/banners' },
  { id: 'hero', name: 'Tiêu Đề & Điểm Nhấn', href: '/admin/homepage/hero' },
  { id: 'benefits', name: 'Đặc Tính Nổi Bật', href: '/admin/homepage/benefits' },
  { id: 'spec-matrix', name: 'Bảng Quy Cách Độ Dày', href: '/admin/homepage/spec-matrix' },
  { id: 'comparison', name: 'So Sánh Vật Liệu', href: '/admin/homepage/comparison' },
  { id: 'applications', name: 'Giải Pháp Ứng Dụng', href: '/admin/homepage/applications' },
  { id: 'sample-request', name: 'Đăng Ký Mẫu Thử', href: '/admin/homepage/sample-request' },
  { id: 'projects', name: 'Dự Án Tiêu Biểu', href: '/admin/homepage/projects' },
  { id: 'calculator', name: 'Dự Toán Chi Phí', href: '/admin/homepage/calculator' },
  { id: 'faq', name: 'Câu Hỏi Thường Gặp', href: '/admin/homepage/faq' },
];

const NEWS_SUBMENU = [
  { id: 'news-posts', name: 'Bài Viết', href: '/admin/news' },
  { id: 'news-categories', name: 'Chuyên Mục', href: '/admin/news/categories' },
  { id: 'news-taxonomy', name: 'Tag & Tác Giả', href: '/admin/news/taxonomy' },
];

interface SubmenuItem {
  id: string;
  name: string;
  href: string;
}

interface NavItem {
  id: string;
  name: string;
  href: string;
  hasSubmenu?: boolean;
  submenuItems?: SubmenuItem[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', name: 'Tổng Quan', href: '/admin' },
  { id: 'homepage', name: 'Trang Chủ', href: '/admin/homepage', hasSubmenu: true, submenuItems: HOMEPAGE_SUBMENU },
  { id: 'news', name: 'Tin Tức', href: '/admin/news', hasSubmenu: true, submenuItems: NEWS_SUBMENU },
  { id: 'products', name: 'Sản Phẩm MGO', href: '/admin/products' },
  { id: 'applications', name: 'Giải Pháp Thi Công', href: '/admin/applications' },
  { id: 'comparisons', name: 'So Sánh Vật Liệu', href: '/admin/comparisons' },
  { id: 'sample-requests', name: 'Yêu Cầu Mẫu Thử', href: '/admin/sample-requests' },
  { id: 'tech-library', name: 'Hồ Sơ & Chứng Chỉ', href: '/admin/tech-library' },
  { id: 'projects', name: 'Dự Án Tiêu Biểu', href: '/admin/projects' },
];

const ALL_HREFS = [
  ...NAV_ITEMS.map((i) => i.href),
  ...HOMEPAGE_SUBMENU.map((i) => i.href),
  ...NEWS_SUBMENU.map((i) => i.href),
];

/** Mục đang mở: khớp đường dẫn dài nhất (vd /admin/news/categories không làm sáng cả "Bài Viết" /admin/news) */
function isNavItemActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin';
  const matches = (h: string) => pathname === h || pathname.startsWith(`${h}/`);
  if (!matches(href)) return false;
  return !ALL_HREFS.some((other) => other.length > href.length && other.startsWith(href) && matches(other));
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const confirm = useConfirm();
  const isHomepageActive = pathname.startsWith('/admin/homepage');
  const isNewsActive = pathname.startsWith('/admin/news');

  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    homepage: isHomepageActive,
    news: isNewsActive,
  });

  useEffect(() => {
    if (pathname.startsWith('/admin/homepage')) {
      setOpenSubmenus((prev) => ({ ...prev, homepage: true }));
    }
    if (pathname.startsWith('/admin/news')) {
      setOpenSubmenus((prev) => ({ ...prev, news: true }));
    }
  }, [pathname]);

  const toggleSubmenu = (id: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = async () => {
    await confirm({
      title: 'Đăng xuất tài khoản quản trị?',
      description: 'Phiên làm việc quản trị của bạn sẽ kết thúc. Bạn sẽ cần đăng nhập lại để tiếp tục quản lý website.',
      confirmText: 'Đăng xuất ngay',
      cancelText: 'Ở lại',
      variant: 'danger',
      onConfirm: async () => {
        await logoutWithApi();
        router.push('/admin/login');
        router.refresh();
      },
      successMessage: 'Đã đăng xuất tài khoản thành công!',
    });
  };

  return (
    <aside 
      aria-label="Thanh điều hướng quản trị"
      className="w-64 bg-white border-r border-slate-300 text-slate-700 flex flex-col flex-shrink-0 h-screen sticky top-0 select-none shadow-xs admin-typography"
    >
      
      {/* Logo thương hiệu */}
      <div className="h-16 px-5 flex items-center justify-center border-b border-slate-300 flex-shrink-0">
        <Link 
          href="/admin" 
          className="flex items-center justify-center rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CB305] focus-visible:ring-offset-1"
        >
          <img 
            src="/Logo_remak_800.png" 
            alt="Remak Vietnam" 
            className="h-9 w-auto object-contain transition-transform duration-200 hover:scale-105"
          />
        </Link>
      </div>

      {/* Danh mục điều hướng dạng Text-Only */}
      <nav aria-label="Menu quản trị chính" className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = isNavItemActive(pathname, item.href);

          // Render mục có menu con (Trang Chủ, Tin Tức,...)
          if (item.hasSubmenu && item.submenuItems) {
            const isMenuOpen = !!openSubmenus[item.id];
            const isParentActive = isNavItemActive(pathname, item.href) || item.submenuItems.some((sub) => pathname === sub.href);
            const firstSubHref = item.submenuItems[0]?.href || item.href;

            return (
              <div key={item.id} className="space-y-1">
                <div
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-[background-color,color] duration-150 cursor-pointer ${
                    isParentActive
                      ? 'bg-[#5F8A03] text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:bg-[#F4F9E8] hover:text-[#5F8A03]'
                  }`}
                  onClick={() => toggleSubmenu(item.id)}
                >
                  <Link 
                    href={firstSubHref} 
                    onClick={(e) => e.stopPropagation()} 
                    className="flex items-center flex-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  >
                    <span className="truncate">{item.name}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSubmenu(item.id);
                    }}
                    className="p-1 rounded hover:bg-black/10 transition-transform duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                    aria-label={isMenuOpen ? `Thu gọn menu ${item.name}` : `Mở rộng menu ${item.name}`}
                    aria-expanded={isMenuOpen}
                  >
                    <ChevronDown
                      size={15}
                      className={`transition-transform duration-250 ease-out ${
                        isMenuOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </div>

                {/* Submenu mục con: Text-only thanh lịch, vạch brand mượt mà */}
                <div 
                  className={`grid transition-[grid-template-rows,opacity] duration-250 ease-out ${
                    isMenuOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pl-3 py-1 space-y-0.5 border-l-2 border-[#7CB305]/30 ml-4 mt-0.5">
                      {item.submenuItems.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.id}
                            href={sub.href}
                            className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CB305] focus-visible:ring-offset-1 ${
                              isSubActive
                                ? 'bg-[#F4F9E8] text-[#5F8A03] font-bold shadow-2xs translate-x-1'
                                : 'text-slate-600 hover:text-[#5F8A03] hover:bg-[#F4F9E8]/70 hover:translate-x-1 font-medium'
                            }`}
                          >
                            {/* Vạch prefix brand Remak */}
                            <span
                              className={`w-1 rounded-full transition-all duration-200 shrink-0 ${
                                isSubActive 
                                  ? 'bg-[#5F8A03] h-4' 
                                  : 'bg-transparent h-1.5 group-hover:bg-[#7CB305] group-hover:h-3'
                              }`}
                              aria-hidden="true"
                            />
                            <span className="truncate">{sub.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[13.5px] font-semibold transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CB305] focus-visible:ring-offset-1 ${
                isActive
                  ? 'bg-[#5F8A03] text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-[#F4F9E8] hover:text-[#5F8A03]'
              }`}
            >
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Nút thoát & liên kết trang ngoài (Text-only tối giản, tinh tế) */}
      <div className="p-3.5 border-t border-slate-300 bg-slate-50/60 space-y-2 flex-shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-white hover:bg-[#F4F9E8] text-slate-700 hover:text-[#5F8A03] text-xs font-semibold transition-[background-color,color,border-color] duration-150 border border-slate-300 hover:border-[#7CB305]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CB305]"
        >
          <span>Xem trang</span>
          <span className="text-slate-400 font-normal text-sm" aria-hidden="true">↗</span>
          <span className="sr-only">(mở trong tab mới)</span>
        </a>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-3.5 py-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors duration-150 border border-rose-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
