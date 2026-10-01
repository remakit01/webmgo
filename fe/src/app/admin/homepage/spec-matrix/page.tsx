'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/cms/components/AdminHeader';

interface SpecItem {
  id: string;
  thickness: string;
  category: 'duct' | 'wall' | 'floor';
  fireRating: string;
  weight: string;
  density: string;
  bending: string;
  application: string;
  price: number;
}

const DEFAULT_SPECS: SpecItem[] = [
  {
    id: 'spec-5',
    thickness: '5mm',
    category: 'duct',
    fireRating: 'EI 30 – 45',
    weight: '14.5 kg',
    density: '1.05 g/cm³',
    bending: '≥ 15 MPa',
    application: 'Bọc ngoài ống gió PCCC, trần thả tiêu âm',
    price: 125000,
  },
  {
    id: 'spec-8',
    thickness: '8mm',
    category: 'duct',
    fireRating: 'EI 45 – 60',
    weight: '23.2 kg',
    density: '1.08 g/cm³',
    bending: '≥ 16 MPa',
    application: 'Ống gió thoát khói sự cố, vách ngăn văn phòng',
    price: 185000,
  },
  {
    id: 'spec-10',
    thickness: '10mm',
    category: 'wall',
    fireRating: 'EI 60 – 90',
    weight: '29.0 kg',
    density: '1.10 g/cm³',
    bending: '≥ 18 MPa',
    application: 'Vách ngăn chống cháy 2 mặt kho xưởng, nhà xưởng',
    price: 245000,
  },
  {
    id: 'spec-12',
    thickness: '12mm',
    category: 'wall',
    fireRating: 'EI 90 – 120',
    weight: '34.8 kg',
    density: '1.12 g/cm³',
    bending: '≥ 20 MPa',
    application: 'Vách ngăn kho xưởng cao cấp, buồng thang thoát nạn',
    price: 315000,
  },
  {
    id: 'spec-15',
    thickness: '15mm',
    category: 'floor',
    fireRating: 'EI 120 – 150',
    weight: '43.5 kg',
    density: '1.15 g/cm³',
    bending: '≥ 22 MPa',
    application: 'Lót sàn gác lửng chịu lực, sàn nâng kỹ thuật MEP',
    price: 420000,
  },
  {
    id: 'spec-18',
    thickness: '18mm',
    category: 'floor',
    fireRating: 'EI 150 – 180',
    weight: '52.2 kg',
    density: '1.18 g/cm³',
    bending: '≥ 25 MPa',
    application: 'Sàn chịu tải trọng nặng công nghiệp, lối thoát nạn',
    price: 540000,
  },
];

function formatPrice(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

export default function AdminSpecMatrixPage() {
  const [specs, setSpecs] = useState<SpecItem[]>(DEFAULT_SPECS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'duct' | 'wall' | 'floor'>('all');
  const [editingItem, setEditingItem] = useState<SpecItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('remak_admin_specs_data');
      if (saved) {
        setSpecs(JSON.parse(saved));
      }
    } catch {
      // Dùng dữ liệu mặc định
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReset = () => {
    if (confirm('Khôi phục danh sách thông số quy cách về mặc định ban đầu?')) {
      setSpecs(DEFAULT_SPECS);
      localStorage.removeItem('remak_admin_specs_data');
      showToast('Đã khôi phục dữ liệu mặc định!');
    }
  };

  const handleDelete = (id: string) => {
    if (specs.length <= 1) {
      alert('Phải giữ lại ít nhất 1 quy cách!');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa quy cách này?')) {
      const updated = specs.filter(s => s.id !== id);
      setSpecs(updated);
      localStorage.setItem('remak_admin_specs_data', JSON.stringify(updated));
      showToast('Đã xóa quy cách thành công!');
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    let updated: SpecItem[];
    if (editingItem.id === 'new') {
      const newItem = { ...editingItem, id: `spec-${Date.now()}` };
      updated = [...specs, newItem];
    } else {
      updated = specs.map(s => s.id === editingItem.id ? editingItem : s);
    }

    setSpecs(updated);
    localStorage.setItem('remak_admin_specs_data', JSON.stringify(updated));
    setIsModalOpen(false);
    setEditingItem(null);
    showToast('Đã lưu thông tin quy cách độ dày!');
  };

  const filteredSpecs = activeFilter === 'all' ? specs : specs.filter(s => s.category === activeFilter);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <AdminHeader 
        title="Quản Lý Bảng Quy Cách Độ Dày" 
        subtitle="Quản trị bảng thông số độ dày (5mm - 18mm), khối lượng, mức độ chịu lửa và đơn giá"
      />

      {/* Thông báo thao tác */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-xs font-semibold border border-slate-700">
          {toastMessage}
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full">
        
        {/* Thanh công cụ xem trước & khôi phục */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Quy Cách & Bảng Giá Tấm MGO
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dữ liệu hiển thị trong bảng tra cứu quy cách ở mục số 4 trên trang chủ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Khôi phục mặc định
            </button>
            <a
              href="/#homepage-spec-matrix"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold transition-colors"
            >
              Xem ngoài trang chủ
            </a>
          </div>
        </div>

        {/* BẢNG THÔNG SỐ VÀ BỘ LỌC */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3 bg-slate-50/60">
            {/* Bộ lọc theo nhóm ứng dụng */}
            <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-lg">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'duct', label: 'Ống gió PCCC' },
                { id: 'wall', label: 'Vách ngăn' },
                { id: 'floor', label: 'Lót sàn' },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id as any)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    activeFilter === f.id ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Nút Thêm Mới */}
            <button
              type="button"
              onClick={() => {
                setEditingItem({
                  id: 'new',
                  thickness: '6mm',
                  category: 'wall',
                  fireRating: 'EI 45',
                  weight: '17.4 kg',
                  density: '1.06 g/cm³',
                  bending: '≥ 15 MPa',
                  application: 'Vách ngăn chống cháy văn phòng tiêu chuẩn',
                  price: 155000,
                });
                setIsModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Thêm Quy Cách Mới
            </button>
          </div>

          {/* Bảng dữ liệu */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Độ Dày</th>
                  <th className="text-left px-4 py-3">Ứng Dụng Đề Xuất</th>
                  <th className="text-left px-4 py-3">Chịu Lửa</th>
                  <th className="text-left px-4 py-3">Khối Lượng</th>
                  <th className="text-left px-4 py-3">Tỷ Trọng</th>
                  <th className="text-left px-4 py-3">Cường Độ</th>
                  <th className="text-right px-4 py-3">Đơn Giá Tấm</th>
                  <th className="text-center px-4 py-3">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSpecs.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">
                      {s.thickness}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-[220px]">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold mr-1.5 ${
                        s.category === 'duct' ? 'bg-orange-100 text-[#F26522]' :
                        s.category === 'wall' ? 'bg-emerald-100 text-[#5F8A03]' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {s.category === 'duct' ? 'Ống gió' : s.category === 'wall' ? 'Vách' : 'Sàn'}
                      </span>
                      {s.application}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-[#F26522] bg-orange-50 px-2 py-0.5 rounded border border-orange-200 text-[11px]">
                        {s.fireRating}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">{s.weight}</td>
                    <td className="px-4 py-3.5 text-slate-500">{s.density}</td>
                    <td className="px-4 py-3.5 font-medium text-[#5F8A03]">{s.bending}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                      {formatPrice(s.price)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(s);
                            setIsModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(s.id)}
                          className="px-2.5 py-1 rounded border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Xóa
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

      {/* CỬA SỔ THÊM / SỬA QUY CÁCH */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-slate-900">
                {editingItem.id === 'new' ? 'Thêm Quy Cách MGO Mới' : `Chỉnh Sửa Độ Dày ${editingItem.thickness}`}
              </h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Độ dày (VD: 8mm) *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.thickness}
                    onChange={(e) => setEditingItem({ ...editingItem, thickness: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Phân loại ứng dụng *</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#5F8A03]"
                  >
                    <option value="duct">Ống gió PCCC</option>
                    <option value="wall">Vách ngăn</option>
                    <option value="floor">Lót sàn chịu lực</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Chịu lửa EI *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.fireRating}
                    onChange={(e) => setEditingItem({ ...editingItem, fireRating: e.target.value })}
                    placeholder="EI 45 – 60"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-[#F26522] focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Giá tham khảo (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Khối lượng *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.weight}
                    onChange={(e) => setEditingItem({ ...editingItem, weight: e.target.value })}
                    placeholder="23.2 kg"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tỷ trọng *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.density}
                    onChange={(e) => setEditingItem({ ...editingItem, density: e.target.value })}
                    placeholder="1.08 g/cm³"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Cường độ uốn *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.bending}
                    onChange={(e) => setEditingItem({ ...editingItem, bending: e.target.value })}
                    placeholder="≥ 16 MPa"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-[#5F8A03] font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Ứng dụng khuyên dùng *</label>
                <input
                  type="text"
                  required
                  value={editingItem.application}
                  onChange={(e) => setEditingItem({ ...editingItem, application: e.target.value })}
                  placeholder="Ống gió thoát khói sự cố, vách ngăn văn phòng..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {editingItem.id === 'new' ? 'Thêm Quy Cách' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
