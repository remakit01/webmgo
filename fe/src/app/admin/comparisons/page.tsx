'use client';

import React, { useState } from 'react';
import { 
  Scale, 
  Search, 
  Edit2, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  X,
  Sparkles
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';

interface ComparisonRow {
  id: string;
  criterion: string;
  remakMgo: string;
  gypsum: string;
  cemboard: string;
  evaluation: 'superior' | 'neutral' | 'moderate';
}

const DEFAULT_COMPARISONS: ComparisonRow[] = [
  {
    id: 'comp-01',
    criterion: 'Tiêu chuẩn chống cháy tối đa',
    remakMgo: 'Không cháy A1, chịu lửa tới 1400°C (EI 180)',
    gypsum: 'Chống cháy A2/B1, chịu nhiệt ~800°C (EI 60-120)',
    cemboard: 'Khó cháy A1, chịu nhiệt ~1000°C (EI 120)',
    evaluation: 'superior'
  },
  {
    id: 'comp-02',
    criterion: 'Khả năng kháng ẩm & chịu nước',
    remakMgo: 'Kháng nước 100%, không phân rã, không ẩm mốc',
    gypsum: 'Dễ trương nở, rã vụn khi gặp nước hoặc độ ẩm cao',
    cemboard: 'Kháng ẩm khá tốt, nhưng hút nước gây tăng tải trọng',
    evaluation: 'superior'
  },
  {
    id: 'comp-03',
    criterion: 'Tải trọng bản thân & độ uốn dẻo',
    remakMgo: 'Trọng lượng nhẹ (0.85-0.95 g/cm³), đàn hồi cao',
    gypsum: 'Khá nặng, giòn, dễ gãy góc khi vận chuyển',
    cemboard: 'Nặng (1.3-1.4 g/cm³), giòn, khó cắt vát mép',
    evaluation: 'superior'
  },
  {
    id: 'comp-04',
    criterion: 'An toàn sức khỏe & môi trường',
    remakMgo: '100% Không Amiăng, không Formaldehyde, VOC = 0',
    gypsum: 'Có thể lẫn tạp chất thạch cao phế phẩm',
    cemboard: 'Nguy cơ lẫn bụi khoáng hoặc amiăng thứ cấp',
    evaluation: 'superior'
  },
  {
    id: 'comp-05',
    criterion: 'Khả năng thi công bọc ống gió PCCC',
    remakMgo: 'Đạt chuẩn kiểm định IBST độc lập chỉ với 1-2 lớp',
    gypsum: 'Cần nhiều lớp dày cồng kềnh, dễ rơi rụng theo thời gian',
    cemboard: 'Nặng trần, chi phí ty treo và giá đỡ tăng 40%',
    evaluation: 'superior'
  },
];

export default function AdminComparisonsPage() {
  const [comparisons, setComparisons] = useState<ComparisonRow[]>(DEFAULT_COMPARISONS);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<ComparisonRow | null>(null);

  const [formData, setFormData] = useState({
    criterion: '',
    remakMgo: '',
    gypsum: '',
    cemboard: '',
  });

  const filtered = comparisons.filter(c => 
    c.criterion.toLowerCase().includes(search.toLowerCase()) ||
    c.remakMgo.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Xóa tiêu chí so sánh này?')) {
      setComparisons(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleOpenAdd = () => {
    setEditingRow(null);
    setFormData({
      criterion: '',
      remakMgo: '',
      gypsum: '',
      cemboard: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (row: ComparisonRow) => {
    setEditingRow(row);
    setFormData({
      criterion: row.criterion,
      remakMgo: row.remakMgo,
      gypsum: row.gypsum,
      cemboard: row.cemboard,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRow) {
      setComparisons(prev => prev.map(c => c.id === editingRow.id ? {
        ...c,
        criterion: formData.criterion,
        remakMgo: formData.remakMgo,
        gypsum: formData.gypsum,
        cemboard: formData.cemboard,
      } : c));
    } else {
      const newRow: ComparisonRow = {
        id: `comp-${Date.now()}`,
        criterion: formData.criterion,
        remakMgo: formData.remakMgo,
        gypsum: formData.gypsum,
        cemboard: formData.cemboard,
        evaluation: 'superior',
      };
      setComparisons(prev => [...prev, newRow]);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <AdminHeader 
        title="Quản Lý Bảng So Sánh Đối Đầu" 
        subtitle="Thiết lập các tiêu chí so sánh giữa Tấm MGO Remak® FireOFF và các vật liệu truyền thống" 
      />

      <div className="p-6 space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tiêu chuẩn, tiêu chí kỹ thuật..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white transition-all"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#7CB305] to-[#5F8A03] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#5F8A03]/20 hover:brightness-105 transition-all"
          >
            <Plus size={16} />
            <span>Thêm Tiêu Chí So Sánh</span>
          </button>
        </div>

        {/* Comparisons Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-1/4">Tiêu Chí Kỹ Thuật</th>
                  <th className="py-3.5 px-4 w-1/3 bg-emerald-50/60 text-[#5F8A03]">
                    <div className="flex items-center gap-1.5 font-black">
                      <Sparkles size={14} />
                      <span>Tấm MGO Remak® FireOFF</span>
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Thạch Cao Chống Cháy</th>
                  <th className="py-3.5 px-4">Tấm Xi Măng / Cemboard</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {row.criterion}
                    </td>

                    <td className="py-4 px-4 bg-emerald-50/30 font-semibold text-[#5F8A03]">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-[#5F8A03] flex-shrink-0 mt-0.5" />
                        <span>{row.remakMgo}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>{row.gypsum}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      <div className="flex items-start gap-2">
                        <XCircle size={15} className="text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>{row.cemboard}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(row)}
                          className="p-1.5 text-slate-500 hover:text-[#5F8A03] hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Sửa tiêu chí"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa tiêu chí"
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
              Không tìm thấy tiêu chí so sánh nào.
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
                <Scale className="text-[#5F8A03]" size={20} />
                <span>{editingRow ? 'Chỉnh Sửa Tiêu Chí' : 'Thêm Tiêu Chí Mới'}</span>
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
                <label className="block font-bold text-slate-700 mb-1">Tên Tiêu Chí Kỹ Thuật</label>
                <input
                  type="text"
                  required
                  value={formData.criterion}
                  onChange={e => setFormData({...formData, criterion: e.target.value})}
                  placeholder="Ví dụ: Khả năng kháng ẩm & chịu nước"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5F8A03] mb-1">Đặc Tính Tấm MGO Remak® FireOFF</label>
                <textarea
                  required
                  rows={2}
                  value={formData.remakMgo}
                  onChange={e => setFormData({...formData, remakMgo: e.target.value})}
                  placeholder="Không cháy A1, chịu nhiệt 1400°C..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Thạch Cao Chống Cháy Truyền Thống</label>
                <textarea
                  required
                  rows={2}
                  value={formData.gypsum}
                  onChange={e => setFormData({...formData, gypsum: e.target.value})}
                  placeholder="Chịu nhiệt ~800°C, dễ rã vụn..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tấm Xi Măng / Cemboard / Calcium Silicate</label>
                <textarea
                  required
                  rows={2}
                  value={formData.cemboard}
                  onChange={e => setFormData({...formData, cemboard: e.target.value})}
                  placeholder="Nặng, giòn, hút nước làm tăng tải trọng trần..."
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
                  {editingRow ? 'Cập Nhật' : 'Lưu Tiêu Chí'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
