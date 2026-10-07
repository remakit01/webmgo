import { getTranslations } from 'next-intl/server';
import { Flame } from 'lucide-react';
import Link from '@/components/ui/LocaleLink';
import type { Locale } from '@/i18n/routing';
import { getPopularNews } from '@/lib/api';

/**
 * "Xem nhiều nhất" (7 ngày) — danh sách đánh số, chỉ tiêu đề (nhẹ, không thêm ảnh).
 * Server component, ISR theo tag "news"; chưa có dữ liệu thì không hiện.
 */
export default async function PopularNews({
  locale,
  excludeId,
  variant = 'sidebar',
}: {
  locale: Locale;
  /** Bỏ bài đang xem */
  excludeId?: string;
  variant?: 'sidebar' | 'strip';
}) {
  const [t, items] = await Promise.all([getTranslations('News'), getPopularNews(locale)]);
  const list = (items ?? []).filter((i) => i.postId !== excludeId).slice(0, 5);
  if (!list.length) return null;

  return (
    <section
      aria-labelledby={`popular-${variant}`}
      className={variant === 'sidebar' ? 'bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-xs space-y-4' : 'space-y-3'}
    >
      <h2
        id={`popular-${variant}`}
        className={
          variant === 'sidebar'
            ? 'flex items-center gap-2 font-black text-slate-900 text-lg border-b border-slate-100 pb-3'
            : 'flex items-center gap-2 text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase'
        }
      >
        <Flame size={18} className="text-remak-orange" aria-hidden="true" /> {t('popular')}
      </h2>
      <ol className={variant === 'sidebar' ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'}>
        {list.map((item, i) => (
          <li key={item.postId} className="flex gap-3">
            <span aria-hidden="true" className="text-2xl font-black leading-none text-remak-green/40 tabular-nums w-6 shrink-0">
              {i + 1}
            </span>
            <div className="min-w-0">
              <Link href={`/tin-tuc/${item.slug}`} className="text-sm font-bold text-slate-900 leading-snug line-clamp-3 hover:text-remak-green-dark transition-colors">
                {item.title}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
