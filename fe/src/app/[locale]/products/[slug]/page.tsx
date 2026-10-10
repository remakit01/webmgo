import React from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CheckCircle2, ChevronRight, Ruler, ShieldCheck, RefreshCw, Package } from 'lucide-react';
import { formatFireRating } from '@remak/shared/contracts/product';
import { toPlainText, type RichDoc } from '@remak/shared/rich-content';
import Link from '@/components/ui/LocaleLink';
import { SetLocaleAlternates } from '@/components/layout/LocaleAlternates';
import RichContent from '@/components/news/RichContent';
import { ProductImage } from '@/components/product-catalog/CatalogCard';
import ProductDetailTabs from '@/components/product-catalog/ProductDetailTabs';
import ProductHeroGallery from '@/components/product-catalog/ProductHeroGallery';
import ProductCompareAction from '@/components/product-catalog/ProductCompareAction';
import ProductRelatedSwiper from '@/components/product-catalog/ProductRelatedSwiper';
import SpecSheet from '@/components/product-catalog/SpecSheet';
import VariantPicker from '@/components/product-catalog/VariantPicker';
import { FALLBACK_MGO_VARIANTS } from '@/components/product-catalog/fallback-variants';
import { AdvantageGrid, CertificateList, DecorativeOptions, FaqList, SectionTitle } from '@/components/product-catalog/ProductDetailSections';
import { routing, type Locale } from '@/i18n/routing';
import { getProduct, getProducts } from '@/lib/api';
import { productPath, productsIndexPath } from '@/lib/product-paths';
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

interface CommitmentItem {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  content: React.ReactNode;
}

const COMMITMENT_ITEMS: CommitmentItem[] = [
  {
    icon: RefreshCw,
    content: (
      <>
        Hư gì đổi nấy <strong className="font-bold text-slate-900">12 tháng</strong> tại hệ thống kho toàn quốc (miễn phí đổi do lỗi nhà sản xuất)
      </>
    ),
  },
  {
    icon: ShieldCheck,
    content: (
      <>
        Bảo hành <strong className="font-bold text-slate-900">chính hãng Remak 10 năm</strong> không rỉ sét, chịu lửa chuẩn QCVN 06:2022/BXD
      </>
    ),
  },
  {
    icon: Package,
    content: (
      <>
        Bộ sản phẩm gồm: <strong className="font-bold text-slate-900">Kiện pallet bọc màng PE chống ẩm</strong>, Hóa đơn VAT, Chứng chỉ xuất xưởng CO/CQ, Phiếu kiểm định IBST
      </>
    ),
  },
];

function ProductCommitments() {
  // Tự động gom items thành các hàng (mỗi hàng tối đa 2 items theo lưới 2 cột)
  // Xử lý hoàn hảo cả khi tổng số items là CHẴN (2, 4, 6...) hoặc LẺ (1, 3, 5...)
  const rows: CommitmentItem[][] = [];
  for (let i = 0; i < COMMITMENT_ITEMS.length; i += 2) {
    rows.push(COMMITMENT_ITEMS.slice(i, i + 2));
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
      <h3 className="mb-4 text-sm sm:text-base font-bold text-slate-900">
        Remak cam kết chất lượng
      </h3>
      <div className="divide-y divide-slate-100">
        {rows.map((row, rowIdx) => {
          const isFirst = rowIdx === 0;
          const isLast = rowIdx === rows.length - 1;
          const isSingle = row.length === 1; // Hàng lẻ chỉ có 1 item

          return (
            <div
              key={rowIdx}
              className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${
                isFirst && isLast
                  ? ''
                  : isFirst
                  ? 'pb-4'
                  : isLast
                  ? 'pt-4'
                  : 'py-4'
              }`}
            >
              {row.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={itemIdx}
                    className={`flex items-start gap-3 ${
                      isSingle ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <div className="shrink-0 text-[#2f80ed]">
                      <Icon size={22} strokeWidth={1.75} />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
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
  const related = ((await getProducts(locale)) ?? []).filter((x) => x.id !== p.id).slice(0, 8);
  const paths = alternatePaths(p.alternates);
  const hasDescription = !!toPlainText(p.description as RichDoc).trim();
  const effectiveVariants = p.variants && p.variants.length > 0 ? p.variants : FALLBACK_MGO_VARIANTS;
  const fire = p.fireRating
    ? formatFireRating(p.fireRating.min, p.fireRating.max)
    : (effectiveVariants[0]?.fireRatingLabel || 'EI 30 - EI 180 (A1)');

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

      {/* Đầu trang: tên sản phẩm + ảnh + thông tin nhanh + chọn độ dày */}
      <section className="border-b border-slate-200 bg-white py-8 lg:py-10">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-8">
          {/* Header Row: [ Tên sản phẩm H1 ]   [ 📐 Thông số ]   [ ⚖️ + So sánh ] */}
          <div className="mb-6 flex flex-wrap items-center gap-3 sm:gap-4 border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              {p.name}
            </h1>
            <a
              href="#thong-so"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#2f80ed] hover:underline cursor-pointer select-none"
            >
              <Ruler size={14} className="text-[#2f80ed]" />
              <span>Thông số</span>
            </a>
            <ProductCompareAction
              currentProduct={{ ...p, variants: effectiveVariants }}
              candidateProducts={related}
              locale={locale}
              fireRatingLabel={fire}
            />
          </div>

          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Cột trái: Thư viện ảnh + Khối Remak® cam kết */}
            <div className="lg:col-span-6 space-y-4">
              <ProductHeroGallery product={p} fireRatingLabel={fire} />
              <ProductCommitments />
            </div>

            {/* Cột phải: Bộ chọn độ dày & Thông số nhanh chuẩn Thế Giới Di Động */}
            <div className="space-y-6 lg:col-span-6">
              <VariantPicker variants={effectiveVariants} slug={p.slug} locale={locale} />

              {p.highlights.length > 0 && (
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t('highlightsTitle')}
                  </p>
                  <ul className="grid gap-2 sm:grid-cols-2" aria-label={t('highlightsTitle')}>
                    {p.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-xs sm:text-sm font-medium text-slate-700">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#5F8A03]" aria-hidden="true" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Nội dung chi tiết */}
      <div className="mx-auto max-w-[1440px] space-y-14 px-4 py-14 lg:px-8">
        {/* 1. Ưu điểm nổi bật (Đặt ngay sau Hero để làm nổi bật các lý do chọn tấm MGO) */}
        {p.advantages.length > 0 && (
          <section aria-labelledby="uu-diem">
            <SectionTitle id="uu-diem">{t('advantagesTitle')}</SectionTitle>
            <AdvantageGrid items={p.advantages} />
          </section>
        )}

        {/* 2. Cụm 2 Tab cùng 1 hàng: Thông tin sản phẩm & Thông số kỹ thuật (chuẩn W3C ARIA) */}
        <div id="thong-so" className="scroll-mt-24">
          <ProductDetailTabs
            hasDescription={hasDescription}
            hasSpecs={!!p.spec}
            infoContent={hasDescription ? <RichContent doc={p.description as RichDoc} /> : null}
            specsContent={
              p.spec ? (
                <SpecSheet
                  spec={p.spec}
                  variants={effectiveVariants}
                  name={p.name}
                  labels={p.optionLabels}
                  locale={locale}
                />
              ) : null
            }
          />
        </div>

        {p.decorativeOptions.length > 0 && (
          <section aria-labelledby="hoan-thien">
            <SectionTitle id="hoan-thien">{t('decorativeTitle')}</SectionTitle>
            <DecorativeOptions options={p.decorativeOptions} customPrint={p.spec?.extension?.type === 'DECORATIVE' && p.spec.extension.customPrintSupported} labels={p.optionLabels} />
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
      </div>

      {related.length > 0 && (
        <section aria-labelledby="san-pham-khac" className="border-t border-slate-200 bg-white py-14">
          <div className="mx-auto max-w-[1440px] px-4 lg:px-8">
            <ProductRelatedSwiper items={related} locale={locale} />
          </div>
        </section>
      )}
    </div>
  );
}
