import type { Metadata } from 'next';
import { TechLibraryHero, TechLibraryClientView } from '@/components/tech-library';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';

export const metadata: Metadata = {
  title: 'Thư Viện Kiểm Định PCCC | Remak® MGO FireOFF',
  description: 'Tải biên bản thử nghiệm đốt lò IBST, bản vẽ CAD thi công và chứng chỉ kiểm định PCCC cho tấm MGO Remak® FireOFF. Miễn phí, đầy đủ hồ sơ.',
};

export default async function TechLibraryPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale as Locale);
  return (
    <>
      <TechLibraryHero />
      <TechLibraryClientView />
    </>
  );
}
