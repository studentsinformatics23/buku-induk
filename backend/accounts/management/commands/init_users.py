from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import UserProfile


class Command(BaseCommand):
    help = 'Inisialisasi akun default (Admin dan Wali Kelas) dengan password terenkripsi'

    def handle(self, *args, **options):
        # 1. Buat / update akun Admin / TU
        admin_user, created_admin = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@al-faqih.ponpes.id',
                'first_name': 'Administrator TU',
                'last_name': 'Ponpes Al-Faqih',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin_user.set_password('admin123')
        admin_user.save()

        profile_admin, _ = UserProfile.objects.get_or_create(user=admin_user)
        profile_admin.role = 'admin'
        profile_admin.kelas_diampu = ''
        profile_admin.save()

        if created_admin:
            self.stdout.write(self.style.SUCCESS('Akun Admin berhasil dibuat: username "admin", password "admin123"'))
        else:
            self.stdout.write(self.style.WARNING('Akun Admin sudah ada, password direset ke "admin123"'))

        # 2. Buat / update akun Wali Kelas
        wali_user, created_wali = User.objects.get_or_create(
            username='walikelas',
            defaults={
                'email': 'walikelas@al-faqih.ponpes.id',
                'first_name': 'Ustadz Pengampu',
                'last_name': 'Wali Kelas',
                'is_staff': False,
                'is_superuser': False,
            }
        )
        wali_user.set_password('wali123')
        wali_user.save()

        profile_wali, _ = UserProfile.objects.get_or_create(user=wali_user)
        profile_wali.role = 'wali_kelas'
        profile_wali.kelas_diampu = 'X RPL 1'
        profile_wali.save()

        if created_wali:
            self.stdout.write(self.style.SUCCESS('Akun Wali Kelas berhasil dibuat: username "walikelas", password "wali123"'))
        else:
            self.stdout.write(self.style.WARNING('Akun Wali Kelas sudah ada, password direset ke "wali123"'))

        self.stdout.write(self.style.SUCCESS('\nInisialisasi akun selesai! Password telah dienkripsi menggunakan PBKDF2-SHA256 bawaan Django.'))

