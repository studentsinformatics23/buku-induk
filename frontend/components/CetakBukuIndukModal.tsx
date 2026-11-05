'use client';

import React, { useState, useEffect } from 'react';
import { Siswa, getSiswaDetail, NilaiSiswa } from '../lib/api';
import { XIcon, PrinterIcon, UserIcon } from './Icons';

interface CetakBukuIndukModalProps {
  isOpen: boolean;
  onClose: () => void;
  siswaId: number | null;
}

export default function CetakBukuIndukModal({
  isOpen,
  onClose,
  siswaId,
}: CetakBukuIndukModalProps) {
  const [siswa, setSiswa] = useState<Siswa | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && siswaId) {
      setLoading(true);
      getSiswaDetail(siswaId)
        .then(setSiswa)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setSiswa(null);
    }
  }, [isOpen, siswaId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getPredikat = (angka: number | string) => {
    const val = Number(angka);
    if (val >= 85) return 'A (Sangat Baik)';
    if (val >= 75) return 'B (Baik)';
    if (val >= 60) return 'C (Cukup)';
    return 'D (Kurang)';
  };

  // Hitung rata-rata nilai
  const rataRataNilai = siswa?.nilai_list && siswa.nilai_list.length > 0
    ? (
        siswa.nilai_list.reduce((acc, curr) => acc + Number(curr.nilai_angka), 0) /
        siswa.nilai_list.length
      ).toFixed(2)
    : '-';

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Container Dokumen */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 my-4 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none print:m-0 print:w-full">
        {/* Floating Action Bar (Hidden saat Cetak / Print) */}
        <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Pratinjau Cetak / PDF Buku Induk
            </span>
            <span className="text-xs text-slate-400">&bull; Standar A4</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lembar Kertas Resmi (Printable Area) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 text-slate-900 font-sans print:p-0 print:overflow-visible">
          {loading ? (
            <div className="py-20 text-center print:hidden">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Menyiapkan lembar dokumen...</p>
            </div>
          ) : siswa ? (
            <div id="print-area" className="max-w-[760px] mx-auto text-xs leading-relaxed space-y-4 print:text-[11px] print:leading-normal">
              {/* KOP SURAT RESMI */}
              <div className="text-center pb-3 border-b-4 border-double border-slate-900 relative">
                <div className="font-serif uppercase tracking-widest text-[11px] font-bold text-slate-700">
                  KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
                </div>
                <div className="font-serif uppercase tracking-wider text-base sm:text-lg font-black text-slate-950 mt-0.5">
                  DINAS PENDIDIKAN &amp; KEBUDAYAAN PROVINSI
                </div>
                <div className="font-serif uppercase text-sm sm:text-base font-extrabold text-blue-900 mt-0.5">
                  BUKU INDUK PESERTA DIDIK SEKOLAH
                </div>
                <p className="text-[10px] text-slate-600 mt-0.5 font-medium">
                  Jl. Pendidikan Nasional No. 123 &bull; NPSN: 20261105 &bull; Terakreditasi A (Unggul)
                </p>
              </div>

              {/* JUDUL LEMBAR */}
              <div className="text-center pt-2">
                <h2 className="text-sm sm:text-base font-extrabold tracking-wider uppercase underline underline-offset-4 decoration-2">
                  LEMBAR BUKU INDUK PESERTA DIDIK
                </h2>
                <p className="text-[11px] font-mono font-bold text-slate-800 mt-1">
                  NISN : {siswa.nisn} &bull; KELAS : {siswa.kelas || '-'}
                </p>
              </div>

              {/* BAGIAN I & PAS FOTO 3X4 */}
              <div className="pt-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1.5">
                    <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5">
                      I. KETERANGAN TENTANG DIRI PESERTA DIDIK
                    </h3>

                    <table className="w-full text-left">
                      <tbody className="space-y-1">
                        <tr>
                          <td className="w-36 font-semibold text-slate-700">1. Nama Lengkap</td>
                          <td className="w-4">:</td>
                          <td className="font-extrabold text-slate-950 uppercase">{siswa.nama_lengkap}</td>
                        </tr>
                        <tr>
                          <td className="font-semibold text-slate-700">2. Nomor Induk (NISN)</td>
                          <td>:</td>
                          <td className="font-mono font-bold text-slate-900">{siswa.nisn}</td>
                        </tr>
                        <tr>
                          <td className="font-semibold text-slate-700">3. Jenis Kelamin</td>
                          <td>:</td>
                          <td className="font-medium text-slate-900">
                            {siswa.jenis_kelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-semibold text-slate-700">4. Tempat, Tanggal Lahir</td>
                          <td>:</td>
                          <td className="font-medium text-slate-900">
                            {siswa.tempat_lahir},{' '}
                            {new Date(siswa.tanggal_lahir).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-semibold text-slate-700">5. Agama</td>
                          <td>:</td>
                          <td className="font-medium text-slate-900">{siswa.agama || 'Islam'}</td>
                        </tr>
                        <tr>
                          <td className="font-semibold text-slate-700">6. Status Siswa</td>
                          <td>:</td>
                          <td className="font-bold text-slate-900 uppercase">{siswa.status_siswa}</td>
                        </tr>
                        <tr>
                          <td className="font-semibold text-slate-700 align-top">7. Alamat Tinggal</td>
                          <td className="align-top">:</td>
                          <td className="font-medium text-slate-900">{siswa.alamat}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Pas Foto 3x4 */}
                  <div className="w-24 h-32 border-2 border-slate-400 p-0.5 bg-slate-50 flex items-center justify-center shrink-0">
                    {siswa.foto_url || siswa.foto ? (
                      <img
                        src={siswa.foto_url || siswa.foto || ''}
                        alt="Foto 3x4"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-1">
                        <UserIcon className="w-8 h-8 text-slate-300 mx-auto" />
                        <span className="text-[9px] text-slate-400 block mt-1 font-bold">
                          FOTO 3X4
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* BAGIAN II: ORANG TUA / WALI */}
              <div className="pt-2">
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5">
                  II. KETERANGAN TENTANG ORANG TUA / WALI
                </h3>
                <table className="w-full text-left">
                  <tbody>
                    <tr>
                      <td className="w-36 font-semibold text-slate-700">1. Nama Ayah Kandung</td>
                      <td className="w-4">:</td>
                      <td className="font-medium text-slate-900">{siswa.nama_ayah || '-'}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-slate-700">2. Nama Ibu Kandung</td>
                      <td>:</td>
                      <td className="font-medium text-slate-900">{siswa.nama_ibu || '-'}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-slate-700">3. Pekerjaan Orang Tua</td>
                      <td>:</td>
                      <td className="font-medium text-slate-900">{siswa.pekerjaan_ortu || '-'}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-slate-700">4. Nomor Telepon / HP</td>
                      <td>:</td>
                      <td className="font-mono font-medium text-slate-900">{siswa.no_telepon_ortu || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* BAGIAN III: TRANSKRIP NILAI AKADEMIK */}
              <div className="pt-2">
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-2">
                  III. CAPAIAN HASIL BELAJAR (TRANSKRIP NILAI AKADEMIK)
                </h3>

                <table className="w-full border-collapse border border-slate-800 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-800 text-center">
                      <th className="border border-slate-800 py-1.5 px-2 w-8">No</th>
                      <th className="border border-slate-800 py-1.5 px-3">Tahun &amp; Semester</th>
                      <th className="border border-slate-800 py-1.5 px-2 w-16">Kode</th>
                      <th className="border border-slate-800 py-1.5 px-3 text-left">Mata Pelajaran</th>
                      <th className="border border-slate-800 py-1.5 px-2 w-20">Nilai Angka</th>
                      <th className="border border-slate-800 py-1.5 px-2 w-24">Predikat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siswa.nilai_list && siswa.nilai_list.length > 0 ? (
                      siswa.nilai_list.map((nilai: NilaiSiswa, index: number) => (
                        <tr key={nilai.id} className="text-center">
                          <td className="border border-slate-800 py-1 px-1">{index + 1}</td>
                          <td className="border border-slate-800 py-1 px-2 font-medium">
                            {nilai.tahun_semester_display || '-'}
                          </td>
                          <td className="border border-slate-800 py-1 px-1 font-mono">
                            {nilai.mata_pelajaran_kode || '-'}
                          </td>
                          <td className="border border-slate-800 py-1 px-3 text-left font-semibold">
                            {nilai.mata_pelajaran_nama}
                          </td>
                          <td className="border border-slate-800 py-1 px-2 font-mono font-bold">
                            {nilai.nilai_angka}
                          </td>
                          <td className="border border-slate-800 py-1 px-2">
                            {getPredikat(nilai.nilai_angka)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="border border-slate-800 py-4 text-center text-slate-500 italic">
                          Belum ada catatan nilai akademik yang diinput untuk peserta didik ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {siswa.nilai_list && siswa.nilai_list.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-50 font-bold border-t border-slate-800">
                        <td colSpan={4} className="border border-slate-800 py-1.5 px-3 text-right">
                          RATA-RATA NILAI KESELURUHAN :
                        </td>
                        <td className="border border-slate-800 py-1.5 px-2 text-center font-mono font-black text-sm">
                          {rataRataNilai}
                        </td>
                        <td className="border border-slate-800 py-1.5 px-2 text-center">
                          {getPredikat(Number(rataRataNilai))}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* BAGIAN IV: PENGESAHAN DOKUMEN & TANDA TANGAN */}
              <div className="pt-6 break-inside-avoid">
                <div className="text-right mb-6 text-[11px] font-medium text-slate-800">
                  Ditetapkan di: Jakarta<br />
                  Pada tanggal: {todayFormatted}
                </div>

                <div className="grid grid-cols-3 gap-4 text-center text-[11px]">
                  <div>
                    <p className="font-semibold text-slate-700">Orang Tua / Wali,</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline text-slate-900 uppercase">
                      ( {siswa.nama_ayah || siswa.nama_ibu || '........................'} )
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-700">Wali Kelas,</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline text-slate-900">
                      ( .................................... )
                    </p>
                    <p className="text-[10px] text-slate-500">NIP. .................................</p>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-700">Kepala Sekolah,</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline text-slate-900">
                      Drs. H. Hendra Wijaya, M.Pd.
                    </p>
                    <p className="text-[10px] text-slate-500">NIP. 19750812 200212 1 003</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              Data siswa tidak ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

