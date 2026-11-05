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

// Helper fetch wrapper
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let errorDetail = 'Terjadi kesalahan pada server';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.error || JSON.stringify(errorJson);
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

// Siswa API
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

// Import & Template Excel API
export function getTemplateExcelUrl(): string {
  return `${API_BASE_URL}/siswa/download-template/`;
}

export async function importSiswaExcel(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch<ImportResult>('/siswa/import-excel/', {
    method: 'POST',
    body: formData,
  });
}

// Master Data APIs
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

// Nilai API
export async function getNilaiList(filters?: { siswa?: number; tahun_semester?: number; mata_pelajaran?: number }): Promise<NilaiSiswa[]> {
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
