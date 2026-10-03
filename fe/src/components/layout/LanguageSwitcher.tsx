'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { routing, type Locale } from '@/i18n/routing';
import { toLocalePath, toViPath } from '@/i18n/paths';

/** Chuyển VI ⇄ EN giữ nguyên trang đang xem (vd /san-pham/x ⇄ /en/products/x). */
export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const t = useTranslations('LanguageSwitcher');
  const locale = useLocale();
  const viPath = toViPath(usePathname());

  return (
    <div role="group" aria-label={t('label')} className={`flex items-center gap-0.5 ${className}`}>
      {routing.locales.map((target: Locale, i) => (
        <span key={target} className="flex items-center gap-0.5">
          {i > 0 && <span className="text-slate-300" aria-hidden="true">|</span>}
          {/* next/link thuần: href đã là URL đích hoàn chỉnh của ngôn ngữ kia */}
          <Link
            href={toLocalePath(viPath, target)}
            hrefLang={target}
            lang={target}
            title={t(target)}
            aria-current={target === locale ? 'true' : undefined}
            className={`px-1.5 py-0.5 rounded font-bold uppercase transition-colors ${
              target === locale ? 'text-remak-green-dark bg-remak-green-light' : 'text-slate-500 hover:text-remak-green-dark'
            }`}
          >
            {target}
          </Link>
        </span>
      ))}
    </div>
  );
}
