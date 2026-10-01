'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminHeader from '@/cms/components/AdminHeader';

interface HeroData {
  title: string;
  subtitle: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  cta1Text: string;
  cta1Link: string;
  cta2Text: string;
  cta2Link: string;
  trustCards: {
    id: number;
    value: string;
    label: string;
    sublabel: string;
    accentColor: string;
  }[];
}

const DEFAULT_HERO_DATA: HeroData = {
  title: 'Tấm Chống Cháy MGO Remak®',
  subtitle: 'Bảo vệ kết cấu phòng cháy chữa cháy chuyên sâu',
  paragraph1: 'Khoáng vô cơ Magie Oxit chịu lửa 1.200°C, kháng ẩm tuyệt đối và chống ăn mòn. Đốt thử nghiệm đạt chuẩn kiểm định IBST cho ống gió, vách ngăn và sàn chịu tải.',
  paragraph2: 'Sản xuất từ MgO gốc Sulfate (MgSO₄) — loại bỏ hoàn toàn ăn mòn vít ốc và hiện tượng "chảy nước" mùa nồm ẩm của MGO gốc Clorua truyền thống. Nhẹ hơn Cemboard 30%, dễ cắt khoan, không chứa Amiăng, an toàn tuyệt đối.',
  paragraph3: 'Ứng dụng: bọc ống gió PCCC, vách ngăn chống cháy, lót sàn chịu tải và lõi cửa thép. Đạt chuẩn PCCC QCVN 06:2022/BXD, hồ sơ nghiệm thu đầy đủ.',
  cta1Text: 'Nhận Mẫu Thử Miễn Phí',
  cta1Link: '/nhan-mau-thu',
  cta2Text: 'Dự Toán Khối Lượng',
  cta2Link: '#du-toan',
  trustCards: [
    { id: 1, value: '1.200°C', label: 'Chịu nhiệt', sublabel: 'Chống Cháy A1', accentColor: '#F26522' },
    { id: 2, value: '100%', label: 'Kháng nước', sublabel: 'Không rã ẩm ngâm 24h', accentColor: '#0EA5E9' },
    { id: 3, value: '-30%', label: 'Trọng lượng', sublabel: 'Nhẹ hơn Cemboard', accentColor: '#5F8A03' },
    { id: 4, value: '0%', label: 'Amiăng & Độc hại', sublabel: 'An toàn tuyệt đối', accentColor: '#10B981' },
  ]
};

export default function AdminHeroManagerPage() {
  const [heroData, setHeroData] = useState<HeroData>(DEFAULT_HERO_DATA);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('remak_admin_hero_data');
      if (saved) {
        setHeroData(JSON.parse(saved));
      }
    } catch {
      // Dùng dữ liệu mặc định
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('remak_admin_hero_data', JSON.stringify(heroData));
      showToast('Đã lưu thông tin tiêu đề và cam kết thành công!');
    } catch (err) {
      alert('Không thể lưu cấu hình: ' + err);
    }
  };

  const handleReset = () => {
    if (confirm('Khôi phục toàn bộ nội dung về thiết lập mặc định ban đầu?')) {
      setHeroData(DEFAULT_HERO_DATA);
      localStorage.removeItem('remak_admin_hero_data');
      showToast('Đã khôi phục nội dung mặc định!');
    }
  };

  const handleCardChange = (id: number, field: string, value: string) => {
    setHeroData(prev => ({
      ...prev,
      trustCards: prev.trustCards.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <AdminHeader 
        title="Quản Lý Tiêu Đề & Điểm Nhấn" 
        subtitle="Quản trị tiêu đề chính, mô tả kỹ thuật và các cam kết chất lượng ở đầu trang chủ"
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
              Cấu Hình Nội Dung Giới Thiệu
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Nội dung hiển thị ngay phía dưới banner trên trang chủ
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
              href="/#homepage-hero"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold transition-colors"
            >
              Xem ngoài trang chủ
            </a>
          </div>
        </div>

        {/* KHUNG XEM TRƯỚC GIAO DIỆN */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Xem Trước Trực Quan
            </span>
            <span className="text-[11px] text-slate-400">
              Tự động phản ánh các thay đổi bên dưới
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-5 bg-gradient-to-b from-white to-slate-50/40">
            <div className="max-w-4xl space-y-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {heroData.title}
                <span className="block text-base sm:text-lg font-semibold text-slate-600 mt-1">
                  {heroData.subtitle}
                </span>
              </h1>

              <div className="text-xs sm:text-sm text-slate-600 space-y-2 leading-relaxed">
                <p>{heroData.paragraph1}</p>
                <p className="text-slate-500">{heroData.paragraph2}</p>
              </div>

              {/* Hai nút hành động */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                <span className="px-4 py-2 rounded-lg bg-[#F26522] text-white font-bold text-xs shadow-xs">
                  {heroData.cta1Text}
                </span>
                <span className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 font-semibold text-xs shadow-2xs">
                  {heroData.cta2Text}
                </span>
              </div>

              {/* 4 Thẻ Cam Kết */}
              <div className="pt-4 border-t border-slate-200/80">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {heroData.trustCards.map(c => (
                    <div 
                      key={c.id} 
                      className="rounded-lg bg-white border border-slate-200 border-t-2 p-3 shadow-2xs" 
                      style={{ borderTopColor: c.accentColor }}
                    >
                      <div className="text-lg sm:text-xl font-bold leading-tight" style={{ color: c.accentColor }}>
                        {c.value}
                      </div>
                      <div className="text-xs font-bold mt-1 text-slate-800">
                        {c.label}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {c.sublabel}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FORM CHỈNH SỬA DỮ LIỆU */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Cột trái: Văn bản & Nút bấm (8/12) */}
            <div className="lg:col-span-8 bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                Văn Bản Giới Thiệu & Nút Hành Động
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tiêu đề chính *</label>
                  <input
                    type="text"
                    required
                    value={heroData.title}
                    onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tiêu đề phụ *</label>
                  <input
                    type="text"
                    required
                    value={heroData.subtitle}
                    onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Đoạn văn mở đầu (Thông số và chuẩn kiểm định) *</label>
                <textarea
                  rows={3}
                  required
                  value={heroData.paragraph1}
                  onChange={(e) => setHeroData({ ...heroData, paragraph1: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs leading-relaxed focus:outline-none focus:border-[#5F8A03]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Đoạn phân tích công nghệ (Gốc Sulfate không rỉ sét ốc vít) *</label>
                <textarea
                  rows={3}
                  required
                  value={heroData.paragraph2}
                  onChange={(e) => setHeroData({ ...heroData, paragraph2: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs leading-relaxed focus:outline-none focus:border-[#5F8A03]"
                />
              </div>

              {/* Cấu hình 2 Nút hành động */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-800">Nút Hành Động Chính (Cam)</div>
                  <input
                    type="text"
                    value={heroData.cta1Text}
                    onChange={(e) => setHeroData({ ...heroData, cta1Text: e.target.value })}
                    placeholder="Chữ trên nút..."
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs font-semibold bg-white"
                  />
                  <input
                    type="text"
                    value={heroData.cta1Link}
                    onChange={(e) => setHeroData({ ...heroData, cta1Link: e.target.value })}
                    placeholder="Đường dẫn liên kết (VD: /nhan-mau-thu)..."
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs bg-white"
                  />
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-800">Nút Hành Động Phụ (Trắng)</div>
                  <input
                    type="text"
                    value={heroData.cta2Text}
                    onChange={(e) => setHeroData({ ...heroData, cta2Text: e.target.value })}
                    placeholder="Chữ trên nút..."
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs font-semibold bg-white"
                  />
                  <input
                    type="text"
                    value={heroData.cta2Link}
                    onChange={(e) => setHeroData({ ...heroData, cta2Link: e.target.value })}
                    placeholder="Đường dẫn liên kết (VD: #du-toan)..."
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Cột phải: 4 Thẻ Cam Kết (4/12) */}
            <div className="lg:col-span-4 bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                4 Cam Kết Chất Lượng
              </h4>

              <div className="space-y-3">
                {heroData.trustCards.map((card, idx) => (
                  <div key={card.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Cam kết #{idx + 1}</span>
                      <input 
                        type="color" 
                        value={card.accentColor} 
                        onChange={(e) => handleCardChange(card.id, 'accentColor', e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer border-0"
                        title="Màu viền thẻ"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={card.value}
                        onChange={(e) => handleCardChange(card.id, 'value', e.target.value)}
                        placeholder="Số liệu (1.200°C)"
                        className="px-2.5 py-1.5 rounded border border-slate-300 text-xs font-bold bg-white"
                      />
                      <input
                        type="text"
                        value={card.label}
                        onChange={(e) => handleCardChange(card.id, 'label', e.target.value)}
                        placeholder="Tiêu đề (Chịu nhiệt)"
                        className="px-2.5 py-1.5 rounded border border-slate-300 text-xs font-semibold bg-white"
                      />
                    </div>
                    <input
                      type="text"
                      value={card.sublabel}
                      onChange={(e) => handleCardChange(card.id, 'sublabel', e.target.value)}
                      placeholder="Mô tả phụ (Chống Cháy A1)"
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Thanh lưu cố định */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Các thay đổi sẽ được lưu trữ và cập nhật vào mục số 2 trên trang chủ
            </span>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Lưu Thông Tin
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
