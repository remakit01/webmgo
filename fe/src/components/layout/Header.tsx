'use client';

import React, { useState, useEffect } from 'react';
import Link from '@/components/ui/LocaleLink';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  ChevronDown,
  Search,
  Menu,
  X,
  Phone,
  Building2,
  Newspaper,
  Mail,
  Flame,
  Wind,
  Layers,
  DoorClosed,
  Music,
  Package,
  Sliders,
  Sparkles,
  Table2,
  Scale,
  Calculator,
  HelpCircle,
  Hammer,
  type LucideIcon,
} from 'lucide-react';
import SearchModal from './SearchModal';
import LanguageSwitcher from './LanguageSwitcher';
import { toLocalePath, toViPath } from '@/i18n/paths';
import type messages from '../../../messages/vi.json';

type HeaderMessages = (typeof messages)['Header'];
type SectionKey = keyof HeaderMessages['sections'];

const HOTLINE = '0902.441.981';

// Chữ hiển thị nằm trong messages/<locale>.json (Header.sections.<key>), ở đây chỉ giữ cấu trúc menu
const HOMEPAGE_SECTIONS: { id: string; key: SectionKey; icon: LucideIcon; badge?: boolean }[] = [
  { id: 'banner-swiper', key: 'banner', icon: Sliders },
  { id: 'hero-section', key: 'hero', icon: Sparkles },
  { id: 'dac-tinh-vuot-troi', key: 'benefits', icon: Flame },
  { id: 'so-sanh-vat-lieu', key: 'comparison', icon: Scale },
  { id: 'bang-thong-so', key: 'specs', icon: Table2 },
  { id: 'giai-phap-ung-dung', key: 'applications', icon: Layers },
  { id: 'nhan-mau-thu', key: 'sample', icon: Package, badge: true },
  { id: 'du-an-tin-tuc', key: 'projectsNews', icon: Building2 },
  { id: 'faq-hoi-dap', key: 'faq', icon: HelpCircle },
];

type MenuItem<K extends string> = { key: K; href: string; icon: LucideIcon };

const PRODUCT_ITEMS: MenuItem<Exclude<keyof HeaderMessages['productsMenu'], 'heading' | 'all'>>[] = [
  { key: 'duct', href: '/san-pham/tam-mgo-boc-ong-gio-pccc', icon: Wind },
  { key: 'standard', href: '/san-pham/tam-mgo-tieu-chuan-chong-chay', icon: Flame },
  { key: 'floor', href: '/san-pham/tam-mgo-lot-san-chiu-luc', icon: Layers },
  { key: 'acoustic', href: '/san-pham/tam-mgo-trang-tri-tieu-am', icon: Music },
];

const APPLICATION_ITEMS: MenuItem<Exclude<keyof HeaderMessages['applicationsMenu'], 'heading'>>[] = [
  { key: 'duct', href: '/giai-phap-ung-dung/boc-ong-gio-chong-chay-pccc', icon: Wind },
  { key: 'karaoke', href: '/giai-phap-ung-dung/vach-ngan-chong-chay-karaoke-bar', icon: Music },
  { key: 'floor', href: '/giai-phap-ung-dung/san-chieu-luc-nha-thep-tien-che', icon: Layers },
  { key: 'factory', href: '/giai-phap-ung-dung/vach-tran-nha-xuong-cong-nghiep', icon: Building2 },
  { key: 'door', href: '/giai-phap-ung-dung/loi-cua-chong-chay', icon: DoorClosed },
];

const PROJECT_ITEMS: MenuItem<Exclude<keyof HeaderMessages['projectsMenu'], 'heading'>>[] = [
  { key: 'samsung', href: '/du-an/nha-may-samsung-yen-phong', icon: Building2 },
  { key: 'lotte', href: '/du-an/tttm-lotte-mall-tay-ho', icon: Building2 },
  { key: 'viettel', href: '/du-an/data-center-viettel-idc', icon: Building2 },
];

type DropdownItem = { key: string; href: string; icon: LucideIcon; name: string; desc: string; tag: string };

/** Dropdown desktop dạng danh sách (Sản phẩm / Giải pháp / Dự án); nhận nội dung đã dịch */
function DropdownList({ heading, items, viewAllHref }: { heading: string; items: DropdownItem[]; viewAllHref: string }) {
  const tc = useTranslations('Common');
  return (
    <div className="absolute top-[calc(100%-8px)] left-0 w-[360px] bg-white rounded-2xl shadow-xl border border-slate-200 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 flex flex-col z-50">
      <div className="flex items-center justify-between px-3 py-2 mb-1 border-b border-slate-100">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{heading}</span>
        <Link href={viewAllHref} className="text-[11px] font-semibold text-[#5F8A03] hover:underline">
          {tc('viewAll')}
        </Link>
      </div>
      {items.map(({ key, href, icon: Icon, name, desc, tag }) => (
        <Link
          key={key}
          href={href}
          className="flex items-start gap-3 px-3 py-2.5 rounded-xl border-l-2 border-transparent hover:border-[#7CB305] hover:bg-slate-50 transition-all group/item"
        >
          <Icon size={15} className="text-slate-400 group-hover/item:text-[#5F8A03] mt-0.5 flex-shrink-0 transition-colors" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-800">{name}</div>
            <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold whitespace-nowrap flex-shrink-0 mt-0.5">
            {tag}
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function Header() {
  const t = useTranslations('Header');
  const tc = useTranslations('Common');
  const locale = useLocale();
  // So sánh trạng thái active trên URL tiếng Việt để dùng chung cho cả /en
  const pathname = toViPath(usePathname());
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState<string | null>(null);

  const products = PRODUCT_ITEMS.map((i) => ({
    ...i,
    name: t(`productsMenu.${i.key}.name`),
    desc: t(`productsMenu.${i.key}.desc`),
    tag: t(`productsMenu.${i.key}.tag`),
  }));
  const applications = APPLICATION_ITEMS.map((i) => ({
    ...i,
    name: t(`applicationsMenu.${i.key}.name`),
    desc: t(`applicationsMenu.${i.key}.desc`),
    tag: t(`applicationsMenu.${i.key}.tag`),
  }));
  const projects = PROJECT_ITEMS.map((i) => ({
    ...i,
    name: t(`projectsMenu.${i.key}.name`),
    desc: t(`projectsMenu.${i.key}.desc`),
    tag: t(`projectsMenu.${i.key}.tag`),
  }));

  // Nhận diện trang đang active
  const isHomeActive = pathname === '/';
  const isProductsActive = pathname.startsWith('/san-pham');
  const isAppsActive = pathname.startsWith('/giai-phap-ung-dung');
  const isProjectsActive = pathname.startsWith('/du-an');
  const isGuideActive = pathname.startsWith('/huong-dan-thi-cong');
  const isPriceActive = pathname.startsWith('/bao-gia');
  const isAgentsActive = pathname.startsWith('/dai-ly');
  const isAboutActive = pathname.startsWith('/gioi-thieu');
  const isNewsActive = pathname.startsWith('/tin-tuc');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Đóng Drawer bằng phím ESC và khóa cuộn nền khi Drawer mở
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setMobileOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [mobileOpen]);

  const toggleSubmenu = (menu: string) => {
    setActiveMobileSubmenu(activeMobileSubmenu === menu ? null : menu);
  };

  const handleSectionClick = (id: string, e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', toLocalePath(`/#${id}`, locale));
      }
    }
  };

  return (
    <>
      {/* 1. TOP UTILITY BAR (THANH TIỆN ÍCH TRÊN CÙNG) */}
      <div className="hidden md:block bg-slate-100 text-slate-600 text-xs border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-9 flex items-center justify-between">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-[#7CB305] animate-pulse"></span>
            <span>
              <strong className="text-slate-800">{t('topBar.brand')}</strong> {t('topBar.tagline')}
            </span>
          </div>
          <div className="flex items-center gap-6 whitespace-nowrap">
            <Link href="/gioi-thieu" className={`flex items-center gap-1.5 transition-colors ${isAboutActive ? 'text-[#5F8A03] font-semibold' : 'hover:text-[#5F8A03]'}`}>
              <Building2 size={13} /> {t('topBar.about')}
            </Link>
            <Link href="/tin-tuc" className={`flex items-center gap-1.5 transition-colors ${isNewsActive ? 'text-[#5F8A03] font-semibold' : 'hover:text-[#5F8A03]'}`}>
              <Newspaper size={13} /> {t('topBar.news')}
            </Link>
            <a href="mailto:contact@remak.vn" className="flex items-center gap-1.5 hover:text-[#5F8A03] transition-colors">
              <Mail size={13} /> contact@remak.vn
            </a>
            <a
              href="tel:0902441981"
              className="flex items-center gap-1.5 text-[#F26522] font-bold hover:text-[#D95314] transition-colors"
            >
              <Phone size={13} /> {HOTLINE}
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR CHÍNH (7 HEADER CHA THẲNG HÀNG KHÔNG XUỐNG DÒNG) */}
      <header className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-white/98 backdrop-blur-md shadow-md border-b border-slate-200'
          : 'bg-white border-b border-slate-200'
      }`}>
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-8 h-20 flex items-center justify-between gap-1.5 sm:gap-2 lg:gap-6">

          {/* Nút Mobile Hamburger — bên TRÁI khớp với drawer mở từ trái */}
          <button
            onClick={() => setMobileOpen(true)}
            className="xl:hidden p-1.5 sm:p-2 text-slate-800 hover:text-[#F26522] flex-shrink-0"
            aria-label={t('mobile.openMenu')}
          >
            <Menu size={24} />
          </button>

          {/* LOGO REMAK */}
          <Link href="/" className="flex-shrink-0 flex items-center py-2">
            <img
              src="https://mgo.com.vn/wp-content/uploads/2022/08/Logo_remak_800.png"
              alt={tc('logoAlt')}
              className="h-8 sm:h-10 lg:h-11 w-auto object-contain"
            />
          </Link>

          {/* 7 HEADER ĐIỀU HƯỚNG CHA (DESKTOP) - THẲNG HÀNG TUYỆT ĐỐI KHÔNG XUỐNG DÒNG */}
          <nav className="hidden xl:flex items-center gap-1 h-full flex-nowrap flex-shrink-0">

            {/* 1. Trang chủ (Dropdown Mega-Menu 10 Section Components page.tsx) */}
            <div className="group relative h-full flex items-center flex-shrink-0">
              <Link
                href="/"
                className={`px-3.5 py-2 text-[14.5px] font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap flex-shrink-0 ${
                  isHomeActive
                    ? 'text-[#5F8A03] font-bold bg-[#F4F9E8]'
                    : 'text-slate-800 group-hover:text-[#5F8A03] group-hover:bg-[#F4F9E8]'
                }`}
              >
                <span>{t('nav.home')}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 flex-shrink-0 group-hover:rotate-180 ${
                  isHomeActive ? 'text-[#5F8A03]' : 'text-slate-400'
                }`} />
              </Link>
              {isHomeActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#7CB305] rounded-t-full shadow-sm shadow-[#7CB305]/40" />
              )}

              {/* Dropdown: 10 Section Components Trang Chủ - Chữ To Đẹp */}
              <div className="absolute top-[calc(100%-8px)] left-0 w-[630px] bg-white rounded-2xl shadow-xl border border-slate-200 p-3.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 flex flex-col z-50">
                <div className="flex items-center justify-between px-3 py-2.5 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#7CB305] animate-pulse"></span>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-600">{t('homeMenu.heading')}</span>
                  </div>
                  <Link href="/" className="text-xs font-bold text-[#5F8A03] hover:underline">{t('homeMenu.backToTop')}</Link>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {HOMEPAGE_SECTIONS.map((sec, idx) => {
                    const SecIcon = sec.icon;
                    return (
                      <Link
                        key={sec.id}
                        href={`/#${sec.id}`}
                        onClick={(e) => handleSectionClick(sec.id, e)}
                        className="flex items-start gap-3 p-2.5 rounded-xl border border-transparent hover:border-[#7CB305]/40 hover:bg-[#F4F9E8]/80 transition-all group/item"
                      >
                        <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover/item:bg-white text-slate-600 group-hover/item:text-[#5F8A03] flex items-center justify-center shrink-0 transition-colors mt-0.5 shadow-2xs">
                          <SecIcon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-800 group-hover/item:text-[#5F8A03] truncate">
                              {idx + 1}. {t(`sections.${sec.key}.name`)}
                            </span>
                            {sec.badge && (
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#F26522] text-white shrink-0">
                                {tc('hot')}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">
                            {t(`sections.${sec.key}.desc`)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Sản phẩm (Dropdown Mega-Menu Đã Kiểm Chứng) */}
            <div className="group relative h-full flex items-center flex-shrink-0">
              <Link
                href="/san-pham"
                className={`px-3.5 py-2 text-[14.5px] font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap flex-shrink-0 ${
                  isProductsActive
                    ? 'text-[#5F8A03] font-bold bg-[#F4F9E8]'
                    : 'text-slate-800 group-hover:text-[#5F8A03] group-hover:bg-[#F4F9E8]'
                }`}
              >
                <span>{t('nav.products')}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 flex-shrink-0 group-hover:rotate-180 ${
                  isProductsActive ? 'text-[#5F8A03]' : 'text-slate-400'
                }`} />
              </Link>
              {isProductsActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#7CB305] rounded-t-full shadow-sm shadow-[#7CB305]/40" />
              )}
              <DropdownList heading={t('productsMenu.heading')} items={products} viewAllHref="/san-pham" />
            </div>

            {/* 3. Ứng dụng (Dropdown) */}
            <div className="group relative h-full flex items-center flex-shrink-0">
              <Link
                href="/giai-phap-ung-dung"
                className={`px-3.5 py-2 text-[14.5px] font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap flex-shrink-0 ${
                  isAppsActive
                    ? 'text-[#5F8A03] font-bold bg-[#F4F9E8]'
                    : 'text-slate-800 group-hover:text-[#5F8A03] group-hover:bg-[#F4F9E8]'
                }`}
              >
                <span>{t('nav.applications')}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 flex-shrink-0 group-hover:rotate-180 ${
                  isAppsActive ? 'text-[#5F8A03]' : 'text-slate-400'
                }`} />
              </Link>
              {isAppsActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#7CB305] rounded-t-full shadow-sm shadow-[#7CB305]/40" />
              )}
              <DropdownList heading={t('applicationsMenu.heading')} items={applications} viewAllHref="/giai-phap-ung-dung" />
            </div>

            {/* 4. Dự án (Dropdown) */}
            <div className="group relative h-full flex items-center flex-shrink-0">
              <Link
                href="/du-an"
                className={`px-3.5 py-2 text-[14.5px] font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap flex-shrink-0 ${
                  isProjectsActive
                    ? 'text-[#5F8A03] font-bold bg-[#F4F9E8]'
                    : 'text-slate-800 group-hover:text-[#5F8A03] group-hover:bg-[#F4F9E8]'
                }`}
              >
                <span>{t('nav.projects')}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 flex-shrink-0 group-hover:rotate-180 ${
                  isProjectsActive ? 'text-[#5F8A03]' : 'text-slate-400'
                }`} />
              </Link>
              {isProjectsActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#7CB305] rounded-t-full shadow-sm shadow-[#7CB305]/40" />
              )}
              <DropdownList heading={t('projectsMenu.heading')} items={projects} viewAllHref="/du-an" />
            </div>

            {/* 5. Hướng dẫn thi công */}
            <div className="relative h-full flex items-center flex-shrink-0">
              <Link
                href="/huong-dan-thi-cong"
                className={`px-3.5 py-2 text-[14.5px] font-semibold rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                  isGuideActive
                    ? 'text-[#5F8A03] font-bold bg-[#F4F9E8]'
                    : 'text-slate-800 hover:text-[#5F8A03] hover:bg-[#F4F9E8]'
                }`}
              >
                {t('nav.guide')}
              </Link>
              {isGuideActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#7CB305] rounded-t-full shadow-sm shadow-[#7CB305]/40" />
              )}
            </div>

            {/* 6. Báo giá (Nổi bật) */}
            <div className="relative h-full flex items-center flex-shrink-0">
              <Link
                href="/bao-gia"
                className={`px-3.5 py-2 text-[14.5px] font-bold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap flex-shrink-0 ${
                  isPriceActive
                    ? 'text-[#F26522] bg-[#FEF3EC]'
                    : 'text-[#F26522] hover:bg-[#FEF3EC]'
                }`}
              >
                <span>{t('nav.quote')}</span>
                <span className="bg-[#F26522] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full flex-shrink-0">{tc('hot')}</span>
              </Link>
              {isPriceActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#F26522] rounded-t-full shadow-sm shadow-[#F26522]/40" />
              )}
            </div>

            {/* 7. Đại lý */}
            <div className="relative h-full flex items-center flex-shrink-0">
              <Link
                href="/dai-ly"
                className={`px-3.5 py-2 text-[14.5px] font-semibold rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                  isAgentsActive
                    ? 'text-[#5F8A03] font-bold bg-[#F4F9E8]'
                    : 'text-slate-800 hover:text-[#5F8A03] hover:bg-[#F4F9E8]'
                }`}
              >
                {t('nav.dealer')}
              </Link>
              {isAgentsActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#7CB305] rounded-t-full shadow-sm shadow-[#7CB305]/40" />
              )}
            </div>

          </nav>

          {/* ACTIONS BÊN PHẢI (SEARCH & CTA MẪU THỬ) */}
          <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-[#5F8A03] hover:border-[#7CB305] hover:bg-[#F4F9E8] flex items-center justify-center transition-all flex-shrink-0"
              title={t('actions.search')}
              aria-label={t('actions.search')}
            >
              <Search size={18} />
            </button>

            <Link
              href="/nhan-mau-thu"
              className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#F26522] to-[#EA580C] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all whitespace-nowrap flex-shrink-0"
            >
              <Package size={16} className="flex-shrink-0" />
              <span className="hidden sm:inline">{t('actions.sample')}</span>
              <span className="sm:hidden">{t('actions.sampleShort')}</span>
            </Link>

          </div>

        </div>
      </header>

      {/* 3. MOBILE OFF-CANVAS DRAWER */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Body */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('mobile.dialogLabel')}
            className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl z-50 flex flex-col overflow-y-auto"
          >
            <div className="relative p-4 border-b border-slate-200 flex items-center justify-center">
              <img
                src="https://mgo.com.vn/wp-content/uploads/2022/08/Logo_remak_800.png"
                alt={t('mobile.logoAlt')}
                className="h-8 w-auto object-contain"
              />
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CB305]"
                aria-label={t('mobile.closeMenu')}
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            <div className="p-4 flex-grow">
              <nav aria-label={t('mobile.navLabel')} className="flex flex-col gap-1">
                {/* Submenu Trang Chủ (10 Sections tương ứng page.tsx) */}
                <div>
                  <div className="flex items-center justify-between">
                    <Link
                      href="/"
                      onClick={() => setMobileOpen(false)}
                      className={`flex-1 px-3 py-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CB305] ${
                        isHomeActive
                          ? 'bg-[#F4F9E8] text-[#5F8A03] font-bold border-l-4 border-[#7CB305]'
                          : 'font-semibold text-slate-800 hover:bg-[#F4F9E8]'
                      }`}
                    >
                      {t('nav.home')}
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleSubmenu('home')}
                      className="p-2.5 text-slate-500 hover:text-[#5F8A03] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CB305] rounded-lg"
                      aria-label={t('homeMenu.toggle')}
                      aria-expanded={activeMobileSubmenu === 'home'}
                    >
                      <ChevronDown size={16} className={`transition-transform duration-200 ${activeMobileSubmenu === 'home' ? 'rotate-180 text-[#5F8A03]' : ''}`} aria-hidden="true" />
                    </button>
                  </div>
                  {activeMobileSubmenu === 'home' && (
                    <div className="pl-3 py-1 flex flex-col gap-1 text-xs text-slate-600 border-l-2 border-[#7CB305]/40 ml-3.5 mt-0.5 animate-in slide-in-from-top-1 duration-150">
                      {HOMEPAGE_SECTIONS.map((sec) => (
                        <Link
                          key={sec.id}
                          href={`/#${sec.id}`}
                          onClick={(e) => {
                            setMobileOpen(false);
                            handleSectionClick(sec.id, e);
                          }}
                          className="group py-2 px-3 rounded-lg hover:bg-[#F4F9E8] hover:text-[#5F8A03] flex items-center justify-between transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CB305]"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-1 h-3 rounded-full bg-slate-300 group-hover:bg-[#5F8A03] transition-colors shrink-0" aria-hidden="true" />
                            <span className="text-[13.5px] font-semibold text-slate-800 group-hover:text-[#5F8A03] truncate">
                              {t(`sections.${sec.key}.name`)}
                            </span>
                          </div>
                          {sec.badge && (
                            <span className="text-[10px] px-2 py-0.5 rounded font-black bg-[#F26522] text-white shrink-0 ml-1">
                              {tc('hot')}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submenu Sản phẩm */}
                <div>
                  <button
                    onClick={() => toggleSubmenu('products')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                      isProductsActive
                        ? 'bg-[#F4F9E8] text-[#5F8A03] font-bold border-l-4 border-[#7CB305]'
                        : 'font-semibold text-slate-800 hover:bg-[#F4F9E8]'
                    }`}
                  >
                    <span>{t('nav.products')}</span>
                    <ChevronDown size={16} className={`transition-transform ${activeMobileSubmenu === 'products' ? 'rotate-180 text-[#5F8A03]' : ''}`} />
                  </button>
                  {activeMobileSubmenu === 'products' && (
                    <div className="pl-4 py-1 flex flex-col gap-1 text-sm text-slate-600">
                      <Link href="/san-pham" onClick={() => setMobileOpen(false)} className="py-1.5 px-3 rounded hover:bg-[#F4F9E8] font-bold text-[#5F8A03]">{t('productsMenu.all')}</Link>
                      {products.map(({ key, href, name, tag }) => (
                        <Link key={key} href={href} onClick={() => setMobileOpen(false)} className="py-1.5 px-3 rounded hover:bg-slate-100">
                          • {name} ({tag})
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submenu Ứng dụng */}
                <div>
                  <button
                    onClick={() => toggleSubmenu('apps')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                      isAppsActive
                        ? 'bg-[#F4F9E8] text-[#5F8A03] font-bold border-l-4 border-[#7CB305]'
                        : 'font-semibold text-slate-800 hover:bg-[#F4F9E8]'
                    }`}
                  >
                    <span>{t('nav.applications')}</span>
                    <ChevronDown size={16} className={`transition-transform ${activeMobileSubmenu === 'apps' ? 'rotate-180 text-[#5F8A03]' : ''}`} />
                  </button>
                  {activeMobileSubmenu === 'apps' && (
                    <div className="pl-4 py-1 flex flex-col gap-1 text-sm text-slate-600">
                      {applications.map(({ key, href, name }) => (
                        <Link key={key} href={href} onClick={() => setMobileOpen(false)} className="py-1.5 px-3 rounded hover:bg-slate-100">
                          • {name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href="/du-an"
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-lg transition-colors ${
                    isProjectsActive
                      ? 'bg-[#F4F9E8] text-[#5F8A03] font-bold border-l-4 border-[#7CB305]'
                      : 'font-semibold text-slate-800 hover:bg-[#F4F9E8]'
                  }`}
                >
                  {t('mobile.projects')}
                </Link>

                <Link
                  href="/huong-dan-thi-cong"
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-lg transition-colors ${
                    isGuideActive
                      ? 'bg-[#F4F9E8] text-[#5F8A03] font-bold border-l-4 border-[#7CB305]'
                      : 'font-semibold text-slate-800 hover:bg-[#F4F9E8]'
                  }`}
                >
                  {t('mobile.guide')}
                </Link>

                <Link
                  href="/bao-gia"
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors ${
                    isPriceActive
                      ? 'bg-[#FEF3EC] text-[#F26522] font-bold border-l-4 border-[#F26522]'
                      : 'font-bold text-[#F26522] hover:bg-[#FEF3EC]'
                  }`}
                >
                  <span>{t('mobile.quote')}</span>
                  <span className="bg-[#F26522] text-white text-[10px] px-2 py-0.5 rounded-full">{tc('hot')}</span>
                </Link>

                <Link
                  href="/dai-ly"
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-lg transition-colors ${
                    isAgentsActive
                      ? 'bg-[#F4F9E8] text-[#5F8A03] font-bold border-l-4 border-[#7CB305]'
                      : 'font-semibold text-slate-800 hover:bg-[#F4F9E8]'
                  }`}
                >
                  {t('mobile.dealer')}
                </Link>
              </nav>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col gap-2">
              <LanguageSwitcher className="justify-center text-sm mb-1" />
              <a
                href="tel:0902441981"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#F26522] to-[#EA580C] text-white font-bold text-center text-sm flex items-center justify-center gap-2"
              >
                <Phone size={16} /> {tc('hotline', { phone: HOTLINE })}
              </a>
              <div className="text-center text-xs text-slate-400 mt-1">
                {t('mobile.warehouse')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL TÌM KIẾM */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
