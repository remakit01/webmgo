'use client';

import React, { useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Filter, Search, X } from 'lucide-react';
import { STOCK_STATUS_LABEL, formatFireRating, type ProductListItemPublic, type ProductTypeRef } from '@remak/shared/contracts/product';
import Link from '@/components/ui/LocaleLink';
import type { Locale } from '@/i18n/routing';
import { productTypePath } from '@/lib/product-paths';
import { useProductCompare } from '@/hooks/use-product-compare';
import CatalogCard, { PriceLine } from './CatalogCard';
import { formatMm } from './format';

type Sort = 'default' | 'priceAsc' | 'priceDesc' | 'fire';
const select =
  'h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 cursor-pointer focus:border-[#5F8A03] focus:outline-none focus:ring-1 focus:ring-[#5F8A03]';

/** Bỏ dấu để tìm "tam chong chay" khớp "Tấm chống cháy" */
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

/**
 * Danh mục sản phẩm: lọc theo loại / độ dày / mức chịu lửa, tìm kiếm, sắp xếp và so sánh tối đa 3 sản phẩm.
 * Dữ liệu đến từ API (server component truyền xuống) — toàn bộ lọc chạy trên trình duyệt, danh mục nhỏ.
 * `types`: loại sản phẩm theo thứ tự CMS (rỗng = không hiện nút lọc theo loại, vd trên trang loại).
 */
export default function CatalogBrowser({ items, types: allTypes = [], locale }: { items: ProductListItemPublic[]; types?: ProductTypeRef[]; locale: Locale }) {
  const t = useTranslations('Products');
  const ids = useId();
  const { addToCompare, removeFromCompare, isInCompare, compareItems, totalSlots } = useProductCompare();

  const [type, setType] = useState<string>('all');
  const [thickness, setThickness] = useState<number | null>(null);
  const [minFire, setMinFire] = useState<number | null>(null);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('default');

  const types = allTypes.filter((pt) => items.some((i) => i.type.id === pt.id));
  const selectedType = types.find((pt) => pt.id === type);
  const thicknesses = useMemo(() => [...new Set(items.flatMap((i) => i.thicknessesMm))].sort((a, b) => a - b), [items]);
  const fireLevels = useMemo(() => [...new Set(items.flatMap((i) => (i.fireRating?.max ? [i.fireRating.max] : [])))].sort((a, b) => a - b), [items]);

  const filtered = useMemo(() => {
    // Khớp từng từ (không cần liền nhau): "san cha nham" khớp "Tấm sàn MgO chà nhám".
    // Gõ có dấu thì so có dấu ("sàn" không khớp "sản"); gõ không dấu thì bỏ dấu cả hai phía.
    const accented = fold(q) !== q.toLowerCase();
    const norm = accented ? (s: string) => s.toLowerCase() : fold;
    const words = norm(q).split(/\s+/).filter(Boolean);
    const list = items.filter((i) => {
      if (type !== 'all' && i.type.id !== type) return false;
      if (thickness !== null && !i.thicknessesMm.includes(thickness)) return false;
      if (minFire !== null && (i.fireRating?.max ?? 0) < minFire) return false;
      if (!words.length) return true;
      const text = norm([i.name, i.tagline, i.summary, ...i.thicknessesMm.map((mm) => `${mm}mm`)].filter(Boolean).join(' '));
      return words.every((w) => text.includes(w));
    });
    // Không có giá công khai -> cuối danh sách khi sắp theo giá
    const price = (i: ProductListItemPublic, dir: 1 | -1) => (i.priceRange ? i.priceRange.low * dir : Number.POSITIVE_INFINITY);
    if (sort === 'priceAsc') list.sort((a, b) => price(a, 1) - price(b, 1));
    else if (sort === 'priceDesc') list.sort((a, b) => price(a, -1) - price(b, -1));
    else if (sort === 'fire') list.sort((a, b) => (b.fireRating?.max ?? 0) - (a.fireRating?.max ?? 0));
    return list;
  }, [items, type, thickness, minFire, q, sort]);

  const filtering = type !== 'all' || thickness !== null || minFire !== null || q.trim() !== '';
  const reset = () => {
    setType('all');
    setThickness(null);
    setMinFire(null);
    setQ('');
  };
  const handleToggleCompare = (item: ProductListItemPublic) => {
    if (isInCompare(item.id)) {
      removeFromCompare(item.id);
    } else {
      addToCompare({
        id: item.id,
        slug: item.slug,
        name: item.name,
        coverImageUrl: item.coverImageUrl,
        priceVnd: item.priceRange?.low ?? null,
        typeName: item.type?.name,
        thicknessesMm: item.thicknessesMm,
        summary: item.summary,
      });
    }
  };

  if (!items.length) {
    return <p className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">{t('emptyCatalog')}</p>;
  }

  return (
    <div className="space-y-6">
      {/* Bộ lọc */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
        {types.length > 1 && (
          <div role="group" aria-label={t('compareType')} className="flex gap-2 overflow-x-auto pb-1">
            {[{ id: 'all', name: t('all') }, ...types].map((pt) => {
              const count = pt.id === 'all' ? items.length : items.filter((i) => i.type.id === pt.id).length;
              const on = type === pt.id;
              return (
                <button
                  key={pt.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setType(pt.id)}
                  className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border px-4 text-sm font-bold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#5F8A03] ${
                    on ? 'border-[#4E7202] bg-[#4E7202] text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-[#7CB305] hover:text-[#3F5E02]'
                  }`}
                >
                  {pt.name}
                  <span className={`text-xs tabular-nums ${on ? 'text-white/80' : 'text-slate-500'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
          <div className="relative">
            <label htmlFor={`${ids}-q`} className="sr-only">
              {t('searchLabel')}
            </label>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              id={`${ids}-q`}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[#5F8A03] focus:outline-none focus:ring-1 focus:ring-[#5F8A03]"
            />
          </div>
          <div>
            <label htmlFor={`${ids}-th`} className="sr-only">
              {t('thickness')}
            </label>
            <select id={`${ids}-th`} value={thickness ?? ''} onChange={(e) => setThickness(e.target.value ? Number(e.target.value) : null)} className={`${select} w-full`}>
              <option value="">{t('anyThickness')}</option>
              {thicknesses.map((mm) => (
                <option key={mm} value={mm}>
                  {formatMm(mm, locale)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${ids}-fire`} className="sr-only">
              {t('fireRating')}
            </label>
            <select id={`${ids}-fire`} value={minFire ?? ''} onChange={(e) => setMinFire(e.target.value ? Number(e.target.value) : null)} className={`${select} w-full`}>
              <option value="">{t('anyFireRating')}</option>
              {fireLevels.map((m) => (
                <option key={m} value={m}>
                  {t('fireAtLeast', { minutes: m })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${ids}-sort`} className="sr-only">
              {t('sort')}
            </label>
            <select id={`${ids}-sort`} value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={`${select} w-full`}>
              <option value="default">{t('sortDefault')}</option>
              <option value="priceAsc">{t('sortPriceAsc')}</option>
              <option value="priceDesc">{t('sortPriceDesc')}</option>
              <option value="fire">{t('sortFire')}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="font-semibold text-slate-700" aria-live="polite">
            {t('results', { count: filtered.length })}
            {selectedType && (
              <>
                {' · '}
                <Link href={productTypePath('vi', selectedType.slug)} className="text-[#4E7202] underline-offset-2 hover:underline">
                  {t('viewTypePage', { name: selectedType.name })}
                </Link>
              </>
            )}
          </p>
          {filtering && (
            <button type="button" onClick={reset} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer">
              <X size={14} aria-hidden="true" /> {t('resetFilters')}
            </button>
          )}
        </div>
      </div>

      {/* Lưới sản phẩm */}
      {filtered.length ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, i) => (
            <CatalogCard
              key={item.id}
              item={item}
              locale={locale}
              priority={i < 3}
              compared={isInCompare(item.id)}
              compareDisabled={compareItems.length >= totalSlots && !isInCompare(item.id)}
              onToggleCompare={() => handleToggleCompare(item)}
            />
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-lg space-y-3 rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <Filter size={28} className="mx-auto text-amber-500" aria-hidden="true" />
          <h3 className="text-lg font-bold text-slate-900">{t('noResults')}</h3>
          <p className="text-sm text-slate-600">{t('noResultsHint')}</p>
          <button type="button" onClick={reset} className="h-10 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white hover:bg-[#4E7202] cursor-pointer">
            {t('resetFilters')}
          </button>
        </div>
      )}
    </div>
  );
}
