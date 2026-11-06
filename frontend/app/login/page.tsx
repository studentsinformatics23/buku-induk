'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LockIcon,
  UserIcon,
  EyeIcon,
  EyeOffIcon,
  ShieldCheckIcon,
  AlertCircleIcon,
  UserCheckIcon,
} from '../../components/Icons';
import { loginApi } from '../../lib/api';
import { setAuth, isAuthenticated } from '../../lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Jika sudah login, langsung alihkan ke dashboard utama
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Harap masukkan username dan password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await loginApi({ username: username.trim(), password });
      setAuth(data.tokens, data.user);
      router.push('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal login. Periksa koneksi backend atau kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col justify-center py-10 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* App Logo Pesantren */}
        <div className="inline-flex w-24 h-24 rounded-3xl bg-white p-3 items-center justify-center shadow-2xl shadow-blue-500/30 mb-3 ring-4 ring-blue-400/25">
          <img
            src="/logo.png"
            alt="Logo Pondok Pesantren Miftahul Huda Al-Faqih"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
          Aplikasi Buku Induk Santri
        </h1>
        <p className="mt-1 text-sm font-semibold text-blue-300">
          Pondok Pesantren Miftahul Huda Al-Faqih
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Sistem Informasi &amp; Rekapitulasi Nilai Akademik Santri
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-6 sm:px-9 shadow-2xl rounded-3xl border border-slate-100">
          <div className="mb-5 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Masuk ke Sistem</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Masukkan username dan password akun Anda
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs sm:text-sm">
              <AlertCircleIcon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Contoh: admin atau walikelas"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-900 font-semibold border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <LockIcon className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 text-slate-900 font-semibold border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span>Masuk ke Sistem</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Info */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
              Pilihan Akun Uji Coba (Klik untuk Mengisi)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Card Admin */}
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin123')}
                className="p-2.5 text-left bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
                  <ShieldCheckIcon className="w-3.5 h-3.5 text-blue-700" />
                  <span>Admin / TU</span>
                </div>
                <p className="text-[11px] text-blue-700 mt-1">
                  User: <span className="font-mono font-bold">admin</span>
                </p>
                <p className="text-[10px] text-blue-600/80 mt-0.5">
                  Akses penuh CRUD, Import/Export
                </p>
              </button>

              {/* Card Wali Kelas */}
              <button
                type="button"
                onClick={() => handleQuickFill('walikelas', 'wali123')}
                className="p-2.5 text-left bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200/80 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-xs">
                  <UserCheckIcon className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Wali Kelas</span>
                </div>
                <p className="text-[11px] text-indigo-700 mt-1">
                  User: <span className="font-mono font-bold">walikelas</span>
                </p>
                <p className="text-[10px] text-indigo-600/80 mt-0.5">
                  Input nilai santri &amp; Cetak PDF
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-5 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
            <LockIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Password dienkripsi dengan PBKDF2-SHA256 &amp; Token JWT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
