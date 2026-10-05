'use client';

import React, { useState } from 'react';
import { Check, Link2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Chia sẻ bài: Facebook, Zalo, LinkedIn (mở cửa sổ chia sẻ) và sao chép liên kết */
export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const t = useTranslations('News');
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent(url);
  const targets = [
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc}` },
    { name: 'Zalo', href: `https://sp.zalo.me/share_inline?u=${enc}` },
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}` },
  ];
  const btn =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:border-remak-green hover:text-remak-green-dark transition-colors cursor-pointer';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold text-slate-500 mr-1">{t('share')}:</span>
      {targets.map((s) => (
        <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className={btn} aria-label={`${t('share')} ${s.name}: ${title}`}>
          {s.name}
        </a>
      ))}
      <button
        type="button"
        className={btn}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? <Check size={13} aria-hidden="true" /> : <Link2 size={13} aria-hidden="true" />}
        <span aria-live="polite">{copied ? t('copied') : t('copyLink')}</span>
      </button>
    </div>
  );
}
