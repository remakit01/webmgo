'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  X, 
  Flame, 
  Boxes,
  Eye
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';
import { Product } from '@/types';

export default function ProductsManagerPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vật Liệu Chống Cháy',
    thickness: '5mm, 8mm, 10mm, 12mm',
    fireRating: 'EI 120 (A1)',
    price: '350.000đ/tấm',
    status: 'active' as 'active' | 'draft',
    stock: 1000,
  });

  const categories = ['all', 'Vật Liệu Chống Cháy', 'Sàn Chịu Lực', 'Cách Âm & Tiêu Âm', 'Bọc Cột Thép', 'Trang Trí Nội Thất'];

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'all' || p.category === selectedCat;
    return matchSearch && matchCat;
  });

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Vật Liệu Chống Cháy',
      thickness: '8mm, 10mm, 12mm',
      fireRating: 'EI 120 (A1)',
      price: '380.000đ/tấm',
      status: 'active',
      stock: 500,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      thickness: p.thickness.join(', '),
      fireRating: p.fireRating,
      price: p.price,
      status: p.status,
      stock: p.stock,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const thList = formData.thickness.split(',').map(s => s.trim()).filter(Boolean);

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        ...formData,
        thickness: thList,
        updatedAt: new Date().toISOString().split('T')[0]
      } : p));
    } else {
      const newP: Product = {
        id: `prod-${Date.now()}`,
        ...formData,
        thickness: thList,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setProducts([newP, ...products]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header 
        title="Quản Lý Sản Phẩm MGO Remak®" 
        subtitle="Thêm, sửa, cập nhật thông số chống cháy A1, độ dày và tình trạng tồn kho sản phẩm." 
      />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
        
        {/* ACTION BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#5F8A03] shadow-2xs"
              />
            </div>

            {/* Category Select */}
            <select
              aria-label="Lọc theo phân loại"
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#5F8A03] cursor-pointer"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'Tất cả phân loại' : c}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Thêm Sản Phẩm Mới</span>
          </button>
        </div>

        {/* PRODUCTS TABLE */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Tên Sản Phẩm</th>
                  <th className="p-4">Phân Loại</th>
                  <th className="p-4">Dải Độ Dày</th>
                  <th className="p-4">Chịu Lửa (EI)</th>
                  <th className="p-4">Giá Tham Khảo</th>
                  <th className="p-4 text-center">Trạng Thái</th>
                  <th className="p-4 pr-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-extrabold text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Mã: {p.id} • Cập nhật: {p.updatedAt}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">
                      {p.category}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {p.thickness.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF3EC] text-[#F26522]">
                        <Flame size={12} /> {p.fireRating}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {p.price}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        p.status === 'active' 
                          ? 'bg-[#F4F9E8] text-[#5F8A03] border border-[#7CB305]/30' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.status === 'active' ? 'Đang Bán' : 'Bản Nháp'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-[#5F8A03] transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Xóa"
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

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {editingProduct ? 'Chỉnh Sửa Sản Phẩm MGO' : 'Thêm Sản Phẩm MGO Mới'}
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
                <label className="block font-bold text-slate-700 mb-1">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Tấm MGO Remak® FireOFF Chống Cháy A1"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5F8A03]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phân loại</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5F8A03]"
                  >
                    <option value="Vật Liệu Chống Cháy">Vật Liệu Chống Cháy</option>
                    <option value="Sàn Chịu Lực">Sàn Chịu Lực</option>
                    <option value="Cách Âm & Tiêu Âm">Cách Âm & Tiêu Âm</option>
                    <option value="Bọc Cột Thép">Bọc Cột Thép</option>
                    <option value="Trang Trí Nội Thất">Trang Trí Nội Thất</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cấp chịu lửa (EI/A1)</label>
                  <input
                    type="text"
                    value={formData.fireRating}
                    onChange={(e) => setFormData({ ...formData, fireRating: e.target.value })}
                    placeholder="EI 30 - EI 180 (A1)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dải độ dày (ngăn cách dấu phẩy)</label>
                <input
                  type="text"
                  value={formData.thickness}
                  onChange={(e) => setFormData({ ...formData, thickness: e.target.value })}
                  placeholder="5mm, 8mm, 10mm, 12mm"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#5F8A03]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá tham khảo</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="280.000đ - 520.000đ/tấm"
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
                    <option value="active">Đang Bán (Active)</option>
                    <option value="draft">Bản Nháp (Draft)</option>
                  </select>
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
                  {editingProduct ? 'Cập Nhật' : 'Tạo Sản Phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
