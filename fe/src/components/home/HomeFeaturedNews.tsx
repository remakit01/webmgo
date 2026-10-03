import React from 'react';
import Link from '@/components/ui/LocaleLink';
import { Calendar, Clock, ArrowRight, Newspaper, ChevronRight } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';

// Dữ liệu bài viết tin tức & kiến thức kỹ thuật PCCC
const HERO_ARTICLE = {
  id: 'quy-chuan-qcvn-06-2022-ong-gio-vach-ngan',
  title: 'Quy Chuẩn QCVN 06:2022/BXD: Tiêu Chí Nghiệm Thu Ống Gió & Vách Ngăn Chống Cháy',
  category: 'Tiêu Chuẩn PCCC',
  categoryColor: 'bg-[#FEF3EC] text-[#D95314] border-[#F26522]/30',
  date: '15/09/2026',
  readTime: '5 phút đọc',
  desc: 'Phân tích chi tiết quy trình thử nghiệm đốt mẫu thực tế, giới hạn chịu lửa EI30 – EI120 và điều kiện nghiệm thu tại công trình. Những yêu cầu khắt khe về vật liệu không phát sinh khói độc và tính toàn vẹn kết cấu khi chịu nhiệt trên 1.000°C.',
  image: '/images/mgo-duct.jpg',
  link: '/huong-dan-thi-cong',
};

const SIDE_ARTICLES = [
  {
    id: 'cong-nghe-zero-rust-khong-an-mon-kim-loai',
    title: 'Công Nghệ Zero Rust: Vì Sao Tấm MGO Remak Không Gây Rỉ Sét Ống Gió Tôn Mạ Kẽm?',
    category: 'Kỹ Thuật Vật Liệu',
    categoryColor: 'bg-[#F4F9E8] text-[#5F8A03] border-[#7CB305]/30',
    date: '08/09/2026',
    readTime: '4 phút đọc',
    desc: 'Làm rõ cơ chế kiểm soát ion Chloride (Cl-) tự do, triệt tiêu hiện tượng ăn mòn hóa học và bảo vệ kết cấu tôn kẽm vĩnh viễn.',
    image: '/images/mgo-board.jpg',
    link: '/san-pham/tam-chong-chay-mgo-remak-fireoff',
  },
  {
    id: 'ket-qua-dot-thu-nghiem-vach-ei-120-ibst',
    title: 'Kết Quả Đốt Thử Nghiệm Thực Tế Hệ Vách MGO Đạt Chuẩn EI 120 Tại Viện IBST',
    category: 'Thử Nghiệm Thực Tế',
    categoryColor: 'bg-purple-50 text-purple-700 border-purple-200',
    date: '28/08/2026',
    readTime: '6 phút đọc',
    desc: 'Toàn cảnh buổi thử nghiệm gia nhiệt buồng đốt trên 1.050°C theo chuẩn ISO 834 và báo cáo tính toàn vẹn kết cấu tấm MGO 12mm.',
    image: '/images/mgo-wall.jpg',
    link: '/thu-vien-tai-lieu',
  },
  {
    id: 'huong-dan-thi-cong-boc-ong-gio-keo-chuyen-dung',
    title: 'Quy Trình Thi Công Bọc Ống Gió PCCC Bằng Keo Chịu Nhiệt Và Tấm MGO Remak',
    category: 'Hướng Dẫn Thi Công',
    categoryColor: 'bg-slate-100 text-slate-700 border-slate-300',
    date: '20/08/2026',
    readTime: '4 phút đọc',
    desc: 'Các lỗi phổ biến khiến công trình không đạt kiểm định PCCC và kỹ thuật xử lý giáp mí chịu áp lực hút khói cao.',
    image: '/images/mgo-floor.jpg',
    link: '/huong-dan-thi-cong',
  },
];

export default function HomeFeaturedNews() {
  return (
    <section 
      id="tin-tuc-su-kien"
      aria-label="Tin Tức & Kiến Thức Kỹ Thuật PCCC"
      className="max-w-[1440px] mx-auto px-4 lg:px-8"
    >
      <SectionHeading 
        title="Tin Tức & Kiến Thức Kỹ Thuật" 
        badge="BẢN TIN PCCC"
        badgeColor="orange"
        subtitle="Cập nhật quy chuẩn PCCC QCVN 06:2022/BXD, công nghệ vật liệu kháng ăn mòn Zero Rust và cẩm nang kỹ thuật thi công thực chiến."
      />

      {/* Grid 2 cột: Cột trái 1 Tin tiêu điểm lớn + Cột phải 3 Tin danh sách */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ===================================================================== */}
        {/* CỘT TRÁI (7 CỘT): 1 BÀI VIẾT TIÊU ĐIỂM LỚN (HERO ARTICLE)             */}
        {/* ===================================================================== */}
        <div className="lg:col-span-7">
          <div className="h-full bg-white rounded-2xl overflow-hidden border-2 border-slate-200 shadow-xs hover:shadow-xl hover:border-[#F26522]/60 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group">
            
            {/* Image */}
            <div className="relative h-64 sm:h-80 overflow-hidden bg-slate-100">
              <img
                src={HERO_ARTICLE.image}
                alt={HERO_ARTICLE.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />

              {/* Tag */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm border ${HERO_ARTICLE.categoryColor}`}>
                  {HERO_ARTICLE.category}
                </span>
              </div>

              {/* Date & Read time */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/95 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#F26522]" />
                  <span>{HERO_ARTICLE.date}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-[#A0D911]" />
                  <span>{HERO_ARTICLE.readTime}</span>
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-7 flex-grow flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl group-hover:text-[#F26522] transition-colors leading-snug">
                  {HERO_ARTICLE.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {HERO_ARTICLE.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={HERO_ARTICLE.link}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#F26522] group-hover:translate-x-1 transition-transform"
                >
                  <span>Đọc Toàn Bộ Bài Viết</span>
                  <ArrowRight size={15} />
                </Link>
                <span className="text-[11px] text-slate-400 font-medium">Chuyên mục PCCC</span>
              </div>
            </div>

          </div>
        </div>

        {/* ===================================================================== */}
        {/* CỘT PHẢI (5 CỘT): 3 BÀI VIẾT DANH SÁCH NGANG (SIDE ARTICLES)         */}
        {/* ===================================================================== */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {SIDE_ARTICLES.map((article) => (
            <Link
              key={article.id}
              href={article.link}
              className="flex-1 group bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-200 shadow-xs hover:shadow-lg hover:border-[#7CB305]/60 hover:-translate-y-0.5 transition-all duration-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
            >
              {/* Thumbnail */}
              <div className="w-full sm:w-32 h-36 sm:h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${article.categoryColor}`}>
                    {article.category}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                    <Calendar size={11} />
                    {article.date}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug group-hover:text-[#5F8A03] transition-colors line-clamp-2">
                  {article.title}
                </h4>

                <div className="flex items-center gap-1 text-[11px] font-bold text-[#5F8A03]">
                  <span>Chi tiết</span>
                  <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>

      {/* Footer CTA */}
      <div className="mt-10 text-center">
        <Link
          href="/huong-dan-thi-cong"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white border-2 border-slate-300 hover:border-[#F26522] text-slate-800 hover:text-[#F26522] text-sm font-bold transition-all shadow-xs hover:shadow-md cursor-pointer group"
        >
          <Newspaper size={16} className="text-[#F26522]" />
          <span>Xem Thêm Tin Tức &amp; Cẩm Nang Kỹ Thuật</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

    </section>
  );
}
