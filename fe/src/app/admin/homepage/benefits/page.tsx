'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/cms/components/AdminHeader';

interface BenefitItem {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  tagline: string;
  desc: string;
  statNumber: string;
  statLabel: string;
  image: string;
  accentColor: 'green' | 'orange';
  bullets: string[];
}

const DEFAULT_BENEFITS: BenefitItem[] = [
  {
    id: 'insect',
    index: 1,
    title: 'Kháng Mối Mọt & Côn Trùng',
    subtitle: 'Kháng sâu bọ tự nhiên không độc hại',
    tagline: '100% khoáng vô cơ không chứa xenlulozo',
    desc: 'Cấu tạo từ Magie Oxit (MgO) và mạng sợi thủy tinh đa tầng, loại bỏ hoàn toàn mùn cưa hữu cơ. Mối mọt và côn trùng tuyệt đối không thể tiêu hóa hay đục khoét làm tổ.',
    statNumber: '100%',
    statLabel: 'Kháng tự nhiên không hóa chất',
    image: '/images/mgo-mesh.jpg',
    accentColor: 'green',
    bullets: [
      'Không cần ngâm tẩm hóa chất bảo quản độc hại',
      'Độ bền cấu trúc vĩnh cửu theo thời gian',
      'Đạt chứng nhận an toàn sinh học công trình',
    ],
  },
  {
    id: 'fire',
    index: 2,
    title: 'Chống Cháy A1 (EI 30 – 180)',
    subtitle: 'Tiêu chuẩn chống cháy cao nhất',
    tagline: 'Chịu nhiệt 1.200°C – Không bắt lửa',
    desc: 'Kiểm định đốt mẫu thực tế tại Viện IBST theo QCVN 06:2022/BXD. Khi gặp lửa trực tiếp, tấm không sinh khói độc, không nhỏ giọt và bảo vệ nguyên vẹn đường thoát nạn.',
    statNumber: '1.200°C',
    statLabel: 'Chịu lửa đốt mẫu thực tế',
    image: '/images/mgo-duct.jpg',
    accentColor: 'orange',
    bullets: [
      'Cấp chống cháy A1 – Hệ số lan truyền lửa = 0',
      'Có sẵn kết quả đốt mẫu ống gió & vách ngăn',
      'Ngăn truyền nhiệt tối ưu cho khoang cháy',
    ],
  },
  {
    id: 'water',
    index: 3,
    title: 'Kháng Nước & Chống Nồm Ẩm',
    subtitle: 'Không hút nước, không mục rữa',
    tagline: 'Tỷ lệ giãn nở 0% – Không mủn rã khi ngâm nước',
    desc: 'Giải quyết triệt để nhược điểm sợ nước của thạch cao và tình trạng ngậm ẩm nặng của Cemboard. Kích thước và cường độ chịu lực giữ nguyên vẹn trong mùa nồm ẩm.',
    statNumber: '0.0%',
    statLabel: 'Hệ số giãn nở thủy phân',
    image: '/images/mgo-floor.jpg',
    accentColor: 'green',
    bullets: [
      'Thích nghi tối đa khí hậu nồm ẩm Việt Nam',
      'Không sinh rêu mốc, vi khuẩn trong phòng kín',
      'Bề mặt dễ dàng lau chùi vệ sinh trực tiếp bằng nước',
    ],
  },
  {
    id: 'eco',
    index: 4,
    title: 'An Toàn Sinh Thái & Thân Thiện',
    subtitle: 'Không chứa Amiăng và chất độc hại',
    tagline: 'Chứng nhận xanh – Thân thiện môi trường',
    desc: 'Thành phần khoáng thiên nhiên 100% không chứa sợi amiăng gây ung thư, không phát thải khí formandehyde hay hợp chất độc hại bay hơi.',
    statNumber: '0%',
    statLabel: 'Amiăng & Hóa chất độc hại',
    image: '/images/mgo-board.jpg',
    accentColor: 'orange',
    bullets: [
      'Chứng nhận không Amiăng đạt tiêu chuẩn quốc tế',
      'Được phép ứng dụng trong bệnh viện và phòng sạch',
      'Có thể tái chế hoặc nghiền làm phân bón nông nghiệp',
    ],
  }
];

export default function AdminBenefitsManagerPage() {
  const [benefits, setBenefits] = useState<BenefitItem[]>(DEFAULT_BENEFITS);
  const [activeTab, setActiveTab] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('remak_admin_benefits_data');
      if (saved) {
        setBenefits(JSON.parse(saved));
      }
    } catch {
      // Dùng mặc định
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('remak_admin_benefits_data', JSON.stringify(benefits));
      showToast('Đã lưu cấu hình 4 đặc tính nổi bật thành công!');
    } catch (err) {
      alert('Không thể lưu cấu hình: ' + err);
    }
  };

  const handleReset = () => {
    if (confirm('Khôi phục danh sách đặc tính về mặc định gốc ban đầu?')) {
      setBenefits(DEFAULT_BENEFITS);
      localStorage.removeItem('remak_admin_benefits_data');
      showToast('Đã khôi phục dữ liệu mặc định!');
    }
  };

  const handleItemChange = (index: number, field: keyof BenefitItem, value: any) => {
    setBenefits(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleBulletChange = (itemIndex: number, bulletIndex: number, val: string) => {
    setBenefits(prev => {
      const updated = [...prev];
      const bullets = [...updated[itemIndex].bullets];
      bullets[bulletIndex] = val;
      updated[itemIndex].bullets = bullets;
      return updated;
    });
  };

  const currentItem = benefits[activeTab] || benefits[0];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <AdminHeader 
        title="Quản Lý Đặc Tính Nổi Bật" 
        subtitle="Quản trị 4 khối đặc tính kỹ thuật cốt lõi của tấm chống cháy MGO trên trang chủ"
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
              4 Đặc Tính Kỹ Thuật Nổi Bật
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhấp chọn từng đặc tính bên dưới để xem trước và chỉnh sửa
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

        {/* BỘ CHỌN 4 ĐẶC TÍNH */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {benefits.map((b, idx) => {
            const isSelected = activeTab === idx;
            const isOrange = b.accentColor === 'orange';
            return (
              <div
                key={b.id}
                onClick={() => setActiveTab(idx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 relative ${
                  isSelected 
                    ? isOrange 
                      ? 'border-[#F26522] bg-orange-50/60 shadow-xs ring-1 ring-[#F26522]' 
                      : 'border-[#5F8A03] bg-[#F4F9E8] shadow-xs ring-1 ring-[#5F8A03]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    isOrange ? 'bg-[#F26522] text-white' : 'bg-[#5F8A03] text-white'
                  }`}>
                    Mục #{b.index}
                  </span>
                  <span className="text-lg font-bold text-slate-900">{b.statNumber}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate">{b.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-1">{b.tagline}</p>
              </div>
            );
          })}
        </div>

        {/* XEM TRƯỚC KHỐI ĐANG CHỌN */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Xem Trước: Mục #{currentItem.index} - {currentItem.title}
            </span>
            <span className="text-[11px] text-slate-400">
              Mô phỏng hiển thị trên trang chủ
            </span>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Cột trái: Văn bản */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold text-white ${
                  currentItem.accentColor === 'orange' ? 'bg-[#F26522]' : 'bg-[#5F8A03]'
                }`}>
                  Đặc tính #{currentItem.index}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {currentItem.subtitle}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {currentItem.title}
              </h2>

              <p className="text-xs sm:text-sm font-semibold text-[#F26522]">
                {currentItem.tagline}
              </p>

              <p className="text-xs text-slate-600 leading-relaxed">
                {currentItem.desc}
              </p>

              <div className="space-y-1.5 pt-1">
                {currentItem.bullets.map((bullet, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <span className={`w-1.5 h-1.5 rounded-full ${currentItem.accentColor === 'orange' ? 'bg-[#F26522]' : 'bg-[#5F8A03]'}`} />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cột phải: Số liệu & Ảnh */}
            <div className="lg:col-span-5 space-y-3">
              <div className={`p-4 rounded-xl border text-center space-y-0.5 ${
                currentItem.accentColor === 'orange' 
                  ? 'border-orange-200 bg-orange-50/40' 
                  : 'border-emerald-200 bg-[#F4F9E8]'
              }`}>
                <div className={`text-3xl font-extrabold ${
                  currentItem.accentColor === 'orange' ? 'text-[#F26522]' : 'text-[#5F8A03]'
                }`}>
                  {currentItem.statNumber}
                </div>
                <div className="text-xs font-medium text-slate-700">{currentItem.statLabel}</div>
              </div>

              <div className="h-36 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                <img 
                  src={currentItem.image} 
                  alt={currentItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* FORM CHỈNH SỬA CHI TIẾT */}
        <form onSubmit={handleSave} className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <h4 className="text-sm font-bold text-slate-900">
              Chỉnh Sửa Chi Tiết Mục #{currentItem.index}: {currentItem.title}
            </h4>

            {/* Chọn màu nhấn */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-medium">Màu chủ đạo:</span>
              <button
                type="button"
                onClick={() => handleItemChange(activeTab, 'accentColor', 'green')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  currentItem.accentColor === 'green' ? 'bg-[#5F8A03] text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Xanh Lá
              </button>
              <button
                type="button"
                onClick={() => handleItemChange(activeTab, 'accentColor', 'orange')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  currentItem.accentColor === 'orange' ? 'bg-[#F26522] text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Màu Cam
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tiêu đề chính *</label>
              <input
                type="text"
                required
                value={currentItem.title}
                onChange={(e) => handleItemChange(activeTab, 'title', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#5F8A03]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tiêu đề phụ diễn giải *</label>
              <input
                type="text"
                required
                value={currentItem.subtitle}
                onChange={(e) => handleItemChange(activeTab, 'subtitle', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Khẩu hiệu ngắn gọn *</label>
              <input
                type="text"
                required
                value={currentItem.tagline}
                onChange={(e) => handleItemChange(activeTab, 'tagline', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Con số nổi bật (VD: 1.200°C, 100%) *</label>
              <input
                type="text"
                required
                value={currentItem.statNumber}
                onChange={(e) => handleItemChange(activeTab, 'statNumber', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold focus:outline-none focus:border-[#5F8A03]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nhãn mô tả con số *</label>
              <input
                type="text"
                required
                value={currentItem.statLabel}
                onChange={(e) => handleItemChange(activeTab, 'statLabel', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Đường dẫn hình ảnh *</label>
              <input
                type="text"
                required
                value={currentItem.image}
                onChange={(e) => handleItemChange(activeTab, 'image', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Mô tả kỹ thuật chi tiết *</label>
            <textarea
              rows={3}
              required
              value={currentItem.desc}
              onChange={(e) => handleItemChange(activeTab, 'desc', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs leading-relaxed focus:outline-none focus:border-[#5F8A03]"
            />
          </div>

          {/* 3 Điểm nhấn */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700">3 Điểm nhấn quan trọng:</label>
            <div className="space-y-2">
              {currentItem.bullets.map((b, bIdx) => (
                <div key={bIdx} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold w-6">#{bIdx + 1}</span>
                  <input
                    type="text"
                    required
                    value={b}
                    onChange={(e) => handleBulletChange(activeTab, bIdx, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Nút lưu */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">Đang chọn: Mục #{currentItem.index} - {currentItem.title}</span>
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
