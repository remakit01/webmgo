import React from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

/**
 * Nút / link chỉ có icon (36×36) kèm tooltip hiện cả khi rê chuột LẪN khi focus bằng bàn phím
 * (thay cho thuộc tính title chỉ hiện khi rê chuột). Tên đọc cho trình đọc màn hình = label.
 * - href: link nội bộ CMS; external: mở tab mới (có báo "mở tab mới" cho trình đọc màn hình).
 * - tipAlign 'end': tooltip neo mép phải (nút sát mép phải bảng, tránh bị cắt).
 * - disabled: KHÔNG dùng thuộc tính disabled (nút mất focus -> người dùng bàn phím không đọc được lý do);
 *   dùng aria-disabled, bỏ qua click, label nên ghi rõ lý do bị khoá.
 */
export default function IconAction({
  id,
  label,
  icon: Icon,
  onClick,
  href,
  external,
  danger,
  disabled,
  tipAlign = 'center',
}: {
  /** Để trả focus về nút sau khi đóng một thao tác (vd huỷ sửa) */
  id?: string;
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  danger?: boolean;
  disabled?: boolean;
  tipAlign?: 'center' | 'end';
}) {
  const cls = `inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#5F8A03] ${
    disabled
      ? 'opacity-40 cursor-not-allowed'
      : `cursor-pointer hover:bg-slate-100 ${danger ? 'hover:text-rose-700 hover:bg-rose-50' : 'hover:text-[#4E7202]'}`
  }`;
  const icon = <Icon size={17} aria-hidden="true" />;
  const control = href ? (
    external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (mở tab mới)`} className={cls}>
        {icon}
      </a>
    ) : (
      <Link href={href} aria-label={label} className={cls}>
        {icon}
      </Link>
    )
  ) : (
    <button id={id} type="button" onClick={disabled ? undefined : onClick} aria-label={label} aria-disabled={disabled || undefined} className={cls}>
      {icon}
    </button>
  );

  return (
    <span className="group/tip relative inline-flex">
      {control}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-full z-20 mb-1.5 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover/tip:opacity-100 group-has-[:focus-visible]/tip:opacity-100 motion-reduce:transition-none ${
          tipAlign === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2'
        }`}
      >
        {label}
      </span>
    </span>
  );
}
