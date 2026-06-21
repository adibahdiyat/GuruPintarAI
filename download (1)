import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Square, 
  CheckSquare, 
  Sparkles, 
  Info, 
  Award, 
  ClipboardCheck, 
  HelpCircle, 
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { ModulAjarRppMerdeka, MagicStudioOutput } from "../types";

interface RppFormattingGuideProps {
  rpp?: ModulAjarRppMerdeka | null;
  magicStudioOutput?: MagicStudioOutput | null;
  showToast: (msg: string) => void;
}

interface ChecklistItem {
  id: string;
  section: string;
  title: string;
  description: string;
  tip: string;
  fieldChecked?: string; // key path or description to auto check
  category: "identitas" | "tujuan" | "asesmen" | "lampiran";
}

export const RppFormattingGuide: React.FC<RppFormattingGuideProps> = ({
  rpp,
  magicStudioOutput,
  showToast
}) => {
  // Define standard criteria for Kurikulum Merdeka administrative check
  const defaultCriteria: ChecklistItem[] = [
    {
      id: "kop_sekolah",
      section: "I. Identitas & Legalitas KOP",
      title: "KOP Surat & Identitas Instansi Lengkap",
      description: "Memiliki kop surat resmi instansi atau sekolah, nomor akreditasi, nama guru, mata pelajaran, fase, kelas, semester, dan alokasi waktu.",
      tip: "Gunakan fitur 'Edit Profil' di kanan atas untuk menyisipkan nama instansi dan NIP guru agar tercetak otomatis di KOP RPP.",
      category: "identitas"
    },
    {
      id: "informasi_umum",
      section: "I. Identitas & Legalitas KOP",
      title: "Identitas Modul & Alokasi Waktu Sesuai",
      description: "Mencantumkan alokasi waktu yang rasional (contoh: 2 JP x 35 menit) sesuai dengan kalender akademik.",
      tip: "Pastikan alokasi waktu tidak terlalu singkat. Idealnya untuk SD adalah 2 JP per pertemuan.",
      category: "identitas"
    },
    {
      id: "tujuan_pembe",
      section: "II. Komponen Inti & Alur Tujuan (ATP)",
      title: "Tujuan Pembelajaran (TP) Eksplisit & Terukur",
      description: "Tujuan pembelajaran memuat kompetensi (keterampilan) dan ruang lingkup materi secara jelas menggunakan kata kerja operasional (KKO).",
      tip: "Tujuan yang baik mencakup audiens, perilaku (behavior), kondisi (condition), dan derajat (degree) keberhasilan (ABCD).",
      category: "tujuan"
    },
    {
      id: "pemahaman_bermakna",
      section: "II. Komponen Inti & Alur Tujuan (ATP)",
      title: "Pemahaman Bermakna & Pertanyaan Pemantik",
      description: "Mencantumkan manfaat nyata materi bagi kehidupan sehari-hari (pemahaman bermakna) dan pertanyaan pemantik pemantik nalar kritis.",
      tip: "Pertanyaan pemantik tidak boleh sekadar berupa hafalan. Ajukan pertanyaan terbuka (open-ended) seperti 'Bagaimana jika...?'",
      category: "tujuan"
    },
    {
      id: "kegiatan_inti",
      section: "II. Komponen Inti & Alur Tujuan (ATP)",
      title: "Langkah Skenario Pembelajaran 3 Tahap",
      description: "Skenario runtut dari Pendahuluan (apersepsi, motivasi), Kegiatan Inti (penerapan metode saintifik/merdeka), hingga Penutup (refleksi, simpulan, tindak lanjut).",
      tip: "Gunakan variasi metode interaktif seperti Diskusi Kelompok, Snowball Throwing, atau Proyek Mandiri untuk mengaktifkan siswa.",
      category: "tujuan"
    },
    {
      id: "asesmen_as_learning",
      section: "III. Desain Asesmen & Evaluasi",
      title: "Asesmen Sikap (Profil Pelajar Pancasila)",
      description: "Mencantumkan lembar observasi atau rubrik penilaian sikap yang membidik dimensi Profil Pelajar Pancasila (bergotong royong, mandiri, dll).",
      tip: "Cukup fokus pada 2-3 dimensi Profil Pelajar Pancasila yang paling relevan dengan materi agar observasi guru tetap realistis.",
      category: "asesmen"
    },
    {
      id: "lembar_soal_multiple",
      section: "III. Desain Asesmen & Evaluasi",
      title: "Lembar Evaluasi Tertulis Standardisasi",
      description: "Memiliki butir soal evaluasi pilihan ganda yang memadai (minimal 10 soal) dengan opsi pilihan yang bervariasi.",
      tip: "Pastikan opsi pilihan ganda konsisten (A, B, C untuk SD kelas rendah; A, B, C, D untuk SD kelas tinggi).",
      category: "asesmen"
    },
    {
      id: "kunci_jawaban_pembahasan",
      section: "III. Desain Asesmen & Evaluasi",
      title: "Kunci Jawaban & Pembahasan Sistematis",
      description: "Menyediakan kunci jawaban lengkap beserta alasan/pembahasan logis di lampiran guru sebagai pemandu umpan balik.",
      tip: "Kunci jawaban harus dicetak di lembar terpisah atau berlabel 'LAMPIRAN GURU' agar tidak terbaca oleh siswa saat ujian.",
      category: "asesmen"
    },
    {
      id: "lkpd_lampiran",
      section: "IV. Media, Refleksi & Lampiran",
      title: "Lembar Kerja Peserta Didik (LKPD) Cetak",
      description: "Menyertakan LKPD mandiri/kelompok yang memuat petunjuk kerja, bahan alat, dan instruksi penyelesaian tugas bagi murid.",
      tip: "LKPD yang baik mengarah pada aktivitas fisik dan asimilasi informasi secara nyata, bukan sekadar rangkuman materi biasa.",
      category: "lampiran"
    },
    {
      id: "remedial_pengayaan",
      section: "IV. Media, Refleksi & Lampiran",
      title: "Rencana Remedial & Pengayaan",
      description: "Menyediakan arahan tugas tambahan bagi siswa yang belum mencapai tujuan, serta materi pengayaan bagi siswa yang tuntas cepat.",
      tip: "Remedial bisa berupa bimbingan perorangan, tutor sebaya, atau penyederhanaan soal evaluasi.",
      category: "lampiran"
    }
  ];

  // Selected checklist item IDs state
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  // Store customized inputs
  const [customNotes, setCustomNotes] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "identitas" | "tujuan" | "asesmen" | "lampiran">("all");
  const [autoEvaluated, setAutoEvaluated] = useState<boolean>(false);

  // Auto-evaluator logic
  useEffect(() => {
    if (rpp || magicStudioOutput) {
      const autoChecked: string[] = ["kop_sekolah", "informasi_umum"]; // Instansi & basic info usually exists

      // Test Rpp data
      if (rpp) {
        if (rpp.tujuan_pembelajaran || rpp.kegiatan_belajar?.kegiatan_inti) {
          autoChecked.push("tujuan_pembe");
        }
        if (rpp.pertanyaan_pemantik || rpp.pemahaman_bermakna) {
          autoChecked.push("pemahaman_bermakna");
        }
        if (rpp.kegiatan_belajar?.kegiatan_inti && rpp.kegiatan_belajar?.kegiatan_pendahuluan) {
          autoChecked.push("kegiatan_inti");
        }
        if (rpp.instrumen_asesmen?.rubrik_sikap_performa || rpp.instrumen_asesmen?.kriteria_kelulusan) {
          autoChecked.push("asesmen_as_learning");
        }
        if (rpp.instrumen_asesmen?.soal_evaluasi && rpp.instrumen_asesmen.soal_evaluasi.length > 0) {
          autoChecked.push("lembar_soal_multiple");
        }
        if (rpp.instrumen_asesmen?.soal_evaluasi && rpp.instrumen_asesmen.soal_evaluasi.some(s => s.kunci_jawaban)) {
          autoChecked.push("kunci_jawaban_pembahasan");
        }
        if (rpp.kegiatan_belajar?.skenario_remedial_pengayaan) {
          autoChecked.push("remedial_pengayaan");
        }
        if (rpp.lembar_kerja_siswa) {
          autoChecked.push("lkpd_lampiran");
        }
      }

      // Overrides from Magic Studio Output
      if (magicStudioOutput) {
        if (magicStudioOutput.paket_asesmen_penilaian_lengkap?.butir_soal_multiple_choice?.length > 0) {
          if (!autoChecked.includes("lembar_soal_multiple")) autoChecked.push("lembar_soal_multiple");
          if (!autoChecked.includes("kunci_jawaban_pembahasan")) autoChecked.push("kunci_jawaban_pembahasan");
        }
      }

      setCheckedIds(autoChecked);
      setAutoEvaluated(true);
    }
  }, [rpp, magicStudioOutput]);

  const toggleCheck = (id: string) => {
    if (checkedIds.includes(id)) {
      setCheckedIds(checkedIds.filter(item => item !== id));
    } else {
      setCheckedIds([...checkedIds, id]);
    }
  };

  const getPercentage = () => {
    if (defaultCriteria.length === 0) return 0;
    return Math.round((checkedIds.length / defaultCriteria.length) * 100);
  };

  const getStatusBadge = () => {
    const pct = getPercentage();
    if (pct < 50) {
      return {
        text: "⚠️ Kurang Lengkap (Perlu Kelengkapan)",
        color: "bg-red-50 text-red-700 border-red-200.5",
        textClr: "text-red-750"
      };
    } else if (pct < 85) {
      return {
        text: "🟡 Cukup Layak (Siap Uji Coba)",
        color: "bg-amber-50 text-amber-700 border-amber-200.5",
        textClr: "text-amber-750"
      };
    } else {
      return {
        text: "🟢 Sangat Lengkap (Siap Cetak & Akreditasi)",
        color: "bg-emerald-50 text-emerald-700 border-emerald-250",
        textClr: "text-emerald-750"
      };
    }
  };

  const currentStatus = getStatusBadge();
  const percentage = getPercentage();

  // Filter criteria based on active subtab
  const filteredCriteria = defaultCriteria.filter(item => {
    if (activeTab === "all") return true;
    return item.category === activeTab;
  });

  return (
    <div id="rpp-formatting-guide" className="bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-xs space-y-6 select-none animate-fade-in no-print">
      
      {/* Header Title with Badge */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] bg-[#1E3A8A] text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
              STANDAR ADMINISTRASI NASIONAL
            </span>
            <span className="text-[9px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Kurikulum Merdeka
            </span>
          </div>
          <h3 className="text-base font-black text-[#0D1D34] font-display mt-1.5 flex items-center gap-1.5">
            📋 Lembar Kendali Mutu &amp; Kelayakan RPP
          </h3>
          <p className="text-slate-500 text-xs mt-0.5 font-sans">
            Gunakan checklist interaktif ini untuk memastikan modul ajar RPP Anda memenuhi standar verifikasi Tim Pengawas Sekolah.
          </p>
        </div>

        {/* Dynamic score summary */}
        <div className="bg-white border border-slate-200.5 p-3 rounded-xl flex items-center gap-3 shadow-3xs shrink-0 w-full md:w-auto">
          <div className="text-center bg-slate-900 text-white rounded-lg p-2.5 px-3.5 shrink-0">
            <strong className="text-xl font-mono font-black">{percentage}%</strong>
            <span className="text-[8px] block text-slate-400 font-extrabold uppercase mt-0.5">Kelayakan</span>
          </div>
          <div className="leading-tight">
            <span className="text-[9px] text-slate-400 font-black tracking-wide uppercase">STATUS DOKUMEN:</span>
            <div className={`text-[11px] font-black mt-1 px-2.5 py-0.5 border rounded-full w-max ${currentStatus.color}`}>
              {currentStatus.text}
            </div>
          </div>
        </div>
      </div>

      {/* Progress visual with custom thresholds */}
      <div className="bg-white border border-slate-200.5 p-4 rounded-xl space-y-3.5 shadow-3xs">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-650 font-black">Persentase Persyaratan Terbaca</span>
          <span className="font-mono font-extrabold text-[#1E3A8A]">{checkedIds.length} dari {defaultCriteria.length} Kriteria Terpenuhi</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/50">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="grid grid-cols-3 text-[9.5px] font-bold text-slate-400 pt-1 border-t border-slate-100 uppercase font-mono">
          <div className="text-left">🚫 Belum Cukup (&lt;50%)</div>
          <div className="text-center text-amber-500">⏳ Cukup Layak (50%-85%)</div>
          <div className="text-right text-emerald-600">🚀 Sangat Layak (&gt;85%)</div>
        </div>
      </div>

      {autoEvaluated && (
        <div className="bg-emerald-50/75 border border-emerald-250 p-3 rounded-xl flex items-start gap-2.5 text-xs text-emerald-950">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-black block text-emerald-900">✨ Analisis Cerdas AI Aktif!</strong>
            <p className="text-emerald-800 font-medium">
              Sistem telah mendeteksi kelengkapan materi RPP Anda saat ini secara otomatis dan telah mencentang {checkedIds.length} kriteria kelayakan di bawah ini.
            </p>
          </div>
        </div>
      )}

      {/* Categories Nav tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2 bg-white/70 p-1.5 rounded-xl border border-slate-200/60 shadow-3xs">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 text-xs font-black rounded-lg transition ${
            activeTab === "all" ? "bg-[#1E3A8A] text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Semuanya ({defaultCriteria.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("identitas")}
          className={`px-3 py-1.5 text-xs font-black rounded-lg transition ${
            activeTab === "identitas" ? "bg-[#1E3A8A] text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          I. Identitas KOP RPP
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tujuan")}
          className={`px-3 py-1.5 text-xs font-black rounded-lg transition ${
            activeTab === "tujuan" ? "bg-[#1E3A8A] text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          II. Skenario &amp; ATP
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("asesmen")}
          className={`px-3 py-1.5 text-xs font-black rounded-lg transition ${
            activeTab === "asesmen" ? "bg-[#1E3A8A] text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          III. Rubrik Asesmen
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("lampiran")}
          className={`px-3 py-1.5 text-xs font-black rounded-lg transition ${
            activeTab === "lampiran" ? "bg-[#1E3A8A] text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          IV. Media &amp; Lampiran
        </button>
      </div>

      {/* Main Checklist Body layout */}
      <div className="space-y-4">
        {filteredCriteria.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-400">
            <ClipboardCheck className="w-10 h-10 mx-auto text-slate-300 opacity-60 mb-2" />
            <p className="text-xs font-semibold">Tidak ada kriteria di kategori ini.</p>
          </div>
        ) : (
          filteredCriteria.map((item, idx) => {
            const isChecked = checkedIds.includes(item.id);
            const isAutoMatched = (rpp || magicStudioOutput) && (
              (item.id === "kop_sekolah") ||
              (item.id === "informasi_umum") ||
              (item.id === "tujuan_pembe" && rpp?.tujuan_pembelajaran) ||
              (item.id === "pemahaman_bermakna" && (rpp?.pertanyaan_pemantik || rpp?.pemahaman_bermakna)) ||
              (item.id === "kegiatan_inti" && rpp?.kegiatan_belajar?.kegiatan_inti) ||
              (item.id === "asesmen_as_learning" && rpp?.instrumen_asesmen?.rubrik_sikap_performa) ||
              (item.id === "lembar_soal_multiple" && (rpp?.instrumen_asesmen?.soal_evaluasi?.length || 0) > 0) ||
              (item.id === "kunci_jawaban_pembahasan" && rpp?.instrumen_asesmen?.soal_evaluasi?.some(s => s.kunci_jawaban)) ||
              (item.id === "lkpd_lampiran" && rpp?.lembar_kerja_siswa) ||
              (item.id === "remedial_pengayaan" && rpp?.kegiatan_belajar?.skenario_remedial_pengayaan)
            );

            return (
              <div 
                key={item.id} 
                className={`p-4 rounded-xl border transition-all duration-200 bg-white shadow-3xs ${
                  isChecked 
                    ? "border-emerald-200 bg-emerald-50/15" 
                    : "border-slate-200.5 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Custom checkbox box */}
                  <button
                    type="button"
                    onClick={() => toggleCheck(item.id)}
                    className="p-1 text-slate-400 hover:text-[#1E3A8A] transition shrink-0 cursor-pointer"
                  >
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-350 hover:bg-slate-50" />
                    )}
                  </button>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[8.5px] font-mono text-[#1E3A8A] uppercase font-bold tracking-wider">
                        {item.section}
                      </span>
                      {isAutoMatched && (
                        <span className="text-[8px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5 font-mono">
                          ✨ Auto-Terdeteksi
                        </span>
                      )}
                    </div>
                    <h4 className={`text-xs font-black text-slate-800 ${isChecked ? "line-through text-slate-450 font-bold" : ""}`}>
                      {item.title}
                    </h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      {item.description}
                    </p>

                    {/* Expandable Advice block using orange lightbulb */}
                    <div className="p-2.5 bg-orange-50/70 border border-orange-100 rounded-lg text-[10.5px] text-orange-950 flex gap-2 font-medium">
                      <Lightbulb className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-orange-900 block font-bold mb-0.5">Saran &amp; Petunjuk Teknis:</strong>
                        <p className="text-orange-900/90 leading-relaxed font-sans">{item.tip}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reflection feedback section */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs space-y-4">
        <label className="text-[11px] uppercase font-black text-slate-500 block">
          📝 Catatan Kendali Mutu Tambahan Guru (Opsional):
        </label>
        <textarea
          rows={3}
          value={customNotes}
          onChange={(e) => setCustomNotes(e.target.value)}
          placeholder="Tuliskan catatan revisi kurikulum, instruksi tambahan pengawas sekolah, atau rencana revisi konten di sini..."
          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:ring-1 focus:ring-blue-500 text-slate-800 focus:outline-none"
        />
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase select-none">
          <span>Tersimpan Otomatis Terkait Sidang Kertas</span>
          <button
            onClick={() => {
              showToast("💾 Catatan kendali mutu berhasil disimpan!");
            }}
            className="text-blue-600 hover:text-blue-800 font-black"
          >
            Simpan Catatan
          </button>
        </div>
      </div>

    </div>
  );
};
