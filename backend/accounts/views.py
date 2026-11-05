from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer, ChangePasswordSerializer


def get_tokens_for_user(user):
    """Generate JWT access dan refresh token untuk user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


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
    # Cek apakah user yang request adalah admin
    try:
        requester_role = request.user.profile.role
    except UserProfile.DoesNotExist:
        requester_role = 'wali_kelas'

    if requester_role != 'admin' and not request.user.is_superuser:
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
