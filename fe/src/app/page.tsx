import React from 'react';
import type { Metadata } from 'next';
import {
  HomeBannerSwiper,
  HomeHeroSection,
  HomeStickyBenefits,
  HomeSpecMatrix,
  HomeApplicationGrid,
  HomeProjectsAndNews,
} from '@/components/home';
import {
  ComparisonTable,
  MaterialCalculator,
  SampleRequestForm,
  FaqAccordion,
} from '@/components/shared';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { FAQ_LIST, THICKNESS_DATA } from '@/data/products';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mgo.remak.vn';

export const metadata: Metadata = {
  title: 'Tấm Chống Cháy MGO Remak® FireOFF - Chuẩn PCCC QCVN 06:2022/BXD',
  description: 'Tổng kho phân phối và sản xuất tấm Magie Oxit (MGO) chống cháy A1, chịu nhiệt 1200°C, kháng nước 100%, không rỉ sét. Báo giá nhà máy, nhận mẫu thử miễn phí!',
  alternates: {
    canonical: '/',
  },
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
    image: '/images/mgo-board.jpg',
    description: 'Tấm chống cháy Magie Oxit (MGO) nhóm A1 đạt kiểm định PCCC QCVN 06:2022/BXD',
    brand: {
      '@type': 'Brand',
      name: 'Remak',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'VND',
      lowPrice: 125000,
      highPrice: 540000,
      offerCount: Object.keys(THICKNESS_DATA).length,
      availability: 'https://schema.org/InStock',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Remak® Vietnam',
    url: baseUrl,
    logo: `${baseUrl}/images/Logo_remak_800.png`,
    description: 'Công ty Cổ phần Xây dựng và Nội thất Remak - nhà máy sản xuất và phân phối tấm chống cháy Magie Oxit (MGO) FireOFF đạt chuẩn PCCC QCVN 06:2022/BXD.',
    address: [
      {
        '@type': 'PostalAddress',
        streetAddress: 'Cụm Công Nghiệp Lại Yên',
        addressLocality: 'Hoài Đức, TP. Hà Nội',
        addressCountry: 'VN',
      },
      {
        '@type': 'PostalAddress',
        streetAddress: 'KCN Mông Hóa',
        addressLocality: 'TP. Hòa Bình',
        addressCountry: 'VN',
      },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+84-902-441-981',
      contactType: 'sales',
      email: 'contact@remak.vn',
      areaServed: 'VN',
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <div className="space-y-16 pb-20">
        {/* 1. AUTO BANNER SWIPER (TỰ ĐỘNG CHẠY, KHÔNG ACTION TRÁI PHẢI, KHÔNG PROGRESS BAR) */}
        <section id="banner-swiper" className="scroll-mt-24">
          <HomeBannerSwiper />
        </section>

        {/* 2. HERO INTRO & TRUST BADGES (CLIENT COMPONENT - accordion giới thiệu) */}
        <section id="hero-section" className="scroll-mt-24">
          <HomeHeroSection />
        </section>

        {/* 3. MGO BENEFITS - 4 ĐẶC TÍNH VƯỢT TRỘI (INTERACTIVE TAB SWITCHER) */}
        <section id="dac-tinh-vuot-troi" className="scroll-mt-24">
          <HomeStickyBenefits />
        </section>

        {/* 4. BẢNG THÔNG SỐ KỸ THUẬT TẤM MGO REMAK (ĐẨY LÊN CAO THEO YÊU CẦU LEADER) */}
        <section id="bang-thong-so" className="scroll-mt-24">
          <ScrollReveal direction="up" delay={50}>
            <HomeSpecMatrix />
          </ScrollReveal>
        </section>

        {/* 5. BẢNG ĐỐI CHUẨN KỸ THUẬT VẬT LIỆU (MGO VS CEMBOARD VS THẠCH CAO VS VÁN ÉP) */}
        <section id="so-sanh-vat-lieu" className="scroll-mt-24">
          <ScrollReveal direction="up" delay={50}>
            <ComparisonTable />
          </ScrollReveal>
        </section>

        {/* 6. 4 ỨNG DỤNG THỰC TẾ HÀNG ĐẦU (ỐNG GIÓ, VÁCH NGĂN, LÓT SÀN, CỬA CHỐNG CHÁY) */}
        <section id="giai-phap-ung-dung" className="scroll-mt-24">
          <ScrollReveal direction="up" delay={50}>
            <HomeApplicationGrid />
          </ScrollReveal>
        </section>

        {/* 7. FORM ĐĂNG KÝ HỘP MẪU THỬ MIỄN PHÍ TẬN CHÂN CÔNG TRÌNH */}
        <section id="nhan-mau-thu" className="scroll-mt-24 w-full">
          <ScrollReveal direction="up" delay={50} className="w-full">
            <SampleRequestForm />
          </ScrollReveal>
        </section>

        {/* 8. DỰ ÁN TIÊU BIỂU & TIN TỨC KIẾN THỨC KỸ THUẬT (CÙNG MỘT HÀNG - 2 CỘT SONG SONG) */}
        <section id="du-an-tin-tuc" className="scroll-mt-24">
          <ScrollReveal direction="up" delay={50}>
            <HomeProjectsAndNews />
          </ScrollReveal>
        </section>

        {/* 9. DỰ TOÁN VẬT TƯ ONLINE (TÍNH NHANH SỐ TẤM & CHI PHÍ) */}
        <section id="du-toan-vat-tu" className="scroll-mt-24">
          <ScrollReveal direction="up" delay={50}>
            <MaterialCalculator />
          </ScrollReveal>
        </section>

        {/* 10. HỎI ĐÁP FAQ SCHEMA CHUẨN SEO GOOGLE */}
        <section id="faq-hoi-dap" className="scroll-mt-24">
          <ScrollReveal direction="up" delay={50}>
            <FaqAccordion />
          </ScrollReveal>
        </section>
      </div>
    </>
  );
}
