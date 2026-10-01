import type { Metadata } from 'next';
import './globals.css';
import AuthShell from '@/components/layout/AuthShell';

export const metadata: Metadata = {
  title: 'Hệ Thống Quản Trị CMS | Remak® MGO FireOFF',
  description: 'Trung tâm quản trị dữ liệu sản phẩm, giải pháp thi công, thư viện kiểm định và xử lý yêu cầu mẫu MGO Remak.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">
        <AuthShell>
          {children}
        </AuthShell>
      </body>
    </html>
  );
}
