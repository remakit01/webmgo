'use client';

import { useEffect } from 'react';
import { API_URL } from '@/lib/api';

/**
 * Đếm lượt xem trang sản phẩm (trang là ISR nên phải đếm từ trình duyệt). Số liệu chỉ hiện trong CMS, web không hiện.
 * Server chống trùng 30 phút, bỏ qua bot. Body form-urlencoded: không cần preflight CORS. Không dùng cookie.
 * Nguồn truy cập = document.referrer + utm_source.
 */
export default function ProductViewTracker({ productId, locale }: { productId: string; locale: string }) {
  useEffect(() => {
    const body = new URLSearchParams({
      locale,
      referrer: document.referrer.slice(0, 2000),
      utm: new URLSearchParams(location.search).get('utm_source')?.slice(0, 100) ?? '',
    });
    const controller = new AbortController();
    // Lỗi đếm không ảnh hưởng người xem -> bỏ qua
    fetch(`${API_URL}/products/public/${encodeURIComponent(productId)}/view`, { method: 'POST', body, keepalive: true, signal: controller.signal }).catch(() => {});
    return () => controller.abort();
  }, [productId, locale]);

  return null;
}
