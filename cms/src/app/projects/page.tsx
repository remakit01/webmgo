'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  MapPin, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Clock, 
  X 
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { INITIAL_PROJECTS } from '@/lib/mock-data';
import { Project } from '@/types';

export default function ProjectsManagerPage() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    investor: '',
    area: '10.000 m²',
    productsUsed: 'Tấm MGO FireOFF 10mm & 12mm',
    year: 2025,
    status: 'completed' as 'completed' | 'ongoing',
  });

  const filtered = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase()) ||
    p.investor.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Xóa dự án này?')) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      ...formData,
    };
    setProjects([newProj, ...projects]);
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header 
        title="Quản Lý Dự Án & Công Trình Tiêu Biểu" 
        subtitle="Hồ sơ năng lực các dự án công nghiệp, trung tâm dữ liệu và nhà máy đã thi công MGO Remak." 
      />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên dự án, vị trí, chủ đầu tư..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#5F8A03] shadow-2xs"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Thêm Dự Án Mới</span>
          </button>
        </div>

        {/* PROJECTS GRID / TABLE */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Tên Dự Án</th>
                  <th className="p-4">Địa Điểm</th>
                  <th className="p-4">Chủ Đầu Tư</th>
                  <th className="p-4">Diện Tích Thi Công</th>
                  <th className="p-4">Sản Phẩm Cung Ứng</th>
                  <th className="p-4 text-center">Trạng Thái</th>
                  <th className="p-4 pr-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 font-extrabold text-slate-900">
                      {p.name}
                    </td>
                    <td className="p-4 text-slate-600 flex items-center gap-1.5">
                      <MapPin size={13} className="text-[#F26522] flex-shrink-0" />
                      <span>{p.location}</span>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      {p.investor}
                    </td>
                    <td className="p-4 font-bold text-[#5F8A03]">
                      {p.area}
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      {p.productsUsed}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        p.status === 'completed'
                          ? 'bg-[#F4F9E8] text-[#5F8A03] border border-[#7CB305]/30'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status === 'completed' ? 'Đã Nghiệm Thu' : 'Đang Thi Công'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Xóa dự án"
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

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Thêm Dự Án Tiêu Biểu Mới</h3>
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
                <label className="block font-bold text-slate-700 mb-1">Tên dự án *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Nhà máy công nghệ bán dẫm Amkor"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5F8A03]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Địa điểm</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Bắc Ninh"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chủ đầu tư</label>
                  <input
                    type="text"
                    required
                    value={formData.investor}
                    onChange={(e) => setFormData({ ...formData, investor: e.target.value })}
                    placeholder="Amkor Technology"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quy mô diện tích</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="15.000 m²"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5F8A03]"
                  >
                    <option value="completed">Đã Nghiệm Thu</option>
                    <option value="ongoing">Đang Thi Công</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sản phẩm cung ứng</label>
                <input
                  type="text"
                  value={formData.productsUsed}
                  onChange={(e) => setFormData({ ...formData, productsUsed: e.target.value })}
                  placeholder="Tấm MGO FireOFF 12mm & Hệ Vách Ngăn Cháy EI 120"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5F8A03]"
                />
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
                  Lưu Dự Án
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
