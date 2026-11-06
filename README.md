# Aplikasi Buku Induk Santri Pondok Pesantren Miftahul Huda Al-Faqih

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Framework: Django](https://img.shields.io/badge/Backend-Django%204.2%20REST-092E20?logo=django)](https://www.djangoproject.com/)
[![Framework: Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?logo=next.js)](https://nextjs.org/)

Aplikasi Sistem Informasi **Buku Induk Santri dan Rekapitulasi Nilai Akademik** untuk **Pondok Pesantren Miftahul Huda Al-Faqih** (di bawah naungan **Yayasan Al-Faqih**, Manonjaya, Kabupaten Tasikmalaya, Jawa Barat).

Aplikasi dibangun dengan arsitektur monorepo modern yang menggabungkan backend handal (**Django 4.2 REST Framework**) dan frontend adaptif berkecepatan tinggi (**Next.js 16 App Router, React & Tailwind CSS**).

---

## Daftar Isi

1. [Fitur Utama](#fitur-utama)
2. [Hak Akses Berbasis Peran (RBAC)](#hak-akses-berbasis-peran-rbac)
3. [Akun Bawaan untuk Uji Coba](#akun-bawaan-untuk-uji-coba)
4. [Struktur Proyek](#struktur-proyek)
5. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
6. [Persyaratan Sistem](#persyaratan-sistem)
7. [Panduan Instalasi & Menjalankan Aplikasi](#panduan-instalasi--menjalankan-aplikasi)
   - [1. Konfigurasi Backend (Django)](#1-konfigurasi-backend-django)
   - [2. Konfigurasi Frontend (Next.js)](#2-konfigurasi-frontend-nextjs)
8. [Dokumentasi API Endpoints](#dokumentasi-api-endpoints)
9. [Format Standar Cetak Dokumen & Kop Surat](#format-standar-cetak-dokumen--kop-surat)
10. [Lisensi & Pengembang](#lisensi--pengembang)

---

## Fitur Utama

- **Autentikasi & Keamanan Tingkat Tinggi**:
  - Enkripsi password menggunakan algoritma standar industri **PBKDF2 dengan SHA-256**.
  - Manajemen sesi berbasis **JSON Web Token (JWT)** dengan mekanisme rotasi *access token* dan *refresh token*.
  - Proteksi query di level database agar data santri tidak dapat diakses di luar hak otorisasinya.

- **Manajemen Pengguna & Wali Kelas (Khusus Admin / TU)**:
  - Kelola akun Admin, Wali Kelas, dan Santri (Tambah, Edit, Nonaktifkan, Reset Password, Hapus).
  - Penugasan kelas yang diampu bagi Wali Kelas (*Kelas 7 s/d 12*).
  - Penautan akun santri ke data NISN resmi santri di Buku Induk.
  - Proteksi sistem: Admin yang sedang aktif tidak dapat menghapus akun miliknya sendiri.

- **Portal Mandiri Santri / Siswa**:
  - Tampilan khusus bagi santri untuk memantau profil biodata pribadi dan evaluasi nilai rapor belajar per semester.
  - Ringkasan statistik akademik: Rata-rata nilai, nilai tertinggi, nilai terendah, dan predikat (*Mumtaz, Jayyid Jiddan, Jayyid, Maqbul*).
  - Akses mandiri untuk mengunduh dan mencetak **Lembar Buku Induk Pribadi (PDF)**.
  - Akses terisolasi ketat: santri **tidak dapat** melihat data santri lain, tidak dapat mengubah nilai, dan tidak dapat mengekspor seluruh data santri.

- **Sistem Pilihan Kelas Lengkap (Kelas 7 s/d Kelas 12)**:
  - **Tingkat MTs / SMP**: Kelas 7 (7A, 7B, 7C, 7D), Kelas 8 (8A, 8B, 8C, 8D), Kelas 9 (9A, 9B, 9C, 9D).
  - **Tingkat MA / SMA / SMK**: Kelas 10 (10A, 10B, 10C, 10 IPA, 10 IPS, 10 Keagamaan), Kelas 11 (11A, 11B, 11C, 11 IPA, 11 IPS, 11 Keagamaan), Kelas 12 (12A, 12B, 12C, 12 IPA, 12 IPS, 12 Keagamaan).
  - Opsi penamaan kelas kustom (*Contoh: 7 Tahfidz, 10 Unggulan*).
  - Filter terpadu pada dashboard utama dan formulir santri.

- **Impor & Ekspor Data Excel (.xlsx)**:
  - **Unduh Template**: Format template standar sistem dengan petunjuk pengisian.
  - **Impor Massal Cerdas**: Deteksi otomatis kolom header dan parser tanggal multi-format (ISO, tanda hubung, garis miring, titik, maupun serial Excel).
  - **Ekspor Rekapitulasi**: Ekspor data santri aktif atau terfilter ke format spreadsheet rapi siap cetak.

- **Format Cetak PDF Buku Induk Standar A4**:
  - Menggunakan logo resmi **Pondok Pesantren Miftahul Huda Al-Faqih** beresolusi tinggi.
  - Kop surat resmi **Yayasan Al-Faqih** dan **SMA Islam Terpadu Al-Faqih** (Terakreditasi A, NPSN: 69983922, Alamat Manonjaya, Kabupaten Tasikmalaya).
  - Pas foto santri ukuran 3x4, keterangan lengkap santri & orang tua, rekapitulasi nilai per mapel, serta kolom tanda tangan pengesahan (Orang Tua, Wali Kelas, dan Kepala Sekolah/Pimpinan).

- **Tampilan Responsif & Adaptif (Desktop & Mobile)**:
  - **Desktop (Layar Lebar)**: Tampilan tabel komprehensif, toolbar filter ganda, dan preview dokumen luas.
  - **Mobile (Layar HP)**: Tampilan kartu modern (*card view*), navigasi sentuh ramah jempol, serta kontras warna tinggi untuk keterbacaan optimal di segala kondisi cahaya.

---

## Hak Akses Berbasis Peran (RBAC)

| Hak Akses / Fitur | Admin / TU | Wali Kelas | Santri / Siswa |
| :--- | :---: | :---: | :---: |
| Login dengan JWT & Password Terenkripsi |  |  |  |
| Kelola Data Pokok Santri (CRUD) |  |  *(Hanya Baca)* |  *(Hanya Diri Sendiri)* |
| Kelola Akun Pengguna & Wali Kelas |  |  |  |
| Kelola Data Master (Mapel & Semester) |  |  |  |
| Impor & Ekspor Berkas Excel |  |  *(Hanya Ekspor)* |  |
| Input & Perbarui Nilai Santri |  |  |  |
| Cetak / Unduh PDF Buku Induk |  *(Semua Santri)* |  *(Semua Santri)* |  *(Hanya Milik Sendiri)* |

---

## Akun Bawaan untuk Uji Coba

Gunakan perintah `python manage.py init_users` pada backend untuk menginisialisasi atau mereset akun-akun bawaan berikut:

| Peran (Role) | Username | Password | Deskripsi Akses |
| :--- | :--- | :--- | :--- |
| **Admin / TU** | `admin` | `admin123` | Akses penuh seluruh sistem, kelola pengguna, santri, nilai, data master, dan impor/ekspor. |
| **Wali Kelas** | `walikelas` | `wali123` | Akses input nilai santri, filter per kelas ampu (`7A`), dan cetak lembar buku induk. |
| **Santri / Siswa** | `siswa` | `siswa123` | Portal santri mandiri untuk melihat biodata, transkrip nilai, dan cetak PDF rapor pribadi. |

*(Tersedia pula tombol **Quick Fill** pada halaman login `/login` untuk pengisian instan kredensial di atas saat pengujian).*

---

## Struktur Proyek

```text
buku_induk/
├── backend/                  # Django & Django REST Framework
│   ├── accounts/             # Manajemen akun pengguna, profile, otentikasi JWT
│   │   ├── management/       # Command inisialisasi akun (init_users.py)
│   │   ├── migrations/       # Migrasi database accounts
│   │   ├── models.py         # Model UserProfile (role, kelas_diampu, relasi siswa)
│   │   ├── serializers.py    # Serializer autentikasi & user management
│   │   ├── urls.py           # Endpoint auth & kelola user
│   │   └── views.py          # View login, logout, token refresh, CRUD user
│   ├── backend/              # Konfigurasi project Django (settings, urls, wsgi)
│   ├── media/                # Berkas upload media (foto santri)
│   │   └── foto_siswa/
│   ├── siswa/                # Manajemen santri, nilai, kurikulum, & excel
│   │   ├── migrations/       # Migrasi tabel Siswa, Nilai, Mapel, Semester
│   │   ├── models.py         # Model Siswa, TahunSemester, MataPelajaran, NilaiSiswa
│   │   ├── serializers.py    # Serializer data santri & nilai
│   │   ├── urls.py           # Routing API endpoint siswa
│   │   └── views.py          # ViewSet CRUD, import excel, export excel, download template
│   └── manage.py
│
├── frontend/                 # Next.js 16 (App Router)
│   ├── app/
│   │   ├── layout.tsx        # Root layout HTML & metadata font
│   │   ├── page.tsx          # Dashboard utama (Admin/Wali view & Santri routing)
│   │   ├── login/
│   │   │   └── page.tsx      # Halaman login dengan quick-fill uji coba
│   │   └── globals.css       # Tailwind CSS & konfigurasi styling
│   ├── components/           # Komponen UI modular
│   │   ├── BukuIndukModal.tsx       # Modal kelola evaluasi nilai per santri
│   │   ├── CetakBukuIndukModal.tsx  # Lembar cetak PDF A4 dengan Kop Surat Resmi
│   │   ├── Icons.tsx                # Koleksi icon SVG ringan
│   │   ├── ImportExcelModal.tsx     # Modal unggah & validasi file Excel
│   │   ├── MasterDataModal.tsx      # Modal kelola Mata Pelajaran & Semester
│   │   ├── Navbar.tsx               # Header navigasi adaptif desktop & HP
│   │   ├── PortalSiswaView.tsx      # Dashboard portal mandiri khusus santri
│   │   ├── SiswaModal.tsx           # Formulir Tambah/Edit Data Santri
│   │   └── UserManagementModal.tsx  # Modal kelola akun pengguna untuk Admin
│   ├── lib/
│   │   ├── api.ts            # Client HTTP fetcher dengan interceptor Bearer Token
│   │   ├── auth.ts           # Token storage & helper pengecekan hak akses peran
│   │   └── kelas.ts          # Definisi pilihan kelas standar 7 s/d 12
│   └── public/
│       ├── logo.png          # Logo identitas aplikasi
│       └── logo_kop.png      # Logo resmi pondok pesantren untuk kop surat
│
├── requirements.txt          # Dependensi library Python
└── README.md                 # Dokumentasi proyek
```

---

## Teknologi yang Digunakan

### Backend
- **Python 3.10+**
- **Django 4.2+** (LTS)
- **Django REST Framework (DRF)**
- **djangorestframework-simplejwt** (Otentikasi Token JWT)
- **django-cors-headers** (CORS management)
- **openpyxl** (Pemrosesan berkas Excel .xlsx)
- **Pillow** (Pemrosesan gambar dan pas foto santri)
- **MySQL / MariaDB** via `mysqlclient` / `PyMySQL`

### Frontend
- **Next.js 16 (App Router)**
- **React 19**
- **TypeScript**
- **Tailwind CSS** (Desain adaptif & utility styling)

---

## Persyaratan Sistem

Pastikan perangkat Anda telah terpasang:
- **Python 3.10** atau versi lebih baru
- **Node.js 18.x** atau versi lebih baru dan **npm**
- **MySQL Database Server** (aktif pada port default `3306`)

---

## Panduan Instalasi & Menjalankan Aplikasi

### 1. Konfigurasi Backend (Django)

1. Buka terminal pada direktori root proyek `buku_induk`.
2. Aktifkan virtual environment Python:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     source venv/bin/activate
     ```
3. Pindah ke direktori backend:
   ```bash
   cd backend
   ```
4. Pastikan konfigurasi database pada `backend/backend/settings.py` sesuai dengan kredensial MySQL lokal Anda:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.mysql',
           'NAME': 'buku_induk',
           'USER': 'root',
           'PASSWORD': '',
           'HOST': '127.0.0.1',
           'PORT': '3306',
       }
   }
   ```
5. Terapkan migrasi database:
   ```bash
   python manage.py migrate
   ```
6. Jalankan inisialisasi akun pengguna bawaan:
   ```bash
   python manage.py init_users
   ```
7. Jalankan server backend:
   ```bash
   python manage.py runserver
   ```
   Backend aktif di: `http://127.0.0.1:8000/`

---

### 2. Konfigurasi Frontend (Next.js)

1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd frontend
   ```
2. Pasang dependensi Node.js (jika belum terpasang):
   ```bash
   npm install
   ```
3. Jalankan development server:
   ```bash
   npm run dev
   ```
4. Akses aplikasi melalui browser pada:
   **`http://localhost:3000/`**

Jika pengguna belum login, sistem akan secara otomatis mengarahkan ke halaman login: `http://localhost:3000/login`.

---

## Dokumentasi API Endpoints

Seluruh endpoint API berada di bawah prefiks `/api/`. Autentikasi menggunakan header:
`Authorization: Bearer <access_token>`

### Autentikasi & Akun (`/api/auth/`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login/` | Publik | Login dengan `username` & `password`, menerima JWT tokens |
| `POST` | `/api/auth/logout/` | Terautentikasi | Logout & memasukkan refresh token ke blacklist |
| `POST` | `/api/auth/token/refresh/` | Publik | Memperbarui access token dengan refresh token |
| `GET` | `/api/auth/me/` | Terautentikasi | Mendapatkan data profil akun yang sedang aktif |
| `GET` | `/api/auth/users/` | Admin | Menampilkan daftar seluruh akun pengguna |
| `POST` | `/api/auth/users/` | Admin | Membuat akun baru (Admin, Wali Kelas, atau Siswa) |
| `GET` | `/api/auth/users/<id>/` | Admin | Detail data pengguna berdasarkan ID |
| `PATCH` | `/api/auth/users/<id>/` | Admin | Memperbarui data pengguna, role, kelas, atau reset password |
| `DELETE` | `/api/auth/users/<id>/` | Admin | Menghapus akun pengguna (selain akun sendiri) |

### Manajemen Santri (`/api/siswa/`)
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/siswa/` | Terautentikasi | Daftar santri dengan pencarian, filter kelas, dan filter status |
| `POST` | `/api/siswa/` | Admin | Menambahkan data santri baru (mendukung upload foto) |
| `GET` | `/api/siswa/<id>/` | Terautentikasi | Detail santri lengkap beserta daftar evaluasi nilainya |
| `PATCH` | `/api/siswa/<id>/` | Admin | Memperbarui data santri |
| `DELETE` | `/api/siswa/<id>/` | Admin | Menghapus data santri beserta seluruh riwayat nilainya |
| `GET` | `/api/siswa/<id>/nilai/` | Terautentikasi | Daftar nilai evaluasi belajar milik santri terkait |
| `GET` | `/api/siswa/download-template/` | Admin | Mengunduh berkas template Excel kosong terstandar |
| `POST` | `/api/siswa/import-excel/` | Admin | Mengimpor santri secara massal dari berkas Excel (.xlsx) |
| `GET` | `/api/siswa/export-excel/` | Admin / Wali | Mengekspor data santri ke format berkas Excel (.xlsx) |

### Kurikulum & Nilai
| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET/POST` | `/api/tahun-semester/` | Admin (POST) | Daftar & kelola tahun ajaran dan semester |
| `GET/POST` | `/api/mata-pelajaran/` | Admin (POST) | Daftar & kelola kode dan nama mata pelajaran |
| `GET/POST` | `/api/nilai/` | Wali / Admin | Daftar & input nilai evaluasi belajar santri |
| `PATCH/DEL`| `/api/nilai/<id>/` | Wali / Admin | Perbarui atau hapus catatan nilai santri |

---

## Format Standar Cetak Dokumen & Kop Surat

Pada modul cetak lembar buku induk / rapor santri ([CetakBukuIndukModal.tsx](file:///d:/isep/Isep/Project%20Magang/buku_induk/frontend/components/CetakBukuIndukModal.tsx)), format dokumen mengikuti standar kedinasan:

- **Logo**: Menggunakan logo resmi pondok pesantren (segi enam hijau Al-Faqih) di sisi kiri dan kanan kop surat.
- **Nama Yayasan**: `YAYASAN AL-FAQIH`
- **Nama Lembaga**: `PONDOK PESANTREN MIFTAHUL HUDA AL-FAQIH`
- **Unit Satuan Pendidikan**: `SEKOLAH MENENGAH ATAS ISLAM TERPADU AL-FAQIH (SMA IT AL-FAQIH)`
- **Status Akreditasi & NPSN**: `TERAKREDITASI A` &bull; `NPSN: 69983922`
- **Alamat Kelembagaan**: `Jl. Gunungtanjung Dusun Cisitu Kidul RT. 012 RW. 005 Desa Kalimanggis, Kec. Manonjaya (46197), Kab. Tasikmalaya, Jawa Barat`
- **Kontak Resmi**: `Telp. (0851 8776 1692) | Email: smaitalfaqih19@gmail.com`
- **Pengesahan**:
  - Kolom tanda tangan Orang Tua / Wali Santri.
  - Kolom tanda tangan Wali Kelas / Asatidz.
  - Kolom tanda tangan resmi Kepala Sekolah / Pimpinan: **Aldi Pratama Mustawan, S.Ag**.

---

## Lisensi & Hak Cipta

Aplikasi ini dilisensikan secara resmi di bawah lisensi **[MIT License](LICENSE)**. Anda bebas menggunakan, memodifikasi, dan mengembangkan perangkat lunak ini dengan tetap menyertakan hak cipta dan atribusi asli.

Hak Cipta &copy; 2026 **Pondok Pesantren Miftahul Huda Al-Faqih, Yayasan Al-Faqih & Tim Pengembang (Informatics 23)**. Seluruh hak cipta dilindungi.
