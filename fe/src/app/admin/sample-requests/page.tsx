'use client';

import React, { useState } from 'react';
import { Inbox, CheckCircle2, Clock, Truck, AlertCircle, Phone, Mail, Building, MapPin } from 'lucide-react';
import AdminHeader from '@/cms/components/AdminHeader';
import { INITIAL_REQUESTS, SampleRequest } from '@/cms/lib/cms-data';

export default function AdminSampleRequestsPage() {
  const [requests, setRequests] = useState<SampleRequest[]>(INITIAL_REQUESTS);
  const [filter, setFilter] = useState<'all' | 'new' | 'processing' | 'shipped' | 'completed'>('all');

  const filteredRequests = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const handleUpdateStatus = (id: string, newStatus: any) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <AdminHeader 
        title="Quản Lý Yêu Cầu Gửi Mẫu Thử & Báo Giá" 
        subtitle="Tiếp nhận thông tin khách hàng, tư vấn dự án và theo dõi quá trình giao mẫu tấm MGO"
      />

      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'new', 'processing', 'shipped', 'completed'] as const).map((key) => {
            const count = key === 'all' ? requests.length : requests.filter(r => r.status === key).length;
            const labels = {
              all: 'Tất cả yêu cầu',
              new: 'Chờ xử lý',
              processing: 'Đang chuẩn bị',
              shipped: 'Đang giao hàng',
              completed: 'Đã nghiệm thu',
            };
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === key
                    ? 'bg-[#5F8A03] text-white shadow-sm shadow-[#5F8A03]/30'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{labels[key]}</span>
                <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                  filter === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Mã Đơn / Ngày Tạo</th>
                  <th className="py-3.5 px-4">Khách Hàng / Đơn Vị</th>
                  <th className="py-3.5 px-4">Thông Tin Liên Hệ</th>
                  <th className="py-3.5 px-4">Sản Phẩm Cần Nhận Mẫu</th>
                  <th className="py-3.5 px-4">Trạng Thái Xử Lý</th>
                  <th className="py-3.5 px-4 text-right">Cập Nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900">{req.id}</div>
                      <div className="text-[11px] text-slate-400">{req.createdAt}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{req.customerName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building size={12} className="text-slate-400" />
                        <span>{req.company || 'Cá nhân tư vấn'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Phone size={12} className="text-[#F26522]" />
                        <span>{req.phone}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <MapPin size={12} className="text-slate-400" />
                        <span className="truncate max-w-[180px]">{req.address}, {req.city}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{req.productName}</div>
                      <div className="text-[11px] text-[#5F8A03] font-bold">Quy cách: {req.thickness}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {req.status === 'new' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-300">
                          <AlertCircle size={12}/> Chờ Xử Lý
                        </span>
                      )}
                      {req.status === 'processing' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-700 border border-sky-300">
                          <Clock size={12}/> Đang Chuẩn Bị
                        </span>
                      )}
                      {req.status === 'shipped' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-700 border border-purple-300">
                          <Truck size={12}/> Đang Gửi Hàng
                        </span>
                      )}
                      {req.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F4F9E8] text-[#5F8A03] border border-[#7CB305]/40">
                          <CheckCircle2 size={12}/> Đã Nghiệm Thu
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={req.status}
                        onChange={(e) => handleUpdateStatus(req.id, e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none focus:border-[#7CB305] cursor-pointer"
                      >
                        <option value="new">Chờ Xử Lý</option>
                        <option value="processing">Đang Chuẩn Bị</option>
                        <option value="shipped">Đang Gửi Hàng</option>
                        <option value="completed">Đã Nghiệm Thu</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
