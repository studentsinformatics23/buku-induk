'use client';

import React, { useState, useEffect } from 'react';
import {
  Siswa,
  NilaiSiswa,
  TahunSemester,
  MataPelajaran,
  getSiswaDetail,
  createNilai,
  deleteNilai,
  getTahunSemesterList,
  getMataPelajaranList,
} from '../lib/api';
import {
  XIcon,
  PlusIcon,
  TrashIcon,
  FileTextIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  AlertCircleIcon,
} from './Icons';

interface BukuIndukModalProps {
  isOpen: boolean;
  onClose: () => void;
  siswaId: number | null;
  onUpdated: () => void;
}

export default function BukuIndukModal({
  isOpen,
  onClose,
  siswaId,
  onUpdated,
}: BukuIndukModalProps) {
  const [siswa, setSiswa] = useState<Siswa | null>(null);
  const [loading, setLoading] = useState(false);
  const [tahunList, setTahunList] = useState<TahunSemester[]>([]);
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);

  // State untuk form tambah nilai inline
  const [showAddNilai, setShowAddNilai] = useState(false);
  const [selectedTahun, setSelectedTahun] = useState<string>('');
  const [selectedMapel, setSelectedMapel] = useState<string>('');
  const [nilaiAngka, setNilaiAngka] = useState<string>('');
  const [savingNilai, setSavingNilai] = useState(false);
  const [errorNilai, setErrorNilai] = useState<string | null>(null);

  const fetchDetail = async (id: number) => {
    setLoading(true);
    try {
      const data = await getSiswaDetail(id);
      setSiswa(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && siswaId) {
      fetchDetail(siswaId);
      getTahunSemesterList().then(setTahunList).catch(console.error);
      getMataPelajaranList().then(setMapelList).catch(console.error);
      setShowAddNilai(false);
      setErrorNilai(null);
    } else {
      setSiswa(null);
    }
  }, [isOpen, siswaId]);

  if (!isOpen) return null;

  const handleSaveNilai = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siswaId || !selectedTahun || !selectedMapel || !nilaiAngka) return;

    setSavingNilai(true);
    setErrorNilai(null);

    try {
      await createNilai({
        siswa: siswaId,
        tahun_semester: Number(selectedTahun),
        mata_pelajaran: Number(selectedMapel),
        nilai_angka: parseFloat(nilaiAngka),
      });

      // Refresh data
      await fetchDetail(siswaId);
      onUpdated();
      setNilaiAngka('');
      setShowAddNilai(false);
    } catch (err: any) {
      setErrorNilai(err.message || 'Gagal menyimpan nilai.');
    } finally {
      setSavingNilai(false);
    }
  };

  const handleDeleteNilai = async (id: number) => {
    if (!confirm('Hapus entri nilai ini?')) return;
    try {
      await deleteNilai(id);
      if (siswaId) {
        await fetchDetail(siswaId);
        onUpdated();
      }
    } catch (err: any) {
      alert('Gagal menghapus nilai: ' + err.message);
    }
  };

  const getPredikat = (angka: number | string) => {
    const val = Number(angka);
    if (val >= 85) return { grade: 'A', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (val >= 75) return { grade: 'B', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (val >= 60) return { grade: 'C', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { grade: 'D', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 my-6">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <FileTextIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Buku Induk Siswa
              </h3>
              <p className="text-xs text-slate-500">
                Profil lengkap & transkrip nilai akademik.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              type="button"
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              Cetak
            </button>
            <button
              onClick={onClose}
              type="button"
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Memuat data buku induk...</p>
            </div>
          ) : siswa ? (
            <>
              {/* Profil Biodata Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                <div className="w-24 h-32 rounded-xl overflow-hidden bg-slate-200 border-2 border-white shadow-md shrink-0 flex items-center justify-center">
                  {siswa.foto_url || siswa.foto ? (
                    <img
                      src={siswa.foto_url || siswa.foto || ''}
                      alt={siswa.nama_lengkap}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-10 h-10 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 w-full text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <h2 className="text-xl font-bold text-slate-900">
                      {siswa.nama_lengkap}
                    </h2>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-800">
                      NISN: {siswa.nisn}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200/60">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        {siswa.tempat_lahir}, {new Date(siswa.tanggal_lahir).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <MapPinIcon className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{siswa.alamat}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rekapitulasi Nilai Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      Transkrip Nilai Akademik
                    </h4>
                    <p className="text-xs text-slate-500">
                      Rekap nilai per mata pelajaran dan semester.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddNilai(!showAddNilai)}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>{showAddNilai ? 'Tutup Form' : 'Input Nilai'}</span>
                  </button>
                </div>

                {/* Form Tambah Nilai */}
                {showAddNilai && (
                  <form
                    onSubmit={handleSaveNilai}
                    className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3 animate-fade-in"
                  >
                    <h5 className="text-xs font-bold text-blue-900">
                      Tambah Nilai untuk {siswa.nama_lengkap}
                    </h5>

                    {errorNilai && (
                      <div className="p-2.5 bg-red-100 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                        <AlertCircleIcon className="w-4 h-4 shrink-0" />
                        <span>{errorNilai}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Tahun & Semester
                        </label>
                        <select
                          required
                          value={selectedTahun}
                          onChange={(e) => setSelectedTahun(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="">-- Pilih Semester --</option>
                          {tahunList.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.tahun_ajaran} ({t.semester})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Mata Pelajaran
                        </label>
                        <select
                          required
                          value={selectedMapel}
                          onChange={(e) => setSelectedMapel(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="">-- Pilih Mata Pelajaran --</option>
                          {mapelList.map((m) => (
                            <option key={m.id} value={m.id}>
                              [{m.kode_mapel}] {m.nama_mapel}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Nilai Angka (0-100)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            required
                            placeholder="Misal: 85.50"
                            value={nilaiAngka}
                            onChange={(e) => setNilaiAngka(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                          <button
                            type="submit"
                            disabled={savingNilai}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shrink-0 cursor-pointer disabled:opacity-50"
                          >
                            {savingNilai ? '...' : 'Simpan'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                {/* Tabel Nilai */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Tahun & Semester</th>
                        <th className="px-4 py-3">Kode</th>
                        <th className="px-4 py-3">Mata Pelajaran</th>
                        <th className="px-4 py-3 text-center">Nilai Angka</th>
                        <th className="px-4 py-3 text-center">Predikat</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {siswa.nilai_list && siswa.nilai_list.length > 0 ? (
                        siswa.nilai_list.map((nilai: NilaiSiswa) => {
                          const pred = getPredikat(nilai.nilai_angka);
                          return (
                            <tr key={nilai.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-medium text-slate-900">
                                {nilai.tahun_semester_display || '-'}
                              </td>
                              <td className="px-4 py-3 font-mono text-slate-500">
                                {nilai.mata_pelajaran_kode || '-'}
                              </td>
                              <td className="px-4 py-3 font-semibold text-slate-800">
                                {nilai.mata_pelajaran_nama}
                              </td>
                              <td className="px-4 py-3 text-center font-bold text-slate-900 font-mono">
                                {nilai.nilai_angka}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${pred.color}`}
                                >
                                  {pred.grade}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => handleDeleteNilai(nilai.id)}
                                  type="button"
                                  className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Hapus Nilai"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                            Belum ada riwayat nilai untuk siswa ini. Klik tombol{' '}
                            <strong>Input Nilai</strong> untuk menambahkan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-500">
              Siswa tidak ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
