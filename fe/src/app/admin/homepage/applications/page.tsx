'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/cms/components/AdminHeader';

interface AppItem {
  id: string;
  category: 'duct' | 'wall' | 'floor' | 'door';
  title: string;
  desc: string;
  thickness: string;
  badge: string;
  img: string;
  link: string;
}

const DEFAULT_APPS: AppItem[] = [
  {
    id: 'app-1',
    category: 'duct',
    title: 'Ống Gió EI 30',
    desc: 'Tấm 5mm kết hợp bông khoáng 25mm. Phù hợp ống gió tầng hầm, hành lang thoát hiểm.',
    thickness: '5mm',
    badge: 'EI 30',
    img: '/images/mgo-duct.jpg',
    link: '/giai-phap-ung-dung#boc-ong-gio',
  },
  {
    id: 'app-2',
    category: 'duct',
    title: 'Ống Gió EI 60',
    desc: 'Tấm 8mm kết hợp bông khoáng 50mm. Tiêu chuẩn phổ biến cho hệ thống PCCC tòa nhà.',
    thickness: '8mm',
    badge: 'EI 60',
    img: '/images/mgo-duct.jpg',
    link: '/giai-phap-ung-dung#boc-ong-gio',
  },
  {
    id: 'app-3',
    category: 'duct',
    title: 'Ống Gió EI 120',
    desc: 'Tấm 12mm kết hợp bông khoáng 100mm. Yêu cầu kỹ thuật cao cho bệnh viện, khách sạn.',
    thickness: '12mm',
    badge: 'EI 120',
    img: '/images/mgo-duct.jpg',
    link: '/giai-phap-ung-dung#boc-ong-gio',
  },
  {
    id: 'app-4',
    category: 'wall',
    title: 'Vách Đơn EI 60',
    desc: '2 lớp tấm 10mm kết hợp khung thép C75. Khả năng cách âm 42dB và kháng ẩm 100%.',
    thickness: '10mm × 2',
    badge: 'EI 60',
    img: '/images/mgo-wall.jpg',
    link: '/giai-phap-ung-dung#vach-chong-chay',
  },
  {
    id: 'app-5',
    category: 'wall',
    title: 'Vách Đôi EI 120',
    desc: '2 lớp tấm 12mm hai mặt kết hợp bông khoáng 50mm. Cách âm 52dB, chịu lửa 2 giờ.',
    thickness: '12mm × 4',
    badge: 'EI 120',
    img: '/images/mgo-wall.jpg',
    link: '/giai-phap-ung-dung#vach-chong-chay',
  },
  {
    id: 'app-6',
    category: 'floor',
    title: 'Sàn Lửng Chịu Tải 15mm',
    desc: 'Tấm 15mm chịu tải trọng tĩnh 600kg/m². Chống trơn trượt, thi công nhanh gọn.',
    thickness: '15mm',
    badge: 'Tải 600kg',
    img: '/images/mgo-floor.jpg',
    link: '/giai-phap-ung-dung#lot-san',
  },
  {
    id: 'app-7',
    category: 'door',
    title: 'Lõi Cửa Thép Chống Cháy EI 90',
    desc: 'Tấm 10mm định hình chịu nhiệt 90 phút ngăn lửa cháy lan giữa các buồng phòng.',
    thickness: '10mm',
    badge: 'EI 90',
    img: '/images/mgo-board.jpg',
    link: '/giai-phap-ung-dung#loi-cua',
  },
];

export default function AdminApplicationsManagerPage() {
  const [apps, setApps] = useState<AppItem[]>(DEFAULT_APPS);
  const [activeCategory, setActiveCategory] = useState<'all' | 'duct' | 'wall' | 'floor' | 'door'>('all');
  const [editingItem, setEditingItem] = useState<AppItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('remak_admin_apps_data');
      if (saved) {
        setApps(JSON.parse(saved));
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
    if (confirm('Khôi phục danh sách ứng dụng về mặc định ban đầu?')) {
      setApps(DEFAULT_APPS);
      localStorage.removeItem('remak_admin_apps_data');
      showToast('Đã khôi phục dữ liệu mặc định!');
    }
  };

  const handleDelete = (id: string) => {
    if (apps.length <= 1) {
      alert('Phải giữ lại ít nhất 1 giải pháp ứng dụng!');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa giải pháp này?')) {
      const updated = apps.filter(a => a.id !== id);
      setApps(updated);
      localStorage.setItem('remak_admin_apps_data', JSON.stringify(updated));
      showToast('Đã xóa giải pháp thành công!');
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    let updated: AppItem[];
    if (editingItem.id === 'new') {
      const newItem = { ...editingItem, id: `app-${Date.now()}` };
      updated = [...apps, newItem];
    } else {
      updated = apps.map(a => a.id === editingItem.id ? editingItem : a);
    }

    setApps(updated);
    localStorage.setItem('remak_admin_apps_data', JSON.stringify(updated));
    setIsModalOpen(false);
    setEditingItem(null);
    showToast('Đã lưu giải pháp ứng dụng!');
  };

  const filteredApps = activeCategory === 'all' ? apps : apps.filter(a => a.category === activeCategory);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <AdminHeader 
        title="Quản Lý Giải Pháp Ứng Dụng" 
        subtitle="Quản trị các giải pháp thi công: Bọc ống gió, Vách chống cháy, Lót sàn và Lõi cửa thép"
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
              Giải Pháp Thi Công Thực Tế
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Danh sách các giải pháp hiển thị tại mục số 6 trên trang chủ
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

        {/* BỘ LỌC PHÂN LOẠI & NÚT THÊM MỚI */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-slate-200/60 p-1 rounded-lg">
            {[
              { id: 'all', label: 'Tất cả', count: apps.length },
              { id: 'duct', label: 'Bọc Ống Gió PCCC', count: apps.filter(a => a.category === 'duct').length },
              { id: 'wall', label: 'Vách Chống Cháy', count: apps.filter(a => a.category === 'wall').length },
              { id: 'floor', label: 'Lót Sàn Chịu Tải', count: apps.filter(a => a.category === 'floor').length },
              { id: 'door', label: 'Lõi Cửa Thép', count: apps.filter(a => a.category === 'door').length },
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveCategory(f.id as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === f.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{f.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeCategory === f.id ? 'bg-slate-100 text-slate-700 font-bold' : 'text-slate-400'
                }`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingItem({
                id: 'new',
                category: 'wall',
                title: 'Vách Ngăn Kho Xưởng EI 150',
                desc: 'Hệ 4 lớp tấm 15mm kết hợp bông khoáng 100mm. Chống cháy ngăn kho 2.5 giờ.',
                thickness: '15mm × 4',
                badge: 'EI 150',
                img: '/images/mgo-wall.jpg',
                link: '/giai-phap-ung-dung#vach-chong-chay',
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Thêm Giải Pháp Mới
          </button>
        </div>

        {/* DANH SÁCH THẺ GIẢI PHÁP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredApps.map((app) => (
            <div 
              key={app.id} 
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                  <img 
                    src={app.img} 
                    alt={app.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[11px] font-bold bg-[#F26522] text-white shadow-xs">
                    {app.badge}
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white">
                    {app.thickness}
                  </span>
                </div>

                <div className="p-4 space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{app.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{app.desc}</p>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="p-3.5 pt-0 border-t border-slate-100 flex items-center justify-between mt-1">
                <span className="text-[11px] text-slate-400 font-medium">
                  {app.category === 'duct' ? 'Ống gió' : app.category === 'wall' ? 'Vách ngăn' : app.category === 'floor' ? 'Sàn lửng' : 'Cửa thép'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(app);
                      setIsModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(app.id)}
                    className="px-2.5 py-1 rounded border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* CỬA SỔ THÊM / SỬA GIẢI PHÁP */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-slate-900">
                {editingItem.id === 'new' ? 'Thêm Giải Pháp MGO Mới' : `Chỉnh Sửa: ${editingItem.title}`}
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
                  <label className="text-xs font-bold text-slate-700">Tên giải pháp *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    placeholder="VD: Ống Gió EI 60"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nhóm ứng dụng *</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#5F8A03]"
                  >
                    <option value="duct">Bọc Ống Gió PCCC</option>
                    <option value="wall">Vách Chống Cháy</option>
                    <option value="floor">Lót Sàn Chịu Tải</option>
                    <option value="door">Lõi Cửa Thép</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tiêu chuẩn chịu lửa / Tải trọng *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.badge}
                    onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                    placeholder="EI 60 hoặc Tải 600kg"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-[#F26522] focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Độ dày tấm đề xuất *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.thickness}
                    onChange={(e) => setEditingItem({ ...editingItem, thickness: e.target.value })}
                    placeholder="8mm hoặc 10mm × 2"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Đường dẫn ảnh minh họa *</label>
                <input
                  type="text"
                  required
                  value={editingItem.img}
                  onChange={(e) => setEditingItem({ ...editingItem, img: e.target.value })}
                  placeholder="/images/mgo-duct.jpg"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mô tả cấu tạo & quy chuẩn thi công *</label>
                <textarea
                  rows={2}
                  required
                  value={editingItem.desc}
                  onChange={(e) => setEditingItem({ ...editingItem, desc: e.target.value })}
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
                  {editingItem.id === 'new' ? 'Thêm Giải Pháp' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
