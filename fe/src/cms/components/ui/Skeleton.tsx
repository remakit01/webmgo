import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Component Skeleton Shimmer tái sử dụng cho toàn hệ thống CMS Admin.
 * Hiệu ứng dải sóng ánh sáng quét ngang (Shimmer Light Wave) chuẩn UX Pro Max 2026.
 * Giữ nguyên cấu trúc layout, đạt tiêu chuẩn Zero-CLS (Cumulative Layout Shift = 0).
 */
export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden rounded-md bg-slate-200 select-none pointer-events-none before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent ${className}`}
      {...props}
    />
  );
}

export default Skeleton;

