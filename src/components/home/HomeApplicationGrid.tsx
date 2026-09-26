import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';

const APPLICATIONS = [
  {
    title: 'Bọc Ống Gió PCCC',
    desc: 'Đạt chuẩn QCVN 06:2022 (EI 30 - 120). Nhẹ hơn Cemboard 30%, không sinh khói độc.',
    thickness: '8mm – 10mm',
    img: '/images/mgo-duct.jpg',
    link: '/giai-phap-ung-dung#boc-ong-gio',
  },
  {
    title: 'Vách Chống Cháy & Cách Âm',
    desc: 'Cách âm 45dB, kháng ẩm 100%, chống nấm mốc cho phòng máy và quán karaoke.',
    thickness: '10mm – 12mm',
    img: '/images/mgo-wall.jpg',
    link: '/giai-phap-ung-dung#vach-chong-chay',
  },
  {
    title: 'Lót Sàn Chịu Tải Gác Lửng',
    desc: 'Tải trọng >500kg/m², kháng mối mọt vĩnh viễn, thi công nhanh hơn đổ bê tông.',
    thickness: '15mm – 18mm',
    img: '/images/mgo-floor.jpg',
    link: '/giai-phap-ung-dung#san-chiu-luc',
  },
  {
    title: 'Lõi Cửa Thép Chống Cháy',
    desc: 'Thay thế bông khoáng truyền thống, định hình chắc chắn cho cánh cửa thép PCCC.',
    thickness: '5mm – 6mm',
    img: '/images/mgo-board.jpg',
    link: '/giai-phap-ung-dung#cua-chong-chay',
  },
];

export default function HomeApplicationGrid() {
  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-8">
      <SectionHeading
        title="Giải Pháp Ứng Dụng Tiêu Biểu Tấm MGO"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {APPLICATIONS.map((item, idx) => {
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

      <div className="mt-8 text-center">
        <Link
          href="/giai-phap-ung-dung"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-300 hover:border-[#7CB305] text-slate-800 hover:text-[#5F8A03] text-sm font-bold transition-all shadow-sm"
        >
          <span>Xem Thêm Giải Pháp Ứng Dụng</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
