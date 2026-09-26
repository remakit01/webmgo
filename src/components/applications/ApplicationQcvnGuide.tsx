'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';

const QCVN_RULES = [
  {
    id: 'duct',
    category: 'Hệ Ống Gió PCCC',
    items: [
      {
        location: 'Ống hút khói hành lang, hầm',
        codeClause: 'Bảng B.1 – QCVN 06',
        requiredEI: 'EI 45 – EI 60',
        solution: 'MGO Remak® 8mm + Rockwool 50mm (60kg/m³)',
        slug: 'boc-ong-gio-chong-chay-pccc',
      },
      {
        location: 'Trục ống đứng xuyên khoang cháy',
        codeClause: 'Mục 5.12 – QCVN 06',
        requiredEI: 'EI 120',
        solution: 'MGO Remak® 10-12mm + Rockwool 50mm (80kg/m³)',
        slug: 'boc-ong-gio-chong-chay-pccc',
      },
      {
        location: 'Ống cấp khí tươi & tăng áp thang',
        codeClause: 'Mục D.9 – QCVN 06',
        requiredEI: 'EI 30 – EI 45',
        solution: 'MGO Remak® 5-8mm dán trực tiếp tôn ống',
        slug: 'boc-ong-gio-chong-chay-pccc',
      },
    ],
  },
  {
    id: 'wall',
    category: 'Vách Ngăn Cháy Lan',
    items: [
      {
        location: 'Vách hành lang thoát nạn, phòng kỹ thuật',
        codeClause: 'Bảng 4 – QCVN 06',
        requiredEI: 'EI 45 – EI 60',
        solution: 'Khung C75 + 2 mặt MGO 10mm + Rockwool 50mm',
        slug: 'vach-ngan-chong-chay-karaoke-bar',
      },
      {
        location: 'Phòng hát Karaoke, Bar, vũ trường',
        codeClause: 'TT 147/2020 & QCVN 06',
        requiredEI: 'EI 60 – 90 (STC >52dB)',
        solution: 'Vách đôi MGO 10-12mm + Rockwool cách âm',
        slug: 'vach-ngan-chong-chay-karaoke-bar',
      },
      {
        location: 'Tường ngăn khoang cháy nhà xưởng',
        codeClause: 'Bảng 1 – Tường Loại 1',
        requiredEI: 'EI 120 – EI 150',
        solution: 'Khung thép hộp + 2 mặt MGO 12-15mm + Rockwool',
        slug: 'vach-tran-nha-xuong-cong-nghiep',
      },
    ],
  },
  {
    id: 'floor',
    category: 'Sàn & Cửa Ngăn Cháy',
    items: [
      {
        location: 'Sàn chịu lực nhà thép, gác lửng',
        codeClause: 'Bảng 4 – Sàn bậc II',
        requiredEI: 'REI 60 – REI 180',
        solution: 'Tấm sàn MGO 18mm hoặc 20mm (uốn >22 MPa)',
        slug: 'san-chieu-luc-nha-thep-tien-che',
      },
      {
        location: 'Cửa thoát nạn buồng thang, phòng KT',
        codeClause: 'Mục 2.4 – Cửa Loại 1 & 2',
        requiredEI: 'EI 60 – EI 90',
        solution: 'Lõi MGO phẳng 5-8mm dán mặt thép mạ điện',
        slug: 'loi-cua-chong-chay',
      },
    ],
  },
];

export default function ApplicationQcvnGuide() {
  const [activeTab, setActiveTab] = useState('duct');

  const currentGroup = QCVN_RULES.find((g) => g.id === activeTab) || QCVN_RULES[0];

  return (
    <section className="py-12 bg-slate-50 border-t border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Tra Cứu Quy Chuẩn PCCC QCVN 06:2022/BXD
          </h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {QCVN_RULES.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#5F8A03] text-white border-[#5F8A03] shadow-md shadow-[#5F8A03]/25 scale-[1.02]'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {tab.category}
              </button>
            );
          })}
        </div>

        {/* Rules Table */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase text-[11px] sm:text-xs">
                  <th className="py-4 px-5">Vị Trí Cấu Kiện / Công Trình</th>
                  <th className="py-4 px-5">Điều Khoản Quy Chuẩn</th>
                  <th className="py-4 px-5">Giới Hạn Bắt Buộc</th>
                  <th className="py-4 px-5">Giải Pháp Tấm MGO Khuyên Dùng</th>
                  <th className="py-4 px-5 text-right">Xem Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentGroup.items.map((item, idx) => (
                  <tr 
                    key={idx}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60 hover:bg-[#F4F9E8]/30 transition-colors'}
                  >
                    <td className="py-4 px-5 font-bold text-slate-900">
                      {item.location}
                    </td>
                    <td className="py-4 px-5 text-slate-500 font-medium whitespace-nowrap">
                      {item.codeClause}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md bg-[#FEF3EC] text-[#F26522] font-bold border border-[#F26522]/30">
                        {item.requiredEI}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-800 font-semibold">
                      {item.solution}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        href={`/ung-dung/${item.slug}`}
                        className="inline-flex items-center gap-1 font-bold text-[#5F8A03] hover:underline whitespace-nowrap"
                      >
                        <span>Chi tiết</span>
                        <ChevronRight size={14} />
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
