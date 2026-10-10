'use client';

import React, { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, FileText, MapPin, PhoneCall } from 'lucide-react';
import { STOCK_STATUS_LABEL, type ProductVariantPublic } from '@remak/shared/contracts/product';
import Link from '@/components/ui/LocaleLink';
import type { Locale } from '@/i18n/routing';
import { STOCK_TONE } from './CatalogCard';
import { HOTLINE, HOTLINE_TEL, formatMm, formatVnd, quoteHref } from './format';
import { FALLBACK_MGO_VARIANTS } from './fallback-variants';

interface WarehouseOption {
  id: string;
  name: string;
  address: string;
}

const WAREHOUSES: WarehouseOption[] = [
  { id: 'hn', name: 'Hà Nội', address: 'Kho Km19 QL6, Đông Sơn, Chương Mỹ' },
  { id: 'dn', name: 'Đà Nẵng', address: 'Kho KCN Hòa Khánh, Liên Chiểu' },
  { id: 'hcm', name: 'TP. Hồ Chí Minh', address: 'Kho Lô A1-A2, KCN Tân Bình, Tây Thạnh' },
];

/**
 * Giao diện Cột Phải Chuẩn Thế Giới Di Động:
 * 1. Chọn độ dày (Variant Selector dạng box nút ngang)
 * 2. Giá tại [Khu vực] ˅ (Chọn nhanh kho Remak)
 * 3. Giá bán / Báo giá theo độ dày (Số tiền lớn đỏ đậm, % giảm, tình trạng kho)
 * 4. Thông số nhanh của độ dày đang chọn (Quy cách, Chống cháy, Khối lượng, v.v.)
 * 5. Bộ nút hành động CTA (Yêu cầu báo giá & Gọi Hotline)
 */
export default function VariantPicker({
  variants,
  slug,
  locale,
}: {
  variants: ProductVariantPublic[];
  slug: string;
  locale: Locale;
}) {
  const t = useTranslations('Products');
  const ids = useId();

  // Tự động sử dụng dữ liệu quy cách mẫu chuẩn của Remak nếu API/CMS chưa nhập variants
  const effectiveVariants = variants && variants.length > 0 ? variants : FALLBACK_MGO_VARIANTS;

  const [selectedId, setSelectedId] = useState(
    () => (effectiveVariants.find((v) => v.isDefault) ?? effectiveVariants[0])?.id,
  );
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseOption>(WAREHOUSES[0]);
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);

  const v = effectiveVariants.find((x) => x.id === selectedId) ?? effectiveVariants[0];

  const ctas = (
    <div className="flex flex-col gap-2.5 sm:flex-row pt-1">
      <Link
        href={quoteHref(slug, v?.thicknessMm)}
        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#F26522] px-6 text-sm font-bold text-white shadow-md shadow-[#F26522]/20 transition-all hover:bg-[#D95314] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F26522]"
      >
        <FileText size={18} aria-hidden="true" />
        <span>{t('requestQuote')}</span>
      </Link>
      <a
        href={HOTLINE_TEL}
        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-800 transition-all hover:border-[#F26522] hover:text-[#F26522] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5F8A03]"
      >
        <PhoneCall size={18} className="text-[#F26522]" aria-hidden="true" />
        <span>{t('callHotline', { phone: HOTLINE })}</span>
      </a>
    </div>
  );

  if (!v) return ctas;

  return (
    <div className="space-y-5">
      {/* 1. Chọn độ dày (Variant selector) */}
      <fieldset>
        <legend className="mb-2 text-sm font-bold text-slate-900">
          {t('chooseThickness')}:
        </legend>
        <div className="flex flex-wrap gap-2.5">
          {effectiveVariants.map((x) => {
            const on = x.id === v.id;
            return (
              <label
                key={x.id}
                className={`relative inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition-all cursor-pointer select-none ${
                  on
                    ? 'border-[#2f80ed] bg-blue-50/40 text-[#2f80ed] font-bold shadow-xs ring-1 ring-[#2f80ed]'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <input
                  type="radio"
                  name={`${ids}-variant`}
                  value={x.id}
                  checked={on}
                  onChange={() => setSelectedId(x.id)}
                  className="sr-only"
                />
                <span className="tabular-nums">
                  {formatMm(x.thicknessMm, locale)}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* 2. Dòng "Giá tại [Khu vực] ˅" */}
      <div className="relative inline-block text-xs text-slate-600">
        <span className="text-slate-500">Giá tại </span>
        <button
          type="button"
          onClick={() => setIsWarehouseOpen((prev) => !prev)}
          className="inline-flex items-center gap-1 font-bold text-[#2f80ed] hover:underline cursor-pointer select-none"
        >
          <span>{selectedWarehouse.name}</span>
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${isWarehouseOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isWarehouseOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsWarehouseOpen(false)} />
            <div className="absolute left-0 top-full mt-1.5 z-50 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
              <p className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Chọn kho xuất xưởng
              </p>
              {WAREHOUSES.map((wh) => (
                <button
                  key={wh.id}
                  type="button"
                  onClick={() => {
                    setSelectedWarehouse(wh);
                    setIsWarehouseOpen(false);
                  }}
                  className={`flex w-full items-start gap-2 rounded-lg p-2 text-left transition-colors cursor-pointer ${
                    selectedWarehouse.id === wh.id
                      ? 'bg-blue-50 text-[#2f80ed] font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs font-bold leading-tight">{wh.name}</p>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{wh.address}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 3. Giá bán / Báo giá theo độ dày (Chuẩn Thế Giới Di Động: Giá sau giảm ở trên, giá ban đầu ở dưới) */}
      <div className="space-y-1">
        {v.priceVnd !== null ? (
          <>
            {/* Hàng trên: Giá sau khi giảm (Không kèm /tấm) */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-3xl font-extrabold tabular-nums text-[#d70018]">
                {formatVnd(v.priceVnd, locale)}
              </span>
              <span className={`rounded-md border px-2.5 py-0.5 text-xs font-bold ${STOCK_TONE[v.stockStatus]}`}>
                {STOCK_STATUS_LABEL[v.stockStatus][locale]}
              </span>
            </div>

            {/* Hàng dưới: Giá gốc ban đầu gạch ngang & % giảm giá */}
            {v.compareAtPriceVnd !== null && (
              <div className="flex items-center gap-2">
                <s className="text-sm tabular-nums text-slate-400">
                  {formatVnd(v.compareAtPriceVnd, locale)}
                </s>
                {v.discountPercent !== null && (
                  <span className="rounded bg-[#d70018]/10 px-1.5 py-0.5 text-xs font-bold text-[#d70018] border border-[#d70018]/20">
                    -{v.discountPercent}%
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {t('contactPrice')}
              </span>
              <span className="text-xs font-medium text-slate-500">
                (Báo giá theo khối lượng dự án)
              </span>
            </div>
            <span className={`rounded-md border px-2.5 py-0.5 text-xs font-bold ${STOCK_TONE[v.stockStatus]}`}>
              {STOCK_STATUS_LABEL[v.stockStatus][locale]}
            </span>
          </div>
        )}
      </div>

      {/* 4. Bộ nút hành động CTA */}
      {ctas}
    </div>
  );
}
