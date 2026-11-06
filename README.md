# Aplikasi Buku Induk Santri Pondok Pesantren Miftahul Huda Al-Faqih

Aplikasi Sistem Informasi Buku Induk Santri dan Rekapitulasi Nilai Akademik Pondok Pesantren Miftahul Huda Al-Faqih dengan arsitektur monorepo yang terdiri dari Backend (Django REST Framework) dan Frontend (Next.js 16).

## Fitur Utama

- **Autentikasi & Otorisasi Berbasis Peran (RBAC)**:
  - **Admin / Tata Usaha**: Akses penuh kelola data santri (CRUD), impor & ekspor Excel, data master mata pelajaran & tahun semester.
  - **Wali Kelas / Asatidz**: Akses input & kelola nilai evaluasi belajar santri pada Buku Induk dan cetak/unduh lembar PDF resmi.
- **Enkripsi Password**: Password diamankan menggunakan algoritma PBKDF2 dengan SHA-256 bawaan Django.
- **Buku Induk & Lembar Cetak PDF**: Format resmi berstandar A4 lengkap dengan Kop Surat Pondok Pesantren Miftahul Huda Al-Faqih, logo kaligrafi kufi Al-Faqih, pas foto 3x4 santri, rekap nilai, dan tanda tangan pengesahan.
- **Impor & Ekspor Excel**: Ekspor data santri ke format Excel (.xlsx) dengan filter aktif dan impor massal dari template Excel terstandar.

## Struktur Project

```text
buku_induk/
├── backend/       # Django & Django REST Framework
├── frontend/      # Next.js 16 (App Router, React & Tailwind CSS)
└── README.md
```

## Persyaratan Sistem

- Python 3.10+
- Node.js 18+ & npm
- Database MySQL

## Menjalankan Backend (Django)

1. Masuk ke direktori root dan aktifkan virtual environment:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
2. Pindah ke direktori backend:
   ```bash
   cd backend
   ```
3. Jalankan migrasi database:
   ```bash
   python manage.py migrate
   ```
4. Inisialisasi akun pengguna default (Admin & Wali Kelas):
   ```bash
   python manage.py init_users
   ```
5. Jalankan development server:
   ```bash
   python manage.py runserver
   ```
   Akses di: `http://127.0.0.1:8000/`

## Menjalankan Frontend (Next.js)

1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies (jika belum):
   ```bash
   npm install
   ```
3. Jalankan development server:
   ```bash
   npm run dev
   ```
   Akses di: `http://localhost:3000/` (otomatis diarahkan ke `/login` jika belum masuk).
