import React from 'react';
import type { Metadata } from 'next';
import SwiperContainer from '@/components/home/SwiperContainer';
import HeroSection from '@/components/home/HeroSection';
import ApplicationGrid from '@/components/home/ApplicationGrid';
import SpecMatrix from '@/components/home/SpecMatrix';
import MaterialCalculator from '@/components/home/MaterialCalculator';
import ComparisonTable from '@/components/home/ComparisonTable';
import StickyBenefitsSection from '@/components/home/StickyBenefitsSection';
import SampleRequestForm from '@/components/home/SampleRequestForm';
import FaqAccordion from '@/components/home/FaqAccordion';
import FeaturedProjects from '@/components/home/FeaturedProjects';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { FAQ_LIST } from '@/data/products';

export const metadata: Metadata = {
  title: 'Tấm Chống Cháy MGO Remak® FireOFF - Chuẩn PCCC QCVN 06:2022/BXD',
  description: 'Tổng kho phân phối và sản xuất tấm Magie Oxit (MGO) chống cháy A1, chịu nhiệt 1200°C, kháng nước 100%, không rỉ sét. Báo giá nhà máy, nhận mẫu thử miễn phí!',
};

export default function HomePage() {
  // Cấu trúc dữ liệu JSON-LD Schema (Google Rich Results)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_LIST.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Tấm Chống Cháy MGO Remak® FireOFF',
    image: 'https://mgo.com.vn/wp-content/uploads/2022/08/Logo_remak_800.png',
    description: 'Tấm chống cháy Magie Oxit (MGO) nhóm A1 đạt kiểm định PCCC QCVN 06:2022/BXD',
    brand: {
      '@type': 'Brand',
      name: 'Remak',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'VND',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      {/* JSON-LD Structured Data cho SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <div className="space-y-16 pb-20">
        {/* 1. AUTO BANNER SWIPER (TỰ ĐỘNG CHẠY, KHÔNG ACTION TRÁI PHẢI, KHÔNG PROGRESS BAR) */}
        <SwiperContainer />

        {/* 2. HERO INTRO & TRUST BADGES (SERVER COMPONENT) */}
        <HeroSection />

        {/* 3. MGO BENEFITS - 4 ĐẶC TÍNH VƯỢT TRỘI (INTERACTIVE TAB SWITCHER) */}
        <StickyBenefitsSection />

        {/* 4. BẢNG THÔNG SỐ KỸ THUẬT TẤM MGO REMAK (ĐẨY LÊN CAO THEO YÊU CẦU LEADER) */}
        <ScrollReveal direction="up" delay={50}>
          <SpecMatrix />
        </ScrollReveal>

        {/* 5. BẢNG ĐỐI CHUẨN KỸ THUẬT VẬT LIỆU (MGO VS CEMBOARD VS THẠCH CAO VS VÁN ÉP) */}
        <ScrollReveal direction="up" delay={50}>
          <ComparisonTable />
        </ScrollReveal>

        {/* 6. 4 ỨNG DỤNG THỰC TẾ HÀNG ĐẦU (ỐNG GIÓ, VÁCH NGĂN, LÓT SÀN, CỬA CHỐNG CHÁY) */}
        <ScrollReveal direction="up" delay={50}>
          <ApplicationGrid />
        </ScrollReveal>

        {/* 7. DỰ ÁN TIÊU BIỂU ĐÃ NGHIỆM THU PCCC (SAMSUNG, LOTTE MALL, VIETTEL IDC) */}
        <ScrollReveal direction="up" delay={50}>
          <FeaturedProjects />
        </ScrollReveal>

        {/* 8. DỰ TOÁN VẬT TƯ ONLINE (TÍNH NHANH SỐ TẤM & CHI PHÍ) */}
        <ScrollReveal direction="up" delay={50}>
          <MaterialCalculator />
        </ScrollReveal>

        {/* 9. FORM ĐĂNG KÝ HỘP MẪU THỬ MIỄN PHÍ TẬN CHÂN CÔNG TRÌNH */}
        <ScrollReveal direction="up" delay={50}>
          <SampleRequestForm />
        </ScrollReveal>

        {/* 10. HỎI ĐÁP FAQ SCHEMA CHUẨN SEO GOOGLE */}
        <ScrollReveal direction="up" delay={50}>
          <FaqAccordion />
        </ScrollReveal>
      </div>
    </>
  );
}
