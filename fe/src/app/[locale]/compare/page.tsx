import React from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ChevronRight } from 'lucide-react';
import Link from '@/components/ui/LocaleLink';
import { getProduct, getProducts } from '@/lib/api';
import type { Locale } from '@/i18n/routing';

import type { ProductDetailPublic } from '@remak/shared/contracts/product';
import { FALLBACK_MGO_VARIANTS } from '@/components/product-catalog/fallback-variants';
import ComparisonClientView from './ComparisonClientView';

export const revalidate = 60;

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ items?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'en' ? 'Product Comparison | Remak® MGO' : 'So Sánh Sản Phẩm Tấm Chống Cháy | Remak® MGO',
    description:
      locale === 'en'
        ? 'Compare specifications, fire ratings, thicknesses and prices of Remak MGO fireproof boards.'
        : 'Đối chiếu trực quan thông số kỹ thuật, khả năng chống cháy EI, độ dày và giá bán các dòng tấm chống cháy MGO Remak®.',
  };
}

export default async function ComparePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { items: itemsQuery } = await searchParams;
  setRequestLocale(locale);

  const slugs = itemsQuery ? itemsQuery.split(',').map((s) => s.trim()).filter(Boolean) : [];

  // Tải chi tiết các sản phẩm từ API
  const productPromises = slugs.map((slug) => getProduct(locale, slug));
  const results = await Promise.all(productPromises);

  const products: ProductDetailPublic[] = results
    .map((res) => {
      if (!res || !('product' in res)) return null;
      const p = res.product;
      // Nếu sản phẩm chưa có variants trên CMS, bổ sung fallback chuẩn kỹ thuật
      if (!p.variants || p.variants.length === 0) {
        return { ...p, variants: FALLBACK_MGO_VARIANTS };
      }
      return p;
    })
    .filter((p): p is ProductDetailPublic => p !== null);

  // Tải danh sách tất cả sản phẩm để phục vụ gợi ý khi cần thêm
  const allProducts = (await getProducts(locale)) ?? [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-[1440px] px-4 py-3 text-xs font-semibold text-slate-600 lg:px-8">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-[#4E7202]">
                Trang chủ
              </Link>
            </li>
            <ChevronRight size={14} className="text-slate-400" aria-hidden="true" />
            <li>
              <Link href="/san-pham" className="hover:text-[#4E7202]">
                Sản phẩm
              </Link>
            </li>
            <ChevronRight size={14} className="text-slate-400" aria-hidden="true" />
            <li aria-current="page" className="font-bold text-[#3F5E02]">
              So sánh sản phẩm
            </li>
          </ol>
        </nav>
      </div>

      {/* Nội dung trang so sánh (Client component để quản lý toggle khác biệt và sticky) */}
      <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-8">
        <ComparisonClientView
          initialProducts={products}
          allCandidateProducts={allProducts}
          locale={locale}
        />
      </div>
    </div>
  );
}
