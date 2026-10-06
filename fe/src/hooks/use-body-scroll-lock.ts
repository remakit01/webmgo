'use client';

import { useEffect } from 'react';

/**
 * Custom Hook khoá cuộn body khi mở Modal, Drawer, Dialog hoặc Menu off-canvas.
 * Ngăn ngừa thanh cuộn ngang/dọc gây lệch hoặc giật layout toàn cục.
 *
 * @param locked Boolean báo hiệu có kích hoạt khoá cuộn hay không
 */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [locked]);
}
