import type { Metadata } from 'next';
import { ProjectsHero, ProjectsClientView } from '@/components/projects';

export const metadata: Metadata = {
  title: 'Dự Án Tiêu Biểu | Remak® MGO FireOFF',
  description:
    'Hơn 200 công trình thực tế từ nhà máy KCN, trung tâm thương mại đến data center — tất cả được nghiệm thu PCCC với hồ sơ IBST đầy đủ.',
};

export default function ProjectsPage() {
  return (
    <>
      <ProjectsHero />
      <ProjectsClientView />
    </>
  );
}
