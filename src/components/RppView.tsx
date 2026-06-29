import React, { useState, useEffect } from "react";
import { ChevronDown, Download, Copy, FileText, CheckCircle2, Sparkles, BookOpen, Presentation, Eye, EyeOff, ClipboardList, Award, Users, Plus, Trash2, CheckSquare, Square, Check, Zap, Printer, X, Settings, ZoomIn, ZoomOut, Save, PenLine, FlaskConical, BarChart3, BookMarked } from "lucide-react";
import { ModulAjarRppMerdeka, MagicStudioOutput, PptInteractiveVisualSlide, SaranYoutubeSpesifik } from "../types";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, BorderStyle, WidthType, AlignmentType } from "docx";
import { getMediaAlatPeraga } from "./MediaBelajarView";
import { translateErrorMessage } from "../App";

// Helper to parse and render markdown-style stepwise layouts inside the paper area
export const renderStepwiseContent = (
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
    
    // Table Block
    if (trimmed.startsWith("|")) {
      const headerRowRaw = trimmed;
      let dividerRowRaw = "";
      const bodyRowsRaw: string[] = [];
      
      if (i + 1 < lines.length && lines[i + 1].trim().startsWith("|") && lines[i + 1].includes("-")) {
        dividerRowRaw = lines[i + 1].trim();
        i += 2;
        
        while (i < lines.length && lines[i].trim().startsWith("|")) {
          bodyRowsRaw.push(lines[i].trim());
          i++;
        }
        
        const headers = headerRowRaw.split("|")
          .map(c => c.trim())
          .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        
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
    
    // Divider
    if (trimmed === "---" || trimmed === "___" || trimmed === "***") {
      blocks.push({ type: "divider" });
      i++;
      continue;
    }
    
    // Headings
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
    
    // Bullet lists
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
    
    // Numbered lists
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
    
    // Blockquote
    if (trimmed.startsWith(">")) {
      blocks.push({ type: "blockquote", text: trimmed.replace(/^>\s*/, "") });
      i++;
      continue;
    }
    
    // Regular paragraph
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
                <thead className="bg-[#f4f4f5] text-zinc-900 border-b border-zinc-350 font-bold uppercase cursor-text">
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
                {trimmed.replace(/\*\??/g, "")}
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
      <div className="mt-10 pt-4 border-t border-zinc-300 grid grid-cols-2 gap-8 text-center text-[11px] text-black font-semibold font-sans leading-relaxed select-none border-dashed">
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

interface RppViewProps {
  rpp: ModulAjarRppMerdeka;
  profileName: string;
  profileNip: string;
  profileSchool: string;
  subject: string;
  classLevel: string;
  showToast: (msg: string) => void;
  magicStudioOutput?: MagicStudioOutput;
  slides?: PptInteractiveVisualSlide[];
  youtubeSaran?: SaranYoutubeSpesifik;
  documentType?: string;
  manualSubject?: string;
  materialText?: string;
  p5Theme?: string;
  selectedMetode?: string;
  handleSaveAndSyncFolder?: () => void;
  onSaveToLibrary?: (title: string, level: string, subject: string, text: string, result: any) => void;
  dokumenResult?: { [key in "modul_ajar" | "tp_atp" | "lkpd" | "asesmen" | "soal_ujian"]?: string };
  generatingDokumen?: "modul_ajar" | "tp_atp" | "lkpd" | "asesmen" | "soal_ujian" | null;
  handleGenerateDokumen?: (tipeDokumen: "modul_ajar" | "tp_atp" | "lkpd" | "asesmen" | "soal_ujian") => Promise<void>;
  selectedDokumen?: "modul_ajar" | "tp_atp" | "lkpd" | "asesmen" | "soal_ujian" | null;
  setSelectedDokumen?: (val: "modul_ajar" | "tp_atp" | "lkpd" | "asesmen" | "soal_ujian" | null) => void;
  onDownloadDocx?: (konten: string, judul: string) => void;
  kopSuratImage?: string;
  namaKepalaSekolah?: string;
  nipKepalaSekolah?: string;
  kotaSekolah?: string;
  isFocusView?: boolean;
  setIsFocusView?: (val: boolean) => void;
}

export const RppView: React.FC<RppViewProps> = ({
  rpp,
  onDownloadDocx,
  profileName,
  profileNip,
  profileSchool,
  subject,
  classLevel,
  showToast,
  magicStudioOutput,
  slides,
  youtubeSaran,
  documentType = "rpp",
  manualSubject = "",
  materialText = "",
  p5Theme = "Gaya Hidup Berkelanjutan",
  selectedMetode,
  handleSaveAndSyncFolder,
  onSaveToLibrary,
  dokumenResult = {} as any,
  generatingDokumen = null,
  handleGenerateDokumen,
  selectedDokumen = null,
  setSelectedDokumen,
  kopSuratImage = "",
  namaKepalaSekolah = "",
  nipKepalaSekolah = "",
  kotaSekolah = "",
  isFocusView = false,
  setIsFocusView = (_val: boolean) => {},
}) => {
  const [viewMode, setViewMode] = useState<"rpp" | "tp_atp" | "lkpd" | "asesmen" | "soal_ujian">("rpp");

  useEffect(() => {
    if (selectedDokumen) {
      setViewMode(selectedDokumen === "modul_ajar" ? "rpp" : selectedDokumen);
    }
  }, [selectedDokumen]);

  const [isSavedToLib, setIsSavedToLib] = useState<boolean>(false);
  const [canvaCopied, setCanvaCopied] = useState<boolean>(false);
  const [unfoldedKeys, setUnfoldedKeys] = useState<{ [key: string]: boolean }>({});
  const [expandedAnswers, setExpandedAnswers] = useState<{[key: number]: boolean}>({});
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState<boolean>(false);
  const [showDetailedAppendices, setShowDetailedAppendices] = useState<boolean>(false);

  const activeResult = 
    viewMode === "rpp" ? (dokumenResult?.modul_ajar || "") :
    viewMode === "tp_atp" ? (dokumenResult?.tp_atp || "") :
    viewMode === "lkpd" ? (dokumenResult?.lkpd || "") :
    viewMode === "asesmen" ? (dokumenResult?.asesmen || "") :
    viewMode === "soal_ujian" ? (dokumenResult?.soal_ujian || "") : "";

  const getActiveMediaPeraga = () => {
    const activeText = `${materialText || ""} ${youtubeSaran?.keyword_pencarian_utama || ""} ${slides?.map(s => s.judul_halaman).join(" ") || ""} ${rpp?.komponen_inti?.materi_pokok || ""}`;
    return getMediaAlatPeraga(subject, manualSubject || "", activeText);
  };

  const getPertanyaanPemantik = (): string[] => {
    const textLookup = magicStudioOutput
      ? magicStudioOutput.rpp_merdeka_formal.langkah_pembelajaran_rinci
      : rpp.langkah_pembelajaran?.kegiatan_pembuka || "";
    
    // Find lines containing a question mark
    const lines = textLookup.split("\n");
    const foundQuestion = lines.find(line => line.includes("?") && (line.includes("bagaimana") || line.includes("mengapa") || line.includes("apakah") || line.includes("Menurut")));
    if (foundQuestion) {
      // Clean up punctuation/quotes and return
      const clean = foundQuestion.replace(/^\d+[\.\)]\s*/, "").trim();
      return [clean.startsWith("“") || clean.startsWith("\"") ? clean : `“${clean}”`];
    }
    
    // Smart topic-based fallback
    const cleanSubject = (subject === "Input Mapel Manual (Ketik Sendiri)" && manualSubject) ? manualSubject : subject;
    return [`“Bagaimanakah penerapan materi ${cleanSubject || "pembelajaran"} ini dapat membantu kita memecahkan tantangan nyata dalam kehidupan sehari-hari?”`];
  };

  // Local list of editable questions
  const [soalList, setSoalList] = useState<{ no: number; pertanyaan: string; pilihan: string[]; kunci: string; pembahasan?: string }[]>(() => {
    if (magicStudioOutput && magicStudioOutput.paket_asesmen_penilaian_lengkap?.butir_soal_multiple_choice) {
      return magicStudioOutput.paket_asesmen_penilaian_lengkap.butir_soal_multiple_choice.map(s => ({
        no: s.no,
        pertanyaan: s.pertanyaan,
        pilihan: [...s.pilihan],
        kunci: s.kunci,
        pembahasan: s.pembahasan || ""
      }));
    }
    if (rpp.instrumen_asesmen?.soal_evaluasi) {
      return rpp.instrumen_asesmen.soal_evaluasi.map((s, i) => ({
        no: i + 1,
        pertanyaan: s.pertanyaan,
        pilihan: [...s.pilihan_jawaban],
        kunci: s.kunci_jawaban,
        pembahasan: "Didorong penalaran mandiri siswa."
      }));
    }
    return [];
  });

  const [editingSoalIdx, setEditingSoalIdx] = useState<number | null>(null);

  // Sync soalList setiap kali RPP atau magicStudioOutput berubah (misalnya setelah generate ulang)
  useEffect(() => {
    if (magicStudioOutput && magicStudioOutput.paket_asesmen_penilaian_lengkap?.butir_soal_multiple_choice) {
      setSoalList(magicStudioOutput.paket_asesmen_penilaian_lengkap.butir_soal_multiple_choice.map(s => ({
        no: s.no,
        pertanyaan: s.pertanyaan,
        pilihan: [...s.pilihan],
        kunci: s.kunci,
        pembahasan: s.pembahasan || ""
      })));
    } else if (rpp.instrumen_asesmen?.soal_evaluasi) {
      setSoalList(rpp.instrumen_asesmen.soal_evaluasi.map((s, i) => ({
        no: i + 1,
        pertanyaan: s.pertanyaan,
        pilihan: [...s.pilihan_jawaban],
        kunci: s.kunci_jawaban,
        pembahasan: "Didorong penalaran mandiri siswa."
      })));
    }
    // Reset interactive student checkbox simulator elements to prevent leakage across lessons
    setLkpdCheckedSteps({});
    setLkpdCheckedMaterials({});
    setConclusionText("");
  }, [rpp, magicStudioOutput]);
  
  // Interactive Simulator States
  const [studentsRecap, setStudentsRecap] = useState([
    { id: 1, nama: "Ahmad Fauzi", nTes: 85, nSikap: 4, nPerforma: 4 },
    { id: 2, nama: "Siti Rahma", nTes: 92, nSikap: 4, nPerforma: 3 },
    { id: 3, nama: "Budi Pratama", nTes: 78, nSikap: 3, nPerforma: 4 },
    { id: 4, nama: "Dinda Lestari", nTes: 95, nSikap: 4, nPerforma: 4 },
  ]);
  const [newStudentName, setNewStudentName] = useState("");
  
  const [lkpdCheckedSteps, setLkpdCheckedSteps] = useState<{ [key: number]: boolean }>({});
  const [lkpdCheckedMaterials, setLkpdCheckedMaterials] = useState<{ [key: string]: boolean }>({});
  const [lkpdGroupName, setLkpdGroupName] = useState("Kelompok Garuda 1");
  const [lkpdMembers, setLkpdMembers] = useState("Fauzi, Rahma, Budi, Dinda");
  const [lkpdDate, setLkpdDate] = useState(new Date().toISOString().split("T")[0]);
  const [conclusionText, setConclusionText] = useState("");
  const [selectedFont, setSelectedFont] = useState<"Arial" | "Times New Roman">("Arial");
  const [isEditMode, setIsEditMode] = useState(false);

  // PDF Preview and Interactive Formatting States
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [pdfMargin, setPdfMargin] = useState<"standard" | "narrow" | "wide">("standard");
  const [pdfFontSize, setPdfFontSize] = useState<"11pt" | "12pt" | "13pt">("12pt");
  const [pdfFontFamily, setPdfFontFamily] = useState<"Arial" | "Times New Roman" | "Inter" | "JetBrains Mono">("Arial");
  const [pdfLineHeight, setPdfLineHeight] = useState<"1.15" | "1.5" | "2.0">("1.5");
  const [pdfWatermark, setPdfWatermark] = useState<"None" | "DRAFT RPP" | "DRAF GURU" | "KURIKULUM MERDEKA">("None");
  const [pdfKopStyle, setPdfKopStyle] = useState<"double_line" | "minimalist" | "colored_border">("double_line");
  const [pdfShowSignature, setPdfShowSignature] = useState(true);
  const [pdfZoom, setPdfZoom] = useState(85);
  const [pdfColorMode, setPdfColorMode] = useState<"grayscale" | "colored">("grayscale");
  const [pdfPageLayout, setPdfPageLayout] = useState<"continuous" | "pages">("pages");

  // Word Export Configurations
  const [wordMargin, setWordMargin] = useState<"standard" | "narrow" | "wide">("standard");
  const [wordHeaderNoBorders, setWordHeaderNoBorders] = useState<boolean>(true);

  const handleAddStudent = () => {
    if (!newStudentName.trim()) {
      showToast("⚠️ Silakan ketik nama siswa terlebih dahulu!");
      return;
    }
    const newId = studentsRecap.length > 0 ? Math.max(...studentsRecap.map(s => s.id)) + 1 : 1;
    setStudentsRecap([
      ...studentsRecap,
      { id: newId, nama: newStudentName.trim(), nTes: 80, nSikap: 4, nPerforma: 3 }
    ]);
    setNewStudentName("");
    showToast(`📝 Siswa "${newStudentName.trim()}" berhasil ditambahkan ke lembar rekap!`);
  };

  const handleDeleteStudent = (id: number, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus siswa "${name}" dari lembar rekap?`)) return;
    setStudentsRecap(studentsRecap.filter(s => s.id !== id));
    showToast(`🗑️ Siswa "${name}" dihapus dari lembar rekap.`);
  };

  const handleUpdateStudent = (id: number, field: "nama" | "nTes" | "nSikap" | "nPerforma", value: any) => {
    setStudentsRecap(studentsRecap.map(s => {
      if (s.id === id) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const toggleUnfold = (key: string) => {
    setUnfoldedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getDisplayTopicName = () => {
    const materi = rpp?.komponen_inti?.materi_pokok || materialText || "Materi Kurikulum Merdeka";
    const sentences = materi.split(/[.\n]/).filter(s => s.trim().length > 5);
    return sentences[0] || "Materi Pembelajaran Guru";
  };

  const getLkpdEquipmentsAndProcedures = () => {
    const activeSubject = (subject === "Input Mapel Manual (Ketik Sendiri)" && manualSubject) ? manualSubject : subject;
    const normSubject = (activeSubject || "").toLowerCase();
    const text = (materialText || "").toLowerCase();

    // 1. Agama / Qur'an / Tahfidz / Tahsin / PAI etc.
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
      text.includes("agama") ||
      text.includes("alqur") ||
      text.includes("hafal") ||
      text.includes("baca") ||
      text.includes("tajwid") ||
      text.includes("wudhu") ||
      text.includes("sholat")
    ) {
      return {
        petunjuk_kerja: "Terapkan kolaborasi aktif sesama anggota kelompok. Bagi tugas secara merata: pelafal ayat, penyimak tajwid, penulis hafalan, dan pembawa presentasi kelompok.",
        capaian_kompetensi: "Siswa terampil membaca, menghafal, dan memahami hukum bacaan secara tartil serta mampu melafalkan atau mendemonstrasikannya dengan lancar.",
        alat_bahan: [
          "Kit Al-Qur'an mushaf atau lembaran Juz Amma penunjang",
          "Kertas kartu tajwid / puzzle potongan ayat hafalan mandiri",
          "Buku setoran hafalan & jurnal harian kelompok",
          "Alat tulis pendukung & lembar ceklis saling simak (tasmi')",
          "Alat perekam audio sederhana / smartphone (bila diizinkan)"
        ],
        prosedur: [
          "Bentuk kelompok kecil beranggotakan 3-4 siswa secara tertib.",
          "Ambil mushaf Al-Qur'an atau kartu potongan ayat sesuai dengan target hafalan hari ini.",
          "Secara bergantian (tasmi'), satu siswa melafalkan hafalan sementara rekan kelompok menyimak dengan saksama.",
          "Gunakan lembar ceklis untuk menandai ketepatan tajwid, makharijul huruf, dan kelancaran hafalan.",
          "Diskusikan bersama makna kandungan ayat atau hikmah penting yang tertuang didalamnya.",
          "Tuliskan laporan ringkas setoran kelas dan simpulkan metode menghafal paling efektif."
        ]
      };
    }

    // 2. Matematika / Berhitung
    if (
      normSubject.includes("matematika") || 
      normSubject.includes("hitung") ||
      text.includes("matematika") ||
      text.includes("hitung") ||
      text.includes("angka") ||
      text.includes("pecahan")
    ) {
      return {
        petunjuk_kerja: "Terapkan kolaborasi aktif sesama anggota kelompok. Bagi tugas secara merata: pemotong kertas, pelipat origami, pencatat angka, dan presentator kelompok.",
        capaian_kompetensi: "Siswa terampil memanipulasi alat peraga konkret untuk menganalisis relasi bilangan dan pecahan serta merasionalkan kesimpulan logis kelompok.",
        alat_bahan: [
          "Lembar kertas origami berwarna-warni",
          "Gunting kertas aman & lem perekat handal",
          "Busur derajat, penggaris presisi, & jangka matematika",
          "Spidol papan tulis warna & kertas plano besar",
          "Lembar kerja petunjuk hitung terpandu kelompok"
        ],
        prosedur: [
          "Buat tim beranggotakan 4 siswa kemudian bagi tugas melipat dan memotong dengan adil.",
          "Gunting origami mengikuti bentuk lingkaran, persegi, atau segitiga dengan presisi.",
          "Lipat bentuk tersebut untuk merepresentasikan pecahan yang diinginkan (misal: 1/2, 1/4, 2/4).",
          "Diskusikan bersama relasi nilai pecahan senilai menggunakan alat peraga manipulatif tersebut.",
          "Tempelkan hasil karya visual origami di kertas plano besar sebagai media presentasi.",
          "Simpulkan konsep matematika yang didapat dan bersiaplah untuk pameran kelas."
        ]
      };
    }

    // 3. Bahasa Indonesia / Inggris / Arab
    if (
      normSubject.includes("bahasa") ||
      normSubject.includes("inggris") ||
      text.includes("bahasa") ||
      text.includes("text") ||
      text.includes("paragraf") ||
      text.includes("kosakata")
    ) {
      return {
        petunjuk_kerja: "Terapkan kolaborasi aktif sesama anggota kelompok. Bagi tugas secara merata: pembaca teks utama, pencatat kosakata, penyusun paragraf, dan juru bicara.",
        capaian_kompetensi: "Siswa terampil membaca nyaring, menyusun struktur kebahasaan yang logis, mendefinisikan sinonim, serta menulis opini kritis yang komprehensif.",
        alat_bahan: [
          "Lembar cetak teks bacaan naratif, deskriptif, atau eksposisi",
          "Kertas kartu istilah / flashcard kosakata tematik",
          "Kamus Besar Bahasa Indonesia (KBBI) / Kamus Daring Bilingual",
          "Kertas sticky notes berwarna-warni & lem perekat",
          "Alat tulis spidol berwarna untuk mind-mapping"
        ],
        prosedur: [
          "Bentuk kelompok belajar kecil, tunjuk pembaca mula untuk membaca teks secara lantang.",
          "Garis bawahi kosakata sulit atau frasa kunci baru dalam bacaan tersebut secara mandiri.",
          "Gunakan kamus referensi kelompok untuk melacak arti harfiah dan kontekstual kosakata tersebut.",
          "Rancang peta pikiran (mind-map) gagasan pokok per paragraf menggunakan sticky notes.",
          "Susun kembali ringkasan bacaan menggunakan bahasa efektif kelompok sendiri secara padu.",
          "Tinjau kelogisan tulisan dan bersiaplah melakukan presentasi saling koreksi (peer-review)."
        ]
      };
    }

    // 4. Fallback default (IPAS / Sains dan lainnya)
    return {
      petunjuk_kerja: "Terapkan kolaborasi aktif sesama anggota kelompok. Bagi tugas secara merata: pengamat lapangan, pencatat data empiris, pengurus alat peraga, dan juru bicara.",
      capaian_kompetensi: "Siswa terampil melakukan tahapan eksperimen ilmiah terpandu, mengumpulkan rincian data observasi, serta merasionalkan kesimpulan logis representatif.",
      alat_bahan: [
        "1 unit Gelas Kimia Transparan (Gelas kaca bening polos)",
        "1 Lembar Daun Beringin / Mangga Muda Segar (Baru dipetik)",
        "Air Bersih Jernih secukupnya",
        "Akses Sinar Matahari Terik (Sinar UV alami di luar ruangan)",
        "1 Stopwatch Pengukur Waktu (atau Jam Tangan Siswa)",
        "Alat Tulis Pelaporan Kelompok"
      ],
      prosedur: [
        "Kumpulkan gelas kimia bening utuh dan isi dengan air keran tawar secara tertib.",
        "Petik secara hati-hati sehelai daun mangga/beringin segar berpigmen hijau klorofil murni.",
        "Masukkan daun segar sepenuhnya ke dalam air dengan posisi helai menghadap ke atas.",
        "Bawa tabung ke area terbuka pelataran kelas yang terpapar matahari penuh secara langsung.",
        "Nyalakan stopwatch, biarkan di bawah matahari hangat selama kurang lebih 15 menit.",
        "Amati dengan saksama rincian timbulnya gelembung oksigen (O2) di permukaan luar daun."
      ]
    };
  };

  // Dynamically estimate and generate LKPD details based on RPP inputs or read from magicStudioOutput
  const getLkpdData = () => {
    if (magicStudioOutput && magicStudioOutput.lembar_kerja_peserta_didik_lkpd) {
      return {
        judul_aktivitas: magicStudioOutput.lembar_kerja_peserta_didik_lkpd.judul_aktivitas,
        petunjuk_kerja: magicStudioOutput.lembar_kerja_peserta_didik_lkpd.petunjuk_belajar,
        tugas_soal_kelompok: magicStudioOutput.lembar_kerja_peserta_didik_lkpd.soal_atau_tugas_lapangan
      };
    }

    const materi = rpp.komponen_inti.materi_pokok || "Materi Pokok Kurikulum Merdeka";
    
    // Extrapolate topic name from material
    const sentences = materi.split(/[.\n]/).filter(s => s.trim().length > 5);
    const shortTopic = sentences[0] || "Materi Pengamatan Mandiri Siswa";

    return {
      judul_aktivitas: `📄 Lembar Kerja Didik (LKPD): Penyelidikan Konsep ${classLevel}`,
      petunjuk_kerja: `Instruksi Langkah Kerja:\n1. Berkumpullah dalam kelompok kecil beranggotakan 4-5 siswa.\n2. Duduk secara tertib dan diskusikan materi mengenai "${shortTopic}".\n3. Lakukan pengumpulan data empiris (observasi luar kelas atau analisis perpustakaan) sesuai arahan pendidik.\n4. Tuliskan jawaban argumentatif kelompokmu di bawah ini.\n5. Tunjuk satu juru bicara untuk melakukan presentasi kesimpulan presentatif di depan kelas.`,
      tugas_soal_kelompok: [
        `Berikan analisis kelompokmu mengenai bagaimana konsep "${shortTopic}" bermanifestasi dan berinteraksi secara aktif dalam kehidupan sehari-hari! Sebutkan 3 contoh konkret!`,
        `Identifikasikanlah peranan penting dari masing-masing elemen/faktor pemicu sirkulasi atau proses tersebut berdasarkan bahan bacaan guru!`,
         `Korelasikan apa yang terjadi apabila salah satu faktor ekosistem/konsep di atas dihilangkan atau terdisrupsi! Solusi pelestarian apa yang dapat dirumuskan kelompokmu?`
      ]
    };
  };

  // Dynamically configure Ice Breaking based on selected school subject or read from magicStudioOutput
  const getIceBreakingData = () => {
    if (magicStudioOutput && magicStudioOutput.kolom_ice_breaking_mandiri) {
      return {
        nama_game: magicStudioOutput.kolom_ice_breaking_mandiri.nama_permainan,
        cara_bermain_detail: magicStudioOutput.kolom_ice_breaking_mandiri.langkah_bermain
      };
    }

    const lcSubject = (subject || "").toLowerCase();
    if (lcSubject.includes("ipas") || lcSubject.includes("ipa") || lcSubject.includes("sains")) {
      return {
        nama_game: "Permainan Rantai Energi Fotosintesis (Eco-Chain)",
        cara_bermain_detail: "Instruksi Guru:\n1. Bagikan peran secara cepat kepada siswa: matahari (merentangkan tangan), tumbuhan (berjongkok), dan kelinci/predator (berdiri).\n2. Ketika guru meneriakkan 'Cahaya Datang!', siswa peran matahari mendatangi and menepuk siswa peran tumbuhan.\n3. Tumbuhan berdiri tegak menyerukan 'Oksigen Segar!', lalu siswa peran kelinci lekas memeluk tumbuhan.\n4. Siswa yang beraksi lambat ditunjuk memberikan kesimpulan singkat pembelajaran hari ini."
      };
    } else if (lcSubject.includes("tahfidz") || lcSubject.includes("tahsin") || lcSubject.includes("alquran") || lcSubject.includes("islam") || lcSubject.includes("btq")) {
      return {
        nama_game: "Sambung Ayat Estafet Barakah",
        cara_bermain_detail: "Instruksi Guru:\n1. Guru melafalkan satu potongan ayat hafalan acak dari surat penunjang materi hari ini.\n2. Guru melemparkan bola kertas bertekstur lembut ke salah satu murid.\n3. Murid penerima bola wajib melanjutkan bacaan minimal 1 ayat berikutnya secara tartil.\n4. Murid tersebut kemudian melemparkan bola ke rekan lain secara estafet berkelanjutan!"
      };
    } else if (lcSubject.includes("matematika") || lcSubject.includes("hitung")) {
      return {
        nama_game: "Gemerincing Kelipatan Ganjil",
        cara_bermain_detail: "Instruksi Guru:\n1. Ajak seluruh siswa berdiri melingkar dan mulai berhitung mulai angka 1.\n2. Syarat khusus: Setiap kali giliran angka kelipatan 3, siswa dilarang melafalkan angkanya, melainkan harus bertepuk tangan 2 kali sambil berseru 'Pintar!'.\n3. Bagi siswa yang lalai menyebutkan angkanya otomatis gugur dan dipersilakan duduk.\n4. Lanjutkan tempo lebih cepat untuk memperoleh pemenang konsentrasi!"
      };
    } else {
      return {
        nama_game: "Tepuk Fokus 'Pagi, Siang, Malam'",
        cara_bermain_detail: "Instruksi Guru:\n1. Sosialisasi sandi motorik kelas: 'Tepuk Pagi' (Tepuk 1x), 'Tepuk Siang' (Tepuk 2x), 'Tepuk Malam' (Setengah tepuk tertahan tanpa suara).\n2. Guru meneriakkan aba-aba tersebut secara mendadak dengan kecepatan ritme bertahap dipercepat.\n3. Siswa yang kelepasan bertepuk saat kata 'Malam' diajak melakukan senam bahu penyegar."
      };
    }
  };

  const getCanvaAIText = (): string => {
    let result = "";
    const displaySubject = documentType === "rpp"
      ? ((subject === "Input Mapel Manual (Ketik Sendiri)" && manualSubject) ? manualSubject : subject)
      : p5Theme;
    const author = profileName ? `${profileName} (${profileSchool || "GuruPintar AI"})` : "GuruPintar AI";

    if (slides && slides.length > 0) {
      slides.forEach((slide) => {
        result += `[Slide ${slide.slide_nomor || 1}: ${slide.judul_halaman}]\n`;
        if (slide.isi_poin_materi && slide.isi_poin_materi.length > 0) {
          slide.isi_poin_materi.forEach((p: string) => {
            if (p.trim().startsWith("•") || p.trim().startsWith("-")) {
              result += `${p}\n`;
            } else if (slide.slide_nomor === 1 || slide.judul_halaman.toLowerCase().includes("judul")) {
              result += `${p}\n`;
            } else {
              result += `• ${p}\n`;
            }
          });
        }
        result += `\n`;
      });
    } else {
      result += `[Slide 1: Judul Utama]\n`;
      result += `Topik: ${displaySubject} - ${classLevel}\n`;
      result += `Disusun Oleh: ${author}\n\n`;

      result += `[Slide 2: Pertanyaan Pemantik & Pendahuluan]\n`;
      result += `• Bagaimana konsep ini terwujud dalam kehidupan kita sehari-hari?\n• Tujuan Pembelajaran: Memahami esensi topik dengan mendalam.\n\n`;

      result += `[Slide 3: Pembahasan Inti Bagian A]\n`;
      result += `• Memperkenalkan pengertian dasar dan elemen pembentuk pokok bahasan.\n• Mengupas keterkaitan utama antar komponen awal.\n\n`;

      result += `[Slide 4: Pembahasan Inti Bagian B / Eksplorasi]\n`;
      result += `• Menganalisis cara kerja dan proses-proses penting di dalamnya.\n• Merumuskan pola hubungan yang terjadi secara sistematis.\n\n`;

      result += `[Slide 5: Pembahasan Inti Bagian C / Pendalaman]\n`;
      result += `• Melihat aplikasi praktis di lingkungan sekitar kita.\n• Menyelesaikan studi kasus rujukan sebagai contoh nyata.\n\n`;

      result += `[Slide 6: Kegiatan Kelompok / Kolaborasi]\n`;
      result += `• Berkumpul dalam tim kecil untuk menyelidiki tantangan khusus.\n• Membagi peran antar anggota tim secara proporsional.\n\n`;

      result += `[Slide 7: Penyajian Hasil / Presentasi Siswa]\n`;
      result += `• Memaparkan hasil diskusi kelompok di depan kelas.\n• Memberikan umpan balik positif konstruktif kepada kelompok lain.\n\n`;

      result += `[Slide 8: Kuis Cepat / Cek Pemahaman]\n`;
      result += `• Menjawab 3-5 pertanyaan pilihan ganda interaktif.\n• Menganalisis poin-poin yang memerlukan konfirmasi ulang.\n\n`;

      result += `[Slide 9: Asesmen Penutup / Evaluasi Mandiri]\n`;
      result += `• Menyelesaikan tugas formatif akhir secara perorangan.\n• Mengukur tingkat pemahaman mandiri terhadap materi.\n\n`;

      result += `[Slide 10: Kesimpulan Akhir & Refleksi Belajar]\n`;
      result += `• Kesimpulan: Merangkum intisari bab secara keseluruhan.\n• Refleksi Belajar: Mengisi lembar refleksi emosi dan pencapaian hari ini.\n`;
    }

    return result;
  };

  const lkpd = getLkpdData();
  const iceBreaking = getIceBreakingData();

  const getRppTextString = () => {
    if (magicStudioOutput) {
      const out = magicStudioOutput;
      let text = `================================================
KOP SURAT PEMBELAJARAN GURUPINTAR AI
================================================
Nama Instansi/Sekolah : ${profileSchool}
Nama Pendidik         : ${profileName}
NIP / Jabatan         : ${profileNip || "Belum diatur"}
Mata Pelajaran        : ${subject}
Kelas / Jenjang       : ${classLevel}
------------------------------------------------

I. RPP MERDEKA FORMAL:
1. Komponen Umum:
${out.rpp_merdeka_formal.komponen_umum}

2. Tujuan Pembelajaran:
${out.rpp_merdeka_formal.tujuan_pembelajaran}

3. Skenario Langkah Pembelajaran Rinci (Tanpa Ice Breaking):
${out.rpp_merdeka_formal.langkah_pembelajaran_rinci}

------------------------------------------------
II. LEMBAR KERJA PESERTA DIDIK (LKPD) SISWA:
Judul Aktivitas: ${out.lembar_kerja_peserta_didik_lkpd.judul_aktivitas}
Petunjuk Belajar:
${out.lembar_kerja_peserta_didik_lkpd.petunjuk_belajar}
Tugas & Soal Lapangan:
${out.lembar_kerja_peserta_didik_lkpd.soal_atau_tugas_lapangan.map((t, i) => `  ${i + 1}. ${t}`).join("\n")}

------------------------------------------------
III. PAKET ASESMEN PENILAIAN LENGKAP:
Tipe: ${out.paket_asesmen_penilaian_lengkap.tipe}

`;
      out.paket_asesmen_penilaian_lengkap.butir_soal_multiple_choice.forEach((soal) => {
        text += `Soal Ke-${soal.no}: ${soal.pertanyaan}
Pilihan:
  ${soal.pilihan.join("\n  ")}
Kunci Jawaban: ${soal.kunci}
Pembahasan: ${soal.pembahasan}
\n`;
      });

      text += `------------------------------------------------
IV. IDE ICE BREAKING KELAS:
Nama Game: ${out.kolom_ice_breaking_mandiri.nama_permainan}
Langkah Bermain: ${out.kolom_ice_breaking_mandiri.langkah_bermain}
`;
      return text;
    }

    let text = `================================================
KOP SURAT PEMBELAJARAN GURUPINTAR AI
================================================
Nama Instansi/Sekolah : ${profileSchool}
Nama Pendidik         : ${profileName}
NIP / Jabatan         : ${profileNip || "Belum diatur"}
Mata Pelajaran        : ${subject}
Kelas / Jenjang       : ${classLevel}
Tingkat Kurikulum      : Standardiasi Kurikulum Merdeka Belajar KTSP 2026
------------------------------------------------

I. KOMPONEN INTI:
1. Tujuan Pembelajaran:
${rpp.komponen_inti.tujuan_pembelajaran}

2. Alur Tujuan Pembelajaran:
${rpp.komponen_inti.alur_tujuan_pembelajaran || "Alur Capaian Pembelajaran bertahap dari Kriteria Mudah ke Kriteria Pendalaman Kompetensi Siswa."}

3. Materi Pokok:
${rpp.komponen_inti.materi_pokok}

------------------------------------------------
II. LANGKAH PEMBELAJARAN:

1. Kegiatan Pembuka:
${rpp.langkah_pembelajaran.kegiatan_pembuka}

2. Kegiatan Inti:
${rpp.langkah_pembelajaran.kegiatan_inti_mendalam}

3. Kegiatan Penutup:
${rpp.langkah_pembelajaran.kegiatan_penutup}

------------------------------------------------
III. LEMBAR KERJA PESERTA DIDIK (LKPD):
Judul: ${lkpd.judul_aktivitas}
Petunjuk:
${lkpd.petunjuk_kerja}
Soal Kelompok:
${lkpd.tugas_soal_kelompok.map((t, idx) => `  ${idx + 1}. ${t}`).join("\n")}

------------------------------------------------
IV. PAKET ASESMEN PENILAIAN:
Jenis Asesmen: Asesmen ${rpp.instrumen_asesmen?.jenis_asesmen || "Formatif"}

`;

    rpp.instrumen_asesmen?.soal_evaluasi.forEach((soal, i) => {
      text += `Soal Ke-${i + 1}: ${soal.pertanyaan}
Pilihan:
  ${soal.pilihan_jawaban.join("\n  ")}
Kunci Jawaban & Pembahasan Detil:
  ${soal.kunci_jawaban}
\n`;
    });

    return text;
  };

  const copyRppText = () => {
    navigator.clipboard.writeText(getRppTextString());
    showToast("💾 Teks Dokumen Lengkap berhasil disalin ke clipboard!");
  };

  const handleDownloadTxt = () => {
    const content = [
      `RPP MERDEKA — ${subject} | ${classLevel}`,
      `Guru: ${profileName} | NIP: ${profileNip} | Sekolah: ${profileSchool}`,
      "=".repeat(60),
      "",
      "TUJUAN PEMBELAJARAN:",
      rpp.komponen_inti.tujuan_pembelajaran,
      "",
      "MATERI POKOK:",
      rpp.komponen_inti.materi_pokok,
      "",
      "LANGKAH PEMBELAJARAN:",
      "Pembuka:\n" + rpp.langkah_pembelajaran.kegiatan_pembuka,
      "Inti:\n" + rpp.langkah_pembelajaran.kegiatan_inti_mendalam,
      "Penutup:\n" + rpp.langkah_pembelajaran.kegiatan_penutup,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RPP_${subject || ""}_${classLevel || ""}.txt`.replace(/\s+/g, "_");
    a.click();
    URL.revokeObjectURL(url);
    showToast("📄 RPP berhasil diunduh sebagai file teks!");
  };

  const handleCetakPdf = () => {
    const isInIframe = window.self !== window.top;

    if (isInIframe) {
      // Sandboxed Iframe (AI STUDIO PREVIEW WINDOW):
      // Direct window.print() inside iframe prints the entire outer browser or is blocked.
      // We generate and download a beautifully styled standalone printable HTML file.
      try {
        const printArea = document.getElementById("rpp-print-area");
        if (!printArea) {
          showToast("❌ Gagal mencetak: area draf modul tidak ditemukan.");
          return;
        }
        const htmlContent = printArea.innerHTML;

        const standaloneHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cetak RPP - ${subject} (${classLevel})</title>
  <!-- Load Tailwind CSS Play CDN & Inter Font so downloaded HTML renders pixel-perfect with applet styles -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
            display: ["Outfit", "sans-serif"],
            mono: ["JetBrains Mono", "monospace"],
          }
        }
      }
    }
  </script>
  <style>
    body {
      font-family: "Inter", sans-serif;
      background-color: #f8fafc;
      color: #000000;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
    }
    .print-container {
      background-color: #ffffff;
      max-width: 850px;
      margin: 40px auto;
      padding: 2.5cm;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      border-radius: 16px;
    }
    @media print {
      body {
        background-color: #ffffff !important;
        font-size: 11pt;
      }
      .print-container {
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
        max-width: none !important;
        border-radius: 0 !important;
      }
      .no-print {
        display: none !important;
      }
    }
    .no-print-banner {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
      padding: 16px;
      text-align: center;
      margin-bottom: 24px;
      font-size: 13px;
      border-radius: 12px;
    }
  </style>
</head>
<body>
  <div class="print-container">
    <div class="no-print no-print-banner">
      <strong style="font-size: 14px;">💻 GURUPINTAR AI - Format PDF Siap Cetak Lancar</strong><br/>
      Halaman ini diformat khusus agar siap disimpan sebagai PDF beresolusi tinggi. Silakan tekan tombol cetak browser Anda atau gunakan jalan pintas <strong>Ctrl + P</strong> (atau <strong>Cmd + P</strong> di Mac) pada browser Anda, lalu pilih tujuan cetak: <strong>"Save as PDF"</strong> (Simpan sebagai PDF).
    </div>
    <div style="font-family: ${selectedFont === "Arial" ? "Arial, Helvetica, sans-serif" : "'Times New Roman', Times, serif"}">
      ${htmlContent}
    </div>
  </div>
  <script>
    // Automatically trigger the print dialog once loaded
    setTimeout(function() {
      window.print();
    }, 800);
  </script>
</body>
</html>`;

        const blob = new Blob([standaloneHtml], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Cetak_RPP_Merdeka_${(subject || "").replace(/\s+/g, "_")}_${(classLevel || "").replace(/\s+/g, "")}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast("📥 Berkas HTML Siap Cetak berhasil diunduh! Buka file tersebut untuk memicu dialog cetak PDF berkualitas tinggi.");
      } catch (e) {
        console.error("Gagal cetak via fallback HTML", e);
        showToast("❌ Gagal membuat format PDF: " + (e as Error).message);
      }
    } else {
      // Standalone Browser Tab (Direct Access):
      // Directly call window.print() which prints beautifully due to our optimized CSS @media print
      try {
        window.print();
      } catch (err) {
        console.warn("window.print() gagal, mencoba metode fallback download...", err);
        try {
          const printArea = document.getElementById("rpp-print-area");
          if (!printArea) return;
          const htmlContent = printArea.innerHTML;
          const standaloneHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${htmlContent}</body></html>`;
          const blob = new Blob([standaloneHtml], { type: "text/html;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `Cetak_RPP_Merdeka_${(subject || "").replace(/\s+/g, "_")}_${(classLevel || "").replace(/\s+/g, "")}.html`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          showToast("📥 Berkas HTML Siap Cetak berhasil diunduh!");
        } catch (e) {
          showToast("❌ Gagal melakukan pencetakan RPP.");
        }
      }
    }
  };

  const downloadRppDoc = () => {
    // Rebuilt with native DOCX generator - compliant with strict formatting
    const createBorderNoOutlines = () => ({
      top: { style: BorderStyle.NONE, size: 0, color: "auto" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
      left: { style: BorderStyle.NONE, size: 0, color: "auto" },
      right: { style: BorderStyle.NONE, size: 0, color: "auto" },
    });

    const createBorderThinBlack = () => ({
      top: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
      left: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
      right: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
    });

    const textToParagraphs = (rawText: string, bold = false, size = 22, beforeSpacing = 80, afterSpacing = 80) => {
      if (!rawText) return [];
      
      const paragraphs: Paragraph[] = [];
      const lines = rawText.split("\n");
      
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Determine list properties
        let isBullet = false;
        let isNumbered = false;
        let listPrefix = "";
        let cleanText = trimmed;

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
          isBullet = true;
          cleanText = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("— ")) {
          isBullet = true;
          cleanText = trimmed.substring(2).trim();
        } else {
          // Check for numbered list (e.g. "1. " or "1) ")
          const numMatch = trimmed.match(/^(\d+[\.\)])\s+/);
          if (numMatch) {
            isNumbered = true;
            listPrefix = numMatch[1];
            cleanText = trimmed.substring(numMatch[0].length).trim();
          }
        }

        const runs: TextRun[] = [];
        
        if (isBullet) {
          runs.push(new TextRun({ text: "•  ", bold: true, size }));
        } else if (isNumbered) {
          runs.push(new TextRun({ text: `${listPrefix}  `, bold: true, size }));
        }

        // Split by ** or __ for bold.
        const parts = cleanText.split(/\*\*|__/);
        parts.forEach((part, index) => {
          const partBold = index % 2 === 1 ? !bold : bold;
          if (part) {
            // Clean up single * if any from part
            const cleanPart = part.replace(/\*/g, "");
            runs.push(new TextRun({
              text: cleanPart,
              bold: partBold,
              size
            }));
          }
        });

        paragraphs.push(new Paragraph({
          children: runs,
          spacing: { 
            before: isBullet || isNumbered ? 40 : beforeSpacing, 
            after: isBullet || isNumbered ? 40 : afterSpacing 
          },
          indent: isBullet || isNumbered ? { left: 420 } : undefined
        }));
      });
      
      return paragraphs;
    };

    const docChildren: any[] = [];

    // 1. KOP TABLE WITHOUT BOUNDARIES
    const kopTable = new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: createBorderNoOutlines(),
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: profileSchool.toUpperCase(), bold: true, size: 28 }),
                  ],
                  spacing: { before: 100, after: 50 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "TERAKREDITASI NASIONAL • KOMUNITAS GURU MERDEKA", size: 16, bold: true, color: "555555" }),
                  ],
                  spacing: { before: 0, after: 50 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Alamat Instansi Pendidikan Terakreditasi Nasional | Kelompok Kerja Merdeka", size: 16, italics: true }),
                  ],
                  spacing: { before: 0, after: 100 },
                }),
              ],
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({ text: "GURU PENGAMPU: ", bold: true, size: 18 }),
                    new TextRun({ text: profileName, size: 18 }),
                  ],
                  spacing: { before: 100, after: 50 },
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({ text: "NIP: ", bold: true, size: 18 }),
                    new TextRun({ text: profileNip || "Belum diatur", size: 18 }),
                  ],
                  spacing: { before: 0, after: 100 },
                }),
              ],
            }),
          ],
        }),
      ],
    });

    docChildren.push(kopTable);

    docChildren.push(new Paragraph({
      children: [new TextRun({ text: "_________________________________________________________________________________", bold: true, color: "000000" })],
      spacing: { after: 200 },
      alignment: AlignmentType.CENTER
    }));

    // Title
    docChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "DOKUMEN INTEGRASI MODUL AJAR, LKPD, DAN ASESMEN", bold: true, size: 24 }),
      ],
      spacing: { before: 300, after: 300 },
    }));

    const sectionTitle = (text: string) => new Paragraph({
      children: [new TextRun({ text: text, bold: true, size: 24 })],
      spacing: { before: 240, after: 120 },
    });

    const subHeading = (text: string) => new Paragraph({
      children: [new TextRun({ text: text, bold: true, size: 22 })],
      spacing: { before: 150, after: 80 },
    });

    if (magicStudioOutput) {
      const out = magicStudioOutput;

      // I. RPP MERDEKA FORMAL
      docChildren.push(sectionTitle("I. RPP MERDEKA FORMAL"));

      docChildren.push(subHeading("A. KOMPONEN UMUM"));
      docChildren.push(...textToParagraphs(out.rpp_merdeka_formal.komponen_umum));

      docChildren.push(subHeading("B. TUJUAN PEMBELAJARAN (Target Kompetensi)"));
      docChildren.push(...textToParagraphs(out.rpp_merdeka_formal.tujuan_pembelajaran));

      docChildren.push(subHeading("C. SKENARIO INTEGRATIF LANGKAH PEMBELAJARAN"));
      docChildren.push(...textToParagraphs(out.rpp_merdeka_formal.langkah_pembelajaran_rinci));

      docChildren.push(subHeading("D. DAFTAR MEDIA & ALAT PERAGA INTI"));
      const mediaPeraga = getActiveMediaPeraga();
      docChildren.push(new Paragraph({
        children: [new TextRun({ text: "Media Utama (Fisik / Digital):", bold: true })],
        spacing: { before: 100, after: 50 }
      }));
      mediaPeraga.mediaUtama.forEach(m => {
        docChildren.push(new Paragraph({
          children: [new TextRun({ text: `• ${m}` })],
          spacing: { after: 30 }
        }));
      });
      docChildren.push(new Paragraph({
        children: [new TextRun({ text: "Alat & Bahan Kelas Konkret (Kegiatan Kelompok):", bold: true })],
        spacing: { before: 100, after: 50 }
      }));
      mediaPeraga.alatBahanKonkret.forEach(ab => {
        docChildren.push(new Paragraph({
          children: [new TextRun({ text: `• ${ab}` })],
          spacing: { after: 30 }
        }));
      });

      // II. LEMBAR KERJA PESERTA DIDIK (LKPD)
      docChildren.push(sectionTitle("II. LEMBAR KERJA PESERTA DIDIK (LKPD)"));
      docChildren.push(new Paragraph({
        children: [
          new TextRun({ text: "Judul Aktivitas: ", bold: true }),
          new TextRun({ text: out.lembar_kerja_peserta_didik_lkpd.judul_aktivitas.toUpperCase() }),
        ],
        spacing: { after: 100 }
      }));

      docChildren.push(subHeading("Petunjuk Belajar Kelompok:"));
      docChildren.push(...textToParagraphs(out.lembar_kerja_peserta_didik_lkpd.petunjuk_belajar));

      docChildren.push(subHeading("Tugas & Pertanyaan Eksploratif Lapangan (Tabel Resmi Word):"));

      // Build a native Word Table with thin borders
      const lkpdTableRows = [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 10, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: "No", bold: true })] })],
              shading: { fill: "F2F2F2" }
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: "Butir Tugas & Pertanyaan", bold: true })] })],
              shading: { fill: "F2F2F2" }
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: "Catatan & Jawaban Guru/Siswa (Dapat Diketik Ulang)", bold: true })] })],
              shading: { fill: "F2F2F2" }
            })
          ]
        })
      ];

      out.lembar_kerja_peserta_didik_lkpd.soal_atau_tugas_lapangan.forEach((st, index) => {
        lkpdTableRows.push(new TableRow({
          children: [
            new TableCell({
              width: { size: 10, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: String(index + 1) })] })]
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: st })] })]
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Jawab: .............................................................." })],
                  spacing: { before: 100, after: 100 }
                })
              ]
            })
          ]
        }));
      });

      const docLkpdTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: createBorderThinBlack(),
        rows: lkpdTableRows
      });
      docChildren.push(docLkpdTable);

      // III. PAKET ASESMEN PENILAIAN LENGKAP
      docChildren.push(sectionTitle("III. PAKET ASESMEN PENILAIAN LENGKAP"));
      docChildren.push(new Paragraph({
        children: [
          new TextRun({ text: "Sifat Evaluasi: ", bold: true }),
          new TextRun({ text: out.paket_asesmen_penilaian_lengkap.tipe || "Formatif" })
        ],
        spacing: { after: 150 }
      }));

      docChildren.push(subHeading("Daftar Soal Pilihan Ganda (Tabel Resmi Word):"));

      const mcqTableRows = [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 8, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: "No", bold: true })] })],
              shading: { fill: "F2F2F2" }
            }),
            new TableCell({
              width: { size: 42, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: "Pertanyaan", bold: true })] })],
              shading: { fill: "F2F2F2" }
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: "Pilihan Jawaban", bold: true })] })],
              shading: { fill: "F2F2F2" }
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: "Kunci & Pembahasan Resmi", bold: true })] })],
              shading: { fill: "F2F2F2" }
            })
          ]
        })
      ];

      out.paket_asesmen_penilaian_lengkap.butir_soal_multiple_choice.forEach((soal, index) => {
        mcqTableRows.push(new TableRow({
          children: [
            new TableCell({
              width: { size: 8, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: String(soal.no || (index + 1)) })] })]
            }),
            new TableCell({
              width: { size: 42, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: soal.pertanyaan })] })]
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: soal.pilihan.map(p => new Paragraph({ children: [new TextRun({ text: p, size: 18 })] }))
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ children: [new TextRun({ text: `Kunci: ${soal.kunci}`, bold: true })], spacing: { after: 50 } }),
                new Paragraph({ children: [new TextRun({ text: `Pembahasan: ${soal.pembahasan}`, italics: true, size: 18 })] })
              ]
            })
          ]
        }));
      });

      const docMcqTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: createBorderThinBlack(),
        rows: mcqTableRows
      });
      docChildren.push(docMcqTable);

    } else {
      // Use manual 'rpp' structure

      // I. KOMPONEN INTI AJAR
      docChildren.push(sectionTitle("I. KOMPONEN INTI AJAR"));

      docChildren.push(subHeading("A. TUJUAN PEMBELAJARAN (Target Kompetensi)"));
      docChildren.push(...textToParagraphs(rpp.komponen_inti.tujuan_pembelajaran));

      docChildren.push(subHeading("B. ALUR TUJUAN PEMBELAJARAN (ATP)"));
      docChildren.push(...textToParagraphs(rpp.komponen_inti.alur_tujuan_pembelajaran || "Fase perkembangan target kognitif runut dari kriteria dasar ke kriteria lanjut."));

      docChildren.push(subHeading("C. MATERI POKOK"));
      docChildren.push(...textToParagraphs(rpp.komponen_inti.materi_pokok));

      docChildren.push(subHeading("D. DAFTAR MEDIA & ALAT PERAGA INTI"));
      const mediaPeraga = getActiveMediaPeraga();
      docChildren.push(new Paragraph({
        children: [new TextRun({ text: "Media Utama (Fisik / Digital):", bold: true })],
        spacing: { before: 100, after: 50 }
      }));
      mediaPeraga.mediaUtama.forEach(m => {
        docChildren.push(new Paragraph({
          children: [new TextRun({ text: `• ${m}` })],
          spacing: { after: 30 }
        }));
      });
      docChildren.push(new Paragraph({
        children: [new TextRun({ text: "Alat & Bahan Kelas Konkret (Kegiatan Kelompok):", bold: true })],
        spacing: { before: 100, after: 50 }
      }));
      mediaPeraga.alatBahanKonkret.forEach(ab => {
        docChildren.push(new Paragraph({
          children: [new TextRun({ text: `• ${ab}` })],
          spacing: { after: 30 }
        }));
      });

      // II. SKENARIO INTEGRATIF LANGKAH PEMBELAJARAN
      docChildren.push(sectionTitle("II. SKENARIO INTEGRATIF LANGKAH PEMBELAJARAN"));

      docChildren.push(subHeading("A. KEGIATAN PEMBUKA (Durasi 10 Menit)"));
      docChildren.push(...textToParagraphs(rpp.langkah_pembelajaran.kegiatan_pembuka));

      docChildren.push(subHeading("B. KEGIATAN INTI MENDALAM (Detail Langkah per Menit)"));
      docChildren.push(...textToParagraphs(rpp.langkah_pembelajaran.kegiatan_inti_mendalam));

      docChildren.push(subHeading("C. KEGIATAN PENUTUP & REFLEKSI (Durasi 15 Menit)"));
      docChildren.push(...textToParagraphs(rpp.langkah_pembelajaran.kegiatan_penutup));

      // III. LEMBAR KERJA PESERTA DIDIK (LKPD)
      docChildren.push(sectionTitle("III. LEMBAR KERJA PESERTA DIDIK (LKPD)"));
      docChildren.push(new Paragraph({
        children: [
          new TextRun({ text: "Judul Aktivitas: ", bold: true }),
          new TextRun({ text: lkpd.judul_aktivitas.toUpperCase() })
        ],
        spacing: { after: 100 }
      }));

      docChildren.push(subHeading("Petunjuk Kerja Kelompok:"));
      docChildren.push(...textToParagraphs(lkpd.petunjuk_kerja));

      docChildren.push(subHeading("Tugas & Pertanyaan Eksploratif (Tabel Resmi Word):"));

      const lkpdTableRows = [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 10, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: "No", bold: true })] })],
              shading: { fill: "F2F2F2" }
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: "Materi Kerja & Eksplorasi", bold: true })] })],
              shading: { fill: "F2F2F2" }
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: "Kolom Pengamatan & Respon (Dapat Diketik)", bold: true })] })],
              shading: { fill: "F2F2F2" }
            })
          ]
        })
      ];

      lkpd.tugas_soal_kelompok.forEach((st, index) => {
        lkpdTableRows.push(new TableRow({
          children: [
            new TableCell({
              width: { size: 10, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: String(index + 1) })] })]
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: st })] })]
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Jawab: .............................................................." })],
                  spacing: { before: 100, after: 100 }
                })
              ]
            })
          ]
        }));
      });

      const docLkpdTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: createBorderThinBlack(),
        rows: lkpdTableRows
      });
      docChildren.push(docLkpdTable);

      // IV. INSTRUMEN EVALUASI & ASESMEN TAJAM
      docChildren.push(sectionTitle("IV. INSTRUMEN EVALUASI & ASESMEN TAJAM"));
      docChildren.push(new Paragraph({
        children: [
          new TextRun({ text: "Format Penilaian: ", bold: true }),
          new TextRun({ text: `Asesmen ${rpp.instrumen_asesmen?.jenis_asesmen || "Formatif"}` })
        ],
        spacing: { after: 150 }
      }));

      docChildren.push(subHeading("Lembar Pertanyaan Pilihan Ganda (Tabel Resmi Word):"));

      const mcqTableRows = [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 8, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: "No", bold: true })] })],
              shading: { fill: "F2F2F2" }
            }),
            new TableCell({
              width: { size: 42, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: "Butir Soal", bold: true })] })],
              shading: { fill: "F2F2F2" }
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: "Pilihan Jawaban", bold: true })] })],
              shading: { fill: "F2F2F2" }
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: "Kunci Jawaban & Pembahasan", bold: true })] })],
              shading: { fill: "F2F2F2" }
            })
          ]
        })
      ];

      rpp.instrumen_asesmen?.soal_evaluasi.forEach((soal, index) => {
        mcqTableRows.push(new TableRow({
          children: [
            new TableCell({
              width: { size: 8, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: String(index + 1) })] })]
            }),
            new TableCell({
              width: { size: 42, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: soal.pertanyaan })] })]
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: soal.pilihan_jawaban.map(p => new Paragraph({ children: [new TextRun({ text: p, size: 18 })] }))
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ children: [new TextRun({ text: `Kunci & Pembahasan: ${soal.kunci_jawaban}`, bold: true })] })
              ]
            })
          ]
        }));
      });

      const docMcqTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: createBorderThinBlack(),
        rows: mcqTableRows
      });
      docChildren.push(docMcqTable);
    }

    // IV/V. ICE BREAKING & MEDIA SUPLEMENTAL
    docChildren.push(sectionTitle("IV. ICE BREAKING & MEDIA SUPLEMENTAL"));

    docChildren.push(subHeading("A. RINCIAN PERMAINAN PENYEGAR KELAS (ICE BREAKING)"));
    docChildren.push(new Paragraph({
      children: [
        new TextRun({ text: "Nama Permainan: ", bold: true }),
        new TextRun({ text: iceBreaking.nama_game })
      ]
    }));
    docChildren.push(new Paragraph({ children: [new TextRun({ text: "Instruksi & Prosedur Cara Bermain Guru:" })], spacing: { before: 100 } }));
    docChildren.push(...textToParagraphs(iceBreaking.cara_bermain_detail));

    docChildren.push(subHeading("B. RANCANGAN SLIDE PRESENTASI POWERPOINT (OUTLINE)"));
    if (slides && slides.length > 0) {
      slides.forEach(slide => {
        docChildren.push(new Paragraph({
          children: [
            new TextRun({ text: `Slide ${slide.slide_nomor}: ${slide.judul_halaman}`, bold: true })
          ],
          spacing: { before: 100, after: 50 }
        }));
        docChildren.push(new Paragraph({
          children: [
            new TextRun({ text: `Template Layout: ${slide.layout_template}`, italics: true, size: 18 })
          ],
          spacing: { after: 50 }
        }));
        slide.isi_poin_materi.forEach(point => {
          docChildren.push(new Paragraph({
            children: [
              new TextRun({ text: `• ${point}` })
            ]
          }));
        });
        if (slide.image_generation_prompt) {
          docChildren.push(new Paragraph({
            children: [
              new TextRun({ text: `Prompt Visual: ${slide.image_generation_prompt}`, italics: true, size: 18, color: "555555" })
            ],
            spacing: { before: 50 }
          }));
        }
      });
    } else {
      docChildren.push(new Paragraph({ children: [new TextRun({ text: "Gunakan media presentasi visual Kurikulum Merdeka terintegrasi." })] }));
    }

    docChildren.push(subHeading("C. REKOMENDASI MEDIA AUDIO-VISUAL (YOUTUBE INTEGRATION)"));
    docChildren.push(new Paragraph({
      children: [
        new TextRun({ text: "Kueri Pencarian YouTube Utama: ", bold: true }),
        new TextRun({ text: `"${youtubeSaran ? youtubeSaran.keyword_pencarian_utama : `${subject} ${classLevel} Kurikulum Merdeka`}"` })
      ]
    }));
    docChildren.push(new Paragraph({
      children: [
        new TextRun({ text: "Metodologi: Tayangkan video rujukan berdurasi 5-10 menit di tengah Kegiatan Inti RPP guna merangsang daya nalar siswa.", italics: true, size: 18 })
      ],
      spacing: { before: 50 }
    }));

    if (p5Theme) {
      // Heading IV: LEMBAR REFLEKSI SISWA & RUBRIK PENILAIAN KARAKTER P5
      docChildren.push(new Paragraph({
        children: [
          new TextRun({
            text: "IV. LEMBAR REFLEKSI SISWA & RUBRIK PENILAIAN KARAKTER P5",
            bold: true,
            size: 24,
            color: "1E3A8A"
          })
        ],
        spacing: { before: 300, after: 150 }
      }));

      // Paragraph Intro
      docChildren.push(new Paragraph({
        children: [
          new TextRun({
            text: "Berikut adalah lembar kerja refleksi mandiri untuk seluruh peserta didik serta instrumen rubrik penilaian perkembangan karakter Profil Pelajar Pancasila sesuai dengan standar regulasi Kurikulum Merdeka.",
            size: 20,
            italics: true
          })
        ],
        spacing: { before: 100, after: 200 }
      }));

      // A. Lembar Refleksi Siswa
      docChildren.push(new Paragraph({
        children: [
          new TextRun({
            text: "A. LEMBAR REFLEKSI MANDIRI SISWA (PROYEK P5)",
            bold: true,
            size: 22
          })
        ],
        spacing: { before: 200, after: 100 }
      }));

      const refleksiQuestions = [
        "1. Apa hal paling berharga/menarik yang kamu pelajari selama melaksanakan proyek bertema ini?",
        "2. Hambatan atau kesulitan apa saja yang kamu hadapi dan bagaimana caramu mengatasinya secara mandiri maupun berkelompok?",
        "3. Hal apa yang ingin kamu lakukan secara lebih baik lagi jika proyek aksi nyata serupa dilaksanakan di waktu mendatang?"
      ];

      refleksiQuestions.forEach(q => {
        docChildren.push(new Paragraph({
          children: [
            new TextRun({ text: q, bold: true, size: 20 })
          ],
          spacing: { before: 120, after: 60 }
        }));
        // Provide space for students to write
        docChildren.push(new Paragraph({
          children: [
            new TextRun({ text: "Jawaban Refleksi: ...........................................................................................................................................................................................", size: 18, color: "555555" })
          ],
          spacing: { before: 60, after: 180 }
        }));
      });

      // B. Rubrik Penilaian Perkembangan Karakter P5
      docChildren.push(new Paragraph({
        children: [
          new TextRun({
            text: "B. RUBRIK PENILAIAN PERKEMBANGAN KARAKTER PROFIL PELAJAR PANCASILA",
            bold: true,
            size: 22
          })
        ],
        spacing: { before: 250, after: 120 }
      }));

      // Define standard Rubric Table
      const rubricTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: createBorderThinBlack(),
        rows: [
          // Header Row
          new TableRow({
            children: [
              new TableCell({
                width: { size: 20, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "Karakter / Dimensi", bold: true, size: 20 })], alignment: AlignmentType.CENTER })]
              }),
              new TableCell({
                width: { size: 20, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "Belum Berkembang (BB)", bold: true, size: 18 })], alignment: AlignmentType.CENTER })]
              }),
              new TableCell({
                width: { size: 20, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "Mulai Berkembang (MB)", bold: true, size: 18 })], alignment: AlignmentType.CENTER })]
              }),
              new TableCell({
                width: { size: 20, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "Berkembang Sesuai Harapan (BSH)", bold: true, size: 18 })], alignment: AlignmentType.CENTER })]
              }),
              new TableCell({
                width: { size: 20, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "Sangat Berkembang (SB)", bold: true, size: 18 })], alignment: AlignmentType.CENTER })]
              }),
            ],
            tableHeader: true
          }),
          // Row 1: Gotong Royong / Kolaborasi
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "Gotong Royong & Kolaborasi", bold: true, size: 18 })] })]
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "Kesulitan berpartisipasi aktif dan jarang berkontribusi dalam kerja kelompok.", size: 18 })] })]
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "Mulai berpartisipasi dengan dorongan berkala dari fasilitator/teman.", size: 18 })] })]
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "Secara sukarela berkonsultasi, berbagi tugas, dan kompak menyukseskan tim.", size: 18 })] })]
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "Mampu memimpin pembagian tugas kelompok secara demokratis dan memecahkan konflik.", size: 18 })] })]
              }),
            ]
          }),
          // Row 2: Mandiri
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "Kemandirian & Tanggung Jawab", bold: true, size: 18 })] })]
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "Membutuhkan pengawasan penuh dalam menyelesaikan tugas proyek sederhana.", size: 18 })] })]
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "Dapat menyelesaikan tugas pokok dengan pengawasan sesekali saja.", size: 18 })] })]
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "Mandiri mengelola target, menyusun draf laporan, dan berinisiatif tinggi.", size: 18 })] })]
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "Mampu merencanakan aksi nyata berkelanjutan tanpa bimbingan fasilitator.", size: 18 })] })]
              }),
            ]
          }),
          // Row 3: Bernalar Kritis / Kreatif
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "Bernalar Kritis & Kreatif", bold: true, size: 18 })] })]
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "Menerima ide kelompok mentah-mentah tanpa meragukan validitas atau kontribusi.", size: 18 })] })]
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "Mampu memberikan saran alternatif sesekali bernilai estetika sederhana.", size: 18 })] })]
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "Menganalisis aneka data isu secara sistematis serta merancang aksi nyata unik.", size: 18 })] })]
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "Mengasimilasikan inovasi teknologi atau solusi lingkungan yang berimpak luas.", size: 18 })] })]
              }),
            ]
          }),
        ]
      });

      docChildren.push(rubricTable);
      
      // Spacing after table
      docChildren.push(new Paragraph({ children: [], spacing: { after: 300 } }));
    }

    // Signatures
    docChildren.push(new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: `Ditandatangani secara sah di lingkungan ${profileSchool}`, size: 20 })
      ],
      spacing: { before: 400 }
    }));

    docChildren.push(new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: `(${profileName})`, bold: true, size: 20 })
      ],
      spacing: { before: 600 }
    }));

    docChildren.push(new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: `NIP: ${profileNip || "..................................."}`, size: 18 })
      ],
      spacing: { before: 100 }
    }));

    const marginMap = {
      standard: 1440, // 1 in
      narrow: 720,    // 0.5 in
      wide: 2160,     // 1.5 in
    };
    const marginVal = marginMap[wordMargin] || 1440;

    const doc = new Document({
      sections: [
        {
          children: docChildren,
          properties: {
            page: {
              margin: {
                top: marginVal,
                bottom: marginVal,
                left: marginVal,
                right: marginVal,
              },
            },
          },
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeFilename = p5Theme
        ? `Modul_Proyek_P5_${p5Theme.replace(/\s+/g, "_")}_${(classLevel || "").replace(/\s+/g, "")}.docx`
        : `Modul_Ajar_RPP_Lengkap_${(subject || "").replace(/\s+/g, "_")}_${(classLevel || "").replace(/\s+/g, "")}.docx`;
      link.download = safeFilename;
      link.click();
      URL.revokeObjectURL(url);
      showToast(p5Theme ? "📥 Modul Proyek P5 (.DOCX) lengkap sukses diproduksi!" : "📥 Modul RPP, LKPD, & Asesmen (.DOCX) Word-Ready sukses diterbitkan!");
    }).catch((err: any) => {
      console.error(err);
      showToast("❌ Gagal membuat dokumen DOCX: " + translateErrorMessage(err));
    });
  };

  const downloadRppDocHtml = () => {
    // Word export helper to convert Markdown content into a highly professional inline HTML string
    const parseMarkdown = (text: string) => {
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
            
            html += `<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; border: 1.5px solid #1e3a8a; font-family: '${selectedFont}', sans-serif; font-size: 10.5pt; width: 100%; margin: 20px 0;">`;
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
          html += `<h4 style="color: #0f766e; font-family: '${selectedFont}', sans-serif; font-size: 11pt; font-weight: bold; margin-top: 18px; margin-bottom: 6px; text-transform: uppercase;">◆ ${content}</h4>`;
          i++;
          continue;
        }
        if (trimmed.startsWith("##")) {
          const content = trimmed.replace(/^##+\s*/, "");
          html += `<h3 style="color: #1e3a8a; font-family: '${selectedFont}', sans-serif; font-size: 13pt; font-weight: bold; margin-top: 24px; margin-bottom: 8px; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 4px; text-transform: uppercase;">${content}</h3>`;
          i++;
          continue;
        }
        if (trimmed.startsWith("#")) {
          const content = trimmed.replace(/^#\s*/, "");
          html += `<h2 style="color: #1a365d; font-family: '${selectedFont}', sans-serif; font-size: 15pt; font-weight: bold; margin-top: 30px; margin-bottom: 12px; border-bottom: 2px solid #1a365d; padding-bottom: 6px; text-align: center; text-transform: uppercase;">${content}</h2>`;
          i++;
          continue;
        }
        
        // 4. Bullet list
        if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("•")) {
          html += `<ul style="margin: 8px 0 12px 25px; padding: 0; list-style-type: disc;">`;
          while (i < lines.length && (lines[i].trim().startsWith("-") || lines[i].trim().startsWith("*") || lines[i].trim().startsWith("•"))) {
            const itemText = lines[i].trim().substring(1).trim().replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
            html += `<li style="margin-bottom: 5px; font-family: '${selectedFont}', sans-serif; font-size: 11pt; color: #333333; line-height: 1.4;">${itemText}</li>`;
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
              html += `<li style="margin-bottom: 5px; font-family: '${selectedFont}', sans-serif; font-size: 11pt; color: #333333; line-height: 1.4;">${itemText}</li>`;
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
          html += `<div style="border-left: 4px solid #f59e0b; padding: 12px; margin: 15px 0; font-family: '${selectedFont}', sans-serif; font-style: italic; color: #4b5563; background-color: #fffbeb; border-radius: 4px;">${blockContent}</div>`;
          i++;
          continue;
        }
        
        // 7. Regular paragraph
        if (trimmed) {
          const boldedLine = line.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
          html += `<p style="margin: 10px 0; font-family: '${selectedFont}', sans-serif; font-size: 11pt; color: #333333; text-align: justify; line-height: 1.5; mso-line-height-rule: exactly;">${boldedLine}</p>`;
        } else {
          html += `<div style="height: 12px;"></div>`;
        }
        i++;
      }
      return html;
    };

    const finalSubject = (subject === "Input Mapel Manual (Ketik Sendiri)" || subject === "Semua Mata Pelajaran")
      ? (manualSubject || "").trim()
      : subject;

    const htmlMarginMap = {
      standard: "1.0in",
      narrow: "0.5in",
      wide: "1.5in",
    };
    const marginValue = htmlMarginMap[wordMargin] || "1.0in";

    const kopHtml = `
      <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-bottom: 4px double #1e3a8a; padding-bottom: 12px; margin-bottom: 25px; font-family: '${selectedFont}', sans-serif;">
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

      <table border="0" cellpadding="6" cellspacing="0" style="width: 100%; margin-bottom: 25px; background-color: #f8fafc; border: 1.5px solid #cbd5e1; font-family: '${selectedFont}', sans-serif; font-size: 10pt; padding: 10px;">
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

    // Process structured chapters or content
    let compiledRppHtml = "";
    if (magicStudioOutput) {
      const out = magicStudioOutput;
      compiledRppHtml = `
        <h3 style="color: #1e3a8a; font-family: '${selectedFont}', sans-serif; font-size: 13pt; font-weight: bold; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 4px; margin-top: 24px; text-transform: uppercase;">I. KOMPONEN UMUM RPP</h3>
        <div>${parseMarkdown(out.rpp_merdeka_formal.komponen_umum)}</div>
        
        <h3 style="color: #1e3a8a; font-family: '${selectedFont}', sans-serif; font-size: 13pt; font-weight: bold; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 4px; margin-top: 24px; text-transform: uppercase;">II. TUJUAN PEMBELAJARAN</h3>
        <div>${parseMarkdown(out.rpp_merdeka_formal.tujuan_pembelajaran)}</div>

        <h3 style="color: #1e3a8a; font-family: '${selectedFont}', sans-serif; font-size: 13pt; font-weight: bold; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 4px; margin-top: 24px; text-transform: uppercase;">III. SKENARIO PEMBELAJARAN RINCI</h3>
        <div>${parseMarkdown(out.rpp_merdeka_formal.langkah_pembelajaran_rinci)}</div>

        <div class="page-break"></div>
        <h3 style="color: #16a34a; font-family: '${selectedFont}', sans-serif; font-size: 13pt; font-weight: bold; border-bottom: 1.5px solid #16a34a; padding-bottom: 4px; margin-top: 24px; text-transform: uppercase;">IV. LEMBAR KERJA PESERTA DIDIK (LKPD)</h3>
        <p style="font-weight: bold;">Judul Aktivitas: ${out.lembar_kerja_peserta_didik_lkpd.judul_aktivitas}</p>
        <p><strong>Petunjuk Belajar:</strong></p>
        <p>${out.lembar_kerja_peserta_didik_lkpd.petunjuk_belajar.replace(/\n/g, "<br/>")}</p>
        <p><strong>Tugas Lapangan / Soal Detil:</strong></p>
        <ol>
          ${out.lembar_kerja_peserta_didik_lkpd.soal_atau_tugas_lapangan.map(t => `<li>${t}</li>`).join("")}
        </ol>

        <div class="page-break"></div>
        <h3 style="color: #9333ea; font-family: '${selectedFont}', sans-serif; font-size: 13pt; font-weight: bold; border-bottom: 1.5px solid #9333ea; padding-bottom: 4px; margin-top: 24px; text-transform: uppercase;">V. INSTRUMEN ASESMEN & EVALUASI</h3>
        <p><strong>Tipe Asesmen:</strong> ${out.paket_asesmen_penilaian_lengkap.tipe}</p>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; border: 1.5px solid #9333ea; font-family: '${selectedFont}', sans-serif; font-size: 10.5pt; width: 100%; margin: 20px 0;">
          <tr style="background-color: #9333ea; color: #ffffff; font-weight: bold;">
            <th style="width: 8%;">No</th>
            <th style="width: 45%;">Pertanyaan Soal</th>
            <th style="width: 27%;">Pilihan Jawaban</th>
            <th style="width: 20%;">Kunci &amp; Pembahasan</th>
          </tr>
          ${out.paket_asesmen_penilaian_lengkap.butir_soal_multiple_choice.map(soal => `
            <tr>
              <td style="text-align: center; vertical-align: top;">${soal.no}</td>
              <td style="vertical-align: top;">${soal.pertanyaan}</td>
              <td style="vertical-align: top;">${soal.pilihan.join(" <br/> ")}</td>
              <td style="vertical-align: top; font-weight: bold; color: #701a75;">Kunci: ${soal.kunci}<br/><span style="font-weight: normal; font-size: 9pt; color: #555;">${soal.pembahasan}</span></td>
            </tr>
          `).join("")}
        </table>
      `;
    } else {
      compiledRppHtml = `
        <h3 style="color: #1e3a8a; font-family: '${selectedFont}', sans-serif; font-size: 13pt; font-weight: bold; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 4px; margin-top: 24px; text-transform: uppercase;">I. TUJUAN PEMBELAJARAN</h3>
        <div>${parseMarkdown(rpp.komponen_inti.tujuan_pembelajaran)}</div>
        
        <h3 style="color: #1e3a8a; font-family: '${selectedFont}', sans-serif; font-size: 13pt; font-weight: bold; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 4px; margin-top: 24px; text-transform: uppercase;">II. MATERI POKOK PEMBELAJARAN</h3>
        <div>${parseMarkdown(rpp.komponen_inti.materi_pokok)}</div>

        <h3 style="color: #1e3a8a; font-family: '${selectedFont}', sans-serif; font-size: 13pt; font-weight: bold; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 4px; margin-top: 24px; text-transform: uppercase;">III. LANGKAH-LANGKAH PEMBELAJARAN</h3>
        <p style="margin-top: 10px; font-weight: bold; font-family: '${selectedFont}', sans-serif; font-size: 11pt; color: #1e3a8a;">A. KEGIATAN PEMBUKA</p>
        <p style="font-family: '${selectedFont}', sans-serif; font-size: 11pt; color: #333333; line-height: 1.5; text-align: justify; margin-left: 15px;">${rpp.langkah_pembelajaran.kegiatan_pembuka.replace(/\n/g, "<br/>")}</p>
        
        <p style="margin-top: 15px; font-weight: bold; font-family: '${selectedFont}', sans-serif; font-size: 11pt; color: #1e3a8a;">B. KEGIATAN INTI YAYASAN BELAJAR</p>
        <p style="font-family: '${selectedFont}', sans-serif; font-size: 11pt; color: #333333; line-height: 1.5; text-align: justify; margin-left: 15px;">${rpp.langkah_pembelajaran.kegiatan_inti_mendalam.replace(/\n/g, "<br/>")}</p>
        
        <p style="margin-top: 15px; font-weight: bold; font-family: '${selectedFont}', sans-serif; font-size: 11pt; color: #1e3a8a;">C. KEGIATAN PENUTUP & REFLEKSI</p>
        <p style="font-family: '${selectedFont}', sans-serif; font-size: 11pt; color: #333333; line-height: 1.5; text-align: justify; margin-left: 15px;">${rpp.langkah_pembelajaran.kegiatan_penutup.replace(/\n/g, "<br/>")}</p>

        <div class="page-break"></div>
        <h3 style="color: #16a34a; font-family: '${selectedFont}', sans-serif; font-size: 13pt; font-weight: bold; border-bottom: 1.5px solid #16a34a; padding-bottom: 4px; margin-top: 24px; text-transform: uppercase;">IV. LEMBAR KERJA PESERTA DIDIK (LKPD)</h3>
        <p style="font-weight: bold;">Judul Aktivitas: ${lkpd.judul_aktivitas}</p>
        <p><strong>Petunjuk Belajar:</strong></p>
        <p>${lkpd.petunjuk_kerja.replace(/\n/g, "<br/>")}</p>
        <p><strong>Pertanyaan Evaluasi Kelompok:</strong></p>
        <ol>
          ${lkpd.tugas_soal_kelompok.map(t => `<li>${t}</li>`).join("")}
        </ol>

        <div class="page-break"></div>
        <h3 style="color: #9333ea; font-family: '${selectedFont}', sans-serif; font-size: 13pt; font-weight: bold; border-bottom: 1.5px solid #9333ea; padding-bottom: 4px; margin-top: 24px; text-transform: uppercase;">V. INSTRUMEN ASESMEN</h3>
        <p><strong>Jenis Asesmen:</strong> Asesmen ${rpp.instrumen_asesmen?.jenis_asesmen || "Formatif"}</p>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; border: 1.5px solid #9333ea; font-family: '${selectedFont}', sans-serif; font-size: 10.5pt; width: 100%; margin: 20px 0;">
          <tr style="background-color: #9333ea; color: #ffffff; font-weight: bold;">
            <th style="width: 10%;">No</th>
            <th style="width: 50%;">Butir Soal Evaluasi Mandiri</th>
            <th style="width: 40%;">Pilihan &amp; Kunci Jawaban</th>
          </tr>
          ${rpp.instrumen_asesmen?.soal_evaluasi.map((soal, sIdx) => `
            <tr>
              <td style="text-align: center; vertical-align: top;">${sIdx + 1}</td>
              <td style="vertical-align: top;">${soal.pertanyaan}</td>
              <td style="vertical-align: top;">
                ${soal.pilihan_jawaban.join(" <br/> ")}
                <div style="margin-top: 8px; font-weight: bold; color: #9333ea;">Kunci: ${soal.kunci_jawaban}</div>
              </td>
            </tr>
          `).join("") || ""}
        </table>
      `;
    }

    const signaturesHtml = `
      <br/><br/>
      <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-top: 40px; font-family: '${selectedFont}', sans-serif; font-size: 11pt;">
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

    const borderSurroundHeader = wordHeaderNoBorders ? "mso-page-border-surround-header: no;" : "";
    const borderSurroundFooter = wordHeaderNoBorders ? "mso-page-border-surround-footer: no;" : "";

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Perangkat Ajar Kurikulum Merdeka - GuruPintar</title>
        <style>
          @page {
            size: 8.5in 11in;
            margin: ${marginValue};
            mso-header-margin: .5in;
            mso-footer-margin: .5in;
            ${borderSurroundHeader}
            ${borderSurroundFooter}
          }
          div.Section1 {
            page: Section1;
          }
          body { font-family: '${selectedFont}', sans-serif; line-height: 1.6; }
          h2.section-header { text-align: center; font-size: 14pt; font-weight: bold; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 6px; margin-top: 35px; text-transform: uppercase; }
          .page-break { page-break-before: always; }
        </style>
      </head>
      <body>
        <div class="Section1">
          ${kopHtml}
          ${compiledRppHtml}
          ${signaturesHtml}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeFilename = p5Theme
      ? `Modul_Proyek_P5_${p5Theme.replace(/\s+/g, "_")}_Formatted.doc`
      : `Modul_Ajar_RPP_Lengkap_${(subject || "").replace(/\s+/g, "_")}_Formatted.doc`;
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`📝 Sukses mengekspor Dokumen Word (.DOC) berkualitas prima! CSS clean page-border terinjeksi sempurna.`);
  };

  return (
    <div className="space-y-6">
      
      {/* FULL WIDTH DRAFTS WORKSPACE */}
      <div className="w-full flex flex-col gap-4 animate-fade-in">

        {/* TAB SELEKSI HASIL DOKUMEN MODULAR (BERSIH & SIMPEL) */}
        <div className="bg-slate-150/40 border border-slate-200/80 rounded-2xl p-2 select-none no-print">
          <div className="flex items-center justify-between px-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span className="text-[9.5px] font-black text-slate-700 uppercase tracking-wider">Hasil Formulasi AI</span>
            </div>
            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">Pilih Dokumen</span>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none snap-x">
            {[
              { id: "rpp", key: "modul_ajar" as const, label: "Modul Ajar RPP", icon: "📋" },
              { id: "lkpd", key: "lkpd" as const, label: "LKPD", icon: "📝" },
              { id: "asesmen", key: "asesmen" as const, label: "Asesmen", icon: "📊" },
              { id: "soal_ujian", key: "soal_ujian" as const, label: "Soal Ujian", icon: "✏️" }
            ].map((item) => {
              const aktif = viewMode === item.id;
              
              const sudahAda = 
                item.id === "rpp" || 
                !!dokumenResult[item.key] || 
                (item.id === "lkpd" && !!rpp?.langkah_pembelajaran) || 
                (item.id === "asesmen" && !!rpp?.instrumen_asesmen?.soal_evaluasi);
                
              const sedangDibuat = generatingDokumen === item.key;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setViewMode(item.id as any);
                    if (setSelectedDokumen) {
                      setSelectedDokumen(item.key);
                    }
                    showToast(`📄 Menampilkan ${item.label}`);
                  }}
                  className={`snap-start min-w-max flex items-center gap-2 py-2 px-4 rounded-xl border transition-all duration-150 cursor-pointer text-xs font-bold ${
                    aktif 
                      ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs" 
                      : "border-transparent bg-white/70 text-slate-600 hover:text-slate-800 hover:bg-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  
                  {/* Compact Status dot/icon indicator to save massive horizontal space */}
                  <span className="flex items-center shrink-0">
                    {sedangDibuat ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                    ) : sudahAda ? (
                      <span className={`text-[10px] ${aktif ? "text-emerald-300" : "text-emerald-500"}`}>●</span>
                    ) : (
                      <span className="text-[10px] text-slate-300">○</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-3xs flex flex-col justify-between">
          {/* Upper toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100 mb-4 select-none">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 text-left">
                <FileText className="w-5 h-5 text-[#1E3A8A] shrink-0" />
                <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mt-0.5 flex items-center gap-1.5 font-sans">
                    {viewMode === "rpp" ? "Modul Ajar RPP Merdeka" :
                     viewMode === "tp_atp" ? "TP & ATP Integrasi" :
                     viewMode === "lkpd" ? "LKPD Siswa Mandiri" :
                     viewMode === "asesmen" ? "Asesmen & Rubrik Penilaian" :
                     "Kisi & Soal Ujian Akhir"}
                  </h4>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
                {/* Focus View */}
                <button
                  type="button"
                  onClick={() => {
                    setIsFocusView(!isFocusView);
                    showToast(isFocusView ? "👁️ Mode biasa aktif" : "👁️ Mode Focus View aktif");
                  }}
                  className={`flex items-center gap-1.5 rounded-xl py-1.5 px-3 text-[10px] font-black transition select-none cursor-pointer border ${
                    isFocusView 
                      ? "bg-indigo-50 border-indigo-200 text-[#1E3A8A] hover:bg-indigo-100" 
                      : "bg-white border-slate-250 text-slate-700 hover:bg-slate-50"
                  }`}
                  title="Toggle Mode Focus View (Sembunyikan Sidebar & Navigasi)"
                >
                  {isFocusView ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Biasa</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Focus View</span>
                    </>
                  )}
                </button>

                {/* Pratinjau */}
                <button type="button"
                  onClick={() => setIsPdfPreviewOpen(!isPdfPreviewOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black transition cursor-pointer border ${
                    isPdfPreviewOpen
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}>
                  <Eye className="w-3.5 h-3.5" />
                  Pratinjau
                </button>

                {/* Edit */}
                <button type="button"
                  onClick={() => { setIsEditMode(!isEditMode); showToast(isEditMode ? "✅ Mode edit nonaktif." : "✏️ Mode edit aktif."); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black transition cursor-pointer border ${
                    isEditMode
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-slate-50"
                  }`}>
                  <PenLine className="w-3.5 h-3.5" />
                  {isEditMode ? "Sedang Edit" : "Edit"}
                </button>

                {/* Simpan */}
                {onSaveToLibrary && (
                  <button type="button"
                    disabled={isSavedToLib}
                    onClick={() => {
                      const finalSubjName = (subject === "Input Mapel Manual (Ketik Sendiri)" || subject === "Semua Mata Pelajaran")
                        ? manualSubject || "Materi Kustom" : subject;
                      const combinedResult = {
                        modul_ajar_rpp_merdeka: rpp,
                        ppt_canva_ready_slides: slides || [],
                        saran_youtube_spesifik: youtubeSaran || { keyword_pencarian_utama: "" },
                        magic_studio_output: magicStudioOutput,
                        metode_pembelajaran: selectedMetode
                      };
                      onSaveToLibrary(finalSubjName, classLevel, finalSubjName,
                        materialText || rpp.komponen_inti.materi_pokok || "Materi.",
                        combinedResult);
                      setIsSavedToLib(true);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black transition cursor-pointer border ${
                      isSavedToLib
                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                        : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    }`}>
                    <Save className="w-3.5 h-3.5" />
                    {isSavedToLib ? "Tersimpan" : "Simpan"}
                  </button>
                )}

                {/* Download Word */}
                <button type="button"
                  onClick={() => onDownloadDocx?.(
                    magicStudioOutput?.rpp_merdeka_formal?.langkah_pembelajaran_rinci || "",
                    `Modul_Ajar_${classLevel}_${subject}`
                  )}
                  className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-3 py-1.5 rounded-xl text-[10px] font-black transition cursor-pointer">
                  <Download className="w-3.5 h-3.5" />
                  .DOCX
                </button>

                {/* Cetak PDF */}
                <button type="button"
                  onClick={handleCetakPdf}
                  className="flex items-center gap-1.5 bg-[#1E3A8A] hover:bg-blue-800 text-white px-4 py-1.5 rounded-xl text-[10px] font-black transition cursor-pointer shadow-sm">
                  <Printer className="w-3.5 h-3.5" />
                  Cetak PDF
                </button>
              </div>
            </div>

            {/* Elegant Print Mode Indicator */}
            <div className="mb-4 bg-emerald-50 border border-emerald-150 p-2.5 rounded-xl text-center select-none no-print animate-fade-in font-sans">
              <span className="text-[10px] text-emerald-800 font-extrabold flex items-center justify-center gap-1.5 uppercase tracking-wide">
                ✅ Siap cetak — unduh sebagai .DOCX atau langsung cetak.
              </span>
            </div>

            {/* Conditional AI Formulation Banner Callouts (Placed outside paper area for pristine print layout) */}
            {viewMode === "tp_atp" && !dokumenResult?.tp_atp && (
              <div className="mb-4 bg-indigo-50/70 border border-indigo-150 p-4 rounded-2xl text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none no-print animate-fade-in">
                <div className="space-y-1">
                  <p className="text-xs font-black text-indigo-950 uppercase flex items-center gap-1">
                    <span>⚡</span> BUAT DETAIL TP-ATP DIVERSIFIKASI AI
                  </p>
                  <p className="text-slate-600 text-[10.5px] font-semibold leading-relaxed">
                    Tujuan &amp; Alur Belajar komprehensif terpadu dapat dirumuskan secara mandiri berbasis AI secara instan.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={generatingDokumen === "tp_atp"}
                  onClick={() => handleGenerateDokumen?.("tp_atp")}
                  className="bg-[#1E3A8A] text-white text-[11px] font-black px-4 py-2 rounded-xl hover:bg-slate-900 transition shadow-2xs shrink-0 cursor-pointer border-0"
                >
                  {generatingDokumen === "tp_atp" ? "⏳ Menyusun..." : "⚡ Buat TP & ATP Komprehensif"}
                </button>
              </div>
            )}

            {viewMode === "lkpd" && !dokumenResult?.lkpd && (
              <div className="mb-4 bg-blue-50/70 border border-blue-150 p-4 rounded-2xl text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none no-print animate-fade-in">
                <div className="space-y-1">
                  <p className="text-xs font-black text-blue-950 uppercase flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-blue-600 shrink-0" /> BUAT LEMBAR KERJA SISWA (LKPD) KUSTOM
                  </p>
                  <p className="text-slate-600 text-[10.5px] font-semibold leading-relaxed">
                    Formulasikan lembar aktivitas, instruksi, dan jurnal reflektif siswa yang mendalam untuk topik ini.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={generatingDokumen === "lkpd"}
                  onClick={() => handleGenerateDokumen?.("lkpd")}
                  className="bg-[#1E3A8A] text-white text-[11px] font-black px-4 py-2 rounded-xl hover:bg-slate-900 transition shadow-2xs shrink-0 cursor-pointer border-0"
                >
                  {generatingDokumen === "lkpd" ? "⏳ Menyusun..." : "⚡ Buat LKPD Kustom AI"}
                </button>
              </div>
            )}

            {viewMode === "asesmen" && !dokumenResult?.asesmen && (
              <div className="mb-4 bg-purple-50/70 border border-purple-150 p-4 rounded-2xl text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none no-print animate-fade-in">
                <div className="space-y-1">
                  <p className="text-xs font-black text-purple-950 uppercase flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-600 shrink-0" /> BUAT INSTRUMEN ASESMEN &amp; RUBRIK PENILAIAN
                  </p>
                  <p className="text-slate-600 text-[10.5px] font-semibold leading-relaxed">
                    Hasilkan kisi-kisi evaluatif term-long dan detail rubrik penilaian objektif kualitatif.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={generatingDokumen === "asesmen"}
                  onClick={() => handleGenerateDokumen?.("asesmen")}
                  className="bg-[#1E3A8A] text-white text-[11px] font-black px-4 py-2 rounded-xl hover:bg-slate-900 transition shadow-2xs shrink-0 cursor-pointer border-0"
                >
                  {generatingDokumen === "asesmen" ? "⏳ Menyusun..." : "⚡ Buat Asesmen & Rubrik AI"}
                </button>
              </div>
            )}

            {viewMode === "soal_ujian" && !dokumenResult?.soal_ujian && (
              <div className="mb-4 bg-rose-50/70 border border-rose-150 p-4 rounded-2xl text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none no-print animate-fade-in">
                <div className="space-y-1">
                  <p className="text-xs font-black text-rose-950 uppercase flex items-center gap-2">
                    <BookMarked className="w-4 h-4 text-rose-600 shrink-0" /> BUAT PAKET BUTIR SOAL UJIAN LENGKAP
                  </p>
                  <p className="text-slate-600 text-[10.5px] font-semibold leading-relaxed">
                    Formulasikan butir soal pilihan ganda, essay nalar tinggi (HOTS) beserta kunci jawaban lengkap.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={generatingDokumen === "soal_ujian"}
                  onClick={() => handleGenerateDokumen?.("soal_ujian")}
                  className="bg-[#1E3A8A] text-white text-[11px] font-black px-4 py-2 rounded-xl hover:bg-slate-900 transition shadow-2xs shrink-0 cursor-pointer border-0"
                >
                  {generatingDokumen === "soal_ujian" ? "⏳ Menyusun..." : "⚡ Buat Soal Ujian & Kunci AI"}
                </button>
              </div>
            )}

        {/* Structured paper layout mockup */}
        <div 
          id="rpp-print-area"
          contentEditable={isEditMode}
          suppressContentEditableWarning={true}
          style={{ fontFamily: selectedFont === "Arial" ? "Arial, Helvetica, sans-serif" : "'Times New Roman', Times, serif", color: "#000000" }}
          className={`bg-white p-4 sm:p-8 text-[12.5px] sm:text-[13px] leading-relaxed text-black overflow-y-auto select-text border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
            isFocusView ? "max-h-[1400px]" : "max-h-[700px]"
          }`}
        >
          
          {/* KOP Surat Header segment */}
          <div className="border-b-4 border-double border-black pb-4 mb-6 text-center select-text shrink-0 font-sans">
            <h2 className="text-black font-black text-xs sm:text-base uppercase tracking-wider">{profileSchool}</h2>
            <p className="text-[9px] sm:text-[10px] text-slate-800 font-semibold uppercase mt-0.5">TERAKREDITASI NASIONAL • KOMUNITAS GURU MERDEKA</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-left text-[9px] sm:text-[10px] text-slate-800 mt-3 border-t border-black pt-2 font-bold uppercase">
              <div>GURU: <span className="text-black font-black">{profileName}</span></div>
              <div className="text-right sm:text-right">NIP: <span className="text-black font-black">{profileNip || "BELUM DIATUR"}</span></div>
            </div>
          </div>

          <div className="space-y-8">
            {viewMode === "rpp" && (
              <>
                {dokumenResult?.modul_ajar ? (
                  <div className="space-y-6 text-black select-text">
                    <div className="text-center space-y-1 mb-8 font-sans">
                      <h3 className="text-sm font-black text-center text-black uppercase tracking-wider">
                        MODUL AJAR KURIKULUM MERDEKA (FORMULA MANDIRI)
                      </h3>
                      <p className="text-[10px] text-slate-705 font-bold uppercase tracking-wide">
                        HASIL PENYUSUNAN MODUL SPESIFIK AI
                      </p>
                    </div>
                    {renderStepwiseContent(dokumenResult.modul_ajar, profileSchool, profileName, profileNip)}
                  </div>
                ) : (
                  <div className="space-y-6 text-black select-text">
              {/* Title */}
              <div className="text-center space-y-1 mb-8">
                <h3 className="text-sm font-black text-center text-black font-sans uppercase tracking-wider">
                  RENCANA PELAKSANAAN PEMBELAJARAN (RPP) / MODUL AJAR
                </h3>
                <p className="text-[10px] text-slate-700 font-bold uppercase tracking-wide font-sans">
                  STANDARISASI KURIKULUM MERDEKA BELAJAR TERPADU 2026
                </p>
              </div>

              {/* I. KOMPONEN IDENTITAS LENGKAP - WORD TABLE FORMAT */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-black uppercase tracking-wide font-sans pb-1 border-b border-black">
                  I. IDENTITAS MODUL AJAR
                </h4>
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full min-w-[500px] border-collapse border border-black text-[11px] text-left font-sans text-black">
                    <tbody>
                      <tr>
                        <td className="border border-black p-2 font-black w-1/4 uppercase bg-slate-50">Instansi / Sekolah</td>
                        <td className="border border-black p-2 font-bold w-1/4">{profileSchool}</td>
                        <td className="border border-black p-2 font-black w-1/4 uppercase bg-slate-50">Mata Pelajaran</td>
                        <td className="border border-black p-2 font-bold w-1/4">{subject}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 font-black uppercase bg-slate-50">Kelas &amp; Semester</td>
                        <td className="border border-black p-2 font-bold">{classLevel} / Ganjil</td>
                        <td className="border border-black p-2 font-black uppercase bg-slate-50">Alokasi Waktu</td>
                        <td className="border border-black p-2 font-bold">2 JP (2 x 35 Menit)</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 font-black uppercase bg-slate-50">Pendidik Utama</td>
                        <td className="border border-black p-2 font-bold">{profileName}</td>
                        <td className="border border-black p-2 font-black uppercase bg-slate-50">NIP Pegawai</td>
                        <td className="border border-black p-2 font-bold">{profileNip || "..................................."}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 font-black uppercase bg-slate-50">Model Pembelajaran</td>
                        <td className="border border-black p-2 font-bold" colSpan={3}>
                          {selectedMetode || "Cooperative Learning"}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-2 font-black uppercase text-[10px] bg-slate-50">Materi Pokok</td>
                        <td className="border border-black p-2 font-bold" colSpan={3}>
                          {magicStudioOutput ? magicStudioOutput.rpp_merdeka_formal.komponen_umum : rpp.komponen_inti.materi_pokok}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* II. TUJUAN, MATERI, METODE, MEDIA */}
              <div className="space-y-5 text-[11.5px] font-sans">
                {/* A. Tujuan Pembelajaran */}
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-black uppercase tracking-wide">
                    II. KOMPONEN INTI AJAR
                  </h4>
                  <p className="font-bold text-black text-[11px] uppercase underline mt-2">A. Tujuan Pembelajaran (Capaian Pembelajaran):</p>
                  <p className="text-black whitespace-pre-line leading-relaxed pl-2 font-medium">
                    {magicStudioOutput ? magicStudioOutput.rpp_merdeka_formal.tujuan_pembelajaran : rpp.komponen_inti.tujuan_pembelajaran}
                  </p>
                </div>

                {/* B. Ringkasan Materi */}
                <div className="space-y-1">
                  <p className="font-bold text-black text-[11px] uppercase underline">B. Ringkasan Deskripsi Materi Pembelajaran:</p>
                  <p className="text-black leading-relaxed pl-2 font-medium">
                    {magicStudioOutput ? magicStudioOutput.rpp_merdeka_formal.komponen_umum : rpp.komponen_inti.materi_pokok}
                  </p>
                </div>

                {/* C. Metode & Media */}
                <div className="space-y-3">
                  <p className="font-bold text-black text-[11px] uppercase underline">C. Metode, Model, dan Alat Media Pembelajaran:</p>
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full min-w-[500px] border border-black border-collapse text-[10.5px]">
                      <tbody>
                        <tr>
                          <td className="border border-black p-2 w-1/2 bg-slate-50/50">
                            <strong className="block text-black uppercase">1. Metode &amp; Model Pembelajaran:</strong>
                            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-black">
                              <li>Metode Utama: Saintifik Prosedural (Eksperimen Terbimbing)</li>
                              <li>Model Pembelajaran: Project-Based Cooperative Learning</li>
                              <li>Kemitraan Kelas: Kolaborasi Kelompok Kecil Mandiri</li>
                            </ul>
                          </td>
                          <td className="border border-black p-2 w-1/2 bg-slate-50/50 text-top">
                            <strong className="block text-black uppercase">2. Media &amp; Sumber Pembelajaran:</strong>
                            <ul className="list-disc pl-4 mt-1 space-y-0.5 text-black">
                              <li>Media Kelas: Slide Presentasi Ajar, Proyektor LCD Instansi, {getActiveMediaPeraga().mediaUtama[0] || "Media Visual"}</li>
                              <li>Bahan Praktikum: {getActiveMediaPeraga().alatBahanKonkret.slice(0, 2).join(", ") || "Alat penunjang aktivitas kelas"}</li>
                              <li>Sumber Referensi: Buku Pegangan Guru Kurikulum Merdeka Kemendikbud</li>
                            </ul>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* D. Daftar Media & Alat Peraga Inti */}
                <div className="space-y-2 mt-2">
                  <p className="font-bold text-black text-[11px] uppercase underline">D. Daftar Media &amp; Alat Peraga Inti:</p>
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full min-w-[500px] border border-black border-collapse text-[10.5px]">
                      <thead>
                        <tr className="bg-slate-50 font-bold uppercase text-[9.5px]">
                          <th className="border border-black p-2 text-left w-1/2">Media Utama (Fisik / Digital)</th>
                          <th className="border border-black p-2 text-left w-1/2">Alat &amp; Bahan Kelas Konkret (Kegiatan Kelompok)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-black p-2 text-top">
                            <ul className="list-disc pl-4 space-y-1 text-black font-medium">
                              {getActiveMediaPeraga().mediaUtama.map((m, idx) => (
                                <li key={idx}>{m}</li>
                              ))}
                            </ul>
                          </td>
                          <td className="border border-black p-2 text-top">
                            <ul className="list-disc pl-4 space-y-1 text-black font-medium">
                              {getActiveMediaPeraga().alatBahanKonkret.map((ab, idx) => (
                                <li key={idx}>{ab}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* III. SKENARIO UTAMA PEMBELAJARAN */}
                <div className="space-y-3 pt-2">
                  <p className="font-bold text-black text-[11px] uppercase pb-1 border-b border-black">
                    III. LANGKAH-LANGKAH PROGRAM KEGIATAN KELAS (SKENARIO SINOPSIS)
                  </p>

                  <div className="space-y-4 font-sans text-black">
                    {/* Kegiatan Pembuka */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center font-bold text-black">
                        <span>A. KEGIATAN PEMBUKA (Apersepsi &amp; Motivasi Kelas)</span>
                        <span className="font-sans text-[10px] text-slate-605">Alokasi: 10 - 15 Menit</span>
                      </div>
                      <p className="leading-relaxed pl-4 whitespace-pre-line text-black">
                        {(() => {
                          const rinci = magicStudioOutput?.rpp_merdeka_formal?.langkah_pembelajaran_rinci;
                          if (rinci) {
                            return rinci.includes("A. KEGIATAN PEMBUKA")
                              ? rinci.split("A. KEGIATAN PEMBUKA")[1]?.split("B. KEGIATAN INTI")[0]
                              : rinci;
                          }
                          return rpp.langkah_pembelajaran.kegiatan_pembuka;
                        })()}
                      </p>
                    </div>

                    {/* Kegiatan Inti */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center font-bold text-black">
                        <span>B. KEGIATAN INTI MENDALAM (Eksperimen Kelompok &amp; LKPD)</span>
                        <span className="font-sans text-[10px] text-slate-605">Alokasi: 45 - 50 Menit</span>
                      </div>
                      <div className="leading-relaxed pl-4 whitespace-pre-line text-black font-sans text-[12px]">
                        {(() => {
                          const rinci = magicStudioOutput?.rpp_merdeka_formal?.langkah_pembelajaran_rinci;
                          if (rinci) {
                            return rinci.includes("B. KEGIATAN INTI")
                              ? rinci.split("B. KEGIATAN INTI")[1]?.split("C. KEGIATAN PENUTUP")[0]
                              : rinci;
                          }
                          return rpp.langkah_pembelajaran.kegiatan_inti_mendalam;
                        })()}
                      </div>
                    </div>

                    {/* Kegiatan Penutup */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center font-bold text-black">
                        <span>C. KEGIATAN PENUTUP (Asesmen Hasil, Umpan Balik &amp; Doa)</span>
                        <span className="font-sans text-[10px] text-slate-605">Alokasi: 10 - 15 Menit</span>
                      </div>
                      <p className="leading-relaxed pl-4 whitespace-pre-line text-black">
                        {(() => {
                          const rinci = magicStudioOutput?.rpp_merdeka_formal?.langkah_pembelajaran_rinci;
                          if (rinci) {
                            return rinci.includes("C. KEGIATAN PENUTUP")
                              ? rinci.split("C. KEGIATAN PENUTUP")[1]
                              : rinci;
                          }
                          return rpp.langkah_pembelajaran.kegiatan_penutup;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
                )}
              </>
            )}

            {viewMode === "lkpd" && (
              <>
                
                {dokumenResult?.lkpd ? (
                  <div className="space-y-6 text-black select-text font-sans pb-10">
                    <div className="text-center space-y-1 mb-8 font-sans">
                      <h3 className="text-sm font-black text-center text-black uppercase tracking-wider">
                        LEMBAR KERJA PESERTA DIDIK (LKPD) AI
                      </h3>
                      <p className="text-[10px] text-slate-705 font-bold uppercase tracking-wide">
                        EKSPLORASI INOVATIF & JURNAL KRITIS PENYELIDIKAN
                      </p>
                    </div>
                    {renderStepwiseContent(dokumenResult.lkpd, profileSchool, profileName, profileNip)}
                  </div>
                ) : (
                  <div className="space-y-6 text-black select-text">
              {/* Title */}
              <div className="text-center space-y-1 mb-6">
                <h3 className="text-sm font-black text-center text-black font-sans uppercase tracking-wider">
                  LEMBAR KERJA PESERTA DIDIK (LKPD) KELAS
                </h3>
                <p className="text-[10px] text-slate-700 font-bold uppercase tracking-wide font-sans">
                  FORMULIR PRAKTIKUM LAPANGAN KELOMPOK MANDIRI
                </p>
              </div>

              {/* JUDUL & IDENTITAS PEMBELAJARAN CETAK */}
              <div className="border border-black p-4 font-sans text-black">
                <table className="w-full text-[11px] border-none text-black">
                  <tbody>
                    <tr>
                      <td className="font-black uppercase w-20 py-1">Kelompok</td>
                      <td className="py-1">: ..............................................................</td>
                      <td className="font-black uppercase w-28 py-1">Mata Pelajaran</td>
                      <td className="py-1">: {subject}</td>
                    </tr>
                    <tr>
                      <td className="font-black uppercase py-1">Anggota</td>
                      <td className="py-1">: 1. ........................................ 2. ........................................</td>
                      <td className="font-black uppercase py-1">Kelas / semester</td>
                      <td className="py-1">: {classLevel} / Ganjil</td>
                    </tr>
                    <tr>
                      <td className="font-black uppercase py-1"></td>
                      <td className="py-1">: 3. ........................................ 4. ........................................</td>
                      <td className="font-black uppercase py-1">Hari / Tanggal</td>
                      <td className="py-1">: ........................................</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* PETUNJUK & CAPAIAN */}
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full min-w-[500px] border border-black border-collapse text-[10.5px] font-sans text-black">
                  <tbody>
                    <tr>
                      <td className="border border-black p-3 w-1/2">
                        <strong className="text-black uppercase block tracking-wider font-black mb-1">1. PETUNJUK KERJA SAMA KELOMPOK:</strong>
                        <p className="text-black leading-relaxed font-semibold">
                          {getLkpdEquipmentsAndProcedures().petunjuk_kerja}
                        </p>
                      </td>
                      <td className="border border-black p-3 w-1/2 text-top">
                        <strong className="text-black uppercase block tracking-wider font-black mb-1">2. CAPAIAN KOMPETENSI BELAJAR:</strong>
                        <p className="text-black leading-relaxed font-semibold">
                          {getLkpdEquipmentsAndProcedures().capaian_kompetensi}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ALAT DAN BAHAN UTAMA (PRINT LIST) */}
              <div className="space-y-1.5 font-sans text-black">
                <strong className="text-black uppercase block text-[11px] font-black tracking-wide border-b border-black pb-1">
                  A. ALAT DAN BAHAN UTAMA PENYELIDIKAN:
                </strong>
                <ul className="list-disc pl-5 space-y-1 text-black text-[11px] font-bold">
                  {getLkpdEquipmentsAndProcedures().alat_bahan.map((ab, idx) => (
                    <li key={idx}>{ab}</li>
                  ))}
                </ul>
              </div>

              {/* TAHAPAN LANGKAH KERJA / PROSEDUR SISTEMATIS */}
              <div className="space-y-1.5 font-sans text-black">
                <strong className="text-black uppercase block text-[11px] font-black tracking-wide border-b border-black pb-1">
                  B. PROSEDUR ATAU LANGKAH KERJA EKSPERIMEN:
                </strong>
                <ol className="list-decimal pl-5 space-y-1 text-black text-[11px] leading-relaxed font-medium">
                  {getLkpdEquipmentsAndProcedures().prosedur.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ol>
              </div>

              {/* BUTIR TUGAS & PERTANYAAN PEMANTIK MASALAH */}
              <div className="space-y-4 font-sans text-black">
                <strong className="text-black uppercase block text-[11px] font-black tracking-wide border-b border-black pb-1">
                  C. TUGAS DAN PERTANYAAN DISKUSI KELOMPOK:
                </strong>
                <div className="space-y-4 text-black">
                  {getLkpdData().tugas_soal_kelompok.map((item, idx) => (
                    <div key={idx} className="space-y-2 pl-1">
                      <p className="text-black text-[11px] font-extrabold leading-relaxed">
                        {idx + 1}. {item}
                      </p>
                      
                      {/* Blank writing spaces for printing */}
                      <div className="text-slate-500 font-sans text-[11px] tracking-wide leading-loose pl-3 pr-1 md:w-full">
                        Jawab: ......................................................................................................................................................................<br />
                        ......................................................................................................................................................................
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* KOLOM KESIMPULAN AKHIR KOSONG */}
              <div className="space-y-2 font-sans pt-2 text-black">
                <strong className="text-black uppercase block text-[11px] font-black tracking-wide border-b border-black pb-1">
                  D. KOLOM KESIMPULAN PENYELIDIKAN KELOMPOK:
                </strong>
                <div className="text-slate-550 font-sans text-[11px] tracking-wide leading-loose pl-3">
                  KESIMPULAN KELOMPOK:<br />
                  ......................................................................................................................................................................<br />
                  ......................................................................................................................................................................
                </div>
              </div>
            </div>
                )}
              </>
            )}

            {viewMode === "asesmen" && (
              <>
                
                {dokumenResult?.asesmen ? (
                  <div className="space-y-6 text-black select-text font-sans pb-10">
                    <div className="text-center space-y-1 mb-8 font-sans">
                      <h3 className="text-sm font-black text-center text-black uppercase tracking-wider">
                        INSTRUMEN ASESMEN & EVALUASI MANDIRI AI
                      </h3>
                      <p className="text-[10px] text-slate-705 font-bold uppercase tracking-wide">
                        RUBRIK PENILAIAN KOMPETENSI BELAJAR SISWA
                      </p>
                    </div>
                    {renderStepwiseContent(dokumenResult.asesmen, profileSchool, profileName, profileNip)}
                  </div>
                ) : (
                  <div className="space-y-6 text-black select-text">
                    {/* Title */}
                    <div className="text-center space-y-1 mb-6">
                      <h3 className="text-sm font-black text-center text-black font-sans uppercase tracking-wider">
                        INSTRUMEN ASESMEN &amp; KISI-KISI EVALUASI
                      </h3>
                      <p className="text-[10px] text-slate-700 font-bold uppercase tracking-wide font-sans">
                        SISTEM EVALUASI FORMATIF / SUMATIF KELAS TERPADU
                      </p>
                    </div>

              {/* I. KISI-KISI SOAL ALIGNMENT TABLE */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-black uppercase tracking-wide font-sans pb-1 border-b border-black">
                  I. KISI-KISI PEMETAAN SOAL EVALUASI
                </h4>
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full min-w-[600px] border-collapse border border-black text-[11px] text-left font-sans text-black">
                    <thead>
                      <tr className="bg-slate-50 font-black border-b border-black text-black">
                        <th className="p-2 border border-black w-16 text-center">No. Soal</th>
                        <th className="p-2 border border-black">Tujuan Pembelajaran (CP)</th>
                        <th className="p-2 border border-black">Indikator Soal Capaian</th>
                        <th className="p-2 border border-black w-32">Level Kognitif</th>
                        <th className="p-2 border border-black w-24">Bentuk Soal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border border-black text-center font-bold">1 - 3</td>
                        <td className="p-2 border border-black">Mengidentifikasi pilar dan landasan teori terkait {getDisplayTopicName()}</td>
                        <td className="p-2 border border-black">Memahami konsep dasar serta skenario pengaplikasiannya secara tepat.</td>
                        <td className="p-2 border border-black font-bold">L1 (C1/Pemahaman)</td>
                        <td className="p-2 border border-black">Pilihan Ganda</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-black text-center font-bold">4 - 7</td>
                        <td className="p-2 border border-black">Menerapkan prosedur sistematis dari materi {getDisplayTopicName()}</td>
                        <td className="p-2 border border-black">Menghubungkan relevansi konsep utama dengan studi kasus atau aktivitas kelompok.</td>
                        <td className="p-2 border border-black font-bold">L2 (C3/Aplikasi)</td>
                        <td className="p-2 border border-black">Pilihan Ganda</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-black text-center font-bold">8 - 10</td>
                        <td className="p-2 border border-black">Menganalisis hubungan sebab-akibat atau disrupsi pada {getDisplayTopicName()}</td>
                        <td className="p-2 border border-black">Merumuskan pemecahan masalah (HOTS) atau simpulan argumentatif.</td>
                        <td className="p-2 border border-black font-bold">L3 (C4/Analisis HOTS)</td>
                        <td className="p-2 border border-black">Pilihan Ganda</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* II. TES TERTULIS EXAM STYLE */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-black text-black uppercase tracking-wide font-sans pb-1 border-b border-black">
                  II. LEMBAR SOAL EVALUASI PILIHAN GANDA ({soalList.length} BUTIR)
                </h4>
                <div className="flex justify-between items-center no-print bg-slate-50 border border-slate-200 rounded-xl p-3 select-none">
                  <p className="text-[10px] sm:text-xs font-black text-slate-700">Aksi Paket Asesmen:</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const nextNo = soalList.length + 1;
                        setSoalList([...soalList, {
                          no: nextNo,
                          pertanyaan: `Pertanyaan evaluasi baru nomor urut ${nextNo}?`,
                          pilihan: ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
                          kunci: "A",
                          pembahasan: "Dilandaskan konsep asimilasi merdeka."
                        }]);
                        showToast(`➕ Soal baru ke-${nextNo} berhasil ditambahkan!`);
                      }}
                      className="text-[10.5px] bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]/90 font-black rounded-lg px-3 py-1 cursor-pointer transition select-none flex items-center gap-1.5"
                    >
                      <Plus className="w-3 h-3 text-white" />
                      Tambah Soal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const text = soalList.map((soal, sIdx) => {
                          return `Soal ${sIdx + 1}: ${soal.pertanyaan}\nPilihan:\n${soal.pilihan.map((p, idx) => `  ${String.fromCharCode(65 + idx)}. ${p}`).join("\n")}\nKunci: ${soal.kunci}\nPembahasan: ${soal.pembahasan || "Didorong penalaran mandiri."}`;
                        }).join("\n\n");
                        navigator.clipboard.writeText(text);
                        showToast("💾 Semua soal evaluasi berhasil disalin ke clipboard!");
                      }}
                      className="text-[10.5px] bg-sky-100 text-sky-800 border border-sky-300 hover:bg-sky-200 font-black rounded-lg px-3 py-1 cursor-pointer transition select-none"
                    >
                      📋 Salin Semua Soal
                    </button>
                  </div>
                </div>

                <div className="space-y-4 font-sans text-black text-[11px]">
                  {soalList.map((soal, sIdx) => {
                    const isEditing = editingSoalIdx === sIdx;

                    return (
                      <div key={sIdx} className="space-y-2 pl-1 border-b border-slate-200 pb-3 last:border-0 relative group">
                        {isEditing ? (
                          <div className="space-y-3 bg-slate-50 p-4 border border-slate-200 rounded-xl no-print">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase">Pertanyaan Soal:</label>
                              <textarea
                                value={soal.pertanyaan}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSoalList(prev => prev.map((s, idx) => idx === sIdx ? { ...s, pertanyaan: value } : s));
                                }}
                                className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-250 rounded-lg p-2 focus:outline-none"
                                rows={2}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase">Pilihan Jawaban:</label>
                              {soal.pilihan.map((pil, pIdx) => (
                                <div key={pIdx} className="flex gap-2 items-center">
                                  <span className="text-xs font-black text-[#1E3A8A]">{String.fromCharCode(65 + pIdx)}.</span>
                                  <input
                                    type="text"
                                    value={pil}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setSoalList(prev => prev.map((s, idx) => {
                                        if (idx === sIdx) {
                                          const newPilihan = [...s.pilihan];
                                          newPilihan[pIdx] = value;
                                          return { ...s, pilihan: newPilihan };
                                        }
                                        return s;
                                      }));
                                    }}
                                    className="flex-1 text-xs font-semibold text-slate-800 bg-white border border-slate-250 rounded-lg py-1 px-2.5 focus:outline-none"
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-1">
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Kunci Rujukan:</label>
                                <input
                                  type="text"
                                  value={soal.kunci}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setSoalList(prev => prev.map((s, idx) => idx === sIdx ? { ...s, kunci: value } : s));
                                  }}
                                  className="w-full text-xs font-extrabold text-[#1E3A8A] bg-white border border-slate-250 rounded-lg py-1 px-2.5 uppercase focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Pembahasan/Ulasan:</label>
                                <input
                                  type="text"
                                  value={soal.pembahasan || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setSoalList(prev => prev.map((s, idx) => idx === sIdx ? { ...s, pembahasan: value } : s));
                                  }}
                                  className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-250 rounded-lg py-1 px-2.5 focus:outline-none"
                                  placeholder="Opsional"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingSoalIdx(null)}
                                className="text-[10px] bg-emerald-600 text-white font-black px-3 py-1 rounded-lg hover:bg-emerald-700 transition cursor-pointer"
                              >
                                Simpan Perubahan
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-start gap-4">
                              <p className="font-extrabold text-black">
                                {sIdx + 1}. {soal.pertanyaan}
                              </p>
                              <div className="flex items-center gap-1.5 no-print">
                                <button
                                  type="button"
                                  onClick={() => setEditingSoalIdx(sIdx)}
                                  className="text-[9.5px] bg-slate-50 hover:bg-slate-100 text-[#1E3A8A] font-extrabold border border-indigo-200 rounded px-2.5 py-0.5 transition cursor-pointer"
                                >
                                  📝 Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Hapus soal ke-${sIdx + 1}?`)) {
                                      setSoalList(prev => prev.filter((_, idx) => idx !== sIdx));
                                      showToast(`🗑️ Soal ke-${sIdx + 1} berhasil dihapus.`);
                                    }
                                  }}
                                  className="text-[9.5px] bg-red-50 hover:bg-red-100 text-red-600 font-extrabold border border-red-100 rounded px-2.5 py-0.5 transition cursor-pointer"
                                >
                                  Hapus
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 pl-4 text-black font-medium mb-1">
                              {soal.pilihan.map((pil, pIdx) => (
                                <div key={pIdx}>
                                  {pil}
                                </div>
                              ))}
                            </div>
                            {/* Interactive Toggle for answer */}
                            <div className="no-print pt-1">
                              <button
                                type="button"
                                onClick={() => setExpandedAnswers(prev => ({ ...prev, [sIdx]: !prev[sIdx] }))}
                                className="bg-slate-100 hover:bg-slate-200 text-[#1E3A8A] text-[9.5px] font-black px-2.5 py-1 rounded-lg cursor-pointer transition select-none inline-flex items-center gap-1.5"
                              >
                                <span>{expandedAnswers[sIdx] ? "📁 Tutup Kunci" : "📂 Tampilkan Kunci Rujukan"}</span>
                              </button>
                              {expandedAnswers[sIdx] && (
                                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-[9.5px] space-y-1 text-slate-800 animate-fade-in font-sans">
                                  <p className="font-black text-emerald-850 flex items-center gap-1">
                                    <span className="bg-emerald-200 text-emerald-900 px-1 py-0.2 rounded font-black font-sans">KUNCI</span>
                                    <span>{soal.kunci || "A"}</span>
                                  </p>
                                  <p className="italic text-slate-650 leading-relaxed font-semibold">
                                    <strong className="text-slate-950 not-italic">Pembahasan:</strong> {soal.pembahasan || "Pilihan jawaban didasarkan atas penalaran asimilasi kognitif interaktif."}
                                  </p>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* II.B MASTER TEACHER ANSWER KEY APPENDIX */}
              <div className="bg-white border-2 border-dashed border-black p-4 font-sans text-[11px] space-y-2 mt-4 text-black">
                <strong className="block text-black uppercase tracking-wide font-black text-[11px]">
                  🔑 LAMPIRAN GURU: KUNCI JAWABAN &amp; PEMBAHASAN SOAL
                </strong>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
                  {soalList.map((soal, sIdx) => (
                    <div key={sIdx} className="border-b border-slate-300 pb-1.5 last:border-0">
                      <p className="font-extrabold text-black">Soal {sIdx + 1} | Kunci: <span className="text-black font-black underline">{soal.kunci}</span></p>
                      <p className="font-medium text-[10.5px]">Pembahasan: {soal.pembahasan || "Didorong penalaran asimilasi kognitif mandiri."}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* III. TES NON-TERTULIS RUBRIC TABLES */}
              <div className="space-y-4 pt-3 text-black">
                <h4 className="text-xs font-black text-black uppercase tracking-wide font-sans pb-1 border-b border-black">
                  III. RUBRIK OBSERVASI DAN KRITERIA KHUSUS SIKAP PELAKSANAAN
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10.5px] font-sans">
                  {/* Rubrik Penilaian Sikap */}
                  <div className="space-y-1.5">
                    <strong className="text-black font-bold block uppercase tracking-wide">1. Rubrik Penilaian Sikap Kelompok:</strong>
                    <table className="w-full border-collapse border border-black text-black">
                      <thead>
                        <tr className="bg-slate-50 border-b border-black">
                          <th className="p-2 border border-black text-left uppercase">Aspek Observasi</th>
                          <th className="p-2 border border-black text-center uppercase">Skor 4 (SB)</th>
                          <th className="p-2 border border-black text-center uppercase">Skor 3 (B)</th>
                          <th className="p-2 border border-black text-center uppercase">Skor 2/1 (C/K)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 border border-black font-bold">Keaktifan Kelas</td>
                          <td className="p-2 border border-black text-center">Inisiatif mengemukakan ide baru</td>
                          <td className="p-2 border border-black text-center">Ikut andil dalam diskusi tim</td>
                          <td className="p-2 border border-black text-center">Pasif / menunggu instruksi guru</td>
                        </tr>
                        <tr>
                          <td className="p-2 border border-black font-bold">Kerja Sama Tim</td>
                          <td className="p-2 border border-black text-center">Kompak, berbagi peran secara adil</td>
                          <td className="p-2 border border-black text-center">Membantu sesama rekan tapi kurang fokus</td>
                          <td className="p-2 border border-black text-center">Bekerja mandiri tanpa peduli lingkungan</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Rubrik Performa Presentasi */}
                  <div className="space-y-1.5">
                    <strong className="text-black font-bold block uppercase tracking-wide">2. Rubrik Presentasi Hasil Karya:</strong>
                    <table className="w-full border-collapse border border-black text-black">
                      <thead>
                        <tr className="bg-slate-50 border-b border-black">
                          <th className="p-2 border border-black text-left uppercase">Kriteria Penilaian</th>
                          <th className="p-2 border border-black text-center uppercase">Skor 4 (SB)</th>
                          <th className="p-2 border border-black text-center uppercase">Skor 3 (B)</th>
                          <th className="p-2 border border-black text-center uppercase">Skor 2/1 (C/K)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 border border-black font-bold">Pemahaman Materi</td>
                          <td className="p-2 border border-black text-center">Mampu memaparkan esensi {getDisplayTopicName()} dengan sangat lancar</td>
                          <td className="p-2 border border-black text-center">Cukup menguasai bahan materi kelompok</td>
                          <td className="p-2 border border-black text-center">Membaca teks lisan terus tanpa menatap audiens</td>
                        </tr>
                        <tr>
                          <td className="p-2 border border-black font-bold">Sikap Berbicara</td>
                          <td className="p-2 border border-black text-center">Suara tegas, taktis, santun, percaya diri</td>
                          <td className="p-2 border border-black text-center">Suara jelas berkebahasaan tertib</td>
                          <td className="p-2 border border-black text-center">Gugup bercampur volume suara pelan</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* IV. EVALUATION RECORD DAFTAR NILAI */}
              <div className="space-y-3 pt-3 text-black">
                <h4 className="text-xs font-black text-black uppercase tracking-wide font-sans pb-1 border-b border-black">
                  IV. LEMBAR REKAPITULASI MANUAL DAFTAR NILAI SISWA
                </h4>
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full min-w-[700px] border-collapse border border-black text-[10.5px] text-left font-sans text-black">
                    <thead>
                      <tr className="bg-slate-50 border-b border-black font-bold text-black font-sans">
                        <th className="p-2 border border-black text-center w-8">No</th>
                        <th className="p-2 border border-black w-44">Nama Lengkap Siswa</th>
                        <th className="p-2 border border-black text-center w-36">Nilai MCQ (Skor 0-100)</th>
                        <th className="p-2 border border-black text-center w-36">Nilai Sikap (Skor 1-4)</th>
                        <th className="p-2 border border-black text-center w-36">Nilai Performa (Skor 1-4)</th>
                        <th className="p-2 border border-black text-center">Ulasan / Catatan Khusus Pendidik</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        "Ahmad Fauzi",
                        "Siti Rahma",
                        "Budi Pratama",
                        "Dinda Lestari",
                        "................................................................",
                        "................................................................",
                      ].map((nm, idx) => (
                        <tr key={idx}>
                          <td className="p-2 border border-black text-center font-bold text-slate-700">{idx + 1}</td>
                          <td className="p-2 border border-black font-bold text-black">{nm}</td>
                          <td className="p-2 border border-black text-center text-slate-705 font-bold">........ / 100</td>
                          <td className="p-2 border border-black text-center text-slate-705">............... (1-4)</td>
                          <td className="p-2 border border-black text-center text-slate-755 font-sans text-[10px]">............................................................</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
                )}
              </>
            )}

      {viewMode === "rpp" && (
        <>
          {/* ==================== SECTOR V: DAFTAR MEDIA & ALAT PERAGA INTI ==================== */}
          <div className="space-y-6 text-black select-text page-break">
            <hr className="my-10 border-t-2 border-dashed border-black no-print" />
              <div className="text-center space-y-1 mb-6">
                <h3 className="text-sm font-black text-center text-black font-sans uppercase tracking-wider">
                  V. DAFTAR MEDIA &amp; ALAT PERAGA INTI (KURIKULUM MERDEKA)
                </h3>
                <p className="text-[10px] text-slate-705 font-bold uppercase tracking-wide font-sans">
                  PROPERTI PENUNJANG AKTIVITAS BELAJAR MENGAJAR AKTIF DI KELAS
                </p>
              </div>

              <div className="border border-black p-4 bg-slate-50 font-sans text-xs">
                <p className="font-extrabold mb-3">Klasifikasi Media, Alat, dan Bahan Kegiatan Kelompok Murid secara Nyata:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <strong className="block text-[11px] uppercase tracking-wide border-b border-black pb-1">Media Utama (Fisik / Digital):</strong>
                    <ul className="list-disc pl-4 space-y-1 font-medium">
                      {getActiveMediaPeraga().mediaUtama.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <strong className="block text-[11px] uppercase tracking-wide border-b border-black pb-1">Alat &amp; Bahan Kelas Konkret:</strong>
                    <ul className="list-disc pl-4 space-y-1 font-medium">
                      {getActiveMediaPeraga().alatBahanKonkret.map((ab, idx) => (
                        <li key={idx}>{ab}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
              </>
            )}

          {viewMode === "tp_atp" && (
            <div className="space-y-6 text-black select-text">
              <div className="text-center space-y-1 mb-8 font-sans">
                <h3 className="text-[#1E3A8A] font-black text-sm uppercase tracking-wider animate-fade-in">
                  TARGET PENCAPAIAN TUJUAN PEMBELAJARAN (TP) & ALUR TUJUAN PEMBELAJARAN (ATP)
                </h3>
                <p className="text-[10px] text-slate-800 font-bold uppercase mt-0.5 animate-fade-in">ALUR INTEGRASI KURIKULUM MERDEKA BELAJAR</p>
              </div>
              {dokumenResult?.tp_atp ? (
                <div className="space-y-4 font-sans animate-fade-in text-slate-800">
                  {renderStepwiseContent(dokumenResult.tp_atp, profileSchool, profileName, profileNip)}
                </div>
              ) : (
                <div className="space-y-4 font-sans text-slate-800 animate-fade-in">
                  <div className="border border-black p-4 rounded-xl space-y-2">
                    <h4 className="font-bold text-xs uppercase border-b border-black pb-1">I. Capaian Pembelajaran & Tujuan Pembelajaran (TP)</h4>
                    <p className="whitespace-pre-line leading-relaxed text-[11px] text-slate-800 font-semibold">
                      {magicStudioOutput ? magicStudioOutput.rpp_merdeka_formal.tujuan_pembelajaran : rpp.komponen_inti.tujuan_pembelajaran}
                    </p>
                  </div>
                  
                  <div className="border border-black p-4 rounded-xl space-y-2">
                    <h4 className="font-bold text-xs uppercase border-b border-black pb-1">II. Alur Tujuan Pembelajaran (ATP) Rekomendasi</h4>
                    <p className="whitespace-pre-line leading-relaxed text-[11px] text-slate-800 font-semibold">
                      {rpp.komponen_inti.alur_tujuan_pembelajaran || "AI merekomendasikan alur pembelajaran berjenjang dari pemahaman konsep materi, latihan penyelidikan terbimbing, hingga penulisan refleksi mandiri di akhir kegiatan."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {viewMode === "soal_ujian" && (
            <div className="space-y-6 text-black select-text">
              <div className="text-center space-y-1 mb-8 font-sans">
                <h3 className="text-red-700 font-black text-sm uppercase tracking-wider animate-fade-in">
                  KISI-KISI & NASKAH SOAL UJIAN KELAS
                </h3>
                <p className="text-[10px] text-slate-800 font-bold uppercase mt-0.5 animate-fade-in">PAKET EVALUASI FORMATIF & SUMATIF AKHIR MATERI</p>
              </div>
              {dokumenResult?.soal_ujian ? (
                <div className="space-y-4 animate-fade-in text-slate-800">
                  {renderStepwiseContent(dokumenResult.soal_ujian, profileSchool, profileName, profileNip)}
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-8 border border-red-150 rounded-2xl bg-red-50/40 text-center space-y-4 max-w-lg mx-auto no-print">
                    <span className="text-4xl block">📝</span>
                    <p className="text-sm font-black text-red-950 uppercase">⚡ FORMAT PAKET SOAL UJIAN AI:</p>
                    <p className="text-slate-650 text-xs leading-relaxed font-semibold">
                      Dapatkan naskah soal pilihan ganda, naskah esai mendalam, kisi-kisi instrumen, lembar kunci jawaban & pembahasan, serta panduan pengerjaan siswa yang lengkap dalam hitungan detik.
                    </p>
                    <button
                      type="button"
                      disabled={generatingDokumen === "soal_ujian"}
                      onClick={() => handleGenerateDokumen?.("soal_ujian")}
                      className="bg-red-650 hover:bg-red-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer mx-auto"
                    >
                      {generatingDokumen === "soal_ujian" ? (
                        <>⏳ Menyusun Paket Soal Ujian...</>
                      ) : (
                        <>⚡ Buat Kisi & Paket Soal Ujian</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          </div> {/* closes space-y-8 container */}
        </div> {/* closes rpp-print-area */}

          {/* 🎲 LOWER ROW: Ice Breaking Auxiliary Widget */}
          <div className="pt-12 mt-4 max-w-2xl mx-auto no-print">
            {/* 🎲 Ice Breaking Side Panel */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200 rounded-2xl p-5 shadow-3xs flex flex-col justify-between gap-3.5 animate-fade-in text-slate-800">
              <div className="flex items-center gap-2 pb-2 border-b border-amber-200">
                <Zap className="w-5 h-5 text-orange-640 animate-bounce shrink-0" />
                <div>
                  <h4 className="text-xs font-black text-[#0D1D34] uppercase tracking-wider font-sans leading-none">
                    🎲 Sesi Ice Breaking Penunjang
                  </h4>
                  <p className="text-[8.5px] text-amber-800 font-semibold font-sans uppercase mt-0.5">
                    Penyegar Fokus Siswa yang Jenuh selama Sesi Belajar
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 font-sans text-xs flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] uppercase font-black text-amber-805 block">Nama Permainan:</span>
                    <strong className="text-slate-905 block text-[13px] font-black mt-0.5 leading-tight">{iceBreaking.nama_game}</strong>
                  </div>
                  
                  <div>
                    <span className="text-[9px] uppercase font-black text-amber-805 block">Durasi Sesi Ideal:</span>
                    <div className="font-extrabold mt-0.5 leading-snug flex items-center gap-1 text-slate-700">
                      ⏱ 5 - 10 Menit Kegiatan Sesi
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-[9px] uppercase font-black text-amber-805 block">Prosedur / Langkah Bermain:</span>
                    <div className="bg-white border border-amber-100 p-3.5 rounded-lg mt-1 font-semibold text-slate-700 whitespace-pre-line text-[11px] leading-relaxed max-h-[160px] overflow-y-auto shadow-sm select-text">
                      {iceBreaking.cara_bermain_detail}
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`Nama Permainan: ${iceBreaking.nama_game}\nCara Bermain:\n${iceBreaking.cara_bermain_detail}`);
                    showToast("📋 Catatan Ice Breaking sukses disalin!");
                  }}
                  className="w-full bg-[#FF6B35] hover:bg-[#E55A27] text-white font-black text-xs py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer select-none mt-3"
                >
                  Salin Catatan Game
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ==================== INTERACTIVE PDF PREVIEW & FORMATTING VERIFICATION WINDOW ==================== */}
      {isPdfPreviewOpen && (
        <div className="fixed inset-0 bg-[#070D19]/90 backdrop-blur-md z-50 flex flex-col md:flex-row overflow-hidden animate-fade-in font-sans">
          
          {/* LEFT: DESIGN CONTROL SIDEBAR PANEL */}
          <div className="w-full md:w-[350px] bg-[#0D1626] border-b md:border-b-0 md:border-r border-slate-800 flex flex-col h-full select-none text-slate-100 z-10">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400 animate-spin-slow" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wide text-white">Format &amp; Tata Letak</h3>
                  <p className="text-[9px] text-slate-400 font-semibold uppercase">Verifikasi Tampilan Cetak</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPdfPreviewOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                title="Tutup Pratinjau"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Config controls panel */}
            <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs text-slate-300">
              
              {/* Target Margins Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">📐 Ukuran Batas Margin (Margin)</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["narrow", "standard", "wide"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setPdfMargin(m);
                        showToast(`📐 Batas Margin diatur ke: ${m === "narrow" ? "Sempit (1.5 cm)" : m === "wide" ? "Lebar (3.5 cm)" : "Standar (2.5 cm)"}`);
                      }}
                      className={`py-1.5 px-2 rounded-lg font-bold border transition text-[10px] uppercase cursor-pointer capitalize ${
                        pdfMargin === m 
                          ? "bg-blue-600 border-blue-500 text-white font-black" 
                          : "bg-[#142033] border-slate-800 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      {m === "narrow" ? "Sempit" : m === "wide" ? "Lebar" : "Standar"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">🔠 Jenis Huruf (Font Face)</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["Arial", "Times New Roman", "Inter", "JetBrains Mono"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setPdfFontFamily(f);
                        showToast(`🔤 Font dirubah ke: ${f}`);
                      }}
                      style={{ fontFamily: f === "Times New Roman" ? "'Times New Roman', serif" : f === "Inter" ? "'Inter', sans-serif" : f === "JetBrains Mono" ? "monospace" : "sans-serif" }}
                      className={`py-1.5 px-2 rounded-lg font-semibold border transition text-[10.5px] cursor-pointer ${
                        pdfFontFamily === f 
                          ? "bg-blue-600 border-blue-500 text-white font-black" 
                          : "bg-[#142033] border-slate-800 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">👓 Ukuran Karakter (Font Size)</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["11pt", "12pt", "13pt"] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => {
                        setPdfFontSize(sz);
                        showToast(`👓 Ukuran Huruf diatur ke: ${sz}`);
                      }}
                      className={`py-1.5 px-2 rounded-lg font-extrabold border transition text-[10px] cursor-pointer ${
                        pdfFontSize === sz 
                          ? "bg-blue-600 border-blue-500 text-white" 
                          : "bg-[#142033] border-slate-800 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      {sz === "11pt" ? "11pt (Kecil)" : sz === "13pt" ? "13pt (Besar)" : "12pt (Standar)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Height Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">↕️ Spasi Antar Baris (Line Spacing)</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["1.15", "1.5", "2.0"] as const).map((lh) => (
                    <button
                      key={lh}
                      onClick={() => {
                        setPdfLineHeight(lh);
                        showToast(`↕️ Spasi baris dirubah: ${lh}`);
                      }}
                      className={`py-1.5 px-2 rounded-lg font-bold border transition text-[10px] cursor-pointer ${
                        pdfLineHeight === lh 
                          ? "bg-blue-600 border-blue-500 text-white font-black" 
                          : "bg-[#142033] border-slate-800 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      {lh === "1.15" ? "1.15 (Rapat)" : lh === "2.0" ? "2.0 (Double)" : "1.5 (Normal)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Watermark Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">🌫️ Tanda Air Cetak (Watermark Overlay)</label>
                <select
                  value={pdfWatermark}
                  onChange={(e) => {
                    setPdfWatermark(e.target.value as any);
                    showToast(`🌫️ Watermark diatur ke: ${e.target.value}`);
                  }}
                  className="w-full bg-[#142033] border border-slate-800 text-slate-100 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 text-xs font-semibold cursor-pointer"
                >
                  <option value="None">❌ Tanpa Watermark</option>
                  <option value="DRAFT RPP">📝 DRAFT RPP</option>
                  <option value="DRAF GURU">🏫 DRAF GURU BELAJAR.ID</option>
                  <option value="KURIKULUM MERDEKA">🌿 KURIKULUM MERDEKA 2026</option>
                </select>
              </div>

              {/* KOP Header Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">🏛️ Gaya Pembatas KOP Surat</label>
                <select
                  value={pdfKopStyle}
                  onChange={(e) => {
                    setPdfKopStyle(e.target.value as any);
                    showToast(`🏛️ Gaya pembatas KOP diubah ke: ${e.target.value.replace("_", " ")}`);
                  }}
                  className="w-full bg-[#142033] border border-slate-800 text-slate-100 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 text-xs font-semibold cursor-pointer"
                >
                  <option value="double_line">双 Garis Ganda Resmi Hitam</option>
                  <option value="minimalist">✏️ Garis Tipis Abu-Abu Modern</option>
                  <option value="colored_border">🎨 Variasi Tebal Biru Orange</option>
                </select>
              </div>

              {/* Rendering View Layout Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">📄 Alur Pratinjau Lembar Kerja</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["pages", "continuous"] as const).map((lay) => (
                    <button
                      key={lay}
                      onClick={() => setPdfPageLayout(lay)}
                      className={`py-1.5 px-2 rounded-lg font-bold border transition text-[10px] cursor-pointer ${
                        pdfPageLayout === lay 
                          ? "bg-blue-600 border-blue-500 text-white font-black" 
                          : "bg-[#142033] border-slate-800 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      {lay === "pages" ? "Per Halaman (A4)" : "Alur Bebas (Scroll)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grayscale vs Digital Colors toggler */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">🎨 Skema Warna Halaman</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["grayscale", "colored"] as const).map((color) => (
                    <button
                      key={color}
                      onClick={() => setPdfColorMode(color)}
                      className={`py-1.5 px-2 rounded-lg font-bold border transition text-[10px] cursor-pointer ${
                        pdfColorMode === color 
                          ? "bg-blue-600 border-blue-500 text-white font-black" 
                          : "bg-[#142033] border-slate-800 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      {color === "grayscale" ? "Hitam Putih (Cetak)" : "Semburat Digital (KBM)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Signatures and Sign Boxes */}
              <div className="flex items-center justify-between bg-[#142033] p-2.5 rounded-lg border border-slate-800 mt-2">
                <span className="font-bold text-[10.5px]">🔏 Bubuhkan Kotak TTD</span>
                <input
                  type="checkbox"
                  checked={pdfShowSignature}
                  onChange={(e) => setPdfShowSignature(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded-sm focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* ZOOM BAR */}
              <div className="space-y-1 pt-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span>🔎 Tingkat Pembesaran Layar:</span>
                  <span className="text-blue-400 font-extrabold">{pdfZoom}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setPdfZoom(Math.max(50, pdfZoom - 10))} 
                    className="p-1 px-2.5 bg-[#142033] rounded hover:bg-slate-800 border border-slate-800 text-[10px] font-black cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="50"
                    max="130"
                    step="5"
                    value={pdfZoom}
                    onChange={(e) => setPdfZoom(Number(e.target.value))}
                    className="flex-1 accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <button 
                    onClick={() => setPdfZoom(Math.min(130, pdfZoom + 10))}
                    className="p-1 px-2.5 bg-[#142033] rounded hover:bg-slate-800 border border-slate-800 text-[10px] font-black cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom panel actions */}
            <div className="p-4 bg-[#09101C] border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  setIsPdfPreviewOpen(false);
                  handleCetakPdf();
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg transition text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                Dapatkan / Cetak PDF Sekarang
              </button>
              
              <button
                onClick={() => {
                  setIsPdfPreviewOpen(false);
                  const syncBtn = document.getElementById("gdrive-sync-main-btn");
                  if (syncBtn) {
                    syncBtn.click();
                  } else {
                    showToast("ℹ️ Mengalihkan Anda ke panel integrasi Google Drive...");
                    // Locate standard sync operations
                    if (handleSaveAndSyncFolder) {
                      handleSaveAndSyncFolder();
                    }
                  }
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-750 text-white font-black rounded-lg transition text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                📥 Sinkronisasikan Dokumen ke G-Drive
              </button>
            </div>
          </div>

          {/* RIGHT: PORTRAIT SIMULATOR PREVIEW CANVAS VIEWPORT */}
          <div className="flex-1 bg-[#090F1B] overflow-auto p-4 md:p-8 flex flex-col items-center relative select-text">
            
            {/* Status floating toast within workspace */}
            <div className="sticky top-0 bg-[#0D1626]/90 border border-slate-800 text-slate-300 backdrop-blur-xs py-2 px-4 rounded-full text-[10.5px] font-bold shadow-md mb-6 z-20 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sistem Tata Letak Menyerupai Kertas Cetak A4 Asli • Mode Edit Aktif</span>
            </div>

            {/* Simulated Margins Wrapper */}
            <div 
              className="transition-transform duration-300 origin-top flex flex-col items-center gap-8 pb-16"
              style={{ transform: `scale(${pdfZoom / 100})` }}
            >
              
              {/* PAGE-PAGINATION SIMULATION CONTAINER */}
              {pdfPageLayout === "pages" ? (
                <>
                  {/* ====== VIEWMODE: RPP PREVIEW ====== */}
                  {viewMode === "rpp" && (
                    <>
                      {activeResult ? (
                        /* Generated RPP Page */
                        <div className={`w-[794px] min-h-[1123px] bg-white text-black shadow-2xl relative flex flex-col justify-between border border-slate-300 ${
                          pdfMargin === "narrow" ? "p-[1.1cm]" : pdfMargin === "wide" ? "p-[3.2cm]" : "p-[2.3cm]"
                        }`}
                        style={{ 
                          fontFamily: pdfFontFamily === "Times New Roman" ? "'Times New Roman', serif" : pdfFontFamily === "Inter" ? "'Inter', sans-serif" : pdfFontFamily === "JetBrains Mono" ? "monospace" : "Arial, sans-serif",
                          fontSize: pdfFontSize === "11pt" ? "11.5px" : pdfFontSize === "13pt" ? "14.5px" : "13px",
                          lineHeight: pdfLineHeight === "1.15" ? "1.25" : pdfLineHeight === "2.0" ? "1.9" : "1.5"
                        }}>
                          {pdfWatermark !== "None" && (
                            <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden z-0">
                              <span className="text-red-500/[0.08] text-8xl font-black rotate-[-35deg] uppercase tracking-widest whitespace-nowrap">
                                {pdfWatermark}
                              </span>
                            </div>
                          )}
                          <div className="z-10 relative flex-1 flex flex-col">
                            {/* Kop surat — pakai gambar jika ada, fallback ke teks nama sekolah */}
                            {kopSuratImage ? (
                              <div className="text-center pb-4 mb-4 border-b-4 border-double border-black">
                                <img
                                  src={kopSuratImage}
                                  alt="Kop Sekolah"
                                  className="max-h-[90px] max-w-full mx-auto object-contain"
                                />
                              </div>
                            ) : (
                              <div className={`text-center pb-4 mb-6 ${
                                pdfKopStyle === "colored_border"
                                  ? "border-t-4 border-[#0D1D34] border-b-2 border-[#FF6B35]"
                                  : pdfKopStyle === "minimalist"
                                    ? "border-b border-gray-300"
                                    : "border-b-4 border-double border-black"
                              }`}>
                                <h2 className={`font-black text-[15px] uppercase tracking-wider ${
                                  pdfColorMode === "colored" ? "text-blue-900" : "text-black"
                                }`}>{profileSchool || "NAMA SEKOLAH"}</h2>
                                <p className="text-[9.5px] text-zinc-650 font-extrabold uppercase mt-0.5">
                                  {kotaSekolah || "KOTA SEKOLAH"}
                                </p>
                                <div className="grid grid-cols-2 gap-4 text-left text-[10px] text-zinc-700 mt-3 border-t border-zinc-300 pt-2 font-bold uppercase">
                                  <div>GURU: <span className="text-black font-black">{profileName}</span></div>
                                  <div className="text-right">NIP: <span className="text-black font-black">{profileNip || "—"}</span></div>
                                </div>
                              </div>
                            )}
                            <div className="text-center mb-6 space-y-1">
                              <h3 className="text-[13px] font-black uppercase tracking-wider text-black">
                                MODUL AJAR / RENCANA PELAKSANAAN PEMBELAJARAN (RPP)
                              </h3>
                              <p className="text-[9px] text-zinc-650 font-bold uppercase tracking-wide">
                                PENYUSUNAN OTOMATIS ASISTEN PINTAR AI
                              </p>
                            </div>
                            <div className="space-y-4 text-left text-zinc-805">
                              {activeResult ? (
                                <div className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-800 font-sans">
                                  {activeResult}
                                </div>
                              ) : (
                                <div className="text-center py-16 space-y-3">
                                  <div className="text-4xl">📄</div>
                                  <p className="text-sm font-black text-slate-500">Belum ada konten RPP</p>
                                  <p className="text-xs text-slate-400">
                                    Generate RPP terlebih dahulu atau gunakan tombol Buat Perangkat Ajar di Studio.
                                  </p>
                                </div>
                              )}
                            </div>
                            {pdfShowSignature && (
                              <div className="mt-10 grid grid-cols-2 gap-8 text-[11.5px] font-sans pt-6 border-t border-dashed border-zinc-300 font-bold uppercase select-none">
                                <div className="text-center space-y-14">
                                  <div>
                                    <p className="text-zinc-[#FF6B35] mb-0.5 text-[9.5px]">Mengetahui,</p>
                                    <p className="text-black font-extrabold">
                                      {namaKepalaSekolah || `KEPALA SEKOLAH`}
                                    </p>
                                    <p className="text-[9px] text-zinc-500 mt-0.5">
                                      NIP. {nipKepalaSekolah || "................................"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-black font-extrabold">___________________________</p>
                                  </div>
                                </div>
                                <div className="text-center space-y-14">
                                  <div>
                                    <p className="text-zinc-505 mb-0.5 text-[9.5px]">Dibuat Oleh,</p>
                                    <p className="text-black font-extrabold">GURU MATA PELAJARAN</p>
                                  </div>
                                  <div>
                                    <p className="text-black font-extrabold">{profileName}</p>
                                    <p className="text-zinc-500 text-[9px] mt-0.5">NIP: {profileNip || "BELUM DIATUR"}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-center pt-4 border-t border-zinc-100 text-[9px] text-zinc-400 font-bold tracking-wider uppercase">
                            Halaman 1 dari 1 • Modul Ajar GuruPintar AI
                          </div>
                        </div>
                      ) : (
                        /* Original fallback multipage RPP is kept intact! */
                        <>
                          {/* HALAMAN 1: IDENTITAS MODUL & KOMPONEN AWAL */}
                          <div className={`w-[794px] min-h-[1123px] bg-white text-black shadow-2xl relative flex flex-col justify-between border border-slate-300 ${
                            pdfMargin === "narrow" ? "p-[1.1cm]" : pdfMargin === "wide" ? "p-[3.2cm]" : "p-[2.3cm]"
                          }`}
                          style={{ 
                            fontFamily: pdfFontFamily === "Times New Roman" ? "'Times New Roman', serif" : pdfFontFamily === "Inter" ? "'Inter', sans-serif" : pdfFontFamily === "JetBrains Mono" ? "monospace" : "Arial, sans-serif",
                            fontSize: pdfFontSize === "11pt" ? "11.5px" : pdfFontSize === "13pt" ? "14.5px" : "13px",
                            lineHeight: pdfLineHeight === "1.15" ? "1.25" : pdfLineHeight === "2.0" ? "1.9" : "1.5"
                          }}>
                            {pdfWatermark !== "None" && (
                              <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden z-0">
                                <span className="text-red-500/[0.08] text-8xl font-black rotate-[-35deg] uppercase tracking-widest whitespace-nowrap">
                                  {pdfWatermark}
                                </span>
                              </div>
                            )}
                            <div className="z-10 relative flex-1 flex flex-col">
                              {/* Kop surat — pakai gambar jika ada, fallback ke teks nama sekolah */}
                              {kopSuratImage ? (
                                <div className="text-center pb-4 mb-4 border-b-4 border-double border-black">
                                  <img
                                    src={kopSuratImage}
                                    alt="Kop Sekolah"
                                    className="max-h-[90px] max-w-full mx-auto object-contain"
                                  />
                                </div>
                              ) : (
                                <div className={`text-center pb-4 mb-6 ${
                                  pdfKopStyle === "colored_border"
                                    ? "border-t-4 border-[#0D1D34] border-b-2 border-[#FF6B35]"
                                    : pdfKopStyle === "minimalist"
                                      ? "border-b border-gray-300"
                                      : "border-b-4 border-double border-black"
                                }`}>
                                  <h2 className={`font-black text-[15px] uppercase tracking-wider ${
                                    pdfColorMode === "colored" ? "text-blue-900" : "text-black"
                                  }`}>{profileSchool || "NAMA SEKOLAH"}</h2>
                                  <p className="text-[9.5px] text-zinc-650 font-extrabold uppercase mt-0.5">
                                    {kotaSekolah || "KOTA SEKOLAH"}
                                  </p>
                                  <div className="grid grid-cols-2 gap-4 text-left text-[10px] text-zinc-700 mt-3 border-t border-zinc-300 pt-2 font-bold uppercase">
                                    <div>GURU: <span className="text-black font-black">{profileName}</span></div>
                                    <div className="text-right">NIP: <span className="text-black font-black">{profileNip || "—"}</span></div>
                                  </div>
                                </div>
                              )}
                              <div className="text-center mb-6 space-y-1">
                                <h3 className="text-[13px] font-black uppercase tracking-wider text-black">
                                  RENCANA PELAKSANAAN PEMBELAJARAN (RPP) / MODUL AJAR
                                </h3>
                                <p className="text-[9px] text-zinc-650 font-bold uppercase tracking-wide font-sans">
                                  STANDARISASI KURIKULUM MERDEKA BELAJAR TERPADU 2026
                                </p>
                              </div>
                              <div className="space-y-3">
                                <h4 className="text-[12px] font-black uppercase tracking-wide border-b border-black pb-0.5 mb-2">
                                  I. IDENTITAS MODUL AJAR
                                </h4>
                                <table className="w-full text-left text-[11.5px] border-collapse">
                                  <tbody>
                                    <tr className="border-b border-zinc-200">
                                      <td className="w-1/3 py-1 font-bold text-zinc-700">Nama Sekolah / Instansi</td>
                                      <td className="py-1">: {profileSchool || "Sekolah Dasar Unggulan"}</td>
                                    </tr>
                                    <tr className="border-b border-zinc-200">
                                      <td className="py-1 font-bold text-zinc-700">Mata Pelajaran (Mapel)</td>
                                      <td className="py-1">: {rpp.identitas_modul?.mata_pelajaran || manualSubject || "Belum ditentukan"}</td>
                                    </tr>
                                    <tr className="border-b border-zinc-200">
                                      <td className="py-1 font-bold text-zinc-700">Fase / Kelas-Semester</td>
                                      <td className="py-1">: {rpp.identitas_modul?.kelas_semester || classLevel || "Fase B / Kelas 4"}</td>
                                    </tr>
                                    <tr className="border-b border-zinc-200">
                                      <td className="py-1 font-bold text-zinc-700">Materi Pokok Bahasan</td>
                                      <td className="py-1 font-bold">: {rpp.identitas_modul?.materi_pokok || materialText || "Topik Esensial Belajar"}</td>
                                    </tr>
                                    <tr className="border-b border-zinc-200">
                                      <td className="py-1 font-bold text-zinc-700">Siklus / Alokasi Waktu</td>
                                      <td className="py-1">: {rpp.identitas_modul?.alokasi_waktu || "2 JP x 35 Menit"}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              <div className="space-y-3 mt-6">
                                <h4 className="text-[12px] font-black uppercase tracking-wide border-b border-black pb-0.5 mb-2">
                                  II. KOMPONEN AWAL &amp; TARGET PESERTA DIDIK
                                </h4>
                                <div className="space-y-2">
                                  <div>
                                    <strong className="text-zinc-800 text-[11.5px] block">A. Profil Pelajar Pancasila (P3):</strong>
                                    <p className="text-zinc-650 italic pl-3 mt-0.5 font-medium">
                                      {rpp.kompetensi_inti?.profil_pelajar_pancasila 
                                        ? (Array.isArray(rpp.kompetensi_inti.profil_pelajar_pancasila) 
                                            ? rpp.kompetensi_inti.profil_pelajar_pancasila.join(" • ") 
                                            : rpp.kompetensi_inti.profil_pelajar_pancasila)
                                        : "Mandiri, Bernalar Kritis, Kreatif, Bergotong Royong"}
                                    </p>
                                  </div>
                                  <div>
                                    <strong className="text-zinc-800 text-[11.5px] block">B. Sarana dan Prasarana Penunjang Fisik:</strong>
                                    <p className="text-zinc-650 pl-3 mt-0.5">
                                      {rpp.kompetensi_inti?.sarana_prasarana || "Ruangan Kelas, Media LCD Proyektor, Jaringan Internet Aktif, Handout Cetak Siswa."}
                                    </p>
                                  </div>
                                  <div>
                                    <strong className="text-zinc-800 text-[11.5px] block">C. Target Siswa &amp; Model Pembelajaran:</strong>
                                    <p className="text-zinc-650 pl-3 mt-0.5">
                                      Penerapan Model <strong>{selectedMetode || "Problem Based Learning (PBL)"}</strong> yang berpusat aktif pada siswa kelas reguler heterogen.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-center pt-4 border-t border-zinc-100 text-[9px] text-zinc-400 font-bold tracking-wider uppercase">
                              Halaman 1 dari 4 • Modul Ajar GuruPintar AI
                            </div>
                          </div>

                          {/* HALAMAN 2: KOMPONEN INTI & SKENARIO KEGIATAN BELAJAR */}
                          <div className={`w-[794px] min-h-[1123px] bg-white text-black shadow-2xl relative flex flex-col justify-between border border-slate-300 ${
                            pdfMargin === "narrow" ? "p-[1.1cm]" : pdfMargin === "wide" ? "p-[3.2cm]" : "p-[2.3cm]"
                          }`}
                          style={{ 
                            fontFamily: pdfFontFamily === "Times New Roman" ? "'Times New Roman', serif" : pdfFontFamily === "Inter" ? "'Inter', sans-serif" : pdfFontFamily === "JetBrains Mono" ? "monospace" : "Arial, sans-serif",
                            fontSize: pdfFontSize === "11pt" ? "11.5px" : pdfFontSize === "13pt" ? "14.5px" : "13px",
                            lineHeight: pdfLineHeight === "1.15" ? "1.25" : pdfLineHeight === "2.0" ? "1.9" : "1.5"
                          }}>
                            {pdfWatermark !== "None" && (
                              <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden z-0">
                                <span className="text-red-500/[0.08] text-8xl font-black rotate-[-35deg] uppercase tracking-widest whitespace-nowrap">
                                  {pdfWatermark}
                                </span>
                              </div>
                            )}
                            <div className="z-10 relative flex-1 flex flex-col">
                              <h4 className="text-[12px] font-black uppercase tracking-wide border-b border-black pb-0.5 mb-4">
                                III. KOMPONEN INTI UTAMA PEMBELAJARAN
                              </h4>
                              <div className="space-y-4">
                                <div>
                                  <strong className="text-zinc-900 text-[11.5px] uppercase block tracking-wider font-extrabold text-[12px]">A. Tujuan Utama Pembelajaran</strong>
                                  <div className="mt-1 font-medium text-zinc-700 whitespace-pre-line text-[11.5px] leading-relaxed pl-3 border-l-2 border-zinc-200">
                                    {magicStudioOutput ? magicStudioOutput.rpp_merdeka_formal.tujuan_pembelajaran : rpp.komponen_inti?.tujuan_pembelajaran}
                                  </div>
                                </div>
                                <div>
                                  <strong className="text-zinc-[#FF6B35] text-[11.5px] uppercase block tracking-wider font-extrabold text-[12px]">B. Pertanyaan Pemantik Fokus</strong>
                                  <div className="mt-1 font-semibold text-zinc-700 italic pl-3 border-l-2 border-[#FF6B35]/30 text-[11px] leading-relaxed">
                                    {getPertanyaanPemantik().map((pem, idx) => (
                                      <p key={idx}>{pem}</p>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-4 mt-3">
                                  <strong className="text-zinc-900 text-[11.5px] uppercase block tracking-wider font-black border-b border-zinc-300 pb-0.5">C. Langkah-Langkah Skenario Kegiatan Pembelajaran</strong>
                                  <div className="space-y-0.5">
                                    <span className="font-extrabold text-[10.5px] uppercase tracking-wider text-zinc-800 flex items-center gap-1">
                                      🏁 Kegiatan Pendahuluan (10 - 15 Menit)
                                    </span>
                                    <div className="pl-3 mt-0.5 font-medium text-[11px] text-zinc-700 whitespace-pre-line leading-relaxed border-l border-zinc-200">
                                      {(() => {
                                        const rinci = magicStudioOutput?.rpp_merdeka_formal?.langkah_pembelajaran_rinci;
                                        const txt = rinci
                                          ? rinci.includes("A. KEGIATAN PEMBUKA")
                                            ? rinci.split("A. KEGIATAN PEMBUKA")[1]?.split("B. KEGIATAN INTI")[0]
                                            : rinci
                                          : rpp.langkah_pembelajaran?.kegiatan_pembuka;
                                        return txt ? txt.trim() : "Apersepsi, berdoa bersama, presensi kesiapan murid, pemaparan tujuan pelajaran.";
                                      })()}
                                    </div>
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="font-extrabold text-[10.5px] uppercase tracking-wider text-zinc-800 flex items-center gap-1">
                                      🔥 Kegiatan Inti Eksploratif (45 - 50 Menit)
                                    </span>
                                    <div className="pl-3 mt-0.5 font-medium text-[11px] text-zinc-700 whitespace-pre-line leading-relaxed border-l border-zinc-200">
                                      {(() => {
                                        const rinci = magicStudioOutput?.rpp_merdeka_formal?.langkah_pembelajaran_rinci;
                                        const txt = rinci
                                          ? rinci.includes("B. KEGIATAN INTI")
                                            ? rinci.split("B. KEGIATAN INTI")[1]?.split("C. KEGIATAN PENUTUP")[0]
                                            : rinci
                                          : rpp.langkah_pembelajaran?.kegiatan_inti_mendalam;
                                        return txt ? txt.trim() : "Kerja kelompok diskusi kolaboratif menggunakan panduan LKPD secara mandiri.";
                                      })()}
                                    </div>
                                  </div>
                                  <div className="space-y-0.5">
                                    <span className="font-extrabold text-[10.5px] uppercase tracking-wider text-zinc-800 flex items-center gap-1">
                                      💾 Kegiatan Penutup &amp; Ulasan (10 - 15 Menit)
                                    </span>
                                    <div className="pl-3 mt-0.5 font-medium text-[11px] text-zinc-700 whitespace-pre-line leading-relaxed border-l border-zinc-200">
                                      {(() => {
                                        const rinci = magicStudioOutput?.rpp_merdeka_formal?.langkah_pembelajaran_rinci;
                                        const txt = rinci
                                          ? rinci.includes("C. KEGIATAN PENUTUP")
                                            ? rinci.split("C. KEGIATAN PENUTUP")[1]
                                            : rinci
                                          : rpp.langkah_pembelajaran?.kegiatan_penutup;
                                        return txt ? txt.trim() : "Evaluasi formatif, kesimpulan bersama, instruksi pekerjaan rumah, doa penutup.";
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-center pt-4 border-t border-zinc-100 text-[9px] text-zinc-400 font-bold tracking-wider uppercase">
                              Halaman 2 dari 4 • Modul Ajar GuruPintar AI
                            </div>
                          </div>

                          {/* HALAMAN 3: LEMBAR KERJA PESERTA DIDIK (LKPD) */}
                          <div className={`w-[794px] min-h-[1123px] bg-white text-black shadow-2xl relative flex flex-col justify-between border border-slate-300 ${
                            pdfMargin === "narrow" ? "p-[1.1cm]" : pdfMargin === "wide" ? "p-[3.2cm]" : "p-[2.3cm]"
                          }`}
                          style={{ 
                            fontFamily: pdfFontFamily === "Times New Roman" ? "'Times New Roman', serif" : pdfFontFamily === "Inter" ? "'Inter', sans-serif" : pdfFontFamily === "JetBrains Mono" ? "monospace" : "Arial, sans-serif",
                            fontSize: pdfFontSize === "11pt" ? "11.5px" : pdfFontSize === "13pt" ? "14.5px" : "13px",
                            lineHeight: pdfLineHeight === "1.15" ? "1.25" : pdfLineHeight === "2.0" ? "1.9" : "1.5"
                          }}>
                            {pdfWatermark !== "None" && (
                              <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden z-0">
                                <span className="text-red-500/[0.08] text-8xl font-black rotate-[-35deg] uppercase tracking-widest whitespace-nowrap">
                                  {pdfWatermark}
                                </span>
                              </div>
                            )}
                            <div className="z-10 relative flex-1 flex flex-col">
                              <div className="text-center mb-5 border-2 border-dashed border-black p-2 font-mono">
                                <h4 className="font-black text-black">LEMBAR KERJA PESERTA DIDIK (LKPD)</h4>
                                <p className="text-[10px] text-zinc-650 font-bold">DISALURKAN UNTUK KEGIATAN DISKUSI MANDIRI SISWA</p>
                              </div>
                              <div className="space-y-4">
                                <div className="bg-slate-50 border border-slate-200 p-3 grid grid-cols-2 gap-4 text-[11px] font-medium rounded">
                                  <div>NAMA KELOMPOK : ...................................</div>
                                  <div>HARI / TANGGAL : ...................................</div>
                                  <div className="col-span-2">ANGGOTA TIM : ............................................................................</div>
                                </div>
                                <div>
                                  <strong className="text-black text-[12px] uppercase block tracking-wide font-black">Aktivitas Eksploratif: "{lkpd.judul_aktivitas || "Ayo Selidiki Bersama!"}"</strong>
                                  <p className="text-slate-705 italic mt-1 font-medium text-[11.5px]">
                                    Lakukan pengamatan mendalam bersama tim kelompok dan catat seluruh temuan empiris pada kolom yang disediakan.
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <strong className="text-black text-[11px] uppercase block tracking-wider font-extrabold text-[11px]">Langkah Tindakan Kerja:</strong>
                                  <ol className="list-decimal pl-5 text-zinc-700 space-y-1 font-semibold leading-relaxed">
                                    {lkpd.tugas_soal_kelompok?.map((pet, idx) => (
                                      <li key={idx}>{pet}</li>
                                    )) || (
                                      <>
                                        <li>Lakukan observasi visual menyeluruh terhadap instruksi awal guru.</li>
                                        <li>Diskusikan bersama sirkulasi materi kelompok secara proaktif.</li>
                                        <li>Tuliskan kesimpulan luhur tim pada kotak ringkasan presentasi.</li>
                                      </>
                                    )}
                                  </ol>
                                </div>
                                <div className="space-y-2 mt-4 flex-1">
                                  <strong className="text-black text-[11.4px] uppercase block tracking-wider font-extrabold">Lembar Catatan Temuan &amp; Hipotesis:</strong>
                                  <div className="border border-slate-300 rounded h-[180px] p-4 bg-zinc-50 flex flex-col justify-between font-mono text-[10px] text-zinc-400">
                                    <div>[ Tuliskan Rancangan Eksperimen atau Catatan Hasil Diskusi kelompok Anda di Sini ]</div>
                                    <div className="text-right border-t border-dashed border-slate-300 pt-2 text-[9px] font-bold">Paraf Guru Pengawas: ___________</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-center pt-4 border-t border-zinc-100 text-[9px] text-zinc-400 font-bold tracking-wider uppercase">
                              Halaman 3 dari 4 • Modul Ajar GuruPintar AI
                            </div>
                          </div>

                          {/* HALAMAN 4: ASESMEN PENILAIAN, ICE BREAKING & TANDA TANGAN */}
                          <div className={`w-[794px] min-h-[1123px] bg-white text-black shadow-2xl relative flex flex-col justify-between border border-slate-300 ${
                            pdfMargin === "narrow" ? "p-[1.1cm]" : pdfMargin === "wide" ? "p-[3.2cm]" : "p-[2.3cm]"
                          }`}
                          style={{ 
                            fontFamily: pdfFontFamily === "Times New Roman" ? "'Times New Roman', serif" : pdfFontFamily === "Inter" ? "'Inter', sans-serif" : pdfFontFamily === "JetBrains Mono" ? "monospace" : "Arial, sans-serif",
                            fontSize: pdfFontSize === "11pt" ? "11.5px" : pdfFontSize === "13pt" ? "14.5px" : "13px",
                            lineHeight: pdfLineHeight === "1.15" ? "1.25" : pdfLineHeight === "2.0" ? "1.9" : "1.5"
                          }}>
                            {pdfWatermark !== "None" && (
                              <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden z-0">
                                <span className="text-red-500/[0.08] text-8xl font-black rotate-[-35deg] uppercase tracking-widest whitespace-nowrap">
                                  {pdfWatermark}
                                </span>
                              </div>
                            )}
                            <div className="z-10 relative flex-1 flex flex-col">
                              <h4 className="text-[12px] font-black uppercase tracking-wide border-b border-black pb-0.5 mb-2">
                                IV. EVALUASI PENILAIAN &amp; RUBRIK ASESMEN
                              </h4>
                              <div className="space-y-3">
                                <span className="font-extrabold text-[11px] block text-zinc-800">Uji Evaluasi Formatif (Pilihan Ganda):</span>
                                <div className="space-y-3 pl-2 text-[11.5px] text-zinc-700">
                                  {soalList.slice(0, 2).map((soal) => (
                                    <div key={soal.no} className="space-y-1">
                                      <strong>{soal.no}. {soal.pertanyaan}</strong>
                                      <div className="grid grid-cols-2 gap-1.5 pl-3 text-[11px] italic font-medium">
                                        {soal.pilihan.map((p, pIdx) => (
                                          <div key={pIdx}>{p}</div>
                                        ))}
                                      </div>
                                      <div className="text-[9.5px] mt-0.5 font-bold text-zinc-500">Kunci Jawaban: {soal.kunci} • {soal.pembahasan}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="mt-4 p-3 bg-amber-50/50 border border-amber-200 rounded font-sans text-xs">
                                <strong className="text-amber-900 uppercase block tracking-wider font-extrabold text-[10.5px]">🎮 Sela Penyegar (Game Ice Breaking)</strong>
                                <p className="font-bold text-slate-805 text-[11.5px] mt-0.5">{iceBreaking.nama_game}</p>
                                <p className="text-slate-600 mt-1 pl-2 text-[10px] leading-relaxed border-l-2 border-amber-300 whitespace-pre-line">{iceBreaking.cara_bermain_detail.slice(0, 180)}...</p>
                              </div>
                              <div className="mt-4 border border-zinc-250 p-2.5 rounded font-sans text-[11px]">
                                <strong className="text-zinc-800 uppercase block tracking-wide font-extrabold text-[10.5px]">🌿 Lembar Refleksi Ulasan Pendidik</strong>
                                <p className="text-zinc-500 italic mt-0.5">Guru melakukan analisis reflektif atas daya serap murid sehabis sesi KBM berjalan.</p>
                              </div>
                              {pdfShowSignature && (
                                <div className="mt-10 grid grid-cols-2 gap-8 text-[11.5px] font-sans pt-6 border-t border-dashed border-zinc-300 font-bold uppercase select-none">
                                  <div className="text-center space-y-14">
                                    <div>
                                      <p className="text-zinc-500 mb-0.5 text-[9.5px]">Mengetahui,</p>
                                      <p className="text-black font-extrabold">
                                        {namaKepalaSekolah || `KEPALA SEKOLAH`}
                                      </p>
                                      <p className="text-[9px] text-zinc-500 mt-0.5">
                                        NIP. {nipKepalaSekolah || "................................"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-black font-extrabold">___________________________</p>
                                    </div>
                                  </div>
                                  <div className="text-center space-y-14">
                                    <div>
                                      <p className="text-zinc-505 mb-0.5 text-[9.5px]">Dibuat Oleh,</p>
                                      <p className="text-black font-extrabold">GURU MATA PELAJARAN</p>
                                    </div>
                                    <div>
                                      <p className="text-black font-extrabold">{profileName}</p>
                                      <p className="text-zinc-500 text-[9px] mt-0.5">NIP: {profileNip || "BELUM DIATUR"}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="text-center pt-4 border-t border-zinc-100 text-[9px] text-zinc-400 font-bold tracking-wider uppercase">
                              Halaman 4 dari 4 • Modul Ajar GuruPintar AI
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* ====== VIEWMODE: TP & ATP PREVIEW ====== */}
                  {viewMode === "tp_atp" && (
                    <div className={`w-[794px] min-h-[1123px] bg-white text-black shadow-2xl relative flex flex-col justify-between border border-slate-300 ${
                      pdfMargin === "narrow" ? "p-[1.1cm]" : pdfMargin === "wide" ? "p-[3.2cm]" : "p-[2.3cm]"
                    }`}
                    style={{ 
                      fontFamily: pdfFontFamily === "Times New Roman" ? "'Times New Roman', serif" : pdfFontFamily === "Inter" ? "'Inter', sans-serif" : pdfFontFamily === "JetBrains Mono" ? "monospace" : "Arial, sans-serif",
                      fontSize: pdfFontSize === "11pt" ? "11.5px" : pdfFontSize === "13pt" ? "14.5px" : "13px",
                      lineHeight: pdfLineHeight === "1.15" ? "1.25" : pdfLineHeight === "2.0" ? "1.9" : "1.5"
                    }}>
                      {pdfWatermark !== "None" && (
                        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden z-0">
                          <span className="text-red-500/[0.08] text-8xl font-black rotate-[-35deg] uppercase tracking-widest whitespace-nowrap">
                            {pdfWatermark}
                          </span>
                        </div>
                      )}
                      <div className="z-10 relative flex-1 flex flex-col">
                      {/* Kop surat — pakai gambar jika ada, fallback ke teks nama sekolah */}
                      {kopSuratImage ? (
                        <div className="text-center pb-4 mb-4 border-b-4 border-double border-black">
                          <img
                            src={kopSuratImage}
                            alt="Kop Sekolah"
                            className="max-h-[90px] max-w-full mx-auto object-contain"
                          />
                        </div>
                      ) : (
                        <div className={`text-center pb-4 mb-6 ${
                          pdfKopStyle === "colored_border"
                            ? "border-t-4 border-[#0D1D34] border-b-2 border-[#FF6B35]"
                            : pdfKopStyle === "minimalist"
                              ? "border-b border-gray-300"
                              : "border-b-4 border-double border-black"
                        }`}>
                          <h2 className={`font-black text-[15px] uppercase tracking-wider ${
                            pdfColorMode === "colored" ? "text-blue-900" : "text-black"
                          }`}>{profileSchool || "NAMA SEKOLAH"}</h2>
                          <p className="text-[9.5px] text-zinc-650 font-extrabold uppercase mt-0.5">
                            {kotaSekolah || "KOTA SEKOLAH"}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-left text-[10px] text-zinc-700 mt-3 border-t border-zinc-300 pt-2 font-bold uppercase">
                            <div>GURU: <span className="text-black font-black">{profileName}</span></div>
                            <div className="text-right">NIP: <span className="text-black font-black">{profileNip || "—"}</span></div>
                          </div>
                        </div>
                      )}
                      <div className="text-center mb-6 space-y-1">
                        <h3 className="text-[13px] font-black uppercase tracking-wider text-black">
                          CAPAIAN PEMBELAJARAN &amp; ALUR TUJUAN PEMBELAJARAN (TP &amp; ATP)
                        </h3>
                        <p className="text-[9px] text-zinc-650 font-bold uppercase tracking-wide font-sans">
                          STANDARISASI KURIKULUM MERDEKA BELAJAR TERPADU 2026
                        </p>
                      </div>
                      <div className="space-y-4 text-left text-zinc-805">
                        {activeResult ? (
                          <div className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-800 font-sans">
                            {activeResult}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="border border-black p-4 rounded-xl space-y-2">
                              <h4 className="font-bold text-xs uppercase border-b border-black pb-1">I. Capaian Pembelajaran &amp; Tujuan Pembelajaran (TP)</h4>
                              <p className="whitespace-pre-line leading-relaxed text-[11.5px] text-zinc-700 font-semibold">
                                {magicStudioOutput ? magicStudioOutput.rpp_merdeka_formal.tujuan_pembelajaran : rpp.komponen_inti?.tujuan_pembelajaran}
                              </p>
                            </div>
                            <div className="border border-black p-4 rounded-xl space-y-2">
                              <h4 className="font-bold text-xs uppercase border-b border-black pb-1">II. Alur Tujuan Pembelajaran (ATP) Rekomendasi</h4>
                              <p className="whitespace-pre-line leading-relaxed text-[11.5px] text-zinc-700 font-semibold">
                                {rpp.komponen_inti?.alur_tujuan_pembelajaran || "AI merekomendasikan alur pembelajaran berjenjang dari pemahaman konsep materi, latihan penyelidikan terbimbing, hingga penulisan refleksi mandiri di akhir kegiatan."}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      {pdfShowSignature && (
                        <div className="mt-10 grid grid-cols-2 gap-8 text-[11.5px] font-sans pt-6 border-t border-dashed border-zinc-300 font-bold uppercase select-none">
                          <div className="text-center space-y-14">
                            <div>
                              <p className="text-zinc-[#FF6B35] mb-0.5 text-[9.5px]">Mengetahui,</p>
                              <p className="text-black font-extrabold">
                                {namaKepalaSekolah || `KEPALA SEKOLAH`}
                              </p>
                              <p className="text-[9px] text-zinc-500 mt-0.5">
                                NIP. {nipKepalaSekolah || "................................"}
                              </p>
                            </div>
                            <div>
                              <p className="text-black font-extrabold">___________________________</p>
                            </div>
                          </div>
                            <div className="text-center space-y-14">
                              <div>
                                <p className="text-zinc-505 mb-0.5 text-[9.5px]">Dibuat Oleh,</p>
                                <p className="text-black font-extrabold">GURU MATA PELAJARAN</p>
                              </div>
                              <div>
                                <p className="text-black font-extrabold">{profileName}</p>
                                <p className="text-zinc-500 text-[9px] mt-0.5">NIP: {profileNip || "BELUM DIATUR"}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-center pt-4 border-t border-zinc-100 text-[9px] text-zinc-400 font-bold tracking-wider uppercase">
                        Halaman 1 dari 1 • Modul Ajar GuruPintar AI
                      </div>
                    </div>
                  )}

                  {/* ====== VIEWMODE: LKPD PREVIEW ====== */}
                  {viewMode === "lkpd" && (
                    <div className={`w-[794px] min-h-[1123px] bg-white text-black shadow-2xl relative flex flex-col justify-between border border-slate-300 ${
                      pdfMargin === "narrow" ? "p-[1.1cm]" : pdfMargin === "wide" ? "p-[3.2cm]" : "p-[2.3cm]"
                    }`}
                    style={{ 
                      fontFamily: pdfFontFamily === "Times New Roman" ? "'Times New Roman', serif" : pdfFontFamily === "Inter" ? "'Inter', sans-serif" : pdfFontFamily === "JetBrains Mono" ? "monospace" : "Arial, sans-serif",
                      fontSize: pdfFontSize === "11pt" ? "11.5px" : pdfFontSize === "13pt" ? "14.5px" : "13px",
                      lineHeight: pdfLineHeight === "1.15" ? "1.25" : pdfLineHeight === "2.0" ? "1.9" : "1.5"
                    }}>
                      {pdfWatermark !== "None" && (
                        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden z-0">
                          <span className="text-red-500/[0.08] text-8xl font-black rotate-[-35deg] uppercase tracking-widest whitespace-nowrap">
                            {pdfWatermark}
                          </span>
                        </div>
                      )}
                      <div className="z-10 relative flex-1 flex flex-col font-sans">
                        {/* Kop surat — pakai gambar jika ada, fallback ke teks nama sekolah */}
                        {kopSuratImage ? (
                          <div className="text-center pb-4 mb-4 border-b-4 border-double border-black">
                            <img
                              src={kopSuratImage}
                              alt="Kop Sekolah"
                              className="max-h-[90px] max-w-full mx-auto object-contain"
                            />
                          </div>
                        ) : (
                          <div className={`text-center pb-4 mb-6 ${
                            pdfKopStyle === "colored_border"
                              ? "border-t-4 border-[#0D1D34] border-b-2 border-[#FF6B35]"
                              : pdfKopStyle === "minimalist"
                                ? "border-b border-gray-300"
                                : "border-b-4 border-double border-black"
                          }`}>
                            <h2 className={`font-black text-[15px] uppercase tracking-wider ${
                              pdfColorMode === "colored" ? "text-blue-900" : "text-black"
                            }`}>{profileSchool || "NAMA SEKOLAH"}</h2>
                            <p className="text-[9.5px] text-zinc-650 font-extrabold uppercase mt-0.5">
                              {kotaSekolah || "KOTA SEKOLAH"}
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-left text-[10px] text-zinc-700 mt-3 border-t border-zinc-300 pt-2 font-bold uppercase">
                              <div>GURU: <span className="text-black font-black">{profileName}</span></div>
                              <div className="text-right">NIP: <span className="text-black font-black">{profileNip || "—"}</span></div>
                            </div>
                          </div>
                        )}
                        <div className="text-center mb-5 border-2 border-dashed border-black p-2 font-mono">
                          <h4 className="font-black text-black">LEMBAR KERJA PESERTA DIDIK (LKPD)</h4>
                          <p className="text-[10px] text-zinc-650 font-bold">DISALURKAN UNTUK KEGIATAN DISKUSI MANDIRI SISWA</p>
                        </div>
                        <div className="space-y-4 text-left text-zinc-800">
                          {activeResult ? (
                            <div className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-800 font-sans">
                              {activeResult}
                            </div>
                          ) : (
                            <>
                              <div className="bg-slate-50 border border-slate-200 p-3 grid grid-cols-2 gap-4 text-[11px] font-medium rounded">
                                <div>NAMA KELOMPOK : ...................................</div>
                                <div>HARI / TANGGAL : ...................................</div>
                                <div className="col-span-2">ANGGOTA TIM : ............................................................................</div>
                              </div>
                              <div>
                                <strong className="text-black text-[12px] uppercase block tracking-wide font-black">Aktivitas Eksploratif: "{lkpd.judul_aktivitas || "Ayo Selidiki Bersama!"}"</strong>
                                <p className="text-slate-705 italic mt-1 font-medium text-[11.5px]">
                                  Lakukan pengamatan mendalam bersama tim kelompok dan catat seluruh temuan empiris pada kolom yang disediakan.
                                </p>
                              </div>
                              <div className="space-y-1">
                                <strong className="text-black text-[11px] uppercase block tracking-wider font-extrabold">Langkah Tindakan Kerja:</strong>
                                <ol className="list-decimal pl-5 text-zinc-700 space-y-1 font-semibold leading-relaxed">
                                  {lkpd.tugas_soal_kelompok?.map((pet, idx) => (
                                    <li key={idx}>{pet}</li>
                                  )) || (
                                    <>
                                      <li>Lakukan observasi visual menyeluruh terhadap instruksi awal guru.</li>
                                      <li>Diskusikan bersama sirkulasi materi kelompok secara proaktif.</li>
                                      <li>Tuliskan kesimpulan luhur tim pada kotak ringkasan presentasi.</li>
                                    </>
                                  )}
                                </ol>
                              </div>
                              <div className="space-y-2 mt-4 flex-1">
                                <strong className="text-black text-[11.4px] uppercase block tracking-wider font-extrabold">Lembar Catatan Temuan &amp; Hipotesis:</strong>
                                <div className="border border-slate-300 rounded h-[180px] p-4 bg-zinc-50 flex flex-col justify-between font-mono text-[10px] text-zinc-400">
                                  <div>[ Tuliskan Rancangan Eksperimen atau Catatan Hasil Diskusi kelompok Anda di Sini ]</div>
                                  <div className="text-right border-t border-dashed border-slate-300 pt-2 text-[9px] font-bold">Paraf Guru Pengawas: ___________</div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        {pdfShowSignature && (
                          <div className="mt-10 grid grid-cols-2 gap-8 text-[11.5px] font-sans pt-6 border-t border-dashed border-zinc-300 font-bold uppercase select-none">
                            <div className="text-center space-y-14">
                              <div>
                                <p className="text-zinc-[#FF6B35] mb-0.5 text-[9.5px]">Mengetahui,</p>
                                <p className="text-black font-extrabold">
                                  {namaKepalaSekolah || `KEPALA SEKOLAH`}
                                </p>
                                <p className="text-[9px] text-zinc-500 mt-0.5">
                                  NIP. {nipKepalaSekolah || "................................"}
                                </p>
                              </div>
                              <div>
                                <p className="text-black font-extrabold">___________________________</p>
                              </div>
                            </div>
                            <div className="text-center space-y-14">
                              <div>
                                <p className="text-zinc-505 mb-0.5 text-[9.5px]">Dibuat Oleh,</p>
                                <p className="text-black font-extrabold">GURU MATA PELAJARAN</p>
                              </div>
                              <div>
                                <p className="text-black font-extrabold">{profileName}</p>
                                <p className="text-zinc-500 text-[9px] mt-0.5">NIP: {profileNip || "BELUM DIATUR"}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-center pt-4 border-t border-zinc-100 text-[9px] text-zinc-400 font-bold tracking-wider uppercase">
                        Halaman 1 dari 1 • Lembar Kerja Siswa GuruPintar AI
                      </div>
                    </div>
                  )}

                  {/* ====== VIEWMODE: ASESMEN PREVIEW ====== */}
                  {viewMode === "asesmen" && (
                    <div className={`w-[794px] min-h-[1123px] bg-white text-black shadow-2xl relative flex flex-col justify-between border border-slate-300 ${
                      pdfMargin === "narrow" ? "p-[1.1cm]" : pdfMargin === "wide" ? "p-[3.2cm]" : "p-[2.3cm]"
                    }`}
                    style={{ 
                      fontFamily: pdfFontFamily === "Times New Roman" ? "'Times New Roman', serif" : pdfFontFamily === "Inter" ? "'Inter', sans-serif" : pdfFontFamily === "JetBrains Mono" ? "monospace" : "Arial, sans-serif",
                      fontSize: pdfFontSize === "11pt" ? "11.5px" : pdfFontSize === "13pt" ? "14.5px" : "13px",
                      lineHeight: pdfLineHeight === "1.15" ? "1.25" : pdfLineHeight === "2.0" ? "1.9" : "1.5"
                    }}>
                      {pdfWatermark !== "None" && (
                        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden z-0">
                          <span className="text-red-500/[0.08] text-8xl font-black rotate-[-35deg] uppercase tracking-widest whitespace-nowrap">
                            {pdfWatermark}
                          </span>
                        </div>
                      )}
                      <div className="z-10 relative flex-1 flex flex-col font-sans">
                        {/* Kop surat — pakai gambar jika ada, fallback ke teks nama sekolah */}
                        {kopSuratImage ? (
                          <div className="text-center pb-4 mb-4 border-b-4 border-double border-black">
                            <img
                              src={kopSuratImage}
                              alt="Kop Sekolah"
                              className="max-h-[90px] max-w-full mx-auto object-contain"
                            />
                          </div>
                        ) : (
                          <div className={`text-center pb-4 mb-6 ${
                            pdfKopStyle === "colored_border"
                              ? "border-t-4 border-[#0D1D34] border-b-2 border-[#FF6B35]"
                              : pdfKopStyle === "minimalist"
                                ? "border-b border-gray-300"
                                : "border-b-4 border-double border-black"
                          }`}>
                            <h2 className={`font-black text-[15px] uppercase tracking-wider ${
                              pdfColorMode === "colored" ? "text-blue-900" : "text-black"
                            }`}>{profileSchool || "NAMA SEKOLAH"}</h2>
                            <p className="text-[9.5px] text-zinc-650 font-extrabold uppercase mt-0.5">
                              {kotaSekolah || "KOTA SEKOLAH"}
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-left text-[10px] text-zinc-700 mt-3 border-t border-zinc-300 pt-2 font-bold uppercase">
                              <div>GURU: <span className="text-black font-black">{profileName}</span></div>
                              <div className="text-right">NIP: <span className="text-black font-black">{profileNip || "—"}</span></div>
                            </div>
                          </div>
                        )}
                        <div className="text-center mb-6 space-y-1">
                          <h3 className="text-[13px] font-black uppercase tracking-wider text-black">
                            INSTRUMEN ASESMEN &amp; KISI-KISI EVALUASI
                          </h3>
                          <p className="text-[9px] text-zinc-650 font-bold uppercase tracking-wide font-sans">
                            SISTEM EVALUASI FORMATIF / SUMATIF KELAS TERPADU
                          </p>
                        </div>
                        <div className="space-y-4 text-left text-zinc-800">
                          {activeResult ? (
                            <div className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-800 font-sans">
                              {activeResult}
                            </div>
                          ) : (
                            <>
                              <div className="space-y-2">
                                <h4 className="text-xs font-black text-black uppercase tracking-wide font-sans pb-1 border-b border-black">
                                  I. KISI-KISI PEMETAAN SOAL EVALUASI
                                </h4>
                                <table className="w-full border-collapse border border-black text-[11px] text-left">
                                  <thead>
                                    <tr className="bg-slate-55 font-black border-b border-black text-black">
                                      <th className="p-2 border border-black w-16 text-center">No. Soal</th>
                                      <th className="p-2 border border-black">Tujuan Pembelajaran</th>
                                      <th className="p-2 border border-black">Level</th>
                                      <th className="p-2 border border-black">Bentuk Soal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td className="p-2 border border-black text-center font-bold">1 - 3</td>
                                      <td className="p-2 border border-black">Mengidentifikasi pilar terkait {subject}</td>
                                      <td className="p-2 border border-black">L1 (C1/Pemahaman)</td>
                                      <td className="p-2 border border-black">Pilihan Ganda</td>
                                    </tr>
                                    <tr>
                                      <td className="p-2 border border-black text-center font-bold">4 - 7</td>
                                      <td className="p-2 border border-black">Menerapkan prosedur sistematis dari materi {subject}</td>
                                      <td className="p-2 border border-black">L2 (C3/Aplikasi)</td>
                                      <td className="p-2 border border-black">Pilihan Ganda</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              <div className="space-y-4 pt-4">
                                <h4 className="text-xs font-black text-black uppercase tracking-wide pb-1 border-b border-black">
                                  II. SOAL EVALUASI PILIHAN GANDA ({soalList.length} BUTIR)
                                </h4>
                                <div className="space-y-3">
                                  {soalList.map((soal) => (
                                    <div key={soal.no} className="text-[11px] space-y-1 border-b border-slate-50 pb-2">
                                      <strong>{soal.no}. {soal.pertanyaan}</strong>
                                      <div className="grid grid-cols-2 gap-2 pl-3 italic text-zinc-650">
                                        {soal.pilihan.map((p, pIdx) => (
                                          <div key={pIdx}>{p}</div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        {pdfShowSignature && (
                          <div className="mt-10 grid grid-cols-2 gap-8 text-[11.5px] font-sans pt-6 border-t border-dashed border-zinc-300 font-bold uppercase select-none">
                            <div className="text-center space-y-14">
                              <div>
                                <p className="text-zinc-[#FF6B35] mb-0.5 text-[9.5px]">Mengetahui,</p>
                                <p className="text-black font-extrabold">
                                  {namaKepalaSekolah || `KEPALA SEKOLAH`}
                                </p>
                                <p className="text-[9px] text-zinc-500 mt-0.5">
                                  NIP. {nipKepalaSekolah || "................................"}
                                </p>
                              </div>
                              <div>
                                <p className="text-black font-extrabold">___________________________</p>
                              </div>
                            </div>
                            <div className="text-center space-y-14">
                              <div>
                                <p className="text-zinc-[#FF6B35] mb-0.5 text-[9.5px]">Dibuat Oleh,</p>
                                <p className="text-black font-extrabold">GURU MATA PELAJARAN</p>
                              </div>
                              <div>
                                <p className="text-black font-extrabold">{profileName}</p>
                                <p className="text-zinc-500 text-[9px] mt-0.5">NIP: {profileNip || "BELUM DIATUR"}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-center pt-4 border-t border-zinc-100 text-[9px] text-zinc-400 font-bold tracking-wider uppercase">
                        Halaman 1 dari 1 • Asesmen GuruPintar AI
                      </div>
                    </div>
                  )}

                  {/* ====== VIEWMODE: SOAL UJIAN PREVIEW ====== */}
                  {viewMode === "soal_ujian" && (
                    <div className={`w-[794px] min-h-[1123px] bg-white text-black shadow-2xl relative flex flex-col justify-between border border-slate-300 ${
                      pdfMargin === "narrow" ? "p-[1.1cm]" : pdfMargin === "wide" ? "p-[3.2cm]" : "p-[2.3cm]"
                    }`}
                    style={{ 
                      fontFamily: pdfFontFamily === "Times New Roman" ? "'Times New Roman', serif" : pdfFontFamily === "Inter" ? "'Inter', sans-serif" : pdfFontFamily === "JetBrains Mono" ? "monospace" : "Arial, sans-serif",
                      fontSize: pdfFontSize === "11pt" ? "11.5px" : pdfFontSize === "13pt" ? "14.5px" : "13px",
                      lineHeight: pdfLineHeight === "1.15" ? "1.25" : pdfLineHeight === "2.0" ? "1.9" : "1.5"
                    }}>
                      {pdfWatermark !== "None" && (
                        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden z-0">
                          <span className="text-red-500/[0.08] text-8xl font-black rotate-[-35deg] uppercase tracking-widest whitespace-nowrap">
                            {pdfWatermark}
                          </span>
                        </div>
                      )}
                      <div className="z-10 relative flex-1 flex flex-col font-sans">
                        {/* Kop surat — pakai gambar jika ada, fallback ke teks nama sekolah */}
                        {kopSuratImage ? (
                          <div className="text-center pb-4 mb-4 border-b-4 border-double border-black">
                            <img
                              src={kopSuratImage}
                              alt="Kop Sekolah"
                              className="max-h-[90px] max-w-full mx-auto object-contain"
                            />
                          </div>
                        ) : (
                          <div className={`text-center pb-4 mb-6 ${
                            pdfKopStyle === "colored_border"
                              ? "border-t-4 border-[#0D1D34] border-b-2 border-[#FF6B35]"
                              : pdfKopStyle === "minimalist"
                                ? "border-b border-gray-300"
                                : "border-b-4 border-double border-black"
                          }`}>
                            <h2 className={`font-black text-[15px] uppercase tracking-wider ${
                              pdfColorMode === "colored" ? "text-blue-900" : "text-black"
                            }`}>{profileSchool || "NAMA SEKOLAH"}</h2>
                            <p className="text-[9.5px] text-zinc-650 font-extrabold uppercase mt-0.5">
                              {kotaSekolah || "KOTA SEKOLAH"}
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-left text-[10px] text-zinc-700 mt-3 border-t border-zinc-300 pt-2 font-bold uppercase">
                              <div>GURU: <span className="text-black font-black">{profileName}</span></div>
                              <div className="text-right">NIP: <span className="text-black font-black">{profileNip || "—"}</span></div>
                            </div>
                          </div>
                        )}
                        <div className="text-center mb-6 space-y-1">
                          <h3 className="text-[13px] font-black text-red-700 uppercase tracking-wider">
                            KISI-KISI &amp; NASKAH SOAL UJIAN KELAS
                          </h3>
                          <p className="text-[9px] text-zinc-650 font-bold uppercase tracking-wide">
                            EVALUASI FORMATIF &amp; SUMATIF MANDIRI
                          </p>
                        </div>
                        <div className="space-y-4 text-left text-zinc-805">
                          {activeResult ? (
                            <div className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-800 font-sans">
                              {activeResult}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <p className="font-bold text-[12px] uppercase">Butir Soal Pilihan Ganda ({soalList.length} Butir):</p>
                              {soalList.map((soal) => (
                                <div key={soal.no} className="space-y-1 pl-2 text-[11px] border-b border-zinc-55 pb-2">
                                  <strong>{soal.no}. {soal.pertanyaan}</strong>
                                  <div className="grid grid-cols-2 gap-1.5 pl-3 text-[10.5px] italic text-zinc-600">
                                    {soal.pilihan.map((p, pIdx) => (
                                      <div key={pIdx}>{p}</div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {pdfShowSignature && (
                          <div className="mt-10 grid grid-cols-2 gap-8 text-[11.5px] font-sans pt-6 border-t border-dashed border-zinc-300 font-bold uppercase select-none">
                            <div className="text-center space-y-14">
                              <div>
                                <p className="text-zinc-[#FF6B35] mb-0.5 text-[9.5px]">Mengetahui,</p>
                                <p className="text-black font-extrabold">
                                  {namaKepalaSekolah || `KEPALA SEKOLAH`}
                                </p>
                                <p className="text-[9px] text-zinc-500 mt-0.5">
                                  NIP. {nipKepalaSekolah || "................................"}
                                </p>
                              </div>
                              <div>
                                <p className="text-black font-extrabold">___________________________</p>
                              </div>
                            </div>
                            <div className="text-center space-y-14">
                              <div>
                                <p className="text-zinc-[#FF6B35] mb-0.5 text-[9.5px]">Dibuat Oleh,</p>
                                <p className="text-black font-extrabold">GURU MATA PELAJARAN</p>
                              </div>
                              <div>
                                <p className="text-black font-extrabold">{profileName}</p>
                                <p className="text-zinc-500 text-[9px] mt-0.5">NIP: {profileNip || "BELUM DIATUR"}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-center pt-4 border-t border-zinc-100 text-[9px] text-zinc-400 font-bold tracking-wider uppercase">
                        Halaman 1 dari 1 • Paket Soal GuruPintar AI
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* CONTINUOUS SINGLE WORKSPACE FOR SELECTED VIEWMODE */
                <div 
                  className={`w-[794px] bg-white text-black shadow-2xl relative flex flex-col border border-slate-300 min-h-[1123px] ${
                    pdfMargin === "narrow" ? "p-[1.1cm]" : pdfMargin === "wide" ? "p-[3.2cm]" : "p-[2.3cm]"
                  }`}
                  style={{ 
                    fontFamily: pdfFontFamily === "Times New Roman" ? "'Times New Roman', serif" : pdfFontFamily === "Inter" ? "'Inter', sans-serif" : pdfFontFamily === "JetBrains Mono" ? "monospace" : "Arial, sans-serif",
                    fontSize: pdfFontSize === "11pt" ? "11.5px" : pdfFontSize === "13pt" ? "14.5px" : "13px",
                    lineHeight: pdfLineHeight === "1.15" ? "1.25" : pdfLineHeight === "2.0" ? "1.9" : "1.5"
                  }}
                >
                  {pdfWatermark !== "None" && (
                    <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden z-0">
                      <span className="text-red-500/[0.07] text-9xl font-black rotate-[-35deg] uppercase tracking-widest whitespace-nowrap">
                        {pdfWatermark}
                      </span>
                    </div>
                  )}

                  <div className="z-10 relative space-y-8 text-left">
                    {/* Kop Header */}
                    <div className="text-center border-b-4 border-double border-black pb-4 mb-6 font-sans">
                      <h2 className="font-extrabold text-[15px] uppercase tracking-wider">{profileSchool}</h2>
                      <p className="text-[10px] text-zinc-650 font-bold uppercase mt-0.5">TERAKREDITASI NASIONAL • KOMUNITAS GURU MERDEKA</p>
                      <div className="grid grid-cols-2 gap-4 text-left text-[9.5px] mt-3 border-t border-black pt-2 font-bold uppercase">
                        <div>GURU: <span className="text-black font-black">{profileName}</span></div>
                        <div>NIP: <span className="text-black font-black">{profileNip || "BELUM DIATUR"}</span></div>
                      </div>
                    </div>

                    {/* Styled Content according to active viewMode */}
                    <div className="space-y-6">
                      {viewMode === "rpp" && (
                        <>
                          <div className="text-center space-y-1">
                            <h3 className="text-[13px] font-black uppercase tracking-wider">
                              RENCANA PELAKSANAAN PEMBELAJARAN (RPP) / MODUL AJAR
                            </h3>
                            <p className="text-[9.5px] text-zinc-500 font-bold uppercase">ALUR ALIRAN BERKELANJUTAN SIMULATOR</p>
                          </div>
                          {activeResult ? (
                            renderStepwiseContent(activeResult)
                          ) : (
                            <>
                              <div>
                                <h4 className="text-[12px] font-black uppercase tracking-wide border-b border-black pb-0.5 mb-2">I. IDENTITAS MODUL AJAR</h4>
                                <p>Sekolah: {profileSchool}</p>
                                <p>Mapel: {rpp.identitas_modul?.mata_pelajaran || manualSubject}</p>
                                <p>Materi Pokok: {rpp.identitas_modul?.materi_pokok}</p>
                                <p>Alokasi: {rpp.identitas_modul?.alokasi_waktu}</p>
                              </div>
                              <div>
                                <h4 className="text-[12px] font-black uppercase tracking-wide border-b border-black pb-0.5 mb-2">II. KOMPONEN INTI UTAMA</h4>
                                <strong className="block text-[11px] mt-2 underline">Tujuan Pembelajaran:</strong>
                                <div className="mt-1 text-[11.5px] font-medium text-zinc-700 whitespace-pre-line leading-relaxed pl-3 border-l-2 border-zinc-200">
                                  {magicStudioOutput ? magicStudioOutput.rpp_merdeka_formal.tujuan_pembelajaran : rpp.komponen_inti?.tujuan_pembelajaran}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-[12px] font-black uppercase tracking-wide border-b border-black pb-0.5 mb-2">III. LANGKAH SCENARIO KEGIATAN</h4>
                                <div className="space-y-4 font-sans">
                                  <div className="space-y-1">
                                    <span className="font-extrabold text-[11px] uppercase tracking-wider text-zinc-850">🏁 Kegiatan Pendahuluan (10 - 15 Menit)</span>
                                    <div className="pl-3 mt-0.5 font-medium text-[11px] text-zinc-700 whitespace-pre-line leading-relaxed border-l border-zinc-200">
                                      {rpp.langkah_pembelajaran?.kegiatan_pembuka || "Pendahuluan persepsi doa bersama dan pengenalan materi pokok kelas."}
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="font-extrabold text-[11px] uppercase tracking-wider text-zinc-850">🔥 Kegiatan Inti Eksploratif (45 - 50 Menit)</span>
                                    <div className="pl-3 mt-0.5 font-medium text-[11px] text-zinc-700 whitespace-pre-line leading-relaxed border-l border-zinc-200">
                                      {rpp.langkah_pembelajaran?.kegiatan_inti_mendalam || "Aktivitas tim kolaboratif bimbingan pendidik."}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {viewMode === "tp_atp" && (
                        <>
                          <div className="text-center space-y-1 font-sans">
                            <h3 className="text-[13px] font-black uppercase tracking-wider">
                              KISI-KISI CAPAIAN &amp; ALUR TUJUAN PEMBELAJARAN (TP &amp; ATP)
                            </h3>
                            <p className="text-[9.5px] text-zinc-500 font-bold uppercase">ALUR BERKELANJUTAN</p>
                          </div>
                          {activeResult ? (
                            renderStepwiseContent(activeResult)
                          ) : (
                            <div className="space-y-4">
                              <h4 className="text-[11.5px] font-bold border-b border-zinc-300 pb-1 uppercase">I. Capaian &amp; Tujuan Pembelajaran (TP)</h4>
                              <p className="text-[11px] font-medium leading-relaxed">{magicStudioOutput ? magicStudioOutput.rpp_merdeka_formal.tujuan_pembelajaran : rpp.komponen_inti?.tujuan_pembelajaran}</p>
                              <h4 className="text-[11.5px] font-bold border-b border-zinc-300 pb-1 uppercase">II. Alur Pembelajaran (ATP)</h4>
                              <p className="text-[11px] font-medium leading-relaxed">{rpp.komponen_inti?.alur_tujuan_pembelajaran || "AI merekomendasikan alur rujukan belajar siswa."}</p>
                            </div>
                          )}
                        </>
                      )}

                      {viewMode === "lkpd" && (
                        <>
                          <div className="text-center space-y-1 font-mono">
                            <h3 className="text-[13px] font-black uppercase tracking-wider">
                              LEMBAR KERJA PESERTA DIDIK (LKPD) MANDIRI
                            </h3>
                            <p className="text-[9.5px] text-zinc-500 font-bold uppercase">ALUR BERKELANJUTAN</p>
                          </div>
                          {activeResult ? (
                            renderStepwiseContent(activeResult)
                          ) : (
                            <div className="space-y-4">
                              <div className="bg-slate-50 border border-slate-200 p-3 grid grid-cols-2 gap-4 text-[11px] font-medium rounded">
                                <div>NAMA KELOMPOK : ...................................</div>
                                <div>HARI / TANGGAL : ...................................</div>
                              </div>
                              <h4 className="font-bold text-[12px]">Judul Aktivitas: "{lkpd.judul_aktivitas || "Selidiki Bersama!"}"</h4>
                              <p className="text-xs text-zinc-705 text-zinc-700 italic">{lkpd.tugas_soal_kelompok?.join(", ") || "Lakukan pengamatan dan isi hasil kerja."}</p>
                            </div>
                          )}
                        </>
                      )}

                      {viewMode === "asesmen" && (
                        <>
                          <div className="text-center space-y-1 font-sans">
                            <h3 className="text-[13px] font-black uppercase tracking-wider">
                              RUBRIK ASESMEN &amp; KISI-KISI EVALUASI
                            </h3>
                            <p className="text-[9.5px] text-zinc-500 font-bold uppercase">ALUR BERKELANJUTAN</p>
                          </div>
                          {activeResult ? (
                            renderStepwiseContent(activeResult)
                          ) : (
                            <div className="space-y-4 text-slate-800">
                              {soalList.map(soal => (
                                <div key={soal.no} className="text-[11px] space-y-1 border-b pb-2">
                                  <strong>{soal.no}. {soal.pertanyaan}</strong>
                                  <div className="pl-3 text-[10.5px] italic text-zinc-650">Kunci: {soal.kunci}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {viewMode === "soal_ujian" && (
                        <>
                          <div className="text-center space-y-1 font-sans">
                            <h3 className="text-[13px] font-black text-red-700 uppercase tracking-wider">
                              KISI-KISI &amp; NASKAH SOAL UJIAN KELAS
                            </h3>
                            <p className="text-[9.5px] text-zinc-500 font-bold uppercase">ALUR BERKELANJUTAN</p>
                          </div>
                          {activeResult ? (
                            renderStepwiseContent(activeResult)
                          ) : (
                            <div className="space-y-4">
                              {soalList.map(soal => (
                                <div key={soal.no} className="text-[11px] space-y-1 border-b pb-2">
                                  <strong>{soal.no}. {soal.pertanyaan}</strong>
                                  <div className="grid grid-cols-2 gap-1.5 pl-3 text-[10px] italic">
                                    {soal.pilihan.map((p, pIdx) => (
                                      <div key={pIdx}>{p}</div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Signature Box */}
                    {pdfShowSignature && (
                      <div className="pt-8 border-t border-dashed border-zinc-300 grid grid-cols-2 gap-4 text-center font-sans font-bold text-[12px] uppercase">
                        <div className="space-y-12">
                          <p>KEPALA SEKOLAH</p>
                          <p>____________________</p>
                        </div>
                        <div className="space-y-12">
                          <p>GURU PEMBIMBING</p>
                          <p>{profileName}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}
    </div>
  );
};
