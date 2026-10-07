'use client';

import React, { useState, useEffect } from 'react';
import { AdminPage, AdminPageBody } from '@/cms/components/layout/AdminPage';

interface CalculatorPricing {
  lossPercentage: number;
  prices: Record<number, number>;
  screwPerM2: number;
  framePerM2: number;
  sealantPerM2: number;
}

const DEFAULT_CALC_SETTINGS: CalculatorPricing = {
  lossPercentage: 5,
  prices: {
    5: 125000,
    8: 185000,
    10: 245000,
    12: 315000,
    15: 420000,
    18: 540000,
  },
  screwPerM2: 24,
  framePerM2: 2.2,
  sealantPerM2: 0.35,
};

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

export default function AdminCalculatorManagerPage() {
  const [settings, setSettings] = useState<CalculatorPricing>(DEFAULT_CALC_SETTINGS);
  const [testArea, setTestArea] = useState<number>(50);
  const [testThickness, setTestThickness] = useState<number>(10);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('remak_admin_calc_settings');
      if (saved) setSettings(JSON.parse(saved));
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
      localStorage.setItem('remak_admin_calc_settings', JSON.stringify(settings));
      showToast('Đã lưu cấu hình công thức dự toán thành công!');
    } catch (err) {
      alert('Không thể lưu: ' + err);
    }
  };

  const handleReset = () => {
    if (confirm('Khôi phục công thức và đơn giá dự toán về mặc định ban đầu?')) {
      setSettings(DEFAULT_CALC_SETTINGS);
      localStorage.removeItem('remak_admin_calc_settings');
      showToast('Đã khôi phục dữ liệu mặc định!');
    }
  };

  const handlePriceChange = (thickness: number, price: number) => {
    setSettings(prev => ({
      ...prev,
      prices: {
        ...prev.prices,
        [thickness]: price
      }
    }));
  };

  // Tính toán mô phỏng
  const SHEET_AREA = 2.9768; // 1.22m x 2.44m
  const rawSheets = testArea / SHEET_AREA;
  const totalSheets = Math.ceil(rawSheets * (1 + settings.lossPercentage / 100));
  const sheetPrice = settings.prices[testThickness] || 245000;
  const totalSheetCost = totalSheets * sheetPrice;
  const totalScrews = Math.ceil(testArea * settings.screwPerM2);
  const totalFrame = Math.ceil(testArea * settings.framePerM2);

  return (
    <AdminPage 
        title="Quản Lý Bộ Dự Toán Chi Phí" 
        subtitle="Quản trị đơn giá tấm theo độ dày, hệ số hao hụt % và định mức phụ kiện thi công">

      {/* Thông báo thao tác */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-xs font-semibold border border-slate-700">
          {toastMessage}
        </div>
      )}

      <AdminPageBody>
        
        {/* Thanh công cụ xem trước & khôi phục */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Công Thức & Đơn Giá Dự Toán
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Áp dụng trực tiếp vào công cụ tính nhanh tại mục số 9 trên trang chủ
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

        {/* 2 CỘT: CẤU HÌNH VÀ GIẢ LẬP TÍNH TOÁN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CỘT 1: CẤU HÌNH ĐƠN GIÁ & ĐỊNH MỨC (7/12) */}
          <form onSubmit={handleSave} className="lg:col-span-7 space-y-5">
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 pb-2.5 border-b border-slate-100">
                Bảng Đơn Giá Tấm MGO (Quy cách 1.22m × 2.44m)
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[5, 8, 10, 12, 15, 18].map((th) => (
                  <div key={th} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-xs font-bold text-slate-700">Độ dày {th}mm</span>
                    <input
                      type="number"
                      step={5000}
                      value={settings.prices[th]}
                      onChange={(e) => handlePriceChange(th, Number(e.target.value))}
                      className="w-full px-2.5 py-1 rounded border border-slate-300 text-xs font-bold text-[#5F8A03] bg-white text-right"
                    />
                    <div className="text-[10px] text-slate-400 text-right">VNĐ / tấm</div>
                  </div>
                ))}
              </div>

              <h4 className="text-sm font-bold text-slate-900 pt-3 pb-2.5 border-b border-slate-100">
                Hệ Số Hao Hụt & Định Mức Phụ Kiện
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Hệ số hao hụt cắt tấm (%) *</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={settings.lossPercentage}
                    onChange={(e) => setSettings({ ...settings, lossPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold"
                  />
                  <div className="text-[10px] text-slate-400">Tiêu chuẩn công trường: 5% - 8%</div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Số lượng vít tự khoan (con / m²)</label>
                  <input
                    type="number"
                    value={settings.screwPerM2}
                    onChange={(e) => setSettings({ ...settings, screwPerM2: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
                  />
                  <div className="text-[10px] text-slate-400">Khoảng cách bắn vít 20 - 25cm</div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Khung xương kẽm (mét dài / m²)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={settings.framePerM2}
                    onChange={(e) => setSettings({ ...settings, framePerM2: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
                  />
                  <div className="text-[10px] text-slate-400">Mét dài khung xương trên 1m²</div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Keo xử lý mối nối (kg / m²)</label>
                  <input
                    type="number"
                    step={0.05}
                    value={settings.sealantPerM2}
                    onChange={(e) => setSettings({ ...settings, sealantPerM2: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
                  />
                  <div className="text-[10px] text-slate-400">Keo chuyên dụng trám khe chống nứt</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#5F8A03] hover:bg-[#4E7202] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Lưu Cấu Hình
                </button>
              </div>
            </div>
          </form>

          {/* CỘT 2: TRÌNH GIẢ LẬP TÍNH TOÁN THỰC TẾ (5/12) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 pb-2.5 border-b border-slate-100">
                Thử Nghiệm Tính Toán Nhanh
              </h4>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Diện tích công trình:</span>
                  <span className="text-sm font-bold text-[#5F8A03]">{testArea} m²</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={300}
                  step={5}
                  value={testArea}
                  onChange={(e) => setTestArea(Number(e.target.value))}
                  className="w-full accent-[#5F8A03]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Chọn độ dày kiểm tra:</label>
                <div className="flex flex-wrap gap-1.5">
                  {[5, 8, 10, 12, 15, 18].map((th) => (
                    <button
                      key={th}
                      type="button"
                      onClick={() => setTestThickness(th)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                        testThickness === th ? 'bg-[#5F8A03] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {th}mm
                    </button>
                  ))}
                </div>
              </div>

              {/* Hộp kết quả mô phỏng */}
              <div className="p-4 rounded-lg bg-[#F4F9E8] border border-[#5F8A03]/30 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-700">Số tấm cần mua (đã gồm +{settings.lossPercentage}% hao hụt):</span>
                  <span className="text-sm font-bold text-[#5F8A03]">{totalSheets} tấm</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-700">Tổng chi phí tấm MGO dự kiến:</span>
                  <span className="text-sm font-bold text-[#F26522]">{formatVnd(totalSheetCost)}</span>
                </div>

                <div className="pt-2 border-t border-[#5F8A03]/20 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Vít tự khoan:</span>
                    <span className="font-bold text-slate-900 block">{totalScrews} con</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Khung kẽm:</span>
                    <span className="font-bold text-slate-900 block">{totalFrame} mét</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                * Kết quả tính toán này được áp dụng trực tiếp cho công cụ ngoài trang chủ.
              </p>
            </div>
          </div>

        </div>

      </AdminPageBody>
    </AdminPage>
  );
}
