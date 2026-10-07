'use client';

import React from 'react';
import { Building2, Plus, Edit2, ExternalLink } from 'lucide-react';
import { AdminPage, AdminPageBody } from '@/cms/components/layout/AdminPage';

const PROJECTS = [
  {
    id: 'proj-1',
    name: 'Nhà Máy Samsung Electronics Yên Phong',
    location: 'KCN Yên Phong, Bắc Ninh',
    scale: '45.000 m² MGO DuctBoard',
    scope: 'Bọc hệ thống ống gió hút khói sự cố EI 120',
    year: '2024 - 2025',
  },
  {
    id: 'proj-2',
    name: 'Trung Tâm Thương Mại Lotte Mall Tây Hồ',
    location: 'Võ Chí Công, Tây Hồ, Hà Nội',
    scale: '28.500 m² Vách ngăn PCCC',
    scope: 'Vách ngăn chống cháy EI 60 và lõi cửa thoát hiểm',
    year: '2023 - 2024',
  },
  {
    id: 'proj-3',
    name: 'Trung Tâm Dữ Liệu Viettel IDC Hòa Lạc',
    location: 'Khu CNC Hòa Lạc, Hà Nội',
    scale: '16.000 m² Sàn chịu tải REI 180',
    scope: 'Sàn nâng kỹ thuật và vách ngăn phân kho máy chủ',
    year: '2025',
  },
];

export default function AdminProjectsPage() {
  return (
    <AdminPage 
        title="Quản Lý Dự Án Tiêu Biểu" 
        subtitle="Hồ sơ công trình trọng điểm quốc gia, nhà máy FDI và TTTM đã sử dụng Remak MGO"
        actionText="Thêm Dự Án Mới"
        onAction={() => alert('Thêm dự án mới')}>

      <AdminPageBody>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Tên Dự Án</th>
                  <th className="py-3.5 px-4">Địa Điểm</th>
                  <th className="py-3.5 px-4">Quy Mô Cung Cấp</th>
                  <th className="py-3.5 px-4">Hạng Mục Ứng Dụng</th>
                  <th className="py-3.5 px-4">Năm Thi Công</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PROJECTS.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Building2 size={16} className="text-[#5F8A03] shrink-0" />
                        <span>{proj.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {proj.location}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#F26522]">{proj.scale}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {proj.scope}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[11px]">
                        {proj.year}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#5F8A03] hover:bg-slate-100 cursor-pointer"
                        title="Chỉnh sửa dự án"
                      >
                        <Edit2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminPageBody>
    </AdminPage>
  );
}
