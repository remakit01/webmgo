import React from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Flame, Wind, Award, FileText, PhoneCall, Download } from 'lucide-react';
import Link from '@/components/ui/LocaleLink';
import { ProductFireTestProof, ProductThicknessTable } from '@/components/products';
import { ComparisonTable, MaterialCalculator, SampleRequestForm } from '@/components/shared';
import CatalogBrowser from '@/components/product-catalog/CatalogBrowser';
import type { Locale } from '@/i18n/routing';
import { getProducts } from '@/lib/api';
import { productsIndexPath } from '@/lib/product-paths';
import { localizedAlternates } from '@/lib/seo';

// ISR 60s; CMS lưu sản phẩm -> API revalidate tag "products"
export const revalidate = 60;

type Props = PageProps<'/[locale]/products'>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  return { alternates: localizedAlternates({ vi: productsIndexPath('vi'), en: productsIndexPath('en') }, locale) };
}

export default async function ProductsPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const items = (await getProducts(locale)) ?? [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* 2. HERO BANNER - CHỨNG MINH SẢN PHẨM ĐÃ KIỂM CHỨNG */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white pt-14 pb-16 lg:pt-20 lg:pb-24 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#7CB305]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#F26522]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="max-w-3xl">   
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Hệ Thống Tấm Magie Oxit (MGO)
              <span className="block text-[#7CB305]">Remak® FireOFF Đã Kiểm Chứng</span>
            </h1>

            <p className="text-base lg:text-lg text-slate-300 mb-8 leading-relaxed">
              Dòng vật liệu chống cháy vô cơ thế hệ mới đã vượt qua các bài đốt mẫu thực tế tại Viện KHCN Xây Dựng (IBST) 
              và Cục Cảnh sát PCCC & CNCH. Cam kết 100% công thức muối Sulfate (MOS) Zero-Chloride – Không rỉ sét ốc vít, không toát mồ hôi muối.
            </p>

            {/* TRUST BADGES */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/15">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#7CB305]/20 flex items-center justify-center text-[#A0D911] flex-shrink-0">
                  <Flame size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Class A1</div>
                  <div className="text-[11px] text-slate-400">Không bắt lửa 1200°C</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F26522]/20 flex items-center justify-center text-[#F26522] flex-shrink-0">
                  <Wind size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">EI 30 – EI 180</div>
                  <div className="text-[11px] text-slate-400">Đốt thực tế IBST</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Award size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Zero Chloride</div>
                  <div className="text-[11px] text-slate-400">Không rỉ sét ốc vít</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <FileText size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">QCVN 06:2022</div>
                  <div className="text-[11px] text-slate-400">Nghiệm thu 100%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 – 5. DANH MỤC SẢN PHẨM TỪ CMS: LỌC, LƯỚI, SO SÁNH */}
      <section id="khu-vuc-san-pham" className="mx-auto max-w-[1440px] px-4 py-10 lg:px-8">
        <CatalogBrowser items={items} locale={locale} />
      </section>

      {/* 6. BẢNG ĐỐI CHUẨN KỸ THUẬT: TẤM MGO VS CÁC VẬT LIỆU TRUYỀN THỐNG (ĐẨY LÊN VỊ TRÍ CHIẾN LƯỢC) */}
      <section className="py-14 bg-white border-y border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <ComparisonTable id="so-sanh-mgo" />
        </div>
      </section>

      {/* 7. BẰNG CHỨNG THỬ NGHIỆM ĐỐT MẪU THỰC TẾ TẠI VIỆN IBST (TRUST PROOF) */}
      <ProductFireTestProof />

      {/* 8. BẢNG TRA CỨU ĐỘ DÀY & QUY CÁCH CHUẨN THI CÔNG */}
      <section className="py-14 bg-white border-b border-slate-200">
        <ProductThicknessTable />
      </section>

      {/* 9. DỰ TOÁN BÓC TÁCH KHỐI LƯỢNG & SỐ TẤM MGO THEO DIỆN TÍCH (M²) */}
      <section className="py-14 bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <MaterialCalculator id="du-toan-mgo" />
        </div>
      </section>

      {/* 10. FORM ĐĂNG KÝ HỘP MẪU THỬ TẤM MGO MIỄN PHÍ TẬN NƠI */}
      <SampleRequestForm />

      {/* 11. CTA DOWNLOAD DOSSIER & TEST REPORT */}
      <section className="py-14 bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 text-white">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="rounded-3xl bg-white/5 border border-white/10 p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 backdrop-blur-md">
            <div className="max-w-2xl">
              <h2 className="text-2xl lg:text-4xl font-extrabold text-white mt-3">
                Cần Tải Trọn Bộ Kết Quả Thử Nghiệm PCCC & Catalogue 2026?
              </h2>
              <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                Remak cung cấp đầy đủ bản sao công chứng kết quả thử nghiệm đốt mẫu của Viện Khoa học Công nghệ Xây dựng (IBST), 
                chứng nhận Cục PCCC, bảng chỉ số cơ lý và tài liệu hướng dẫn bọc ống gió phục vụ làm hồ sơ thầu.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-shrink-0">
              <Link
                href="/bao-gia"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#F26522] hover:bg-[#D95314] text-white font-bold text-sm transition-all shadow-lg shadow-[#F26522]/30 flex items-center justify-center gap-2"
              >
                <Download size={16} />
                <span>Tải Hồ Sơ Kiểm Định PDF</span>
              </Link>
              <a
                href="tel:0902441981"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/20 flex items-center justify-center gap-2"
              >
                <PhoneCall size={16} />
                <span>Hotline: 0902.441.981</span>
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
