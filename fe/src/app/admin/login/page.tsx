'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  Sparkles,
  UserCheck,
  Flame,
  CheckCircle2,
  Building2,
  Eye,
  EyeOff,
  FileCheck,
  ShieldAlert
} from 'lucide-react';
import { loginWithApi } from '@/cms/lib/api-auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('Admin@123456');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'editor'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginWithApi(identifier.trim(), password);

    if (result.success) {
      router.push('/admin');
      router.refresh();
    } else {
      setError(result.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản.');
      setLoading(false);
    }
  };

  const handleSelectRole = (role: 'admin' | 'editor') => {
    setSelectedRole(role);
    setError('');
    if (role === 'admin') {
      setIdentifier('admin');
      setPassword('Admin@123456');
    } else {
      setIdentifier('editor');
      setPassword('Editor@123456');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col lg:flex-row text-slate-800 selection:bg-[#7CB305]/20 selection:text-[#5F8A03]">
      
      {/* ========================================================================= */}
      {/* CỘT TRÁI: REMAK BRAND & INDUSTRIAL AUTHORITY (Theme Trắng Sáng Cao Cấp) */}
      {/* ========================================================================= */}
      <div className="lg:w-1/2 relative bg-gradient-to-br from-[#F4F9E8]/80 via-white to-slate-50 flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-slate-200 overflow-hidden">
        
        {/* Lớp lưới kỹ thuật mờ sang trọng */}
        <div 
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #0F172A 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Ambient Brand Soft Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#7CB305]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-[#F26522]/10 rounded-full blur-[90px] pointer-events-none" />

        {/* Top Header & Brand Badge */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7CB305] to-[#5F8A03] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#5F8A03]/25 ring-4 ring-[#7CB305]/15">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-slate-900">REMAK® VIETNAM</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#7CB305]/15 text-[#5F8A03] border border-[#7CB305]/30 uppercase tracking-wider">
                  CMS Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Hệ Thống Tấm Chống Cháy &amp; Cách Nhiệt MGO Chuyên Dụng</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md">
            <Flame size={15} className="text-[#F26522]" aria-hidden="true" />
            <span>Tiêu chuẩn PCCC: <strong className="text-slate-900">QCVN 06:2022/BXD</strong> &amp; <strong className="text-slate-900">QCVN 03:2021</strong></span>
          </div>
        </div>

        {/* Middle: Brand Pitch & Highlights */}
        <div className="relative z-10 py-10 lg:py-14 space-y-8">
          <div className="space-y-3.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#FEF3EC] border border-[#F26522]/30 text-xs font-bold text-[#F26522]">
              <ShieldAlert size={14} />
              CỔNG QUẢN TRỊ DỮ LIỆU TẬP TRUNG
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Điều Hành Dữ Liệu Kỹ Thuật &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5F8A03] to-[#7CB305]">Giải Pháp PCCC</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Nền tảng kiểm soát thông số tấm Magie Oxit (MGO), kết cấu bọc ống gió chống cháy EI30–EI120, và điều phối hồ sơ cấp mẫu công trình dự án trên toàn quốc.
            </p>
          </div>

          {/* 3 Pillar Features Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1.5 hover:shadow-md hover:border-[#7CB305]/40 transition-all">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <CheckCircle2 size={16} className="text-[#7CB305] shrink-0" aria-hidden="true" />
                <span>Zero Rust Cl-</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Không sinh ion Cl-, triệt tiêu ăn mòn kim loại &amp; tôn mạ kẽm.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1.5 hover:shadow-md hover:border-[#F26522]/40 transition-all">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <FileCheck size={16} className="text-[#F26522] shrink-0" aria-hidden="true" />
                <span>Hồ Sơ Đốt Mẫu</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Báo cáo thử nghiệm thực tế tại Viện IBST &amp; Cục PCCC.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1.5 hover:shadow-md hover:border-sky-400 transition-all">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Building2 size={16} className="text-sky-600 shrink-0" aria-hidden="true" />
                <span>Cấp Mẫu Dự Án</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Điều phối hàng mẫu trực tiếp đến tổng thầu &amp; chủ đầu tư.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Status Proof */}
        <div className="relative z-10 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse" />
            <span className="font-semibold text-slate-700">Hệ Thống API:</span>
            <span className="text-slate-500 font-medium">NestJS Port 4000 (Sẵn sàng)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono font-semibold">v2.4-enterprise</span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* CỘT PHẢI: FORM ĐĂNG NHẬP CHUẨN LIGHT THEME SANG TRỌNG */}
      {/* ========================================================================= */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-[#F8FAFC] relative">
        
        {/* Ambient subtle glow */}
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-[#7CB305]/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-200/50 space-y-6 relative z-10">
          
          {/* Card Header */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Đăng Nhập Cổng CMS
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Nhập tài khoản quản trị để truy cập và xử lý dữ liệu hệ thống.
            </p>
          </div>

          {/* Role Segmented Switcher for Rapid Testing */}
          <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between px-2 pt-1 text-[11px]">
              <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#7CB305]" aria-hidden="true" />
                Tài khoản thử nghiệm nhanh (Demo):
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-medium">NestJS JWT</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectRole('admin')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-gradient-to-r from-[#7CB305] to-[#5F8A03] text-white shadow-md shadow-[#5F8A03]/25 font-bold'
                    : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 shadow-xs'
                }`}
              >
                <ShieldCheck size={14} className={selectedRole === 'admin' ? 'text-white' : 'text-[#7CB305]'} aria-hidden="true" />
                <span>Admin (Toàn quyền)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('editor')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedRole === 'editor'
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-600/25 font-bold'
                    : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 shadow-xs'
                }`}
              >
                <UserCheck size={14} className={selectedRole === 'editor' ? 'text-white' : 'text-sky-600'} aria-hidden="true" />
                <span>Editor (Biên tập)</span>
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div 
              role="alert" 
              aria-live="polite"
              className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-xs"
            >
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Field: Username / Email */}
            <div className="space-y-1.5">
              <label 
                htmlFor="admin-username" 
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Tài khoản hoặc Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={16} aria-hidden="true" />
                </div>
                <input
                  id="admin-username"
                  name="username"
                  type="text"
                  required
                  spellCheck={false}
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin hoặc admin@remak.vn"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#7CB305] focus:ring-4 focus:ring-[#7CB305]/15 focus-visible:ring-4 focus-visible:ring-[#7CB305]/15 transition-all"
                />
              </div>
            </div>

            {/* Field: Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="admin-password" 
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Mật khẩu
                </label>
                <span className="text-[11px] text-slate-500 font-medium">
                  {selectedRole === 'admin' ? 'Mật khẩu: Admin@123456' : 'Mật khẩu: Editor@123456'}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} aria-hidden="true" />
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  spellCheck={false}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu…"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#7CB305] focus:ring-4 focus:ring-[#7CB305]/15 focus-visible:ring-4 focus-visible:ring-[#7CB305]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#7CB305] to-[#5F8A03] hover:from-[#88C405] hover:to-[#6B9C03] active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-[#5F8A03]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer focus-visible:ring-4 focus-visible:ring-[#7CB305]/20"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  <span>Đang xác thực thông tin…</span>
                </>
              ) : (
                <>
                  <span>Vào Bảng Điều Khiển CMS</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Compliance Notes */}
          <div className="pt-4 border-t border-slate-100 space-y-1.5 text-center">
            <p className="text-[11px] text-slate-500 font-medium">
              Xác thực JWT Token an toàn • Phân quyền Admin &amp; Editor
            </p>
            <p className="text-[10px] text-slate-400">
              © {new Date().getFullYear()} Remak® Vietnam. Hệ thống quản trị dữ liệu kỹ thuật PCCC.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
