'use client';

import React, { useState, useEffect } from 'react';
import { Siswa, getSiswaDetail } from '../lib/api';
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
    if (val >= 85) return 'A (Sangat Baik / Mumtaz)';
    if (val >= 75) return 'B (Baik / Jayyid Jiddan)';
    if (val >= 60) return 'C (Cukup / Jayyid)';
    return 'D (Kurang / Maqbul)';
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
              Pratinjau Cetak / PDF Buku Induk Santri
            </span>
            <span className="text-xs text-slate-400">&bull; Standar A4 Resmi</span>
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
              <p className="text-xs text-slate-500 mt-2 font-medium">Menyiapkan lembar dokumen santri...</p>
            </div>
          ) : siswa ? (
            <div id="print-area" className="max-w-[760px] mx-auto text-xs leading-relaxed space-y-4 print:text-[11px] print:leading-normal">
              {/* KOP SURAT RESMI PONDOK PESANTREN */}
              <div className="pb-3 border-b-4 border-double border-slate-900 flex items-center justify-between gap-3">
                <div className="w-20 h-20 shrink-0 flex items-center justify-center p-1">
                  <img
                    src="/logo.png"
                    alt="Logo Pondok Pesantren Miftahul Huda Al-Faqih"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 text-center">
                  <div className="font-serif uppercase tracking-widest text-[11px] font-bold text-slate-700">
                    YAYASAN PONDOK PESANTREN MIFTAHUL HUDA
                  </div>
                  <div className="font-serif uppercase tracking-wider text-base sm:text-lg font-black text-slate-950 mt-0.5">
                    PONDOK PESANTREN MIFTAHUL HUDA AL-FAQIH
                  </div>
                  <div className="font-serif uppercase text-xs sm:text-sm font-extrabold text-blue-900 mt-0.5">
                    BUKU INDUK DATA SANTRI &amp; REKAPITULASI HASIL EVALUASI BELAJAR
                  </div>
                  <p className="text-[10px] text-slate-600 mt-0.5 font-medium">
                    Sekretariat &amp; Kantor Pengasuhan Santri &bull; Akta Notaris &amp; Kemenag RI
                  </p>
                </div>
                <div className="w-20 h-20 shrink-0 hidden sm:flex items-center justify-center p-1 opacity-90">
                  <img
                    src="/logo.png"
                    alt="Logo Pondok Pesantren Miftahul Huda Al-Faqih"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* JUDUL LEMBAR */}
              <div className="text-center pt-2">
                <h2 className="text-sm sm:text-base font-extrabold tracking-wider uppercase underline underline-offset-4 decoration-2">
                  LEMBAR BUKU INDUK SANTRI
                </h2>
                <p className="text-[11px] font-mono font-bold text-slate-800 mt-1">
                  NISN / NIS : {siswa.nisn} &bull; KELAS / MARHALAH : {siswa.kelas || '-'}
                </p>
              </div>

              {/* BAGIAN I & PAS FOTO 3X4 */}
              <div className="pt-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1.5">
                    <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5">
                      I. KETERANGAN TENTANG DIRI SANTRI
                    </h3>

                    <table className="w-full text-left">
                      <tbody className="space-y-1">
                        <tr>
                          <td className="w-36 font-semibold text-slate-700">1. Nama Lengkap</td>
                          <td className="w-4">:</td>
                          <td className="font-extrabold text-slate-950 uppercase">{siswa.nama_lengkap}</td>
                        </tr>
                        <tr>
                          <td className="font-semibold text-slate-700">2. NISN / NIS</td>
                          <td>:</td>
                          <td className="font-mono font-bold">{siswa.nisn}</td>
                        </tr>
                        <tr>
                          <td className="font-semibold text-slate-700">3. Jenis Kelamin</td>
                          <td>:</td>
                          <td>{siswa.jenis_kelamin === 'L' ? 'Laki-laki (Santriwan)' : 'Perempuan (Santriwati)'}</td>
                        </tr>
                        <tr>
                          <td className="font-semibold text-slate-700">4. Tempat, Tanggal Lahir</td>
                          <td>:</td>
                          <td>
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
                          <td>{siswa.agama || 'Islam'}</td>
                        </tr>
                        <tr>
                          <td className="font-semibold text-slate-700">6. Kelas / Rombel</td>
                          <td>:</td>
                          <td className="font-bold">{siswa.kelas || '-'}</td>
                        </tr>
                        <tr>
                          <td className="font-semibold text-slate-700">7. Status Santri</td>
                          <td>:</td>
                          <td className="font-semibold">{siswa.status_siswa}</td>
                        </tr>
                        <tr>
                          <td className="font-semibold text-slate-700 align-top">8. Alamat Asal</td>
                          <td className="align-top">:</td>
                          <td className="align-top leading-snug">{siswa.alamat}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Pas Foto 3x4 Santri */}
                  <div className="w-28 shrink-0 flex flex-col items-center">
                    <div className="w-24 h-32 border-2 border-slate-900 rounded bg-slate-50 flex items-center justify-center overflow-hidden">
                      {siswa.foto_url || siswa.foto ? (
                        <img
                          src={siswa.foto_url || siswa.foto || ''}
                          alt={siswa.nama_lengkap}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-2 text-slate-400">
                          <UserIcon className="w-8 h-8 mx-auto" />
                          <span className="text-[9px] block mt-1 font-mono">Pas Foto 3x4</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono mt-1">Cap / Foto Santri</span>
                  </div>
                </div>
              </div>

              {/* BAGIAN II: DATA ORANG TUA / WALI */}
              <div className="pt-2">
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5">
                  II. KETERANGAN ORANG TUA / WALI SANTRI
                </h3>
                <table className="w-full text-left">
                  <tbody>
                    <tr>
                      <td className="w-36 font-semibold text-slate-700">1. Nama Ayah Kandung</td>
                      <td className="w-4">:</td>
                      <td className="font-medium">{siswa.nama_ayah || '-'}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-slate-700">2. Nama Ibu Kandung</td>
                      <td>:</td>
                      <td className="font-medium">{siswa.nama_ibu || '-'}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-slate-700">3. Pekerjaan Orang Tua</td>
                      <td>:</td>
                      <td>{siswa.pekerjaan_ortu || '-'}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-slate-700">4. Nomor HP / Kontak</td>
                      <td>:</td>
                      <td className="font-mono">{siswa.no_telepon_ortu || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* BAGIAN III: REKAPITULASI NILAI */}
              <div className="pt-2">
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5 mb-1.5">
                  III. REKAPITULASI NILAI DAN HASIL BELAJAR SANTRI
                </h3>

                <table className="w-full border-collapse border border-slate-800 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-800 text-center font-bold">
                      <th className="border border-slate-800 py-1.5 px-2 w-10">No</th>
                      <th className="border border-slate-800 py-1.5 px-2 w-24">Kode</th>
                      <th className="border border-slate-800 py-1.5 px-3 text-left">Mata Pelajaran</th>
                      <th className="border border-slate-800 py-1.5 px-2 w-32">Semester</th>
                      <th className="border border-slate-800 py-1.5 px-2 w-20">Nilai</th>
                      <th className="border border-slate-800 py-1.5 px-2 w-36">Predikat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siswa.nilai_list && siswa.nilai_list.length > 0 ? (
                      siswa.nilai_list.map((nilai, index) => (
                        <tr key={nilai.id} className="border-b border-slate-300">
                          <td className="border border-slate-800 py-1 px-2 text-center">{index + 1}</td>
                          <td className="border border-slate-800 py-1 px-2 text-center font-mono font-bold">
                            {nilai.mata_pelajaran_kode || '-'}
                          </td>
                          <td className="border border-slate-800 py-1 px-3 font-medium">
                            {nilai.mata_pelajaran_nama || '-'}
                          </td>
                          <td className="border border-slate-800 py-1 px-2 text-center">
                            {nilai.tahun_semester_display || '-'}
                          </td>
                          <td className="border border-slate-800 py-1 px-2 text-center font-mono font-bold">
                            {nilai.nilai_angka}
                          </td>
                          <td className="border border-slate-800 py-1 px-2 text-center font-semibold">
                            {getPredikat(nilai.nilai_angka)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="border border-slate-800 py-4 text-center text-slate-500 italic">
                          Belum ada data nilai tersimpan untuk santri ini.
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
                  Ditetapkan di: Tasikmalaya<br />
                  Pada tanggal: {todayFormatted}
                </div>

                <div className="grid grid-cols-3 gap-4 text-center text-[11px]">
                  <div>
                    <p className="font-semibold text-slate-700">Orang Tua / Wali Santri,</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline text-slate-900 uppercase">
                      ( {siswa.nama_ayah || siswa.nama_ibu || '........................'} )
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-700">Wali Kelas / Asatidz,</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline text-slate-900">
                      ( .................................... )
                    </p>
                    <p className="text-[10px] text-slate-500">NIY / NIP. ..........................</p>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-700">Pimpinan Pondok Pesantren,</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline text-slate-900">
                      KH. Miftahul Huda Al-Faqih
                    </p>
                    <p className="text-[10px] text-slate-500">Pengasuh Pondok Pesantren</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              Data santri tidak ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
