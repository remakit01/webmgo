'use client';

import React, { useState } from 'react';
import { 
  Inbox, 
  Search, 
  Eye, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Truck, 
  Phone, 
  Mail, 
  MapPin, 
  Building,
  FileText,
  X,
  Filter
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import { ADMIN_REQUESTS, AdminSampleRequest } from '@/lib/admin-data';

export default function AdminSampleRequestsPage() {
  const [requests, setRequests] = useState<AdminSampleRequest[]>(ADMIN_REQUESTS);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewingRequest, setViewingRequest] = useState<AdminSampleRequest | null>(null);

  const filtered = requests.filter(req => {
    const matchSearch = 
      req.customerName.toLowerCase().includes(search.toLowerCase()) ||
      req.phone.includes(search) ||
      req.company.toLowerCase().includes(search.toLowerCase()) ||
      req.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = selectedStatus === 'all' || req.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = (id: string, newStatus: AdminSampleRequest['status']) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    if (viewingRequest && viewingRequest.id === id) {
      setViewingRequest(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Xóa yêu cầu gửi mẫu này?')) {
      setRequests(prev => prev.filter(r => r.id !== id));
      if (viewingRequest?.id === id) setViewingRequest(null);
    }
  };

  const getStatusBadge = (status: AdminSampleRequest['status']) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} />
            <span>Mới tiếp nhận</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={12} />
            <span>Đang chuẩn bị mẫu</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck size={12} />
            <span>Đang vận chuyển</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle size={12} />
            <span>Đã giao thành công</span>
          </span>
        );
    }
  };

  return (
    <>
      <AdminHeader 
        title="Yêu Cầu Gửi Mẫu & Báo Giá" 
        subtitle="Quản lý phiếu đăng ký mẫu thực tế, hồ sơ chào thầu từ các nhà thầu & CĐT" 
      />

      <div className="p-6 space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tên KH, SĐT, công ty hoặc mã phiếu..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#5F8A03] focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                aria-label="Lọc theo trạng thái xử lý"
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#5F8A03]"
              >
                <option value="all">Tất cả trạng thái ({requests.length})</option>
                <option value="new">Mới tiếp nhận</option>
                <option value="processing">Đang chuẩn bị mẫu</option>
                <option value="shipped">Đang vận chuyển</option>
                <option value="completed">Đã giao thành công</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Tổng cộng: <strong className="text-slate-800">{filtered.length}</strong> phiếu
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Mã Phiếu & Thời Gian</th>
                  <th className="py-3.5 px-4">Khách Hàng & Doanh Nghiệp</th>
                  <th className="py-3.5 px-4">Liên Hệ</th>
                  <th className="py-3.5 px-4">Loại Mẫu Đăng Ký</th>
                  <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-mono font-bold text-slate-900">{req.id}</div>
                      <div className="text-[11px] text-slate-400">{req.createdAt}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{req.customerName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Building size={12} className="text-slate-400" />
                        <span>{req.company}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Phone size={13} className="text-emerald-600" />
                        <span>{req.phone}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate max-w-[180px]">
                        <Mail size={12} />
                        <span>{req.email}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-800">{req.solution}</span>
                      <span className="block text-[11px] text-slate-500 font-mono">Độ dày: {req.thickness}</span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(req.status)}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingRequest(req)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-[#5F8A03] text-slate-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Eye size={14} />
                          <span>Chi tiết</span>
                        </button>
                        <button
                          onClick={() => handleDelete(req.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa phiếu"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              Không có yêu cầu nào phù hợp.
            </div>
          )}
        </div>
      </div>

      {/* Modal View Detail & Update Status */}
      {viewingRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Inbox className="text-[#5F8A03]" size={20} />
                  <span>Chi Tiết Yêu Cầu Mẫu</span>
                </h2>
                <div className="text-xs text-slate-400 font-mono mt-0.5">Mã phiếu: {viewingRequest.id}</div>
              </div>
              <button 
                onClick={() => setViewingRequest(null)}
                aria-label="Đóng cửa sổ"
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-200/60">
                <div className="font-bold text-slate-800 text-sm">{viewingRequest.customerName}</div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Building size={14} className="text-slate-400" />
                  <span>{viewingRequest.company}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone size={14} className="text-emerald-600" />
                  <span>{viewingRequest.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail size={14} className="text-slate-400" />
                  <span>{viewingRequest.email}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>{viewingRequest.address}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Thông tin mẫu yêu cầu</div>
                <div className="font-black text-slate-900 text-base">{viewingRequest.solution}</div>
                <div className="text-slate-600 font-semibold">Độ dày tấm: {viewingRequest.thickness}</div>
                {viewingRequest.note && (
                  <div className="text-xs text-slate-500 italic mt-2 pt-2 border-t border-emerald-100">
                    &quot;{viewingRequest.note}&quot;
                  </div>
                )}
              </div>

              {/* Status Update Actions */}
              <div className="space-y-2 pt-2">
                <label className="block font-bold text-slate-700">Cập nhật tiến độ xử lý:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(viewingRequest.id, 'new')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      viewingRequest.status === 'new' 
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    1. Mới tiếp nhận
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(viewingRequest.id, 'processing')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      viewingRequest.status === 'processing' 
                        ? 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    2. Đang chuẩn bị mẫu
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(viewingRequest.id, 'shipped')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      viewingRequest.status === 'shipped' 
                        ? 'border-purple-500 bg-purple-50 text-purple-900 ring-2 ring-purple-500/20' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    3. Đang giao hàng
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(viewingRequest.id, 'completed')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      viewingRequest.status === 'completed' 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    4. Đã bàn giao
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingRequest(null)}
                className="px-5 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
