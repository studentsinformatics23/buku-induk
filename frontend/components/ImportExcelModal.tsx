'use client';

import React, { useState } from 'react';
import {
  importSiswaExcel,
  getTemplateExcelUrl,
  ImportResult,
} from '../lib/api';
import {
  XIcon,
  UploadIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  CheckIcon,
  AlertCircleIcon,
} from './Icons';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportExcelModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.toLowerCase().endsWith('.xlsx')) {
        setErrorMsg('Hanya file Excel dengan ekstensi .xlsx yang didukung.');
        setFile(null);
        return;
      }
      setFile(selected);
      setErrorMsg(null);
      setResult(null);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Silakan pilih berkas Excel terlebih dahulu.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await importSiswaExcel(file);
      setResult(res);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses file Excel.');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <FileSpreadsheetIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Import Data Siswa Excel
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Unggah banyak data siswa sekaligus dari file .xlsx
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Step 1: Download Template */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">
                Langkah 1: Unduh Format Template
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                Pastikan susunan kolom sesuai format standar sistem.
              </p>
            </div>
            <a
              href={getTemplateExcelUrl()}
              download="template_import_siswa.xlsx"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 rounded-xl transition-all shadow-2xs shrink-0"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>Unduh Template</span>
            </a>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Result Card */}
          {result && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs sm:text-sm">
                <CheckIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{result.message}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Siswa Baru</span>
                  <span className="text-base font-extrabold text-emerald-700">{result.created_count}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Diperbarui</span>
                  <span className="text-base font-extrabold text-blue-700">{result.updated_count}</span>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-emerald-200/60">
                  <p className="text-xs font-bold text-amber-800 mb-1">
                    Catatan ({result.errors.length} baris dilewati):
                  </p>
                  <ul className="text-[11px] text-amber-900 space-y-1 list-disc list-inside max-h-32 overflow-y-auto">
                    {result.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Upload File */}
          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Langkah 2: Pilih File Excel (.xlsx)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  id="excelFileInput"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="excelFileInput"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <UploadIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-700 hover:underline">
                      {file ? file.name : 'Klik untuk memilih file Excel'}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {file
                        ? `${(file.size / 1024).toFixed(1)} KB`
                        : 'Pastikan file berekstensi .xlsx'}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              {file && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Ganti File
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Mengimpor...</span>
                    </>
                  ) : (
                    <>
                      <UploadIcon className="w-4 h-4" />
                      <span>Mulai Import Data</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
