import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { beVietnamPro } from '../fonts';
import AdminShell from '@/cms/components/AdminShell';

// Root layout riêng cho CMS: tách khỏi web khách hàng (không i18n, không Header/Footer public)
export const viewport: Viewport = { themeColor: '#5F8A03', width: 'device-width', initialScale: 1 };

export const metadata: Metadata = {
  title: 'CMS Remak',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" dir="ltr" className={`h-full antialiased ${beVietnamPro.variable}`} suppressHydrationWarning>
      <body className="min-h-full bg-[#F8FAFC] text-slate-800 antialiased font-sans">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
