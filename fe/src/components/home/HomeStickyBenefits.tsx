'use client';

import React, { useState } from 'react';
import { 
  Bug, 
  Flame, 
  Droplets, 
  Leaf, 
  ArrowRight, 
  CheckCircle2, 
  FileCheck, 
  ChevronRight,
  ChevronDown 
} from 'lucide-react';
import Link from '@/components/ui/LocaleLink';

interface BenefitItem {
  id: string;
  index: number;
  icon: React.ElementType;
  title: string;
  enTitle: string;
  tagline: string;
  desc: string;
  statNumber: string;
  statLabel: string;
  image: string;
  accentColor: 'green' | 'orange';
  bullets: string[];
}

const BENEFITS: BenefitItem[] = [
  {
    id: 'fire',
    index: 1,
    icon: Flame,
    title: 'Chống Cháy A1 (EI 30 – 180)',
    enTitle: 'Euroclass A1 Non-Combustible',
    tagline: 'Chịu nhiệt 1.200°C – Không bắt lửa',
    desc: 'Kiểm định đốt mẫu thực tế tại Viện IBST theo QCVN 06:2022/BXD. Khi gặp lửa trực tiếp, tấm không sinh khói độc, không nhỏ giọt và bảo vệ nguyên vẹn đường thoát nạn.',
    statNumber: '1.200°C',
    statLabel: 'Chịu lửa đốt mẫu thực tế',
    image: '/images/mgo-duct.jpg',
    accentColor: 'orange',
    bullets: [
      'Euroclass A1 – Hệ số lan truyền lửa = 0',
      'Có sẵn kết quả đốt mẫu ống gió & vách ngăn',
      'Ngăn truyền nhiệt tối ưu cho khoang cháy',
    ],
  },
  {
    id: 'water',
    index: 2,
    icon: Droplets,
    title: 'Kháng Nước & Không Rỉ Sét',
    enTitle: 'Zero Moisture Absorption & Non-Corrosive',
    tagline: 'Công thức Magie Sunfat độc quyền – Tuyệt đối không rỉ ốc vít',
    desc: 'Giải quyết triệt để nhược điểm sợ nước của thạch cao và tình trạng ngậm ẩm nặng của Cemboard. Công thức Sunfat không chứa ion Clorua (Zero Chloride) bảo vệ khung xương kim loại vĩnh cửu.',
    statNumber: '0% Clo',
    statLabel: 'Không gây ăn mòn kim loại & ốc vít',
    image: '/images/mgo-floor.jpg',
    accentColor: 'green',
    bullets: [
      'Công thức Sunfat cao cấp – Không chảy nước muối',
      'Không sinh rêu mốc, vi khuẩn trong phòng kín',
      'Bề mặt dễ dàng lau chùi vệ sinh trực tiếp bằng nước',
    ],
  },
  {
    id: 'insect',
    index: 3,
    icon: Bug,
    title: 'Kháng Mối Mọt & Côn Trùng',
    enTitle: 'Natural Termite Proof',
    tagline: '100% khoáng vô cơ không chứa xenlulozo',
    desc: 'Cấu tạo từ Magie Oxit (MgO) và mạng sợi thủy tinh đa tầng, loại bỏ hoàn toàn mùn cưa hữu cơ. Mối mọt và côn trùng tuyệt đối không thể tiêu hóa hay đục khoét làm tổ.',
    statNumber: '100%',
    statLabel: 'Kháng tự nhiên không hóa chất',
    image: '/images/mgo-mesh.jpg',
    accentColor: 'orange',
    bullets: [
      'Không cần ngâm tẩm hóa chất bảo quản độc hại',
      'Độ bền cấu trúc vĩnh cửu theo thời gian',
      'Đạt chứng nhận an toàn sinh học công trình',
    ],
  },
  {
    id: 'eco',
    index: 4,
    icon: Leaf,
    title: 'Vật Liệu Xanh (0% Amiăng)',
    enTitle: 'Zero VOCs & Non-Toxic',
    tagline: '0% Amiăng – 0% Formaldehyde – Tái chế 100%',
    desc: 'Sản xuất từ khoáng sản tự nhiên thân thiện với sức khỏe. Không phát tán bụi mịn silica hay khí độc, giúp công trình tích lũy trọn vẹn điểm thưởng LEED và LOTUS.',
    statNumber: '0% VOCs',
    statLabel: 'Không hóa chất bay hơi độc hại',
    image: '/images/mgo-wall.jpg',
    accentColor: 'green',
    bullets: [
      'Đạt chuẩn chất lượng không khí trong nhà (IAQ)',
      'An toàn cho công nhân thi công và người sử dụng',
      'Vật liệu xanh thay thế thạch cao và tấm xi măng',
    ],
  },
];

/**
 * Component HomeStickyBenefits:
 * - Desktop (>= lg): GIỮ NGUYÊN 100% BẢN GỐC (Bố cục 2 cột kinh điển: cột trái 5/12 chọn tab, cột phải 7/12 card chi tiết ảnh lớn).
 * - Mobile (< lg): List Dọc Accordion thông minh, bấm vào thanh nào thì ảnh nở ra ngay bên dưới thanh đó.
 */
export default function HomeStickyBenefits() {
  const [activeId, setActiveId] = useState<string>('fire');

  return (
    <section 
      aria-label="Ưu Điểm Vượt Trội Tấm MGO Remak"
      className="relative bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC] py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto">
        
        {/* =========================================================================
            1. PHIÊN BẢN MOBILE (< lg): LIST DỌC ACCORDION (BẤM VÀO ĐÂU, ẢNH NỞ RA NGAY DƯỚI ĐÓ)
           ========================================================================= */}
        <div className="block lg:hidden space-y-6">
          
          {/* Header Mobile */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight">
              Hiệu Năng Vượt Trội <br />
              <span className="text-slate-800">Vật Liệu Truyền Thống</span>
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Lõi Magie Oxit khắc phục triệt để nhược điểm sợ nước của thạch cao, độ nặng của Cemboard và tính dễ cháy của ván ép.
            </p>
          </div>

          {/* Danh Sách Accordion List Dọc Trên Mobile */}
          <div className="space-y-3">
            {BENEFITS.map((item) => {
              const isOpen = activeId === item.id;
              const isOrange = item.accentColor === 'orange';
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? isOrange
                        ? 'border-[#F26522] bg-white'
                        : 'border-[#5F8A03] bg-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {/* Thanh Tiêu Đề Item (Bấm vào để mở ảnh ở dưới) */}
                  <button
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className={`w-full p-3.5 sm:p-4 flex items-center justify-between text-left cursor-pointer transition-colors select-none ${
                      isOpen 
                        ? isOrange ? 'bg-[#FEF3EC]/40' : 'bg-[#F4F9E8]/40'
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform ${
                        isOpen
                          ? isOrange ? 'bg-[#F26522] text-white shadow-sm' : 'bg-[#5F8A03] text-white shadow-sm'
                          : isOrange 
                            ? 'bg-orange-100 text-[#EA580C]' 
                            : 'bg-lime-100 text-[#5F8A03]'
                      }`}>
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0">
                        <h3 className={`text-xs sm:text-sm font-extrabold truncate ${
                          isOpen 
                            ? isOrange ? 'text-[#F26522]' : 'text-[#5F8A03]'
                            : 'text-slate-800'
                        }`}>
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                        isOpen
                          ? isOrange
                            ? 'bg-[#FEF3EC] text-[#EA580C] border-[#F26522]/60'
                            : 'bg-[#F4F9E8] text-[#3B5702] border-[#5F8A03]/60'
                          : isOrange
                            ? 'bg-orange-50 text-[#C2410C] border-orange-200'
                            : 'bg-lime-50 text-[#3B5702] border-lime-200'
                      }`}>
                        {item.statNumber}
                      </div>

                      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300 ${
                        isOpen 
                          ? (isOrange ? 'bg-[#FEF3EC] text-[#F26522] rotate-180' : 'bg-[#F4F9E8] text-[#5F8A03] rotate-180')
                          : 'bg-slate-100 text-slate-500 rotate-0'
                      }`}>
                        <ChevronDown size={15} className="stroke-[2.5]" />
                      </div>
                    </div>
                  </button>

                  {/* Vùng Ảnh & Nội Dung Mở Ra Ngay Bên Dưới Thanh Bấm */}
                  {isOpen && (
                    <div className="border-t-2 border-slate-100 p-3.5 sm:p-4 bg-white animate-in fade-in-50 duration-200 space-y-3">
                      {/* Ảnh thực tế hiển thị ngay dưới */}
                      <div className="relative h-48 sm:h-56 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />

                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">
                              Chỉ số kỹ thuật đột phá:
                            </div>
                            <div className={`text-2xl font-black tracking-tight drop-shadow-md ${
                              isOrange ? 'text-[#FF8447]' : 'text-[#A3E635]'
                            }`}>
                              {item.statNumber}
                            </div>
                          </div>
                          <div className="text-right text-[11px] text-slate-200 font-medium max-w-[150px] drop-shadow-sm leading-tight">
                            {item.statLabel}
                          </div>
                        </div>
                      </div>

                      {/* Thông tin chi tiết */}
                      <div className="space-y-2.5">
                        <div>
                          <p className={`text-xs font-semibold ${isOrange ? 'text-[#F26522]' : 'text-[#5F8A03]'}`}>
                            {item.tagline}
                          </p>
                          <p className="text-xs text-slate-600 leading-relaxed mt-1">
                            {item.desc}
                          </p>
                        </div>

                        {/* Bullets kiểm định */}
                        <div className="space-y-1.5 pt-1">
                          {item.bullets.map((bullet, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700"
                            >
                              <CheckCircle2 
                                size={15} 
                                className={`flex-shrink-0 mt-0.5 ${
                                  isOrange ? 'text-[#F26522]' : 'text-[#5F8A03]'
                                }`} 
                              />
                              <span className="font-medium leading-tight">{bullet}</span>
                            </div>
                          ))}
                        </div>

                        {/* Nút CTA full-width 48px chuẩn ngón cái */}
                        <div className="pt-2">
                          <Link
                            href="/bao-gia"
                            className={`w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white text-xs sm:text-sm font-extrabold shadow-md active:scale-[0.98] transition-all cursor-pointer ${
                              isOrange
                                ? 'bg-gradient-to-r from-[#F26522] to-[#EA580C] shadow-orange-600/30'
                                : 'bg-gradient-to-r from-[#5F8A03] to-[#4D7002] shadow-green-700/30'
                            }`}
                          >
                            <span>Nhận Báo Giá Giải Pháp {item.title}</span>
                            <ArrowRight size={16} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>


        {/* =========================================================================
            2. PHIÊN BẢN DESKTOP (>= lg): GIỮ NGUYÊN 100% BẢN GỐC BAN ĐẦU
               (Cột trái: 5/12 Tiêu đề + 4 Tab chọn; Cột phải: 7/12 Card chi tiết lớn)
           ========================================================================= */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* CỘT TRÁI: TIÊU ĐỀ & 4 TAB ĐIỀU HƯỚNG BẤM CHỌN ĐẶC TÍNH */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tiêu đề chính */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-[1.22] tracking-tight">
              Hiệu Năng Vượt Trội <br className="hidden sm:inline" />
              Vật Liệu Truyền Thống
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Lõi Magie Oxit khắc phục triệt để nhược điểm sợ nước của thạch cao, độ nặng của Cemboard và tính dễ cháy của ván ép.
            </p>

            {/* BỘ 4 TAB BẤM CHỌN ĐẶC TÍNH (CLICK ĐỂ CHỌN) */}
            <div className="space-y-2.5 pt-2">
              <div className="flex flex-col gap-2.5" role="tablist" aria-orientation="vertical">
                {BENEFITS.map((item) => {
                  const isCurrent = activeId === item.id;
                  const itemOrange = item.accentColor === 'orange';
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      id={`benefit-tab-${item.id}`}
                      aria-selected={isCurrent}
                      aria-controls={`benefit-panel-${item.id}`}
                      onClick={() => setActiveId(item.id)}
                      className={`group relative w-full p-4 rounded-2xl text-left transition-all duration-300 flex items-center justify-between cursor-pointer border overflow-hidden ${
                        isCurrent
                          ? (itemOrange 
                              ? 'bg-white border-2 border-[#F26522] translate-x-1' 
                              : 'bg-white border-2 border-[#5F8A03] translate-x-1')
                          : (itemOrange
                              ? 'bg-slate-50/90 border-slate-200/90 hover:bg-[#FEF3EC]/50 hover:border-[#F26522]/50 hover:translate-x-0.5 text-slate-700'
                              : 'bg-slate-50/90 border-slate-200/90 hover:bg-[#F4F9E8]/50 hover:border-[#5F8A03]/50 hover:translate-x-0.5 text-slate-700')
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          isCurrent
                            ? (itemOrange ? 'bg-[#FEF3EC] text-[#F26522] scale-110' : 'bg-[#F4F9E8] text-[#5F8A03] scale-110')
                            : (itemOrange 
                                ? 'bg-slate-200/70 text-slate-500 group-hover:bg-[#FEF3EC] group-hover:text-[#F26522] group-hover:scale-105' 
                                : 'bg-slate-200/70 text-slate-500 group-hover:bg-[#F4F9E8] group-hover:text-[#5F8A03] group-hover:scale-105')
                        }`}>
                          <Icon size={20} />
                        </div>
                        <div className={`text-xs sm:text-sm font-extrabold transition-colors ${
                          isCurrent 
                            ? (itemOrange ? 'text-[#F26522]' : 'text-[#5F8A03]')
                            : (itemOrange ? 'text-slate-800 group-hover:text-[#F26522]' : 'text-slate-800 group-hover:text-[#5F8A03]')
                        }`}>
                          {item.title}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className={`text-xs font-black px-3 py-1 rounded-full transition-all duration-200 border ${
                          isCurrent 
                            ? (itemOrange 
                                ? 'bg-[#FEF3EC] text-[#C2410C] border-[#F26522]/50' 
                                : 'bg-[#F4F9E8] text-[#3B5702] border-[#5F8A03]/50') 
                            : (itemOrange 
                                ? 'text-[#C2410C] bg-orange-100/90 border-orange-200/90 group-hover:bg-[#FEF3EC] group-hover:text-[#9A3412] group-hover:border-[#F26522]/50' 
                                : 'text-[#3B5702] bg-[#EAF5D6] border-[#7CB305]/40 group-hover:bg-[#F4F9E8] group-hover:text-[#2E4501] group-hover:border-[#5F8A03]/50')
                        }`}>
                          {item.statNumber}
                        </div>
                        {isCurrent && (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            itemOrange ? 'bg-[#FEF3EC] text-[#F26522]' : 'bg-[#F4F9E8] text-[#5F8A03]'
                          }`}>
                            <ChevronRight size={14} className="stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: HIỂN THỊ DUY NHẤT 1 CARD ĐẶC TÍNH VỚI ANIMATION CROSS-FADE MƯỢT MÀ */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1">
              {BENEFITS.map((item) => {
                const isActive = activeId === item.id;
                const isOrange = item.accentColor === 'orange';

                return (
                  <div
                    key={item.id}
                    role="tabpanel"
                    id={`benefit-panel-${item.id}`}
                    aria-labelledby={`benefit-tab-${item.id}`}
                    aria-hidden={!isActive}
                    className={`col-start-1 row-start-1 bg-white rounded-3xl overflow-hidden border-2 border-slate-300 shadow-xl transition-all duration-500 ease-out ${
                      isActive 
                        ? 'opacity-100 translate-y-0 scale-100 z-10 pointer-events-auto' 
                        : 'opacity-0 translate-y-4 scale-[0.98] z-0 pointer-events-none'
                    }`}
                  >
                    {/* Ảnh thực tế của đặc tính được chọn */}
                    <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-100">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                          isActive ? 'scale-100' : 'scale-105'
                        }`} 
                      />
                      
                      {/* Overlay gradient tinh tế */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/30 to-transparent" />

                      {/* Chỉ số lớn góc dưới ảnh */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                        <div>
                          <div className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
                            Chỉ số kỹ thuật đột phá:
                          </div>
                          <div className={`text-3xl sm:text-4xl font-black tracking-tight drop-shadow-md ${
                            isOrange ? 'text-[#FF8447]' : 'text-[#A3E635]'
                          }`}>
                            {item.statNumber}
                          </div>
                        </div>
                        <div className="text-right text-xs text-slate-200 font-medium max-w-[220px] drop-shadow-sm">
                          {item.statLabel}
                        </div>
                      </div>
                    </div>

                    {/* Phần nội dung chi tiết của đặc tính */}
                    <div className="p-6 sm:p-8 space-y-4">
                      
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h3>
                        <p className={`text-xs font-semibold mt-1 ${isOrange ? 'text-[#F26522]' : 'text-[#5F8A03]'}`}>
                          {item.tagline}
                        </p>
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed">
                        {item.desc}
                      </p>

                      {/* 3 gạch đầu dòng chứng minh thực tế */}
                      <div className="pt-3 border-t border-slate-100 space-y-2.5">
                        {item.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                            <CheckCircle2 size={16} className={`flex-shrink-0 mt-0.5 ${
                              isOrange ? 'text-[#F26522]' : 'text-[#5F8A03]'
                            }`} />
                            <span className="font-medium">{bullet}</span>
                          </div>
                        ))}
                      </div>

                      {/* Nút CTA nhận báo giá giải pháp (Màu động theo card: Cam hoặc Xanh) */}
                      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <Link
                          href="/bao-gia"
                          className={`inline-flex items-center justify-center px-6 py-3 rounded-xl text-white text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer ${
                            isOrange
                              ? 'bg-gradient-to-r from-[#F26522] to-[#EA580C] hover:from-[#EA580C] hover:to-[#D95314] shadow-orange-600/30'
                              : 'bg-gradient-to-r from-[#5F8A03] to-[#4D7002] hover:from-[#4D7002] hover:to-[#3E5A01] shadow-green-700/30'
                          }`}
                        >
                          <span>Nhận Báo Giá Giải Pháp {item.title}</span>
                        </Link>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
