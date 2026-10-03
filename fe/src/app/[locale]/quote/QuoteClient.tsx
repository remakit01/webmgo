'use client';

import React, { useState } from 'react';
import Link from '@/components/ui/LocaleLink';
import {
  Clock, PhoneCall, MapPin, Mail, CheckCircle2,
  ChevronRight, Send, FileCheck, Users,
  ArrowRight, ClipboardList, MessageSquare, PackageCheck,
  Shield, Award,
} from 'lucide-react';

const APPLICATIONS = [
  'Bọc Ống Gió PCCC (EI 30 – EI 120)',
  'Vách Ngăn Chống Cháy (EI 60 – EI 120)',
  'Sàn Kỹ Thuật Chịu Lực (REI 120 – REI 180)',
  'Vách Trần Nhà Xưởng KCN',
  'Lõi Cửa Thép Chống Cháy',
  'Vách Ngăn Karaoke / Bar',
  'Khác',
];

const EI_LEVELS = ['EI 30', 'EI 45', 'EI 60', 'EI 90', 'EI 120', 'EI 180', 'Chưa xác định'];

const TRUST = [
  { icon: Clock,     title: 'Phản hồi trong 2 giờ',       desc: 'Kỹ sư liên hệ ngay trong giờ hành chính' },
  { icon: FileCheck, title: 'Hồ sơ năng lực miễn phí',     desc: 'IBST công chứng + CAD + chứng chỉ đầy đủ' },
  { icon: Users,     title: 'Tư vấn kỹ thuật chuyên sâu', desc: 'Kỹ sư có chứng chỉ PCCC hỗ trợ trực tiếp' },
];

const STEPS = [
  { icon: ClipboardList, step: '01', title: 'Gửi yêu cầu',         desc: 'Điền form — chỉ mất 2 phút' },
  { icon: MessageSquare, step: '02', title: 'Kỹ sư tư vấn',        desc: 'Liên hệ trong vòng 2 giờ làm việc' },
  { icon: PackageCheck,  step: '03', title: 'Nhận báo giá & hồ sơ', desc: 'Báo giá + IBST + CAD chi tiết' },
];

const INCLUSIONS = [
  'Báo giá vật tư chi tiết theo m²',
  'Bản vẽ CAD thi công tham khảo',
  'Biên bản đốt lò IBST theo mức EI',
  'Chứng chỉ ISO 1182 Class A1',
  'Hỗ trợ kỹ sư tại hiện trường (nếu cần)',
  'Tư vấn lựa chọn độ dày phù hợp',
];

const CERTS = ['IBST', 'ISO 1182', 'QUATEST 3', 'BXD'];

const REFERENCE_PROJECTS = [
  { name: 'Samsung Yên Phong',   detail: 'KCN · 45.000 m² · EI 120' },
  { name: 'Lotte Mall Tây Hồ',   detail: 'TTTM · 28.500 m² · EI 90' },
  { name: 'Viettel IDC Hòa Lạc', detail: 'Data Center · 16.000 m² · EI 180' },
];

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7CB305]/40 focus:border-[#7CB305] transition-colors bg-white';
const labelCls = 'block text-xs font-bold text-slate-700 mb-1.5';

export default function QuoteClient() {
  const [form, setForm] = useState({
    name: '', phone: '', project: '', application: '', area: '', ei: '', note: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 pt-16 pb-14 px-4">
        <div className="max-w-[1440px] mx-auto lg:px-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight size={12} />
            <span className="text-white font-semibold">Báo Giá</span>
          </nav>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                Nhận Báo Giá
                <span className="block text-[#7CB305]">Ngay Hôm Nay</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Điền thông tin dự án — kỹ sư Remak tính toán và gửi báo giá chi tiết kèm hồ sơ kỹ thuật trong vòng 2 giờ làm việc.
              </p>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5 lg:min-w-[340px]">
              {[
                { n: '45.000+', label: 'm² đã thi công' },
                { n: 'EI 60–180', label: 'mức chịu lửa' },
                { n: '3 tỉnh', label: 'miền Bắc & Nam' },
                { n: '100%', label: 'đạt nghiệm thu' },
              ].map(({ n, label }) => (
                <div key={label} className="bg-white/10 border border-white/15 rounded-2xl px-3 py-3 text-center">
                  <div className="text-lg font-black text-white leading-none">{n}</div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-tight">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
            {TRUST.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#5F8A03] flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{title}</div>
                  <div className="text-xs text-slate-300 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Process strip ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0">
            {STEPS.map(({ icon: Icon, step, title, desc }, idx) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F4F9E8] flex items-center justify-center flex-shrink-0">
                    <Icon size={17} className="text-[#5F8A03]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-[#5F8A03] uppercase tracking-widest">{step}</span>
                      <span className="text-sm font-bold text-slate-900">{title}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <ArrowRight size={16} className="text-slate-300 flex-shrink-0 hidden sm:block" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">

          {/* ── Form card ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-[#7CB305] to-[#5F8A03]" />
              <div className="p-6 sm:p-8">

                {submitted ? (
                  /* Success state */
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-5">
                    <div className="w-18 h-18 rounded-full bg-[#F4F9E8] flex items-center justify-center" style={{ width: 72, height: 72 }}>
                      <CheckCircle2 size={36} className="text-[#5F8A03]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900">Gửi Thành Công!</h2>
                      <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">
                        Kỹ sư Remak sẽ liên hệ với bạn trong vòng <strong className="text-slate-700">2 giờ làm việc</strong>. Cảm ơn bạn đã tin tưởng chọn Remak® FireOFF.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <a
                        href="tel:0902441981"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white text-sm font-bold transition-colors"
                      >
                        <PhoneCall size={15} />
                        Gọi ngay: 0902.441.981
                      </a>
                      <Link
                        href="/thu-vien-tai-lieu"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold transition-colors"
                      >
                        Xem thư viện tài liệu
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-7">
                      <h2 className="text-lg font-extrabold text-slate-900">Thông Tin Yêu Cầu Báo Giá</h2>
                      <p className="text-xs text-slate-400 mt-1">Điền đầy đủ để nhận báo giá chính xác nhất — khoảng 2 phút.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                      {/* Section 1: Liên hệ */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="w-5 h-5 rounded-lg bg-[#5F8A03] flex items-center justify-center text-white text-[10px] font-black">1</span>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Thông tin liên hệ</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={labelCls}>Họ và tên <span className="text-red-500">*</span></label>
                            <input
                              type="text" required placeholder="Nguyễn Văn A"
                              value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Số điện thoại <span className="text-red-500">*</span></label>
                            <input
                              type="tel" required placeholder="0902 441 981"
                              value={form.phone}
                              onChange={(e) => setForm({ ...form, phone: e.target.value })}
                              className={inputCls}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-100" />

                      {/* Section 2: Dự án */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="w-5 h-5 rounded-lg bg-[#5F8A03] flex items-center justify-center text-white text-[10px] font-black">2</span>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Thông tin dự án</span>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className={labelCls}>Tên công trình / dự án <span className="text-red-500">*</span></label>
                            <input
                              type="text" required placeholder="Nhà máy ABC, Tòa nhà XYZ..."
                              value={form.project}
                              onChange={(e) => setForm({ ...form, project: e.target.value })}
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Loại ứng dụng thi công <span className="text-red-500">*</span></label>
                            <select
                              required value={form.application}
                              onChange={(e) => setForm({ ...form, application: e.target.value })}
                              className={inputCls}
                            >
                              <option value="">-- Chọn ứng dụng --</option>
                              {APPLICATIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                            </select>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className={labelCls}>Diện tích ước tính (m²)</label>
                              <input
                                type="number" placeholder="500" min="1"
                                value={form.area}
                                onChange={(e) => setForm({ ...form, area: e.target.value })}
                                className={inputCls}
                              />
                            </div>
                            <div>
                              <label className={labelCls}>Mức chịu lửa yêu cầu</label>
                              <select
                                value={form.ei}
                                onChange={(e) => setForm({ ...form, ei: e.target.value })}
                                className={inputCls}
                              >
                                <option value="">-- Chọn mức EI --</option>
                                {EI_LEVELS.map((ei) => <option key={ei} value={ei}>{ei}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-100" />

                      {/* Section 3: Ghi chú */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="w-5 h-5 rounded-lg bg-[#5F8A03] flex items-center justify-center text-white text-[10px] font-black">3</span>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Yêu cầu thêm</span>
                        </div>
                        <label className={labelCls}>Ghi chú (không bắt buộc)</label>
                        <textarea
                          rows={3}
                          placeholder="Tiến độ giao hàng, yêu cầu đặc biệt, câu hỏi kỹ thuật..."
                          value={form.note}
                          onChange={(e) => setForm({ ...form, note: e.target.value })}
                          className={`${inputCls} resize-none`}
                        />
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-sm transition-colors shadow-lg shadow-[#5F8A03]/20"
                      >
                        <Send size={16} />
                        Gửi Yêu Cầu Báo Giá
                      </button>

                      <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                        <Shield size={11} className="text-slate-300" />
                        Thông tin của bạn được bảo mật tuyệt đối — chỉ dùng để liên hệ báo giá
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Hotline card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#7CB305] to-[#5F8A03]" />
              <div className="p-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Liên hệ trực tiếp</p>
                <a
                  href="tel:0902441981"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-[#F4F9E8] hover:bg-[#E8F4CC] transition-colors group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-[#5F8A03] flex items-center justify-center flex-shrink-0">
                    <PhoneCall size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-extrabold text-[#5F8A03] tracking-tight">0902.441.981</div>
                    <div className="text-xs text-slate-500 mt-0.5">Kỹ thuật PCCC · T2–T7, 8:00–17:30</div>
                  </div>
                </a>
                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <Mail size={13} className="text-slate-400 flex-shrink-0" />
                    <span>kythuat@remak.vn</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-600">
                    <MapPin size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>Hà Nội & TP. Hồ Chí Minh — giao hàng toàn quốc</span>
                  </div>
                </div>
              </div>
            </div>

            {/* "Bạn nhận được" + cert badges */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">Bạn nhận được</p>
              <ul className="space-y-3">
                {INCLUSIONS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 size={15} className="text-[#5F8A03] flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>

              {/* Cert badges */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Award size={11} />
                  Chứng nhận & kiểm định
                </p>
                <div className="flex flex-wrap gap-2">
                  {CERTS.map((cert) => (
                    <span
                      key={cert}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#F4F9E8] text-[#5F8A03] border border-[#7CB305]/20"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Reference projects */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Dự án tham chiếu</p>
              <div className="space-y-0">
                {REFERENCE_PROJECTS.map((p, idx) => (
                  <div
                    key={p.name}
                    className={`flex items-center justify-between gap-2 py-3 ${idx < REFERENCE_PROJECTS.length - 1 ? 'border-b border-white/10' : ''}`}
                  >
                    <span className="text-sm font-semibold text-white">{p.name}</span>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">{p.detail}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/du-an"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#7CB305] hover:text-[#A3D300] transition-colors"
              >
                Xem tất cả dự án
                <ArrowRight size={12} />
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 pb-12">
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/20 rounded-3xl px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-extrabold text-white">Cần tư vấn trực tiếp?</h3>
            <p className="text-sm text-slate-300 mt-1.5 max-w-md leading-relaxed">
              Kỹ sư PCCC sẵn sàng tư vấn giải pháp phù hợp cho dự án của bạn — miễn phí, không ràng buộc.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <a
              href="tel:0902441981"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-sm transition-colors"
            >
              <PhoneCall size={15} />
              Gọi ngay 0902.441.981
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-colors"
            >
              Gửi form báo giá ↑
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
