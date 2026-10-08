import React from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { SampleRequestForm } from '@/components/shared';
import CatalogBrowser from '@/components/product-catalog/CatalogBrowser';
import type { Locale } from '@/i18n/routing';
import { getProductTypes, getProducts } from '@/lib/api';
import { productsIndexPath } from '@/lib/product-paths';
import { localizedAlternates } from '@/lib/seo';

// ISR 60s; CMS lưu sản phẩm -> API revalidate tag "products"
export const revalidate = 60;

type Props = PageProps<'/[locale]/products'>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  return { alternates: localizedAlternates({ vi: productsIndexPath('vi'), en: productsIndexPath('en') }, locale) };
}

export default async function ProductsPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const [items, types] = await Promise.all([getProducts(locale).then((x) => x ?? []), getProductTypes(locale).then((x) => x ?? [])]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* 3 – 5. DANH MỤC SẢN PHẨM TỪ CMS: LỌC, LƯỚI, SO SÁNH */}
      <section id="khu-vuc-san-pham" className="mx-auto max-w-[1440px] px-4 py-10 lg:px-8">
        <CatalogBrowser items={items} types={types} locale={locale} />
      </section>
      {/* 10. FORM ĐĂNG KÝ HỘP MẪU THỬ TẤM MGO MIỄN PHÍ TẬN NƠI */}
      <SampleRequestForm />
    </div>
  );
}
