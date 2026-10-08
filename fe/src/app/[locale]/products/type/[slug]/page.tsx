import React from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ChevronRight } from 'lucide-react';
import Link from '@/components/ui/LocaleLink';
import { SetLocaleAlternates } from '@/components/layout/LocaleAlternates';
import { SampleRequestForm } from '@/components/shared';
import CatalogBrowser from '@/components/product-catalog/CatalogBrowser';
import { routing, type Locale } from '@/i18n/routing';
import { getProductType, getProductTypes } from '@/lib/api';
import { productTypePath, productsIndexPath } from '@/lib/product-paths';
import { indexable, localizedAlternates } from '@/lib/seo';

// ISR 60s; CMS lưu loại / sản phẩm -> API revalidate tag "products". Loại mới dựng lần đầu có người xem.
export const revalidate = 60;

type Props = PageProps<'/[locale]/products/type/[slug]'>;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const types = await getProductTypes(params.locale as Locale);
  return (types ?? []).map((t) => ({ slug: t.slug }));
}

/** Đường dẫn trang loại ở mọi ngôn ngữ có bản dịch (hreflang + nút đổi ngôn ngữ) */
function alternatePaths(alternates: Partial<Record<Locale, string>>) {
  return Object.fromEntries(routing.locales.flatMap((l) => (alternates[l] ? [[l, productTypePath(l, alternates[l]!)]] : []))) as Partial<Record<Locale, string>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const data = await getProductType(locale, slug);
  if (!data || 'redirect' in data) return {};
  const { type } = data;
  return {
    title: `${type.seo.title} | Remak®`,
    description: type.seo.description || undefined,
    alternates: localizedAlternates(alternatePaths(type.alternates), locale),
    openGraph: { title: type.seo.title, description: type.seo.description || undefined, url: productTypePath(locale, type.slug), type: 'website' },
    // Trang /en của loại đã dịch là nội dung tiếng Anh thật -> cho index (layout /en mặc định noindex)
    ...(locale === 'en' ? { robots: indexable(true) } : {}),
  };
}

export default async function ProductTypePage({ params }: Props) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  setRequestLocale(locale);

  const data = await getProductType(locale, slug);
  if (!data) notFound();
  // Slug cũ (đổi trong CMS) hoặc slug của ngôn ngữ khác -> 301 sang slug hiện tại
  if ('redirect' in data) permanentRedirect(productTypePath(locale, data.redirect));

  const { type, products } = data;
  const t = await getTranslations('Products');
  const paths = alternatePaths(type.alternates);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <SetLocaleAlternates paths={{ vi: paths.vi ?? productsIndexPath('vi'), en: paths.en ?? productsIndexPath('en') }} />

      <div className="border-b border-slate-200 bg-white">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-[1440px] px-4 py-3 text-xs font-semibold text-slate-600 lg:px-8">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-[#4E7202]">
                {t('home')}
              </Link>
            </li>
            <ChevronRight size={14} className="text-slate-400" aria-hidden="true" />
            <li>
              <Link href="/san-pham" className="hover:text-[#4E7202]">
                {t('title')}
              </Link>
            </li>
            <ChevronRight size={14} className="text-slate-400" aria-hidden="true" />
            <li aria-current="page" className="max-w-xs truncate font-bold text-[#3F5E02] sm:max-w-md">
              {type.name}
            </li>
          </ol>
        </nav>
      </div>

      <section className="mx-auto max-w-[1440px] space-y-8 px-4 py-10 lg:px-8">
        <header className="max-w-3xl space-y-3">
          <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 lg:text-4xl">{type.name}</h1>
          {type.description && <p className="leading-relaxed text-slate-600">{type.description}</p>}
        </header>
        <CatalogBrowser items={products} locale={locale} />
      </section>

      <SampleRequestForm />
    </div>
  );
}
