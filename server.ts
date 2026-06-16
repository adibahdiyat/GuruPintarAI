import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

// Secure helper to clean JSON string from any markdown wrappers prior to parsing
function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}


// Helper function to query Gemini with retry options and fallback models in case of high demand (503 / 429 / UNAVAILABLE)
async function generateContentWithRetryAndFallback(
  ai: InstanceType<typeof GoogleGenAI>,
  params: any,
  maxRetries = 3
): Promise<any> {
  // Gunakan rangkaian model terbaru dari @google/genai yang valid dan didukung penuh saat ini (menghindari model yang didepresiasi)
  const models = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
  ];
  let lastError: any = null;

  for (const modelName of models) {
    let delay = 1000;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Gemini API] Requesting ${modelName} (attempt ${attempt}/${maxRetries})...`);
        const response = await ai.models.generateContent({
          ...params,
          model: modelName,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errStr = String(err).toLowerCase();
        const errStatus = (err.status || "").toString();
        const errMsg = (err.message || "").toLowerCase();
        const combinedMsg = `${errStr} | status: ${errStatus} | msg: ${errMsg}`;
        
        console.warn(`[Gemini Error] Model: ${modelName}, Attempt: ${attempt}, Error: ${combinedMsg}`);

        // If it is a permanent client configuration error, throw instantly
        if (
          combinedMsg.includes("400") || 
          combinedMsg.includes("bad request") || 
          combinedMsg.includes("invalid argument") || 
          combinedMsg.includes("unauthorized") || 
          combinedMsg.includes("apikey") || 
          combinedMsg.includes("403")
        ) {
          throw err;
        }

        // If it is a 503 (Unavailable), 429 (Rate Limit), or "high demand" transient server issue, 
        // immediately fall back to the next model in the list to avoid delaying the user.
        if (
          combinedMsg.includes("503") || 
          combinedMsg.includes("unavailable") || 
          combinedMsg.includes("high demand") || 
          combinedMsg.includes("overloaded") ||
          combinedMsg.includes("429") || 
          combinedMsg.includes("rate limit")
        ) {
          console.warn(`[Gemini API] Model ${modelName} is currently overloaded or unavailable. Switching to the next fallback model immediately.`);
          break; // Exit the attempt loop for this model and proceed to the next modelName in the range
        }

        // Wait with randomized exponential backoff (jitter) before retrying this model
        if (attempt < maxRetries) {
          const jitter = Math.floor(Math.random() * 1000) + 200; // 200-1200ms randomized jitter
          const totalDelay = delay + jitter;
          console.log(`[Gemini Retry] Transient error on ${modelName}. Retrying in ${totalDelay}ms (with jitter)...`);
          await new Promise((resolve) => setTimeout(resolve, totalDelay));
          delay *= 1.8; // exponential backoff factor
        }
      }
    }
  }

  if (lastError) {
    const errorMsg = String(lastError.message || lastError).toLowerCase();
    if (
      errorMsg.includes("503") || 
      errorMsg.includes("unavailable") || 
      errorMsg.includes("high demand") || 
      errorMsg.includes("rate limit") || 
      errorMsg.includes("429")
    ) {
      throw new Error(
        "Layanan AI saat ini sedang sangat padat (Error 503/429: High Demand). Kami telah mencoba 4 model fallback (" +
        models.join(", ") +
        ") dengan total 12 percobaan, namun sistem sedang sibuk. Silakan coba klik tombol generate kembali beberapa saat lagi, atau masukkan API Key pribadi Anda di menu profil untuk prioritas akses tanpa batas."
      );
    }
  }

  throw lastError;
}

const app = express();
const PORT = 3000;

// Utilize standard body parser with a large payload limit to support textbook images
app.use(express.json({ limit: "50mb" }));

export { app };
export default app;

  app.get("/api/health", (req, res) => {
    const hasKey = !!process.env.GEMINI_API_KEY;
    res.json({ 
      ok: true, 
      apiKeyConfigured: hasKey,
      message: hasKey ? "API Key terkonfigurasi." : "GEMINI_API_KEY belum diset di environment."
    });
  });

  // API Endpoint to generate RPP & PPT slides based on teacher input
  app.post("/api/generate", async (req, res) => {
    try {
      const apiKey = (req.headers["x-user-api-key"] as string) || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "API Key belum dikonfigurasi. Silakan masukkan API Key Gemini Anda di halaman Akun, atau hubungi admin sekolah."
        });
      }

      const { text, images, classLevel, subject, p5Theme, metode } = req.body;
      if (!text && (!images || images.length === 0)) {
        return res.status(400).json({
          error: "Silakan masukkan teks materi atau unggah foto halaman buku pelajaran."
        });
      }

      // Initialize GoogleGenAI client
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      // Assemble content parts for multimodal input
      const parts: any[] = [];

      // Add page images
      if (images && Array.isArray(images)) {
        for (const img of images) {
          if (img.data && img.mimeType) {
            const base64Data = img.data.replace(/^data:[a-zA-Z0-9+\/.-]+;base64,/i, "");
            parts.push({
              inlineData: {
                mimeType: img.mimeType,
                data: base64Data
              }
            });
          }
        }
      }

      const targetLevel = classLevel || "Umum";
      const targetSubject = subject ? `Mata Pelajaran: ${subject}` : "Mata Pelajaran: Umum";
      const targetMetode = metode || "Cooperative Learning";
      const p5Context = p5Theme ? `Gaya Pembelajaran: Proyek Penguatan Profil Pelajar Pancasila (P5) - Tema: ${p5Theme}` : "";

       // Build structured teacher-designed prompt
      const promptString = `
        Tugas: Ekstrak, ringkas, dan ubah materi pelajaran/topik input berikut menjadi ekosistem administrasi kelas lengkap Kurikulum Merdeka 2026 siap pakai yang sangat detail, panjang, padat informasi, rincian langkah-langkah, dan deskripsi visual konkrit untuk materi mengajar.

        Detail TARGET:
        - Tingkat Kelas/Siswa: ${targetLevel}
        - ${targetSubject}
        - Model/Metode Pembelajaran yang WAJIB digunakan: ${targetMetode}
        ${p5Context ? `- Konteks P5: ${p5Context}` : ""}

        Materi Input Guru / Konten Buku Teks:
        ${text || "(Materi bersumber dari gambar/foto halaman buku pelajaran yang terlampir)"}

        ${p5Theme ? `PENTING: Karena ini adalah "Modul Proyek P5" bertema "${p5Theme}", seluruh struktur dokumen, langkah pembelajaran, LKPD, dan paket Asesmen WAJIB disesuaikan ke format "Modul Proyek P5". Di bagian akhir / paket Asesmen, Anda WAJIB melampirkan secara utuh dan detail:
        1. "Lembar Refleksi Siswa P5" (yang berisi sekurang-kurangnya 3 pertanyaan refleksi diri siswa selama proyek berlangsung).
        2. "Rubrik Penilaian Karakter P5" dengan 4 tingkat pencapaian standard Kurikulum Merdeka secara lengkap dan deskriptif: Belum Berkembang (BB), Mulai Berkembang (MB), Berkembang Sesuai Harapan (BSH), dan Sangat Berkembang (SB) untuk setiap karakter profil pelajar Pancasila yang disasar.` : ""}

        Instruksi Tambahan & Ketentuan Penting Wajib Diikuti (SANGAT KETAT / NO SHORTCUTS):
        1. MODUL AJAR (RPP) FORMAT RESMI KURIKULUM MERDEKA: Susun dokumen dengan struktur berikut PERSIS:

INFORMASI UMUM:
A. IDENTITAS SEKOLAH (nama guru, instansi, tahun, jenjang, mapel, kelas, elemen, bab/topik, alokasi waktu)
B. KOMPETENSI AWAL (pengetahuan prasyarat siswa)
C. PROFIL PELAJAR PANCASILA (karakter yang dikembangkan: Beriman, Mandiri, Bernalar Kritis, Gotong Royong, Kreatif)
D. SARANA DAN PRASARANA (media, alat/bahan, sumber belajar)
E. TARGET PESERTA DIDIK (deskripsi peserta didik)
F. MODEL PEMBELAJARAN YANG DIGUNAKAN: wajib menggunakan ${targetMetode} — tulis Pendekatan, Model pembelajaran, Langkah-langkah model, dan Metode pendukung

KOMPONEN INTI:
A. CAPAIAN PEMBELAJARAN
B. TUJUAN PEMBELAJARAN (minimal 3 tujuan terukur)
C. PEMAHAMAN BERMAKNA (apa yang dipahami siswa setelah belajar)
D. PERTANYAAN PEMANTIK (3-5 pertanyaan membuka rasa ingin tahu)
E. KEGIATAN PEMBELAJARAN:
   - Kegiatan Pendahuluan (10-15 menit): salam, doa, absensi, apersepsi, pertanyaan pemantik, menyampaikan tujuan
   - Kegiatan Inti (45-55 menit): WAJIB mengikuti tahapan ${targetMetode} secara detail per tahap, dengan nama tahap yang sesuai model, aktivitas siswa dan guru yang konkret dan sesuai model/metode pembelajaran ${targetMetode} — sesuaikan seluruh tahapan langkah kegiatan inti, pendekatan kelompok, dan instruksi guru agar mencerminkan karakteristik ${targetMetode} secara autentik dan lengkap
   - Kegiatan Penutup (5-10 menit): simpulan bersama, refleksi, evaluasi, tindak lanjut, doa

ASESMEN/PENILAIAN:
- Asesmen Diagnostik
- Asesmen Formatif  
- Asesmen Sumatif

PENGAYAAN DAN REMEDIAL

REFLEKSI:
- Refleksi Peserta Didik (tabel ceklis sudah mampu/belum mampu)
- Refleksi Guru (pertanyaan evaluasi diri guru)
        2. LKPD FORMAT RESMI SEKOLAH: Buat dengan struktur: header identitas (Hari/Tanggal, Nama Siswa, Kelas, Kelompok), Tujuan Kegiatan, Alat dan Bahan, Langkah-langkah Kerja (numbered list), Tabel Pengamatan/Data (dengan kolom No/Aspek/Hasil/Keterangan), Pertanyaan Diskusi (3-5 soal analisis), Kesimpulan (kolom kosong untuk diisi siswa). JANGAN gunakan format esai panjang — gunakan tabel dan daftar bernomor.
        3. PAKET ASESMEN LENGKAP: Buat (a) Tabel Asesmen Diagnostik dengan kolom Kemampuan Awal/Cakap/Berkembang/Butuh Pendamping, (b) Soal Pilihan Ganda minimal 10 butir dengan kunci dan pembahasan, (c) Rubrik Penilaian Sikap dengan aspek Keaktifan/Kerja Sama/Tanggung Jawab skala 1-4, (d) Rubrik Penilaian Performa/Presentasi, (e) Lembar rekap nilai siswa kosong.
        4. JANGAN GUNAKAN PLACEHOLDER: Dilarang keras menggunakan tanda "... ", "[tulis di sini]", "dst", atau singkatan lainnya. Semua dokumen pembelajaran, langkah RPP, LKPD, dan penilaian harus fully written, lengkap, komprehensif, dan siap cetak/unduh tanpa ada draf kasar atau komponen yang belum selesai.
        5. ICE BREAKING SEPARATION: Jangan masukkan materi ice breaking ke dalam RPP. Pisahkan ke dalam objek JSON mandiri "kolom_ice_breaking_mandiri" untuk ditaruh di kolom khusus luar RPP.
        6. PROMPT INFOGRAFIS & IMAGE PROMPT SLIDE: Sesuaikan gaya, karakter, dan elemen visual dengan jenis topik materi pembelajaran.
           - JIKA TOPIKNYA BERKAITAN DENGAN AGAMA ISLAM ATAU ISLAMI: Wajib mengandung unsur Islami (seperti masjid indah minimalis, ornamen geometris Islam, atau dekorasi bintang/bulan sabit) dan karakter manusia di dalamnya HARUS menutup aurat secara syar'i (siswi/guru wanita harus berpakaian sopan longgar lengkap dengan jilbab/hijab/kerudung rapi penutup kepala dan lengan panjang; siswa/guru pria harus memakai busana muslim rapi berlengan panjang/celana panjang sopan). Contoh format prompt: "3D cute illustration, clay style, vivid color, highly detailed, soft lighting depicting friendly Muslim student characters wearing modest Islamic clothing (elegant hijab/headscarf for girls, long sleeves, long trousers), clean visual style with serene pastel background, minimal Islamic geometric vector art patterns".
           - JIKA TOPIKNYA IPA / SAINS / BIOLOGI: Gunakan karakter siswa/ilmuwan berjas laboratorium bersih, memegang gelas ukur atau mikroskop, berlatar belakang diagram atom, rantai dna, sel, tumbuhan hidup, atau bintang planet tata surya.
           - JIKA TOPIKNYA IPS / SEJARAH: Gunakan latar belakang bernuansa penjelajahan, peta navigasi antik, bola dunia 3D, astrolabe, kompas perunggu, atau garis lini masa sejarah yang estetik.
           - JIKA TOPIKNYA MATEMATIKA: Gunakan ilustrasi bertema ornamen persamaan angka mengapung, bangun ruang geometris seperti kubus/prisma transparan berwarna murni, penggaris, jangka sekolah kelir pastel.
           - TOPIK LAINNYA: Sesuaikan profesi, pakaian seragam, dan ornamen dekorasi latar belakang gambar agar merepresentasikan esensi materi secara kreatif.
           Berdasarkan rujukan di atas, rumuskan prompt berkualitas tinggi untuk "prompt_gambar_topik" (berdasarkan topik utama tanpa menyebut kelas/mata pelajaran) dan pastikan format awalnya diawali "3D cute illustration, clay style..." dengan rincian pelengkap visual yang kaya.
        7. "ppt_canva_ready_slides": Buat minimal 10 slide terstruktur lengkap (dari Slide 1 sampai Slide 10) untuk bahan presentasi Canva AI / Gamma.app dengan mengikuti struktur kaku berikut:
           - Slide 1: Judul Utama. Judul Halaman: "[Nama Materi / Tema P5] - [Tingkat Kelas]", Isi Poin Materi: ["Disusun Oleh: GuruPintar AI atau Instansi Pembelajaran"]
           - Slide 2: Pertanyaan Pemantik & Pendahuluan. Judul Halaman: "Pertanyaan Pemantik & Pendahuluan", Isi Poin Materi: [1 pertanyaan pemantik menarik dan tujuan pembelajaran singkat]
           - Slide 3: Pembahasan Inti Bagian A. Judul Halaman: "Pembahasan Inti Bagian A (Fakta/Konsep Awal)", Isi Poin Materi: [2-3 poin esensial materi secara ringkas dan padat]
           - Slide 4: Pembahasan Inti Bagian B. Judul Halaman: "Pembahasan Inti Bagian B (Uraian Detil / Penguatan)", Isi Poin Materi: [Kelanjutan penjelasan teori/konsep secara terperinci]
           - Slide 5: Pembahasan Inti Bagian C. Judul Halaman: "Pembahasan Inti Bagian C (Aplikasi / Contoh Kasus)", Isi Poin Materi: [Aktivitas penerapan konsep atau contoh kasus dalam situasi nyata]
           - Slide 6: Kegiatan Kelompok / Eksplorasi Kolaboratif. Judul Halaman: "Kegiatan Kelompok / Eksplorasi Kolaboratif", Isi Poin Materi: [Langkah-langkah instruksi penugasan kelompok/studi lapangan]
           - Slide 7: Penyajian Hasil / Presentasi Siswa. Judul Halaman: "Penyajian Hasil / Presentasi Siswa", Isi Poin Materi: [Panduan presentasi, metode saling memberi umpan balik antar kelompok]
           - Slide 8: Kuis Cepat / Cek Pemahaman Ringkas. Judul Halaman: "Kuis Cepat / Cek Pemahaman Ringkas", Isi Poin Materi: [2-3 pertanyaan refleksi cepat untuk mengecek kepahaman murid]
           - Slide 9: Asesmen Penutup / Evaluasi Mandiri. Judul Halaman: "Asesmen Penutup / Evaluasi Mandiri", Isi Poin Materi: [Detail intisari evaluasi atau pengerjaan asesmen mandiri]
           - Slide 10: Kesimpulan Akhir & Refleksi Belajar. Judul Halaman: "Kesimpulan Akhir & Refleksi Belajar", Isi Poin Materi: ["Kesimpulan: [ringkasan akhir bab secara komprehensif]", "Refleksi Belajar: [lembar isian refleksi perasaan dan motivasi siswa]"]
           Setiap slide harus berpoin-poin tajam, ringkas, padat (maksimal 1-2 kalimat per poin) tanpa bertele-tele agar bekerja maksimal dengan Canva Magic Design atau Gamma.app. Untuk tiap slide, berikan "image_generation_prompt" visual dengan gaya cute clay/papercut style.
        8. "saran_youtube_spesifik": "keyword_pencarian_utama" berisi kata kunci pencarian video yang akurat di YouTube.
        9. KONSISTENSI LOGIKA MATERI 100% SINKRON (ANTI-BOCOR): Selaras dan konsisten secara mutlak. Materi pada "kegiatan_penutup", lembar "lembar_kerja_peserta_didik_lkpd", dan semua butir pertanyaan di "paket_asesmen_penilaian_lengkap" (soal evaluasi) HANYA boleh melingkupi, membahas, dan menguji materi serta aktivitas yang telah diajarkan secara gamblang dalam "kegiatan_inti_mendalam" RPP. Dilarang memasukkan istilah baru, teori asing, rumus tak relevan, atau konsep luar yang tidak diuraikan sebelumnya. Ice breaking pendukung wajib dipisah sepenuhnya ke dalam objek "kolom_ice_breaking_mandiri" dan dilarang masuk ke dalam skenario langkah RPP utama.
        10. OUTPUT MEDIA AJAR WAJIB LENGKAP: Pastikan output materi media selalu menyertakan draf teks terstruktur per slide (di "ppt_canva_ready_slides"), rekomendasi alat peraga fisik konkret (di "modul_ajar_rpp_merdeka" atau bagian media RPP lainnya), serta kata kunci pencarian video edukasi di YouTube (di "saran_youtube_spesifik").
      `;

      parts.push({ text: promptString });

      // Query Gemini via retry-and-fallback helper
      const response = await generateContentWithRetryAndFallback(ai, {
        contents: { parts },
        config: {
          systemInstruction: `Anda adalah pakar kurikulum Kurikulum Merdeka 2026 pendidikan nasional di Indonesia, desainer UI/UX asisten digital guru tepercaya, dan desainer instruksional ahli. Semua materi, RPP, LKPD, dan Asesmen harus diulas lengkap, panjang, sangat memuaskan, mendalam, realistis, dan langsung siap saji tanpa merugikan guru dengan kalimat-kalimat rujukan kosong atau petunjuk bersifat singkatan (larang draf kosong atau ringkasan draf). Sifat responsmu wajib berwujud JSON murni yang sangat detail, panjang, komprehensif, dan siap diekspor tanpa tambahan teks markdown pembuka/penutup (tanpa \`\`\`json).`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              modul_ajar_rpp_merdeka: {
                type: Type.OBJECT,
                properties: {
                  komponen_inti: {
                    type: Type.OBJECT,
                    properties: {
                      tujuan_pembelajaran: { type: Type.STRING, description: "Detail target capaian pembelajaran kompetensi murid." },
                      alur_tujuan_pembelajaran: { type: Type.STRING, description: "Alur Tujuan Pembelajaran (ATP) bertahap kompetensi siswa dari mudah ke kompleks secara runtut mendalam." },
                      materi_pokok: { type: Type.STRING, description: "Uraian substansi materi ajar." }
                    },
                    required: ["tujuan_pembelajaran", "alur_tujuan_pembelajaran", "materi_pokok"]
                  },
                  langkah_pembelajaran: {
                    type: Type.OBJECT,
                    properties: {
                      kegiatan_pembuka: { type: Type.STRING, description: "Durasi 10 menit, apersepsi konkrit dan pemantik." },
                      kegiatan_inti_mendalam: { type: Type.STRING, description: "Minimal 3 tahapan runtut aktivitas murid secara eksploratif (ditulis detail per baris kegiatan)." },
                      kegiatan_penutup: { type: Type.STRING, description: "Refleksi guru-murid dan simpulan bersama." }
                    },
                    required: ["kegiatan_pembuka", "kegiatan_inti_mendalam", "kegiatan_penutup"]
                  },
                  instrumen_asesmen: {
                    type: Type.OBJECT,
                    properties: {
                      jenis_asesmen: { type: Type.STRING, description: "Formatif / Sumatif" },
                      soal_evaluasi: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            pertanyaan: { type: Type.STRING, description: "Teks soal kuis" },
                            pilihan_jawaban: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING }
                            },
                            kunci_jawaban: { type: Type.STRING, description: "Jawaban yang benar beserta pembahasan singkat" }
                          },
                          required: ["pertanyaan", "pilihan_jawaban", "kunci_jawaban"]
                        }
                      }
                    },
                    required: ["jenis_asesmen", "soal_evaluasi"]
                  }
                },
                required: ["komponen_inti", "langkah_pembelajaran", "instrumen_asesmen"]
              },
              ppt_canva_ready_slides: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    slide_nomor: { type: Type.INTEGER },
                    layout_template: { type: Type.STRING, description: "Title Slide / Content / Summary" },
                    judul_halaman: { type: Type.STRING, description: "Teks judul slide" },
                    isi_poin_materi: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Poin-poin ringkas materi (maksimal 1 kalimat padat)."
                    },
                    image_generation_prompt: { type: Type.STRING, description: "AI Image prompt dengan format gaya visual cute clay/papercut style." }
                  },
                  required: ["slide_nomor", "layout_template", "judul_halaman", "isi_poin_materi", "image_generation_prompt"]
                }
              },
              saran_youtube_spesifik: {
                type: Type.OBJECT,
                properties: {
                  keyword_pencarian_utama: { type: Type.STRING, description: "Tuliskan 1-2 frasa kunci pencarian video terakurat untuk dicari di YouTube." }
                },
                required: ["keyword_pencarian_utama"]
              },
              magic_studio_output: {
                type: Type.OBJECT,
                properties: {
                  metode_pembelajaran: { type: Type.STRING, description: "Nama model/metode pembelajaran yang digunakan secara utuh" },
                  pendekatan_pembelajaran: { type: Type.STRING, description: "Pendekatan pembelajaran yang digunakan" },
                  rpp_merdeka_formal: {
                    type: Type.OBJECT,
                    properties: {
                      komponen_umum: { type: Type.STRING, description: "Detail level kelas dan nama mata pelajaran secara spesifik" },
                      tujuan_pembelajaran: { type: Type.STRING, description: "Capaian target kompetensi siswa" },
                      langkah_pembelajaran_rinci: { type: Type.STRING, description: "Skenario langkah Pembuka, Inti Bermakna, dan Penutup (Strictly tanpa Ice Breaking di dalamnya)" }
                    },
                    required: ["komponen_umum", "tujuan_pembelajaran", "langkah_pembelajaran_rinci"]
                  },
                  lembar_kerja_peserta_didik_lkpd: {
                    type: Type.OBJECT,
                    properties: {
                      judul_aktivitas: { type: Type.STRING, description: "Judul kegiatan LKPD siswa" },
                      petunjuk_belajar: { type: Type.STRING, description: "Panduan dan petunjuk langkah kerja eksplorasi kelompok murid" },
                      soal_atau_tugas_lapangan: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Daftar rincian tugas atau butir pertanyaan lapangan penyelidikan kelompok"
                      }
                    },
                    required: ["judul_aktivitas", "petunjuk_belajar", "soal_atau_tugas_lapangan"]
                  },
                  paket_asesmen_penilaian_lengkap: {
                    type: Type.OBJECT,
                    properties: {
                      tipe: { type: Type.STRING, description: "Tipe Asesmen (formatif/sumatif)" },
                      butir_soal_multiple_choice: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            no: { type: Type.INTEGER },
                            pertanyaan: { type: Type.STRING, description: "Pertanyaan pilihan ganda mendalam" },
                            pilihan: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING },
                              description: "Pilihan A, B, C, D lengkap dengan keterangannya"
                            },
                            kunci: { type: Type.STRING, description: "Kunci jawaban berupa huruf pilihan yang benar (contoh: A)" },
                            pembahasan: { type: Type.STRING, description: "Ulasan penjelasan analisis pembahasan logis soal tersebut" }
                          },
                          required: ["no", "pertanyaan", "pilihan", "kunci", "pembahasan"]
                        }
                      }
                    },
                    required: ["tipe", "butir_soal_multiple_choice"]
                  },
                  kolom_ice_breaking_mandiri: {
                    type: Type.OBJECT,
                    properties: {
                      nama_permainan: { type: Type.STRING, description: "Judul game interaksi/fokus yang menyenangkan" },
                      langkah_bermain: { type: Type.STRING, description: "Langkah-langkah detil instruksi guru memfasilitasi jalannya game" }
                    },
                    required: ["nama_permainan", "langkah_bermain"]
                  },
                  prompt_gambar_topik: { type: Type.STRING, description: "Prompt gambar berkualitas diawali: 3D cute illustration, clay style, vivid color, highly detailed, soft lighting depicting [Hanya_Topik_Utama_Tanpa_Menyebut_Kelas_Atau_Mapel]" }
                },
                required: ["rpp_merdeka_formal", "lembar_kerja_peserta_didik_lkpd", "paket_asesmen_penilaian_lengkap", "kolom_ice_breaking_mandiri", "prompt_gambar_topik", "metode_pembelajaran", "pendekatan_pembelajaran"]
              }
            },
            required: ["modul_ajar_rpp_merdeka", "ppt_canva_ready_slides", "saran_youtube_spesifik", "magic_studio_output"]
          }
        }
      });

      const responseText = response.text || "";
      let parsedOutput;
      try {
        parsedOutput = JSON.parse(cleanJsonString(responseText));
      } catch (parseErr) {
        console.error("Failed to parse Gemini output JSON", responseText, parseErr);
        return res.status(500).json({
          error: "Gagal memproses respons AI ke dalam format RPP & Slide yang terstruktur.",
          raw: responseText
        });
      }

      return res.json(parsedOutput);

    } catch (err: any) {
      console.error("Generate API error:", err);
      return res.status(500).json({ error: err.message || "Terjadi kesalahan internal" });
    }
  });

  // API Endpoint to refine RPP & PPT slides based on teacher comments/instructions
  app.post("/api/refine", async (req, res) => {
    try {
      const apiKey = (req.headers["x-user-api-key"] as string) || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "API Key belum dikonfigurasi. Silakan masukkan API Key Gemini Anda di halaman Akun, atau hubungi admin sekolah."
        });
      }

      const { currentData, previousResult, instruction, classLevel, subject, p5Theme, metode } = req.body;
      const actualData = currentData || previousResult;
      if (!actualData || !instruction) {
        return res.status(400).json({
          error: "Data saat ini dan instruksi perbaikan diperlukan."
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const targetLevel = classLevel || "Umum";
      const targetSubject = subject ? `Mata Pelajaran: ${subject}` : "Mata Pelajaran: Umum";
      const targetMetode = metode || "Cooperative Learning";
      const p5Context = p5Theme ? `Gaya Pembelajaran: Proyek Penguatan Profil Pelajar Pancasila (P5) - Tema: ${p5Theme}` : "";

      const promptString = `
        Anda adalah asisten kurikulum nasional Kurikulum Merdeka 2026. Pengguna (guru) ingin memodifikasi atau memperbaiki ekosistem draf RPP, Slide Presentasi, rekomendasi YouTube, dan modul integrasi LKPD saat ini.

        DATA SAAT INI (JSON):
        ${JSON.stringify(actualData)}

        TARGET KELAS: ${targetLevel}
        TARGET MATA PELAJARAN: ${targetSubject}
        - Model/Metode Pembelajaran yang WAJIB digunakan: ${targetMetode}
        ${p5Context ? `KONTEKS PAMA TEMA P5: ${p5Context}` : ""}

        ${p5Theme ? `PENTING: Sebagai "Modul Proyek P5" bertema "${p5Theme}", pastikan seluruh draf terangkai dengan format "Modul Proyek P5". Di bagian akhir / paket Asesmen, Anda WAJIB menyertakan secara lengkap dan rinci:
        1. "Lembar Refleksi Siswa P5" (berisi sekurang-kurangnya 3 pertanyaan refleksi diri siswa selama proyek).
        2. "Rubrik Penilaian Karakter P5" dengan 4 kriteria pencapaian standard Kurikulum Merdeka secara deskriptif: Belum Berkembang (BB), Mulai Berkembang (MB), Berkembang Sesuai Harapan (BSH), dan Sangat Berkembang (SB) untuk masing-masing dimensi atau karakter Profil Pelajar Pancasila.` : ""}

        INSTRUKSI PERBAIKAN DARI GURU:
        "${instruction}"

        Tugas Anda:
        Lakukan perubahan atau penyesuaian secara spesifik pada properti modul_ajar_rpp_merdeka, ppt_canva_ready_slides, saran_youtube_spesifik, atau magic_studio_output berdasarkan komentar guru di atas.
        Pastikan aturan-aturan berikut diikuti konsisten (SANGAT KETAT / NO SHORTCUTS):
        1. MODUL AJAR (RPP) FORMAT RESMI KURIKULUM MERDEKA: Susun dokumen dengan struktur berikut PERSIS:

INFORMASI UMUM:
A. IDENTITAS SEKOLAH (nama guru, instansi, tahun, jenjang, mapel, kelas, elemen, bab/topik, alokasi waktu)
B. KOMPETENSI AWAL (pengetahuan prasyarat siswa)
C. PROFIL PELAJAR PANCASILA (karakter yang dikembangkan: Beriman, Mandiri, Bernalar Kritis, Gotong Royong, Kreatif)
D. SARANA DAN PRASARANA (media, alat/bahan, sumber belajar)
E. TARGET PESERTA DIDIK (deskripsi peserta didik)
F. MODEL PEMBELAJARAN YANG DIGUNAKAN: wajib menggunakan ${targetMetode} — tulis Pendekatan, Model pembelajaran, Langkah-langkah model, dan Metode pendukung

KOMPONEN INTI:
A. CAPAIAN PEMBELAJARAN
B. TUJUAN PEMBELAJARAN (minimal 3 tujuan terukur)
C. PEMAHAMAN BERMAKNA (apa yang dipahami siswa setelah belajar)
D. PERTANYAAN PEMANTIK (3-5 pertanyaan membuka rasa ingin tahu)
E. KEGIATAN PEMBELAJARAN:
   - Kegiatan Pendahuluan (10-15 menit): salam, doa, absensi, apersepsi, pertanyaan pemantik, menyampaikan tujuan
   - Kegiatan Inti (45-55 menit): WAJIB mengikuti tahapan ${targetMetode} secara detail per tahap, dengan nama tahap yang sesuai model, aktivitas siswa dan guru yang konkret dan sesuai model/metode pembelajaran ${targetMetode} — sesuaikan seluruh tahapan langkah kegiatan inti, pendekatan kelompok, dan instruksi guru agar mencerminkan karakteristik ${targetMetode} secara autentik dan lengkap
   - Kegiatan Penutup (5-10 menit): simpulan bersama, refleksi, evaluasi, tindak lanjut, doa

ASESMEN/PENILAIAN:
- Asesmen Diagnostik
- Asesmen Formatif  
- Asesmen Sumatif

PENGAYAAN DAN REMEDIAL

REFLEKSI:
- Refleksi Peserta Didik (tabel ceklis sudah mampu/belum mampu)
- Refleksi Guru (pertanyaan evaluasi diri guru)
        2. LKPD FORMAT RESMI SEKOLAH: Buat dengan struktur: header identitas (Hari/Tanggal, Nama Siswa, Kelas, Kelompok), Tujuan Kegiatan, Alat dan Bahan, Langkah-langkah Kerja (numbered list), Tabel Pengamatan/Data (dengan kolom No/Aspek/Hasil/Keterangan), Pertanyaan Diskusi (3-5 soal analisis), Kesimpulan (kolom kosong untuk diisi siswa). JANGAN gunakan format esai panjang — gunakan tabel dan daftar bernomor.
        3. PAKET ASESMEN LENGKAP: Buat (a) Tabel Asesmen Diagnostik dengan kolom Kemampuan Awal/Cakap/Berkembang/Butuh Pendamping, (b) Soal Pilihan Ganda minimal 10 butir dengan kunci dan pembahasan, (c) Rubrik Penilaian Sikap dengan aspek Keaktifan/Kerja Sama/Tanggung Jawab skala 1-4, (d) Rubrik Penilaian Performa/Presentasi, (e) Lembar rekap nilai siswa kosong.
        4. JANGAN GUNAKAN PLACEHOLDER: Dilarang keras menggunakan draf kosong, tanda "... ", "[tulis di sini]", "dst", atau singkatan lainnya. Semua dokumen pembelajaran, RPP, LKPD, dan penilaian harus fully written, lengkap, komprehensif, dan siap cetak/unduh tanpa ada draf kasar.
        5. ICE BREAKING SEPARATION: Jangan masukkan materi ice breaking ke dalam RPP. Pisahkan ke dalam objek JSON mandiri "kolom_ice_breaking_mandiri" untuk ditaruh di kolom khusus luar RPP.
        6. PROMPT INFOGRAFIS & IMAGE PROMPT SLIDE: Sesuaikan gaya, karakter, dan elemen visual dengan jenis topik materi pembelajaran.
           - JIKA TOPIKNYA BERKAITAN DENGAN AGAMA ISLAM ATAU ISLAMI: Wajib mengandung unsur Islami (seperti masjid indah minimalis, ornamen geometris Islam, atau dekorasi bintang/bulan sabit) dan karakter manusia di dalamnya HARUS menutup aurat secara syar'i (siswi/guru wanita harus berpakaian sopan longgar lengkap dengan jilbab/hijab/kerudung rapi penutup kepala dan lengan panjang; siswa/guru pria harus memakai busana muslim rapi berlengan panjang/celana panjang sopan). Contoh format prompt: "3D cute illustration, clay style, vivid color, highly detailed, soft lighting depicting friendly Muslim student characters wearing modest Islamic clothing (elegant hijab/headscarf for girls, long sleeves, long trousers), clean visual style with serene pastel background, minimal Islamic geometric vector art patterns".
           - JIKA TOPIKNYA IPA / SAINS / BIOLOGI: Gunakan karakter siswa/ilmuwan berjas laboratorium bersih, memegang gelas ukur atau mikroskop, berlatar belakang diagram atom, rantai dna, sel, tumbuhan hidup, atau bintang planet tata surya.
           - JIKA TOPIKNYA IPS / SEJARAH: Gunakan latar belakang bernuansa penjelajahan, peta navigasi antik, bola dunia 3D, astrolabe, kompas perunggu, atau garis lini masa sejarah yang estetik.
           - JIKA TOPIKNYA MATEMATIKA: Gunakan ilustrasi bertema ornamen persamaan angka mengapung, bangun ruang geometris seperti kubus/prisma transparan berwarna murni, penggaris, jangka sekolah kelir pastel.
           - TOPIK LAINNYA: Sesuaikan profesi, pakaian seragam, dan ornamen dekorasi latar belakang gambar agar merepresentasikan esensi materi secara kreatif.
           Berdasarkan rujukan di atas, rumuskan prompt berkualitas tinggi untuk "prompt_gambar_topik" (berdasarkan topik utama tanpa menyebut kelas/mata pelajaran) dan pastikan format awalnya diawali "3D cute illustration, clay style..." dengan rincian pelengkap visual yang kaya.
        7. "ppt_canva_ready_slides": Buat minimal 10 slide terstruktur lengkap (dari Slide 1 sampai Slide 10) untuk bahan presentasi Canva AI / Gamma.app dengan mengikuti struktur kaku berikut:
           - Slide 1: Judul Utama. Judul Halaman: "[Nama Materi / Tema P5] - [Tingkat Kelas]", Isi Poin Materi: ["Disusun Oleh: GuruPintar AI atau Instansi Pembelajaran"]
           - Slide 2: Pertanyaan Pemantik & Pendahuluan. Judul Halaman: "Pertanyaan Pemantik & Pendahuluan", Isi Poin Materi: [1 pertanyaan pemantik menarik dan tujuan pembelajaran singkat]
           - Slide 3: Pembahasan Inti Bagian A. Judul Halaman: "Pembahasan Inti Bagian A (Fakta/Konsep Awal)", Isi Poin Materi: [2-3 poin esensial materi secara ringkas dan padat]
           - Slide 4: Pembahasan Inti Bagian B. Judul Halaman: "Pembahasan Inti Bagian B (Uraian Detil / Penguatan)", Isi Poin Materi: [Kelanjutan penjelasan teori/konsep secara terperinci]
           - Slide 5: Pembahasan Inti Bagian C. Judul Halaman: "Pembahasan Inti Bagian C (Aplikasi / Contoh Kasus)", Isi Poin Materi: [Aktivitas penerapan konsep atau contoh kasus dalam situasi nyata]
           - Slide 6: Kegiatan Kelompok / Eksplorasi Kolaboratif. Judul Halaman: "Kegiatan Kelompok / Eksplorasi Kolaboratif", Isi Poin Materi: [Langkah-langkah instruksi penugasan kelompok/studi lapangan]
           - Slide 7: Penyajian Hasil / Presentasi Siswa. Judul Halaman: "Penyajian Hasil / Presentasi Siswa", Isi Poin Materi: [Panduan presentasi, metode saling memberi umpan balik antar kelompok]
           - Slide 8: Kuis Cepat / Cek Pemahaman Ringkas. Judul Halaman: "Kuis Cepat / Cek Pemahaman Ringkas", Isi Poin Materi: [2-3 pertanyaan refleksi cepat untuk mengecek kepahaman murid]
           - Slide 9: Asesmen Penutup / Evaluasi Mandiri. Judul Halaman: "Asesmen Penutup / Evaluasi Mandiri", Isi Poin Materi: [Detail intisari evaluasi atau pengerjaan asesmen mandiri]
           - Slide 10: Kesimpulan Akhir & Refleksi Belajar. Judul Halaman: "Kesimpulan Akhir & Refleksi Belajar", Isi Poin Materi: ["Kesimpulan: [ringkasan akhir bab secara komprehensif]", "Refleksi Belajar: [lembar isian refleksi perasaan dan motivasi siswa]"]
           Setiap slide harus berpoin-poin tajam, ringkas, padat (maksimal 1-2 kalimat per poin) tanpa bertele-tele agar bekerja maksimal dengan Canva Magic Design atau Gamma.app. Untuk tiap slide, berikan "image_generation_prompt" visual dengan gaya cute clay/papercut style.
        8. Selalu kembalikan respons lengkap yang diperbarui dalam struktur JSON murni yang sama persis seperti skema input.
        9. KONSISTENSI LOGIKA MATERI 100% SINKRON (ANTI-BOCOR): Selaras dan konsisten secara mutlak. Materi pada "kegiatan_penutup", lembar "lembar_kerja_peserta_didik_lkpd", dan semua butir pertanyaan di "paket_asesmen_penilaian_lengkap" (soal evaluasi) HANYA boleh melingkupi, membahas, dan menguji materi serta aktivitas yang telah diajarkan secara gamblang dalam "kegiatan_inti_mendalam" RPP. Dilarang memasukkan istilah baru, teori asing, rumus tak relevan, atau konsep luar yang tidak diuraikan sebelumnya. Ice breaking pendukung wajib dipisah sepenuhnya ke dalam objek "kolom_ice_breaking_mandiri" dan dilarang masuk ke dalam skenario langkah RPP utama.
        10. OUTPUT MEDIA AJAR WAJIB LENGKAP: Pastikan output materi media selalu menyertakan draf teks terstruktur per slide (di "ppt_canva_ready_slides"), rekomendasi alat peraga fisik konkret (di "modul_ajar_rpp_merdeka" atau bagian media RPP lainnya), serta kata kunci pencarian video edukasi di YouTube (di "saran_youtube_spesifik").
      `;

      // Query Gemini via retry-and-fallback helper
      const response = await generateContentWithRetryAndFallback(ai, {
        contents: promptString,
        config: {
          systemInstruction: "Anda adalah pakar kurikulum nasional di Indonesia (Kurikulum Merdeka 2026). Semua materi, RPP, LKPD, dan Asesmen harus diulas lengkap, panjang, sangat memuaskan, mendalam, realistis, dan langsung siap saji tanpa merugikan guru dengan kalimat-kalimat rujukan kosong atau petunjuk bersifat singkatan (larang draf kosong atau ringkasan draf). Kembalikan JSON murni sesuai schema yang kaku tanpa potongan markdown (tanpa ```json).",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              modul_ajar_rpp_merdeka: {
                type: Type.OBJECT,
                properties: {
                  komponen_inti: {
                    type: Type.OBJECT,
                    properties: {
                      tujuan_pembelajaran: { type: Type.STRING },
                      alur_tujuan_pembelajaran: { type: Type.STRING },
                      materi_pokok: { type: Type.STRING }
                    },
                    required: ["tujuan_pembelajaran", "alur_tujuan_pembelajaran", "materi_pokok"]
                  },
                  langkah_pembelajaran: {
                    type: Type.OBJECT,
                    properties: {
                      kegiatan_pembuka: { type: Type.STRING },
                      kegiatan_inti_mendalam: { type: Type.STRING },
                      kegiatan_penutup: { type: Type.STRING }
                    },
                    required: ["kegiatan_pembuka", "kegiatan_inti_mendalam", "kegiatan_penutup"]
                  },
                  instrumen_asesmen: {
                    type: Type.OBJECT,
                    properties: {
                      jenis_asesmen: { type: Type.STRING },
                      soal_evaluasi: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            pertanyaan: { type: Type.STRING },
                            pilihan_jawaban: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING }
                            },
                            kunci_jawaban: { type: Type.STRING }
                          },
                          required: ["pertanyaan", "pilihan_jawaban", "kunci_jawaban"]
                        }
                      }
                    },
                    required: ["jenis_asesmen", "soal_evaluasi"]
                  }
                },
                required: ["komponen_inti", "langkah_pembelajaran", "instrumen_asesmen"]
              },
              ppt_canva_ready_slides: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    slide_nomor: { type: Type.INTEGER },
                    layout_template: { type: Type.STRING },
                    judul_halaman: { type: Type.STRING },
                    isi_poin_materi: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    image_generation_prompt: { type: Type.STRING }
                  },
                  required: ["slide_nomor", "layout_template", "judul_halaman", "isi_poin_materi", "image_generation_prompt"]
                }
              },
              saran_youtube_spesifik: {
                type: Type.OBJECT,
                properties: {
                  keyword_pencarian_utama: { type: Type.STRING }
                },
                required: ["keyword_pencarian_utama"]
              },
              magic_studio_output: {
                type: Type.OBJECT,
                properties: {
                  metode_pembelajaran: { type: Type.STRING },
                  pendekatan_pembelajaran: { type: Type.STRING },
                  rpp_merdeka_formal: {
                    type: Type.OBJECT,
                    properties: {
                      komponen_umum: { type: Type.STRING },
                      tujuan_pembelajaran: { type: Type.STRING },
                      langkah_pembelajaran_rinci: { type: Type.STRING }
                    },
                    required: ["komponen_umum", "tujuan_pembelajaran", "langkah_pembelajaran_rinci"]
                  },
                  lembar_kerja_peserta_didik_lkpd: {
                    type: Type.OBJECT,
                    properties: {
                      judul_aktivitas: { type: Type.STRING },
                      petunjuk_belajar: { type: Type.STRING },
                      soal_atau_tugas_lapangan: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      }
                    },
                    required: ["judul_aktivitas", "petunjuk_belajar", "soal_atau_tugas_lapangan"]
                  },
                  paket_asesmen_penilaian_lengkap: {
                    type: Type.OBJECT,
                    properties: {
                      tipe: { type: Type.STRING },
                      butir_soal_multiple_choice: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            no: { type: Type.INTEGER },
                            pertanyaan: { type: Type.STRING },
                            pilihan: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING }
                            },
                            kunci: { type: Type.STRING },
                            pembahasan: { type: Type.STRING }
                          },
                          required: ["no", "pertanyaan", "pilihan", "kunci", "pembahasan"]
                        }
                      }
                    },
                    required: ["tipe", "butir_soal_multiple_choice"]
                  },
                  kolom_ice_breaking_mandiri: {
                    type: Type.OBJECT,
                    properties: {
                      nama_permainan: { type: Type.STRING },
                      langkah_bermain: { type: Type.STRING }
                    },
                    required: ["nama_permainan", "langkah_bermain"]
                  },
                  prompt_gambar_topik: { type: Type.STRING }
                },
                required: ["rpp_merdeka_formal", "lembar_kerja_peserta_didik_lkpd", "paket_asesmen_penilaian_lengkap", "kolom_ice_breaking_mandiri", "prompt_gambar_topik", "metode_pembelajaran", "pendekatan_pembelajaran"]
              }
            },
            required: ["modul_ajar_rpp_merdeka", "ppt_canva_ready_slides", "saran_youtube_spesifik", "magic_studio_output"]
          }
        }
      });

      const responseText = response.text || "";
      let parsedOutput;
      try {
        parsedOutput = JSON.parse(cleanJsonString(responseText));
      } catch (parseErr) {
        console.error("Failed to parse Gemini execution response JSON", responseText, parseErr);
        return res.status(500).json({
          error: "Gagal memproses hasil modifikasi draf kurikulum.",
          raw: responseText
        });
      }

      return res.json(parsedOutput);

    } catch (err: any) {
      console.error("Refine API error:", err);
      return res.status(500).json({ error: err.message || "Terjadi kesalahan internal" });
    }
  });

  // API Endpoint for general chatbot workspace assistant questions
  app.post("/api/chat", async (req, res) => {
    try {
      const apiKey = (req.headers["x-user-api-key"] as string) || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "API Key belum dikonfigurasi. Silakan masukkan API Key Gemini Anda di halaman Akun, atau hubungi admin sekolah."
        });
      }

      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Pesan wajib diisi." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      // Construct conversational contents history context of Gemini chat format
      const contents: any[] = [];
      if (history && Array.isArray(history)) {
        for (const h of history) {
          contents.push({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.text }]
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await generateContentWithRetryAndFallback(ai, {
        contents,
        config: {
          systemInstruction: "Anda adalah GURU.AI, Asisten Digital Administrasi Guru tepercaya di Indonesia binaan Kementerian Pendidikan dan Kebudayaan Republik GuruPintar. Anda bertugas mendampingi Bapak/Ibu guru dalam merancang skenario pemicu ajar, memberikan saran konkret penanganan kelas, memberikan instruksi ice breaking kelas, serta merinci regulasi Kurikulum Merdeka 2026. Jawablah secara konkret, ramah, antusias, solutif, dan penuh rasa hormat struktural. Gunakan formatting Markdown tebal dan poin miring yang rapi.",
        }
      });

      return res.json({ text: response.text || "Saya siap mendampingi kelas Bapak/Ibu." });
    } catch (err: any) {
      console.error("Chat API error:", err);
      return res.status(500).json({ error: err.message || "Gagal mendapatkan respons asisten saat ini." });
    }
  });

  // Endpoint Tahap 1: Modul Ajar (RPP)
  app.post("/api/generate/rpp", async (req, res) => {
    try {
      const apiKey = (req.headers["x-user-api-key"] as string) || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "API Key belum dikonfigurasi. Silakan masukkan API Key Gemini Anda di halaman Akun, atau hubungi admin sekolah."
        });
      }

      const { topik, kelas, mapel } = req.body;
      if (!topik || !kelas || !mapel) {
        return res.status(400).json({ error: "Parameter topik, kelas, dan mapel wajib diisi." });
      }

      const prompt = `Buatkan Modul Ajar (RPP) Kurikulum Merdeka secara lengkap untuk Mapel ${mapel} Kelas ${kelas} dengan topik "${topik}". Ikuti aturan baku tanpa placeholder, pastikan modul ajar terperinci dengan Informasi Umum (Identitas, Kompetensi Awal, Sarpras, Target), Komponen Inti (TP, Pemahaman Bermakna, Pertanyaan Pemantik, Kegiatan Pembelajaran Pembuka-Inti-Penutup), dan Asesmen lengkap serta Refleksi.`;
      
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const merdekaSystemInstruction = `
Kamu adalah pakar kurikulum dan asisten ahli Kurikulum Merdeka 2026. 
Tugasmu adalah menyusun dokumen perangkat ajar yang sangat detail, mendalam, dan aplikatif.

Anda adalah Asisten Kurikulum Merdeka 2026 tingkat ahli untuk aplikasi GuruPintar AI. 
Tugas Anda adalah menyusun dokumen perangkat ajar yang utuh, detail, praktis, dan siap cetak.

ATURAN BAKU & KETAT:
1. DILARANG KERAS menggunakan placeholder seperti "... ", "[tulis di sini]", "[isi sendiri]", dll. Semua materi, contoh soal, dan langkah-langkah harus ditulis lengkap.
2. Jawablah secara terperinci, utuh, tanpa kode singkatan/titik-titik.
3. Gunakan bahasa yang profesional, adaptif, namun mudah dipahami oleh guru di Indonesia.
`;

      const response = await generateContentWithRetryAndFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction: merdekaSystemInstruction,
        }
      });

      const rppText = response.text || "";
      res.json({ success: true, rpp: rppText });
    } catch (error: any) {
      console.error("RPP Generation error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Endpoint Tahap 2: LKPD (Butuh konteks RPP dari Tahap 1)
  app.post("/api/generate/lkpd", async (req, res) => {
    try {
      const apiKey = (req.headers["x-user-api-key"] as string) || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "API Key belum dikonfigurasi. Silakan masukkan API Key Gemini Anda di halaman Akun, atau hubungi admin sekolah."
        });
      }

      const { topik, kelas, mapel, rppKonteks } = req.body;
      if (!topik || !kelas || !mapel || !rppKonteks) {
        return res.status(400).json({ error: "Parameter topik, kelas, mapel, dan rppKonteks wajib diisi." });
      }

      const prompt = `Berdasarkan RPP berikut:\n${rppKonteks}\n\nBuatkan Lembar Kerja Peserta Didik (LKPD) yang sinkron untuk materi ${topik} Kelas ${kelas} Mapel ${mapel}, lengkap dengan header identitas, petunjuk pengerjaan, alat/bahan, langkah kerja pengamatan, tabel pengumpulan data, dan soal latihan pemicu diskusi yang utuh (tanpa kode titik-titik or dst.).`;
      
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const merdekaSystemInstruction = `
Kamu adalah pakar kurikulum dan asisten ahli Kurikulum Merdeka 2026. 
Tugasmu adalah menyusun lkpd (lembar kerja peserta didik) yang sangat detail, mendalam, dan aplikatif.

Anda adalah Asisten Kurikulum Merdeka 2026 tingkat ahli untuk aplikasi GuruPintar AI. 
Tugas Anda adalah menyusun lkpd yang utuh, detail, praktis, dan siap cetak.

ATURAN BAKU & KETAT:
1. DILARANG KERAS menggunakan placeholder seperti "... ", "[tulis di sini]", "[isi sendiri]", dll. Semua materi, contoh soal, dan langkah-langkah harus ditulis lengkap.
2. Jawablah secara terperinci, utuh, tanpa kode singkatan/titik-titik.
3. Gunakan bahasa yang profesional, adaptif, namun mudah dipahami oleh guru di Indonesia.
`;

      const response = await generateContentWithRetryAndFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction: merdekaSystemInstruction,
        }
      });

      const lkpdText = response.text || "";
      res.json({ success: true, lkpd: lkpdText });
    } catch (error: any) {
      console.error("LKPD Generation error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Endpoint Tahap 3: Asesmen & Rubrik (Butuh konteks LKPD/RPP)
  app.post("/api/generate/asesmen", async (req, res) => {
    try {
      const apiKey = (req.headers["x-user-api-key"] as string) || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "API Key belum dikonfigurasi. Silakan masukkan API Key Gemini Anda di halaman Akun, atau hubungi admin sekolah."
        });
      }

      const { topik, kelas, mapel, lkpdKonteks } = req.body;
      if (!topik || !kelas || !mapel || !lkpdKonteks) {
        return res.status(400).json({ error: "Parameter topik, kelas, mapel, and lkpdKonteks wajib diisi." });
      }

      const prompt = `Berdasarkan LKPD berikut:\n${lkpdKonteks}\n\nBuatkan Instrumen Asesmen beserta Rubrik Penilaiannya secara mendetail dan siap pakai untuk siswa Kelas ${kelas} Mapel ${mapel} Topik "${topik}". Sertakan Kisi-kisi asesmen, instrumen penilaian sikap keaktifan/kerjasama, instrumen penilaian performansi, rubrik penilaian, lembar rekap nilai, dan kuis pilihan ganda yang komprehensif tanpa placeholder.`;
      
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const merdekaSystemInstruction = `
Kamu adalah pakar kurikulum dan asisten ahli Kurikulum Merdeka 2026. 
Tugasmu adalah menyusun instrumen asesmen dan rubrik penilaian yang sangat detail, mendalam, dan aplikatif.

Anda adalah Asisten Kurikulum Merdeka 2026 tingkat ahli untuk aplikasi GuruPintar AI. 
Tugas Anda adalah menyusun asesmen yang utuh, detail, praktis, dan siap cetak.

ATURAN BAKU & KETAT:
1. DILARANG KERAS menggunakan placeholder seperti "... ", "[tulis di sini]", "[isi sendiri]", dll. Semua materi, contoh soal, dan langkah-langkah harus ditulis lengkap.
2. Jawablah secara terperinci, utuh, tanpa kode singkatan/titik-titik.
3. Gunakan bahasa yang profesional, adaptif, namun mudah dipahami oleh guru di Indonesia.
`;

      const response = await generateContentWithRetryAndFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction: merdekaSystemInstruction,
        }
      });

      const asesmenText = response.text || "";
      res.json({ success: true, asesmen: asesmenText });
    } catch (error: any) {
      console.error("Asesmen Generation error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/generate/tp_atp", async (req, res) => {
    try {
      const apiKey = (req.headers["x-user-api-key"] as string) || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "API Key belum dikonfigurasi. Silakan masukkan API Key Gemini Anda di halaman Akun, atau hubungi admin sekolah."
        });
      }

      const { topik, kelas, mapel, metode } = req.body;
      if (!topik || !kelas || !mapel) return res.status(400).json({ error: "Parameter topik, kelas, mapel wajib diisi." });

      const prompt = `Buatkan Tujuan Pembelajaran (TP) dan Alur Tujuan Pembelajaran (ATP) Kurikulum Merdeka yang lengkap dan terstruktur untuk:
- Mata Pelajaran: ${mapel}
- Tingkat Kelas: ${kelas}  
- Topik: ${topik}
- Metode: ${metode || "Cooperative Learning"}

Struktur yang WAJIB dibuat:
1. CAPAIAN PEMBELAJARAN (CP) — salin dan sesuaikan CP resmi untuk mapel dan fase ini
2. TUJUAN PEMBELAJARAN (TP) — minimal 5 tujuan pembelajaran terukur dengan format: "Peserta didik mampu [kata kerja operasional] [objek] [kondisi/konteks]"
3. ALUR TUJUAN PEMBELAJARAN (ATP) — urutan TP dari yang paling dasar ke kompleks, dengan keterangan pertemuan ke berapa, durasi, dan aktivitas utama per TP
4. INDIKATOR PENCAPAIAN KOMPETENSI — per setiap TP, tuliskan 2-3 indikator yang spesifik dan terukur
5. PEMETAAN RANAH BLOOM — petakan setiap TP ke level kognitif C1-C6

Semua isi harus lengkap, tidak ada placeholder atau titik-titik.`;

      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
      const response = await generateContentWithRetryAndFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction: "Anda adalah pakar kurikulum Kurikulum Merdeka 2026. Buat TP dan ATP yang detail, lengkap, terukur, dan siap digunakan guru. Dilarang menggunakan placeholder atau titik-titik.",
        }
      });
      res.json({ success: true, tp_atp: response.text || "" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/generate/soal_ujian", async (req, res) => {
    try {
      const apiKey = (req.headers["x-user-api-key"] as string) || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "API Key belum dikonfigurasi. Silakan masukkan API Key Gemini Anda di halaman Akun, atau hubungi admin sekolah."
        });
      }

      const { topik, kelas, mapel, rppKonteks } = req.body;
      if (!topik || !kelas || !mapel) return res.status(400).json({ error: "Parameter topik, kelas, mapel wajib diisi." });

      const prompt = `Buatkan Paket Soal Ujian lengkap dan siap cetak untuk:
- Mata Pelajaran: ${mapel}
- Tingkat Kelas: ${kelas}
- Topik: ${topik}
${rppKonteks ? `\nKonteks RPP:\n${rppKonteks.substring(0, 1500)}` : ""}

Buat paket soal berikut SELURUHNYA tanpa placeholder:

A. ANALISIS DISTRIBUSI & TINGKAT KESULITAN SOAL (Sesuai Standar Penilaian Kurikulum Merdeka)
Sajikan tabel analisis distribusi tingkat kesulitan soal:
| Kategori Kesulitan | Tingkat Kognitif Bloom | Persentase | Jumlah Soal | Nomor Urut Soal |
|--------------------|------------------------|------------|-------------|-----------------|
| Mudah | C1 (Mengingat) - C2 (Memahami) | ~30% | 10 Soal | PG: 1-8, Isian: 1-2 |
| Sedang | C3 (Menerapkan) - C4 (Menganalisis) | ~50% | 17 Soal | PG: 9-15, Isian: 3-8, Esai: 1-4 |
| Sukar (HOTS) | C5 (Mengevaluasi) - C6 (Mencipta) | ~20% | 8 Soal | PG: 16-20, Isian: 9-10, Esai: 5 |

Sertakan narasi singkat mengenai relevansi dan validitas distribusi ini terhadap standar pencapaian asesmen nasional.

B. SOAL PILIHAN GANDA (20 soal)
Format:
Nomor. [Teks Pertanyaan]
Pilihan:
A. [Pilihan A]
B. [Pilihan B]
C. [Pilihan C]
D. [Pilihan D]
* Tingkat Kesulitan: [Mudah / Sedang / Sukar]
* Kunci Jawaban: [A/B/C/D]
* Pembahasan: [Ulasan ringkas alasan ilmiah jawaban yang benar]

Level: 8 soal Mudah (C1-C2), 7 soal Sedang (C3-C4), 5 soal Sukar/HOTS (C5-C6)

C. SOAL ISIAN SINGKAT (10 soal)
Format:
Nomor. [Teks Pertanyaan Isian]
* Tingkat Kesulitan: [Mudah / Sedang / Sukar]
* Kunci Jawaban: [Jawaban singkat yang benar]

D. SOAL URAIAN/ESAI (5 soal)
Format:
Nomor. [Teks Pertanyaan Esai]
* Tingkat Kesulitan: [Mudah / Sedang / Sukar]
* Pedoman Penskoran: [Kriteria penskoran mendetail per poin jawaban siswa]

E. KISI-KISI SOAL & STANDAR KELULUSAN
Tabel: No | Kompetensi / Indikator Capaian | Materi | Level Bloom / Kognitif | Tingkat Kesulitan (Mudah/Sedang/Sukar) | Bentuk Soal | No Soal

F. LEMBAR JAWABAN SISWA (template kosong siap print)

Semua soal harus kontekstual, sesuai level kelas, dan tidak ada yang kosong.`;

      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
      const response = await generateContentWithRetryAndFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction: "Anda adalah pembuat soal ahli Kurikulum Merdeka 2026. Buat soal ujian yang berkualitas, sesuai level kognitif Bloom, tanpa placeholder, lengkap dengan kunci dan pembahasan.",
        }
      });
      res.json({ success: true, soal_ujian: response.text || "" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/generate/rapor", async (req, res) => {
    try {
      const apiKey = (req.headers["x-user-api-key"] as string)?.trim() || process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(400).json({ error: "API Key belum dikonfigurasi." });
      const { namaGuru, namaSekolah, kelas, mapel, semester, tahunAjaran, siswaData, templateRapor } = req.body;
      if (!siswaData || siswaData.length === 0) return res.status(400).json({ error: "Data siswa kosong." });
      const prompt = `Kamu adalah guru berpengalaman yang menulis narasi rapor siswa dalam Bahasa Indonesia formal, hangat, dan mendidik.

Informasi:
- Sekolah: ${namaSekolah}
- Guru: ${namaGuru}  
- Kelas: ${kelas}
- Mata Pelajaran: ${mapel}
- Semester: ${semester} ${tahunAjaran}
${templateRapor ? `\nGUNAKAN GAYA BAHASA DAN FORMAT INI SEBAGAI ACUAN:\n${templateRapor.substring(0, 600)}\n` : ""}

Data siswa:
${siswaData.map((s: any) => `- ${s.nama}: Nilai ${s.nilai} | Catatan: ${s.catatan || "-"}`).join("\n")}

Tulis narasi rapor untuk SETIAP siswa. Format:
=== [NAMA SISWA] ===
[Narasi 2-3 kalimat. Mulai dengan "Ananda [nama]". Nilai ≥80 = sangat positif, 65-79 = cukup baik + dorongan, <65 = perlu bimbingan tapi tetap positif dan memotivasi]

Tulis semua siswa tanpa terkecuali.`;
      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
      const response = await generateContentWithRetryAndFallback(ai, {
        contents: prompt,
        config: { systemInstruction: "Tulis narasi rapor yang hangat, personal, dan berbeda untuk setiap siswa. Jangan seragam." }
      });
      res.json({ success: true, narasi: response.text || "" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/generate/kuis", async (req, res) => {
    try {
      const apiKey = (req.headers["x-user-api-key"] as string)?.trim() || process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(400).json({ error: "API Key belum dikonfigurasi." });
      const { kelas, mapel, topik, jumlah } = req.body;

      // Determine if it's a religious subject or context
      const lowerMapel = (mapel || "").toLowerCase();
      const lowerKelas = (kelas || "").toLowerCase();
      const isReligious = 
        lowerMapel.includes("agama") || 
        lowerMapel.includes("qur'an") || 
        lowerMapel.includes("hadits") || 
        lowerMapel.includes("akhlak") || 
        lowerMapel.includes("fiqih") || 
        lowerMapel.includes("tahsin") || 
        lowerMapel.includes("tahfidz") || 
        lowerMapel.includes("btq") || 
        lowerMapel.includes("arab") || 
        lowerMapel.includes("ski") || 
        lowerKelas.includes("agama") || 
        lowerKelas.includes("tahfidz");

      const prompt = `Buatkan ${jumlah || 5} soal kuis pemanasan kelas yang menarik dan interaktif untuk:
- Kelas: ${kelas}
- Mata Pelajaran: ${mapel}
- Topik: ${topik}

Format WAJIB untuk setiap soal:
━━━━━━━━━━━━━━━━━━━━
Soal [nomor]. [pertanyaan yang jelas dan kontekstual]
A. [pilihan]
B. [pilihan]
C. [pilihan]
D. [pilihan]
✅ Jawaban: [huruf]. [jawaban + penjelasan singkat 1 kalimat]
━━━━━━━━━━━━━━━━━━━━

Buat semua ${jumlah || 5} soal. Variasikan level: mudah, sedang, dan 1 soal HOTS (Higher Order Thinking Skills).
⚠️ SANGAT PENTING & WAJIB: Sesuaikan tata bahasa, kosakata, panjang kalimat, dan tingkat kesulitan kognitif pertanyaan serta pilihan jawaban secara PRESISI dengan usia siswa ${kelas}.
- Jika tingkat kelas adalah SD atau MI (misal: Kelas 1, 2, 3, 4, 5, 6), gunakan tata bahasa yang super sederhana, kalimat pendek yang konkret, cerita harian yang dekat dengan dunia mereka, pilihan jawaban yang sangat jelas, serta penjelasan jawaban yang ramah anak. DILARANG menggunakan istilah akademis yang rumit, teori tingkat tinggi, atau pilihan kata yang berbelit-belit yang menyulitkan anak usia Sekolah Dasar/Madrasah Ibtidaiyah.
- Gunakan konteks konkret yang dekat dengan kehidupan siswa ${kelas}.

${isReligious ? `Karena mata pelajaran/kelas ini bernuansa keagamaan/spesifik, Anda DIPESAN untuk menyusun soal dengan konteks materi keagamaan yang relevan.` : `⚠️ PERINGATAN KERAS & PENTING:
Karena mata pelajaran/kelas ini adalah umum/sekuler (seperti matematika, IPA, komputer, bahasa inggris, seni dll), Anda WAJIB membuat seluruh soal kuis ini secara UMUM, NASIONAL, NETRAL, dan SEKULER.
DILARANG KERAS menggunakan istilah keagamaan, nama-nama yang mengarah ke agama tertentu secara spesifik (misal: nuansa Islam seperti santri, ustadz, masjid, dll), atau berasumsi tentang keyakinan tertentu. Semua soal harus sepenuhnya netral dan profesional.`}`;

      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
      const response = await generateContentWithRetryAndFallback(ai, {
        contents: prompt,
        config: { systemInstruction: "Buat soal kuis yang menarik, kontekstual, netral-sekolah, mudah dicerna, sederhana, cocok dengan kapasitas kognitif tingkat kelas yang dituju, dan ramah anak. Jawaban harus jelas dengan penjelasan singkat." }
      });
      res.json({ success: true, kuis: response.text || "" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/generate/starter_topics", async (req, res) => {
    try {
      const apiKey = (req.headers["x-user-api-key"] as string)?.trim() || process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(400).json({ error: "API Key belum dikonfigurasi. Masukkan API Key di halaman Akun." });

      const { subject, classLevel } = req.body;
      if (!subject || !classLevel) {
        return res.status(400).json({ error: "Subject dan classLevel wajib diisi." });
      }

      const isAgama = ["tahfidz", "tahsin", "btq", "fiqih", "aqidah", "akhlak", "pai", "alquran", "al-qur", "agama"].some(k => subject.toLowerCase().includes(k));

      const prompt = `Kamu adalah kurikulum expert Kurikulum Merdeka 2026 Indonesia.

Buatkan 9 topik pembelajaran yang RELEVAN dan SPESIFIK untuk:
- Mata Pelajaran: ${subject}
- Kelas: ${classLevel}

Ketentuan WAJIB:
1. Setiap topik harus spesifik dan kontekstual untuk ${subject} di ${classLevel}
2. Topik harus sesuai dengan silabus Kurikulum Merdeka untuk jenjang tersebut
3. Variasikan topik: 3 topik semester ganjil, 3 topik semester genap, 3 topik lintas semester
4. ${isAgama ? "Karena ini mata pelajaran agama, topik harus sesuai nilai Islam dan Kurikulum Merdeka" : "Topik harus kontekstual dengan kehidupan sehari-hari siswa"}
5. Gunakan bahasa yang umum dipakai guru Indonesia, bukan terlalu akademis
6. JANGAN cantumkan nomor atau bullet point — hanya nama topik saja per baris

Format output WAJIB — hanya 9 baris teks, satu topik per baris, tanpa simbol apapun:
[topik 1]
[topik 2]
[topik 3]
[topik 4]
[topik 5]
[topik 6]
[topik 7]
[topik 8]
[topik 9]`;

      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
      const response = await generateContentWithRetryAndFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction: "Kamu adalah kurikulum expert Indonesia. Berikan HANYA 9 nama topik pembelajaran, satu per baris, tanpa nomor, bullet, atau penjelasan apapun.",
        }
      });

      const rawText = response.text || "";
      const topikList = rawText
        .split("\n")
        .map((t: string) => t.replace(/^[-*•\d.)\s]+/, "").trim())
        .filter((t: string) => t.length > 3 && t.length < 80)
        .slice(0, 9);

      if (topikList.length === 0) {
        return res.status(500).json({ error: "Gagal parse topik dari AI. Coba lagi." });
      }

      res.json({ success: true, topik: topikList });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API Endpoint to automatically create a target folder and upload/sync files to Google Drive
  app.post("/api/drive/upload", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      let token = "";
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
      
      // Fallback to empty string if not available
      if (!token) {
        token = "";
      }

      const { folderName, parentFolderUrl, files } = req.body;

      if (!files || !Array.isArray(files)) {
        return res.status(400).json({ error: "Sediaan berkas (files) wajib dilampirkan." });
      }

      // Extract Parent Folder ID from URL if exists
      let parentFolderId = "root";
      if (parentFolderUrl && parentFolderUrl.trim()) {
        const folderMatch = parentFolderUrl.trim().match(/\/folders\/([a-zA-Z0-9-_]+)/);
        if (folderMatch) {
          parentFolderId = folderMatch[1];
        } else {
          const idMatch = parentFolderUrl.trim().match(/[?&]id=([a-zA-Z0-9-_]+)/);
          if (idMatch) {
            parentFolderId = idMatch[1];
          }
        }
      }

      // Selalu gunakan Sandbox Simulator sesuai permintaan pengguna
      const isSimulatedToken = true;
      if (isSimulatedToken) {
        console.warn("[Google Drive API] Mengaktifkan Sandbox Simulator...");
        
        const fakeFolderId = `folder_GP_${Math.random().toString(36).substring(2, 10)}`;
        const processedFiles = files.map(f => ({
          fileName: f.fileName,
          fileId: `file_GP_${Math.random().toString(36).substring(2, 10)}`,
          mimeType: f.mimeType,
          size: f.size,
          driveUrl: `https://drive.google.com/open?id=file_GP_${Math.random().toString(36).substring(2, 6)}`
        }));

        return res.json({
          success: true,
          isSimulated: true,
          message: "Sinkronisasi berhasil! Folder baru otomatis dibuat di Sandbox Google Drive GuruPintar.",
          folderName: folderName,
          folderId: fakeFolderId,
          parentFolderId: parentFolderId,
          files: processedFiles,
          driveUrl: `https://drive.google.com/drive/folders/${fakeFolderId}`
        });
      }

      console.log(`[Google Drive API] Creating auto-folder: "${folderName}" inside parent: "${parentFolderId}"...`);

      // 1. Create Subfolder on Google Drive
      const createFolderRes = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: folderName,
          mimeType: "application/vnd.google-apps.folder",
          parents: [parentFolderId]
        })
      });

      if (!createFolderRes.ok) {
        const errorMsg = await createFolderRes.text();
        console.error("[Google Drive error during folder creation]", errorMsg);
        throw new Error(`Google Drive Folder creation failed: ${errorMsg}`);
      }

      const folderData = await createFolderRes.json() as any;
      const newFolderId = folderData.id;

      console.log(`[Google Drive API] Subfolder created with ID: ${newFolderId}. Uploading ${files.length} files...`);

      // 2. Upload Files to the newly created folder
      const uploadedFiles: any[] = [];
      for (const file of files) {
        const { fileName, mimeType, content, size } = file;

        // Construct standard multipart/related request payload
        const boundary = "-------314159265358979323846";
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelimiter = `\r\n--${boundary}--`;

        const metadata = {
          name: fileName,
          parents: [newFolderId],
          mimeType: mimeType
        };

        const multipartBody = 
          delimiter +
          'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          `Content-Type: ${mimeType}\r\n\r\n` +
          content +
          closeDelimiter;

        const uploadRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": `multipart/related; boundary=${boundary}`
          },
          body: multipartBody
        });

        if (!uploadRes.ok) {
          const errorDetails = await uploadRes.text();
          console.warn(`[Google Drive API] Failed to upload ${fileName}:`, errorDetails);
          continue;
        }

        const fileData = await uploadRes.json() as any;
        uploadedFiles.push({
          fileName,
          fileId: fileData.id,
          mimeType,
          size,
          driveUrl: `https://drive.google.com/open?id=${fileData.id}`
        });
      }

      return res.json({
        success: true,
        isSimulated: false,
        message: `Folder "${folderName}" berhasil dibuat otomatis!`,
        folderName,
        folderId: newFolderId,
        files: uploadedFiles,
        driveUrl: `https://drive.google.com/drive/folders/${newFolderId}`
      });

    } catch (err: any) {
      console.error("[Drive API Error]", err);
      return res.status(500).json({ error: err.message || "Gagal mengunggah file ke Google Drive" });
    }
  });

  // API Endpoint to export student attendance and grade data directly to Google Sheets
  app.post("/api/sheets/export", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      let token = "";
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
      
      if (!token) {
        token = "";
      }

      const {
        kelas,
        attendance,
        studentGrades,
        selectedAssignment,
        driveFolderUrl,
        profileSchool,
        profileName,
        profileNip
      } = req.body;

      if (!kelas) {
        return res.status(400).json({ error: "Data kelas wajib dilampirkan." });
      }

      // Extract parent folder ID from drive link
      let parentFolderId = "root";
      if (driveFolderUrl && driveFolderUrl.trim()) {
        const folderMatch = driveFolderUrl.trim().match(/\/folders\/([a-zA-Z0-9-_]+)/);
        if (folderMatch) {
          parentFolderId = folderMatch[1];
        } else {
          const idMatch = driveFolderUrl.trim().match(/[?&]id=([a-zA-Z0-9-_]+)/);
          if (idMatch) {
            parentFolderId = idMatch[1];
          }
        }
      }

      // Selalu gunakan Sandbox Simulator sesuai permintaan pengguna
      const isSimulatedToken = true;
      if (isSimulatedToken) {
        console.warn("[Google Sheets API] Mengaktifkan Sandbox Simulator...");
        
        const fakeSpreadsheetId = `sheet_GP_${Math.random().toString(36).substring(2, 10)}`;
        const sheetUrl = `https://docs.google.com/spreadsheets/d/${fakeSpreadsheetId}/edit`;

        return res.json({
          success: true,
          isSimulated: true,
          message: "Sinkronisasi Google Sheets berhasil! File rekap otomatis dibuat di Google Drive simulator.",
          sheetName: `Rekap_Presensi_Nilai_GuruPintar_${kelas.replace(/\s+/g, "_")}`,
          spreadsheetId: fakeSpreadsheetId,
          driveUrl: sheetUrl
        });
      }

      console.log(`[Google Sheets API] Creating spreadsheet: "Rekap Presensi & Nilai - ${kelas}" inside parent: "${parentFolderId}"...`);

      // 1. Create Spreadsheet file inside the folder on Google Drive
      const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: `Rekap Presensi & Nilai - ${kelas}`,
          mimeType: "application/vnd.google-apps.spreadsheet",
          parents: [parentFolderId]
        })
      });

      if (!createRes.ok) {
        const errDetails = await createRes.text();
        throw new Error(`Gagal membuat file Google Sheets: ${errDetails}`);
      }

      const fileData = await createRes.json() as any;
      const spreadsheetId = fileData.id;

      // 2. Add "Rekap Nilai" sheet structure to write into separate sheet
      try {
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/:batchUpdate`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            requests: [
              {
                addSheet: {
                  properties: {
                    title: "Rekap Nilai"
                  }
                }
              }
            ]
          })
        });
      } catch (sheetErr) {
        console.warn("[Google Sheets API] Error adding 'Rekap Nilai' sheet:", sheetErr);
      }

      // 3. Prepare Attendance Data (Sheet 1)
      const students = Object.keys(attendance || {});
      const attendanceRows: any[][] = [];
      attendanceRows.push(["REKAPITULASI PRESENSI BULANAN SISWA KURIKULUM MERDEKA"]);
      attendanceRows.push(["Sekolah:", profileSchool || "SD Negeri Indonesia", "Guru:", profileName, "Kelas:", kelas]);
      attendanceRows.push([]);
      
      const dayHeaders = Array.from({ length: 31 }, (_, idx) => (idx + 1).toString());
      attendanceRows.push(["Nama Siswa", ...dayHeaders, "Hadir", "Sakit", "Izin", "Alpa", "Persentase Kehandalan"]);

      students.forEach(student => {
        const days = attendance[student] || {};
        const dayStatuses = Array.from({ length: 31 }, (_, idx) => days[idx + 1] || "");
        
        let hadir = 0, sakit = 0, izin = 0, alpa = 0;
        dayStatuses.forEach(st => {
          if (st === "Hadir") hadir++;
          else if (st === "Sakit") sakit++;
          else if (st === "Izin") izin++;
          else if (st === "Alpa") alpa++;
        });

        const totalActiveDays = hadir + sakit + izin + alpa;
        const rate = totalActiveDays > 0 ? (hadir / totalActiveDays) * 100 : 0;
        const rateStr = `${rate.toFixed(1)}%`;

        attendanceRows.push([student, ...dayStatuses, hadir, sakit, izin, alpa, rateStr]);
      });

      // 4. Prepare Grades Data (Sheet 2)
      const gradeRows: any[][] = [];
      gradeRows.push(["REKAPITULASI BUKU NILAI & KOGNITIF EVALUASI SISWA"]);
      gradeRows.push(["Kelas:", kelas, "Guru:", profileName, "Asesmen:", selectedAssignment]);
      gradeRows.push([]);
      gradeRows.push(["Nama Siswa", "Judul Tugas/Asesmen", "Skor Kognitif", "Umpan Balik / Catatan Guru"]);

      students.forEach(student => {
        const record = studentGrades[student] || { score: 0, feedback: "" };
        gradeRows.push([student, selectedAssignment, record.score, record.feedback]);
      });

      // 5. Update Attendance Values in Sheet1 (Range: Sheet1!A1)
      const testSheet1Res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          values: attendanceRows
        })
      });

      if (!testSheet1Res.ok) {
        console.warn("[Google Sheets API] Sheet1 write failed, writing values to default range...", await testSheet1Res.text());
      }

      // 6. Update Grades Values in Rekap Nilai sheet
      const testSheet2Res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Rekap Nilai!A1?valueInputOption=USER_ENTERED`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          values: gradeRows
        })
      });

      if (!testSheet2Res.ok) {
        console.warn("[Google Sheets API] Rekap Nilai sheet write failed:", await testSheet2Res.text());
      }

      const finalUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

      return res.json({
        success: true,
        isSimulated: false,
        message: "File Google Sheets berhasil disinkronisasikan ke folder Google Drive!",
        sheetName: `Rekap_Presensi_Nilai_${kelas.replace(/\s+/g, "_")}`,
        spreadsheetId,
        driveUrl: finalUrl
      });

    } catch (error: any) {
      console.error("[Google Sheets Sync API Error]", error);
      return res.status(500).json({ error: error.message || "Gagal sinkronisasi data ke Google Sheets" });
    }
  });

  // Global API route wildcard catch-all to prevent unrouted endpoint falls to HTML pages
  app.use("/api/*", (req, res, next) => {
    res.status(404).json({
      success: false,
      error: `Endpoint API '${req.originalUrl}' tidak ditemukan`
    });
  });

  // Global Exception Handling Middleware to guarantee that any backend crash triggers a clean JSON response (never HTML!)
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("GLOBAL SERVER ERROR:", err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || "Terjadi kesalahan internal pada server",
      details: String(err)
    });
  });

  if (!process.env.VERCEL) {
    const startStandalone = async () => {
      // Serve Single-Page React App
      if (process.env.NODE_ENV !== "production") {
        const { createServer: createViteServer } = await import("vite");
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        });
        app.use(vite.middlewares);
      } else {
        const distPath = path.join(process.cwd(), "dist");
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
          res.sendFile(path.join(distPath, "index.html"));
        });
      }

      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
      });
    };

    startStandalone().catch((err) => {
      console.error("Error starting standalone server:", err);
    });
  }
