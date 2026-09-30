'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  Layers, 
  X,
  Flame,
  CheckCircle2
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import { ADMIN_APPLICATIONS, AdminApplication } from '@/lib/admin-data';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<AdminApplication[]>(ADMIN_APPLICATIONS);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AdminApplication | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Vách Ngăn',
    eiRating: 'EI 60 - EI 180',
    recommendedThickness: '10mm, 12mm',
    layersCount: 3,
    status: 'published' as 'published' | 'draft',
  });

  const categories = ['all', 'Ống Gió', 'Vách Ngăn', 'Sàn Nhẹ', 'Cột & Dầm Thép', 'Cửa Chống Cháy'];

  const filtered = applications.filter(app => {
    const matchSearch = app.title.toLowerCase().includes(search.toLowerCase()) || 
                        app.category.toLowerCase().includes(search.toLowerCase()) ||
                        app.eiRating.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'all' || app.category === selectedCat;
    return matchSearch && matchCat;
  });

  const handleDelete = (id: string) => {
    if (confirm('Xóa giải pháp thi công này khỏi hệ thống?')) {
      setApplications(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleOpenAdd = () => {
    setEditingApp(null);
    setFormData({
      title: '',
      category: 'Vách Ngăn',
      eiRating: 'EI 120',
      recommendedThickness: '10mm, 12mm',
      layersCount: 3,
      status: 'published',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (app: AdminApplication) => {
    setEditingApp(app);
    setFormData({
      title: app.title,
      category: app.category,
      eiRating: app.eiRating,
      recommendedThickness: app.recommendedThickness,
      layersCount: app.layersCount,
      status: app.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingApp) {
      setApplications(prev => prev.map(a => a.id === editingApp.id ? {
        ...a,
        title: formData.title,
        category: formData.category,
        eiRating: formData.eiRating,
        recommendedThickness: formData.recommendedThickness,
        layersCount: Number(formData.layersCount),
        status: formData.status,
        updatedAt: new Date().toISOString().split('T')[0],
      } : a));
    } else {
      const newApp: AdminApplication = {
        id: `app-${Date.now()}`,
        title: formData.title,
        category: formData.category,
        eiRating: formData.eiRating,
        recommendedThickness: formData.recommendedThickness,
        layersCount: Number(formData.layersCount),
        status: formData.status,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setApplications(prev => [newApp, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <AdminHeader 
        title="Quản Lý Giải Pháp Thi Công" 
        subtitle="Quản lý chi tiết cấu kiện, định mức kỹ thuật PCCC & hồ sơ quy chuẩn thi công" 
      />

      <div className="p-6 space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm giải pháp theo tên, tiêu chuẩn EI..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white transition-all"
              />
            </div>

            <select
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value)}
              aria-label="Lọc theo nhóm giải pháp"
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#5F8A03]"
            >
              <option value="all">Tất cả nhóm cấu kiện ({applications.length})</option>
              {categories.filter(c => c !== 'all').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Action button */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#7CB305] to-[#5F8A03] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#5F8A03]/20 hover:brightness-105 transition-all"
          >
            <Plus size={16} />
            <span>Thêm Giải Pháp Mới</span>
          </button>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Tên Cấu Kiện / Giải Pháp</th>
                  <th className="py-3.5 px-4">Phân Nhóm</th>
                  <th className="py-3.5 px-4">Chỉ Số Chịu Lửa (EI/R)</th>
                  <th className="py-3.5 px-4">Độ Dày Đề Xuất</th>
                  <th className="py-3.5 px-4 text-center">Số Lớp Thi Công</th>
                  <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#5F8A03] flex items-center justify-center flex-shrink-0 border border-emerald-100 font-bold">
                          <Layers size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{app.title}</div>
                          <div className="text-[11px] text-slate-400 font-mono">Mã: {app.id} • Cập nhật: {app.updatedAt}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                        {app.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200/60 text-[#F26522] font-black text-xs">
                        <Flame size={13} />
                        <span>{app.eiRating}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-800">
                      {app.recommendedThickness}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                        {app.layersCount} lớp
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        app.status === 'published' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {app.status === 'published' ? <CheckCircle2 size={12} /> : null}
                        <span>{app.status === 'published' ? 'Đã Xuất Bản' : 'Bản Nháp'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(app)}
                          className="p-1.5 text-slate-500 hover:text-[#5F8A03] hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa giải pháp"
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
              Không tìm thấy giải pháp nào phù hợp với bộ lọc tìm kiếm.
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
                <Layers className="text-[#5F8A03]" size={20} />
                <span>{editingApp ? 'Chỉnh Sửa Giải Pháp' : 'Thêm Giải Pháp Mới'}</span>
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
                <label className="block font-bold text-slate-700 mb-1">Tên Cấu Kiện / Giải Pháp</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Ví dụ: Bọc Bảo Vệ Ống Gió PCCC (Ductwork FireOFF)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phân Nhóm Cấu Kiện</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03]"
                  >
                    {categories.filter(c => c !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chỉ Số Chịu Lửa (EI/R)</label>
                  <input
                    type="text"
                    required
                    value={formData.eiRating}
                    onChange={e => setFormData({...formData, eiRating: e.target.value})}
                    placeholder="EI 60, EI 90, EI 120"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Độ Dày Đề Xuất</label>
                  <input
                    type="text"
                    required
                    value={formData.recommendedThickness}
                    onChange={e => setFormData({...formData, recommendedThickness: e.target.value})}
                    placeholder="10mm, 12mm, 15mm"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Lớp Thi Công</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.layersCount}
                    onChange={e => setFormData({...formData, layersCount: Number(e.target.value)})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Trạng Thái Hiển Thị</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={formData.status === 'published'}
                      onChange={() => setFormData({...formData, status: 'published'})}
                      className="text-[#5F8A03] focus:ring-[#5F8A03]"
                    />
                    <span className="font-semibold text-slate-700">Xuất bản công khai</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === 'draft'}
                      onChange={() => setFormData({...formData, status: 'draft'})}
                      className="text-[#5F8A03] focus:ring-[#5F8A03]"
                    />
                    <span className="font-semibold text-slate-700">Lưu bản nháp</span>
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
                  {editingApp ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
