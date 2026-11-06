from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile
from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
)


def get_tokens_for_user(user):
    """Generate JWT access dan refresh token untuk user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def is_admin_user(user):
    """Cek apakah user adalah admin atau superuser."""
    if user.is_superuser:
        return True
    try:
        return user.profile.role == 'admin'
    except Exception:
        return False


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login endpoint. Menerima username dan password,
    mengembalikan JWT token dan data user.
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'detail': 'Data tidak valid.', 'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    username = serializer.validated_data['username']
    password = serializer.validated_data['password']

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response(
            {'detail': 'Username atau password salah.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        return Response(
            {'detail': 'Akun tidak aktif. Hubungi administrator.'},
            status=status.HTTP_403_FORBIDDEN
        )

    tokens = get_tokens_for_user(user)
    user_data = UserSerializer(user).data

    return Response({
        'tokens': tokens,
        'user': user_data,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout endpoint. Blacklist refresh token.
    """
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'detail': 'Berhasil logout.'}, status=status.HTTP_200_OK)
    except Exception:
        return Response({'detail': 'Berhasil logout.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """
    Endpoint untuk mendapatkan data user yang sedang login.
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_view(request):
    """
    Registrasi user baru. Hanya admin yang diizinkan.
    """
    if not is_admin_user(request.user):
        return Response(
            {'detail': 'Hanya admin yang dapat menambah pengguna baru.'},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'detail': 'Data tidak valid.', 'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = serializer.save()
    return Response(
        {'detail': f'Pengguna "{user.username}" berhasil dibuat.', 'user': UserSerializer(user).data},
        status=status.HTTP_201_CREATED
    )


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_list_create_view(request):
    """
    Endpoint Admin untuk melihat semua pengguna dan membuat pengguna baru.
    Mendukung filter role: ?role=admin|wali_kelas|siswa
    """
    if not is_admin_user(request.user):
        return Response(
            {'detail': 'Hanya admin yang dapat mengakses manajemen pengguna.'},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method == 'GET':
        users = User.objects.select_related('profile', 'profile__siswa').all().order_by('-id')
        role_filter = request.query_params.get('role')
        search_query = request.query_params.get('search')

        if role_filter:
            users = users.filter(profile__role=role_filter)
        if search_query:
            users = users.filter(username__icontains=search_query) | users.filter(first_name__icontains=search_query)

        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'detail': 'Data tidak valid.', 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        user = serializer.save()
        return Response(
            {'detail': f'Pengguna "{user.username}" berhasil ditambahkan.', 'user': UserSerializer(user).data},
            status=status.HTTP_201_CREATED
        )


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def user_detail_update_delete_view(request, user_id):
    """
    Endpoint Admin untuk melihat detail, mengupdate, atau menghapus pengguna.
    """
    if not is_admin_user(request.user):
        return Response(
            {'detail': 'Hanya admin yang dapat mengelola pengguna.'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        target_user = User.objects.select_related('profile', 'profile__siswa').get(id=user_id)
    except User.DoesNotExist:
        return Response({'detail': 'Pengguna tidak ditemukan.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(UserSerializer(target_user).data)

    elif request.method in ['PUT', 'PATCH']:
        serializer = UserUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'detail': 'Data tidak valid.', 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        updated_user = serializer.update(target_user, serializer.validated_data)
        return Response({
            'detail': f'Pengguna "{updated_user.username}" berhasil diperbarui.',
            'user': UserSerializer(updated_user).data
        })

    elif request.method == 'DELETE':
        # Cegah admin menghapus akunnya sendiri yang sedang aktif
        if target_user.id == request.user.id:
            return Response(
                {'detail': 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        username = target_user.username
        target_user.delete()
        return Response({'detail': f'Pengguna "{username}" berhasil dihapus.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """
    Ubah password pengguna yang sedang login.
    """
    serializer = ChangePasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'detail': 'Data tidak valid.', 'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = request.user
    old_password = serializer.validated_data['old_password']
    new_password = serializer.validated_data['new_password']

    if not user.check_password(old_password):
        return Response(
            {'detail': 'Password lama tidak benar.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.set_password(new_password)
    user.save()
    return Response({'detail': 'Password berhasil diubah. Silakan login kembali.'})
