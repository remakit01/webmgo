'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PUBLIC_VIEWS_MIN } from '@remak/shared/traffic-source';
import type { NewsViewResult } from '@remak/shared/contracts/news-stats';
import { API_URL } from '@/lib/api';

/** Mốc "đọc hết": đáy màn hình đã qua 75% thân bài */
const READ_THRESHOLD = 0.75;

/**
 * Đếm lượt xem + thời gian đọc / đọc hết bài (trang bài là ISR nên phải đếm từ trình duyệt).
 * - Vào trang: POST /view (server chống trùng 30 phút, bỏ qua bot) -> nhận tổng lượt xem để hiện.
 * - Rời trang (ẩn tab / pagehide): sendBeacon /read với số giây đọc thật (chỉ lúc tab đang mở) và đã đọc tới 75% chưa.
 * Body form-urlencoded: không cần preflight CORS. Không dùng cookie, không lưu gì trên máy người đọc.
 * Nguồn truy cập = document.referrer (với chuyển trang trong site là nguồn vào site của phiên) + utm_source.
 */
export default function NewsViewTracker({ postId, locale, bodyId }: { postId: string; locale: string; bodyId: string }) {
  const t = useTranslations('News');
  const [views, setViews] = useState<number | null>(null);
  const state = useRef({ completed: false, activeMs: 0, visibleSince: 0, sent: false });

  useEffect(() => {
    const s = state.current;
    s.completed = false;
    s.activeMs = 0;
    s.sent = false;
    s.visibleSince = document.visibilityState === 'visible' ? performance.now() : 0;
    const base = { locale, referrer: document.referrer.slice(0, 2000), utm: new URLSearchParams(location.search).get('utm_source')?.slice(0, 100) ?? '' };
    const body = (extra: Record<string, string> = {}) => new URLSearchParams({ ...base, ...extra });
    const url = (kind: 'view' | 'read') => `${API_URL}/news/public/posts/${encodeURIComponent(postId)}/${kind}`;

    const controller = new AbortController();
    fetch(url('view'), { method: 'POST', body: body(), keepalive: true, signal: controller.signal })
      .then((res) => (res.ok ? (res.json() as Promise<NewsViewResult>) : null))
      .then((r) => r && setViews(r.views))
      .catch(() => {});

    // Đọc tới 75% thân bài
    let frame = 0;
    const checkDepth = () => {
      frame = 0;
      const el = document.getElementById(bodyId);
      if (!el || s.completed) return;
      const rect = el.getBoundingClientRect();
      if (window.innerHeight - rect.top >= rect.height * READ_THRESHOLD) s.completed = true;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(checkDepth);
    };

    // Thời gian đọc thật: chỉ cộng lúc tab đang hiển thị
    const pause = () => {
      if (s.visibleSince) s.activeMs += performance.now() - s.visibleSince;
      s.visibleSince = 0;
    };
    const send = () => {
      pause();
      if (s.sent) return;
      s.sent = true;
      navigator.sendBeacon?.(url('read'), body({ seconds: String(Math.round(s.activeMs / 1000)), completed: String(s.completed) }));
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') send();
      else if (!s.visibleSince) s.visibleSince = performance.now();
    };

    checkDepth();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', send);
    return () => {
      controller.abort();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', send);
      send(); // chuyển sang bài khác trong site (client navigation)
    };
  }, [postId, locale, bodyId]);

  if (views === null || views < PUBLIC_VIEWS_MIN) return null;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Eye size={13} className="text-remak-green" aria-hidden="true" /> {t('views', { count: views.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US') })}
    </span>
  );
}
