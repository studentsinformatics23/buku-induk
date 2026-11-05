from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SiswaViewSet,
    TahunSemesterViewSet,
    MataPelajaranViewSet,
    NilaiSiswaViewSet,
)

router = DefaultRouter()
router.register(r'siswa', SiswaViewSet, basename='siswa')
router.register(r'tahun-semester', TahunSemesterViewSet, basename='tahun-semester')
router.register(r'mata-pelajaran', MataPelajaranViewSet, basename='mata-pelajaran')
router.register(r'nilai', NilaiSiswaViewSet, basename='nilai')

urlpatterns = [
    path('', include(router.urls)),
]

