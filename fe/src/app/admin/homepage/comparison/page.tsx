'use client';

import React, { useState, useEffect } from 'react';
import { AdminPage, AdminPageBody } from '@/cms/components/layout/AdminPage';

interface ComparisonRow {
  id: string;
  feature: string;
  mgoRemak: string;
  cemboard: string;
  gypsum: string;
}

const DEFAULT_COMPARISONS: ComparisonRow[] = [
  {
    id: 'row-1',
    feature: 'Khả năng chống cháy',
    mgoRemak: 'Chuẩn A1 (1.200°C) – Không bắt lửa, không sinh khói độc',
    cemboard: 'Chống cháy A1 – Không bắt lửa nhưng dẫn nhiệt cao',
    gypsum: 'Chống cháy chậm – Mủn nát sau 60-120 phút tiếp xúc lửa',
  },
  {
    id: 'row-2',
    feature: 'Kháng nước & độ ẩm',
    mgoRemak: 'Kháng nước 100% – Độ trương nở 0%, ngâm nước không mủn',
    cemboard: 'Kháng ẩm khá – Ngậm nước nặng, lâu khô, dễ ố vàng mốc',
    gypsum: 'Kém – Bở vụn và phân rã hoàn toàn khi ngấm nước',
  },
  {
    id: 'row-3',
    feature: 'Trọng lượng vật liệu',
    mgoRemak: 'Nhẹ hơn 30% so với Cemboard – Giảm tải trọng kết cấu',
    cemboard: 'Nặng (1.35 - 1.45 g/cm³) – Đòi hỏi hệ khung xương dày đặc',
    gypsum: 'Nhẹ – Dễ thi công nhưng độ cứng cáp và chịu lực kém',
  },
  {
    id: 'row-4',
    feature: 'Ăn mòn kim loại & đinh vít',
    mgoRemak: 'Không ăn mòn – Công nghệ MgSO₄ gốc Sulfate tinh khiết',
    cemboard: 'Kiềm tính cao – Đòi hỏi đinh vít mạ kẽm chuyên dụng chống rỉ',
    gypsum: 'Trung tính – Không ăn mòn đinh vít thông thường',
  },
  {
    id: 'row-5',
    feature: 'Kháng mối mọt & côn trùng',
    mgoRemak: 'Tuyệt đối 100% – 100% khoáng vô cơ không chứa xenlulozo',
    cemboard: 'Kháng tốt – Thành phần xi măng và cát thạch anh',
    gypsum: 'Dễ nấm mốc – Lớp giấy mặt dễ bị mối mọt đục khoét',
  },
  {
    id: 'row-6',
    feature: 'An toàn sinh thái & sức khỏe',
    mgoRemak: '0% Amiăng, không phát thải độc hại – An toàn cho phòng sạch & y tế',
    cemboard: 'Cần kiểm tra kỹ chứng chỉ amiăng khi nhập khẩu',
    gypsum: 'An toàn – Không phát thải độc hại trong điều kiện khô ráo',
  }
];

export default function AdminComparisonManagerPage() {
  const [comparisons, setComparisons] = useState<ComparisonRow[]>(DEFAULT_COMPARISONS);
  const [editingItem, setEditingItem] = useState<ComparisonRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('remak_admin_comparison_data');
      if (saved) {
        setComparisons(JSON.parse(saved));
      }
    } catch {
      // Dùng mặc định
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReset = () => {
    if (confirm('Khôi phục bảng so sánh vật liệu về mặc định ban đầu?')) {
      setComparisons(DEFAULT_COMPARISONS);
      localStorage.removeItem('remak_admin_comparison_data');
      showToast('Đã khôi phục dữ liệu mặc định!');
    }
  };

  const handleDelete = (id: string) => {
    if (comparisons.length <= 1) {
      alert('Phải giữ lại ít nhất 1 tiêu chí so sánh!');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa tiêu chí so sánh này?')) {
      const updated = comparisons.filter(c => c.id !== id);
      setComparisons(updated);
      localStorage.setItem('remak_admin_comparison_data', JSON.stringify(updated));
      showToast('Đã xóa tiêu chí so sánh!');
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    let updated: ComparisonRow[];
    if (editingItem.id === 'new') {
      const newItem = { ...editingItem, id: `row-${Date.now()}` };
      updated = [...comparisons, newItem];
    } else {
      updated = comparisons.map(c => c.id === editingItem.id ? editingItem : c);
    }

    setComparisons(updated);
    localStorage.setItem('remak_admin_comparison_data', JSON.stringify(updated));
    setIsModalOpen(false);
    setEditingItem(null);
    showToast('Đã lưu tiêu chí so sánh!');
  };

  return (
    <AdminPage 
        title="Quản Lý So Sánh Vật Liệu" 
        subtitle="Quản trị bảng so sánh kỹ thuật giữa MGO Remak, tấm xi măng Cemboard và tấm thạch cao">

      {/* Thông báo thao tác */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-xs font-semibold border border-slate-700">
          {toastMessage}
        </div>
      )}

      <AdminPageBody>
        
        {/* Thanh công cụ xem trước & khôi phục */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Bảng So Sánh Các Loại Vật Liệu
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dữ liệu hiển thị trong khối so sánh tại mục số 5 trên trang chủ
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
          </div>
        </div>

        {/* BẢNG SO SÁNH */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3 bg-slate-50/60">
            <div className="text-xs font-bold text-slate-700">
              Tổng số {comparisons.length} tiêu chí so sánh
            </div>
            
            <button
              type="button"
              onClick={() => {
                setEditingItem({
                  id: 'new',
                  feature: 'Tiêu chuẩn nghiệm thu PCCC',
                  mgoRemak: 'Đạt kiểm định IBST theo QCVN 06:2022/BXD',
                  cemboard: 'Khó nghiệm thu ống gió chống cháy do độ dẫn nhiệt cao',
                  gypsum: 'Chỉ phù hợp vách ngăn thông thường trong nhà',
                });
                setIsModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Thêm Tiêu Chí So Sánh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider">
                  <th className="text-left px-4 py-3 text-slate-600 bg-slate-50 w-[22%]">
                    Tiêu Chí Đánh Giá
                  </th>
                  <th className="text-left px-4 py-3 text-white bg-[#5F8A03] w-[32%]">
                    Tấm MGO Remak®
                  </th>
                  <th className="text-left px-4 py-3 text-slate-600 bg-slate-50 w-[23%]">
                    Tấm Xi Măng Cemboard
                  </th>
                  <th className="text-left px-4 py-3 text-slate-600 bg-slate-50 w-[23%]">
                    Tấm Thạch Cao
                  </th>
                  <th className="text-center px-3 py-3 text-slate-500 bg-slate-50">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {comparisons.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900 align-top">
                      {row.feature}
                    </td>
                    <td className="px-4 py-3.5 bg-[#F4F9E8]/60 border-x border-[#5F8A03]/20 align-top font-semibold text-slate-900 leading-relaxed">
                      {row.mgoRemak}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 align-top leading-relaxed">
                      {row.cemboard}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 align-top leading-relaxed">
                      {row.gypsum}
                    </td>
                    <td className="px-3 py-3.5 text-center align-top">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(row);
                            setIsModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
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

      </AdminPageBody>

      {/* CỬA SỔ THÊM / SỬA TIÊU CHÍ */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-slate-900">
                {editingItem.id === 'new' ? 'Thêm Tiêu Chí So Sánh Mới' : `Chỉnh Sửa: ${editingItem.feature}`}
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
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tên tiêu chí so sánh *</label>
                <input
                  type="text"
                  required
                  value={editingItem.feature}
                  onChange={(e) => setEditingItem({ ...editingItem, feature: e.target.value })}
                  placeholder="Ví dụ: Khả năng chống cháy, Kháng nước..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#5F8A03]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5F8A03]">Đặc tính của Tấm MGO Remak® *</label>
                <textarea
                  rows={2}
                  required
                  value={editingItem.mgoRemak}
                  onChange={(e) => setEditingItem({ ...editingItem, mgoRemak: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#5F8A03]/50 bg-[#F4F9E8]/30 text-xs focus:outline-none focus:border-[#5F8A03]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Đặc tính của Cemboard (Xi măng) *</label>
                <textarea
                  rows={2}
                  required
                  value={editingItem.cemboard}
                  onChange={(e) => setEditingItem({ ...editingItem, cemboard: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Đặc tính của Thạch Cao *</label>
                <textarea
                  rows={2}
                  required
                  value={editingItem.gypsum}
                  onChange={(e) => setEditingItem({ ...editingItem, gypsum: e.target.value })}
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
                  {editingItem.id === 'new' ? 'Thêm Tiêu Chí' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AdminPage>
  );
}
