import React from 'react';
import Link from '@/components/ui/LocaleLink';
import InlineBold from '@/components/ui/InlineBold';
import ResponsivePicture from '@/components/ui/ResponsivePicture';
import type { HeroAccent, HeroCta, HeroContent, HomeHero } from '@/types/homepage';

/**
 * Màu nhấn của 4 thẻ số liệu: chỉ các token brand (khai báo đủ chuỗi class để Tailwind sinh CSS).
 * CMS dùng chung map này cho ô chọn màu.
 */
export const HERO_ACCENT_STYLES: Record<HeroAccent, { label: string; value: string; card: string; swatch: string }> = {
  orange: {
    label: 'Cam',
    value: 'text-remak-orange',
    card: 'hover:border-remak-orange hover:bg-remak-orange-light/40',
    swatch: 'bg-remak-orange',
  },
  'green-dark': {
    label: 'Xanh đậm',
    value: 'text-remak-green-dark',
    card: 'hover:border-remak-green-dark hover:bg-remak-green-light/40',
    swatch: 'bg-remak-green-dark',
  },
  green: {
    label: 'Xanh lá',
    value: 'text-remak-green',
    card: 'hover:border-remak-green hover:bg-remak-green-light/40',
    swatch: 'bg-remak-green',
  },
  slate: {
    label: 'Đen',
    value: 'text-slate-900',
    card: 'hover:border-remak-green-dark hover:bg-remak-green-light/40',
    swatch: 'bg-slate-900',
  },
};

/** Link nội bộ dùng next/link; anchor (#) và link ngoài dùng thẻ a */
function CtaLink({ cta, className }: { cta: HeroCta; className: string }) {
  if (cta.link.startsWith('/')) {
    return (
      <Link href={cta.link} className={className}>
        {cta.text}
      </Link>
    );
  }
  const external = /^https?:\/\//.test(cta.link);
  return (
    <a
      href={cta.link}
      className={className}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {cta.text}
    </a>
  );
}

interface HomeHeroSectionProps {
  hero: HeroContent & { image: HomeHero['image'] | null };
  /**
   * Ảnh xem trước chưa upload (blob URL) — chỉ CMS dùng. Trang chủ luôn dùng hero.image.
   */
  previewImageUrl?: string;
}

/**
 * Tiêu đề & điểm nhấn đầu trang chủ. Server Component: dữ liệu từ API (ISR), không có state.
 * CMS cũng render chính component này để xem trước đúng như trang thật.
 */
export default function HomeHeroSection({ hero, previewImageUrl }: HomeHeroSectionProps) {
  const hasImage = Boolean(previewImageUrl || hero.image);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-[#F8FAFC] pt-4 sm:pt-6 pb-12 sm:pb-16 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* CỘT TRÁI: TIÊU ĐỀ, MÔ TẢ & 4 KHỐI THÔNG SỐ (7/12; toàn chiều rộng nếu không có ảnh) */}
          <div className={`${hasImage ? 'lg:col-span-7' : 'lg:col-span-12'} flex flex-col justify-between space-y-6`}>
            <div className="space-y-6">
              {/* 1. Tiêu đề chính */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight text-balance">
                  {hero.title}
                  {hero.subtitle && (
                    <span className="block text-xl sm:text-2xl lg:text-3xl font-bold text-remak-green-dark mt-2">
                      {hero.subtitle}
                    </span>
                  )}
                </h1>
              </div>

              {/* 2. Đoạn mô tả kỹ thuật (hỗ trợ **in đậm** từ CMS) */}
              <div className="max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed space-y-2.5 font-normal">
                {hero.paragraphs.map((p, i) => (
                  <p key={i}>
                    <InlineBold text={p} strongClassName="font-bold text-slate-900" />
                  </p>
                ))}
              </div>

              {/* 3. Nút Call-To-Action */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <CtaLink
                  cta={hero.primaryCta}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-remak-orange to-[#EA580C] text-white font-bold text-sm sm:text-base shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all text-center"
                />
                {hero.secondaryCta && (
                  <CtaLink
                    cta={hero.secondaryCta}
                    className="px-6 py-3.5 rounded-xl bg-white border-2 border-slate-200 text-slate-800 font-bold text-sm sm:text-base hover:border-remak-green hover:text-remak-green-dark hover:bg-remak-green-light transition-all shadow-2xs text-center cursor-pointer"
                  />
                )}
              </div>
            </div>

            {/* 4. 4 KHỐI THÔNG SỐ (TEXT-ONLY, MÀU NHẤN THEO BẢNG BRAND) */}
            <div className="pt-4 border-t border-slate-200/90 mt-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {hero.stats.map((stat, i) => {
                  const style = HERO_ACCENT_STYLES[stat.accent] ?? HERO_ACCENT_STYLES.slate;
                  return (
                    <div
                      key={i}
                      className={`rounded-2xl bg-white border-2 border-slate-300/90 ${style.card} p-4 sm:p-4.5 hover:-translate-y-0.5 transition-all duration-200 shadow-2xs hover:shadow-xs flex flex-col justify-between h-full`}
                    >
                      <div
                        className={`text-2xl sm:text-3xl font-black leading-none tracking-tight ${style.value} tabular-nums`}
                      >
                        {stat.value}
                      </div>
                      <div className="mt-3">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">{stat.label}</div>
                        {stat.sublabel && (
                          <div className="text-[11px] font-medium text-slate-500 mt-0.5">{stat.sublabel}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: KHUNG TRÌNH DIỄN HÌNH ẢNH SẢN PHẨM (5/12) */}
          {hasImage && (
            <div className="lg:col-span-5 flex flex-col">
              <div className="bg-white rounded-3xl p-3.5 sm:p-4 shadow-lg border-2 border-slate-200 transition-all duration-300 hover:shadow-xl flex flex-col flex-1 h-full">
                {(hero.media.frameTitle || hero.media.badge) && (
                  <div className="flex items-center justify-between gap-2 px-1.5 py-1 mb-2.5">
                    <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                      {hero.media.frameTitle}
                    </span>
                    {hero.media.badge && (
                      <span className="text-[11px] font-bold text-remak-green-dark bg-remak-green-light border border-remak-green/30 px-2.5 py-0.5 rounded-full shrink-0">
                        {hero.media.badge}
                      </span>
                    )}
                  </div>
                )}

                <div className="relative flex-1 min-h-[280px] rounded-2xl overflow-hidden bg-slate-100 group">
                  {previewImageUrl ? (
                    <img
                      src={previewImageUrl}
                      alt={hero.media.alt}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    hero.image && (
                      <ResponsivePicture
                        image={hero.image}
                        alt={hero.media.alt}
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        priority
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
