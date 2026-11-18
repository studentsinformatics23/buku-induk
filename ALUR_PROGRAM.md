# Alur Program & Arsitektur Sistem
## Aplikasi Buku Induk Santri Pondok Pesantren Miftahul Huda Al-Faqih

Dokumen ini menjelaskan alur kerja (*workflow*), arsitektur sistem, skema data, dan mekanisme keamanan yang diterapkan pada **Aplikasi Buku Induk Santri Pondok Pesantren Miftahul Huda Al-Faqih** (di bawah naungan **Yayasan Al-Faqih**, Manonjaya, Kabupaten Tasikmalaya, Jawa Barat).

---

## Daftar Isi
1. [Arsitektur Global Monorepo](#1-arsitektur-global-monorepo)
2. [Alur Autentikasi & Kontrol Peran (RBAC)](#2-alur-autentikasi--kontrol-peran-rbac)
3. [Alur Kerja Berdasarkan Hak Akses Pengguna](#3-alur-kerja-berdasarkan-hak-akses-pengguna)
   - [3.1 Alur Kerja Admin / Tata Usaha (TU)](#31-alur-kerja-admin--tata-usaha-tu)
   - [3.2 Alur Kerja Wali Kelas](#32-alur-kerja-wali-kelas)
   - [3.3 Alur Kerja Santri / Siswa (Portal Mandiri)](#33-alur-kerja-santri--siswa-portal-mandiri)
4. [Alur Impor & Ekspor Berkas Excel (.xlsx)](#4-alur-impor--ekspor-berkas-excel-xlsx)
5. [Alur Evaluasi Nilai & Cetak Dokumen PDF Resmi](#5-alur-evaluasi-nilai--cetak-dokumen-pdf-resmi)
6. [Skema Relasi Database (ERD) & Kamus Data](#6-skema-relasi-database-erd--kamus-data)
   - [6.1 Diagram Relasi Antar Entitas (ERD)](#61-diagram-relasi-antar-entitas-erd)
   - [6.2 Rancangan Struktur Tabel Database (Data Dictionary)](#62-rancangan-struktur-tabel-database-data-dictionary)
   - [6.3 Relasi Kunci Asing & Integritas Referensial](#63-relasi-kunci-asing--integritas-referensial)
7. [Mekanisme Keamanan & Validasi Sistem](#7-mekanisme-keamanan--validasi-sistem)

---

## 1. Arsitektur Global Monorepo

Sistem dibangun menggunakan pendekatan monorepo yang memisahkan lapisan penyajian (*frontend*) dan lapisan pengolahan logika bisnis serta basis data (*backend*), yang berkomunikasi secara terenkripsi melalui protokol REST API.

```mermaid
flowchart TD
    subgraph ClientLayer["Lapisan Pengguna (Client)"]
        Browser["Peramban Web (Desktop / Smartphone)"]
    end

    subgraph FrontendLayer["Frontend (Next.js 16 App Router)"]
        UIComponents["Komponen Antarmuka (Tailwind CSS, React 19)"]
        AuthInterceptor["HTTP Interceptor & Token Refresh (apiFetch)"]
        ClientStorage["LocalStorage & Cookies (Token JWT & Session)"]
    end

    subgraph BackendLayer["Backend (Django 4.2 REST Framework)"]
        APIGateway["URL Routing & Middleware"]
        JWTModule["SimpleJWT Authentication & Blacklist"]
        AccountsApp["Modul Akun & UserProfile (accounts)"]
        SiswaApp["Modul Santri, Nilai, Kurikulum & Excel (siswa)"]
        MediaStorage["Media Storage (Foto Santri /foto_siswa/)"]
    end

    subgraph DatabaseLayer["Basis Data (Database)"]
        MySQL[(Basis Data MySQL / MariaDB)]
    end

    Browser <--> UIComponents
    UIComponents <--> AuthInterceptor
    AuthInterceptor <--> ClientStorage
    AuthInterceptor -- "HTTP Requests + Bearer Token" --> APIGateway
    APIGateway --> JWTModule
    JWTModule --> AccountsApp
    JWTModule --> SiswaApp
    SiswaApp --> MediaStorage
    AccountsApp --> MySQL
    SiswaApp --> MySQL
```

---

## 2. Alur Autentikasi & Kontrol Peran (RBAC)

Setiap pengguna yang mengakses sistem harus melalui proses validasi kredensial. Sistem menggunakan token JWT (*Access Token* dengan durasi 60 menit dan *Refresh Token* 7 hari).

```mermaid
sequenceDiagram
    autonumber
    actor Pengguna as Pengguna
    participant Frontend as Frontend (Next.js)
    participant Backend as Backend (Django REST)
    participant Database as Database MySQL

    Pengguna->>Frontend: Membuka Halaman Login (/login)
    Pengguna->>Frontend: Memasukkan Username & Password
    Frontend->>Backend: POST /api/auth/login/ {username, password}
    Backend->>Database: Cek User & Verifikasi Hash PBKDF2-SHA256
    alt Kredensial Salah / Akun Nonaktif
        Backend-->>Frontend: HTTP 401 / 400 (Pesan Kesalahan)
        Frontend-->>Pengguna: Tampilkan notifikasi error
    else Kredensial Valid
        Backend-->>Frontend: HTTP 200 {tokens: {access, refresh}, user: {...}}
        Frontend->>Frontend: Simpan Token di LocalStorage & Cookie
        Frontend->>Frontend: Periksa role: 'admin' | 'wali_kelas' | 'siswa'
        alt Role adalah 'siswa'
            Frontend-->>Pengguna: Arahkan ke Portal Khusus Santri
        else Role adalah 'admin' atau 'wali_kelas'
            Frontend-->>Pengguna: Arahkan ke Dashboard Manajemen Santri
        end
    end
```

### Mekanisme *Auto-Refresh Token*
Jika *Access Token* kedaluwarsa saat pengguna sedang aktif, fungsi `apiFetch` pada frontend secara transparan mengirimkan *Refresh Token* ke endpoint `/api/auth/token/refresh/` untuk mendapatkan *Access Token* baru tanpa mengganggu sesi pengguna.

---

## 3. Alur Kerja Berdasarkan Hak Akses Pengguna

### 3.1 Alur Kerja Admin / Tata Usaha (TU)
Admin memiliki hak kontrol tertinggi atas seluruh siklus operasional data akademik dan kepegawaian.

```mermaid
flowchart TD
    StartAdmin([Admin Login Berhasil]) --> DashboardAdmin[Buka Dashboard Utama Admin]
    
    DashboardAdmin --> PilihanAksi{Pilih Menu Aksi}

    PilihanAksi -->|Kelola Santri| CRUD_Siswa["CRUD Santri (Tambah, Edit, Hapus + Upload Foto)"]
    PilihanAksi -->|Kelola Akun| UserManagement["Modal Kelola User (Buat Akun Admin, Wali Kelas, Santri)"]
    PilihanAksi -->|Data Master| MasterData["Kelola Mata Pelajaran & Tahun/Semester"]
    PilihanAksi -->|Excel| ExcelOps["Impor Massal Excel & Ekspor Rekapitulasi"]
    PilihanAksi -->|Nilai & Rapor| NilaiOps["Input/Update Nilai & Cetak Lembar Buku Induk PDF"]

    CRUD_Siswa --> SimpanDB[(Simpan ke Database)]
    UserManagement --> SimpanDB
    MasterData --> SimpanDB
    ExcelOps --> SimpanDB
    NilaiOps --> SimpanDB
```

**Kemampuan Khusus Admin:**
1. **Kelola Pengguna (`UserManagementModal`)**:
   - Menambah akun untuk Wali Kelas (disertai penugasan kelas yang diampu dari Kelas 7 s/d 12).
   - Menambah akun untuk Santri (menautkan akun langsung ke rekaman santri di basis data).
   - Melakukan reset password instan bagi pengguna yang lupa kata sandi.
   - Mengaktifkan atau menonaktifkan status akun pengguna.
2. **Kelola Data Master (`MasterDataModal`)**:
   - Menambah mata pelajaran baru beserta kodenya.
   - Menambah periode tahun ajaran baru dan semester (Ganjil/Genap).

---

### 3.2 Alur Kerja Wali Kelas
Wali Kelas berfokus pada evaluasi belajar, penginputan nilai, dan penerbitan lembar buku induk santri binaannya.

```mermaid
flowchart TD
    StartWali([Wali Kelas Login Berhasil]) --> DashboardWali[Dashboard Utama]
    DashboardWali --> FilterKelas["Otomatis/Manual Filter Kelas Binaan (Misal: 7A)"]
    FilterKelas --> PilihSantri[Pilih Santri pada Tabel / Kartu]

    PilihSantri --> AksiWali{Pilih Tindakan}
    AksiWali -->|Input Nilai| ModalBukuInduk["Buka BukuIndukModal (Isi Nilai Angka Mapel)"]
    AksiWali -->|Cetak Rapor| ModalCetak["Buka CetakBukuIndukModal (Pratinjau PDF)"]
    AksiWali -->|Ekspor| EksporExcel["Unduh Data Kelas Binaan (.xlsx)"]

    ModalBukuInduk --> ValidasiNilai{Validasi Nilai 0 - 100}
    ValidasiNilai -->|Valid| SimpanNilai[(Simpan NilaiSiswa)]
    ValidasiNilai -->|Tidak Valid| PesanError[Tampilkan Peringatan]

    ModalCetak --> CetakA4[Cetak / Simpan PDF Berstandar A4]
```

---

### 3.3 Alur Kerja Santri / Siswa (Portal Mandiri)
Santri mendapatkan antarmuka mandiri yang terisolasi total, memastikan kerahasiaan dan privasi data santri lain tetap terjaga.

```mermaid
flowchart TD
    StartSiswa([Santri Login Berhasil]) --> CheckLink{Apakah Akun Ditautkan ke Santri?}
    
    CheckLink -->|Belum Ditautkan| WarningUnlinked["Tampilkan Informasi: Hubungi Bagian TU untuk Penautan NISN"]
    
    CheckLink -->|Sudah Ditautkan| PortalSiswa["Buka PortalSiswaView (Biodata & Rapor)"]
    
    PortalSiswa --> ViewBio["Lihat Biodata Pribadi, Kelas & Orang Tua"]
    PortalSiswa --> ViewStats["Pantau Statistik Nilai (Rata-rata, Tertinggi, Predikat)"]
    PortalSiswa --> FilterSem["Filter Hasil Nilai per Semester"]
    PortalSiswa --> CetakMandiri["Klik: Cetak / Simpan PDF Buku Induk Saya"]

    CetakMandiri --> GeneratePDF["Tampilkan Modal Lembar Buku Induk Resmi A4"]
    GeneratePDF --> PrintAction[Unduh / Cetak Dokumen PDF Pribadi]
```

> [!NOTE]
> Pada level backend (`SiswaViewSet` dan `NilaiSiswaViewSet`), jika pengguna memiliki peran `siswa`, query database dibatasi hanya untuk `id == request.user.profile.siswa_id`. Permintaan pengubahan (*POST/PUT/DELETE*) atau ekspor seluruh data akan langsung ditolak dengan kode `HTTP 403 Forbidden`.

---

## 4. Alur Impor & Ekspor Berkas Excel (.xlsx)

Fitur impor massal dirancang tahan terhadap variasi penamaan kolom dan variasi format tanggal Excel.

```mermaid
flowchart TD
    StartImport([Admin Membuka ImportExcelModal]) --> UnduhTemplate["Unduh Template Standar (download-template/)"]
    UnduhTemplate --> IsiData[Admin Mengisi Berkas Excel]
    IsiData --> UnggahBerkas["Unggah Berkas .xlsx ke Sistem"]

    UnggahBerkas --> KirimBackend["POST /api/siswa/import-excel/ (Multipart Form)"]
    KirimBackend --> ValidasiFormat{Ekstensi .xlsx?}
    
    ValidasiFormat -->|Bukan| ErrorEkstensi[Tolak Berkas: Harus .xlsx]
    ValidasiFormat -->|Ya| BacaOpenPyXL[Buka Berkas dengan OpenPyXL]

    BacaOpenPyXL --> PetakanKolom["Pemetaan Kolom Cerdas (find_col)"]
    PetakanKolom --> HindariTabrakan["Cegah Tumpang Tindih 'Tempat Lahir' vs 'Tanggal Lahir'"]

    HindariTabrakan --> LoopingBaris[Iterasi Setiap Baris Data]

    LoopingBaris --> ParseTanggal["Parser Tanggal Multi-Format (ISO, -, /, ., serial)"]
    ParseTanggal --> UpsertData["Siswa.objects.update_or_create(nisn=...)"]
    
    UpsertData --> RekapHasil["Hitung Jumlah Berhasil Ditambah & Diperbarui"]
    RekapHasil --> KirimRespon["Kirim Respon HTTP 200 JSON {created, updated, errors}"]
    KirimRespon --> TampilModal["Tampilkan Kartu Hasil Impor & Rincian Baris Dilewati"]
```

---

## 5. Alur Evaluasi Nilai & Cetak Dokumen PDF Resmi

Pencetakan lembar buku induk santri menggunakan format resmi cetak A4 dengan tata letak kedinasan.

```mermaid
flowchart LR
    PilihSantri[Pilih Santri] --> AmbilDetail["Ambil Data Santri & Nilai (/api/siswa/{id}/)"]
    AmbilDetail --> RenderKop["Render Kop Surat Resmi Yayasan Al-Faqih"]
    RenderKop --> RenderBio["Render Keterangan Diri Santri & Pas Foto 3x4"]
    RenderBio --> RenderNilai["Render Tabel Hasil Belajar & Rata-rata/Predikat"]
    RenderNilai --> RenderTtd["Render Kolom Pengesahan 3 Pihak"]
    RenderTtd --> WindowPrint["Trigger window.print()"]
    WindowPrint --> DokumenPDF[Hasil Lembar PDF / Cetak Fisik A4]
```

### Komponen Kop Surat Resmi:
1. **Logo Tunggal Sebelah Kiri**: Logo resmi Pondok Pesantren Miftahul Huda Al-Faqih (segi enam hijau).
2. **Identitas Yayasan**: `YAYASAN AL-FAQIH`.
3. **Identitas Lembaga**: `PONDOK PESANTREN MIFTAHUL HUDA AL-FAQIH`.
4. **Satuan Pendidikan**: `SEKOLAH MENENGAH ATAS ISLAM TERPADU AL-FAQIH (SMA IT AL-FAQIH)`.
5. **Legitimasi**: `TERAKREDITASI A` &bull; `NPSN: 69983922`.
6. **Alamat**: `Jl. Gunungtanjung Dusun Cisitu Kidul RT. 012 RW. 005 Desa Kalimanggis, Kec. Manonjaya (46197), Kab. Tasikmalaya`.
7. **Kontak**: `Telp. (0851 8776 1692) | Email: smaitalfaqih19@gmail.com`.
8. **Pengesahan Tiga Pihak**:
   - Orang Tua / Wali Santri
   - Wali Kelas
   - Kepala Sekolah / Pimpinan Lembaga (**Aldi Pratama Mustawan, S.Ag**)

---

## 6. Skema Relasi Database (ERD) & Kamus Data

### 6.1 Diagram Relasi Antar Entitas (ERD)

Diagram berikut menggambarkan entitas utama dalam basis data MySQL:

```mermaid
erDiagram
    AUTH_USER ||--o| USER_PROFILE : "memiliki profil (1:1)"
    USER_PROFILE }o--o| SISWA : "ditautkan ke santri (0..1:1)"
    SISWA ||--o{ NILAI_SISWA : "memiliki nilai (1:N)"
    TAHUN_SEMESTER ||--o{ NILAI_SISWA : "terkait periode (1:N)"
    MATA_PELAJARAN ||--o{ NILAI_SISWA : "terkait mapel (1:N)"

    AUTH_USER {
        int id PK
        string username
        string password
        string email
        string first_name
        string last_name
        boolean is_active
        datetime date_joined
    }

    USER_PROFILE {
        int id PK
        int user_id FK
        string role "admin | wali_kelas | siswa"
        string kelas_diampu "Contoh: 7A, 8B"
        int siswa_id FK "Null jika bukan santri"
    }

    SISWA {
        int id PK
        string nisn UK "Nomor Induk Siswa Nasional"
        string nama_lengkap
        string jenis_kelamin "L | P"
        string tempat_lahir
        date tanggal_lahir
        string agama
        string alamat
        string kelas "Pilihan 7 s/d 12"
        string nama_ayah
        string nama_ibu
        string pekerjaan_ortu
        string no_telepon_ortu
        string status_siswa "Aktif | Lulus | Pindah | Keluar"
        string foto "foto_siswa/path.jpg"
    }

    TAHUN_SEMESTER {
        int id PK
        string tahun_ajaran "Contoh: 2026/2027"
        string semester "Ganjil | Genap"
    }

    MATA_PELAJARAN {
        int id PK
        string kode_mapel UK "Contoh: PAI, MTK"
        string nama_mapel
    }

    NILAI_SISWA {
        int id PK
        int siswa_id FK
        int tahun_semester_id FK
        int mata_pelajaran_id FK
        decimal nilai_angka "Skala 0 - 100"
    }
```

---

### 6.2 Rancangan Struktur Tabel Database (Data Dictionary)

Berikut adalah rincian struktur kolom, tipe data, indeks, serta batasan (*constraints*) untuk setiap tabel pada basis data:

#### 1. Tabel `auth_user` (Tabel Inti Autentikasi Pengguna)
Tabel bawaan Django untuk menangani kredensial dan sesi otentikasi login seluruh pengguna.

| Nama Kolom | Tipe Data | Kunci | Nullable | Nilai Default | Keterangan & Aturan Validasi |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `INT AUTO_INCREMENT` | **PK** | Tidak | Auto | Identifikator unik pengguna. |
| `username` | `VARCHAR(150)` | **UK** | Tidak | - | Nama login unik (Admin/Wali Kelas: username teks, Santri: nomor NISN). |
| `password` | `VARCHAR(128)` | - | Tidak | - | Hash kata sandi terenkripsi (PBKDF2 SHA-256). |
| `first_name` | `VARCHAR(150)` | - | Ya | `""` | Nama depan pengguna / sapaan. |
| `last_name` | `VARCHAR(150)` | - | Ya | `""` | Nama belakang pengguna. |
| `email` | `VARCHAR(254)` | - | Ya | `""` | Alamat surel pengguna. |
| `is_staff` | `TINYINT(1)` | - | Tidak | `0` | Penanda izin akses ke Django admin backend (`True`/`False`). |
| `is_active` | `TINYINT(1)` | - | Tidak | `1` | Status akun aktif atau dibekukan. |
| `is_superuser` | `TINYINT(1)` | - | Tidak | `0` | Hak istimewa tertinggi superadmin. |
| `date_joined` | `DATETIME(6)` | - | Tidak | `CURRENT_TIMESTAMP` | Waktu akun dibuat di sistem. |

---

#### 2. Tabel `accounts_userprofile` (Ekstensi Profil & Hak Akses Pengguna)
Menyimpan atribut hak akses (*role-based access control*), penetapan kelas yang diampu bagi wali kelas, serta tautan ke data santri.

| Nama Kolom | Tipe Data | Kunci | Nullable | Nilai Default | Keterangan & Aturan Validasi |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `BIGINT AUTO_INCREMENT` | **PK** | Tidak | Auto | Identifikator unik profil. |
| `user_id` | `INT` | **FK, UK** | Tidak | - | Relasi One-to-One ke `auth_user.id` (`ON DELETE CASCADE`). |
| `role` | `VARCHAR(20)` | - | Tidak | `'wali_kelas'` | Peran pengguna: `'admin'`, `'wali_kelas'`, atau `'siswa'`. |
| `kelas_diampu` | `VARCHAR(100)` | - | Ya | `""` | Tingkat kelas yang diampu wali kelas (misal: `"7A"`, `"8B"`, `"10A"`, dll). |
| `siswa_id` | `BIGINT` | **FK** | Ya | `NULL` | Relasi ke `siswa_siswa.id` (`ON DELETE SET_NULL`). Diisi jika role adalah `'siswa'`. |

---

#### 3. Tabel `siswa_siswa` (Data Pokok Santri / Buku Induk)
Menyimpan informasi identitas santri, asal kelahiran, domisili, wali santri, status pendidikan, dan berkas foto formal santri.

| Nama Kolom | Tipe Data | Kunci | Nullable | Nilai Default | Keterangan & Aturan Validasi |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `BIGINT AUTO_INCREMENT` | **PK** | Tidak | Auto | Identifikator unik record santri. |
| `nisn` | `VARCHAR(20)` | **UK** | Tidak | - | Nomor Induk Siswa Nasional (harus unik untuk tiap santri). |
| `nama_lengkap` | `VARCHAR(100)` | - | Tidak | - | Nama lengkap santri sesuai dokumen akta kelahiran / ijazah. |
| `jenis_kelamin` | `VARCHAR(1)` | - | Tidak | `'L'` | Pilihan jenis kelamin: `'L'` (Laki-laki) atau `'P'` (Perempuan). |
| `tempat_lahir` | `VARCHAR(50)` | - | Tidak | - | Kota atau kabupaten tempat kelahiran santri. |
| `tanggal_lahir` | `DATE` | - | Tidak | - | Tanggal lahir santri (format standar: `YYYY-MM-DD`). |
| `agama` | `VARCHAR(20)` | - | Tidak | `'Islam'` | Agama santri (pilihan: `'Islam'`, `'Kristen'`, `'Katolik'`, `'Hindu'`, `'Buddha'`, `'Konghucu'`). |
| `alamat` | `TEXT` | - | Tidak | - | Alamat tempat tinggal lengkap santri. |
| `kelas` | `VARCHAR(50)` | - | Tidak | `'7A'` | Kelas santri saat ini (Kelas 7, 8, 9 [SMP] hingga Kelas 10, 11, 12 [SMA]). |
| `nama_ayah` | `VARCHAR(100)` | - | Ya | `""` | Nama lengkap ayah kandung / wali laki-laki. |
| `nama_ibu` | `VARCHAR(100)` | - | Ya | `""` | Nama lengkap ibu kandung. |
| `pekerjaan_ortu`| `VARCHAR(100)` | - | Ya | `""` | Pekerjaan utama orang tua / wali santri. |
| `no_telepon_ortu`| `VARCHAR(20)` | - | Ya | `""` | Nomor kontak/telepon/WhatsApp orang tua atau wali. |
| `status_siswa` | `VARCHAR(20)` | - | Tidak | `'Aktif'` | Status pendidikan santri: `'Aktif'`, `'Lulus'`, `'Pindah'`, atau `'Keluar'`. |
| `foto` | `VARCHAR(100)` | - | Ya | `NULL` | Alamat path berkas pas foto santri yang tersimpan di server (`foto_siswa/...`). |

---

#### 4. Tabel `siswa_tahunsemester` (Periode Tahun Ajaran & Semester)
Menyimpan daftar tahun pelajaran dan periode semester untuk pengelompokan riwayat evaluasi nilai santri.

| Nama Kolom | Tipe Data | Kunci | Nullable | Nilai Default | Keterangan & Aturan Validasi |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `BIGINT AUTO_INCREMENT` | **PK** | Tidak | Auto | Identifikator unik periode akademik. |
| `tahun_ajaran` | `VARCHAR(20)` | - | Tidak | - | Format tahun ajaran, contoh: `"2025/2026"`, `"2026/2027"`. |
| `semester` | `VARCHAR(10)` | - | Tidak | - | Pilihan semester: `'Ganjil'` atau `'Genap'`. |

---

#### 5. Tabel `siswa_matapelajaran` (Katalog Mata Pelajaran)
Menyimpan master data mata pelajaran kurikulum pondok pesantren dan sekolah umum/terpadu.

| Nama Kolom | Tipe Data | Kunci | Nullable | Nilai Default | Keterangan & Aturan Validasi |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `BIGINT AUTO_INCREMENT` | **PK** | Tidak | Auto | Identifikator unik mata pelajaran. |
| `kode_mapel` | `VARCHAR(20)` | **UK** | Tidak | - | Kode unik singkatan mata pelajaran (contoh: `"PAI"`, `"MTK"`, `"BIG"`, `"TIK"`). |
| `nama_mapel` | `VARCHAR(100)` | - | Tidak | - | Nama lengkap mata pelajaran (contoh: `"Pendidikan Agama Islam"`, `"Matematika"`). |

---

#### 6. Tabel `siswa_nilaisiswa` (Catatan Evaluasi Nilai Hasil Belajar)
Menyimpan nilai kuantitatif santri per mata pelajaran pada periode tahun ajaran dan semester tertentu.

| Nama Kolom | Tipe Data | Kunci | Nullable | Nilai Default | Keterangan & Aturan Validasi |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `BIGINT AUTO_INCREMENT` | **PK** | Tidak | Auto | Identifikator unik catatan nilai. |
| `siswa_id` | `BIGINT` | **FK** | Tidak | - | Relasi ke `siswa_siswa.id` (`ON DELETE CASCADE`). |
| `tahun_semester_id` | `BIGINT` | **FK** | Tidak | - | Relasi ke `siswa_tahunsemester.id` (`ON DELETE CASCADE`). |
| `mata_pelajaran_id` | `BIGINT` | **FK** | Tidak | - | Relasi ke `siswa_matapelajaran.id` (`ON DELETE CASCADE`). |
| `nilai_angka` | `DECIMAL(5,2)` | - | Tidak | - | Nilai angka santri (skala 0.00 sampai 100.00). |

> [!NOTE]
> **Kombinasi Unik (*Unique Constraint*)**:
> Tabel `siswa_nilaisiswa` memiliki batasan `UNIQUE KEY unique_nilai (siswa_id, tahun_semester_id, mata_pelajaran_id)` untuk memastikan bahwa seorang santri **tidak memiliki nilai ganda** pada mata pelajaran dan periode semester yang sama.

---

### 6.3 Relasi Kunci Asing & Integritas Referensial

1. **`auth_user` &harr; `accounts_userprofile`**:
   - Tipe: *One-to-One (`1:1`)*
   - Kebijakan Hapus: `ON DELETE CASCADE`. Jika akun pengguna dihapus dari `auth_user`, record profil tambahannya akan otomatis terhapus demi menjaga konsistensi basis data.
2. **`accounts_userprofile` &harr; `siswa_siswa`**:
   - Tipe: *Many-to-One / Opsional (`0..1:1`)*
   - Kebijakan Hapus: `ON DELETE SET_NULL`. Jika data santri dihapus, akun login santri tersebut tidak langsung terhapus melainkan kolom `siswa_id` diubah menjadi `NULL` untuk mencegah *orphan error*.
3. **`siswa_siswa` &harr; `siswa_nilaisiswa`**:
   - Tipe: *One-to-Many (`1:N`)*
   - Kebijakan Hapus: `ON DELETE CASCADE`. Jika santri dihapus, seluruh rekam jejak nilai hasil belajar santri terkait akan ikut dibersihkan.
4. **`siswa_tahunsemester` & `siswa_matapelajaran` &harr; `siswa_nilaisiswa`**:
   - Tipe: *One-to-Many (`1:N`)*
   - Kebijakan Hapus: `ON DELETE CASCADE`. Integritas referensial terjaga apabila periode semester atau mata pelajaran disesuaikan.

---

## 7. Mekanisme Keamanan & Validasi Sistem

1. **Enkripsi Sandi (*Password Hashing*)**:
   - Seluruh password dienkripsi secara satu arah (*one-way salted hash*) menggunakan algoritma **PBKDF2 dengan SHA-256** bawaan Django. Tidak ada password yang disimpan dalam bentuk teks biasa (*plain text*).
2. **Isolasi Queryset (*Data Segregation*)**:
   - Santri hanya dapat membaca baris data miliknya sendiri. Penolakan akses dilakukan langsung pada lapisan ORM backend (`get_queryset`), mencegah kebocoran data meskipun endpoint dimanipulasi melalui inspect tool/curl.
3. **Validasi File Unggahan**:
   - File Excel hanya menerima format biner `.xlsx`.
   - File foto santri divalidasi format gambarnya (*JPG/PNG/WEBP*) melalui pustaka Python Pillow sebelum disimpan ke folder media.
4. **Pencegahan Penghapusan Diri Sendiri (*Self-Deletion Safeguard*)**:
   - Admin yang sedang login diblokir secara sistem saat mencoba menghapus akun miliknya sendiri untuk mencegah hilangnya akses administratif ke sistem.

---

Dokumen ini disusun untuk memudahkan pemeliharaan, pengembangan fitur lanjutan, dan audit teknis pada **Aplikasi Buku Induk Santri Pondok Pesantren Miftahul Huda Al-Faqih**.
