'use client';

import { useState, useEffect } from 'react';

/**
 * Custom Hook theo dõi trạng thái cuộn trang
 * @param threshold Ngưỡng cuộn tính bằng px (mặc định 20px)
 */
export function useScroll(threshold = 20): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold);
    };

    // Kiểm tra lần đầu khi mount
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrolled;
}
