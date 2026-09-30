'use client';

import React, { useState } from 'react';
import { 
  Inbox, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  FileText,
  X,
  Filter,
  Download
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { INITIAL_REQUESTS } from '@/lib/mock-data';
import { SampleRequest } from '@/types';

export default function SampleRequestsManagerPage() {
  const [requests, setRequests] = useState<SampleRequest[]>(INITIAL_REQUESTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReq, setSelectedReq] = useState<SampleRequest | null>(null);

  const filtered = requests.filter(r => {
    const matchSearch = 
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search) ||
      r.company.toLowerCase().includes(search.toLowerCase()) ||
      r.solution.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = (id: string, newStatus: any) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    if (selectedReq && selectedReq.id === id) {
      setSelectedReq(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800"><AlertCircle size={12}/> Chờ Xử Lý</span>;
      case 'processing':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800"><Clock size={12}/> Đang Chuẩn Bị</span>;
      case 'shipped':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800"><Truck size={12}/> Đang Gửi Hàng</span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F4F9E8] text-[#5F8A03] border border-[#7CB305]/30"><CheckCircle2 size={12}/> Đã Nghiệm Thu</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header 
        title="Quản Lý Yêu Cầu Gửi Mẫu & Báo Giá" 
        subtitle="Danh sách các kỹ sư, chủ đầu tư, tổng thầu đăng ký nhận hộp mẫu vật liệu MGO Remak." 
      />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
        
        {/* FILTER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, SĐT, công ty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#5F8A03] shadow-2xs"
              />
            </div>

            <select
              aria-label="Lọc theo trạng thái"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#5F8A03] cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="new">Chờ Xử Lý</option>
              <option value="processing">Đang Chuẩn Bị</option>
              <option value="shipped">Đang Gửi Hàng</option>
              <option value="completed">Đã Nghiệm Thu</option>
            </select>
          </div>

          <div className="text-xs font-bold text-slate-500">
            Tổng cộng: <span className="text-slate-900">{filtered.length} đơn</span>
          </div>
        </div>

        {/* REQUESTS TABLE */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Mã Đơn</th>
                  <th className="p-4">Khách Hàng / Đơn Vị</th>
                  <th className="p-4">Liên Hệ</th>
                  <th className="p-4">Giải Pháp & Độ Dày</th>
                  <th className="p-4">Ngày Đăng Ký</th>
                  <th className="p-4 text-center">Trạng Thái</th>
                  <th className="p-4 pr-6 text-right">Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-[#5F8A03] text-xs">
                      {req.id}
                    </td>
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900">{req.customerName}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 size={12} /> {req.company}
                      </div>
                    </td>
                    <td className="p-4 text-xs">
                      <div className="font-bold text-slate-800">{req.phone}</div>
                      <div className="text-slate-400">{req.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{req.solution}</div>
                      <div className="text-xs text-slate-500">Độ dày: <span className="font-bold text-slate-700">{req.thickness}</span></div>
                    </td>
                    <td className="p-4 text-xs text-slate-500 whitespace-nowrap">
                      {req.createdAt}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="p-4 pr-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedReq(req)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#5F8A03] hover:text-white text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Xem & Xử Lý
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* DETAIL & ACTION DRAWER / MODAL */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-[#5F8A03]">{selectedReq.id}</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Chi Tiết Đơn Đăng Ký Nhận Mẫu</h3>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedReq(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Người nhận:</span>
                  <span className="font-extrabold text-slate-900">{selectedReq.customerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Số điện thoại:</span>
                  <span className="font-bold text-slate-900">{selectedReq.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Email:</span>
                  <span className="text-slate-800">{selectedReq.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Công ty / Đơn vị:</span>
                  <span className="font-bold text-slate-900">{selectedReq.company}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block mb-0.5">Địa chỉ giao mẫu:</span>
                  <span className="text-slate-800">{selectedReq.address}</span>
                </div>
              </div>

              <div className="bg-[#F4F9E8] p-4 rounded-2xl border border-[#7CB305]/30 space-y-1.5">
                <div className="font-bold text-[#5F8A03]">Nội dung yêu cầu mẫu:</div>
                <div className="text-slate-800 font-semibold">• Giải pháp: {selectedReq.solution}</div>
                <div className="text-slate-800 font-semibold">• Độ dày đề xuất: {selectedReq.thickness}</div>
                {selectedReq.note && (
                  <div className="text-xs text-slate-600 pt-1 border-t border-[#7CB305]/20 mt-2">
                    <span className="font-bold">Ghi chú từ khách:</span> {selectedReq.note}
                  </div>
                )}
              </div>

              {/* Status Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cập nhật trạng thái xử lý đơn:</label>
                <select
                  value={selectedReq.status}
                  onChange={(e) => handleUpdateStatus(selectedReq.id, e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#5F8A03]"
                >
                  <option value="new">1. Chờ Xử Lý (Chưa gọi xác nhận)</option>
                  <option value="processing">2. Đang Chuẩn Bị (Kho đóng gói mẫu hộp Remak)</option>
                  <option value="shipped">3. Đang Gửi Hàng (Đã giao Viettel Post / Ahamove)</option>
                  <option value="completed">4. Đã Nghiệm Thu (Khách đã nhận & đạt yêu cầu)</option>
                </select>
              </div>

            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-100">
              <a 
                href={`tel:${selectedReq.phone.replace(/\s+/g, '')}`}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Phone size={14} className="text-[#5F8A03]" />
                <span>Gọi Điện Ngay</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="px-5 py-2 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Lưu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
