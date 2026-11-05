from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """
    Profil tambahan untuk User Django.
    Menyimpan peran (role) dan kelas yang diampu (untuk Wali Kelas).
    """
    ROLE_CHOICES = [
        ('admin', 'Admin / Tata Usaha'),
        ('wali_kelas', 'Wali Kelas'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='wali_kelas')
    # Kelas yang diampu, diisi jika role = wali_kelas (contoh: "X IPA 1")
    kelas_diampu = models.CharField(max_length=100, blank=True, default='')

    class Meta:
        verbose_name = 'Profil Pengguna'
        verbose_name_plural = 'Profil Pengguna'

    def __str__(self):
        return f"{self.user.username} ({self.get_role_display()})"
