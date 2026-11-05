from django.contrib import admin
from .models import Siswa, TahunSemester, MataPelajaran, NilaiSiswa

# Cara sederhana mendaftarkan model
admin.site.register(TahunSemester)
admin.site.register(MataPelajaran)
admin.site.register(NilaiSiswa)

@admin.register(Siswa)
class SiswaAdmin(admin.ModelAdmin):
    list_display = ('nisn', 'nama_lengkap', 'tempat_lahir', 'tanggal_lahir')
    search_fields = ('nisn', 'nama_lengkap')