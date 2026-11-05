from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
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
    Mendukung pencarian (?search=...) berdasarkan NISN, Nama, atau Alamat.
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
