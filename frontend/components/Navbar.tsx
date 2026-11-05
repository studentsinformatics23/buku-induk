'use client';

import React from 'react';
import { BookOpenIcon, RefreshCwIcon } from './Icons';

interface NavbarProps {
  onRefresh: () => void;
  loading: boolean;
  onOpenMasterData: () => void;
}

export default function Navbar({ onRefresh, loading, onOpenMasterData }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <BookOpenIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              Buku Induk Siswa
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Sistem Informasi & Rekapitulasi Nilai Siswa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenMasterData}
            type="button"
            className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
          >
            Data Master (Mapel & Semester)
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-all cursor-pointer disabled:opacity-50"
            title="Muat Ulang Data"
          >
            <RefreshCwIcon className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </header>
  );
}
