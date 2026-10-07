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
 * Khung trình diễn hình ảnh sản phẩm (dùng chung cho cả Mobile & Desktop).
 * Mobile: chiều cao h-48 sm:h-56 gọn gàng, xuất hiện ngay sau tiêu đề để người xem thấy ngay sản phẩm tấm MGO.
 * Desktop: stretch toàn bộ chiều cao của cột 5/12.
 */
function MediaCard({
  hero,
  previewImageUrl,
  className = '',
}: {
  hero: HeroContent & { image: HomeHero['image'] | null };
  previewImageUrl?: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-md sm:shadow-lg border border-slate-200/90 sm:border-2 sm:border-slate-200 transition-all duration-300 hover:shadow-xl flex flex-col ${className}`}
    >
      {(hero.media.frameTitle || hero.media.badge) && (
        <div className="flex items-center justify-between gap-2 px-1 sm:px-1.5 py-1 mb-2 sm:mb-2.5">
          <span className="text-[11px] sm:text-xs font-bold text-slate-800 tracking-wide uppercase">
            {hero.media.frameTitle}
          </span>
          {hero.media.badge && (
            <span className="text-[10px] sm:text-[11px] font-bold text-remak-green-dark bg-remak-green-light border border-remak-green/30 px-2 sm:px-2.5 py-0.5 rounded-full shrink-0">
              {hero.media.badge}
            </span>
          )}
        </div>
      )}

      <div className="relative h-48 sm:h-56 lg:h-auto lg:flex-1 min-h-[190px] lg:min-h-[280px] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 group">
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
  );
}

/**
 * Tiêu đề & điểm nhấn đầu trang chủ. Server Component: dữ liệu từ API (ISR), không có state.
 * Tối ưu responsive UI/UX theo chuẩn Mobile-First:
 * - Mobile: Dòng chảy tự nhiên (Trust Tag -> Title -> Media Card -> Desc -> CTAs -> 4 Stats đối xứng 2x2).
 * - Desktop: Giữ vững bố cục 2 cột (7/12 & 5/12) đẳng cấp và đồng bộ với CMS Live Preview.
 */
export default function HomeHeroSection({ hero, previewImageUrl }: HomeHeroSectionProps) {
  const hasImage = Boolean(previewImageUrl || hero.image);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-[#F8FAFC] pt-3 sm:pt-6 pb-8 sm:pb-16 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-stretch">
          
          {/* CỘT TRÁI: TIÊU ĐỀ, MÔ TẢ & 4 KHỐI THÔNG SỐ (7/12 trên desktop; full chiều rộng trên mobile) */}
          <div className={`${hasImage ? 'lg:col-span-7' : 'lg:col-span-12'} flex flex-col justify-between space-y-5 sm:space-y-6`}>
            <div className="space-y-4 sm:space-y-6">
              
              {/* 1. Trust Pill & Tiêu đề chính */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#5F8A03]/10 border border-[#5F8A03]/25 text-[#4E7202] text-[11px] sm:text-xs font-bold tracking-wide w-fit">
                  <span>Tiêu Chuẩn PCCC QCVN 06:2022/BXD</span>
                  <span className="text-slate-400">•</span>
                  <span>Remak® FireOFF</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight text-balance">
                  {hero.title}
                  {hero.subtitle && (
                    <span className="block text-base sm:text-2xl lg:text-3xl font-bold text-remak-green-dark mt-1.5 sm:mt-2">
                      {hero.subtitle}
                    </span>
                  )}
                </h1>
              </div>

              {/* 2. KHUNG ẢNH SẢN PHẨM TRÊN MOBILE (chỉ hiện dưới màn hình lg: để người dùng thấy ngay hình ảnh tấm MGO) */}
              {hasImage && (
                <div className="lg:hidden">
                  <MediaCard hero={hero} previewImageUrl={previewImageUrl} />
                </div>
              )}

              {/* 3. Đoạn mô tả kỹ thuật (hỗ trợ **in đậm** từ CMS) */}
              <div className="max-w-2xl text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed space-y-2 sm:space-y-2.5 font-normal">
                {hero.paragraphs.map((p, i) => (
                  <p key={i}>
                    <InlineBold text={p} strongClassName="font-bold text-slate-900" />
                  </p>
                ))}
              </div>

              {/* 4. Nút Call-To-Action (chuẩn ngón cái: full-width trên mobile, hàng ngang trên tablet/desktop) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 pt-1 w-full sm:w-auto">
                <CtaLink
                  cta={hero.primaryCta}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-remak-orange to-[#EA580C] text-white font-bold text-sm sm:text-base shadow-md shadow-orange-500/20 active:scale-[0.98] hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all text-center flex items-center justify-center min-h-[48px]"
                />
                {hero.secondaryCta && (
                  <CtaLink
                    cta={hero.secondaryCta}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border-2 border-slate-200 text-slate-800 font-bold text-sm sm:text-base active:scale-[0.98] hover:border-remak-green hover:text-remak-green-dark hover:bg-remak-green-light transition-all shadow-2xs text-center flex items-center justify-center cursor-pointer min-h-[48px]"
                  />
                )}
              </div>
            </div>

            {/* 5. 4 KHỐI THÔNG SỐ (TEXT-ONLY, CÂN XỨNG CHIỀU CAO 100%, LƯỚI 2x2 MOBILE / 4 CỘT DESKTOP) */}
            <div className="pt-3.5 sm:pt-4 border-t border-slate-200/90 mt-auto">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {hero.stats.map((stat, i) => {
                  const style = HERO_ACCENT_STYLES[stat.accent] ?? HERO_ACCENT_STYLES.slate;
                  return (
                    <div
                      key={i}
                      className={`rounded-xl sm:rounded-2xl bg-white border-2 border-slate-300/90 ${style.card} p-3 sm:p-4 hover:-translate-y-0.5 transition-all duration-200 shadow-2xs hover:shadow-xs flex flex-col justify-between min-h-[96px] sm:min-h-[108px] h-full`}
                    >
                      <div
                        className={`text-xl sm:text-2xl lg:text-3xl font-black leading-none tracking-tight ${style.value} tabular-nums`}
                      >
                        {stat.value}
                      </div>
                      <div className="mt-2 sm:mt-3">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-1 sm:line-clamp-none">
                          {stat.label}
                        </div>
                        {stat.sublabel && (
                          <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 mt-0.5 line-clamp-1 sm:line-clamp-none">
                            {stat.sublabel}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: KHUNG TRÌNH DIỄN HÌNH ẢNH SẢN PHẨM (5/12 - CHỈ HIỆN TRÊN DESKTOP >= lg) */}
          {hasImage && (
            <div className="hidden lg:flex lg:col-span-5 flex-col">
              <MediaCard hero={hero} previewImageUrl={previewImageUrl} className="flex-1 h-full" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
