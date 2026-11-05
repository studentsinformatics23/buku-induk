from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from datetime import datetime, date
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment

from .models import Siswa, TahunSemester, MataPelajaran, NilaiSiswa
from .serializers import (
    SiswaSerializer,
    SiswaDetailSerializer,
    TahunSemesterSerializer,
    MataPelajaranSerializer,
    NilaiSiswaSerializer,
)


class SiswaViewSet(viewsets.ModelViewSet):
    """
    API endpoint untuk mengelola data Siswa (CRUD).
    Mendukung:
    - Pencarian (?search=...)
    - Pengurutan (?ordering=...)
    - Detail nilai per siswa (/api/siswa/{id}/nilai/)
    - Download template Excel (/api/siswa/download-template/)
    - Import data Excel (/api/siswa/import-excel/)
    """
    queryset = Siswa.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nisn', 'nama_lengkap', 'alamat', 'tempat_lahir']
    ordering_fields = ['nisn', 'nama_lengkap', 'tanggal_lahir', 'id']
    ordering = ['nama_lengkap']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SiswaDetailSerializer
        return SiswaSerializer

    @action(detail=True, methods=['get'])
    def nilai(self, request, pk=None):
        """Mendapatkan seluruh daftar nilai untuk satu siswa tertentu."""
        siswa = self.get_object()
        nilai = siswa.nilai_list.select_related('tahun_semester', 'mata_pelajaran').all()
        serializer = NilaiSiswaSerializer(nilai, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='download-template')
    def download_template(self, request):
        """Menghasilkan file template Excel (.xlsx) untuk import data siswa."""
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Data Siswa"

        headers = ["NISN", "Nama Lengkap", "Tempat Lahir", "Tanggal Lahir (YYYY-MM-DD)", "Alamat"]
        ws.append(headers)

        header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="1E40AF", end_color="1E40AF", fill_type="solid")
        center_align = Alignment(horizontal="center", vertical="center")

        for col_num in range(1, len(headers) + 1):
            cell = ws.cell(row=1, column=col_num)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = center_align

        # Contoh data
        sample_rows = [
            ["0081234567", "Muhammad Dani", "Bandung", "2008-04-12", "Jl. Asia Afrika No. 45"],
            ["0089876543", "Siti Nurhaliza", "Jakarta", "2008-09-25", "Jl. Sudirman No. 12B"],
        ]
        for row in sample_rows:
            ws.append(row)

        widths = [18, 25, 20, 30, 35]
        for idx, width in enumerate(widths, 1):
            col_letter = openpyxl.utils.get_column_letter(idx)
            ws.column_dimensions[col_letter].width = width

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response['Content-Disposition'] = 'attachment; filename="template_import_siswa.xlsx"'
        wb.save(response)
        return response

    @action(detail=False, methods=['post'], url_path='import-excel')
    def import_excel(self, request):
        """
        Mengimpor data siswa dari file Excel (.xlsx).
        """
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

        nisn_idx = next((i for i, h in enumerate(header) if 'nisn' in h), 0)
        nama_idx = next((i for i, h in enumerate(header) if 'nama' in h), 1)
        tempat_idx = next((i for i, h in enumerate(header) if 'tempat' in h), 2)
        tgl_idx = next((i for i, h in enumerate(header) if 'tanggal' in h or 'tgl' in h), 3)
        alamat_idx = next((i for i, h in enumerate(header) if 'alamat' in h), 4)

        created_count = 0
        updated_count = 0
        errors = []

        for row_num, row in enumerate(rows[1:], start=2):
            if not any(row):
                continue

            raw_nisn = row[nisn_idx] if len(row) > nisn_idx else None
            raw_nama = row[nama_idx] if len(row) > nama_idx else None
            raw_tempat = row[tempat_idx] if len(row) > tempat_idx else None
            raw_tgl = row[tgl_idx] if len(row) > tgl_idx else None
            raw_alamat = row[alamat_idx] if len(row) > alamat_idx else None

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

            tempat = str(raw_tempat).strip() if raw_tempat else '-'
            alamat = str(raw_alamat).strip() if raw_alamat else '-'

            parsed_date = None
            if isinstance(raw_tgl, (datetime, date)):
                parsed_date = raw_tgl.strftime('%Y-%m-%d')
            elif raw_tgl:
                date_str = str(raw_tgl).strip()
                for fmt in ('%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y', '%Y/%m/%d'):
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
                    'tempat_lahir': tempat,
                    'tanggal_lahir': parsed_date,
                    'alamat': alamat,
                }
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

        total_processed = created_count + updated_count

        return Response({
            "status": "success" if total_processed > 0 else "error",
            "message": f"Import selesai: {created_count} siswa baru ditambahkan, {updated_count} siswa diperbarui.",
            "created_count": created_count,
            "updated_count": updated_count,
            "total_processed": total_processed,
            "errors": errors,
        }, status=status.HTTP_200_OK if total_processed > 0 or not errors else status.HTTP_400_BAD_REQUEST)


class TahunSemesterViewSet(viewsets.ModelViewSet):
    """API endpoint untuk Tahun Ajaran dan Semester (CRUD)."""
    queryset = TahunSemester.objects.all()
    serializer_class = TahunSemesterSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['tahun_ajaran', 'semester']
    ordering_fields = ['tahun_ajaran', 'semester']


class MataPelajaranViewSet(viewsets.ModelViewSet):
    """API endpoint untuk Mata Pelajaran (CRUD)."""
    queryset = MataPelajaran.objects.all()
    serializer_class = MataPelajaranSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['kode_mapel', 'nama_mapel']
    ordering_fields = ['kode_mapel', 'nama_mapel']


class NilaiSiswaViewSet(viewsets.ModelViewSet):
    """
    API endpoint untuk Nilai Siswa (CRUD).
    Mendukung filter query parameter:
    - ?siswa=<id>
    - ?tahun_semester=<id>
    - ?mata_pelajaran=<id>
    """
    queryset = NilaiSiswa.objects.select_related('siswa', 'tahun_semester', 'mata_pelajaran').all()
    serializer_class = NilaiSiswaSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['siswa__nama_lengkap', 'siswa__nisn', 'mata_pelajaran__nama_mapel']
    ordering_fields = ['nilai_angka', 'id']

    def get_queryset(self):
        queryset = super().get_queryset()
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
