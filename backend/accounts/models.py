from django.db import models
from django.contrib.auth.models import User
from siswa.models import Siswa


class UserProfile(models.Model):
    """
    Profil tambahan untuk User Django.
    Menyimpan peran (role), kelas yang diampu (untuk Wali Kelas),
    atau tautan data Siswa/Santri (untuk role Siswa).
    """
    ROLE_CHOICES = [
        ('admin', 'Admin / Tata Usaha'),
        ('wali_kelas', 'Wali Kelas'),
        ('siswa', 'Siswa / Santri'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='wali_kelas')
    # Kelas yang diampu, diisi jika role = wali_kelas (contoh: "X RPL 1")
    kelas_diampu = models.CharField(max_length=100, blank=True, default='')
    # Tautan ke data santri jika role = siswa
    siswa = models.ForeignKey(
        Siswa,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_profiles',
        help_text='Tautan santri jika akun ini adalah akun siswa/santri.'
    )

    class Meta:
        verbose_name = 'Profil Pengguna'
        verbose_name_plural = 'Profil Pengguna'

    def __str__(self):
        return f"{self.user.username} ({self.get_role_display()})"
