'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Flame,
  Volume2,
  Droplets,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Award,
  Scale,
  Building2,
  Layers,
  FileText,
  Maximize2,
  X,
} from 'lucide-react';
import type { ProductDetailPublic } from '@remak/shared/contracts/product';
import { ProductImage } from './CatalogCard';

export interface FeaturedSlideData {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  accentBg: string;
  items: {
    icon: 'fire' | 'acoustic' | 'water' | 'shield' | 'award' | 'scale' | 'building' | 'layers';
    label: string;
    value: string;
    desc: string;
    color: string;
  }[];
}

export interface DetailImageItem {
  id: string;
  title: string;
  url: string | null;
  alt: string;
}

interface ProductHeroGalleryProps {
  product: Pick<ProductDetailPublic, 'name' | 'coverImageUrl' | 'coverAlt' | 'gallery' | 'highlights' | 'tagline'>;
  fireRatingLabel?: string | null;
  className?: string;
}

/**
 * 4 Slide Infographic công nghệ cao trong mục Nổi bật
 * Bố cục Bento Grid sắc nét, hiện đại, chuẩn nhận diện Remak®
 */
function getFeaturedSlides(name: string, tagline: string | null): FeaturedSlideData[] {
  return [
    {
      id: 'featured-core-specs',
      badge: 'ĐẶC TÍNH CỐT LÕI',
      title: name,
      subtitle: tagline || 'Tấm chống cháy & cách âm thế hệ mới',
      accentBg: 'from-[#101b08] via-[#1a2c0d] to-[#0c1605]',
      items: [
        {
          icon: 'fire',
          label: 'Cấp chống cháy',
          value: 'Euroclass A1',
          desc: 'Không bắt lửa, chịu nhiệt đỉnh 2.852°C',
          color: '#F26522',
        },
        {
          icon: 'acoustic',
          label: 'Cách âm vượt trội',
          value: '35 – 52 dB',
          desc: 'Triệt tiêu tiếng ồn, cách âm phòng Bar & Rạp',
          color: '#7CB305',
        },
        {
          icon: 'water',
          label: 'Kháng nước & ẩm',
          value: '< 15% Hút nước',
          desc: 'Trương nở ≤ 0,08%, không mủn nát rã hạt',
          color: '#38bdf8',
        },
        {
          icon: 'shield',
          label: 'An toàn sinh thái',
          value: '0% Amiăng',
          desc: 'Formaldehyde 0mg/L, chứng nhận LEED xanh',
          color: '#34d399',
        },
      ],
    },
    {
      id: 'featured-fire-testing',
      badge: 'KIỂM ĐỊNH PCCC',
      title: 'Đạt Chuẩn QCVN 06:2022/BXD',
      subtitle: 'Thử nghiệm đốt mẫu thực tế tại Viện Chuyên ngành IBST',
      accentBg: 'from-[#230d05] via-[#2c1308] to-[#140602]',
      items: [
        {
          icon: 'award',
          label: 'Giới hạn chịu lửa',
          value: 'EI 30 – EI 180',
          desc: 'Ngăn lửa & cách nhiệt lên đến 3 giờ liên tục',
          color: '#F26522',
        },
        {
          icon: 'shield',
          label: 'Chuẩn quốc tế',
          value: 'ASTM E84 Class A',
          desc: 'Chứng nhận EN 13501-1 & tiêu chuẩn UL 055',
          color: '#fb923c',
        },
        {
          icon: 'layers',
          label: 'Pha tinh thể 517',
          value: 'Không ăn mòn',
          desc: 'Chống rỉ sét bulong & khung thép xương chìm',
          color: '#a3e635',
        },
        {
          icon: 'fire',
          label: 'Độc tính khói',
          value: 'Mức VOC cực thấp',
          desc: 'Không sinh khí độc khi tiếp xúc ngọn lửa trần',
          color: '#38bdf8',
        },
      ],
    },
    {
      id: 'featured-comparison',
      badge: 'ƯU THẾ VƯỢT TRỘI',
      title: 'Đột Phá So Với Vật Liệu Cũ',
      subtitle: 'Khắc phục hoàn toàn nhược điểm của thạch cao & xi măng cốt sợi',
      accentBg: 'from-[#0b1726] via-[#102238] to-[#060e18]',
      items: [
        {
          icon: 'scale',
          label: 'So với thạch cao',
          value: 'Không mủn rã',
          desc: 'Ngâm nước thoải mái, không ẩm mốc ố vàng',
          color: '#38bdf8',
        },
        {
          icon: 'layers',
          label: 'So với xi măng',
          value: 'Nhẹ hơn 20%',
          desc: 'Giảm tải kết cấu công trình, dễ cắt gọt thi công',
          color: '#a3e635',
        },
        {
          icon: 'shield',
          label: 'Cường độ uốn',
          value: '15 – 25 MPa',
          desc: 'Độ bền cơ lý cao, chịu va đập rung chấn mạnh',
          color: '#fbbf24',
        },
        {
          icon: 'award',
          label: 'Khả năng bám vít',
          value: 'Cực kỳ chắc chắn',
          desc: 'Treo vật nặng an tâm, không vỡ mép cạnh',
          color: '#34d399',
        },
      ],
    },
    {
      id: 'featured-solutions',
      badge: 'HỆ THỐNG GIẢI PHÁP',
      title: 'Ứng Dụng Đa Năng Cho Dự Án',
      subtitle: 'Đáp ứng toàn diện các hạng mục phòng cháy nhà thầu',
      accentBg: 'from-[#0b1b14] via-[#112a1f] to-[#06120d]',
      items: [
        {
          icon: 'building',
          label: 'Bọc ống gió PCCC',
          value: 'Hút khói EI',
          desc: 'Bọc bảo vệ ống gió sự cố hành lang thoát hiểm',
          color: '#F26522',
        },
        {
          icon: 'layers',
          label: 'Vách ngăn chống cháy',
          value: 'Kho xưởng KCN',
          desc: 'Vách ngăn chia khoang cháy, phòng sạch, Bar',
          color: '#a3e635',
        },
        {
          icon: 'building',
          label: 'Sàn chịu lực',
          value: 'Nhà tiền chế',
          desc: 'Lót sàn gác lửng chịu tải lớn, không mối mọt',
          color: '#38bdf8',
        },
        {
          icon: 'shield',
          label: 'Cửa & Trần treo',
          value: 'Chịu lửa đồng bộ',
          desc: 'Lõi cửa thép chống cháy & trần chống ẩm mốc',
          color: '#34d399',
        },
      ],
    },
  ];
}

/**
 * Danh sách ảnh chụp chi tiết (Cover + Mock/API Gallery)
 */
function getDetailImages(
  product: Pick<ProductDetailPublic, 'name' | 'coverImageUrl' | 'coverAlt' | 'gallery'>,
): DetailImageItem[] {
  const list: DetailImageItem[] = [];

  // Ảnh đại diện tấm chính hãng
  if (product.coverImageUrl) {
    list.push({
      id: 'cover',
      title: 'Tấm nguyên bản',
      url: product.coverImageUrl,
      alt: product.coverAlt || product.name,
    });
  }

  // Gallery từ API
  if (product.gallery && product.gallery.length > 0) {
    product.gallery.forEach((g, idx) => {
      list.push({
        id: `api-gallery-${idx}`,
        title: g.alt || `Chi tiết ${idx + 1}`,
        url: g.url,
        alt: g.alt || `${product.name} - Ảnh ${idx + 1}`,
      });
    });
  } else {
    // Mock ảnh thực tế tấm MGO Remak
    const mockImages = [
      {
        url: '/images/mgo-board.jpg',
        title: 'Bề mặt & Cạnh vuông',
        alt: 'Bề mặt nhẵn phẳng và kết cấu cạnh vuông chuẩn kích thước tấm MGO Remak®',
      },
      {
        url: '/images/mgo-mesh.jpg',
        title: 'Lưới sợi thủy tinh',
        alt: 'Gia cường 2 lớp lưới sợi thủy tinh chịu lực, bám vít tuyệt vời',
      },
      {
        url: '/images/mgo-duct.jpg',
        title: 'Bọc ống gió PCCC',
        alt: 'Ứng dụng bọc bảo vệ ống gió chống cháy hệ thống PCCC đạt chuẩn EI',
      },
      {
        url: '/images/mgo-wall.jpg',
        title: 'Vách ngăn chống cháy',
        alt: 'Thi công vách ngăn chống cháy nhà kho xưởng công nghiệp KCN',
      },
      {
        url: '/images/mgo-floor.jpg',
        title: 'Sàn chịu lực',
        alt: 'Ứng dụng lót sàn gác lửng chịu lực nhà thép tiền chế',
      },
    ];

    mockImages.forEach((m, idx) => {
      list.push({
        id: `mock-${idx}`,
        title: m.title,
        url: m.url,
        alt: m.alt,
      });
    });
  }

  return list;
}

/** Render Icon theo loại */
function SlideIcon({ type, size = 18, color }: { type: string; size?: number; color: string }) {
  const props = { size, style: { color }, className: 'shrink-0' };
  switch (type) {
    case 'fire':
      return <Flame {...props} />;
    case 'acoustic':
      return <Volume2 {...props} />;
    case 'water':
      return <Droplets {...props} />;
    case 'shield':
      return <ShieldCheck {...props} />;
    case 'award':
      return <Award {...props} />;
    case 'scale':
      return <Scale {...props} />;
    case 'building':
      return <Building2 {...props} />;
    case 'layers':
    default:
      return <Layers {...props} />;
  }
}

/**
 * Slide Infographic Nổi Bật (Trong Array Nổi Bật)
 */
function FeaturedInfographicSlide({
  data,
  fireRatingLabel,
  currentIndex,
  total,
  onSelectSlide,
}: {
  data: FeaturedSlideData;
  fireRatingLabel?: string | null;
  currentIndex: number;
  total: number;
  onSelectSlide: (idx: number) => void;
}) {
  return (
    <div
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br ${data.accentBg} p-5 sm:p-7 text-white select-none`}
    >
      {/* Họa tiết lưới kỹ thuật chìm */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: `radial-gradient(#a3e635 1px, transparent 1px), radial-gradient(#a3e635 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
        }}
        aria-hidden="true"
      />

      {/* Hiệu ứng ánh hào quang */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#7CB305]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#F26522]/15 blur-3xl" />

      {/* Header Slide: Tag Badge & Tiêu đề */}
      <div className="relative z-10 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-[#7CB305]/20 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#A0D911] border border-[#7CB305]/40">
            <Sparkles size={12} />
            {data.badge}
          </span>
          {fireRatingLabel && (
            <span className="bg-[#F26522] px-2.5 py-0.5 text-[11px] font-black text-white shadow-xs">
              {fireRatingLabel}
            </span>
          )}
        </div>
        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white line-clamp-1">
          {data.title}
        </h3>
        <p className="text-xs sm:text-sm font-medium text-slate-300 line-clamp-1">
          {data.subtitle}
        </p>
      </div>

      {/* Lưới 4 Khối Chỉ Tiêu (Bento Grid vuông phẳng, không bo góc) */}
      <div className="relative z-10 grid grid-cols-2 gap-2.5 sm:gap-3 py-2">
        {data.items.map((item, idx) => (
          <div
            key={idx}
            className="border border-white/10 bg-white/5 p-3 backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20"
          >
            <div className="flex items-center gap-2">
              <SlideIcon type={item.icon} color={item.color} size={17} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 line-clamp-1">
                {item.label}
              </span>
            </div>
            <div className="mt-1 text-base sm:text-lg font-black text-white line-clamp-1">
              {item.value}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-300 line-clamp-1">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Footer Infographic: Phân trang Dots cho mảng Nổi bật */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-2.5 text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-[#A0D911]" />
          <span>Khổ tiêu chuẩn: 1.220 × 2.440 mm</span>
        </div>

        {/* Thanh Dots chuyển giữa các ảnh trong mảng Nổi bật */}
        <div className="flex items-center gap-1.5" aria-label="Các ảnh nổi bật">
          {Array.from({ length: total }).map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectSlide(dotIdx);
              }}
              aria-label={`Xem ảnh nổi bật ${dotIdx + 1}`}
              className={`h-1.5 transition-all cursor-pointer ${dotIdx === currentIndex
                  ? 'w-6 bg-[#A0D911]'
                  : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Component Thư Viện Ảnh Hero Swiper với Kiến Trúc Grouped Scope (Categorized Carousel)
 * - Scope "featured": Duyệt khép kín CHỈ trong mảng ảnh nổi bật (loop trong Nổi bật)
 * - Scope "images": Duyệt khép kín trong mảng ảnh chụp chi tiết
 * - Chuyển động bằng CSS Transform siêu mượt (GPU accelerated), không bị lỗi kẹt scroll
 * - Badge góc dưới phải chỉ hiển thị số value thuần túy: ví dụ 1/4 (nổi bật) hoặc 1/6 (ảnh chụp)
 */
export default function ProductHeroGallery({
  product,
  fireRatingLabel,
  className = '',
}: ProductHeroGalleryProps) {
  const featuredSlides = getFeaturedSlides(product.name, product.tagline);
  const detailImages = getDetailImages(product);

  // Chế độ đang chọn: 'featured' hoặc 'images'
  const [activeMode, setActiveMode] = useState<'featured' | 'images'>('featured');
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Xử lý nút Trước (<) theo Scope độc lập (Tuần hoàn khép kín trong từng mode)
  const handlePrev = useCallback(() => {
    if (activeMode === 'featured') {
      setFeaturedIndex((prev) => (prev - 1 + featuredSlides.length) % featuredSlides.length);
    } else {
      setGalleryIndex((prev) => (prev - 1 + detailImages.length) % detailImages.length);
    }
  }, [activeMode, featuredSlides.length, detailImages.length]);

  // Xử lý nút Kế tiếp (>) theo Scope độc lập - HẾT NỔI BẬT KHÔNG NHẢY SANG ẢNH KHÁC
  const handleNext = useCallback(() => {
    if (activeMode === 'featured') {
      setFeaturedIndex((prev) => (prev + 1) % featuredSlides.length);
    } else {
      setGalleryIndex((prev) => (prev + 1) % detailImages.length);
    }
  }, [activeMode, featuredSlides.length, detailImages.length]);

  // Hỗ trợ vuốt chạm cảm ứng (Touch swipe) trên thiết bị di động
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    touchStartXRef.current = null;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
  };

  // Khóa cuộn trang khi mở Lightbox xem Full
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  // Cuộn thumbnail tương ứng vào giữa tầm nhìn
  useEffect(() => {
    if (!thumbnailsRef.current) return;
    const targetThumbIdx = activeMode === 'featured' ? 0 : galleryIndex + 1;
    const activeBtn = thumbnailsRef.current.children[targetThumbIdx] as HTMLElement | undefined;
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeMode, galleryIndex]);

  // Điều hướng bằng phím mũi tên bàn phím & đóng bằng Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, isLightboxOpen]);

  // Dữ liệu hiển thị hiện tại
  const isFeatured = activeMode === 'featured';
  const currentTotal = isFeatured ? featuredSlides.length : detailImages.length;
  const currentPos = isFeatured ? featuredIndex + 1 : galleryIndex + 1;
  const activeIndex = isFeatured ? featuredIndex : galleryIndex;

  return (
    <div className={`space-y-4 select-none ${className}`}>
      {/* ── 1. KHUNG ẢNH CHÍNH SWIPER (TỶ LỆ 4:3, KHÔNG BO GÓC) ── */}
      <div className="group/hero relative">
        {/* Khung chứa ảnh có overflow-hidden - BẤM VÀO ĐỂ XEM FULL */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Bấm vào ảnh để xem toàn màn hình"
          onClick={() => setIsLightboxOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsLightboxOpen(true);
            }
          }}
          className="relative aspect-[4/3] w-full overflow-hidden border border-slate-200 bg-slate-100 shadow-sm cursor-zoom-in group/canvas focus-visible:outline-2 focus-visible:outline-[#4E7202]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Track Slider trượt mượt mà bằng CSS Transform (Tăng tốc GPU, phản hồi tức thì, không bị lỗi kẹt scroll) */}
          <div
            className="flex h-full w-full transition-transform duration-350 ease-out will-change-transform"
            style={{
              transform: `translateX(-${activeIndex * 100}%)`,
            }}
          >
            {isFeatured
              ? featuredSlides.map((slide, idx) => (
                <div key={slide.id} className="h-full w-full shrink-0 relative overflow-hidden">
                  <FeaturedInfographicSlide
                    data={slide}
                    fireRatingLabel={fireRatingLabel}
                    currentIndex={idx}
                    total={featuredSlides.length}
                    onSelectSlide={(targetIdx) => {
                      setFeaturedIndex(targetIdx);
                    }}
                  />
                </div>
              ))
              : detailImages.map((img, idx) => (
                <div key={img.id} className="h-full w-full shrink-0 relative overflow-hidden bg-slate-100">
                  <ProductImage
                    url={img.url}
                    alt={img.alt}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    priority={idx === 0}
                  />
                </div>
              ))}
          </div>

          {/* Tem PCCC nổi ở góc trên trái (cho các slide ảnh chụp chi tiết) */}
          {!isFeatured && fireRatingLabel && (
            <span className="absolute left-4 top-4 z-10 bg-[#F26522] px-3 py-1 text-sm font-extrabold text-white shadow-md">
              {fireRatingLabel}
            </span>
          )}

          {/* Badge Đếm Số Thứ Tự: CHỈ CẦN SỐ VALUE (ví dụ 1/4 khi ở Nổi bật, 1/6 khi ở Ảnh) */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-slate-950/70 px-3 py-1 text-xs font-bold text-white shadow-md backdrop-blur-xs">
            <span>{currentPos}</span>
            <span className="text-white/60">/</span>
            <span className="text-white/80">{currentTotal}</span>
          </div>
        </div>

        {/* Nút bấm sườn Trái nổi bật: trong suốt kính mờ, nằm ở giữa cạnh trái */}
        {currentTotal > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Xem ảnh trước"
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-slate-300/70 bg-white/35 text-slate-800 shadow-xs backdrop-blur-md transition-all hover:scale-110 hover:bg-white hover:border-[#4E7202] hover:text-[#3F5E02] focus-visible:outline-2 focus-visible:outline-[#4E7202] cursor-pointer"
          >
            <ChevronLeft size={22} className="stroke-[2.5]" aria-hidden="true" />
          </button>
        )}

        {/* Nút bấm sườn Phải nổi bật: trong suốt kính mờ, nằm ở giữa cạnh phải */}
        {currentTotal > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Xem ảnh tiếp theo"
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-slate-300/70 bg-white/35 text-slate-800 shadow-xs backdrop-blur-md transition-all hover:scale-110 hover:bg-white hover:border-[#4E7202] hover:text-[#3F5E02] focus-visible:outline-2 focus-visible:outline-[#4E7202] cursor-pointer"
          >
            <ChevronRight size={22} className="stroke-[2.5]" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* ── 2. DẢI THUMBNAIL CĂN GIỮA (KHÔNG BO GÓC) ── */}
      <div className="flex justify-center">
        <div
          ref={thumbnailsRef}
          role="tablist"
          aria-label="Danh sách hình ảnh sản phẩm"
          className="scrollbar-none flex max-w-full items-center gap-2.5 overflow-x-auto px-1 py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Thumbnail Nút 1: "⭐ Nổi bật" (Icon ngôi sao + chữ Nổi bật, không có badge value) */}
          <button
            type="button"
            role="tab"
            aria-selected={isFeatured}
            aria-label="Xem mảng ảnh nổi bật"
            onClick={() => {
              if (!isFeatured) {
                setActiveMode('featured');
              } else {
                // Đang ở nổi bật, click chuyển tiếp sang slide nổi bật kế tiếp trong mảng
                handleNext();
              }
            }}
            className={`group relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 flex-col items-center justify-center border-2 transition-all cursor-pointer ${isFeatured
                ? 'border-[#4E7202] bg-[#F4F9E8] text-[#3F5E02] shadow-sm ring-2 ring-[#4E7202]/20'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
          >
            <Star
              size={20}
              className={`transition-transform duration-200 ${isFeatured
                  ? 'fill-[#4E7202] text-[#4E7202] scale-110'
                  : 'text-slate-500 group-hover:text-slate-800'
                }`}
            />
            <span className="mt-1 text-[11px] font-bold leading-none">
              Nổi bật
            </span>
          </button>

          {/* Các Thumbnail ảnh chụp chi tiết tiếp theo */}
          {detailImages.map((item, idx) => {
            const isActive = !isFeatured && galleryIndex === idx;

            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Xem ảnh ${idx + 1}: ${item.title}`}
                onClick={() => {
                  setActiveMode('images');
                  setGalleryIndex(idx);
                }}
                className={`relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden border-2 transition-all cursor-pointer ${isActive
                    ? 'border-[#4E7202] shadow-sm opacity-100 scale-105 ring-2 ring-[#4E7202]/20'
                    : 'border-slate-200 bg-slate-50 opacity-70 hover:opacity-100 hover:border-slate-300'
                  }`}
              >
                {item.url ? (
                  <img
                    src={item.url}
                    alt={item.alt || item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                    <FileText size={18} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. DIALOG XEM ẢNH FULL MÀN HÌNH CHUẨN THẾ GIỚI DI ĐỘNG (WHITE POPUP CARD) ── */}
      {mounted && isLightboxOpen && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh sản phẩm"
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-6 select-none animate-in fade-in duration-200"
        >
          {/* Khung Card Trắng chính giữa màn hình (Chuẩn TGDD - mở rộng chiều ngang và chiều cao đẹp mắt) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col w-full max-w-[1200px] bg-white rounded-2xl shadow-2xl p-4 sm:p-6 overflow-hidden max-h-[96vh]"
          >
            {/* Nút Đóng (X) ở góc trên bên phải của khung trắng */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Đóng (Phím Esc)"
              className="absolute top-3.5 right-3.5 z-30 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X size={22} className="stroke-[2.5]" />
            </button>

            {/* Vùng ảnh chính trung tâm */}
            <div className="relative flex flex-1 w-full items-center justify-center py-2 sm:py-4 min-h-[380px] sm:min-h-[520px] max-h-[72vh] overflow-hidden">
              {/* Nút Lùi (<) hình tròn trắng viền mỏng hai bên */}
              {currentTotal > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Xem ảnh trước"
                  className="absolute left-1 sm:left-3 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 shadow-md hover:bg-slate-50 hover:scale-105 transition-all cursor-pointer"
                >
                  <ChevronLeft size={20} className="stroke-[2.5]" />
                </button>
              )}

              {/* Ảnh to ở giữa (Không border bo góc, nền transparent tự nhiên) */}
              <div className="flex h-full w-full items-center justify-center bg-transparent">
                {isFeatured ? (
                  <div className="w-[min(92vw,880px)] aspect-[4/3] overflow-hidden bg-transparent">
                    <FeaturedInfographicSlide
                      data={featuredSlides[featuredIndex]}
                      fireRatingLabel={fireRatingLabel}
                      currentIndex={featuredIndex}
                      total={featuredSlides.length}
                      onSelectSlide={(targetIdx) => setFeaturedIndex(targetIdx)}
                    />
                  </div>
                ) : detailImages[galleryIndex]?.url ? (
                  <img
                    src={detailImages[galleryIndex].url!}
                    alt={detailImages[galleryIndex].alt}
                    className="max-h-[68vh] max-w-full object-contain bg-transparent"
                  />
                ) : (
                  <div className="flex h-64 w-64 items-center justify-center bg-transparent text-slate-400">
                    <FileText size={48} />
                  </div>
                )}
              </div>

              {/* Nút Tiến (>) hình tròn trắng viền mỏng hai bên */}
              {currentTotal > 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Xem ảnh tiếp theo"
                  className="absolute right-1 sm:right-3 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 shadow-md hover:bg-slate-50 hover:scale-105 transition-all cursor-pointer"
                >
                  <ChevronRight size={20} className="stroke-[2.5]" />
                </button>
              )}

              {/* Badge số thứ tự góc dưới bên phải (ví dụ 1/8 như TGDD) */}
              <div className="absolute bottom-2 right-2 sm:right-4 z-10 rounded-md bg-slate-100/95 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600 shadow-xs">
                <span>{currentPos}</span>
                <span>/</span>
                <span>{currentTotal}</span>
              </div>
            </div>

            {/* Dải Thumbnails phía dưới đáy card */}
            <div className="flex items-center justify-center gap-2 pt-3 border-t border-slate-100 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* Nút Nổi bật */}
              <button
                type="button"
                onClick={() => {
                  if (!isFeatured) {
                    setActiveMode('featured');
                  } else {
                    handleNext();
                  }
                }}
                className={`flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 flex-col items-center justify-center rounded-lg border transition-all cursor-pointer ${
                  isFeatured
                    ? 'border-[#2f80ed] bg-[#f0f7ff] text-[#2f80ed] shadow-xs'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <Star size={16} className={isFeatured ? 'fill-[#2f80ed] text-[#2f80ed]' : 'text-slate-400'} />
                <span className="text-[10px] font-semibold mt-0.5">Nổi bật</span>
              </button>

              {/* Danh sách ảnh con */}
              {detailImages.map((img, idx) => {
                const isActive = !isFeatured && galleryIndex === idx;
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => {
                      setActiveMode('images');
                      setGalleryIndex(idx);
                    }}
                    className={`relative h-12 w-12 sm:h-13 sm:w-13 shrink-0 overflow-hidden rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? 'border-[#2f80ed] ring-2 ring-[#2f80ed]/30 opacity-100 shadow-xs'
                        : 'border-slate-200 bg-white opacity-75 hover:opacity-100 hover:border-slate-300'
                    }`}
                  >
                    {img.url ? (
                      <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <FileText size={14} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
