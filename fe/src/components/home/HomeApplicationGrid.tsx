'use client';

import React, { useState } from 'react';
import Link from '@/components/ui/LocaleLink';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';

type AppCategory = 'all' | 'duct' | 'wall' | 'floor' | 'door';

const FILTER_TABS: { id: AppCategory; label: string }[] = [
  { id: 'all',   label: 'Tất cả' },
  { id: 'duct',  label: 'Bọc Ống Gió PCCC' },
  { id: 'wall',  label: 'Vách Chống Cháy' },
  { id: 'floor', label: 'Lót Sàn' },
  { id: 'door',  label: 'Lõi Cửa Thép' },
];

const APPLICATIONS = [
  // ── DUCT ──
  {
    category: 'duct',
    title: 'Ống Gió EI 30',
    desc: 'Tấm 5mm + bông khoáng 25mm. Phù hợp ống gió tầng hầm, hành lang thoát hiểm cấp thấp.',
    badge: 'EI 30',
    img: '/images/mgo-duct.jpg',
    link: '/giai-phap-ung-dung#boc-ong-gio',
    accent: 'bg-[#F26522]',
    accentText: 'text-[#F26522]',
  },
  {
    category: 'duct',
    title: 'Ống Gió EI 60',
    desc: 'Tấm 8mm + bông khoáng 50mm. Tiêu chuẩn phổ biến nhất cho ống gió PCCC toà nhà.',
    badge: 'EI 60',
    img: '/images/mgo-duct.jpg',
    link: '/giai-phap-ung-dung#boc-ong-gio',
    accent: 'bg-[#F26522]',
    accentText: 'text-[#F26522]',
  },
  {
    category: 'duct',
    title: 'Ống Gió EI 90',
    desc: 'Tấm 10mm + bông khoáng 75mm. Dùng cho ống gió xuyên tường/sàn ngăn cháy.',
    badge: 'EI 90',
    img: '/images/mgo-duct.jpg',
    link: '/giai-phap-ung-dung#boc-ong-gio',
    accent: 'bg-[#F26522]',
    accentText: 'text-[#F26522]',
  },
  {
    category: 'duct',
    title: 'Ống Gió EI 120',
    desc: 'Tấm 12mm + bông khoáng 100mm. Yêu cầu cao nhất — bệnh viện, khách sạn 5 sao.',
    badge: 'EI 120',
    img: '/images/mgo-duct.jpg',
    link: '/giai-phap-ung-dung#boc-ong-gio',
    accent: 'bg-[#F26522]',
    accentText: 'text-[#F26522]',
  },
  // ── WALL ──
  {
    category: 'wall',
    title: 'Vách Đơn EI 60',
    desc: '2 lớp tấm 10mm + khung kẽm C75. Cách âm 42dB, kháng ẩm 100%.',
    badge: 'EI 60',
    img: '/images/mgo-wall.jpg',
    link: '/giai-phap-ung-dung#vach-chong-chay',
    accent: 'bg-[#5F8A03]',
    accentText: 'text-[#5F8A03]',
  },
  {
    category: 'wall',
    title: 'Vách Đôi EI 120',
    desc: '2 lớp tấm 12mm hai mặt + bông khoáng 50mm. Cách âm 52dB, chịu lửa 2h.',
    badge: 'EI 120',
    img: '/images/mgo-wall.jpg',
    link: '/giai-phap-ung-dung#vach-chong-chay',
    accent: 'bg-[#5F8A03]',
    accentText: 'text-[#5F8A03]',
  },
  {
    category: 'wall',
    title: 'Vách Cách Âm Cao Cấp',
    desc: 'Phòng máy chủ, karaoke, studio. Cách âm 55–60dB, không cần xử lý bề mặt thêm.',
    badge: 'STC 55+',
    img: '/images/mgo-wall.jpg',
    link: '/giai-phap-ung-dung#vach-chong-chay',
    accent: 'bg-[#5F8A03]',
    accentText: 'text-[#5F8A03]',
    isNew: true,
  },
  // ── FLOOR ──
  {
    category: 'floor',
    title: 'Sàn Gác Lửng Nhẹ',
    desc: 'Tấm 15mm trên khung thép. Tải trọng >300kg/m², thi công không cần đổ bê tông.',
    badge: 'REI 120',
    img: '/images/mgo-floor.jpg',
    link: '/giai-phap-ung-dung#san-chiu-luc',
    accent: 'bg-slate-700',
    accentText: 'text-slate-700',
  },
  {
    category: 'floor',
    title: 'Sàn Chịu Tải Nặng',
    desc: 'Tấm 18mm trên khung thép dày. Tải trọng >500kg/m², kháng mối mọt vĩnh viễn.',
    badge: 'REI 180',
    img: '/images/mgo-floor.jpg',
    link: '/giai-phap-ung-dung#san-chiu-luc',
    accent: 'bg-slate-700',
    accentText: 'text-slate-700',
    isNew: true,
  },
  // ── DOOR ──
  {
    category: 'door',
    title: 'Lõi Cửa Thép EI 30–60',
    desc: 'Tấm 5mm–6mm thay thế bông khoáng. Định hình chắc, không bị xô lệch sau lắp ráp.',
    badge: 'EI 30–60',
    img: '/images/mgo-board.jpg',
    link: '/giai-phap-ung-dung#cua-chong-chay',
    accent: 'bg-purple-600',
    accentText: 'text-purple-600',
  },
  {
    category: 'door',
    title: 'Lõi Cửa Thép EI 90',
    desc: 'Tấm 8mm kết hợp bông khoáng mỏng. Đạt EI 90, phù hợp cửa buồng thang máy PCCC.',
    badge: 'EI 90',
    img: '/images/mgo-board.jpg',
    link: '/giai-phap-ung-dung#cua-chong-chay',
    accent: 'bg-purple-600',
    accentText: 'text-purple-600',
    isNew: true,
  },
];

export default function HomeApplicationGrid() {
  const [active, setActive] = useState<AppCategory>('all');

  const filtered = (active === 'all' ? APPLICATIONS : APPLICATIONS.filter(a => a.category === active))
    .slice()
    .sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

  // Mặc định chỉ hiển thị 8 giải pháp tiêu biểu
  const displayed = filtered.slice(0, 8);

  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-8">
      <SectionHeading title="Giải Pháp Ứng Dụng Tiêu Biểu" />

      {/* Filter tabs */}
      <div className="flex justify-center mb-6 sm:mb-8" role="tablist" aria-label="Lọc theo ứng dụng thực tế">
        <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border-2 border-slate-300 shadow-sm w-full max-w-sm sm:max-w-fit">
          {FILTER_TABS.map((tab, idx) => {
            const isActive = active === tab.id;
            const isFullWidthMobile = FILTER_TABS.length % 2 !== 0 && idx === 0;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(tab.id)}
                className={`px-3.5 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-center select-none flex items-center justify-center border-2 ${
                  isFullWidthMobile ? 'col-span-2' : 'col-span-1'
                } ${
                  isActive
                    ? 'bg-[#5F8A03] text-white border-[#4E7202] shadow-md shadow-[#5F8A03]/30 font-extrabold'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {displayed.map((item, idx) => {
          // So le màu Xanh lá (#5F8A03) trước, Cam (#F26522) sau xen kẽ nhau
          const isGreen = (Math.floor(idx / 4) + idx) % 2 === 0;
          const theme = isGreen ? {
            badgeBg: 'bg-[#5F8A03]',
            borderHover: 'hover:border-[#7CB305]/60',
            textHover: 'group-hover:text-[#5F8A03]',
            btnText: 'text-[#5F8A03]',
          } : {
            badgeBg: 'bg-[#F26522]',
            borderHover: 'hover:border-[#F26522]/60',
            textHover: 'group-hover:text-[#F26522]',
            btnText: 'text-[#F26522]',
          };

          return (
            <div
              key={idx}
              className={`group bg-white rounded-2xl overflow-hidden border-2 border-slate-200 shadow-xs hover:shadow-xl ${theme.borderHover} hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]`}
            >
              <Link href={item.link} className="relative h-48 overflow-hidden bg-slate-100 block">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                {/* Fire rating badge */}
                <div className={`absolute bottom-3 left-3 ${theme.badgeBg} px-2.5 py-1 rounded-md text-[10px] font-black text-white shadow-md flex items-center gap-1`}>
                  <ShieldCheck size={12} />
                  <span>{item.badge}</span>
                </div>
                {/* New badge */}
                {item.isNew && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#5F8A03] text-white px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide shadow-md">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                    </span>
                    MỚI
                  </div>
                )}
              </Link>

              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div>
                  <Link href={item.link} className="block">
                    <h3 className={`font-bold text-slate-900 text-base ${theme.textHover} transition-colors leading-snug`}>
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={item.link}
                    className={`text-xs font-bold ${theme.btnText} hover:underline flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform`}
                  >
                    <span>Xem chi tiết giải pháp</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length > 8 && (
        <div className="mt-10 text-center">
          <Link
            href="/giai-phap-ung-dung"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white border-2 border-slate-300 hover:border-[#7CB305] text-slate-800 hover:text-[#5F8A03] text-sm font-bold transition-all shadow-xs hover:shadow-md cursor-pointer group"
          >
            <span>Xem Tất Cả Giải Pháp Ứng Dụng</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </section>
  );
}
