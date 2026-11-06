'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCwIcon, LogOutIcon, ShieldCheckIcon, UserCheckIcon } from './Icons';
import { User, clearAuth } from '../lib/auth';
import { logoutApi } from '../lib/api';

interface NavbarProps {
  onRefresh: () => void;
  loading: boolean;
  onOpenMasterData: () => void;
  user: User | null;
}

export default function Navbar({ onRefresh, loading, onOpenMasterData, user }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      try {
        await logoutApi();
      } catch (err) {
        console.error(err);
        clearAuth();
      }
      router.push('/login');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
            <img
              src="/logo.png"
              alt="Logo Pondok Pesantren Miftahul Huda Al-Faqih"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Buku Induk Santri
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-blue-700 font-semibold hidden sm:block">
              Pondok Pesantren Miftahul Huda Al-Faqih
            </p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Badge */}
          {user && (
            <div className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-xl">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isAdmin ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white'
                }`}
                title={user.username}
              >
                {isAdmin ? <ShieldCheckIcon className="w-4 h-4" /> : <UserCheckIcon className="w-4 h-4" />}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-slate-900 leading-none">
                  {user.first_name || user.username}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded font-semibold text-[10px] ${
                      isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {isAdmin ? 'Admin / TU' : 'Wali Kelas'}
                  </span>
                  {user.kelas_diampu && (
                    <span className="text-slate-400 font-normal">({user.kelas_diampu})</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Data Master button (Hanya untuk Admin / TU) */}
          {isAdmin && (
            <button
              onClick={onOpenMasterData}
              type="button"
              className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
            >
              Data Master
            </button>
          )}

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            title="Muat Ulang Data"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-all cursor-pointer"
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
