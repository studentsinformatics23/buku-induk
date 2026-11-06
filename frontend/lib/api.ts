import {
  getAccessToken,
  getRefreshToken,
  refreshAccessToken,
  clearAuth,
  LoginResponse,
  User,
} from './auth';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export interface Siswa {
  id: number;
  nisn: string;
  nama_lengkap: string;
  jenis_kelamin: 'L' | 'P';
  jenis_kelamin_display?: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  agama: string;
  alamat: string;
  kelas: string;
  nama_ayah?: string;
  nama_ibu?: string;
  pekerjaan_ortu?: string;
  no_telepon_ortu?: string;
  status_siswa: 'Aktif' | 'Lulus' | 'Pindah' | 'Keluar';
  foto: string | null;
  foto_url: string | null;
  nilai_list?: NilaiSiswa[];
}

export interface TahunSemester {
  id: number;
  tahun_ajaran: string;
  semester: 'Ganjil' | 'Genap';
}

export interface MataPelajaran {
  id: number;
  kode_mapel: string;
  nama_mapel: string;
}

export interface NilaiSiswa {
  id: number;
  siswa: number;
  siswa_nama?: string;
  siswa_nisn?: string;
  tahun_semester: number;
  tahun_semester_display?: string;
  mata_pelajaran: number;
  mata_pelajaran_nama?: string;
  mata_pelajaran_kode?: string;
  nilai_angka: string | number;
}

export interface ImportResult {
  status: 'success' | 'error';
  message: string;
  created_count: number;
  updated_count: number;
  total_processed: number;
  errors: string[];
}

// Helper fetch wrapper dengan otomatis Bearer Token dan Token Refresh
async function apiFetch<T>(endpoint: string, options?: RequestInit, retry = true): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  let token = getAccessToken();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Jika token expired (401) dan retry diperbolehkan, coba refresh token
  if (response.status === 401 && retry && getRefreshToken()) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      const retryResponse = await fetch(url, {
        ...options,
        headers,
      });

      if (!retryResponse.ok) {
        let err = 'Terjadi kesalahan pada server';
        try {
          const json = await retryResponse.json();
          err = json.detail || json.error || JSON.stringify(json);
        } catch {
          err = await retryResponse.text();
        }
        throw new Error(err);
      }

      if (retryResponse.status === 204) return null as T;
      return retryResponse.json();
    } else {
      clearAuth();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }

  if (response.status === 401) {
    clearAuth();
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
  }

  if (!response.ok) {
    let errorDetail = 'Terjadi kesalahan pada server';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.error || JSON.stringify(errorJson);
    } catch {
      errorDetail = await response.text();
    }
    throw new Error(errorDetail);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// Helper untuk download file dengan Authorization Header (Export & Template Excel)
export async function downloadWithAuth(url: string, filename: string): Promise<void> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    let errMsg = 'Gagal mengunduh berkas.';
    try {
      const j = await res.json();
      errMsg = j.detail || j.error || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

// ================= AUTH APIs =================
export async function loginApi(credentials: { username: string; password: string }): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Gagal login. Periksa username dan password Anda.');
  }
  return data;
}

export async function logoutApi(): Promise<void> {
  const refresh = getRefreshToken();
  try {
    if (refresh) {
      await apiFetch('/auth/logout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      }, false);
    }
  } catch (err) {
    console.warn('Logout API error ignored:', err);
  } finally {
    clearAuth();
  }
}

export async function getCurrentUserApi(): Promise<User> {
  return apiFetch<User>('/auth/me/');
}

// ================= Siswa API =================
export async function getSiswaList(filters?: {
  search?: string;
  kelas?: string;
  status_siswa?: string;
}): Promise<Siswa[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.kelas) params.append('kelas', filters.kelas);
  if (filters?.status_siswa) params.append('status_siswa', filters.status_siswa);

  const query = params.toString() ? `?${params.toString()}` : '';
  const data = await apiFetch<any>(`/siswa/${query}`);
  return Array.isArray(data) ? data : (data.results || []);
}

export async function getSiswaDetail(id: number): Promise<Siswa> {
  return apiFetch<Siswa>(`/siswa/${id}/`);
}

export async function createSiswa(formData: FormData): Promise<Siswa> {
  return apiFetch<Siswa>('/siswa/', {
    method: 'POST',
    body: formData,
  });
}

export async function updateSiswa(id: number, formData: FormData): Promise<Siswa> {
  return apiFetch<Siswa>(`/siswa/${id}/`, {
    method: 'PATCH',
    body: formData,
  });
}

export async function deleteSiswa(id: number): Promise<void> {
  return apiFetch<void>(`/siswa/${id}/`, {
    method: 'DELETE',
  });
}

// ================= Import & Export Excel API =================
export function getTemplateExcelUrl(): string {
  return `${API_BASE_URL}/siswa/download-template/`;
}

export function getExportExcelUrl(filters?: {
  search?: string;
  kelas?: string;
  status_siswa?: string;
}): string {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.kelas) params.append('kelas', filters.kelas);
  if (filters?.status_siswa) params.append('status_siswa', filters.status_siswa);

  const query = params.toString() ? `?${params.toString()}` : '';
  return `${API_BASE_URL}/siswa/export-excel/${query}`;
}

export async function downloadExportExcel(filters?: {
  search?: string;
  kelas?: string;
  status_siswa?: string;
}): Promise<void> {
  const url = getExportExcelUrl(filters);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  await downloadWithAuth(url, `rekap_buku_induk_santri_al_faqih_${dateStr}.xlsx`);
}

export async function downloadTemplateExcel(): Promise<void> {
  const url = getTemplateExcelUrl();
  await downloadWithAuth(url, 'template_import_santri.xlsx');
}

export async function importSiswaExcel(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch<ImportResult>('/siswa/import-excel/', {
    method: 'POST',
    body: formData,
  });
}

// ================= Master Data APIs =================
export async function getTahunSemesterList(): Promise<TahunSemester[]> {
  const data = await apiFetch<any>('/tahun-semester/');
  return Array.isArray(data) ? data : (data.results || []);
}

export async function createTahunSemester(data: Omit<TahunSemester, 'id'>): Promise<TahunSemester> {
  return apiFetch<TahunSemester>('/tahun-semester/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function getMataPelajaranList(): Promise<MataPelajaran[]> {
  const data = await apiFetch<any>('/mata-pelajaran/');
  return Array.isArray(data) ? data : (data.results || []);
}

export async function createMataPelajaran(data: Omit<MataPelajaran, 'id'>): Promise<MataPelajaran> {
  return apiFetch<MataPelajaran>('/mata-pelajaran/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// ================= Nilai API =================
export async function getNilaiList(filters?: {
  siswa?: number;
  tahun_semester?: number;
  mata_pelajaran?: number;
}): Promise<NilaiSiswa[]> {
  const params = new URLSearchParams();
  if (filters?.siswa) params.append('siswa', filters.siswa.toString());
  if (filters?.tahun_semester) params.append('tahun_semester', filters.tahun_semester.toString());
  if (filters?.mata_pelajaran) params.append('mata_pelajaran', filters.mata_pelajaran.toString());

  const query = params.toString() ? `?${params.toString()}` : '';
  const data = await apiFetch<any>(`/nilai/${query}`);
  return Array.isArray(data) ? data : (data.results || []);
}

export async function createNilai(payload: {
  siswa: number;
  tahun_semester: number;
  mata_pelajaran: number;
  nilai_angka: number | string;
}): Promise<NilaiSiswa> {
  return apiFetch<NilaiSiswa>('/nilai/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function updateNilai(id: number, payload: Partial<NilaiSiswa>): Promise<NilaiSiswa> {
  return apiFetch<NilaiSiswa>(`/nilai/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function deleteNilai(id: number): Promise<void> {
  return apiFetch<void>(`/nilai/${id}/`, {
    method: 'DELETE',
  });
}
