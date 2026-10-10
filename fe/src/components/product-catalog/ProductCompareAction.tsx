'use client';

import React from 'react';
import { Scale, Check } from 'lucide-react';
import { useProductCompare } from '@/hooks/use-product-compare';
import type { ProductDetailPublic, ProductListItemPublic } from '@remak/shared/contracts/product';

interface ProductCompareActionProps {
  currentProduct: ProductDetailPublic;
  candidateProducts?: ProductListItemPublic[];
  locale?: string;
  fireRatingLabel?: string | null;
}

/**
 * Nút Toggle "So sánh" / "✓ Đã thêm so sánh" chuẩn Thế Giới Di Động.
 * Khi bấm: thêm trực tiếp vào Bottom Compare Dock và mở dock đáy màn hình.
 */
export default function ProductCompareAction({
  currentProduct,
}: ProductCompareActionProps) {
  const { isInCompare, addToCompare, removeFromCompare, setIsDockCollapsed } =
    useProductCompare();

  const isAdded = isInCompare(currentProduct.id);

  const handleToggleCompare = () => {
    if (isAdded) {
      removeFromCompare(currentProduct.id);
    } else {
      addToCompare({
        id: currentProduct.id,
        slug: currentProduct.slug,
        name: currentProduct.name,
        coverImageUrl: currentProduct.coverImageUrl,
        priceVnd: currentProduct.priceRange?.low ?? currentProduct.variants?.[0]?.priceVnd ?? null,
        compareAtPriceVnd: currentProduct.variants?.[0]?.compareAtPriceVnd ?? null,
        discountPercent: currentProduct.variants?.[0]?.discountPercent ?? null,
        typeName: currentProduct.type?.name,
        thicknessesMm: currentProduct.thicknessesMm,
        summary: currentProduct.summary,
      });
      setIsDockCollapsed(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleCompare}
      aria-label={isAdded ? 'Bỏ sản phẩm khỏi bảng so sánh' : 'Thêm sản phẩm vào bảng so sánh'}
      className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold cursor-pointer select-none transition-colors ${
        isAdded
          ? 'text-[#2f80ed] hover:text-[#1d6cd1]'
          : 'text-[#2f80ed] hover:underline'
      }`}
    >
      {isAdded ? (
        <>
          <Check size={14} className="text-[#2f80ed] stroke-[2.5]" />
          <span>Đã thêm so sánh</span>
        </>
      ) : (
        <>
          <Scale size={14} className="text-[#2f80ed]" />
          <span>So sánh</span>
        </>
      )}
    </button>
  );
}
