'use client';

import React, { useState } from 'react';
import { Inbox, CheckCircle2, Clock, Truck, AlertCircle, Phone, Mail, Building, MapPin } from 'lucide-react';
import { AdminPage, AdminPageBody } from '@/cms/components/layout/AdminPage';
import { INITIAL_REQUESTS, SampleRequest } from '@/cms/lib/cms-data';

export default function AdminSampleRequestsPage() {
  const [requests, setRequests] = useState<SampleRequest[]>(INITIAL_REQUESTS);
  const [filter, setFilter] = useState<'all' | 'new' | 'processing' | 'shipped' | 'completed'>('all');

  const filteredRequests = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const handleUpdateStatus = (id: string, newStatus: any) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
  };

  return (
    <AdminPage 
        title="Quản Lý Yêu Cầu Gửi Mẫu Thử & Báo Giá" 
        subtitle="Tiếp nhận thông tin khách hàng, tư vấn dự án và theo dõi quá trình giao mẫu tấm MGO">

      <AdminPageBody>
        
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
                className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer border-2 ${
                  filter === key
                    ? 'bg-[#5F8A03] text-white shadow-xs border-[#5F8A03]'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{labels[key]}</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-black ${
                  filter === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-600 font-black uppercase tracking-wider text-xs border-b-2 border-slate-200">
                <tr>
                  <th className="py-4 px-5">Mã Đơn / Ngày Tạo</th>
                  <th className="py-4 px-5">Khách Hàng / Đơn Vị</th>
                  <th className="py-4 px-5">Thông Tin Liên Hệ</th>
                  <th className="py-4 px-5">Sản Phẩm Cần Nhận Mẫu</th>
                  <th className="py-4 px-5">Trạng Thái Xử Lý</th>
                  <th className="py-4 px-5 text-right">Cập Nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-black text-slate-900 text-sm">{req.id}</div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">{req.createdAt}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-extrabold text-slate-900 text-base">{req.customerName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                        <Building size={12} className="text-slate-400" />
                        <span>{req.company || 'Cá nhân tư vấn'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        <Phone size={13} className="text-[#F26522]" />
                        <span>{req.phone}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                        <MapPin size={13} className="text-slate-400" />
                        <span className="truncate max-w-[200px]">{req.address}, {req.city}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 text-sm">{req.productName}</div>
                      <div className="text-xs text-[#5F8A03] font-bold mt-0.5">Quy cách: {req.thickness}</div>
                    </td>
                    <td className="py-4 px-5">
                      {req.status === 'new' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border-2 border-amber-300">
                          <AlertCircle size={13}/> Chờ Xử Lý
                        </span>
                      )}
                      {req.status === 'processing' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-700 border-2 border-sky-300">
                          <Clock size={13}/> Đang Chuẩn Bị
                        </span>
                      )}
                      {req.status === 'shipped' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-700 border-2 border-purple-300">
                          <Truck size={13}/> Đang Gửi Hàng
                        </span>
                      )}
                      {req.status === 'completed' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F4F9E8] text-[#5F8A03] border-2 border-[#7CB305]/40">
                          <CheckCircle2 size={13}/> Đã Nghiệm Thu
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <select
                        value={req.status}
                        onChange={(e) => handleUpdateStatus(req.id, e.target.value)}
                        className="text-xs sm:text-sm bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 font-bold focus:outline-none focus:border-[#7CB305] cursor-pointer"
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

      </AdminPageBody>
    </AdminPage>
  );
}
