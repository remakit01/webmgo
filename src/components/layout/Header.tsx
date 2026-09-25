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
  FileText, 
  Building2, 
  Newspaper, 
  Mail, 
  Flame, 
  Wind, 
  Layers, 
  DoorClosed, 
  Music, 
  Hammer, 
  HelpCircle, 
  Package 
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState<string | null>(null);

  // Nhận diện trang đang active
  const isHomeActive = pathname === '/';
  const isProductsActive = pathname.startsWith('/san-pham');
  const isAppsActive = pathname.startsWith('/ung-dung');
  const isProjectsActive = pathname.startsWith('/du-an');
  const isTechActive = pathname.startsWith('/thu-vien-tai-lieu') || 
                       pathname.startsWith('/huong-dan-thi-cong') || 
                       pathname.startsWith('/faq');
  const isPriceActive = pathname.startsWith('/bao-gia');
  const isAgentsActive = pathname.startsWith('/dai-ly');

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
            <Link href="/gioi-thieu" className="flex items-center gap-1.5 hover:text-[#5F8A03] transition-colors">
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
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-20 flex items-center justify-between gap-2 lg:gap-6">
          
          {/* LOGO REMAK */}
          <Link href="/" className="flex-shrink-0 flex items-center py-2">
            <img 
              src="https://mgo.com.vn/wp-content/uploads/2022/08/Logo_remak_800.png" 
              alt="Remak MGO Fireproof Board" 
              className="h-10 lg:h-11 w-auto object-contain" 
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
              
              {/* Dropdown Menu 1 Cột Thẳng Hàng Tuyệt Đối */}
              <div className="absolute top-[calc(100%-8px)] left-0 w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 flex flex-col gap-1 z-50">
                <div className="flex items-center justify-between pb-2 px-1 border-b border-slate-100 mb-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Dòng sản phẩm Remak® FireOFF
                  </span>
                  <Link href="/san-pham" className="text-xs font-semibold text-[#5F8A03] hover:underline flex items-center gap-1">
                    Xem tất cả ({'>'})
                  </Link>
                </div>
                
                {/* 1. MGO Bọc Ống Gió PCCC */}
                <Link href="/san-pham/tam-mgo-boc-ong-gio-pccc" className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FEF3EC] transition-all group/item border border-transparent hover:border-[#F26522]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FEF3EC] text-[#F26522] flex items-center justify-center flex-shrink-0 group-hover/item:scale-105 transition-transform">
                      <Wind size={16} />
                    </div>
                    <span className="text-sm font-semibold text-slate-800 group-hover/item:text-[#D95314] transition-colors">
                      MGO Bọc Ống Gió PCCC
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#F26522]/10 text-[#F26522] font-semibold whitespace-nowrap">
                    EI 30 - 120
                  </span>
                </Link>

                {/* 2. MGO Tiêu Chuẩn Chống Cháy */}
                <Link href="/san-pham/tam-mgo-tieu-chuan-chong-chay" className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F4F9E8] transition-all group/item border border-transparent hover:border-[#7CB305]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center flex-shrink-0 group-hover/item:scale-105 transition-transform">
                      <Flame size={16} />
                    </div>
                    <span className="text-sm font-semibold text-slate-800 group-hover/item:text-[#5F8A03] transition-colors">
                      MGO Tiêu Chuẩn Chống Cháy
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#7CB305]/10 text-[#5F8A03] font-semibold whitespace-nowrap">
                    Class A1
                  </span>
                </Link>

                {/* 3. MGO Lót Sàn Chịu Tải */}
                <Link href="/san-pham/tam-mgo-lot-san-chiu-luc" className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-all group/item border border-transparent hover:border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 group-hover/item:scale-105 transition-transform">
                      <Layers size={16} />
                    </div>
                    <span className="text-sm font-semibold text-slate-800 group-hover/item:text-[#5F8A03] transition-colors">
                      MGO Lót Sàn Chịu Tải
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold whitespace-nowrap">
                    15 - 18mm
                  </span>
                </Link>

                {/* 4. MGO Tiêu Âm & Trang Trí */}
                <Link href="/san-pham/tam-mgo-trang-tri-tieu-am" className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F4F9E8] transition-all group/item border border-transparent hover:border-[#7CB305]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center flex-shrink-0 group-hover/item:scale-105 transition-transform">
                      <Music size={16} />
                    </div>
                    <span className="text-sm font-semibold text-slate-800 group-hover/item:text-[#5F8A03] transition-colors">
                      MGO Tiêu Âm & Trang Trí
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#7CB305]/10 text-[#5F8A03] font-semibold whitespace-nowrap">
                    Tiêu Âm
                  </span>
                </Link>
              </div>
            </div>

            {/* 3. Ứng dụng (Dropdown) */}
            <div className="group relative h-full flex items-center flex-shrink-0">
              <Link 
                href="/ung-dung" 
                className={`px-3.5 py-2 text-[14.5px] font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap flex-shrink-0 ${
                  isAppsActive
                    ? 'text-[#5F8A03] font-bold bg-[#F4F9E8]'
                    : 'text-slate-800 group-hover:text-[#5F8A03] group-hover:bg-[#F4F9E8]'
                }`}
              >
                <span>Ứng dụng</span>
                <ChevronDown size={14} className={`transition-transform duration-200 flex-shrink-0 group-hover:rotate-180 ${
                  isAppsActive ? 'text-[#5F8A03]' : 'text-slate-400'
                }`} />
              </Link>
              {isAppsActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#7CB305] rounded-t-full shadow-sm shadow-[#7CB305]/40" />
              )}
              <div className="absolute top-[calc(100%-8px)] left-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 flex flex-col gap-1 z-50">
                <Link href="/ung-dung/boc-ong-gio-chong-chay-pccc" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FEF3EC] text-slate-800 hover:text-[#D95314] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#FEF3EC] text-[#F26522] flex items-center justify-center flex-shrink-0"><Wind size={16} /></div>
                  <span className="text-sm font-semibold whitespace-nowrap">Bọc ống gió PCCC (EI 30 - 120)</span>
                </Link>
                <Link href="/ung-dung/vach-ngan-chong-chay-karaoke-bar" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-800 hover:text-[#5F8A03] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center flex-shrink-0"><Music size={16} /></div>
                  <span className="text-sm font-semibold whitespace-nowrap">Vách ngăn Karaoke / Bar</span>
                </Link>
                <Link href="/ung-dung/san-chieu-luc-nha-thep-tien-che" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-800 hover:text-[#5F8A03] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center flex-shrink-0"><Layers size={16} /></div>
                  <span className="text-sm font-semibold whitespace-nowrap">Sàn chịu lực nhà tiền chế</span>
                </Link>
                <Link href="/ung-dung/vach-tran-nha-xuong-cong-nghiep" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-800 hover:text-[#5F8A03] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center flex-shrink-0"><Building2 size={16} /></div>
                  <span className="text-sm font-semibold whitespace-nowrap">Vách trần nhà xưởng KCN</span>
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
              <div className="absolute top-[calc(100%-8px)] left-0 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 flex flex-col gap-1 z-50">
                <Link href="/du-an/boc-ong-gio-toa-nha-chung-cu" className="p-2.5 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-800 block whitespace-nowrap">
                  Tòa nhà cao tầng & Chung cư
                </Link>
                <Link href="/du-an/to-hop-karaoke-lounge" className="p-2.5 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-800 block whitespace-nowrap">
                  Tổ hợp Karaoke & Bar Lounge
                </Link>
                <Link href="/du-an/nha-may-kcn-vsip" className="p-2.5 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-800 block whitespace-nowrap">
                  Nhà máy KCN Công nghệ cao
                </Link>
              </div>
            </div>

            {/* 5. Kỹ thuật & Thi công (Dropdown) */}
            <div className="group relative h-full flex items-center flex-shrink-0">
              <button 
                type="button"
                className={`px-3.5 py-2 text-[14.5px] font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap flex-shrink-0 cursor-pointer ${
                  isTechActive
                    ? 'text-[#5F8A03] font-bold bg-[#F4F9E8]'
                    : 'text-slate-800 group-hover:text-[#5F8A03] group-hover:bg-[#F4F9E8]'
                }`}
              >
                <span>Kỹ thuật & Thi công</span>
                <ChevronDown size={14} className={`transition-transform duration-200 flex-shrink-0 group-hover:rotate-180 ${
                  isTechActive ? 'text-[#5F8A03]' : 'text-slate-400'
                }`} />
              </button>
              {isTechActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#7CB305] rounded-t-full shadow-sm shadow-[#7CB305]/40" />
              )}
              <div className="absolute top-[calc(100%-8px)] left-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 flex flex-col gap-1 z-50">
                <Link href="/thu-vien-tai-lieu" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-800 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center flex-shrink-0"><FileText size={16} /></div>
                  <div>
                    <div className="text-sm font-semibold whitespace-nowrap">Thư viện kiểm định PCCC</div>
                    <div className="text-xs text-slate-500">Tải kết quả đốt mẫu IBST, CAD</div>
                  </div>
                </Link>
                <Link href="/huong-dan-thi-cong" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-800 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center flex-shrink-0"><Hammer size={16} /></div>
                  <div>
                    <div className="text-sm font-semibold whitespace-nowrap">Hướng dẫn thi công chuẩn thợ</div>
                    <div className="text-xs text-slate-500">Kỹ thuật bắt vít, xử lý mối nối</div>
                  </div>
                </Link>
                <Link href="/faq" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-800 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center flex-shrink-0"><HelpCircle size={16} /></div>
                  <div>
                    <div className="text-sm font-semibold whitespace-nowrap">Hỏi đáp kỹ thuật (FAQ)</div>
                    <div className="text-xs text-slate-500">Giải đáp 15 thắc mắc PCCC</div>
                  </div>
                </Link>
              </div>
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
          <div className="flex items-center gap-3 flex-shrink-0">
            <button 
              onClick={() => setSearchOpen(true)}
              className="w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-[#5F8A03] hover:border-[#7CB305] hover:bg-[#F4F9E8] flex items-center justify-center transition-all flex-shrink-0"
              title="Tìm kiếm"
            >
              <Search size={18} />
            </button>

            <Link 
              href="#nhan-mau-thu" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F26522] to-[#EA580C] text-white text-sm font-bold shadow-md hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all whitespace-nowrap flex-shrink-0"
            >
              <Package size={16} className="flex-shrink-0" />
              <span className="hidden sm:inline">Nhận Mẫu Thử Miễn Phí</span>
              <span className="sm:hidden">Nhận Mẫu</span>
            </Link>

            {/* Nút Mobile Hamburger */}
            <button 
              onClick={() => setMobileOpen(true)} 
              className="xl:hidden p-2 text-slate-800 hover:text-[#F26522] flex-shrink-0"
              aria-label="Menu"
            >
              <Menu size={24} />
            </button>
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
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl z-50 flex flex-col overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <img 
                src="https://mgo.com.vn/wp-content/uploads/2022/08/Logo_remak_800.png" 
                alt="Remak Logo" 
                className="h-8 w-auto object-contain" 
              />
              <button 
                onClick={() => setMobileOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
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
                    <span>Ứng dụng</span>
                    <ChevronDown size={16} className={`transition-transform ${activeMobileSubmenu === 'apps' ? 'rotate-180 text-[#5F8A03]' : ''}`} />
                  </button>
                  {activeMobileSubmenu === 'apps' && (
                    <div className="pl-4 py-1 flex flex-col gap-1 text-sm text-slate-600">
                      <Link href="/ung-dung/boc-ong-gio-chong-chay-pccc" onClick={() => setMobileOpen(false)} className="py-1.5 px-3 rounded hover:bg-slate-100">• Bọc ống gió PCCC</Link>
                      <Link href="/ung-dung/vach-ngan-chong-chay-karaoke-bar" onClick={() => setMobileOpen(false)} className="py-1.5 px-3 rounded hover:bg-slate-100">• Vách ngăn Karaoke / Bar</Link>
                      <Link href="/ung-dung/san-chieu-luc-nha-thep-tien-che" onClick={() => setMobileOpen(false)} className="py-1.5 px-3 rounded hover:bg-slate-100">• Sàn chịu lực nhà thép</Link>
                      <Link href="/ung-dung/vach-tran-nha-xuong-cong-nghiep" onClick={() => setMobileOpen(false)} className="py-1.5 px-3 rounded hover:bg-slate-100">• Vách trần nhà xưởng</Link>
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

      {/* 4. MODAL TÌM KIẾM THÔNG MINH */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-2xl p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Tìm kiếm sản phẩm & giải pháp MGO</h3>
              <button onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-3 border-2 border-[#7CB305] rounded-xl px-4 py-2.5">
              <Search size={18} className="text-[#7CB305]" />
              <input 
                type="text" 
                placeholder="Nhập độ dày (10mm, 12mm), ống gió, kết quả đốt mẫu..." 
                className="w-full outline-none text-slate-800 text-sm" 
                autoFocus
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="text-slate-400 py-1">Gợi ý:</span>
              <span className="bg-slate-100 hover:bg-[#F4F9E8] hover:text-[#5F8A03] px-2.5 py-1 rounded-full cursor-pointer">Bọc ống gió 10mm</span>
              <span className="bg-slate-100 hover:bg-[#F4F9E8] hover:text-[#5F8A03] px-2.5 py-1 rounded-full cursor-pointer">Vách chống cháy EI 60</span>
              <span className="bg-slate-100 hover:bg-[#F4F9E8] hover:text-[#5F8A03] px-2.5 py-1 rounded-full cursor-pointer">Tấm sàn 18mm</span>
              <span className="bg-slate-100 hover:bg-[#F4F9E8] hover:text-[#5F8A03] px-2.5 py-1 rounded-full cursor-pointer">Kết quả thử nghiệm IBST</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
