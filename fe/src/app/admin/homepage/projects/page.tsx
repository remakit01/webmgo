'use client';

import React, { useState, useEffect } from 'react';
import { AdminPage, AdminPageBody } from '@/cms/components/layout/AdminPage';

interface ProjectItem {
  id: string;
  name: string;
  location: string;
  scale: string;
  image: string;
}

const DEFAULT_PROJECTS: { hero: ProjectItem; side: ProjectItem[] } = {
  hero: {
    id: 'samsung-thai-nguyen',
    name: 'Tổ Hợp Nhà Máy Samsung Electronics Thái Nguyên',
    location: 'KCN Yên Bình, Phổ Yên, Thái Nguyên',
    scale: '45.000 m² tấm MGO 10mm & 12mm',
    image: '/images/mgo-duct.jpg',
  },
  side: [
    {
      id: 'lotte-mall-tay-ho',
      name: 'Đại Siêu Thị & Khách Sạn Lotte Mall Tây Hồ',
      location: 'Võ Chí Công, Tây Hồ, Hà Nội',
      scale: '28.000 m² bọc ống gió EI 120',
      image: '/images/mgo-wall.jpg',
    },
    {
      id: 'viettel-idc-hoa-lac',
      name: 'Trung Tâm Dữ Liệu Viettel IDC Hòa Lạc',
      location: 'Khu CNC Hòa Lạc, Thạch Thất, Hà Nội',
      scale: '18.500 m² vách ngăn chống cháy EI 90',
      image: '/images/mgo-floor.jpg',
    }
  ]
};

export default function AdminHomepageProjectsPage() {
  const [projectsData, setProjectsData] = useState(DEFAULT_PROJECTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedP = localStorage.getItem('remak_admin_home_projects');
      if (savedP) setProjectsData(JSON.parse(savedP));
    } catch {
      // Dùng mặc định
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('remak_admin_home_projects', JSON.stringify(projectsData));
      showToast('Đã lưu cấu hình dự án tiêu biểu!');
    } catch (err) {
      alert('Không thể lưu: ' + err);
    }
  };

  const handleReset = () => {
    if (confirm('Khôi phục cấu hình dự án tiêu biểu về mặc định ban đầu?')) {
      setProjectsData(DEFAULT_PROJECTS);
      localStorage.removeItem('remak_admin_home_projects');
      showToast('Đã khôi phục dữ liệu mặc định!');
    }
  };

  return (
    <AdminPage 
        title="Dự Án Tiêu Biểu Trang Chủ" 
        subtitle="Quản trị các công trình tiêu biểu hiển thị ở khối Dự Án trên trang chủ">

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
              Dự Án Tiêu Biểu
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cấu hình khối Dự Án (mục số 8) trên trang chủ — Tin tức quản lý ở mục “Tin Tức Trang Chủ”
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

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Lưu Cấu Hình
            </button>
          </div>
        </div>

        {/* DỰ ÁN TIÊU BIỂU */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 pb-2.5 border-b border-slate-100">
                Dự Án Trọng Điểm Trên Cùng
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tên công trình dự án *</label>
                  <input
                    type="text"
                    value={projectsData.hero.name}
                    onChange={(e) => setProjectsData({ ...projectsData, hero: { ...projectsData.hero, name: e.target.value } })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Địa điểm vị trí *</label>
                  <input
                    type="text"
                    value={projectsData.hero.location}
                    onChange={(e) => setProjectsData({ ...projectsData, hero: { ...projectsData.hero, location: e.target.value } })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Quy mô khối lượng MGO đã cấp *</label>
                  <input
                    type="text"
                    value={projectsData.hero.scale}
                    onChange={(e) => setProjectsData({ ...projectsData, hero: { ...projectsData.hero, scale: e.target.value } })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-[#F26522] focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Đường dẫn ảnh công trình *</label>
                  <input
                    type="text"
                    value={projectsData.hero.image}
                    onChange={(e) => setProjectsData({ ...projectsData, hero: { ...projectsData.hero, image: e.target.value } })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>
              </div>
            </div>

            {/* 2 Dự án phụ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projectsData.side.map((proj, idx) => (
                <div key={proj.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
                  <h5 className="text-xs font-bold text-slate-900">Dự Án Phụ #{idx + 1}</h5>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tên dự án</label>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => {
                        const updated = [...projectsData.side];
                        updated[idx].name = e.target.value;
                        setProjectsData({ ...projectsData, side: updated });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#5F8A03]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Địa điểm</label>
                    <input
                      type="text"
                      value={proj.location}
                      onChange={(e) => {
                        const updated = [...projectsData.side];
                        updated[idx].location = e.target.value;
                        setProjectsData({ ...projectsData, side: updated });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Khối lượng cấp</label>
                    <input
                      type="text"
                      value={proj.scale}
                      onChange={(e) => {
                        const updated = [...projectsData.side];
                        updated[idx].scale = e.target.value;
                        setProjectsData({ ...projectsData, side: updated });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-[#F26522] focus:outline-none focus:border-[#5F8A03]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Đường dẫn ảnh</label>
                    <input
                      type="text"
                      value={proj.image}
                      onChange={(e) => {
                        const updated = [...projectsData.side];
                        updated[idx].image = e.target.value;
                        setProjectsData({ ...projectsData, side: updated });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>


      </AdminPageBody>
    </AdminPage>
  );
}
