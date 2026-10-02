'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminHeader from '@/cms/components/AdminHeader';

interface ProjectItem {
  id: string;
  name: string;
  location: string;
  scale: string;
  image: string;
}

interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  desc?: string;
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

const DEFAULT_NEWS: { hero: NewsItem; side: NewsItem[] } = {
  hero: {
    id: 'qcvn-06-2022',
    title: 'Quy Chuẩn QCVN 06:2022/BXD: Tiêu Chí Nghiệm Thu Ống Gió & Vách Ngăn Chống Cháy',
    category: 'Tiêu Chuẩn PCCC',
    date: '15/09/2026',
    readTime: '5 phút đọc',
    desc: 'Phân tích chi tiết quy trình thử nghiệm đốt mẫu thực tế, giới hạn chịu lửa EI30 – EI120 và điều kiện nghiệm thu tại công trình.',
    image: '/images/mgo-duct.jpg',
  },
  side: [
    {
      id: 'cong-nghe-zero-rust',
      title: 'Công Nghệ Zero Rust: Vì Sao MGO Remak Không Gây Rỉ Sét Tôn Mạ Kẽm?',
      category: 'Kỹ Thuật Vật Liệu',
      date: '08/09/2026',
      readTime: '4 phút đọc',
      image: '/images/mgo-board.jpg',
    },
    {
      id: 'dot-thu-nghiem-ibst',
      title: 'Kết Quả Đốt Thử Nghiệm Thực Tế Hệ Vách MGO Đạt Chuẩn EI 120 Tại Viện IBST',
      category: 'Thử Nghiệm Thực Tế',
      date: '28/08/2026',
      readTime: '6 phút đọc',
      image: '/images/mgo-wall.jpg',
    }
  ]
};

export default function AdminProjectsNewsManagerPage() {
  const [projectsData, setProjectsData] = useState(DEFAULT_PROJECTS);
  const [newsData, setNewsData] = useState(DEFAULT_NEWS);
  const [activeTab, setActiveTab] = useState<'projects' | 'news'>('projects');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedP = localStorage.getItem('remak_admin_home_projects');
      const savedN = localStorage.getItem('remak_admin_home_news');
      if (savedP) setProjectsData(JSON.parse(savedP));
      if (savedN) setNewsData(JSON.parse(savedN));
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
      localStorage.setItem('remak_admin_home_news', JSON.stringify(newsData));
      showToast('Đã lưu cấu hình dự án và tin tức thành công!');
    } catch (err) {
      alert('Không thể lưu: ' + err);
    }
  };

  const handleReset = () => {
    if (confirm('Khôi phục cấu hình dự án & tin tức về mặc định ban đầu?')) {
      setProjectsData(DEFAULT_PROJECTS);
      setNewsData(DEFAULT_NEWS);
      localStorage.removeItem('remak_admin_home_projects');
      localStorage.removeItem('remak_admin_home_news');
      showToast('Đã khôi phục dữ liệu mặc định!');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <AdminHeader 
        title="Quản Lý Dự Án & Tin Tức" 
        subtitle="Quản trị các công trình tiêu biểu và bài viết kỹ thuật PCCC hiển thị trên trang chủ"
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
              Dự Án Tiêu Biểu & Tin Tức PCCC
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cấu hình nội dung cho 2 khối song song tại mục số 8 trên trang chủ
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

        {/* CHUYỂN ĐỔI TAB: DỰ ÁN VS TIN TỨC */}
        <div className="flex items-center gap-2 bg-slate-200/60 p-1 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Khối 1: Dự Án Tiêu Biểu (3 Dự Án)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('news')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'news'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Khối 2: Bài Viết Kỹ Thuật (3 Tin Tức)
          </button>
        </div>

        {/* TAB 1: DỰ ÁN TIÊU BIỂU */}
        {activeTab === 'projects' && (
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
        )}

        {/* TAB 2: TIN TỨC PCCC */}
        {activeTab === 'news' && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 pb-2.5 border-b border-slate-100">
                Bài Viết Nổi Bật Chính
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tiêu đề bài viết *</label>
                  <input
                    type="text"
                    value={newsData.hero.title}
                    onChange={(e) => setNewsData({ ...newsData, hero: { ...newsData.hero, title: e.target.value } })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Chuyên mục bài viết *</label>
                  <input
                    type="text"
                    value={newsData.hero.category}
                    onChange={(e) => setNewsData({ ...newsData, hero: { ...newsData.hero, category: e.target.value } })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Ngày đăng & Thời gian đọc *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newsData.hero.date}
                      onChange={(e) => setNewsData({ ...newsData, hero: { ...newsData.hero, date: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
                    />
                    <input
                      type="text"
                      value={newsData.hero.readTime}
                      onChange={(e) => setNewsData({ ...newsData, hero: { ...newsData.hero, readTime: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Đường dẫn ảnh minh họa *</label>
                  <input
                    type="text"
                    value={newsData.hero.image}
                    onChange={(e) => setNewsData({ ...newsData, hero: { ...newsData.hero, image: e.target.value } })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tóm tắt ngắn bài viết *</label>
                <textarea
                  rows={2}
                  value={newsData.hero.desc || ''}
                  onChange={(e) => setNewsData({ ...newsData, hero: { ...newsData.hero, desc: e.target.value } })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
                />
              </div>
            </div>

            {/* 2 Bài viết phụ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {newsData.side.map((news, idx) => (
                <div key={news.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
                  <h5 className="text-xs font-bold text-slate-900">Bài Viết Phụ #{idx + 1}</h5>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tiêu đề bài viết</label>
                    <input
                      type="text"
                      value={news.title}
                      onChange={(e) => {
                        const updated = [...newsData.side];
                        updated[idx].title = e.target.value;
                        setNewsData({ ...newsData, side: updated });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#5F8A03]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Chuyên mục</label>
                      <input
                        type="text"
                        value={news.category}
                        onChange={(e) => {
                          const updated = [...newsData.side];
                          updated[idx].category = e.target.value;
                          setNewsData({ ...newsData, side: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Ngày đăng</label>
                      <input
                        type="text"
                        value={news.date}
                        onChange={(e) => {
                          const updated = [...newsData.side];
                          updated[idx].date = e.target.value;
                          setNewsData({ ...newsData, side: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Đường dẫn ảnh</label>
                    <input
                      type="text"
                      value={news.image}
                      onChange={(e) => {
                        const updated = [...newsData.side];
                        updated[idx].image = e.target.value;
                        setNewsData({ ...newsData, side: updated });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
