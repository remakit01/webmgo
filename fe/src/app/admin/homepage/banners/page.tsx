'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2,
  Check,
  UploadCloud,
  AlertCircle,
  X,
  Sparkles,
  Link2,
  Loader2,
  Image as ImageIcon,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  GripVertical,
} from 'lucide-react';
import AdminHeader from '@/cms/components/AdminHeader';
import { useConfirm } from '@/cms/components/ConfirmDialog';
import { apiFetch, ifMatch, isConflict } from '@/cms/lib/api-client';
import { fetchCurrentUser, type AuthUser } from '@/cms/lib/api-auth';

interface AdminBanner {
  id: string;
  title: string;
  subtitle: string | null;
  alt: string;
  ctaText: string | null;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface TrashedBanner extends AdminBanner {
  deletedAt: string;
  purgeAt: string;
  deletedBy: { id: string; username: string | null; email: string } | null;
}

interface TrashSettings {
  autoPurgeEnabled: boolean;
  retentionDays: number;
  lastRun: { at: string; by: string; purged: number } | null;
  /** Phiên bản cài đặt (updatedAt) — gửi lại qua If-Match khi lưu */
  version: string | null;
}

interface SwiperConfig {
  autoPlayInterval: number;
  pauseOnHover: boolean;
  showDots: boolean;
  /** Phiên bản cài đặt (updatedAt) — gửi lại qua If-Match khi lưu */
  version: string | null;
}

// Dữ liệu form; id rỗng = tạo mới. file = ảnh mới chọn (bắt buộc khi tạo).
interface BannerForm {
  id: string;
  title: string;
  subtitle: string;
  alt: string;
  ctaText: string;
  linkUrl: string;
  isActive: boolean;
  previewUrl: string;
  file: File | null;
}

// Khớp BANNER_MIN_WIDTH ở API (banners.service.ts); khung banner 1024/342 ≈ 3:1
const BANNER_MIN_WIDTH = 1024;
const BANNER_RECOMMENDED = '1920×640px (tỉ lệ 3:1)';
const DAY_MS = 24 * 60 * 60 * 1000;
const daysLeft = (purgeAt: string) => Math.max(0, Math.ceil((new Date(purgeAt).getTime() - Date.now()) / DAY_MS));
const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

const EMPTY_FORM: BannerForm = {
  id: '',
  title: '',
  subtitle: '',
  alt: '',
  ctaText: '',
  linkUrl: '',
  isActive: true,
  previewUrl: '',
  file: null,
};

const toForm = (b: AdminBanner): BannerForm => ({
  id: b.id,
  title: b.title,
  subtitle: b.subtitle ?? '',
  alt: b.alt,
  ctaText: b.ctaText ?? '',
  linkUrl: b.linkUrl ?? '',
  isActive: b.isActive,
  previewUrl: b.imageUrl,
  file: null,
});

export default function AdminBannersManagerPage() {
  const confirm = useConfirm();
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [swiperConfig, setSwiperConfig] = useState<SwiperConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Thùng rác
  const [trash, setTrash] = useState<TrashedBanner[]>([]);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const isAdmin = currentUser?.role === 'ADMIN';
  // Cài đặt thùng rác do ADMIN chỉnh (lưu ở API); retentionDraft là ô nhập chưa lưu
  const [trashSettings, setTrashSettings] = useState<TrashSettings | null>(null);
  const [retentionDraft, setRetentionDraft] = useState('');
  const [isPurging, setIsPurging] = useState(false);

  // Preview state
  const [rawPreviewIndex, setPreviewIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isFullscreenModal, setIsFullscreenModal] = useState(false);
  const [isHoveredPreview, setIsHoveredPreview] = useState(false);

  // Edit / Add Modal state
  const [editingBanner, setEditingBanner] = useState<BannerForm | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // UI/UX Pro Max validation & drag state
  const [fieldErrors, setFieldErrors] = useState<{
    file?: string;
    title?: string;
    alt?: string;
    linkUrl?: string;
  }>({});
  const [isDragging, setIsDragging] = useState(false);
  // Quản lý kéo thả sắp xếp Banner
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Phím ESC để đóng modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const showError = (err: unknown) => showToast(err instanceof Error ? err.message : 'Có lỗi xảy ra');

  const loadTrash = () =>
    Promise.all([apiFetch<TrashedBanner[]>('/banners/trash'), apiFetch<TrashSettings>('/banners/trash/settings')])
      .then(([list, settings]) => {
        setTrash(list);
        setTrashSettings(settings);
        setRetentionDraft(String(settings.retentionDays));
      })
      .catch(showError);

  // Banner trong thùng rác đã đủ hạn xoá vĩnh viễn (job hoặc nút "Dọn ngay" sẽ xoá)
  const expiredCount = trash.filter((b) => daysLeft(b.purgeAt) === 0).length;

  const saveTrashSettings = async (patch: Partial<Pick<TrashSettings, 'autoPurgeEnabled' | 'retentionDays'>>) => {
    if (!trashSettings) return;
    try {
      const updated = await apiFetch<TrashSettings>('/banners/trash/settings', {
        method: 'PUT',
        headers: ifMatch(trashSettings.version),
        body: JSON.stringify({
          autoPurgeEnabled: patch.autoPurgeEnabled ?? trashSettings.autoPurgeEnabled,
          retentionDays: patch.retentionDays ?? trashSettings.retentionDays,
        }),
      });
      setTrashSettings(updated);
      setRetentionDraft(String(updated.retentionDays));
      // Số ngày lưu đổi -> hạn xoá của từng banner đổi theo
      if (patch.retentionDays !== undefined) await loadTrash();
      showToast('Đã lưu cài đặt thùng rác');
    } catch (err) {
      setRetentionDraft(String(trashSettings.retentionDays));
      if (isConflict(err)) {
        // Người khác vừa đổi cài đặt -> tải giá trị mới nhất thay vì ghi đè
        await loadTrash();
        showToast('Cài đặt thùng rác vừa được người khác thay đổi — đã tải giá trị mới nhất, vui lòng chỉnh lại');
      } else {
        showError(err);
      }
    }
  };

  const handleSaveRetention = () => {
    const days = Number(retentionDraft);
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      showToast('Số ngày lưu phải là số nguyên từ 1 đến 365');
      setRetentionDraft(String(trashSettings?.retentionDays ?? ''));
      return;
    }
    if (days !== trashSettings?.retentionDays) saveTrashSettings({ retentionDays: days });
  };

  const handlePurgeExpired = async () => {
    await confirm({
      title: 'Dọn thùng rác ngay?',
      description: (
        <span>
          Xoá vĩnh viễn <strong className="text-slate-900 font-bold">{expiredCount} banner</strong> đã quá{' '}
          {trashSettings?.retentionDays} ngày trong thùng rác, kèm toàn bộ tệp ảnh. Banner chưa đủ hạn được giữ nguyên.
          Thao tác này không thể hoàn tác.
        </span>
      ),
      confirmText: 'Dọn ngay',
      cancelText: 'Hủy bỏ',
      variant: 'danger',
      onConfirm: async () => {
        setIsPurging(true);
        try {
          const run = await apiFetch<{ purged: number }>('/banners/trash/purge-expired', { method: 'POST' });
          await loadTrash();
          showToast(`Đã xoá vĩnh viễn ${run.purged} banner quá hạn`);
        } finally {
          setIsPurging(false);
        }
      },
    });
  };

  useEffect(() => {
    loadTrash();
    fetchCurrentUser().then(setCurrentUser).catch(() => setCurrentUser(null));
    Promise.all([apiFetch<AdminBanner[]>('/banners'), apiFetch<SwiperConfig>('/banners/settings/swiper')])
      .then(([list, config]) => {
        setBanners(list);
        setSwiperConfig(config);
      })
      .catch(showError)
      .finally(() => setLoading(false));
  }, []);

  const activeBannersList = banners.filter((b) => b.isActive);
  const intervalMs = swiperConfig?.autoPlayInterval ?? 0;
  // Danh sách banner bật có thể ngắn lại (ẩn/xoá) -> index cũ vượt phạm vi thì quay về 0
  const previewIndex = rawPreviewIndex < activeBannersList.length ? rawPreviewIndex : 0;

  // Preview timer - tự động chạy và tạm dừng khi hover nếu bật pauseOnHover
  useEffect(() => {
    if (!isAutoPlaying || activeBannersList.length <= 1 || !intervalMs) return;
    if (swiperConfig?.pauseOnHover && isHoveredPreview) return;
    const timer = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % activeBannersList.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isAutoPlaying, activeBannersList.length, intervalMs, swiperConfig?.pauseOnHover, isHoveredPreview]);


  // Banner Actions
  const handleToggleActive = async (id: string) => {
    try {
      const updated = await apiFetch<AdminBanner>(`/banners/${id}/toggle`, { method: 'PATCH' });
      setBanners((prev) => prev.map((b) => (b.id === id ? updated : b)));
      showToast('Đã cập nhật trạng thái hiển thị banner!');
    } catch (err) {
      showError(err);
    }
  };

  // Xoá = chuyển vào thùng rác (khôi phục được); xoá vĩnh viễn chỉ ADMIN, trong thùng rác
  const handleDelete = async (banner: AdminBanner) => {
    await confirm({
      title: 'Chuyển banner vào thùng rác?',
      description: (
        <span>
          Banner <strong className="text-slate-900 font-bold">&ldquo;{banner.title}&rdquo;</strong> sẽ được gỡ khỏi trang chủ ngay.
          Bạn có thể khôi phục trong thùng rác trong vòng {trashSettings?.retentionDays ?? '—'} ngày
          {trashSettings?.autoPurgeEnabled === false
            ? '. Tự dọn đang tắt nên banner sẽ nằm trong thùng rác đến khi ADMIN dọn.'
            : ', sau đó hệ thống tự xoá vĩnh viễn cả ảnh.'}
        </span>
      ),
      confirmText: 'Chuyển vào thùng rác',
      cancelText: 'Hủy bỏ',
      variant: 'warning',
      onConfirm: async () => {
        await apiFetch(`/banners/${banner.id}`, { method: 'DELETE' });
        setBanners((prev) => prev.filter((b) => b.id !== banner.id));
        await loadTrash();
      },
      successMessage: 'Đã chuyển banner vào thùng rác',
    });
  };

  const handleRestore = async (banner: TrashedBanner) => {
    try {
      const restored = await apiFetch<AdminBanner>(`/banners/${banner.id}/restore`, { method: 'PATCH' });
      setTrash((prev) => prev.filter((b) => b.id !== banner.id));
      setBanners((prev) => [...prev, restored]);
      showToast(`Đã khôi phục "${banner.title}" — banner đang ở trạng thái ẩn, bật lại khi sẵn sàng`);
    } catch (err) {
      showError(err);
    }
  };

  const handlePurge = async (banner: TrashedBanner) => {
    await confirm({
      title: 'Xoá vĩnh viễn banner?',
      description: (
        <span>
          Banner <strong className="text-slate-900 font-bold">&ldquo;{banner.title}&rdquo;</strong> và toàn bộ tệp ảnh trên máy chủ
          sẽ bị xoá ngay. Thao tác này không thể hoàn tác.
        </span>
      ),
      confirmText: 'Xoá vĩnh viễn',
      cancelText: 'Hủy bỏ',
      variant: 'danger',
      onConfirm: async () => {
        await apiFetch(`/banners/${banner.id}/permanent`, { method: 'DELETE' });
        setTrash((prev) => prev.filter((b) => b.id !== banner.id));
      },
      successMessage: 'Đã xoá vĩnh viễn banner',
    });
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const next = [...banners];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    const previous = banners;
    setBanners(next);
    try {
      await apiFetch('/banners/reorder', { method: 'PATCH', body: JSON.stringify({ ids: next.map((b) => b.id) }) });
      showToast('Đã thay đổi thứ tự banner!');
    } catch (err) {
      setBanners(previous);
      showError(err);
    }
  };

  // Kéo thả sắp xếp Banner (Drag & Drop Reordering)
  const handleDragStart = (index: number, e: React.DragEvent) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = async (targetIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      handleDragEnd();
      return;
    }

    const next = [...banners];
    const [moved] = next.splice(draggedIndex, 1);
    next.splice(targetIndex, 0, moved);
    const previous = banners;
    setBanners(next);
    handleDragEnd();

    try {
      await apiFetch('/banners/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ ids: next.map((b) => b.id) }),
      });
      showToast('Đã cập nhật vị trí banner thành công!');
    } catch (err) {
      setBanners(previous);
      showError(err);
    }
  };

  // Kiểm tra kích thước ngay khi chọn ảnh (API vẫn kiểm tra lại); ảnh nhỏ bị kéo giãn full-width sẽ vỡ nét
  const handlePickFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth < BANNER_MIN_WIDTH) {
        URL.revokeObjectURL(url);
        setFieldErrors((prev) => ({
          ...prev,
          file: `Ảnh quá nhỏ (${img.naturalWidth}×${img.naturalHeight}px) sẽ bị vỡ nét. Cần chiều rộng tối thiểu ${BANNER_MIN_WIDTH}px, khuyến nghị ${BANNER_RECOMMENDED}.`,
        }));
        return;
      }
      setEditingBanner((prev) => (prev ? { ...prev, file, previewUrl: url } : prev));
      setFieldErrors((prev) => ({ ...prev, file: undefined }));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setFieldErrors((prev) => ({ ...prev, file: 'Không đọc được tệp ảnh này' }));
    };
    img.src = url;
  };

  const validateForm = (): boolean => {
    if (!editingBanner) return false;
    const errors: { file?: string; title?: string; alt?: string; linkUrl?: string } = {};

    const isNew = editingBanner.id === '';
    if (isNew && !editingBanner.file) {
      errors.file = 'Vui lòng chọn hình ảnh hiển thị cho banner mới (bắt buộc)';
    }

    if (!editingBanner.title.trim()) {
      errors.title = 'Vui lòng nhập tiêu đề banner';
    } else if (editingBanner.title.trim().length > 200) {
      errors.title = 'Tiêu đề không được vượt quá 200 ký tự';
    }

    if (!editingBanner.alt.trim()) {
      errors.alt = 'Vui lòng nhập mô tả ảnh (Alt text) cho SEO và hỗ trợ trợ năng';
    } else if (editingBanner.alt.trim().length > 300) {
      errors.alt = 'Mô tả hình ảnh không được vượt quá 300 ký tự';
    }

    // Ràng buộc tương hỗ: Nếu có nhập CTA text thì BẮT BUỘC phải có linkUrl
    const hasCta = editingBanner.ctaText.trim().length > 0;
    const link = editingBanner.linkUrl.trim();

    if (hasCta && !link) {
      errors.linkUrl = 'Đã nhập chữ nút kêu gọi (CTA) thì bắt buộc phải nhập đường dẫn liên kết đích';
    } else if (link && !/^(\/(?!\/)|https?:\/\/)\S*$/.test(link)) {
      errors.linkUrl = 'Đường dẫn phải bắt đầu bằng "/" (trang nội bộ) hoặc "https://" / "http://"';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    if (!validateForm()) {
      showToast('Vui lòng kiểm tra lại các trường thông tin bắt buộc');
      return;
    }

    const isNew = editingBanner.id === '';
    const form = new FormData();
    form.append('title', editingBanner.title.trim());
    form.append('alt', editingBanner.alt.trim());
    form.append('subtitle', editingBanner.subtitle.trim());
    form.append('ctaText', editingBanner.ctaText.trim());
    form.append('linkUrl', editingBanner.linkUrl.trim());
    form.append('isActive', String(editingBanner.isActive));
    if (editingBanner.file) form.append('image', editingBanner.file);

    setSaving(true);
    try {
      const saved = await apiFetch<AdminBanner>(isNew ? '/banners' : `/banners/${editingBanner.id}`, {
        method: isNew ? 'POST' : 'PATCH',
        body: form,
      });
      setBanners((prev) => (isNew ? [...prev, saved] : prev.map((b) => (b.id === saved.id ? saved : b))));
      setIsModalOpen(false);
      setEditingBanner(null);
      setFieldErrors({});
      showToast(isNew ? 'Đã thêm banner mới thành công!' : 'Đã cập nhật thông tin banner thành công!');
    } catch (err) {
      showError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateConfig = async <K extends keyof SwiperConfig>(key: K, value: SwiperConfig[K]) => {
    if (!swiperConfig) return;
    const previous = swiperConfig;
    const updated = { ...swiperConfig, [key]: value };
    setSwiperConfig(updated);
    try {
      const { version, ...body } = updated;
      // Lấy lại phiên bản mới từ phản hồi để lần chỉnh tiếp theo không bị coi là xung đột
      setSwiperConfig(
        await apiFetch<SwiperConfig>('/banners/settings/swiper', {
          method: 'PUT',
          headers: ifMatch(version),
          body: JSON.stringify(body),
        }),
      );
      showToast('Đã lưu cấu hình trình chiếu!');
    } catch (err) {
      if (isConflict(err)) {
        // Người khác vừa đổi cấu hình -> hiển thị giá trị mới nhất thay vì ghi đè
        setSwiperConfig(await apiFetch<SwiperConfig>('/banners/settings/swiper').catch(() => previous));
        showToast('Cấu hình trình chiếu vừa được người khác thay đổi — đã tải giá trị mới nhất, vui lòng chỉnh lại');
      } else {
        setSwiperConfig(previous);
        showError(err);
      }
    }
  };

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
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isAutoPlaying
                  ? 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                  : 'border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              {isAutoPlaying ? (
                <>
                  <Pause size={13} className="text-slate-500" />
                  <span>Tạm dừng trượt</span>
                </>
              ) : (
                <>
                  <Play size={13} className="text-amber-600 fill-amber-600" />
                  <span>Tiếp tục trượt</span>
                </>
              )}
            </button>

            {/* Nút xem toàn màn hình */}
            <button
              type="button"
              onClick={() => setIsFullscreenModal(true)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Xem toàn màn hình
            </button>
          </div>
        </div>

        {/* Màn hình hiển thị Banner (Mô phỏng 1:1 theo Swiper trang chủ) */}
        <div 
          className="relative w-full bg-slate-900 aspect-[1024/342] overflow-hidden select-none border-b border-slate-300 group"
          onMouseEnter={() => setIsHoveredPreview(true)}
          onMouseLeave={() => setIsHoveredPreview(false)}
        >
          {activeBannersList.length > 0 ? (
            <div className="w-full h-full relative overflow-hidden">
              {/* Dải băng chuyền trượt chuyển động mượt mà (Slide Carousel) */}
              <div 
                className="flex w-full h-full transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${previewIndex * 100}%)` }}
              >
                {activeBannersList.map((banner, idx) => (
                  <div key={banner.id || idx} className="w-full h-full flex-shrink-0 relative">
                    <img 
                      src={banner.imageUrl} 
                      alt={banner.alt ?? ''}
                      className="w-full h-full object-cover object-center" 
                    />
                  </div>
                ))}
              </div>
              
              {/* Badge thông tin Tiêu đề banner chuyển động mượt theo từng slide */}
              <div 
                key={previewIndex}
                className="absolute top-3 left-4 z-10 max-w-[85%] flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white border border-white/15 shadow-lg animate-in fade-in slide-in-from-left-2 duration-300 pointer-events-none"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#5F8A03] text-white shrink-0">
                  #{previewIndex + 1}/{activeBannersList.length}
                </span>
                <span className="text-xs font-semibold truncate">
                  {activeBannersList[previewIndex]?.title}
                </span>
                {activeBannersList[previewIndex]?.subtitle && (
                  <span className="text-xs text-slate-300 hidden md:inline truncate">
                    · {activeBannersList[previewIndex]?.subtitle}
                  </span>
                )}
                {activeBannersList[previewIndex]?.linkUrl && (
                  <span className="text-[11px] text-lime-400 hidden lg:inline-flex items-center gap-1 shrink-0 ml-1">
                    <Link2 size={11} /> Có link
                  </span>
                )}
              </div>

              {/* Nút mũi tên chuyển slide thủ công (hiện khi hover vào khung) */}
              {activeBannersList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setPreviewIndex((prev) => (prev - 1 + activeBannersList.length) % activeBannersList.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md hover:scale-105 active:scale-95"
                    aria-label="Banner trước"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewIndex((prev) => (prev + 1) % activeBannersList.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md hover:scale-105 active:scale-95"
                    aria-label="Banner kế tiếp"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Chấm tròn chuyển đổi banner - Căn giữa, tuân thủ cấu hình showDots */}
              {(swiperConfig?.showDots ?? true) && activeBannersList.length > 1 && (
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-10 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-md">
                  {activeBannersList.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewIndex(idx)}
                      aria-label={`Chuyển đến banner ${idx + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === previewIndex 
                          ? 'w-6 sm:w-7 bg-white shadow-xs' 
                          : 'w-2 bg-white/40 hover:bg-white/80'
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
                  Có {activeBannersList.length} banner đang được bật hiển thị · <span className="text-[#5F8A03] font-medium">Kéo thả ⋮⋮ hoặc dùng mũi tên ↑↓ để đổi vị trí</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFieldErrors({});
                    setEditingBanner(EMPTY_FORM);
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
              {loading && <p className="text-xs text-slate-500">Đang tải danh sách banner…</p>}
              {!loading && banners.length === 0 && (
                <p className="text-xs text-slate-500">Chưa có banner nào. Nhấn “Thêm Banner Mới” để tạo.</p>
              )}
              {banners.map((b, index) => {
                const isActive = b.isActive;
                const isItemDragged = draggedIndex === index;
                const isItemTarget = dragOverIndex === index && draggedIndex !== index;

                return (
                  <div 
                    key={b.id}
                    onDragOver={(e) => handleDragOver(index, e)}
                    onDrop={(e) => handleDrop(index, e)}
                    className={`bg-white rounded-xl p-4 border transition-all duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isItemDragged
                        ? 'opacity-40 border-dashed border-[#5F8A03] scale-[0.99] bg-[#F4F9E8]/20'
                        : isItemTarget
                        ? 'border-[#5F8A03] ring-2 ring-[#7CB305]/50 bg-[#F4F9E8]/40 shadow-md scale-[1.01]'
                        : isActive 
                        ? 'border-slate-300 shadow-2xs hover:border-slate-400' 
                        : 'border-dashed border-slate-300 opacity-60 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {/* Tay cầm kéo thả (Drag Handle) */}
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(index, e)}
                        onDragEnd={handleDragEnd}
                        className="p-1.5 -ml-1 text-slate-400 hover:text-[#5F8A03] hover:bg-[#F4F9E8] rounded-lg cursor-grab active:cursor-grabbing transition-colors shrink-0 flex items-center justify-center"
                        title="Nhấn giữ để kéo thả đổi vị trí"
                        aria-label="Kéo thả đổi vị trí banner"
                      >
                        <GripVertical size={19} />
                      </div>

                      {/* Ảnh thu nhỏ */}
                      <div className="relative w-full sm:w-44 h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-300">
                        <img 
                          src={b.imageUrl} 
                          alt={b.alt} 
                          className="w-full h-full object-cover" 
                        />
                        <span className="absolute top-1.5 left-1.5 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900/80 text-white">
                          Vị trí #{index + 1}
                        </span>
                      </div>
                    </div>

                    {/* Nội dung thông tin */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-slate-900 truncate">
                          {b.title}
                        </h5>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          isActive 
                            ? 'bg-[#F4F9E8] text-[#5F8A03] border-[#7CB305]/30' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {isActive ? 'Đang bật' : 'Đã ẩn'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        Mô tả ảnh: {b.alt}
                      </p>
                      <p className="text-xs text-[#5F8A03] font-medium truncate">
                        Đường dẫn đích: {b.linkUrl || 'Không có liên kết'}
                      </p>
                    </div>

                    {/* Nút thao tác */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {/* Đổi thứ tự lên xuống bằng phím mũi tên (WCAG 2.2 alternative) */}
                      <div className="flex items-center rounded-lg border border-slate-300 bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMove(index, 'up')}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 disabled:opacity-25 cursor-pointer border-r border-slate-200 transition-colors"
                          title="Di chuyển lên trên"
                          aria-label="Di chuyển lên trên"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={index === banners.length - 1}
                          onClick={() => handleMove(index, 'down')}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 disabled:opacity-25 cursor-pointer transition-colors"
                          title="Di chuyển xuống dưới"
                          aria-label="Di chuyển xuống dưới"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>

                      {/* Bật / Tắt */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(b.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                            : 'bg-[#F4F9E8] text-[#5F8A03] border-[#7CB305]/60 hover:bg-[#5F8A03] hover:text-white'
                        }`}
                      >
                        {isActive ? 'Ẩn đi' : 'Hiện lại'}
                      </button>

                      {/* Sửa */}
                      <button
                        type="button"
                        onClick={() => {
                          setFieldErrors({});
                          setEditingBanner(toForm(b));
                          setIsModalOpen(true);
                        }}
                        className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                        aria-label="Chỉnh sửa banner"
                      >
                        <Edit3 size={14} />
                      </button>

                      {/* Xóa */}
                      <button
                        type="button"
                        onClick={() => handleDelete(b)}
                        className="p-2 rounded-lg border border-rose-300 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                        title="Chuyển vào thùng rác"
                        aria-label="Chuyển vào thùng rác"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* THÙNG RÁC */}
            <div className="bg-white rounded-xl border border-slate-300 shadow-2xs">
              <button
                type="button"
                onClick={() => setIsTrashOpen((v) => !v)}
                aria-expanded={isTrashOpen}
                className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-slate-50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Trash2 size={15} className="text-slate-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900">Thùng rác ({trash.length})</div>
                    <div className="text-[11px] text-slate-500">
                      {!trashSettings
                        ? 'Đang tải cài đặt…'
                        : trashSettings.autoPurgeEnabled
                          ? `Giữ ${trashSettings.retentionDays} ngày, tự dọn lúc 03:00 hằng ngày`
                          : `Giữ ${trashSettings.retentionDays} ngày · Tự dọn đang tắt`}
                    </div>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-slate-500 shrink-0 transition-transform ${isTrashOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isTrashOpen && (
                <div className="border-t border-slate-200 p-3 space-y-2">
                  {/* Cài đặt dọn thùng rác: ADMIN chỉnh được, EDITOR chỉ xem lần dọn gần nhất */}
                  {trashSettings && (
                    <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-3">
                      {isAdmin && (
                        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                          <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={trashSettings.autoPurgeEnabled}
                              onChange={(e) => saveTrashSettings({ autoPurgeEnabled: e.target.checked })}
                              className="w-4 h-4 accent-[#5F8A03] rounded cursor-pointer shrink-0"
                            />
                            <span className="min-w-0">
                              <span className="block text-xs font-semibold text-slate-800">Tự động dọn lúc 03:00 hằng ngày</span>
                              <span className="block text-[11px] text-slate-400">
                                Xoá vĩnh viễn banner đã quá số ngày lưu. Tắt nếu muốn chỉ dọn thủ công.
                              </span>
                            </span>
                          </label>

                          <div className="flex items-center gap-2 shrink-0">
                            <label htmlFor="trash-retention" className="text-xs font-semibold text-slate-700">
                              Giữ
                            </label>
                            <input
                              id="trash-retention"
                              type="number"
                              min={1}
                              max={365}
                              value={retentionDraft}
                              onChange={(e) => setRetentionDraft(e.target.value)}
                              onBlur={handleSaveRetention}
                              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                              className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-center focus:outline-none focus:border-[#7CB305]"
                            />
                            <span className="text-xs text-slate-700">ngày</span>
                          </div>

                          <button
                            type="button"
                            onClick={handlePurgeExpired}
                            disabled={isPurging || expiredCount === 0}
                            title={expiredCount === 0 ? 'Chưa có banner nào quá hạn' : undefined}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-300 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5"
                          >
                            {isPurging && <Loader2 size={13} className="animate-spin" />}
                            <span>Dọn ngay ({expiredCount} quá hạn)</span>
                          </button>
                        </div>
                      )}

                      <p className="text-[11px] text-slate-500">
                        {trashSettings.lastRun
                          ? `Lần dọn gần nhất: ${formatDateTime(trashSettings.lastRun.at)} · ${
                              trashSettings.lastRun.by === 'cron' ? 'tự động' : `bởi @${trashSettings.lastRun.by}`
                            } · xoá ${trashSettings.lastRun.purged} banner`
                          : 'Chưa có lần dọn nào.'}
                      </p>
                    </div>
                  )}

                  {trash.length === 0 && <p className="text-xs text-slate-500 px-1 py-2">Thùng rác trống.</p>}
                  {trash.map((b) => {
                    const left = daysLeft(b.purgeAt);
                    return (
                      <div
                        key={b.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-dashed border-slate-300 bg-slate-50"
                      >
                        <div className="w-full sm:w-28 h-16 rounded-md overflow-hidden bg-slate-100 border border-slate-300 shrink-0">
                          <img src={b.imageUrl} alt={b.alt} className="w-full h-full object-cover grayscale" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="text-sm font-semibold text-slate-800 truncate">{b.title}</div>
                          <div className="text-[11px] text-slate-500 truncate">
                            Xoá lúc {formatDateTime(b.deletedAt)}
                            {b.deletedBy && ` bởi ${b.deletedBy.username ? `@${b.deletedBy.username}` : b.deletedBy.email}`}
                          </div>
                          <div className="text-[11px] font-semibold text-rose-600">
                            {left > 0
                              ? `Đủ hạn xoá vĩnh viễn sau ${left} ngày`
                              : trashSettings?.autoPurgeEnabled
                                ? 'Đã quá hạn — sẽ bị xoá trong lần tự dọn lúc 03:00'
                                : 'Đã quá hạn — tự dọn đang tắt, chờ ADMIN dọn'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRestore(b)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-remak-green/50 bg-remak-green-light text-remak-green-dark hover:bg-remak-green/15 hover:border-remak-green transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <RotateCcw size={13} />
                            <span>Khôi phục</span>
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handlePurge(b)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-300 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              Xoá vĩnh viễn
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                  <span className="font-bold text-[#5F8A03]">{((swiperConfig?.autoPlayInterval ?? 0) / 1000).toFixed(1)} giây</span>
                </div>
                <input 
                  type="range" 
                  min={2000} 
                  max={8000} 
                  step={500}
                  value={swiperConfig?.autoPlayInterval ?? 3500}
                  disabled={!swiperConfig}
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
                  checked={swiperConfig?.pauseOnHover ?? false}
                  disabled={!swiperConfig}
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
                  checked={swiperConfig?.showDots ?? false}
                  disabled={!swiperConfig}
                  onChange={(e) => handleUpdateConfig('showDots', e.target.checked)}
                  className="w-4 h-4 accent-[#5F8A03] rounded cursor-pointer"
                />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* CỬA SỔ THÊM / SỬA BANNER THEO CHUẨN UI/UX PRO MAX */}
      {isModalOpen && editingBanner && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !saving) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full my-auto shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 flex-shrink-0">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#5F8A03]" />
                  <span>{editingBanner.id === '' ? 'Thêm Banner Trang Chủ Mới' : 'Chỉnh Sửa Thông Tin Banner'}</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Các mục đánh dấu <span className="text-rose-500 font-bold">*</span> là bắt buộc để đảm bảo chất lượng hiển thị và tối ưu SEO
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Đóng (ESC)"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nội dung Form nhập liệu */}
            <form onSubmit={handleSaveBanner} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {/* PHẦN 1: HÌNH ẢNH BANNER (BẮT BUỘC KHI TẠO MỚI) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>1. Hình ảnh banner hiển thị</span>
                    <span className="text-rose-500 font-extrabold">*</span>
                    {editingBanner.id !== '' && (
                      <span className="text-[11px] text-slate-400 font-normal">(giữ ảnh hiện tại nếu không chọn ảnh mới)</span>
                    )}
                  </label>
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Tỷ lệ chuẩn 1024 × 342 px
                  </span>
                </div>

                {/* Vùng Dropzone Tải Ảnh */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handlePickFile(file);
                  }}
                  className={`relative rounded-xl border-2 transition-all overflow-hidden ${
                    fieldErrors.file
                      ? 'border-rose-400 bg-rose-50/40'
                      : isDragging
                      ? 'border-[#5F8A03] bg-[#5F8A03]/10 scale-[0.99]'
                      : editingBanner.previewUrl
                      ? 'border-slate-300 bg-slate-50'
                      : 'border-dashed border-slate-300 hover:border-[#5F8A03] bg-slate-50/60 hover:bg-[#5F8A03]/5'
                  }`}
                >
                  <input
                    type="file"
                    id="banner-file-input"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      if (file) handlePickFile(file);
                      e.target.value = ''; // cho phép chọn lại cùng tệp sau khi bị từ chối
                    }}
                    className="sr-only"
                  />

                  {editingBanner.previewUrl ? (
                    <div className="space-y-3 p-3">
                      <div className="relative aspect-[1024/342] w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                        <img
                          src={editingBanner.previewUrl}
                          alt="Xem trước ảnh banner"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[11px] font-semibold px-2.5 py-1 rounded backdrop-blur-xs flex items-center gap-1.5">
                          <ImageIcon size={12} />
                          <span>Ảnh xem trước</span>
                        </div>
                        {editingBanner.file && (
                          <div className="absolute top-2 right-2 bg-[#5F8A03]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                            {(editingBanner.file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-3 text-xs pt-1">
                        <span className="text-slate-600 truncate text-[11px]">
                          {editingBanner.file ? `Tệp mới chọn: ${editingBanner.file.name}` : 'Đang sử dụng ảnh đã lưu trên hệ thống'}
                        </span>
                        <label
                          htmlFor="banner-file-input"
                          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer shrink-0 transition-colors"
                        >
                          Thay ảnh khác
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="banner-file-input"
                      className="p-6 flex flex-col items-center justify-center text-center cursor-pointer space-y-2 block"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#5F8A03]/10 text-[#5F8A03] flex items-center justify-center">
                        <UploadCloud size={24} />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-800">
                          Nhấp để tải ảnh lên <span className="font-normal text-slate-500">hoặc kéo thả tệp vào đây</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          JPEG, PNG, WebP, AVIF — tối đa 10MB — rộng tối thiểu {BANNER_MIN_WIDTH}px, khuyến nghị {BANNER_RECOMMENDED}
                        </p>
                      </div>
                    </label>
                  )}
                </div>

                {fieldErrors.file && (
                  <p className="text-xs text-rose-600 font-medium flex items-center gap-1 pt-0.5">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{fieldErrors.file}</span>
                  </p>
                )}
              </div>

              {/* PHẦN 2: THÔNG TIN TIÊU ĐỀ & MÔ TẢ (TIÊU ĐỀ * VÀ THẺ ALT *) */}
              <div className="space-y-4 pt-1 border-t border-slate-200">
                {/* Tiêu đề Banner (BẮT BUỘC) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="banner-title" className="font-bold text-slate-800 flex items-center gap-1">
                      <span>2. Tiêu đề Banner</span>
                      <span className="text-rose-500 font-extrabold">*</span>
                    </label>
                    <span className={`text-[11px] ${editingBanner.title.length > 200 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                      {editingBanner.title.length} / 200
                    </span>
                  </div>
                  <input
                    id="banner-title"
                    type="text"
                    required
                    maxLength={200}
                    value={editingBanner.title}
                    onChange={(e) => {
                      setEditingBanner({ ...editingBanner, title: e.target.value });
                      if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: undefined }));
                    }}
                    placeholder="Ví dụ: Tấm ốp chống cháy MGO Remak - Tiêu chuẩn PCCC hàng đầu"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-all focus:outline-none ${
                      fieldErrors.title
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-slate-300 focus:border-[#5F8A03] focus:bg-white'
                    }`}
                  />
                  {fieldErrors.title && (
                    <p className="text-xs text-rose-600 font-medium flex items-center gap-1 pt-0.5">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{fieldErrors.title}</span>
                    </p>
                  )}
                </div>

                {/* Phụ đề Banner (TÙY CHỌN) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="banner-subtitle" className="font-semibold text-slate-700 flex items-center gap-1">
                      <span>Phụ đề / Thông điệp bổ sung</span>
                      <span className="text-[11px] text-slate-400 font-normal">(Tùy chọn)</span>
                    </label>
                    <span className={`text-[11px] ${editingBanner.subtitle.length > 300 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                      {editingBanner.subtitle.length} / 300
                    </span>
                  </div>
                  <input
                    id="banner-subtitle"
                    type="text"
                    maxLength={300}
                    value={editingBanner.subtitle}
                    onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                    placeholder="Ví dụ: Đạt chứng nhận chống cháy EI 120, khả năng chịu nhiệt độ cao 1200°C"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium focus:outline-none focus:border-[#5F8A03]"
                  />
                </div>

                {/* Mô tả hình ảnh Thẻ Alt (BẮT BUỘC CHO SEO & ACCESSIBILITY) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="banner-alt" className="font-bold text-slate-800 flex items-center gap-1">
                      <span>3. Mô tả hình ảnh (Thẻ Alt SEO & Tiếp cận)</span>
                      <span className="text-rose-500 font-extrabold">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {editingBanner.title && editingBanner.alt !== editingBanner.title && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBanner({ ...editingBanner, alt: editingBanner.title });
                            if (fieldErrors.alt) setFieldErrors((prev) => ({ ...prev, alt: undefined }));
                          }}
                          className="text-[11px] font-semibold text-[#5F8A03] hover:text-[#4E7202] hover:underline flex items-center gap-1 cursor-pointer"
                          title="Sao chép nhanh từ Tiêu đề Banner"
                        >
                          <Sparkles size={11} />
                          <span>Lấy theo tiêu đề</span>
                        </button>
                      )}
                      <span className={`text-[11px] ${editingBanner.alt.length > 300 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                        {editingBanner.alt.length} / 300
                      </span>
                    </div>
                  </div>
                  <input
                    id="banner-alt"
                    type="text"
                    required
                    maxLength={300}
                    value={editingBanner.alt}
                    onChange={(e) => {
                      setEditingBanner({ ...editingBanner, alt: e.target.value });
                      if (fieldErrors.alt) setFieldErrors((prev) => ({ ...prev, alt: undefined }));
                    }}
                    placeholder="Mô tả nội dung hình ảnh để Google và người khiếm thị nhận diện"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-all focus:outline-none ${
                      fieldErrors.alt
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-slate-300 focus:border-[#5F8A03]'
                    }`}
                  />
                  <p className="text-[11px] text-slate-500">
                    Bắt buộc theo chuẩn WCAG 2.1: Giúp bot Google lập chỉ mục SEO và phần mềm đọc màn hình hỗ trợ người dùng.
                  </p>
                  {fieldErrors.alt && (
                    <p className="text-xs text-rose-600 font-medium flex items-center gap-1 pt-0.5">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{fieldErrors.alt}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* PHẦN 3: ĐIỀU HƯỚNG & NÚT BẤM (RÀNG BUỘC TƯƠNG HỖ UX) */}
              <div className="space-y-3 pt-1 border-t border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Chữ nút kêu gọi CTA (TÙY CHỌN) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor="banner-cta" className="font-semibold text-slate-700">
                        <span>Chữ nút kêu gọi (CTA)</span>
                        <span className="text-[11px] text-slate-400 font-normal ml-1">(Tùy chọn)</span>
                      </label>
                      <span className="text-[11px] text-slate-400">{editingBanner.ctaText.length} / 100</span>
                    </div>
                    <input
                      id="banner-cta"
                      type="text"
                      maxLength={100}
                      value={editingBanner.ctaText}
                      onChange={(e) => setEditingBanner({ ...editingBanner, ctaText: e.target.value })}
                      placeholder="Ví dụ: Khám phá ngay, Xem báo giá..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium focus:outline-none focus:border-[#5F8A03]"
                    />
                  </div>

                  {/* Đường dẫn mở ra (BẮT BUỘC NẾU CÓ NÚT CTA) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor="banner-link" className="font-semibold text-slate-800 flex items-center gap-1">
                        <Link2 size={13} className="text-slate-400" />
                        <span>Đường dẫn đích (Link URL)</span>
                        {editingBanner.ctaText.trim().length > 0 ? (
                          <span className="text-rose-500 font-extrabold text-[11px]">* (Bắt buộc vì có nút CTA)</span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-normal">(Tùy chọn)</span>
                        )}
                      </label>
                    </div>
                    <input
                      id="banner-link"
                      type="text"
                      maxLength={500}
                      value={editingBanner.linkUrl}
                      onChange={(e) => {
                        setEditingBanner({ ...editingBanner, linkUrl: e.target.value });
                        if (fieldErrors.linkUrl) setFieldErrors((prev) => ({ ...prev, linkUrl: undefined }));
                      }}
                      placeholder="/san-pham/tam-mgo hoặc https://..."
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-all focus:outline-none ${
                        fieldErrors.linkUrl
                          ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                          : 'border-slate-300 focus:border-[#5F8A03]'
                      }`}
                    />
                    {fieldErrors.linkUrl && (
                      <p className="text-xs text-rose-600 font-medium flex items-center gap-1 pt-0.5">
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{fieldErrors.linkUrl}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* PHẦN 4: TRẠNG THÁI HIỂN THỊ */}
              <div className="pt-2 border-t border-slate-200">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 cursor-pointer select-none transition-colors">
                  <input
                    type="checkbox"
                    id="activeCheck"
                    checked={editingBanner.isActive}
                    onChange={(e) => setEditingBanner({ ...editingBanner, isActive: e.target.checked })}
                    className="w-4 h-4 accent-[#5F8A03] rounded cursor-pointer"
                  />
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800">
                      Bật hiển thị banner này trên trang chủ ngay sau khi lưu
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Khi tắt, banner sẽ ở trạng thái ẩn và không xuất hiện ngoài giao diện người xem.
                    </div>
                  </div>
                </label>
              </div>

              {/* PHẦN FOOTER CỦA FORM */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
                <span className="text-xs text-slate-400">
                  {editingBanner.id === '' ? 'Đang tạo mới banner' : `Đang chỉnh sửa banner #${editingBanner.id}`}
                </span>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Đang lưu dữ liệu...</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>{editingBanner.id === '' ? 'Thêm Banner Mới' : 'Lưu Thay Đổi'}</span>
                      </>
                    )}
                  </button>
                </div>
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
            <div className="w-full max-w-7xl aspect-[1024/342] relative rounded-xl overflow-hidden shadow-2xl border border-white/20 group">
              {/* Dải băng chuyền trượt chuyển động mượt mà */}
              <div 
                className="flex w-full h-full transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${previewIndex * 100}%)` }}
              >
                {activeBannersList.map((banner, idx) => (
                  <div key={banner.id || idx} className="w-full h-full flex-shrink-0 relative">
                    <img 
                      src={banner.imageUrl} 
                      alt={banner.alt ?? ''}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ))}
              </div>

              {/* Badge tiêu đề */}
              <div 
                key={previewIndex}
                className="absolute top-4 left-6 bg-slate-900/85 backdrop-blur-md px-4 py-2 rounded-lg text-white text-sm font-semibold border border-white/15 shadow-xl animate-in fade-in slide-in-from-left-2 duration-300"
              >
                Banner {previewIndex + 1} / {activeBannersList.length}: {activeBannersList[previewIndex]?.title}
              </div>

              {/* Nút mũi tên chuyển slide */}
              {activeBannersList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setPreviewIndex((prev) => (prev - 1 + activeBannersList.length) % activeBannersList.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all cursor-pointer shadow-lg hover:scale-105"
                    aria-label="Banner trước"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewIndex((prev) => (prev + 1) % activeBannersList.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all cursor-pointer shadow-lg hover:scale-105"
                    aria-label="Banner kế tiếp"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}

              {/* Dots nếu bật showDots */}
              {(swiperConfig?.showDots ?? true) && activeBannersList.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  {activeBannersList.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewIndex(idx)}
                      className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === previewIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-white text-xs font-medium">
            <button 
              type="button"
              onClick={() => setPreviewIndex((prev) => (prev - 1 + activeBannersList.length) % activeBannersList.length)}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft size={14} /> Trước
            </button>
            <span className="font-bold text-sm">{previewIndex + 1} / {activeBannersList.length}</span>
            <button 
              type="button"
              onClick={() => setPreviewIndex((prev) => (prev + 1) % activeBannersList.length)}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              Kế tiếp <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
