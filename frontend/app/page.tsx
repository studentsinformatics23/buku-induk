'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import SiswaModal from '../components/SiswaModal';
import BukuIndukModal from '../components/BukuIndukModal';
import MasterDataModal from '../components/MasterDataModal';
import {
  Siswa,
  getSiswaList,
  deleteSiswa,
  getMataPelajaranList,
  getTahunSemesterList,
} from '../lib/api';
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
  MapPinIcon,
} from '../components/Icons';

export default function Home() {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Stats
  const [totalMapel, setTotalMapel] = useState(0);
  const [totalSemester, setTotalSemester] = useState(0);

  // Modals state
  const [isSiswaModalOpen, setIsSiswaModalOpen] = useState(false);
  const [selectedSiswaForEdit, setSelectedSiswaForEdit] = useState<Siswa | null>(null);

  const [isBukuIndukOpen, setIsBukuIndukOpen] = useState(false);
  const [selectedSiswaIdForBukuInduk, setSelectedSiswaIdForBukuInduk] = useState<number | null>(null);

  const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);

  const loadData = useCallback(async (query: string = '') => {
    setLoading(true);
    setServerError(null);
    try {
      const [siswa, mapel, semester] = await Promise.all([
        getSiswaList(query),
        getMataPelajaranList().catch(() => []),
        getTahunSemesterList().catch(() => []),
      ]);
      setSiswaList(siswa);
      setTotalMapel(mapel.length);
      setTotalSemester(semester.length);
    } catch (err: any) {
      console.error(err);
      setServerError(
        'Tidak dapat terhubung ke Backend Django (http://127.0.0.1:8000). Pastikan server backend sudah dijalankan.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, loadData]);

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

  const handleDelete = async (siswa: Siswa) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus data siswa "${siswa.nama_lengkap}" (NISN: ${siswa.nisn})? Data nilai terkait juga akan terhapus.`
      )
    ) {
      return;
    }

    try {
      await deleteSiswa(siswa.id);
      loadData(search);
    } catch (err: any) {
      alert('Gagal menghapus siswa: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        loading={loading}
        onRefresh={() => loadData(search)}
        onOpenMasterData={() => setIsMasterDataOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Error notification if backend is offline */}
        {serverError && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 animate-fade-in shadow-xs">
            <AlertCircleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <p className="font-bold">Koneksi Backend Belum Terhubung</p>
              <p className="text-amber-700 mt-0.5">
                {serverError}
              </p>
              <div className="mt-2 text-xs font-mono bg-white/70 p-2 rounded-lg inline-block border border-amber-200 text-amber-950">
                cd backend &amp;&amp; python manage.py runserver
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Siswa Terdaftar
              </p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {siswaList.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Mata Pelajaran
              </p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {totalMapel}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCapIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Tahun & Semester
              </p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {totalSemester}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Action Bar (Search & Tambah Button) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan NISN, Nama, atau Alamat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Tambah Data Siswa</span>
          </button>
        </div>

        {/* Tabel Data Siswa */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 w-16">Foto</th>
                  <th className="px-6 py-3.5">NISN</th>
                  <th className="px-6 py-3.5">Nama Lengkap</th>
                  <th className="px-6 py-3.5">Tempat & Tanggal Lahir</th>
                  <th className="px-6 py-3.5">Alamat</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && siswaList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                      <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2 text-xs font-medium">Memuat data siswa...</p>
                    </td>
                  </tr>
                ) : siswaList.length > 0 ? (
                  siswaList.map((siswa) => (
                    <tr
                      key={siswa.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Foto */}
                      <td className="px-6 py-4">
                        <div className="w-10 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
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

                      {/* NISN */}
                      <td className="px-6 py-4 font-mono font-bold text-blue-700">
                        {siswa.nisn}
                      </td>

                      {/* Nama Lengkap */}
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {siswa.nama_lengkap}
                      </td>

                      {/* TTL */}
                      <td className="px-6 py-4 text-slate-600 text-xs">
                        <div>{siswa.tempat_lahir}</div>
                        <div className="text-slate-400">
                          {new Date(siswa.tanggal_lahir).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      {/* Alamat */}
                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate text-xs">
                        <div className="flex items-center gap-1.5">
                          <MapPinIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{siswa.alamat}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenBukuInduk(siswa.id)}
                            type="button"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                            title="Buku Induk & Nilai"
                          >
                            <FileTextIcon className="w-3.5 h-3.5" />
                            <span>Buku Induk</span>
                          </button>

                          <button
                            onClick={() => handleOpenEdit(siswa)}
                            type="button"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Biodata"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(siswa)}
                            type="button"
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Siswa"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                      <UserIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700">
                        {search ? 'Tidak ada siswa yang sesuai pencarian.' : 'Belum ada data siswa.'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {search
                          ? 'Coba gunakan kata kunci pencarian yang lain.'
                          : 'Klik tombol "Tambah Data Siswa" di atas untuk menambahkan siswa baru.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          Sistem Buku Induk Siswa &bull; Backend Django &amp; Frontend Next.js
        </div>
      </footer>

      {/* Modals */}
      <SiswaModal
        isOpen={isSiswaModalOpen}
        onClose={() => setIsSiswaModalOpen(false)}
        onSuccess={() => loadData(search)}
        siswaToEdit={selectedSiswaForEdit}
      />

      <BukuIndukModal
        isOpen={isBukuIndukOpen}
        onClose={() => setIsBukuIndukOpen(false)}
        siswaId={selectedSiswaIdForBukuInduk}
        onUpdated={() => loadData(search)}
      />

      <MasterDataModal
        isOpen={isMasterDataOpen}
        onClose={() => {
          setIsMasterDataOpen(false);
          loadData(search);
        }}
      />
    </div>
  );
}
