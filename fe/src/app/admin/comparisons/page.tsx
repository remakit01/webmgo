'use client';

import React from 'react';
import { Scale, Check, X, Shield, Sparkles } from 'lucide-react';
import AdminHeader from '@/cms/components/AdminHeader';

const COMPARISON_CRITERIA = [
  {
    criteria: 'Cấp độ chống cháy (Euroclass / QCVN 06)',
    mgo: 'Loại A1 (Không cháy, không khói độc)',
    cemboard: 'Loại A2 (Có thể sinh nhiệt lượng)',
    gypsum: 'Loại A2 / B (Dễ gãy vỡ ở 600°C)',
    highlight: true,
  },
  {
    criteria: 'Khả năng kháng ẩm & Ngâm nước',
    mgo: '100% Kháng nước, không mục nở, không rã',
    cemboard: 'Kháng nước trung bình, hút ẩm 15%',
    gypsum: 'Hút nước nhanh, rã nát khi gặp ẩm',
    highlight: true,
  },
  {
    criteria: 'Trọng lượng riêng (Tải trọng lên trần/vách)',
    mgo: '950 kg/m³ (Nhẹ hơn Cemboard ~30%)',
    cemboard: '1350 kg/m³ (Rất nặng, tốn khung)',
    gypsum: '850 kg/m³ (Nhẹ nhưng yếu)',
    highlight: false,
  },
  {
    criteria: 'Khả năng uốn cong & Gia công cắt',
    mgo: 'Dễ cắt bằng dao rọc, không bụi độc',
    cemboard: 'Khó cắt, bụi silic độc hại khi hít',
    gypsum: 'Dễ cắt, độ giòn cao',
    highlight: false,
  },
  {
    criteria: 'Nguy cơ ăn mòn khung thép mạ kẽm',
    mgo: 'Remak MGO không Clorua (Zero Rust)',
    cemboard: 'Ít rỉ sét',
    gypsum: 'Trung bình',
    highlight: true,
  },
];

export default function AdminComparisonsPage() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <AdminHeader 
        title="Quản Lý Dữ Liệu So Sánh Vật Liệu" 
        subtitle="Bảng so sánh kỹ thuật giữa Remak® MGO FireOFF với Tấm Cemboard và Thạch cao chống cháy"
        actionText="Thêm Tiêu Chí So Sánh"
        onAction={() => alert('Thêm tiêu chí so sánh vật liệu')}
      />

      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#A0D911]" />
              Dữ liệu này hiển thị trực tiếp tại trang khách: /so-sanh-vat-lieu
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-1/4">Tiêu Chí Đánh Giá</th>
                  <th className="py-3.5 px-4 w-1/4 bg-[#F4F9E8]/80 text-[#5F8A03]">
                    Remak® MGO FireOFF
                  </th>
                  <th className="py-3.5 px-4 w-1/4">Tấm Xi Măng (Cemboard)</th>
                  <th className="py-3.5 px-4 w-1/4">Thạch Cao Chống Cháy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMPARISON_CRITERIA.map((row, idx) => (
                  <tr key={idx} className={row.highlight ? 'bg-slate-50/40' : ''}>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {row.criteria}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#5F8A03] bg-[#F4F9E8]/30">
                      <div className="flex items-center gap-1.5">
                        <Check size={14} className="text-[#7CB305] shrink-0" />
                        <span>{row.mgo}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {row.cemboard}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {row.gypsum}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
