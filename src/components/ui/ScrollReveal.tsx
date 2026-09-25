'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number; // ms
}

/**
 * Component tạo hiệu ứng xuất hiện (Scroll Reveal / Entrance Animation)
 * Tự động kích hoạt khi phần tử cuộn vào màn hình (Viewport)
 */
export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 750,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Ngừng theo dõi sau khi đã xuất hiện để tối ưu hiệu năng
          if (domRef.current) {
            observer.unobserve(domRef.current);
          }
        }
      },
      {
        threshold: 0.12, // Kích hoạt khi 12% phần tử vào màn hình
        rootMargin: '0px 0px -40px 0px',
      }
    );

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    if (isVisible) return 'translate(0, 0) scale(1)';
    switch (direction) {
      case 'up':
        return 'translateY(36px) scale(0.98)';
      case 'down':
        return 'translateY(-36px) scale(0.98)';
      case 'left':
        return 'translateX(36px)';
      case 'right':
        return 'translateX(-36px)';
      case 'none':
        return 'scale(0.96)';
      default:
        return 'translateY(36px)';
    }
  };

  return (
    <div
      ref={domRef}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionProperty: 'opacity, transform',
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
