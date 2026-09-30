'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ShieldCheck, ArrowRight, AlertCircle, KeyRound, Sparkles } from 'lucide-react';
import { setAdminSession } from '@/lib/admin-auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Demo authentication logic
      const validUsers: Record<string, string> = {
        admin: 'admin123',
        remak: 'remak123',
        'admin@remak.vn': '123456',
      };

      if (validUsers[username] && validUsers[username] === password) {
        setAdminSession({
          username,
          name: username === 'admin' ? 'Quản Trị Viên' : 'Chuyên Viên Remak',
          email: username.includes('@') ? username : `${username}@remak.vn`,
          role: 'Super Admin',
        });
        router.push('/admin');
      } else {
        setError('Tài khoản hoặc mật khẩu không chính xác. Bạn có thể bấm "Điền tài khoản Demo" bên dưới.');
        setLoading(false);
      }
    }, 400);
  };

  const handleQuickDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden select-none">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#5F8A03]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#F26522]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        
        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7CB305] to-[#5F8A03] text-white font-black text-2xl shadow-lg shadow-[#5F8A03]/30 mb-2">
              R
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Đăng Nhập Quản Trị
            </h1>
            <p className="text-xs text-slate-400">
              Hệ thống quản lý nội dung & dữ liệu Tấm MGO Remak® FireOFF
            </p>
          </div>

          {/* Error notification */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Tài khoản / Email</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin hoặc admin@remak.vn"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#5F8A03] focus:ring-1 focus:ring-[#5F8A03] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#5F8A03] focus:ring-1 focus:ring-[#5F8A03] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#5F8A03] hover:bg-[#7CB305] text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#5F8A03]/30 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập Vào CMS'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="pt-4 border-t border-slate-800/80 text-center space-y-3">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
            >
              <Sparkles size={13} className="text-[#A0D911]" />
              <span>Điền Nhanh Tài Khoản Demo (admin / admin123)</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck size={13} className="text-[#5F8A03]" />
              <span>Bảo mật hệ thống chuẩn Remak Vietnam</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
