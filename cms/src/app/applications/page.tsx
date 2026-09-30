'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Flame, 
  Layers, 
  X,
  FileCheck2
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { INITIAL_APPLICATIONS } from '@/lib/mock-data';
import { Application } from '@/types';

export default function ApplicationsManagerPage() {
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Ống Gió',
    eiRating: 'EI 60 - EI 120',
    recommendedThickness: '10mm, 12mm',
    layersCount: 3,
    status: 'published' as 'published' | 'draft',
  });

  const filtered = applications.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.category.toLowerCase().includes(search.toLowerCase()) ||
    a.eiRating.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Xóa giải pháp thi công này?')) {
      setApplications(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleOpenAdd = () => {
    setEditingApp(null);
    setFormData({
      title: '',
      category: 'Ống Gió',
      eiRating: 'EI 60 - EI 120',
      recommendedThickness: '8mm, 10mm',
      layersCount: 3,
      status: 'published',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: Application) => {
    setEditingApp(a);
    setFormData({
      title: a.title,
      category: a.category,
      eiRating: a.eiRating,
      recommendedThickness: a.recommendedThickness,
      layersCount: a.layersCount,
      status: a.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingApp) {
      setApplications(prev => prev.map(a => a.id === editingApp.id ? {
        ...a,
        ...formData,
        updatedAt: new Date().toISOString().split('T')[0]
      } : a));
    } else {
      const newA: Application = {
        id: `app-${Date.now()}`,
        ...formData,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setApplications([newA, ...applications]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header 
        title="Quản Lý Giải Pháp Thi Công MGO Remak®" 
        subtitle="Cấu hình hệ thống bọc ống gió PCCC, vách ngăn chống cháy, sàn chịu lực và bản vẽ CAD." 
      />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm giải pháp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#5F8A03] shadow-2xs"
            />
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Thêm Giải Pháp Mới</span>
          </button>
        </div>

        {/* APPLICATIONS TABLE */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Tên Giải Pháp</th>
                  <th className="p-4">Danh Mục</th>
                  <th className="p-4">Cấp Chống Cháy (EI)</th>
                  <th className="p-4">Độ Dày Khuyến Nghị</th>
                  <th className="p-4 text-center">Số Lớp Cấu Tạo</th>
                  <th className="p-4 text-center">Trạng Thái</th>
                  <th className="p-4 pr-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-900">
                      {a.title}
                    </td>
                    <td className="p-4 font-semibold text-slate-700">
                      {a.category}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF3EC] text-[#F26522]">
                        <Flame size={12} /> {a.eiRating}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700">
                      {a.recommendedThickness}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-800 text-xs">
                        {a.layersCount} Lớp
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        a.status === 'published' 
                          ? 'bg-[#F4F9E8] text-[#5F8A03] border border-[#7CB305]/30' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {a.status === 'published' ? 'Đã Xuất Bản' : 'Bản Nháp'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(a)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-[#5F8A03] transition-colors cursor-pointer"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {editingApp ? 'Chỉnh Sửa Giải Pháp' : 'Thêm Giải Pháp Mới'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên giải pháp *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ví dụ: Bọc Bảo Vệ Ống Gió PCCC EI 120"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5F8A03]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Danh mục</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5F8A03]"
                  >
                    <option value="Ống Gió">Ống Gió</option>
                    <option value="Vách Ngăn">Vách Ngăn</option>
                    <option value="Sàn Nhẹ">Sàn Nhẹ</option>
                    <option value="Cột & Dầm Thép">Cột & Dầm Thép</option>
                    <option value="Cửa Chống Cháy">Cửa Chống Cháy</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cấp EI</label>
                  <input
                    type="text"
                    value={formData.eiRating}
                    onChange={(e) => setFormData({ ...formData, eiRating: e.target.value })}
                    placeholder="EI 60, EI 90, EI 120"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Độ dày khuyến nghị</label>
                  <input
                    type="text"
                    value={formData.recommendedThickness}
                    onChange={(e) => setFormData({ ...formData, recommendedThickness: e.target.value })}
                    placeholder="8mm, 10mm, 12mm"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số lớp cấu tạo</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.layersCount}
                    onChange={(e) => setFormData({ ...formData, layersCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5F8A03]"
                  />
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
                  {editingApp ? 'Cập Nhật' : 'Tạo Giải Pháp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
