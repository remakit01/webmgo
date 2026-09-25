'use client';

import React, { useState } from 'react';
import { Bug, Flame, Droplets, Leaf, ArrowRight, CheckCircle2, FileCheck, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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
    id: 'insect',
    index: 1,
    icon: Bug,
    title: 'Kháng Mối Mọt & Côn Trùng',
    enTitle: 'Natural Termite Proof',
    tagline: '100% khoáng vô cơ không chứa xenlulozo',
    desc: 'Cấu tạo từ Magie Oxit (MgO) và mạng sợi thủy tinh đa tầng, loại bỏ hoàn toàn mùn cưa hữu cơ. Mối mọt và côn trùng tuyệt đối không thể tiêu hóa hay đục khoét làm tổ.',
    statNumber: '100%',
    statLabel: 'Kháng tự nhiên không hóa chất',
    image: '/images/mgo-mesh.jpg',
    accentColor: 'green',
    bullets: [
      'Không cần ngâm tẩm hóa chất bảo quản độc hại',
      'Độ bền cấu trúc vĩnh cửu theo thời gian',
      'Đạt chứng nhận an toàn sinh học công trình',
    ],
  },
  {
    id: 'fire',
    index: 2,
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
    index: 3,
    icon: Droplets,
    title: 'Kháng Nước & Chống Nồm Ẩm',
    enTitle: 'Zero Moisture Absorption',
    tagline: 'Tỷ lệ giãn nở 0% – Không mủn rã khi ngâm nước',
    desc: 'Giải quyết triệt để nhược điểm sợ nước của thạch cao và tình trạng ngậm ẩm nặng của Cemboard. Kích thước và cường độ chịu lực giữ nguyên vẹn trong mùa nồm ẩm.',
    statNumber: '0.0%',
    statLabel: 'Hệ số giãn nở thủy phân',
    image: '/images/mgo-floor.jpg',
    accentColor: 'green',
    bullets: [
      'Thích nghi tối đa khí hậu nồm ẩm Việt Nam',
      'Không sinh rêu mốc, vi khuẩn trong phòng kín',
      'Bề mặt dễ dàng lau chùi vệ sinh trực tiếp bằng nước',
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
    accentColor: 'orange',
    bullets: [
      'Đạt chuẩn chất lượng không khí trong nhà (IAQ)',
      'An toàn cho công nhân thi công và người sử dụng',
      'Vật liệu xanh thay thế thạch cao và tấm xi măng',
    ],
  },
];

/**
 * Section "Interactive Tab Showcase" (Không cần scroll mỏi tay)
 * - Cột trái: 4 Tab bấm chọn đặc tính vượt trội
 * - Cột phải: Hiển thị duy nhất 1 card chi tiết của đặc tính được chọn, đổi nội dung + ảnh thực tế mượt mà
 */
export default function StickyBenefitsSection() {
  const [activeId, setActiveId] = useState<string>('insect');

  const activeBenefit = BENEFITS.find((b) => b.id === activeId) || BENEFITS[0];
  const isOrange = activeBenefit.accentColor === 'orange';
  const IconComponent = activeBenefit.icon;

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
            
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F9E8] border border-[#7CB305]/30 text-xs font-bold tracking-wide text-[#5F8A03]">
              <Sparkles size={14} className="text-[#F26522]" />
              <span>ĐẶC TÍNH KỸ THUẬT CỐT LÕI</span>
            </div>

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
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>CHỌN ĐẶC TÍNH KỸ THUẬT:</span>
                <span className="text-[11px] font-medium text-slate-400 lowercase">bấm để chuyển</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {BENEFITS.map((item) => {
                  const isCurrent = activeId === item.id;
                  const itemOrange = item.accentColor === 'orange';
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveId(item.id)}
                      className={`relative w-full p-4 rounded-2xl text-left transition-all duration-300 flex items-center justify-between cursor-pointer border overflow-hidden ${
                        isCurrent
                          ? (itemOrange 
                              ? 'bg-white border-2 border-[#F26522] shadow-xl shadow-orange-500/15 ring-2 ring-[#F26522]/20 translate-x-1' 
                              : 'bg-white border-2 border-[#7CB305] shadow-xl shadow-green-500/15 ring-2 ring-[#7CB305]/20 translate-x-1')
                          : 'bg-slate-50/90 border-slate-200/90 hover:bg-white hover:border-slate-300 hover:shadow-md text-slate-600'
                      }`}
                    >
                      {/* Vạch màu chỉ báo active bên trái */}
                      {isCurrent && (
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                          itemOrange ? 'bg-[#F26522]' : 'bg-[#7CB305]'
                        }`} />
                      )}

                      <div className="flex items-center gap-3.5 pl-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          isCurrent
                            ? (itemOrange ? 'bg-[#FEF3EC] text-[#F26522] scale-110 shadow-sm' : 'bg-[#F4F9E8] text-[#5F8A03] scale-110 shadow-sm')
                            : 'bg-slate-200/70 text-slate-500'
                        }`}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <div className={`text-xs sm:text-sm font-extrabold transition-colors ${
                            isCurrent ? 'text-slate-900' : 'text-slate-700'
                          }`}>
                            0{item.index}. {item.title}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium truncate max-w-[220px] sm:max-w-[270px] mt-0.5">
                            {item.tagline}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className={`text-xs font-black px-2.5 py-1 rounded-full transition-colors ${
                          isCurrent 
                            ? (itemOrange ? 'bg-[#FEF3EC] text-[#F26522]' : 'bg-[#F4F9E8] text-[#5F8A03]') 
                            : 'text-slate-400 bg-slate-100'
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
              
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <FileCheck size={16} className="text-[#7CB305]" />
                <span>Viện IBST chứng nhận</span>
              </div>
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
                const IconComponent = item.icon;

                return (
                  <div 
                    key={item.id}
                    className={`col-start-1 row-start-1 bg-white rounded-3xl overflow-hidden border shadow-xl transition-all duration-500 ease-out ${
                      isActive 
                        ? 'opacity-100 translate-y-0 scale-100 z-10 pointer-events-auto' 
                        : 'opacity-0 translate-y-4 scale-[0.98] z-0 pointer-events-none'
                    } ${
                      isOrange 
                        ? 'border-[#F26522]/30 shadow-orange-500/10' 
                        : 'border-[#7CB305]/30 shadow-green-500/10'
                    }`}
                  >
                    {/* Top Accent Bar */}
                    <div className={`h-1.5 w-full ${isOrange ? 'bg-[#F26522]' : 'bg-[#7CB305]'}`} />

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

                      {/* Badge góc trên */}
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-md border border-slate-200/80 flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isOrange ? 'bg-[#FEF3EC] text-[#F26522]' : 'bg-[#F4F9E8] text-[#5F8A03]'
                        }`}>
                          <IconComponent size={16} />
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          Đặc Tính 0{item.index} / 04
                        </span>
                      </div>

                      {/* Chỉ số lớn góc dưới ảnh */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                        <div>
                          <div className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
                            Chỉ số kỹ thuật đột phá:
                          </div>
                          <div className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
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
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                          0{item.index} • Remak® FireOFF
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-xs font-semibold mt-1 text-[#F26522]">
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
                              isOrange ? 'text-[#F26522]' : 'text-[#7CB305]'
                            }`} />
                            <span className="font-medium">{bullet}</span>
                          </div>
                        ))}
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
