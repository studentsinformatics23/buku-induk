'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  RefreshCwIcon,
  LogOutIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  GraduationCapIcon,
  UsersIcon,
} from './Icons';
import { User, clearAuth } from '../lib/auth';
import { logoutApi } from '../lib/api';

interface NavbarProps {
  onRefresh: () => void;
  loading: boolean;
  onOpenMasterData: () => void;
  onOpenUserManagement?: () => void;
  user: User | null;
}

export default function Navbar({
  onRefresh,
  loading,
  onOpenMasterData,
  onOpenUserManagement,
  user,
}: NavbarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      setLoggingOut(true);
      try {
        await logoutApi();
      } catch (err) {
        console.error(err);
        clearAuth();
      } finally {
        setLoggingOut(false);
      }
      router.push('/login');
    }
  };

  const isAdmin = user?.role === 'admin';
  const isWali = user?.role === 'wali_kelas';
  const isSiswa = user?.role === 'siswa';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-2xs shrink-0 overflow-hidden">
            <img
              src="/logo.png"
              alt="Logo Pondok Pesantren Miftahul Huda Al-Faqih"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 leading-tight truncate">
              Buku Induk Santri
            </h1>
            <p className="text-[10px] sm:text-xs text-blue-700 font-semibold truncate max-w-[150px] sm:max-w-none">
              Ponpes Miftahul Huda Al-Faqih
            </p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* User Badge */}
          {user && (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2 sm:pr-3 py-1 bg-slate-50 border border-slate-200 rounded-xl">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  isAdmin
                    ? 'bg-blue-600 text-white'
                    : isWali
                    ? 'bg-emerald-600 text-white'
                    : 'bg-sky-600 text-white'
                }`}
                title={`${user.username} (${
                  isAdmin ? 'Admin / TU' : isWali ? 'Wali Kelas' : 'Santri / Siswa'
                })`}
              >
                {isAdmin ? (
                  <ShieldCheckIcon className="w-4 h-4" />
                ) : isWali ? (
                  <UserCheckIcon className="w-4 h-4" />
                ) : (
                  <GraduationCapIcon className="w-4 h-4" />
                )}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-slate-900 leading-none truncate max-w-[130px]">
                  {isSiswa ? (user.siswa_nama || user.username) : (user.first_name || user.username)}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded font-semibold text-[9px] ${
                      isAdmin
                        ? 'bg-blue-100 text-blue-800'
                        : isWali
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {isAdmin ? 'Admin / TU' : isWali ? 'Wali Kelas' : 'Santri'}
                  </span>
                  {isWali && user.kelas_diampu && (
                    <span className="text-slate-500 font-medium">({user.kelas_diampu})</span>
                  )}
                  {isSiswa && user.siswa_kelas && (
                    <span className="text-slate-500 font-medium">({user.siswa_kelas})</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Kelola User button (Hanya untuk Admin / TU) */}
          {isAdmin && onOpenUserManagement && (
            <button
              onClick={onOpenUserManagement}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
              title="Kelola Akun Wali Kelas & Pengguna"
            >
              <UsersIcon className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Kelola User</span>
            </button>
          )}

          {/* Data Master button (Hanya untuk Admin / TU) */}
          {isAdmin && (
            <button
              onClick={onOpenMasterData}
              type="button"
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
              title="Kelola Data Master (Mata Pelajaran & Semester)"
            >
              <GraduationCapIcon className="w-3.5 h-3.5 text-slate-600 sm:hidden" />
              <span className="hidden sm:inline">Data Master</span>
            </button>
          )}

          {/* Refresh button (Hanya untuk bukan siswa atau sesuai kebutuhan) */}
          <button
            onClick={onRefresh}
            disabled={loading}
            type="button"
            className="inline-flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            title="Muat Ulang Data"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            type="button"
            className="inline-flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            title="Keluar dari Akun"
          >
            <LogOutIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
