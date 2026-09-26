import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ShieldCheck, 
  Flame, 
  FileText, 
  Download, 
  PhoneCall, 
  CheckCircle2, 
  Layers, 
  Scale, 
  Building2, 
  ChevronRight, 
  ArrowRight,
  Wrench,
  FileCheck2,
  Package
} from 'lucide-react';
import { APPLICATIONS } from '@/data/applications';
import { PRODUCTS } from '@/data/products';
import { ApplicationBoqCalculator, ApplicationCadDownload } from '@/components/applications';
import SampleRequestForm from '@/components/shared/SampleRequestForm';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return APPLICATIONS.map((app) => ({
    slug: app.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const application = APPLICATIONS.find((a) => a.slug === slug);
  if (!application) return { title: 'Không tìm thấy giải pháp - Remak MGO' };

  return {
    title: `${application.title} | Chuẩn PCCC QCVN 06:2022 Remak`,
    description: application.description.slice(0, 160),
    openGraph: {
      title: application.title,
      description: application.tagline,
      images: [application.image],
    },
  };
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const application = APPLICATIONS.find((a) => a.slug === slug);

  if (!application) {
    notFound();
  }

  // Find compatible product in catalog
  const compatibleProduct = PRODUCTS.find((p) => p.slug === application.compatibleProductSlug);

  // Other applications for quick navigation
  const otherApplications = APPLICATIONS.filter((a) => a.id !== application.id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* 1. BREADCRUMB */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-3 text-xs text-slate-500 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-[#5F8A03] transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href="/giai-phap-ung-dung" className="hover:text-[#5F8A03] transition-colors">Ứng dụng</Link>
          <span>/</span>
          <span className="font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">{application.title}</span>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="py-10 lg:py-14 bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="max-w-4xl space-y-4">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#F4F9E8] text-[#5F8A03] text-xs font-bold uppercase tracking-wider">
                {application.categoryLabel}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#FEF3EC] text-[#F26522] text-xs font-bold inline-flex items-center gap-1">
                <Flame size={14} />
                <span>{application.fireRating}</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                Độ dày: {application.recommendedThickness}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
              {application.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              {application.tagline}
            </p>

            {/* Standards & Advantage Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5F8A03] bg-[#F4F9E8] px-3 py-1.5 rounded-lg border border-[#7CB305]/30">
                <ShieldCheck size={16} />
                <span>{application.weightAdvantage}</span>
              </div>
              {application.applicableStandards.map((std, sIdx) => (
                <span
                  key={sIdx}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  ✓ {std}
                </span>
              ))}
            </div>

            {/* Quick Action CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/bao-gia"
                className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-[#F26522] hover:bg-[#D95314] text-white font-bold text-sm transition-all shadow-md shadow-[#F26522]/25 flex items-center justify-center gap-2"
              >
                <FileText size={16} />
                <span>Yêu Cầu Báo Giá & Hồ Sơ PCCC</span>
              </Link>
              <a
                href="tel:0902441981"
                className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-sm transition-all shadow-md shadow-[#5F8A03]/25 flex items-center justify-center gap-2"
              >
                <PhoneCall size={16} />
                <span>Hotline Kỹ Sư: 0902.441.981</span>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT (8 COLS) & SIDEBAR (4 COLS) */}
      <section className="py-14 max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* MAIN COLUMN (8 COLS) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* HERO IMAGE SHOWCASE */}
            <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 relative aspect-16/9">
              <img
                src={application.image}
                alt={application.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/10 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-bold text-white text-sm">{application.title}</div>
                  <div className="text-slate-300 text-xs mt-0.5">{application.typicalProjects}</div>
                </div>
                <span className="font-extrabold text-[#A0D911] text-xs bg-white/10 px-3 py-1 rounded-lg self-start sm:self-auto">
                  {application.fireRating}
                </span>
              </div>
            </div>

            {/* SECTION 1: TỔNG QUAN GIẢI PHÁP KỸ THUẬT */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-[#5F8A03] uppercase tracking-wider bg-[#F4F9E8] px-3 py-1 rounded-full">
                  Tổng Quan Kỹ Thuật
                </span>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mt-2">
                  Giải Pháp Thi Công Thực Tế Cho Dự Án
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {application.description}
              </p>
            </div>

            {/* SECTION 2: CẤU TẠO HỆ THỐNG ĐẠT CHUẨN PCCC (SƠ ĐỒ 5 LỚP) */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-[#F26522] uppercase tracking-wider bg-[#FEF3EC] px-3 py-1 rounded-full">
                  Cẩm Nang Lắp Dựng
                </span>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mt-2">
                  Cấu Tạo Hệ Thống Chuẩn Nghiệm Thu Đốt Lò IBST
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Trình tự các lớp vật tư theo đúng biên bản thử nghiệm đốt mẫu của Viện KHCN Xây Dựng
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
                {application.systemLayers.map((layer, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#5F8A03] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="font-medium leading-relaxed">{layer}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3: ƯU THẾ KỸ THUẬT VƯỢT TRỘI */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-[#5F8A03] uppercase tracking-wider bg-[#F4F9E8] px-3 py-1 rounded-full">
                  Lợi Thế Công Trình
                </span>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mt-2">
                  Tại Sao Nên Chọn Tấm MGO Remak Cho Ứng Dụng Này?
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {application.keyFeatures.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#7CB305] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center font-bold text-xs mb-3">
                      <CheckCircle2 size={18} />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                      {feat}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: HƯỚNG DẪN THI CÔNG & NGHIỆM THU */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#F4F9E8] border border-[#7CB305]/40 space-y-4">
              <div className="flex items-center gap-2 text-[#5F8A03] font-bold text-sm uppercase tracking-wider">
                <Wrench size={18} />
                <span>Lưu Ý Kỹ Thuật Thi Công Quan Trọng:</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5F8A03] mt-2 flex-shrink-0" />
                  <span><strong>Bắn vít so le mạch:</strong> Khoảng cách vít bắn mép tấm tối thiểu 15mm, bước vít từ 200mm - 250mm để tránh nứt góc.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5F8A03] mt-2 flex-shrink-0" />
                  <span><strong>Xử lý mối giáp mí:</strong> Bắt buộc dùng keo chống cháy chuyên dụng (Remak FireSeal) trét kín khít trước khi dán băng lưới sợi thủy tinh.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5F8A03] mt-2 flex-shrink-0" />
                  <span><strong>Cắt gia công tại công trình:</strong> Sử dụng lưỡi cắt gạch thông thường hoặc dao rọc giấy chuyên dụng, không gây bụi độc hại.</span>
                </li>
              </ul>
            </div>

            {/* SECTION 5: BÓC TÁCH DỰ TOÁN NHANH THEO DIỆN TÍCH */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-[#5F8A03] uppercase tracking-wider bg-[#F4F9E8] px-3 py-1 rounded-full">
                  Dự Toán Khối Lượng
                </span>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mt-2">
                  Tính Toán Định Mức Vật Tư Cho Công Trình Của Bạn
                </h2>
              </div>
              <ApplicationBoqCalculator 
                defaultAppId={
                  application.category === 'duct' ? 'duct' :
                  application.category === 'wall' ? 'wall' :
                  application.category === 'floor' ? 'floor' :
                  application.category === 'industry' ? 'factory' : 'duct'
                }
                compact={true}
              />
            </div>

            {/* SECTION 6: BẢN VẼ CAD & HỒ SƠ ĐỐT LÒ IBST */}
            <div>
              <ApplicationCadDownload />
            </div>

          </div>

          {/* SIDEBAR (4 COLS) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* WIDGET 1: TẢI BỘ HỒ SƠ KIỂM ĐỊNH PCCC */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#A0D911] mb-3">
                <FileText size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Hồ Sơ Thử Nghiệm IBST</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Tải về bản sao kết quả thử nghiệm đốt mẫu lò thực tế đạt {application.fireRating} theo QCVN 06:2022/BXD phục vụ nghiệm thu.
              </p>
              <div className="mt-5 space-y-2.5">
                <Link
                  href="/bao-gia"
                  className="w-full py-3 px-4 rounded-xl bg-[#F26522] hover:bg-[#D95314] text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download size={16} />
                  <span>Tải Hồ Sơ Kiểm Định (PDF)</span>
                </Link>
                <div className="text-[11px] text-center text-slate-400">
                  File scan công chứng • Dung lượng 4.5 MB
                </div>
              </div>
            </div>

            {/* WIDGET 2: SẢN PHẨM TƯƠNG THÍCH CHUYÊN DỤNG */}
            {compatibleProduct && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="text-xs font-bold text-[#5F8A03] uppercase tracking-wider">
                  Sản Phẩm Tấm MGO Khuyên Dùng
                </div>

                <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-16/10">
                  <img
                    src={compatibleProduct.image}
                    alt={compatibleProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    {compatibleProduct.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {compatibleProduct.tagline}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#F26522]">{compatibleProduct.fireRating}</span>
                  <Link
                    href={`/san-pham/${compatibleProduct.slug}`}
                    className="font-bold text-[#5F8A03] hover:underline flex items-center gap-1"
                  >
                    <span>Xem chi tiết</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}

            {/* WIDGET 3: TƯ VẤN KỸ THUẬT 24/7 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs text-center">
              <div className="w-12 h-12 rounded-full bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center mx-auto mb-3">
                <PhoneCall size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Tư Vấn Kỹ Thuật 24/7</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Kỹ sư PCCC Remak sẵn sàng hỗ trợ kiểm tra bản vẽ thiết kế và bóc tách khối lượng dự toán miễn phí.
              </p>
              <a
                href="tel:0902441981"
                className="mt-4 block py-3 px-4 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
              >
                Hotline: 0902.441.981
              </a>
            </div>

            {/* WIDGET 4: CÁC GIẢI PHÁP ỨNG DỤNG KHÁC */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Giải Pháp Ứng Dụng Khác
              </h3>
              <div className="space-y-2">
                {otherApplications.map((other) => (
                  <Link
                    key={other.id}
                    href={`/giai-phap-ung-dung/${other.slug}`}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-[#F4F9E8] border border-slate-100 text-xs sm:text-sm font-semibold text-slate-800 hover:text-[#5F8A03] transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate max-w-[200px]">{other.title}</span>
                    <ChevronRight size={15} className="text-slate-400 group-hover:text-[#5F8A03] transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. SAMPLE REQUEST & TECHNICAL DOSSIER FORM */}
      <section className="py-16">
        <SampleRequestForm
          title="Nhận Mẫu Thử Vật Liệu & Báo Giá Cho Ứng Dụng Này"
          subtitle="Remak cung cấp mẫu cắt thực tế kèm chứng thư thử nghiệm đốt lò IBST gửi tận tay công trình trên toàn quốc."
        />
      </section>

    </div>
  );
}
