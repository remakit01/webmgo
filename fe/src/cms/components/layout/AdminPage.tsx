'use client';

/**
 * CHUẨN BỐ CỤC TRANG CMS (lấy theo "Quản Lý Banner Trang Chủ" và "Quản Lý Tiêu Đề & Điểm Nhấn").
 * CMS chỉ dùng trên desktop — không làm nhánh giao diện mobile.
 *
 *   <AdminPage title subtitle>                 AdminHeader h-16, dính trên cùng
 *     <AdminPageBand title actions sticky?>    dải trắng tràn ngang: thanh px-6 py-3 + nội dung (xem trước / thanh công cụ)
 *     <AdminPageBody>                          thân trang p-6 space-y-6, rộng hết khung (không max-w)
 *       <div className={ADMIN_CARD}>…</div>    thẻ trắng: rounded-xl p-5 border slate-300 shadow-2xs
 *
 * Phần tử dính bên dưới dải (vd tiêu đề bảng) dùng `top-[var(--admin-sticky-top)]` = header + dải dính.
 */

import React, { createContext, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import AdminHeader from '@/cms/components/AdminHeader';

/** Thân trang chuẩn (dùng trực tiếp khi thân trang là <form>…) */
export const ADMIN_BODY = 'w-full p-6 space-y-6';
/** Thẻ nội dung chuẩn trong thân trang */
export const ADMIN_CARD = 'bg-white rounded-xl p-5 border border-slate-300 shadow-2xs';

const HEADER_HEIGHT = '4rem'; // AdminHeader h-16

const PageCtx = createContext<{ setBandHeight: (h: number) => void } | null>(null);
const BandCtx = createContext<{ stuck: boolean }>({ stuck: false });

/** Trạng thái dải đang dính (để thu gọn nội dung khi cuộn) */
export const useAdminPageBand = () => useContext(BandCtx);

export function AdminPage({
  title,
  subtitle,
  actionText,
  onAction,
  children,
}: {
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  children: ReactNode;
}) {
  const [bandHeight, setBandHeight] = useState(0);
  const ctx = useMemo(() => ({ setBandHeight }), []);
  return (
    <PageCtx.Provider value={ctx}>
      {/* grow + shrink-0 (basis auto): khung cao theo nội dung. flex-1 (basis 0) bị ép bằng chiều cao màn hình,
          nội dung tràn ra ngoài và header / dải sticky trôi mất khi cuộn quá một màn hình */}
      <div
        className="flex min-h-full grow shrink-0 flex-col bg-slate-50"
        style={{ '--admin-sticky-top': `calc(${HEADER_HEIGHT} + ${bandHeight}px)` } as CSSProperties}
      >
        <AdminHeader title={title} subtitle={subtitle} actionText={actionText} onAction={onAction} />
        {children}
      </div>
    </PageCtx.Provider>
  );
}

/**
 * Dải trắng tràn ngang ngay dưới header.
 * - title: chuỗi (thành h2) hoặc node bất kỳ (vd tab); actions: nút bên phải thanh.
 * - sticky: dính dưới header khi cuộn; báo `stuck` cho nội dung bên trong qua useAdminPageBand().
 */
export function AdminPageBand({
  title,
  actions,
  sticky,
  label,
  className = '',
  children,
}: {
  title?: ReactNode;
  actions?: ReactNode;
  sticky?: boolean;
  /** Tên vùng cho trình đọc màn hình khi title không phải chuỗi */
  label?: string;
  className?: string;
  children?: ReactNode;
}) {
  const page = useContext(PageCtx);
  const bandRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  // Mốc ngay trên dải: mốc trượt khỏi mép dưới header => dải đang dính
  useEffect(() => {
    const el = sentinelRef.current;
    if (!sticky || !el) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), {
      root: document.getElementById('admin-main'),
      rootMargin: `-64px 0px 0px 0px`,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [sticky]);

  // Chiều cao dải -> --admin-sticky-top cho phần dính bên dưới
  useEffect(() => {
    const el = bandRef.current;
    if (!sticky || !el || !page) return;
    const ro = new ResizeObserver(() => page.setBandHeight(el.offsetHeight));
    ro.observe(el);
    return () => {
      ro.disconnect();
      page.setBandHeight(0);
    };
  }, [sticky, page]);

  const bandCtx = useMemo(() => ({ stuck }), [stuck]);
  const hasBar = title !== undefined || actions !== undefined;

  return (
    <BandCtx.Provider value={bandCtx}>
      {sticky && <div ref={sentinelRef} aria-hidden="true" className="h-px -mb-px" />}
      <section
        ref={bandRef}
        aria-label={label ?? (typeof title === 'string' ? title : undefined)}
        className={`w-full shrink-0 bg-white border-b border-slate-300 ${
          sticky ? `sticky top-16 z-20 transition-shadow ${stuck ? 'shadow-md' : ''}` : ''
        } ${className}`}
      >
        {hasBar && (
          <div className={`px-6 py-3 flex items-center justify-between gap-3 flex-wrap ${children ? 'border-b border-slate-300' : ''}`}>
            {typeof title === 'string' ? <h2 className="text-sm font-bold text-slate-900">{title}</h2> : (title ?? <span />)}
            {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
          </div>
        )}
        {children}
      </section>
    </BandCtx.Provider>
  );
}

/** Thân trang chuẩn: p-6, rộng hết khung. className thay cho space-y-6 mặc định (vd lưới 2 cột). */
export function AdminPageBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={className ? `w-full p-6 ${className}` : ADMIN_BODY}>{children}</div>;
}
