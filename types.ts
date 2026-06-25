import React, { useState } from "react";
import { Copy, Check, Sparkles, BookOpen, Presentation, Video, Wrench, FileText, Image } from "lucide-react";
import { PptInteractiveVisualSlide, SaranYoutubeSpesifik } from "../types";

export interface MediaAlatPeraga {
  mediaUtama: string[];
  alatBahanKonkret: string[];
}

export const getMediaAlatPeraga = (subject: string, manualSubject: string, materialText: string): MediaAlatPeraga => {
  const normSubject = (subject || "").toLowerCase();
  const normManual = (manualSubject || "").toLowerCase();
  const text = (materialText || "").toLowerCase();

  const getCleanSubjectName = () => {
    const active = (subject === "Input Mapel Manual (Ketik Sendiri)" && manualSubject) ? manualSubject : subject;
    return active || "Mata Pelajaran";
  };

  // 1. Agama / Qur'an / Hadits / Fiqih / Tahfidz / BTQ / Tahsin
  if (
    normSubject.includes("agama") ||
    normSubject.includes("alqur") ||
    normSubject.includes("hadits") ||
    normSubject.includes("fiqih") ||
    normSubject.includes("tahfidz") ||
    normSubject.includes("tahsin") ||
    normSubject.includes("btq") ||
    normSubject.includes("aqidah") ||
    normSubject.includes("arab") ||
    normManual.includes("agama") ||
    normManual.includes("alqur") ||
    normManual.includes("hadits") ||
    normManual.includes("fiqih") ||
    normManual.includes("tahfidz") ||
    normManual.includes("tahsin") ||
    normManual.includes("btq") ||
    normManual.includes("aqidah") ||
    normManual.includes("arab") ||
    text.includes("makharijul") ||
    text.includes("tajwid") ||
    text.includes("hafal") ||
    text.includes("wudhu") ||
    text.includes("thaharah") ||
    text.includes("sholat") ||
    text.includes("hijrah") ||
    text.includes("alqur")
  ) {
    return {
      mediaUtama: [
        "Slide Presentasi Kaligrafi & Makna Ayat/Hadits (Digital)",
        "Video Animasi Kisah Keteladanan / Prosedur Ibadah (Digital)",
        "Flashcard Tajwid / Puzzle Potongan Ayat & Surah (Fisik)"
      ],
      alatBahanKonkret: [
        "Kit peraga mini (peta arah, kompas kiblat, lembaran Juz Amma)",
        "Buku jurnal hafalan & kartu setoran (tasmi') harian kelompok",
        "Spidol & sticky notes berwarna untuk menulis hikmah"
      ]
    };
  }

  // 2. Matematika / Berhitung
  if (
    normSubject.includes("matematika") || 
    normManual.includes("matematika") ||
    normSubject.includes("hitung") || 
    normManual.includes("hitung") ||
    text.includes("matematika") ||
    text.includes("hitung") ||
    text.includes("angka") ||
    text.includes("pecahan") ||
    text.includes("aljabar") ||
    text.includes("geometri")
  ) {
    return {
      mediaUtama: [
        "Aplikasi Interaktif 'GeoGebra' & 'Mathigon' (Digital)",
        "Slide Animasi Matematika Kreatif GuruPintar (Digital)",
        "Alat Peraga Blok Pecahan & Kartu Angka (Fisik)"
      ],
      alatBahanKonkret: [
        "Kertas origami berwarna cerah",
        "Gunting & lem kertas kelompok",
        "Spidol papan tulis warna & penggaris panjang"
      ]
    };
  }

  // 3. IPAS / IPA / Sains / Biologi / Fisika / Kimia
  if (
    normSubject.includes("ipas") ||
    normSubject.includes("ipa") ||
    normSubject.includes("biologi") ||
    normSubject.includes("fisika") ||
    normSubject.includes("kimia") ||
    normManual.includes("ipas") ||
    normManual.includes("ipa") ||
    normManual.includes("sains") ||
    normManual.includes("fotosintesis") ||
    text.includes("fotosintesis") ||
    text.includes("daun") ||
    text.includes("klorofil") ||
    text.includes("ekosistem") ||
    text.includes("sains") ||
    text.includes("biologi") ||
    text.includes("fisika") ||
    text.includes("kimia") ||
    text.includes("ipa") ||
    text.includes("ipas") ||
    text.includes("gravitasi") ||
    text.includes("mitosis") ||
    text.includes("sel") ||
    text.includes("newton") ||
    text.includes("energi")
  ) {
    return {
      mediaUtama: [
        "Video Ekosistem / Animasi 3D Proses Sains (Digital)",
        "Gambar Poster Siklus Hidup / Organ Tubuh HD (Fisik)",
        "Aplikasi Interaktif 'PhET Interactive Simulations' (Digital)"
      ],
      alatBahanKonkret: [
        "Gelas kimia transparan / botol kaca bekas wadah",
        "Helaian daun segar, air bersih, & pewarna makanan",
        "Senter saku, lup (kaca pembesar), & LKPD Eksperimen"
      ]
    };
  }

  // 4. Bahasa Indonesia / Inggris
  if (
    normSubject.includes("bahasa") ||
    normSubject.includes("inggris") ||
    normManual.includes("bahasa") ||
    normManual.includes("english") ||
    text.includes("bahasa") ||
    text.includes("paragraf") ||
    text.includes("kosakata") ||
    text.includes("kalimat efektif") ||
    text.includes("membaca teks")
  ) {
    return {
      mediaUtama: [
        "Flashcard Kosakata Bergambar Tema Terkait (Fisik)",
        "Video Animasi Cerita Pendek / Roleplay Interaktif (Digital)",
        "Audio Pembacaan Teks / Pronunciation Guide (Digital)"
      ],
      alatBahanKonkret: [
        "Papan flanel / papan tulis mini & sticky notes",
        "Kartu huruf / kata berpasangan untuk game",
        "Lembar Kerja Siswa (LKPD) mandiri & pulpen"
      ]
    };
  }

  // 5. IPS / Pancasila / Sejarah / Geografi / Ekonomi / PPKn
  if (
    normSubject.includes("pancasila") ||
    normSubject.includes("ppkn") ||
    normSubject.includes("sejarah") ||
    normSubject.includes("ips") ||
    normSubject.includes("sosiologi") ||
    normSubject.includes("geografi") ||
    normSubject.includes("ekonomi") ||
    normManual.includes("ekonomi") ||
    normManual.includes("ips") ||
    normManual.includes("sejarah") ||
    text.includes("sejarah") ||
    text.includes("ekonomi") ||
    text.includes("pancasila") ||
    text.includes("inflasi") ||
    text.includes("devisa") ||
    text.includes("negara") ||
    text.includes("karakter")
  ) {
    return {
      mediaUtama: [
        "Peta Dunia / Globe Fisik & Peta Tematik Regional (Fisik)",
        "Video Animasi Sejarah / Nilai Karakter Pancasila (Digital)",
        "Ensiklopedia Studi Kasus & Gambar Tokoh Sejarah (Fisik)"
      ],
      alatBahanKonkret: [
        "Kertas karton manila putih besar untuk mading",
        "Gunting karton & lem perekat kelompok",
        "Spidol warna-warni & kartu pos studi kasus"
      ]
    };
  }

  // 6. PJOK / Penjas / Olahraga / Kesehatan
  if (
    normSubject.includes("pjok") ||
    normSubject.includes("penjas") ||
    normSubject.includes("olahraga") ||
    normSubject.includes("kesehatan") ||
    normManual.includes("pjok") ||
    normManual.includes("penjas") ||
    normManual.includes("olahraga") ||
    text.includes("gerak") ||
    text.includes("senam") ||
    text.includes("otot") ||
    text.includes("jasmani")
  ) {
    return {
      mediaUtama: [
        "Video Instruksional Peragaan Gerak Dasar & Ketangkasan (Digital)",
        "Poster Bagan Struktur Anatomi / Otot Pemicu Gerak (Fisik)",
        "Aplikasi Pengukur Detak Jantung & Stopwatch Digital (Digital)"
      ],
      alatBahanKonkret: [
        "Corong penanda (cones), peluit, & meteran lapangan",
        "Matras senam / tali lompat skipping / bola pendukung",
        "Lembar ceklis ketercapaian gerak & hidrasi harian kelompok"
      ]
    };
  }

  // 7. Informatika / Komputer / TIK / Prakarya Rekayasa
  if (
    normSubject.includes("informatika") ||
    normSubject.includes("komputer") ||
    normSubject.includes("tik") ||
    normManual.includes("informatika") ||
    normManual.includes("komputer") ||
    text.includes("algoritma") ||
    text.includes("pemrograman") ||
    text.includes("scratch") ||
    text.includes("digital") ||
    text.includes("jaringan")
  ) {
    return {
      mediaUtama: [
        "Aplikasi Simulator Logika / Scratch Visual Programming (Digital)",
        "Slide Struktur Jaringan & Keamanan Data Informatika (Digital)",
        "Peta Alir (Flowchart) Logika Instruksi Algoritmik (Fisik)"
      ],
      alatBahanKonkret: [
        "Komputer / Laptop Lab sekolah / Gadget kolaboratif",
        "Peralatan mockup antarmuka: sticky notes & kertas plano",
        "Kartu biner / game logika berpikir komputasional unplugged"
      ]
    };
  }

  // 8. Seni / Prakarya / PKWU / Kerajinan
  if (
    normSubject.includes("seni") ||
    normSubject.includes("prakarya") ||
    normSubject.includes("pkwu") ||
    text.includes("seni rupa") ||
    text.includes("kriya") ||
    text.includes("menggambar")
  ) {
    return {
      mediaUtama: [
        "Video Tutorial Langkah Pembuatan Karya Kriya (Digital)",
        "Contoh Produk Karya Jadi Hasil Kreativitas (Fisik)",
        "Slide Inspirasi Palet Warna & Desain Seni (Digital)"
      ],
      alatBahanKonkret: [
        "Bahan utama berkarya (kertas krep, tanah liat/clay, botol plastik)",
        "Peralatan mewarnai (cat air, krayon, kuas)",
        "Gunting, lem serbaguna, & alas koran/plastik meja"
      ]
    };
  }

  // 9. Adaptive Fallback for any other subjects (Tata Busana, Bahasa Daerah, Geologi, etc.)
  return {
    mediaUtama: [
      `Video Pembelajaran Visual & Simulasi Interaktif ${getCleanSubjectName()} (Digital)`,
      `Poster Diagram Infografis Alur Inti tentang ${getCleanSubjectName()} (Fisik)`,
      "Slide Presentasi Kreatif GuruPintar Kurikulum Merdeka (Digital)"
    ],
    alatBahanKonkret: [
      "Kertas plano / karton manila untuk pameran hasil galeri ajar",
      "Spidol warna-warni berujung tebal & lem perekat kuat",
      `Lembar Kerja Siswa (LKPD) kelompok studi ${getCleanSubjectName()}`
    ]
  };
};

export const getInfographicPrompt = (subject: string, manualSubject: string, materialText: string): string => {
  const normSubject = (subject || "").toLowerCase();
  const normManual = (manualSubject || "").toLowerCase();
  const text = (materialText || "").toLowerCase();

  // Deteksi apakah mapel Islam/agama
  const isIslamic =
    normSubject.includes("islam") || normSubject.includes("agama") ||
    normSubject.includes("tahfidz") || normSubject.includes("tahsin") ||
    normSubject.includes("fiqih") || normSubject.includes("akidah") ||
    normSubject.includes("akhlak") || normSubject.includes("btq") ||
    normSubject.includes("pai") || normSubject.includes("alqur") ||
    normManual.includes("islam") || normManual.includes("agama") ||
    normManual.includes("tahfidz") || normManual.includes("fiqih") ||
    normManual.includes("btq") || normManual.includes("pai") ||
    text.includes("allah") || text.includes("rasulullah") ||
    text.includes("nabi") || text.includes("alquran") ||
    text.includes("sholat") || text.includes("wudhu") ||
    text.includes("tajwid") || text.includes("hijrah") ||
    text.includes("makkah") || text.includes("madinah");

  // Ambil topik utama dari materi
  let topic = "educational learning concept";
  if (materialText?.trim()) {
    const sentences = materialText.split(/[.!?\n]/).filter(s => s.trim().length > 3);
    const firstSentence = sentences[0] || materialText;
    topic = firstSentence.split(/\s+/).slice(0, 7).join(" ").replace(/[,;:.]$/, "");
  }

  // Daftar game viral untuk karakter (dipilih acak)
  const gameStyles = [
    "Roblox blocky cartoon characters",
    "Mobile Legends Bang Bang cartoon hero characters",
    "Free Fire (Garena) cartoon squad characters",
    "Minecraft blocky pixel art characters",
    "Among Us cartoon crewmate characters",
    "Genshin Impact cartoon anime characters",
  ];
  const randomGame = gameStyles[Math.floor(Math.random() * gameStyles.length)];

  // Bangun prompt sesuai konteks
  if (isIslamic) {
    return `High-quality educational infographic illustration in clean cartoon style, depicting '${topic}', featuring friendly Muslim student characters: girls wearing proper hijab covering their aurat (headscarf, long sleeves, modest clothing), boys wearing Islamic cap (peci) and long-sleeved shirts, all wearing cheerful school expressions, respectful and clean visual style with no inappropriate elements, background adorned with beautiful minimal Islamic geometric patterns and soft pastel mosque silhouette, educational diagram with clear Indonesian labels and numbered steps, vibrant colors, professional layout suitable for school classroom wall poster, child-friendly`;
  }

  // Mapel sains
  if (normSubject.includes("ipa") || normSubject.includes("ipas") ||
      normSubject.includes("biologi") || normSubject.includes("fisika") ||
      normSubject.includes("kimia") || normManual.includes("sains")) {
    return `Vibrant 3D educational science infographic, cartoon style inspired by ${randomGame} aesthetic, depicting '${topic}', student characters wearing mini lab coats exploring with magnifying glasses, bright laboratory backdrop with floating molecules and atom diagrams, clean Indonesian educational labels with arrows and numbered steps, high-detail, school-safe, child-friendly, poster quality`;
  }

  // Matematika
  if (normSubject.includes("matematika") || normManual.includes("matematika")) {
    return `Fun colorful math educational infographic, cartoon style inspired by ${randomGame} aesthetic, depicting '${topic}', cute student characters playing with giant 3D numbers and geometric shapes, isometric grid background with floating math operators (+, -, ×, ÷), clean Indonesian labels, step-by-step problem breakdown, bright cheerful colors, child-friendly, school-safe poster quality`;
  }

  // IPS / Sejarah / Geografi
  if (normSubject.includes("ips") || normSubject.includes("sejarah") ||
      normSubject.includes("geografi") || normManual.includes("sejarah")) {
    return `Beautiful educational history and social studies infographic, cartoon style inspired by ${randomGame} aesthetic, depicting '${topic}', curious explorer student characters with backpacks and notebooks, colorful illustrated map background with timeline elements, Indonesian educational labels, warm vintage color palette mixed with modern cartoon style, child-friendly, school-safe, poster quality`;
  }

  // PJOK
  if (normSubject.includes("pjok") || normSubject.includes("penjas") ||
      normSubject.includes("olahraga")) {
    return `Dynamic sports educational infographic, energetic cartoon style inspired by ${randomGame} aesthetic, depicting '${topic}', active student characters in school sports uniform demonstrating movement steps, outdoor stadium background with motion lines, bold Indonesian labels with numbered movement sequence, bright energetic colors, child-friendly, school-safe, poster quality`;
  }

  // Bahasa Indonesia / Inggris
  if (normSubject.includes("bahasa") || normManual.includes("bahasa")) {
    return `Creative language learning educational infographic, colorful cartoon style inspired by ${randomGame} aesthetic, depicting '${topic}', student characters reading giant floating books and speech bubbles, library and classroom background, Indonesian educational labels with grammar structure diagrams, pastel color scheme, child-friendly, school-safe, poster quality`;
  }

  // Default — semua mapel lainnya
  return `High-quality educational infographic illustration, vibrant cartoon style inspired by ${randomGame} aesthetic but school-appropriate, depicting '${topic}', cheerful Indonesian student characters in school uniform exploring and learning, colorful educational classroom background, clear Indonesian labels with arrows and steps, bright colors, detailed, child-friendly, school-safe, suitable for classroom wall poster`;
};

interface MediaBelajarViewProps {
  youtubeSaran: SaranYoutubeSpesifik;
  slides?: PptInteractiveVisualSlide[];
  subject: string;
  classLevel: string;
  showToast: (msg: string) => void;
  profileName?: string;
  profileSchool?: string;
  manualSubject?: string;
  materialText?: string;
}

export const MediaBelajarView: React.FC<MediaBelajarViewProps> = ({
  youtubeSaran,
  slides = [],
  subject,
  classLevel,
  showToast,
  profileName = "",
  profileSchool = "",
  manualSubject = "",
  materialText = "",
}) => {
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  const displaySubject = subject === "Input Mapel Manual (Ketik Sendiri)" && manualSubject ? manualSubject : subject;
  const author = profileName ? `${profileName} (${profileSchool || "GuruPintar AI"})` : "GuruPintar AI";
  const promptInfografis = getInfographicPrompt(subject, manualSubject, materialText);

  const getCanvaAIText = (): string => {
    // Jika sudah ada slide dari AI generate, tampilkan slide itu
    if (slides && slides.length >= 10) {
      let result = "";
      slides.forEach((slide) => {
        result += `[Slide ${slide.slide_nomor}: ${slide.judul_halaman}]\n`;
        (slide.isi_poin_materi || []).forEach((p: string) => {
          result += p.trim().startsWith("•") || p.trim().startsWith("-") ? `${p}\n` : `• ${p}\n`;
        });
        if (slide.image_generation_prompt) {
          result += `🎨 Visual: ${slide.image_generation_prompt}\n`;
        }
        result += "\n";
      });
      return result;
    }

    // Template default minimal 12 slide, mendalam dan terhubung ke materi aktif
    const topikUtama = materialText?.trim()
      ? materialText.split(/[.!\n]/)[0].trim().slice(0, 60)
      : displaySubject;

    const isAgama = (subject || "").toLowerCase().includes("agama") ||
      (subject || "").toLowerCase().includes("pai") ||
      (manualSubject || "").toLowerCase().includes("agama") ||
      (materialText || "").toLowerCase().includes("allah") ||
      (materialText || "").toLowerCase().includes("sholat");

    const openingVerse = isAgama
      ? `• بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم\n• "Dan Kami turunkan dari Al-Qur'an sesuatu yang menjadi penawar dan rahmat bagi orang-orang yang beriman." (QS. Al-Isra: 82)`
      : `• "Ilmu adalah cahaya yang menerangi jalan kehidupan." — Pepatah\n• "Pendidikan bukan persiapan untuk hidup; pendidikan adalah hidup itu sendiri." — John Dewey`;

    return `[Slide 1: Halaman Judul]
• ${topikUtama.toUpperCase()}
• Mata Pelajaran: ${displaySubject} | ${classLevel}
• Disusun oleh: ${author}
${isAgama ? "• بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم" : ""}

[Slide 2: Pembuka & Motivasi Belajar]
${openingVerse}
• Tujuan Pembelajaran: Memahami konsep ${topikUtama} secara mendalam dan bermakna
• Manfaat: Mengapa materi ini penting dalam kehidupan sehari-hari?

[Slide 3: Pertanyaan Pemantik]
• ❓ Pernahkah kalian melihat atau merasakan ${topikUtama} dalam kehidupan sehari-hari?
• ❓ Apa yang kalian ketahui tentang topik ini sebelumnya?
• ❓ Bagaimana hubungan ${topikUtama} dengan hal-hal di sekitar kalian?
• 💭 Tuliskan jawabanmu di sticky note — kita akan bahas bersama!

[Slide 4: Konsep Dasar & Pengertian]
• 📖 Definisi: Penjelasan konsep utama ${topikUtama} menurut para ahli
• 🔑 Kata kunci yang wajib dipahami: [3-5 istilah penting]
• 📊 Diagram/bagan konsep dasar
• ✍️ Catatan: Salin definisi ke buku catatanmu!

[Slide 5: Bagian Inti A — Komponen / Jenis / Klasifikasi]
• 🗂️ Pengelompokan utama dalam ${topikUtama}
• Kelompok 1: [nama + penjelasan singkat]
• Kelompok 2: [nama + penjelasan singkat]
• Kelompok 3: [nama + penjelasan singkat]
• 🖼️ Gambar / diagram ilustrasi pendukung

[Slide 6: Bagian Inti B — Proses / Cara Kerja / Langkah-langkah]
• ⚙️ Bagaimana ${topikUtama} bekerja / terjadi / dilakukan?
• Langkah 1 → Langkah 2 → Langkah 3 → Langkah 4
• 🔄 Diagram alur proses (flowchart)
• ⚠️ Hal penting yang perlu diperhatikan

[Slide 7: Bagian Inti C — Hubungan & Pengaruh]
• 🔗 Keterkaitan ${topikUtama} dengan konsep lain yang sudah dipelajari
• Sebab → Akibat dalam ${topikUtama}
• 📈 Dampak positif | 📉 Dampak negatif (jika ada)
• 🌍 Contoh nyata di lingkungan sekitar kita

[Slide 8: Pendalaman — Studi Kasus / Contoh Konkret]
• 📋 Contoh Kasus 1: [deskripsi situasi nyata]
• 📋 Contoh Kasus 2: [deskripsi konteks berbeda]
• 🔍 Analisis: Apa yang bisa kita pelajari dari contoh ini?
• 💡 Hubungkan dengan pengalaman hidupmu sendiri!

[Slide 9: Kegiatan Kelompok — Eksplorasi Bersama]
• 👥 Bentuk kelompok 4-5 orang
• 📌 Tugas Kelompok: Diskusikan dan buat bagan/peta konsep ${topikUtama}
• 🎯 Pertanyaan diskusi:
  1. Apa bagian yang paling menarik dari ${topikUtama}?
  2. Bagaimana penerapannya dalam kehidupan sehari-hari?
  3. Apa pertanyaan yang masih belum terjawab?
• ⏱️ Waktu: 15 menit — siapkan presentasi singkat!

[Slide 10: Presentasi Hasil Kelompok]
• 🎤 Setiap kelompok memaparkan temuan selama 3 menit
• 👂 Kelompok lain menyimak dan menyiapkan 1 pertanyaan
• 📝 Guru mencatat poin-poin penting di papan tulis
• ⭐ Apresiasi: "Semua jawaban adalah proses belajar yang berharga!"

[Slide 11: Kuis Interaktif — Cek Pemahaman]
• 🎯 Soal 1: [pertanyaan pilihan ganda tentang ${topikUtama}]
• 🎯 Soal 2: [pertanyaan tentang proses/langkah]
• 🎯 Soal 3: [soal aplikasi kehidupan nyata]
• 🏆 Siapa yang bisa menjawab semua dengan benar?

[Slide 12: Kesimpulan & Refleksi Belajar]
• 📌 Rangkuman: 3 poin utama yang dipelajari hari ini
  1. [poin 1 tentang ${topikUtama}]
  2. [poin 2 — proses/cara kerja]
  3. [poin 3 — penerapan nyata]
• 💭 Refleksi: Apa 1 hal baru yang kamu pelajari hari ini?
• 📚 Tugas Rumah: Cari 1 contoh ${topikUtama} di sekitar rumahmu — foto/gambar dan ceritakan besok!
• 🙏 ${isAgama ? "الحَمْدُ لِلَّهِ — Alhamdulillah, semoga ilmu ini bermanfaat dunia dan akhirat!" : "Terima kasih sudah belajar dengan semangat hari ini! 🌟"}
`;
  };

  // Combine input texts with the actual generated YouTube keyword and slide titles to guarantee 
  // that the suggestions list always adapts to newly generated or loaded RPP materials.
  const activeSubject = subject || "";
  const activeManual = manualSubject || "";
  const activeText = `${materialText || ""} ${youtubeSaran?.keyword_pencarian_utama || ""} ${slides?.map(s => s.judul_halaman).join(" ") || ""}`;

  const mediaPeraga = getMediaAlatPeraga(activeSubject, activeManual, activeText);

  return (
    <div className="space-y-10 md:space-y-12">
      
      {/* SECTION 1: DAFTAR MEDIA & ALAT PERAGA INTI */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 select-none border-b border-slate-100 pb-3">
          <Wrench className="w-5 h-5 text-indigo-600" />
          <h4 className="text-sm font-extrabold text-[#0D1D34] font-display uppercase tracking-wide">
            Daftar Media &amp; Alat Peraga Inti RPP
          </h4>
        </div>

        <div className="text-[11.5px] leading-relaxed text-slate-700">
          Untuk mewujudkan pembelajaran bermakna (meaningful learning) di era Kurikulum Merdeka, berikut adalah klasifikasi media ajar dan peranti fisik nyata untuk memandu jalannya kolaborasi kelompok siswa di kelas:
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2.5">
            <span className="text-[10px] text-indigo-800 font-extrabold block uppercase tracking-wide font-mono">
              📢 Media Utama (Fisik / Digital):
            </span>
            <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-800 font-medium font-sans">
              {mediaPeraga.mediaUtama.map((m, i) => (
                <li key={i} className="leading-relaxed">{m}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2.5">
            <span className="text-[10px] text-emerald-800 font-extrabold block uppercase tracking-wide font-mono">
              🛠️ Alat &amp; Bahan Kelas Konkret (Kegiatan Kelompok):
            </span>
            <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-800 font-medium font-sans">
              {mediaPeraga.alatBahanKonkret.map((ab, i) => (
                <li key={i} className="leading-relaxed">{ab}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* SECTION 1.5: PROMPT INFOGRAFIS KELAS KREATIF */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-2 select-none">
            <Image className="w-5 h-5 text-pink-600" />
            <div>
              <h4 className="text-sm font-extrabold text-[#0D1D34] font-display uppercase tracking-wide">
                🎨 Prompt Desain Infografis Visual (Clay Style)
              </h4>
              <p className="text-[11px] text-slate-500 font-medium font-sans">
                Gunakan prompt AI khusus ini untuk menggambar infografis visual pembelajaran yang memukau
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(promptInfografis);
              showToast("📋 Berhasil menyalin prompt gambar infografis!");
              setCopiedPrompt(true);
              setTimeout(() => setCopiedPrompt(false), 2500);
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl py-2 px-3.5 shadow-xs text-xs font-black transition-all cursor-pointer border-0 active:scale-95 text-center justify-center"
          >
            {copiedPrompt ? (
              <>
                <Check className="w-3.5 h-3.5 text-white animate-bounce" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-white" />
                <span>Salin Prompt Gambar</span>
              </>
            )}
          </button>
        </div>

        <div className="text-[11.5px] leading-relaxed text-slate-700">
          Ubah materi ajar abstrak menjadi gambar cetak visual bergaya animasi kartun terkenal atau game populer (seperti Mobile Legends, Free Fire, dan PUBG) guna memacu imajinasi anak dalam kelas. Salin formula prompt otomatis yang disesuaikan secara dinamis dengan tema aktif Anda ke dalam pembuat gambar AI.
        </div>

        <div className="bg-rose-50/45 border border-rose-100 p-4 rounded-xl space-y-2">
          <span className="text-[10px] text-rose-800 font-extrabold block uppercase tracking-wide font-mono">
            Prompt Generator Gambar (Bahasa Inggris Otomatis):
          </span>
          <p className="text-xs text-slate-850 font-semibold font-mono bg-white p-3 rounded-lg border border-rose-100 select-all leading-relaxed shadow-3xs">
            "{promptInfografis}"
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10.5px] leading-relaxed font-sans text-slate-600 space-y-1">
          <div className="font-extrabold text-[#0D1D34]">💡 Cara Penggunaan Pintar di Kelas:</div>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Salin prompt di atas, lalu buka AI Generator favorit Anda seperti <strong>ChatGPT Plus (DALL-E 3)</strong>, <strong>Google Gemini Advanced / Gemini Apps</strong>, atau <strong>Bing Image Creator / Canva AI</strong>.</li>
            <li>Tempelkan (paste) prompt untuk memproses ilustrasi 3D berkualitas tinggi yang imut, kaya detail, dan berlabel pendidikan sesuai topik ajar.</li>
            <li>Unduh hasilnya, lalu cetak sebagai poster dinding kelas, tempel di LKPD sebagai diagram panduan, atau sisipkan ke dalam materi presentasi canva Anda!</li>
          </ol>
        </div>
      </div>

      {/* SECTION 2: REKOMENDASI VIDEO UTAMA */}
      <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-xs space-y-4">
        <div className="flex items-center gap-2 select-none border-b border-slate-50 pb-2">
          <Video className="w-4 h-4 text-rose-600" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Rekomendasi Video Pembelajaran
          </h4>
        </div>

        <p className="text-slate-500 text-xs font-medium leading-relaxed">
          Cari materi audio-visual pendukung pembelajaran secara interaktif di YouTube:
        </p>

        <div className="p-4 bg-rose-50/50 border border-rose-100/50 rounded-xl space-y-2 select-none">
          <span className="text-[10px] text-rose-700 font-bold block uppercase tracking-wide">Kata Kunci Hasil Penyusunan:</span>
          <strong className="text-slate-800 text-sm block">"{youtubeSaran.keyword_pencarian_utama}"</strong>
          
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeSaran.keyword_pencarian_utama)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition mt-2 shadow-xs cursor-pointer"
          >
            Cari Video Animasi di Youtube →
          </a>
        </div>
      </div>

      {/* SECTION 3: BAHAN SLIDE PRESENTASI CANVA AI */}
      <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-50 pb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Presentation className="w-4 h-4 text-orange-500" />
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Slide Presentasi Canva AI
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Penyusunan halaman presentasi otomatis untuk Canva atau Gamma
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(getCanvaAIText());
              showToast("📋 Berhasil menyalin seluruh bahan draf teks slide Canva AI!");
              setCopiedAll(true);
              setTimeout(() => setCopiedAll(false), 2500);
            }}
            className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg py-1.5 px-3 shadow-xs text-xs font-bold transition-all cursor-pointer border-0 active:scale-95"
          >
            {copiedAll ? (
              <>
                <Check className="w-3 h-3 text-white animate-bounce" />
                Tersalin!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-white" />
                Salin Bahan Slide
              </>
            )}
          </button>
        </div>

        <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl space-y-2">
          <span className="text-xs font-bold text-orange-900 flex items-center gap-1.5 uppercase tracking-wide select-none">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            Konsep Slide Pembelajaran
          </span>

          <p className="text-[11px] leading-relaxed text-slate-600">
            Salin draf di bawah ini ke pembuat presentasi pihak ketiga (misal Gamma.app atau Canva Magic Design) untuk hasil instan:
          </p>

          <pre className="text-xs text-slate-700 bg-white p-4 rounded-xl max-h-60 overflow-y-auto font-sans leading-relaxed select-all whitespace-pre-wrap border border-slate-100 shadow-inner font-medium">
            {getCanvaAIText()}
          </pre>
        </div>

        {/* SECTION 4: TUTORIAL PREMIUM */}
        <div className="bg-slate-900 border border-slate-950 p-5 rounded-xl space-y-3 text-white shadow-xs">
          <h5 className="text-xs font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-white/10 pb-2">
            <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
            📖 TUTORIAL PREMIUM: MEMBUAT SLIDE CANTIK DI CANVA / GAMMA DALAM 60 DETIK
          </h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[11px] leading-relaxed">
            {/* Langkah Canva */}
            <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="font-extrabold text-amber-300 uppercase text-[10.5px] tracking-wide block flex items-center gap-1">
                ✨ Metode 1: Menggunakan Canva AI
              </span>
              <ul className="list-none space-y-2 text-slate-300">
                <li>
                  - <strong className="text-white">Langkah 1:</strong> Masuk ke Canva, lihat sidebar sebelah kiri bawah dan cari tulisan <strong className="text-amber-400">"Canva AI"</strong>.
                </li>
                <li>
                  - <strong className="text-white">Langkah 2:</strong> Setelah masuk ke room Canva AI, klik <strong className="text-amber-400">"Design"</strong> lalu pilih <strong className="text-amber-400">"Presentation"</strong>.
                </li>
                <li>
                  - <strong className="text-white">Langkah 3:</strong> Paste (tempel) draf materi slide yang didapat dari aplikasi <strong className="text-amber-300">GURU.AI</strong>, setelah itu klik <strong className="text-[#FF6B35]">"Generate"</strong> dan tunggu sampai selesai.
                </li>
              </ul>
            </div>

            {/* Langkah Gamma */}
            <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="font-extrabold text-[#95A5FF] uppercase text-[10.5px] tracking-wide block flex items-center gap-1">
                🔮 Metode 2: Menggunakan Gamma.app atau PowerPoint
              </span>
              <ul className="list-disc list-inside space-y-2 text-slate-300">
                <li>
                  <strong className="text-white">Gamma.app / Tome.app:</strong> Buka Gamma, pilih opsi <strong className="text-white font-bold font-sans">"Create New from Text/Outline"</strong>. Tempelkan teks slide terstruktur kami, lalu saksikan AI menggambar dan menata slide multimedia secara otomatis!
                </li>
                <li>
                  <strong className="text-white">Microsoft PowerPoint:</strong> Buka PowerPoint, tempelkan teks ke lembar presentasi kosong atau ke asistem desainer PowerPoint Anda untuk mendelegasikan penyusunan halaman secara cepat.
                </li>
                <li>
                  <strong className="text-amber-400">Vibes Positif &amp; Profesional:</strong> Seluruh output presentasi ini memiliki keselarasan mutlak dengan rancangan RPP agar guru tetap tampil kredibel, modern, dan percaya diri di hadapan siswa.
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-2 text-center text-slate-400 text-[10px] border-t border-white/5 tracking-wider font-sans uppercase font-bold flex items-center justify-center gap-1 select-none">
            🌟 GuruPintar AI - Menemani Guru Indonesia Menuju Pendidikan Berkemajuan 🌟
          </div>
        </div>
      </div>

    </div>
  );
};
