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
import CetakBukuIndukModal from './CetakBukuIndukModal';
import {
  XIcon,
  PlusIcon,
  TrashIcon,
  FileTextIcon,
  UserIcon,
  AlertCircleIcon,
  PrinterIcon,
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

  // State untuk modal cetak PDF
  const [showCetakModal, setShowCetakModal] = useState(false);

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
      setShowCetakModal(false);
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

  const getStatusColor = (status: string) => {
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

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 my-6">
          {/* Header Modal */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                <FileTextIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Buku Induk Santri
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Profil lengkap &amp; evaluasi hasil belajar santri Pondok Pesantren Miftahul Huda Al-Faqih.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCetakModal(true)}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <PrinterIcon className="w-4 h-4 text-slate-600" />
                <span>Cetak / PDF</span>
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
                <p className="text-xs text-slate-500 mt-2 font-medium">Memuat data buku induk santri...</p>
              </div>
            ) : siswa ? (
              <>
                {/* Profil Biodata Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-center sm:items-start shadow-xs">
                  {/* Foto 3x4 */}
                  <div className="w-28 h-36 rounded-xl overflow-hidden bg-slate-200 border-2 border-white shadow-md shrink-0 flex items-center justify-center">
                    {siswa.foto_url || siswa.foto ? (
                      <img
                        src={siswa.foto_url || siswa.foto || ''}
                        alt={siswa.nama_lengkap}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-12 h-12 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 w-full text-center sm:text-left space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h2 className="text-xl font-extrabold text-slate-900">
                          {siswa.nama_lengkap}
                        </h2>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 justify-center sm:justify-start">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-900 border border-blue-200">
                            NISN: {siswa.nisn}
                          </span>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                            Kelas: {siswa.kelas || '-'}
                          </span>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(
                              siswa.status_siswa
                            )}`}
                          >
                            Status: {siswa.status_siswa}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 2-Kolom Informasi Standar Buku Induk */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-200">
                      <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200/80">
                        <p className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-1 text-blue-700">
                          Data Pribadi
                        </p>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Jenis Kelamin:</span>
                          <span className="font-semibold text-slate-800">
                            {siswa.jenis_kelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">TTL:</span>
                          <span className="font-semibold text-slate-800">
                            {siswa.tempat_lahir},{' '}
                            {new Date(siswa.tanggal_lahir).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Agama:</span>
                          <span className="font-semibold text-slate-800">{siswa.agama || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Alamat:</span>
                          <span className="font-semibold text-slate-800 text-right line-clamp-2 max-w-[180px]">
                            {siswa.alamat}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200/80">
                        <p className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-1 text-indigo-700">
                          Data Orang Tua / Wali
                        </p>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Nama Ayah:</span>
                          <span className="font-semibold text-slate-800">{siswa.nama_ayah || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Nama Ibu:</span>
                          <span className="font-semibold text-slate-800">{siswa.nama_ibu || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Pekerjaan:</span>
                          <span className="font-semibold text-slate-800">
                            {siswa.pekerjaan_ortu || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">No. HP / WA:</span>
                          <span className="font-semibold font-mono text-emerald-700">
                            {siswa.no_telepon_ortu || '-'}
                          </span>
                        </div>
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
                      <p className="text-xs text-slate-500 font-medium">
                        Rekap nilai per mata pelajaran dan semester.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddNilai(!showAddNilai)}
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>{showAddNilai ? 'Tutup Form' : 'Input Nilai'}</span>
                    </button>
                  </div>

                  {/* Form Tambah Nilai */}
                  {showAddNilai && (
                    <form
                      onSubmit={handleSaveNilai}
                      className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 animate-fade-in"
                    >
                      <h5 className="text-xs font-bold text-blue-950">
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
                          <label className="block text-[11px] font-bold text-slate-800 mb-1">
                            Tahun &amp; Semester
                          </label>
                          <select
                            required
                            value={selectedTahun}
                            onChange={(e) => setSelectedTahun(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white text-slate-900 font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-2xs"
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
                          <label className="block text-[11px] font-bold text-slate-800 mb-1">
                            Mata Pelajaran
                          </label>
                          <select
                            required
                            value={selectedMapel}
                            onChange={(e) => setSelectedMapel(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white text-slate-900 font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-2xs"
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
                          <label className="block text-[11px] font-bold text-slate-800 mb-1">
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
                              className="w-full px-2.5 py-1.5 text-xs bg-white text-slate-900 font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none placeholder:text-slate-400 shadow-2xs"
                            />
                            <button
                              type="submit"
                              disabled={savingNilai}
                              className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shrink-0 cursor-pointer disabled:opacity-50 shadow-xs"
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
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="px-4 py-3">Tahun &amp; Semester</th>
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
                                <td className="px-4 py-3 font-semibold text-slate-900">
                                  {nilai.tahun_semester_display || '-'}
                                </td>
                                <td className="px-4 py-3 font-mono font-bold text-slate-600">
                                  {nilai.mata_pelajaran_kode || '-'}
                                </td>
                                <td className="px-4 py-3 font-semibold text-slate-900">
                                  {nilai.mata_pelajaran_nama}
                                </td>
                                <td className="px-4 py-3 text-center font-bold text-slate-950 font-mono text-sm">
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
                            <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-medium">
                              Belum ada riwayat nilai untuk siswa ini. Klik tombol{' '}
                              <strong className="text-blue-600">Input Nilai</strong> untuk menambahkan.
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
                Data santri tidak ditemukan.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Cetak Dokumen PDF */}
      <CetakBukuIndukModal
        isOpen={showCetakModal}
        onClose={() => setShowCetakModal(false)}
        siswaId={siswaId}
      />
    </>
  );
}
