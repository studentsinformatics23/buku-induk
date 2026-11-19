from django.contrib import admin
from .models import Siswa, Rombel, TahunSemester, MataPelajaran, NilaiSiswa


class NilaiSiswaInline(admin.TabularInline):
    model = NilaiSiswa
    extra = 1
    autocomplete_fields = ['mata_pelajaran', 'tahun_semester']


@admin.register(Siswa)
class SiswaAdmin(admin.ModelAdmin):
    list_display = ('nisn', 'nama_lengkap', 'tingkat', 'rombel', 'kelas', 'jenis_kelamin', 'status_siswa')
    list_filter = ('tingkat', 'kelas', 'jenis_kelamin', 'agama', 'status_siswa')
    search_fields = ('nisn', 'nama_lengkap', 'alamat', 'kelas', 'rombel')
    list_per_page = 20
    inlines = [NilaiSiswaInline]
    fieldsets = (
        ('Data Pokok Siswa', {
            'fields': (
                'nisn',
                'nama_lengkap',
                'jenis_kelamin',
                'tingkat',
                'rombel',
                'kelas',
                'tempat_lahir',
                'tanggal_lahir',
                'agama',
                'status_siswa',
                'foto',
            )
        }),
        ('Alamat & Kontak', {
            'fields': (
                'alamat',
                'no_telepon_ortu',
            )
        }),
        ('Data Orang Tua / Wali', {
            'fields': (
                'nama_ayah',
                'nama_ibu',
                'pekerjaan_ortu',
            )
        }),
    )


@admin.register(Rombel)
class RombelAdmin(admin.ModelAdmin):
    list_display = ('tingkat', 'nama', 'display_name')
    list_filter = ('tingkat',)
    search_fields = ('nama',)
    ordering = ('tingkat', 'nama')


@admin.register(TahunSemester)
class TahunSemesterAdmin(admin.ModelAdmin):
    list_display = ('tahun_ajaran', 'semester')
    list_filter = ('semester', 'tahun_ajaran')
    search_fields = ('tahun_ajaran',)


@admin.register(MataPelajaran)
class MataPelajaranAdmin(admin.ModelAdmin):
    list_display = ('kode_mapel', 'nama_mapel')
    search_fields = ('kode_mapel', 'nama_mapel')


@admin.register(NilaiSiswa)
class NilaiSiswaAdmin(admin.ModelAdmin):
    list_display = ('siswa', 'mata_pelajaran', 'tahun_semester', 'nilai_angka')
    list_filter = ('tahun_semester', 'mata_pelajaran')
    search_fields = ('siswa__nama_lengkap', 'siswa__nisn', 'mata_pelajaran__nama_mapel')
    autocomplete_fields = ['siswa', 'mata_pelajaran', 'tahun_semester']
