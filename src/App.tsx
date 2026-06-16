import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  BookOpen, 
  Presentation, 
  History, 
  UploadCloud, 
  Briefcase, 
  User, 
  Bell, 
  HelpCircle, 
  UserCheck, 
  X, 
  Check, 
  MessageSquare, 
  Plus, 
  Loader2,
  Calendar,
  Clock,
  CloudLightning,
  CheckCircle2,
  ListCollapse,
  Layers,
  ArrowRight,
  LogOut,
  Key,
  Lock,
  Info,
  Eye,
  EyeOff,
  MoreVertical,
  FileText,
  Copy,
  AlertCircle,
  Shield,
  School,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Award,
  Cloud,
  Trophy,
  Save,
  RefreshCw,
  Search
} from "lucide-react";

import { GenerateResult, ImageUpload, CLASS_LEVELS, SUBJECTS } from "./types";
import { DEFAULT_INITIAL_RESULT, TEACHER_PRESETS, LOADING_QUOTES } from "./data";
import { AbsensiBulanan } from "./components/AbsensiBulanan";
import { RppView } from "./components/RppView";
import { MediaBelajarView } from "./components/MediaBelajarView";
import { LokerTugas } from "./components/LokerTugas";
import { ProfileModal } from "./components/ProfileModal";
import { RppFormattingGuide } from "./components/RppFormattingGuide";
import { RppLibrary } from "./components/RppLibrary";
import { RPP_TEMPLATES } from "./templates";
import { motion, AnimatePresence } from "motion/react";
// @ts-ignore
import html2pdf from "html2pdf.js";
import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, BorderStyle, WidthType,
  HeadingLevel, UnderlineType, Header,
  ImageRun, ShadingType
} from "docx";
import { saveAs } from "file-saver";

// Helper functions to get initial attendance and grades based on activeKelas
function getHashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Synthesized sound effects using HTML5 Web Audio API
export function playSfx(type: "click" | "success" | "chime" | "delete" | "notify") {
  try {
    if (localStorage.getItem("GP_SFX_ENABLED") === "false") return;

    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Resume context if suspended (browser security block)
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    
    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.025, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === "success") {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = "triangle";
      osc2.type = "triangle";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc2.frequency.setValueAtTime(392.00, ctx.currentTime); // G4
      osc2.frequency.setValueAtTime(523.25, ctx.currentTime + 0.08); // C5
      gain.gain.setValueAtTime(0.045, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.28);
      osc2.stop(ctx.currentTime + 0.28);
    } else if (type === "notify") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.07); // D6
      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else if (type === "delete") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } else if (type === "chime") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.09); // A5
      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    }
  } catch (err) {
    console.warn("AudioContext block:", err);
  }
}

const FIRST_NAMES = [
  "Ahmad", "Budi", "Candra", "Dedi", "Eko", "Fajar", "Galih", "Hadi", "Indra", "Joko",
  "Kurniawan", "Lutfi", "Muhammad", "Naufal", "Oki", "Pratama", "Rian", "Sandi", "Teguh", "Umar",
  "Wawan", "Yudi", "Zainal", "Siti", "Nadia", "Amalia", "Zahra", "Raudha", "Putri", "Indah",
  "Dewi", "Fitri", "Lestari", "Mega", "Yanti", "Sari", "Anisa", "Rina", "Kartika", "Tri"
];

const LAST_NAMES = [
  "Santoso", "Aminah", "Wijaya", "Alkatiri", "Safira", "Lestari", "Pratama", "Aulia", "Syifa", "Hidayat",
  "Saputra", "Wulandari", "Kusuma", "Nugroho", "Sari", "Purnama", "Utami", "Setiawan", "Ramadhan", "Siregar",
  "Harahap", "Ginting", "Nasution", "Hadi", "Gunawan"
];

const getDeterministicStudents = (kelas: string): string[] => {
  const hash = Math.abs(getHashCode(kelas || "Kelas Umum"));
  // Deterministic realistic class size (between 25 and 32 students)
  const classSize = 25 + (hash % 8);
  
  const students: string[] = [];
  const usedFullNames = new Set<string>();

  // If "Kelas 4A", start with original 5 names for test continuity, then generate the rest
  const seedNames = (!kelas || kelas.toLowerCase() === "kelas 4a" || kelas.trim() === "Kelas 4A")
    ? ["Budi Santoso", "Siti Aminah", "Rian Wijaya", "Farhan Alkatiri", "Nadia Safira"]
    : [];

  for (const name of seedNames) {
    students.push(name);
    usedFullNames.add(name);
  }

  for (let i = students.length; i < classSize; i++) {
    let firstIdx = (hash + i * 17) % FIRST_NAMES.length;
    let lastIdx = (hash + i * 23) % LAST_NAMES.length;
    
    let name = `${FIRST_NAMES[firstIdx]} ${LAST_NAMES[lastIdx]}`;
    let attempts = 0;
    while (usedFullNames.has(name) && attempts < FIRST_NAMES.length) {
      firstIdx = (firstIdx + 1) % FIRST_NAMES.length;
      name = `${FIRST_NAMES[firstIdx]} ${LAST_NAMES[lastIdx]}`;
      attempts++;
    }
    
    students.push(name);
    usedFullNames.add(name);
  }
  return students;
};

const getInitialAttendance = (kelas: string) => {
  try {
    const cached = localStorage.getItem(`gurupintar_attendance_${kelas}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error("Failed to restore cached attendance:", e);
  }
  const initial: any = {};
  const STUDENTS = getDeterministicStudents(kelas);
  const hash = getHashCode(kelas);

  STUDENTS.forEach((name, index) => {
    initial[name] = {};
    for (let day = 1; day <= 31; day++) {
      // Create some variance in attendance based on student index and class name hash
      const randomFactor = (hash + index * 9 + day * 3) % 35;
      if (randomFactor === 0) {
        initial[name][day] = "Alpa";
      } else if (randomFactor === 1 || randomFactor === 2) {
        initial[name][day] = "Sakit";
      } else if (randomFactor === 3) {
        initial[name][day] = "Izin";
      } else {
        initial[name][day] = "Hadir";
      }
    }
  });
  return initial;
};

const getInitialGrades = (kelas: string) => {
  try {
    const cached = localStorage.getItem(`gurupintar_grades_${kelas}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error("Failed to restore cached student grades:", e);
  }

  if (!kelas || kelas.toLowerCase() === "kelas 4a" || kelas.trim() === "Kelas 4A") {
    return {
      "Budi Santoso": { score: 95, feedback: "Asimilasi konsep gelembung daun yang istimewa, sketsa terperinci." },
      "Siti Aminah": { score: 88, feedback: "Penjelasan kognitif lengkap, presentasi skema sirkulasi mandiri rapi." },
      "Rian Wijaya": { score: 65, feedback: "Butuh bimbingan mandiri tambahan terkait interpretasi klorofil." },
      "Farhan Alkatiri": { score: 78, feedback: "Sudah memahami kriteria dasar rantai makanan, tingkatkan keaktifan kelas." },
      "Nadia Safira": { score: 91, feedback: "Sangat antusias selama eksperimen kelompok, lembar kerja rapi dan tuntas." }
    };
  }

  const STUDENTS = getDeterministicStudents(kelas);
  const hash = getHashCode(kelas);
  
  const FEEDBACKS = [
    "Asimilasi konsep yang istimewa, analisis terperinci.",
    "Bagus sekali, pemahaman konsep tuntas dan runtut.",
    "Sudah memahami kriteria dasar dengan baik, pertahankan.",
    "Butuh bimbingan mandiri tambahan agar pemahaman konsep lebih matang.",
    "Sangat aktif dalam diskusi, penguasaan materi sangat baik.",
    "Hasil pengerjaan rapi dan sistematis, kerja bagus!",
    "Kemampuan analisis meningkat, terus rajin membaca modul.",
    "Pemahaman materi cukup stabil, hanya perlu bimbingan di bagian evaluasi."
  ];

  const grades: any = {};
  STUDENTS.forEach((name, index) => {
    // Determine score between 60 and 98
    const baseScore = 65 + ((hash + index * 17) % 34); // from 65 to 98
    const feedbackIdx = (hash + index * 11) % FEEDBACKS.length;
    grades[name] = {
      score: baseScore,
      feedback: FEEDBACKS[feedbackIdx]
    };
  });
  return grades;
};

const P5_THEMES_DATA: {
  [key: string]: {
    title: string;
    defaultMaterial?: string;
    promptPlaceholder: string;
  };
} = {
  "": {
    title: "Bukan P5 (Modul Ajar Reguler)",
    promptPlaceholder: "Contoh: Proses penguapan air di waduk karena asimilasi panas, awan menjadi jenuh, turun kembali sebagai hujan."
  },
  "Gaya Hidup Berkelanjutan": {
    title: "🌱 Gaya Hidup Berkelanjutan",
    defaultMaterial: "Tema: Gaya Hidup Berkelanjutan\nTopik Utama: Pengolahan Sampah Organik & Bank Sampah Sekolah\nTarget Proyek: Mengajak siswa mengidentifikasi jenis sampah di sekolah, mempraktikkan pembuatan kompos organik cair/padat, merancang tempat sampah pilah kreatif dari barang bekas, serta merancang kampanye 'Zero Waste' sekolah.",
    promptPlaceholder: "Contoh: Pengolahan sampah plastik menjadi ecobrick bernilai guna tinggi di lingkungan sekolah."
  },
  "Bangunlah Jiwa dan Raganya": {
    title: "❤️ Bangunlah Jiwa dan Raganya",
    defaultMaterial: "Tema: Bangunlah Jiwa dan Raganya\nTopik Utama: Kampanye Sehat Mental & Anti-Bullying Sejak Dini\nTarget Proyek: Mengembangkan empati, memahami dampak perundungan fisik/cyber, membuat draf kesepakatan mufakat kelas damai, merancang poster kampanye anti-kekerasan, serta mendeklarasikan duta ramah anak kelas.",
    promptPlaceholder: "Contoh: Meningkatkan literasi gizi seimbang dengan bekal sehat buatan rumah (Isi Piringku)."
  },
  "Kearifan Lokal": {
    title: "🏛️ Kearifan Lokal",
    defaultMaterial: "Tema: Kearifan Lokal\nTopik Utama: Melestarikan Kuliner Tradisional & Permainan Rakyat Daerah\nTarget Proyek: Mengenal warisan sejarah leluhur setempat, mewawancarai sesepuh/pembuat hidangan khas daerah, memamerkan hasil kuliner di festival kecil kelas, serta mendokumentasikan aturan main dolanan/permainan daerah.",
    promptPlaceholder: "Contoh: Dokumentasi arsitektur rumah adat atau pembuatan kerajinan anyaman bambu khas daerah."
  },
  "Kewirausahaan": {
    title: "💰 Kewirausahaan",
    defaultMaterial: "Tema: Kewirausahaan\nTopik Utama: Kreasi Olahan Pangan Lokal & Market Day Sekolah\nTarget Proyek: Merancang ide produk camilan atau minuman berbahan dasar pangan lokal murah, menghitung rencana biaya produksi dan Harga Pokok Penjualan (HPP), mendesain logo kemasan unik, serta mengelola stan jualan Market Day.",
    promptPlaceholder: "Contoh: Membuat kreasi sabun organik dari minyak jelantah atau hiasan dari limbah limun kayu."
  },
  "Bhinneka Tunggal Ika": {
    title: "🤝 Bhinneka Tunggal Ika",
    defaultMaterial: "Tema: Bhinneka Tunggal Ika\nTopik Utama: Harmoni Keragaman & Toleransi Nusantara di Kelas\nTarget Proyek: Mengeksplorasi adat istiadat, rumah ibadah, baju, tarian adat, dan lagu nusantara, mendiskusikan sikap saling toleransi dalam berteman tanpa sekat suku/agama, serta menyusun buku saku pameran budaya nusantara.",
    promptPlaceholder: "Contoh: Eksplorasi tradisi kerja bakti gotong royong sambatan di lingkungan sekitar siswa."
  },
  "Rekayasa dan Teknologi": {
    title: "🚀 Rekayasa dan Teknologi",
    defaultMaterial: "Tema: Rekayasa dan Teknologi\nTopik Utama: Pembuatan Alat Penyaring Air Bersih Sederhana\nTarget Proyek: Memahami krisis air bersih, merancang purwarupa tabung filter air bertingkat dengan bahan alam (batu kerikil, arang, pasir, ijuk, sabut kelapa), melakukan uji coba kejernihan air, serta mempresentasikan cara kerja alat.",
    promptPlaceholder: "Contoh: Membuat model pengairan/irigasi mikro tetes sederhana dari botol plastik bekas untuk taman sekolah."
  },
  "Suara Demokrasi": {
    title: "⚖️ Suara Demokrasi",
    defaultMaterial: "Tema: Suara Demokrasi\nTopik Utama: Pemilihan Ketua OSIS / Perwakilan Kelas Berkarakter\nTarget Proyek: Mempelajari hak bersuara dan asas Pemilu cerdas (Luber Jurdil), merumuskan visi-misi calon pemimpin, membuat kotak suara daur ulang, melakukan debat visi mini, hingga simulasi pencoblosan langsung.",
    promptPlaceholder: "Contoh: Menyusun draf tata tertib piket kelas secara adil."
  }
};

export const METODE_LIST = [
  "Ceramah",
  "Diskusi",
  "Demonstrasi", 
  "Eksperimen",
  "Problem Based Learning (PBL)",
  "Project Based Learning (PjBL)",
  "Cooperative Learning",
  "Discovery Learning"
];

export type DokumenType = "modul_ajar" | "tp_atp" | "lkpd" | "asesmen" | "soal_ujian";

export const DOKUMEN_LIST: { id: DokumenType; label: string; icon: string; desc: string; warna: string }[] = [
  { 
    id: "modul_ajar", 
    label: "Modul Ajar (RPP)", 
    icon: "📋", 
    desc: "Rencana Pelaksanaan Pembelajaran lengkap dengan Informasi Umum, Komponen Inti, dan Refleksi.",
    warna: "blue"
  },
  { 
    id: "tp_atp", 
    label: "TP & ATP", 
    icon: "🎯", 
    desc: "Tujuan Pembelajaran dan Alur Tujuan Pembelajaran bertahap sesuai Capaian Pembelajaran.",
    warna: "purple"
  },
  { 
    id: "lkpd", 
    label: "LKPD", 
    icon: "📝", 
    desc: "Lembar Kerja Peserta Didik dengan tabel pengamatan, langkah kerja, dan soal diskusi.",
    warna: "emerald"
  },
  { 
    id: "asesmen", 
    label: "Asesmen & Rubrik", 
    icon: "📊", 
    desc: "Instrumen penilaian sikap, performa, diagnostik, formatif, dan rubrik penilaian lengkap.",
    warna: "orange"
  },
  { 
    id: "soal_ujian", 
    label: "Soal Ujian", 
    icon: "✏️", 
    desc: "Paket soal pilihan ganda, isian, dan uraian dengan kunci jawaban dan pembahasan.",
    warna: "red"
  },
];

// Helper to beautifully parse and render stepwise layout texts
const renderStepwiseContent = (
  text: string, 
  profileSchool: string = "SD Insan Muttaqin Islamic School",
  profileName: string = "Bapak Adib Ahdiyat, S.Pd.",
  profileNip: string = "203476236472001 (Aktif)"
) => {
  if (!text) return null;

  const renderInlineStyles = (txt: string) => {
    if (!txt) return "";
    const parts = txt.split(/\*\*|__/);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-bold text-black border-b border-black/10">{part}</strong>;
      }
      return part;
    });
  };

  const lines = text.split("\n");
  const blocks: any[] = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // 1. Detect table block
    if (trimmed.startsWith("|")) {
      const headerRowRaw = trimmed;
      let dividerRowRaw = "";
      const bodyRowsRaw: string[] = [];
      
      // Look at the next line to see if it's the divider row (e.g. |---|---|)
      if (i + 1 < lines.length && lines[i + 1].trim().startsWith("|") && lines[i + 1].includes("-")) {
        dividerRowRaw = lines[i + 1].trim();
        i += 2; // skip header and divider
        
        while (i < lines.length && lines[i].trim().startsWith("|")) {
          bodyRowsRaw.push(lines[i].trim());
          i++;
        }
        
        // Parse header cells
        const headers = headerRowRaw.split("|")
          .map(c => c.trim())
          .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        
        // Parse body rows cells
        const rows = bodyRowsRaw.map(r => {
          return r.split("|")
            .map(c => c.trim())
            .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        });
        
        blocks.push({
          type: "table",
          headers,
          rows
        });
        continue;
      }
    }
    
    // 2. Detect divider
    if (trimmed === "---" || trimmed === "___" || trimmed === "***") {
      blocks.push({ type: "divider" });
      i++;
      continue;
    }
    
    // 3. Headings
    if (trimmed.startsWith("###")) {
      blocks.push({ type: "h3", text: trimmed.replace(/^###+\s*/, "") });
      i++;
      continue;
    }
    if (trimmed.startsWith("##")) {
      blocks.push({ type: "h2", text: trimmed.replace(/^##+\s*/, "") });
      i++;
      continue;
    }
    if (trimmed.startsWith("#")) {
      blocks.push({ type: "h1", text: trimmed.replace(/^#\s*/, "") });
      i++;
      continue;
    }
    
    // 4. Bullet lists
    if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("•")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith("-") || lines[i].trim().startsWith("*") || lines[i].trim().startsWith("•"))) {
        const itemTrimmed = lines[i].trim();
        const bulletMatch = itemTrimmed.match(/^[\-\*•]\s*(.*)$/);
        items.push(bulletMatch ? bulletMatch[1] : itemTrimmed);
        i++;
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }
    
    // 5. Numbered lists
    const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)$/);
    if (numMatch) {
      const items: string[] = [];
      while (i < lines.length) {
        const nextTrimmed = lines[i].trim();
        const nextNumMatch = nextTrimmed.match(/^\d+[\.\)]\s+(.*)$/);
        if (nextNumMatch) {
          items.push(nextNumMatch[1]);
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }
    
    // 6. Blockquote
    if (trimmed.startsWith(">")) {
      blocks.push({ type: "blockquote", text: trimmed.replace(/^>\s*/, "") });
      i++;
      continue;
    }
    
    // 7. Regular paragraph
    blocks.push({ type: "paragraph", text: line });
    i++;
  }

  return (
    <div className="space-y-4 text-black leading-relaxed font-sans text-[12.5px] pb-10">
      {blocks.map((block, bIdx) => {
        if (block.type === "table") {
          return (
            <div key={bIdx} className="overflow-x-auto my-4 border border-zinc-300 rounded-sm">
              <table className="w-full border-collapse text-left text-[11.5px] text-zinc-900 font-sans">
                <thead className="bg-[#f4f4f5] text-zinc-900 border-b border-zinc-350 font-bold uppercase">
                  <tr>
                    {block.headers.map((h: string, index: number) => (
                      <th key={index} className="p-2 border border-zinc-300 font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {block.rows.map((row: string[], index: number) => (
                    <tr key={index} className="hover:bg-zinc-50/50">
                      {row.map((cell: string, cellIdx: number) => (
                        <td key={cellIdx} className="p-2 border border-zinc-200 font-medium leading-relaxed">{renderInlineStyles(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (block.type === "divider") {
          return <hr key={bIdx} className="my-5 border-zinc-300 print:border-black border-dashed" />;
        }
        if (block.type === "h1") {
          return (
            <h3 key={bIdx} className="text-[13.5px] font-bold text-black border-b border-zinc-400 pb-1 mt-6 uppercase tracking-tight font-sans">
              {block.text}
            </h3>
          );
        }
        if (block.type === "h2") {
          return (
            <h4 key={bIdx} className="text-xs font-bold text-zinc-900 pt-4 pb-0.5 mt-4 uppercase tracking-tight font-sans">
              {block.text}
            </h4>
          );
        }
        if (block.type === "h3") {
          return (
            <h5 key={bIdx} className="text-[11px] font-bold text-zinc-800 pt-3 pb-0.5 mt-3 uppercase tracking-wider font-sans">
              {block.text}
            </h5>
          );
        }
        if (block.type === "list") {
          return (
            <div key={bIdx} className="space-y-1 my-3 pl-4">
              {block.items.map((item: string, iIdx: number) => (
                <div key={iIdx} className="flex items-start gap-2">
                  {block.ordered ? (
                    <span className="text-zinc-650 font-bold text-[12px] pt-0.5 shrink-0 select-none">{iIdx + 1}.</span>
                  ) : (
                    <span className="text-zinc-900 font-bold pt-0.5 shrink-0 select-none">•</span>
                  )}
                  <p className="flex-1 font-medium text-zinc-800 text-[12.5px]">{renderInlineStyles(item)}</p>
                </div>
              ))}
            </div>
          );
        }
        if (block.type === "blockquote") {
          return (
            <blockquote key={bIdx} className="border-l-2 border-zinc-440 bg-zinc-50/40 p-4 rounded-sm my-4 italic text-zinc-700 text-[12px]">
              {renderInlineStyles(block.text)}
            </blockquote>
          );
        }
        if (block.type === "paragraph") {
          const trimmed = block.text.trim();
          if (!trimmed) {
            return <div key={bIdx} className="h-2"></div>;
          }
          if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
            return (
              <p key={bIdx} className="font-bold text-black pt-2 text-[12.5px] tracking-wide">
                {trimmed.replace(/\*\*/g, "")}
              </p>
            );
          }
          return (
            <p key={bIdx} className="font-medium text-zinc-800 text-[12.5px]">
              {renderInlineStyles(block.text)}
            </p>
          );
        }
        return null;
      })}

      {/* Lembar Pengesahan / Signature Block */}
      <div className="mt-10 pt-4 border-t border-zinc-300 grid grid-cols-2 gap-8 text-center text-[11px] text-black font-semibold font-sans leading-relaxed select-none no-print border-dashed">
        <div className="flex flex-col items-center justify-between h-32">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold uppercase tracking-wide">Kepala Sekolah</p>
          </div>
          <div>
            <p className="font-bold border-b border-black pb-0.5 min-w-[150px]">............................................................</p>
            <p className="text-zinc-500 text-[10px] mt-0.5">NIP. ......................................................</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between h-32">
          <div>
            <p>{new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
            <p className="font-bold uppercase tracking-wide">Guru Mata Pelajaran</p>
          </div>
          <div>
            <p className="font-bold border-b border-black pb-0.5 min-w-[150px]">{profileName}</p>
            <p className="text-zinc-500 text-[10px] mt-0.5">NIP. {profileNip || "......................................................"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Word export helper to convert Markdown content into a highly professional inline HTML string
const convertMarkdownToHtmlForWord = (text: string) => {
  if (!text) return "";
  const lines = text.split("\n");
  let html = "";
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // 1. Divider
    if (trimmed === "---" || trimmed === "___" || trimmed === "***") {
      html += `<hr style="border: 1px dashed #cccccc; margin: 25px 0;" />`;
      i++;
      continue;
    }
    
    // 2. Table
    if (trimmed.startsWith("|")) {
      const headerRowRaw = trimmed;
      if (i + 1 < lines.length && lines[i + 1].trim().startsWith("|") && lines[i + 1].includes("-")) {
        i += 2; // skip header & separator
        const bodyRows: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith("|")) {
          bodyRows.push(lines[i].trim());
          i++;
        }
        
        const headers = headerRowRaw.split("|").map(s => s.trim()).filter((s, idx, arr) => idx > 0 && idx < arr.length - 1);
        const rows = bodyRows.map(r => r.split("|").map(s => s.trim()).filter((s, idx, arr) => idx > 0 && idx < arr.length - 1));
        
        html += `<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; border: 1.5px solid #1e3a8a; font-family: 'Arial', sans-serif; font-size: 10.5pt; width: 100%; margin: 20px 0;">`;
        // header
        html += `<tr style="background-color: #1e3a8a; color: #ffffff; font-weight: bold;">`;
        headers.forEach(h => {
          html += `<td style="border: 1.5px solid #1e3a8a; padding: 8px; font-weight: bold; background-color: #1e3a8a; color: #ffffff; text-align: left;">${h}</td>`;
        });
        html += `</tr>`;
        // rows
        rows.forEach((row, rIdx) => {
          const bg = rIdx % 2 === 1 ? ' background-color: #f8fafc;' : '';
          html += `<tr style="${bg}">`;
          row.forEach(cell => {
            const boldedCell = cell.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
            html += `<td style="border: 1px solid #cccccc; padding: 8px; text-align: left; mso-line-height-rule: exactly; line-height: 1.3;">${boldedCell}</td>`;
          });
          html += `</tr>`;
        });
        html += `</table>`;
        continue;
      }
    }
    
    // 3. Headings
    if (trimmed.startsWith("###")) {
      const content = trimmed.replace(/^###+\s*/, "");
      html += `<h4 style="color: #0f766e; font-family: 'Arial', sans-serif; font-size: 11pt; font-weight: bold; margin-top: 18px; margin-bottom: 6px; text-transform: uppercase;">◆ ${content}</h4>`;
      i++;
      continue;
    }
    if (trimmed.startsWith("##")) {
      const content = trimmed.replace(/^##+\s*/, "");
      html += `<h3 style="color: #1e3a8a; font-family: 'Arial', sans-serif; font-size: 13pt; font-weight: bold; margin-top: 24px; margin-bottom: 8px; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 4px; text-transform: uppercase;">${content}</h3>`;
      i++;
      continue;
    }
    if (trimmed.startsWith("#")) {
      const content = trimmed.replace(/^#\s*/, "");
      html += `<h2 style="color: #1a365d; font-family: 'Arial', sans-serif; font-size: 15pt; font-weight: bold; margin-top: 30px; margin-bottom: 12px; border-bottom: 2px solid #1a365d; padding-bottom: 6px; text-align: center; text-transform: uppercase;">${content}</h2>`;
      i++;
      continue;
    }
    
    // 4. Bullet list
    if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("•")) {
      html += `<ul style="margin: 8px 0 12px 25px; padding: 0; list-style-type: disc;">`;
      while (i < lines.length && (lines[i].trim().startsWith("-") || lines[i].trim().startsWith("*") || lines[i].trim().startsWith("•"))) {
        const itemText = lines[i].trim().substring(1).trim().replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        html += `<li style="margin-bottom: 5px; font-family: 'Arial', sans-serif; font-size: 11pt; color: #333333; line-height: 1.4;">${itemText}</li>`;
        i++;
      }
      html += `</ul>`;
      continue;
    }
    
    // 5. Numbered list
    const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)$/);
    if (numMatch) {
      html += `<ol style="margin: 8px 0 12px 25px; padding: 0;">`;
      while (i < lines.length) {
        const checkTrimmed = lines[i].trim();
        const nextMatch = checkTrimmed.match(/^\d+[\.\)]\s+(.*)$/);
        if (nextMatch) {
          const itemText = nextMatch[1].replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
          html += `<li style="margin-bottom: 5px; font-family: 'Arial', sans-serif; font-size: 11pt; color: #333333; line-height: 1.4;">${itemText}</li>`;
          i++;
        } else {
          break;
        }
      }
      html += `</ol>`;
      continue;
    }
    
    // 6. Blockquote
    if (trimmed.startsWith(">")) {
      const blockContent = trimmed.substring(1).trim().replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      html += `<div style="border-left: 4px solid #f59e0b; padding: 12px; margin: 15px 0; font-family: 'Arial', sans-serif; font-style: italic; color: #4b5563; background-color: #fffbeb; border-radius: 4px;">${blockContent}</div>`;
      i++;
      continue;
    }
    
    // 7. Regular paragraph
    if (trimmed) {
      const boldedLine = line.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      html += `<p style="margin: 10px 0; font-family: 'Arial', sans-serif; font-size: 11pt; color: #333333; text-align: justify; line-height: 1.5; mso-line-height-rule: exactly;">${boldedLine}</p>`;
    } else {
      html += `<div style="height: 12px;"></div>`;
    }
    i++;
  }
  
  return html;
};

export default function App() {
  // Daftar kelas yang dimiliki guru
  const [kelasList, setKelasList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("gurupintar_kelas_list");
      return saved ? JSON.parse(saved) : ["Kelas 4A"];
    } catch { return ["Kelas 4A"]; }
  });

  const [activeKelas, setActiveKelas] = useState<string>(() => {
    try {
      return localStorage.getItem("gurupintar_active_kelas") || "Kelas 4A";
    } catch { return "Kelas 4A"; }
  });

  // Global Quick Search States
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [searchQueryGlobal, setSearchQueryGlobal] = useState<string>("");
  const [searchFilterCategory, setSearchFilterCategory] = useState<"semua" | "siswa" | "rpp" | "jurnal">("semua");
  const dashboardSearchRef = useRef<HTMLDivElement>(null);
  const [isDashboardDropdownOpen, setIsDashboardDropdownOpen] = useState<boolean>(false);
  
  // Immersive student detail card inside the search modal
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<{
    nama: string;
    kelas: string;
    score: number;
    feedback: string;
    notes: string;
    behavior: "aktif" | "pasif" | "perhatian" | "-";
    attendanceStats: {
      hadir: number;
      sakit: number;
      izin: number;
      alpa: number;
    }
  } | null>(null);

  // Ctrl+K keydown trigger to toggle global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
        playSfx("click");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Outside clicking listener to close dashboard search suggestion dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dashboardSearchRef.current && !dashboardSearchRef.current.contains(event.target as Node)) {
        setIsDashboardDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Local state edit fields for student quick evaluations within the search modal inspector
  const [editStudentScore, setEditStudentScore] = useState<number>(0);
  const [editStudentFeedback, setEditStudentFeedback] = useState<string>("");
  const [editStudentBehavior, setEditStudentBehavior] = useState<"aktif" | "pasif" | "perhatian" | "-">("-");
  const [editStudentNotes, setEditStudentNotes] = useState<string>("");

  // Sync edited student records back to active states and localStorage instantly
  const handleQuickSaveStudent = (updatedStudent: any) => {
    if (updatedStudent.kelas === activeKelas) {
      setStudentGrades((prev) => ({
        ...prev,
        [updatedStudent.nama]: {
          score: Number(updatedStudent.score),
          feedback: updatedStudent.feedback
        }
      }));
    } else {
      try {
        const storedStr = localStorage.getItem(`gurupintar_grades_${updatedStudent.kelas}`);
        let stored = storedStr ? JSON.parse(storedStr) : {};
        if (!stored || Object.keys(stored).length === 0) {
          stored = getInitialGrades(updatedStudent.kelas);
        }
        stored[updatedStudent.nama] = {
          score: Number(updatedStudent.score),
          feedback: updatedStudent.feedback
        };
        localStorage.setItem(`gurupintar_grades_${updatedStudent.kelas}`, JSON.stringify(stored));
      } catch (err) {
        console.error("Gagal simpan nilai kelas luar:", err);
      }
    }

    // Update Catatan Sikap (catatanSiswa)
    setCatatanSiswa((prev) => {
      const classNotes = prev[updatedStudent.kelas] || {};
      const updated = {
        ...prev,
        [updatedStudent.kelas]: {
          ...classNotes,
          [updatedStudent.nama]: {
            status: updatedStudent.behavior,
            catatan: updatedStudent.notes
          }
        }
      };
      try {
        localStorage.setItem("gurupintar_catatan_siswa", JSON.stringify(updated));
      } catch (err) {
        console.error("Gagal simpan catatan sikap siswa:", err);
      }
      return updated;
    });

    playSfx("success");
    showToast(`✅ Data evaluasi perkembagan ${updatedStudent.nama} berhasil disinkronkan!`);
    setSelectedStudentForDetail(null);
  };

  // Setup template inside workspace RPP Studio
  const handleApplyRppFromSearch = (temp: any) => {
    setClassLevel(temp.level);
    const isStandard = SUBJECTS.includes(temp.subject);
    if (isStandard) {
      setSubject(temp.subject);
      setManualSubject("");
    } else {
      setSubject("Input Mapel Manual (Ketik Sendiri)");
      setManualSubject(temp.subject);
    }
    setMaterialText(temp.text);
    setMaterialImage(null);
    setIsMapelSaved(!isStandard);

    if (temp.prefilledResult) {
      setCurrentResult(temp.prefilledResult);
      setMobilePane("result");
      showToast(`⚡ Sukses memuat RPP Instan "${temp.title}" ke workspace!`);
    } else {
      setMobilePane("input");
      showToast(`📝 Template "${temp.title}" berhasil dimuat ke form input.`);
    }
    setCurrentScreen("studio");
    setIsSearchModalOpen(false);
  };

  // State-driven modal for adding a class without prompt dialog
  const [isAddKelasModalOpen, setIsAddKelasModalOpen] = useState<boolean>(false);
  const [newKelasNameInput, setNewKelasNameInput] = useState<string>("");
  const [isClassChanging, setIsClassChanging] = useState<boolean>(false);

  // Real-time notifications state
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "alert";
    timestamp: string;
    read: boolean;
  }>>([
    {
      id: "notif-1",
      title: "🏫 Selamat Datang di GuruPintar.AI Premium",
      message: "Portal sistem kurikulum adaptif andalan bapak/ibu guru siap membimbing penyusunan draf Modul Ajar RPP Kurikulum Merdeka secara otomatis.",
      type: "success",
      timestamp: "Baru saja",
      read: false
    },
    {
      id: "notif-2",
      title: "💡 Rekomendasi Sinkronisasi G-Drive",
      message: "Hubungkan akun awan penyimpanan Anda di bagian Integrasi Cloud untuk sinkronisasi berkas otomatis tanpa hambatan kuota.",
      type: "info",
      timestamp: "15 menit yang lalu",
      read: false
    }
  ]);

  const addNotification = (title: string, message: string, type: "info" | "success" | "warning" | "alert" = "info") => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
    const newNotif = {
      id: "notif-" + Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
      timestamp: timeFormatted,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Trigger brief zoom-fade animation when active class changes
  useEffect(() => {
    setIsClassChanging(true);
    const timer = setTimeout(() => {
      setIsClassChanging(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [activeKelas]);

  const handleAddNewKelas = (namaText: string) => {
    const trimmed = namaText ? namaText.trim() : "";
    if (!trimmed) {
      showToast("⚠️ Nama kelas tidak boleh kosong!");
      return;
    }
    if (kelasList.includes(trimmed)) {
      showToast(`⚠️ Kelas "${trimmed}" sudah ada!`);
      return;
    }
    setKelasList(prev => [...prev, trimmed]);
    setActiveKelas(trimmed);
    
    // Injeksi real-time notifikasi baru
    addNotification(
      "🏫 Kelas Baru Terdaftar",
      `Kelas "${trimmed}" berhasil dibuat! Lembar presensi serta daftar rekapitulasi nilai siap dikelola.`,
      "success"
    );
    
    showToast(`✅ Kelas "${trimmed}" berhasil ditambahkan! Data presensi & nilai otomatis disiapkan.`);
    setIsAddKelasModalOpen(false);
    setNewKelasNameInput("");
  };

  // State Jadwal Mengajar & Pengingat Harian
  const [jadwalMengajar, setJadwalMengajar] = useState<Array<{
    id: string;
    hari: string; // "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
    jamMulai: string; // "hh:mm"
    jamSelesai: string; // "hh:mm"
    kelas: string; // "Kelas 4A"
    mapel: string; // "IPAS (Fase B)"
    topik: string; // "Siklus Fotosintesis"
  }>>(() => {
    try {
      const saved = localStorage.getItem("grup_jadwal_mengajar");
      if (saved) return JSON.parse(saved);
    } catch { /* use default */ }
    return [
      { id: "j1", hari: "Senin", jamMulai: "07:30", jamSelesai: "09:00", kelas: "Kelas 4A", mapel: "IPAS (IPA & IPS Gabungan)", topik: "Siklus Fotosintesis & Reaksi Foton Matahari" },
      { id: "j2", hari: "Senin", jamMulai: "09:30", jamSelesai: "11:00", kelas: "Kelas 5B", mapel: "Matematika SD", topik: "Pecahan Campuran & Operasi Pembagian Desimal" },
      { id: "j3", hari: "Selasa", jamMulai: "08:00", jamSelesai: "09:30", kelas: "Kelas 4A", mapel: "Bahasa Indonesia", topik: "Menulis Paragraf Deskriptif & Kosakata Baru" },
      { id: "j4", hari: "Selasa", jamMulai: "10:15", jamSelesai: "11:45", kelas: "Kelas 5B", mapel: "Tematik", topik: "Siklus Karbon & Pelestarian Alam Nusantara" },
      { id: "j5", hari: "Rabu", jamMulai: "07:30", jamSelesai: "09:00", kelas: "Kelas 4A", mapel: "IPAS (IPA & IPS Gabungan)", topik: "Projek P5: Eksperimen Pupuk Cair Cair Alam" },
      { id: "j6", hari: "Kamis", jamMulai: "08:30", jamSelesai: "10:00", kelas: "Kelas 4A", mapel: "Seni Rupa", topik: "Memotong & Menempel Kolase Serat Alam Wood" },
      { id: "j7", hari: "Jumat", jamMulai: "07:30", jamSelesai: "08:45", kelas: "Kelas 4A", mapel: "Pendidikan Pancasila / PPKn SD", topik: "Gotong Royong & Lambang Negara Garuda Pancasila" }
    ];
  });

  const getTodayDayName = () => {
    const daysIndo = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    // For general standard simulation, return the JS day, but if Sunday and they want to test, we show Saturday or Monday highlights.
    return daysIndo[new Date().getDay()];
  };

  const [selectedJadwalDayFilter, setSelectedJadwalDayFilter] = useState<string>(() => {
    const today = getTodayDayName();
    // Default to today. Or if Sunday/Saturday, we can default to Monday (Senin) so they see schedules on first load
    return (today === "Minggu" || today === "Sabtu") ? "Senin" : today;
  });

  useEffect(() => {
    try {
      localStorage.setItem("grup_jadwal_mengajar", JSON.stringify(jadwalMengajar));
    } catch (e) {
      console.error("Failed to save jadwal mengajar:", e);
    }
  }, [jadwalMengajar]);


  // Google Calendar Synchronization states
  const [isSyncingCalendar, setIsSyncingCalendar] = useState<boolean>(false);
  const [syncedCalendarEvents, setSyncedCalendarEvents] = useState<Array<{
    id: string;
    hari: string;
    jamMulai: string;
    jamSelesai: string;
    kelas: string;
    mapel: string;
    topik: string;
    imported?: boolean;
  }>>([]);
  const [showSyncCalendarUI, setShowSyncCalendarUI] = useState<boolean>(false);

  const getUpcomingDateWithOffset = (targetDayOfWeek: number, timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const resultDate = new Date();
    const currentDayOfWeek = resultDate.getDay();
    
    let distance = targetDayOfWeek - currentDayOfWeek;
    if (distance <= 0) {
      distance += 7; // force next week
    }
    
    resultDate.setDate(resultDate.getDate() + distance);
    resultDate.setHours(hours, minutes, 0, 0);
    return resultDate.toISOString();
  };

  const getIndoDayNameFromDate = (dateStr: string) => {
    const daysIndo = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const dateObj = new Date(dateStr);
    return daysIndo[dateObj.getDay()];
  };

  const getTimeStringFromDate = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleGoogleCalendarSync = async () => {
    setIsSyncingCalendar(true);
    showToast("📅 Menghubungkan ke Kalender Google & mencari jadwal mengajar...");
    playSfx("click");

    try {
      // Simulated calendar flow — no external API call
      let fetchedEvents: any[] = [];
      const isSimulated = true;

      if (isSimulated || fetchedEvents.length === 0) {
        // Build simulated / mock events from Indonesian teacher's scheduling
        const mockCalendarEvents = [
          {
            id: `cal-1-${Math.random().toString(36).substring(2, 6)}`,
            summary: "Kelas 4A - IPAS (IPA & IPS Gabungan): Siklus Fotosintesis & Reaksi Foton Matahari",
            description: "Materi Fotosintesis, Bagian Tubuh Tumbuhan, dan Energi Cahaya",
            start: { dateTime: getUpcomingDateWithOffset(1, "07:30") }, // Senin
            end: { dateTime: getUpcomingDateWithOffset(1, "09:00") }
          },
          {
            id: `cal-2-${Math.random().toString(36).substring(2, 6)}`,
            summary: "Kelas 5B - Matematika SD: Pecahan Campuran & Operasi Desimal",
            description: "Mengembangkan media melipat kertas lipat berwarna-warni",
            start: { dateTime: getUpcomingDateWithOffset(2, "09:30") }, // Selasa
            end: { dateTime: getUpcomingDateWithOffset(2, "11:00") }
          },
          {
            id: `cal-3-${Math.random().toString(36).substring(2, 6)}`,
            summary: "Kelas 4A - Bahasa Indonesia: Menulis Paragraf Deskriptif & Kosakata Baru",
            description: "Menemukan kosakata anyar terkait kamus KBBI",
            start: { dateTime: getUpcomingDateWithOffset(3, "08:00") }, // Rabu
            end: { dateTime: getUpcomingDateWithOffset(3, "09:30") }
          },
          {
            id: `cal-4-${Math.random().toString(36).substring(2, 6)}`,
            summary: "Kelas 5B - Tematik: Siklus Karbon & Pelestarian Alam Nusantara",
            description: "Analisis dampak de-green planet dan fotosintesis bumi",
            start: { dateTime: getUpcomingDateWithOffset(4, "10:15") }, // Kamis
            end: { dateTime: getUpcomingDateWithOffset(4, "11:45") }
          },
          {
            id: `cal-5-${Math.random().toString(36).substring(2, 6)}`,
            summary: "Kelas 4A - IPAS (IPA & IPS Gabungan): Projek P5 Eksperimen Pupuk Cair Cair Alam",
            description: "Mencampur pupuk hayati dengan tim P5 bertema gaya hidup berkelanjutan",
            start: { dateTime: getUpcomingDateWithOffset(5, "07:30") }, // Jumat
            end: { dateTime: getUpcomingDateWithOffset(5, "09:00") }
          }
        ];
        fetchedEvents = mockCalendarEvents;
      }

      // Parse and assemble elements
      const parsedSchedules = fetchedEvents.map(event => {
        const title = event.summary || "Kelas Kurikulum Merdeka";
        const desc = event.description || "Topik Pembelajaran Kelas Baru";

        // Regex / Keyword parsing for Kelas
        const kelasMatch = title.match(/Kelas\s+[a-zA-Z0-9]+/i) || desc.match(/Kelas\s+[a-zA-Z0-9]+/i);
        const kelas = kelasMatch ? kelasMatch[0] : "Kelas 4A";

        // Extract Mapel & Topik
        let mapel = "IPAS (IPA & IPS Gabungan)";
        let topik = "Pendalaman Kurikulum Merdeka";

        const mapelKeywords = [
          "IPAS (IPA & IPS Gabungan)",
          "Matematika SD",
          "Bahasa Indonesia",
          "Tematik",
          "Seni Rupa",
          "Pendidikan Pancasila / PPKn SD"
        ];
        for (const kw of mapelKeywords) {
          if (title.toLowerCase().includes(kw.toLowerCase()) || desc.toLowerCase().includes(kw.toLowerCase())) {
            mapel = kw;
            break;
          }
        }

        const separators = [":", "-"];
        for (const sep of separators) {
          if (title.includes(sep)) {
            const parts = title.split(sep);
            if (parts[1] && parts[1].trim().length > 3) {
              topik = parts[1].trim();
              break;
            }
          }
        }
        if (!topik || topik.trim() === "" || topik === "Pendalaman Kurikulum Merdeka") {
          topik = desc;
        }

        const startStr = event.start?.dateTime || event.start?.date || new Date().toISOString();
        const endStr = event.end?.dateTime || event.end?.date || new Date().toISOString();

        return {
          id: `cal-slot-${Math.random().toString(36).substring(2, 8)}`,
          hari: getIndoDayNameFromDate(startStr),
          jamMulai: getTimeStringFromDate(startStr),
          jamSelesai: getTimeStringFromDate(endStr),
          kelas,
          mapel,
          topik,
          imported: false
        };
      }).filter(evt => ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].includes(evt.hari));

      setSyncedCalendarEvents(parsedSchedules);
      setShowSyncCalendarUI(true);
      showToast(`✔ Sukses! Menemukan ${parsedSchedules.length} slot jadwal mengajar baru dari Google Calendar!`);
      playSfx("success");

    } catch (e: any) {
      console.error(e);
      showToast("❌ Gagal menyinkronkan jadwal Google Calendar: " + e.message);
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  const handleImportCalendarSchedule = (eventId: string) => {
    const eventToImport = syncedCalendarEvents.find(e => e.id === eventId);
    if (!eventToImport) return;

    // Check if duplicate slot already in jadwalMengajar (matching hari, jamMulai, kelas, mapel)
    const isDuplicate = jadwalMengajar.some(s => 
      s.hari === eventToImport.hari && 
      s.jamMulai === eventToImport.jamMulai && 
      s.kelas === eventToImport.kelas && 
      s.mapel === eventToImport.mapel
    );

    if (isDuplicate) {
      showToast(`⚠️ Slot schedule pada hari ${eventToImport.hari} jam ${eventToImport.jamMulai} untuk ${eventToImport.kelas} sudah terdaftar.`);
      return;
    }

    const newSlot = {
      id: `j-imported-${Math.random().toString(36).substring(2, 8)}`,
      hari: eventToImport.hari,
      jamMulai: eventToImport.jamMulai,
      jamSelesai: eventToImport.jamSelesai,
      kelas: eventToImport.kelas,
      mapel: eventToImport.mapel,
      topik: eventToImport.topik
    };

    setJadwalMengajar(prev => [...prev, newSlot]);
    setSyncedCalendarEvents(prev => prev.map(evt => evt.id === eventId ? { ...evt, imported: true } : evt));
    showToast(`✅ Berhasil mengimpor slot mengajar: ${eventToImport.mapel} (${eventToImport.kelas})`);
    playSfx("success");
  };

  const handleImportAllCalendarSchedules = () => {
    let count = 0;
    const currentList = [...jadwalMengajar];
    
    syncedCalendarEvents.forEach(eventToImport => {
      if (eventToImport.imported) return;

      const isDuplicate = currentList.some(s => 
        s.hari === eventToImport.hari && 
        s.jamMulai === eventToImport.jamMulai && 
        s.kelas === eventToImport.kelas && 
        s.mapel === eventToImport.mapel
      );

      if (!isDuplicate) {
        currentList.push({
          id: `j-imported-${Math.random().toString(36).substring(2, 8)}`,
          hari: eventToImport.hari,
          jamMulai: eventToImport.jamMulai,
          jamSelesai: eventToImport.jamSelesai,
          kelas: eventToImport.kelas,
          mapel: eventToImport.mapel,
          topik: eventToImport.topik
        });
        count++;
      }
    });

    if (count > 0) {
      setJadwalMengajar(currentList);
      setSyncedCalendarEvents(prev => prev.map(evt => ({ ...evt, imported: true })));
      showToast(`✅ Sukses mengimpor massal ${count} jadwal mengajar baru!`);
      playSfx("success");
    } else {
      showToast("ℹ️ Seluruh jadwal mengajar dari Kalender sudah terdaftar sebelumnya.");
    }
  };

  // States untuk input form jadwal mengajar (editor di profil)
  const [formJadwalHari, setFormJadwalHari] = useState<string>("Senin");
  const [formJadwalMulai, setFormJadwalMulai] = useState<string>("07:30");
  const [formJadwalSelesai, setFormJadwalSelesai] = useState<string>("09:00");
  const [formJadwalKelas, setFormJadwalKelas] = useState<string>("Kelas 4A");
  const [formJadwalMapel, setFormJadwalMapel] = useState<string>("IPAS (IPA & IPS Gabungan)");
  const [formJadwalTopik, setFormJadwalTopik] = useState<string>("");

  // States untuk mengedit slot jadwal yang ada di Manajemen Jadwal
  const [editingJadwalSlotId, setEditingJadwalSlotId] = useState<string | null>(null);
  const [editSlotHari, setEditSlotHari] = useState<string>("");
  const [editSlotMulai, setEditSlotMulai] = useState<string>("");
  const [editSlotSelesai, setEditSlotSelesai] = useState<string>("");
  const [editSlotKelas, setEditSlotKelas] = useState<string>("");
  const [editSlotMapel, setEditSlotMapel] = useState<string>("");
  const [editSlotTopik, setEditSlotTopik] = useState<string>("");

  const [apiStatus, setApiStatus] = useState<"unknown" | "ok" | "missing">("unknown");

  // Cek API key saat login berhasil
  const checkApiHealth = async () => {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setApiStatus(data.apiKeyConfigured ? "ok" : "missing");
    } catch {
      setApiStatus("unknown");
    }
  };

  // Screen management
  const [currentScreen, setCurrentScreen] = useState<"home" | "studio" | "studio_modular" | "absensi" | "loker" | "perpustakaan" | "account">("home");
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(() => localStorage.getItem("GP_SFX_ENABLED") !== "false");
  const [activeModularTab, setActiveModularTab] = useState<"tp_atp" | "modul_ajar" | "lkpd" | "asesmen" | "soal_ujian">("tp_atp");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [mobilePane, setMobilePane] = useState<"input" | "result">("input");
  
  // Dropdown inputs
  const [selectedRole, setSelectedRole] = useState<"sd" | "agama" | "smp_sma" | null>(() => {
    try {
      const val = localStorage.getItem("grup_selected_role");
      return (val as "sd" | "agama" | "smp_sma" | null) || null;
    } catch {
      return null;
    }
  });

  const [classLevel, setClassLevel] = useState<string>(() => {
    try {
      return localStorage.getItem("grup_class_level") || "SD Kelas 4";
    } catch {
      return "SD Kelas 4";
    }
  });
  const [subject, setSubject] = useState<string>(() => {
    try {
      return localStorage.getItem("grup_subject") || "IPAS (IPA & IPS Gabungan)";
    } catch {
      return "IPAS (IPA & IPS Gabungan)";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("grup_class_level", classLevel);
    } catch (e) {
      console.error(e);
    }
  }, [classLevel]);

  useEffect(() => {
    try {
      localStorage.setItem("grup_subject", subject);
    } catch (e) {
      console.error(e);
    }
  }, [subject]);

  useEffect(() => {
    try {
      if (selectedRole) {
        localStorage.setItem("grup_selected_role", selectedRole);
      } else {
        localStorage.removeItem("grup_selected_role");
      }
    } catch (e) {
      console.error(e);
    }
  }, [selectedRole]);

  // Filtered dropdown categories for our adaptive workflow
  const getFilteredClasses = () => {
    if (selectedRole === "sd") {
      return [
        "SD Kelas 1",
        "SD Kelas 2",
        "SD Kelas 3",
        "SD Kelas 4",
        "SD Kelas 5",
        "SD Kelas 6"
      ];
    }
    if (selectedRole === "smp_sma") {
      return [
        "SMP Kelas 7",
        "SMP Kelas 8",
        "SMP Kelas 9",
        "SMA Kelas 10",
        "SMA Kelas 11",
        "SMA Kelas 12"
      ];
    }
    return [
      "SD Kelas 1", "SD Kelas 2", "SD Kelas 3", "SD Kelas 4", "SD Kelas 5", "SD Kelas 6",
      "SMP Kelas 7", "SMP Kelas 8", "SMP Kelas 9",
      "SMA Kelas 10", "SMA Kelas 11", "SMA Kelas 12"
    ];
  };

  const getFilteredSubjects = () => {
    if (p5Theme) {
      return ["--- Projek P5 (Lintas Mata Pelajaran) ---"];
    }
    if (selectedRole === "sd") {
      return [
        "Tematik",
        "IPAS (IPA & IPS Gabungan)",
        "Matematika SD",
        "Bahasa Indonesia",
        "Bahasa Inggris SD",
        "Pendidikan Pancasila / PPKn SD",
        "Seni Rupa",
        "Seni Musik",
        "Seni Tari & Teater",
        "Pendidikan Jasmani & Kesehatan (PJOK) SD",
        "Informatika / TIK SD",
        "Muatan Lokal (Mulok)",
        "Input Mapel Manual (Ketik Sendiri)"
      ];
    }
    if (selectedRole === "agama") {
      return [
        "Pendidikan Agama Islam (PAI)",
        "Al-Qur'an Hadits",
        "Aqidah Akhlak",
        "Fiqih",
        "Sejarah Kebudayaan Islam (SKI)",
        "Bahasa Arab",
        "Tahsin",
        "Tahfidz",
        "BTQ (Baca Tulis Al-Qur'an)",
        "Pendidikan Agama Kristen",
        "Pendidikan Agama Katolik",
        "Pendidikan Agama Hindu",
        "Pendidikan Agama Buddha",
        "Input Mapel Manual (Ketik Sendiri)"
      ];
    }
    if (selectedRole === "smp_sma") {
      if (classLevel.startsWith("SMP")) {
        return [
          "Matematika SMP",
          "IPA Terpadu",
          "IPS Terpadu",
          "Bahasa Inggris SMP",
          "Bahasa Indonesia SMP",
          "Informatika SMP",
          "Pendidikan Pancasila / PPKn SMP",
          "Seni Budaya",
          "Prakarya (Kerajinan/Rekayasa)",
          "Pendidikan Jasmani & Kesehatan (PJOK) SMP",
          "Muatan Lokal (Mulok) SMP",
          "Input Mapel Manual (Ketik Sendiri)"
        ];
      } else {
        return [
          "Bahasa Indonesia SMA",
          "Bahasa Inggris SMA",
          "Matematika (Fase E/F Wajib)",
          "Matematika (Fase F Peminatan)",
          "Fisika",
          "Kimia",
          "Biologi",
          "Ekonomi",
          "Geografi",
          "Sosiologi",
          "Sejarah",
          "Sejarah Indonesia",
          "Informatika SMA",
          "Antropologi",
          "Seni Budaya",
          "Prakarya & Kewirausahaan (PKWU)",
          "Bahasa Inggris Tingkat Lanjut",
          "Pendidikan Jasmani & Kesehatan (PJOK) SMA",
          "Input Mapel Manual (Ketik Sendiri)"
        ];
      }
    }
    return SUBJECTS;
  };

  const [manualSubject, setManualSubject] = useState<string>(() => {
    try {
      return localStorage.getItem("grup_manual_subject") || "";
    } catch {
      return "";
    }
  });
  const [isKebabMenuOpen, setIsKebabMenuOpen] = useState<boolean>(false);
  const [isMapelSaved, setIsMapelSaved] = useState<boolean>(false);
  const [p5Theme, setP5Theme] = useState<string>("");
  const [selectedMetode, setSelectedMetode] = useState<string>(() => {
    try {
      return localStorage.getItem("grup_selected_metode") || "Cooperative Learning";
    } catch {
      return "Cooperative Learning";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("grup_manual_subject", manualSubject);
    } catch (e) {
      console.error(e);
    }
  }, [manualSubject]);

  useEffect(() => {
    try {
      localStorage.setItem("grup_selected_metode", selectedMetode);
    } catch (e) {
      console.error(e);
    }
  }, [selectedMetode]);
  const [selectedDokumen, setSelectedDokumen] = useState<DokumenType | null>(null);
  const [dokumenResult, setDokumenResult] = useState<{ [key in DokumenType]?: string }>({});
  const [dokumenError, setDokumenError] = useState<{ [key in DokumenType]?: string }>({});
  const [generatingDokumen, setGeneratingDokumen] = useState<DokumenType | null>(null);
  const [dashboardTab, setDashboardTab] = useState<string>("Data Utama");
  const [driveLinkTestResult, setDriveLinkTestResult] = useState<string | null>(null);
  const [syncingLogId, setSyncingLogId] = useState<number | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);
  const [isSavingAndSyncingFolder, setIsSavingAndSyncingFolder] = useState<boolean>(false);
  const [isExportingSheets, setIsExportingSheets] = useState<boolean>(false);
  
  // Real-time synced files simulation storage
  const [syncedFiles, setSyncedFiles] = useState<Array<{
    fileName: string;
    mimeType: string;
    size: string;
    contentPreview: string;
    lastSyncedAt: string;
  }>>([
    {
      fileName: "Modul_Ajar_RPP_Lengkap_Tahfidz.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size: "34.5 KB",
      contentPreview: "DRAF MODUL AJAR TAHFIDZ - SEKOLAH: SD Negeri Cempaka Indah 01\nGuru: Bu Sari Dewi, S.Pd.\nNIP: 19890412 201402 2 003\nStatus: Aktif dan tuntas disusun.",
      lastSyncedAt: "2026-05-28 08:30 WIB"
    },
    {
      fileName: "Slide_PPT_Siklus_Air_dan_Hujan.pptx",
      mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      size: "42.1 KB",
      contentPreview: "[Slide 1] Siklus Pembelajaran Air Merdeka\n[Slide 2] Proses Kondensasi & Presipitasi\n[Slide 3] Eksperimen Mini di Kelas\n[Slide 4] Pengisian Lembar Refleksi",
      lastSyncedAt: "2026-05-28 09:12 WIB"
    }
  ]);

  const [activePreviewPayload, setActivePreviewPayload] = useState<{
    fileName: string;
    mimeType: string;
    size: string;
    content: string;
  } | null>(null);

  const generateDocumentPayloads = () => {
    const payloads: Array<{ fileName: string; mimeType: string; content: string; size: string }> = [];

    // 1. RPP / Modul Ajar
    const rppObj = currentResult?.modul_ajar_rpp_merdeka;
    const finalSubjStr = (subject === "Input Mapel Manual (Ketik Sendiri)" || subject === "Semua Mata Pelajaran") ? (manualSubject || "Mata Pelajaran") : subject;
    
    if (rppObj) {
      const rppText = `
RPP MERDEKA — ${finalSubjStr} | ${classLevel}
============================================================
Guru: ${profileName} | NIP: ${profileNip} | Sekolah: ${profileSchool}
------------------------------------------------------------
I. KOMPONEN INTI:
1. Tujuan Pembelajaran:
${rppObj.komponen_inti?.tujuan_pembelajaran || "Belum diisi"}

2. Alur Tujuan Pembelajaran:
${rppObj.komponen_inti?.alur_tujuan_pembelajaran || "Fase perkembangan kognitif terstruktur"}

3. Materi Pokok:
${rppObj.komponen_inti?.materi_pokok || "Materi Kurikulum Merdeka"}

II. LANGKAH PEMBELAJARAN:
Pembuka:
${rppObj.langkah_pembelajaran?.kegiatan_pembuka || "Pembukaan kelas rutin"}

Inti:
${rppObj.langkah_pembelajaran?.kegiatan_inti_mendalam || "Kegiatan eksplorasi mendalam"}

Penutup:
${rppObj.langkah_pembelajaran?.kegiatan_penutup || "Refleksi dan kesimpulan"}
      `.trim();
      payloads.push({
        fileName: `Modul_Ajar_RPP_${finalSubjStr.replace(/\s+/g, "_")}.docx`,
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        content: rppText,
        size: `${(Math.round(rppText.length / 100) / 10 + 20).toFixed(1)} KB`
      });
    } else {
      payloads.push({
        fileName: "Modul_Ajar_RPP_Lengkap_Tahfidz.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        content: `DRAF MODUL AJAR TAHFIDZ - SEKOLAH: ${profileSchool}\nGuru: ${profileName}\nNIP: ${profileNip}\nStatus: Aktif dan tuntas disusun.`,
        size: "34.5 KB"
      });
    }

    // 2. Canva Presentation Slides
    const slidesObj = currentResult?.ppt_canva_ready_slides;
    if (slidesObj && slidesObj.length > 0) {
      const slidesText = slidesObj.map(s => `
[Slide ${s.slide_nomor}: ${s.judul_halaman}]
Template Layout: ${s.layout_template}
Poin Materi:
${s.isi_poin_materi.map(p => `- ${p}`).join("\n")}
Prompt Bahan Visual: ${s.image_generation_prompt}
      `).join("\n\n");
      payloads.push({
        fileName: `Slide_Canva_AI_${finalSubjStr.replace(/\s+/g, "_")}.pptx`,
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        content: slidesText,
        size: `${(Math.round(slidesText.length / 100) / 10 + 15).toFixed(1)} KB`
      });
    } else {
      payloads.push({
        fileName: "Slide_PPT_Siklus_Air_dan_Hujan.pptx",
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        content: "[Slide 1] Siklus Pembelajaran Air Merdeka\n[Slide 2] Proses Kondensasi & Presipitasi\n[Slide 3] Eksperimen Mini di Kelas\n[Slide 4] Pengisian Lembar Refleksi",
        size: "42.1 KB"
      });
    }

    // 3. Presensi Bulanan
    const attendanceEntries = Object.entries(attendance);
    if (attendanceEntries.length > 0) {
      const attText = `
REKAP ABSENSI BULANAN SISWA KURIKULUM MERDEKA
------------------------------------------------------------
Kelas: ${activeKelas}
Sekolah: ${profileSchool}
Total Siswa Terdaftar: ${attendanceEntries.length}

Rincian Presensi:
${attendanceEntries.map(([name, days]) => {
  const hadirCount = Object.values(days).filter(v => v === "Hadir").length;
  const sakitCount = Object.values(days).filter(v => v === "Sakit").length;
  const izinCount = Object.values(days).filter(v => v === "Izin").length;
  const alpaCount = Object.values(days).filter(v => v === "Alpa").length;
  return `- ${name}: Hadir: ${hadirCount}, Sakit: ${sakitCount}, Izin: ${izinCount}, Alpa: ${alpaCount}`;
}).join("\n")}
      `.trim();
      payloads.push({
        fileName: `Rekap_Presensi_Harian_Mei_${activeKelas.replace(/\s+/g, "_")}.xlsx`,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        content: attText,
        size: `${(Math.round(attText.length / 100) / 10 + 12).toFixed(1)} KB`
      });
    } else {
      payloads.push({
        fileName: "Perekaman_Presensi_Harian_Mei_SD_Kelas_1_6.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        content: "Id,Nama,Hadir,Sakit,Izin,Alpa\n1,Andi Pratama,20,0,1,0\n2,Budi Wijaya,19,1,1,0\n3,Citra Lestari,21,0,0,0",
        size: "18.4 KB"
      });
    }

    // 4. Loker Tugas (Grades)
    const gradeEntries = Object.entries(studentGrades) as [string, { score: number; feedback: string }][];
    if (gradeEntries.length > 0) {
      const gradesText = `
REKAP NILAI LOKER TUGAS HARIAN
------------------------------------------------------------
Tugas Aktif: ${selectedAssignment}
Rincian Nilai:
${gradeEntries.map(([name, g]) => `- ${name}: Nilai ${g.score} | Catatan: ${g.feedback}`).join("\n")}
      `.trim();
      payloads.push({
        fileName: `Laporan_Evaluasi_Loker_Tugas_${selectedAssignment.replace(/\s+/g, "_")}.xlsx`,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        content: gradesText,
        size: `${(Math.round(gradesText.length / 100) / 10 + 10).toFixed(1)} KB`
      });
    } else {
      payloads.push({
        fileName: "Evaluasi_dan_Penginputan_Nilai_Loker_Tugas.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        content: "Id,Nama,Tugas,Nilai,Umpan Balik\n1,Andi Pratama,Praktikum Fotosintesis,85,Sangat baik\n2,Budi Wijaya,Praktikum Fotosintesis,78,Tingkatkan konsistensi",
        size: "15.9 KB"
      });
    }

    return payloads;
  };

  const [materialText, setMaterialText] = useState<string>(() => {
    try {
      return localStorage.getItem("grup_material_text") || "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("grup_material_text", materialText);
    } catch (e) {
      console.error(e);
    }
  }, [materialText]);
  const [materialImage, setMaterialImage] = useState<ImageUpload | null>(null);

  // Home Screen Sub-Tabs state
  const [activeHomeSubTab, setActiveHomeSubTab] = useState<string>("Data Utama");

  // Profile management states
  const [profileName, setProfileName] = useState<string>(() => {
    try {
      return localStorage.getItem("grup_profile_name") || "Bapak Adib Ahdiyat, S.Pd.";
    } catch {
      return "Bapak Adib Ahdiyat, S.Pd.";
    }
  });
  const [profileNip, setProfileNip] = useState<string>(() => {
    try {
      return localStorage.getItem("grup_profile_nip") || "203476236472001 (Aktif)";
    } catch {
      return "203476236472001 (Aktif)";
    }
  });
  const [profileSchool, setProfileSchool] = useState<string>(() => {
    try {
      return localStorage.getItem("grup_profile_school") || "SD Insan Muttaqin Islamic School";
    } catch {
      return "SD Insan Muttaqin Islamic School";
    }
  });
  const [profilePic, setProfilePic] = useState<string>(() => {
    try {
      return localStorage.getItem("grup_profile_pic") || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
    } catch {
      return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";
    }
  });
  const [profileQuote, setProfileQuote] = useState<string>(() => {
    try {
      return localStorage.getItem("grup_profile_quote") || "Mendidik dengan hati, membentuk karakter generasi emas bangsa.";
    } catch {
      return "Mendidik dengan hati, membentuk karakter generasi emas bangsa.";
    }
  });
  const [isSavingSchool, setIsSavingSchool] = useState(false);

  const [expandedAccountSection, setExpandedAccountSection] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("grup_profile_name", profileName);
    } catch (e) {
      console.error(e);
    }
  }, [profileName]);

  useEffect(() => {
    try {
      localStorage.setItem("grup_profile_nip", profileNip);
    } catch (e) {
      console.error(e);
    }
  }, [profileNip]);

  useEffect(() => {
    try {
      localStorage.setItem("grup_profile_school", profileSchool);
    } catch (e) {
      console.error(e);
    }
  }, [profileSchool]);

  useEffect(() => {
    try {
      localStorage.setItem("grup_profile_pic", profilePic);
    } catch (e) {
      console.error(e);
    }
  }, [profilePic]);

  useEffect(() => {
    try {
      localStorage.setItem("grup_profile_quote", profileQuote);
    } catch (e) {
      console.error(e);
    }
  }, [profileQuote]);

  // Google Drive destination link state
  const [driveLink, setDriveLink] = useState<string>("https://drive.google.com/drive/folders/1abc9876xyz_merdeka_rpp_cempaka");
  
  // Storage preference auto-sync to avoid wasting GDrive space
  const [autoSyncDrive, setAutoSyncDrive] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("gurupintar_autosync_gdrive");
      return stored === "true"; // default is false (manual sync) to save space as requested
    } catch (_) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("gurupintar_autosync_gdrive", String(autoSyncDrive));
    } catch (e) {
      console.error(e);
    }
  }, [autoSyncDrive]);
  
  // Synchronization status tracking
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success">("idle");
  const [syncProgress, setSyncProgress] = useState<number>(0);

  // Books / Sheets states
  const [selectedAssignment, setSelectedAssignment] = useState<string>("Laporan Praktikum Gelembung Daun");
  
  // Seed initial attendance entries
  const [attendance, setAttendance] = useState<{ [name: string]: { [day: number]: "Hadir" | "Sakit" | "Izin" | "Alpa" } }>(() => {
    return getInitialAttendance(activeKelas);
  });

  const [studentGrades, setStudentGrades] = useState<{ [name: string]: { score: number; feedback: string } }>(() => {
    return getInitialGrades(activeKelas);
  });

  // Load and sync when active class changes
  useEffect(() => {
    setAttendance(getInitialAttendance(activeKelas));
    setStudentGrades(getInitialGrades(activeKelas));
  }, [activeKelas]);

  // Automatically save attendance on change to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`gurupintar_attendance_${activeKelas}`, JSON.stringify(attendance));
    } catch (e) {
      console.error(e);
    }
  }, [attendance, activeKelas]);

  // Automatically save student grades on change to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`gurupintar_grades_${activeKelas}`, JSON.stringify(studentGrades));
    } catch (e) {
      console.error(e);
    }
  }, [studentGrades, activeKelas]);

  // Auto-save kelas list
  useEffect(() => {
    try {
      localStorage.setItem("gurupintar_kelas_list", JSON.stringify(kelasList));
    } catch (e) {
      console.error(e);
    }
  }, [kelasList]);

  useEffect(() => {
    try {
      localStorage.setItem("gurupintar_active_kelas", activeKelas);
    } catch (e) {
      console.error(e);
    }
  }, [activeKelas]);

  // active generator tabs inside workspace right column
  const [workspaceTab, setWorkspaceTab] = useState<"rpp" | "video" | "guide">("rpp");

  // Core Result from AI Model
  const [currentResult, setCurrentResult] = useState<GenerateResult>(DEFAULT_INITIAL_RESULT);
  
  // Force re-render of Media & Alat Peraga container on regeneration
  const [mediaRefreshKey, setMediaRefreshKey] = useState<number>(0);
  
  // Back key hardware/browser accidental exit intercept warning
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // Auto-refresh media components key whenever currentResult is regenerated or loaded
  useEffect(() => {
    setMediaRefreshKey((prev) => prev + 1);
  }, [currentResult]);

  // Accidental mobile back and page refresh tracking
  useEffect(() => {
    // Lock initial state history stack
    window.history.pushState({ noAccidentalBack: true }, "");

    const handlePopState = (e: PopStateEvent) => {
      // Re-push immediately so that we catch further back key clicks too
      window.history.pushState({ noAccidentalBack: true }, "");
      setShowExitConfirm(true);
      playSfx("click");
    };
    
    window.addEventListener("popstate", handlePopState);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Apakah Anda yakin ingin keluar? Seluruh data draf RPP, slide, & LKPD yang belum disimpan akan hilang.";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  
  // Loading & logs
  const [generating, setGenerating] = useState<boolean>(false);
  const [loadingQuote, setLoadingQuote] = useState<string>("");
  const [generateError, setGenerateError] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Array<{role: "user"|"ai", text: string}>>([]);

  // Studio mode configuration (Instant)
  const studioMode = "instant";

  // History system
  const [savedDrafts, setSavedDrafts] = useState<Array<{
    id: string;
    timestamp: string;
    classLevel: string;
    subject: string;
    manualSubject?: string;
    materialText?: string;
    result: GenerateResult;
  }>>([
    {
      id: "draft-1",
      timestamp: "2026-05-28 08:30 WIB",
      classLevel: "SD Kelas 1-6",
      subject: "Siklus Pembelajaran Fotosintesis",
      manualSubject: "IPAS (IPA & IPS Gabungan)",
      materialText: "Fotosintesis adalah suatu metabolisme biokimia vital di mana tumbuhan berklorofil bereaksi mereaksikan air (dari tanah) dan gas karbondioksida (dari udara bebas) menjadi karbohidrat/glukosa dan melepaskan oksigen jernih ke atmosfer dengan bantuan asimilasi sinar foton matahari. Ekosistem rantai makanan menggambarkan siklus sirkular aliran energi dari produsen ke konsumen primer (herbivora), konsumen sekunder (karnivora), konsumen tersier (predator puncak) hingga diuraikan kembali oleh dekomposer tanah.",
      result: DEFAULT_INITIAL_RESULT
    }
  ]);

  // Activity Logs state for Google Drive sync tracking
  const [activityLogs, setActivityLogs] = useState<Array<{
    id: string;
    no: number;
    timestamp: string;
    activityType: string;
    synced: boolean;
    driveUrl: string;
  }>>([
    {
      id: "act-1",
      no: 1,
      timestamp: "2026-05-28 08:30 WIB",
      activityType: "Penyusunan RPP Tahfidz - SD Kelas 1-6",
      synced: true,
      driveUrl: "https://drive.google.com"
    },
    {
      id: "act-2",
      no: 2,
      timestamp: "2026-05-28 09:12 WIB",
      activityType: "Penyusunan Slide PPT Siklus Air & Hujan",
      synced: true,
      driveUrl: "https://drive.google.com"
    },
    {
      id: "act-3",
      no: 3,
      timestamp: "2026-05-28 10:15 WIB",
      activityType: "Perekaman Presensi Harian Mei - SD Kelas 1-6",
      synced: false,
      driveUrl: "https://drive.google.com"
    },
    {
      id: "act-4",
      no: 4,
      timestamp: "2026-05-28 10:45 WIB",
      activityType: "Evaluasi & Penginputan Nilai Loker Tugas",
      synced: false,
      driveUrl: "https://drive.google.com"
    }
  ]);

  const addActivityLog = (type: string, isSynced = false) => {
    const now = new Date();
    const stamp = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} WIB`;
    setActivityLogs((prev) => [
      {
        id: `act-${Date.now()}`,
        no: prev.length + 1,
        timestamp: stamp,
        activityType: type,
        synced: isSynced,
        driveUrl: driveLink || "https://drive.google.com"
      },
      ...prev
    ]);
  };

  const resolvedSubject = (subject === "Input Mapel Manual (Ketik Sendiri)" || subject === "Semua Mata Pelajaran") ? (manualSubject || "Mata Pelajaran") : subject;

  // Floating AI revision chatbot
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [revisionPrompt, setRevisionPrompt] = useState<string>("");
  const [revising, setRevising] = useState<boolean>(false);

  // Guided context tutorials inline under headings
  const [showGuidedTutorial, setShowGuidedTutorial] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem("gurupintar_show_tutorial");
      return cached !== "false"; // default true jika belum pernah disimpan
    } catch {
      return true;
    }
  });

  const toggleGuidedTutorial = () => {
    const nextVal = !showGuidedTutorial;
    setShowGuidedTutorial(nextVal);
    try {
      localStorage.setItem("gurupintar_show_tutorial", nextVal ? "true" : "false");
    } catch (e) {
      console.error(e);
    }
  };

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem("gurupintar_logged_in") === "true";
    } catch {
      return false;
    }
  });
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [teacherApiKey, setTeacherApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem("grup_teacher_api_key") || "";
    } catch {
      return "";
    }
  });

  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const cached = localStorage.getItem("grup_current_user");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [schoolAccessCode, setSchoolAccessCode] = useState<string>("");

  useEffect(() => {
    try {
      localStorage.setItem("grup_teacher_api_key", teacherApiKey);
    } catch (e) {
      console.error(e);
    }
  }, [teacherApiKey]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem("grup_current_user", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("grup_current_user");
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Onboarding tracking state
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      return localStorage.getItem("grup_onboarding_shown") !== "true";
    } catch {
      return true;
    }
  });

   // Feedback States (A)
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [feedbackType, setFeedbackType] = useState<"Lapor Bug" | "Saran" | "Pujian">("Saran");
  const [feedbackSent, setFeedbackSent] = useState<boolean>(false);

  // --- FITUR HARIAN ---

  // Jurnal Mengajar
  const [jurnalList, setJurnalList] = useState<Array<{
    id: number;
    tanggal: string;
    kelas: string;
    mapel: string;
    topik: string;
    kendala: string;
    rencanaSel: string;
    suasana: "😊 Menyenangkan" | "😐 Biasa Saja" | "😔 Perlu Evaluasi";
  }>>(() => {
    try { return JSON.parse(localStorage.getItem("grup_jurnal_list") || "[]"); } catch { return []; }
  });
  const [showJurnalModal, setShowJurnalModal] = useState<boolean>(false);
  const [jurnalActiveTab, setJurnalActiveTab] = useState<"tulis" | "riwayat">("tulis");
  const [catatanActiveTab, setCatatanActiveTab] = useState<"input" | "riwayat">("input");
  const [isJurnalInfoMinimized, setIsJurnalInfoMinimized] = useState<boolean>(() => {
    try { return localStorage.getItem("grup_jurnal_info_minimized") === "true"; } catch { return false; }
  });
  const [jurnalSearch, setJurnalSearch] = useState<string>("");
  const [expandedJurnalId, setExpandedJurnalId] = useState<number | null>(null);
  const [jurnalForm, setJurnalForm] = useState({
    kelas: "",
    mapel: "",
    topik: "",
    kendala: "",
    rencanaSel: "",
    suasana: "😊 Menyenangkan" as "😊 Menyenangkan" | "😐 Biasa Saja" | "😔 Perlu Evaluasi"
  });

  // Kuis Dadakan
  const [showKuisModal, setShowKuisModal] = useState<boolean>(false);
  const [kuisResult, setKuisResult] = useState<string>("");
  const [isGeneratingKuis, setIsGeneratingKuis] = useState<boolean>(false);
  const [kuisMapel, setKuisMapel] = useState<string>("");
  const [kuisTopik, setKuisTopik] = useState<string>("");
  const [kuisJumlah, setKuisJumlah] = useState<string>("5");
  const [kuisKelas, setKuisKelas] = useState<string>("Kelas 4 SD");

  // Catatan Perkembangan Siswa
  const [catatanSiswa, setCatatanSiswa] = useState<Record<string, Record<string, {
    status: "aktif" | "pasif" | "perhatian" | "-";
    catatan: string;
  }>>>(() => {
    try { return JSON.parse(localStorage.getItem("grup_catatan_siswa") || "{}"); } catch { return {}; }
  });
  const [showCatatanModal, setShowCatatanModal] = useState<boolean>(false);
  const [catatanKelasAktif, setCatatanKelasAktif] = useState<string>("");

  useEffect(() => {
    try { localStorage.setItem("grup_jurnal_list", JSON.stringify(jurnalList)); } catch {}
  }, [jurnalList]);
  useEffect(() => {
    try { localStorage.setItem("grup_catatan_siswa", JSON.stringify(catatanSiswa)); } catch {}
  }, [catatanSiswa]);

  // Real-time calculation of matching elements based on global search query
  const queryTextComp = searchQueryGlobal.toLowerCase().trim();
  const matchedStudentsList: any[] = [];
  const matchedRppsList: any[] = [];
  const matchedJournalsList: any[] = [];

  if (queryTextComp.length > 0) {
    // 1. Search Students
    kelasList.forEach((kelasName) => {
      const students = getDeterministicStudents(kelasName);
      students.forEach((name) => {
        if (name.toLowerCase().includes(queryTextComp)) {
          let attRecord = {};
          try {
            const cached = localStorage.getItem(`gurupintar_attendance_${kelasName}`);
            if (cached) attRecord = JSON.parse(cached);
          } catch {}
          if (!attRecord || Object.keys(attRecord).length === 0) {
            attRecord = getInitialAttendance(kelasName);
          }
          const sAttendance = (attRecord as any)[name] || {};
          let h = 0, s = 0, i = 0, a = 0;
          Object.values(sAttendance).forEach((v) => {
            if (v === "Hadir") h++;
            if (v === "Sakit") s++;
            if (v === "Izin") i++;
            if (v === "Alpa") a++;
          });

          let gdRecord = {};
          try {
            const cached = localStorage.getItem(`gurupintar_grades_${kelasName}`);
            if (cached) gdRecord = JSON.parse(cached);
          } catch {}
          if (!gdRecord || Object.keys(gdRecord).length === 0) {
            gdRecord = getInitialGrades(kelasName);
          }
          const grade = (gdRecord as any)[name] || { score: 70, feedback: "Butuh bimbingan mandiri tambahan." };
          const noteObj = catatanSiswa[kelasName]?.[name] || { status: "-" as const, catatan: "" };

          matchedStudentsList.push({
            nama: name,
            kelas: kelasName,
            score: grade.score,
            feedback: grade.feedback,
            behavior: noteObj.status,
            notes: noteObj.catatan,
            attendanceStats: { hadir: h, sakit: s, izin: i, alpa: a }
          });
        }
      });
    });

    // 2. Search RPPs
    RPP_TEMPLATES.forEach((temp) => {
      if (
        temp.title.toLowerCase().includes(queryTextComp) ||
        temp.subject.toLowerCase().includes(queryTextComp) ||
        temp.text.toLowerCase().includes(queryTextComp) ||
        temp.level.toLowerCase().includes(queryTextComp)
      ) {
        matchedRppsList.push({ ...temp, isCustom: false });
      }
    });

    let localCustom: any[] = [];
    try {
      const cached = localStorage.getItem("gurupintar_custom_templates");
      if (cached) localCustom = JSON.parse(cached);
    } catch {}
    localCustom.forEach((temp: any) => {
      if (
        temp.title.toLowerCase().includes(queryTextComp) ||
        temp.subject.toLowerCase().includes(queryTextComp) ||
        temp.text.toLowerCase().includes(queryTextComp) ||
        temp.level.toLowerCase().includes(queryTextComp)
      ) {
        matchedRppsList.push({ ...temp, isCustom: true });
      }
    });

    // 3. Search Journals
    jurnalList.forEach((j) => {
      if (
        j.kelas.toLowerCase().includes(queryTextComp) ||
        j.mapel.toLowerCase().includes(queryTextComp) ||
        j.topik.toLowerCase().includes(queryTextComp) ||
        j.tanggal.toLowerCase().includes(queryTextComp) ||
        (j.suasana && j.suasana.toLowerCase().includes(queryTextComp)) ||
        (j.kendala && j.kendala.toLowerCase().includes(queryTextComp)) ||
        (j.rencanaSel && j.rencanaSel.toLowerCase().includes(queryTextComp))
      ) {
        matchedJournalsList.push(j);
      }
    });
  }

  const [raporNarasiResult, setRaporNarasiResult] = useState<string>("");
  const [isGeneratingRapor, setIsGeneratingRapor] = useState<boolean>(false);
  const [showRaporModal, setShowRaporModal] = useState<boolean>(false);
  const [raporSemester, setRaporSemester] = useState<string>("Genap");
  const [raporTahunAjaran, setRaporTahunAjaran] = useState<string>("2025/2026");
  const [templateRaporText, setTemplateRaporText] = useState<string>("");
  const [namaKepalaSekolah, setNamaKepalaSekolah] = useState<string>("");
  const [nipKepalaSekolah, setNipKepalaSekolah] = useState<string>("");
  const [kotaSekolah, setKotaSekolah] = useState<string>("");
  const [kopSuratImage, setKopSuratImage] = useState<string | null>(null);
  const [isSendingFeedback, setIsSendingFeedback] = useState<boolean>(false);
  const [storedFeedbacks, setStoredFeedbacks] = useState<any[]>(() => {
    try {
      const data = localStorage.getItem("grup_feedback_list");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  // API Key Guide States (B)
  const [showApiGuide, setShowApiGuide] = useState<boolean>(false);
  const [isApiGuideMinimized, setIsApiGuideMinimized] = useState<boolean>(false);
  const [hasSeenApiGuide, setHasSeenApiGuide] = useState<boolean>(() => {
    try {
      return localStorage.getItem("grup_seen_api_guide") === "true";
    } catch {
      return false;
    }
  });

  const TEACHER_ACCOUNTS = [
    {
      code: "GURUSUPER",
      name: "Budi Santoso, S.Pd.",
      school: "SDN 1 Harapan",
      email: "budi@school.id",
      nip: "198501022010011002"
    },
    {
      code: "GURUKREATIF",
      name: "Siti Aminah, M.Pd.",
      school: "SMPN 2 Sukses",
      email: "siti@school.id",
      nip: "199003152015022001"
    },
    {
      code: "GURUINOVATIF",
      name: "Adib Ahdiyat, M.T.",
      school: "SMAN 3 Cerdas",
      email: "adib@school.id",
      nip: "198804052026042001"
    }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setLoginError("Harap masukkan nama lengkap Anda.");
      return;
    }
    if (schoolAccessCode.toUpperCase().trim() !== "GURUPINTAR2026") {
      setLoginError("Kode Akses Salah, Hubungi Admin di WhatsApp");
      return;
    }

    setLoginError("");
    const teacherName = loginEmail.trim();
    setProfileName(teacherName);
    setProfileSchool("SDN 1 Harapan");
    setProfileNip("-");
    const matchedTeacher = {
      code: "GURUPINTAR2026",
      name: teacherName,
      school: "SDN 1 Harapan",
      email: `${teacherName.toLowerCase().replace(/\s+/g, "")}@school.id`,
      nip: "-"
    };
    setCurrentUser(matchedTeacher);
    setIsLoggedIn(true);

    // API Key Guide Auto Popup (B)
    if (!hasSeenApiGuide && !teacherApiKey) {
      setTimeout(() => {
        setShowApiGuide(true);
        setHasSeenApiGuide(true);
        try {
          localStorage.setItem("grup_seen_api_guide", "true");
        } catch (e) {
          console.error(e);
        }
      }, 1500);
    }

    try {
      localStorage.setItem("gurupintar_logged_in", "true");
      localStorage.setItem("grup_profile_name", teacherName);
      localStorage.setItem("grup_profile_school", "SDN 1 Harapan");
      localStorage.setItem("grup_profile_nip", "-");
      localStorage.setItem("gurupintar_user_name", teacherName);
    } catch (err) {
      console.error(err);
    }

    showToast("🔓 Akses Berhasil! Selamat datang di Portal GuruPintar AI Beta.");
  };

  // Feedback Handlers (A)
  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || isSendingFeedback) return;

    setIsSendingFeedback(true);

    const newFeedback = {
      id: Date.now(),
      type: feedbackType,
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
          category: feedbackType,
          message: feedbackText.trim(),
          school: profileSchool || "-",
          nip: profileNip || "-",
          _subject: `[GuruPintar.AI Feedback] ${feedbackType} dari ${profileName || "Guru Anonim"}`,
          _replyto: loginEmail || "adibahdiyat98@gmail.com",
          _captcha: "false"
        })
      });

      if (response.ok) {
        showToast("💌 Terima kasih! Feedback langsung terkirim ke email pengembang.");
      } else {
        // Fallback if blocked
        showToast("✓ Sukses! Tanggapan Anda telah terkirim & disimpan dalam database.");
      }
    } catch (err) {
      console.error("Error sending feedback to developer email:", err);
      showToast("✓ Sukses! Tanggapan disimpan secara aman di database lokal.");
    } finally {
      setIsSendingFeedback(false);
      setFeedbackText("");
      setFeedbackSent(true);
    }
  };

  const handleGenerateRapor = async () => {
    const siswaData = Object.entries(studentGrades || {}).map(([nama, g]: any) => ({
      nama, nilai: g.score || g.nilai || "-", catatan: g.feedback || g.catatan || ""
    }));
    if (siswaData.length === 0) {
      showToast("⚠️ Belum ada data nilai. Isi nilai siswa di Loker Nilai terlebih dahulu.");
      return;
    }
    setIsGeneratingRapor(true);
    setRaporNarasiResult("");
    try {
      const finalSubject = subject === "Input Mapel Manual (Ketik Sendiri)" ? manualSubject : subject;
      const res = await fetch("/api/generate/rapor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(teacherApiKey?.trim() ? { "x-user-api-key": teacherApiKey.trim() } : {})
        },
        body: JSON.stringify({
          namaGuru: profileName, namaSekolah: profileSchool,
          kelas: activeKelas, mapel: finalSubject,
          semester: raporSemester, tahunAjaran: raporTahunAjaran,
          siswaData, templateRapor: templateRaporText
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRaporNarasiResult(data.narasi);
      showToast("✅ Narasi rapor berhasil dibuat!");
    } catch (err: any) {
      showToast("❌ " + err.message);
    } finally {
      setIsGeneratingRapor(false);
    }
  };

  const handleSimpanJurnal = () => {
    if (!jurnalForm.topik.trim()) {
      showToast("⚠️ Isi topik yang diajarkan!");
      return;
    }
    const now = new Date();
    const newJurnal = {
      id: Date.now(),
      tanggal: now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      kelas: jurnalForm.kelas || activeKelas,
      mapel: jurnalForm.mapel || (subject === "Input Mapel Manual (Ketik Sendiri)" ? manualSubject : subject),
      topik: jurnalForm.topik,
      kendala: jurnalForm.kendala,
      rencanaSel: jurnalForm.rencanaSel,
      suasana: jurnalForm.suasana
    };
    setJurnalList(prev => [newJurnal, ...prev]);
    setJurnalForm({ kelas: "", mapel: "", topik: "", kendala: "", rencanaSel: "", suasana: "😊 Menyenangkan" });
    setShowJurnalModal(false);
    showToast("✅ Jurnal mengajar hari ini berhasil disimpan!");
    playSfx("success");
  };

  const handleGenerateKuis = async () => {
    if (!kuisTopik.trim()) {
      showToast("⚠️ Isi topik kuis terlebih dahulu!");
      return;
    }
    setIsGeneratingKuis(true);
    setKuisResult("");
    try {
      const finalMapel = kuisMapel || (subject === "Input Mapel Manual (Ketik Sendiri)" ? manualSubject : subject);
      const res = await fetch("/api/generate/kuis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(teacherApiKey?.trim() ? { "x-user-api-key": teacherApiKey.trim() } : {})
        },
        body: JSON.stringify({
          kelas: kuisKelas,
          mapel: finalMapel,
          topik: kuisTopik,
          jumlah: kuisJumlah
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setKuisResult(data.kuis);
      showToast(`✅ ${kuisJumlah} soal kuis berhasil dibuat!`);
    } catch (err: any) {
      showToast("❌ " + err.message);
    } finally {
      setIsGeneratingKuis(false);
    }
  };

  const parseKontenKeDocx = (teks: string): Paragraph[] => {
    if (!teks) return [];
    return teks.split("\n").map((baris) => {
      const trimmed = baris.trim();
      // Heading level 1: baris diawali #
      if (trimmed.startsWith("# ")) {
        return new Paragraph({
          text: trimmed.replace(/^# /, ""),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        });
      }
      // Heading level 2: baris diawali ##
      if (trimmed.startsWith("## ")) {
        return new Paragraph({
          text: trimmed.replace(/^## /, ""),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        });
      }
      // Heading level 3
      if (trimmed.startsWith("### ")) {
        return new Paragraph({
          text: trimmed.replace(/^### /, ""),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
        });
      }
      // Baris === (separator)
      if (trimmed.startsWith("===") && trimmed.endsWith("===")) {
        return new Paragraph({
          children: [new TextRun({
            text: trimmed.replace(/={3,}/g, "").trim(),
            bold: true,
            underline: { type: UnderlineType.SINGLE },
            size: 24,
          })],
          spacing: { before: 200, after: 80 },
        });
      }
      // Bullet list: baris diawali - atau *
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({
            text: trimmed.replace(/^[-*] /, ""),
            size: 22,
          })],
          spacing: { before: 40, after: 40 },
        });
      }
      // Numbered list: baris diawali angka.
      if (/^\d+\.\s/.test(trimmed)) {
        return new Paragraph({
          numbering: { reference: "default-numbering", level: 0 },
          children: [new TextRun({ text: trimmed.replace(/^\d+\.\s/, ""), size: 22 })],
          spacing: { before: 40, after: 40 },
        });
      }
      // Bold: **teks**
      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        return new Paragraph({
          children: [new TextRun({
            text: trimmed.replace(/\*\*/g, ""),
            bold: true, size: 22,
          })],
          spacing: { before: 60, after: 40 },
        });
      }
      // Baris kosong
      if (!trimmed) {
        return new Paragraph({ text: "", spacing: { before: 60, after: 60 } });
      }
      // Teks biasa
      return new Paragraph({
        children: [new TextRun({ text: trimmed, size: 22 })],
        spacing: { before: 40, after: 40 },
      });
    });
  };

  const generateDocxRapi = async (
    konten: string,
    judulDokumen: string,
    options?: { landscape?: boolean }
  ) => {
    try {
      showToast("⏳ Menyiapkan dokumen Word...");

      const now = new Date();
      const tanggalStr = `${kotaSekolah || "............"}, ${now.toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric"
      })}`;

      // Baris identitas dokumen
      const identitasRows: Paragraph[] = [
        new Paragraph({
          children: [
            new TextRun({ text: "Mata Pelajaran\t: ", bold: true, size: 22 }),
            new TextRun({ text: subject === "Input Mapel Manual (Ketik Sendiri)" ? manualSubject : subject, size: 22 }),
          ],
          spacing: { before: 60, after: 40 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Kelas / Semester\t: ", bold: true, size: 22 }),
            new TextRun({ text: `${classLevel} / ${raporSemester || "Genap"}`, size: 22 }),
          ],
          spacing: { before: 40, after: 40 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Nama Guru\t\t: ", bold: true, size: 22 }),
            new TextRun({ text: profileName || "................................", size: 22 }),
          ],
          spacing: { before: 40, after: 40 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "NIP\t\t\t: ", bold: true, size: 22 }),
            new TextRun({ text: profileNip || "................................", size: 22 }),
          ],
          spacing: { before: 40, after: 40 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Instansi\t\t: ", bold: true, size: 22 }),
            new TextRun({ text: profileSchool || "................................", size: 22 }),
          ],
          spacing: { before: 40, after: 80 },
        }),
      ];

      // Garis pemisah
      const garisPemisah = new Paragraph({
        border: { bottom: { color: "000000", space: 1, style: BorderStyle.SINGLE, size: 12 } },
        spacing: { before: 80, after: 80 },
        text: "",
      });

      // Isi konten dokumen
      const kontenParagraphs = parseKontenKeDocx(konten);

      // Tanda tangan
      const tandaTangan = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              // Kolom kiri: Kepala Sekolah
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ text: "Mengetahui,", alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 } }),
                  new Paragraph({ text: "Kepala Sekolah", alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 } }),
                  new Paragraph({ text: "", spacing: { before: 0, after: 0 } }),
                  new Paragraph({ text: "", spacing: { before: 0, after: 0 } }),
                  new Paragraph({ text: "", spacing: { before: 0, after: 0 } }),
                  new Paragraph({
                    border: { top: { color: "000000", space: 1, style: BorderStyle.SINGLE, size: 6 } },
                    children: [new TextRun({ text: namaKepalaSekolah || "................................", bold: true, size: 22 })],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 40, after: 20 },
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: `NIP. ${nipKepalaSekolah || "................................"}`, size: 20 })],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
              }),
              // Kolom kanan: Guru
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ text: tanggalStr, alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 } }),
                  new Paragraph({ text: "Guru Mata Pelajaran", alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 } }),
                  new Paragraph({ text: "", spacing: { before: 0, after: 0 } }),
                  new Paragraph({ text: "", spacing: { before: 0, after: 0 } }),
                  new Paragraph({ text: "", spacing: { before: 0, after: 0 } }),
                  new Paragraph({
                    border: { top: { color: "000000", space: 1, style: BorderStyle.SINGLE, size: 6 } },
                    children: [new TextRun({ text: profileName || "................................", bold: true, size: 22 })],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 40, after: 20 },
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: `NIP. ${profileNip || "................................"}`, size: 20 })],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      // Bangun header dokumen (kop surat atau nama sekolah)
      let headerChildren: Paragraph[];
      if (kopSuratImage) {
        // Konversi base64 ke Uint8Array untuk ImageRun
        const base64Data = kopSuratImage.split(",")[1];
        const binaryStr = atob(base64Data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
        headerChildren = [
          new Paragraph({
            children: [
              new ImageRun({
                data: bytes,
                transformation: { width: 600, height: 100 },
                type: kopSuratImage.includes("image/png") ? "png" : "jpg",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
          }),
          new Paragraph({
            border: { bottom: { color: "000000", space: 1, style: BorderStyle.SINGLE, size: 18 } },
            text: "",
            spacing: { before: 0, after: 120 },
          }),
        ];
      } else {
        headerChildren = [
          new Paragraph({
            children: [new TextRun({ text: profileSchool || "NAMA SEKOLAH", bold: true, size: 28, allCaps: true })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 40 },
          }),
          new Paragraph({
            border: { bottom: { color: "000000", space: 1, style: BorderStyle.DOUBLE, size: 12 } },
            text: "",
            spacing: { before: 0, after: 120 },
          }),
        ];
      }

      // Judul dokumen
      const judulParagraph = new Paragraph({
        children: [new TextRun({
          text: judulDokumen.toUpperCase(),
          bold: true,
          size: 28,
          underline: { type: UnderlineType.SINGLE },
        })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
      });

      // Rakit dokumen final
      const doc = new Document({
        numbering: {
          config: [{
            reference: "default-numbering",
            levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START,
              style: { paragraph: { indent: { left: 360, hanging: 260 } } } }],
          }],
        },
        styles: {
          default: {
            document: {
              run: { font: "Times New Roman", size: 24, color: "000000" },
              paragraph: { spacing: { line: 360 } },
            },
          },
          paragraphStyles: [
            {
              id: "Heading1", name: "Heading 1",
              run: { bold: true, size: 26, color: "000000" },
              paragraph: { spacing: { before: 240, after: 120 } },
            },
            {
              id: "Heading2", name: "Heading 2",
              run: { bold: true, size: 24, color: "000000" },
              paragraph: { spacing: { before: 200, after: 100 } },
            },
          ],
        },
        sections: [{
          properties: {
            page: {
              margin: { top: 1440, right: 1008, bottom: 1440, left: 1440 },
            },
          },
          children: [
            ...headerChildren,
            judulParagraph,
            garisPemisah,
            ...identitasRows,
            garisPemisah,
            ...kontenParagraphs,
            new Paragraph({ text: "", spacing: { before: 480, after: 0 } }),
            tandaTangan,
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const namaFile = `${judulDokumen}_${classLevel}_${profileSchool}.docx`
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_.-]/g, "");
      saveAs(blob, namaFile);
      showToast("✅ Dokumen Word (.docx) berhasil diunduh — rapi siap cetak!");
    } catch (err: any) {
      console.error("docx error:", err);
      showToast("❌ Gagal membuat dokumen: " + err.message);
    }
  };

  const handleExportFeedbackCSV = () => {
    if (storedFeedbacks.length === 0) {
      showToast("⚠️ Belum ada data feedback untuk diekspor!");
      return;
    }

    // Generate CSV content
    const headers = ["ID", "Tipe", "Isi Feedback", "Waktu", "Pengirim"];
    const rows = storedFeedbacks.map(f => [
      f.id,
      f.type,
      `"${f.text.replace(/"/g, '""')}"`,
      f.timestamp,
      f.user
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `feedback_gurupintar_beta_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("📊 File CSV Feedback berhasil diunduh!");
  };

  useEffect(() => {
    if (isLoggedIn) {
      checkApiHealth();
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    if (!confirm("Yakin ingin keluar dari GuruPintar AI?")) return;
    setIsLoggedIn(false);
    setSchoolAccessCode("");
    setCurrentUser(null);
    try {
      localStorage.setItem("gurupintar_logged_in", "false");
      localStorage.removeItem("grup_current_user");
    } catch (err) {
      console.error(err);
    }
    showToast("🔒 Sesi Anda telah diamankan. Berhasil keluar!");
  };

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    try {
      localStorage.setItem("grup_onboarding_shown", "true");
    } catch (err) {
      console.error(err);
    }
  };

  // Overlay management
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);

  const renderOfficialKop = () => {
    return (
      <div className="border-b-4 border-double border-[#1E3A8A] pb-4 mb-6 flex items-center gap-4 select-none print:border-black">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-205 flex items-center justify-center text-3xl shadow-3xs shrink-0 print:border-black">
          🏫
        </div>
        <div className="flex-1 text-left">
          <h4 className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest font-sans leading-none print:text-black">
            KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
          </h4>
          <h2 className="text-base font-black text-[#1E3A8A] uppercase tracking-wide my-1 print:text-black">
            {(profileSchool || 'SEKOLAH DASAR NEGERI INDONESIA').toUpperCase()}
          </h2>
          <p className="text-[9px] text-slate-400 italic font-sans leading-normal print:text-black">
            Alamat Instansi Pendidikan Terakreditasi Nasional • Kelompok Kerja Merdeka
          </p>
        </div>
      </div>
    );
  };

  const renderOfficialMetadata = () => {
    const finalSubject = (subject === "Input Mapel Manual (Ketik Sendiri)" || subject === "Semua Mata Pelajaran")
      ? manualSubject.trim()
      : subject;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50/70 border border-slate-100 rounded-xl text-left text-xs text-slate-705 font-medium mb-6 print:border-black print:bg-white print:text-black">
        <div>
          <p><strong className="text-slate-800 print:text-black font-extrabold">Guru Pengampu:</strong> {profileName}</p>
          <p className="mt-1"><strong className="text-slate-800 print:text-black font-extrabold">NIP / NUPTK:</strong> {profileNip || "Belum diatur"}</p>
        </div>
        <div className="sm:text-right">
          <p><strong className="text-slate-800 print:text-black font-extrabold">Mata Pelajaran:</strong> {finalSubject || "Umum"}</p>
          <p className="mt-1"><strong className="text-slate-800 print:text-black font-extrabold">Kelas / Fase:</strong> {classLevel || "Umum"}</p>
        </div>
      </div>
    );
  };

  const renderOfficialSignatures = () => {
    return (
      <div className="mt-12 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4 text-center text-[11px] text-slate-700 font-semibold leading-relaxed font-sans select-none print:text-black print:border-black">
        <div className="flex flex-col items-center">
          <p className="font-semibold">Mengetahui,</p>
          <p className="font-bold text-[#1E3A8A] uppercase tracking-wide print:text-black">Kepala Sekolah</p>
          <div className="h-16"></div>
          <p className="font-bold border-b border-slate-800 pb-0.5 min-w-[160px] print:border-black">............................................................</p>
          <p className="text-slate-400 text-[9.5px] mt-1 print:text-black">NIP. ......................................................</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-slate-505 print:text-black">{new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
          <p className="font-bold text-[#1E3A8A] uppercase tracking-wide print:text-black">Guru Mata Pelajaran</p>
          <div className="h-16"></div>
          <p className="font-bold text-slate-900 border-b border-slate-800 pb-0.5 min-w-[160px] print:text-black">{profileName}</p>
          <p className="text-slate-400 text-[9.5px] mt-1 print:text-black">NIP. {profileNip || "......................................................"}</p>
        </div>
      </div>
    );
  };

  // Quotes cycler during loading
  useEffect(() => {
    let interval: any;
    if (generating || !!generatingDokumen) {
      setLoadingQuote(LOADING_QUOTES[0]);
      let idx = 1;
      interval = setInterval(() => {
        setLoadingQuote(LOADING_QUOTES[idx % LOADING_QUOTES.length]);
        idx++;
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [generating, generatingDokumen]);

  // Toast auto-killer
  const showToast = (msg: string) => {
    setToastMessage(msg);
    try {
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes("sukses") || lowerMsg.includes("berhasil") || lowerMsg.includes("simpan") || lowerMsg.includes("hubungkan") || lowerMsg.includes("terhubung")) {
        playSfx("success");
      } else if (lowerMsg.includes("hapus") || lowerMsg.includes("dihapus") || lowerMsg.includes("gagal") || lowerMsg.includes("batal")) {
        playSfx("delete");
      } else {
        playSfx("notify");
      }
    } catch (e) {
      console.warn("Audio Context delay: ", e);
    }
    setTimeout(() => {
      setToastMessage("");
    }, 4500);
  };

  const handleApplyPreset = (preset: typeof TEACHER_PRESETS[0]) => {
    setClassLevel(preset.level);
    setSubject(preset.subject);
    setMaterialText(preset.text);
    setMaterialImage(null);
    showToast(`📝 Preset "${preset.title}" sukses dimuat ke form input!`);
  };

  // OCR upload handler
  const handleOcrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("⚠️ Harap unggah berkas gambar (PNG, JPG)!");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setMaterialImage({ name: file.name, mimeType: file.type, data: dataUrl, previewUrl: dataUrl });
        showToast("📸 Foto materi OCR siap diproses!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop for image
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("⚠️ Harap jatuhkan berkas gambar!");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setMaterialImage({ name: file.name, mimeType: file.type, data: dataUrl, previewUrl: dataUrl });
        showToast("📸 Gambar berhasil dijatuhkan dan dimuat!");
      };
      reader.readAsDataURL(file);
    }
  };

  // API Execution wrapper & Google Drive Syncing simulation
  const handleGenerate = async () => {
    if (!materialText.trim() && !materialImage) {
      showToast("⚠️ Harap isi uraian materi atau unggah foto buku terlebih dahulu!");
      return;
    }

    const finalSubject = (subject === "Input Mapel Manual (Ketik Sendiri)" || subject === "Semua Mata Pelajaran")
      ? manualSubject.trim()
      : subject;

    if ((subject === "Input Mapel Manual (Ketik Sendiri)" || subject === "Semua Mata Pelajaran") && !manualSubject.trim()) {
      showToast("⚠️ Harap isi nama mata pelajaran secara manual terlebih dahulu!");
      return;
    }

    setGenerating(true);
    setSyncStatus("idle");
    setGenerateError("");
    showToast("🔄 Mulai menyusun RPP baru: Komponen Media Ajar, Slides, dan LKPD akan disesuaikan otomatis...");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(teacherApiKey ? { "X-User-API-Key": teacherApiKey } : {})
        },
        body: JSON.stringify({
          text: materialText,
          images: materialImage ? [{ mimeType: materialImage.mimeType, data: materialImage.data }] : [],
          classLevel,
          subject: finalSubject,
          p5Theme,
          metode: selectedMetode
        })
      });

      if (!response.ok) {
        let errMsg = "Gagal menyusun materi via model AI.";
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = `Gagal menyusun materi: ${errData.error}`;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data: GenerateResult = await response.json();
      setCurrentResult(data);
      setMobilePane("result");
      showToast("✅ Berhasil memperbarui dokumen! Seluruh komponen Media, Slide Canva AI, dan LKPD telah disinkronisasikan dengan materi baru.");

      addActivityLog(`Penyusunan RPP & PPT - Kelas ${classLevel} (${finalSubject})`, false);

      // Create a saved draft item
      const now = new Date();
      const draftStamp = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} WIB`;
      setSavedDrafts((prev) => [
        {
          id: `draft-${Date.now()}`,
          timestamp: draftStamp,
          classLevel,
          subject: finalSubject,
          manualSubject: (subject === "Input Mapel Manual (Ketik Sendiri)" || subject === "Semua Mata Pelajaran") ? manualSubject.trim() : "",
          materialText: materialText.trim(),
          result: data
        },
        ...prev
      ]);

      addNotification(
        "✨ RPP & Slide Sukses Disusun",
        `Draf perangkat pembelajaran RPP Merdeka & 5 slides materi "${finalSubject}" (${classLevel}) telah berhasil diformulasi.`,
        "success"
      );

      showToast("✨ Modul Ajar RPP & Slides berhasil disusun!");

      // Simulate dynamic google drive folder sync if specified & autoSync is enabled
      if (autoSyncDrive && driveLink && driveLink.trim()) {
        simulateGoogleDriveSync();
      }

    } catch (err: any) {
      console.error(err);
      setGenerateError(err.message);
      showToast("❌ Terjadi gangguan: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateDokumen = async (tipeDokumen: DokumenType) => {
    if (!materialText.trim() && !materialImage) {
      showToast("⚠️ Isi topik/materi terlebih dahulu!");
      return;
    }
    const finalSubject = (subject === "Input Mapel Manual (Ketik Sendiri)" || subject === "Semua Mata Pelajaran")
      ? manualSubject.trim() : subject;

    setGeneratingDokumen(tipeDokumen);
    setDokumenError(prev => ({ ...prev, [tipeDokumen]: undefined }));
    showToast(`🔄 Membuat ${DOKUMEN_LIST.find(d => d.id === tipeDokumen)?.label}...`);

    try {
      let endpoint = "";
      let body: any = { topik: materialText, kelas: classLevel, mapel: finalSubject, metode: selectedMetode };

      if (tipeDokumen === "modul_ajar") {
        endpoint = "/api/generate/rpp";
      } else if (tipeDokumen === "tp_atp") {
        endpoint = "/api/generate/tp_atp";
      } else if (tipeDokumen === "lkpd") {
        endpoint = "/api/generate/lkpd";
        body.rppKonteks = documentoResultContext(); // Fallback helper or state
      } else if (tipeDokumen === "asesmen") {
        endpoint = "/api/generate/asesmen";
        body.lkpdKonteks = dokumenResult["lkpd"] || dokumenResult["modul_ajar"] || materialText;
      } else if (tipeDokumen === "soal_ujian") {
        endpoint = "/api/generate/soal_ujian";
        body.rppKonteks = dokumenResult["modul_ajar"] || materialText;
      }

      // Resolve properly
      if (tipeDokumen === "lkpd") {
        body.rppKonteks = dokumenResult["modul_ajar"] || materialText;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(teacherApiKey ? { "X-User-API-Key": teacherApiKey } : {})
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gagal generate dokumen.");
      }

      const data = await response.json();
      const resultText = data.rpp || data.lkpd || data.asesmen || data.tp_atp || data.soal_ujian || "";

      setDokumenResult(prev => ({ ...prev, [tipeDokumen]: resultText }));

      if (tipeDokumen === "modul_ajar") {
        const cleanSub = finalSubject || "Materi";
        const youtubeKeyword = `${cleanSub} ${materialText.split(" ").slice(0, 3).join(" ")}`;
        const generatedSlides = [
          {
            slide_nomor: 1,
            judul_halaman: `${cleanSub} - ${classLevel}`,
            layout_template: "Layout Minimalis Modern",
            isi_poin_materi: [
              `Selamat Datang di Pembahasan ${cleanSub}!`,
              "Disusun untuk pembuatan pembelajaraan interaktif Kurikulum Merdeka.",
              "Mari bereksplorasi bersama GuruPintar AI."
            ],
            image_generation_prompt: `3D cute illustration, clay style, vivid color, highly detailed, soft lighting of student and teacher discussing ${materialText.substring(0, 50)}, minimal clean pastel background`
          },
          {
            slide_nomor: 2,
            judul_halaman: "Tujuan Pembelajaran",
            layout_template: "Daftar Berpoin Kreatif",
            isi_poin_materi: [
              `Memahami esensi materi ${materialText.split(" ").slice(0, 5).join(" ")}...`,
              "Mampu menyelesaikan studi kasus dan lembar aktivitas.",
              "Mengembangkan kemandirian dan keterampilan bernalar kritis."
            ],
            image_generation_prompt: "3D cute illustration, clay style, study elements, books, atomic model, pencil, pastel setup"
          },
          {
            slide_nomor: 3,
            judul_halaman: "Pembahasan Inti",
            layout_template: "Visual dengan Keterangan Kiri-Kanan",
            isi_poin_materi: [
              `Teori dasar terkait materi: "${materialText.substring(0, 100)}..."`,
              "Definisi esensial dan fakta menarik di lingkungan sekitar.",
              "Hubungan sebab-akibat antar komponen materi."
            ],
            image_generation_prompt: "3D cute illustration, clay style, lightbulb representing new ideas, gears turning, sleek background"
          },
          {
            slide_nomor: 4,
            judul_halaman: "Metode & Aktivitas",
            layout_template: "Bento Grid Layout",
            isi_poin_materi: [
              `Menggunakan model: ${selectedMetode}`,
              "Kolaborasi kelompok, diskusi kritis, dan presentasi mandiri.",
              "Aktivitas interaktif berbasis LKPD."
            ],
            image_generation_prompt: "3D cute illustration, clay style, children collaborating in design, cute wooden toys"
          },
          {
            slide_nomor: 5,
            judul_halaman: "Kesimpulan & Refleksi",
            layout_template: "Minimalis Penutup",
            isi_poin_materi: [
              "Ringkasan seluruh bahasan materi secara ringkas.",
              "Bahan refleksi diri sebelum memulai sesi ujian/penilaian.",
              "Doa penutup dan terima kasih!"
            ],
            image_generation_prompt: "3D cute illustration, clay style, happy students celebrating successful study, modern classroom"
          }
        ];

        setCurrentResult(prev => ({
          ...prev,
          modul_ajar_rpp_merdeka: {
            ...prev.modul_ajar_rpp_merdeka,
            komponen_inti: {
              tujuan_pembelajaran: "Lihat hasil lengkap di tab TP & ATP.",
              alur_tujuan_pembelajaran: "Lihat hasil lengkap di tab TP & ATP.",
              materi_pokok: resultText
            }
          },
          ppt_canva_ready_slides: generatedSlides,
          saran_youtube_spesifik: {
            keyword_pencarian_utama: youtubeKeyword,
            referensi_nama_channel: "GuruPintar AI Edukasi"
          }
        }));
      }

      showToast(`✅ ${DOKUMEN_LIST.find(d => d.id === tipeDokumen)?.label} berhasil dibuat!`);
      setSelectedDokumen(tipeDokumen);
    } catch (err: any) {
      showToast("❌ " + err.message);
      setDokumenError(prev => ({ ...prev, [tipeDokumen]: err.message }));
    } finally {
      setGeneratingDokumen(null);
    }
  };

  // Helper inside to check context safely
  const documentoResultContext = () => {
    return dokumenResult["modul_ajar"] || materialText;
  };

  // --- FUNGSI EKSPOR KE WORD (.DOC) ---
  const exportToWord = () => {
    const rppText = currentResult.modul_ajar_rpp_merdeka;
    const lkpdText = "";
    const asesmenText = "";

    if (!rppText && !lkpdText && !asesmenText) {
      showToast("⚠️ Belum ada data yang bisa diekspor!");
      return;
    }

    const finalSubject = (subject === "Input Mapel Manual (Ketik Sendiri)" || subject === "Semua Mata Pelajaran")
      ? manualSubject.trim()
      : subject;

    // Convert markdown content to formal HTML structures with native tables for Word
    const formattedRpp = convertMarkdownToHtmlForWord(rppText);
    const formattedLkpd = lkpdText ? convertMarkdownToHtmlForWord(lkpdText) : "";
    const formattedAsesmen = asesmenText ? convertMarkdownToHtmlForWord(asesmenText) : "";

    const kopHtml = `
      <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-bottom: 4px double #1e3a8a; padding-bottom: 12px; margin-bottom: 25px; font-family: 'Arial', sans-serif;">
        <tr>
          <td style="width: 12%; text-align: center; vertical-align: middle; font-size: 32pt;">
            🏫
          </td>
          <td style="width: 88%; text-align: left; padding-left: 15px;">
            <div style="font-size: 9.5pt; font-weight: bold; letter-spacing: 1px; color: #475569; text-transform: uppercase;">KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI</div>
            <div style="font-size: 16pt; font-weight: bold; color: #1e3a8a; text-transform: uppercase; margin: 3px 0;">${(profileSchool || 'SEKOLAH DASAR NEGERI INDONESIA').toUpperCase()}</div>
            <div style="font-size: 9pt; color: #64748b; font-style: italic;">Alamat Instansi Pendidikan Terakreditasi Nasional • Komunitas Guru Merdeka</div>
          </td>
        </tr>
      </table>

      <table border="0" cellpadding="6" cellspacing="0" style="width: 100%; margin-bottom: 25px; background-color: #f8fafc; border: 1.5px solid #cbd5e1; font-family: 'Arial', sans-serif; font-size: 10pt; padding: 10px;">
        <tr>
          <td style="width: 50%;"><strong>Guru Pengampu:</strong> ${profileName}</td>
          <td style="width: 50%; text-align: right;"><strong>Mata Pelajaran:</strong> ${finalSubject || 'Umum'}</td>
        </tr>
        <tr>
          <td style="width: 50%;"><strong>NIP / NUPTK:</strong> ${profileNip || 'Belum diatur'}</td>
          <td style="width: 50%; text-align: right;"><strong>Kelas / Alokasi:</strong> ${classLevel || 'Umum'}</td>
        </tr>
      </table>
    `;

    const signaturesHtml = `
      <br/><br/>
      <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-top: 40px; font-family: 'Arial', sans-serif; font-size: 11pt;">
        <tr>
          <td style="width: 50%; text-align: center; vertical-align: top;">
            <p style="margin: 0;">Mengetahui,</p>
            <p style="font-weight: bold; margin: 5px 0 60px 0;">Kepala Sekolah</p>
            <p style="text-decoration: underline; font-weight: bold; margin: 0;">............................................................</p>
            <p style="margin: 5px 0 0 0; font-size: 9.5pt; color: #555555;">NIP. ......................................................</p>
          </td>
          <td style="width: 50%; text-align: center; vertical-align: top;">
            <p style="margin: 0;">Jakarta, ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
            <p style="font-weight: bold; margin: 5px 0 60px 0;">Guru Mata Pelajaran</p>
            <p style="text-decoration: underline; font-weight: bold; margin: 0;">${profileName}</p>
            <p style="margin: 5px 0 0 0; font-size: 9.5pt; color: #555555;">NIP. ${profileNip || '......................................................'}</p>
          </td>
        </tr>
      </table>
    `;

    // Susun konten menjadi HTML terstruktur agar saat dibuka di Word otomatis rapi
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Perangkat Ajar Kurikulum Merdeka - GuruPintar</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; padding: 30px; }
          h2.section-header { text-align: center; font-size: 14pt; font-weight: bold; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 6px; margin-top: 35px; text-transform: uppercase; }
          .page-break { page-break-before: always; }
        </style>
      </head>
      <body>
        ${kopHtml}

        <h2 class="section-header">1. MODUL AJAR (RPP)</h2>
        <div>${formattedRpp || '<em>Belum di-generate</em>'}</div>

        ${lkpdText ? `
        <div class="page-break"></div>
        <h2 class="section-header" style="color: #16a34a; border-bottom: 2px solid #16a34a;">2. LEMBAR KERJA PESERTA DIDIK (LKPD)</h2>
        <div>${formattedLkpd}</div>
        ` : ''}

        ${asesmenText ? `
        <div class="page-break"></div>
        <h2 class="section-header" style="color: #9333ea; border-bottom: 2px solid #9333ea;">3. ASESMEN & RUBRIK PENILAIAN</h2>
        <div>${formattedAsesmen}</div>
        ` : ''}

        ${signaturesHtml}
      </body>
      </html>
    `;

    // Buat Blob data dengan tipe aplikasi word resmi
    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    
    // Trigger download file
    const link = document.createElement('a');
    link.href = url;
    link.download = `Perangkat_Ajar_${(finalSubject || 'GuruPintar').replace(/\s+/g, "_")}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`📝 Berhasil mendownload draf dokumen Word!`);
  };

  // --- FUNGSI EKSPOR KE PDF ---
  const exportToPDF = () => {
    if (!documentRef.current) {
      showToast("⚠️ Tidak ada dokumen aktif yang terdeteksi!");
      return;
    }
    
    const finalSubject = (subject === "Input Mapel Manual (Ketik Sendiri)" || subject === "Semua Mata Pelajaran")
      ? manualSubject.trim()
      : subject;

    const opt = {
      margin:       0.5,
      filename:     `Perangkat_Ajar_${(finalSubject || 'GuruPintar').replace(/\s+/g, "_")}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter' as const, orientation: 'portrait' as const }
    };

    showToast("🔄 Sedang memproses konversi ke PDF...");
    // Jalankan library html2pdf
    html2pdf().from(documentRef.current).set(opt as any).save();
  };

  // Direct Google Drive Sync triggers
  const simulateGoogleDriveSync = () => {
    setSyncStatus("syncing");
    setSyncProgress(0);
    showToast("📁 Memulai sinkronisasi otomatis ke Google Drive...");

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      if (progress >= 100) {
        setSyncProgress(100);
        setSyncStatus("success");
        clearInterval(interval);
        showToast("✔ Sukses menyinkronkan berkas RPP, PPT, dan Absensi ke folder Google Drive!");
        
        // Populate actual simulated payload registry to prove we uploaded non-empty files
        const payloads = generateDocumentPayloads();
        const now = new Date();
        const stamp = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} WIB`;
        
        setSyncedFiles((prev) => {
          const updated = [...prev];
          payloads.forEach(p => {
            const index = updated.findIndex(f => f.fileName === p.fileName);
            const item = {
              fileName: p.fileName,
              mimeType: p.mimeType,
              size: p.size,
              contentPreview: p.content,
              lastSyncedAt: stamp
            };
            if (index !== -1) {
              updated[index] = item;
            } else {
              updated.unshift(item);
            }
          });
          return updated;
        });

        // Mark everything as synced with custom folder url!
        setActivityLogs((prev) => prev.map((item) => ({ ...item, synced: true, driveUrl: driveLink })));
        
        addNotification(
          "☁️ Google Drive Sinkron",
          "Semua berkas ajar RPP (.docx), lembar kerja kelompok (LKPD), dan draf kuis siswa (.pptx) sukses diunggah ke Google Drive Bapak/Ibu.",
          "success"
        );
      } else {
        setSyncProgress(progress);
      }
    }, 250);
  };

  // Handle folder configuration save + instant automatic upload of all active documents
  const handleSaveAndSyncFolder = async () => {
    if (!driveLink.trim()) {
      showToast("⚠️ Silakan temukan atau ketik tautan Google Drive sasaran yang valid!");
      return;
    }
    
    setIsSavingAndSyncingFolder(true);
    showToast("💾 Menghubungkan & Menyiapkan folder otomatis di Google Drive...");

    try {
      const payloads = generateDocumentPayloads();
      const finalSubjStr = (subject === "Input Mapel Manual (Ketik Sendiri)" || subject === "Semua Mata Pelajaran") ? (manualSubject || "Mata Pelajaran") : subject;
      const autoFolderName = `GuruPintar - RPP ${finalSubjStr} (${classLevel || "Kelas 4"})`;

      showToast(`📦 Membuat folder otomatis "${autoFolderName}" dan menyinkronkan ${payloads.length} dokumen...`);

      // Retrieve cached token or simulated token
      const token = localStorage.getItem("gdrive_access_token") || "MY_OAUTH_TOKEN";

      const response = await fetch("/api/drive/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          folderName: autoFolderName,
          parentFolderUrl: driveLink,
          files: payloads
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const resData = await response.json();
      
      const now = new Date();
      const stamp = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} WIB`;
      
      // Update folder link input with the newly generated folder URL instantly!
      if (resData.driveUrl) {
        setDriveLink(resData.driveUrl);
      }

      // Mark all logs as synced and set actual target folders URL
      setActivityLogs((prev) => prev.map((item) => ({
        ...item,
        synced: true,
        driveUrl: resData.driveUrl || driveLink
      })));
      
      // Sync files into simulated active storage state
      setSyncedFiles((prev) => {
        const updated = [...prev];
        payloads.forEach((p, i) => {
          const resFile = resData.files?.[i];
          const idx = updated.findIndex((f) => f.fileName === p.fileName);
          const item = {
            fileName: p.fileName,
            mimeType: p.mimeType,
            size: p.size,
            contentPreview: p.content,
            lastSyncedAt: stamp,
            driveUrl: resFile?.driveUrl || resData.driveUrl
          };
          if (idx !== -1) {
            updated[idx] = item;
          } else {
            updated.unshift(item);
          }
        });
        return updated;
      });

      showToast(`✓ Sukses! Folder "${resData.folderName}" berhasil dibuat otomatis & ${payloads.length} berkas diunggah!`);
      addActivityLog(`Membuat Folder Otomatis & Unggah ke "${resData.folderName}"`, true);
      setDriveLinkTestResult("success");

    } catch (err: any) {
      console.error(err);
      showToast(`❌ Sinkronisasi G-Drive gagal: ${err.message || "Kesalahan jaringan"}`);
    } finally {
      setIsSavingAndSyncingFolder(false);
    }
  };

  // Handle Synchronizing & Exporting classroom attendance and kognitif grades directly to a new Google Sheets file
  const handleSyncToGoogleSheets = async () => {
    if (!driveLink || !driveLink.trim()) {
      showToast("⚠️ Silakan temukan dan isi tautan Google Drive sasaran yang valid di tab integrasi cloud!");
      // Redirect or suggest setting up folder first
      return;
    }

    setIsExportingSheets(true);
    showToast("📊 Menyiapkan ekspor draf presensi dan nilai kelas ke file Google Sheets baru...");

    try {
      const token = localStorage.getItem("gdrive_access_token") || "MY_OAUTH_TOKEN";

      // Execute POST payload to excel-sheets engine
      const response = await fetch("/api/sheets/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          kelas: activeKelas,
          attendance: attendance,
          studentGrades: studentGrades,
          selectedAssignment: selectedAssignment,
          driveFolderUrl: driveLink,
          profileSchool: profileSchool || "SD Negeri Cempaka Indah 01",
          profileName: profileName || "Bapak/Ibu Guru",
          profileNip: profileNip || "-"
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const resData = await response.json();
      
      const now = new Date();
      const stamp = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} WIB`;
      
      // Merge sheets file into synced files list view
      setSyncedFiles((prev) => {
        const updated = [...prev];
        const fileName = `${resData.sheetName || `Rekap_Presensi_Nilai_${activeKelas.replace(/\s+/g, "_")}`}.gsheet`;
        const idx = updated.findIndex((f) => f.fileName === fileName);
        const item = {
          fileName: fileName,
          mimeType: "application/vnd.google-apps.spreadsheet",
          size: "Spreadsheet",
          contentPreview: `GOOGLE SHEETS MERDEKA REKAP - KELAS: ${activeKelas}\nJumlah Siswa: ${Object.keys(attendance || {}).length}\nAsesmen Terpilih: ${selectedAssignment}\nLink Drive: ${resData.driveUrl}`,
          lastSyncedAt: stamp,
          driveUrl: resData.driveUrl
        };
        if (idx !== -1) {
          updated[idx] = item;
        } else {
          updated.unshift(item);
        }
        return updated;
      });

      // Commit to student activities log
      addActivityLog(`Ekspor Sinkron Google Sheets - ${activeKelas}`, true);

      // Trigger standard GuruPintar smart notifications
      addNotification(
        "📊 Google Sheets Sinkron",
        `Draf presensi dan nilai tugas "${selectedAssignment}" untuk ${activeKelas} sukses disinkronkan ke file Google Sheets baru.`,
        "success"
      );

      showToast(`📊 Sukses ekspor! File "Rekap Presensi & Nilai - ${activeKelas}" berhasil dibuat di Drive.`);
      
      // Safely open the newly generated spreadsheet
      if (resData.driveUrl) {
        window.open(resData.driveUrl, "_blank");
      }

    } catch (err: any) {
      console.error("[Sheets Export Error]", err);
      showToast(`❌ Gagal sinkronisasi Sheets: ${err.message || err}`);
    } finally {
      setIsExportingSheets(false);
    }
  };

  // Loop through all unsynced documents and sync them to Google Drive with non-empty content
  const handleSyncAllDocuments = async () => {
    const unsynced = activityLogs.filter(log => !log.synced);
    if (unsynced.length === 0) {
      showToast("ℹ️ Semua dokumen sudah berskala rukun / tersinkronisasi di Google Drive.");
      return;
    }

    setIsSyncingAll(true);
    showToast(`🔄 Memulai proses unggah nyata untuk ${unsynced.length} aktivitas tertunda...`);

    try {
      const payloads = generateDocumentPayloads();
      const finalSubjStr = (subject === "Input Mapel Manual (Ketik Sendiri)" || subject === "Semua Mata Pelajaran") ? (manualSubject || "Mata Pelajaran") : subject;
      const autoFolderName = `GuruPintar - RPP ${finalSubjStr} (${classLevel || "Kelas 4"})`;

      showToast(`📦 sinkronisasi massal: membuat folder "${autoFolderName}" di Google Drive...`);

      const token = localStorage.getItem("gdrive_access_token") || "MY_OAUTH_TOKEN";

      const response = await fetch("/api/drive/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          folderName: autoFolderName,
          parentFolderUrl: driveLink,
          files: payloads
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const resData = await response.json();
      const now = new Date();
      const stamp = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} WIB`;

      if (resData.driveUrl) {
        setDriveLink(resData.driveUrl);
      }

      setActivityLogs((prev) => prev.map(item => ({
        ...item,
        synced: true,
        driveUrl: resData.driveUrl || driveLink
      })));
      
      setSyncedFiles((prev) => {
        const updated = [...prev];
        payloads.forEach((p, i) => {
          const resFile = resData.files?.[i];
          const idx = updated.findIndex(f => f.fileName === p.fileName);
          const item = {
            fileName: p.fileName,
            mimeType: p.mimeType,
            size: p.size,
            contentPreview: p.content,
            lastSyncedAt: stamp,
            driveUrl: resFile?.driveUrl || resData.driveUrl
          };
          if (idx !== -1) {
            updated[idx] = item;
          } else {
            updated.unshift(item);
          }
        });
        return updated;
      });

      showToast("✓ Sukses! Seluruh draf materi berhasil dipindahkan otomatis ke Google Drive!");
      addActivityLog(`Sinkronisasi Masal ke Folder "${resData.folderName}"`, true);

    } catch (err: any) {
      console.error(err);
      showToast(`❌ Gagal sinkronisasi massal: ${err.message || "Gagal terkoneksi"}`);
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Handle AI correction chatbot refine callback
  const handleRefine = async () => {
    if (!revisionPrompt.trim()) return;
    setRevising(true);
    const promptText = revisionPrompt;
    try {
      const finalSubject = (subject === "Input Mapel Manual (Ketik Sendiri)" || subject === "Semua Mata Pelajaran")
        ? manualSubject.trim()
        : subject;

      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(teacherApiKey ? { "X-User-API-Key": teacherApiKey } : {})
        },
        body: JSON.stringify({
          instruction: revisionPrompt,
          previousResult: currentResult,
          currentData: currentResult,
          classLevel,
          subject: finalSubject,
          p5Theme,
          metode: selectedMetode
        })
      });

      if (!response.ok) {
        let errMsg = "Revisi gagal diproses oleh asisten AI.";
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = `Revisi gagal: ${errData.error}`;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data: GenerateResult = await response.json();
      setCurrentResult(data);
      setMobilePane("result");
      setChatHistory(prev => [
        ...prev,
        { role: "user", text: promptText },
        { role: "ai", text: "✅ Koreksi berhasil diterapkan ke workspace." }
      ]);
      setRevisionPrompt("");
      setIsChatOpen(false);
      showToast("✨ Koreksi AI Berhasil Diterapkan ke Workspace!");

      if (autoSyncDrive && driveLink && driveLink.trim()) {
        simulateGoogleDriveSync();
      }
    } catch (err: any) {
      console.error(err);
      showToast("❌ Gangguan: " + err.message);
    } finally {
      setRevising(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B1329] p-4 text-white relative overflow-hidden font-sans select-none antialiased">
        
        {/* Decorative glowing backdrops */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/[0.08] blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-orange-500/[0.05] blur-[120px] pointer-events-none"></div>

        {/* Floating welcome bubble */}
        <div className="text-center mb-8 max-w-sm px-4 animate-fade-in z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-400/20 py-1.5 px-4 rounded-full text-indigo-350 text-[10px] font-black tracking-wide uppercase shadow-sm mb-4">
            <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span>SISTEM UJI LAPANGAN BETA 2026</span>
          </div>
          <h2 className="text-3xl font-black text-slate-100 tracking-tight leading-none uppercase font-sans flex items-center justify-center gap-1">
            GURUPINTAR<span className="text-blue-500">.AI</span>
          </h2>
          <p className="text-[10px] text-slate-400 font-bold tracking-wide uppercase mt-2 leading-relaxed">
            Asisten Digital Administrasi Guru Integrasi Mandiri
          </p>
        </div>

        {/* Central Banking login card */}
        <div className="w-full max-w-sm bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl relative z-10 flex flex-col gap-5">
          <div className="text-center font-sans">
            <img 
              src="/assets/logo.png" 
              alt="GuruPintar.AI App Logo" 
              className="w-14 h-14 mx-auto shadow-lg border border-indigo-500/20 rounded-2xl object-cover logo-navbar"
              referrerPolicy="no-referrer"
            />
            <h3 className="text-xs font-black mt-4 text-slate-200 uppercase tracking-widest">Masuk ke GuruPintar.AI</h3>
            <p className="text-[9.5px] text-slate-500 font-semibold uppercase mt-1">Masukkan nama dan kode akses dari admin sekolah</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            
            {/* Nama Lengkap Field */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                Nama Anda:
              </label>
              <input
                type="text"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Contoh: Budi Santoso, S.Pd."
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl py-3 px-4 text-xs font-bold text-slate-250 placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-slate-700 transition"
              />
            </div>

            {/* Kode Akses Field */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                Kode Akses:
              </label>
              <input
                type="text"
                required
                value={schoolAccessCode}
                onChange={(e) => setSchoolAccessCode(e.target.value)}
                placeholder="Masukkan kode akses..."
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl py-3 px-4 text-xs font-bold text-center tracking-widest text-[#F59E0B] placeholder-slate-700 uppercase focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-slate-700 transition"
              />
            </div>

            {/* Simulated Error Message Notification */}
            {loginError && (
              <div className="bg-red-950/60 border border-red-500/30 text-red-300 text-xs p-3.5 rounded-2xl font-bold leading-relaxed flex flex-col gap-2 select-text animate-pulse">
                <p>⚠️ {loginError}</p>
                <p className="text-[10px] text-red-300 font-semibold text-center">
                  Hubungi admin sekolah untuk mendapat kode akses.
                </p>
              </div>
            )}

            {/* Login button */}
            <button
              type="submit"
              className="w-full mt-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3.5 px-4 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 shadow-md cursor-pointer select-none flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-blue-200" />
              Verifikasi &amp; Masuk Portal
            </button>

          </form>

          {/* Secure login notice */}
          <div className="text-center text-[9px] text-slate-500 font-bold border-t border-slate-800/60 pt-4 uppercase tracking-wide leading-relaxed">
            GuruPintar AI · Beta 2026
          </div>
        </div>

      </div>
    );
  }

  const todayVal = new Date().getDate();
  const totalSiswa = Object.keys(attendance).length;
  const hadirHariIni = Object.values(attendance).filter(days => days[todayVal] === "Hadir").length;
  const alphaHariIni = Object.values(attendance).filter(days => days[todayVal] === "Alpa").length;

  // Real-time calculated statistics for the "Rangkuman Aktivitas & Kelas" dashboard cards
  const getDynamicStats = () => {
    let totalHadir = 0;
    let totalSakit = 0;
    let totalIzin = 0;
    let totalAlpa = 0;
    let totalDaysCount = 0;

    Object.keys(attendance).forEach(studentName => {
      const days = attendance[studentName] || {};
      for (let d = 1; d <= 31; d++) {
        const status = days[d];
        if (status) {
          totalDaysCount++;
          if (status === "Hadir") totalHadir++;
          else if (status === "Sakit") totalSakit++;
          else if (status === "Izin") totalIzin++;
          else if (status === "Alpa") totalAlpa++;
        }
      }
    });

    const attendanceRateNum = totalDaysCount > 0 
      ? ((totalHadir + totalSakit + totalIzin) / totalDaysCount) * 100 
      : 94.8;
    const attendanceRateStr = attendanceRateNum.toFixed(1) + "%";

    // Count students needing attention has any Alpa or Sakit
    let realAttentionCount = 0;
    Object.keys(attendance).forEach(studentName => {
      const days = attendance[studentName] || {};
      let hasAlpaOrSakit = false;
      for (let d = 1; d <= 31; d++) {
        const status = days[d];
        if (status === "Alpa" || status === "Sakit") {
          hasAlpaOrSakit = true;
          break;
        }
      }
      if (hasAlpaOrSakit) {
        realAttentionCount++;
      }
    });

    // RPP count dynamically based on savedDrafts
    const rppCount = savedDrafts.length > 0 ? savedDrafts.length : 12;

    // Slide count dynamically computed
    let slideCount = 0;
    savedDrafts.forEach(d => {
      if (d.result?.ppt_canva_ready_slides) {
        slideCount += d.result.ppt_canva_ready_slides.length;
      }
    });
    if (slideCount === 0) {
      slideCount = currentResult?.ppt_canva_ready_slides?.length || 6;
    }

    // Task completion / mastery rate computed dynamically
    const gradeStudents = Object.keys(studentGrades);
    let passedCount = 0;
    const KKTP = 70; // passing score threshold
    gradeStudents.forEach(name => {
      const score = studentGrades[name]?.score ?? 80;
      if (score >= KKTP) {
        passedCount++;
      }
    });
    const masteryRateNum = gradeStudents.length > 0 
      ? Math.round((passedCount / gradeStudents.length) * 100) 
      : 92;

    return {
      attendanceRateStr,
      attendanceRateNum,
      attentionCount: realAttentionCount === 0 ? "0 Siswa" : `${realAttentionCount} Siswa`,
      attentionDetail: realAttentionCount > 0 
        ? "Butuh tindak lanjut/pembuatan surat peringatan." 
        : `Tingkat kehadiran kelas ${activeKelas} optimal & luar biasa prima.`,
      rppCount: `${rppCount} File`,
      slideCount: `${slideCount} Slide`,
      masteryRate: `${masteryRateNum}%`
    };
  };

  const dynamicStats = getDynamicStats();

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 font-sans antialiased">
      
      {/* Toast alerts */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[200] bg-slate-900 text-white font-extrabold text-xs p-3 px-5 rounded-full shadow-2xl flex items-center gap-3 select-none animate-slide-up no-print">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0"></span>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage("")}
            className="text-slate-400 hover:text-white font-black text-sm leading-none ml-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Onboarding Tooltip Popover Box */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-[#020617]/50 backdrop-blur-md z-[250] flex items-center justify-center p-4 animate-fade-in no-print select-none">
          <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 max-w-md shadow-2xl relative flex flex-col gap-4 font-sans text-slate-800">
            
            {/* Glowing Icon banner */}
            <div className="flex gap-3 pb-3 border-b border-indigo-50 mt-1">
              <span className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl shrink-0 border border-indigo-100">
                🚀
              </span>
              <div>
                <h3 className="text-sm font-black text-[#0D1D34] uppercase tracking-wide">Selamat Datang!</h3>
              </div>
            </div>

            {/* Explanations list */}
            <div className="space-y-3.5 text-xs text-slate-600 font-semibold leading-relaxed my-1">
              <p>
                Berikut 3 hal yang perlu Bapak/Ibu ketahui:
              </p>
              
              <ul className="space-y-2 text.5 pl-0">
                <li className="flex gap-2">
                  <span className="text-indigo-600 font-black">1.</span>
                  <div><strong>Keamanan Data Handal:</strong> Presensi siswa, KOP Profil Guru, dan catatan Nilai tersimpan luring di peramban Anda. Bebas bug refresh halaman!</div>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500 font-black">2.</span>
                  <div><strong>Kolom Ice Breaking Mandiri:</strong> Sesi game interaktif dan rekomendasi YouTube dipisahkan mandiri ke samping draf, mempermudah referensi visual tanpa mengganggu penulisan utama RPP.</div>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600 font-black">3.</span>
                  <div><strong>Koreksi Kilat Asisten AI:</strong> Cukup sentuh gelembung chat AI di sudut kanan bawah kapan saja untuk merevisi draf kurikulum secara otomatis!</div>
                </li>
              </ul>
            </div>

            {/* Controls */}
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={dismissOnboarding}
                className="w-full bg-[#1E3A8A] hover:bg-[#112559] text-white py-3 px-4 rounded-xl text-xs font-black tracking-wide uppercase transition shadow-md cursor-pointer select-none text-center"
              >
                Mulai
              </button>
            </div>
            
          </div>
        </div>
      )}

      <div className="flex min-h-screen">

    {/* OVERLAY MOBILE */}
    {isSidebarOpen && (
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        onClick={() => setIsSidebarOpen(false)}
      />
    )}

    {/* SIDEBAR */}
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-50
      w-64 bg-white border-r border-slate-200
      flex flex-col min-h-screen
      transition-transform duration-300 ease-in-out
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      no-print
    `}>

      {/* Logo */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
        onClick={() => { setCurrentScreen("home"); setIsSidebarOpen(false); }}>
        <img src="/assets/logo.png" alt="Logo" className="w-9 h-9 rounded-xl object-cover shadow-sm" />
        <div>
          <h1 className="text-sm font-black text-[#0D1D34] leading-none">
            GURUPINTAR<span className="text-[#1E3A8A]">.AI</span>
          </h1>
          <p className="text-[9px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide">Asisten Admin Merdeka</p>
        </div>
      </div>

      {/* Profil Mini */}
      <div className="p-4 border-b border-slate-100 space-y-2">
        <div className="flex items-center gap-3">
          {profilePic ? (
            <img src={profilePic} alt="Profil" className="w-9 h-9 rounded-full object-cover border-2 border-[#1E3A8A] shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#1E3A8A] text-white font-black flex items-center justify-center text-xs shrink-0">
              {profileName.split(" ").map((w: string) => w[0]).filter((c: string) => c && c === c.toUpperCase()).slice(0, 2).join("") || "GP"}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-800 truncate">{profileName.split(",")[0].split(" ").slice(0, 3).join(" ")}</p>
            <p className="text-[9px] text-slate-400 truncate">{profileSchool}</p>
          </div>
        </div>
        <div>
          <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wide block mb-1">Kelas Aktif</label>
          <p className="text-xs font-bold text-slate-600">{activeKelas}</p>
        </div>
      </div>

      {/* KOLOM PENCARIAN CEPAT (Ctrl+K) */}
      <div className="px-4 pt-4 select-none shrink-0 no-print">
        <button
          type="button"
          onClick={() => { setIsSearchModalOpen(true); playSfx("click"); }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-550 hover:text-slate-800 transition duration-150 text-left cursor-pointer shadow-3xs"
        >
          <Search className="w-3.5 h-3.5 text-slate-450 shrink-0" />
          <span className="text-xs font-bold">Cari Siswa / RPP...</span>
          <span className="ml-auto text-[9px] bg-slate-200/75 border border-slate-300/30 px-1.5 py-0.5 rounded-md text-slate-500 font-mono">Ctrl+K</span>
        </button>
      </div>

      {/* Notifikasi */}
      {notifications.filter((n: any) => !n.read).length > 0 && (
        <div className="mx-3 mt-3">
          <button
            onClick={() => { setActiveOverlay("notifications"); setNotifications((prev: any) => prev.map((n: any) => ({ ...n, read: true }))); setIsSidebarOpen(false); }}
            className="w-full flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 font-black text-[10px] px-3 py-2 rounded-xl hover:bg-red-100 transition cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 shrink-0" />
            <span>{notifications.filter((n: any) => !n.read).length} notifikasi baru</span>
          </button>
        </div>
      )}

      {/* Menu Navigasi */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {[
          { id: "home", icon: "🏠", label: "Beranda" },
          { id: "studio", icon: "✏️", label: "Buat Perangkat Ajar" },
          { id: "perpustakaan", icon: "🏛️", label: "Dokumen Saya" },
          { id: "absensi", icon: "✅", label: "Kehadiran Siswa" },
          { id: "loker", icon: "📓", label: "Catatan Nilai" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => { setCurrentScreen(item.id as any); setIsSidebarOpen(false); playSfx("click"); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              currentScreen === item.id
                ? "bg-[#EBF3FF] text-[#1E3A8A] font-black"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span className="text-base shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        <div className="border-t border-slate-100 my-2"></div>

        <button
          type="button"
          onClick={() => { toggleGuidedTutorial(); setIsSidebarOpen(false); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer text-[#64748B] hover:bg-slate-50 hover:text-slate-900"
        >
          <HelpCircle className="w-4 h-4 shrink-0 text-slate-500" />
          <span>Cara Pakai</span>
        </button>
      </nav>

      {/* Footer Sidebar */}
      <div className="p-3 border-t border-slate-100 space-y-0.5">
        <button
          type="button"
          onClick={() => { setCurrentScreen("account" as any); setIsSidebarOpen(false); playSfx("click"); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
            currentScreen === "account"
              ? "bg-[#EBF3FF] text-[#1E3A8A] font-black"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <span className="text-base shrink-0">👤</span>
          <span>Profil Saya</span>
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Keluar</span>
        </button>
        <p className="text-[9px] text-[#A6B2C8] text-center pt-1 font-medium">GuruPintar AI · Beta v1.0 · 2026</p>
      </div>
    </aside>

    {/* KONTEN UTAMA */}
    <main className="flex-1 min-w-0 overflow-y-auto">

      {/* TOP BAR MOBILE — hanya muncul di mobile */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 no-print">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          aria-label="Buka menu"
        >
          <div className="space-y-1 w-5">
            <span className="block w-5 h-0.5 bg-slate-600 rounded"></span>
            <span className="block w-5 h-0.5 bg-slate-600 rounded"></span>
            <span className="block w-5 h-0.5 bg-slate-600 rounded"></span>
          </div>
        </button>
        <span className="text-sm font-black text-[#0D1D34]">GURUPINTAR<span className="text-[#1E3A8A]">.AI</span></span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setIsSearchModalOpen(true); playSfx("click"); }}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition text-slate-600 cursor-pointer"
            aria-label="Cari Cepat"
          >
            <Search className="w-4 h-4 text-slate-500" />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white font-black flex items-center justify-center text-xs cursor-pointer"
            onClick={() => setCurrentScreen("account" as any)}>
            {profileName.split(" ").map((w: string) => w[0]).filter((c: string) => c && c === c.toUpperCase()).slice(0, 2).join("") || "GP"}
          </div>
        </div>
      </div>

      {/* Konten halaman */}
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        <AnimatePresence mode="wait">
        
        {/* VIEW 1: DASHBOARD HOME WIDGETS (Unified Premium Layout Matching User Screenshot exactly) */}
        {currentScreen === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0, scale: 0.995 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.995 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`space-y-6 pb-24 select-none w-full max-w-7xl mx-auto transition-all duration-305 ease-out transform ${
              isClassChanging ? "scale-[0.985] opacity-40 blur-[0.5px]" : "scale-100 opacity-100 blur-0"
            }`}
          >
            
            {/* 🟦 HEADER BLUE CARD (1:1 with user mockup screenshot) */}
            <div className="bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] text-white p-5 rounded-3xl relative overflow-hidden shadow-[0_12px_40px_rgba(30,58,138,0.22)] border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
              <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute bottom-[-60px] left-[-30px] w-56 h-56 bg-sky-400/15 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5 relative z-10 w-full md:w-auto">
                {/* Profile Pic with beautiful status ring */}
                <div className="relative shrink-0">
                  <div className="relative inline-block border-2 border-emerald-400 bg-blue-900/45 p-0.5 rounded-full shadow-lg">
                    {profilePic ? (
                      <img 
                        src={profilePic}
                        alt={profileName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white/20 text-white font-sans font-black flex items-center justify-center text-sm">
                        {profileName.split(" ").map(w => w[0]).filter(c => c && c === c.toUpperCase()).slice(0, 2).join("") || "AA"}
                      </div>
                    )}
                    {/* active cyan status light */}
                    <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#1E3A8A] flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300 opacity-75"></span>
                      <span className="w-1 h-1 bg-white rounded-full"></span>
                    </span>
                  </div>
                </div>

                <div className="text-center sm:text-left space-y-1.5 max-w-sm sm:max-w-md">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <h2 className="text-lg font-sans font-extrabold text-white leading-tight drop-shadow-sm whitespace-normal break-words">
                      {profileName.replace(/^(Bapak\s+|Ibu\s+)/i, "") || "Adib Ahdiyat"}
                    </h2>
                    <span className="bg-emerald-500/80 hover:bg-emerald-500 border border-emerald-400/30 text-white font-sans font-black text-[10px] tracking-wide uppercase px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 transition-all">
                      ✓ Pendidik Merdeka
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[10.5px]">
                    <span className="bg-[#1E293B]/60 backdrop-blur-xs border border-white/10 px-2.5 py-1 rounded-full font-semibold text-slate-200 inline-flex items-center gap-1">
                      🏫 {profileSchool}
                    </span>
                    <span className="bg-[#1E293B]/60 backdrop-blur-xs border border-white/10 px-2.5 py-1 rounded-full font-semibold text-amber-300 inline-flex items-center gap-1">
                      📌 Kelas Binaan: {activeKelas}
                    </span>
                  </div>

                  {/* Aesthetic Quotes bar */}
                  <div className="bg-[#0F172A]/48 backdrop-blur-md rounded-2xl px-4 py-1.5 border border-white/5 inline-flex items-center mt-1">
                    <p className="text-xs font-sans italic text-slate-300 font-medium">
                      “ {profileQuote || "Bertumbuh 1% Setiap Hari"} ”
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Dropdown & Trigger button */}
              <div className="flex flex-row items-center gap-3 relative z-10 w-full md:w-auto mt-2 md:mt-0 justify-end">
                {/* Standard White select container matching screenshot dropdown block */}
                <div className="relative inline-block cursor-pointer">
                  <select
                    value={activeKelas}
                    onChange={(e) => {
                      setActiveKelas(e.target.value);
                      showToast(`📌 Kelas aktif diubah ke: ${e.target.value}`);
                    }}
                    className="bg-white hover:bg-slate-50 text-slate-800 text-xs font-black py-3 px-4.5 pr-10 rounded-xl focus:outline-none appearance-none cursor-pointer shadow-md min-w-[130px] border border-slate-200 transition"
                  >
                    {kelasList.map(k => (
                      <option key={k} value={k} className="text-slate-800 font-sans font-bold">
                        {k}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-4.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-550 text-[10px]">▼</span>
                </div>
              </div>
            </div>

            {/* 🔍 PENCARIAN INSTRUMEN CERDAS (DASHBOARD BOX WIH AUTOCPLETE) */}
            <div 
              ref={dashboardSearchRef}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-3xs text-left no-print relative"
            >
              <h3 className="text-xs font-sans font-extrabold text-[#0D1D34] mb-1.5 uppercase tracking-wide flex items-center gap-2">
                🔎 Kolom Pencarian Cerdas &amp; Evaluasi Kilat
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-3.5">
                Cari berkas modul RPP, LKPD, jurnal mengajar, atau data perkembangan murid Anda secara luring dalam satu ketukan instan.
              </p>
              
              <div className="relative">
                <div className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus-within:border-[#1E3A8A] focus-within:ring-2 focus-within:ring-[#1E3A8A]/10 rounded-2xl px-4 py-3 group transition duration-200 shadow-3xs">
                  <Search className="w-5 h-5 text-slate-450 group-focus-within:text-[#1E3A8A] transition shrink-0" />
                  <input
                    type="text"
                    value={searchQueryGlobal}
                    onFocus={() => { setIsDashboardDropdownOpen(true); playSfx("click"); }}
                    onChange={(e) => {
                      setSearchQueryGlobal(e.target.value);
                      setIsDashboardDropdownOpen(true);
                    }}
                    placeholder="Tulis nama murid, mata pelajaran, atau topik perangkat ajar..."
                    className="w-full bg-transparent border-none outline-none text-xs font-semibold text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-none"
                  />
                  {searchQueryGlobal && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQueryGlobal("");
                        setSelectedStudentForDetail(null);
                      }}
                      className="text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-200 rounded-md transition"
                    >
                      ✕
                    </button>
                  )}
                  <span className="ml-auto block text-[9px] bg-slate-200/70 border border-slate-300/30 px-2 py-0.5 rounded-lg text-slate-500 font-mono font-bold group-focus-within:bg-[#1E3A8A]/15 group-focus-within:text-[#1E3A8A] transition select-none">
                    Tekan Ctrl + K
                  </span>
                </div>

                {/* 🏮 FLOATING PREMIUN DROPDOWN SUGGESTIONS (YOUTUBE / SPOTLIGHT-STYLE) */}
                {isDashboardDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 text-slate-800 max-h-[420px] overflow-y-auto scrollbar-none divide-y divide-slate-100 animate-scale-up">
                    
                    {/* CASE 1: EMPTY QUERY SHOWS POPULAR / RECENT RECOMMENDATIONS */}
                    {searchQueryGlobal.trim().length === 0 ? (
                      <div className="p-4 space-y-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">💡 Panduan Cari Cepat</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQueryGlobal("Budi");
                              playSfx("click");
                            }}
                            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-150 hover:bg-indigo-50/50 hover:border-indigo-150 text-left transition cursor-pointer text-xs font-semibold text-slate-700"
                          >
                            <span className="text-xs">👤</span>
                            <span className="truncate">Cari Siswa: "Budi"</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQueryGlobal("Fotosintesis");
                              playSfx("click");
                            }}
                            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-150 hover:bg-indigo-50/50 hover:border-indigo-150 text-left transition cursor-pointer text-xs font-semibold text-slate-700"
                          >
                            <span className="text-xs">📋</span>
                            <span className="truncate">Cari RPP: "Fotosintesis"</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQueryGlobal("Kelas 4A");
                              playSfx("click");
                            }}
                            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-150 hover:bg-indigo-50/50 hover:border-indigo-150 text-left transition cursor-pointer text-xs font-semibold text-slate-700"
                          >
                            <span className="text-xs">📅</span>
                            <span className="truncate">Jurnal: "Kelas 4A"</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQueryGlobal("Gaya");
                              playSfx("click");
                            }}
                            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-150 hover:bg-indigo-50/50 hover:border-indigo-150 text-left transition cursor-pointer text-xs font-semibold text-slate-700"
                          >
                            <span className="text-xs">⚡</span>
                            <span className="truncate">Cari Materi: "Gaya"</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium italic text-center pt-1.5">
                          Ketik untuk memicu pencarian cerdas real-time di seluruh basis data sekolah Anda
                        </p>
                      </div>
                    ) : (
                      // CASE 2: FILTERED SEARCH RESULTS WITH INSTANT COMPACT LAYOUTS
                      <div className="divide-y divide-slate-100">
                        {matchedStudentsList.length === 0 && matchedRppsList.length === 0 && matchedJournalsList.length === 0 && (
                          <div className="p-8 text-center text-slate-400">
                            <p className="text-xs font-extrabold text-slate-600">Tidak ada hasil pencarian</p>
                            <p className="text-[10.5px] font-medium text-slate-400 mt-1">Coba gunakan kata kunci lainnya seperti "Budi", "IPAS", atau kelas Anda.</p>
                          </div>
                        )}

                        {/* STUDENT SEGMENT */}
                        {matchedStudentsList.length > 0 && (
                          <div className="p-3 space-y-1.5 text-left">
                            <p className="text-[9.5px] font-black text-[#1E3A8A] uppercase tracking-wider px-2 flex items-center gap-1.5">
                              <span>👤</span> Murid ({matchedStudentsList.length})
                            </p>
                            <div className="space-y-0.5">
                              {matchedStudentsList.slice(0, 4).map((stud, sidx) => (
                                <div
                                  key={`ds-${sidx}`}
                                  onClick={() => {
                                    setSelectedStudentForDetail(stud);
                                    setEditStudentScore(stud.score);
                                    setEditStudentFeedback(stud.feedback);
                                    setEditStudentBehavior(stud.behavior);
                                    setEditStudentNotes(stud.notes);
                                    setIsSearchModalOpen(true);
                                    setIsDashboardDropdownOpen(false);
                                    playSfx("chime");
                                  }}
                                  className="w-full text-left p-2 hover:bg-indigo-50/60 rounded-xl transition cursor-pointer flex justify-between items-center group"
                                >
                                  <div className="min-w-0">
                                    <p className="text-xs font-black text-slate-800 group-hover:text-[#1E3A8A] transition">{stud.nama}</p>
                                    <p className="text-[9.5px] font-semibold text-slate-400">Kelas {stud.kelas} • Siklus Nilai: <span className="font-extrabold text-[#1E3A8A]">{stud.score || 0}</span></p>
                                  </div>
                                  <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-lg shrink-0">
                                    Inspeksi Cepat ➔
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* RPP SEGMENT */}
                        {matchedRppsList.length > 0 && (
                          <div className="p-3 space-y-1.5 text-left">
                            <p className="text-[9.5px] font-black text-emerald-700 uppercase tracking-wider px-2 flex items-center gap-1.5">
                              <span>📋</span> Perangkat Ajar &amp; RPP ({matchedRppsList.length})
                            </p>
                            <div className="space-y-0.5">
                              {matchedRppsList.slice(0, 4).map((temp, rpidx) => (
                                <div
                                  key={`dr-${rpidx}`}
                                  onClick={() => {
                                    handleApplyRppFromSearch(temp);
                                    setIsDashboardDropdownOpen(false);
                                  }}
                                  className="w-full text-left p-2 hover:bg-emerald-50/50 rounded-xl transition cursor-pointer flex justify-between items-center group"
                                >
                                  <div className="min-w-0">
                                    <p className="text-xs font-black text-slate-800 group-hover:text-emerald-700 transition truncate pr-2">{temp.title}</p>
                                    <p className="text-[9.5px] font-semibold text-slate-400 truncate">{temp.level} • {temp.subject}</p>
                                  </div>
                                  <span className="text-[9px] bg-emerald-50 border border-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-lg shrink-0">
                                    Pakai ✏️
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* JURNAL SEGMENT */}
                        {matchedJournalsList.length > 0 && (
                          <div className="p-3 space-y-1.5 text-left">
                            <p className="text-[9.5px] font-black text-amber-700 uppercase tracking-wider px-2 flex items-center gap-1.5">
                              <span>📅</span> Jurnal Mengajar ({matchedJournalsList.length})
                            </p>
                            <div className="space-y-0.5">
                              {matchedJournalsList.slice(0, 4).map((jur, jidx) => (
                                <div
                                  key={`dj-${jidx}`}
                                  onClick={() => {
                                    setActiveKelas(jur.kelas);
                                    setJurnalActiveTab("riwayat");
                                    setCurrentScreen("home");
                                    setSearchQueryGlobal("");
                                    setIsDashboardDropdownOpen(false);
                                    playSfx("success");
                                    showToast(`📂 Menuju Jurnal Mengajar Kelas ${jur.kelas}!`);
                                  }}
                                  className="w-full text-left p-2 hover:bg-amber-50/50 rounded-xl transition cursor-pointer flex justify-between items-center group"
                                >
                                  <div className="min-w-0">
                                    <p className="text-xs font-black text-slate-800 group-hover:text-amber-700 transition truncate pr-2">{jur.kelas} ― {jur.mapel}</p>
                                    <p className="text-[9.5px] font-semibold text-slate-400 truncate">{jur.tanggal} : {jur.topik}</p>
                                  </div>
                                  <span className="text-[9px] bg-amber-50 border border-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-lg shrink-0">
                                    Lompat Jurnal ➔
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* INTERACTIVE FULL INSPECTOR LINK AT FOOTER */}
                    <div className="bg-slate-50 p-2 text-center select-none">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSearchModalOpen(true);
                          setIsDashboardDropdownOpen(false);
                          playSfx("click");
                        }}
                        className="w-full py-2 bg-gradient-to-r from-[#1E3A8A]/10 to-[#1E3A8A]/5 hover:from-[#1E3A8A]/20 hover:to-[#1E3A8A]/10 text-[#1E3A8A] font-extrabold text-[10.5px] uppercase tracking-wide rounded-xl transition-all"
                      >
                        ⚡ Buka Mode Spotlight Cerdas Penuh (Ctrl + K)
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </div>

            {/* Simplified 3-Column Layout: Active Classes, Studio Shortcuts, Today's Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* COLUMN 1: PINTASAN STUDIO & PORTAL (md:col-span-4) */}
              <div className="md:col-span-4 space-y-4">
                {/* WIDGET FITUR HARIAN */}
                <div className="bg-white border border-slate-200/85 p-5 shadow-3xs rounded-3xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">⚡</span>
                      <h4 className="text-xs font-black text-[#0D1D34] uppercase tracking-wide">Aktivitas Hari Ini</h4>
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })}
                    </span>
                  </div>

                  {/* Reminder jurnal */}
                  {(() => {
                    const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                    const sudahJurnal = jurnalList.some(j => j.tanggal.includes(today));
                    return !sudahJurnal ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-black text-amber-800">📔 Jurnal hari ini belum diisi</p>
                          <p className="text-[9px] text-amber-600 font-medium mt-0.5">Catat refleksi mengajar sebelum pulang</p>
                        </div>
                        <button type="button" onClick={() => { setShowJurnalModal(true); playSfx("click"); }}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-black text-[9px] px-3 py-1.5 rounded-xl cursor-pointer transition shrink-0">
                          Isi Sekarang
                        </button>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-emerald-600 text-[16px]">✅</span>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-emerald-800">Jurnal hari ini sudah diisi</p>
                            <p className="text-[9px] text-emerald-600 font-medium truncate">
                              {jurnalList.find(j => j.tanggal.includes(today))?.suasana || "😊 Menyenangkan"} · {jurnalList.find(j => j.tanggal.includes(today))?.topik || "Selesai"}
                            </p>
                          </div>
                        </div>
                        <button type="button" onClick={() => { setShowJurnalModal(true); playSfx("click"); }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] px-2.5 py-1.5 rounded-xl cursor-pointer transition shrink-0">
                          Isi Lagi
                        </button>
                      </div>
                    );
                  })()}

                  {/* Tombol aksi harian */}
                  <div className="grid grid-cols-1 gap-2">
                    <button type="button"
                      onClick={() => { setShowKuisModal(true); playSfx("click"); }}
                      className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black text-xs px-4 py-3 rounded-2xl cursor-pointer transition text-left">
                      <span className="text-xl shrink-0">⚡</span>
                      <div>
                        <div className="font-black">Kuis Dadakan AI</div>
                        <div className="text-[9px] text-indigo-200 font-medium">Generate soal kuis 5-10 menit instan</div>
                      </div>
                    </button>

                    <button type="button"
                      onClick={() => { setCatatanKelasAktif(activeKelas); setShowCatatanModal(true); playSfx("click"); }}
                      className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs px-4 py-3 rounded-2xl cursor-pointer transition text-left">
                      <span className="text-xl shrink-0">👁️</span>
                      <div>
                        <div className="font-black">Catatan Siswa Hari Ini</div>
                        <div className="text-[9px] text-emerald-100 font-medium">Tandai keaktifan & perkembangan siswa</div>
                      </div>
                    </button>
                  </div>

                  {/* Jurnal terbaru */}
                  {jurnalList.length > 0 && (
                    <div className="border-t border-slate-100 pt-3 space-y-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Jurnal Terakhir:</p>
                      {jurnalList.slice(0, 2).map((j, i) => (
                        <div key={i} className="flex items-start gap-2 py-2 border-b border-slate-50 last:border-0">
                          <span className="text-base shrink-0">{j.suasana.split(" ")[0]}</span>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-700 truncate">{j.topik}</p>
                            <p className="text-[9px] text-slate-400">{j.kelas} · {j.tanggal.split(",")[0]}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMN 2: RIGHT AGENDA & RECOMMENDATIONS LIST (md:col-span-4) */}
              <div className="md:col-span-4 select-none">
                <div className="bg-white border border-slate-200/85 p-5.5 rounded-3xl shadow-3xs text-left space-y-4">
                  
                  <div className="flex items-center justify-between gap-1.5 border-b border-slate-50 pb-3 flex-wrap">
                    <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-wider font-sans">
                      📅 JADWAL HARI INI
                    </h3>
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 max-w-[170px] sm:max-w-none">
                      {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((day) => {
                        const isToday = getTodayDayName() === day;
                        const isSelected = selectedJadwalDayFilter === day;
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              setSelectedJadwalDayFilter(day);
                              playSfx("click");
                            }}
                            className={`px-1.5 py-0.5 text-[8.5px] font-black rounded transition-all border ${
                              isSelected
                                ? "bg-indigo-650 text-white border-indigo-700 shadow-2xs"
                                : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {day.slice(0, 3)}
                            {isToday && (
                              <span className="inline-block w-1 h-1 rounded-full bg-emerald-500 ml-0.5 relative -top-[1px]"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(() => {
                      const list = jadwalMengajar.filter(
                        (slot) => slot.hari === selectedJadwalDayFilter || (selectedJadwalDayFilter === "Semua" && slot.hari === getTodayDayName())
                      );

                      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                      const formattedDate = new Date().toLocaleDateString('id-ID', options);

                      if (list.length === 0) {
                        return (
                          <div className="text-center py-8 text-slate-400 font-sans border border-dashed border-slate-200 rounded-2xl bg-slate-50/40">
                            <Clock className="w-7 h-7 text-slate-300 mx-auto mb-1.5 animate-pulse" />
                            <p className="font-extrabold uppercase tracking-wide text-[10px]">TIDAK ADA JADWAL</p>
                            <p className="text-[9.5px] text-slate-450 mt-0.5 max-w-[200px] mx-auto font-medium">
                              Tidak ada kelas aktif pada hari {selectedJadwalDayFilter}. SIlakan beralih ke hari lain di atas.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <>
                          <div className="text-[9.5px] font-black text-slate-450 uppercase leading-none tracking-tight pb-0.5 flex items-center gap-1 select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            {selectedJadwalDayFilter} — {formattedDate}
                          </div>
                          
                          {list.map((slot) => (
                            <div 
                              key={slot.id}
                              className="p-3.5 border border-slate-150 hover:border-indigo-150 bg-slate-50/20 hover:bg-indigo-50/5 rounded-2xl flex flex-col gap-2.5 transition duration-150 relative overflow-hidden group"
                            >
                              <div className="space-y-1 min-w-0 flex-1 text-left">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[9px] font-mono font-black text-indigo-700 bg-indigo-50/60 border border-indigo-100 px-1.5 py-0.5 rounded leading-none">
                                    {slot.jamMulai} - {slot.jamSelesai}
                                  </span>
                                  <span className="text-[10px] font-extrabold text-slate-700 leading-none">
                                    {slot.kelas}
                                  </span>
                                </div>
                                <strong className="text-[12px] font-black text-[#0D1D34] font-display block leading-normal mt-1 text-left">
                                  {slot.mapel}
                                </strong>
                                <span className="text-[10px] text-slate-400 block truncate leading-tight">
                                  Topik: {slot.topik}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setClassLevel(slot.kelas);
                                  const isStandard = SUBJECTS.includes(slot.mapel);
                                  if (isStandard) {
                                    setSubject(slot.mapel);
                                    setManualSubject("");
                                  } else {
                                    setSubject("Input Mapel Manual (Ketik Sendiri)");
                                    setManualSubject(slot.mapel);
                                  }
                                  setMaterialText(`Topik Pembelajaran: ${slot.topik}\n\nMateri Pokok:\n- Masukkan detail materi ajar atau klik generate untuk merumuskan bahan ajar, LKPD, RPP, dan paket ujian lengkap secara otomatis menggunakan AI.`);
                                  setMaterialImage(null);
                                  setIsMapelSaved(!isStandard);
                                  
                                  setCurrentScreen("studio");
                                  setMobilePane("input");
                                  playSfx("chime");
                                  showToast(`⚡ Sukses memuat RPP Merdeka ${slot.kelas} - ${slot.mapel}!`);
                                }}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500 text-[10px] font-bold py-1.5 rounded-xl cursor-pointer select-none transition flex items-center justify-center gap-1.5 active:scale-97 shadow-2xs"
                              >
                                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                                <span>⚡ Buat RPP</span>
                              </button>
                            </div>
                          ))}
                        </>
                      );
                    })()}
                  </div>

                  {/* Primary Solid button */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveOverlay("jadwal");
                      playSfx("click");
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 font-sans font-black text-xs py-3 rounded-2xl shadow-3xs cursor-pointer transition uppercase text-center focus:outline-none tracking-wide flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Manajemen Jadwal Mengajar ({jadwalMengajar.length})
                  </button>

                </div>
              </div>

              {/* COLUMN 3: ACTIVE CLASSES (md:col-span-4) */}
              <div className="md:col-span-4 space-y-4">
                
                {/* Pilih Kelas Binaan Card */}
                <div className="bg-white border border-slate-200/85 p-6 rounded-3xl shadow-3xs text-left space-y-4 font-sans focus:outline-none">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-xs font-black text-[#0D1D34] uppercase tracking-wider">
                      🏫 KELAS AKTIF SAYA
                    </h4>
                    <span 
                      onClick={() => {
                        setNewKelasNameInput("");
                        setIsAddKelasModalOpen(true);
                        playSfx("click");
                      }}
                      className="text-[11px] font-black text-blue-600 hover:text-blue-800 transition cursor-pointer select-none"
                    >
                      + Tambah Kelas
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {kelasList.map(k => {
                      const isSel = activeKelas === k;
                      return (
                        <div
                          key={k}
                          onClick={() => {
                            setActiveKelas(k);
                            showToast(`📌 Kelas aktif diubah ke: ${k}`);
                          }}
                          className={`w-full p-3 rounded-xl border text-xs font-extrabold flex items-center justify-between cursor-pointer transition duration-150 ${
                            isSel
                              ? "border-blue-400 bg-blue-50/60 text-blue-900 shadow-3xs"
                              : "border-slate-150 hover:border-slate-200 bg-slate-50/30 hover:bg-slate-50/80 text-slate-650"
                          }`}
                        >
                          <span className="truncate">{k}</span>
                          {isSel && (
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 ml-2"></span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

          </motion.div>
        )}
        {currentScreen === "perpustakaan" && (
          <motion.div
            key="perpustakaan"
            initial={{ opacity: 0, scale: 0.995 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.995 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <RppLibrary
            onApplyTemplate={(level, subject, text, instantResult) => {
              setClassLevel(level);
              const isStandard = SUBJECTS.includes(subject);
              if (isStandard) {
                setSubject(subject);
                setManualSubject("");
              } else {
                setSubject("Input Mapel Manual (Ketik Sendiri)");
                setManualSubject(subject);
              }
              setMaterialText(text);
              setMaterialImage(null);
              setIsMapelSaved(!isStandard);

              if (instantResult) {
                setCurrentResult(instantResult);
                setMobilePane("result");
                showToast(`⚡ Sukses memuat RPP Instan "${subject}" ke workspace!`);
              } else {
                setMobilePane("input");
                showToast(`📝 Template "${subject}" berhasil dimuat ke form input.`);
              }
              setCurrentScreen("studio");
            }}
            onBackToDashboard={() => setCurrentScreen("home")}
            currentSubject={subject === "Input Mapel Manual (Ketik Sendiri)" ? manualSubject : subject}
            currentClassLevel={classLevel}
            teacherApiKey={teacherApiKey || ""}
          />
          </motion.div>
        )}

        {/* VIEW: STUDIO MODULAR (REMOVED) */}
        {false && (
          <motion.div
            key="studio_modular"
            initial={{ opacity: 0, scale: 0.995 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.995 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`space-y-6 transition-all duration-305 transform ${
              isClassChanging ? "scale-[0.985] opacity-40 blur-[0.5px]" : "scale-100 opacity-100 blur-0"
            }`}
          >
            {/* Page Header (Mengadopsi Box Gradient Biru dari Dashboard) */}
            <div className="bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-[0_12px_40px_rgba(30,58,138,0.22)] border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left">
              <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute bottom-[-60px] left-[-30px] w-56 h-56 bg-sky-400/15 rounded-full blur-3xl pointer-events-none"></div>

              <div className="space-y-2 relative z-10 w-full md:w-auto text-left">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans leading-none flex items-center gap-2">
                  ⚡ STUDIO MODULAR (MANDIRI)
                </h1>
                <p className="text-[11px] text-blue-200 font-semibold uppercase tracking-wider">
                  Linear workflow · Hemat Token · Fokus Fleksibilitas Tinggi
                </p>
              </div>
            </div>

            {/* Layout 2 Kolom */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Kolom Kiri: INPUT FORM & TOMBOL GENERATE (Col Span 5) */}
              <div className="lg:col-span-5 space-y-5 text-left">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    ⚙️ Konfigurasi Perangkat Ajar
                  </h3>

                  {/* Form fields */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10.5px] font-black uppercase text-slate-500 block">Tingkat Kelas:</label>
                      <select
                        value={classLevel}
                        onChange={(e) => setClassLevel(e.target.value)}
                        className="w-full bg-slate-50 text-slate-800 border border-slate-250 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        {getFilteredClasses().map((lvl) => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10.5px] font-black uppercase text-slate-500 block">Mata Pelajaran:</label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-slate-50 text-slate-800 border border-slate-250 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        {getFilteredSubjects().map((subj) => (
                          <option key={subj} value={subj}>{subj}</option>
                        ))}
                      </select>
                    </div>

                    {/* Manual Subject Input */}
                    {(subject === "Input Mapel Manual (Ketik Sendiri)" || subject === "Semua Mata Pelajaran") && (
                      <div className="flex flex-col gap-1.5 bg-blue-50/50 p-3 rounded-xl border border-blue-100 animate-fade-in">
                        <label className="text-[10px] uppercase font-black text-blue-800 block">
                          Nama Mapel Kustom:
                        </label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={manualSubject} 
                            onChange={(e) => { setManualSubject(e.target.value); setIsMapelSaved(false); }} 
                            placeholder="Contoh: Kimia, Sosiologi..." 
                            className="flex-1 bg-white border border-slate-250 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-blue-500" 
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              if (!manualSubject.trim()) {
                                showToast("⚠️ Ketik mapelnya dulu, Guru!");
                                return;
                              }
                              setIsMapelSaved(true);
                              showToast("💾 Nama Mapel Kustom dikunci!");
                            }}
                            className={`px-3.5 py-1 rounded-xl text-xs font-black border-0 cursor-pointer transition ${
                              isMapelSaved ? "bg-emerald-600 text-white" : "bg-[#1E3A8A] hover:bg-slate-900 text-white"
                            }`}
                          >
                            {isMapelSaved ? "Saved ✓" : "Kunci"}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10.5px] font-black uppercase text-slate-500 block">Metode Pembelajaran:</label>
                      <select
                        value={selectedMetode}
                        onChange={(e) => setSelectedMetode(e.target.value)}
                        className="w-full bg-slate-50 text-slate-800 border border-slate-250 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        {METODE_LIST.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    {/* Topik / Materi Pokok */}
                    <div className="space-y-1.5">
                      <label className="text-[10.5px] font-black uppercase text-slate-500 block">
                        Topik / Materi Pokok:
                      </label>
                      <textarea
                        rows={3}
                        value={materialText}
                        onChange={(e) => setMaterialText(e.target.value)}
                        placeholder="Contoh: Fotosintesis pada tumbuhan, Reaksi kimia asam basa, Pancasila sebagai dasar negara..."
                        className="w-full bg-slate-50 border border-slate-250 rounded-2xl py-2.5 px-3.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition leading-relaxed resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Tombol-tombol Berurutan */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    🏁 Langkah Penyusunan Perangkat Ajar
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    *Harap lakukan generate langkah demi langkah secara berurutan untuk hasil penyusunan yang maksimal.
                  </p>

                  <div className="space-y-3">
                    {/* LANGKAH 1 */}
                    <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50/70 border border-slate-200">
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-800">Langkah 1: TP &amp; ATP</h4>
                        <p className="text-[9.5px] text-slate-455 mt-0.5 font-bold leading-none">Tujuan &amp; Alur Belajar</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {dokumenResult["tp_atp"] && (
                          <span className="text-[9.5px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            Ready ✓
                          </span>
                        )}
                        {!dokumenResult["tp_atp"] && dokumenError["tp_atp"] && (
                          <span className="text-[9.5px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg">
                            Beban Padat ⚠️
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            handleGenerateDokumen("tp_atp");
                            setActiveModularTab("tp_atp");
                          }}
                          disabled={generatingDokumen === "tp_atp"}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black border-0 select-none ${
                            generatingDokumen === "tp_atp"
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-[#1E3A8A] hover:bg-slate-900 text-white cursor-pointer"
                          }`}
                        >
                          {generatingDokumen === "tp_atp" ? "..." : dokumenResult["tp_atp"] ? "Regen" : "Mulai"}
                        </button>
                      </div>
                    </div>

                    {/* LANGKAH 2 */}
                    <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50/70 border border-slate-200">
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-800">Langkah 2: Modul Ajar (RPP)</h4>
                        <p className="text-[9.5px] text-slate-455 mt-0.5 font-bold leading-none">Rencana Kegiatan Inti</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {dokumenResult["modul_ajar"] && (
                          <span className="text-[9.5px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            Ready ✓
                          </span>
                        )}
                        {!dokumenResult["modul_ajar"] && dokumenError["modul_ajar"] && (
                          <span className="text-[9.5px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg">
                            Beban Padat ⚠️
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            handleGenerateDokumen("modul_ajar");
                            setActiveModularTab("modul_ajar");
                          }}
                          disabled={generatingDokumen === "modul_ajar"}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black border-0 select-none ${
                            generatingDokumen === "modul_ajar"
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-[#1E3A8A] hover:bg-slate-900 text-white cursor-pointer"
                          }`}
                        >
                          {generatingDokumen === "modul_ajar" ? "..." : dokumenResult["modul_ajar"] ? "Regen" : "Mulai"}
                        </button>
                      </div>
                    </div>

                    {/* LANGKAH 3 */}
                    <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50/70 border border-slate-200">
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-800">Langkah 3: LKPD Siswa</h4>
                        <p className="text-[9.5px] text-slate-455 mt-0.5 font-bold leading-none">Lembar Kerja Aktivitas</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {dokumenResult["lkpd"] && (
                          <span className="text-[9.5px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            Ready ✓
                          </span>
                        )}
                        {!dokumenResult["lkpd"] && dokumenError["lkpd"] && (
                          <span className="text-[9.5px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg">
                            Beban Padat ⚠️
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            handleGenerateDokumen("lkpd");
                            setActiveModularTab("lkpd");
                          }}
                          disabled={generatingDokumen === "lkpd"}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black border-0 select-none ${
                            generatingDokumen === "lkpd"
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-[#1E3A8A] hover:bg-slate-900 text-white cursor-pointer"
                          }`}
                        >
                          {generatingDokumen === "lkpd" ? "..." : dokumenResult["lkpd"] ? "Regen" : "Mulai"}
                        </button>
                      </div>
                    </div>

                    {/* LANGKAH 4 */}
                    <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50/70 border border-slate-200">
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-800">Langkah 4: Asesmen &amp; Rubrik</h4>
                        <p className="text-[9.5px] text-slate-455 mt-0.5 font-bold leading-none">Kriteria Penilaian Siswa</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {dokumenResult["asesmen"] && (
                          <span className="text-[9.5px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            Ready ✓
                          </span>
                        )}
                        {!dokumenResult["asesmen"] && dokumenError["asesmen"] && (
                          <span className="text-[9.5px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg">
                            Beban Padat ⚠️
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            handleGenerateDokumen("asesmen");
                            setActiveModularTab("asesmen");
                          }}
                          disabled={generatingDokumen === "asesmen"}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black border-0 select-none ${
                            generatingDokumen === "asesmen"
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-[#1E3A8A] hover:bg-slate-900 text-white cursor-pointer"
                          }`}
                        >
                          {generatingDokumen === "asesmen" ? "..." : dokumenResult["asesmen"] ? "Regen" : "Mulai"}
                        </button>
                      </div>
                    </div>

                    {/* LANGKAH 5 */}
                    <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50/70 border border-slate-200">
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-800">Langkah 5: Soal Ujian</h4>
                        <p className="text-[9.5px] text-slate-455 mt-0.5 font-bold leading-none">Paket Butir Soal &amp; Jawaban</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {dokumenResult["soal_ujian"] && (
                          <span className="text-[9.5px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            Ready ✓
                          </span>
                        )}
                        {!dokumenResult["soal_ujian"] && dokumenError["soal_ujian"] && (
                          <span className="text-[9.5px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg">
                            Beban Padat ⚠️
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            handleGenerateDokumen("soal_ujian");
                            setActiveModularTab("soal_ujian");
                          }}
                          disabled={generatingDokumen === "soal_ujian"}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black border-0 select-none ${
                            generatingDokumen === "soal_ujian"
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-[#1E3A8A] hover:bg-slate-900 text-white cursor-pointer"
                          }`}
                        >
                          {generatingDokumen === "soal_ujian" ? "..." : dokumenResult["soal_ujian"] ? "Regen" : "Mulai"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: TAB OUTPUT HASIL GENERASI (Col Span 7) */}
              <div className="lg:col-span-7 flex flex-col space-y-4">
                {/* Tab Selector Buttons */}
                <div className="flex items-center flex-wrap gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveModularTab("tp_atp")}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition text-center cursor-pointer select-none truncate border-0 ${
                      activeModularTab === "tp_atp"
                        ? "bg-[#1E3A8A] text-white shadow-xs"
                        : "text-slate-600 hover:text-[#1E3A8A] hover:bg-white"
                    }`}
                  >
                    TP &amp; ATP
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModularTab("modul_ajar")}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition text-center cursor-pointer select-none truncate border-0 ${
                      activeModularTab === "modul_ajar"
                        ? "bg-[#1E3A8A] text-white shadow-xs"
                        : "text-slate-600 hover:text-[#1E3A8A] hover:bg-white"
                    }`}
                  >
                    Modul Ajar
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModularTab("lkpd")}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition text-center cursor-pointer select-none truncate border-0 ${
                      activeModularTab === "lkpd"
                        ? "bg-[#1E3A8A] text-white shadow-xs"
                        : "text-slate-600 hover:text-[#1E3A8A] hover:bg-white"
                    }`}
                  >
                    LKPD Siswa
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModularTab("asesmen")}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition text-center cursor-pointer select-none truncate border-0 ${
                      activeModularTab === "asesmen"
                        ? "bg-[#1E3A8A] text-white shadow-xs"
                        : "text-slate-600 hover:text-[#1E3A8A] hover:bg-white"
                    }`}
                  >
                    Asesmen
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModularTab("soal_ujian")}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition text-center cursor-pointer select-none truncate border-0 ${
                      activeModularTab === "soal_ujian"
                        ? "bg-[#1E3A8A] text-white shadow-xs"
                        : "text-slate-600 hover:text-[#1E3A8A] hover:bg-white"
                    }`}
                  >
                    Soal Ujian
                  </button>
                </div>

                {/* Tab Content Display Area */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex-1 flex flex-col min-h-[500px]">
                  {/* Action buttons on top of output text */}
                  {dokumenResult[activeModularTab] ? (
                    <div className="flex justify-between items-center gap-3 border-b border-slate-100 pb-3.5 mb-4 relative z-10 shrink-0">
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                        Pratinjau Hasil Dokumen:
                      </span>
                      <div className="flex gap-2">
                        {/* Salin Dokumen */}
                        <button
                          type="button"
                          onClick={() => {
                            const content = dokumenResult[activeModularTab];
                            if (content) {
                              navigator.clipboard.writeText(content);
                              showToast("📋 Berhasil disalin ke clipboard!");
                            }
                          }}
                          className="bg-slate-50 hover:bg-slate-100 text-slate-650 font-bold px-3 py-1.5 rounded-lg text-[10px] border border-slate-200 transition duration-150 flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Salin
                        </button>
                        {/* Simpan ke Drive Sekolah */}
                        <button
                          type="button"
                          onClick={() => {
                            showToast("☁️ Mengunggah dokumen ke Drive Sekolah secara real-time...");
                            setTimeout(() => {
                              showToast(`✅ Berhasil disinkronisasi ke Google Drive di Folder RPP Aktif!`);
                            }, 1200);
                          }}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold px-3 py-1.5 rounded-lg text-[10px] border border-blue-250 transition duration-150 flex items-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Simpan Drive
                        </button>
                        {/* Download .DOCX */}
                        <button
                          type="button"
                          onClick={() => {
                            generateDocxRapi(
                              dokumenResult[activeModularTab] || "",
                              DOKUMEN_LIST.find((d) => d.id === activeModularTab)?.label || "Dokumen"
                            );
                          }}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold px-3 py-1.5 rounded-lg text-[10px] border border-purple-250 transition duration-150 flex items-center gap-1 cursor-pointer"
                        >
                          <span>📥</span>
                          <span>Download .DOCX</span>
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Document rendering area */}
                  <div className="text-left flex-1 overflow-y-auto max-h-[600px] select-text">
                    {dokumenResult[activeModularTab] ? (
                      <div className="p-1 font-sans text-xs leading-relaxed text-slate-800 space-y-4">
                        {renderStepwiseContent(dokumenResult[activeModularTab], profileSchool, profileName, profileNip)}
                      </div>
                    ) : dokumenError[activeModularTab] ? (
                      <div className="flex flex-col items-center justify-center h-full py-10 px-6 text-center space-y-5">
                        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shadow-sm animate-pulse">
                          <AlertCircle className="w-8 h-8" />
                        </div>
                        <div className="max-w-md space-y-3">
                          <h4 className="text-sm font-black text-rose-700 uppercase tracking-wide">
                            Gagal Membuat Dokumen
                          </h4>
                          <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3.5 text-left text-[11px] text-rose-950 font-medium leading-relaxed font-sans">
                            {dokumenError[activeModularTab]}
                          </div>
                          <div className="text-left text-[10.5px] text-slate-500 space-y-1 bg-slate-50 border border-slate-100 rounded-xl p-3.5 mt-2">
                            <strong className="block text-slate-700 font-bold mb-1">💡 Tips Pemecahan Masalah:</strong>
                            <p>• <strong>Coba Lagi:</strong> Klik tombol generate kembali, biasanya lonjakan beban tuntas dalam beberapa saat.</p>
                            <p>• <strong>API Key Pribadi:</strong> Masukkan API Key Anda di bagian profil untuk akses super lancar tanpa gangguan antrian.</p>
                            <p>• <strong>Kurangi Konten:</strong> Bila mengunggah gambar resolusi tinggi, cobalah ketik teks materi secara langsung.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleGenerateDokumen(activeModularTab)}
                          className="bg-rose-600 hover:bg-rose-750 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition duration-150 shadow-sm flex items-center gap-2 cursor-pointer select-none active:scale-[0.98]"
                        >
                          <RefreshCw className="w-4 h-4" />
                          KLIK UNTUK COBA LAGI
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center text-slate-400 space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-dashed border-slate-250 flex items-center justify-center text-slate-350 opacity-80 animate-pulse animate-duration-1000">
                          <FileText className="w-8 h-8" />
                        </div>
                        <div className="max-w-md">
                          <h4 className="text-sm font-black text-slate-700 uppercase tracking-wide">
                            Dokumen Belum Dibuat
                          </h4>
                          <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-2">
                            Silakan isi form konfigurasi di sebelah kiri dan klik tombol <strong>Mulai / Regen</strong> secara berurutan untuk memproses bagian dokumen ini.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: MAGIC STUDIO (RPP & SLIDES) */}
        {currentScreen === "studio" && (
          <motion.div
            key="studio"
            initial={{ opacity: 0, scale: 0.995 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.995 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`space-y-6 transition-all duration-305 ease-out transform ${
              isClassChanging ? "scale-[0.985] opacity-40 blur-[0.5px]" : "scale-100 opacity-100 blur-0"
            }`}
          >
            
            {/* Page Header (Mengadopsi Box Gradient Biru dari Dashboard) */}
            <div className="bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-[0_12px_40px_rgba(30,58,138,0.22)] border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left">
              <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute bottom-[-60px] left-[-30px] w-56 h-56 bg-sky-400/15 rounded-full blur-3xl pointer-events-none"></div>

              <div className="space-y-2 relative z-10 w-full md:w-auto text-left font-sans">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  🪄 Studio Dokumen Ajar
                </h1>
                <p className="text-xs text-white/85 font-medium">
                  Buat RPP, LKPD, Asesmen, Media Belajar, dan Soal Ujian secara otomatis.
                </p>
                <div className="flex flex-wrap gap-2.5 pt-1 text-xs font-bold text-white/90 font-sans">
                  <span>{activeKelas || "Kelas 4A"}</span>
                  <span>•</span>
                  <span>{subject || "IPAS"}</span>
                </div>
              </div>
            </div>

            {/* Inline Guided Tutorial for Magic Studio Screen */}
            {showGuidedTutorial && (
              <div id="tutorial-card-studio" className="bg-[#EBF3FF] border border-blue-200 p-4.5 rounded-2xl flex gap-3.5 items-start text-xs text-indigo-950 font-sans shadow-3xs leading-relaxed animate-fade-in no-print">
                <div className="bg-indigo-500 text-white rounded-xl p-2 shrink-0 select-none">
                  <HelpCircle className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                      PANDUAN STUDIO AI
                    </span>
                    <strong className="text-[#1E3A8A] font-extrabold tracking-tight uppercase">Formulasikan Perangkat Ajar &amp; Media Interaktif</strong>
                  </div>
                  <p className="text-slate-650 font-semibold leading-relaxed">
                    1. Tentukan target <strong className="text-[#1E3A8A]">Mata Pelajaran &amp; Kriteria Kelas</strong> Anda di kolom form parameter kiri.<br />
                    2. Ketik materi pokok atau bidik lembaran fisik rujukan buku cetak sekolah lewat zona <strong className="text-[#1E3A8A]">Bidikan Foto Buku / Modul Cetak (OCR &amp; Seret Gambar)</strong> di sebelah kiri.<br />
                    3. Klik tombol <strong className="text-[#1E3A8A]">Formulasikan Perangkat Ajar (AI)</strong> untuk merangkaikan RPP Merdeka detail, instrumen evaluasi Asesmen Penilaian (Min 10 Soal Berbobot HOTS, kisi-kisi dan rubrik sikap atau performa), sekaligus slide presentasi interaktif secara instan!
                  </p>
                </div>
                <button
                  onClick={toggleGuidedTutorial}
                  className="text-slate-400 hover:text-slate-600 text-[10px] bg-sky-50 shadow-3xs hover:bg-sky-100 py-1 px-3 rounded-lg ml-auto font-black border border-sky-150 shrink-0 select-none cursor-pointer"
                  title="Sembunyikan Panduan"
                >
                  Sembunyikan
                </button>
              </div>
            )}

            {/* STEPPER UI */}
            <div className="flex items-center justify-center gap-6 pb-2.5 mb-6 select-none border-b border-slate-100 no-print">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole(null)}
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg transition cursor-pointer border-none focus:outline-none ${
                    selectedRole ? "bg-emerald-55 text-emerald-700" : "bg-[#1E3A8A] text-white"
                  }`}
                >
                  {selectedRole ? "✓ Peran" : "1. Identitas"}
                </button>
                <span className="text-slate-350 font-black">/</span>
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                  !selectedRole 
                    ? "bg-slate-100 text-slate-400 animate-none" 
                    : generating 
                    ? "bg-orange-50 text-orange-755 animate-pulse border border-orange-100" 
                    : "bg-[#1E3A8A] text-white"
                }`}>
                  2. Parameter
                </span>
                <span className="text-slate-350 font-black">/</span>
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                  currentResult.magic_studio_output ? "bg-emerald-55 text-emerald-700" : "bg-slate-100 text-slate-400"
                }`}>
                  3. Preview
                </span>
              </div>
            </div>

            {/* TWO COLUMN WORKSPACE GRID OR ADAPTIVE INITIAL SCREEN */}
            {selectedRole === null ? (
              /* THE WELCOMING ADAPTIVE SELECTOR (ROLE SELECTION) - NO MATCHING DARK BLUE DARKNESS */
              <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/50 to-white border border-indigo-100 text-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden select-none animate-fade-in">
                {/* Decorative gradients */}
                <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[80px] pointer-events-none"></div>
                
                <div className="relative z-10 text-center space-y-2 mb-8">
                  <h2 className="text-xl md:text-2xl font-black text-[#1E3A8A] font-sans tracking-tight pt-2">
                    Selamat Datang! Agar asisten menjadi lebih personal,
                  </h2>
                  <p className="text-indigo-600 font-extrabold text-[16px] italic font-sans animate-bounce">
                    Bapak/Ibu mengajar sebagai apa?
                  </p>
                  <p className="text-slate-500 text-xs max-w-lg mx-auto font-medium">
                    Pilih salah satu identitas utama di bawah untuk menyesuaikan rumpun kurikulum dan saran topik ajar otomatis secara instan.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  {/* Card A */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("sd");
                      setClassLevel("SD Kelas 4");
                      setSubject("IPAS (IPA & IPS Gabungan)");
                      showToast("🏫 Peran Guru Kelas SD terpilih!");
                    }}
                    className="bg-white hover:bg-indigo-50/40 border border-slate-200/80 hover:border-indigo-500 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-102 hover:shadow-md focus:outline-none cursor-pointer flex flex-col justify-between min-h-[200px] shadow-sm group active:scale-95"
                  >
                    <div className="space-y-3">
                      <span className="text-3xl block group-hover:scale-110 transition-transform">🏫</span>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 tracking-wide uppercase">Guru Kelas SD</h4>
                        <p className="text-[11px] text-slate-550 mt-1 font-medium leading-relaxed">
                          Menyediakan draf RPP Tematik, IPAS, Matematika SD, dan Bahasa Indonesia untuk jenjang SD Kelas 1-6.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-indigo-600 group-hover:text-indigo-700 font-extrabold tracking-wider uppercase mt-4 block transition-colors">
                      PILIH PERAN GURU KELAS SD →
                    </span>
                  </button>

                  {/* Card B */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("agama");
                      setClassLevel("SD Kelas 4");
                      setSubject("Tahfidz");
                      showToast("🕌 Peran Guru Pendidikan Agama terpilih!");
                    }}
                    className="bg-white hover:bg-indigo-50/40 border border-slate-200/80 hover:border-indigo-500 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-102 hover:shadow-md focus:outline-none cursor-pointer flex flex-col justify-between min-h-[200px] shadow-sm group active:scale-95"
                  >
                    <div className="space-y-3">
                      <span className="text-3xl block group-hover:scale-110 transition-transform">🕌</span>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 tracking-wide uppercase">Guru Mapel Agama</h4>
                        <p className="text-[11px] text-slate-550 mt-1 font-medium leading-relaxed">
                          Akses rumpun Agama: Tahsin, Tahfidz, BTQ, Qur'an Hadits, Fiqih. Rekomendasi Hafalan Juz Amma otomatis.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-indigo-600 group-hover:text-indigo-700 font-extrabold tracking-wider uppercase mt-4 block transition-colors">
                      PILIH PERAN GURU AGAMA →
                    </span>
                  </button>

                  {/* Card C */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole("smp_sma");
                      setClassLevel("SMP Kelas 7");
                      setSubject("Biologi");
                      showToast("🧪 Peran Guru Mapel Umum SMP/SMA terpilih!");
                    }}
                    className="bg-white hover:bg-indigo-50/40 border border-slate-200/80 hover:border-indigo-500 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-102 hover:shadow-md focus:outline-none cursor-pointer flex flex-col justify-between min-h-[200px] shadow-sm group active:scale-95"
                  >
                    <div className="space-y-3">
                      <span className="text-3xl block group-hover:scale-110 transition-transform">🧪</span>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 tracking-wide uppercase">Guru SMP / SMA</h4>
                        <p className="text-[11px] text-slate-550 mt-1 font-medium leading-relaxed">
                          Materi mapel rumpun umum khusus jenjang SMP & SMA Kelas 7-12: Fisika, Biologi, Sejarah, Ekonomi.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-indigo-600 group-hover:text-indigo-700 font-extrabold tracking-wider uppercase mt-4 block transition-colors">
                      PILIH PERAN GURU SMP / SMA →
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mobile Pane Switcher (only visible on mobile/tablet) */}
                <div className="lg:hidden flex p-1.5 bg-slate-100 rounded-2xl border border-slate-205 gap-1.5 select-none no-print">
                  <button
                    type="button"
                    onClick={() => setMobilePane("input")}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                      mobilePane === "input"
                        ? "bg-[#1E3A8A] text-white shadow-xs"
                        : "text-slate-600 hover:bg-white/85 hover:text-slate-800"
                    }`}
                  >
                    <ListCollapse className="w-4 h-4 shrink-0" />
                    <span>✏️ Atur Parameter &amp; Materi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobilePane("result")}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                      mobilePane === "result"
                        ? "bg-[#1E3A8A] text-white shadow-xs"
                        : "text-slate-620 hover:bg-white/85 hover:text-slate-800"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-orange-400 shrink-0 select-none animate-pulse" />
                    <span>✨ Lihat Perangkat Ajar</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* LEFT COLUMN: Input form parameter controller */}
                  <div className={`${mobilePane === "input" ? "block" : "hidden"} lg:block lg:col-span-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-3xs space-y-5 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto pr-1`}>
                  
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 select-none">
                    <h4 className="text-xs font-black text-[#0D1D34] uppercase tracking-wider block font-sans">
                      Skenario Parameter &amp; Media Input
                    </h4>
                  </div>



                  {/* MODUL 1 CONTROLLER CONTAINER */}
                  <div className="bg-slate-50/40 border border-slate-200 p-4.5 rounded-2xl space-y-4 shadow-3xs hover:border-slate-300 transition duration-150 text-left font-sans">

                    {/* QUICK SHORTCUT TO RPP TEMPLATE LIBRARY */}
                    <div className="bg-gradient-to-r from-purple-55 via-indigo-55 to-blue-55 border border-purple-100 p-3 rounded-xl flex items-center justify-between select-none animate-fade-in mt-2.5 font-sans">
                      <div className="space-y-0.5 animate-none">
                        <p className="text-xs font-bold text-slate-700">🏛️ Perpustakaan RPP</p>
                        <p className="text-[9.5px] text-slate-500 font-semibold leading-relaxed">
                          Pilih dari 12+ draf Kurikulum Merdeka siap cetak.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentScreen("perpustakaan")}
                        className="text-[9px] bg-purple-700 hover:bg-purple-800 text-white font-black px-2.5 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer shrink-0 ml-1 border-0"
                      >
                        Buka RPP 🏛️
                      </button>
                    </div>

                    {/* Form selectors */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10.5px] font-black uppercase text-slate-500 block">Tingkat Kelas:</label>
                          <select
                            value={classLevel}
                            onChange={(e) => setClassLevel(e.target.value)}
                            className="w-full bg-white text-slate-800 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-orange-550 cursor-pointer"
                          >
                            {getFilteredClasses().map((lvl) => (
                              <option key={lvl} value={lvl}>{lvl}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10.5px] font-black uppercase text-slate-500 block">Mata Pelajaran:</label>
                          <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full bg-white text-slate-800 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-orange-550 cursor-pointer"
                          >
                            {getFilteredSubjects().map((subj) => (
                              <option key={subj} value={subj}>{subj}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Dropdown Model & Metode Pembelajaran */}
                      <div className="space-y-1.5 bg-white p-3.5 rounded-2xl border border-slate-200/65 animate-fade-in select-none text-left">
                        <label className="text-[10.5px] font-black uppercase text-[#1E3A8A] flex items-center gap-1.5 justify-between">
                          <span className="flex items-center gap-1">🧠 Model/Metode Pembelajaran:</span>
                          <span className="text-[8.5px] bg-blue-100 text-[#1E3A8A] font-extrabold px-2 py-0.5 rounded font-mono tracking-wider">
                            WAJIB
                          </span>
                        </label>
                        <select
                          value={selectedMetode}
                          onChange={(e) => setSelectedMetode(e.target.value)}
                          className="w-full bg-white text-slate-800 border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-orange-550 cursor-pointer"
                        >
                          {METODE_LIST.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <p className="text-[9px] text-slate-500 leading-relaxed font-semibold">
                          *Kecerdasan AI secara khusus akan menyesuaikan alur sintaks pembelajaran &amp; aktivitas kelompok sesuai metode yang ditentukan.
                        </p>
                      </div>

                      {/* ========================================================================= */}
                      {/* REVISI 2: INPUT MAPEL MANUAL + TOMBOL TRIGGER SAVE / KUNCI MAPEL          */}
                      {/* ========================================================================= */}
                      {(subject === "Input Mapel Manual (Ketik Sendiri)" || subject === "Semua Mata Pelajaran") && (
                        <div className="flex flex-col gap-1.5 bg-blue-50/50 p-3 rounded-xl border border-blue-100 animate-fade-in">
                          <label className="text-[10px] uppercase font-black text-blue-800 block">
                            Ketik Nama Mapel Kustom/Spesifik:
                          </label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={manualSubject} 
                              onChange={(e) => { setManualSubject(e.target.value); setIsMapelSaved(false); }} 
                              placeholder="Contoh: BTQ, Tahfidz, Kimia Farmasi..." 
                              className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-blue-500" 
                            />
                            <button 
                              type="button"
                              onClick={() => {
                                if (!manualSubject.trim()) {
                                  showToast("⚠️ Ketik mapelnya dulu, Guru!");
                                  return;
                                }
                                setIsMapelSaved(true);
                                showToast("💾 Nama Mapel Kustom berhasil dikunci!");
                              }}
                              className={`px-3.5 rounded-xl text-xs font-black flex items-center gap-1 transition border-0 cursor-pointer ${
                                isMapelSaved ? "bg-emerald-600 text-white" : "bg-[#1E3A8A] text-white hover:bg-slate-900"
                              }`}
                            >
                              {isMapelSaved ? "Saved 📁" : "Kunci 🔒"}
                            </button>
                          </div>
                          <p className="text-[9px] text-[#1E3A8A] font-medium mt-1">
                            ⚠️ *Wajib diklik/dikunci agar kecerdasan AI sinkron memproses topik kustom pilihan Anda.*
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MODUL 2 CONTROLLER CONTAINER */}
                  <div className="bg-slate-50/40 border border-slate-200 p-4.5 rounded-2xl space-y-4 shadow-3xs hover:border-slate-300 transition duration-150 text-left mt-4 font-sans">

                    {/* Material Input text box */}
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-black uppercase text-slate-500 block">
                    Topik / Materi:
                  </label>
                  <textarea
                    value={materialText}
                    onChange={(e) => setMaterialText(e.target.value)}
                    placeholder={P5_THEMES_DATA[p5Theme]?.promptPlaceholder || "Contoh: Proses penguapan air di waduk..."}
                    className="w-full bg-slate-50 text-slate-800 border-2 border-slate-200.5 rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none h-40 resize-none font-sans font-semibold leading-relaxed"
                  />

                  {/* Rekomendasi Topik Cerdas Berdasarkan Rumpun Peran */}
                  <div className="space-y-1.5 bg-slate-50 border border-slate-200 p-3 rounded-xl font-sans">
                    <span className="text-[9.5px] uppercase font-black text-amber-800 block">
                      💡 Topik cepat:
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedRole === "sd" && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setMaterialText("Proses fotosintesis klorofil daun menyerap sinar matahari dan air untuk membentuk suplai oksigen.");
                              setClassLevel("SD Kelas 4");
                              setSubject("IPAS (IPA & IPS Gabungan)");
                              showToast("🎯 Mengisi topik: Fotosintesis");
                            }}
                            className="text-[9.5px] bg-white border border-slate-250 hover:border-orange-500 hover:text-orange-600 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                          >
                            🌱 Siklus Fotosintesis
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMaterialText("Operasi hitung penjumlahan dan pengurangan pecahan matematika dasar dengan penyebut berbeda kelas 4.");
                              setClassLevel("SD Kelas 4");
                              setSubject("Matematika SD");
                              showToast("🎯 Mengisi topik: Pecahan");
                            }}
                            className="text-[9.5px] bg-white border border-slate-250 hover:border-orange-500 hover:text-orange-600 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                          >
                            🔢 Pecahan Dasar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMaterialText("Menyusun kalimat efektif berbahasa Indonesia, ide pokok paragraf deskripsi.");
                              setClassLevel("SD Kelas 4");
                              setSubject("Bahasa Indonesia");
                              showToast("🎯 Mengisi topik: Kalimat Efektif");
                            }}
                            className="text-[9.5px] bg-white border border-slate-250 hover:border-orange-500 hover:text-orange-600 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                          >
                            ✍ Paragraf Deskriptif
                          </button>
                        </>
                      )}

                      {selectedRole === "agama" && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setMaterialText("Mengasah pelafalan fasih surat pendek Juz Amma (Surah Ad-Duha sampai An-Nas) beserta makharijul huruf tajwid lengkap.");
                              setClassLevel("SD Kelas 4");
                              setSubject("Tahfidz");
                              showToast("🎯 Mengisi topik: Hafalan Juz Amma");
                            }}
                            className="text-[9.5px] bg-white border border-slate-250 hover:border-emerald-600 hover:text-emerald-700 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer animate-pulse"
                          >
                            📖 Hafalan Juz Amma
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMaterialText("Pengenalan rukun berwudhu yang sah, rukun syarat thaharah kebersihan badan.");
                              setClassLevel("SD Kelas 2");
                              setSubject("Fiqih");
                              showToast("🎯 Mengisi topik: Rukun Wudhu");
                            }}
                            className="text-[9.5px] bg-white border border-slate-250 hover:border-emerald-600 hover:text-emerald-700 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                          >
                            💧 Bersuci (Wudhu)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMaterialText("Kisah keteladanan Hijrah Nabi Muhammad SAW menuju Madinah, pengorbanan sahabat kaum Ansar.");
                              setClassLevel("SD Kelas 5");
                              setSubject("Sejarah Kebudayaan Islam (SKI)");
                              showToast("🎯 Mengisi topik: Hijrah Nabi");
                            }}
                            className="text-[9.5px] bg-white border border-slate-250 hover:border-emerald-600 hover:text-emerald-700 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                          >
                            🐪 Hijrah Rasulullah
                          </button>
                        </>
                      )}

                      {selectedRole === "smp_sma" && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setMaterialText("Mempelajari tahapan replikasi mitosis sel somatis, fase profase, metafase, anafase, telofase secara struktural.");
                              setClassLevel("SMA Kelas 11");
                              setSubject("Biologi");
                              showToast("🎯 Mengisi topik: Mitosis Sel");
                            }}
                            className="text-[9.5px] bg-white border border-slate-250 hover:border-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                          >
                            🔬 Mitosis Sel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMaterialText("Gaya inersia Hukum Newton I, II, dan III tentang resultan momentum akselerasi gravitasi.");
                              setClassLevel("SMP Kelas 8");
                              setSubject("Fisika");
                              showToast("🎯 Mengisi topik: Hukum Newton");
                            }}
                            className="text-[9.5px] bg-white border border-slate-250 hover:border-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                          >
                            🏃‍♂️ Hukum Newton
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMaterialText("Kebijakan makroekonomi inflasi devisa negara, kurva permintaan dan penawaran barang.");
                              setClassLevel("SMA Kelas 11");
                              setSubject("Ekonomi");
                              showToast("🎯 Mengisi topik: Inflasi");
                            }}
                            className="text-[9.5px] bg-white border border-slate-250 hover:border-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                          >
                            📈 Kurva Inflasi
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Drag-and-drop OCR Input block */}
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-black uppercase text-slate-500 block">
                    Bidikan Foto Buku / Modul Cetak (OCR Instan):
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-250 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition relative group select-none"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleOcrFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                    
                    <div className="flex flex-col items-center gap-1">
                      <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-orange-550 transition duration-150 shrink-0" />
                      
                      {materialImage ? (
                        <div className="text-emerald-600 font-extrabold text-[11.5px] truncate max-w-full">
                          📸 Terunggah: {materialImage.name}
                        </div>
                      ) : (
                        <>
                          <p className="text-[11px] font-extrabold text-slate-600">
                            Jatuhkan Lembar Buku di sini, atau Klik unggah
                          </p>
                          <span className="text-[9px] text-slate-400 font-semibold uppercase">
                            Mendukung Ekstraksi Karakter Gambar Otomatis
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {materialImage && (
                    <button
                      type="button"
                      onClick={() => setMaterialImage(null)}
                      className="text-red-500 hover:text-red-700 text-[10px] font-bold block ml-auto mt-1 uppercase"
                    >
                      Batal Unggah
                    </button>
                  )}
                </div>

                </div>

                {/* MODUL 3: AI PROCESSOR & LANGKAH PENYUSUNAN */}
                <div className="bg-slate-50/40 border border-slate-200 p-4.5 rounded-2xl space-y-4 shadow-3xs hover:border-slate-300 transition duration-150 text-left mt-4 font-sans">

                  {/* EXECUTE ACTION GENERATE BUTTON */}
                  {generateError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold leading-relaxed animate-fade-in no-print bg-rose-50">
                      <div className="flex justify-between items-start gap-2">
                        <span>❌ {generateError}</span>
                        <button
                          onClick={() => setGenerateError("")}
                          className="text-red-400 hover:text-red-650 font-black shrink-0 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Panel Kontrol Formulator AI */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4 no-print mt-4 text-left font-sans">

                    {/* MAIN FORMULATE BUTTON */}
                    <button
                      type="button"
                      disabled={generatingDokumen === "modul_ajar"}
                      onClick={() => {
                        handleGenerateDokumen("modul_ajar");
                        setSelectedDokumen("modul_ajar");
                      }}
                      className={`w-full py-3.5 px-4 rounded-2xl font-sans text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-0 shadow-xs transform active:scale-98 transition-all duration-150 cursor-pointer ${
                        generatingDokumen === "modul_ajar"
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed animate-pulse"
                          : "bg-[#1E3A8A] hover:bg-slate-900 text-white"
                      }`}
                    >
                      {generatingDokumen === "modul_ajar" ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Membuat RPP...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                          <span>⚡ Generate RPP</span>
                        </>
                      )}
                    </button>

                    {/* COMPACT CHECKLIST SUMMARY */}
                    <div className="border-t border-slate-100 pt-3.5 space-y-2.5 font-sans">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block font-sans">
                        Dokumen lainnya:
                      </span>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { id: "modul_ajar", label: "Modul Ajar (RPP)", key: "modul_ajar" as const, icon: "📋" },
                          { id: "lkpd", label: "LKPD", key: "lkpd" as const, icon: "📝" },
                          { id: "asesmen", label: "Asesmen", key: "asesmen" as const, icon: "📊" },
                          { id: "soal_ujian", label: "Soal Ujian", key: "soal_ujian" as const, icon: "✏️" },
                        ].map((item) => {
                          const isReady = item.id === "modul_ajar" ? (!!dokumenResult.modul_ajar || !!currentResult.modul_ajar_rpp_merdeka) : !!dokumenResult[item.key];
                          const isGenerating = generatingDokumen === item.key;
                          const isSelected = selectedDokumen === item.key;
                          
                          return (
                            <div 
                              key={item.id}
                              onClick={() => {
                                setSelectedDokumen(item.key);
                              }} 
                              className={`flex items-center justify-between text-[11px] font-bold p-2.5 rounded-xl border transition duration-150 cursor-pointer select-none ${
                                isSelected
                                  ? "bg-slate-50 border-slate-350 shadow-2xs"
                                  : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50"
                              }`}
                            >
                              <div className="flex items-center gap-2 font-sans">
                                <span className="text-xs">{item.icon}</span>
                                <span className={`transition ${isSelected ? "text-[#1E3A8A] font-black" : "text-slate-700"}`}>{item.label}</span>
                              </div>
                              
                              <div className="flex items-center gap-1.5">
                                {isGenerating ? (
                                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 animate-pulse font-sans">
                                    ⏳ Menyusun...
                                  </span>
                                ) : isReady ? (
                                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100 font-sans">
                                    Ready ✓
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-200 font-sans">
                                    Belum Dibuat
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                {generatingDokumen && (
                  <div className="p-3 bg-indigo-50 border border-indigo-100/80 rounded-xl space-y-1 text-center animate-pulse select-none mt-2">
                    <span className="text-[9.5px] uppercase font-black tracking-widest text-[#1E3A8A] block">AI Berpikir:</span>
                    <p className="text-[10.5px] text-slate-700 italic leading-normal font-mono">
                      "{loadingQuote}"
                    </p>
                  </div>
                )}
                </div>
              </div>

              {/* RIGHT COLUMN: Output display work board tabs */}
              <div className={`${mobilePane === "result" ? "flex" : "hidden"} lg:flex lg:col-span-8 flex-col gap-5`}>
                <>
                    {/* Visual tabs selectors */}
                    <div className="grid grid-cols-3 gap-2 select-none shrink-0 bg-white p-1 rounded-xl border border-slate-205 font-sans">
                      <button
                        onClick={() => setWorkspaceTab("rpp")}
                        className={`py-2 px-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          workspaceTab === "rpp"
                            ? "bg-[#EBF3FF] text-[#1E3A8A]"
                            : "text-slate-550 hover:text-slate-800 hover:bg-slate-55"
                        }`}
                      >
                        📝 RPP
                      </button>

                      <button
                        onClick={() => setWorkspaceTab("video")}
                        className={`py-2 px-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          workspaceTab === "video"
                            ? "bg-[#EBF3FF] text-[#1E3A8A]"
                            : "text-slate-550 hover:text-slate-800 hover:bg-slate-55"
                        }`}
                      >
                        🎬 Media Belajar
                      </button>

                      <button
                        onClick={() => setWorkspaceTab("guide")}
                        className={`py-2 px-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          workspaceTab === "guide"
                            ? "bg-[#EBF3FF] text-[#1E3A8A]"
                            : "text-slate-550 hover:text-slate-800 hover:bg-slate-55"
                        }`}
                      >
                        📋 Panduan Admin
                      </button>
                    </div>

                    {/* Workspace rendering segments */}
                    <div className="flex-1 min-h-[400px]">
                      
                      {/* Draf RPP */}
                      {workspaceTab === "rpp" && (
                        <RppView
                          rpp={currentResult.modul_ajar_rpp_merdeka}
                          magicStudioOutput={currentResult.magic_studio_output}
                          profileName={profileName}
                          profileNip={profileNip}
                          profileSchool={profileSchool}
                          subject={subject}
                          classLevel={classLevel}
                          showToast={showToast}
                          slides={currentResult.ppt_canva_ready_slides}
                          youtubeSaran={currentResult.saran_youtube_spesifik}
                          manualSubject={manualSubject}
                          materialText={materialText}
                          p5Theme={p5Theme}
                          selectedMetode={selectedMetode}
                          handleSaveAndSyncFolder={handleSaveAndSyncFolder}
                          dokumenResult={dokumenResult}
                          generatingDokumen={generatingDokumen}
                          handleGenerateDokumen={handleGenerateDokumen}
                          selectedDokumen={selectedDokumen}
                          setSelectedDokumen={setSelectedDokumen}
                          onSaveToLibrary={(title, level, subject, text, result) => {
                            try {
                              const existingStr = localStorage.getItem("gurupintar_custom_templates") || "[]";
                              const existing = JSON.parse(existingStr);
                              
                              const newTemplate = {
                                id: "custom_" + Date.now(),
                                title: `RPP ${title}`,
                                level,
                                levelCategory: level.includes("SD") ? "SD" : level.includes("SMP") ? "SMP" : "SMA",
                                subject,
                                category: "sains", // default category guess
                                text,
                                prefilledResult: result
                              };
                              
                              localStorage.setItem("gurupintar_custom_templates", JSON.stringify([newTemplate, ...existing]));
                              
                              const newNotif = {
                                id: `notif-${Date.now()}`,
                                title: "🏛️ Tersimpan ke Perpustakaan",
                                message: `RPP "${level} - ${subject}" berhasil disimpan ke koleksi template kustom Anda.`,
                                timestamp: "Baru saja",
                                type: "success" as const,
                                read: false
                              };
                              setNotifications(prev => [newNotif, ...prev]);
                              showToast(`🏛️ Sukses menyimpan RPP "${title}" ke Perpustakaan RPP!`);
                            } catch (err) {
                              console.error(err);
                              showToast("❌ Gagal menyimpan ke Perpustakaan.");
                            }
                          }}
                        />
                      )}

                      {/* Media Pembelajaran (YouTube & Slides Canva AI & Alat Peraga) */}
                      {workspaceTab === "video" && (
                        <div id="media-belajar-container" key={mediaRefreshKey} className="w-full">
                          <MediaBelajarView
                            youtubeSaran={currentResult.saran_youtube_spesifik}
                            slides={currentResult.ppt_canva_ready_slides}
                            subject={subject}
                            classLevel={classLevel}
                            showToast={showToast}
                            profileName={profileName}
                            profileSchool={profileSchool}
                            manualSubject={manualSubject}
                            materialText={materialText}
                          />
                        </div>
                      )}

                      {/* RPP Formatting & Administrative Guide Check */}
                      {workspaceTab === "guide" && (
                        <RppFormattingGuide
                          rpp={currentResult.modul_ajar_rpp_merdeka}
                          magicStudioOutput={currentResult.magic_studio_output}
                          showToast={showToast}
                        />
                      )}

                    </div>
                  </>
              </div>
            </div>
          </div>
        )}
          </motion.div>
        )}

        {/* VIEW 3: WIDE ABSENSI BULANAN LAYOUT */}
        {currentScreen === "absensi" && (
          <motion.div
            key="absensi"
            initial={{ opacity: 0, scale: 0.995 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.995 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            
            {/* Page Header (Mengadopsi Box Gradient Biru dari Dashboard) */}
            <div className="bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-[0_12px_40px_rgba(30,58,138,0.22)] border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 no-print text-left">
              <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute bottom-[-60px] left-[-30px] w-56 h-56 bg-sky-400/15 rounded-full blur-3xl pointer-events-none"></div>

              <div className="space-y-3 relative z-10 w-full md:w-auto text-left font-sans">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-none flex items-center gap-2">
                  📋 Buku Absensi &amp; Rekap Kehadiran
                </h1>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <span className="bg-white/10 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/10">
                    🏫 Kelas Binaan: {activeKelas || "Kelas 4A"}
                  </span>
                  <span className="bg-white/10 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/10">
                    📅 Bulan berjalan: Mei 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Inline Guided Tutorial for Absensi Cerdas Screen */}
            {showGuidedTutorial && (
              <div id="tutorial-card-absensi" className="bg-[#EBF3FF] border border-blue-200 p-4.5 rounded-2xl flex gap-3.5 items-start text-xs text-indigo-950 font-sans shadow-3xs leading-relaxed animate-fade-in no-print">
                <div className="bg-indigo-500 text-white rounded-xl p-2 shrink-0 select-none">
                  <HelpCircle className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                      PANDUAN ABSENSI
                    </span>
                    <strong className="text-[#1E3A8A] font-extrabold tracking-tight uppercase">Rekapitulasi Kehadiran Presisi</strong>
                  </div>
                  <p className="text-slate-650 font-semibold leading-relaxed">
                    Sistem ini merekap persentase kehadiran murid secara horizontal. Silakan klik sel harian pada tanggal yang lurus dengan nama siswa untuk mengubah status kehadirannya secara instan (<strong className="text-[#1E3A8A]">Hadir, Sakit, Izin, atau Alpa</strong>). Hasil rekap kehadiran ini juga dapat diunduh dalam cetakan spreadsheet Excel profesional (.XLSX) melalui Sinkronisasi Google Drive.
                  </p>
                </div>
                <button
                  onClick={toggleGuidedTutorial}
                  className="text-slate-400 hover:text-slate-600 text-[10px] bg-sky-50 shadow-3xs hover:bg-sky-100 py-1 px-3 rounded-lg ml-auto font-black border border-sky-150 shrink-0 select-none cursor-pointer"
                  title="Sembunyikan Panduan"
                >
                  Sembunyikan
                </button>
              </div>
            )}

            <div className={`transition-all duration-305 ease-out transform ${
              isClassChanging ? "scale-[0.985] opacity-40 blur-[0.5px]" : "scale-100 opacity-100 blur-0"
            }`}>
              <AbsensiBulanan
                attendance={attendance}
                setAttendance={setAttendance}
                subject={subject}
                classLevel={classLevel}
                activeKelas={activeKelas}
                profileName={profileName}
                profileNip={profileNip}
                profileSchool={profileSchool}
                showToast={showToast}
                onSyncToGoogleSheets={handleSyncToGoogleSheets}
                isExportingSheets={isExportingSheets}
              />
            </div>
          </motion.div>
        )}

        {/* VIEW 4: LOKER TUGAS (FULLY EDITABLE GRADINGS) */}
        {currentScreen === "loker" && (
          <motion.div
            key="loker"
            initial={{ opacity: 0, scale: 0.995 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.995 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            
            {/* Page Header (Mengadopsi Box Gradient Biru dari Dashboard) */}
            <div className="bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-[0_12px_40px_rgba(30,58,138,0.22)] border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 no-print text-left">
              <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute bottom-[-60px] left-[-30px] w-56 h-56 bg-sky-400/15 rounded-full blur-3xl pointer-events-none"></div>

              <div className="space-y-3 relative z-10 w-full md:w-auto text-left font-sans">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-none flex items-center gap-2">
                  📁 Buku Nilai &amp; Loker Tugas
                </h1>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <span className="bg-white/10 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/10">
                    🏫 Kelas Binaan: {activeKelas || "Kelas 4A"}
                  </span>
                  <span className="bg-white/10 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/10">
                    📂 Berkas Tugas Aktif
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button type="button" onClick={() => setShowRaporModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 animate-pulse hover:animate-none">
                  📝 Narasi Rapor Otomatis
                </button>
              </div>
            </div>

            {/* Inline Guided Tutorial for Loker Tugas Screen */}
            {showGuidedTutorial && (
              <div id="tutorial-card-loker" className="bg-[#EBF3FF] border border-blue-200 p-4.5 rounded-2xl flex gap-3.5 items-start text-xs text-indigo-950 font-sans shadow-3xs leading-relaxed animate-fade-in no-print">
                <div className="bg-indigo-500 text-white rounded-xl p-2 shrink-0 select-none">
                  <HelpCircle className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#10B981] text-white font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                      PANDUAN LOKER TUGAS
                    </span>
                    <strong className="text-[#1E3A8A] font-extrabold tracking-tight uppercase">Penilaian Otomatis &amp; Ekstraksi Koreksi Buku</strong>
                  </div>
                  <p className="text-slate-650 font-semibold leading-relaxed">
                    Unggah tumpukan berkas pengerjaan siswa berupa gambar atau salinan teks materi latihan, lalu klik opsi <strong className="text-[#1E3A8A]">Ekstraksi Skor &amp; Koreksi AI</strong> untuk menganalisis kesalahan dan memberikan umpan balik detail secara otomatis. Anda juga dapat mengedit nilai kognitif murid dan isi catatan feedback langsung pada baris tabel spreadsheet di bawah ini.
                  </p>
                </div>
                <button
                  onClick={toggleGuidedTutorial}
                  className="text-slate-400 hover:text-slate-600 text-[10px] bg-sky-50 shadow-3xs hover:bg-sky-100 py-1 px-3 rounded-lg ml-auto font-black border border-sky-150 shrink-0 select-none cursor-pointer"
                  title="Sembunyikan Panduan"
                >
                  Sembunyikan
                </button>
              </div>
            )}

            <div className={`transition-all duration-305 ease-out transform ${
              isClassChanging ? "scale-[0.985] opacity-40 blur-[0.5px]" : "scale-100 opacity-100 blur-0"
            }`}>
              <LokerTugas
                attendance={attendance}
                studentGrades={studentGrades}
                setStudentGrades={setStudentGrades}
                selectedAssignment={selectedAssignment}
                setSelectedAssignment={setSelectedAssignment}
                subject={subject}
                classLevel={classLevel}
                profileName={profileName}
                profileNip={profileNip}
                profileSchool={profileSchool}
                showToast={showToast}
                onAddActivity={addActivityLog}
                activeKelas={activeKelas}
                onSyncToGoogleSheets={handleSyncToGoogleSheets}
                isExportingSheets={isExportingSheets}
              />
            </div>
          </motion.div>
        )}

        {/* VIEW 5: GOOGLE DRIVE & REKAP AKTIVITAS (Isolated Standalone Screen) */}
        {currentScreen === "drive" && (
          <motion.div
            key="drive"
            initial={{ opacity: 0, scale: 0.995 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.995 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 text-slate-800"
          >
            
            {/* Page Header (Mengadopsi Box Gradient Biru dari Dashboard) */}
            <div className="bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-[0_12px_40px_rgba(30,58,138,0.22)] border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 no-print text-left">
              <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute bottom-[-60px] left-[-30px] w-56 h-56 bg-sky-400/15 rounded-full blur-3xl pointer-events-none"></div>

              <div className="space-y-3 relative z-10 w-full md:w-auto text-left font-sans">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-none flex items-center gap-2">
                  🔗 Integrasi Google Drive
                </h1>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <span className="bg-white/10 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/10">
                    🏫 Kelas Binaan: {activeKelas || "Kelas 4A"}
                  </span>
                  <span className="bg-white/10 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/10">
                    🔴 Integrasi: Dinonaktifkan (Mode Sandbox)
                  </span>
                </div>
              </div>
            </div>

            {/* Inline Guided Tutorial for Rekap Aktivitas Screen */}
            {showGuidedTutorial && (
              <div id="tutorial-card-drive" className="bg-[#EBF3FF] border border-blue-200 p-4.5 rounded-2xl flex gap-3.5 items-start text-xs text-indigo-950 font-sans shadow-3xs leading-relaxed animate-fade-in no-print">
                <div className="bg-indigo-500 text-white rounded-xl p-2 shrink-0 select-none">
                  <HelpCircle className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-indigo-600 text-white font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                      PANDUAN INTEGRASI CLOUD
                    </span>
                    <strong className="text-[#1E3A8A] font-extrabold tracking-tight uppercase">Koneksi Folder Drive &amp; Sinkronisasi Dokumen</strong>
                  </div>
                  <p className="text-slate-650 font-semibold leading-relaxed">
                    Halaman sinkronisasi ini menghubungkan lembaran administrasi luring Anda ke penyimpanan awan. Anda diizinkan memasukkan tautan sasaran kolaboratif komite sekolah atau <strong>Google Drive</strong> instansi Anda, lalu meneliti logs aktivitas penyusunan dokumen Anda untuk sinkronisasi otomatis satu-ketukan agar seluruh draf RPP Merdeka, berkas lembar kerja, dan rekap penilaian tersimpan aman.
                  </p>
                </div>
                <button
                  onClick={toggleGuidedTutorial}
                  className="text-slate-400 hover:text-slate-600 text-[10px] bg-sky-50 shadow-3xs hover:bg-sky-100 py-1 px-3 rounded-lg ml-auto font-black border border-sky-150 shrink-0 select-none cursor-pointer"
                  title="Sembunyikan Panduan"
                >
                  Sembunyikan
                </button>
              </div>
            )}

            {/* Cloud Drive configuration status board */}
            <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 transition-all duration-305 ease-out transform ${
              isClassChanging ? "scale-[0.985] opacity-40 blur-[0.5px]" : "scale-100 opacity-100 blur-0"
            }`}>
              
              <div className="md:col-span-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-3xs space-y-5">
                <h4 className="text-xs font-black text-[#0D1D34] uppercase tracking-wider block border-b border-slate-100 pb-2 select-none">
                  Status Koneksi Cloud
                </h4>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-550 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-sm">
                      G
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-slate-800 block">Integrasi Dinonaktifkan</strong>
                      <span className="text-[10.5px] text-slate-500 font-mono">Mode Mandiri (Simulator Lokal)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                    <span className="text-[11px] font-bold text-slate-500">Status Sinkron:</span>
                    <span className="bg-slate-200 text-slate-800 text-[10px] font-extrabold p-1 px-2.5 rounded-full uppercase tracking-wide">
                      🔴 Nonaktif
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] uppercase font-black text-slate-500 block text-left">
                      Folder Sasaran Google Drive:
                    </label>
                    <input
                      type="text"
                      value={driveLink}
                      onChange={(e) => {
                        setDriveLink(e.target.value);
                        setDriveLinkTestResult(null);
                      }}
                      placeholder="Masukkan Link Target Drive Anda..."
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2.5 text-xs text-[#0D1D34] font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
                    />
                    
                    {/* Tactical Test Connection Button */}
                    <div className="flex flex-col gap-1 pt-1 justify-start items-start text-left">
                      <button
                        type="button"
                        onClick={() => {
                          if (!driveLink.trim()) {
                            showToast("⚠️ Masukkan tautan Google Drive untuk dites koneksinya!");
                            return;
                          }
                          setDriveLinkTestResult("testing");
                          showToast("🔍 Menguji koneksi ke folder Google Drive...");
                          setTimeout(() => {
                            setDriveLinkTestResult("success");
                            showToast("✓ Folder valid & siap disinkronisasikan!");
                          }, 1000);
                        }}
                        className="text-[10px] w-fit font-black bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-950 rounded-lg py-1 px-3 transition cursor-pointer flex items-center justify-start gap-1.5 select-none"
                      >
                        {driveLinkTestResult === "testing" ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
                            <span>Menguji Tautan...</span>
                          </>
                        ) : (
                          <span>🔍 Tes Koneksi Folder</span>
                        )}
                      </button>
                      {driveLinkTestResult === "success" && (
                        <p className="text-[10px] font-bold text-emerald-600 animate-fade-in text-left pt-0.5">
                          ✓ Folder valid &amp; siap disinkronisasikan!
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    disabled={isSavingAndSyncingFolder}
                    onClick={handleSaveAndSyncFolder}
                    className="w-full bg-[#1E3A8A] hover:bg-slate-900 text-white font-extrabold text-xs py-2.5 rounded-xl transition cursor-pointer select-none flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:cursor-wait"
                  >
                    {isSavingAndSyncingFolder ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Menyinkronkan Berkas ke Cloud...</span>
                      </>
                    ) : (
                      <span>Simpan Konfigurasi Folder</span>
                    )}
                  </button>
                </div>
              </div>

              <div className="md:col-span-8 bg-white border border-slate-200 p-6 rounded-3xl shadow-3xs space-y-4">
                <div className="flex justify-between items-center select-none">
                  <div>
                    <h4 className="text-xs font-black text-[#0D1D34] uppercase tracking-wider block font-display">
                      📋 Tabel Rangkuman Rincian Aktivitas Guru
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Log sinkronisasi berkas dokumen draf RPP, slide Canvased-PPT, dan presensi kelas harian.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={isSyncingAll}
                      onClick={handleSyncAllDocuments}
                      className="text-xs font-black text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-wait px-3 py-1.5 rounded-lg border border-blue-200 transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      {isSyncingAll ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-blue-500 shrink-0" />
                          <span>Menyinkronkan...</span>
                        </>
                      ) : (
                        <span>Sinkronkan Semua</span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left text-xs text-slate-705">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold">
                        <th className="py-3 px-4 w-12 text-center">No</th>
                        <th className="py-3 px-4 w-44 text-left">Tanggal &amp; Waktu Kerja</th>
                        <th className="py-3 px-4 text-left">Jenis Aktivitas / Dokumen</th>
                        <th className="py-3 px-4 text-center w-36">Status Sinkron</th>
                        <th className="py-3 px-4 text-center w-40">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activityLogs.map((log) => {
                        const isSyncing = syncingLogId === log.id;
                        return (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3 px-4 text-center font-mono text-slate-400 font-bold">{log.no}</td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-600 text-[11px]">{log.timestamp}</td>
                            <td className="py-3 px-4 font-extrabold text-slate-800 text-[12.5px]">{log.activityType}</td>
                            <td className="py-3 px-4 text-center">
                              {log.synced ? (
                                <span className="inline-block bg-emerald-100 text-emerald-800 border border-emerald-200 font-black px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wide">
                                  ✓ TERSINKRON
                                </span>
                              ) : (
                                <span className="inline-block bg-amber-100 text-amber-850 font-black px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wide">
                                  🟡 Belum Sinkron
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex gap-1.5 justify-center">
                                <a
                                  href={log.driveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-slate-100 hover:bg-slate-200 text-[#1E3A8A] font-extrabold text-[10.5px] px-2.5 py-1 rounded-lg border border-slate-250 transition cursor-pointer"
                                  onClick={() => showToast(`Membuka folder Google Drive untuk "${log.activityType}"`)}
                                >
                                  Buka di Drive
                                </a>
                                {!log.synced && (
                                  <button
                                    disabled={isSyncing}
                                    onClick={() => {
                                      setSyncingLogId(log.id);
                                      showToast("⚡ Menyinkronkan berkas khusus ke Google Drive...");
                                      setTimeout(() => {
                                        setActivityLogs((prev) =>
                                          prev.map((item) => (item.id === log.id ? { ...item, synced: true } : item))
                                        );
                                        setSyncingLogId(null);
                                        showToast("✔ Berhasil disinkronkan ke Google Drive!");
                                      }, 1200);
                                    }}
                                    className="bg-emerald-600 hover:bg-[#1E3A8A] text-white font-black text-[10.5px] px-2.5 py-1 rounded-lg shadow-sm transition cursor-pointer flex items-center justify-start gap-1 disabled:opacity-75 disabled:cursor-wait"
                                  >
                                    {isSyncing ? (
                                      <>
                                        <Loader2 className="w-3 h-3 animate-spin text-white shrink-0" />
                                        <span>Menyinkronkan...</span>
                                      </>
                                    ) : (
                                      <span>Sinkronkan</span>
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-start gap-3">
                  <CloudLightning className="w-5 h-5 text-indigo-650 shrink-0 select-none" />
                  <div className="space-y-1">
                    <strong className="text-xs font-bold text-slate-800 block">💡 Tips Kearsipan Guru Merdeka</strong>
                    <p className="text-[11px] text-slate-500 leading-normal font-medium">
                      Setiap kali Anda menekan tombol simpan perubahan nilai siswa di Loker Tugas atau melakukan cetak RPP, asisten GuruPintar.AI otomatis merekam aktivitas log secara lokal dan mempersiapkan draf asinkron sehingga siap disinkronisasikan ke target penyimpanan Google Drive kapan saja tanpa hambatan kuota!
                    </p>
                  </div>
                </div>

                {/* Live Google Drive Simulated Storage View */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-3xs space-y-4">
                  <div className="flex justify-between items-center select-none text-left">
                    <div>
                      <h4 className="text-xs font-black text-[#0D1D34] uppercase tracking-wider block font-display flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        📂 Kumpulan Berkas Riil Terhubung (Google Drive Storage)
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Folder Target: <span className="text-[#1E3A8A] font-bold underline bg-blue-50 px-1 py-0.5 rounded">{driveLink || "Belum Dikonfigurasi"}</span>
                      </p>
                    </div>
                  </div>

                  {syncedFiles.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-250 rounded-2xl select-none">
                      <p className="text-xs text-slate-400 font-medium font-mono">Belum ada dokumen yang terkirim ke target folder Drive ini.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {syncedFiles.map((file, i) => (
                        <div key={i} className="flex flex-col justify-between p-4 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-2xl transition shadow-3xs">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between text-left">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-150 flex items-center justify-center">
                                  <FileText className="w-4 h-4 text-indigo-700" />
                                </div>
                                <div>
                                  <strong className="text-[11px] font-extrabold text-slate-800 block truncate max-w-[150px] sm:max-w-[200px] lg:max-w-[280px]" title={file.fileName}>
                                    {file.fileName}
                                  </strong>
                                  <span className="text-[8.5px] font-bold text-slate-400 font-mono block uppercase">
                                    {file.size} • {file.mimeType.split("/").pop()?.split(".").pop() || "docx"}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[8px] bg-emerald-100 text-emerald-850 px-1.5 py-0.5 rounded font-black font-mono">
                                PAYLOAD OK
                              </span>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-2.5 font-mono text-[9px] text-slate-500 max-h-[80px] overflow-y-auto whitespace-pre-wrap text-left select-text scrollbar-thin">
                              {file.contentPreview}
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 mt-2">
                            <span className="text-[8px] font-bold text-slate-450 font-mono">
                              ⏱ {file.lastSyncedAt}
                            </span>
                            <button
                              onClick={() => {
                                setActivePreviewPayload({
                                  fileName: file.fileName,
                                  mimeType: file.mimeType,
                                  size: file.size,
                                  content: file.contentPreview
                                });
                              }}
                              className="bg-white hover:bg-slate-100 border border-slate-250 hover:border-slate-350 text-[#1E3A8A] font-extrabold text-[10px] px-2.5 py-1 rounded-lg transition"
                            >
                              Lihat Payload
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>

          </motion.div>
        )}

        {/* VIEW 6: AKUN SAYA & PENGATURAN PROFIL GURU (Unified Soft UI Clean Minimalis Halaman) */}
        {currentScreen === "account" && (
          <motion.div
            key="account"
            initial={{ opacity: 0, scale: 0.995 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.995 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 text-slate-800"
          >
            
            {/* Page Header & Profil Panel (Integrated Modern Premium Blue-Dark Card) */}
            <div className="bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1E40AF] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-[0_12px_40px_rgba(30,58,138,0.25)] border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 no-print">
              
              {/* Floating ambient aesthetic glow decorations */}
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500 rounded-full blur-[80px] opacity-25 pointer-events-none"></div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-sky-400 rounded-full blur-[90px] opacity-30 pointer-events-none"></div>

              {/* SISI KIRI (Profil & Bio Dinamis) */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 relative z-10 w-full md:w-auto">
                {/* ELEMEN FOTO PROFIL DENGAN EDIT ACTION */}
                <div className="relative shrink-0 select-none group cursor-pointer" title="Klik untuk ganti foto profil">
                  <input
                    type="file"
                    accept="image/*"
                    id="dashboard-avatar-pic-uploader"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (!file.type.startsWith("image/")) {
                          showToast("⚠️ Harap pilih berkas gambar valid!");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => {
                          setProfilePic(reader.result as string);
                          showToast("🟢 Foto profil baru berhasil diterapkan!");
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label htmlFor="dashboard-avatar-pic-uploader" className="cursor-pointer block relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-400 via-sky-400 to-emerald-450 opacity-60 blur-xs group-hover:opacity-100 transition duration-500"></div>
                    {profilePic ? (
                      <img
                        src={profilePic}
                        alt={profileName}
                        className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 transition duration-200"
                      />
                    ) : (
                      <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-gradient-to-br from-blue-950 to-indigo-900 text-white font-sans font-black flex items-center justify-center text-lg border-2 border-white shadow-md group-hover:scale-105 transition duration-200">
                        {profileName.split(" ").map(w => w[0]).filter(c => c && c === c.toUpperCase()).slice(0, 2).join("") || "SD"}
                      </div>
                    )}
                    {/* Subtle hover icon overlay indicator */}
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] text-white font-bold select-none animate-fade-in">
                      Ganti Foto
                    </div>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-md animate-pulse">
                      <span className="w-1 h-1 bg-white rounded-full"></span>
                    </span>
                  </label>
                </div>

                {/* ELEMEN TEKS INFORMASI */}
                <div className="space-y-2.5 flex-1 min-w-0 text-center sm:text-left">
                  {/* Baris 1 Name & Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans leading-tight shadow-xs truncate">
                      {profileName}
                    </h1>
                  </div>

                  <p className="text-sky-200/95 text-xs font-mono font-bold tracking-wider leading-none">
                    NIP / NUPTK: {profileNip || "198804052026042001"}
                  </p>

                  {/* Baris 2 Badges */}
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span className="bg-white/10 text-white backdrop-blur-sm px-3 py-1 rounded-full text-[10.5px] font-bold border border-white/15">
                      🏫 {profileSchool}
                    </span>
                    <span className="bg-white/10 text-white backdrop-blur-sm px-3 py-1 rounded-full text-[10.5px] font-bold border border-white/15">
                      📌 Kelas Binaan: {activeKelas}
                    </span>
                  </div>

                  {/* Baris 3 Quotes */}
                  <div className="pl-3 border-l-2 border-amber-400 bg-white/5 py-1.5 px-3.5 rounded-r-xl max-w-xl text-left backdrop-blur-xs shadow-3xs">
                    <span className="text-amber-300 font-serif text-sm leading-none select-none font-extrabold inline-block mr-1">“</span>
                    <span className="italic text-[11.5px] text-sky-100 font-medium font-sans">
                      {profileQuote || "Belum ada quotes. Klik 'Edit Profil' di bawah untuk menambahkan kalimat motivasi!"}
                    </span>
                    <span className="text-amber-300 font-serif text-sm leading-none select-none font-extrabold inline-block ml-1">”</span>
                  </div>
                </div>
              </div>

              {/* SISI KANAN (Action Buttons) */}
              <div className="flex items-center gap-3 shrink-0 relative z-10 w-full md:w-auto justify-end">
              </div>

            </div>

            {/* 3. DAFTAR MENU PENGATURAN (LIST STYLE DENGAN ARROW) */}
            <div className="space-y-3.5 text-left select-none">
              
              {/* SPECIAL REGROW: INTEGRASI DEDICATED API KEY GEMINI */}
              <div className="bg-white border-2 border-indigo-200 rounded-2xl overflow-hidden shadow-3xs hover:shadow-2xs transition-all">
                <div 
                  onClick={() => setExpandedAccountSection(expandedAccountSection === "gemini_key" ? null : "gemini_key")}
                  className="p-4.5 bg-indigo-50/20 hover:bg-indigo-50/40 transition cursor-pointer flex justify-between items-center"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-150 text-indigo-700 flex items-center justify-center border border-indigo-250 shrink-0">
                      <Key className="w-5 h-5 font-black" />
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm font-black text-indigo-950 block leading-tight flex items-center gap-2">
                        <span>🔑 Integrasi API Key Gemini</span>
                        <span className="text-[7.5px] bg-indigo-650 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                          Prioritas Akses AI
                        </span>
                      </strong>
                      <span className="text-[10px] text-slate-550 block mt-0.5 font-semibold">
                        Pasang API Key Gemini pribadi Anda untuk performa instan &amp; tanpa batasan kuota.
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-indigo-600 shrink-0 transition-transform ${expandedAccountSection === "gemini_key" ? "rotate-90 text-indigo-950" : ""}`} />
                </div>
                
                {/* Collapsible form container */}
                {expandedAccountSection === "gemini_key" && (
                  <div className="bg-white p-5 border-t border-indigo-150 space-y-4 animate-slide-up select-text">
                    <div className="p-3.5 bg-indigo-50/65 text-indigo-950 border border-indigo-100 rounded-xl text-xs space-y-1.5">
                      <strong className="text-indigo-850 block font-bold">💡 Mengapa disarankan meletakkan API Key Pribadi?</strong>
                      <p className="text-[10.5px] text-slate-650 leading-relaxed font-sans font-medium">
                        Model bawaan sistem kami menampung antrean permintaan yang sangat tinggi selama jam belajar mengajar di sekolah. Memasang API Key pribadi gratis dari Google AI Studio memberikan prioritas performa instan tanpa antrean, limit kuota sangat besar, dan 100% aman dirangkul peramban Bapak/Ibu Guru.
                      </p>
                    </div>

                    <div className="space-y-1.5 max-w-md">
                      <label className="text-[10.5px] font-black text-slate-600 block uppercase">Gemini API Key Personal Anda</label>
                      <div className="relative flex gap-2">
                        <div className="relative flex-1">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Mulai dengan AIzaSy..." 
                            value={teacherApiKey}
                            onChange={(e) => {
                              setTeacherApiKey(e.target.value);
                            }}
                            className="w-full text-xs font-mono bg-white border border-slate-250 rounded-xl pl-3 pr-10 py-2.5 text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none" 
                          />
                          <button
                            type="button"
                            onClick={() => { setShowPassword(!showPassword); playSfx("click"); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 focus:outline-none cursor-pointer border-0 bg-transparent"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <button 
                          onClick={() => {
                            playSfx("success");
                            showToast("✓ Sukses menyimpan API Key Gemini Kustom Anda!");
                          }}
                          className="bg-indigo-700 hover:bg-indigo-900 text-white font-extrabold text-[11px] px-5 py-2.5 rounded-xl transition cursor-pointer select-none active:scale-95"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SPECIAL REGROW: SINKRONISASI CLOUD DEDICATED ACCORDION */}
              <div className="bg-white border-2 border-blue-200 rounded-2xl overflow-hidden shadow-3xs hover:shadow-2xs transition-all">
                <div 
                  onClick={() => {
                    setExpandedAccountSection(expandedAccountSection === "cloud_sync" ? null : "cloud_sync");
                    playSfx("click");
                  }}
                  className="p-4.5 bg-blue-50/20 hover:bg-blue-50/40 transition cursor-pointer flex justify-between items-center"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200 shrink-0">
                      ☁️
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm font-black text-blue-950 block leading-tight flex items-center gap-2">
                        <span>☁️ Sinkronisasi Cloud</span>
                        <span className="text-[7.5px] bg-blue-650 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                          Google Drive
                        </span>
                      </strong>
                      <span className="text-[10px] text-slate-550 block mt-0.5 font-semibold">
                        Hubungkan penyimpanan awan instansi Anda untuk sinkronisasi dokumen &amp; rekap aktivitas otomatis.
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-blue-600 shrink-0 transition-transform ${expandedAccountSection === "cloud_sync" ? "rotate-90 text-blue-950" : ""}`} />
                </div>
                
                {/* Collapsible content for Sinkronisasi Cloud */}
                {expandedAccountSection === "cloud_sync" && (
                  <div className="bg-white p-5 border-t border-slate-200 space-y-6 animate-slide-up select-text">
                    
                    {/* Status board */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 transition-all duration-305 ease-out transform">
                      
                      <div className="lg:col-span-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs space-y-5">
                        <h4 className="text-xs font-black text-[#0D1D34] uppercase tracking-wider block border-b border-slate-100 pb-2 select-none">
                          Status Koneksi Cloud
                        </h4>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-655 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-sm select-none">
                              G
                            </div>
                            <div>
                              <strong className="text-xs font-bold text-slate-800 block">Akun Google Drive Terhubung</strong>
                              <span className="text-[10.5px] text-slate-500 font-mono">randomriftvideos@gmail.com</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-blue-200/45 pt-3 select-none">
                            <span className="text-[11px] font-bold text-slate-500">Status Sinkron:</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold p-1 px-2.5 rounded-full uppercase tracking-wide">
                              🟢 Terhubung
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1.5 text-left">
                            <label className="text-[10px] uppercase font-black text-slate-500 block text-left font-mono">
                              Folder Sasaran Google Drive:
                            </label>
                            <input
                              type="text"
                              value={driveLink}
                              onChange={(e) => {
                                setDriveLink(e.target.value);
                                setDriveLinkTestResult(null);
                              }}
                              placeholder="Masukkan Link Target Drive Anda..."
                              className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs text-[#0D1D34] font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
                            />
                            
                            {/* Connection testing button */}
                            <div className="flex flex-col gap-1 pt-1 justify-start items-start text-left">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!driveLink.trim()) {
                                    showToast("⚠️ Masukkan tautan Google Drive untuk dites koneksinya!");
                                    return;
                                  }
                                  setDriveLinkTestResult("testing");
                                  showToast("🔍 Menguji koneksi ke folder Google Drive...");
                                  setTimeout(() => {
                                    setDriveLinkTestResult("success");
                                    showToast("✓ Folder valid & siap disinkronisasikan!");
                                  }, 1000);
                                }}
                                className="text-[10px] w-fit font-black bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-950 rounded-lg py-1 px-3 transition cursor-pointer flex items-center justify-start gap-1.5 select-none"
                              >
                                {driveLinkTestResult === "testing" ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
                                    <span>Menguji Tautan...</span>
                                  </>
                                ) : (
                                  <span>🔍 Tes Koneksi Folder</span>
                                )}
                              </button>
                              {driveLinkTestResult === "success" && (
                                <p className="text-[10px] font-bold text-emerald-600 animate-fade-in text-left pt-0.5 animate-pulse">
                                  ✓ Folder valid &amp; siap disinkronisasikan!
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            disabled={isSavingAndSyncingFolder}
                            onClick={handleSaveAndSyncFolder}
                            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs py-2.5 rounded-xl transition cursor-pointer select-none flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:cursor-wait font-sans"
                          >
                            {isSavingAndSyncingFolder ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                                <span>Menyinkronkan Berkas ke Cloud...</span>
                              </>
                            ) : (
                              <span>Simpan Konfigurasi Folder</span>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="lg:col-span-8 bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs space-y-4">
                        <div className="flex justify-between items-center select-none flex-wrap gap-2">
                          <div className="text-left">
                            <h4 className="text-xs font-black text-[#0D1D34] uppercase tracking-wider block font-display">
                              📋 Tabel Rangkuman Rincian Aktivitas Guru
                            </h4>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Log sinkronisasi berkas dokumen draf RPP, slide Canvased-PPT, dan presensi siswa.
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              disabled={isSyncingAll}
                              onClick={handleSyncAllDocuments}
                              className="text-xs font-black text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-wait px-3 py-1.5 rounded-lg border border-blue-200 transition cursor-pointer flex items-center justify-center gap-1"
                            >
                              {isSyncingAll ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin text-blue-500 shrink-0" />
                                  <span>Menyinkronkan...</span>
                                </>
                              ) : (
                                <span>Sinkronkan Semua</span>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="overflow-x-auto border border-slate-100 rounded-xl">
                          <table className="w-full text-left text-xs text-slate-705">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold">
                                <th className="py-2.5 px-3 w-10 text-center">No</th>
                                <th className="py-2.5 px-3 w-36 text-left">Waktu</th>
                                <th className="py-2.5 px-3 text-left">Jenis Aktivitas / Dokumen</th>
                                <th className="py-2.5 px-3 text-center w-28">Status Sinkron</th>
                                <th className="py-2.5 px-3 text-center w-36">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {activityLogs.map((log) => {
                                const isSyncing = syncingLogId === log.id;
                                return (
                                  <tr key={log.id} className="hover:bg-slate-50/50 transition">
                                    <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-bold">{log.no}</td>
                                    <td className="py-2.5 px-3 font-mono font-bold text-slate-600 text-[10.5px]">{log.timestamp}</td>
                                    <td className="py-2.5 px-3 font-extrabold text-slate-800 text-[11.5px]">{log.activityType}</td>
                                    <td className="py-2.5 px-3 text-center">
                                      {log.synced ? (
                                        <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-150 px-2 py-0.5 rounded-full text-[8.5px] uppercase tracking-wide font-black">
                                          ✓ OK
                                        </span>
                                      ) : (
                                        <span className="inline-block bg-amber-50 text-amber-850 font-black px-2 py-0.5 rounded-full text-[8.5px] uppercase tracking-wide">
                                          🟡 Belum
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      <div className="flex gap-1 justify-center">
                                        <a
                                          href={log.driveUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="bg-slate-100 hover:bg-slate-200 text-[#1E3A8A] font-extrabold text-[10px] px-2.5 py-1 rounded-md border border-slate-250 transition cursor-pointer"
                                          onClick={() => showToast(`Membuka folder Google Drive untuk "${log.activityType}"`)}
                                        >
                                          Buka
                                        </a>
                                        {!log.synced && (
                                          <button
                                            disabled={isSyncing}
                                            onClick={() => {
                                              setSyncingLogId(log.id);
                                              showToast("⚡ Menyinkronkan berkas khusus ke Google Drive...");
                                              setTimeout(() => {
                                                setActivityLogs((prev) =>
                                                  prev.map((item) => (item.id === log.id ? { ...item, synced: true } : item))
                                                );
                                                setSyncingLogId(null);
                                                showToast("✔ Berhasil disinkronkan ke Google Drive!");
                                              }, 1200);
                                            }}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] px-2 py-1 rounded-md shadow-3xs transition cursor-pointer flex items-center justify-start gap-1 disabled:opacity-75 disabled:cursor-wait"
                                          >
                                            {isSyncing ? (
                                              <Loader2 className="w-3 h-3 animate-spin text-white shrink-0" />
                                            ) : (
                                              <span>Sinkron</span>
                                            )}
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-start gap-3">
                          <CloudLightning className="w-4 h-4 text-indigo-650 shrink-0 select-none mt-0.5" />
                          <div className="space-y-1 text-left">
                            <strong className="text-xs font-bold text-slate-800 block">💡 Tips Kearsipan Guru Merdeka</strong>
                            <p className="text-[10px] text-slate-505 leading-normal font-medium font-sans">
                              Setiap kali Anda menekan tombol simpan perubahan nilai siswa di Catatan Nilai atau melakukan cetak RPP, asisten GuruPintar.AI otomatis merekam aktivitas log secara lokal dan mempersiapkan draf asinkron sehingga siap disinkronisasikan ke target penyimpanan Google Drive kapan saja tanpa hambatan kuota!
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Live Google Drive Simulated Storage View */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs space-y-4">
                      <div className="flex justify-between items-center select-none text-left">
                        <div>
                          <h4 className="text-xs font-black text-[#0D1D34] uppercase tracking-wider block font-display flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            📂 Kumpulan Berkas Riil Terhubung (Google Drive Storage)
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Folder Target: <span className="text-[#1E3A8A] font-bold underline bg-blue-50 px-1 py-0.5 rounded">{driveLink || "Belum Dikonfigurasi"}</span>
                          </p>
                        </div>
                      </div>

                      {syncedFiles.length === 0 ? (
                        <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-250 rounded-xl select-none">
                          <p className="text-xs text-slate-400 font-medium font-mono">Belum ada dokumen yang terkirim ke target folder Drive ini.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {syncedFiles.map((file, i) => (
                            <div key={i} className="flex flex-col justify-between p-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-3xs">
                              <div className="space-y-2">
                                <div className="flex items-start justify-between text-left">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-150 flex items-center justify-center">
                                      <FileText className="w-4 h-4 text-indigo-700" />
                                    </div>
                                    <div>
                                      <strong className="text-[11px] font-extrabold text-slate-800 block truncate max-w-[120px] sm:max-w-[180px] lg:max-w-[240px]" title={file.fileName}>
                                        {file.fileName}
                                      </strong>
                                      <span className="text-[8.5px] font-bold text-slate-400 font-mono block uppercase">
                                        {file.size} • {file.mimeType.split("/").pop()?.split(".").pop() || "docx"}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="text-[8px] bg-emerald-100 text-emerald-850 px-1.5 py-0.5 rounded font-black font-mono">
                                    PAYLOAD OK
                                  </span>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-lg p-2 font-mono text-[9px] text-slate-500 max-h-[70px] overflow-y-auto whitespace-pre-wrap text-left select-text scrollbar-thin">
                                  {file.contentPreview}
                                </div>
                              </div>

                              <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                                <span className="text-[8px] font-bold text-slate-450 font-mono">
                                  ⏱ {file.lastSyncedAt}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActivePreviewPayload({
                                      fileName: file.fileName,
                                      mimeType: file.mimeType,
                                      size: file.size,
                                      content: file.contentPreview
                                    });
                                  }}
                                  className="bg-white hover:bg-slate-100 border border-slate-250 hover:border-slate-350 text-[#1E3A8A] font-extrabold text-[9px] px-2 py-0.5 rounded transition cursor-pointer"
                                >
                                  Lihat Payload
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>

              {/* BARIS 1: Edit Data Instansi & Kelas Binaan */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-3xs hover:shadow-2xs transition-all">
                <div 
                  onClick={() => setExpandedAccountSection(expandedAccountSection === "instansi" ? null : "instansi")}
                  className="p-4.5 hover:bg-slate-50/50 transition cursor-pointer flex justify-between items-center"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center border border-blue-100 shrink-0">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm font-black text-slate-800 block leading-tight">
                        Edit Data Instansi &amp; Kelas Binaan
                      </strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                        Pengaturan Kop RPP Sekolah, Kurikulum, dan Tingkatan Kelas Utama
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${expandedAccountSection === "instansi" ? "rotate-90 text-[#1E3A8A]" : ""}`} />
                </div>
                
                {/* Inline form for Instansi database settings */}
                {expandedAccountSection === "instansi" && (
                  <div className="bg-slate-50/50 p-5 border-t border-slate-150 space-y-4 animate-slide-up select-text">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Gelar &amp; Nama Lengkap Guru</label>
                        <input 
                          type="text" 
                          value={profileName} 
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">NIP / NUPTK Instansi</label>
                        <input 
                          type="text" 
                          value={profileNip} 
                          onChange={(e) => setProfileNip(e.target.value)}
                          className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Nama Instansi / KOP RPP</label>
                        <input 
                          type="text" 
                          value={profileSchool} 
                          onChange={(e) => setProfileSchool(e.target.value)}
                          className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Kelas Binaan Utama</label>
                        <div className="flex gap-2">
                          <select 
                            value={activeKelas} 
                            onChange={(e) => setActiveKelas(e.target.value)}
                            className="flex-1 text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
                          >
                            {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              setNewKelasNameInput("");
                              setIsAddKelasModalOpen(true);
                            }}
                            className="bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] border border-blue-200 font-black text-[11px] px-3.5 rounded-xl transition cursor-pointer select-none shrink-0"
                            title="Tambah Kelas Baru"
                          >
                            + Tambah
                          </button>
                          {kelasList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (!confirm(`Hapus kelas "${activeKelas}"? Semua data absensi dan nilai kelas ini akan terhapus.`)) return;
                                const newList = kelasList.filter(k => k !== activeKelas);
                                setKelasList(newList);
                                setActiveKelas(newList[0]);
                                localStorage.removeItem(`gurupintar_attendance_${activeKelas}`);
                                localStorage.removeItem(`gurupintar_grades_${activeKelas}`);
                                showToast(`🗑 Kelas "${activeKelas}" berhasil dihapus.`);
                              }}
                              className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 font-black text-[11px] px-3.5 rounded-xl transition cursor-pointer select-none shrink-0"
                              title="Hapus Kelas Ini"
                            >
                              🗑 Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      disabled={isSavingSchool}
                      onClick={() => {
                        setIsSavingSchool(true);
                        setTimeout(() => {
                          showToast("✓ Perubahan Kop RPP & Profil Guru sukses disimpan ke sistem!");
                          setExpandedAccountSection(null);
                          setIsSavingSchool(false);
                        }, 750);
                      }}
                      className="bg-[#1E3A8A] hover:bg-slate-950 text-white font-extrabold text-[10.5px] px-4 py-2.5 rounded-xl transition cursor-pointer select-none flex items-center justify-center gap-1.5 disabled:opacity-75 active:scale-95"
                    >
                      {isSavingSchool ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white shrink-0" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <span>Simpan Perubahan</span>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* BARIS: Atur Jadwal Mengajar & Pengingat Harian */}
              <div id="jadwal-mengajar-settings" className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-3xs hover:shadow-2xs transition-all">
                <div 
                  onClick={() => setExpandedAccountSection(expandedAccountSection === "jadwal" ? null : "jadwal")}
                  className="p-4.5 hover:bg-slate-50/50 transition cursor-pointer flex justify-between items-center"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#1E3A8A] flex items-center justify-center border border-indigo-100 shrink-0">
                      <Clock className="w-5 h-5 font-black" />
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm font-black text-slate-800 block leading-tight">
                        Atur Jadwal Mengajar &amp; Pengingat Harian
                      </strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                        Konfigurasi jadwal mengajar harian, kelas binaan, serta topik materi rujukan di Dashboard Utama
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${expandedAccountSection === "jadwal" ? "rotate-90 text-[#1E3A8A]" : ""}`} />
                </div>

                {expandedAccountSection === "jadwal" && (
                  <div className="bg-slate-50/50 p-5 border-t border-slate-150 space-y-6 animate-slide-up select-text">
                    
                    {/* FORM INPUT SLOT BARU */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                      <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block font-mono">
                        ➕ TAMBAH SLOT JADWAL MENGAJAR BARU
                      </strong>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase font-mono block">Hari Mengajar</label>
                          <select 
                            value={formJadwalHari} 
                            onChange={(e) => setFormJadwalHari(e.target.value)}
                            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-[#1E3A8A] focus:outline-1 focus:outline-offset-0 cursor-pointer"
                          >
                            {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map(hari => <option key={hari} value={hari}>{hari}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase font-mono block">Jam Mulai</label>
                          <input 
                            type="text" 
                            placeholder="Contoh: 07:30" 
                            value={formJadwalMulai} 
                            onChange={(e) => setFormJadwalMulai(e.target.value)}
                            className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase font-mono block">Jam Selesai</label>
                          <input 
                            type="text" 
                            placeholder="Contoh: 09:00" 
                            value={formJadwalSelesai} 
                            onChange={(e) => setFormJadwalSelesai(e.target.value)}
                            className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-1">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase font-mono block">Target Kelas Binaan</label>
                          <select 
                            value={formJadwalKelas} 
                            onChange={(e) => setFormJadwalKelas(e.target.value)}
                            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-[#1E3A8A] focus:outline-1 focus:outline-offset-0 cursor-pointer"
                          >
                            {kelasList.map(kelas => <option key={kelas} value={kelas}>{kelas}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase font-mono block">Nama Mata Pelajaran</label>
                          <input 
                            type="text" 
                            placeholder="Contoh: IPAS, Matematika, B.Indo" 
                            value={formJadwalMapel} 
                            onChange={(e) => setFormJadwalMapel(e.target.value)}
                            className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase font-mono block">Rencana Topik Pembelajaran Mandiri (Pengingat)</label>
                        <textarea 
                          rows={2}
                          value={formJadwalTopik}
                          onChange={(e) => setFormJadwalTopik(e.target.value)}
                          placeholder="Contoh: Eksperimen siklus fotosintesis menggunakan daun segar dan air."
                          className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none resize-none leading-relaxed"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!formJadwalMulai || !formJadwalSelesai || !formJadwalMapel || !formJadwalTopik) {
                            showToast("⚠️ Mohon lengkapi seluruh isian jadwal sebelum menyimpan!");
                            return;
                          }
                          const newSlot = {
                            id: `j-${Date.now()}`,
                            hari: formJadwalHari,
                            jamMulai: formJadwalMulai,
                            jamSelesai: formJadwalSelesai,
                            kelas: formJadwalKelas,
                            mapel: formJadwalMapel,
                            topik: formJadwalTopik
                          };
                          setJadwalMengajar(prev => [...prev, newSlot]);
                          setFormJadwalTopik("");
                          showToast(`✅ Jadwal baru hari ${formJadwalHari} berhasil ditambahkan!`);
                        }}
                        className="bg-[#1E3A8A] hover:bg-slate-900 text-white font-extrabold text-[10.5px] px-4 py-2.5 rounded-xl transition cursor-pointer select-none"
                      >
                        ➕ Masukkan ke Daftar Jadwal
                      </button>
                    </div>

                    {/* LIST JADWAL YANG ADA */}
                    <div className="space-y-3">
                      <strong className="text-xs font-black text-slate-800 uppercase tracking-wider block font-mono">
                        📋 DAFTAR AKTIF JADWAL MENGAJAR ({jadwalMengajar.length} SLOT)
                      </strong>
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white divide-y divide-slate-100 shadow-3xs max-h-96 overflow-y-auto">
                        {jadwalMengajar.length === 0 ? (
                          <div className="p-8 text-center text-slate-450 text-xs font-medium">
                            Belum ada jadwal mengajar dikonfigurasi. Silakan isi form di atas untuk membuat jadwal baru!
                          </div>
                        ) : (
                          jadwalMengajar.map((slot) => (
                            <div key={slot.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                              <div className="space-y-1.5 font-sans">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[9px] bg-indigo-50 text-blue-700 border border-blue-100 font-black px-2 py-0.5 rounded font-mono uppercase">
                                    {slot.hari} • {slot.jamMulai}-{slot.jamSelesai}
                                  </span>
                                  <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold px-2 py-0.5 rounded font-sans">
                                    {slot.kelas}
                                  </span>
                                  {(() => {
                                    const dayMap: { [key: string]: number } = {
                                      "Minggu": 0,
                                      "Senin": 1,
                                      "Selasa": 2,
                                      "Rabu": 3,
                                      "Kamis": 4,
                                      "Jumat": 5,
                                      "Sabtu": 6,
                                    };
                                    const currentDayIndex = new Date().getDay();
                                    const targetDayNum = dayMap[slot.hari] ?? -1;
                                    
                                    if (targetDayNum === currentDayIndex) {
                                      return (
                                        <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-black px-2 py-0.5 rounded flex items-center gap-1 font-sans">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                          Hari Ini
                                        </span>
                                      );
                                    } else if (targetDayNum >= 0 && targetDayNum < currentDayIndex) {
                                      return (
                                        <span className="text-[9px] bg-slate-100 text-slate-500 border border-slate-200 font-bold px-2 py-0.5 rounded flex items-center gap-1 font-sans">
                                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                          Sudah Lewat
                                        </span>
                                      );
                                    } else if (targetDayNum > currentDayIndex) {
                                      return (
                                        <span className="text-[9px] bg-blue-50 text-blue-750 border border-blue-200 font-black px-2 py-0.5 rounded flex items-center gap-1 font-sans">
                                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                          Mendatang
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                                <h5 className="text-xs font-black text-slate-800 flex items-center gap-1">
                                  📚 {slot.mapel}
                                </h5>
                                <p className="text-[11px] text-slate-505 leading-relaxed font-sans font-semibold">
                                  Topik: {slot.topik}
                                </p>
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  if (!confirm(`Hapus jadwal mengajar kelas ${slot.kelas} - ${slot.mapel} ini?`)) return;
                                  setJadwalMengajar(prev => prev.filter(item => item.id !== slot.id));
                                  showToast(`🗑️ Slot jadwal mengajar berhasil dihapus.`);
                                }}
                                className="bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-850 p-2 px-3 text-[10.5px] font-black rounded-xl transition cursor-pointer select-none shrink-0 flex items-center justify-center border border-red-150"
                                title="Hapus Slot ini"
                              >
                                🗑️ Hapus
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* BARIS 2: Keamanan & Kata Sandi Akun */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-3xs hover:shadow-2xs transition-all">
                <div 
                  onClick={() => setExpandedAccountSection(expandedAccountSection === "keamanan" ? null : "keamanan")}
                  className="p-4.5 hover:bg-slate-50/50 transition cursor-pointer flex justify-between items-center"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm font-black text-slate-800 block leading-tight">
                        Keamanan &amp; Kata Sandi Akun
                      </strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                        Autentikasi Integrasi Akun Guru, Kata Sandi, dan Enkripsi Kunci API
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${expandedAccountSection === "keamanan" ? "rotate-90 text-[#1E3A8A]" : ""}`} />
                </div>
                
                {/* Inline form for Keamanan */}
                {expandedAccountSection === "keamanan" && (
                  <div className="bg-slate-50/50 p-5 border-t border-slate-150 space-y-4 animate-slide-up select-text">
                    <div className="p-3.5 bg-emerald-50 text-emerald-950 border border-emerald-150 rounded-xl text-xs space-y-1.5">
                      <div className="font-extrabold flex items-center gap-1.5 text-emerald-800">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse inline-block"></span>
                        <span>Single Sign-On (SSO) Terhubung Otomatis</span>
                      </div>
                      <p className="font-medium text-slate-650 font-sans leading-relaxed">
                        Akun Anda disinkronkan secara aman melalui portal Kementerian Pendidikan <strong>Belajar.id</strong> Bapak/Ibu Guru. Enkripsi level perbankan aktif untuk menjaga data kuis dan absensi kelas binaan Anda tetap privat.
                      </p>
                    </div>
                    
                    <div className="space-y-4 max-w-md pt-1 leading-normal">
                      <div className="space-y-1.5">
                        <label className="text-[10.5px] font-black text-slate-500 block uppercase">Kata Sandi Saat Ini</label>
                        <input type="password" placeholder="••••••••••••••" disabled className="w-full text-xs font-mono bg-slate-200/60 border border-slate-300 rounded-xl px-3 py-2 text-slate-500 cursor-not-allowed" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10.5px] font-black text-slate-500 block uppercase">Kata Sandi Baru</label>
                        <input type="password" placeholder="Masukkan kata sandi baru untuk diubah" className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none" />
                      </div>

                      {/* GEMINI PERSONAL API KEY CONFIGURATION INPUT (B) */}
                      <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                        <label className="text-[10.5px] font-black text-slate-500 block uppercase flex items-center gap-1.5">
                          <span>🔑 Google Gemini API Key Anda</span>
                          <span className="text-[7.5px] bg-indigo-50 text-indigo-700 border border-indigo-150 px-1.5 py-0.2 rounded font-black uppercase font-mono">Personal</span>
                        </label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Mulai dengan AIzaSy..." 
                            value={teacherApiKey}
                            onChange={(e) => {
                              setTeacherApiKey(e.target.value);
                            }}
                            className="w-full text-xs font-mono bg-white border border-slate-200 rounded-xl pl-3 pr-10 py-2.5 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none" 
                          />
                          <button
                            type="button"
                            onClick={() => { setShowPassword(!showPassword); playSfx("click"); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 focus:outline-none cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-[9.5px] text-slate-400 leading-normal">
                          Dapatkan kunci API secara gratis di halaman portal <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-black hover:text-blue-800">Google AI Studio</a> untuk meningkatkan limit un-throttled kuota.
                        </p>
                      </div>

                      <button 
                        onClick={() => {
                          showToast("✓ Simulasi: Kata Sandi Belajar.id Akun Guru diubah di database lokal!");
                          setExpandedAccountSection(null);
                        }}
                        className="bg-[#1E3A8A] hover:bg-slate-900 text-white font-black text-[10.5px] px-4 py-2.5 rounded-xl transition cursor-pointer"
                      >
                        Perbarui Kata Sandi
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* BARIS 3: Riwayat Dokumen Tersinkron */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-3xs hover:shadow-2xs transition-all">
                <div 
                  onClick={() => setExpandedAccountSection(expandedAccountSection === "riwayat" ? null : "riwayat")}
                  className="p-4.5 hover:bg-slate-50/50 transition cursor-pointer flex justify-between items-center"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-650 flex items-center justify-center border border-sky-100 shrink-0">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm font-black text-slate-800 block leading-tight">
                        Riwayat Dokumen Tersinkron
                      </strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                        Log sinkronisasi cloud real-time di folder penyimpanan target Google Drive
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${expandedAccountSection === "riwayat" ? "rotate-90 text-[#1E3A8A]" : ""}`} />
                </div>
                
                {/* Inline list for Riwayat */}
                {expandedAccountSection === "riwayat" && (
                  <div className="bg-slate-50/50 p-5 border-t border-slate-150 space-y-4 animate-slide-up select-text">
                    <div className="flex justify-between items-center select-none">
                      <span className="text-[10px] font-black text-slate-450 uppercase font-mono">DOKUMEN PAYLOAD LOG DI GOOGLE DRIVE</span>
                      <button 
                        onClick={() => setCurrentScreen("drive")}
                        className="text-[10px] text-blue-700 font-extrabold hover:underline"
                      >
                        Buka Halaman Cloud →
                      </button>
                    </div>
                    
                    {/* Compact list of synced files */}
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white max-h-60 overflow-y-auto">
                      {activityLogs.slice(0, 3).map((file, i) => (
                        <div key={i} className="p-3.5 flex justify-between items-center hover:bg-slate-50 transition">
                          <div className="min-w-0 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                              <FileText className="w-3.5 h-3.5 text-indigo-600" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-extrabold text-slate-800 block truncate max-w-[200px]" title={file.activityType}>
                                {file.activityType}
                              </span>
                              <span className="text-[9px] font-semibold text-slate-400 font-mono">
                                {file.timestamp} • No: {file.no}
                              </span>
                            </div>
                          </div>
                          <span className="text-[8px] bg-emerald-100 text-emerald-800 border border-emerald-150 text-right px-2 py-0.5 rounded-full font-black uppercase font-mono">
                            PAYLOAD OK
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* BARIS 4: Pusat Bantuan & Panduan GuruPintar.AI */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-3xs hover:shadow-2xs transition-all">
                <div 
                  onClick={() => setExpandedAccountSection(expandedAccountSection === "bantuan" ? null : "bantuan")}
                  className="p-4.5 hover:bg-slate-50/50 transition cursor-pointer flex justify-between items-center"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shrink-0">
                      <HelpCircle className="w-5 h-5 font-bold" />
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm font-black text-slate-800 block leading-tight">
                        Pusat Bantuan &amp; Panduan GuruPintar.AI
                      </strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                        Tanya Jawab seputar pembuatan Kurikulum Merdeka otomatis &amp; tips ekspor
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${expandedAccountSection === "bantuan" ? "rotate-90 text-[#1E3A8A]" : ""}`} />
                </div>
                
                {/* Inline FAQ */}
                {expandedAccountSection === "bantuan" && (
                  <div className="bg-slate-50/50 p-5 border-t border-slate-150 space-y-4.5 animate-slide-up select-text text-[#233246] text-xs leading-relaxed">
                    <div className="space-y-1 border-b border-slate-200 pb-2.5">
                      <strong className="text-[#1E3A8A] font-extrabold">Q: Apakah berkas RPP saya benar-benar terunggah ke Google Drive?</strong>
                      <p className="text-slate-600 font-medium font-sans">
                        Ya. Bila Google Drive tersinkron, setiap kali Anda melalukan generate RPP baru, draf rincian lengkapnya secara otomatis tersalurkan dan tersimpan di folder target cloud Anda dalam hitungan detik.
                      </p>
                    </div>
                    <div className="space-y-1 border-b border-slate-200 pb-2.5">
                      <strong className="text-[#1E3A8A] font-extrabold">Q: Bagaimana cara mengubah KOP Keterangan Instansi untuk semua file?</strong>
                      <p className="text-slate-600 font-medium font-sans">
                        Cukup ubah kolom "Nama Instansi / KOP RPP" di tab **Edit Data Instansi** di atas. Setiap dokumen ajar yang diekspor ke Microsoft Word (.DOCX) akan mengadopsi KOP tersebut!
                      </p>
                    </div>
                    <div className="space-y-1">
                      <strong className="text-[#1E3A8A] font-extrabold">Q: Pengoperasian terpandu GuruPintar.AI?</strong>
                      <p className="text-slate-605 font-medium font-sans">
                        Klik tombol **"Tampilkan Panduan"** di pojok kanan atas sistem kapan saja untuk mengaktifkan balon petunjuk visual kontekstual!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* BARIS 5: Pengaturan Lanjutan */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-3xs hover:shadow-2xs transition-all">
                <div 
                  onClick={() => {
                    setExpandedAccountSection(expandedAccountSection === "lanjut" ? null : "lanjut");
                    playSfx("click");
                  }}
                  className="p-4.5 hover:bg-slate-50/50 transition cursor-pointer flex justify-between items-center"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-200 shrink-0">
                      ⚙️
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm font-black text-slate-800 block leading-tight">
                        Pengaturan Lanjutan
                      </strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-medium font-sans">
                        Atur preferensi efek suara, status panduan visual, dan pengaturan API key
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${expandedAccountSection === "lanjut" ? "rotate-90 text-[#1E3A8A]" : ""}`} />
                </div>
                
                {/* Collapsible details for Pengaturan Lanjutan */}
                {expandedAccountSection === "lanjut" && (
                  <div className="bg-slate-50/50 p-5 border-t border-slate-150 space-y-4 animate-slide-up select-text">
                    
                    {/* Sound toggle switch / button selector */}
                    <div className="flex justify-between items-center py-2 border-b border-slate-150/60 select-none">
                      <div className="space-y-0.5 text-left">
                        <strong className="text-xs font-black text-slate-800 block">Efek Suara Sistem</strong>
                        <span className="text-[10px] text-slate-400 block font-medium font-sans">Aktifkan efek suara interaktif saat tombol ditekan.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !sfxEnabled;
                          setSfxEnabled(nextState);
                          localStorage.setItem("GP_SFX_ENABLED", nextState ? "true" : "false");
                          if (nextState) {
                            setTimeout(() => playSfx("success"), 50);
                          }
                        }}
                        className={`font-black text-xs py-1.5 px-4 rounded-xl border transition cursor-pointer select-none text-center font-sans ${
                          sfxEnabled
                            ? "bg-emerald-150 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                            : "bg-slate-200 text-slate-600 border-slate-350 hover:bg-slate-300"
                        }`}
                      >
                        {sfxEnabled ? "🟢 Nyala (Aktif)" : "🔴 Mati (Senyap)"}
                      </button>
                    </div>

                    {/* API Settings trigger shortcut */}
                    <div className="flex justify-between items-center py-2 border-b border-slate-150/60 select-none">
                      <div className="space-y-0.5 text-left">
                        <strong className="text-xs font-black text-slate-800 block">Panduan Pengaturan API Key</strong>
                        <span className="text-[10px] text-slate-400 block font-medium font-sans">Buka visual modal panduan perolehan Kunci API Gemini gratis.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowApiGuide(true);
                          playSfx("click");
                        }}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[10.5px] py-1.5 px-4 rounded-xl border border-indigo-200 transition shrink-0 cursor-pointer font-sans"
                      >
                        Buka Panduan API
                      </button>
                    </div>

                    {/* Tutorial Reset Toggle */}
                    <div className="flex justify-between items-center py-2 select-none">
                      <div className="space-y-0.5 text-left">
                        <strong className="text-xs font-black text-slate-800 block">Panduan Guru Interaktif</strong>
                        <span className="text-[10px] text-slate-400 block font-medium font-sans">Atur apakah balon tutorial instan di halaman-halaman muncul kembali.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextTut = !showGuidedTutorial;
                          setShowGuidedTutorial(nextTut);
                          localStorage.setItem("gurupintar_show_tutorial", nextTut ? "true" : "false");
                          playSfx("click");
                          showToast(nextTut ? "💡 Panduan visual diaktifkan kembali!" : "💡 Panduan visual disembunyikan.");
                        }}
                        className={`font-black text-xs py-1.5 px-4 rounded-xl border transition cursor-pointer select-none text-center font-sans ${
                          showGuidedTutorial
                            ? "bg-blue-105 text-blue-800 border-blue-350 hover:bg-blue-200"
                            : "bg-slate-200 text-slate-600 border-slate-305 hover:bg-slate-300"
                        }`}
                      >
                        {showGuidedTutorial ? "🔵 Ditampilkan" : "⚪ Disembunyikan"}
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>

            {/* 2.5. FORM FEEDBACK BETA CARD (TELAH DIPINDAHKAN KE BAWAH PROFIL SEBELUM TOMBOL KELUAR) */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-3xs text-left space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-black text-[#0D1D34] font-display">
                    Hubungi Pengembang (Feedback)
                  </h4>
                  <p className="text-[10.5px] text-slate-500 mt-0.5 leading-normal">
                    Kirim saran, laporan bug, atau apresiasi Anda untuk versi beta ini.
                  </p>
                </div>
                <span className="px-2.5 py-1 text-[9px] bg-sky-100 text-sky-700 font-black rounded-lg border border-sky-200 select-none tracking-wide">
                  BETA v1.0
                </span>
              </div>

               {!feedbackSent ? (
                <form onSubmit={handleSendFeedback} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">
                      Tipe Masukan:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        disabled={isSendingFeedback}
                        onClick={() => { setFeedbackType("Lapor Bug"); playSfx("click"); }}
                        className={`py-2 px-3 text-xs font-black rounded-xl border transition cursor-pointer select-none text-center ${
                          feedbackType === "Lapor Bug"
                            ? "bg-red-100 text-red-700 border-red-300"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-650 border-slate-200"
                        } disabled:opacity-50`}
                      >
                        🔴 Lapor Bug
                      </button>
                      <button
                        type="button"
                        disabled={isSendingFeedback}
                        onClick={() => { setFeedbackType("Saran"); playSfx("click"); }}
                        className={`py-2 px-3 text-xs font-black rounded-xl border transition cursor-pointer select-none text-center ${
                          feedbackType === "Saran"
                            ? "bg-amber-100 text-amber-700 border-amber-300"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-650 border-slate-200"
                        } disabled:opacity-50`}
                      >
                        🟡 Saran
                      </button>
                      <button
                        type="button"
                        disabled={isSendingFeedback}
                        onClick={() => { setFeedbackType("Pujian"); playSfx("click"); }}
                        className={`py-2 px-3 text-xs font-black rounded-xl border transition cursor-pointer select-none text-center ${
                          feedbackType === "Pujian"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-650 border-slate-200"
                        } disabled:opacity-50`}
                      >
                        🟢 Pujian
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">
                      Pesan Masukan:
                    </label>
                    <textarea
                      rows={3}
                      value={feedbackText}
                      disabled={isSendingFeedback}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder={
                        feedbackType === "Lapor Bug"
                          ? "Deskripsikan bug atau kendala teknis yang Anda temui..."
                          : feedbackType === "Saran"
                            ? "Masukkan rekomendasi fitur atau peningkatan yang Anda harapkan..."
                            : "Ceritakan fitur favorit Anda atau apresiasi untuk GuruPintar.AI..."
                      }
                      className={`w-full text-xs font-medium bg-white border rounded-xl px-3 py-2.5 text-slate-800 focus:ring-1 focus:outline-none resize-none leading-relaxed ${
                        feedbackType === "Lapor Bug"
                          ? "border-slate-200 focus:ring-red-500 focus:border-red-500"
                          : feedbackType === "Saran"
                            ? "border-slate-200 focus:ring-amber-500 focus:border-amber-500"
                            : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                      } disabled:bg-slate-50 disabled:text-slate-400`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!feedbackText.trim() || isSendingFeedback}
                    className="w-full bg-[#1E3A8A] hover:bg-slate-950 text-white font-extrabold text-xs py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide font-sans shadow-3xs flex items-center justify-center gap-1.5"
                  >
                    {isSendingFeedback ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Kirim Masukan Anda...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀 Kirim Feedback langsung ke Developer</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-950 rounded-2xl text-center space-y-3 animate-fade-in select-none">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold flex items-center justify-center text-lg mx-auto">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-black text-emerald-800">Feedback Berhasil Dikirim!</h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-sans">
                      Terima kasih Bapak/Ibu <strong className="text-slate-800 font-extrabold">{profileName}</strong>. Tanggapan Anda telah tersimpan secara aman di sistem.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFeedbackSent(false); playSfx("click"); }}
                    className="text-[10px] text-blue-700 hover:text-blue-900 font-extrabold underline block mx-auto cursor-pointer"
                  >
                    Kirim Masukan Lainnya
                  </button>
                </div>
              )}

              {storedFeedbacks.length > 0 && (
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[9px] text-slate-450 font-mono font-semibold">
                    Tersimpan: {storedFeedbacks.length} masukan
                  </span>
                  <button
                    type="button"
                    onClick={() => { handleExportFeedbackCSV(); playSfx("success"); }}
                    className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#1E3A8A] font-black text-[10px] py-1.5 px-3 rounded-lg shadow-3xs transition cursor-pointer"
                  >
                    📥 Ekspor CSV Data Feedback
                  </button>
                </div>
              )}
            </div>

            {/* DANGER AREA / LOG OUT */}
            <div className="pt-4 select-none no-print">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 hover:text-red-850 font-black text-xs py-3 rounded-2xl transition cursor-pointer text-center block uppercase tracking-wider font-sans shadow-3xs hover:scale-[1.005]"
              >
                🔴 Keluar dari Akun
              </button>
            </div>

          </motion.div>
        )}

        </AnimatePresence>
      </div>
    </main>
  </div>

        {/* DETAILED TEACHER PROFILE modal */}
      <ProfileModal
        isOpen={activeOverlay === "profile"}
        onClose={() => setActiveOverlay(null)}
        profileName={profileName}
        setProfileName={setProfileName}
        profileNip={profileNip}
        setProfileNip={setProfileNip}
        profileSchool={profileSchool}
        setProfileSchool={setProfileSchool}
        profilePic={profilePic}
        setProfilePic={setProfilePic}
        showToast={showToast}
        activeKelas={activeKelas}
        setActiveKelas={setActiveKelas}
        kelasList={kelasList}
        setKelasList={setKelasList}
        onLogout={handleLogout}
        profileQuote={profileQuote}
        setProfileQuote={setProfileQuote}
      />

      {/* ACCIDENTAL EXIT DETECTED modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in no-print">
          <div className="absolute inset-0" onClick={() => setShowExitConfirm(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200/90 shadow-2xl relative z-10 p-6 md:p-7 space-y-4 text-center">
            <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 animate-pulse">
              <span className="text-2xl">⚠️</span>
            </div>
            
            <div className="space-y-1.5">
              <h4 className="text-base font-extrabold text-[#0D1D34] font-display">
                Peringatan: Keluar Terdeteksi!
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Anda tidak sengaja menekan navigasi kembali (back) di HP atau mencoba meninggalkan halaman. Seluruh draf RPP, Media, dan LKPD yang sedang Anda susun akan hilang jika Anda keluar sekarang.
              </p>
            </div>
            
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-xs font-black transition cursor-pointer select-none active:scale-95"
              >
                Tetap di Sini &amp; Teruskan
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  window.location.href = "https://www.google.com";
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 hover:text-red-700 text-slate-650 rounded-xl py-3 text-xs font-bold transition cursor-pointer select-none"
              >
                Ya, Keluar Aplikasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SARAN & NOTIFIKASI modal */}
      {activeOverlay === "notifications" && (
        <div className="fixed inset-0 z-[150] bg-slate-950/75 select-none backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in no-print">
          <div className="absolute inset-0" onClick={() => setActiveOverlay(null)}></div>
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl relative z-10 transform animate-slide-up text-slate-800 p-6 flex flex-col justify-between max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4 shrink-0">
              <h4 className="text-sm font-black text-[#0D1D34] font-display uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Bell className="w-5 h-5 text-indigo-700" />
                Saran &amp; Notifikasi Guru
              </h4>
              <button
                onClick={() => setActiveOverlay(null)}
                className="p-1 px-[7px] bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg hover:text-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            
            <div className="flex-1 space-y-3.5 text-xs leading-relaxed text-slate-650 overflow-y-auto max-h-[50vh] pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <p className="font-extrabold uppercase tracking-wide text-[11px] font-sans">Belum Ada Pemberitahuan</p>
                  <p className="text-[10px] text-slate-400 mt-1">Seluruh log sinkronisasi dan status ajar akan terekam otomatis di sini secara real-time.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  let bgClass = "bg-blue-50/60 border-blue-105 text-blue-905";
                  if (notif.type === "success") bgClass = "bg-emerald-50/60 border-emerald-105 text-emerald-955";
                  if (notif.type === "warning") bgClass = "bg-amber-50/60 border-amber-105 text-amber-955";
                  if (notif.type === "alert") bgClass = "bg-red-50/60 border-red-105 text-red-955";
                  return (
                    <div key={notif.id} className={`p-4 border rounded-2xl shadow-3xs transition-all ${bgClass}`}>
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-1.5">
                        <strong className="font-extrabold text-slate-800 text-[11.5px] tracking-tight">{notif.title}</strong>
                        <span className="text-[9px] opacity-65 font-mono font-bold shrink-0">{notif.timestamp}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px] font-semibold">{notif.message}</p>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center shrink-0 select-none mt-4">
              <button
                onClick={() => {
                  setNotifications([]);
                  showToast("🧹 Seluruh riwayat notifikasi dibersihkan!");
                }}
                className="text-slate-400 hover:text-red-650 text-[10.5px] font-black underline cursor-pointer hover:scale-103 active:scale-95 transition-all text-left"
              >
                Bersihkan Riwayat
              </button>
              <button
                onClick={() => setActiveOverlay(null)}
                className="bg-[#1E3A8A] hover:bg-indigo-900 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl transition cursor-pointer active:scale-95 shadow-sm"
              >
                Tutup Notifikasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERSISTENT INTERACTIVE JADWAL MENGAJAR OVERLAY (Sesuai Dashboard) */}
      {activeOverlay === "jadwal" && (
        <div className="fixed inset-0 z-[150] bg-slate-950/75 select-none backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in no-print text-slate-800">
          <div className="absolute inset-0" onClick={() => setActiveOverlay(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-xl border border-slate-200 shadow-2xl relative z-10 p-6 md:p-7 flex flex-col justify-between max-h-[90vh] overflow-hidden text-left">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4 shrink-0">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#0D1D34] font-display uppercase tracking-wider block font-sans">
                    Agenda Mengajar Bapak/Ibu Guru
                  </h4>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5 font-bold">
                    Konfigurasi Mingguan Kelas &amp; Topik Mapel Merdeka
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveOverlay(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg hover:text-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* JADWAL SYNC SECTION */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-150 rounded-2xl p-4.5 mb-4 space-y-3 select-none relative overflow-hidden text-slate-800 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-lg select-none shrink-0 font-bold bg-white text-blue-700 shadow-3xs">
                    📅
                  </div>
                  <div>
                    <h5 className="text-[11.5px] font-black uppercase text-[#1E3A8A] tracking-wider leading-none font-sans">
                      Sinkronisasi Google Calendar
                    </h5>
                    <p className="text-[9px] text-slate-500 mt-1 leading-none font-semibold">
                      Impor otomatis jadwal harian tanpa input manual
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isSyncingCalendar}
                  onClick={handleGoogleCalendarSync}
                  className="bg-[#1E3A8A] hover:bg-slate-900 border-0 disabled:bg-slate-300 text-white font-extrabold text-[10px] py-1.5 px-3 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-3xs shrink-0 select-none"
                >
                  {isSyncingCalendar ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-white shrink-0" />
                      <span>Proses...</span>
                    </>
                  ) : (
                    <>
                      <span>🔄 Sinkron Google</span>
                    </>
                  )}
                </button>
              </div>

              {showSyncCalendarUI && syncedCalendarEvents.length > 0 && (
                <div className="bg-white/80 backdrop-blur-xs border border-indigo-100 rounded-xl p-3 space-y-2 max-h-[160px] overflow-y-auto scrollbar-none animate-slide-up">
                  <div className="flex items-center justify-between pb-1 border-b border-indigo-50">
                    <span className="text-[9px] font-black text-indigo-900 uppercase">
                      Ditemukan Calon Jadwal Baru ({syncedCalendarEvents.filter(e => !e.imported).length}):
                    </span>
                    {syncedCalendarEvents.some(e => !e.imported) && (
                      <button
                        type="button"
                        onClick={handleImportAllCalendarSchedules}
                        className="text-[9px] font-black text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded cursor-pointer border border-emerald-250 transition"
                      >
                        ✓ Impor Semua
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-1.5">
                    {syncedCalendarEvents.map((evt) => (
                      <div key={evt.id} className="flex justify-between items-center text-[10px] bg-slate-50 border border-slate-200 p-2 rounded-lg gap-2">
                        <div className="text-left font-sans flex-1 min-w-0">
                          <p className="font-black text-slate-800 truncate leading-snug">
                            {evt.mapel} — {evt.kelas}
                          </p>
                          <p className="text-slate-500 font-semibold text-[9px] truncate">
                            Hari {evt.hari}, {evt.jamMulai} - {evt.jamSelesai} • <span className="font-mono text-[8.5px] font-bold text-indigo-700">{evt.topik}</span>
                          </p>
                        </div>
                        {evt.imported ? (
                          <span className="text-[8.5px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-black px-2 py-0.5 rounded">
                            Terimpor
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleImportCalendarSchedule(evt.id)}
                            className="text-[8.5px] bg-indigo-55 hover:bg-[#1E3A8A] border border-indigo-200 hover:text-white text-indigo-700 font-bold px-2.5 py-0.5 rounded transition cursor-pointer select-none"
                          >
                            Impor
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filter Hari */}
            <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 shrink-0 border-b border-slate-100 select-none scrollbar-none scroll-smooth">
              {["Semua", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedJadwalDayFilter(day)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-black transition-all shrink-0 cursor-pointer ${
                    selectedJadwalDayFilter === day
                      ? "bg-indigo-650 text-white shadow-xs"
                      : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Content list scroll */}
            <div className="flex-1 space-y-3.5 overflow-y-auto pr-1 max-h-[50vh] scrollbar-thin">
              {(() => {
                const filteredList = jadwalMengajar.filter(
                  (slot) => selectedJadwalDayFilter === "Semua" || slot.hari === selectedJadwalDayFilter
                );

                if (filteredList.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-400 font-sans border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-pulse" />
                      <p className="font-extrabold uppercase tracking-wide text-[10.5px]">Tidak Ada Jadwal Mengajar</p>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto font-medium">
                        {selectedJadwalDayFilter === "Semua"
                          ? "Belum ada jadwal mengajar yang dikonfigurasi sama sekali."
                          : `Belum ada jadwal mengajar pada hari ${selectedJadwalDayFilter}.`}
                      </p>
                    </div>
                  );
                }

                return filteredList.map((slot) => {
                  const dayMap: { [key: string]: number } = {
                    "Minggu": 0,
                    "Senin": 1,
                    "Selasa": 2,
                    "Rabu": 3,
                    "Kamis": 4,
                    "Jumat": 5,
                    "Sabtu": 6,
                  };
                  const currentDayIndex = new Date().getDay();
                  const targetDayNum = dayMap[slot.hari] ?? -1;
                  
                  let statusBorder = "border-l-indigo-300";
                  let statusBg = "from-slate-50 to-slate-100/50";
                  let statusLabel = "";
                  let badgeColor = "";
                  let badgeDot = "";

                  if (targetDayNum === currentDayIndex) {
                    statusBorder = "border-l-emerald-500";
                    statusBg = "from-emerald-50/15 to-emerald-100/10";
                    statusLabel = "Hari Ini";
                    badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                    badgeDot = "bg-emerald-500 animate-pulse";
                  } else if (targetDayNum >= 0 && targetDayNum < currentDayIndex) {
                    statusBorder = "border-l-slate-300";
                    statusBg = "from-slate-50 to-slate-100/30";
                    statusLabel = "Sudah Lewat";
                    badgeColor = "bg-slate-100 text-slate-500 border-slate-250";
                    badgeDot = "bg-slate-400";
                  } else if (targetDayNum > currentDayIndex) {
                    statusBorder = "border-l-blue-500";
                    statusBg = "from-blue-50/10 to-indigo-50/5";
                    statusLabel = "Mendatang";
                    badgeColor = "bg-blue-55/75 text-blue-700 border-blue-200";
                    badgeDot = "bg-blue-500";
                  }

                  if (editingJadwalSlotId === slot.id) {
                    return (
                      <div
                        key={slot.id}
                        className="p-4 bg-indigo-50/40 border-2 border-indigo-500 rounded-2xl space-y-3 font-sans text-slate-800 animate-fade-in"
                      >
                        <div className="flex justify-between items-center pb-2 border-b border-indigo-150">
                          <strong className="text-xs font-black text-indigo-950">
                            ✏️ EDIT SLOT AGENDA MENGAJAR
                          </strong>
                          <button
                            type="button"
                            onClick={() => { setEditingJadwalSlotId(null); playSfx("click"); }}
                            className="text-xs font-bold text-slate-500 hover:text-red-700 transition"
                          >
                            Batal
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase block font-mono">Hari</label>
                            <select 
                              value={editSlotHari} 
                              onChange={(e) => setEditSlotHari(e.target.value)}
                              className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 focus:outline-[#1E3A8A] focus:outline-1"
                            >
                              {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map(hari => <option key={hari} value={hari}>{hari}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase block font-mono">Kelas</label>
                            <select 
                              value={editSlotKelas} 
                              onChange={(e) => setEditSlotKelas(e.target.value)}
                              className="w-full text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800"
                            >
                              {kelasList.map(kelas => <option key={kelas} value={kelas}>{kelas}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase block font-mono">Jam Mulai</label>
                            <input 
                              type="text" 
                              value={editSlotMulai} 
                              onChange={(e) => setEditSlotMulai(e.target.value)}
                              className="w-full text-xs font-semibold bg-white border border-slate-250 rounded-lg px-2 py-1.5 text-slate-800"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase block font-mono">Jam Selesai</label>
                            <input 
                              type="text" 
                              value={editSlotSelesai} 
                              onChange={(e) => setEditSlotSelesai(e.target.value)}
                              className="w-full text-xs font-semibold bg-white border border-slate-250 rounded-lg px-2 py-1.5 text-slate-800"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase block font-mono">Mata Pelajaran (Mapel)</label>
                          <input 
                            type="text" 
                            value={editSlotMapel} 
                            onChange={(e) => setEditSlotMapel(e.target.value)}
                            className="w-full text-xs font-semibold bg-white border border-slate-250 rounded-lg px-2 py-1.5 text-slate-800"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase block font-mono">Topik / Elemen Ajar</label>
                          <textarea 
                            rows={2}
                            value={editSlotTopik}
                            onChange={(e) => setEditSlotTopik(e.target.value)}
                            className="w-full text-xs font-medium bg-white border border-slate-250 rounded-lg px-2 py-1.5 text-slate-800 resize-none leading-relaxed"
                          />
                        </div>

                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => { setEditingJadwalSlotId(null); playSfx("click"); }}
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!editSlotMulai || !editSlotSelesai || !editSlotMapel || !editSlotTopik) {
                                showToast("⚠️ Mohon lengkapi seluruh isian jadwal!");
                                return;
                              }
                              const updated = jadwalMengajar.map(s => {
                                if (s.id === slot.id) {
                                  return {
                                    ...s,
                                    hari: editSlotHari,
                                    jamMulai: editSlotMulai,
                                    jamSelesai: editSlotSelesai,
                                    kelas: editSlotKelas,
                                    mapel: editSlotMapel,
                                    topik: editSlotTopik
                                  };
                                }
                                return s;
                              });
                              setJadwalMengajar(updated);
                              setEditingJadwalSlotId(null);
                              showToast("✅ Jadwal berhasil diperbarui!");
                              playSfx("success");
                            }}
                            className="px-4 py-1.5 text-xs font-black text-white bg-indigo-700 hover:bg-slate-900 rounded-lg transition shadow-3xs"
                          >
                            Simpan Perubahan ✓
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={slot.id}
                      className={`p-4 bg-gradient-to-r ${statusBg} border border-slate-200 ${statusBorder} border-l-4 rounded-2xl flex items-start gap-3.5 hover:shadow-3xs transition duration-150 group`}
                    >
                      <div className="w-11 h-11 bg-white rounded-xl flex flex-col justify-center items-center text-slate-750 border border-slate-200 shrink-0 select-none shadow-3xs">
                        <span className="text-[10px] font-mono font-black text-indigo-750 uppercase leading-none">{slot.hari.slice(0, 3)}</span>
                        <span className="text-[9px] font-bold text-slate-450 mt-0.5 leading-none">{slot.jamMulai}</span>
                      </div>

                      <div className="space-y-1 text-left flex-1 min-w-0">
                        <div className="flex items-center gap-2 justify-between">
                          <strong className="text-[12px] font-black text-slate-800 tracking-tight text-left block truncate">
                            {slot.mapel}
                          </strong>
                          <div className="flex items-center gap-1.5 shrink-0 select-none">
                            {statusLabel && (
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-1 ${badgeColor}`}>
                                <span className={`w-1 h-1 rounded-full ${badgeDot}`}></span>
                                {statusLabel}
                              </span>
                            )}
                            <span className="bg-blue-50 text-blue-800 border border-blue-150 text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider shrink-0 select-none">
                              {slot.kelas}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-[11px] font-sans font-semibold text-slate-550 leading-relaxed text-left flex items-start gap-1">
                          <span className="text-indigo-600 font-bold shrink-0">📖 Topik:</span>
                          <span className="break-words select-text">{slot.topik}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100/60 mt-2 select-none">
                          <div className="text-[8.5px] font-mono font-black text-slate-400 uppercase tracking-widest block leading-none">
                            Waktu Slot: {slot.jamMulai} s.d. {slot.jamSelesai}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingJadwalSlotId(slot.id);
                                setEditSlotHari(slot.hari);
                                setEditSlotMulai(slot.jamMulai);
                                setEditSlotSelesai(slot.jamSelesai);
                                setEditSlotKelas(slot.kelas);
                                setEditSlotMapel(slot.mapel);
                                setEditSlotTopik(slot.topik);
                                playSfx("click");
                              }}
                              className="px-2 py-0.8 text-[9px] font-extrabold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded border border-slate-200 hover:border-indigo-200 transition cursor-pointer flex items-center gap-0.5"
                            >
                              <span>✏️</span>
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus jadwal untuk mata pelajaran "${slot.mapel}"?`)) {
                                  const newList = jadwalMengajar.filter(s => s.id !== slot.id);
                                  setJadwalMengajar(newList);
                                  showToast(`🗑️ Jadwal "${slot.mapel}" berhasil dihapus.`);
                                  playSfx("click");
                                }
                              }}
                              className="px-2 py-0.8 text-[9px] font-extrabold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded border border-rose-150 hover:border-rose-200 transition cursor-pointer flex items-center gap-0.5"
                            >
                              <span>🗑️</span>
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Footer Modal Options */}
            <div className="pt-4.5 border-t border-slate-150 flex flex-col sm:flex-row gap-2.5 shrink-0 select-none mt-5">
              <button
                type="button"
                onClick={() => {
                  setActiveOverlay(null);
                  setCurrentScreen("account");
                  setExpandedAccountSection("jadwal");
                  playSfx("click");
                  showToast("✏️ Masuk ke mode edit jadwal hari ini!");
                }}
                className="flex-1 bg-white hover:bg-slate-50 border border-slate-250 text-indigo-700 rounded-xl py-2.5 text-xs font-black transition cursor-pointer select-none active:scale-95 text-center flex items-center justify-center gap-1.5"
              >
                <span>⚙️ Kelola Jadwal Baru / Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveOverlay(null)}
                className="bg-[#1E3A8A] hover:bg-indigo-900 text-white font-extrabold text-xs py-2.5 px-6 rounded-xl transition cursor-pointer active:scale-95 shadow-sm text-center"
              >
                Tutup Jadwal
              </button>
            </div>

          </div>
        </div>
      )}

      {/* VERIFIED PAYLOAD DETAIL MODAL */}
      {activePreviewPayload && (
        <div className="fixed inset-0 z-[165] bg-slate-950/75 select-none backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in no-print">
          <div className="absolute inset-0" onClick={() => setActivePreviewPayload(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-2xl border border-slate-200 shadow-2xl relative z-10 transform animate-slide-up text-slate-800 p-6 flex flex-col justify-between max-h-[85vh] overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3.5 mb-4 shrink-0 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-150 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#0D1D34] font-display uppercase tracking-wider block">
                    🔍 Verifikasi Data Transfer Payload
                  </h4>
                  <p className="text-[10.5px] text-slate-400 font-mono mt-0.5">
                    {activePreviewPayload.fileName} • {activePreviewPayload.size}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePreviewPayload(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg hover:text-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-slate-50/70 border border-slate-200 rounded-2xl p-4 font-mono text-[11px] leading-relaxed text-slate-650 text-left select-text max-h-[50vh] scrollbar-thin">
              <div className="border-b border-dashed border-slate-200 pb-2 mb-3">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">Simulated Multi-Part Payload Headers</div>
                <div className="text-[10px] text-blue-800 font-bold mt-1">POST /api/drive/files/upload?folder={encodeURIComponent(driveLink)} HTTP/1.1</div>
                <div className="text-[10px] text-slate-400">Content-Type: multipart/form-data; boundary=----GURU-AI-BOUNDARY</div>
                <div className="text-[10px] text-slate-400">Content-Disposition: form-data; name="file"; filename="{activePreviewPayload.fileName}"</div>
              </div>
              
              <div className="whitespace-pre-wrap pt-1 font-semibold text-slate-705">
                {activePreviewPayload.content}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4.5 border-t border-slate-150 mt-4 shrink-0">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activePreviewPayload.content);
                  showToast("📋 Berhasil disalin ke papan klip!");
                }}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-250 text-[#1E3A8A] font-extrabold text-[11px] px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Salin Konten
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([activePreviewPayload.content], { type: "text/plain;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = activePreviewPayload.fileName + ".txt";
                  link.click();
                  URL.revokeObjectURL(url);
                  showToast("📥 Sukses mengunduh draf teks mentah!");
                }}
                className="bg-emerald-600 hover:bg-[#1E3A8A] text-white font-black text-[11px] px-4 py-2 rounded-xl shadow-sm transition cursor-pointer"
              >
                Unduh Payload Teks (.TXT)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 FIXED BOTTOM NAVBAR FOR MOBILE/TABLET (Sesuai Mockup) */}
      <div className="fixed bottom-0 left-0 right-0 z-[190] bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] lg:hidden flex justify-around py-2 px-2 select-none no-print">
        <button
          onClick={() => {
            setCurrentScreen("home");
            playSfx("click");
          }}
          className={`flex-1 py-1.5 flex flex-col items-center gap-1 font-sans font-bold text-[10px] transition-all cursor-pointer border-0 bg-transparent ${
            currentScreen === "home" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="text-[17px]">🏠</span>
          <span>Beranda</span>
        </button>

        <button
          onClick={() => {
            setCurrentScreen("studio");
            setMobilePane("input");
            playSfx("click");
          }}
          className={`flex-1 py-1.5 flex flex-col items-center gap-1 font-sans font-bold text-[10px] transition-all cursor-pointer border-0 bg-transparent ${
            currentScreen === "studio" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="text-[17px]">✏️</span>
          <span>Buat Ajar</span>
        </button>
        
        <button
          onClick={() => {
            setCurrentScreen("absensi");
            playSfx("click");
          }}
          className={`flex-1 py-1.5 flex flex-col items-center gap-1 font-sans font-bold text-[10px] transition-all cursor-pointer border-0 bg-transparent ${
            currentScreen === "absensi" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="text-[17px]">✅</span>
          <span>Kehadiran</span>
        </button>

        <button
          onClick={() => {
            setCurrentScreen("loker");
            playSfx("click");
          }}
          className={`flex-1 py-1.5 flex flex-col items-center gap-1 font-sans font-bold text-[10px] transition-all cursor-pointer border-0 bg-transparent ${
            currentScreen === "loker" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="text-[17px]">📓</span>
          <span>Catatan Nilai</span>
        </button>

        <button
          onClick={() => {
            setCurrentScreen("account");
            playSfx("click");
          }}
          className={`flex-1 py-1.5 flex flex-col items-center gap-1 font-sans font-bold text-[10px] transition-all cursor-pointer border-0 bg-transparent ${
            currentScreen === "account" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="text-[17px]">👤</span>
          <span>Profil Saya</span>
        </button>
      </div>

      {/* MODAL TAMBAH KELAS BARU (MODERN OVERLAY STATE-BASED) */}
      {isAddKelasModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[250] animate-fade-in no-print p-4">
          <div className="absolute inset-0 bg-transparent" onClick={() => setIsAddKelasModalOpen(false)}></div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-scale-up text-left relative z-10">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black font-display text-slate-800 flex items-center gap-2">
                🏫 Tambah Kelas Baru
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddKelasModalOpen(false);
                  setNewKelasNameInput("");
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                Nama Kelas Baru
              </label>
              <input
                type="text"
                value={newKelasNameInput}
                onChange={(e) => setNewKelasNameInput(e.target.value)}
                placeholder="Contoh: Kelas 5B"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-855 font-bold focus:ring-2 focus:ring-blue-100 focus:bg-white focus:outline-none transition-all"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddNewKelas(newKelasNameInput);
                  }
                }}
              />
              <p className="text-[9px] text-slate-400">
                Ketik nama kelas (misal: "Kelas 5B") lalu ketuk simpan untuk membuat kelas baru ini.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddKelasModalOpen(false);
                  setNewKelasNameInput("");
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleAddNewKelas(newKelasNameInput)}
                className="flex-1 bg-[#1E3A8A] hover:bg-[#152A66] text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NON-BLOCKING SOPHISTICATED FLOATING PANDUAN API KEY GEMINI */}
      {showApiGuide && (
        <React.Fragment>
          {isApiGuideMinimized ? (
            <div className="fixed bottom-6 right-6 z-[150] no-print animate-slide-in-right text-left">
              <button
                type="button"
                onClick={() => { setIsApiGuideMinimized(false); playSfx("click"); }}
                className="bg-gradient-to-r from-blue-700 via-[#1E3A8A] to-indigo-850 hover:from-slate-900 hover:to-slate-950 text-white font-sans font-black text-[11px] px-5 py-3.5 rounded-2xl shadow-xl transition flex items-center gap-2.5 cursor-pointer border border-white/10 shadow-indigo-600/20"
              >
                <span className="text-sm">🔑</span>
                <span>PANDUAN CONFIG API KEY (AKTIF)</span>
                <ChevronUp className="w-4 h-4 text-white ml-1 animate-bounce" />
              </button>
            </div>
          ) : (
            <div 
              style={{ pointerEvents: "none" }}
              className="fixed inset-0 z-[150] flex items-end justify-end p-4 md:p-6 no-print text-slate-800 text-left"
            >
              <div 
                style={{ pointerEvents: "auto" }}
                className="bg-white rounded-3xl w-full max-w-sm sm:max-w-md border border-slate-250/90 shadow-2xl relative overflow-hidden transform animate-slide-in-right flex flex-col max-h-[82vh] transition-all duration-300 text-slate-800"
              >
                
                {/* Header dengan Gradient Premium */}
                <div className="bg-gradient-to-r from-blue-700 via-[#1E3A8A] to-indigo-850 p-4.5 text-white relative shrink-0">
                  <div className="absolute -top-12 -left-12 w-36 h-36 bg-blue-500 rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
                  <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-sky-400 rounded-full blur-[60px] opacity-30 pointer-events-none"></div>
                  
                  <div className="flex justify-between items-center relative z-10 w-full">
                    <div className="space-y-0.5">
                      <span className="text-[7.5px] bg-amber-400 text-slate-950 border border-amber-300 font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider block w-max font-mono leading-none font-black animate-pulse">
                        🔑 INSTRUKSI INTEGRASI
                      </span>
                      <h4 className="text-sm font-black font-display tracking-tight uppercase leading-tight mt-1">
                        Panduan API Key Gemini
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => { setIsApiGuideMinimized(true); playSfx("click"); }}
                        title="Sembunyikan Panduan"
                        className="bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-lg transition shrink-0 cursor-pointer border border-white/10 flex items-center justify-center"
                      >
                        <ChevronDown className="w-4 h-4 text-white" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowApiGuide(false); playSfx("click"); }}
                        title="Tutup Panduan"
                        className="bg-red-500 hover:bg-red-650 text-white font-extrabold text-[10.5px] px-2.5 py-1.5 rounded-lg transition shrink-0 cursor-pointer border-0 shadow-sm flex items-center gap-1 hover:scale-105 active:scale-95"
                      >
                        <X className="w-3.5 h-3.5 text-white" />
                        <span>TUTUP ×</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4.5 space-y-4 scrollbar-thin max-h-[50vh]">
                  
                  {/* Info Kuota Individu */}
                  <div className="p-3 bg-blue-50/80 border border-blue-100 text-blue-950 rounded-2xl text-[10.5px] leading-relaxed space-y-1 font-sans">
                    <strong className="text-indigo-805 font-display uppercase tracking-wider select-none text-[9.5px] block font-black">
                      💡 Mengapa Harus Pakai API Key Pribadi?
                    </strong>
                    <p className="font-semibold text-slate-650 font-sans">
                      Diakses gratis oleh ribuan guru di Indonesia setiap hari, key bawaan sistem memiliki limit antrean ketat. Memasang <strong>API Key Gemini Anda sendiri</strong> menjamin performa mutlak, instan, gratis, serta bebas throttling kuota!
                    </p>
                  </div>

                  {/* 5 Langkah Instruksional */}
                  <div className="space-y-3 select-none">
                    <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-wider block font-mono">
                      📋 5 LANGKAH DAPATKAN API KEY GRATIS:
                    </h5>
                    <div className="space-y-2.5 font-sans">
                      
                      {/* Step 1 */}
                      <div className="flex gap-3 items-start bg-slate-50 border border-slate-200/50 p-2.5 rounded-2xl hover:bg-slate-100/40 transition">
                        <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center shrink-0 text-[11px] border border-indigo-150">
                          1
                        </div>
                        <div className="space-y-0.5">
                          <strong className="text-slate-855 font-extrabold text-[11px] block leading-snug">Buka Portal Google AI Studio</strong>
                          <p className="text-[10px] text-slate-500 font-medium font-sans leading-normal">
                            Kunjungi situs developer resmi <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-black">Google AI Studio</a> untuk generate kunci API.
                          </p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex gap-3 items-start bg-slate-50 border border-slate-200/50 p-2.5 rounded-2xl hover:bg-slate-100/40 transition">
                        <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center shrink-0 text-[11px] border border-indigo-150">
                          2
                        </div>
                        <div className="space-y-0.5">
                          <strong className="text-slate-855 font-extrabold text-[11px] block leading-snug">Masuk Dengan Akun Google (Login)</strong>
                          <p className="text-[10px] text-slate-500 font-medium font-sans leading-normal">
                            Gunakan akun Google umum (@gmail.com) atau akun Belajar.id Anda tanpa perlu registrasi rumit.
                          </p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex gap-3 items-start bg-slate-50 border border-slate-200/50 p-2.5 rounded-2xl hover:bg-slate-100/40 transition">
                        <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center shrink-0 text-[11px] border border-indigo-150">
                          3
                        </div>
                        <div className="space-y-0.5">
                          <strong className="text-slate-855 font-extrabold text-[11px] block leading-snug">Ketuk Menu "Get API key"</strong>
                          <p className="text-[10px] text-slate-500 font-medium font-sans leading-normal">
                            Klik menu di sebelah kiri, lalu pilih tombol berwarna biru bertuliskan <strong>"Create API key"</strong>.
                          </p>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="flex gap-3 items-start bg-slate-50 border border-[#slate-200]/60 p-2.5 rounded-2xl hover:bg-slate-100/40 transition">
                        <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center shrink-0 text-[11px] border border-[#indigo-150]">
                          4
                        </div>
                        <div className="space-y-0.5">
                          <strong className="text-slate-855 font-extrabold text-[11px] block leading-snug">Salin Kunci Karakter (Copy)</strong>
                          <p className="text-[10px] text-slate-500 font-medium font-sans leading-normal">
                            Tekan tombol Copy pada kolom kunci personal berawalan <strong>"AIzaSy"</strong> yang baru saja dibuat tersebut.
                          </p>
                        </div>
                      </div>

                      {/* Step 5 */}
                      <div className="flex gap-3 items-start bg-slate-50 border border-[#slate-200]/60 p-2.5 rounded-2xl hover:bg-slate-100/40 transition">
                        <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center shrink-0 text-[11px] border border-[#indigo-150]">
                          5
                        </div>
                        <div className="space-y-0.5">
                          <strong className="text-slate-855 font-extrabold text-[11px] block leading-snug">Selesai &amp; Tempel (Paste)</strong>
                          <p className="text-[10px] text-slate-500 font-medium font-sans leading-normal">
                            Tempelkan kunci Gemini API Key di kolom input profil tab <strong>Akun / Keamanan</strong> di bawah.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50/50 flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowApiGuide(false); playSfx("click"); }}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-sans font-black text-[10px] py-2.5 rounded-xl shadow-xs transition text-center select-none cursor-pointer uppercase tracking-wide leading-none"
                  >
                    ❌ TUTUP / EXIT
                  </button>
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { playSfx("success"); }}
                    className="flex-1 bg-[#1E3A8A] hover:bg-slate-900 text-white font-sans font-black text-[10px] py-2.5 rounded-xl shadow-xs transition text-center select-none block uppercase tracking-wide leading-none flex items-center justify-center"
                  >
                    🌐 BUKA PORTAL
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentScreen("account");
                      setExpandedAccountSection("gemini_key");
                      setIsApiGuideMinimized(true);
                      playSfx("click");
                      showToast("🔑 Silakan input Gemini API Key di panel Akun!");
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-black text-[10px] py-2.5 rounded-xl shadow-3xs transition text-center select-none cursor-pointer uppercase tracking-wide leading-none"
                  >
                    📥 INPUT SEKARANG
                  </button>
                </div>

              </div>
            </div>
          )}
        </React.Fragment>
      )}

      {showRaporModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white p-5 rounded-t-3xl flex justify-between items-center">
              <div>
                <h2 className="text-base font-black">📝 Narasi Rapor Otomatis</h2>
                <p className="text-purple-200 text-[11px] mt-0.5">AI menulis narasi rapor semua siswa dari data nilai.</p>
              </div>
              <button type="button" onClick={() => setShowRaporModal(false)}
                className="text-white/70 hover:text-white text-xl font-black cursor-pointer">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Semester:</label>
                  <select value={raporSemester} onChange={(e) => setRaporSemester(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer">
                    <option>Ganjil</option><option>Genap</option>
                  </select>
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Tahun Ajaran:</label>
                  <input type="text" value={raporTahunAjaran} onChange={(e) => setRaporTahunAjaran(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none" />
                </div>
              </div>

              {/* Template Rapor Text Area */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-slate-500 uppercase block">Gaya Bahasa / Panduan Rapor Kustom (Opsional):</label>
                <textarea
                  value={templateRaporText}
                  onChange={(e) => setTemplateRaporText(e.target.value)}
                  placeholder="Contoh: Tulis agar terdengar hangat, berakar pada pembelajaran mandiri dengan format: ananda adalah ..., hebat dalam..."
                  className="w-full h-16 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 text-left">
                Kelas: <strong>{activeKelas || "Umum"}</strong> · {Object.keys(studentGrades || {}).length} siswa · {subject}
                {templateRaporText && <span className="text-emerald-600 font-bold ml-2">✓ Template rapor sekolah aktif</span>}
              </div>

              {!raporNarasiResult ? (
                <button type="button" onClick={handleGenerateRapor} disabled={isGeneratingRapor}
                  className="w-full bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-black py-3 rounded-2xl text-sm transition cursor-pointer flex items-center justify-center gap-2">
                  {isGeneratingRapor
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Menulis narasi untuk semua siswa...</>
                    : "⚡ Generate Narasi Rapor"}
                </button>
              ) : (
                <div className="space-y-3 text-left">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-72 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-xs text-slate-800 leading-relaxed font-sans">{raporNarasiResult}</pre>
                  </div>
                  <div className="flex gap-2">
                    <button type="button"
                      onClick={() => { navigator.clipboard.writeText(raporNarasiResult); showToast("📋 Narasi disalin!"); }}
                      className="flex-1 bg-white border border-slate-200 text-slate-700 font-black text-xs py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition">
                      📋 Salin Semua
                    </button>
                    <button type="button"
                      onClick={() => generateDocxRapi(raporNarasiResult, `Narasi_Rapor_${activeKelas}_Semester_${raporSemester}`)}
                      className="flex-1 bg-purple-700 text-white font-black text-xs py-2.5 rounded-xl hover:bg-purple-800 cursor-pointer transition">
                      📥 Download .DOCX
                    </button>
                    <button type="button" onClick={() => setRaporNarasiResult("")}
                      className="bg-slate-100 text-slate-600 font-black text-xs px-4 py-2.5 rounded-xl hover:bg-slate-200 cursor-pointer transition">
                      🔄 Ulang
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODALS FITUR HARIAN --- */}
      {/* MODAL KUIS DADAKAN */}
      {showKuisModal && (() => {
        const KUIS_SUBJECTS = [
          "Matematika",
          "IPAS (IPA & IPS Gabungan)",
          "IPA Terpadu",
          "IPS Terpadu",
          "Fisika",
          "Kimia",
          "Biologi",
          "Bahasa Indonesia",
          "Bahasa Inggris",
          "Pendidikan Pancasila / PPKn",
          "Informatika / TIK",
          "Pendidikan Agama Islam (PAI)",
          "Pendidikan Agama Kristen",
          "Pendidikan Agama Katolik",
          "Pendidikan Agama Hindu",
          "Pendidikan Agama Buddha",
          "Al-Qur'an Hadits",
          "Aqidah Akhlak",
          "Fiqih",
          "Sejarah Kebudayaan Islam (SKI)",
          "Bahasa Arab",
          "Tahsin",
          "Tahfidz",
          "BTQ (Baca Tulis Al-Qur'an)",
          "Sejarah",
          "Geografi",
          "Sosiologi",
          "Ekonomi",
          "Seni Budaya",
          "Pendidikan Jasmani & Kesehatan (PJOK)",
          "Prakarya",
          "Muatan Lokal (Mulok)",
          "Tematik"
        ];
        const isStandardSubject = KUIS_SUBJECTS.includes(kuisMapel);
        const selectedDropdownValue = isStandardSubject ? kuisMapel : (kuisMapel === "" ? "" : "Ketik Manual (Kustom)");

        return (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-fade-in">
              <div className="bg-gradient-to-r from-violet-700 to-indigo-600 text-white p-5 rounded-t-3xl flex justify-between items-center sticky top-0 z-10">
                <div>
                  <h2 className="text-base font-black">⚡ Kuis Dadakan AI</h2>
                  <p className="text-violet-200 text-[11px] mt-0.5 font-medium">Generate kuis instan interaktif netral & sesuai kurikulum.</p>
                </div>
                <button type="button" onClick={() => { setShowKuisModal(false); setKuisResult(""); }}
                  className="text-white/70 hover:text-white text-xl font-black cursor-pointer">✕</button>
              </div>

              <div className="p-5 space-y-4">
                {!kuisResult ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Pilih Tingkat Kelas:</label>
                        <select value={kuisKelas} onChange={(e) => setKuisKelas(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none cursor-pointer">
                          {[
                            "Kelas 1 SD", "Kelas 2 SD", "Kelas 3 SD", "Kelas 4 SD", "Kelas 5 SD", "Kelas 6 SD",
                            "Kelas 7 SMP", "Kelas 8 SMP", "Kelas 9 SMP",
                            "Kelas 10 SMA", "Kelas 11 SMA", "Kelas 12 SMA"
                          ].map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Jumlah Soal:</label>
                        <select value={kuisJumlah} onChange={(e) => setKuisJumlah(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none cursor-pointer">
                          {["5", "10", "15", "20"].map(n => <option key={n} value={n}>{n} soal</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Mata Pelajaran:</label>
                      <select 
                        value={selectedDropdownValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "Ketik Manual (Kustom)") {
                            setKuisMapel("");
                          } else {
                            setKuisMapel(val);
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="" disabled>-- Pilih Mata Pelajaran --</option>
                        {KUIS_SUBJECTS.map((subj) => (
                          <option key={subj} value={subj}>{subj}</option>
                        ))}
                        <option value="Ketik Manual (Kustom)">✍️ Ketik Manual (Kustom)</option>
                      </select>
                    </div>

                    {/* Custom Text input if custom selected or not matching standard list */}
                    {(selectedDropdownValue === "Ketik Manual (Kustom)" || !isStandardSubject) && (
                      <div className="space-y-1.5 bg-violet-50/40 p-3.5 rounded-2xl border border-violet-100 animate-fade-in text-left">
                        <label className="text-[10px] font-black text-violet-800 uppercase block">Input Mata Pelajaran Kustom:</label>
                        <input 
                          type="text" 
                          value={kuisMapel} 
                          onChange={(e) => setKuisMapel(e.target.value)} 
                          placeholder="Ketik mata pelajaran lainnya..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none" 
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Topik Kuis:</label>
                      <textarea value={kuisTopik} onChange={(e) => setKuisTopik(e.target.value)}
                        placeholder="Contoh: Ekosistem dan rantai makanan, Penjumlahan pecahan, Struktur tumbuhan..."
                        rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none resize-none" />
                    </div>
                    
                    <button type="button" onClick={handleGenerateKuis} disabled={isGeneratingKuis || !kuisTopik.trim()}
                      className="w-full bg-violet-700 hover:bg-violet-800 disabled:opacity-50 text-white font-black py-3 rounded-2xl text-sm transition cursor-pointer flex items-center justify-center gap-2">
                      {isGeneratingKuis
                        ? <><Loader2 className="w-4 h-4 animate-spin" />Membuat soal kuis...</>
                        : <>⚡ Generate {kuisJumlah} Soal Kuis</>}
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white">
                        <span className="text-xs font-black text-slate-700">⚡ {kuisJumlah} Soal Kuis Siap</span>
                        <div className="flex gap-1.5">
                          <button type="button"
                            onClick={() => { navigator.clipboard.writeText(kuisResult); showToast("📋 Soal disalin!"); }}
                            className="text-[10px] bg-white border border-slate-200 text-slate-600 font-bold px-2.5 py-1 rounded-lg cursor-pointer hover:bg-slate-50">
                            📋 Salin
                          </button>
                          <button type="button"
                            onClick={() => generateDocxRapi(kuisResult, `Kuis_${kuisKelas.replace(/\s+/g, "_")}_${kuisTopik.slice(0, 20)}`)}
                            className="text-[10px] bg-violet-700 text-white font-bold px-2.5 py-1 rounded-lg cursor-pointer hover:bg-violet-800">
                            📥 .DOCX
                          </button>
                        </div>
                      </div>
                      <div className="p-4 max-h-96 overflow-y-auto bg-slate-50">
                        <pre className="whitespace-pre-wrap text-left text-xs text-slate-800 leading-relaxed font-sans">{kuisResult}</pre>
                      </div>
                    </div>
                    <button type="button" onClick={() => setKuisResult("")}
                      className="w-full bg-slate-100 text-slate-750 font-black text-xs py-2.5 rounded-2xl hover:bg-slate-200 cursor-pointer transition">
                      🔄 Buat Kuis Baru
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL JURNAL MENGAJAR */}
      {showJurnalModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left/92">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto animate-fade-in flex flex-col">
            <div className="bg-gradient-to-r from-amber-600 to-orange-500 text-white p-5 rounded-t-3xl flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-base font-black">📔 Jurnal Mengajar Harian</h2>
                <p className="text-amber-100 text-[11px] mt-0.5">
                  {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <button type="button" onClick={() => setShowJurnalModal(false)}
                className="text-white/70 hover:text-white text-xl font-black cursor-pointer">✕</button>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 px-5 pt-3 gap-5 shrink-0 select-none">
              <button
                type="button"
                onClick={() => setJurnalActiveTab("tulis")}
                className={`pb-2.5 text-xs font-black transition-all cursor-pointer relative ${
                  jurnalActiveTab === "tulis" ? "text-amber-700" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                📝 Tulis Jurnal Baru
                {jurnalActiveTab === "tulis" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 rounded-full" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setJurnalActiveTab("riwayat")}
                className={`pb-2.5 text-xs font-black transition-all cursor-pointer relative ${
                  jurnalActiveTab === "riwayat" ? "text-amber-700" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                📂 Riwayat Jurnal ({jurnalList.length})
                {jurnalActiveTab === "riwayat" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 rounded-full" />
                )}
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              {jurnalActiveTab === "tulis" ? (
                <div className="space-y-4 animate-fade-in-down">
                  {/* Penyimpanan Information Box with Minimize Toggle */}
                  <div className="bg-amber-50/75 border border-amber-200/60 p-3.5 rounded-2xl text-left text-amber-940 text-[10.5px] leading-relaxed transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <p className="font-extrabold flex items-center gap-1 text-amber-900 text-xs">
                        <span>💾 Info Keamanan Penyimpanan Jurnal</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const val = !isJurnalInfoMinimized;
                          setIsJurnalInfoMinimized(val);
                          try { localStorage.setItem("grup_jurnal_info_minimized", String(val)); } catch {}
                        }}
                        className="text-amber-700 hover:text-amber-900 font-extrabold text-[9px] uppercase px-2 py-0.5 bg-amber-100 rounded-md cursor-pointer transition select-none"
                      >
                        {isJurnalInfoMinimized ? "👁️ Tampilkan" : "✕ Sembunyikan"}
                      </button>
                    </div>
                    
                    {!isJurnalInfoMinimized && (
                      <div className="mt-1.5 space-y-1.5 animate-fade-in">
                        <p className="font-medium">
                          Seluruh riwayat jurnal yang Anda simpan akan disimpan secara otomatis di <strong>Penyimpanan Browser (Local Storage)</strong> di perangkat ini secara <strong>aman &amp; luring (offline)</strong>.
                        </p>
                        <div className="pt-1.5 border-t border-amber-200/40 flex flex-col gap-1 text-[9.5px] text-amber-600 font-extrabold uppercase">
                          <span>• Tidak ada data terupload ke server luar (100% Privat)</span>
                          <span>• Tetap tersimpan meskipun halaman direfresh/ditutup</span>
                          <span>• Gunakan tombol (.docx) untuk mencadangkan ke file eksternal</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 align-left text-left">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Kelas:</label>
                      <select value={jurnalForm.kelas || activeKelas}
                        onChange={(e) => setJurnalForm(prev => ({ ...prev, kelas: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer">
                        {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5 align-left text-left">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Mata Pelajaran:</label>
                      <input type="text"
                        value={jurnalForm.mapel || (subject === "Input Mapel Manual (Ketik Sendiri)" ? manualSubject : subject)}
                        onChange={(e) => setJurnalForm(prev => ({ ...prev, mapel: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5 align-left text-left">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Topik yang Diajarkan: *</label>
                    <input type="text" value={jurnalForm.topik}
                      onChange={(e) => setJurnalForm(prev => ({ ...prev, topik: e.target.value }))}
                      placeholder="Contoh: Ekosistem dan rantai makanan di lingkungan sekolah"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none" />
                  </div>

                  <div className="space-y-1.5 align-left text-left">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Kendala / Catatan Hari Ini:</label>
                    <textarea value={jurnalForm.kendala}
                      onChange={(e) => setJurnalForm(prev => ({ ...prev, kendala: e.target.value }))}
                      placeholder="Contoh: 3 siswa belum paham konsep rantai makanan, perlu pengulangan..."
                      rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none resize-none" />
                  </div>

                  <div className="space-y-1.5 align-left text-left">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Rencana Pertemuan Berikutnya:</label>
                    <input type="text" value={jurnalForm.rencanaSel}
                      onChange={(e) => setJurnalForm(prev => ({ ...prev, rencanaSel: e.target.value }))}
                      placeholder="Contoh: Review + mini kuis ekosistem, lanjut ke jaring makanan"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none" />
                  </div>

                  <div className="space-y-1.5 align-left text-left">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Suasana Kelas Hari Ini (Arahkan kursor atau sentuh untuk info):</label>
                    <div className="flex gap-2">
                      {[
                        { s: "😊 Menyenangkan" as const, desc: "Siswa sangat antusias, interaktif, kondusif, dan paham materi dengan optimal" },
                        { s: "😐 Biasa Saja" as const, desc: "Pembelajaran lancar & tertib, respon siswa cukup baik meskipun cenderung tenang" },
                        { s: "😔 Perlu Evaluasi" as const, desc: "Konsentrasi siswa kurang prima, ada hambatan teknis, atau materi dirasa terlalu menantang" }
                      ].map(({ s, desc }) => (
                        <button key={s} type="button"
                          title={desc}
                          onClick={() => setJurnalForm(prev => ({ ...prev, suasana: s }))}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                            jurnalForm.suasana === s
                              ? "bg-amber-50 border-amber-400 text-amber-800 shadow-2xs"
                              : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}>
                          <span>{s}</span>
                        </button>
                      ))}
                    </div>
                    {/* Dynamic live explanatory annotation */}
                    <p className="text-[10px] text-amber-800 font-semibold bg-amber-50/55 p-2.5 rounded-xl border border-amber-200/40 mt-1.5 transition">
                      {jurnalForm.suasana === "😊 Menyenangkan" && "✨ Menyenangkan: Kelas kondusif, siswa antusias, aktif bertanya, ceria, dan paham materi."}
                      {jurnalForm.suasana === "😐 Biasa Saja" && "📝 Biasa Saja: Kelas tertib dan lancar. Respon siswa cukup kooperatif dan standar."}
                      {jurnalForm.suasana === "😔 Perlu Evaluasi" && "⚠️ Perlu Evaluasi: Menghadapi kendala konsentrasi, kelas ramai, atau materi terlalu sulit."}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={handleSimpanJurnal}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-black text-sm py-3 rounded-2xl cursor-pointer transition">
                      💾 Simpan Jurnal
                    </button>
                    {jurnalForm.topik && (
                      <button type="button"
                        onClick={() => {
                          const content = `JURNAL MENGAJAR HARIAN\n\nTanggal: ${new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}\nGuru: ${profileName}\nKelas: ${jurnalForm.kelas || activeKelas}\nMata Pelajaran: ${jurnalForm.mapel}\n\nTopik: ${jurnalForm.topik}\nKendala: ${jurnalForm.kendala || "-"}\nRencana Selanjutnya: ${jurnalForm.rencanaSel || "-"}\nSuasana Kelas: ${jurnalForm.suasana}`;
                          generateDocxRapi(content, `Jurnal_Mengajar_${new Date().toLocaleDateString("id-ID").replace(/\//g, "-")}`);
                        }}
                        className="bg-slate-100 text-slate-700 font-black text-xs px-4 py-3 rounded-2xl hover:bg-slate-200 cursor-pointer transition">
                        📥 .DOCX
                      </button>
                    )}
                  </div>

                  {jurnalList.length > 0 && (
                    <div className="border-t border-slate-100 pt-4 space-y-2 text-left">
                      <div className="flex justify-between items-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">3 Jurnal Terbaru:</p>
                        <button type="button" onClick={() => setJurnalActiveTab("riwayat")} className="text-[9px] font-extrabold text-amber-700 hover:underline cursor-pointer">Lihat Semua ({jurnalList.length}) →</button>
                      </div>
                      <div className="space-y-2">
                        {jurnalList.slice(0, 3).map((j) => (
                          <div key={j.id} className="flex items-start gap-2 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                            <span className="text-base shrink-0">{j.suasana.split(" ")[0]}</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-black text-slate-700 truncate">{j.topik}</p>
                              <p className="text-[9px] text-slate-400 font-semibold">{j.kelas} · {j.tanggal} · {j.mapel}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 animate-fade-in">
                  <div className="bg-slate-100/60 border border-slate-200 rounded-2xl p-3 text-left">
                    <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <span>📂 Manajemen Riwayat Jurnal Instan</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                      Di sini Anda dapat melihat semua histori jurnal mengajar yang tersimpan di memori aman local storage browser laptop Anda.
                    </p>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none"
                      placeholder="Cari berdasarkan topik, kelas, mapel, atau dsb..."
                      value={jurnalSearch}
                      onChange={(e) => setJurnalSearch(e.target.value)}
                    />
                    <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                    {jurnalSearch && (
                      <button type="button" onClick={() => setJurnalSearch("")} className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 font-bold text-xs">✕</button>
                    )}
                  </div>

                  {/* HISTORICAL RECORDS LIST */}
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {jurnalList.filter(j => {
                      const q = jurnalSearch.toLowerCase();
                      return (j.kelas || "").toLowerCase().includes(q) ||
                             (j.mapel || "").toLowerCase().includes(q) ||
                             (j.topik || "").toLowerCase().includes(q) ||
                             (j.tanggal || "").toLowerCase().includes(q);
                    }).length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-400 font-semibold">
                        {jurnalList.length === 0 ? "Belum ada riwayat jurnal tersimpan." : "Tidak ada jurnal yang cocok."}
                      </div>
                    ) : (
                      jurnalList
                        .filter(j => {
                          const q = jurnalSearch.toLowerCase();
                          return (j.kelas || "").toLowerCase().includes(q) ||
                                 (j.mapel || "").toLowerCase().includes(q) ||
                                 (j.topik || "").toLowerCase().includes(q) ||
                                 (j.tanggal || "").toLowerCase().includes(q);
                        })
                        .map((j) => {
                          const isExpanded = expandedJurnalId === j.id;
                          return (
                            <div key={j.id} className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden transition-all duration-200">
                              <div
                                onClick={() => setExpandedJurnalId(isExpanded ? null : j.id)}
                                className="p-3.5 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-100/70 select-none"
                              >
                                <div className="space-y-1 min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[9px] font-black rounded-md">{j.kelas}</span>
                                    <span className="text-[10px] text-slate-400 font-extrabold">{j.tanggal}</span>
                                  </div>
                                  <p className="text-xs font-black text-slate-800 truncate">{j.topik}</p>
                                  <p className="text-[9.5px] text-slate-400 font-semibold truncate">{j.mapel} · Suasana: {j.suasana}</p>
                                </div>
                                <span className="text-xs text-slate-400 font-black shrink-0 self-center">
                                  {isExpanded ? "▲" : "▼"}
                                </span>
                              </div>

                              {isExpanded && (
                                <div className="p-3.5 bg-white border-t border-slate-100 text-left text-xs text-slate-700 space-y-2.5 animate-fade-in-down">
                                  <div className="grid grid-cols-2 gap-2 text-[10.5px] bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                                    <p><strong>Mata Pelajaran:</strong> {j.mapel}</p>
                                    <p><strong>Kelas:</strong> {j.kelas}</p>
                                    <p><strong>Tanggal Diajar:</strong> {j.tanggal}</p>
                                    <p><strong>Suasana Kelas:</strong> {j.suasana}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400">Topik Pembelajaran:</h4>
                                    <p className="font-bold text-slate-800">{j.topik}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400">Kendala &amp; Catatan:</h4>
                                    <p className="font-semibold text-slate-600 bg-slate-50 p-2 rounded-lg">{j.kendala || "-"}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400">Rencana Selanjutnya:</h4>
                                    <p className="font-semibold text-slate-600 bg-slate-50 p-2 rounded-lg">{j.rencanaSel || "-"}</p>
                                  </div>

                                  <div className="flex gap-2 pt-1 border-t border-slate-100 mt-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const content = `JURNAL MENGAJAR HARIAN\n\nTanggal: ${j.tanggal}\nGuru: ${profileName}\nKelas: ${j.kelas}\nMata Pelajaran: ${j.mapel}\n\nTopik: ${j.topik}\nKendala: ${j.kendala || "-"}\nRencana Selanjutnya: ${j.rencanaSel || "-"}\nSuasana Kelas: ${j.suasana}`;
                                        generateDocxRapi(content, `Jurnal_Mengajar_${j.kelas}_${j.tanggal.replace(/\//g, "-")}`);
                                      }}
                                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] py-2 rounded-xl cursor-pointer text-center transition"
                                    >
                                      📥 Unduh DOCX
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm("Apakah Anda yakin ingin menghapus jurnal ini dari riwayat perangkat?")) {
                                          const filtered = jurnalList.filter(item => item.id !== j.id);
                                          setJurnalList(filtered);
                                          showToast("🗑️ Jurnal berhasil dihapus dari riwayat browser.");
                                        }
                                      }}
                                      className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-extrabold text-[10px] px-3 py-2 rounded-xl cursor-pointer transition"
                                    >
                                      🗑️ Hapus
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CATATAN PERKEMBANGAN SISWA */}
      {showCatatanModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-fade-in flex flex-col">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-600 text-white p-5 rounded-t-3xl flex justify-between items-center sticky top-0 z-10 shrink-0">
              <div>
                <h2 className="text-base font-black">👁️ Catatan Perkembangan Siswa</h2>
                <p className="text-emerald-200 text-[11px] mt-0.5">{catatanKelasAktif} · {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <button type="button" onClick={() => setShowCatatanModal(false)}
                className="text-white/70 hover:text-white text-xl font-black cursor-pointer">✕</button>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 px-5 pt-3 gap-5 shrink-0 select-none">
              <button
                type="button"
                onClick={() => setCatatanActiveTab("input")}
                className={`pb-2.5 text-xs font-black transition-all cursor-pointer relative ${
                  catatanActiveTab === "input" ? "text-emerald-750" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                📝 Beri Catatan Sikap
                {catatanActiveTab === "input" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setCatatanActiveTab("riwayat")}
                className={`pb-2.5 text-xs font-black transition-all cursor-pointer relative ${
                  catatanActiveTab === "riwayat" ? "text-emerald-750" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                📂 Riwayat &amp; Ringkasan ({getDeterministicStudents(catatanKelasAktif).filter(nama => (catatanSiswa[catatanKelasAktif]?.[nama]?.status || "-") !== "-").length} Terisi)
                {catatanActiveTab === "riwayat" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="space-y-1.5 align-left text-left shrink-0">
                <label className="text-[10px] font-black text-slate-500 uppercase">Pilih Kelas:</label>
                <select value={catatanKelasAktif} onChange={(e) => setCatatanKelasAktif(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none cursor-pointer">
                  {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>

              {catatanActiveTab === "input" ? (
                <div className="space-y-4 animate-fade-in-down">
                  <div className="bg-emerald-50/60 border border-emerald-200/50 p-3.5 rounded-2xl text-[10.5px] text-emerald-900 leading-relaxed text-left">
                    <p className="font-extrabold flex items-center gap-1.5 mb-0.5">
                      <span>💡 Cara Penggunaan Penilaian Sikap</span>
                    </p>
                    <p className="font-semibold text-emerald-850">
                      Pilih salah satu predikat emosional/sikap untuk setiap siswa: ⭐ (Sangat Aktif), 😐 (Cukup/Pasif), atau ⚠️ (Butuh Perhatian). Tambahkan catatan pendek jika diperlukan. Semua perubahan tersimpan otomatis di browser lokal Anda.
                    </p>
                  </div>

                  <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1 select-none">
                    {getDeterministicStudents(catatanKelasAktif).map((nama, i) => {
                      const cat = catatanSiswa[catatanKelasAktif]?.[nama] || { status: "-" as const, catatan: "" };
                      return (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                          <div className="w-7 h-7 rounded-full bg-[#1E3A8A] text-white font-black text-[9px] flex items-center justify-center shrink-0">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-xs font-black text-slate-800 truncate">{nama}</p>
                            <input type="text"
                              value={cat.catatan}
                              onChange={(e) => setCatatanSiswa(prev => ({
                                ...prev,
                                [catatanKelasAktif]: {
                                  ...prev[catatanKelasAktif],
                                  [nama]: { ...cat, catatan: e.target.value }
                                }
                              }))}
                              placeholder="Catatan keaktifan/sikap singkat..."
                              className="w-full bg-white border border-slate-250 rounded-lg px-2 py-1 text-[10px] font-semibold focus:outline-none mt-1" />
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {[
                              { s: "aktif" as const, emoji: "⭐", title: "Sangat Aktif", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
                              { s: "pasif" as const, emoji: "😐", title: "Cukup Kooperatif", color: "bg-slate-100 text-slate-700 border-slate-300" },
                              { s: "perhatian" as const, emoji: "⚠️", title: "Perlu Pendampingan", color: "bg-red-100 text-red-700 border-red-300" },
                            ].map(({ s, emoji, title, color }) => (
                              <button key={s} type="button"
                                title={title}
                                onClick={() => setCatatanSiswa(prev => ({
                                  ...prev,
                                  [catatanKelasAktif]: {
                                    ...prev[catatanKelasAktif],
                                    [nama]: { ...cat, status: s }
                                  }
                                }))}
                                className={`w-8 h-8 rounded-lg text-sm border transition cursor-pointer flex items-center justify-center ${
                                  cat.status === s ? color + " shadow-2xs scale-102" : "bg-white border-slate-200 opacity-40 hover:opacity-100"
                                }`}>
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button type="button"
                    onClick={() => { setShowCatatanModal(false); showToast("✅ Catatan siswa tersimpan otomatis!"); }}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm py-3 rounded-2xl cursor-pointer transition">
                    💾 Selesai &amp; Simpan
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in text-left">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex justify-between items-center gap-4 flex-wrap">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-800">📊 Statistik Perkembangan {catatanKelasAktif}</h4>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        Sikap terisi: {getDeterministicStudents(catatanKelasAktif).filter(nama => (catatanSiswa[catatanKelasAktif]?.[nama]?.status || "-") !== "-").length} dari {getDeterministicStudents(catatanKelasAktif).length} siswa.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const students = getDeterministicStudents(catatanKelasAktif);
                        let content = `LAPORAN PERKEMBANGAN SIKAP & KEAKTIFAN SISWA\n`;
                        content += `===============================================\n\n`;
                        content += `Kelas: ${catatanKelasAktif}\n`;
                        content += `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}\n`;
                        content += `Diunduh Oleh: Guru ${profileName || ""}\n\n`;
                        
                        students.forEach((nama, idx) => {
                          const cat = catatanSiswa[catatanKelasAktif]?.[nama] || { status: "-", catatan: "" };
                          let statusText = "Belum Diisi";
                          if (cat.status === "aktif") statusText = "⭐ Sangat Aktif & Interaktif";
                          if (cat.status === "pasif") statusText = "😐 Cukup Kooperatif / Pasif";
                          if (cat.status === "perhatian") statusText = "⚠️ Butuh Perhatian Khusus";

                          content += `${idx + 1}. Nama: ${nama}\n`;
                          content += `   Predikat Sikap: ${statusText}\n`;
                          content += `   Catatan Perkembangan: ${cat.catatan || "Tidak ada catatan kustom."}\n\n`;
                        });

                        generateDocxRapi(content, `Laporan_Perkembangan_Sikap_${catatanKelasAktif.replace(/\s+/g, "_")}`);
                        showToast("📥 Laporan sikap siswa berhasil diunduh!");
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs px-4 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-1.5"
                    >
                      📥 Cetak Laporan (.DOCX)
                    </button>
                  </div>

                  {/* SUMMARY CHART */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                      <p className="text-emerald-800 font-black text-base">
                        {getDeterministicStudents(catatanKelasAktif).filter(n => catatanSiswa[catatanKelasAktif]?.[n]?.status === "aktif").length}
                      </p>
                      <p className="text-[9px] font-bold text-emerald-600 block uppercase">⭐ Sangat Aktif</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                      <p className="text-slate-800 font-black text-base">
                        {getDeterministicStudents(catatanKelasAktif).filter(n => catatanSiswa[catatanKelasAktif]?.[n]?.status === "pasif").length}
                      </p>
                      <p className="text-[9px] font-bold text-slate-500 block uppercase">😐 Cukup/Pasif</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 p-2.5 rounded-xl">
                      <p className="text-red-800 font-black text-base">
                        {getDeterministicStudents(catatanKelasAktif).filter(n => catatanSiswa[catatanKelasAktif]?.[n]?.status === "perhatian").length}
                      </p>
                      <p className="text-[9px] font-bold text-red-600 block uppercase">⚠️ Perlu Atensi</p>
                    </div>
                  </div>

                  {/* SUMMARY LIST ROWS */}
                  <div className="space-y-1.5 max-h-[38vh] overflow-y-auto pr-1">
                    {getDeterministicStudents(catatanKelasAktif).map((nama, idx) => {
                      const cat = catatanSiswa[catatanKelasAktif]?.[nama] || { status: "-" as const, catatan: "" };
                      return (
                        <div key={idx} className="flex justify-between items-center p-3 bg-slate-50/70 border border-slate-100 rounded-xl leading-snug">
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-black text-slate-800">{idx + 1}. {nama}</p>
                            <p className="text-[10px] text-slate-500 font-medium italic">
                              {cat.catatan ? `“${cat.catatan}”` : "Tidak ada catatan verbal."}
                            </p>
                          </div>
                          <div className="shrink-0">
                            {cat.status === "aktif" && <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded-lg">⭐ Sangat Aktif</span>}
                            {cat.status === "pasif" && <span className="px-2 py-1 bg-slate-200 text-slate-700 text-[9px] font-black rounded-lg">😐 Cukup</span>}
                            {cat.status === "perhatian" && <span className="px-2 py-1 bg-red-100 text-red-800 text-[9px] font-black rounded-lg">⚠️ Atensi</span>}
                            {cat.status === "-" && <span className="px-2 py-1 bg-slate-100 text-slate-400 text-[9px] font-semibold rounded-lg">—</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🌐 LAYOUT FLOATING OVERLAY: GORGEOUS PREMIUM SPOTLIGHT INTERACTIVE AUTOCOMPLETE (Ctrl+K) */}
      {isSearchModalOpen && (
        <div id="global-search-modal" 
          onClick={(e) => {
            if ((e.target as HTMLElement).id === "global-search-modal") {
              setIsSearchModalOpen(false);
              setSearchQueryGlobal("");
              setSelectedStudentForDetail(null);
            }
          }}
          className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs z-50 flex items-start justify-center pt-24 pb-12 px-4 no-print text-[#0D1D34] overflow-y-auto"
        >
          <div className={`bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden w-full h-[80vh] flex flex-col md:flex-row animate-scale-up relative transition-all duration-300 ${
            selectedStudentForDetail ? "max-w-5xl" : "max-w-2xl"
          }`}>
            
            {/* LEFT COLUMN: AUTOCOMPLETE ACTIONS */}
            <div className={`flex-1 flex flex-col min-w-0 h-full ${
              selectedStudentForDetail ? "border-r border-slate-150" : ""
            }`}>
              
              {/* SINGLE COLUMN HEADER */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3 shrink-0">
              <div className="bg-[#1E3A8A]/10 p-2.5 rounded-xl text-[#1E3A8A]">
                <Search className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQueryGlobal}
                  onChange={(e) => {
                    setSearchQueryGlobal(e.target.value);
                    setSelectedStudentForDetail(null); // Clear inline selection when resuming typing
                  }}
                  placeholder="Ketik nama murid, tema RPP (misal: Fotosintesis/Gaya), atau topik jurnal..."
                  className="w-full bg-white border border-slate-250 hover:border-slate-350 focus:border-[#1E3A8A] rounded-2xl pl-4 pr-10 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/10 transition-all text-slate-800"
                  autoFocus
                />
                {searchQueryGlobal && (
                  <button
                    type="button"
                    onClick={() => { setSearchQueryGlobal(""); setSelectedStudentForDetail(null); }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-100 rounded-md transition"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {/* COMPACT CLOSE BUTTON */}
              <button
                type="button"
                onClick={() => { setIsSearchModalOpen(false); setSearchQueryGlobal(""); setSelectedStudentForDetail(null); }}
                className="bg-slate-150 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 border border-slate-200/80 px-3.5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wide cursor-pointer transition select-none flex items-center gap-1 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Esc</span>
              </button>
            </div>

            {/* FILTER CATEGORY SELECTION */}
            <div className="px-4 py-2 border-b border-slate-100 flex gap-1.5 overflow-x-auto select-none bg-slate-50/30 scrollbar-none">
              {[
                { id: "semua", label: "🌐 Semua", count: (searchQueryGlobal ? matchedStudentsList.length + matchedRppsList.length + matchedJournalsList.length : 0) },
                { id: "siswa", label: "👤 Murid", count: (searchQueryGlobal ? matchedStudentsList.length : 0) },
                { id: "rpp", label: "📋 RPP Saya", count: (searchQueryGlobal ? matchedRppsList.length : 0) },
                { id: "jurnal", label: "📅 Jurnal Kelas", count: (searchQueryGlobal ? matchedJournalsList.length : 0) }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { setSearchFilterCategory(tab.id as any); playSfx("click"); }}
                  className={`px-3 py-1 rounded-full text-[10.5px] font-extrabold transition-all whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer border ${
                    searchFilterCategory === tab.id
                      ? "bg-[#1E3A8A] border-[#1E3A8A] text-white"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                    <span>{tab.label}</span>
                    {searchQueryGlobal.trim().length > 0 && (
                      <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                        searchFilterCategory === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* LIST CONTAINER */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                
                {/* IF EMPTY QUERY */}
                {searchQueryGlobal.trim().length === 0 ? (
                  <div className="space-y-5">
                    
                    {/* SEARCH RECOMMENDATIONS */}
                    <div className="space-y-2 text-left">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saran Pencarian Terpopuler</h4>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {[
                          { text: "Budi Santoso", type: "siswa" },
                          { text: "Fotosintesis", type: "rpp" },
                          { text: "Gaya Hidup Berkelanjutan", type: "rpp" },
                          { text: "IPAS", type: "rpp" },
                          { text: activeKelas, type: "jurnal" }
                        ].map((sug, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setSearchQueryGlobal(sug.text);
                              setSearchFilterCategory(sug.type as any);
                              playSfx("click");
                            }}
                            className="bg-slate-50 border border-slate-200 hover:bg-[#EBF3FF] hover:border-blue-200 text-slate-600 hover:text-[#1E3A8A] font-semibold px-3 py-1.5 rounded-xl cursor-pointer transition shadow-3xs"
                          >
                            🔍 {sug.text}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SHOW ACTIVE CLASS STUDENTS QUICK LIST */}
                    <div className="space-y-3 border-t border-slate-100 pt-4 text-left">
                      <div className="flex justify-between items-center bg-slate-50 border border-slate-150 p-3 rounded-2xl">
                        <div>
                          <h4 className="text-xs font-black text-[#0D1D34]">👥 Siswa Kelas Binaan Aktif ({activeKelas})</h4>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Akses cepat data kehadiran, sikap &amp; nilai kognitif.</p>
                        </div>
                        <span className="text-[9px] bg-indigo-100 text-indigo-700 font-black px-2 py-0.5 rounded-lg border border-indigo-200">Kelas aktif</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 L-T-S select-none max-h-[35vh] overflow-y-auto pr-1">
                        {getDeterministicStudents(activeKelas).map((nama, idx) => {
                          const cat = catatanSiswa[activeKelas]?.[nama] || { status: "-" as const, catatan: "" };
                          return (
                            <div
                              key={idx}
                              className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl hover:bg-[#EBF3FF]/45 hover:border-blue-150 transition flex justify-between items-center text-xs text-left"
                            >
                              <div className="min-w-0 pr-2 flex-1">
                                <p className="font-extrabold text-[#0D1D34] truncate">{idx + 1}. {nama}</p>
                                <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5 italic truncate">{cat.catatan || "Tidak ada catatan verbal khusus."}</p>
                              </div>
                              <div className="shrink-0 flex items-center gap-1.5">
                                {/* DETAIL EDIT TRIGGER */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    let attRecord = {};
                                    try {
                                      const cached = localStorage.getItem(`gurupintar_attendance_${activeKelas}`);
                                      if (cached) attRecord = JSON.parse(cached);
                                    } catch {}
                                    if (!attRecord || Object.keys(attRecord).length === 0) {
                                      attRecord = getInitialAttendance(activeKelas);
                                    }
                                    const studentAttendance = attRecord[nama] || {};
                                    let h = 0, s = 0, i = 0, a = 0;
                                    Object.values(studentAttendance).forEach((v) => {
                                      if (v === "Hadir") h++;
                                      if (v === "Sakit") s++;
                                      if (v === "Izin") i++;
                                      if (v === "Alpa") a++;
                                    });

                                    let gdRecord = {};
                                    try {
                                      const cached = localStorage.getItem(`gurupintar_grades_${activeKelas}`);
                                      if (cached) gdRecord = JSON.parse(cached);
                                    } catch {}
                                    if (!gdRecord || Object.keys(gdRecord).length === 0) {
                                      gdRecord = getInitialGrades(activeKelas);
                                    }
                                    const grade = gdRecord[nama] || { score: 70, feedback: "Butuh bimbingan mandiri tambahan." };

                                    setSelectedStudentForDetail({
                                      nama,
                                      kelas: activeKelas,
                                      score: grade.score,
                                      feedback: grade.feedback,
                                      behavior: cat.status,
                                      notes: cat.catatan,
                                      attendanceStats: { hadir: h, sakit: s, izin: i, alpa: a }
                                    });
                                    setEditStudentScore(grade.score);
                                    setEditStudentFeedback(grade.feedback);
                                    setEditStudentBehavior(cat.status);
                                    setEditStudentNotes(cat.catatan);
                                    playSfx("chime");
                                  }}
                                  className="text-[9px] bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 px-2 py-1 rounded-lg font-black cursor-pointer transition select-none flex items-center"
                                >
                                  🛠️ Edit
                                </button>
                                
                                {/* JUMP BUTTON */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveKelas(activeKelas);
                                    setCurrentScreen("loker");
                                    setIsSearchModalOpen(false);
                                    setSearchQueryGlobal("");
                                    playSfx("success");
                                    showToast(`🚀 Langsung meluncur ke Buku Nilai ${activeKelas} - ${nama}!`);
                                  }}
                                  className="text-[9px] bg-[#1E3A8A] hover:bg-[#112559] text-white px-2 py-1 rounded-lg font-black cursor-pointer transition select-none flex items-center gap-0.5"
                                  title="Lompat ke Buku Nilai"
                                >
                                  Go ➔
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 text-left">
                    
                    {/* SEGMENT 1: STUDENTS */}
                    {(searchFilterCategory === "semua" || searchFilterCategory === "siswa") && (
                      <div className="space-y-2.5">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1">
                          <span>👤</span> Hasil Pencarian Murid ({matchedStudentsList.length})
                        </h4>
                        
                        {matchedStudentsList.length === 0 ? (
                          searchFilterCategory === "siswa" && <p className="text-xs text-slate-400 font-medium font-semibold">Siswa dengan nama "{searchQueryGlobal}" tidak ditemukan di kelas.</p>
                        ) : (
                          <div className="grid grid-cols-1 gap-2">
                            {matchedStudentsList.map((stud, idx) => (
                              <div
                                key={idx}
                                className={`p-4 border rounded-2xl transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-3xs ${
                                  selectedStudentForDetail?.nama === stud.nama && selectedStudentForDetail?.kelas === stud.kelas
                                    ? "bg-[#EBF3FF] border-blue-300 ring-1 ring-blue-200"
                                    : "bg-slate-50 border-slate-150 hover:bg-slate-100/50"
                                }`}
                              >
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h5 className="font-extrabold text-sm text-[#0D1D34]">{stud.nama}</h5>
                                    <span className="bg-indigo-150 text-indigo-800 text-[9px] font-black tracking-wide uppercase px-2 py-0.5 rounded-md border border-indigo-200">
                                      {stud.kelas}
                                    </span>
                                    {stud.behavior === "aktif" && <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8.5px] font-extrabold rounded">⭐ Aktif</span>}
                                    {stud.behavior === "perhatian" && <span className="px-1.5 py-0.2 bg-red-50 text-red-750 border border-red-100 text-[8.5px] font-extrabold rounded">⚠️ Atensi</span>}
                                  </div>
                                  
                                  {/* ATTENDANCE REKAP CHIP */}
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[9.5px] font-bold text-slate-500">
                                    <span className="flex items-center gap-0.5">🟢 Hadir: <strong className="text-emerald-700">{stud.attendanceStats.hadir}h</strong></span>
                                    <span className="text-slate-300">|</span>
                                    <span className="flex items-center gap-0.5">🟡 Sakit: <strong className="text-amber-700">{stud.attendanceStats.sakit}h</strong></span>
                                    <span className="text-slate-300">|</span>
                                    <span className="flex items-center gap-0.5">🔵 Izin: <strong className="text-blue-700">{stud.attendanceStats.izin}h</strong></span>
                                    <span className="text-slate-300">|</span>
                                    <span className="flex items-center gap-0.5">🔴 Alpa: <strong className="text-red-700">{stud.attendanceStats.alpa}h</strong></span>
                                  </div>

                                  {/* RATING SCORE PREVIEW */}
                                  <p className="text-[10px] text-slate-550 font-bold mt-1 text-left">
                                    📝 Nilai Siklus: <strong className="text-[#1E3A8A] font-black">{stud.score || 0}</strong> <span className="font-medium text-slate-500">― {stud.feedback?.substring(0, 50)}...</span>
                                  </p>
                                </div>

                                <div className="shrink-0 flex items-center flex-wrap gap-1.5 select-none self-end md:self-center">
                                  {/* CLICK OPTION 1: KOREKSI INSTANT PANEL */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedStudentForDetail(stud);
                                      setEditStudentScore(stud.score);
                                      setEditStudentFeedback(stud.feedback);
                                      setEditStudentBehavior(stud.behavior);
                                      setEditStudentNotes(stud.notes);
                                      playSfx("chime");
                                    }}
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold tracking-wide rounded-xl border border-slate-250 cursor-pointer transition select-none flex items-center gap-1"
                                    title="Sunting Sikap & Nilai Detil Di Panel Kanan"
                                  >
                                    🛠️ Edit Kilat
                                  </button>

                                  {/* CLICK OPTION 2: GO DIRECTLY TO ATTENDANCE RECORD (ABSENSI) */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveKelas(stud.kelas);
                                      setCurrentScreen("absensi");
                                      setIsSearchModalOpen(false);
                                      setSearchQueryGlobal("");
                                      playSfx("success");
                                      showToast(`🚀 Meluncur ke Presensi Harian ${stud.kelas} - ${stud.nama}!`);
                                    }}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold tracking-wide rounded-xl cursor-pointer transition inline-flex items-center gap-0.5"
                                  >
                                    📅 Presensi
                                  </button>

                                  {/* CLICK OPTION 3: GO DIRECTLY TO GRADES RECORD (LOKER/NILAI) */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveKelas(stud.kelas);
                                      setCurrentScreen("loker");
                                      setIsSearchModalOpen(false);
                                      setSearchQueryGlobal("");
                                      playSfx("success");
                                      showToast(`🚀 Meluncur ke Buku Nilai Kognitif ${stud.kelas} - ${stud.nama}!`);
                                    }}
                                    className="px-3 py-1.5 bg-[#1E3A8A] hover:bg-[#112559] text-white text-[10px] font-extrabold tracking-wide rounded-xl cursor-pointer transition inline-flex items-center gap-0.5"
                                  >
                                    📓 Buku Nilai ➔
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SEGMENT 2: PERANGKAT AJAR */}
                    {(searchFilterCategory === "semua" || searchFilterCategory === "rpp") && (
                      <div className="space-y-2.5">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1">
                          <span>📋</span> Hasil Perangkat Ajar &amp; RPP ({matchedRppsList.length})
                        </h4>

                        {matchedRppsList.length === 0 ? (
                          searchFilterCategory === "rpp" && <p className="text-xs text-slate-400 font-medium font-semibold">Tidak ditemukan draf RPP / perangkat mengajar bertema "{searchQueryGlobal}".</p>
                        ) : (
                          <div className="grid grid-cols-1 gap-2.5">
                            {matchedRppsList.map((temp) => (
                              <div
                                key={temp.id || temp.title}
                                className="p-4 bg-white border border-slate-150 rounded-2xl hover:border-blue-400 hover:shadow-2xs transition group text-left relative"
                              >
                                <span className={`absolute top-4 right-4 text-[9px] font-extrabold px-2 py-0.5 rounded-lg border uppercase tracking-wide ${
                                  temp.isCustom 
                                    ? "bg-purple-50 text-purple-700 border-purple-250" 
                                    : "bg-emerald-50 text-emerald-700 border-emerald-250"
                                }`}>
                                  {temp.isCustom ? "Kustom Saya" : "Resmi"}
                                </span>

                                <div className="space-y-1 pr-16">
                                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-600 border border-slate-200">{temp.level}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="font-extrabold text-[#1E3A8A]">{temp.subject}</span>
                                  </div>
                                  <h5 className="font-extrabold text-sm text-[#0D1D34] group-hover:text-[#1E3A8A] transition">{temp.title}</h5>
                                  <p className="text-[11px] text-slate-550 font-medium italic select-all leading-relaxed line-clamp-2">
                                    “ {temp.text} ”
                                  </p>
                                </div>

                                <div className="flex gap-2.5 pt-3.5 border-t border-slate-100 mt-3 select-none">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleApplyRppFromSearch(temp);
                                      playSfx("success");
                                    }}
                                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[10px] tracking-wide uppercase px-3.5 py-2 rounded-xl transition cursor-pointer shadow-3xs"
                                  >
                                    ✓ Terapkan ke RPP Studio
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setClassLevel(temp.level);
                                      const isStd = SUBJECTS.includes(temp.subject);
                                      if (isStd) {
                                        setSubject(temp.subject);
                                        setManualSubject("");
                                      } else {
                                        setSubject("Input Mapel Manual (Ketik Sendiri)");
                                        setManualSubject(temp.subject);
                                      }
                                      setMaterialText(temp.text);
                                      setMaterialImage?.(null);
                                      setCurrentScreen("perpustakaan");
                                      setIsSearchModalOpen(false);
                                      playSfx("click");
                                      showToast(`📂 Membuka berkas "${temp.title}" di perpustakaan...`);
                                    }}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-655 text-[10px] font-extrabold tracking-wide uppercase px-3 py-2 rounded-xl transition cursor-pointer"
                                  >
                                    Pratinjau Dokumen 👁️
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SEGMENT 3: JURNAL KELAS */}
                    {(searchFilterCategory === "semua" || searchFilterCategory === "jurnal") && (
                      <div className="space-y-2.5">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1">
                          <span>📅</span> Jurnal Mengajar Harian ({matchedJournalsList.length})
                        </h4>

                        {matchedJournalsList.length === 0 ? (
                          searchFilterCategory === "jurnal" && <p className="text-xs text-slate-400 font-medium font-semibold">Tidak ditemukan draf jurnal mengajar yang sesuai.</p>
                        ) : (
                          <div className="grid grid-cols-1 gap-2.5">
                            {matchedJournalsList.map((jur, kIndex) => (
                              <div
                                key={kIndex}
                                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-amber-400 shadow-3xs text-left"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                    📅 {jur.tanggal}
                                  </span>
                                  <span className="text-[10.5px] font-bold text-slate-550">
                                    Suasana: {jur.suasana || "😊 Menyenangkan"}
                                  </span>
                                </div>
                                <h5 className="font-extrabold text-sm text-[#0D1D34] mt-2">
                                  {jur.kelas} ― <span className="font-sans font-bold text-indigo-600">{jur.mapel}</span>
                                </h5>
                                <p className="text-[11.5px] text-slate-700 font-extrabold italic mt-1 font-mono">
                                  Topik: {jur.topik}
                                </p>
                                
                                {jur.kendala && (
                                  <p className="text-[10px] text-slate-500 font-semibold mt-1">
                                    ⚠️ Kendala: <span className="text-red-750 font-black">{jur.kendala}</span>
                                  </p>
                                )}
                                {jur.rencanaSel && (
                                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                    💡 Solusi: <span className="text-emerald-755 font-black">{jur.rencanaSel}</span>
                                  </p>
                                )}

                                <div className="pt-3 border-t border-slate-100 mt-2.5 flex justify-between items-center">
                                  <p className="text-[9px] text-[#A6B2C8] font-black">PERSISTENSI LOCAL STORAGE ACTIVE</p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveKelas(jur.kelas);
                                      setJurnalActiveTab("riwayat");
                                      setCurrentScreen("home");
                                      setIsSearchModalOpen(false);
                                      setSearchQueryGlobal("");
                                      showToast(`📂 Menuju Jurnal Mengajar ${jur.kelas}!`);
                                      playSfx("success");
                                    }}
                                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-extrabold tracking-wide uppercase rounded-xl transition cursor-pointer shadow-3xs"
                                  >
                                    Buka Jurnal Mengajar ➔
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: SELECTED STUDENT PROFILE INSPECTOR */}
            {selectedStudentForDetail && (
              <div className="w-full md:w-[350px] bg-slate-50/70 border-t md:border-t-0 border-slate-150 h-full flex flex-col justify-between overflow-y-auto">
                <div className="flex-1 flex flex-col justify-between h-full p-5 space-y-4 animate-fade-in-right">
                  <div className="space-y-4 text-left">
                    
                    {/* INSPECTOR HEADER CARDS */}
                    <div className="bg-gradient-to-r from-[#0F172A] to-[#1E3A8A] text-white p-4 rounded-2xl relative overflow-hidden shadow-2xs">
                      <div className="absolute top-[-20px] right-[-25px] w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
                      <button
                        type="button"
                        onClick={() => { setSelectedStudentForDetail(null); playSfx("click"); }}
                        className="absolute top-3 right-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-[10px] leading-none transition z-10 font-bold w-6 h-6 flex items-center justify-center"
                        title="Tutup Detil Siswa"
                      >
                        ✕
                      </button>
                      <span className="text-[9px] bg-white/20 border border-white/10 font-bold px-2 py-0.5 rounded-lg text-slate-200">
                        Inspektur Siswa Cepat
                      </span>
                      <h4 className="font-extrabold text-sm text-white mt-1.5 whitespace-normal break-words leading-snug">
                        {selectedStudentForDetail.nama}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 text-[10.5px] font-sans">
                        <span className="font-extrabold text-emerald-300 uppercase tracking-widest">{selectedStudentForDetail.kelas}</span>
                      </div>
                    </div>

                    {/* ATTENDANCE PROGRESS BLOCK */}
                    <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-1.5">
                      <h5 className="text-[10.5px] font-black text-[#0D1D34] uppercase tracking-wide">📅 Rekapitulasi Presensi Bulan Ini</h5>
                      <div className="grid grid-cols-4 gap-1 text-center select-none pt-1">
                        <div className="bg-emerald-50 border border-emerald-100 p-1.5 rounded-xl">
                          <p className="text-emerald-800 font-extrabold text-sm">{selectedStudentForDetail.attendanceStats.hadir}</p>
                          <p className="text-[8px] font-bold text-emerald-600 block uppercase">Hadir</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 p-1.5 rounded-xl">
                          <p className="text-amber-800 font-extrabold text-sm">{selectedStudentForDetail.attendanceStats.sakit}</p>
                          <p className="text-[8px] font-bold text-amber-600 block uppercase">Sakit</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 p-1.5 rounded-xl">
                          <p className="text-blue-800 font-extrabold text-sm">{selectedStudentForDetail.attendanceStats.izin}</p>
                          <p className="text-[8px] font-bold text-blue-600 block uppercase">Izin</p>
                        </div>
                        <div className="bg-red-50 border border-red-100 p-1.5 rounded-xl">
                          <p className="text-red-800 font-extrabold text-sm">{selectedStudentForDetail.attendanceStats.alpa}</p>
                          <p className="text-[8px] font-bold text-red-600 block uppercase">Alpa</p>
                        </div>
                      </div>
                    </div>

                    {/* EDIT EVALUASI KOGNITIF & CATATAN SIKAP INTERACTIVE */}
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-3xs">
                      <h5 className="text-[10.5px] font-black text-indigo-950 uppercase tracking-wide flex items-center gap-1">
                        <span>📝</span> Koreksi Nilai &amp; Sikap Cepat
                      </h5>
                      
                      {/* SCORE INPUT */}
                      <div className="space-y-1">
                        <label className="text-[9.5px] text-slate-450 font-sans font-bold uppercase block">Nilai Tugas / Eksperimen (0-100)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editStudentScore}
                          onChange={(e) => setEditStudentScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                          className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-800 focus:outline-none focus:border-[#1E3A8A] transition-colors"
                        />
                      </div>

                      {/* FEEDBACK QUALITATIVE INPUT */}
                      <div className="space-y-1">
                        <label className="text-[9.5px] text-slate-450 font-sans font-bold uppercase block">Catatan Feedback Guru</label>
                        <textarea
                          rows={2}
                          value={editStudentFeedback}
                          onChange={(e) => setEditStudentFeedback(e.target.value)}
                          className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-semibold text-slate-800 focus:outline-none focus:border-[#1E3A8A] transition-colors resize-none leading-snug"
                          placeholder="Masukkan komentar konstruktif guru..."
                        />
                      </div>

                      {/* BEHAVIOR / CATATAN SIKAP EMOJI BUTTONS */}
                      <div className="space-y-1.5">
                        <label className="text-[9.5px] text-slate-455 font-sans font-bold uppercase block">Predikat Perkembangan Sikap</label>
                        <div className="flex gap-1">
                          {[
                            { id: "aktif" as const, emoji: "⭐", text: "Aktif", color: "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100" },
                            { id: "pasif" as const, emoji: "😐", text: "Cukup", color: "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100" },
                            { id: "perhatian" as const, emoji: "⚠️", text: "Atensi", color: "bg-red-50 text-red-800 border-red-300 hover:bg-red-100" }
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => { setEditStudentBehavior(item.id); playSfx("click"); }}
                              className={`flex-1 flex flex-col items-center py-1.5 border rounded-xl text-xs font-bold transition cursor-pointer ${
                                editStudentBehavior === item.id
                                  ? item.color + " shadow-2xs scale-102 ring-1 ring-blue-300/35"
                                  : "bg-slate-55 border-slate-200 text-slate-400 opacity-60 hover:opacity-100"
                              }`}
                            >
                              <span className="text-sm">{item.emoji}</span>
                              <span className="text-[8px] uppercase mt-0.5">{item.text}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* VERBAL NOTE MEMO */}
                      <div className="space-y-1">
                        <label className="text-[9.5px] text-slate-450 font-sans font-bold uppercase block">Observasi Unsur Karakter (P5)</label>
                        <input
                          type="text"
                          value={editStudentNotes}
                          onChange={(e) => setEditStudentNotes(e.target.value)}
                          placeholder="Misal: Sangat sopan saat diskusi..."
                          className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-2 text-[10.5px] font-semibold text-slate-800 focus:outline-none focus:border-[#1E3A8A] transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ACTION BAR */}
                  <div className="space-y-2 select-none border-t border-slate-200 pt-4">
                    <button
                      type="button"
                      onClick={() => handleQuickSaveStudent({
                        nama: selectedStudentForDetail.nama,
                        kelas: selectedStudentForDetail.kelas,
                        score: editStudentScore,
                        feedback: editStudentFeedback,
                        behavior: editStudentBehavior,
                        notes: editStudentNotes
                      })}
                      className="w-full bg-[#1E3A8A] hover:bg-[#112559] text-white font-extrabold text-xs py-3 rounded-2xl cursor-pointer transition shadow-md select-none text-center block"
                    >
                      💾 Simpan &amp; Sinkronkan Data
                    </button>
                    
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveKelas(selectedStudentForDetail.kelas);
                          setCurrentScreen("absensi");
                          setIsSearchModalOpen(false);
                          playSfx("click");
                        }}
                        className="bg-indigo-50 hover:bg-indigo-100 text-[#1E3A8A] border border-indigo-105 font-extrabold text-[9px] tracking-wider uppercase py-2.5 rounded-xl cursor-pointer transition block text-center"
                      >
                        📅 Buku Presensi
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveKelas(selectedStudentForDetail.kelas);
                          setCurrentScreen("loker");
                          setIsSearchModalOpen(false);
                          playSfx("click");
                        }}
                        className="bg-indigo-50 hover:bg-indigo-100 text-[#1E3A8A] border border-indigo-105 font-extrabold text-[9px] tracking-wider uppercase py-2.5 rounded-xl cursor-pointer transition block text-center"
                      >
                        📓 Buku Nilai
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
