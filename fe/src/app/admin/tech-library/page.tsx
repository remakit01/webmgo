'use client';

import React, { useState } from 'react';
import { 
  FileCode2, 
  Search, 
  Plus, 
  Download, 
  Trash2, 
  Edit2, 
  FileCheck2, 
  FileBox, 
  FileText, 
  X,
  ExternalLink
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import { ADMIN_TECH_DOCS, AdminTechDoc } from '@/lib/admin-data';

export default function AdminTechLibraryPage() {
  const [docs, setDocs] = useState<AdminTechDoc[]>(ADMIN_TECH_DOCS);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<AdminTechDoc | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'ibst' as AdminTechDoc['category'],
    code: '',
    fileSize: '3.5 MB',
  });

  const categories = [
    { id: 'all', label: 'Tất cả tài liệu' },
    { id: 'ibst', label: 'Biên bản thử nghiệm IBST' },
    { id: 'cad', label: 'Bản vẽ CAD / DWG chi tiết' },
    { id: 'iso', label: 'Chứng nhận ISO & QCVN 06' },
    { id: 'catalog', label: 'Catalog & Tài liệu kỹ thuật' },
  ];

  const filtered = docs.filter(doc => {
    const matchSearch = doc.title.toLowerCase().includes(search.toLowerCase()) || doc.code.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'all' || doc.category === selectedCat;
    return matchSearch && matchCat;
  });

  const handleDelete = (id: string) => {
    if (confirm('Xóa tài liệu / hồ sơ kiểm định này?')) {
      setDocs(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleOpenAdd = () => {
    setEditingDoc(null);
    setFormData({
      title: '',
      category: 'ibst',
      code: `DOC-${Date.now().toString().slice(-4)}`,
      fileSize: '4.2 MB',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: AdminTechDoc) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      category: doc.category,
      code: doc.code,
      fileSize: doc.fileSize,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDoc) {
      setDocs(prev => prev.map(d => d.id === editingDoc.id ? {
        ...d,
        title: formData.title,
        category: formData.category,
        code: formData.code,
        fileSize: formData.fileSize,
        updatedAt: new Date().toISOString().split('T')[0],
      } : d));
    } else {
      const newDoc: AdminTechDoc = {
        id: `doc-${Date.now()}`,
        title: formData.title,
        category: formData.category,
        code: formData.code,
        fileSize: formData.fileSize,
        downloads: 0,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setDocs(prev => [newDoc, ...prev]);
    }
    setIsModalOpen(false);
  };

  const getCategoryIcon = (cat: AdminTechDoc['category']) => {
    switch (cat) {
      case 'ibst':
        return <FileCheck2 size={18} className="text-orange-600" />;
      case 'cad':
        return <FileCode2 size={18} className="text-blue-600" />;
      case 'iso':
        return <FileBox size={18} className="text-emerald-600" />;
      case 'catalog':
        return <FileText size={18} className="text-purple-600" />;
    }
  };

  return (
    <>
      <AdminHeader 
        title="Quản Lý Hồ Sơ & Chứng Chỉ IBST" 
        subtitle="Quản lý kho tài liệu kỹ thuật, biên bản thử nghiệm đốt lò IBST, bản vẽ DWG" 
      />

      <div className="p-6 space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tài liệu theo tên, mã hiệu..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white transition-all"
              />
            </div>

            <select
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value)}
              aria-label="Lọc theo loại hồ sơ"
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#5F8A03]"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#7CB305] to-[#5F8A03] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#5F8A03]/20 hover:brightness-105 transition-all"
          >
            <Plus size={16} />
            <span>Tải Lên Hồ Sơ Mới</span>
          </button>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Tên Hồ Sơ / Tài Liệu</th>
                  <th className="py-3.5 px-4">Phân Loại</th>
                  <th className="py-3.5 px-4">Mã Hiệu / Số Công Văn</th>
                  <th className="py-3.5 px-4">Dung Lượng</th>
                  <th className="py-3.5 px-4 text-center">Lượt Tải</th>
                  <th className="py-3.5 px-4">Cập Nhật</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          {getCategoryIcon(doc.category)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{doc.title}</div>
                          <div className="text-[11px] text-slate-400 font-mono">ID: {doc.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider">
                        {doc.category}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-slate-800">
                      {doc.code}
                    </td>

                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {doc.fileSize}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-slate-700 font-bold">
                        <Download size={13} className="text-slate-400" />
                        <span>{doc.downloads.toLocaleString('vi-VN')}</span>
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-500 text-xs">
                      {doc.updatedAt}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(doc)}
                          className="p-1.5 text-slate-500 hover:text-[#5F8A03] hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Sửa thông tin"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa hồ sơ"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              Không tìm thấy hồ sơ kỹ thuật nào.
            </div>
          )}
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileCode2 className="text-[#5F8A03]" size={20} />
                <span>{editingDoc ? 'Chỉnh Sửa Hồ Sơ' : 'Thêm Hồ Sơ Kỹ Thuật Mới'}</span>
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                aria-label="Đóng cửa sổ"
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Hồ Sơ / Tiêu Đề</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Ví dụ: Biên Bản Thử Nghiệm Chịu Lửa EI 120 Ống Gió - IBST"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại Tài Liệu</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as AdminTechDoc['category']})}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03]"
                  >
                    <option value="ibst">Biên bản IBST</option>
                    <option value="cad">Bản vẽ CAD (DWG)</option>
                    <option value="iso">Chứng nhận ISO / QCVN</option>
                    <option value="catalog">Catalog sản phẩm</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã Hiệu / Số Công Văn</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value})}
                    placeholder="IBST-2024-FR-0921"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dung Lượng File Ước Tính</label>
                <input
                  type="text"
                  required
                  value={formData.fileSize}
                  onChange={e => setFormData({...formData, fileSize: e.target.value})}
                  placeholder="4.8 MB"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-all"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#7CB305] to-[#5F8A03] text-white rounded-xl font-bold shadow-md shadow-[#5F8A03]/20 hover:brightness-105 transition-all"
                >
                  {editingDoc ? 'Cập Nhật' : 'Lưu Hồ Sơ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
