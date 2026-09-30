import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';

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
      <body className="antialiased flex min-h-screen bg-slate-50 text-slate-800">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </body>
    </html>
  );
}
