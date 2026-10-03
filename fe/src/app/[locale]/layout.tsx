import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import { beVietnamPro } from "../fonts";
import AppShell from "@/components/layout/AppShell";
import { routing } from "@/i18n/routing";

export const viewport: Viewport = {
  themeColor: "#5F8A03",
  width: "device-width",
  initialScale: 1,
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mgo.remak.vn";

// Dựng tĩnh sẵn cả 2 ngôn ngữ (giữ SSG/ISR)
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale, namespace: "Metadata" });

  return {
    metadataBase: new URL(baseUrl),
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: t("ogLocale"),
      url: baseUrl,
      siteName: "Remak® Vietnam",
      title: t("title"),
      description: t("ogDescription"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("ogDescription"),
    },
    // Giai đoạn chuyển tiếp: nội dung các trang /en phần lớn còn tiếng Việt -> chưa cho index,
    // bật lại theo từng trang khi đã có nội dung tiếng Anh thật.
    ...(locale === "en" ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} dir="ltr" className={`h-full antialiased ${beVietnamPro.variable}`} suppressHydrationWarning>
      <body className="min-h-full bg-[#F8FAFC] text-slate-800 antialiased font-sans">
        <NextIntlClientProvider>
          <AppShell>{children}</AppShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
