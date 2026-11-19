'use client';

import React, { useState, useEffect } from 'react';
import {
  TahunSemester,
  MataPelajaran,
  Rombel,
  getTahunSemesterList,
  getMataPelajaranList,
  getRombelList,
  createTahunSemester,
  createMataPelajaran,
  createRombel,
  deleteRombel,
} from '../lib/api';
import { DAFTAR_TINGKAT } from '../lib/kelas';
import { XIcon, PlusIcon, GraduationCapIcon, CalendarIcon, AlertCircleIcon, TrashIcon, UsersIcon } from './Icons';

interface MasterDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRombelChanged?: () => void;
}

export default function MasterDataModal({ isOpen, onClose, onRombelChanged }: MasterDataModalProps) {
  const [activeTab, setActiveTab] = useState<'rombel' | 'mapel' | 'tahun'>('rombel');

  // Lists
  const [rombelList, setRombelList] = useState<Rombel[]>([]);
  const [tahunList, setTahunList] = useState<TahunSemester[]>([]);
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states - Rombel
  const [tingkatRombel, setTingkatRombel] = useState('7');
  const [namaRombel, setNamaRombel] = useState('');
  const [filterTingkatTab, setFilterTingkatTab] = useState<string>('SEMUA');
  const [savingRombel, setSavingRombel] = useState(false);
  const [errorRombel, setErrorRombel] = useState<string | null>(null);

  // Form states - Mapel
  const [kodeMapel, setKodeMapel] = useState('');
  const [namaMapel, setNamaMapel] = useState('');
  const [savingMapel, setSavingMapel] = useState(false);
  const [errorMapel, setErrorMapel] = useState<string | null>(null);

  // Form states - Tahun Semester
  const [tahunAjaran, setTahunAjaran] = useState('2026/2027');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [savingTahun, setSavingTahun] = useState(false);
  const [errorTahun, setErrorTahun] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [r, t, m] = await Promise.all([
        getRombelList(),
        getTahunSemesterList(),
        getMataPelajaranList(),
      ]);
      setRombelList(r);
      setTahunList(t);
      setMapelList(m);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateRombel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaRombel.trim()) return;
    setSavingRombel(true);
    setErrorRombel(null);
    try {
      await createRombel({
        tingkat: tingkatRombel,
        nama: namaRombel.trim(),
      });
      setNamaRombel('');
      await loadData();
      if (onRombelChanged) onRombelChanged();
    } catch (err: any) {
      setErrorRombel(err.message || 'Gagal menambahkan rombel. Mungkin rombel tersebut sudah ada.');
    } finally {
      setSavingRombel(false);
    }
  };

  const handleDeleteRombel = async (id: number, namaLengkap: string) => {
    if (!confirm(`Hapus rombel "${namaLengkap}"? Santri yang berada di rombel ini tetap tersimpan.`)) {
      return;
    }
    try {
      await deleteRombel(id);
      await loadData();
      if (onRombelChanged) onRombelChanged();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus rombel');
    }
  };

  const handleCreateMapel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMapel(true);
    setErrorMapel(null);
    try {
      await createMataPelajaran({
        kode_mapel: kodeMapel.trim().toUpperCase(),
        nama_mapel: namaMapel.trim(),
      });
      setKodeMapel('');
      setNamaMapel('');
      await loadData();
    } catch (err: any) {
      setErrorMapel(err.message || 'Gagal menambahkan mata pelajaran');
    } finally {
      setSavingMapel(false);
    }
  };

  const handleCreateTahun = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTahun(true);
    setErrorTahun(null);
    try {
      await createTahunSemester({
        tahun_ajaran: tahunAjaran.trim(),
        semester: semester,
      });
      await loadData();
    } catch (err: any) {
      setErrorTahun(err.message || 'Gagal menambahkan tahun ajaran');
    } finally {
      setSavingTahun(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[94vh] sm:max-h-[85vh] my-auto">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Kelola Data Master
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Rombongan Belajar (Rombel), Mata Pelajaran &amp; Tahun Ajaran / Semester
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-3 sm:px-6 overflow-x-auto shrink-0 gap-1">
          <button
            onClick={() => setActiveTab('rombel')}
            type="button"
            className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'rombel'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UsersIcon className="w-4 h-4" />
            <span>Rombel / Kelas ({rombelList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('mapel')}
            type="button"
            className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'mapel'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCapIcon className="w-4 h-4" />
            <span>Mata Pelajaran ({mapelList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tahun')}
            type="button"
            className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'tahun'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Tahun &amp; Semester ({tahunList.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6">
          {activeTab === 'rombel' ? (
            <>
              {/* Form Input Rombel */}
              <form onSubmit={handleCreateRombel} className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">Tambah Rombongan Belajar (Rombel) Baru</h4>
                  <span className="text-[11px] text-slate-500">Dikelola manual oleh Admin</span>
                </div>
                {errorRombel && (
                  <div className="p-2 bg-red-100 text-red-700 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircleIcon className="w-4 h-4 shrink-0" />
                    <span>{errorRombel}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tingkat</label>
                    <select
                      value={tingkatRombel}
                      onChange={(e) => setTingkatRombel(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white text-slate-900 font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                    >
                      {DAFTAR_TINGKAT.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex flex-col justify-end">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nama Rombel (Sub-kelas)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Contoh: A, B, RPL 1, IPA 1, Tahfidz"
                        value={namaRombel}
                        onChange={(e) => setNamaRombel(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 shadow-2xs"
                      />
                      <button
                        type="submit"
                        disabled={savingRombel}
                        className="inline-flex items-center gap-1 px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shrink-0 cursor-pointer disabled:opacity-50 shadow-xs"
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                        <span>{savingRombel ? '...' : 'Tambah'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Filter Tingkat pada List */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">Filter Tingkat:</span>
                  <button
                    type="button"
                    onClick={() => setFilterTingkatTab('SEMUA')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                      filterTingkatTab === 'SEMUA'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Semua ({rombelList.length})
                  </button>
                  {DAFTAR_TINGKAT.map((t) => {
                    const count = rombelList.filter((r) => r.tingkat === t.value).length;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setFilterTingkatTab(t.value)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                          filterTingkatTab === t.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Kelas {t.value} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* List Rombel */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-3.5 sm:px-4 py-2.5">Tingkat</th>
                      <th className="px-3.5 sm:px-4 py-2.5">Nama Rombel</th>
                      <th className="px-3.5 sm:px-4 py-2.5">Label Tampilan</th>
                      <th className="px-3.5 sm:px-4 py-2.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rombelList
                      .filter((r) => filterTingkatTab === 'SEMUA' || r.tingkat === filterTingkatTab)
                      .length > 0 ? (
                      rombelList
                        .filter((r) => filterTingkatTab === 'SEMUA' || r.tingkat === filterTingkatTab)
                        .map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-3.5 sm:px-4 py-2.5">
                              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[11px]">
                                Kelas {r.tingkat}
                              </span>
                            </td>
                            <td className="px-3.5 sm:px-4 py-2.5 text-slate-900 font-bold">{r.nama}</td>
                            <td className="px-3.5 sm:px-4 py-2.5 font-mono font-semibold text-slate-700">
                              {r.display_name}
                            </td>
                            <td className="px-3.5 sm:px-4 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteRombel(r.id, r.display_name)}
                                title="Hapus Rombel"
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <TrashIcon className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-slate-400 font-medium">
                          Belum ada data rombel untuk filter ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : activeTab === 'mapel' ? (
            <>
              {/* Form Input Mapel */}
              <form onSubmit={handleCreateMapel} className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Tambah Mata Pelajaran</h4>
                {errorMapel && (
                  <div className="p-2 bg-red-100 text-red-700 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircleIcon className="w-4 h-4 shrink-0" />
                    <span>{errorMapel}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Kode (misal: FIQ-1)"
                      value={kodeMapel}
                      onChange={(e) => setKodeMapel(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white text-slate-900 font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 shadow-2xs"
                    />
                  </div>
                  <div className="sm:col-span-2 flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Nama Mapel (misal: Fiqih / Nahwu)"
                      value={namaMapel}
                      onChange={(e) => setNamaMapel(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 shadow-2xs"
                    />
                    <button
                      type="submit"
                      disabled={savingMapel}
                      className="inline-flex items-center gap-1 px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shrink-0 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      <span>{savingMapel ? '...' : 'Tambah'}</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* List Mapel */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-3.5 sm:px-4 py-2.5">Kode</th>
                      <th className="px-3.5 sm:px-4 py-2.5">Nama Mata Pelajaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mapelList.length > 0 ? (
                      mapelList.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="px-3.5 sm:px-4 py-2.5 font-mono font-bold text-blue-700">{m.kode_mapel}</td>
                          <td className="px-3.5 sm:px-4 py-2.5 text-slate-900 font-semibold">{m.nama_mapel}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="px-4 py-6 text-center text-slate-400 font-medium">
                          Belum ada data mata pelajaran.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              {/* Form Input Tahun & Semester */}
              <form onSubmit={handleCreateTahun} className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Tambah Tahun Ajaran &amp; Semester</h4>
                {errorTahun && (
                  <div className="p-2 bg-red-100 text-red-700 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircleIcon className="w-4 h-4 shrink-0" />
                    <span>{errorTahun}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Tahun Ajaran (2026/2027)"
                      value={tahunAjaran}
                      onChange={(e) => setTahunAjaran(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white text-slate-900 font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 shadow-2xs"
                    />
                  </div>
                  <div>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value as 'Ganjil' | 'Genap')}
                      className="w-full px-3 py-2 text-xs bg-white text-slate-900 font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                    >
                      <option value="Ganjil">Ganjil</option>
                      <option value="Genap">Genap</option>
                    </select>
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={savingTahun}
                      className="w-full inline-flex items-center justify-center gap-1 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      <span>{savingTahun ? '...' : 'Tambah Semester'}</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* List Tahun Semester */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-3.5 sm:px-4 py-2.5">Tahun Ajaran</th>
                      <th className="px-3.5 sm:px-4 py-2.5">Semester</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tahunList.length > 0 ? (
                      tahunList.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="px-3.5 sm:px-4 py-2.5 font-bold text-slate-900">{t.tahun_ajaran}</td>
                          <td className="px-3.5 sm:px-4 py-2.5 text-slate-700">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              t.semester === 'Ganjil' ? 'bg-indigo-100 text-indigo-900' : 'bg-emerald-100 text-emerald-900'
                            }`}>
                              {t.semester}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="px-4 py-6 text-center text-slate-400 font-medium">
                          Belum ada data tahun &amp; semester.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
