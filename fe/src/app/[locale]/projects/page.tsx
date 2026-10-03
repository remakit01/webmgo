import type { Metadata } from 'next';
import { ProjectsHero, ProjectsClientView } from '@/components/projects';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';

export const metadata: Metadata = {
  title: 'Dự Án Tiêu Biểu | Remak® MGO FireOFF',
  description:
    'Hơn 200 công trình thực tế từ nhà máy KCN, trung tâm thương mại đến data center — tất cả được nghiệm thu PCCC với hồ sơ IBST đầy đủ.',
};

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale as Locale);
  return (
    <>
      <ProjectsHero />
      <ProjectsClientView />
    </>
  );
}
