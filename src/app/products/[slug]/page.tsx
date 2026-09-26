import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  FileText,
  PhoneCall,
  Download,
  ChevronRight,
} from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import {
  ProductGallery,
  ProductQuickInfo,
  ProductSystemAssemblies,
  ProductSpecsTable,
  ProductCard,
} from '@/components/products';

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

      {/* 2. PRODUCT HERO SECTION (MODULAR COMPONENTS) */}
      <section className="py-10 lg:py-14 bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: INTERACTIVE SWIPER GALLERY COMPONENT */}
            <div className="lg:col-span-6">
              <ProductGallery
                productName={product.name}
                images={product.galleryImages}
                fireRating={product.fireRating}
                density={product.density}
                flexuralStrength={product.flexuralStrength}
                badge={product.badge}
                categoryLabel={product.categoryLabel}
                testedStandards={product.testedStandards}
                autoPlayInterval={4000}
              />
            </div>

            {/* RIGHT COLUMN: QUICK INFO & DYNAMIC THICKNESS SELECTOR */}
            <div className="lg:col-span-6">
              <ProductQuickInfo product={product} />
            </div>

          </div>
        </div>
      </section>

      {/* 3. DETAILED SPECIFICATIONS & SYSTEM ASSEMBLIES */}
      <section className="py-14 max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* MAIN CONTENT (8 COLS) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* CẤU TẠO HỆ THỐNG ĐẠT CHUẨN NGHIỆM THU PCCC */}
            <ProductSystemAssemblies assemblies={product.systemAssemblies} />

            {/* BẢNG THÔNG SỐ KỸ THUẬT CHI TIẾT */}
            <ProductSpecsTable specsTable={product.specsTable} />

            {/* ƯU ĐIỂM VƯỢT TRỘI */}
            <div>
              <div className="border-b border-slate-200 pb-3 mb-6">

                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mt-2">
                  Ưu Điểm Vượt Trội Cho Công Trình
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Đem lại độ bền cơ học cao, tiết kiệm chi phí thi công và tối ưu hoá trọng lượng kết cấu
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {product.advantages.map((adv, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#7CB305]/40 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center font-bold text-xs mb-3">
                      0{idx + 1}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">{adv.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{adv.desc}</p>
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
              <h3 className="text-lg font-bold text-white">Hồ Sơ Nghiệm Thu PCCC</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Tải về bản sao công chứng kết quả thử nghiệm đốt mẫu lò của Viện IBST và chứng nhận vật liệu không cháy nhóm A1.
              </p>
              <div className="mt-5 space-y-2.5">
                <Link
                  href="/bao-gia"
                  className="w-full py-3 px-4 rounded-xl bg-[#F26522] hover:bg-[#D95314] text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download size={16} />
                  <span>Tải Bộ Hồ Sơ Kiểm Định</span>
                </Link>
                <div className="text-[11px] sm:text-xs text-center text-slate-400">
                  Định dạng PDF • Dung lượng 4.2 MB
                </div>
              </div>
            </div>

            {/* MGO THICKNESS SPECIFICATIONS BOX */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-[#5F8A03] uppercase tracking-wider mb-1">
                Quy Cách Sản Phẩm
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-4">
                Các Độ Dày Tiêu Chuẩn Sẵn Kho
              </h3>

              <div className="space-y-2.5">
                {product.thicknessList.map((th) => (
                  <div key={th} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center font-bold text-xs">
                        {th}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-800">Tấm MGO 1.22x2.44m</span>
                    </div>
                    <Link
                      href="/bao-gia"
                      className="text-xs sm:text-sm font-bold text-[#F26522] hover:underline"
                    >
                      Báo giá →
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                <Link
                  href="/bao-gia"
                  className="text-xs sm:text-sm font-bold text-[#5F8A03] hover:underline inline-flex items-center gap-1"
                >
                  <span>Nhận gia công cắt theo bản vẽ thiết kế</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* QUICK CONSULTANT CARD */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs text-center">
              <div className="w-12 h-12 rounded-full bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center mx-auto mb-3">
                <PhoneCall size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Tư Vấn Kỹ Thuật 24/7</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Kỹ sư PCCC Remak sẵn sàng hỗ trợ bóc tách khối lượng và giải pháp tối ưu cho công trình của bạn.
              </p>
              <a
                href="tel:0902441981"
                className="mt-4 block py-3 px-4 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
            <div>

              <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mt-2">
                Các Dòng Tấm Chống Cháy Khác
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Khám phá hệ sinh thái vật liệu vô cơ chịu lửa Remak® FireOFF
              </p>
            </div>
            <Link 
              href="/san-pham"
              className="text-xs sm:text-sm font-bold text-[#5F8A03] hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Xem tất cả sản phẩm</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
