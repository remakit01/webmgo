'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  KeyRound, 
  Sparkles,
  Server,
  UserCheck
} from 'lucide-react';
import { loginWithApi } from '@/lib/api-auth';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginWithApi(identifier.trim(), password);

    if (result.success) {
      router.push('/');
      router.refresh();
    } else {
      setError(result.error || 'Đăng nhập không thành công');
      setLoading(false);
    }
  };

  const handleFillAdmin = () => {
    setIdentifier('admin');
    setPassword('Admin@123456');
    setError('');
  };

  const handleFillEditor = () => {
    setIdentifier('editor');
    setPassword('Editor@123456');
    setError('');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden select-none">
      
      {/* Background Ambient Glows */}
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
              Đăng Nhập Quản Trị CMS
            </h1>
            <p className="text-xs text-slate-400">
              Hệ Quản Trị Dữ Liệu Tấm MGO Remak® FireOFF • API Backend
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
              <label className="block font-bold text-slate-300 mb-1.5">Tài Khoản (Username) hoặc Email</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin hoặc admin@remak.vn"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#5F8A03] focus:ring-1 focus:ring-[#5F8A03] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Mật Khẩu</label>
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
              className="w-full py-3 bg-gradient-to-r from-[#7CB305] to-[#5F8A03] hover:brightness-105 active:scale-[0.99] text-white font-extrabold rounded-xl transition-all shadow-lg shadow-[#5F8A03]/25 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang xác thực với API...</span>
                </>
              ) : (
                <>
                  <span>Xác Nhận Đăng Nhập</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <KeyRound size={13} className="text-[#A0D911]" />
              <span>Tài khoản trong CSDL PostgreSQL (hỗ trợ cả username &amp; email):</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleFillAdmin}
                className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-white text-xs">Admin Role</span>
                  <Sparkles size={12} className="text-[#A0D911]" />
                </div>
                <div className="text-[10px] text-slate-300 font-mono font-semibold truncate">admin / admin@remak.vn</div>
                <div className="text-[10px] text-emerald-400 font-mono">Admin@123456</div>
              </button>

              <button
                type="button"
                onClick={handleFillEditor}
                className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-white text-xs">Editor Role</span>
                  <UserCheck size={12} className="text-blue-400" />
                </div>
                <div className="text-[10px] text-slate-300 font-mono font-semibold truncate">editor / editor@remak.vn</div>
                <div className="text-[10px] text-blue-400 font-mono">Editor@123456</div>
              </button>
            </div>
          </div>

          {/* Backend Info Badge */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/40">
            <div className="flex items-center gap-1.5">
              <Server size={12} className="text-emerald-500" />
              <span>API: http://localhost:4000</span>
            </div>
            <div className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-[#5F8A03]" />
              <span>JWT &amp; Redis Cache</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
