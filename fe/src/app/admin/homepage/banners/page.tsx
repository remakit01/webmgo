'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sliders, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Check, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Image as ImageIcon, 
  X,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import { 
  BannerSlide, 
  BannerSwiperConfig, 
  getBannerSlides, 
  saveBannerSlides, 
  getSwiperConfig, 
  saveSwiperConfig, 
  resetBannersToDefault,
  BANNER_IMAGE_PRESETS,
  DEFAULT_BANNERS
} from '@/lib/banner-store';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [config, setConfig] = useState<BannerSwiperConfig>({
    autoPlayInterval: 3500,
    pauseOnHover: true,
    showDots: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerSlide | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    alt: '',
    image: '/images/banners/banner-1-tam-op.png',
    link: '/san-pham/tam-mgo',
    active: true,
  });

  // Load from store on mount
  useEffect(() => {
    setBanners(getBannerSlides());
    setConfig(getSwiperConfig());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleActive = (id: number) => {
    const updated = banners.map(b => b.id === id ? { ...b, active: !b.active } : b);
    setBanners(updated);
    saveBannerSlides(updated);
    showToast('Đã cập nhật trạng thái hiển thị banner trên trang chủ live!');
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...banners];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setBanners(updated);
    saveBannerSlides(updated);
    showToast('Đã cập nhật thứ tự chạy slide!');
  };

  const handleMoveDown = (index: number) => {
    if (index === banners.length - 1) return;
    const updated = [...banners];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setBanners(updated);
    saveBannerSlides(updated);
    showToast('Đã cập nhật thứ tự chạy slide!');
  };

  const handleDelete = (id: number) => {
    if (banners.length <= 1) {
      alert('Phải giữ ít nhất 1 banner để hiển thị trên trang chủ!');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa slide banner này?')) {
      const updated = banners.filter(b => b.id !== id);
      setBanners(updated);
      saveBannerSlides(updated);
      showToast('Đã xóa banner khỏi danh sách!');
    }
  };

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormData({
      title: 'Tấm Chống Cháy MGO Remak® FireOFF Mới',
      alt: 'Tấm chống cháy Magie Oxit MGO Remak đạt chuẩn PCCC QCVN 06:2022/BXD',
      image: '/images/banners/banner-1-tam-op.png',
      link: '/san-pham/tam-mgo',
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: BannerSlide) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      alt: banner.alt,
      image: banner.image,
      link: banner.link || '/san-pham/tam-mgo',
      active: banner.active !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBanner) {
      const updated = banners.map(b => b.id === editingBanner.id ? {
        ...b,
        title: formData.title,
        alt: formData.alt,
        image: formData.image,
        link: formData.link,
        active: formData.active,
      } : b);
      setBanners(updated);
      saveBannerSlides(updated);
      showToast('Đã lưu thay đổi banner thành công!');
    } else {
      const newBanner: BannerSlide = {
        id: Date.now(),
        title: formData.title,
        alt: formData.alt,
        image: formData.image,
        link: formData.link,
        active: formData.active,
      };
      const updated = [...banners, newBanner];
      setBanners(updated);
      saveBannerSlides(updated);
      showToast('Đã thêm banner mới vào trang chủ!');
    }
    setIsModalOpen(false);
  };

  const handleSaveConfig = () => {
    saveSwiperConfig(config);
    showToast('Đã lưu cài đặt thời gian trượt banner!');
  };

  const handleResetDefault = () => {
    if (confirm('Khôi phục danh sách và cấu hình banner về mặc định ban đầu?')) {
      const res = resetBannersToDefault();
      setBanners(res.banners);
      setConfig(res.config);
      showToast('Đã khôi phục banner về mặc định!');
    }
  };

  const activeCount = banners.filter(b => b.active !== false).length;

  return (
    <>
      <AdminHeader 
        title="Quản Lý Banner Slider Trang Chủ" 
        subtitle="Quản trị hình ảnh, tiêu đề, link chuyển hướng & tốc độ trượt của HomeBannerSwiper.tsx" 
      />

      {/* Floating Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 size={18} className="text-[#A0D911]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#5F8A03] flex items-center justify-center font-bold">
              <Sliders size={20} />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm">
                Trình Trượt Banner (HomeBannerSwiper)
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Đang hiển thị: <strong className="text-[#5F8A03]">{activeCount}</strong> / {banners.length} slide
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleResetDefault}
              className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              title="Khôi phục 3 banner mặc định ban đầu"
            >
              <RotateCcw size={14} />
              <span>Khôi Phục Mặc Định</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Eye size={14} />
              <span>Xem Trang Chủ Live</span>
            </Link>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-gradient-to-r from-[#7CB305] to-[#5F8A03] text-white rounded-xl text-xs font-bold shadow-md shadow-[#5F8A03]/20 hover:brightness-105 transition-all flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span>Thêm Slide Mới</span>
            </button>
          </div>
        </div>

        {/* Global Slider Settings Box */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs sm:text-sm">
              <Clock size={16} className="text-[#5F8A03]" />
              <span>Cấu Hình Tự Động Trượt (Auto Sliding Configuration)</span>
            </div>
            <button
              onClick={handleSaveConfig}
              className="px-3 py-1.5 bg-[#5F8A03] text-white rounded-lg text-xs font-bold hover:brightness-105 transition-all shadow-sm shadow-[#5F8A03]/20"
            >
              Lưu Cấu Hình
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Interval slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">Thời gian tự trượt (AutoPlay):</label>
                <span className="font-black text-[#5F8A03] bg-emerald-50 px-2 py-0.5 rounded-md">
                  {(config.autoPlayInterval / 1000).toFixed(1)} giây ({config.autoPlayInterval}ms)
                </span>
              </div>
              <input
                type="range"
                min="2000"
                max="8000"
                step="500"
                value={config.autoPlayInterval}
                onChange={e => setConfig({ ...config, autoPlayInterval: Number(e.target.value) })}
                className="w-full accent-[#5F8A03] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Nhanh (2s)</span>
                <span>Chuẩn (3.5s)</span>
                <span>Chậm (8s)</span>
              </div>
            </div>

            {/* Pause on hover */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <div>
                <div className="font-bold text-slate-800">Dừng khi rê chuột (Pause on Hover)</div>
                <div className="text-[11px] text-slate-500">Giúp người dùng đọc kỹ thông tin banner</div>
              </div>
              <input
                type="checkbox"
                checked={config.pauseOnHover}
                onChange={e => setConfig({ ...config, pauseOnHover: e.target.checked })}
                className="w-4 h-4 accent-[#5F8A03] rounded cursor-pointer"
              />
            </div>

            {/* Show dots */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <div>
                <div className="font-bold text-slate-800">Hiển thị chấm tròn chỉ mục (Dots)</div>
                <div className="text-[11px] text-slate-500">Theo yêu cầu FE: mặc định ẩn để tinh gọn</div>
              </div>
              <input
                type="checkbox"
                checked={config.showDots}
                onChange={e => setConfig({ ...config, showDots: e.target.checked })}
                className="w-4 h-4 accent-[#5F8A03] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Visual Banner Cards List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Danh Sách Slide Banner Thực Tế (Thứ tự hiển thị từ trên xuống dưới)
            </h3>
            <span className="text-xs text-slate-400">
              Kéo/Dùng nút mũi tên để đổi thứ tự trượt
            </span>
          </div>

          <div className="space-y-3">
            {banners.map((banner, index) => {
              const isActive = banner.active !== false;
              return (
                <div
                  key={banner.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4 ${
                    isActive 
                      ? 'border-slate-200 hover:border-emerald-300' 
                      : 'border-slate-200 bg-slate-50/70 opacity-75'
                  }`}
                >
                  {/* Order handle & badge */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        aria-label="Di chuyển slide lên"
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Đẩy lên trước"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === banners.length - 1}
                        aria-label="Di chuyển slide xuống"
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Đẩy xuống sau"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Thumbnail Preview */}
                  <div className="w-full md:w-56 h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 relative group">
                    <img
                      src={banner.image}
                      alt={banner.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-mono">
                      1920×600
                    </div>
                  </div>

                  {/* Information Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-sm truncate">
                        {banner.title}
                      </h4>
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check size={10} />
                          <span>Đang chạy</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          <EyeOff size={10} />
                          <span>Tạm ẩn</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      <strong className="text-slate-600">Thẻ Alt SEO:</strong> {banner.alt}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <strong className="text-slate-500">CTA Link:</strong>
                      <span className="font-mono text-emerald-700 bg-emerald-50/60 px-2 py-0.5 rounded text-[11px] truncate max-w-xs">
                        {banner.link || '(Không có)'}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleToggleActive(banner.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        isActive
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                      title={isActive ? 'Tạm ẩn khỏi trang chủ' : 'Bật hiển thị'}
                    >
                      {isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                      <span>{isActive ? 'Ẩn' : 'Bật'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(banner)}
                      className="p-2 text-slate-600 hover:text-[#5F8A03] hover:bg-emerald-50 rounded-xl transition-all"
                      title="Chỉnh sửa slide"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      title="Xóa slide"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Add / Edit Slide */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ImageIcon className="text-[#5F8A03]" size={20} />
                <span>{editingBanner ? 'Chỉnh Sửa Slide Banner' : 'Thêm Slide Banner Mới'}</span>
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                aria-label="Đóng cửa sổ"
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="space-y-4 text-xs sm:text-sm">
              {/* Image Preview in Modal */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Xem trước ảnh Banner:</label>
                <div className="w-full h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                  <img
                    src={formData.image}
                    alt={formData.alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/banners/banner-1-tam-op.png';
                    }}
                  />
                  <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 text-white text-[11px] font-mono">
                    Xem trước thực tế
                  </div>
                </div>
              </div>

              {/* Quick Preset Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Chọn ảnh có sẵn trong kho thư viện:
                </label>
                <select
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  aria-label="Chọn mẫu banner có sẵn"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#5F8A03]"
                >
                  {BANNER_IMAGE_PRESETS.map((preset) => (
                    <option key={preset.path} value={preset.path}>
                      {preset.label} ({preset.path})
                    </option>
                  ))}
                </select>
              </div>

              {/* Or manual URL */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Hoặc nhập đường dẫn URL ảnh tùy chỉnh:
                </label>
                <input
                  type="text"
                  required
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/images/banners/ten-anh.png hoặc https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white font-mono text-xs"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu Đề Banner:</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ví dụ: Tấm ốp chống cháy MGO FireOFF"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white"
                />
              </div>

              {/* Alt SEO */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Thẻ Alt SEO (Mô tả nội dung cho Google Image):</label>
                <input
                  type="text"
                  required
                  value={formData.alt}
                  onChange={e => setFormData({ ...formData, alt: e.target.value })}
                  placeholder="Tấm ốp chống cháy MGO - Nhanh chóng, Dễ dàng, Bền bỉ..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white text-xs"
                />
              </div>

              {/* Destination Link */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Đường Dẫn Chuyển Trang (CTA Link):</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={e => setFormData({ ...formData, link: e.target.value })}
                  placeholder="/san-pham/tam-mgo hoặc /giai-phap-ung-dung"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white font-mono text-xs"
                />
              </div>

              {/* Active Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 accent-[#5F8A03] rounded cursor-pointer"
                  />
                  <span className="font-bold text-slate-700">Kích hoạt hiển thị slide này ngay trên trang chủ</span>
                </label>
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
                  {editingBanner ? 'Cập Nhật Slide' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
