import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Tấm Chống Cháy MGO Remak® FireOFF - Chuẩn PCCC QCVN 06:2022/BXD",
  description: "Tổng kho tấm chống cháy MGO (Magie Oxit) đạt chuẩn PCCC A1, EI 15 - EI 120. Kháng nước 100%, không rỉ sét, nhẹ hơn cemboard 30%. Báo giá sỉ nhà máy, nhận mẫu thử miễn phí!",
  keywords: "tấm mgo, tấm chống cháy mgo, mgo remak, bọc ống gió chống cháy, vách ngăn chống cháy ei 60, vách karaoke, sàn chịu lực mgo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-slate-800">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
