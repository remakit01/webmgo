'use client';

import { useEffect, useState } from 'react';

/**
 * Custom Hook kiểm tra component đã mount trên client chưa.
 * Dùng để tránh lỗi SSR hydration mismatch khi render Portal hoặc các phần tử Client-only.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
