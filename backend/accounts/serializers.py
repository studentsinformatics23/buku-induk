from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer untuk data profil pengguna."""
    class Meta:
        model = UserProfile
        fields = ['role', 'kelas_diampu']


class UserSerializer(serializers.ModelSerializer):
    """Serializer untuk data User beserta profil."""
    profile = UserProfileSerializer(read_only=True)
    role = serializers.SerializerMethodField()
    kelas_diampu = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile', 'role', 'kelas_diampu']

    def get_role(self, obj):
        try:
            return obj.profile.role
        except UserProfile.DoesNotExist:
            return 'wali_kelas'

    def get_kelas_diampu(self, obj):
        try:
            return obj.profile.kelas_diampu
        except UserProfile.DoesNotExist:
            return ''


class LoginSerializer(serializers.Serializer):
    """Serializer untuk request login."""
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})


class RegisterSerializer(serializers.Serializer):
    """Serializer untuk mendaftarkan pengguna baru (hanya admin yang bisa)."""
    username = serializers.CharField(required=True, max_length=150)
    password = serializers.CharField(required=True, write_only=True, min_length=6)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, default='wali_kelas')
    kelas_diampu = serializers.CharField(required=False, allow_blank=True, max_length=100, default='')

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username sudah digunakan.")
        return value

    def create(self, validated_data):
        role = validated_data.pop('role', 'wali_kelas')
        kelas_diampu = validated_data.pop('kelas_diampu', '')
        password = validated_data.pop('password')

        user = User.objects.create_user(password=password, **validated_data)
        UserProfile.objects.create(user=user, role=role, kelas_diampu=kelas_diampu)
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer untuk ubah password."""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=6)

