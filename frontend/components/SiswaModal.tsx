'use client';

import React, { useState, useEffect } from 'react';
import { Siswa, createSiswa, updateSiswa } from '../lib/api';
import { XIcon, UploadIcon, AlertCircleIcon } from './Icons';

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
  const [nisn, setNisn] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [alamat, setAlamat] = useState('');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (siswaToEdit) {
      setNisn(siswaToEdit.nisn || '');
      setNamaLengkap(siswaToEdit.nama_lengkap || '');
      setTempatLahir(siswaToEdit.tempat_lahir || '');
      setTanggalLahir(siswaToEdit.tanggal_lahir || '');
      setAlamat(siswaToEdit.alamat || '');
      setFotoPreview(siswaToEdit.foto_url || siswaToEdit.foto || null);
      setFotoFile(null);
    } else {
      setNisn('');
      setNamaLengkap('');
      setTempatLahir('');
      setTanggalLahir('');
      setAlamat('');
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
      formData.append('tempat_lahir', tempatLahir.trim());
      formData.append('tanggal_lahir', tanggalLahir);
      formData.append('alamat', alamat.trim());

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
      setErrorMessage(err.message || 'Gagal menyimpan data siswa.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {siswaToEdit ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Lengkapi informasi data pokok siswa untuk buku induk.
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 break-all">{errorMessage}</div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="w-full px-3 py-2 text-sm bg-white text-slate-900 font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nama lengkap siswa"
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white text-slate-900 font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400 transition-all shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Tempat Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Kota / Tempat Lahir"
                value={tempatLahir}
                onChange={(e) => setTempatLahir(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white text-slate-900 font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400 transition-all shadow-2xs"
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
                className="w-full px-3 py-2 text-sm bg-white text-slate-900 font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Alamat Lengkap <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="Alamat domisili siswa..."
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white text-slate-900 font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400 transition-all shadow-2xs"
            />
          </div>

          {/* Upload Foto */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Foto Siswa (Opsional)
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
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
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
              {submitting ? 'Menyimpan...' : (siswaToEdit ? 'Perbarui Data' : 'Simpan Siswa')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
