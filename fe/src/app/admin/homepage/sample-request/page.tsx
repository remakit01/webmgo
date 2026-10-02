'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminHeader from '@/cms/components/AdminHeader';

interface SampleConfig {
  headline: string;
  subheadline: string;
  hotline: string;
  boxItems: string[];
  stats: {
    stat1: string;
    label1: string;
    stat2: string;
    label2: string;
    stat3: string;
    label3: string;
  };
}

const DEFAULT_SAMPLE_CONFIG: SampleConfig = {
  headline: 'Đăng Ký Nhận Hộp Mẫu Thử MGO Remak® Miễn Phí',
  subheadline: 'Trọn bộ 06 mẫu độ dày cắt thực tế kèm chứng chỉ kiểm định PCCC IBST giao hỏa tốc tận chân công trình',
  hotline: '0936.106.338',
  boxItems: [
    'Đầy đủ 6 mẫu cắt tấm MGO (5mm, 8mm, 10mm, 12mm, 15mm, 18mm)',
    'Bộ tài liệu kỹ thuật & cẩm nang hướng dẫn thi công chuẩn',
    'Bản sao chứng thư thử nghiệm đốt lò mẫu IBST (Viện KHCN Xây dựng)',
    'Không mất phí mẫu thử — Không chịu phí vận chuyển',
  ],
  stats: {
    stat1: '200+',
    label1: 'Dự án đã cấp mẫu',
    stat2: '63',
    label2: 'Tỉnh/TP giao tận nơi',
    stat3: '100%',
    label3: 'Nghiệm thu PCCC',
  }
};

const MOCK_REQUESTS = [
  { id: 1, name: 'Nguyễn Văn Hùng', phone: '0983.123.xxx', company: 'Nhà thầu MEP Thăng Long', address: 'KCN Bắc Thăng Long, Hà Nội', thicknesses: '8mm, 10mm', date: 'Vừa xong', status: 'pending' },
  { id: 2, name: 'Trần Thị Mai', phone: '0912.456.xxx', company: 'Tư vấn Thiết kế VKP', address: 'Quận 7, TP. Hồ Chí Minh', thicknesses: '12mm, 15mm', date: '2 giờ trước', status: 'shipped' },
  { id: 3, name: 'Lê Hoàng Nam', phone: '0908.789.xxx', company: 'Xây dựng Delta Corp', address: 'KCN VSIP 1, Bình Dương', thicknesses: 'Trọn bộ 6 mẫu', date: 'Hôm qua', status: 'completed' },
];

export default function AdminSampleRequestManagerPage() {
  const [config, setConfig] = useState<SampleConfig>(DEFAULT_SAMPLE_CONFIG);
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('remak_admin_sample_config');
      if (saved) {
        setConfig(JSON.parse(saved));
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
      localStorage.setItem('remak_admin_sample_config', JSON.stringify(config));
      showToast('Đã lưu cấu hình hộp mẫu thử thành công!');
    } catch (err) {
      alert('Không thể lưu: ' + err);
    }
  };

  const handleReset = () => {
    if (confirm('Khôi phục cấu hình hộp mẫu về mặc định ban đầu?')) {
      setConfig(DEFAULT_SAMPLE_CONFIG);
      localStorage.removeItem('remak_admin_sample_config');
      showToast('Đã khôi phục dữ liệu mặc định!');
    }
  };

  const handleBoxItemChange = (index: number, val: string) => {
    const updated = [...config.boxItems];
    updated[index] = val;
    setConfig({ ...config, boxItems: updated });
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    const updated = requests.map(r => r.id === id ? { ...r, status: newStatus } : r);
    setRequests(updated);
    showToast('Đã cập nhật trạng thái đơn nhận mẫu!');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <AdminHeader 
        title="Quản Lý Đăng Ký Mẫu Thử" 
        subtitle="Quản trị nội dung giới thiệu hộp mẫu thử, đường dây nóng tư vấn và danh sách đơn nhận mẫu"
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
              Hộp Mẫu Thử & Đơn Đăng Ký
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cấu hình hiển thị tại mục số 7 trên trang chủ
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

        {/* 2 CỘT: CẤU HÌNH & DANH SÁCH ĐƠN HÀNG */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CỘT 1: CẤU HÌNH HỘP MẪU THỬ (7/12) */}
          <form onSubmit={handleSave} className="lg:col-span-7 space-y-5">
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                Cấu Hình Thông Điệp & Đường Dây Nóng
              </h4>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tiêu đề chính *</label>
                <input
                  type="text"
                  required
                  value={config.headline}
                  onChange={(e) => setConfig({ ...config, headline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold focus:outline-none focus:border-[#5F8A03]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mô tả phụ chi tiết *</label>
                <textarea
                  rows={2}
                  required
                  value={config.subheadline}
                  onChange={(e) => setConfig({ ...config, subheadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Số điện thoại đường dây nóng *</label>
                <input
                  type="text"
                  required
                  value={config.hotline}
                  onChange={(e) => setConfig({ ...config, hotline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-[#F26522] focus:outline-none focus:border-[#5F8A03]"
                />
              </div>

              {/* 4 Cam kết trong hộp mẫu */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700">4 Cam kết kèm theo trong hộp mẫu thử:</label>
                <div className="space-y-2">
                  {config.boxItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#5F8A03] w-6">#{idx + 1}</span>
                      <input
                        type="text"
                        required
                        value={item}
                        onChange={(e) => handleBoxItemChange(idx, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#5F8A03]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 Thống kê số liệu */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="text-xs font-bold text-slate-700">3 Chỉ số thống kê năng lực:</label>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <input
                      type="text"
                      value={config.stats.stat1}
                      onChange={(e) => setConfig({ ...config, stats: { ...config.stats, stat1: e.target.value } })}
                      className="w-full px-2 py-1 text-center font-bold text-xs text-[#F26522] bg-white rounded border border-slate-200"
                    />
                    <input
                      type="text"
                      value={config.stats.label1}
                      onChange={(e) => setConfig({ ...config, stats: { ...config.stats, label1: e.target.value } })}
                      className="w-full px-1 text-center text-[10px] text-slate-500 bg-transparent border-0"
                    />
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <input
                      type="text"
                      value={config.stats.stat2}
                      onChange={(e) => setConfig({ ...config, stats: { ...config.stats, stat2: e.target.value } })}
                      className="w-full px-2 py-1 text-center font-bold text-xs text-[#5F8A03] bg-white rounded border border-slate-200"
                    />
                    <input
                      type="text"
                      value={config.stats.label2}
                      onChange={(e) => setConfig({ ...config, stats: { ...config.stats, label2: e.target.value } })}
                      className="w-full px-1 text-center text-[10px] text-slate-500 bg-transparent border-0"
                    />
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <input
                      type="text"
                      value={config.stats.stat3}
                      onChange={(e) => setConfig({ ...config, stats: { ...config.stats, stat3: e.target.value } })}
                      className="w-full px-2 py-1 text-center font-bold text-xs text-slate-900 bg-white rounded border border-slate-200"
                    />
                    <input
                      type="text"
                      value={config.stats.label3}
                      onChange={(e) => setConfig({ ...config, stats: { ...config.stats, label3: e.target.value } })}
                      className="w-full px-1 text-center text-[10px] text-slate-500 bg-transparent border-0"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </div>
          </form>

          {/* CỘT 2: ĐƠN ĐĂNG KÝ GẦN ĐÂY (5/12) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">
                  Đơn Đăng Ký Mẫu Gần Đây
                </h4>
                <Link
                  href="/admin/sample-requests"
                  className="text-xs font-semibold text-[#5F8A03] hover:underline"
                >
                  Xem toàn bộ
                </Link>
              </div>

              <div className="space-y-2.5">
                {requests.map((r) => (
                  <div key={r.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{r.name}</span>
                      <span className="text-[10px] text-slate-400">{r.date}</span>
                    </div>

                    <div className="text-xs text-[#F26522] font-semibold">{r.phone}</div>
                    <div className="text-xs text-slate-600 truncate">{r.company}</div>
                    <div className="text-[11px] text-slate-400 truncate">{r.address}</div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">
                        {r.thicknesses}
                      </span>
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold border-0 cursor-pointer ${
                          r.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          r.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <option value="pending">Chờ gửi mẫu</option>
                        <option value="shipped">Đang chuyển phát</option>
                        <option value="completed">Đã giao thành công</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
