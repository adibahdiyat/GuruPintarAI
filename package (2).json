export interface SoalEvaluasi {
  pertanyaan: string;
  pilihan_jawaban: string[];
  kunci_jawaban: string;
}

export interface ModulAjarRppMerdeka {
  komponen_inti: {
    tujuan_pembelajaran: string;
    alur_tujuan_pembelajaran?: string;
    materi_pokok: string;
  };
  langkah_pembelajaran: {
    kegiatan_pembuka: string;
    kegiatan_inti_mendalam: string;
    kegiatan_penutup: string;
  };
  instrumen_asesmen: {
    jenis_asesmen: string;
    soal_evaluasi: SoalEvaluasi[];
  };
}

export interface PptInteractiveVisualSlide {
  slide_nomor: number;
  layout_template: string;
  judul_halaman: string;
  isi_poin_materi: string[];
  image_generation_prompt: string;
}

export interface SaranYoutubeSpesifik {
  keyword_pencarian_utama: string;
}

export interface MagicStudioOutput {
  rpp_merdeka_formal: {
    komponen_umum: string;
    tujuan_pembelajaran: string;
    langkah_pembelajaran_rinci: string;
  };
  lembar_kerja_peserta_didik_lkpd: {
    judul_aktivitas: string;
    petunjuk_belajar: string;
    soal_atau_tugas_lapangan: string[];
  };
  paket_asesmen_penilaian_lengkap: {
    tipe: string;
    butir_soal_multiple_choice: {
      no: number;
      pertanyaan: string;
      pilihan: string[];
      kunci: string;
      pembahasan: string;
    }[];
  };
  kolom_ice_breaking_mandiri: {
    nama_permainan: string;
    langkah_bermain: string;
  };
  prompt_gambar_topik: string;
  metode_pembelajaran?: string;
  pendekatan_pembelajaran?: string;
}

export interface GenerateResult {
  modul_ajar_rpp_merdeka: ModulAjarRppMerdeka;
  ppt_canva_ready_slides: PptInteractiveVisualSlide[];
  saran_youtube_spesifik: SaranYoutubeSpesifik;
  magic_studio_output?: MagicStudioOutput;
  metode_pembelajaran?: string;
}

export interface ImageUpload {
  name: string;
  mimeType: string;
  data: string; // Base64 encoding
  previewUrl: string;
}

export const CLASS_LEVELS = [
  "SD Kelas 1",
  "SD Kelas 2",
  "SD Kelas 3",
  "SD Kelas 4",
  "SD Kelas 5",
  "SD Kelas 6",
  "SMP Kelas 7",
  "SMP Kelas 8",
  "SMP Kelas 9",
  "SMA Kelas 10",
  "SMA Kelas 11",
  "SMA Kelas 12"
];

export const SUBJECTS = [
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "Matematika",
  "IPAS (IPA & IPS Gabungan)",
  "Ilmu Pengetahuan Alam (IPA)",
  "Ilmu Pengetahuan Sosial (IPS)",
  "Fisika",
  "Kimia",
  "Biologi",
  "Ekonomi",
  "Geografi",
  "Sosiologi",
  "Sejarah",
  "Informatika",
  "Pendidikan Pancasila / PPKn",
  "Seni Rupa",
  "Seni Musik",
  "Seni Tari & Teater",
  "Seni Budaya & Prakarya",
  "Prakarya & Kewirausahaan (PKWU)",
  "Pendidikan Jasmani & Kesehatan (PJOK)",
  "Pendidikan Agama Islam (PAI)",
  "Al-Qur'an Hadits",
  "Fiqih",
  "Aqidah Akhlak",
  "Sejarah Kebudayaan Islam (SKI)",
  "Bahasa Arab",
  "Tahsin",
  "Tahfidz",
  "BTQ (Baca Tulis Al-Qur'an)",
  "Input Mapel Manual (Ketik Sendiri)"
];

export interface RppVersion {
  id: string;
  timestamp: string;
  result: GenerateResult;
  label: string;
  materialText?: string;
  classLevel?: string;
  subject?: string;
}

