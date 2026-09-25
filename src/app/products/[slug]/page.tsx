import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Flame, 
  Wind, 
  Layers, 
  ShieldCheck, 
  Award, 
  FileText, 
  CheckCircle2, 
  PhoneCall, 
  Download, 
  ArrowRight,
  Package,
  Clock,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import { PRODUCTS, PRODUCT_ACCESSORIES } from '@/data/products';
import { ProductItem } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) return { title: 'Không tìm thấy sản phẩm - Remak MGO' };

  return {
    title: `${product.name} | Chuẩn PCCC QCVN 06:2022 Remak`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.tagline,
      images: [product.image],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  // Related products
  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  // Compatible accessories
  const compatibleAccessories = PRODUCT_ACCESSORIES.filter((acc) =>
    acc.compatibleProducts.includes(product.slug)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* 1. BREADCRUMB */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-3 text-xs text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#5F8A03] transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href="/san-pham" className="hover:text-[#5F8A03] transition-colors">Sản phẩm</Link>
          <span>/</span>
          <span className="font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">{product.shortName}</span>
        </div>
      </div>

      {/* 2. PRODUCT HERO SECTION */}
      <section className="py-10 lg:py-14 bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: PRODUCT IMAGES & VERIFICATION BADGES */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md aspect-4/3">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover" 
                />
                
                {/* Overlay Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#F26522] text-white shadow-xs">
                    {product.badge || 'Remak® FireOFF'}
                  </span>
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-white/95 text-[#5F8A03] backdrop-blur-xs shadow-xs">
                    {product.categoryLabel}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-900/85 backdrop-blur-md text-white flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Flame size={18} className="text-[#F26522]" />
                    <div>
                      <div className="font-bold">{product.fireRating}</div>
                      <div className="text-[11px] text-slate-300">Cấp không bắt lửa Class A1</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-[#A0D911]">{product.density}</div>
                    <div className="text-[11px] text-slate-300">Độ bền uốn {product.flexuralStrength}</div>
                  </div>
                </div>
              </div>

              {/* Gallery thumbnails */}
              <div className="grid grid-cols-3 gap-3">
                {product.galleryImages.map((img, i) => (
                  <div 
                    key={i} 
                    className="relative rounded-xl overflow-hidden border border-slate-200 aspect-4/3 bg-slate-100"
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              {/* Certified Standards Box */}
              <div className="p-4 rounded-2xl bg-[#F4F9E8] border border-[#7CB305]/30">
                <div className="text-xs font-bold text-[#5F8A03] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck size={16} />
                  <span>Chứng nhận & Tiêu chuẩn thử nghiệm đã đạt:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.testedStandards.map((std, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 rounded-md bg-white border border-[#7CB305]/30 text-xs font-semibold text-slate-700"
                    >
                      ✓ {std}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: PRODUCT INFO & CTA */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-bold text-[#F26522] uppercase tracking-wider">
                  {product.tradeMark}
                </span>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-1 leading-snug">
                  {product.name}
                </h1>
                <p className="text-sm font-medium text-slate-600 mt-2 leading-relaxed">
                  {product.tagline}
                </p>
              </div>

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Quy cách tấm</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">{product.dimension}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Tỷ trọng khô</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">{product.density}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Hệ số dẫn nhiệt (k)</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">{product.thermalConductivity}</div>
                </div>
              </div>

              {/* Available Thickness Selector */}
              <div>
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Quy cách độ dày sẵn sàng tại kho:
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.thicknessList.map((th) => (
                    <div
                      key={th}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-800 flex items-center gap-1.5 shadow-2xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#7CB305]" />
                      <span>{th}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlight bullet points */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Đặc điểm kiểm chứng nổi bật:
                </div>
                {product.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2 size={15} className="text-[#5F8A03] flex-shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/bao-gia"
                  className="flex-1 py-3.5 px-6 rounded-xl bg-[#F26522] hover:bg-[#D95314] text-white font-bold text-sm transition-all shadow-md shadow-[#F26522]/30 flex items-center justify-center gap-2"
                >
                  <FileText size={16} />
                  <span>Yêu Cầu Báo Giá & Hồ Sơ Nghiệm Thu</span>
                </Link>
                <a
                  href="tel:0902441981"
                  className="py-3.5 px-6 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-sm transition-all shadow-md shadow-[#5F8A03]/30 flex items-center justify-center gap-2"
                >
                  <PhoneCall size={16} />
                  <span>0902.441.981</span>
                </a>
              </div>

              <div className="text-[11px] text-slate-500 italic flex items-center gap-1.5">
                <Info size={13} className="text-slate-400" />
                <span>Hỗ trợ gửi mẫu vật liệu thực tế tận chân công trình miễn phí toàn quốc.</span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 3. DETAILED SPECIFICATIONS & SYSTEM ASSEMBLIES */}
      <section className="py-14 max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* MAIN CONTENT (8 COLS) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* SECTION: SYSTEM ASSEMBLIES */}
            <div>
              <div className="border-b border-slate-200 pb-3 mb-6">
                <span className="text-xs font-bold text-[#5F8A03] uppercase tracking-wider bg-[#F4F9E8] px-3 py-1 rounded-full">
                  Cẩm Nang Thi Công Kỹ Thuật
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">
                  Cấu Tạo Hệ Thống Đạt Chuẩn Nghiệm Thu PCCC
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Sơ đồ lớp vật liệu theo đúng biên bản thử nghiệm đốt mẫu tại Viện KHCN Xây Dựng (IBST)
                </p>
              </div>

              <div className="space-y-6">
                {product.systemAssemblies.map((assembly, aIdx) => (
                  <div 
                    key={aIdx} 
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-[#7CB305]/40 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Flame size={18} className="text-[#F26522]" />
                        <span>{assembly.title}</span>
                      </h3>
                      <span className="px-3 py-1 rounded-full bg-[#FEF3EC] text-[#F26522] font-bold text-xs inline-flex items-center gap-1 self-start sm:self-auto">
                        {assembly.fireRating}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-3 italic">
                      {assembly.description}
                    </p>

                    <div className="mt-4 space-y-2">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Trình tự các lớp vật tư:
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {assembly.layers.map((layer, lIdx) => (
                          <div 
                            key={lIdx} 
                            className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700"
                          >
                            <span className="w-5 h-5 rounded-full bg-[#5F8A03] text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                              {lIdx + 1}
                            </span>
                            <span className="font-medium">{layer}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION: FULL TECHNICAL SPECIFICATIONS TABLE */}
            <div>
              <div className="border-b border-slate-200 pb-3 mb-6">
                <span className="text-xs font-bold text-[#F26522] uppercase tracking-wider bg-[#FEF3EC] px-3 py-1 rounded-full">
                  Chỉ Tiêu Cơ Lý
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">
                  Bảng Thông Số Kỹ Thuật Chi Tiết
                </h2>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <tbody className="divide-y divide-slate-100">
                    {product.specsTable.map((row, rIdx) => (
                      <tr 
                        key={rIdx} 
                        className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
                      >
                        <td className="py-3 px-5 font-bold text-slate-700 w-1/3">
                          {row.label}
                        </td>
                        <td className="py-3 px-5 text-slate-900 font-medium">
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION: ADVANTAGES */}
            <div>
              <div className="border-b border-slate-200 pb-3 mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Ưu Điểm Vượt Trội Cho Công Trình
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {product.advantages.map((adv, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="w-8 h-8 rounded-lg bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center font-bold text-xs mb-3">
                      0{idx + 1}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{adv.title}</h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{adv.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* SIDEBAR (4 COLS) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* DOWNLOAD TEST DOSSIER WIDGET */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#A0D911] mb-3">
                <FileText size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Hồ Sơ Nghiệm Thu PCCC</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Tải về bản sao công chứng kết quả thử nghiệm đốt mẫu lò của Viện IBST và chứng nhận vật liệu không cháy nhóm A1.
              </p>
              <div className="mt-5 space-y-2">
                <Link
                  href="/bao-gia"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#F26522] hover:bg-[#D95314] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  <span>Tải Bộ Hồ Sơ Kiểm Định</span>
                </Link>
                <div className="text-[11px] text-center text-slate-400">
                  Định dạng PDF • Dung lượng 4.2 MB
                </div>
              </div>
            </div>

            {/* COMPATIBLE ACCESSORIES BOX */}
            {compatibleAccessories.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-[#F26522] uppercase tracking-wider mb-1">
                  Vật Tư Đồng Bộ
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-4">
                  Phụ Kiện Khuyên Dùng Cùng Tấm
                </h3>

                <div className="space-y-3">
                  {compatibleAccessories.map((acc) => (
                    <div key={acc.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#FEF3EC] text-[#F26522] flex items-center justify-center flex-shrink-0">
                        <Package size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-800">{acc.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{acc.spec}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                  <a
                    href="tel:0902441981"
                    className="text-xs font-bold text-[#5F8A03] hover:underline"
                  >
                    Báo giá combo Tấm + Phụ Kiện ({'>'})
                  </a>
                </div>
              </div>
            )}

            {/* QUICK CONSULTANT CARD */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs text-center">
              <div className="w-12 h-12 rounded-full bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center mx-auto mb-3">
                <PhoneCall size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Tư Vấn Kỹ Thuật 24/7</h3>
              <p className="text-xs text-slate-500 mt-1">
                Kỹ sư PCCC Remak sẵn sàng hỗ trợ bóc tách khối lượng và giải pháp tối ưu cho công trình của bạn.
              </p>
              <a
                href="tel:0902441981"
                className="mt-4 block py-2.5 px-4 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-xs transition-colors"
              >
                Hotline: 0902.441.981
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* 4. RELATED PRODUCTS SECTION */}
      <section className="py-14 bg-white border-t border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Các Dòng Tấm Chống Cháy Khác
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Khám phá hệ sinh thái vật liệu vô cơ chịu lửa Remak® FireOFF
              </p>
            </div>
            <Link 
              href="/san-pham"
              className="text-xs font-bold text-[#5F8A03] hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả sản phẩm</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <div 
                key={rel.id}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-200 hover:border-[#7CB305] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="h-40 rounded-xl overflow-hidden mb-3 bg-slate-200">
                    <img src={rel.image} alt={rel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <span className="text-[11px] font-bold text-[#F26522]">{rel.categoryLabel}</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1 group-hover:text-[#5F8A03] transition-colors">
                    {rel.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{rel.tagline}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{rel.fireRating}</span>
                  <Link
                    href={`/san-pham/${rel.slug}`}
                    className="text-xs font-bold text-[#5F8A03] hover:underline"
                  >
                    Chi tiết →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
