from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from rest_framework.exceptions import PermissionDenied
from django.http import HttpResponse
from datetime import datetime, date
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

from .models import Siswa, TahunSemester, MataPelajaran, NilaiSiswa
from .serializers import (
    SiswaSerializer,
    SiswaDetailSerializer,
    TahunSemesterSerializer,
    MataPelajaranSerializer,
    NilaiSiswaSerializer,
)


def get_user_role(request):
    """Mendapatkan role user dari profile. Default ke 'wali_kelas' jika tidak ada profile."""
    if request.user.is_superuser:
        return 'admin'
    try:
        return request.user.profile.role
    except Exception:
        return 'wali_kelas'


def is_admin(request):
    """Cek apakah user adalah admin atau superuser."""
    return get_user_role(request) == 'admin'


class SiswaViewSet(viewsets.ModelViewSet):
    """
    API endpoint untuk mengelola data Siswa (CRUD).
    - Admin / TU: akses penuh (CRUD, import, export, template)
    - Wali Kelas: hanya baca (GET), bisa akses nilai dan cetak PDF
    Mendukung:
    - Pencarian (?search=...)
    - Filter Kelas (?kelas=...)
    - Filter Status (?status_siswa=...)
    - Pengurutan (?ordering=...)
    - Detail nilai per siswa (/api/siswa/{id}/nilai/)
    - Download template Excel (/api/siswa/download-template/)
    - Export data Excel (/api/siswa/export-excel/)
    - Import data Excel (/api/siswa/import-excel/)
    """
    queryset = Siswa.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nisn', 'nama_lengkap', 'alamat', 'tempat_lahir', 'kelas', 'status_siswa']
    ordering_fields = ['nisn', 'nama_lengkap', 'tanggal_lahir', 'kelas', 'status_siswa', 'id']
    ordering = ['nama_lengkap']

    def check_admin_permission(self):
        """Raise PermissionDenied jika bukan admin."""
        if not is_admin(self.request):
            raise PermissionDenied("Hanya Admin / Tata Usaha yang dapat melakukan aksi ini.")

    def get_queryset(self):
        queryset = super().get_queryset()
        role = get_user_role(self.request)

        # Jika role adalah siswa, batasi hanya melihat datanya sendiri
        if role == 'siswa':
            siswa_id = getattr(self.request.user.profile, 'siswa_id', None)
            if siswa_id:
                return queryset.filter(id=siswa_id)
            return queryset.none()

        kelas = self.request.query_params.get('kelas')
        status_siswa = self.request.query_params.get('status_siswa')

        if kelas:
            queryset = queryset.filter(kelas__iexact=kelas)
        if status_siswa:
            queryset = queryset.filter(status_siswa__iexact=status_siswa)

        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SiswaDetailSerializer
        return SiswaSerializer

    def create(self, request, *args, **kwargs):
        self.check_admin_permission()
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        self.check_admin_permission()
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        self.check_admin_permission()
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def nilai(self, request, pk=None):
        """Mendapatkan seluruh daftar nilai untuk satu siswa tertentu."""
        siswa = self.get_object()
        role = get_user_role(request)
        if role == 'siswa':
            my_siswa_id = getattr(request.user.profile, 'siswa_id', None)
            if not my_siswa_id or my_siswa_id != siswa.id:
                raise PermissionDenied("Anda hanya diizinkan melihat nilai Anda sendiri.")
        nilai = siswa.nilai_list.select_related('tahun_semester', 'mata_pelajaran').all()
        serializer = NilaiSiswaSerializer(nilai, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='download-template')
    def download_template(self, request):
        """Menghasilkan file template Excel (.xlsx) untuk import data siswa sesuai standar."""
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Data Santri"

        headers = [
            "NISN",
            "Nama Lengkap",
            "Jenis Kelamin (L/P)",
            "Tempat Lahir",
            "Tanggal Lahir (YYYY-MM-DD)",
            "Agama",
            "Kelas",
            "Alamat",
            "Nama Ayah",
            "Nama Ibu",
            "Pekerjaan Ortu",
            "No HP Ortu",
            "Status (Aktif/Lulus/Pindah/Keluar)",
        ]
        ws.append(headers)

        header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="1E40AF", end_color="1E40AF", fill_type="solid")
        center_align = Alignment(horizontal="center", vertical="center")

        for col_num in range(1, len(headers) + 1):
            cell = ws.cell(row=1, column=col_num)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = center_align

        sample_rows = [
            [
                "0081234567",
                "Muhammad Dani",
                "L",
                "Bandung",
                "2008-04-12",
                "Islam",
                "X RPL 1",
                "Jl. Asia Afrika No. 45",
                "Ahmad Subarjo",
                "Siti Aminah",
                "Wiraswasta",
                "081234567890",
                "Aktif",
            ],
            [
                "0089876543",
                "Siti Nurhaliza",
                "P",
                "Jakarta",
                "2008-09-25",
                "Islam",
                "X RPL 1",
                "Jl. Sudirman No. 12B",
                "Bambang Irawan",
                "Nur Fatimah",
                "PNS",
                "081987654321",
                "Aktif",
            ],
        ]
        for row in sample_rows:
            ws.append(row)

        widths = [18, 25, 20, 20, 26, 16, 16, 32, 22, 22, 20, 18, 24]
        for idx, width in enumerate(widths, 1):
            col_letter = openpyxl.utils.get_column_letter(idx)
            ws.column_dimensions[col_letter].width = width

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response['Content-Disposition'] = 'attachment; filename="template_import_santri.xlsx"'
        wb.save(response)
        return response

    @action(detail=False, methods=['get'], url_path='export-excel')
    def export_excel(self, request):
        """Mengekspor data siswa terfilter ke berkas Excel (.xlsx) dengan format rapi."""
        role = get_user_role(request)
        if role == 'siswa':
            raise PermissionDenied("Siswa tidak memiliki izin mengekspor rekapitulasi santri.")
        queryset = self.filter_queryset(self.get_queryset())

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Rekap Santri Al-Faqih"

        headers = [
            "No",
            "NISN",
            "Nama Lengkap",
            "L/P",
            "Kelas",
            "Tempat Lahir",
            "Tanggal Lahir",
            "Agama",
            "Status",
            "Alamat",
            "Nama Ayah",
            "Nama Ibu",
            "Pekerjaan Ortu",
            "No. HP Ortu",
        ]
        ws.append(headers)

        header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="1E40AF", end_color="1E40AF", fill_type="solid")
        center_align = Alignment(horizontal="center", vertical="center")
        left_align = Alignment(horizontal="left", vertical="center")

        thin_side = Side(border_style="thin", color="CBD5E1")
        cell_border = Border(top=thin_side, left=thin_side, right=thin_side, bottom=thin_side)

        for col_num in range(1, len(headers) + 1):
            cell = ws.cell(row=1, column=col_num)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = center_align

        for i, s in enumerate(queryset, start=1):
            row_data = [
                i,
                s.nisn,
                s.nama_lengkap,
                s.jenis_kelamin,
                s.kelas,
                s.tempat_lahir,
                s.tanggal_lahir.strftime('%Y-%m-%d') if s.tanggal_lahir else '',
                s.agama,
                s.status_siswa,
                s.alamat,
                s.nama_ayah or '',
                s.nama_ibu or '',
                s.pekerjaan_ortu or '',
                s.no_telepon_ortu or '',
            ]
            ws.append(row_data)

            row_idx = i + 1
            is_even = (i % 2 == 0)
            row_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid") if is_even else None

            for col_idx in range(1, len(headers) + 1):
                cell = ws.cell(row=row_idx, column=col_idx)
                cell.border = cell_border
                if row_fill:
                    cell.fill = row_fill
                if col_idx in [1, 2, 4, 5, 7, 8, 9, 14]:
                    cell.alignment = center_align
                else:
                    cell.alignment = left_align

        widths = [6, 16, 26, 8, 14, 18, 16, 14, 12, 32, 22, 22, 20, 18]
        for idx, width in enumerate(widths, 1):
            col_letter = openpyxl.utils.get_column_letter(idx)
            ws.column_dimensions[col_letter].width = width

        timestamp = datetime.now().strftime('%Y%m%d_%H%M')
        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response['Content-Disposition'] = f'attachment; filename="rekap_buku_induk_santri_miftahul_huda_al_faqih_{timestamp}.xlsx"'
        wb.save(response)
        return response

    @action(detail=False, methods=['post'], url_path='import-excel')
    def import_excel(self, request):
        """
        Mengimpor data siswa dari file Excel (.xlsx). Hanya admin yang diizinkan.
        """
        self.check_admin_permission()
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response(
                {"error": "File Excel (.xlsx) harus diunggah."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not file_obj.name.lower().endswith('.xlsx'):
            return Response(
                {"error": "Format berkas harus berekstensi .xlsx"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            wb = openpyxl.load_workbook(file_obj, data_only=True)
            ws = wb.active
        except Exception as e:
            return Response(
                {"error": f"Gagal membaca file Excel: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        rows = list(ws.iter_rows(values_only=True))
        if len(rows) <= 1:
            return Response(
                {"error": "File Excel kosong atau hanya berisi baris header."},
                status=status.HTTP_400_BAD_REQUEST
            )

        header = [str(h).strip().lower() if h else '' for h in rows[0]]

        def find_col(keywords, default_idx):
            for i, h in enumerate(header):
                if any(k in h for k in keywords):
                    return i
            return default_idx

        nisn_idx = find_col(['nisn'], 0)
        nama_idx = find_col(['nama lengkap', 'nama santri', 'nama siswa', 'nama_lengkap', 'nama'], 1)
        jk_idx = find_col(['jenis kelamin', 'kelamin', 'gender', 'l/p', 'jk'], 2)
        tempat_idx = find_col(['tempat lahir', 'tempat_lahir', 'tempat'], 3)
        # PENTING: Jangan gunakan keyword 'lahir' saja agar tidak mencocokkan 'tempat lahir' (kolom 3)
        tgl_idx = find_col(['tanggal lahir', 'tanggal_lahir', 'tgl lahir', 'tgl_lahir', 'tanggal', 'tgl'], 4)
        agama_idx = find_col(['agama'], 5)
        kelas_idx = find_col(['kelas', 'rombel'], 6)
        alamat_idx = find_col(['alamat', 'domisili'], 7)
        ayah_idx = find_col(['nama ayah', 'ayah', 'bapak'], 8)
        ibu_idx = find_col(['nama ibu', 'ibu'], 9)
        pekerjaan_idx = find_col(['pekerjaan ortu', 'pekerjaan_ortu', 'pekerjaan'], 10)
        hp_idx = find_col(['no hp', 'no telp', 'no. hp', 'no_hp', 'telepon', 'telp', 'hp', 'wa'], 11)
        status_idx = find_col(['status siswa', 'status_siswa', 'status'], 12)

        # Safeguard: pastikan tempat_idx dan tgl_idx tidak menunjuk ke kolom yang sama
        if tempat_idx == tgl_idx:
            tempat_idx = 3
            tgl_idx = 4

        created_count = 0
        updated_count = 0
        errors = []

        for row_num, row in enumerate(rows[1:], start=2):
            if not any(row):
                continue

            def get_val(idx):
                return row[idx] if len(row) > idx else None

            raw_nisn = get_val(nisn_idx)
            raw_nama = get_val(nama_idx)
            raw_jk = get_val(jk_idx)
            raw_tempat = get_val(tempat_idx)
            raw_tgl = get_val(tgl_idx)
            raw_agama = get_val(agama_idx)
            raw_kelas = get_val(kelas_idx)
            raw_alamat = get_val(alamat_idx)
            raw_ayah = get_val(ayah_idx)
            raw_ibu = get_val(ibu_idx)
            raw_pekerjaan = get_val(pekerjaan_idx)
            raw_hp = get_val(hp_idx)
            raw_status = get_val(status_idx)

            if not raw_nisn:
                errors.append(f"Baris {row_num}: NISN tidak boleh kosong.")
                continue

            nisn = str(raw_nisn).strip()
            if nisn.endswith('.0'):
                nisn = nisn[:-2]

            if not raw_nama:
                errors.append(f"Baris {row_num} (NISN: {nisn}): Nama Lengkap tidak boleh kosong.")
                continue
            nama = str(raw_nama).strip()

            jk_str = str(raw_jk).strip().upper() if raw_jk else 'L'
            jenis_kelamin = 'P' if jk_str.startswith('P') else 'L'

            tempat = str(raw_tempat).strip() if raw_tempat else '-'
            agama = str(raw_agama).strip() if raw_agama else 'Islam'
            kelas = str(raw_kelas).strip() if raw_kelas else '-'
            alamat = str(raw_alamat).strip() if raw_alamat else '-'
            nama_ayah = str(raw_ayah).strip() if raw_ayah else ''
            nama_ibu = str(raw_ibu).strip() if raw_ibu else ''
            pekerjaan = str(raw_pekerjaan).strip() if raw_pekerjaan else ''
            no_hp = str(raw_hp).strip() if raw_hp else ''
            if no_hp.endswith('.0'):
                no_hp = no_hp[:-2]

            status_siswa = str(raw_status).strip().capitalize() if raw_status else 'Aktif'
            if status_siswa not in ['Aktif', 'Lulus', 'Pindah', 'Keluar']:
                status_siswa = 'Aktif'

            parsed_date = None
            if isinstance(raw_tgl, (datetime, date)):
                parsed_date = raw_tgl.strftime('%Y-%m-%d')
            elif raw_tgl:
                date_str = str(raw_tgl).strip()
                # Cek jika diawali format YYYY-MM-DD (misal: '2008-04-12 00:00:00')
                if len(date_str) >= 10 and date_str[4] == '-' and date_str[7] == '-':
                    try:
                        dt = datetime.strptime(date_str[:10], '%Y-%m-%d')
                        parsed_date = dt.strftime('%Y-%m-%d')
                    except ValueError:
                        pass

                if not parsed_date:
                    for fmt in (
                        '%Y-%m-%d',
                        '%d-%m-%Y',
                        '%d/%m/%Y',
                        '%Y/%m/%d',
                        '%d.%m.%Y',
                        '%Y.%m.%d',
                        '%d %B %Y',
                        '%d %b %Y',
                    ):
                        try:
                            dt = datetime.strptime(date_str, fmt)
                            parsed_date = dt.strftime('%Y-%m-%d')
                            break
                        except ValueError:
                            pass

                if not parsed_date:
                    errors.append(
                        f"Baris {row_num} (NISN: {nisn}): Format tanggal lahir '{raw_tgl}' tidak valid. Gunakan format YYYY-MM-DD."
                    )
                    continue
            else:
                errors.append(f"Baris {row_num} (NISN: {nisn}): Tanggal lahir tidak boleh kosong.")
                continue

            _, created = Siswa.objects.update_or_create(
                nisn=nisn,
                defaults={
                    'nama_lengkap': nama,
                    'jenis_kelamin': jenis_kelamin,
                    'tempat_lahir': tempat,
                    'tanggal_lahir': parsed_date,
                    'agama': agama,
                    'kelas': kelas,
                    'alamat': alamat,
                    'nama_ayah': nama_ayah,
                    'nama_ibu': nama_ibu,
                    'pekerjaan_ortu': pekerjaan,
                    'no_telepon_ortu': no_hp,
                    'status_siswa': status_siswa,
                }
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

        total_processed = created_count + updated_count

        return Response({
            "status": "success" if total_processed > 0 else "error",
            "message": (
                f"Import selesai: {created_count} santri baru ditambahkan, {updated_count} santri diperbarui."
                if total_processed > 0
                else "Tidak ada santri yang berhasil diimpor. Silakan periksa catatan kesalahan di bawah."
            ),
            "created_count": created_count,
            "updated_count": updated_count,
            "total_processed": total_processed,
            "errors": errors,
        }, status=status.HTTP_200_OK)


class TahunSemesterViewSet(viewsets.ModelViewSet):
    """API endpoint untuk Tahun Ajaran dan Semester (CRUD). Hanya admin yang bisa edit."""
    queryset = TahunSemester.objects.all()
    serializer_class = TahunSemesterSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['tahun_ajaran', 'semester']
    ordering_fields = ['tahun_ajaran', 'semester']

    def create(self, request, *args, **kwargs):
        if not is_admin(request):
            raise PermissionDenied("Hanya admin yang dapat menambah data ini.")
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not is_admin(request):
            raise PermissionDenied("Hanya admin yang dapat mengubah data ini.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not is_admin(request):
            raise PermissionDenied("Hanya admin yang dapat menghapus data ini.")
        return super().destroy(request, *args, **kwargs)


class MataPelajaranViewSet(viewsets.ModelViewSet):
    """API endpoint untuk Mata Pelajaran (CRUD). Hanya admin yang bisa edit."""
    queryset = MataPelajaran.objects.all()
    serializer_class = MataPelajaranSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['kode_mapel', 'nama_mapel']
    ordering_fields = ['kode_mapel', 'nama_mapel']

    def create(self, request, *args, **kwargs):
        if not is_admin(request):
            raise PermissionDenied("Hanya admin yang dapat menambah data ini.")
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not is_admin(request):
            raise PermissionDenied("Hanya admin yang dapat mengubah data ini.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not is_admin(request):
            raise PermissionDenied("Hanya admin yang dapat menghapus data ini.")
        return super().destroy(request, *args, **kwargs)


class NilaiSiswaViewSet(viewsets.ModelViewSet):
    """
    API endpoint untuk Nilai Siswa (CRUD).
    - Admin / TU: akses penuh
    - Wali Kelas: dapat input dan hapus nilai siswa di kelasnya
    - Siswa: hanya dapat melihat nilainya sendiri (read-only)
    Mendukung filter query parameter:
    - ?siswa=<id>
    - ?tahun_semester=<id>
    - ?mata_pelajaran=<id>
    """
    queryset = NilaiSiswa.objects.select_related('siswa', 'tahun_semester', 'mata_pelajaran').all()
    serializer_class = NilaiSiswaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['siswa__nama_lengkap', 'siswa__nisn', 'mata_pelajaran__nama_mapel']
    ordering_fields = ['nilai_angka', 'id']

    def get_queryset(self):
        queryset = super().get_queryset()
        role = get_user_role(self.request)

        # Jika role adalah siswa, otomatis kunci hanya pada nilai miliknya sendiri
        if role == 'siswa':
            my_siswa_id = getattr(self.request.user.profile, 'siswa_id', None)
            if my_siswa_id:
                return queryset.filter(siswa_id=my_siswa_id)
            return queryset.none()

        siswa_id = self.request.query_params.get('siswa')
        tahun_semester_id = self.request.query_params.get('tahun_semester')
        mata_pelajaran_id = self.request.query_params.get('mata_pelajaran')

        if siswa_id:
            queryset = queryset.filter(siswa_id=siswa_id)
        if tahun_semester_id:
            queryset = queryset.filter(tahun_semester_id=tahun_semester_id)
        if mata_pelajaran_id:
            queryset = queryset.filter(mata_pelajaran_id=mata_pelajaran_id)

        return queryset

    def create(self, request, *args, **kwargs):
        role = get_user_role(request)
        if role == 'siswa':
            raise PermissionDenied("Siswa tidak memiliki izin menambah nilai.")
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        role = get_user_role(request)
        if role == 'siswa':
            raise PermissionDenied("Siswa tidak memiliki izin mengubah nilai.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        role = get_user_role(request)
        if role == 'siswa':
            raise PermissionDenied("Siswa tidak memiliki izin menghapus nilai.")
        return super().destroy(request, *args, **kwargs)
