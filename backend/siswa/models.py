from django.db import models

class Siswa(models.Model):
    nisn = models.CharField(max_length=20, unique=True)
    nama_lengkap = models.CharField(max_length=100)
    tempat_lahir = models.CharField(max_length=50)
    tanggal_lahir = models.DateField()
    alamat = models.TextField()
    foto = models.ImageField(upload_to='foto_siswa/', null=True, blank=True)

    def __str__(self):
        return f"{self.nisn} - {self.nama_lengkap}"

class TahunSemester(models.Model):
    tahun_ajaran = models.CharField(max_length=20) # Contoh: 2026/2027
    semester = models.CharField(max_length=10, choices=[('Ganjil', 'Ganjil'), ('Genap', 'Genap')])

    def __str__(self):
        return f"{self.tahun_ajaran} - {self.semester}"

class MataPelajaran(models.Model):
    kode_mapel = models.CharField(max_length=20, unique=True)
    nama_mapel = models.CharField(max_length=100)

    def __str__(self):
        return self.nama_mapel

class NilaiSiswa(models.Model):
    siswa = models.ForeignKey(Siswa, on_delete=models.CASCADE)
    tahun_semester = models.ForeignKey(TahunSemester, on_delete=models.CASCADE)
    mata_pelajaran = models.ForeignKey(MataPelajaran, on_delete=models.CASCADE)
    nilai_angka = models.DecimalField(max_digits=5, decimal_places=2) # Untuk nilai dengan koma (misal 85.50)

    def __str__(self):
        return f"{self.siswa.nama_lengkap} - {self.mata_pelajaran.nama_mapel}: {self.nilai_angka}"