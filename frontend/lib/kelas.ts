// Daftar pilihan kelas standar Pondok Pesantren dari Kelas 7 sampai dengan Kelas 12
export interface KelasOption {
  value: string;
  label: string;
}

export interface KelasGroup {
  label: string;
  options: KelasOption[];
}

export const DAFTAR_PILIHAN_KELAS: KelasGroup[] = [
  {
    label: 'Tingkat MTs / SMP (Kelas 7 - 9)',
    options: [
      { value: 'Kelas 7', label: 'Kelas 7' },
      { value: '7A', label: 'Kelas 7A' },
      { value: '7B', label: 'Kelas 7B' },
      { value: '7C', label: 'Kelas 7C' },
      { value: '7D', label: 'Kelas 7D' },
      { value: 'Kelas 8', label: 'Kelas 8' },
      { value: '8A', label: 'Kelas 8A' },
      { value: '8B', label: 'Kelas 8B' },
      { value: '8C', label: 'Kelas 8C' },
      { value: '8D', label: 'Kelas 8D' },
      { value: 'Kelas 9', label: 'Kelas 9' },
      { value: '9A', label: 'Kelas 9A' },
      { value: '9B', label: 'Kelas 9B' },
      { value: '9C', label: 'Kelas 9C' },
      { value: '9D', label: 'Kelas 9D' },
    ],
  },
  {
    label: 'Tingkat MA / SMA / SMK (Kelas 10 - 12)',
    options: [
      { value: 'Kelas 10', label: 'Kelas 10' },
      { value: '10A', label: 'Kelas 10A' },
      { value: '10B', label: 'Kelas 10B' },
      { value: '10C', label: 'Kelas 10C' },
      { value: '10 IPA', label: 'Kelas 10 IPA' },
      { value: '10 IPS', label: 'Kelas 10 IPS' },
      { value: '10 Keagamaan', label: 'Kelas 10 Keagamaan' },
      { value: 'Kelas 11', label: 'Kelas 11' },
      { value: '11A', label: 'Kelas 11A' },
      { value: '11B', label: 'Kelas 11B' },
      { value: '11C', label: 'Kelas 11C' },
      { value: '11 IPA', label: 'Kelas 11 IPA' },
      { value: '11 IPS', label: 'Kelas 11 IPS' },
      { value: '11 Keagamaan', label: 'Kelas 11 Keagamaan' },
      { value: 'Kelas 12', label: 'Kelas 12' },
      { value: '12A', label: 'Kelas 12A' },
      { value: '12B', label: 'Kelas 12B' },
      { value: '12C', label: 'Kelas 12C' },
      { value: '12 IPA', label: 'Kelas 12 IPA' },
      { value: '12 IPS', label: 'Kelas 12 IPS' },
      { value: '12 Keagamaan', label: 'Kelas 12 Keagamaan' },
    ],
  },
];

// Seluruh daftar value kelas standar 7 - 12
export const ALL_KELAS_VALUES: string[] = DAFTAR_PILIHAN_KELAS.flatMap((g) =>
  g.options.map((opt) => opt.value)
);

// Format nama kelas untuk ditampilkan
export function formatNamaKelas(k: string): string {
  if (!k || k === '-') return '-';
  if (k.toLowerCase().startsWith('kelas')) return k;
  return `Kelas ${k}`;
}

