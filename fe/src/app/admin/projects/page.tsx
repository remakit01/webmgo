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
  X,
  Building
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import { ADMIN_PROJECTS, AdminProject } from '@/lib/admin-data';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>(ADMIN_PROJECTS);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProj, setEditingProj] = useState<AdminProject | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    investor: '',
    area: '',
    productsUsed: '',
    year: new Date().getFullYear(),
    status: 'completed' as 'completed' | 'ongoing',
  });

  const filtered = projects.filter(proj => {
    const matchSearch = 
      proj.name.toLowerCase().includes(search.toLowerCase()) || 
      proj.investor.toLowerCase().includes(search.toLowerCase()) ||
      proj.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = selectedStatus === 'all' || proj.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const handleDelete = (id: string) => {
    if (confirm('Xóa dự án tiêu biểu này?')) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleOpenAdd = () => {
    setEditingProj(null);
    setFormData({
      name: '',
      location: '',
      investor: '',
      area: '10.000 m²',
      productsUsed: 'Tấm MGO FireOFF 12mm',
      year: new Date().getFullYear(),
      status: 'completed',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proj: AdminProject) => {
    setEditingProj(proj);
    setFormData({
      name: proj.name,
      location: proj.location,
      investor: proj.investor,
      area: proj.area,
      productsUsed: proj.productsUsed,
      year: proj.year,
      status: proj.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProj) {
      setProjects(prev => prev.map(p => p.id === editingProj.id ? {
        ...p,
        name: formData.name,
        location: formData.location,
        investor: formData.investor,
        area: formData.area,
        productsUsed: formData.productsUsed,
        year: Number(formData.year),
        status: formData.status,
      } : p));
    } else {
      const newProj: AdminProject = {
        id: `proj-${Date.now()}`,
        name: formData.name,
        location: formData.location,
        investor: formData.investor,
        area: formData.area,
        productsUsed: formData.productsUsed,
        year: Number(formData.year),
        status: formData.status,
      };
      setProjects(prev => [newProj, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <AdminHeader 
        title="Quản Lý Dự Án Tiêu Biểu" 
        subtitle="Quản lý danh sách các công trình trọng điểm cấp quốc gia, nhà máy và tòa nhà ứng dụng Remak MGO" 
      />

      <div className="p-6 space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm dự án theo tên công trình, chủ đầu tư, vị trí..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white transition-all"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              aria-label="Lọc theo trạng thái dự án"
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#5F8A03]"
            >
              <option value="all">Tất cả tiến độ ({projects.length})</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="ongoing">Đang triển khai</option>
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#7CB305] to-[#5F8A03] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#5F8A03]/20 hover:brightness-105 transition-all"
          >
            <Plus size={16} />
            <span>Thêm Dự Án Mới</span>
          </button>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Tên Công Trình / Dự Án</th>
                  <th className="py-3.5 px-4">Chủ Đầu Tư</th>
                  <th className="py-3.5 px-4">Vị Trí</th>
                  <th className="py-3.5 px-4">Quy Mô / Diện Tích</th>
                  <th className="py-3.5 px-4">Hạng Mục Sử Dụng</th>
                  <th className="py-3.5 px-4 text-center">Tiến Độ</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map(proj => (
                  <tr key={proj.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 font-bold">
                          <Building2 size={18} className="text-[#5F8A03]" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{proj.name}</div>
                          <div className="text-[11px] text-slate-400">Năm hoàn tất: {proj.year}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-800">
                      {proj.investor}
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5 text-xs">
                        <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                        <span>{proj.location}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-800">
                      {proj.area}
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-medium text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {proj.productsUsed}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        proj.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {proj.status === 'completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        <span>{proj.status === 'completed' ? 'Hoàn thành' : 'Đang thi công'}</span>
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(proj)}
                          className="p-1.5 text-slate-500 hover:text-[#5F8A03] hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(proj.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa dự án"
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
              Không tìm thấy dự án nào.
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
                <Building2 className="text-[#5F8A03]" size={20} />
                <span>{editingProj ? 'Chỉnh Sửa Dự Án' : 'Thêm Dự Án Mới'}</span>
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
                <label className="block font-bold text-slate-700 mb-1">Tên Dự Án / Công Trình</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ví dụ: Trung Tâm Dữ Liệu Quốc Gia"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chủ Đầu Tư</label>
                  <input
                    type="text"
                    required
                    value={formData.investor}
                    onChange={e => setFormData({...formData, investor: e.target.value})}
                    placeholder="Tập đoàn Viettel"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vị Trí / Địa Điểm</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    placeholder="Khu CNC Hòa Lạc, Hà Nội"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quy Mô / Diện Tích</label>
                  <input
                    type="text"
                    required
                    value={formData.area}
                    onChange={e => setFormData({...formData, area: e.target.value})}
                    placeholder="24.000 m²"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Năm Thi Công</label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={e => setFormData({...formData, year: Number(e.target.value)})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vật Liệu MGO Được Sử Dụng</label>
                <input
                  type="text"
                  required
                  value={formData.productsUsed}
                  onChange={e => setFormData({...formData, productsUsed: e.target.value})}
                  placeholder="Tấm MGO FireOFF 12mm & Hệ Sàn 18mm"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiến Độ Dự Án</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="completed"
                      checked={formData.status === 'completed'}
                      onChange={() => setFormData({...formData, status: 'completed'})}
                      className="text-[#5F8A03] focus:ring-[#5F8A03]"
                    />
                    <span className="font-semibold text-slate-700">Đã hoàn thành</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="ongoing"
                      checked={formData.status === 'ongoing'}
                      onChange={() => setFormData({...formData, status: 'ongoing'})}
                      className="text-[#5F8A03] focus:ring-[#5F8A03]"
                    />
                    <span className="font-semibold text-slate-700">Đang triển khai</span>
                  </label>
                </div>
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
                  {editingProj ? 'Cập Nhật' : 'Lưu Dự Án'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
