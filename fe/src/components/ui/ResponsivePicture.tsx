import type { ResponsiveImage } from '@/types/homepage';

// Ảnh từ API đã có sẵn nhiều cỡ × AVIF/WebP (MinIO) nên dùng <picture> trực tiếp,
// không qua next/image (tránh tối ưu ảnh lần hai và phải khai báo remotePatterns).

function srcSet(image: ResponsiveImage, format: 'webp' | 'avif') {
  return image.images
    .filter((v) => v.format === format)
    .sort((a, b) => a.width - b.width)
    .map((v) => `${v.url} ${v.width}w`)
    .join(', ');
}

interface ResponsivePictureProps {
  image: ResponsiveImage;
  alt: string;
  /** Kích thước hiển thị theo viewport, vd '100vw' hoặc '(min-width: 1024px) 40vw, 100vw' */
  sizes: string;
  /** Ảnh LCP (đầu trang): tải ngay, ưu tiên cao */
  priority?: boolean;
  className?: string;
}

export default function ResponsivePicture({ image, alt, sizes, priority = false, className }: ResponsivePictureProps) {
  const avif = srcSet(image, 'avif');
  const webp = srcSet(image, 'webp');
  return (
    <picture>
      {avif && <source type="image/avif" srcSet={avif} sizes={sizes} />}
      {webp && <source type="image/webp" srcSet={webp} sizes={sizes} />}
      <img
        src={image.imageUrl}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
      />
    </picture>
  );
}
