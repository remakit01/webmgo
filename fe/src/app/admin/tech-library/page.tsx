'use client';

import React, { useState } from 'react';
import { FileCode2, Download, Plus, FileText, CheckCircle2 } from 'lucide-react';
import AdminHeader from '@/cms/components/AdminHeader';
import { INITIAL_TECH_DOCS, TechDocument } from '@/cms/lib/cms-data';

export default function AdminTechLibraryPage() {
  const [docs, setDocs] = useState<TechDocument[]>(INITIAL_TECH_DOCS);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <AdminHeader 
        title="Quản Lý Thư Viện Kỹ Thuật & Hồ Sơ PCCC IBST" 
        subtitle="Quản lý hồ sơ thử nghiệm, chứng chỉ chống cháy A1, bản vẽ CAD DWG và tài liệu kỹ thuật"
        actionText="Tải Lên Hồ Sơ Mới"
        onAction={() => alert('Tải lên tài liệu kỹ thuật / chứng chỉ mới')}
      />

      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Tên Tài Liệu & Mã Hồ Sơ</th>
                  <th className="py-3.5 px-4">Định Dạng / Kích Thước</th>
                  <th className="py-3.5 px-4">Phân Loại</th>
                  <th className="py-3.5 px-4">Lượt Tải</th>
                  <th className="py-3.5 px-4">Cập Nhật</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <FileText size={16} className="text-[#5F8A03] shrink-0" />
                        <span>{doc.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">Mã: {doc.code}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800">{doc.fileType}</span>
                      <span className="text-slate-400 ml-1.5">({doc.fileSize})</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#F4F9E8] text-[#5F8A03] border border-[#7CB305]/30">
                        {doc.category === 'test_report' && 'Biên bản thử nghiệm'}
                        {doc.category === 'cad' && 'Bản vẽ CAD DWG'}
                        {doc.category === 'certificate' && 'Chứng chỉ PCCC'}
                        {doc.category === 'catalog' && 'Catalogue kỹ thuật'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Download size={13} className="text-slate-400" />
                        <span>{doc.downloads.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {doc.updatedAt}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => alert(`Tải file demo: ${doc.title}`)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#5F8A03] hover:text-white text-slate-700 text-xs font-bold transition-all cursor-pointer"
                      >
                        Tải Về
                      </button>
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
