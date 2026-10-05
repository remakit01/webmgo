'use client';

import React, { useState } from 'react';
import {
  Send,
  Phone,
  Clock,
  ShieldCheck,
  Award,
  CheckCircle2,
  FileCheck,
  Layers,
  Building,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';

const APPLICATIONS_OPTIONS = [
  'Bọc Ống Gió PCCC (EI 30 – EI 120)',
  'Vách Ngăn Chống Cháy (EI 60 – EI 150)',
  'Sàn Kỹ Thuật / Gác Lửng Chịu Lực (REI 60 – REI 180)',
  'Lõi Cửa Thép Chống Cháy',
  'Vách Trần Nhà Xưởng KCN',
  'Khác (Cần kỹ sư tư vấn khảo sát)',
];

const TRUST_METRICS = [
  {
    icon: Clock,
    title: 'Phản hồi trong 2 giờ',
    desc: 'Kỹ sư chuyên trách liên hệ ngay trong giờ hành chính',
  },
  {
    icon: Award,
    title: 'Giá gốc từ nhà máy',
    desc: 'Chiết khấu trực tiếp cho nhà thầu, xưởng gia công & dự án',
  },
  {
    icon: FileCheck,
    title: 'Hồ sơ PCCC công chứng',
    desc: 'Cung cấp kết quả đốt lò mẫu IBST + File CAD thi công',
  },
  {
    icon: ShieldCheck,
    title: 'Tổng kho HN & TP.HCM',
    desc: 'Sẵn hàng số lượng lớn, giao nhanh 24h - 48h tận công trình',
  },
];

interface HomeLeadQuoteFormProps {
  initialApplication?: string;
  initialArea?: string;
  initialThickness?: string;
}

export default function HomeLeadQuoteForm({
  initialApplication = '',
  initialArea = '',
  initialThickness = '',
}: HomeLeadQuoteFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    application: initialApplication || APPLICATIONS_OPTIONS[0],
    area: initialArea || '',
    thickness: initialThickness || '',
    location: '',
    note: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/[\s.-]/g, '');
    return /^(0[3|5|7|8|9])[0-9]{8}$/.test(cleanPhone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên của Bạn.');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setErrorMessage('Số điện thoại không hợp lệ. Vui lòng nhập số di động 10 chữ số (VD: 0902441981).');
      return;
    }

    setLoading(true);

    try {
      // Simulate API submission (or replace with real lead endpoint if available)
      await new Promise((resolve) => setTimeout(resolve, 900));
      setSubmitted(true);
    } catch {
      setErrorMessage('Đã có lỗi xảy ra trong quá trình gửi yêu cầu. Xin vui lòng gọi trực tiếp Hotline 0902.441.981 để được hỗ trợ ngay!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="form-bao-gia-chuyen-sau"
      aria-label="Form yêu cầu báo giá tấm chống cháy MGO Remak"
      className="max-w-[1440px] mx-auto px-4 lg:px-8 font-sans scroll-mt-24"
    >
      <SectionHeading
        title="Gửi Yêu Cầu Báo Giá Kỹ Thuật & Chiết Khấu Dự Án"
      />

      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* ── CỘT TRÁI: FORM ĐIỀN THÔNG TIN (7/12) ── */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
            {submitted ? (
              <div className="my-auto py-12 text-center space-y-5 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-[#F4F9E8] border-2 border-[#5F8A03] text-[#5F8A03] flex items-center justify-center mx-auto shadow-lg shadow-green-600/20">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">
                    Đã Nhận Yêu Cầu Báo Giá Thành Công!
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                    Cảm ơn <strong className="text-slate-900">{formData.fullName}</strong>. Kỹ sư chuyên trách của Remak sẽ liên hệ lại với Bạn qua số điện thoại <strong className="text-[#5F8A03]">{formData.phone}</strong> trong vòng <strong>2 giờ làm việc</strong> để gửi bảng bóc tách và báo giá chiết khấu dự án.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-xs text-slate-600 space-y-1.5 text-left">
                  <div className="font-bold text-slate-800 text-xs mb-2">Hồ sơ sẽ gửi kèm báo giá:</div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 size={13} className="text-[#5F8A03]" />
                    <span>Bảng báo giá vật tư chi tiết theo m² & số tấm</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 size={13} className="text-[#5F8A03]" />
                    <span>Bản sao kết quả thử nghiệm đốt lò mẫu IBST QCVN 06:2022</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 size={13} className="text-[#5F8A03]" />
                    <span>Bộ file CAD (.dwg) bản vẽ chi tiết thi công mẫu</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        fullName: '',
                        phone: '',
                        application: APPLICATIONS_OPTIONS[0],
                        area: '',
                        thickness: '',
                        location: '',
                        note: '',
                      });
                    }}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                  >
                    Gửi thêm yêu cầu khác
                  </button>

                  <a
                    href="tel:0902441981"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#F26522] text-white text-xs font-bold shadow-md hover:bg-[#D95314] transition-all"
                  >
                    <Phone size={13} />
                    <span>Cần báo giá gấp? Gọi ngay: 0902.441.981</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F8A03] bg-[#F4F9E8] px-2.5 py-1 rounded-md border border-[#5F8A03]/20 inline-block mb-2">
                    Tiếp nhận thông tin 24/7
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                    Điền Thông Tin Công Trình Của Bạn
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Chỉ mất chưa đầy 60 giây — Đội ngũ kỹ sư sẽ tính toán định mức và gửi báo giá chính xác nhất.
                  </p>
                </div>

                {errorMessage && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2"
                  >
                    <span className="font-bold">Lỗi:</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Họ và tên */}
                  <div>
                    <label htmlFor="lead-fullname" className="block text-xs font-bold text-slate-700 mb-1.5">
                      Họ và tên của Bạn <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="lead-fullname"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="VD: Nguyễn Văn Nam"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7CB305] focus:border-[#7CB305] transition-all bg-white"
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label htmlFor="lead-phone" className="block text-xs font-bold text-slate-700 mb-1.5">
                      Số điện thoại / Zalo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="lead-phone"
                      type="tel"
                      inputMode="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="VD: 0902 441 981"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7CB305] focus:border-[#7CB305] transition-all bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Ứng dụng thi công */}
                  <div>
                    <label htmlFor="lead-app" className="block text-xs font-bold text-slate-700 mb-1.5">
                      Ứng dụng cần thi công
                    </label>
                    <select
                      id="lead-app"
                      value={formData.application}
                      onChange={(e) => setFormData({ ...formData, application: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7CB305] focus:border-[#7CB305] transition-all bg-white cursor-pointer"
                    >
                      {APPLICATIONS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Diện tích / Khối lượng */}
                  <div>
                    <label htmlFor="lead-area" className="block text-xs font-bold text-slate-700 mb-1.5">
                      Diện tích ước tính (m² hoặc số tấm)
                    </label>
                    <input
                      id="lead-area"
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      placeholder="VD: 150 m² hoặc 100 tấm"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7CB305] focus:border-[#7CB305] transition-all bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Địa điểm công trình */}
                  <div>
                    <label htmlFor="lead-location" className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tỉnh / Thành phố công trình
                    </label>
                    <input
                      id="lead-location"
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="VD: Hà Nội, Bắc Ninh, TP.HCM..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7CB305] focus:border-[#7CB305] transition-all bg-white"
                    />
                  </div>

                  {/* Độ dày quan tâm */}
                  <div>
                    <label htmlFor="lead-thickness" className="block text-xs font-bold text-slate-700 mb-1.5">
                      Độ dày dự kiến (nếu có)
                    </label>
                    <select
                      id="lead-thickness"
                      value={formData.thickness}
                      onChange={(e) => setFormData({ ...formData, thickness: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7CB305] focus:border-[#7CB305] transition-all bg-white cursor-pointer"
                    >
                      <option value="">Chưa xác định (Cần tư vấn theo EI)</option>
                      <option value="5mm">5mm (Lõi cửa / Ống gió EI 30)</option>
                      <option value="8mm">8mm (Ống gió EI 60)</option>
                      <option value="10mm">10mm (Ống gió EI 90 / Vách EI 60)</option>
                      <option value="12mm">12mm (Ống gió EI 120 / Vách EI 120)</option>
                      <option value="15mm">15mm (Sàn gác lửng nhẹ REI 60)</option>
                      <option value="18mm">18mm (Sàn kỹ thuật chịu lực REI 120)</option>
                    </select>
                  </div>
                </div>

                {/* Ghi chú thêm */}
                <div>
                  <label htmlFor="lead-note" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ghi chú thêm về yêu cầu kỹ thuật (hoặc link bản vẽ)
                  </label>
                  <textarea
                    id="lead-note"
                    rows={2}
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="VD: Cần cấp chứng chỉ IBST đốt lò cho ống gió EI 60, tiến độ giao hàng trước ngày 15..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7CB305] focus:border-[#7CB305] transition-all bg-white resize-none"
                  />
                </div>

                {/* Nút bấm Gửi Yêu Cầu */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#F26522] via-[#FF7A30] to-[#EA580C] hover:from-[#EA580C] hover:to-[#D95314] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-orange-600/30 hover:shadow-orange-600/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Đang gửi thông tin...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>GỬI YÊU CẦU BÁO GIÁ – SALES GỌI LẠI TRONG 2 GIỜ</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center mt-2.5">
                    <ShieldCheck size={13} className="text-[#5F8A03]" />
                    <span>Cam kết bảo mật 100% dữ liệu dự án. Không spam, không chia sẻ cho bên thứ ba.</span>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* ── CỘT PHẢI: LÝ DO CHỌN REMAK & SOCIAL PROOF (5/12) ── */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-10 lg:p-12 text-white flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#7CB305] bg-[#7CB305]/15 border border-[#7CB305]/30 px-2.5 py-1 rounded-full inline-block mb-3">
                  Cam Kết Chất Lượng Hàng Đầu
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Tại Sao Hơn 1.200+ Nhà Thầu & Xưởng Tin Dùng MGO Remak®?
                </h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Remak là đơn vị tiên phong sản xuất tấm MGO công thức Sunfat cao cấp, giải quyết triệt để vấn đề rỉ sét ốc vít và ẩm mốc của vật liệu truyền thống.
                </p>
              </div>

              {/* 4 Trụ Cột Cam Kết */}
              <div className="space-y-4">
                {TRUST_METRICS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3.5 p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#5F8A03]/30 border border-[#7CB305]/40 flex items-center justify-center flex-shrink-0 text-[#7CB305] mt-0.5">
                        <Icon size={16} />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white mb-0.5">{item.title}</h5>
                        <p className="text-[11px] text-slate-300 leading-normal">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chân cột phải: Hotline & Zalo khẩn cấp */}
            <div className="pt-6 border-t border-white/10 mt-6 space-y-3">
              <div className="text-[11px] text-slate-400">
                Cần bản vẽ CAD gấp hoặc tư vấn giải pháp đốt lò mẫu?
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <a
                  href="tel:0902441981"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#F26522] hover:bg-[#D95314] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-600/30"
                >
                  <Phone size={14} />
                  <span>0902.441.981</span>
                </a>
                <a
                  href="https://zalo.me/0902441981"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare size={14} className="text-[#0088FF]" />
                  <span>Chat Zalo Kỹ Sư</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
