import React, { useState, useEffect } from "react";
import { 
  Search, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  X, 
  Check, 
  GraduationCap, 
  FolderHeart,
  Zap,
  Info,
  HelpCircle,
  Plus,
  Trash2,
  Edit,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Printer
} from "lucide-react";
import { RppTemplate } from "../templates";
import { GenerateResult, SUBJECTS, CLASS_LEVELS } from "../types";
import { translateErrorMessage } from "../App";

interface RppLibraryProps {
  onApplyTemplate: (
    level: string, 
    subject: string, 
    text: string, 
    instantResult: GenerateResult | null
  ) => void;
  onBackToDashboard: () => void;
  currentSubject?: string;
  currentClassLevel?: string;
  teacherApiKey?: string;
}

// Generates a robust prefilled template result for custom-added RPP documents
function generateMockRppResult(title: string, level: string, subject: string, text: string): GenerateResult {
  return {
    modul_ajar_rpp_merdeka: {
      komponen_inti: {
        tujuan_pembelajaran: `1. Memahami konsep utama dari "${title}" sesuai kaidah penelaahan mandiri Kurikulum Merdeka.\n2. Mengidentifikasi dampak, aplikasi praktis, dan keterkaitan topik "${title}" dalam kehidupan sehari-hari.`,
        alur_tujuan_pembelajaran: `Fase Khusus (${level}):\n- ATP-1: Memahami basis esensial topik ${title}.\n- ATP-2: Melakukan pengamatan, analisis konstruktif, atau uji coba sederhana terkait ${subject}.\n- ATP-3: Menyusun laporan evaluatif atau draf presentasi mandiri tentang ${title}.`,
        materi_pokok: text || `Materi pokok ini membahas secara komprehensif tentang aspek fundamental ${title} di dalam mata pelajaran ${subject} untuk target jenjang ${level}.`
      },
      langkah_pembelajaran: {
        kegiatan_pembuka: `Durasi Kegiatan Awal (15 Menit):\n1. Guru memberikan salam hangat pembuka, memandu doa bersama, dan mengecek kehadiran siswa secara antusias.\n2. Guru menyampaikan apersepsi berupa pertanyaan pemantik terkait ${title}: 'Apa pengalaman menarik kalian yang berhubungan dengan topik ini?'\n3. Guru menjelaskan target keterampilan dan tujuan pembelajaran hari ini.`,
        kegiatan_inti_mendalam: `Aktivitas Inti Eksplorasi (55 Menit):\n1. Landasan Teori: Guru menyajikan draf konsep, ilustrasi visual, atau studi kasus nyata yang memicu pemikiran logis mengenai ${title}.\n2. Diskusi Tim: Siswa dibagi ke dalam kelompok-kelompok kecil (4-5 siswa per tim) untuk merumuskan lembar tugas belajar.\n3. Penyelidikan Cerdas: Siswa melakukan lembar tugas penyelidikan atau analisis kelompok yang terstruktur.\n4. Berbagi Temuan: Masing-masing tim menceritakan draf kesimpulan mereka di depan kelas. Guru mengulas dan memberikan apresiasi.`,
        kegiatan_penutup: `Evaluasi & Refleksi Akhir (15 Menit):\n1. Guru bersama siswa menarik benang merah kesimpulan tentang materi ${title}.\n2. Refleksi Kelas: Guru menanyakan kesan siswa, tantangan yang dialami, serta hal baru yang dipahami.\n3. Pembelajaran ditutup dengan doa bersama, merapikan kelas, dan salam hangat.`
      },
      instrumen_asesmen: {
        jenis_asesmen: "Asesmen Formatif Kinerja & Kognitif Mandiri",
        soal_evaluasi: [
          {
            pertanyaan: `Manakah pernyataan di bawah ini yang paling tepat menggambarkan esensi utama dari topik "${title}"?`,
            pilihan_jawaban: [
              "A. Konsep bersifat abstrak dan tidak berkaitan langsung", 
              "B. Integrasi konsep dasar secara utuh, sistematis, dan fungsional", 
              "C. Teori konvensional yang mengabaikan kearifan lokal", 
              "D. Pengaruh tidak beraturan dari aspek lingkungan luar"
            ],
            kunci_jawaban: "B. Integrasi konsep dasar secara utuh, sistematis, dan fungsional"
          },
          {
            pertanyaan: `Bagaimana langkah pertama yang paling direkomendasikan saat menganalisis fenomena terkait "${title}"?`,
            pilihan_jawaban: [
              "A. Langsung menyimpulkan tanpa melakukan pengamatan awal",
              "B. Mengidentifikasi komponen penyusun dan mencatat setiap variabel",
              "C. Mengabaikan data eksperimen kelompok",
              "D. Menggunakan asumsi spekulatif tanpa rujukan modul"
            ],
            kunci_jawaban: "B. Mengidentifikasi komponen penyusun dan mencatat setiap variabel"
          }
        ]
      }
    },
    ppt_canva_ready_slides: [
      {
        slide_nomor: 1,
        layout_template: "Title Slide",
        judul_halaman: `Materi Ajar: ${title}`,
        isi_poin_materi: [
          `Menjelajahi keunikan materi "${title}" untuk jenjang ${level}.`,
          `Membangun kompetensi berlandaskan Profil Pelajar Pancasila.`
        ],
        image_generation_prompt: `A beautiful 3D digital illustration, visual clay art style representing ${title}, solid minimalist studio lighting background`
      },
      {
        slide_nomor: 2,
        layout_template: "Content Slide",
        judul_halaman: "Prinsip Utama & Pemahaman Bermakna",
        isi_poin_materi: [
          `Siswa didorong untuk memahami dasar teori secara logis dan runtut.`,
          `Mengerjakan proyek analisis nyata guna mengasah nalar kritis.`
        ],
        image_generation_prompt: `A professional infographic element displaying educational icons, clean modern design`
      }
    ],
    saran_youtube_spesifik: {
      keyword_pencarian_utama: `Pembelajaran ${title} ${level}`
    },
    magic_studio_output: {
      rpp_merdeka_formal: {
        komponen_umum: `${level} - ${subject} Kurikulum Merdeka`,
        tujuan_pembelajaran: `Menguasai, meneliti, dan memformulasikan gagasan inovatif dari materi pokok ${title} secara aktif dan kolaboratif.`,
        langkah_pembelajaran_rinci: `A. PENDAHULUAN: Berdoa bersama, absensi kelas, apersepsi interaktif bertopik ${title}.\nB. INTI: Penyajian materi sirkular, membentuk kelompok siswa, memecahkan masalah kontekstual, presentasi kelompok.\nC. PENUTUP: Refleksi kritis kesimpulan bersama guru serta evaluasi tertulis.`
      },
      lembar_kerja_peserta_didik_lkpd: {
        judul_aktivitas: `Lembar Kegiatan Mandiri Siswa: Eksplorasi ${title}`,
        petunjuk_belajar: `Cermati petunjuk modul ini, rundingkanlah bersama kelompokmu untuk memecahkan pertanyaan studi kasus ${title}.`,
        soal_atau_tugas_lapangan: [
          `Uraikan apa kegunaan praktst paling besar dari pembelajaran materi "${title}" di lingkungan sekitar tempat tinggal Anda?`,
          `Sebutkan kendala atau tantangan kelompok yang Anda hadapi dan bagaimanakah cara mengatasinya?`
        ]
      },
      paket_asesmen_penilaian_lengkap: {
        tipe: "Kuis Formatif Penilaian Harian",
        butir_soal_multiple_choice: [
          {
            no: 1,
            pertanyaan: `Penerapan paling konkret dari pilar "${title}" di luar lingkungan sekolah adalah...`,
            pilihan: [
              "A. Mengerjakan tugas di kelas saja", 
              "B. Memecahkan persoalan praktis harian secara bergotong royong", 
              "C. Menyimpan berkas materi tanpa membacanya kembali", 
              "D. Menghindari diskusi kelompok dengan orang lain"
            ],
            kunci: "B",
            pembahasan: `Penguasaan materi "${title}" diharapkan membekali kepekaan sosiokultural dan pemecahan masalah praktis secara nyata.`
          }
        ]
      },
      kolom_ice_breaking_mandiri: {
        nama_permainan: `Permainan Cari Kata Penyelamat ${title}`,
        langkah_bermain: `Siswa berdiri secara estafet menyebutkan satu kosakata unik yang berhubungan dengan mata pelajaran ${subject} tanpa boleh berulang.`
      },
      prompt_gambar_topik: `Highly realistic 3D educational asset representing ${title} concepts`
    }
  };
}

export function RppLibrary({ onApplyTemplate, onBackToDashboard, currentSubject = "", currentClassLevel = "", teacherApiKey = "" }: RppLibraryProps) {
  // Navigation tabs: "resmi" (Official standard templates) or "kustom" (My custom saved templates)
  const [activeTab, setActiveTab] = useState<"resmi" | "kustom">("resmi");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<"Semua" | "SD" | "SMP" | "SMA">("Semua");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("Semua");

  // Onboarding Wizard collapsing state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(true);

  // Selection state for customization workbench modal
  const [selectedTemp, setSelectedTemp] = useState<RppTemplate | null>(null);

  // Form states inside the customizer workbench modal
  const [customSubject, setCustomSubject] = useState("");
  const [customLevel, setCustomLevel] = useState("");
  const [customText, setCustomText] = useState("");

  // States for adding / editing custom templates manually in Library
  const [customTemplates, setCustomTemplates] = useState<RppTemplate[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Dynamic starter templates state
  const [starterTemplates, setStarterTemplates] = useState<RppTemplate[]>([]);
  const [isLoadingStarters, setIsLoadingStarters] = useState<boolean>(false);
  const [starterError, setStarterError] = useState<string>("");
  const [starterGenerated, setStarterGenerated] = useState<boolean>(false);

  const [editingCustomTemp, setEditingCustomTemp] = useState<RppTemplate | null>(null);

  // Creation/Edit Form states
  const [newTitle, setNewTitle] = useState("");
  const [newLevel, setNewLevel] = useState("SD Kelas 4");
  const [newSubject, setNewSubject] = useState("IPAS (Sains)");
  const [newCategory, setNewCategory] = useState<"sains" | "matematika" | "bahasa" | "sosial" | "agama" | "seni">("sains");
  const [newText, setNewText] = useState("");

  // Load custom templates from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("gurupintar_custom_templates");
      if (stored) {
        setCustomTemplates(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Gagal memuat template kustom:", e);
    }
  }, []);

  // Save custom templates to localStorage
  const saveCustomTemplatesToStorage = (updatedList: RppTemplate[]) => {
    setCustomTemplates(updatedList);
    try {
      localStorage.setItem("gurupintar_custom_templates", JSON.stringify(updatedList));
    } catch (e) {
      console.error("Gagal menyimpan template kustom:", e);
    }
  };

  const generateStarterTemplates = async () => {
    if (!currentSubject && !currentClassLevel) {
      setStarterError("Lengkapi profil mata pelajaran dan kelas di halaman Akun terlebih dahulu.");
      return;
    }
    
    setIsLoadingStarters(true);
    setStarterError("");
    
    try {
      const apiKey = teacherApiKey?.trim();
      const res = await fetch("/api/generate/starter_topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-user-api-key": apiKey } : {})
        },
        body: JSON.stringify({
          subject: currentSubject,
          classLevel: currentClassLevel
        })
      });
      
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error(`Respon server tidak valid (Status: ${res.status}). Silakan coba sesaat lagi.`);
      }
      
      if (!res.ok) throw new Error(data.error || "Gagal generate topik.");
      
      // Parse topik dari AI dan buat array RppTemplate
      const topikList: string[] = data.topik || [];
      
      // Tentukan category berdasarkan subject
      const getCategory = (subj: string): "sains" | "matematika" | "bahasa" | "sosial" | "agama" | "seni" => {
        const s = subj.toLowerCase();
        if (s.includes("ipa") || s.includes("ipas") || s.includes("biologi") || s.includes("fisika") || s.includes("kimia")) return "sains";
        if (s.includes("matematika") || s.includes("math")) return "matematika";
        if (s.includes("bahasa") || s.includes("sastra")) return "bahasa";
        if (s.includes("ips") || s.includes("sejarah") || s.includes("geografi") || s.includes("ski")) return "sosial";
        if (s.includes("agama") || s.includes("pai") || s.includes("tahfidz") || s.includes("tahsin") || 
            s.includes("fiqih") || s.includes("aqidah") || s.includes("akhlak") || s.includes("btq") ||
            s.includes("alquran") || s.includes("quran") || s.includes("al-qur")) return "agama";
        if (s.includes("seni") || s.includes("pjok") || s.includes("olahraga") || s.includes("musik")) return "seni";
        return "sains";
      };

      const getLevelCategory = (level: string): "SD" | "SMP" | "SMA" => {
        if (level.includes("SD")) return "SD";
        if (level.includes("SMP")) return "SMP";
        return "SMA";
      };

      const generated: RppTemplate[] = topikList.map((topik, idx) => {
        const mockResult = generateMockRppResult(topik, currentClassLevel, currentSubject, topik);
        return {
          id: `starter_${Date.now()}_${idx}`,
          title: topik,
          level: currentClassLevel,
          levelCategory: getLevelCategory(currentClassLevel),
          subject: currentSubject,
          category: getCategory(currentSubject),
          text: topik,
          prefilledResult: mockResult
        };
      });

      setStarterTemplates(generated);
      setStarterGenerated(true);
    } catch (err: any) {
      setStarterError(translateErrorMessage(err));
    } finally {
      setIsLoadingStarters(false);
    }
  };

  useEffect(() => {
    if (activeTab === "resmi" && !starterGenerated && !isLoadingStarters) {
      generateStarterTemplates();
    }
  }, [activeTab]);

  // Categories translation table
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "sains": return "Sains & IPAS";
      case "matematika": return "Matematika";
      case "bahasa": return "Bahasa & Sastra";
      case "sosial": return "Sosial & Sejarah";
      case "agama": return "Agama & Budi Pekerti";
      case "seni": return "Seni & Olahraga / PJOK";
      default: return category;
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "sains": return "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50";
      case "matematika": return "bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100/50";
      case "bahasa": return "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100/50";
      case "sosial": return "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100/50";
      case "agama": return "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100/50";
      case "seni": return "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100/50";
      default: return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  // Combine official templates and custom templates as source based on active tab
  const getSourceTemplates = (): RppTemplate[] => {
    if (activeTab === "resmi") {
      return starterTemplates;
    } else {
      return customTemplates;
    }
  };

  // Filter templates based on queries
  const filteredTemplates = getSourceTemplates().filter(temp => {
    const matchesSearch = 
      temp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      temp.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      temp.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      temp.level.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel = selectedLevelFilter === "Semua" || temp.levelCategory === selectedLevelFilter;
    const matchesCategory = selectedCategoryFilter === "Semua" || temp.category === selectedCategoryFilter;

    return matchesSearch && matchesLevel && matchesCategory;
  });

  // Open the customizer workbench panel
  const handleOpenCustomizer = (temp: RppTemplate) => {
    setSelectedTemp(temp);
    setCustomSubject(temp.subject);
    setCustomLevel(temp.level);
    setCustomText(temp.text);
  };

  const handleApplyInstant = () => {
    if (!selectedTemp) return;
    
    // Tweak the prefilledResult object so it matches custom subject/level names entered by user
    const customizedResult: GenerateResult = JSON.parse(JSON.stringify(selectedTemp.prefilledResult));
    
    // Inject custom variables into the RPP layout components
    if (customizedResult.modul_ajar_rpp_merdeka) {
      customizedResult.modul_ajar_rpp_merdeka.komponen_inti.materi_pokok = customText;
    }
    if (customizedResult.magic_studio_output?.rpp_merdeka_formal) {
      customizedResult.magic_studio_output.rpp_merdeka_formal.komponen_umum = `${customLevel} - ${customSubject} Kurikulum Merdeka`;
    }

    onApplyTemplate(customLevel, customSubject, customText, customizedResult);
    setSelectedTemp(null);
  };

  const handleApplyStudio = () => {
    if (!selectedTemp) return;
    onApplyTemplate(customLevel, customSubject, customText, null);
    setSelectedTemp(null);
  };

  // Add / Edit Custom Template Handlers
  const handleOpenAddModal = () => {
    setEditingCustomTemp(null);
    setNewTitle("");
    setNewLevel("SD Kelas 4");
    setNewSubject("IPAS (Sains)");
    setNewCategory("sains");
    setNewText("");
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (temp: RppTemplate, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening workbench
    setEditingCustomTemp(temp);
    setNewTitle(temp.title);
    setNewLevel(temp.level);
    setNewSubject(temp.subject);
    setNewCategory(temp.category);
    setNewText(temp.text);
    setIsAddModalOpen(true);
  };

  const handleDeleteTemplate = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent workbench
    if (confirm(`Apakah Anda yakin ingin menghapus template kustom "${title}"?`)) {
      const updated = customTemplates.filter(t => t.id !== id);
      saveCustomTemplatesToStorage(updated);
    }
  };

  const handleSaveCustomTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) {
      alert("Mohon lengkapi judul template dan deskripsi pokok materi!");
      return;
    }

    const levelCat: "SD" | "SMP" | "SMA" = newLevel.includes("SD") ? "SD" : newLevel.includes("SMP") ? "SMP" : "SMA";

    if (editingCustomTemp) {
      // Editing Mode
      const updatedResult = { ...editingCustomTemp.prefilledResult };
      // Inject updated text/titles recursively
      if (updatedResult.modul_ajar_rpp_merdeka) {
        updatedResult.modul_ajar_rpp_merdeka.komponen_inti.materi_pokok = newText;
      }
      if (updatedResult.magic_studio_output?.rpp_merdeka_formal) {
        updatedResult.magic_studio_output.rpp_merdeka_formal.komponen_umum = `${newLevel} - ${newSubject} Kurikulum Merdeka`;
      }

      const updated = customTemplates.map(temp => {
        if (temp.id === editingCustomTemp.id) {
          return {
            ...temp,
            title: newTitle.trim(),
            level: newLevel,
            levelCategory: levelCat,
            subject: newSubject,
            category: newCategory,
            text: newText.trim(),
            prefilledResult: updatedResult
          };
        }
        return temp;
      });
      saveCustomTemplatesToStorage(updated);
    } else {
      // Create Mode
      const generatedMock = generateMockRppResult(newTitle.trim(), newLevel, newSubject, newText.trim());
      const newTemp: RppTemplate = {
        id: "custom_" + Date.now(),
        title: newTitle.trim(),
        level: newLevel,
        levelCategory: levelCat,
        subject: newSubject,
        category: newCategory,
        text: newText.trim(),
        prefilledResult: generatedMock
      };
      saveCustomTemplatesToStorage([newTemp, ...customTemplates]);
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in relative text-left">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-[0_12px_40px_rgba(30,58,138,0.22)] border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-[-60px] left-[-30px] w-56 h-56 bg-sky-400/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-3 relative z-10 w-full md:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans leading-none flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-300 animate-pulse shrink-0" /> Dokumen & Bank RPP Saya
          </h1>
          <p className="text-xs sm:text-sm text-slate-100 font-black max-w-xl leading-relaxed">
            Topik RPP otomatis sesuai mata pelajaran kamu, atau simpan hasil generate AI ke bank RPP pribadi.
          </p>
          <div className="flex flex-wrap gap-2.5 pt-1">
            <span className="bg-white/10 text-white backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-white/10 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-300 fill-current" /> Format Instan Kilat
            </span>
            <span className="bg-white/10 text-white backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-white/10 flex items-center gap-1">
              <GraduationCap className="w-3 h-3" /> Target SD, SMP, & SMA
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="bg-white hover:bg-slate-50 text-[#1E3A8A] font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-xs transition duration-200 cursor-pointer"
          >
            ← Kembali ke Beranda
          </button>
        </div>
      </div>

      {/* 🧭 INTERACTIVE USER ONBOARDING & ALUR PENGGUNAAN GUIDE */}
      <div className="bg-white border border-slate-150 rounded-[12px] overflow-hidden shadow-3xs">
        <button
          onClick={() => setIsOnboardingOpen(!isOnboardingOpen)}
          className="w-full flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100 hover:bg-slate-100/50 transition cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <span className="font-extrabold text-xs sm:text-sm text-slate-800 uppercase tracking-wider font-sans">
              ℹ️ PANDUAN PENGGUNAAN & ALUR KERJA DOKUMEN SAYA
            </span>
          </div>
          {isOnboardingOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {isOnboardingOpen && (
          <div className="p-5 sm:p-6 space-y-6 bg-white animate-fade-in">
            {/* Conceptual Intro */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <h4 className="text-xs font-black text-indigo-900 uppercase">🎯 Apa Kegunaan Dokumen Saya Ini?</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  Sistem ini menyimpan modul rujukan Kurikulum Merdeka yang siap dicetak demi kebutuhan administrasi sekolah Anda secara mandiri. Guru tidak perlu mengaransemen silabus dari nol sewaktu kehabisan batas pemakaian AI, melainkan dapat menduplikasi struktur template resmi atau buatan guru sendiri yang sudah terbukti.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-100 space-y-2">
                <h4 className="text-xs font-black text-teal-900 uppercase">💡 Dari Mana Mengisi Dokumen Saya Ini?</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  Terdapat dua sumber utama modul:
                  <br />
                  1. <strong>Bawaan Sistem:</strong> Template guru teladan teruji yang mencakup silabus sains, matematika, bahasa, sosial, agama, dan olahraga.
                  <br />
                  2. <strong>Buatan Sendiri (Kustom):</strong> Tambahkan draf RPP Anda secara manual lewat tombol <span className="text-indigo-600 font-extrabold">"Tambah Template"</span>, atau simpan draf aktif hasil kreasi Anda di <strong>Buat Perangkat Ajar</strong> melalui tombol simpan di panel pratinjau dokumen!
                </p>
              </div>
            </div>

            {/* Interactive Timeline Alur Kerja */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">🔄 Alur Penggunaan RPP di Lapangan (4 Langkah Praktis):</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    step: "1",
                    title: "Pilih Materi",
                    desc: "Temukan materi ajar yang ingin Anda ajarkan dengan mencarinya di kolom filter jenjang kelas.",
                    icon: Search,
                    color: "bg-blue-500 text-white"
                  },
                  {
                    step: "2",
                    title: "Kustomisasi (Edit)",
                    desc: "Klik 'Pilih & Kustomisasi' untuk mengedit detail Kelas, Nama Pelajaran, atau narasi topik di Workbench.",
                    icon: Edit,
                    color: "bg-amber-500 text-white"
                  },
                  {
                    step: "3",
                    title: "Terapkan Ke Workspace",
                    desc: "Pilih format INSTAN ⚡ untuk draf langsung 1 detik tanpa AI, atau pilih STUDIO AI 🪄 untuk dipoles lagi oleh kecerdasan buatan.",
                    icon: Zap,
                    color: "bg-emerald-500 text-white"
                  },
                  {
                    step: "4",
                    title: "Cetak & Sinkronisasi",
                    desc: "Perangkat ajar yang masuk akan terintegrasi ke Lembar Rekap Nilai, cetak PDF rapi, dan cadangkan otomatis ke Google Drive.",
                    icon: Printer,
                    color: "bg-purple-500 text-white"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-50/40 border border-slate-100 rounded-xl p-4 flex gap-3 relative select-none">
                    <div className={`${item.color} w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs`}>
                      {item.step}
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-xs font-black text-slate-800 font-sans">{item.title}</h5>
                      <p className="text-[11px] leading-relaxed text-slate-500 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Tab Bar & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-1 w-full">
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("resmi")}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-extrabold rounded-t-xl transition duration-150 border-b-2 cursor-pointer ${
              activeTab === "resmi"
                ? "border-indigo-600 text-indigo-700 bg-indigo-50/20"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            ✨ Starter RPP untuk Kamu
          </button>
          <button
            onClick={() => setActiveTab("kustom")}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-extrabold rounded-t-xl transition duration-150 border-b-2 cursor-pointer ${
              activeTab === "kustom"
                ? "border-indigo-600 text-indigo-700 bg-indigo-50/20"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            ⭐ Template Kustom Saya ({customTemplates.length})
          </button>
        </div>

        {/* Dynamic button to trigger creation form directly from Perpustakaan */}
        {activeTab === "kustom" && (
          <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-750 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" /> Tambah Template Manual RPP
          </button>
        )}
      </div>

      {/* Control Area (Search and Filters) */}
      <div className="bg-white border border-slate-100/85 rounded-[12px] p-5 sm:p-6 space-y-4 shadow-3xs select-none">
        
        {/* Search Input bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            id="template-search"
            type="text"
            placeholder={activeTab === "resmi" ? "Cari rujukan sains, matematika, bahasa..." : "Cari di koleksi template kustom buatan Anda..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50/70 border border-slate-100 focus:border-[#1E3A8A] focus:bg-white focus:ring-1 focus:ring-[#1E3A8A] rounded-xl text-xs sm:text-sm font-semibold text-slate-800 transition outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")} 
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Level Category Filters */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">
            Target Jenjang Pendidikan
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "Semua", label: "Semua Jenjang" },
              { id: "SD", label: "Sekolah Dasar (SD)" },
              { id: "SMP", label: "Sekolah Menengah Pertama (SMP)" },
              { id: "SMA", label: "SMA / SMK / MA" }
            ].map((lev) => (
              <button
                key={lev.id}
                onClick={() => setSelectedLevelFilter(lev.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer select-none ${
                  selectedLevelFilter === lev.id 
                    ? "bg-[#1E3A8A] text-white shadow-xs" 
                    : "bg-slate-50/50 hover:bg-slate-100 text-slate-600 border border-slate-100"
                }`}
              >
                {lev.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Category Filters */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">
            Kategori Bidang Pelajaran
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "Semua", label: "Semua Kategori" },
              { id: "sains", label: "Sains / IPA & IPAS" },
              { id: "matematika", label: "Matematika & Geometri" },
              { id: "bahasa", label: "Bahasa & Sastra" },
              { id: "sosial", label: "Sosial & SKI" },
              { id: "agama", label: "Agama & Karakter" },
              { id: "seni", label: "Seni & Olahraga / PJOK" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer select-none ${
                  selectedCategoryFilter === cat.id 
                    ? "bg-[#1E3A8A] text-white shadow-xs" 
                    : "bg-slate-50/50 hover:bg-slate-100 text-slate-600 border border-slate-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Grid List of Templates */}
      {activeTab === "resmi" && isLoadingStarters ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-black text-slate-600">Menyiapkan topik RPP untuk {currentSubject} {currentClassLevel}...</p>
          <p className="text-xs text-slate-400">AI sedang menyesuaikan topik dengan profil mengajarmu</p>
        </div>
      ) : activeTab === "resmi" && starterError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-3">
          <p className="text-sm font-black text-red-700">⚠️ {starterError}</p>
          <button type="button" onClick={generateStarterTemplates}
            className="bg-[#1E3A8A] text-white font-black text-xs px-4 py-2 rounded-xl cursor-pointer hover:bg-blue-800 transition">
            🔄 Coba Lagi
          </button>
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div>
          {activeTab === "resmi" && starterGenerated && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="bg-emerald-100 text-emerald-700 font-black text-[9px] px-2 py-0.5 rounded-full">✓ Disesuaikan untuk kamu</span>
                <span>{currentSubject} · {currentClassLevel}</span>
              </div>
              <button type="button" onClick={() => { setStarterGenerated(false); generateStarterTemplates(); }}
                className="text-[10px] text-slate-500 hover:text-[#1E3A8A] font-bold flex items-center gap-1 cursor-pointer transition">
                🔄 Refresh topik
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((temp) => (
              <div
                key={temp.id}
                onClick={() => handleOpenCustomizer(temp)}
                className="bg-white border border-slate-100 hover:border-indigo-300 rounded-[12px] p-5 hover:shadow-xs transition duration-300 flex flex-col justify-between group relative overflow-hidden h-[240px] shadow-3xs cursor-pointer text-left"
              >
                <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${
                  activeTab === 'kustom' ? 'bg-indigo-400 group-hover:bg-indigo-600' : 'bg-slate-200 group-hover:bg-[#1E3A8A]'
                }`}></div>

                <div className="space-y-3 pl-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 border rounded-lg text-[9px] font-black uppercase tracking-wider ${getCategoryStyle(temp.category)}`}>
                      {getCategoryLabel(temp.category)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-100/60 px-2 py-0.5 rounded-md uppercase">
                        {temp.level}
                      </span>
                      {activeTab === "kustom" && (
                        <div className="flex items-center gap-1">
                          <button onClick={(e) => handleOpenEditModal(temp, e)}
                            className="p-1 rounded bg-slate-50 border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition shadow-3xs">
                            <Edit className="w-3 h-3" />
                          </button>
                          <button onClick={(e) => handleDeleteTemplate(temp.id, temp.title, e)}
                            className="p-1 rounded bg-slate-50 border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition shadow-3xs">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors text-sm sm:text-base leading-snug line-clamp-2 font-display">
                    {temp.title}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3 italic">
                    "{temp.text}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between select-none mt-auto pl-1.5">
                  <span className="text-[9.5px] font-extrabold text-[#1E3A8A] flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
                    {activeTab === 'kustom' ? 'Draf Kustom Aktif' : 'Siap Generate'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleOpenCustomizer(temp); }}
                    className="rounded-xl bg-[#1E3A8A] hover:bg-indigo-700 text-white px-3.5 py-2 text-[11px] font-black transition cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    Pilih &amp; Gunakan <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-100 rounded-[12px] p-12 text-center text-slate-500 max-w-lg mx-auto py-16 space-y-3 shadow-3xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-extrabold text-slate-700 uppercase tracking-wide">
            {activeTab === 'kustom' ? 'Belum Ada RPP Tersimpan' : 'Topik Tidak Ditemukan'}
          </h4>
          <p className="text-xs font-semibold leading-relaxed">
            {activeTab === 'kustom'
              ? 'Simpan hasil generate RPP dari Studio, atau tambah manual di sini.'
              : 'Coba reset filter atau refresh topik.'}
          </p>
          {activeTab === 'kustom' ? (
            <button onClick={handleOpenAddModal}
              className="mt-2 bg-indigo-600 hover:bg-indigo-750 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer">
              ➕ Tambah RPP Manual
            </button>
          ) : (
            <div className="flex gap-2 justify-center flex-wrap">
              <button onClick={() => { setSearchQuery(""); setSelectedLevelFilter("Semua"); setSelectedCategoryFilter("Semua"); }}
                className="mt-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer">
                Reset Filter
              </button>
              <button onClick={() => { setStarterGenerated(false); generateStarterTemplates(); }}
                className="mt-2 bg-[#1E3A8A] hover:bg-blue-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer">
                🔄 Refresh Topik
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL / WORKBENCH WORKSPACE FOR CUSTOMIZATION */}
      {selectedTemp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-150 rounded-[12px] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-xl relative animate-fade-in text-left">
            {/* Close Button hook */}
            <button
              onClick={() => setSelectedTemp(null)}
              className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition shadow-xs cursor-pointer border border-slate-200"
              title="Batal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Title & Category badges */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 border rounded-lg text-[9px] font-black uppercase tracking-wider ${getCategoryStyle(selectedTemp.category)}`}>
                  {getCategoryLabel(selectedTemp.category)}
                </span>
                <span className="text-[10px] text-indigo-700 font-extrabold uppercase">
                  Customization Workbench
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-950 pr-8">
                Sesuaikan &amp; Terapkan: {selectedTemp.title}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Sesuaikan informasi silabus di bawah sebelum dimasukkan ke dalam panggung workspace mengajar Anda.
              </p>
            </div>

            {/* Editable Fields */}
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Target Level Field */}
                <div className="space-y-1.5">
                  <label id="lbl-custom-level" htmlFor="input-custom-level" className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                    1. Target Kelas &amp; Jenjang:
                  </label>
                  <input
                    id="input-custom-level"
                    type="text"
                    value={customLevel}
                    onChange={(e) => setCustomLevel(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-250 focus:border-[#3B82F6] focus:bg-white focus:ring-1 focus:ring-[#3B82F6] rounded-xl text-xs font-semibold text-slate-800 transition outline-none"
                    placeholder="Contoh: SD Kelas 4"
                  />
                </div>

                {/* Subject Field */}
                <div className="space-y-1.5">
                  <label id="lbl-custom-subject" htmlFor="input-custom-subject" className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                    2. Mata Pelajaran Merdeka:
                  </label>
                  <input
                    id="input-custom-subject"
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-250 focus:border-[#3B82F6] focus:bg-white focus:ring-1 focus:ring-[#3B82F6] rounded-xl text-xs font-semibold text-slate-800 transition outline-none"
                    placeholder="Contoh: Seni Rupa"
                  />
                </div>
              </div>

              {/* Text Area Description */}
              <div className="space-y-1.5">
                <label id="lbl-custom-text" htmlFor="input-custom-text" className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                  3. Deskripsi Pokok &amp; Ruang Lingkup Materi:
                </label>
                <textarea
                  id="input-custom-text"
                  rows={4}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-250 focus:border-[#3B82F6] focus:bg-white focus:ring-1 focus:ring-[#3B82F6] rounded-xl text-xs font-medium text-slate-800 transition outline-none resize-none leading-relaxed"
                  placeholder="Ketik topik materi secara singkat..."
                />
              </div>
            </div>

            {/* Quick Warning/Notice */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex gap-2.5">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-[10.5px] leading-relaxed text-blue-850 font-medium">
                <strong className="font-extrabold uppercase text-[9.5px] block text-blue-900">Tips Memasukkan RPP:</strong>
                Gunakan <strong>Gunakan RPP Instan (⚡ Kilat!)</strong> untuk memuat draf dokumen siap pakai secara kilat dalam 1 detik. Gunakan <strong>Terapkan ke Studio AI 🪄</strong> jika Anda menghendaki model AI Gemini mengelaborasi ide yang baru Anda sunting.
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2.5 select-none">
              <button
                type="button"
                onClick={() => setSelectedTemp(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-250 text-slate-700 hover:bg-slate-100 text-xs font-black transition cursor-pointer text-center"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleApplyStudio}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 border border-transparent text-white text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-300" /> Terapkan ke Studio AI 🪄
              </button>

              <button
                type="button"
                onClick={handleApplyInstant}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 border border-transparent text-white text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Zap className="w-4 h-4 text-yellow-300 fill-current" /> Gunakan RPP Instan (⚡ Kilat!)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ➕ MODAL FOR ADDING/EDITING CUSTOM TEMPLATES WITHIN LIBRARY */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveCustomTemplate}
            className="bg-white border border-slate-150 rounded-[12px] max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-xl relative animate-fade-in text-left"
          >
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition shadow-xs cursor-pointer border border-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] text-indigo-700 font-extrabold uppercase block font-sans">
                Koleksi Template Pribadi
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-950">
                {editingCustomTemp ? "✏️ Perbarui Template RPP Kustom" : "➕ Daftarkan Template RPP Kustom Baru"}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Daftarkan draf mata pelajaran yang sering Anda ampu. Template ini terdaftar di peramban lokal dan tersinkronisasi cepat ke workspace.
              </p>
            </div>

            <div className="space-y-4 pt-1.5">
              {/* Title Field */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                  Nama / Judul Topik RPP:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-[#3B82F6] focus:bg-white focus:ring-1 focus:ring-[#3B82F6] rounded-xl text-xs font-semibold text-slate-800 transition outline-none"
                  placeholder="Contoh: Energi Alternatif & Kincir Angin"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Level Dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                    Target Kelas &amp; Jenjang:
                  </label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-[#3B82F6] focus:bg-white rounded-xl text-xs font-semibold text-slate-800 transition outline-none cursor-pointer"
                  >
                    {CLASS_LEVELS.map((clev) => (
                      <option key={clev} value={clev}>{clev}</option>
                    ))}
                  </select>
                </div>

                {/* Subject Dropdown / Input Link */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                    Mata Pelajaran:
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-[#3B82F6] focus:bg-white rounded-xl text-xs font-semibold text-slate-800 transition outline-none cursor-pointer"
                  >
                    {SUBJECTS.filter(s => s !== "Input Mapel Manual (Ketik Sendiri)").map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                    Kategori Bidang Pelajaran:
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-[#3B82F6] focus:bg-white rounded-xl text-xs font-semibold text-slate-800 transition outline-none cursor-pointer"
                  >
                    <option value="sains">Sains &amp; IPAS</option>
                    <option value="matematika">Matematika &amp; Geometri</option>
                    <option value="bahasa">Bahasa &amp; Sastra</option>
                    <option value="sosial">Sosial &amp; Sejarah</option>
                    <option value="agama">Agama &amp; Budi Pekerti</option>
                    <option value="seni">Seni &amp; Olahraga / PJOK</option>
                  </select>
                </div>

                <div className="p-3.5 bg-indigo-50 border border-indigo-150 rounded-xl flex items-start gap-2 text-indigo-950">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] sm:text-[10.5px] leading-relaxed font-semibold">
                    <strong>Penskemaan Cerdas:</strong> Sistem kami akan membuat draf materi ajar sirkuler lengkap (LKPD, instrumen penilaian harian) secara otomatis bermodalkan deskripsi di kanan Anda!
                  </p>
                </div>
              </div>

              {/* Text Area Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                  Deskripsi Pokok &amp; Ruang Lingkup Materi:
                </label>
                <textarea
                  required
                  rows={4}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-[#3B82F6] focus:bg-white focus:ring-1 focus:ring-[#3B82F6] rounded-xl text-xs font-medium text-slate-800 transition outline-none resize-none leading-relaxed"
                  placeholder="Contoh: Energi alternatif adalah pemanfaatan kekuatan alam terbarukan seperti angin, air, matahari, biomassa, bahari..."
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5 select-none">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-250 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
              >
                Kembali
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-750 border border-transparent text-white text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" /> Simpan ke Dokumen Saya
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
