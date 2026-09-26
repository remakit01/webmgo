import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-be-vietnam-pro",
});

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
    <html lang="vi" className={`h-full antialiased ${beVietnamPro.variable}`}>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-slate-800">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
