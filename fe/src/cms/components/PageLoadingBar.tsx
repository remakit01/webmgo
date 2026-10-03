'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Thanh tiến trình chuyển trang toàn cục (Global Page Transition Bar).
 * Phản hồi tương tác người dùng tức thì (< 50ms) khi click vào bất kỳ menu con nào.
 */
export default function PageLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Khi route thực sự thay đổi (Next.js đã load xong trang mới)
  useEffect(() => {
    if (loading) {
      setProgress(100);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
      finishTimerRef.current = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 250);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Lắng nghe click chuột vào các liên kết nội bộ trong Admin
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Tìm thẻ <a> gần nhất
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      // Bỏ qua external links, hash link, link trống hoặc mở tab mới
      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        anchor.target === '_blank' ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }

      // Nếu click vào chính URL hiện tại thì không kích hoạt
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl || href === window.location.pathname) {
        return;
      }

      // Kích hoạt thanh tiến trình tức thì
      setLoading(true);
      setProgress(25);

      if (timerRef.current) clearInterval(timerRef.current);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);

      // Mô phỏng tiến trình tăng dần mượt mà
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 85;
          }
          return prev + Math.floor(Math.random() * 15) + 10;
        });
      }, 150);

      // Tự ngắt sau 6 giây nếu trang phản hồi quá lâu để tránh bị kẹt
      setTimeout(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setLoading(false);
        setProgress(0);
      }, 6000);
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
      if (timerRef.current) clearInterval(timerRef.current);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2.5px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-[#7CB305] via-[#5F8A03] to-[#4E7202] shadow-[0_0_10px_rgba(95,138,3,0.7)] transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? '180ms' : '220ms',
          opacity: progress === 100 ? 0.4 : 1,
        }}
      />
    </div>
  );
}
