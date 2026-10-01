'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Boxes, 
  Layers, 
  Inbox, 
  Download, 
  TrendingUp, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import AdminHeader from '@/cms/components/AdminHeader';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_APPLICATIONS, 
  INITIAL_REQUESTS, 
  INITIAL_TECH_DOCS 
} from '@/cms/lib/cms-data';

export default function AdminDashboardPage() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  const pendingCount = requests.filter(r => r.status === 'new' || r.status === 'processing').length;
  const totalDownloads = INITIAL_TECH_DOCS.reduce((acc, doc) => acc + doc.downloads, 0);

  const handleUpdateStatus = (id: string, newStatus: any) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-300">
            <AlertCircle size={12}/> Chờ Xử Lý
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-700 border border-sky-300">
            <Clock size={12}/> Đang Chuẩn Bị
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-700 border border-purple-300">
            <Truck size={12}/> Đang Gửi Hàng
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F4F9E8] text-[#5F8A03] border border-[#7CB305]/40">
            <CheckCircle2 size={12}/> Đã Nghiệm Thu
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <AdminHeader 
        title="Bảng Điều Khiển Tổng Quan" 
        subtitle="Quản lý toàn bộ danh mục sản phẩm, giải pháp PCCC và xử lý đơn lead yêu cầu mẫu"
      />

      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* KPI Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#7CB305] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sản Phẩm MGO</span>
              <div className="w-10 h-10 rounded-xl bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center">
                <Boxes size={20} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{INITIAL_PRODUCTS.length} dòng</div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Đạt chuẩn QCVN 06</span>
              <Link href="/admin/products" className="text-[#5F8A03] font-bold hover:underline inline-flex items-center gap-0.5">
                Chi tiết →
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#7CB305] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Giải Pháp Thi Công</span>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Layers size={20} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{INITIAL_APPLICATIONS.length} giải pháp</div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Hệ bọc ống, vách, sàn</span>
              <Link href="/admin/applications" className="text-sky-600 font-bold hover:underline inline-flex items-center gap-0.5">
                Chi tiết →
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-[#F26522] transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Yêu Cầu Mẫu Thử</span>
              <div className="w-10 h-10 rounded-xl bg-[#FEF3EC] text-[#F26522] flex items-center justify-center">
                <Inbox size={20} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>{requests.length}</span>
              {pendingCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FEF3EC] text-[#F26522] border border-[#F26522]/30">
                  {pendingCount} chờ xử lý
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Khách hàng & B2B</span>
              <Link href="/admin/sample-requests" className="text-[#F26522] font-bold hover:underline inline-flex items-center gap-0.5">
                Xử lý ngay →
              </Link>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-500 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tải Hồ Sơ IBST</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Download size={20} />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{totalDownloads.toLocaleString()}</div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500">{INITIAL_TECH_DOCS.length} tài liệu CAD/Test</span>
              <Link href="/admin/tech-library" className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-0.5">
                Xem kho →
              </Link>
            </div>
          </div>

        </div>

        {/* Recent Sample Requests Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Danh Sách Yêu Cầu Gửi Mẫu Thử & Báo Giá Gần Đây</h2>
              <p className="text-xs text-slate-500">Tiếp nhận từ form "Nhận Mẫu Thử Miễn Phí" trên trang khách hàng</p>
            </div>
            <Link
              href="/admin/sample-requests"
              className="text-xs font-bold text-[#5F8A03] hover:text-[#7CB305] flex items-center gap-1"
            >
              <span>Xem toàn bộ danh sách ({requests.length})</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Mã Đơn / Khách Hàng</th>
                  <th className="py-3 px-4">Công Ty & Địa Chỉ</th>
                  <th className="py-3 px-4">Sản Phẩm Yêu Cầu</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Chuyển Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{req.customerName}</div>
                      <div className="text-[11px] text-slate-400">{req.phone} • {req.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700">{req.company || 'Cá nhân'}</div>
                      <div className="text-[11px] text-slate-400">{req.address}, {req.city}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{req.productName}</div>
                      <div className="text-[11px] text-[#5F8A03] font-bold">Độ dày: {req.thickness}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(req.status)}
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
