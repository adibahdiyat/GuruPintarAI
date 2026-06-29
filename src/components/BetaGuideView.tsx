import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  CheckCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  MessageSquare,
  Award,
  Users,
  Calendar,
  BookOpen,
  Clipboard,
  Info,
  Bug,
  Lightbulb,
  Heart,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BetaGuideViewProps {
  profileName: string;
  profileSchool: string;
  profileNip: string;
  loginEmail: string;
  storedFeedbacks: any[];
  setStoredFeedbacks: (feedbacks: any[]) => void;
  showToast: (msg: string) => void;
  setCurrentScreen: (screen: any) => void;
  playSfx: (type: string) => void;
  teacherApiKey: string;
  setTeacherApiKey: (key: string) => void;
}

export default function BetaGuideView({
  profileName,
  profileSchool,
  profileNip,
  loginEmail,
  storedFeedbacks,
  setStoredFeedbacks,
  showToast,
  setCurrentScreen,
  playSfx,
  teacherApiKey,
  setTeacherApiKey
}: BetaGuideViewProps) {
  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Alur checklist state
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("gp_beta_checklist");
      return saved ? JSON.parse(saved) : {
        profil: false,
        kelas: false,
        rpp: false,
        absensi: false,
        nilai: false
      };
    } catch {
      return {
        profil: false,
        kelas: false,
        rpp: false,
        absensi: false,
        nilai: false
      };
    }
  });

  // Local feedback fields
  const [category, setCategory] = useState<"bug" | "idea" | "love">("idea");
  const [feedbackText, setFeedbackText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // Local state for API Key input before submitting/saving
  const [tempKey, setTempKey] = useState(teacherApiKey || "");
  const [showSavedAnimation, setShowSavedAnimation] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Sync tempKey with teacherApiKey if prop changes
  useEffect(() => {
    setTempKey(teacherApiKey || "");
  }, [teacherApiKey]);

  // Filter feedbacks for this user-level
  const myFeedbacks = storedFeedbacks.filter(f => f.user === (profileName || "Guru Anonim"));

  // Save checklist helper
  const toggleChecklist = (key: string) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    try {
      localStorage.setItem("gp_beta_checklist", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    playSfx("click");
    
    // Count completed task
    const total = Object.values(updated).filter(Boolean).length;
    if (total === 5 && !checklist[key]) {
      playSfx("success");
      showToast("🏆 Luar biasa! Anda telah menyelesaikan seluruh latihan alur uji coba beta!");
    }
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || isSending) return;

    setIsSending(true);
    playSfx("click");

    const feedbackTypeLabel = category === "bug" ? "Laporan Bug" : category === "idea" ? "Saran Fitur" : "Pujian / Masukan";

    const newFeedback = {
      id: Date.now(),
      type: feedbackTypeLabel,
      text: feedbackText.trim(),
      timestamp: new Date().toISOString(),
      user: profileName || "Guru Anonim"
    };

    const updated = [newFeedback, ...storedFeedbacks];
    setStoredFeedbacks(updated);
    try {
      localStorage.setItem("grup_feedback_list", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    try {
      const response = await fetch("https://formsubmit.co/ajax/721d28a4e2f9b2e2b97046cc62e2c637", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: profileName || "Guru Anonim",
          email: loginEmail || "guru-anonim@email.com",
          category: feedbackTypeLabel,
          message: feedbackText.trim(),
          school: profileSchool || "-",
          nip: profileNip || "-",
          _subject: `[GuruPintar.AI Beta Feedback] ${feedbackTypeLabel} dari ${profileName || "Guru Anonim"}`,
          _replyto: loginEmail || "adibahdiyat98@gmail.com",
          _captcha: "false"
        })
      });

      if (response.ok) {
        showToast("💌 Masukan Anda berhasil terkirim langsung ke email pengembang!");
      } else {
        showToast("✓ Berhasil menyimpan masukan Anda secara luring.");
      }
    } catch (err) {
      console.error("Error sending feedback:", err);
      showToast("✓ Berhasil menyimpan masukan secara luring di perangkat.");
    } finally {
      setIsSending(false);
      setFeedbackText("");
      setIsSent(true);
      playSfx("success");
    }
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tempKey.trim();
    if (!trimmed) {
      showToast("⚠️ Harap masukkan API Key terlebih dahulu.");
      return;
    }
    
    setTeacherApiKey(trimmed);
    setShowSavedAnimation(true);
    playSfx("success");
    showToast("💾 Sukses! API Key Gemini tersimpan kokoh di browser Anda.");
    
    setTimeout(() => {
      setShowSavedAnimation(false);
    }, 4500);
  };

  const faqData = [
    {
      q: "Apa itu Program Beta Tester GuruPintar.AI?",
      a: "Program Beta Tester ini dicanangkan khusus untuk para guru dan pendidik di Indonesia demi menguji coba fungsionalitas pembuatan perangkat pembelajaran Kurikulum Merdeka berbasis kecerdasan buatan (offline-first & online sync) sebelum dilakukan perilisan penuh ke publik."
    },
    {
      q: "Bagaimana cara AI membantu saya membuat Perangkat Ajar?",
      a: "Cukup masuk ke tab 'Buat Perangkat Ajar', pilih tingkat kelas, mata pelajaran, dan tulis topik materi yang Anda ajarkan. Sistem AI kami akan menjabarkan secara terperinci Tujuan Pembelajaran (TP), Alur Tujuan Pembelajaran (ATP), Modul Ajar, hingga rubrik asesmen secara dinamis sesuai kaidah kurikulum resmi."
    },
    {
      q: "Apakah data siswa yang saya masukkan aman?",
      a: "Sangat aman. Seluruh data siswa, catatan nilai, kehadiran siswa, dan dokumen ajar Anda disimpan secara offline menggunakan penyimpanan browser lokal (localStorage). Data tidak disebarluaskan dan tidak diproses untuk keperluan komersial apa pun."
    },
    {
      q: "Bagaimana cara mencetak / mengekspor RPP ke Microsoft Word?",
      a: "Setelah AI selesai merumuskan perangkat ajar, klik tombol 'Unduh Word (.docx)' di panel preview. Berkas instan akan otomatis terunduh lengkap dengan format tabel, penomoran, dan tata letak dokumen formal siap cetak."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto text-left pb-24"
    >
      {/* 🔮 ELEGANT GRADIENT HEADER CARD */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] text-white p-8 rounded-3xl relative overflow-hidden shadow-[0_12px_45px_rgba(30,58,138,0.2)] border border-white/10">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-10 w-48 h-48 bg-sky-200/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-2">
          <span className="bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase text-sky-100 inline-flex items-center gap-1.5 border border-white/15">
            <Sparkles className="w-3 h-3 text-amber-300" /> PROGRAM BETA TESTER GP.AI
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight leading-tight">
            Panduan &amp; Tutorial Penggunaan Fitur Beta
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-2xl">
            Selamat datang pendidik hebat tanah air! Panduan ini dirancang untuk memperkenalkan secara komprehensif seluruh ekosistem canggih GuruPintar.AI.
          </p>
        </div>
      </div>

      {/* 💡 WELCOME RECOGNITION BOX */}
      <div className="bg-blue-50/60 border border-blue-200/50 p-6 rounded-2xl flex gap-4 items-start shadow-3xs">
        <div className="p-3 bg-[#EBF3FF] text-[#1E3A8A] rounded-xl shrink-0">
          <Award className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-[#1E3A8A]">Apresiasi Penguji Beta Resmi</h3>
          <p className="text-xs text-slate-750 font-medium leading-relaxed">
            Terima kasih kepada <strong>{profileName || "Ibu/Bapak Guru Hebat"}</strong> dari <strong>{profileSchool || "Sekolah Mitra Beta"}</strong> karena telah bersedia berkontribusi untuk menyempurnakan platform ini. Tanggapan jujur dan temuan dari aktivitas mengajar Anda adalah kunci utama transformasi digital pendidikan kita.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: FEATURES & FAQ (md:col-span-7) */}
        <div className="md:col-span-7 space-y-6">
          
          {/* FEATURE SUPERPOWERS SECTION */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-3xs">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span>🌟</span> FUNGSI UNGGULAN UNTUK ANDA UJI COBA
            </h3>
            
            <div className="space-y-3.5">
              
              {/* CARD 1: STUDIO DEVICE AI */}
              <div className="flex gap-4 p-4 rounded-2xl bg-indigo-50/20 hover:bg-indigo-50/40 border border-slate-100 hover:border-indigo-100 transition group">
                <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl shrink-0 h-11 w-11 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                    Studio RPP &amp; Modul Ajar AI
                    <span className="text-[8px] bg-indigo-600 text-white font-extrabold px-1.5 py-0.5 rounded-full">POPULER</span>
                  </h4>
                  <p className="text-[11.5px] text-slate-500 font-medium leading-relaxed">
                    Menghasilkan satu set dokumen RPP Kurikulum Merdeka secara modular hanya dengan menulis topik dasar pembelajaran. Mendukung ekspor format Microsoft Word (.docx).
                  </p>
                </div>
              </div>

              {/* CARD 2: ABSENSI OFFLINE */}
              <div className="flex gap-4 p-4 rounded-2xl bg-emerald-50/20 hover:bg-emerald-50/40 border border-slate-100 hover:border-emerald-100 transition group">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl shrink-0 h-11 w-11 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-800">
                    Sistem Kehadiran &amp; Absensi Offline
                  </h4>
                  <p className="text-[11.5px] text-slate-500 font-medium leading-relaxed">
                    Pengelolaan absensi harian kelas binaan tanpa butuh koneksi internet. Tersedia visual ringkasan tingkat kehadiran kumulatif dan dinamika siswa per bulan.
                  </p>
                </div>
              </div>

              {/* CARD 3: CATATAN SIKLUS NILAI */}
              <div className="flex gap-4 p-4 rounded-2xl bg-amber-50/20 hover:bg-amber-50/40 border border-slate-100 hover:border-amber-100 transition group">
                <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl shrink-0 h-11 w-11 flex items-center justify-center">
                  <Clipboard className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-800">
                    Nilai Formatif &amp; Evaluasi Rapor
                  </h4>
                  <p className="text-[11.5px] text-slate-500 font-medium leading-relaxed">
                    Rekam pencapaian materi, kepatuhan, sikap, dan buat rumusan perkembangan raport deskripsi otomatis untuk siswa Anda berdasarkan siklus nilai formatif.
                  </p>
                </div>
              </div>

              {/* CARD 4: CALENDAR SYNC */}
              <div className="flex gap-4 p-4 rounded-2xl bg-purple-50/20 hover:bg-purple-50/40 border border-slate-100 hover:border-purple-100 transition group">
                <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl shrink-0 h-11 w-11 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-800">
                    Sinkronisasi Guru Agenda
                  </h4>
                  <p className="text-[11.5px] text-slate-500 font-medium leading-relaxed">
                    Rancang jadwal mengajar harian, mingguan, dan hubungkan draf rencana ke Google Calendar Anda secara mulus seketika.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* ACCORDION FAQ SECTION */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-3xs">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#1E3A8A]" /> PERTANYAAN UMUM GURU TESTER
            </h3>

            <div className="space-y-2.5">
              {faqData.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="border border-slate-150 rounded-2xl overflow-hidden transition-colors">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenFaq(isOpen ? null : idx);
                        playSfx("click");
                      }}
                      className="w-full flex items-center justify-between p-4 bg-slate-50/40 hover:bg-slate-50 text-left transition"
                    >
                      <span className="text-xs font-extrabold text-slate-800 shrink-0 select-none pr-3">
                        {idx + 1}. {item.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 border-t border-slate-150 bg-white text-[11px] text-slate-600 font-medium leading-relaxed">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: RECURRING TUTORIAL CHECKLIST & FEEDBACK (md:col-span-5) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* CHECKLIST TRAINING TRACKER */}
          <div className="bg-gradient-to-b from-[#1F2937] to-[#111827] text-white p-5.5 rounded-3xl shadow-3xs">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2 border-b border-white/5 pb-2">
              🎯 ALUR UJI COBA (CHECKLIST MANDIRI)
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">
              Coba lakukan 5 aktivitas wajib berikut untuk melatih pembiasaan alur navigasi aplikasi:
            </p>

            <div className="space-y-2.5">
              {[
                { key: "profil", icon: "👤", desc: "Mutakhirkan foto & biodata pribadi Anda di Profil Guru" },
                { key: "kelas", icon: "🏫", desc: "Tambah kelas binaan baru (misal: 4A, 5B) di Beranda" },
                { key: "rpp", icon: "✏️", desc: "Buat 1 RPP/Modul Ajar dari AI, periksa & klik unduh PDF/Word" },
                { key: "absensi", icon: "✅", desc: "Isi data kehadiran 1-2 siswa baru di tab Kehadiran Siswa" },
                { key: "nilai", icon: "📓", desc: "Beri feedback deskripsi, beri rating perilaku di Catatan Nilai" },
              ].map((step) => {
                const isChecked = checklist[step.key];
                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => toggleChecklist(step.key)}
                    className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left border cursor-pointer transition ${
                      isChecked 
                        ? "bg-emerald-500/10 border-emerald-500/40 hover:bg-emerald-500/15" 
                        : "bg-white/5 border-white/5 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-lg shrink-0 pt-0.5">{step.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[11px] font-bold leading-normal ${isChecked ? "text-emerald-300 line-through" : "text-slate-100"}`}>
                        {step.desc}
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                      isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-500"
                    }`}>
                      {isChecked && <CheckCircle className="w-3.5 h-3.5 fill-white text-emerald-500" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[9.5px] font-black text-slate-400">Penyelesaian:</span>
              <span className="text-[11px] font-black bg-[#EBF3FF] text-[#1E3A8A] px-2.5 py-0.5 rounded-full">
                {Object.values(checklist).filter(Boolean).length} / 5 Langkah
              </span>
            </div>
          </div>

          {/* 🔑 DYNAMIC GEMINI API KEY CONFIGURATION BLOCK */}
          <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white p-6 rounded-3xl border border-blue-500/30 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  🔑 KONFIGURASI API KEY GEMINI (WAJIB)
                </h3>
                <p className="text-[9.5px] text-slate-400 font-semibold uppercase">Prasyarat Kecerdasan Buatan (AI)</p>
              </div>
              {teacherApiKey ? (
                <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[9px] font-black px-2.5 py-1 rounded-full animate-pulse select-none">
                  ● AKTIF &amp; TERHUBUNG
                </span>
              ) : (
                <span className="bg-red-500/20 border border-red-500/40 text-red-400 text-[9px] font-black px-2.5 py-1 rounded-full select-none animate-bounce">
                  ● BELUM DIKONFIGURASI
                </span>
              )}
            </div>

            {/* CLEAR DETAILED EXPLANATION */}
            <div className="space-y-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-200">🔍 Apa itu API Key Gemini &amp; Kenapa dibutuhkan?</h4>
                <p className="text-[11px] text-slate-350 leading-relaxed font-medium">
                  <strong>API Key Gemini</strong> adalah jembatan penghubung rahasia antara perangkat Anda dengan server otak AI Google Gemini yang cerdas. Tanpa kunci ini, fitur AI kami tidak dapat diaktifkan.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-200">⚙️ Untuk fungsi apa saja API Key dijalankan?</h4>
                <ul className="text-[11px] text-slate-350 leading-relaxed pl-4 list-disc space-y-1 font-medium">
                  <li><strong>Modul Ajar (RPP) AI:</strong> Menyusun modul ajar interaktif lengkap langkah demi langkah otomatis.</li>
                  <li><strong>Kuis AI &amp; Soal Ujian:</strong> Menulis 20 PG, 10 isian singkat, dan 5 uraian lengkap dengan kunci jawaban instan.</li>
                  <li><strong>LKPD Siswa:</strong> Merancang instrumen lembar kerja siswa dinamis.</li>
                  <li><strong>Siklus Penilaian Raport:</strong> Memformulasikan deskripsi deskriptif perilaku murid otomatis.</li>
                </ul>
              </div>
            </div>

            {/* STEP BY STEP TUTORIAL */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-200">🛠️ Panduan Mendapatkan API Key Gratis:</h4>
              <ol className="text-[10.5px] space-y-2 text-slate-350 list-decimal pl-4.5 font-medium leading-relaxed">
                <li>
                  Kunjungi konsol resmi Google AI: <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 font-extrabold hover:underline">aistudio.google.com/apikey ↗</a>
                </li>
                <li>
                  Masuk menggunakan Akun Google pribadi Anda (gratis selamanya, tidak memerlukan kartu kredit).
                </li>
                <li>
                  Klik tombol biru dominan <strong className="text-white">"Create API Key"</strong> lalu salin kodenya.
                </li>
              </ol>
            </div>

            {/* INTERACTIVE INPUT & SAVE FORM */}
            <form onSubmit={handleSaveApiKey} className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5 relative">
              
              {/* SUCCESS ANIMATED OVERLAY ROW */}
              <AnimatePresence>
                {showSavedAnimation && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 bg-slate-900/95 rounded-2xl flex flex-col items-center justify-center text-center p-4 z-20 space-y-1.5 border border-emerald-500/50"
                  >
                    <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h4 className="text-xs font-extrabold text-emerald-300">API Key Berhasil Disimpan &amp; Diaktifkan!</h4>
                    <p className="text-[10px] text-slate-300 max-w-xs font-medium leading-normal">
                      Kini seluruh fitur pembuatan dokumen ajar otomatis dengan kecerdasan buatan siap Anda gunakan sepenuhnya.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <label className="text-[9.5px] font-black text-slate-300 block uppercase tracking-wider">
                Tempel Kunci API Key Gemini Anda di sini:
              </label>
              
              {/* Password visibility toggle container */}
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={tempKey}
                  onChange={(e) => {
                    setTempKey(e.target.value);
                  }}
                  placeholder="Contoh: AIzaSyD..."
                  className="bg-white/10 text-white placeholder-slate-500 font-mono text-xs p-3 pr-10 rounded-xl border border-white/10 hover:border-white/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 w-full outline-none transition-all font-semibold"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowKey(!showKey);
                    playSfx("click");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1 cursor-pointer flex items-center justify-center"
                  title={showKey ? "Sembunyikan Kunci" : "Tampilkan Kunci"}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/[0.05]">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 shadow-md select-none"
                  >
                    <span>Simpan Key</span> 💾
                  </button>

                  {(teacherApiKey || tempKey) && (
                    <button
                      type="button"
                      onClick={() => {
                        setTempKey("");
                        setTeacherApiKey("");
                        playSfx("click");
                        showToast("🗑️ API Key berhasil dihapus dari sistem.");
                      }}
                      className="flex-1 sm:flex-none bg-red-950/40 hover:bg-red-900/40 active:scale-95 text-red-300 hover:text-red-200 border border-red-900/30 text-xs font-medium px-4 py-2 rounded-xl transition duration-150 cursor-pointer select-none"
                      title="Hapus API Key"
                    >
                      Hapus
                    </button>
                  )}

                  {tempKey.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = tempKey.trim();
                        if (trimmed.length > 15) {
                          showToast("✅ Sip! Panjang karakter API Key memadai dan tampak valid.");
                          playSfx("success");
                        } else {
                          showToast("⚠️ Peringatan: API Key terlalu pendek.");
                          playSfx("success");
                        }
                      }}
                      className="text-blue-400 hover:text-blue-300 text-xs font-bold hover:underline cursor-pointer py-2 px-1 select-none shrink-0"
                    >
                      Uji Format Key
                    </button>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 font-medium select-none text-left sm:text-right">
                  Penyimpanan: <strong className="text-slate-300">Browser Lokal (Aman)</strong>
                </div>
              </div>

            </form>

            {/* PRO-TIP ON GEMINI PRICING */}
            <div className="bg-blue-950/40 border border-blue-900/60 p-3.5 rounded-xl flex gap-2.5 items-start">
              <span className="text-sm shrink-0">💡</span>
              <p className="text-[10px] text-blue-200 leading-normal font-semibold">
                <strong>Informasi Biaya:</strong> Skema penggunaan API Key gratis dari Google AI Studio memberikan kuota pemuatan RPP gratis setiap menit. Sangat hemat dan ramah pendidik!
              </p>
            </div>
          </div>

          {/* DYNAMIC FEEDBACK SUBMISSION */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-3xs text-slate-800">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 shadow-3xs pb-2 border-b border-slate-50 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" /> KIRIM MASUKAN INSTAN
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold mb-3 leading-relaxed">
              Ada kendala, menemukan bug, atau punya ide fitur baru? Kirimkan langsung ke tim pengembang kami melalu formulir ini.
            </p>

            {isSent ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <span className="text-2xl block animate-bounce">💌</span>
                <h4 className="text-xs font-black text-emerald-900 font-display">Terkirim Hasil Evaluasi!</h4>
                <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">
                  Terima kasih banyak atas partisipasinya! Pengembang akan segera menanggapinya demi menyusun pembaruan versi rilis stabil platform.
                </p>
                <button
                  type="button"
                  onClick={() => { setIsSent(false); }}
                  className="bg-emerald-600 hover:bg-[#1E3A8A] text-white text-[9.5px] font-black py-2 px-3.5 rounded-xl transition cursor-pointer"
                >
                  Tulis Masukan Lagi
                </button>
              </div>
            ) : (
              <form onSubmit={submitFeedback} className="space-y-3">
                
                {/* CATEGORIES BUTTONS GROUP */}
                <div className="grid grid-cols-3 gap-1 px-0.5">
                  <button
                    type="button"
                    onClick={() => { setCategory("bug"); playSfx("click"); }}
                    className={`py-2 px-1 text-[10px] font-black rounded-xl border flex flex-col items-center gap-1 transition ${
                      category === "bug" 
                        ? "bg-red-50 border-red-300 text-red-700" 
                        : "bg-slate-50 border-slate-150 text-slate-650 hover:bg-slate-100"
                    }`}
                  >
                    <Bug className="w-3.5 h-3.5 text-red-500" />
                    <span>Lapor Bug</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCategory("idea"); playSfx("click"); }}
                    className={`py-2 px-1 text-[10px] font-black rounded-xl border flex flex-col items-center gap-1 transition ${
                      category === "idea" 
                        ? "bg-amber-50 border-amber-300 text-amber-700" 
                        : "bg-slate-50 border-slate-150 text-slate-650 hover:bg-slate-100"
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Saran Fitur</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCategory("love"); playSfx("click"); }}
                    className={`py-2 px-1 text-[10px] font-black rounded-xl border flex flex-col items-center gap-1 transition ${
                      category === "love" 
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700" 
                        : "bg-slate-50 border-slate-150 text-slate-650 hover:bg-slate-100"
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    <span>Pujian</span>
                  </button>
                </div>

                <div>
                  <textarea
                    rows={3}
                    required
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Contoh: 'Di fitur nilai kelas 4A, deskripsinya di raport terkadang kurang detail, tolong tambahkan opsi pilihan kalimat...'"
                    className="w-full text-[11px] p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/10 outline-none transition font-medium text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending || !feedbackText.trim()}
                  className="w-full bg-[#1E3A8A] hover:bg-blue-700 disabled:bg-slate-200 text-white font-black text-xs py-3 rounded-2xl cursor-pointer transition shadow-3xs flex items-center justify-center gap-2 select-none"
                >
                  {isSending ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Mengirimkan Masukan...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Evaluasi Sekarang ✈️</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* MY RECENT SAVED FEEDBACKS */}
            {myFeedbacks.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">RIWAYAT MASUKAN SAYA ({myFeedbacks.length}):</p>
                <div className="max-h-[140px] overflow-y-auto space-y-1.5 scrollbar-none pr-1">
                  {myFeedbacks.slice(0, 3).map((f: any, i: number) => (
                    <div key={i} className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl space-y-1 text-[10px]">
                      <div className="flex items-center justify-between">
                        <span className={`font-black text-[9px] uppercase px-1.5 py-0.5 rounded ${
                          f.type.includes("Bug") 
                            ? "bg-red-50 text-red-700" 
                            : f.type.includes("Saran") 
                              ? "bg-amber-50 text-amber-700" 
                              : "bg-emerald-50 text-emerald-700"
                        }`}>{f.type}</span>
                        <span className="text-[8px] text-slate-400 font-mono">
                          {new Date(f.timestamp).toLocaleDateString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[#334155] font-medium leading-relaxed italic">{f.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* QUICK INLINE ACTION TRIGGERS */}
      <div className="bg-white border border-slate-200/90 p-6 rounded-3xl text-center space-y-4 shadow-3xs">
        <h3 className="text-sm font-black text-slate-800">Apakah Anda Siap Mencoba Studio Pembuatan RPP Cerdas?</h3>
        <p className="text-xs text-slate-500 font-medium max-w-lg mx-auto">
          Gunakan kekuatan kecerdasan buatan untuk membantu Anda menyusun program pengajaran, asesmen formatif, soal kuis, hingga lembar kegiatan (LKPD) secara otomatis dalam hitungan detik.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => { setCurrentScreen("studio"); playSfx("success"); }}
            className="w-full sm:w-auto bg-[#1E3A8A] hover:bg-blue-700 text-white font-black text-xs px-8 py-3.5 rounded-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 shadow-3xs cursor-pointer"
          >
            Mulai Buat Perangkat Ajar Sekarang <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => { setCurrentScreen("home"); playSfx("click"); }}
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-black text-xs px-6 py-3.5 rounded-2xl transition"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>

    </motion.div>
  );
}
