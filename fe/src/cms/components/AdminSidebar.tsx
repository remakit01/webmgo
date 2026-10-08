'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { logoutWithApi } from '../lib/api-auth';
import { useConfirm } from './ConfirmDialog';

/**
 * Danh sách 11 menu con Trang Chủ (Đồng bộ chuẩn 100% với HomepageNavHeader)
 */
const HOMEPAGE_SUBMENU = [
  { id: 'banners', name: 'Banner Trang Chủ', href: '/admin/homepage/banners' },
  { id: 'hero', name: 'Tiêu Đề & Điểm Nhấn', href: '/admin/homepage/hero' },
  { id: 'benefits', name: 'Đặc Tính Nổi Bật', href: '/admin/homepage/benefits' },
  { id: 'spec-matrix', name: 'Bảng Quy Cách Độ Dày', href: '/admin/homepage/spec-matrix' },
  { id: 'comparison', name: 'So Sánh Vật Liệu', href: '/admin/homepage/comparison' },
  { id: 'applications', name: 'Giải Pháp Ứng Dụng', href: '/admin/homepage/applications' },
  { id: 'sample-request', name: 'Đăng Ký Mẫu Thử', href: '/admin/homepage/sample-request' },
  { id: 'projects', name: 'Dự Án Tiêu Biểu', href: '/admin/homepage/projects' },
  { id: 'homepage-news', name: 'Tin Tức Trang Chủ', href: '/admin/homepage/news' },
  { id: 'calculator', name: 'Dự Toán Chi Phí', href: '/admin/homepage/calculator' },
  { id: 'faq', name: 'Câu Hỏi Thường Gặp', href: '/admin/homepage/faq' },
];

/**
 * Danh sách menu con Tin Tức + xử lý phân cấp chi tiết con (/new, /[id])
 */
const NEWS_SUBMENU = [
  { id: 'news-posts', name: 'Bài Viết', href: '/admin/news' },
  { id: 'news-categories', name: 'Chuyên Mục', href: '/admin/news/categories' },
  { id: 'news-taxonomy', name: 'Tag & Tác Giả', href: '/admin/news/taxonomy' },
];

/**
 * Danh sách menu con Sản Phẩm + xử lý chi tiết con (/new, /[id])
 */
const PRODUCTS_SUBMENU = [
  { id: 'products-list', name: 'Sản Phẩm', href: '/admin/products' },
  { id: 'product-types', name: 'Loại Sản Phẩm', href: '/admin/products/types' },
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
  { id: 'products', name: 'Sản Phẩm MGO', href: '/admin/products', hasSubmenu: true, submenuItems: PRODUCTS_SUBMENU },
  { id: 'applications', name: 'Giải Pháp Thi Công', href: '/admin/applications' },
  { id: 'comparisons', name: 'So Sánh Vật Liệu', href: '/admin/comparisons' },
  { id: 'sample-requests', name: 'Yêu Cầu Mẫu Thử', href: '/admin/sample-requests' },
  { id: 'tech-library', name: 'Hồ Sơ & Chứng Chỉ', href: '/admin/tech-library' },
  { id: 'projects', name: 'Dự Án Tiêu Biểu', href: '/admin/projects' },
  { id: 'ai-knowledge', name: 'Kiến Thức AI', href: '/admin/ai-knowledge' },
];

const ALL_HREFS = [
  ...NAV_ITEMS.map((i) => i.href),
  ...HOMEPAGE_SUBMENU.map((i) => i.href),
  ...NEWS_SUBMENU.map((i) => i.href),
  ...PRODUCTS_SUBMENU.map((i) => i.href),
];

/**
 * Nhận diện trạng thái chi tiết con (tầng 3) cho các route sâu
 */
function getSubmenuDetailStatus(sub: SubmenuItem, pathname: string): { isDetail: boolean; label?: string } | null {
  if (sub.href === '/admin/news') {
    if (pathname === '/admin/news/new') {
      return { isDetail: true, label: 'Tạo mới' };
    }
    if (
      pathname.startsWith('/admin/news/') &&
      pathname !== '/admin/news/categories' &&
      !pathname.startsWith('/admin/news/categories/') &&
      pathname !== '/admin/news/taxonomy' &&
      !pathname.startsWith('/admin/news/taxonomy/')
    ) {
      return { isDetail: true, label: 'Soạn bài' };
    }
  }
  if (sub.href === '/admin/products') {
    if (pathname === '/admin/products/new') return { isDetail: true, label: 'Tạo mới' };
    if (pathname.startsWith('/admin/products/') && pathname !== '/admin/products/types' && !pathname.startsWith('/admin/products/types/')) {
      return { isDetail: true, label: 'Sửa sản phẩm' };
    }
  }
  return null;
}

/**
 * Kiểm tra menu con có đang active hay không (khớp chính xác hoặc khớp chi tiết con)
 */
function isSubmenuActive(sub: SubmenuItem, pathname: string): boolean {
  if (pathname === sub.href) return true;
  const detail = getSubmenuDetailStatus(sub, pathname);
  return !!detail?.isDetail;
}

/**
 * Khớp đường dẫn dài nhất cho các menu cấp 1
 */
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

  const isHomepageRoute = pathname.startsWith('/admin/homepage');
  const isNewsRoute = pathname.startsWith('/admin/news');

  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    homepage: isHomepageRoute,
    news: isNewsRoute,
    products: pathname.startsWith('/admin/products'),
  });

  // Tự động mở rộng menu cha tương ứng khi người dùng duyệt vào nhánh con
  useEffect(() => {
    if (pathname.startsWith('/admin/homepage')) {
      setOpenSubmenus((prev) => ({ ...prev, homepage: true }));
    }
    if (pathname.startsWith('/admin/news')) {
      setOpenSubmenus((prev) => ({ ...prev, news: true }));
    }
    if (pathname.startsWith('/admin/products')) {
      setOpenSubmenus((prev) => ({ ...prev, products: true }));
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
      className="w-64 bg-white border-r border-slate-300 text-slate-700 flex flex-col flex-shrink-0 h-full select-none shadow-xs admin-typography"
    >
      {/* Header Logo: Khớp chuẩn h-16 và border-b border-slate-300 với AdminHeader */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-300 flex-shrink-0 bg-white">
        <Link 
          href="/admin" 
          className="flex items-center gap-2 rounded-lg py-1 px-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CB305]"
          title="Về trang tổng quan quản trị"
        >
          <img 
            src="/Logo_remak_800.png" 
            alt="Remak Vietnam" 
            className="h-8 w-auto object-contain transition-transform duration-200 hover:scale-105"
          />
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F4F9E8] text-[#5F8A03] border border-[#7CB305]/40 select-none">
          CMS
        </span>
      </div>

      {/* Danh mục điều hướng: Text-First tối giản, danh sách liền mạch, phân cấp 3 tầng chuẩn Brand Remak */}
      <nav aria-label="Menu quản trị chính" className="flex-1 overflow-y-auto px-3 py-3.5 space-y-1">
        {NAV_ITEMS.map((item) => {
          // Xử lý mục có menu con (Trang Chủ, Tin Tức)
          if (item.hasSubmenu && item.submenuItems) {
            const isMenuOpen = !!openSubmenus[item.id];
            const isChildActive = item.submenuItems.some((sub) => isSubmenuActive(sub, pathname));
            const isDirectParentActive = pathname === item.href;

            return (
              <div key={item.id} className="space-y-1">
                {/* Menu Cha: Bấm vào bất kỳ đâu trên hàng (chữ, icon, khoảng trống) đều đóng/mở submenu */}
                <button
                  type="button"
                  onClick={() => toggleSubmenu(item.id)}
                  aria-expanded={isMenuOpen}
                  aria-label={isMenuOpen ? `Thu gọn menu ${item.name}` : `Mở rộng menu ${item.name}`}
                  className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[13.5px] transition-all duration-150 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CB305] ${
                    isChildActive
                      ? 'bg-[#F4F9E8] text-[#5F8A03] font-bold border-l-[3px] border-[#5F8A03]'
                      : isDirectParentActive
                      ? 'bg-[#5F8A03] text-white font-bold shadow-xs'
                      : 'text-slate-700 font-medium hover:bg-[#F4F9E8]/70 hover:text-[#5F8A03]'
                  }`}
                >
                  <span className="truncate flex-1">{item.name}</span>
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ease-out shrink-0 ml-2 ${
                      isMenuOpen ? 'rotate-180' : ''
                    } ${
                      isDirectParentActive
                        ? 'text-white'
                        : isChildActive
                        ? 'text-[#5F8A03]'
                        : 'text-slate-400 group-hover:text-[#5F8A03]'
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {/* Danh sách Menu con: Đường dẫn nhánh cây, phân cấp trực quan */}
                <div 
                  className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                    isMenuOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pl-3.5 py-1 space-y-1 border-l-2 border-[#7CB305]/30 ml-4 my-0.5">
                      {item.submenuItems.map((sub) => {
                        const isSubActive = isSubmenuActive(sub, pathname);
                        const detailStatus = getSubmenuDetailStatus(sub, pathname);

                        return (
                          <Link
                            key={sub.id}
                            href={sub.href}
                            className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-md text-[13px] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CB305] ${
                              isSubActive
                                ? 'bg-[#5F8A03] text-white font-semibold shadow-xs'
                                : 'text-slate-600 hover:text-[#5F8A03] hover:bg-[#F4F9E8]/80 font-medium'
                            }`}
                          >
                            <span className="truncate">{sub.name}</span>

                            {/* Tag chỉ báo chi tiết con (tầng 3) */}
                            {detailStatus?.isDetail && (
                              <span 
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF3EC] text-[#F26522] border border-[#F26522]/30 shadow-2xs shrink-0 tracking-tight"
                                title="Đang ở trang thao tác chi tiết con"
                              >
                                {detailStatus.label}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // Xử lý mục đơn lẻ (Tổng Quan, Sản Phẩm, Dự Án,...)
          const isActive = isNavItemActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[13.5px] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CB305] ${
                isActive
                  ? 'bg-[#5F8A03] text-white font-bold shadow-xs'
                  : 'text-slate-700 font-medium hover:bg-[#F4F9E8] hover:text-[#5F8A03]'
              }`}
            >
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer: Liên kết xem ngoài và Đăng xuất */}
      <div className="p-3.5 border-t border-slate-300 bg-slate-50/70 space-y-2 flex-shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-white hover:bg-[#F4F9E8] text-slate-700 hover:text-[#5F8A03] text-xs font-semibold transition-all duration-150 border border-slate-300 hover:border-[#7CB305]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CB305] shadow-2xs"
        >
          <span>Xem trang ngoài</span>
          <span className="text-slate-400 font-semibold text-xs" aria-hidden="true">↗</span>
          <span className="sr-only">(mở trong tab mới)</span>
        </a>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-3.5 py-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors duration-150 border border-rose-300/80 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 shadow-2xs"
        >
          <span>Đăng xuất tài khoản</span>
        </button>
      </div>
    </aside>
  );
}
