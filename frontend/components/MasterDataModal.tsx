'use client';

import React, { useState, useEffect } from 'react';
import {
  TahunSemester,
  MataPelajaran,
  getTahunSemesterList,
  getMataPelajaranList,
  createTahunSemester,
  createMataPelajaran,
} from '../lib/api';
import { XIcon, PlusIcon, GraduationCapIcon, CalendarIcon, AlertCircleIcon } from './Icons';

interface MasterDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MasterDataModal({ isOpen, onClose }: MasterDataModalProps) {
  const [activeTab, setActiveTab] = useState<'mapel' | 'tahun'>('mapel');

  // Lists
  const [tahunList, setTahunList] = useState<TahunSemester[]>([]);
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState(false);

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
      const [t, m] = await Promise.all([getTahunSemesterList(), getMataPelajaranList()]);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Kelola Data Master
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Mata Pelajaran & Tahun Ajaran / Semester
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
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6">
          <button
            onClick={() => setActiveTab('mapel')}
            type="button"
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
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
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'tahun'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Tahun & Semester ({tahunList.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'mapel' ? (
            <>
              {/* Form Input Mapel */}
              <form onSubmit={handleCreateMapel} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Tambah Mata Pelajaran</h4>
                {errorMapel && (
                  <div className="p-2 bg-red-100 text-red-700 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircleIcon className="w-4 h-4 shrink-0" />
                    <span>{errorMapel}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Kode (misal: MTK-1)"
                      value={kodeMapel}
                      onChange={(e) => setKodeMapel(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white text-slate-900 font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 shadow-2xs"
                    />
                  </div>
                  <div className="sm:col-span-2 flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Nama Mata Pelajaran (misal: Matematika)"
                      value={namaMapel}
                      onChange={(e) => setNamaMapel(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 shadow-2xs"
                    />
                    <button
                      type="submit"
                      disabled={savingMapel}
                      className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shrink-0 cursor-pointer disabled:opacity-50 shadow-xs"
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
                      <th className="px-4 py-2.5">Kode</th>
                      <th className="px-4 py-2.5">Nama Mata Pelajaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mapelList.length > 0 ? (
                      mapelList.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 font-mono font-bold text-blue-700">{m.kode_mapel}</td>
                          <td className="px-4 py-2.5 text-slate-900 font-semibold">{m.nama_mapel}</td>
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
              <form onSubmit={handleCreateTahun} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Tambah Tahun Ajaran & Semester</h4>
                {errorTahun && (
                  <div className="p-2 bg-red-100 text-red-700 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircleIcon className="w-4 h-4 shrink-0" />
                    <span>{errorTahun}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                      <th className="px-4 py-2.5">Tahun Ajaran</th>
                      <th className="px-4 py-2.5">Semester</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tahunList.length > 0 ? (
                      tahunList.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 font-bold text-slate-900">{t.tahun_ajaran}</td>
                          <td className="px-4 py-2.5 text-slate-700">
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
                          Belum ada data tahun & semester.
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
