'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import AdminHeader from '@/cms/components/AdminHeader';

interface FaqItem {
  id: string;
  q: string;
  a: string;
  active?: boolean;
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    q: 'Tấm MGO có được Cục Cảnh sát PCCC nghiệm thu thực tế không?',
    a: 'Có. Tấm MGO Remak® là vật liệu không cháy nhóm A1 theo QCVN 06:2022/BXD. Khi thi công theo hệ thống kết cấu đã được đốt thử nghiệm (kết hợp bông khoáng và khung kẽm), công trình hoàn toàn đủ điều kiện nghiệm thu PCCC các mức EI 15 đến EI 120.',
    active: true,
  },
  {
    id: 'faq-2',
    q: 'Tấm MGO bọc ống gió nên chọn độ dày mấy mm?',
    a: 'Theo yêu cầu thiết kế PCCC: Ống gió EI 45 – EI 60 thường dùng tấm 8mm; Ống gió EI 90 – EI 120 dùng tấm 10mm hoặc 12mm kết hợp lớp bông khoáng Rockwool theo cấu tạo kiểm định.',
    active: true,
  },
  {
    id: 'faq-3',
    q: 'Tấm MGO có bị rỉ sắt đinh vít và chảy mồ hôi như các loại trước đây không?',
    a: 'Hoàn toàn KHÔNG. Remak® MGO sử dụng công thức muối Sulfate (MgSO4) thế hệ mới, loại bỏ muối Clorua ăn mòn kim loại, hàm lượng Ion Clo dưới 0.05%, cam kết không bao giờ rỉ sét khung xương hay ứa nước mùa nồm.',
    active: true,
  },
  {
    id: 'faq-4',
    q: 'Tấm MGO 18mm có làm được sàn gác lửng xe máy đi lại được không?',
    a: 'Rất tốt. Với hệ xương sắt hộp khẩu độ 40 × 40cm, tấm MGO 18mm có khả năng chịu tải trọng tĩnh trên 800kg/m², nhẹ hơn bê tông 70%, chống nước và mối mọt vượt trội hơn ván ép.',
    active: true,
  },
  {
    id: 'faq-5',
    q: 'Tôi có được cấp hồ sơ kiểm định PCCC khi mua tấm MGO không?',
    a: 'Khi mua hàng cho dự án, Remak cung cấp bản sao kết quả thử nghiệm đốt mẫu của Viện Khoa học Công nghệ Xây dựng (IBST) kèm chứng chỉ CO/CQ xuất xưởng đầy đủ.',
    active: true,
  },
];

export default function AdminFaqManagerPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);
  const [openPreviewIdx, setOpenPreviewIdx] = useState<number | null>(0);
  const [editingItem, setEditingItem] = useState<FaqItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('remak_admin_faqs_data');
      if (saved) setFaqs(JSON.parse(saved));
    } catch {
      // Dùng mặc định
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReset = () => {
    if (confirm('Khôi phục danh sách câu hỏi thường gặp về mặc định ban đầu?')) {
      setFaqs(DEFAULT_FAQS);
      localStorage.removeItem('remak_admin_faqs_data');
      showToast('Đã khôi phục dữ liệu mặc định!');
    }
  };

  const handleDelete = (id: string) => {
    if (faqs.length <= 1) {
      alert('Phải giữ lại ít nhất 1 câu hỏi!');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      const updated = faqs.filter(f => f.id !== id);
      setFaqs(updated);
      localStorage.setItem('remak_admin_faqs_data', JSON.stringify(updated));
      showToast('Đã xóa câu hỏi thành công!');
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = faqs.map(f => f.id === id ? { ...f, active: f.active === false ? true : false } : f);
    setFaqs(updated);
    localStorage.setItem('remak_admin_faqs_data', JSON.stringify(updated));
    showToast('Đã cập nhật trạng thái hiển thị!');
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    let updated: FaqItem[];
    if (editingItem.id === 'new') {
      const newItem = { ...editingItem, id: `faq-${Date.now()}` };
      updated = [...faqs, newItem];
    } else {
      updated = faqs.map(f => f.id === editingItem.id ? editingItem : f);
    }

    setFaqs(updated);
    localStorage.setItem('remak_admin_faqs_data', JSON.stringify(updated));
    setIsModalOpen(false);
    setEditingItem(null);
    showToast('Đã lưu câu hỏi thành công!');
  };

  // Google Schema JSON-LD Generator
  const schemaCode = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.filter(f => f.active !== false).map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a
      }
    }))
  }, null, 2);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <AdminHeader 
        title="Quản Lý Câu Hỏi Thường Gặp" 
        subtitle="Quản trị danh sách giải đáp thắc mắc và cấu trúc dữ liệu tìm kiếm Google"
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
              Danh Sách Câu Hỏi Thường Gặp
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Nội dung hiển thị tại mục số 10 ở cuối trang chủ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSchemaModal(true)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Mã Dữ Liệu Cấu Trúc Schema
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Khôi phục mặc định
            </button>
            <a
              href="/#homepage-faq"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold transition-colors"
            >
              Xem ngoài trang chủ
            </a>
          </div>
        </div>

        {/* 2 CỘT: DANH SÁCH QUẢN LÝ VÀ XEM TRƯỚC */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CỘT 1: DANH SÁCH CÂU HỎI FAQ (7/12) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs font-bold text-slate-700">
                Tổng cộng {faqs.length} câu hỏi đang quản lý
              </span>

              <button
                type="button"
                onClick={() => {
                  setEditingItem({
                    id: 'new',
                    q: 'Tấm MGO có bị nứt khi bắn đinh vít tự khoan không?',
                    a: 'Không. Tấm MGO Remak® gia cường 2 lớp lưới sợi thủy tinh độ dai uốn cao, cho phép bắn vít sát mép 10mm mà không bị nứt vỡ cạnh như tấm thạch cao hay calcium silicate.',
                    active: true
                  });
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Thêm Câu Hỏi Mới
              </button>
            </div>

            <div className="space-y-3">
              {faqs.map((f, idx) => {
                const isActive = f.active !== false;
                return (
                  <div
                    key={f.id}
                    className={`bg-white rounded-xl p-4 border transition-colors space-y-2 ${
                      isActive ? 'border-slate-200 shadow-2xs' : 'border-dashed border-slate-300 bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {f.q}
                        </h5>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(f.id)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                            isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {isActive ? 'Hiện' : 'Ẩn'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(f);
                            setIsModalOpen(true);
                          }}
                          className="px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(f.id)}
                          className="px-2 py-0.5 rounded border border-rose-200 hover:bg-rose-50 text-rose-600 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pl-7">
                      {f.a}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CỘT 2: XEM TRƯỚC HIỂN THỊ THỰC TẾ (5/12) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 pb-2.5 border-b border-slate-100">
                Xem Trước Hiển Thị Trên Trang Chủ
              </h4>

              <div className="space-y-2.5">
                {faqs.filter(f => f.active !== false).map((faq, idx) => {
                  const isOpen = openPreviewIdx === idx;
                  return (
                    <div key={faq.id} className="rounded-lg border border-slate-200 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenPreviewIdx(isOpen ? null : idx)}
                        className="w-full p-3.5 text-left font-semibold text-xs text-slate-900 flex items-center justify-between gap-2.5 hover:text-[#5F8A03] bg-white transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown size={14} className={`transition-transform shrink-0 ${isOpen ? 'rotate-180 text-[#5F8A03]' : 'text-slate-400'}`} />
                      </button>
                      {isOpen && (
                        <div className="px-3.5 pb-3.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50 pt-2.5">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* CỬA SỔ THÊM / SỬA CÂU HỎI */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-slate-900">
                {editingItem.id === 'new' ? 'Thêm Câu Hỏi Mới' : 'Chỉnh Sửa Câu Hỏi'}
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
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nội dung câu hỏi *</label>
                <input
                  type="text"
                  required
                  value={editingItem.q}
                  onChange={(e) => setEditingItem({ ...editingItem, q: e.target.value })}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:border-[#5F8A03]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nội dung câu trả lời chi tiết *</label>
                <textarea
                  rows={4}
                  required
                  value={editingItem.a}
                  onChange={(e) => setEditingItem({ ...editingItem, a: e.target.value })}
                  placeholder="Nhập câu trả lời giải đáp..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs leading-relaxed focus:outline-none focus:border-[#5F8A03]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={editingItem.active !== false}
                  onChange={(e) => setEditingItem({ ...editingItem, active: e.target.checked })}
                  className="w-4 h-4 accent-[#5F8A03] rounded cursor-pointer"
                />
                <label htmlFor="activeCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Hiển thị câu hỏi này trên trang chủ
                </label>
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
                  {editingItem.id === 'new' ? 'Thêm Câu Hỏi' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CỬA SỔ SCHEMA JSON-LD */}
      {showSchemaModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">Mã Cấu Trúc Dữ Liệu Google FAQPage</h4>
                <p className="text-xs text-slate-500 mt-0.5">Tự động đồng bộ chuẩn Rich Results theo các câu hỏi đang bật</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSchemaModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="relative">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-[11px] font-mono overflow-x-auto max-h-80 leading-relaxed">
                {schemaCode}
              </pre>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(schemaCode);
                  showToast('Đã sao chép mã Schema JSON-LD vào bộ nhớ tạm!');
                }}
                className="px-4 py-2 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Sao Chép Mã Schema
              </button>
              <button
                type="button"
                onClick={() => setShowSchemaModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
