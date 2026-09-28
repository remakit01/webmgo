import type { Metadata } from 'next';
import TechLibraryClient from './TechLibraryClient';

export const metadata: Metadata = {
  title: 'Thư Viện Kiểm Định PCCC | Remak® MGO FireOFF',
  description: 'Tải biên bản thử nghiệm đốt lò IBST, bản vẽ CAD thi công và chứng chỉ kiểm định PCCC cho tấm MGO Remak® FireOFF. Miễn phí, đầy đủ hồ sơ.',
};

export default function TechLibraryPage() {
  return <TechLibraryClient />;
}
