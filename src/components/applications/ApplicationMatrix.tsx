'use client';

import React from 'react';
import Link from 'next/link';
import { Table, CheckCircle2, ArrowRight } from 'lucide-react';

const MATRIX_DATA = [
  {
    application: 'Bọc Ống Gió Hút Khói Sự Cố PCCC',
    thickness: '8mm – 10mm',
    fireRating: 'EI 45 – EI 90',
    framing: 'Ống tôn kẽm + Bông Rockwool + Đai tôn',
    code: 'QCVN 06:2022/BXD',
    slug: 'tam-mgo-boc-ong-gio-pccc',
  },
  {
    application: 'Ống Gió Tăng Áp Cầu Thang Thoát Hiểm',
    thickness: '10mm – 12mm',
    fireRating: 'EI 90 – EI 120',
    framing: 'Ống tôn kẽm + Bông Rockwool + Tấm MGO đôi',
    code: 'QCVN 06:2022/BXD',
    slug: 'tam-mgo-boc-ong-gio-pccc',
  },
  {
    application: 'Vách Ngăn Chống Cháy & Tiêu Âm Karaoke',
    thickness: '10mm – 12mm',
    fireRating: 'EI 60 – EI 90 (STC >52dB)',
    framing: 'Khung thép C75/U76 + Bông khoáng 60kg/m³',
    code: 'TCVN 9311:2012',
    slug: 'tam-mgo-vach-ngan-chong-chay',
  },
  {
    application: 'Tường Ngăn Cháy Lan Nhà Xưởng Kho Hàng',
    thickness: '12mm – 15mm',
    fireRating: 'EI 120 – EI 150',
    framing: 'Khung thép hộp chịu lực + Bông Rockwool',
    code: 'QCVN 06:2022/BXD',
    slug: 'tam-mgo-vach-ngan-chong-chay',
  },
  {
    application: 'Sàn Chịu Lực Nhà Thép Tiền Chế & Gác Lửng',
    thickness: '15mm – 20mm',
    fireRating: 'EI 150 – EI 180 (Tải >600kg/m²)',
    framing: 'Dầm thép I/Hộp + Vít có cánh tự khoan',
    code: 'ASTM C1185',
    slug: 'tam-mgo-san-chiu-luc',
  },
  {
    application: 'Lõi Cánh Cửa Thép & Cửa Gỗ Ngăn Cháy',
    thickness: '5mm – 8mm',
    fireRating: '60 Phút – 120 Phút',
    framing: 'Thép mạ kẽm 1.0mm ép nguội dán tấm MGO',
    code: 'TCVN 9383:2012',
    slug: 'tam-mgo-boc-ong-gio-pccc',
  },
];

export default function ApplicationMatrix() {
  return (
    <section className="py-14 bg-white border-t border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#F26522] uppercase tracking-wider bg-[#FEF3EC] px-3 py-1 rounded-full">
            Bảng Tra Cứu Quy Cách & Giới Hạn Chịu Lửa
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Ma Trận Đối Chiếu Giải Pháp Ứng Dụng MGO
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tra cứu nhanh độ dày tấm và cấp chịu lửa EI tương ứng phục vụ thiết kế bản vẽ và lập dự toán
          </p>
        </div>

        {/* Responsive Table Container */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px] sm:text-xs">
                  <th className="py-4 px-5">Hạng Mục Ứng Dụng</th>
                  <th className="py-4 px-5">Độ Dày MGO</th>
                  <th className="py-4 px-5">Cấp Chịu Lửa (EI)</th>
                  <th className="py-4 px-5">Hệ Kết Cấu Phụ Trợ</th>
                  <th className="py-4 px-5">Tiêu Chuẩn</th>
                  <th className="py-4 px-5 text-right">Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MATRIX_DATA.map((row, idx) => (
                  <tr 
                    key={idx}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70 hover:bg-[#F4F9E8]/40 transition-colors'}
                  >
                    <td className="py-4 px-5 font-bold text-slate-900">
                      {row.application}
                    </td>
                    <td className="py-4 px-5 font-extrabold text-[#5F8A03]">
                      <span className="bg-[#F4F9E8] px-2.5 py-1 rounded-md border border-[#7CB305]/30 whitespace-nowrap">
                        {row.thickness}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-bold text-[#F26522] whitespace-nowrap">
                      {row.fireRating}
                    </td>
                    <td className="py-4 px-5 text-slate-600 font-medium">
                      {row.framing}
                    </td>
                    <td className="py-4 px-5 text-slate-500 font-medium whitespace-nowrap">
                      {row.code}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        href={`/san-pham/${row.slug}`}
                        className="inline-flex items-center gap-1 font-bold text-[#5F8A03] hover:underline whitespace-nowrap"
                      >
                        <span>Xem tấm</span>
                        <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
