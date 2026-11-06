'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { User } from '@/lib/auth';
import {
  Siswa,
  NilaiSiswa,
  TahunSemester,
  getSiswaDetail,
  getTahunSemesterList,
} from '@/lib/api';
import {
  GraduationCapIcon,
  PrinterIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  RefreshCwIcon,
  AlertCircleIcon,
  CheckIcon,
  BookOpenIcon,
  FileTextIcon,
} from './Icons';

interface PortalSiswaViewProps {
  user: User;
  onOpenCetak: (siswaId: number) => void;
}

export default function PortalSiswaView({ user, onOpenCetak }: PortalSiswaViewProps) {
  const [siswa, setSiswa] = useState<Siswa | null>(null);
  const [semesters, setSemesters] = useState<TahunSemester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  const loadStudentData = async () => {
    if (!user.siswa_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [detail, semList] = await Promise.all([
        getSiswaDetail(user.siswa_id),
        getTahunSemesterList().catch(() => []),
      ]);
      setSiswa(detail);
      setSemesters(semList);
    } catch (err: any) {
      console.error('Gagal mengambil data siswa:', err);
      setError(err.message || 'Gagal memuat data santri dari server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [user.siswa_id]);

  // Filtered Nilai
  const filteredNilai = useMemo(() => {
    if (!siswa?.nilai_list) return [];
    if (selectedSemester === 'all') return siswa.nilai_list;
    return siswa.nilai_list.filter(
      (n) => n.tahun_semester.toString() === selectedSemester
    );
  }, [siswa, selectedSemester]);

  // Statistics
  const stats = useMemo(() => {
    if (!filteredNilai.length) {
      return { total: 0, avg: 0, max: 0, min: 0, predikat: '-' };
    }
    const scores = filteredNilai.map((n) => Number(n.nilai_angka) || 0);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = Math.round((sum / scores.length) * 10) / 10;
    const max = Math.max(...scores);
    const min = Math.min(...scores);

    let predikat = 'Cukup';
    if (avg >= 85) predikat = 'Sangat Baik (Mumtaz)';
    else if (avg >= 75) predikat = 'Baik (Jayyid Jiddan)';
    else if (avg >= 65) predikat = 'Cukup (Jayyid)';
    else predikat = 'Perlu Bimbingan (Maqbul)';

    return { total: scores.length, avg, max, min, predikat };
  }, [filteredNilai]);

  const getPredikatBadge = (numVal: number) => {
    if (numVal >= 85) {
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          A (Sangat Baik)
        </span>
      );
    }
    if (numVal >= 75) {
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
          B (Baik)
        </span>
      );
    }
    if (numVal >= 65) {
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          C (Cukup)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
        D (Kurang)
      </span>
    );
  };

  // If student profile is unlinked
  if (!user.siswa_id) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl border border-amber-200 p-6 sm:p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <AlertCircleIcon className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Akun Santri Belum Ditautkan
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto mb-6 leading-relaxed">
            Akun Anda (<strong className="text-slate-900">{user.username}</strong>) belum dihubungkan dengan data Santri pada Buku Induk.
            Silakan hubungi bagian Tata Usaha (TU) atau Admin Pesantren untuk mengaitkan akun Anda dengan NISN Anda.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">
            Username: {user.username} &bull; Peran: Santri / Siswa
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <RefreshCwIcon className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-3" />
        <p className="text-base font-bold text-slate-800">Memuat Buku Induk & Nilai Santri...</p>
        <p className="text-xs text-slate-500 mt-1">Mengambil data dari server Ponpes Miftahul Huda Al-Faqih</p>
      </div>
    );
  }

  if (error || !siswa) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
          <AlertCircleIcon className="w-10 h-10 mx-auto mb-2 text-rose-600" />
          <h3 className="text-lg font-bold">Gagal Memuat Data Santri</h3>
          <p className="text-xs mt-1 text-rose-700">{error || 'Data tidak ditemukan'}</p>
          <button
            onClick={loadStudentData}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-all inline-flex items-center gap-2"
          >
            <RefreshCwIcon className="w-3.5 h-3.5" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome & Identity Card Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 rounded-2xl text-white p-5 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-white/5 rounded-full pointer-events-none blur-xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border-2 border-white/30 backdrop-blur-md overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
              {siswa.foto_url ? (
                <img
                  src={siswa.foto_url}
                  alt={siswa.nama_lengkap}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-9 h-9 text-emerald-200" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  Portal Santri
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30">
                  Kelas {siswa.kelas}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/20 text-green-200 border border-green-400/30">
                  Status: {siswa.status_siswa}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {siswa.nama_lengkap}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200 font-medium mt-0.5">
                NISN: <span className="font-mono font-bold text-white">{siswa.nisn}</span> &bull; Pondok Pesantren Miftahul Huda Al-Faqih
              </p>
            </div>
          </div>

          {/* Cetak Lembar Buku Induk Button */}
          <button
            onClick={() => onOpenCetak(siswa.id)}
            type="button"
            className="w-full md:w-auto px-5 py-3 rounded-xl bg-white text-emerald-900 font-bold text-sm shadow-md hover:bg-emerald-50 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <PrinterIcon className="w-4 h-4 text-emerald-700" />
            Cetak / Simpan PDF Buku Induk Saya
          </button>
        </div>
      </div>

      {/* Grid: Biodata Santri & Nilai Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Ringkasan Biodata */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <BookOpenIcon className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">Biodata Santri</h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 block text-xs">Tempat, Tanggal Lahir</span>
              <span className="font-bold text-slate-900">
                {siswa.tempat_lahir}, {siswa.tanggal_lahir}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block text-xs">Jenis Kelamin</span>
                <span className="font-bold text-slate-900">
                  {siswa.jenis_kelamin_display || (siswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Agama</span>
                <span className="font-bold text-slate-900">{siswa.agama || 'Islam'}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block text-xs">Alamat Tinggal</span>
              <span className="font-semibold text-slate-800 leading-snug">
                {siswa.alamat || '-'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Data Orang Tua / Wali
              </span>
              <div className="space-y-1.5">
                <div>
                  <span className="text-slate-500 text-xs">Nama Ayah / Ibu: </span>
                  <span className="font-bold text-slate-900">
                    {siswa.nama_ayah || '-'} / {siswa.nama_ibu || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Pekerjaan: </span>
                  <span className="font-semibold text-slate-800">
                    {siswa.pekerjaan_ortu || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">No. Telepon: </span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {siswa.no_telepon_ortu || '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Rangkuman Akademik & Statistik Nilai */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Mapel
              </span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                {stats.total}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Rata-rata Nilai
              </span>
              <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
                {stats.avg}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Nilai Tertinggi
              </span>
              <span className="text-2xl font-extrabold text-blue-700 mt-1 block">
                {stats.max}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Nilai Terendah
              </span>
              <span className="text-2xl font-extrabold text-amber-700 mt-1 block">
                {stats.min}
              </span>
            </div>
          </div>

          {/* Tabel / Daftar Nilai Hasil Pembelajaran */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <GraduationCapIcon className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-base">
                  Hasil Nilai Pelajaran Santri
                </h3>
              </div>

              {/* Semester Filter */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600 whitespace-nowrap">
                  Pilih Semester:
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 font-semibold text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">Semua Semester</option>
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id.toString()}>
                      {s.tahun_ajaran} - Semester {s.semester}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredNilai.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-500">
                <FileTextIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">Belum ada nilai yang diinputkan</p>
                <p className="text-xs text-slate-500 mt-1">
                  Nilai akan tampil setelah Wali Kelas atau Pengajar menginput nilai Anda.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop View Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4 w-12 text-center">No</th>
                        <th className="py-3 px-4">Mata Pelajaran</th>
                        <th className="py-3 px-4">Tahun / Semester</th>
                        <th className="py-3 px-4 text-center">Nilai Angka</th>
                        <th className="py-3 px-4 text-center">Predikat</th>
                        <th className="py-3 px-4 text-center">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                      {filteredNilai.map((n, idx) => {
                        const score = Number(n.nilai_angka);
                        return (
                          <tr key={n.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 text-center text-slate-500 font-mono text-xs">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 block">
                                {n.mata_pelajaran_nama}
                              </span>
                              {n.mata_pelajaran_kode && (
                                <span className="text-[11px] font-mono text-slate-500">
                                  Kode: {n.mata_pelajaran_kode}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-700">
                              {n.tahun_semester_display || '-'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-mono text-base font-extrabold text-slate-900">
                                {n.nilai_angka}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">{getPredikatBadge(score)}</td>
                            <td className="py-3 px-4 text-center">
                              {score >= 65 ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                                  <CheckIcon className="w-3.5 h-3.5" />
                                  Tuntas
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700">
                                  <AlertCircleIcon className="w-3.5 h-3.5" />
                                  Perlu Bimbingan
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Card List */}
                <div className="sm:hidden divide-y divide-slate-100">
                  {filteredNilai.map((n, idx) => {
                    const score = Number(n.nilai_angka);
                    return (
                      <div key={n.id} className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">
                              {idx + 1}. {n.mata_pelajaran_nama}
                            </span>
                            <span className="text-xs text-slate-500">
                              {n.tahun_semester_display}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-extrabold text-slate-900 font-mono block">
                              {n.nilai_angka}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div>{getPredikatBadge(score)}</div>
                          <div>
                            {score >= 65 ? (
                              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                <CheckIcon className="w-3.5 h-3.5" />
                                Tuntas
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                                <AlertCircleIcon className="w-3.5 h-3.5" />
                                Belum Tuntas
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

