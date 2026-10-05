'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface QuickQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialApplication?: string;
  initialThickness?: string;
  initialArea?: string;
  title?: string;
}

export default function QuickQuoteModal({
  isOpen,
  onClose,
  initialApplication = 'Bọc Ống Gió PCCC (EI 30 – EI 120)',
  initialThickness = '',
  initialArea = '',
  title = 'Nhận Báo Giá Nhanh Trong 2 Giờ',
}: QuickQuoteModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [application, setApplication] = useState(initialApplication);
  const [thickness, setThickness] = useState(initialThickness);
  const [area, setArea] = useState(initialArea);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);

  // Sync initial props when opened
  useEffect(() => {
    if (isOpen) {
      if (initialApplication) setApplication(initialApplication);
      if (initialThickness) setThickness(initialThickness);
      if (initialArea) setArea(initialArea);
      setSubmitted(false);
      setError('');
    }
  }, [isOpen, initialApplication, initialThickness, initialArea]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên của Bạn.');
      return;
    }

    const cleanPhone = phone.replace(/[\s.-]/g, '');
    if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(cleanPhone)) {
      setError('Vui lòng nhập số điện thoại hợp lệ (10 chữ số).');
      return;
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setSubmitted(true);
    } catch {
      setError('Đã có lỗi xảy ra. Vui lòng gọi trực tiếp hotline 0902.441.981.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-quote-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7CB305] animate-pulse" />
            <h3 id="quick-quote-title" className="text-base font-bold text-white">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ báo giá"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#F4F9E8] border-2 border-[#5F8A03] text-[#5F8A03] flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900">
                  Gửi Yêu Cầu Thành Công!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Cảm ơn <strong>{fullName}</strong>. Kỹ sư Remak sẽ liên hệ lại qua số <strong>{phone}</strong> trong vòng <strong>2 giờ</strong> để tư vấn phương án và gửi bảng báo giá chiết khấu.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#5F8A03] hover:bg-[#4D7002] text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  Hoàn tất & Đóng cửa sổ
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <p className="text-xs text-slate-500">
                Để lại thông tin để kỹ sư Remak gửi báo giá kèm file CAD và chứng chỉ PCCC trong 2 giờ.
              </p>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="modal-name" className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên của Bạn <span className="text-rose-500">*</span>
                </label>
                <input
                  id="modal-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VD: Anh Tuấn / Chị Lan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7CB305] focus:border-[#7CB305]"
                />
              </div>

              <div>
                <label htmlFor="modal-phone" className="block text-xs font-bold text-slate-700 mb-1">
                  Số điện thoại / Zalo nhận báo giá <span className="text-rose-500">*</span>
                </label>
                <input
                  id="modal-phone"
                  type="tel"
                  inputMode="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0902 441 981"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7CB305] focus:border-[#7CB305]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="modal-app" className="block text-xs font-bold text-slate-700 mb-1">
                    Ứng dụng thi công
                  </label>
                  <select
                    id="modal-app"
                    value={application}
                    onChange={(e) => setApplication(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white"
                  >
                    <option value="Bọc Ống Gió PCCC (EI 30 – EI 120)">Bọc Ống Gió PCCC</option>
                    <option value="Vách Ngăn Chống Cháy (EI 60 – EI 150)">Vách Ngăn Chống Cháy</option>
                    <option value="Sàn Kỹ Thuật Chịu Lực (REI 60 – REI 180)">Sàn Chịu Lực / Gác Lửng</option>
                    <option value="Lõi Cửa Thép Chống Cháy">Lõi Cửa Chống Cháy</option>
                    <option value="Khác">Ứng dụng khác</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="modal-area" className="block text-xs font-bold text-slate-700 mb-1">
                    Khối lượng dự kiến
                  </label>
                  <input
                    id="modal-area"
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="VD: 100 m² hoặc 80 tấm"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="modal-note" className="block text-xs font-bold text-slate-700 mb-1">
                  Yêu cầu kỹ thuật / Địa điểm công trình
                </label>
                <input
                  id="modal-note"
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="VD: Công trình tại Bắc Ninh, cần mức EI 60..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#F26522] to-[#EA580C] hover:from-[#EA580C] hover:to-[#D95314] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Đang gửi thông tin...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>GỬI YÊU CẦU – SALES GỌI LẠI TRONG 2 GIỜ</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-[#5F8A03]" /> Phản hồi trong 2h
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-[#5F8A03]" /> Bảo mật thông tin
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
