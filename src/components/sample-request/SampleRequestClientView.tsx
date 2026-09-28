'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Package, PhoneCall, CheckCircle2, ArrowRight,
  Send, User, Building2, MapPin, Wrench,
} from 'lucide-react';

const PRODUCTS = [
  'Ống gió EI 60',
  'Ống gió EI 90',
  'Ống gió EI 120',
  'Vách ngăn chống cháy EI 60',
  'Vách ngăn chống cháy EI 120',
  'Sàn kỹ thuật chịu lửa',
];

const WHO_SHOULD = [
  { icon: Wrench,    title: 'Kỹ sư MEP',      desc: 'Cần xác nhận thông số kỹ thuật trước thiết kế' },
  { icon: Building2, title: 'Nhà thầu xây dựng', desc: 'Muốn kiểm tra chất lượng trước khi đặt lô lớn' },
  { icon: User,      title: 'Kiến trúc sư',    desc: 'Cần mẫu vật liệu cho hồ sơ đệ trình chủ đầu tư' },
  { icon: MapPin,    title: 'Chủ đầu tư',      desc: 'Muốn đánh giá trực tiếp trước khi phê duyệt vật tư' },
];

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F26522]/30 focus:border-[#F26522] transition-colors bg-white';
const labelCls = 'block text-xs font-bold text-slate-700 mb-1.5';

function SectionBadge({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="w-5 h-5 rounded-lg bg-[#F26522] text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
        {n}
      </span>
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
    </div>
  );
}

export default function SampleRequestClientView() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    product: '', address: '', city: '', note: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Form ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-[#F26522] to-[#EA580C]" />

              {submitted ? (
                /* Success state */
                <div className="p-8 sm:p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#F26522]/10 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={32} className="text-[#F26522]" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mb-2">Yêu Cầu Đã Gửi!</h2>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-sm mx-auto">
                    Chúng tôi sẽ xác nhận và gửi mẫu đến địa chỉ của bạn trong vòng 3 ngày làm việc.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href="tel:0902441981"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F26522] hover:bg-[#EA580C] text-white text-sm font-bold transition-colors"
                    >
                      <PhoneCall size={15} />
                      Gọi xác nhận ngay
                    </a>
                    <Link
                      href="/thu-vien-tai-lieu"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors"
                    >
                      <ArrowRight size={15} />
                      Xem tài liệu kỹ thuật
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">

                  {/* Section 1 */}
                  <div>
                    <SectionBadge n={1} label="Thông tin liên hệ" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className={labelCls}>Họ và tên *</label>
                        <input type="text" required placeholder="Nguyễn Văn A" value={form.name} onChange={set('name')} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Số điện thoại *</label>
                        <input type="tel" required placeholder="0902 xxx xxx" value={form.phone} onChange={set('phone')} className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Email <span className="text-slate-400 font-normal">(để nhận catalog kỹ thuật)</span></label>
                      <input type="email" placeholder="email@company.com" value={form.email} onChange={set('email')} className={inputCls} />
                    </div>
                  </div>

                  <div className="border-t border-slate-100" />

                  {/* Section 2 */}
                  <div>
                    <SectionBadge n={2} label="Thông tin mẫu cần nhận" />
                    <div className="mb-4">
                      <label className={labelCls}>Loại sản phẩm muốn dùng thử *</label>
                      <select required value={form.product} onChange={set('product')} className={inputCls}>
                        <option value="">Chọn loại sản phẩm...</option>
                        {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className={labelCls}>Địa chỉ nhận hàng *</label>
                      <input type="text" required placeholder="Số nhà, đường, phường/xã, quận/huyện" value={form.address} onChange={set('address')} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Tỉnh / Thành phố *</label>
                      <input type="text" required placeholder="VD: Hà Nội, TP. Hồ Chí Minh, Đà Nẵng..." value={form.city} onChange={set('city')} className={inputCls} />
                    </div>
                  </div>

                  <div className="border-t border-slate-100" />

                  {/* Section 3 */}
                  <div>
                    <SectionBadge n={3} label="Ghi chú thêm" />
                    <textarea
                      rows={3}
                      placeholder="Tên dự án, yêu cầu đặc biệt, thời gian cần giao hàng..."
                      value={form.note}
                      onChange={set('note')}
                      className={inputCls}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#F26522] hover:bg-[#EA580C] text-white font-bold text-sm transition-colors shadow-lg shadow-[#F26522]/20 cursor-pointer"
                  >
                    <Package size={16} />
                    Gửi Yêu Cầu Nhận Mẫu Thử
                  </button>

                  <p className="text-center text-[11px] text-slate-400">
                    Hoàn toàn miễn phí · Không ràng buộc · Xác nhận trong 2 giờ làm việc
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Hotline card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-[#F26522] to-[#EA580C]" />
              <div className="p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Liên hệ trực tiếp</p>
                <a
                  href="tel:0902441981"
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F26522]/8 border border-[#F26522]/20 hover:bg-[#F26522]/15 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#F26522] flex items-center justify-center flex-shrink-0">
                    <PhoneCall size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 group-hover:text-[#F26522] transition-colors">0902.441.981</p>
                    <p className="text-[10px] text-slate-400">Hotline kỹ thuật · T2–T7</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Who should request */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Ai nên đặt mẫu thử?</p>
              <div className="space-y-3">
                {WHO_SHOULD.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{title}</p>
                      <p className="text-[11px] text-slate-500 leading-snug">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coverage card */}
            <div className="bg-slate-900 rounded-3xl p-5 text-white">
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-3">Phủ sóng giao hàng</p>
              <div className="text-3xl font-black text-white mb-1">32</div>
              <p className="text-sm text-slate-300 mb-4">Tỉnh thành đã giao mẫu thử</p>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#7CB305]" />
                <span className="text-xs text-slate-400">Miễn phí vận chuyển mẫu thử toàn quốc</span>
              </div>
            </div>

          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-500/20">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-white">Cần Báo Giá Chính Thức?</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Sau khi nhận và kiểm tra mẫu, kỹ sư Remak tính toán và gửi báo giá chi tiết kèm hồ sơ kỹ thuật trong 2 giờ.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0 w-full md:w-auto">
            <a
              href="tel:0902441981"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <PhoneCall size={15} />
              <span>Hotline: 0902.441.981</span>
            </a>
            <Link
              href="/bao-gia"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/20 flex items-center justify-center gap-2"
            >
              <Send size={15} />
              <span>Nhận Báo Giá Ngay</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
