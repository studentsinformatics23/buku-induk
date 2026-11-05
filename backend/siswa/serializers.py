from rest_framework import serializers
from .models import Siswa, TahunSemester, MataPelajaran, NilaiSiswa


class TahunSemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = TahunSemester
        fields = ['id', 'tahun_ajaran', 'semester']


class MataPelajaranSerializer(serializers.ModelSerializer):
    class Meta:
        model = MataPelajaran
        fields = ['id', 'kode_mapel', 'nama_mapel']


class NilaiSiswaSerializer(serializers.ModelSerializer):
    siswa_nama = serializers.ReadOnlyField(source='siswa.nama_lengkap')
    siswa_nisn = serializers.ReadOnlyField(source='siswa.nisn')
    tahun_semester_display = serializers.CharField(source='tahun_semester.__str__', read_only=True)
    mata_pelajaran_nama = serializers.ReadOnlyField(source='mata_pelajaran.nama_mapel')
    mata_pelajaran_kode = serializers.ReadOnlyField(source='mata_pelajaran.kode_mapel')

    class Meta:
        model = NilaiSiswa
        fields = [
            'id',
            'siswa',
            'siswa_nama',
            'siswa_nisn',
            'tahun_semester',
            'tahun_semester_display',
            'mata_pelajaran',
            'mata_pelajaran_nama',
            'mata_pelajaran_kode',
            'nilai_angka',
        ]


class SiswaSerializer(serializers.ModelSerializer):
    foto_url = serializers.SerializerMethodField()
    jenis_kelamin_display = serializers.CharField(source='get_jenis_kelamin_display', read_only=True)

    class Meta:
        model = Siswa
        fields = [
            'id',
            'nisn',
            'nama_lengkap',
            'jenis_kelamin',
            'jenis_kelamin_display',
            'tempat_lahir',
            'tanggal_lahir',
            'agama',
            'alamat',
            'kelas',
            'nama_ayah',
            'nama_ibu',
            'pekerjaan_ortu',
            'no_telepon_ortu',
            'status_siswa',
            'foto',
            'foto_url',
        ]

    def get_foto_url(self, obj):
        if obj.foto:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.foto.url)
            return obj.foto.url
        return None


class SiswaDetailSerializer(SiswaSerializer):
    """Serializer detail siswa lengkap beserta daftar nilai."""
    nilai_list = NilaiSiswaSerializer(many=True, read_only=True)

    class Meta(SiswaSerializer.Meta):
        fields = SiswaSerializer.Meta.fields + ['nilai_list']
