'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { loginWithApi } from '@/cms/lib/api-auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('Admin@123456');
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

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 select-none admin-typography">

      {/* Background Subtle Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#7CB305]/5 rounded-full blur-[100px]" />
      </div>

      {/* Main Login Card - Centered with Clear Borders */}
      <div className="w-full max-w-[420px] bg-white  rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-200/50 space-y-6 relative z-10">

        {/* Brand Logo */}
        <div className="text-center">
          <div className="flex justify-center">
            <img
              src="/Logo_remak_800.png"
              alt="Remak Vietnam"
              className="h-10 sm:h-11 w-auto object-contain"
            />
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs font-bold"
          >
            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">

          {/* Username */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-username"
              className="block text-xs font-bold text-slate-800 uppercase tracking-wider"
            >
              Tài khoản
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
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
                placeholder="admin"
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-300 hover:border-slate-400 focus:border-[#7CB305] focus:ring-4 focus:ring-[#7CB305]/20 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="block text-xs font-bold text-slate-800 uppercase tracking-wider"
            >
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
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
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 bg-white border-2 border-slate-300 hover:border-slate-400 focus:border-[#7CB305] focus:ring-4 focus:ring-[#7CB305]/20 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-700 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#7CB305] to-[#5F8A03] hover:from-[#85B90B] hover:to-[#6B9C03] active:scale-[0.99] text-white font-black text-sm shadow-md shadow-[#7CB305]/30 border-2 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer focus-visible:ring-4 focus-visible:ring-[#7CB305]/25"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                <span>Đang xử lý…</span>
              </>
            ) : (
              <>
                <span>Đăng nhập</span>
              </>
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
