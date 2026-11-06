'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import SiswaModal from '../components/SiswaModal';
import BukuIndukModal from '../components/BukuIndukModal';
import MasterDataModal from '../components/MasterDataModal';
import ImportExcelModal from '../components/ImportExcelModal';
import CetakBukuIndukModal from '../components/CetakBukuIndukModal';
import UserManagementModal from '../components/UserManagementModal';
import PortalSiswaView from '../components/PortalSiswaView';
import {
  Siswa,
  getSiswaList,
  deleteSiswa,
  getMataPelajaranList,
  getTahunSemesterList,
  downloadExportExcel,
} from '../lib/api';
import {
  User,
  isAuthenticated,
  getCurrentUser,
} from '../lib/auth';
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  FileTextIcon,
  UserIcon,
  GraduationCapIcon,
  CalendarIcon,
  AlertCircleIcon,
  FileSpreadsheetIcon,
  DownloadIcon,
  PrinterIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  UsersIcon,
} from '../components/Icons';

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [search, setSearch] = useState('');
  const [kelasFilter, setKelasFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Stats
  const [totalMapel, setTotalMapel] = useState(0);
  const [totalSemester, setTotalSemester] = useState(0);

  // Modals state
  const [isSiswaModalOpen, setIsSiswaModalOpen] = useState(false);
  const [selectedSiswaForEdit, setSelectedSiswaForEdit] = useState<Siswa | null>(null);

  const [isBukuIndukOpen, setIsBukuIndukOpen] = useState(false);
  const [selectedSiswaIdForBukuInduk, setSelectedSiswaIdForBukuInduk] = useState<number | null>(null);

  const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  const [isCetakModalOpen, setIsCetakModalOpen] = useState(false);
  const [selectedSiswaIdForCetak, setSelectedSiswaIdForCetak] = useState<number | null>(null);

  // Check auth on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    const user = getCurrentUser();
    setCurrentUser(user);
    setAuthChecked(true);

    const handleAuthChange = () => {
      if (!isAuthenticated()) {
        router.replace('/login');
      } else {
        setCurrentUser(getCurrentUser());
      }
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [router]);

  const isAdmin = currentUser?.role === 'admin';
  const isWaliKelas = currentUser?.role === 'wali_kelas';

  const loadData = useCallback(async (query: string = '', k: string = '', s: string = '') => {
    if (!isAuthenticated()) return;
    setLoading(true);
    setServerError(null);
    try {
      const [siswa, mapel, semester] = await Promise.all([
        getSiswaList({ search: query, kelas: k, status_siswa: s }),
        getMataPelajaranList().catch(() => []),
        getTahunSemesterList().catch(() => []),
      ]);
      setSiswaList(siswa);
      setTotalMapel(mapel.length);
      setTotalSemester(semester.length);
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes('Sesi Anda telah berakhir')) {
        router.replace('/login');
        return;
      }
      setServerError(
        'Tidak dapat terhubung ke Backend Django (http://127.0.0.1:8000). Pastikan server backend sudah berjalan.'
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (authChecked) {
      loadData(search, kelasFilter, statusFilter);
    }
  }, [authChecked, loadData, kelasFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    if (!authChecked) return;
    const timer = setTimeout(() => {
      loadData(search, kelasFilter, statusFilter);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, kelasFilter, statusFilter, loadData, authChecked]);

  // Unique list of classes for dropdown
  const uniqueClasses = useMemo(() => {
    const setClasses = new Set<string>();
    siswaList.forEach((s) => {
      if (s.kelas && s.kelas !== '-') setClasses.add(s.kelas);
    });
    return Array.from(setClasses).sort();
  }, [siswaList]);

  const handleOpenAdd = () => {
    setSelectedSiswaForEdit(null);
    setIsSiswaModalOpen(true);
  };

  const handleOpenEdit = (siswa: Siswa) => {
    setSelectedSiswaForEdit(siswa);
    setIsSiswaModalOpen(true);
  };

  const handleOpenBukuInduk = (id: number) => {
    setSelectedSiswaIdForBukuInduk(id);
    setIsBukuIndukOpen(true);
  };

  const handleOpenCetak = (id: number) => {
    setSelectedSiswaIdForCetak(id);
    setIsCetakModalOpen(true);
  };

  const handleDelete = async (siswa: Siswa) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus data santri "${siswa.nama_lengkap}" (NISN: ${siswa.nisn})? Data nilai terkait juga akan terhapus.`
      )
    ) {
      return;
    }

    try {
      await deleteSiswa(siswa.id);
      loadData(search, kelasFilter, statusFilter);
    } catch (err: any) {
      alert('Gagal menghapus santri: ' + err.message);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      await downloadExportExcel({
        search,
        kelas: kelasFilter,
        status_siswa: statusFilter,
      });
    } catch (err: any) {
      alert('Gagal mengunduh Excel: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aktif':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Lulus':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pindah':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-xs font-semibold text-slate-500">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  // Khusus Akun Santri / Siswa: Tampilkan Portal Rapor & Hasil Nilai Santri Mandiri
  if (currentUser?.role === 'siswa') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar
          loading={loading}
          user={currentUser}
          onRefresh={() => loadData()}
          onOpenMasterData={() => {}}
        />

        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex-1">
          <PortalSiswaView
            user={currentUser}
            onOpenCetak={(siswaId) => handleOpenCetak(siswaId)}
          />
        </main>

        <CetakBukuIndukModal
          isOpen={isCetakModalOpen}
          onClose={() => setIsCetakModalOpen(false)}
          siswaId={selectedSiswaIdForCetak}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        loading={loading}
        user={currentUser}
        onRefresh={() => loadData(search, kelasFilter, statusFilter)}
        onOpenMasterData={() => setIsMasterDataOpen(true)}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex-1">
        {/* Role & School Information Banner (Adaptive Mobile & Desktop) */}
        <div className="mb-4 sm:mb-6 p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${
                isAdmin ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {isAdmin ? <ShieldCheckIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <UserCheckIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  Selamat Datang, {currentUser?.first_name || currentUser?.username}!
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${
                    isAdmin
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}
                >
                  {isAdmin ? 'Admin / TU' : `Wali Kelas ${currentUser?.kelas_diampu ? `(${currentUser.kelas_diampu})` : ''}`}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                {isAdmin
                  ? 'Akses penuh: kelola data santri (CRUD), impor/ekspor Excel, dan data master mapel/semester.'
                  : 'Akses input nilai santri pada Buku Induk dan cetak/unduh dokumen PDF resmi.'}
              </p>
            </div>
          </div>
          {isWaliKelas && currentUser?.kelas_diampu && (
            <button
              type="button"
              onClick={() => setKelasFilter(currentUser.kelas_diampu)}
              className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all self-start sm:self-auto cursor-pointer shrink-0"
            >
              Filter Kelas ({currentUser.kelas_diampu})
            </button>
          )}
        </div>

        {/* Error notification if backend is offline */}
        {serverError && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 animate-fade-in shadow-2xs">
            <AlertCircleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <p className="font-bold">Koneksi Backend Belum Terhubung</p>
              <p className="text-amber-700 mt-0.5 text-xs">{serverError}</p>
              <div className="mt-2 text-[11px] font-mono bg-white/80 p-2 rounded-lg inline-block border border-amber-200 text-amber-950">
                cd backend &amp;&amp; python manage.py runserver
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid - Adaptive 3-col on Mobile & Desktop */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                Total Santri
              </p>
              <p className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-0.5 sm:mt-1">
                {siswaList.length}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 self-end sm:self-auto">
              <UserIcon className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                Mapel
              </p>
              <p className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-0.5 sm:mt-1">
                {totalMapel}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 self-end sm:self-auto">
              <GraduationCapIcon className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                Semester
              </p>
              <p className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-0.5 sm:mt-1">
                {totalSemester}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 self-end sm:self-auto">
              <CalendarIcon className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* Action Bar & Filters (Adaptive Mobile Layout) */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs mb-4 sm:mb-6 space-y-2.5 sm:space-y-3">
          <div className="flex flex-col lg:flex-row gap-2.5 sm:gap-3 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari NISN, Nama Santri, atau Alamat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm bg-white text-slate-900 font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 transition-all shadow-2xs"
              />
            </div>

            {/* Filters & Actions Group */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
              {/* Dropdown Filters (2 Columns on Phone) */}
              <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                {/* Filter Kelas */}
                <select
                  value={kelasFilter}
                  onChange={(e) => setKelasFilter(e.target.value)}
                  className="w-full px-2.5 sm:px-3 py-2 text-xs bg-white text-slate-900 font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                >
                  <option value="">Semua Kelas</option>
                  {uniqueClasses.map((k) => (
                    <option key={k} value={k}>
                      Kelas {k}
                    </option>
                  ))}
                </select>

                {/* Filter Status */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2.5 sm:px-3 py-2 text-xs bg-white text-slate-900 font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                >
                  <option value="">Semua Status</option>
                  <option value="Aktif">Status: Aktif</option>
                  <option value="Lulus">Status: Lulus</option>
                  <option value="Pindah">Status: Pindah</option>
                  <option value="Keluar">Status: Keluar</option>
                </select>
              </div>

              {/* Action Buttons (Adaptive Grid on Phone) */}
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                {/* Export Excel Button */}
                <button
                  type="button"
                  onClick={handleExportExcel}
                  disabled={exporting}
                  className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                  title="Unduh data santri dalam format Excel"
                >
                  <DownloadIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 shrink-0" />
                  <span className="truncate">{exporting ? 'Mengunduh...' : 'Export Excel'}</span>
                </button>

                {/* Kelola User Button (Hanya Admin / TU) */}
                {isAdmin && (
                  <button
                    onClick={() => setIsUserManagementOpen(true)}
                    type="button"
                    className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-bold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                    title="Kelola Akun Wali Kelas & Pengguna"
                  >
                    <UsersIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-700 shrink-0" />
                    <span className="truncate">Kelola User</span>
                  </button>
                )}

                {/* Import Excel Button (Hanya Admin / TU) */}
                {isAdmin && (
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    type="button"
                    className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <FileSpreadsheetIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 shrink-0" />
                    <span className="truncate">Import Excel</span>
                  </button>
                )}

                {/* Tambah Santri Button (Hanya Admin / TU) */}
                {isAdmin && (
                  <button
                    onClick={handleOpenAdd}
                    type="button"
                    className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
                  >
                    <PlusIcon className="w-4 h-4 shrink-0" />
                    <span>Tambah Santri</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DESKTOP VIEW: Full Data Table (Hidden on Mobile < 768px) */}
        {/* ======================================================== */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 w-14">Foto</th>
                  <th className="px-5 py-3.5">NISN / NIS</th>
                  <th className="px-5 py-3.5">Nama Santri</th>
                  <th className="px-4 py-3.5">Kelas</th>
                  <th className="px-4 py-3.5">L/P</th>
                  <th className="px-5 py-3.5">Tempat &amp; Tgl Lahir</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && siswaList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                      <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2 text-xs font-medium">Memuat data santri...</p>
                    </td>
                  </tr>
                ) : siswaList.length > 0 ? (
                  siswaList.map((siswa) => (
                    <tr key={siswa.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Foto */}
                      <td className="px-5 py-3.5">
                        <div className="w-9 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          {siswa.foto_url || siswa.foto ? (
                            <img
                              src={siswa.foto_url || siswa.foto || ''}
                              alt={siswa.nama_lengkap}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </td>

                      {/* NISN / NIS */}
                      <td className="px-5 py-3.5 font-mono font-bold text-blue-700">
                        {siswa.nisn}
                      </td>

                      {/* Nama Lengkap Santri */}
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        <div>{siswa.nama_lengkap}</div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          Agama: {siswa.agama || 'Islam'}
                        </div>
                      </td>

                      {/* Kelas */}
                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {siswa.kelas || '-'}
                        </span>
                      </td>

                      {/* Gender L/P */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-xs font-extrabold ${
                            siswa.jenis_kelamin === 'L'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-pink-50 text-pink-700 border border-pink-200'
                          }`}
                        >
                          {siswa.jenis_kelamin || 'L'}
                        </span>
                      </td>

                      {/* TTL */}
                      <td className="px-5 py-3.5 text-slate-600 text-xs">
                        <div className="font-medium text-slate-800">{siswa.tempat_lahir}</div>
                        <div className="text-slate-400">
                          {new Date(siswa.tanggal_lahir).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      {/* Status Santri */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                            siswa.status_siswa
                          )}`}
                        >
                          {siswa.status_siswa}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Buku Induk & Nilai */}
                          <button
                            onClick={() => handleOpenBukuInduk(siswa.id)}
                            type="button"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer shadow-2xs"
                            title="Buku Induk & Nilai Santri"
                          >
                            <FileTextIcon className="w-3.5 h-3.5" />
                            <span>Buku Induk</span>
                          </button>

                          {/* Cetak / PDF */}
                          <button
                            onClick={() => handleOpenCetak(siswa.id)}
                            type="button"
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                            title="Cetak Lembar Buku Induk Santri ke PDF"
                          >
                            <PrinterIcon className="w-3.5 h-3.5 text-slate-600" />
                            <span>Cetak PDF</span>
                          </button>

                          {/* Edit Biodata (Admin) */}
                          {isAdmin && (
                            <button
                              onClick={() => handleOpenEdit(siswa)}
                              type="button"
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Biodata Santri"
                            >
                              <EditIcon className="w-4 h-4" />
                            </button>
                          )}

                          {/* Hapus Santri (Admin) */}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(siswa)}
                              type="button"
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Santri"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                      <p className="text-sm font-semibold text-slate-600">
                        Tidak ada data santri ditemukan.
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Coba sesuaikan kata kunci pencarian atau filter kelas.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MOBILE / HP VIEW: Responsive Cards (Visible only on < md) */}
        {/* ======================================================== */}
        <div className="block md:hidden space-y-3">
          {loading && siswaList.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
              <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-xs font-medium">Memuat data santri...</p>
            </div>
          ) : siswaList.length > 0 ? (
            siswaList.map((siswa) => (
              <div
                key={siswa.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 space-y-3"
              >
                {/* Header Card: Foto, Nama, NISN, Badges */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-15 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {siswa.foto_url || siswa.foto ? (
                      <img
                        src={siswa.foto_url || siswa.foto || ''}
                        alt={siswa.nama_lengkap}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug truncate">
                        {siswa.nama_lengkap}
                      </h3>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${getStatusBadge(
                          siswa.status_siswa
                        )}`}
                      >
                        {siswa.status_siswa}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        NISN: {siswa.nisn}
                      </span>
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {siswa.kelas || '-'}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                          siswa.jenis_kelamin === 'L'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-pink-50 text-pink-700'
                        }`}
                      >
                        {siswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>
                        {siswa.tempat_lahir},{' '}
                        {new Date(siswa.tanggal_lahir).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Card Actions: Big Touch-Friendly Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-1">
                    {/* Buku Induk Button */}
                    <button
                      onClick={() => handleOpenBukuInduk(siswa.id)}
                      type="button"
                      className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl transition-colors cursor-pointer"
                    >
                      <FileTextIcon className="w-3.5 h-3.5" />
                      <span>Buku Induk</span>
                    </button>

                    {/* Cetak PDF Button */}
                    <button
                      onClick={() => handleOpenCetak(siswa.id)}
                      type="button"
                      className="inline-flex items-center justify-center gap-1 py-2 px-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                      title="Cetak PDF"
                    >
                      <PrinterIcon className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden xs:inline">Cetak</span>
                    </button>
                  </div>

                  {/* Admin Actions (Edit & Hapus) */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(siswa)}
                        type="button"
                        className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                        title="Edit Biodata"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(siswa)}
                        type="button"
                        className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                        title="Hapus Santri"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
              <p className="text-sm font-semibold text-slate-600">
                Tidak ada data santri ditemukan.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Coba sesuaikan kata kunci pencarian atau filter kelas.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <SiswaModal
        isOpen={isSiswaModalOpen}
        onClose={() => setIsSiswaModalOpen(false)}
        siswaToEdit={selectedSiswaForEdit}
        onSuccess={() => loadData(search, kelasFilter, statusFilter)}
      />

      <BukuIndukModal
        isOpen={isBukuIndukOpen}
        onClose={() => setIsBukuIndukOpen(false)}
        siswaId={selectedSiswaIdForBukuInduk}
        onUpdated={() => loadData(search, kelasFilter, statusFilter)}
      />

      <CetakBukuIndukModal
        isOpen={isCetakModalOpen}
        onClose={() => setIsCetakModalOpen(false)}
        siswaId={selectedSiswaIdForCetak}
      />

      <MasterDataModal
        isOpen={isMasterDataOpen}
        onClose={() => {
          setIsMasterDataOpen(false);
          loadData(search, kelasFilter, statusFilter);
        }}
      />

      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => loadData(search, kelasFilter, statusFilter)}
      />

      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        currentUserId={currentUser?.id}
      />
    </div>
  );
}
