from django.db import models

class Siswa(models.Model):
    JENIS_KELAMIN_CHOICES = [
        ('L', 'Laki-laki'),
        ('P', 'Perempuan'),
    ]
    AGAMA_CHOICES = [
        ('Islam', 'Islam'),
        ('Kristen', 'Kristen Protestan'),
        ('Katolik', 'Katolik'),
        ('Hindu', 'Hindu'),
        ('Buddha', 'Buddha'),
        ('Konghucu', 'Konghucu'),
    ]
    STATUS_CHOICES = [
        ('Aktif', 'Aktif'),
        ('Lulus', 'Lulus'),
        ('Pindah', 'Pindah / Mutasi'),
        ('Keluar', 'Keluar / Drop Out'),
    ]

    nisn = models.CharField(max_length=20, unique=True)
    nama_lengkap = models.CharField(max_length=100)
    jenis_kelamin = models.CharField(max_length=1, choices=JENIS_KELAMIN_CHOICES, default='L')
    tempat_lahir = models.CharField(max_length=50)
    tanggal_lahir = models.DateField()
    agama = models.CharField(max_length=20, choices=AGAMA_CHOICES, default='Islam')
    alamat = models.TextField()
    kelas = models.CharField(max_length=50, default='-', help_text="Contoh: X IPA 1 / XI RPL 2")
    nama_ayah = models.CharField(max_length=100, blank=True, null=True, default='')
    nama_ibu = models.CharField(max_length=100, blank=True, null=True, default='')
    pekerjaan_ortu = models.CharField(max_length=100, blank=True, null=True, default='')
    no_telepon_ortu = models.CharField(max_length=20, blank=True, null=True, default='')
    status_siswa = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Aktif')
    foto = models.ImageField(upload_to='foto_siswa/', null=True, blank=True)

    class Meta:
        ordering = ['nama_lengkap']
        verbose_name_plural = 'Siswa'

    def __str__(self):
        return f"{self.nisn} - {self.nama_lengkap} ({self.kelas})"


class TahunSemester(models.Model):
    tahun_ajaran = models.CharField(max_length=20) # Contoh: 2026/2027
    semester = models.CharField(max_length=10, choices=[('Ganjil', 'Ganjil'), ('Genap', 'Genap')])

    class Meta:
        verbose_name_plural = 'Tahun & Semester'
        ordering = ['-tahun_ajaran', 'semester']

    def __str__(self):
        return f"{self.tahun_ajaran} - {self.semester}"


class MataPelajaran(models.Model):
    kode_mapel = models.CharField(max_length=20, unique=True)
    nama_mapel = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = 'Mata Pelajaran'
        ordering = ['nama_mapel']

    def __str__(self):
        return self.nama_mapel


class NilaiSiswa(models.Model):
    siswa = models.ForeignKey(Siswa, on_delete=models.CASCADE, related_name='nilai_list')
    tahun_semester = models.ForeignKey(TahunSemester, on_delete=models.CASCADE, related_name='nilai_list')
    mata_pelajaran = models.ForeignKey(MataPelajaran, on_delete=models.CASCADE, related_name='nilai_list')
    nilai_angka = models.DecimalField(max_digits=5, decimal_places=2) # Untuk nilai dengan koma (misal 85.50)

    class Meta:
        unique_together = ('siswa', 'tahun_semester', 'mata_pelajaran')
        verbose_name_plural = 'Nilai Siswa'

    def __str__(self):
        return f"{self.siswa.nama_lengkap} - {self.mata_pelajaran.nama_mapel}: {self.nilai_angka}"
