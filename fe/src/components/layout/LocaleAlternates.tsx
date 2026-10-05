'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Locale } from '@/i18n/routing';

/**
 * Đường dẫn tương ứng của trang hiện tại ở từng ngôn ngữ, khi slug KHÁC nhau giữa các ngôn ngữ
 * (vd bài viết /tin-tuc/toi-la-abc ⇄ /en/news/i-am-abc). Trang đặt qua <SetLocaleAlternates />,
 * nút đổi ngôn ngữ đọc ở đây; trang không đặt thì nút đổi ngôn ngữ dùng bảng pathnames như cũ.
 */
type Alternates = Partial<Record<Locale, string>>;

const AlternatesContext = createContext<{ alternates: Alternates | null; setAlternates: (a: Alternates | null) => void } | null>(null);

export function LocaleAlternatesProvider({ children }: { children: React.ReactNode }) {
  const [alternates, setAlternates] = useState<Alternates | null>(null);
  const value = useMemo(() => ({ alternates, setAlternates }), [alternates]);
  return <AlternatesContext.Provider value={value}>{children}</AlternatesContext.Provider>;
}

export function useLocaleAlternates(): Alternates | null {
  return useContext(AlternatesContext)?.alternates ?? null;
}

/** Đặt đường dẫn từng ngôn ngữ cho trang đang xem (render trong page, không hiển thị gì) */
export function SetLocaleAlternates({ paths }: { paths: Alternates }) {
  const ctx = useContext(AlternatesContext);
  const setAlternates = ctx?.setAlternates;
  const key = JSON.stringify(paths);
  useEffect(() => {
    if (!setAlternates) return;
    setAlternates(JSON.parse(key) as Alternates);
    return () => setAlternates(null);
  }, [key, setAlternates]);
  return null;
}
