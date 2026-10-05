'use client';

import React, { useState } from 'react';
import { Bug, Flame, Droplets, Leaf, ArrowRight, CheckCircle2, FileCheck, ChevronRight } from 'lucide-react';
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
 * - Cột trái: 4 Tab bấm chọn đặc tính vượt trội
 * - Cột phải: Hiển thị duy nhất 1 card chi tiết của đặc tính được chọn, đổi nội dung + ảnh thực tế mượt mà
 */
export default function HomeStickyBenefits() {
  const [activeId, setActiveId] = useState<string>('fire');

  return (
    <section 
      aria-label="Ưu Điểm Vượt Trội Tấm MGO Remak"
      className="relative bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC] py-20 px-4 lg:px-8"
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* =========================================================================
              CỘT TRÁI: TIÊU ĐỀ & 4 TAB ĐIỀU HƯỚNG BẤM CHỌN ĐẶC TÍNH
             ========================================================================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tiêu đề chính */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-[1.22] tracking-tight">
              Hiệu Năng Vượt Trội <br className="hidden sm:inline" />
              Vật Liệu Truyền Thống
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Lõi Magie Oxit khắc phục triệt để nhược điểm sợ nước của thạch cao, độ nặng của Cemboard và tính dễ cháy của ván ép.
            </p>

            {/* BỘ 4 TAB BẤM CHỌN ĐẶC TÍNH (CLICK ĐỂ CHỌN - KHÔNG HOVER TỰ ĐỔI) */}
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
                              ? 'bg-white border-2 border-[#F26522] shadow-xl shadow-orange-500/15 ring-2 ring-[#F26522]/20 translate-x-1' 
                              : 'bg-white border-2 border-[#5F8A03] shadow-xl shadow-green-600/15 ring-2 ring-[#5F8A03]/20 translate-x-1')
                          : (itemOrange
                              ? 'bg-slate-50/90 border-slate-200/90 hover:bg-[#FEF3EC]/50 hover:border-[#F26522]/50 hover:shadow-md hover:shadow-orange-500/10 hover:translate-x-0.5 text-slate-700'
                              : 'bg-slate-50/90 border-slate-200/90 hover:bg-[#F4F9E8]/50 hover:border-[#5F8A03]/50 hover:shadow-md hover:shadow-green-600/10 hover:translate-x-0.5 text-slate-700')
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          isCurrent
                            ? (itemOrange ? 'bg-[#FEF3EC] text-[#F26522] scale-110 shadow-sm' : 'bg-[#F4F9E8] text-[#5F8A03] scale-110 shadow-sm')
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
                          0{item.index}. {item.title}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className={`text-xs font-black px-3 py-1 rounded-full transition-all duration-200 border ${
                          isCurrent 
                            ? (itemOrange 
                                ? 'bg-[#FEF3EC] text-[#C2410C] border-[#F26522]/50 shadow-xs' 
                                : 'bg-[#F4F9E8] text-[#3B5702] border-[#5F8A03]/50 shadow-xs') 
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

            {/* Nút hành động */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link 
                href="/san-pham/tam-mgo" 
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#F26522] to-[#EA580C] text-white font-bold text-sm shadow-md hover:shadow-orange-500/25 hover:-translate-y-0.5 transition-all"
              >
                <span>Xem Hồ Sơ Kiểm Định PCCC</span>
                <ArrowRight size={16} />
              </Link>
            </div>

          </div>

          {/* =========================================================================
              CỘT PHẢI: HIỂN THỊ DUY NHẤT 1 CARD ĐẶC TÍNH VỚI ANIMATION CROSS-FADE MƯỢT MÀ
             ========================================================================= */}
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
                    className={`col-start-1 row-start-1 bg-white rounded-3xl overflow-hidden border shadow-xl transition-all duration-500 ease-out ${
                      isActive 
                        ? 'opacity-100 translate-y-0 scale-100 z-10 pointer-events-auto' 
                        : 'opacity-0 translate-y-4 scale-[0.98] z-0 pointer-events-none'
                    } ${
                      isOrange 
                        ? 'border-[#F26522]/30 shadow-orange-500/10' 
                        : 'border-[#5F8A03]/30 shadow-green-600/10'
                    }`}
                  >
                    {/* Top Accent Bar */}
                    <div className={`h-1.5 w-full ${isOrange ? 'bg-[#F26522]' : 'bg-[#5F8A03]'}`} />

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
