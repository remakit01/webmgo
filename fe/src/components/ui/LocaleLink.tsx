'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { toLocalePath } from '@/i18n/paths';

type LinkProps = React.ComponentProps<typeof Link>;

/**
 * Thay cho next/link ở web khách hàng: href viết bằng URL tiếng Việt như cũ,
 * tự đổi sang URL của ngôn ngữ đang xem (vd "/san-pham" -> "/en/products" trên trang tiếng Anh).
 */
const LocaleLink = React.forwardRef<HTMLAnchorElement, LinkProps>(function LocaleLink({ href, ...props }, ref) {
  const locale = useLocale();
  const localized = typeof href === 'string' ? toLocalePath(href, locale) : href;
  return <Link ref={ref} href={localized} {...props} />;
});

export default LocaleLink;
