'use client';

import React, { useState } from 'react';
import { 
  FileCode2, 
  Search, 
  Plus, 
  Download, 
  Trash2, 
  Edit2, 
  FileText, 
  CheckCircle2, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { INITIAL_TECH_DOCS } from '@/lib/mock-data';
import { TechDoc } from '@/types';

export default function TechLibraryManagerPage() {
  const [docs, setDocs] = useState<TechDoc[]>(INITIAL_TECH_DOCS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'ibst' as 'ibst' | 'cad' | 'iso' | 'catalog',
    code: '',
    fileSize: '5.0 MB',
  });

  const filtered = docs.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || d.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleDelete = (id: string) => {
    if (confirm('Xóa tài liệu kỹ thuật này?')) {
      setDocs(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: TechDoc = {
      id: `doc-${Date.now()}`,
      ...formData,
      downloads: 0,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setDocs([newDoc, ...docs]);
    setIsModalOpen(false);
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'ibst': return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F4F9E8] text-[#5F8A03]">Biên Bản IBST</span>;
      case 'cad': return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Bản Vẽ CAD (DWG)</span>;
      case 'iso': return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Chứng Chỉ QCVN</span>;
      case 'catalog': return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Catalog PDF</span>;
      default: return cat;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header 
        title="Quản Lý Thư Viện Kỹ Thuật & Hồ Sơ Kiểm Định" 
        subtitle="Quản lý các tệp PDF biên bản thử nghiệm đốt lò IBST, bản vẽ CAD và chứng chỉ PCCC." 
      />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
        
        {/* BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tài liệu hoặc mã số..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#5F8A03] shadow-2xs"
              />
            </div>

            <select
              aria-label="Lọc loại tài liệu"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#5F8A03] cursor-pointer"
            >
              <option value="all">Tất cả loại tài liệu</option>
              <option value="ibst">Biên Bản Thử Nghiệm IBST</option>
              <option value="cad">Bản Vẽ CAD DWG</option>
              <option value="iso">Chứng Nhận QCVN 06</option>
              <option value="catalog">Catalog</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Tải Lên Hồ Sơ Mới</span>
          </button>
        </div>

        {/* DOCS TABLE */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Tên Tài Liệu & Tiêu Đề</th>
                  <th className="p-4">Phân Loại</th>
                  <th className="p-4">Mã Hồ Sơ / Bản Vẽ</th>
                  <th className="p-4">Dung Lượng</th>
                  <th className="p-4 text-center">Lượt Tải</th>
                  <th className="p-4">Ngày Cập Nhật</th>
                  <th className="p-4 pr-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <FileText size={17} className="text-[#5F8A03] flex-shrink-0" />
                        <span>{d.title}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {getCategoryLabel(d.category)}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-700">
                      {d.code}
                    </td>
                    <td className="p-4 text-slate-500">
                      {d.fileSize}
                    </td>
                    <td className="p-4 text-center font-bold text-slate-900">
                      {d.downloads.toLocaleString()}
                    </td>
                    <td className="p-4 text-slate-500">
                      {d.updatedAt}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(d.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Xóa tài liệu"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* UPLOAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Tải Lên Hồ Sơ / Bản Vẽ Mới</h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề tài liệu *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ví dụ: Biên bản thử nghiệm đốt lò vách EI 90"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5F8A03]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại tài liệu</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5F8A03]"
                  >
                    <option value="ibst">Biên Bản Thử Nghiệm IBST</option>
                    <option value="cad">Bản Vẽ CAD (DWG)</option>
                    <option value="iso">Chứng Chỉ QCVN 06</option>
                    <option value="catalog">Catalog</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã tài liệu / Số hiệu</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="IBST-2024-..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tệp đính kèm (PDF, DWG, ZIP)</label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-[#5F8A03] transition-colors cursor-pointer bg-slate-50">
                  <Download size={22} className="mx-auto text-slate-400 mb-1" />
                  <span className="text-xs text-slate-600 block">Kéo thả tệp hoặc bấm vào đây để chọn</span>
                  <span className="text-[10px] text-slate-400">Dung lượng tối đa: 50MB</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Lưu Tài Liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
