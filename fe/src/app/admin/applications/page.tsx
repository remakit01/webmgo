'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layers, Plus, Edit2, Shield, ExternalLink } from 'lucide-react';
import AdminHeader from '@/cms/components/AdminHeader';
import { INITIAL_APPLICATIONS, Application } from '@/cms/lib/cms-data';

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<Application[]>(INITIAL_APPLICATIONS);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <AdminHeader 
        title="Quản Lý Giải Pháp Thi Công PCCC" 
        subtitle="Hệ thống thi công bọc ống gió, vách ngăn chống cháy, trần và sàn chịu lực đạt chuẩn EI/REI"
        actionText="Thêm Giải Pháp Mới"
        onAction={() => alert('Thêm giải pháp thi công mới')}
      />

      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Tên Giải Pháp</th>
                  <th className="py-3.5 px-4">Phân Loại</th>
                  <th className="py-3.5 px-4">Giới Hạn Chịu Lửa (Mục Tiêu)</th>
                  <th className="py-3.5 px-4">Số Lớp Thi Công</th>
                  <th className="py-3.5 px-4">Cập Nhật</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {apps.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                      <div className="text-[11px] text-slate-400">/{item.slug}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-[#F4F9E8] text-[#5F8A03] border border-[#7CB305]/30">
                        <Shield size={12} /> {item.targetEI}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{item.layersCount} lớp cấu tạo</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {item.updatedAt}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/giai-phap-ung-dung/${item.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title="Xem ngoài Live Web"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#5F8A03] hover:bg-slate-100 cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={15} />
                        </button>
                      </div>
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
