import React from 'react';
import Link from 'next/link';
import { Wind, Flame, Layers, DoorClosed, ArrowRight } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';

const APPLICATIONS = [
  {
    title: 'Bọc Ống Gió PCCC',
    desc: 'Đạt chuẩn QCVN 06:2022 (EI 30 - 120). Nhẹ hơn Cemboard 30%, không sinh khói độc.',
    thickness: '8mm – 10mm',
    img: '/images/mgo-duct.jpg',
    icon: Wind,
    link: '/ung-dung#boc-ong-gio',
  },
  {
    title: 'Vách Chống Cháy & Cách Âm',
    desc: 'Cách âm 45dB, kháng ẩm 100%, chống nấm mốc cho phòng máy và quán karaoke.',
    thickness: '10mm – 12mm',
    img: '/images/mgo-wall.jpg',
    icon: Flame,
    link: '/ung-dung#vach-chong-chay',
  },
  {
    title: 'Lót Sàn Chịu Tải Gác Lửng',
    desc: 'Tải trọng >500kg/m², kháng mối mọt vĩnh viễn, thi công nhanh hơn đổ bê tông.',
    thickness: '15mm – 18mm',
    img: '/images/mgo-floor.jpg',
    icon: Layers,
    link: '/ung-dung#san-chiu-luc',
  },
  {
    title: 'Lõi Cửa Thép Chống Cháy',
    desc: 'Thay thế bông khoáng truyền thống, định hình chắc chắn cho cánh cửa thép PCCC.',
    thickness: '5mm – 6mm',
    img: '/images/mgo-mesh.jpg',
    icon: DoorClosed,
    link: '/ung-dung#cua-chong-chay',
  },
];

export default function ApplicationGrid() {
  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-8">
      <SectionHeading 
        badge="ỨNG DỤNG THỰC TẾ"
        badgeColor="green"
        title="Ứng Dụng Tiêu Biểu Tấm MGO"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {APPLICATIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx} 
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img 
                  src={item.img} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">
                  Độ dày: {item.thickness}
                </div>
              </div>

              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center mb-3">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-[#5F8A03] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <Link 
                  href={item.link} 
                  className="text-xs font-bold text-[#F26522] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform pt-2"
                >
                  <span>Xem Chi Tiết Giải Pháp</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
