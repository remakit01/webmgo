import React from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CheckCircle2, ChevronRight, PhoneCall } from 'lucide-react';
import { formatFireRating } from '@remak/shared/contracts/product';
import { toPlainText, type RichDoc } from '@remak/shared/rich-content';
import Link from '@/components/ui/LocaleLink';
import { SetLocaleAlternates } from '@/components/layout/LocaleAlternates';
import RichContent from '@/components/news/RichContent';
import CatalogCard, { ProductImage } from '@/components/product-catalog/CatalogCard';
import SpecSheet from '@/components/product-catalog/SpecSheet';
import VariantPicker from '@/components/product-catalog/VariantPicker';
import { AdvantageGrid, CertificateList, DecorativeOptions, FaqList, SectionTitle, VariantTable } from '@/components/product-catalog/ProductDetailSections';
import { HOTLINE, HOTLINE_TEL, quoteHref } from '@/components/product-catalog/format';
import { routing, type Locale } from '@/i18n/routing';
import { getProduct, getProducts } from '@/lib/api';
import { productPath, productTypePath, productsIndexPath } from '@/lib/product-paths';
import { indexable, localizedAlternates } from '@/lib/seo';

// ISR 60s; CMS lưu sản phẩm -> API revalidate tag "products". Sản phẩm mới dựng lần đầu có người xem.
export const revalidate = 60;

type Props = PageProps<'/[locale]/products/[slug]'>;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const list = await getProducts(params.locale as Locale);
  return (list ?? []).map((p) => ({ slug: p.slug }));
}

/** Đường dẫn sản phẩm ở mọi ngôn ngữ ĐÃ xuất bản (hreflang + nút đổi ngôn ngữ) */
function alternatePaths(alternates: Partial<Record<Locale, string>>) {
  return Object.fromEntries(routing.locales.flatMap((l) => (alternates[l] ? [[l, productPath(l, alternates[l]!)]] : []))) as Partial<Record<Locale, string>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const data = await getProduct(locale, slug);
  if (!data || 'redirect' in data) return {};
  const { product } = data;
  const image = product.seo.ogImageUrl ?? product.coverImageUrl ?? undefined;
  return {
    title: `${product.seo.title} | Remak®`,
    description: product.seo.description,
    alternates: localizedAlternates(alternatePaths(product.alternates), locale),
    openGraph: {
      title: product.seo.title,
      description: product.seo.description,
      url: productPath(locale, product.slug),
      ...(image ? { images: [{ url: image, alt: product.coverAlt || product.name }] } : {}),
    },
    robots: indexable(!product.seo.noindex),
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  setRequestLocale(locale);

  const data = await getProduct(locale, slug);
  if (!data) notFound();
  // Slug cũ (đổi sau khi đăng) hoặc slug của ngôn ngữ khác -> 301 sang slug hiện tại
  if ('redirect' in data) permanentRedirect(productPath(locale, data.redirect));

  const { product: p } = data;
  const t = await getTranslations('Products');
  const related = ((await getProducts(locale)) ?? []).filter((x) => x.id !== p.id).slice(0, 3);
  const paths = alternatePaths(p.alternates);
  const hasDescription = !!toPlainText(p.description as RichDoc).trim();
  const fire = p.fireRating ? formatFireRating(p.fireRating.min, p.fireRating.max) : null;

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
              {p.name}
            </li>
          </ol>
        </nav>
      </div>

      {/* Đầu trang: ảnh + thông tin nhanh + chọn độ dày */}
      <section className="border-b border-slate-200 bg-white py-10 lg:py-14">
        <div className="mx-auto grid max-w-[1440px] items-start gap-10 px-4 lg:grid-cols-12 lg:gap-12 lg:px-8">
          <div className="space-y-3 lg:col-span-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
              <ProductImage url={p.coverImageUrl} alt={p.coverAlt || p.name} sizes="(min-width: 1024px) 50vw, 100vw" priority />
              {fire && <span className="absolute left-4 top-4 rounded-lg bg-[#F26522] px-3 py-1 text-sm font-extrabold text-white shadow">{fire}</span>}
            </div>
            {p.gallery.length > 0 && (
              <ul className="grid grid-cols-4 gap-3">
                {p.gallery.slice(0, 4).map((g) => (
                  <li key={g.url} className="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <ProductImage url={g.url} alt={g.alt} sizes="12vw" />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-6 lg:col-span-6">
            <div className="space-y-3">
              <p className="text-sm font-bold uppercase tracking-wide text-[#4E7202]">
                {p.type.slug ? (
                  <Link href={productTypePath('vi', p.type.slug)} className="underline-offset-2 hover:underline">
                    {p.type.name}
                  </Link>
                ) : (
                  p.type.name
                )}
              </p>
              <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 lg:text-4xl">{p.name}</h1>
              {p.tagline && <p className="text-lg font-semibold text-slate-700">{p.tagline}</p>}
              {p.summary && <p className="leading-relaxed text-slate-600">{p.summary}</p>}
            </div>
            {p.highlights.length > 0 && (
              <ul className="grid gap-2 sm:grid-cols-2" aria-label={t('highlightsTitle')}>
                {p.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm font-medium text-slate-800">
                    <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#5F8A03]" aria-hidden="true" /> {h}
                  </li>
                ))}
              </ul>
            )}
            <VariantPicker variants={p.variants} slug={p.slug} locale={locale} />
          </div>
        </div>
      </section>

      {/* Nội dung chi tiết */}
      <div className="mx-auto max-w-[1100px] space-y-14 px-4 py-14 lg:px-8">
        {p.variants.length > 0 && (
          <section aria-labelledby="quy-cach">
            <SectionTitle id="quy-cach">{t('variantsTitle')}</SectionTitle>
            <VariantTable variants={p.variants} locale={locale} />
          </section>
        )}

        {p.spec && (
          <section aria-labelledby="thong-so">
            <SectionTitle id="thong-so">{t('specsTitle')}</SectionTitle>
            <SpecSheet spec={p.spec} variants={p.variants} name={p.name} locale={locale} />
          </section>
        )}

        {hasDescription && (
          <section aria-labelledby="gioi-thieu">
            <SectionTitle id="gioi-thieu">{t('descriptionTitle')}</SectionTitle>
            <RichContent doc={p.description as RichDoc} />
          </section>
        )}

        {p.advantages.length > 0 && (
          <section aria-labelledby="uu-diem">
            <SectionTitle id="uu-diem">{t('advantagesTitle')}</SectionTitle>
            <AdvantageGrid items={p.advantages} />
          </section>
        )}

        {p.decorativeOptions.length > 0 && (
          <section aria-labelledby="hoan-thien">
            <SectionTitle id="hoan-thien">{t('decorativeTitle')}</SectionTitle>
            <DecorativeOptions options={p.decorativeOptions} customPrint={p.spec?.extension?.type === 'DECORATIVE' && p.spec.extension.customPrintSupported} locale={locale} />
          </section>
        )}

        {p.certificates.length > 0 && (
          <section aria-labelledby="chung-nhan">
            <SectionTitle id="chung-nhan">{t('certificatesTitle')}</SectionTitle>
            <CertificateList items={p.certificates} locale={locale} />
          </section>
        )}

        {p.faqs.length > 0 && (
          <section aria-labelledby="hoi-dap">
            <SectionTitle id="hoi-dap">{t('faqTitle')}</SectionTitle>
            <FaqList items={p.faqs} />
          </section>
        )}

        <section className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 p-8 text-white lg:flex-row lg:items-center lg:p-10">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-extrabold">{t('ctaTitle')}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{t('ctaText')}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <Link href={quoteHref(p.slug)} className="inline-flex h-12 items-center justify-center rounded-xl bg-[#F26522] px-6 text-sm font-bold text-white hover:bg-[#D95314]">
              {t('requestQuote')}
            </Link>
            <a href={HOTLINE_TEL} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 text-sm font-bold text-white hover:bg-white/20">
              <PhoneCall size={16} aria-hidden="true" /> {t('callHotline', { phone: HOTLINE })}
            </a>
          </div>
        </section>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="san-pham-khac" className="border-t border-slate-200 bg-white py-14">
          <div className="mx-auto max-w-[1440px] px-4 lg:px-8">
            <SectionTitle id="san-pham-khac">{t('relatedTitle')}</SectionTitle>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <CatalogCard key={r.id} item={r} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
