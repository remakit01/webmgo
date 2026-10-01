'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2,
  Check
} from 'lucide-react';
import AdminHeader from '@/cms/components/AdminHeader';
import { 
  BannerSlide, 
  DEFAULT_BANNERS, 
  DEFAULT_SWIPER_CONFIG,
  BANNER_IMAGE_PRESETS,
  getBannerSlides, 
  saveBannerSlides, 
  getSwiperConfig, 
  saveSwiperConfig 
} from '@/lib/banner-store';

export default function AdminBannersManagerPage() {
  const [banners, setBanners] = useState<BannerSlide[]>(DEFAULT_BANNERS);
  const [swiperConfig, setSwiperConfig] = useState(DEFAULT_SWIPER_CONFIG);

  // Preview state
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isFullscreenModal, setIsFullscreenModal] = useState(false);

  // Edit / Add Modal state
  const [editingBanner, setEditingBanner] = useState<BannerSlide | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setBanners(getBannerSlides());
    setSwiperConfig(getSwiperConfig());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Preview timer
  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return;
    const activeList = banners.filter(b => b.active !== false);
    if (activeList.length <= 1) return;

    const timer = setInterval(() => {
      setPreviewIndex(prev => (prev + 1) % activeList.length);
    }, swiperConfig.autoPlayInterval || 3500);

    return () => clearInterval(timer);
  }, [isAutoPlaying, banners, swiperConfig]);

  // Banner Actions
  const handleToggleActive = (id: number) => {
    const updated = banners.map(b => b.id === id ? { ...b, active: b.active === false ? true : false } : b);
    setBanners(updated);
    saveBannerSlides(updated);
    showToast('Đã cập nhật trạng thái hiển thị banner!');
  };

  const handleDelete = (id: number) => {
    if (banners.length <= 1) {
      alert('Phải giữ lại ít nhất 1 banner!');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa banner này?')) {
      const updated = banners.filter(b => b.id !== id);
      setBanners(updated);
      saveBannerSlides(updated);
      showToast('Đã xóa banner thành công!');
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const [moved] = newBanners.splice(index, 1);
    newBanners.splice(targetIndex, 0, moved);

    setBanners(newBanners);
    saveBannerSlides(newBanners);
    showToast('Đã thay đổi thứ tự banner!');
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    let updated: BannerSlide[];
    if (editingBanner.id === 0) {
      const newId = Date.now();
      const newBanner = { ...editingBanner, id: newId, order: banners.length + 1 };
      updated = [...banners, newBanner];
    } else {
      updated = banners.map(b => b.id === editingBanner.id ? editingBanner : b);
    }

    setBanners(updated);
    saveBannerSlides(updated);
    setIsModalOpen(false);
    setEditingBanner(null);
    showToast('Đã lưu thông tin banner thành công!');
  };

  const handleResetDefaults = () => {
    if (confirm('Khôi phục danh sách và cấu hình banner về mặc định gốc?')) {
      setBanners(DEFAULT_BANNERS);
      setSwiperConfig(DEFAULT_SWIPER_CONFIG);
      saveBannerSlides(DEFAULT_BANNERS);
      saveSwiperConfig(DEFAULT_SWIPER_CONFIG);
      showToast('Đã khôi phục banner mặc định!');
    }
  };

  const handleUpdateConfig = (key: keyof typeof swiperConfig, value: any) => {
    const updated = { ...swiperConfig, [key]: value };
    setSwiperConfig(updated);
    saveSwiperConfig(updated);
    showToast('Đã lưu cấu hình trình chiếu!');
  };

  const activeBannersList = banners.filter(b => b.active !== false);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <AdminHeader 
        title="Quản Lý Banner Trang Chủ" 
        subtitle="Quản trị nội dung và thứ tự trình chiếu banner ở đầu trang chủ"
      />

      {/* Thông báo thao tác */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700">
          <CheckCircle2 size={16} className="text-[#7CB305]" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* KHUNG XEM TRƯỚC BANNER - FULL WIDTH 100%, KHÔNG CÓ BORDER TOP */}
      <div className="w-full bg-white border-b border-slate-300 select-none">
        {/* Thanh tiêu đề & điều khiển xem trước */}
        <div className="px-6 py-3 border-b border-slate-300 flex items-center justify-between flex-wrap gap-3 bg-white">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Xem Trước Hiển Thị Banner
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Khung hình tỷ lệ 1024 / 342 chuẩn theo giao diện ngoài trang chủ
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Nút tạm dừng / tiếp tục trượt */}
            <button
              type="button"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {isAutoPlaying ? 'Tạm dừng trượt' : 'Tự động trượt'}
            </button>

            {/* Nút xem toàn màn hình */}
            <button
              type="button"
              onClick={() => setIsFullscreenModal(true)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Xem toàn màn hình
            </button>

            {/* Mở tab trang chủ */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold transition-colors"
            >
              Xem ngoài trang chủ
            </a>
          </div>
        </div>

        {/* Màn hình hiển thị Banner */}
        <div className="relative w-full bg-slate-100 aspect-[1024/342] overflow-hidden select-none border-b border-slate-300">
          {activeBannersList.length > 0 ? (
            <div className="w-full h-full relative">
              <img 
                src={activeBannersList[previewIndex]?.image || '/images/banners/banner-1-tam-op.png'} 
                alt={activeBannersList[previewIndex]?.alt || 'Hình ảnh banner'}
                className="w-full h-full object-cover object-center transition-opacity duration-300" 
              />
              
              {/* Nhãn thông tin góc dưới */}
              <div className="absolute bottom-3 left-4 bg-slate-900/80 backdrop-blur-xs px-3 py-1.5 rounded-lg text-white text-xs font-medium border border-white/10 shadow-sm">
                Banner {previewIndex + 1} / {activeBannersList.length}: {activeBannersList[previewIndex]?.title}
              </div>

              {/* Chấm tròn chuyển đổi banner */}
              {activeBannersList.length > 1 && (
                <div className="absolute bottom-3 right-4 flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
                  {activeBannersList.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewIndex(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === previewIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1">
              <span className="text-sm font-semibold">Tất cả banner hiện đang ở trạng thái ẩn</span>
            </div>
          )}
        </div>
      </div>

      {/* NỘI DUNG CHÍNH: DANH SÁCH & CÀI ĐẶT (FULL WIDTH) */}
      <div className="p-6 space-y-6 w-full">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Cột 1: Danh sách Banners (8/12) */}
          <div className="xl:col-span-8 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-300">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Danh Sách Banner ({banners.length})
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Có {activeBannersList.length} banner đang được bật hiển thị
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Khôi phục gốc
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingBanner({
                      id: 0,
                      image: '/images/banners/banner-1-tam-op.png',
                      title: 'Tiêu đề banner mới',
                      alt: 'Mô tả hình ảnh tấm chống cháy MGO Remak',
                      link: '/san-pham/tam-mgo',
                      active: true,
                      order: banners.length + 1,
                    });
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Thêm Banner Mới</span>
                </button>
              </div>
            </div>

            {/* Các thẻ Banner */}
            <div className="space-y-3">
              {banners.map((b, index) => {
                const isActive = b.active !== false;
                return (
                  <div 
                    key={b.id}
                    className={`bg-white rounded-xl p-4 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isActive 
                        ? 'border-slate-300 shadow-2xs hover:border-slate-400' 
                        : 'border-dashed border-slate-300 opacity-60 bg-slate-50'
                    }`}
                  >
                    {/* Ảnh thu nhỏ */}
                    <div className="relative w-full sm:w-44 h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-300">
                      <img 
                        src={b.image} 
                        alt={b.alt} 
                        className="w-full h-full object-cover" 
                      />
                      <span className="absolute top-1.5 left-1.5 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900/80 text-white">
                        Vị trí #{index + 1}
                      </span>
                    </div>

                    {/* Nội dung thông tin */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-slate-900 truncate">
                          {b.title}
                        </h5>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isActive ? 'Đang bật' : 'Đã ẩn'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        Mô tả ảnh: {b.alt}
                      </p>
                      <p className="text-xs text-[#5F8A03] font-medium truncate">
                        Đường dẫn đích: {b.link || 'Không có liên kết'}
                      </p>
                    </div>

                    {/* Nút thao tác */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {/* Đổi thứ tự lên xuống */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'up')}
                        className="p-1.5 rounded border border-slate-300 hover:bg-slate-100 text-slate-600 disabled:opacity-20 cursor-pointer"
                        title="Chuyển lên trên"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={index === banners.length - 1}
                        onClick={() => handleMove(index, 'down')}
                        className="p-1.5 rounded border border-slate-300 hover:bg-slate-100 text-slate-600 disabled:opacity-20 cursor-pointer"
                        title="Chuyển xuống dưới"
                      >
                        <ArrowDown size={14} />
                      </button>

                      {/* Bật / Tắt */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(b.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        {isActive ? 'Ẩn đi' : 'Hiện lại'}
                      </button>

                      {/* Sửa */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBanner(b);
                          setIsModalOpen(true);
                        }}
                        className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={14} />
                      </button>

                      {/* Xóa */}
                      <button
                        type="button"
                        onClick={() => handleDelete(b.id)}
                        className="p-2 rounded-lg border border-rose-300 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cột 2: Cài đặt chuyển động & Kho ảnh (4/12) */}
          <div className="xl:col-span-4 space-y-5">
            
            {/* Hộp Cài đặt trình chiếu */}
            <div className="bg-white rounded-xl p-5 border border-slate-300 shadow-2xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2.5">
                Cài Đặt Trình Chiếu Banner
              </h4>

              {/* Tốc độ trượt */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                  <span>Thời gian chuyển ảnh:</span>
                  <span className="font-bold text-[#5F8A03]">{(swiperConfig.autoPlayInterval / 1000).toFixed(1)} giây</span>
                </div>
                <input 
                  type="range" 
                  min={2000} 
                  max={8000} 
                  step={500}
                  value={swiperConfig.autoPlayInterval}
                  onChange={(e) => handleUpdateConfig('autoPlayInterval', Number(e.target.value))}
                  className="w-full accent-[#5F8A03] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>2 giây (Nhanh)</span>
                  <span>3.5 giây (Chuẩn)</span>
                  <span>8 giây (Chậm)</span>
                </div>
              </div>

              {/* Dừng khi rê chuột */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Tạm dừng khi di chuột</div>
                  <div className="text-[11px] text-slate-400">Dừng trượt khi người xem chỉ chuột vào banner</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={swiperConfig.pauseOnHover}
                  onChange={(e) => handleUpdateConfig('pauseOnHover', e.target.checked)}
                  className="w-4 h-4 accent-[#5F8A03] rounded cursor-pointer"
                />
              </div>

              {/* Hiển thị thanh chấm */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Hiển thị chấm vị trí</div>
                  <div className="text-[11px] text-slate-400">Hiện các chấm chuyển trang ở góc dưới</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={swiperConfig.showDots}
                  onChange={(e) => handleUpdateConfig('showDots', e.target.checked)}
                  className="w-4 h-4 accent-[#5F8A03] rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Kho ảnh mẫu */}
            <div className="bg-white rounded-xl p-5 border border-slate-300 shadow-2xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2.5">
                Thư Viện Ảnh Banner Chuẩn
              </h4>
              <p className="text-xs text-slate-500">
                Nhấp vào ảnh để sao chép đường dẫn dùng khi tạo banner:
              </p>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {BANNER_IMAGE_PRESETS.map((preset, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      navigator.clipboard.writeText(preset.path);
                      showToast(`Đã sao chép: ${preset.path}`);
                    }}
                    className="p-2.5 rounded-lg border border-slate-300 hover:border-[#7CB305] hover:bg-[#F4F9E8] transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {preset.label}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{preset.path}</div>
                    </div>
                    <span className="text-[11px] text-[#5F8A03] font-bold shrink-0">
                      Sao chép
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* CỬA SỔ THÊM / SỬA BANNER */}
      {isModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="text-base font-bold text-slate-900">
                {editingBanner.id === 0 ? 'Thêm Banner Trang Chủ Mới' : 'Chỉnh Sửa Thông Tin Banner'}
              </h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tiêu đề Banner *</label>
                <input
                  type="text"
                  required
                  value={editingBanner.title}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  placeholder="Ví dụ: Tấm ốp chống cháy MGO Remak..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium focus:outline-none focus:border-[#7CB305]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Đường dẫn hình ảnh *</label>
                <input
                  type="text"
                  required
                  value={editingBanner.image}
                  onChange={(e) => setEditingBanner({ ...editingBanner, image: e.target.value })}
                  placeholder="/images/banners/banner-1-tam-op.png hoặc liên kết web"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium focus:outline-none focus:border-[#7CB305]"
                />
                
                {/* Chọn nhanh ảnh mẫu */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {BANNER_IMAGE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditingBanner({ ...editingBanner, image: preset.path })}
                      className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-[#F4F9E8] hover:text-[#5F8A03] border border-slate-300 font-medium transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mô tả hình ảnh (Hỗ trợ tìm kiếm) *</label>
                <input
                  type="text"
                  required
                  value={editingBanner.alt}
                  onChange={(e) => setEditingBanner({ ...editingBanner, alt: e.target.value })}
                  placeholder="Mô tả ngắn gọn nội dung hình ảnh banner"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium focus:outline-none focus:border-[#7CB305]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Đường dẫn mở ra khi nhấp vào banner</label>
                <input
                  type="text"
                  value={editingBanner.link || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, link: e.target.value })}
                  placeholder="/san-pham/tam-mgo hoặc liên kết ngoài"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium focus:outline-none focus:border-[#7CB305]"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={editingBanner.active !== false}
                  onChange={(e) => setEditingBanner({ ...editingBanner, active: e.target.checked })}
                  className="w-4 h-4 accent-[#5F8A03] rounded cursor-pointer"
                />
                <label htmlFor="activeCheck" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  Bật hiển thị banner này ngay trên trang chủ
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>{editingBanner.id === 0 ? 'Thêm Banner' : 'Lưu Thay Đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* XEM TOÀN MÀN HÌNH */}
      {isFullscreenModal && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-6">
          <div className="flex items-center justify-between text-white border-b border-white/20 pb-4">
            <h3 className="text-base font-bold">Chế Độ Xem Toàn Màn Hình</h3>
            <button
              type="button"
              onClick={() => setIsFullscreenModal(false)}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors cursor-pointer"
            >
              Đóng (ESC)
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center py-6">
            <div className="w-full max-w-7xl aspect-[1024/342] relative rounded-xl overflow-hidden shadow-2xl border border-white/20">
              <img 
                src={activeBannersList[previewIndex]?.image || '/images/banners/banner-1-tam-op.png'} 
                alt={activeBannersList[previewIndex]?.alt || 'Toàn màn hình banner'}
                className="w-full h-full object-cover" 
              />
              <div className="absolute bottom-4 left-6 bg-slate-900/80 backdrop-blur-xs px-4 py-2 rounded-lg text-white text-sm font-semibold">
                Banner {previewIndex + 1} / {activeBannersList.length}: {activeBannersList[previewIndex]?.title}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-white text-xs font-medium">
            <button 
              type="button"
              onClick={() => setPreviewIndex((prev) => (prev - 1 + activeBannersList.length) % activeBannersList.length)}
              className="px-3.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 cursor-pointer"
            >
              Trước
            </button>
            <span>{previewIndex + 1} / {activeBannersList.length}</span>
            <button 
              type="button"
              onClick={() => setPreviewIndex((prev) => (prev + 1) % activeBannersList.length)}
              className="px-3.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 cursor-pointer"
            >
              Kế tiếp
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
