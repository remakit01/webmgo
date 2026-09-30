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
  ChevronRight
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import { 
  ADMIN_PRODUCTS, 
  ADMIN_APPLICATIONS, 
  ADMIN_REQUESTS, 
  ADMIN_TECH_DOCS 
} from '@/lib/admin-data';

export default function AdminDashboardPage() {
  const [requests, setRequests] = useState(ADMIN_REQUESTS);

  const pendingCount = requests.filter(r => r.status === 'new' || r.status === 'processing').length;
  const totalDownloads = ADMIN_TECH_DOCS.reduce((acc, doc) => acc + doc.downloads, 0);

  const handleUpdateStatus = (id: string, newStatus: any) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800"><AlertCircle size={12}/> Chờ Xử Lý</span>;
      case 'processing':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800"><Clock size={12}/> Đang Chuẩn Bị</span>;
      case 'shipped':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800"><Truck size={12}/> Đang Gửi Hàng</span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F4F9E8] text-[#5F8A03] border border-[#7CB305]/30"><CheckCircle2 size={12}/> Đã Nghiệm Thu</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminHeader />

      <main className="flex-1 p-6 sm:p-8 space-y-8 max-w-[1600px] w-full mx-auto">
        
        {/* TOP STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sản Phẩm MGO</span>
              <div className="w-10 h-10 rounded-xl bg-[#F4F9E8] text-[#5F8A03] flex items-center justify-center">
                <Boxes size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{ADMIN_PRODUCTS.length}</span>
              <span className="text-xs text-[#5F8A03] font-bold flex items-center gap-0.5">
                <TrendingUp size={13} /> 100% Active
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">Bao gồm FireOFF, Sàn, SoundOFF, Decor</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Giải Pháp Thi Công</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{ADMIN_APPLICATIONS.length}</span>
              <span className="text-xs text-blue-600 font-bold">5 Danh mục chính</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">Ống gió, vách, sàn, dầm thép, cửa PCCC</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Yêu Cầu Mẫu Mới</span>
              <div className="w-10 h-10 rounded-xl bg-[#FEF3EC] text-[#F26522] flex items-center justify-center">
                <Inbox size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#F26522]">{pendingCount}</span>
              <span className="text-xs text-[#F26522] font-bold bg-[#FEF3EC] px-2 py-0.5 rounded-full">Cần xử lý</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">Tổng cộng {requests.length} đơn mẫu từ website</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lượt Tải Hồ Sơ</span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Download size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalDownloads.toLocaleString()}</span>
              <span className="text-xs text-purple-600 font-bold">IBST & CAD DWG</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">4 tài liệu kỹ thuật đang phát hành</div>
          </div>

        </div>

        {/* QUICK ACTIONS BANNER */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-slate-700">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#A0D911]">Trung Tâm Quản Trị Dữ Liệu</span>
            <h2 className="text-lg sm:text-xl font-black mt-1">Quản lý nội dung Tấm Chống Cháy MGO Remak®</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Cập nhật thông số kỹ thuật, hồ sơ kiểm định lò đốt IBST, danh mục giải pháp và quản lý các đơn yêu cầu mẫu gửi cho nhà thầu/chủ đầu tư.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/admin/products"
              className="px-4 py-2.5 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus size={15} />
              <span>Thêm Sản Phẩm</span>
            </Link>
            <Link
              href="/admin/sample-requests"
              className="px-4 py-2.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-white text-xs font-bold transition-colors flex items-center gap-2"
            >
              <Inbox size={15} />
              <span>Xem Đơn Yêu Cầu Mẫu ({pendingCount})</span>
            </Link>
          </div>
        </div>

        {/* MAIN DATA SECTION: RECENT SAMPLE REQUESTS */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Đơn Đăng Ký Nhận Mẫu & Báo Giá Gần Đây</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#F4F9E8] text-[#5F8A03]">Live</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Dữ liệu gửi từ Form nhận mẫu thực tế trên website</p>
            </div>
            <Link
              href="/admin/sample-requests"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5F8A03] hover:text-[#7CB305] transition-colors"
            >
              <span>Xem tất cả danh sách</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Mã Đơn</th>
                  <th className="p-4">Khách Hàng / Đơn Vị</th>
                  <th className="p-4">Giải Pháp / Độ Dày</th>
                  <th className="p-4">Thời Gian</th>
                  <th className="p-4 text-center">Trạng Thái</th>
                  <th className="p-4 pr-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {requests.slice(0, 4).map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-[#5F8A03] text-xs">
                      {req.id}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{req.customerName}</div>
                      <div className="text-xs text-slate-500">{req.company} • {req.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{req.solution}</div>
                      <div className="text-xs text-slate-500">Độ dày: <span className="font-bold text-slate-700">{req.thickness}</span></div>
                    </td>
                    <td className="p-4 text-xs text-slate-500 whitespace-nowrap">
                      {req.createdAt}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="p-4 pr-6 text-right whitespace-nowrap">
                      <select
                        aria-label="Cập nhật trạng thái đơn"
                        value={req.status}
                        onChange={(e) => handleUpdateStatus(req.id, e.target.value)}
                        className="text-xs font-bold py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 focus:outline-none focus:border-[#5F8A03] cursor-pointer"
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

        {/* 2 COLUMNS: POPULAR PRODUCTS & TECH DOCS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Products Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Danh Mục Sản Phẩm MGO Remak</h3>
              <Link href="/admin/products" className="text-xs font-bold text-[#5F8A03] hover:underline flex items-center gap-1">
                <span>Quản lý</span>
                <ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {ADMIN_PRODUCTS.map((prod) => (
                <div key={prod.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-100/70 transition-colors">
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900">{prod.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {prod.category} • <span className="text-[#F26522] font-semibold">{prod.fireRating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900">{prod.price}</div>
                    <span className="text-[10px] font-bold text-[#5F8A03]">Tồn: {prod.stock.toLocaleString()} tấm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Applications Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Giải Pháp Đã Chuẩn Hóa</h3>
              <Link href="/admin/applications" className="text-xs font-bold text-[#5F8A03] hover:underline flex items-center gap-1">
                <span>Quản lý</span>
                <ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {ADMIN_APPLICATIONS.map((app) => (
                <div key={app.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-100/70 transition-colors">
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900">{app.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {app.category} • Độ dày: {app.recommendedThickness}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF3EC] text-[#F26522]">
                      {app.eiRating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
