'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Package
} from 'lucide-react';
import SearchModal from './SearchModal';

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState<string | null>(null);

  // Nhận diện trang đang active
  const isHomeActive = pathname === '/';
  const isProductsActive = pathname.startsWith('/san-pham');
  const isAppsActive = pathname.startsWith('/giai-phap-ung-dung');
  const isProjectsActive = pathname.startsWith('/du-an');
  const isLibraryActive = pathname.startsWith('/thu-vien-tai-lieu');
  const isGuideActive = pathname.startsWith('/huong-dan-thi-cong');
  const isPriceActive = pathname.startsWith('/bao-gia');
  const isAgentsActive = pathname.startsWith('/dai-ly');
  const isAboutActive = pathname === '/gioi-thieu';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSubmenu = (menu: string) => {
    setActiveMobileSubmenu(activeMobileSubmenu === menu ? null : menu);
  };

  return (
    <>
      {/* 1. TOP UTILITY BAR (THANH TIỆN ÍCH TRÊN CÙNG) */}
      <div className="hidden md:block bg-slate-100 text-slate-600 text-xs border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-9 flex items-center justify-between">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-[#7CB305] animate-pulse"></span>
            <span>
              <strong className="text-slate-800">Remak® FireOFF:</strong> Tổng kho Tấm Chống Cháy MGO chuẩn PCCC QCVN 06:2022/BXD
            </span>
          </div>
          <div className="flex items-center gap-6 whitespace-nowrap">
            <Link href="/gioi-thieu" className={`flex items-center gap-1.5 transition-colors ${isAboutActive ? 'text-[#5F8A03] font-semibold' : 'hover:text-[#5F8A03]'}`}>
              <Building2 size={13} /> Giới thiệu
            </Link>
            <Link href="/tin-tuc" className="flex items-center gap-1.5 hover:text-[#5F8A03] transition-colors">
              <Newspaper size={13} /> Tin tức PCCC
            </Link>
            <Link href="/lien-he" className="flex items-center gap-1.5 hover:text-[#5F8A03] transition-colors">
              <Mail size={13} /> Liên hệ
            </Link>
            <a 
              href="tel:0902441981" 
              className="flex items-center gap-1.5 text-[#F26522] font-bold hover:text-[#D95314] transition-colors"
            >
              <Phone size={13} /> 0902.441.981
            </a>
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
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>

          {/* LOGO REMAK */}
          <Link href="/" className="flex-shrink-0 flex items-center py-2">
            <img
              src="https://mgo.com.vn/wp-content/uploads/2022/08/Logo_remak_800.png"
              alt="Remak MGO Fireproof Board"
              className="h-8 sm:h-10 lg:h-11 w-auto object-contain"
            />
          </Link>

          {/* 7 HEADER ĐIỀU HƯỚNG CHA (DESKTOP) - THẲNG HÀNG TUYỆT ĐỐI KHÔNG XUỐNG DÒNG */}
          <nav className="hidden xl:flex items-center gap-1 h-full flex-nowrap flex-shrink-0">
            
            {/* 1. Trang chủ */}
            <div className="relative h-full flex items-center flex-shrink-0">
              <Link 
                href="/" 
                className={`px-3.5 py-2 text-[14.5px] font-semibold rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                  isHomeActive
                    ? 'text-[#5F8A03] font-bold bg-[#F4F9E8]'
                    : 'text-slate-800 hover:text-[#5F8A03] hover:bg-[#F4F9E8]'
                }`}
              >
                Trang chủ
              </Link>
              {isHomeActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#7CB305] rounded-t-full shadow-sm shadow-[#7CB305]/40" />
              )}
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
                <span>Sản phẩm</span>
                <ChevronDown size={14} className={`transition-transform duration-200 flex-shrink-0 group-hover:rotate-180 ${
                  isProductsActive ? 'text-[#5F8A03]' : 'text-slate-400'
                }`} />
              </Link>
              {isProductsActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#7CB305] rounded-t-full shadow-sm shadow-[#7CB305]/40" />
              )}
              
              {/* Dropdown: Sản phẩm */}
              <div className="absolute top-[calc(100%-8px)] left-0 w-[360px] bg-white rounded-2xl shadow-xl border border-slate-200 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 flex flex-col z-50">
                <div className="flex items-center justify-between px-3 py-2 mb-1 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dòng sản phẩm Remak® FireOFF</span>
                  <Link href="/san-pham" className="text-[11px] font-semibold text-[#5F8A03] hover:underline">Xem tất cả →</Link>
                </div>
                <Link href="/san-pham/tam-mgo-boc-ong-gio-pccc" className="flex items-start gap-3 px-3 py-2.5 rounded-xl border-l-2 border-transparent hover:border-[#7CB305] hover:bg-slate-50 transition-all group/item">
                  <Wind size={15} className="text-slate-400 group-hover/item:text-[#5F8A03] mt-0.5 flex-shrink-0 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">MGO Bọc Ống Gió PCCC</div>
                    <div className="text-xs text-slate-400 mt-0.5">DuctBoard 5–12mm, kháng ẩm ngưng tụ</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold whitespace-nowrap flex-shrink-0 mt-0.5">EI 30–120</span>
                </Link>
                <Link href="/san-pham/tam-mgo-tieu-chuan-chong-chay" className="flex items-start gap-3 px-3 py-2.5 rounded-xl border-l-2 border-transparent hover:border-[#7CB305] hover:bg-slate-50 transition-all group/item">
                  <Flame size={15} className="text-slate-400 group-hover/item:text-[#5F8A03] mt-0.5 flex-shrink-0 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">MGO Tiêu Chuẩn Chống Cháy</div>
                    <div className="text-xs text-slate-400 mt-0.5">Vách, trần, chuẩn Euroclass A1</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold whitespace-nowrap flex-shrink-0 mt-0.5">Class A1</span>
                </Link>
                <Link href="/san-pham/tam-mgo-lot-san-chiu-luc" className="flex items-start gap-3 px-3 py-2.5 rounded-xl border-l-2 border-transparent hover:border-[#7CB305] hover:bg-slate-50 transition-all group/item">
                  <Layers size={15} className="text-slate-400 group-hover/item:text-[#5F8A03] mt-0.5 flex-shrink-0 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">MGO Lót Sàn Chịu Tải</div>
                    <div className="text-xs text-slate-400 mt-0.5">Chịu tải 850 kg/m², dày 15–18mm</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold whitespace-nowrap flex-shrink-0 mt-0.5">REI 180</span>
                </Link>
                <Link href="/san-pham/tam-mgo-trang-tri-tieu-am" className="flex items-start gap-3 px-3 py-2.5 rounded-xl border-l-2 border-transparent hover:border-[#7CB305] hover:bg-slate-50 transition-all group/item">
                  <Music size={15} className="text-slate-400 group-hover/item:text-[#5F8A03] mt-0.5 flex-shrink-0 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">MGO Tiêu Âm & Trang Trí</div>
                    <div className="text-xs text-slate-400 mt-0.5">Cách âm STC 50–55 dB, bề mặt đẹp</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold whitespace-nowrap flex-shrink-0 mt-0.5">Tiêu âm</span>
                </Link>
              </div>
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
                <span>Giải pháp Ứng dụng</span>
                <ChevronDown size={14} className={`transition-transform duration-200 flex-shrink-0 group-hover:rotate-180 ${
                  isAppsActive ? 'text-[#5F8A03]' : 'text-slate-400'
                }`} />
              </Link>
              {isAppsActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#7CB305] rounded-t-full shadow-sm shadow-[#7CB305]/40" />
              )}
              {/* Dropdown: Giải pháp Ứng dụng */}
              <div className="absolute top-[calc(100%-8px)] left-0 w-[360px] bg-white rounded-2xl shadow-xl border border-slate-200 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 flex flex-col z-50">
                <div className="flex items-center justify-between px-3 py-2 mb-1 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hệ thống thi công PCCC</span>
                  <Link href="/giai-phap-ung-dung" className="text-[11px] font-semibold text-[#5F8A03] hover:underline">Xem tất cả →</Link>
                </div>
                <Link href="/giai-phap-ung-dung/boc-ong-gio-chong-chay-pccc" className="flex items-start gap-3 px-3 py-2.5 rounded-xl border-l-2 border-transparent hover:border-[#7CB305] hover:bg-slate-50 transition-all group/item">
                  <Wind size={15} className="text-slate-400 group-hover/item:text-[#5F8A03] mt-0.5 flex-shrink-0 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">Bọc Ống Gió PCCC</div>
                    <div className="text-xs text-slate-400 mt-0.5">Hút khói sự cố, cấp khí tươi, tăng áp</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold whitespace-nowrap flex-shrink-0 mt-0.5">EI 30–120</span>
                </Link>
                <Link href="/giai-phap-ung-dung/vach-ngan-chong-chay-karaoke-bar" className="flex items-start gap-3 px-3 py-2.5 rounded-xl border-l-2 border-transparent hover:border-[#7CB305] hover:bg-slate-50 transition-all group/item">
                  <Music size={15} className="text-slate-400 group-hover/item:text-[#5F8A03] mt-0.5 flex-shrink-0 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">Vách Ngăn Karaoke / Bar</div>
                    <div className="text-xs text-slate-400 mt-0.5">Cách âm 52 dB + chống cháy lan</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold whitespace-nowrap flex-shrink-0 mt-0.5">EI 60–120</span>
                </Link>
                <Link href="/giai-phap-ung-dung/san-chieu-luc-nha-thep-tien-che" className="flex items-start gap-3 px-3 py-2.5 rounded-xl border-l-2 border-transparent hover:border-[#7CB305] hover:bg-slate-50 transition-all group/item">
                  <Layers size={15} className="text-slate-400 group-hover/item:text-[#5F8A03] mt-0.5 flex-shrink-0 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">Sàn Chịu Lực Nhà Tiền Chế</div>
                    <div className="text-xs text-slate-400 mt-0.5">Nhà kho, xưởng thép, sàn gác lửng</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold whitespace-nowrap flex-shrink-0 mt-0.5">REI 180</span>
                </Link>
                <Link href="/giai-phap-ung-dung/vach-tran-nha-xuong-cong-nghiep" className="flex items-start gap-3 px-3 py-2.5 rounded-xl border-l-2 border-transparent hover:border-[#7CB305] hover:bg-slate-50 transition-all group/item">
                  <Building2 size={15} className="text-slate-400 group-hover/item:text-[#5F8A03] mt-0.5 flex-shrink-0 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">Vách Trần Nhà Xưởng KCN</div>
                    <div className="text-xs text-slate-400 mt-0.5">Tường bao kho lạnh, phân xưởng sản xuất</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold whitespace-nowrap flex-shrink-0 mt-0.5">EI 60</span>
                </Link>
                <Link href="/giai-phap-ung-dung/loi-cua-chong-chay" className="flex items-start gap-3 px-3 py-2.5 rounded-xl border-l-2 border-transparent hover:border-[#7CB305] hover:bg-slate-50 transition-all group/item">
                  <DoorClosed size={15} className="text-slate-400 group-hover/item:text-[#5F8A03] mt-0.5 flex-shrink-0 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">Lõi Cửa Thép Chống Cháy</div>
                    <div className="text-xs text-slate-400 mt-0.5">Điền lõi cửa thoát hiểm, cửa buồng thang</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold whitespace-nowrap flex-shrink-0 mt-0.5">EI 30–90</span>
                </Link>
              </div>
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
                <span>Dự án</span>
                <ChevronDown size={14} className={`transition-transform duration-200 flex-shrink-0 group-hover:rotate-180 ${
                  isProjectsActive ? 'text-[#5F8A03]' : 'text-slate-400'
                }`} />
              </Link>
              {isProjectsActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#7CB305] rounded-t-full shadow-sm shadow-[#7CB305]/40" />
              )}
              {/* Dropdown: Dự án */}
              <div className="absolute top-[calc(100%-8px)] left-0 w-[360px] bg-white rounded-2xl shadow-xl border border-slate-200 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 flex flex-col z-50">
                <div className="flex items-center justify-between px-3 py-2 mb-1 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dự án tiêu biểu</span>
                  <Link href="/du-an" className="text-[11px] font-semibold text-[#5F8A03] hover:underline">Xem tất cả →</Link>
                </div>
                <Link href="/du-an/nha-may-samsung-yen-phong" className="flex items-start gap-3 px-3 py-2.5 rounded-xl border-l-2 border-transparent hover:border-[#7CB305] hover:bg-slate-50 transition-all group/item">
                  <Building2 size={15} className="text-slate-400 group-hover/item:text-[#5F8A03] mt-0.5 flex-shrink-0 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">Nhà Máy Samsung Yên Phong</div>
                    <div className="text-xs text-slate-400 mt-0.5">KCN Yên Phong, Bắc Ninh · 45.000 m²</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold whitespace-nowrap flex-shrink-0 mt-0.5">KCN</span>
                </Link>
                <Link href="/du-an/tttm-lotte-mall-tay-ho" className="flex items-start gap-3 px-3 py-2.5 rounded-xl border-l-2 border-transparent hover:border-[#7CB305] hover:bg-slate-50 transition-all group/item">
                  <Building2 size={15} className="text-slate-400 group-hover/item:text-[#5F8A03] mt-0.5 flex-shrink-0 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">TTTM Lotte Mall Tây Hồ</div>
                    <div className="text-xs text-slate-400 mt-0.5">Võ Chí Công, Hà Nội · 28.500 m²</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold whitespace-nowrap flex-shrink-0 mt-0.5">TM</span>
                </Link>
                <Link href="/du-an/data-center-viettel-idc" className="flex items-start gap-3 px-3 py-2.5 rounded-xl border-l-2 border-transparent hover:border-[#7CB305] hover:bg-slate-50 transition-all group/item">
                  <Building2 size={15} className="text-slate-400 group-hover/item:text-[#5F8A03] mt-0.5 flex-shrink-0 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">Data Center Viettel IDC</div>
                    <div className="text-xs text-slate-400 mt-0.5">Khu CNC Hòa Lạc, Hà Nội · 16.000 m²</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold whitespace-nowrap flex-shrink-0 mt-0.5">HT</span>
                </Link>
              </div>
            </div>

            {/* 5. Thư viện tài liệu */}
            <div className="relative h-full flex items-center flex-shrink-0">
              <Link
                href="/thu-vien-tai-lieu"
                className={`px-3.5 py-2 text-[14.5px] font-semibold rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                  isLibraryActive
                    ? 'text-[#5F8A03] font-bold bg-[#F4F9E8]'
                    : 'text-slate-800 hover:text-[#5F8A03] hover:bg-[#F4F9E8]'
                }`}
              >
                Thư viện
              </Link>
              {isLibraryActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#7CB305] rounded-t-full shadow-sm shadow-[#7CB305]/40" />
              )}
            </div>

            {/* 6. Hướng dẫn thi công */}
            <div className="relative h-full flex items-center flex-shrink-0">
              <Link
                href="/huong-dan-thi-cong"
                className={`px-3.5 py-2 text-[14.5px] font-semibold rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                  isGuideActive
                    ? 'text-[#5F8A03] font-bold bg-[#F4F9E8]'
                    : 'text-slate-800 hover:text-[#5F8A03] hover:bg-[#F4F9E8]'
                }`}
              >
                Hướng dẫn
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
                <span>Báo giá</span>
                <span className="bg-[#F26522] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full flex-shrink-0">HOT</span>
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
                Đại lý
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
              title="Tìm kiếm"
            >
              <Search size={18} />
            </button>

            <Link
              href="/nhan-mau-thu"
              className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#F26522] to-[#EA580C] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all whitespace-nowrap flex-shrink-0"
            >
              <Package size={16} className="flex-shrink-0" />
              <span className="hidden sm:inline">Nhận Mẫu Thử Miễn Phí</span>
              <span className="sm:hidden">Nhận Mẫu</span>
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
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl z-50 flex flex-col overflow-y-auto">
            <div className="relative p-4 border-b border-slate-200 flex items-center justify-center">
              <img
                src="https://mgo.com.vn/wp-content/uploads/2022/08/Logo_remak_800.png"
                alt="Remak Logo"
                className="h-8 w-auto object-contain"
              />
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
                aria-label="Đóng menu"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-4 flex-grow">
              <nav className="flex flex-col gap-1">
                <Link 
                  href="/" 
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-lg transition-colors ${
                    isHomeActive 
                      ? 'bg-[#F4F9E8] text-[#5F8A03] font-bold border-l-4 border-[#7CB305]' 
                      : 'font-semibold text-slate-800 hover:bg-[#F4F9E8]'
                  }`}
                >
                  Trang chủ
                </Link>

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
                    <span>Sản phẩm</span>
                    <ChevronDown size={16} className={`transition-transform ${activeMobileSubmenu === 'products' ? 'rotate-180 text-[#5F8A03]' : ''}`} />
                  </button>
                  {activeMobileSubmenu === 'products' && (
                    <div className="pl-4 py-1 flex flex-col gap-1 text-sm text-slate-600">
                      <Link href="/san-pham" onClick={() => setMobileOpen(false)} className="py-1.5 px-3 rounded hover:bg-[#F4F9E8] font-bold text-[#5F8A03]">• Tất cả sản phẩm ({'>'})</Link>
                      <Link href="/san-pham/tam-mgo-boc-ong-gio-pccc" onClick={() => setMobileOpen(false)} className="py-1.5 px-3 rounded hover:bg-slate-100">• MGO Bọc Ống Gió PCCC (EI 30 - 120)</Link>
                      <Link href="/san-pham/tam-mgo-tieu-chuan-chong-chay" onClick={() => setMobileOpen(false)} className="py-1.5 px-3 rounded hover:bg-slate-100">• MGO Tiêu Chuẩn Chống Cháy (A1)</Link>
                      <Link href="/san-pham/tam-mgo-lot-san-chiu-luc" onClick={() => setMobileOpen(false)} className="py-1.5 px-3 rounded hover:bg-slate-100">• MGO Lót Sàn Chịu Tải (15-18mm)</Link>
                      <Link href="/san-pham/tam-mgo-trang-tri-tieu-am" onClick={() => setMobileOpen(false)} className="py-1.5 px-3 rounded hover:bg-slate-100">• MGO Tiêu Âm & Trang Trí</Link>
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
                    <span>Giải pháp Ứng dụng</span>
                    <ChevronDown size={16} className={`transition-transform ${activeMobileSubmenu === 'apps' ? 'rotate-180 text-[#5F8A03]' : ''}`} />
                  </button>
                  {activeMobileSubmenu === 'apps' && (
                    <div className="pl-4 py-1 flex flex-col gap-1 text-sm text-slate-600">
                      <Link href="/giai-phap-ung-dung/boc-ong-gio-chong-chay-pccc" onClick={() => setMobileOpen(false)} className="py-1.5 px-3 rounded hover:bg-slate-100">• Bọc ống gió PCCC</Link>
                      <Link href="/giai-phap-ung-dung/vach-ngan-chong-chay-karaoke-bar" onClick={() => setMobileOpen(false)} className="py-1.5 px-3 rounded hover:bg-slate-100">• Vách ngăn Karaoke / Bar</Link>
                      <Link href="/giai-phap-ung-dung/san-chieu-luc-nha-thep-tien-che" onClick={() => setMobileOpen(false)} className="py-1.5 px-3 rounded hover:bg-slate-100">• Sàn chịu lực nhà thép</Link>
                      <Link href="/giai-phap-ung-dung/vach-tran-nha-xuong-cong-nghiep" onClick={() => setMobileOpen(false)} className="py-1.5 px-3 rounded hover:bg-slate-100">• Vách trần nhà xưởng</Link>
                      <Link href="/giai-phap-ung-dung/loi-cua-chong-chay" onClick={() => setMobileOpen(false)} className="py-1.5 px-3 rounded hover:bg-slate-100">• Lõi cửa chống cháy</Link>
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
                  Dự án tiêu biểu
                </Link>

                <Link 
                  href="/thu-vien-tai-lieu" 
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-lg transition-colors ${
                    pathname.startsWith('/thu-vien-tai-lieu') 
                      ? 'bg-[#F4F9E8] text-[#5F8A03] font-bold border-l-4 border-[#7CB305]' 
                      : 'font-semibold text-slate-800 hover:bg-[#F4F9E8]'
                  }`}
                >
                  Thư viện kiểm định PCCC
                </Link>

                <Link 
                  href="/huong-dan-thi-cong" 
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-lg transition-colors ${
                    pathname.startsWith('/huong-dan-thi-cong') 
                      ? 'bg-[#F4F9E8] text-[#5F8A03] font-bold border-l-4 border-[#7CB305]' 
                      : 'font-semibold text-slate-800 hover:bg-[#F4F9E8]'
                  }`}
                >
                  Hướng dẫn thi công
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
                  <span>Báo giá 2026</span>
                  <span className="bg-[#F26522] text-white text-[10px] px-2 py-0.5 rounded-full">HOT</span>
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
                  Chính sách đại lý
                </Link>
              </nav>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col gap-2">
              <a 
                href="tel:0902441981" 
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#F26522] to-[#EA580C] text-white font-bold text-center text-sm flex items-center justify-center gap-2"
              >
                <Phone size={16} /> Hotline: 0902.441.981
              </a>
              <div className="text-center text-xs text-slate-400 mt-1">
                Tổng kho Cụm CN Lại Yên, Hoài Đức, Hà Nội
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
