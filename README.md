# Sistem Buku Induk Siswa

Aplikasi Sistem Informasi Buku Induk Siswa menggunakan arsitektur monorepo sederhana yang terdiri dari Backend (Django REST Framework) dan Frontend (Next.js).

## Struktur Project

```text
buku_induk/
├── backend/       # Django & Django REST Framework
├── frontend/      # Next.js (React & Tailwind CSS)
└── README.md
```

## Persyaratan Sistem

- Python 3.10+
- Node.js 18+ & npm

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
4. Jalankan development server:
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
   Akses di: `http://localhost:3000/`
