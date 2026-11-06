from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile
from siswa.models import Siswa


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer untuk data profil pengguna."""
    siswa_nama = serializers.ReadOnlyField(source='siswa.nama_lengkap', default='')
    siswa_nisn = serializers.ReadOnlyField(source='siswa.nisn', default='')
    siswa_kelas = serializers.ReadOnlyField(source='siswa.kelas', default='')

    class Meta:
        model = UserProfile
        fields = ['role', 'kelas_diampu', 'siswa', 'siswa_nama', 'siswa_nisn', 'siswa_kelas']


class UserSerializer(serializers.ModelSerializer):
    """Serializer untuk data User beserta profil lengkap."""
    profile = UserProfileSerializer(read_only=True)
    role = serializers.SerializerMethodField()
    kelas_diampu = serializers.SerializerMethodField()
    siswa_id = serializers.SerializerMethodField()
    siswa_nama = serializers.SerializerMethodField()
    siswa_nisn = serializers.SerializerMethodField()
    siswa_kelas = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'date_joined',
            'profile',
            'role',
            'kelas_diampu',
            'siswa_id',
            'siswa_nama',
            'siswa_nisn',
            'siswa_kelas',
        ]

    def get_role(self, obj):
        try:
            return obj.profile.role
        except Exception:
            return 'wali_kelas'

    def get_kelas_diampu(self, obj):
        try:
            return obj.profile.kelas_diampu
        except Exception:
            return ''

    def get_siswa_id(self, obj):
        try:
            return obj.profile.siswa_id if obj.profile.siswa else None
        except Exception:
            return None

    def get_siswa_nama(self, obj):
        try:
            return obj.profile.siswa.nama_lengkap if obj.profile.siswa else ''
        except Exception:
            return ''

    def get_siswa_nisn(self, obj):
        try:
            return obj.profile.siswa.nisn if obj.profile.siswa else ''
        except Exception:
            return ''

    def get_siswa_kelas(self, obj):
        try:
            return obj.profile.siswa.kelas if obj.profile.siswa else ''
        except Exception:
            return ''


class LoginSerializer(serializers.Serializer):
    """Serializer untuk request login."""
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})


class RegisterSerializer(serializers.Serializer):
    """Serializer untuk mendaftarkan pengguna baru oleh Admin."""
    username = serializers.CharField(required=True, max_length=150)
    password = serializers.CharField(required=True, write_only=True, min_length=6)
    email = serializers.EmailField(required=False, allow_blank=True, default='')
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150, default='')
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150, default='')
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, default='wali_kelas')
    kelas_diampu = serializers.CharField(required=False, allow_blank=True, max_length=100, default='')
    siswa_id = serializers.IntegerField(required=False, allow_null=True, default=None)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value.strip()).exists():
            raise serializers.ValidationError("Username sudah digunakan.")
        return value.strip()

    def create(self, validated_data):
        role = validated_data.pop('role', 'wali_kelas')
        kelas_diampu = validated_data.pop('kelas_diampu', '')
        siswa_id = validated_data.pop('siswa_id', None)
        password = validated_data.pop('password')

        user = User.objects.create_user(password=password, **validated_data)

        siswa_obj = None
        if siswa_id:
            try:
                siswa_obj = Siswa.objects.get(id=siswa_id)
            except Siswa.DoesNotExist:
                siswa_obj = None

        UserProfile.objects.create(
            user=user,
            role=role,
            kelas_diampu=kelas_diampu,
            siswa=siswa_obj
        )
        return user


class UserUpdateSerializer(serializers.Serializer):
    """Serializer untuk memperbarui data pengguna oleh Admin."""
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, required=False)
    kelas_diampu = serializers.CharField(required=False, allow_blank=True, max_length=100)
    siswa_id = serializers.IntegerField(required=False, allow_null=True)
    password = serializers.CharField(required=False, write_only=True, min_length=6, allow_blank=True)
    is_active = serializers.BooleanField(required=False)

    def update(self, instance, validated_data):
        profile, _ = UserProfile.objects.get_or_create(user=instance)

        if 'first_name' in validated_data:
            instance.first_name = validated_data['first_name']
        if 'last_name' in validated_data:
            instance.last_name = validated_data['last_name']
        if 'email' in validated_data:
            instance.email = validated_data['email']
        if 'is_active' in validated_data:
            instance.is_active = validated_data['is_active']
        if validated_data.get('password'):
            instance.set_password(validated_data['password'])

        instance.save()

        if 'role' in validated_data:
            profile.role = validated_data['role']
        if 'kelas_diampu' in validated_data:
            profile.kelas_diampu = validated_data['kelas_diampu']
        if 'siswa_id' in validated_data:
            siswa_id = validated_data['siswa_id']
            if siswa_id:
                try:
                    profile.siswa = Siswa.objects.get(id=siswa_id)
                except Siswa.DoesNotExist:
                    profile.siswa = None
            else:
                profile.siswa = None

        profile.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer untuk ubah password pengguna yang sedang login."""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=6)
