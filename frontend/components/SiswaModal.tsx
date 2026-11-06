'use client';

import React, { useState, useEffect } from 'react';
import { Siswa, createSiswa, updateSiswa } from '../lib/api';
import { DAFTAR_PILIHAN_KELAS, ALL_KELAS_VALUES } from '../lib/kelas';
import { XIcon, UploadIcon, AlertCircleIcon, UserIcon } from './Icons';

interface SiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  siswaToEdit: Siswa | null;
}

export default function SiswaModal({
  isOpen,
  onClose,
  onSuccess,
  siswaToEdit,
}: SiswaModalProps) {
  // Data Pokok
  const [nisn, setNisn] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [agama, setAgama] = useState('Islam');
  const [kelas, setKelas] = useState('X RPL 1');
  const [statusSiswa, setStatusSiswa] = useState<'Aktif' | 'Lulus' | 'Pindah' | 'Keluar'>('Aktif');
  const [alamat, setAlamat] = useState('');

  // Data Orang Tua
  const [namaAyah, setNamaAyah] = useState('');
  const [namaIbu, setNamaIbu] = useState('');
  const [pekerjaanOrtu, setPekerjaanOrtu] = useState('');
  const [noTeleponOrtu, setNoTeleponOrtu] = useState('');

  // Foto
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const [isCustomKelas, setIsCustomKelas] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (siswaToEdit) {
      setNisn(siswaToEdit.nisn || '');
      setNamaLengkap(siswaToEdit.nama_lengkap || '');
      setJenisKelamin(siswaToEdit.jenis_kelamin || 'L');
      setTempatLahir(siswaToEdit.tempat_lahir || '');
      setTanggalLahir(siswaToEdit.tanggal_lahir || '');
      setAgama(siswaToEdit.agama || 'Islam');
      const k = siswaToEdit.kelas || '7A';
      setKelas(k);
      setIsCustomKelas(!ALL_KELAS_VALUES.includes(k) && k !== '');
      setStatusSiswa(siswaToEdit.status_siswa || 'Aktif');
      setAlamat(siswaToEdit.alamat || '');
      setNamaAyah(siswaToEdit.nama_ayah || '');
      setNamaIbu(siswaToEdit.nama_ibu || '');
      setPekerjaanOrtu(siswaToEdit.pekerjaan_ortu || '');
      setNoTeleponOrtu(siswaToEdit.no_telepon_ortu || '');
      setFotoPreview(siswaToEdit.foto_url || siswaToEdit.foto || null);
      setFotoFile(null);
    } else {
      setNisn('');
      setNamaLengkap('');
      setJenisKelamin('L');
      setTempatLahir('');
      setTanggalLahir('');
      setAgama('Islam');
      setKelas('7A');
      setIsCustomKelas(false);
      setStatusSiswa('Aktif');
      setAlamat('');
      setNamaAyah('');
      setNamaIbu('');
      setPekerjaanOrtu('');
      setNoTeleponOrtu('');
      setFotoFile(null);
      setFotoPreview(null);
    }
    setErrorMessage(null);
  }, [siswaToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setFotoPreview(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('nisn', nisn.trim());
      formData.append('nama_lengkap', namaLengkap.trim());
      formData.append('jenis_kelamin', jenisKelamin);
      formData.append('tempat_lahir', tempatLahir.trim());
      formData.append('tanggal_lahir', tanggalLahir);
      formData.append('agama', agama);
      formData.append('kelas', kelas.trim());
      formData.append('status_siswa', statusSiswa);
      formData.append('alamat', alamat.trim());
      formData.append('nama_ayah', namaAyah.trim());
      formData.append('nama_ibu', namaIbu.trim());
      formData.append('pekerjaan_ortu', pekerjaanOrtu.trim());
      formData.append('no_telepon_ortu', noTeleponOrtu.trim());

      if (fotoFile) {
        formData.append('foto', fotoFile);
      }

      if (siswaToEdit) {
        await updateSiswa(siswaToEdit.id, formData);
      } else {
        await createSiswa(formData);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan data santri.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {siswaToEdit ? 'Edit Data Santri' : 'Tambah Santri Baru'}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Data pokok santri Pondok Pesantren Miftahul Huda Al-Faqih.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 break-all">{errorMessage}</div>
            </div>
          )}

          {/* Section 1: Data Pokok Santri */}
          <div>
            <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2.5 pb-1 border-b border-blue-100 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4" />
              <span>Data Pokok Santri</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  NISN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: 0081234567"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400 transition-all shadow-2xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Nama Lengkap Siswa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap sesuai akta / ijazah"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <select
                  value={jenisKelamin}
                  onChange={(e) => setJenisKelamin(e.target.value as 'L' | 'P')}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Kelas / Rombel <span className="text-red-500">*</span>
                </label>
                <select
                  value={isCustomKelas ? 'CUSTOM' : kelas}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'CUSTOM') {
                      setIsCustomKelas(true);
                      if (ALL_KELAS_VALUES.includes(kelas)) {
                        setKelas('');
                      }
                    } else {
                      setIsCustomKelas(false);
                      setKelas(val);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                >
                  <option value="">-- Pilih Kelas (7 s/d 12) --</option>
                  {DAFTAR_PILIHAN_KELAS.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  {/* Tampilkan opsi saat ini jika bukan kelas standar */}
                  {!ALL_KELAS_VALUES.includes(kelas) && kelas && !isCustomKelas && (
                    <option value={kelas}>{kelas} (Saat ini)</option>
                  )}
                  <option value="CUSTOM">+ Ketik Kelas Lainnya (Custom)...</option>
                </select>

                {isCustomKelas && (
                  <input
                    type="text"
                    required
                    placeholder="Ketik nama kelas (misal: 7 Tahfidz)"
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="mt-2 w-full px-3 py-1.5 text-xs sm:text-sm bg-white text-slate-900 font-semibold border border-blue-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs animate-in fade-in"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Agama <span className="text-red-500">*</span>
                </label>
                <select
                  value={agama}
                  onChange={(e) => setAgama(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                >
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Konghucu">Konghucu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Status Siswa <span className="text-red-500">*</span>
                </label>
                <select
                  value={statusSiswa}
                  onChange={(e) => setStatusSiswa(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Lulus">Lulus</option>
                  <option value="Pindah">Pindah / Mutasi</option>
                  <option value="Keluar">Keluar</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Tempat Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Kota tempat lahir"
                  value={tempatLahir}
                  onChange={(e) => setTempatLahir(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={tanggalLahir}
                  onChange={(e) => setTanggalLahir(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Alamat Lengkap <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Alamat tempat tinggal siswa..."
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Section 2: Data Orang Tua / Wali */}
          <div className="pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-3 pb-1 border-b border-indigo-100">
              Data Orang Tua / Wali Siswa
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Nama Ayah Kandung
                </label>
                <input
                  type="text"
                  placeholder="Nama ayah"
                  value={namaAyah}
                  onChange={(e) => setNamaAyah(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Nama Ibu Kandung
                </label>
                <input
                  type="text"
                  placeholder="Nama ibu"
                  value={namaIbu}
                  onChange={(e) => setNamaIbu(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Pekerjaan Orang Tua / Wali
                </label>
                <input
                  type="text"
                  placeholder="Misal: Wiraswasta / PNS / Karyawan"
                  value={pekerjaanOrtu}
                  onChange={(e) => setPekerjaanOrtu(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  No. Telepon / WhatsApp Orang Tua
                </label>
                <input
                  type="text"
                  placeholder="081234567890"
                  value={noTeleponOrtu}
                  onChange={(e) => setNoTeleponOrtu(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-slate-400 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Upload Foto */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Pas Foto Siswa (3x4)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    alt="Preview Foto"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] text-slate-400 text-center font-medium px-1">
                    3x4 Foto
                  </span>
                )}
              </div>
              <div className="flex-1">
                <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer">
                  <UploadIcon className="w-4 h-4 text-slate-600" />
                  <span>Pilih Berkas Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-500 mt-1">
                  Format: JPG, PNG, atau JPEG (Maks. 2MB).
                </p>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 pb-1 border-t border-slate-200 flex items-center justify-end gap-2.5 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : (siswaToEdit ? 'Perbarui Data' : 'Simpan Santri')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
