import React, { useState, useEffect } from "react";
import { Download, Plus, Save, Table, Trash2, UserPlus, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface LokerTugasProps {
  attendance: { [name: string]: any };
  studentGrades: { [name: string]: { score: number; feedback: string } };
  setStudentGrades: React.Dispatch<React.SetStateAction<{ [name: string]: { score: number; feedback: string } }>>;
  selectedAssignment: string;
  setSelectedAssignment: (val: string) => void;
  subject: string;
  classLevel: string;
  profileName: string;
  profileNip: string;
  profileSchool: string;
  showToast: (msg: string) => void;
  onAddActivity?: (type: string) => void;
  setAttendance?: React.Dispatch<React.SetStateAction<{ [name: string]: { [day: number]: "Hadir" | "Sakit" | "Izin" | "Alpa" } }>>;
  activeKelas?: string;
  onSyncToGoogleSheets?: () => void;
  isExportingSheets?: boolean;
}

const getGradesForAssignment = (
  classLevelStr: string,
  assignmentName: string,
  studentNames: string[]
): { [name: string]: { score: number; feedback: string } } => {
  try {
    const cached = localStorage.getItem(`gurupintar_grades_${classLevelStr}_${assignmentName}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error("Failed to parse cached grades:", e);
  }

  // Fallback to default initial grades or clean ones
  const defaultGrades: { [name: string]: { score: number; feedback: string } } = {
    "Budi Santoso": { score: 95, feedback: "Asimilasi konsep gelembung daun yang istimewa, sketsa terperinci." },
    "Siti Aminah": { score: 88, feedback: "Penjelasan kognitif lengkap, presentasi skema sirkulasi mandiri rapi." },
    "Rian Wijaya": { score: 65, feedback: "Butuh bimbingan mandiri tambahan terkait interpretasi klorofil." },
    "Farhan Alkatiri": { score: 78, feedback: "Sudah memahami kriteria dasar rantai makanan, tingkatkan keaktifan kelas." },
    "Nadia Safira": { score: 91, feedback: "Sangat antusias selama eksperimen kelompok, lembar kerja rapi dan tuntas." }
  };

  const isDefaultAssignment = [
    "Laporan Praktikum Gelembung Daun",
    "Sketsa Siklus Air Berwarna",
    "Format Evaluasi Kuis Lisan Fotosintesis",
    "Asesmen Mandiri Merdeka Belajar"
  ].includes(assignmentName);

  const grades: { [name: string]: { score: number; feedback: string } } = {};
  studentNames.forEach((name) => {
    if (isDefaultAssignment) {
      grades[name] = defaultGrades[name] || { score: 80, feedback: "Ikut serta aktif." };
    } else {
      grades[name] = { score: 0, feedback: "" };
    }
  });

  return grades;
};

export const LokerTugas: React.FC<LokerTugasProps> = ({
  attendance,
  studentGrades,
  setStudentGrades,
  selectedAssignment,
  setSelectedAssignment,
  subject,
  classLevel,
  profileName,
  profileNip,
  profileSchool,
  showToast,
  onAddActivity,
  setAttendance,
  activeKelas = "",
  onSyncToGoogleSheets,
  isExportingSheets = false,
}) => {
  const [newStudentInput, setNewStudentInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveToastOpen, setSaveToastOpen] = useState(false);

  const classKey = activeKelas || classLevel || "default";

  // Dynamic assignments state stored per class
  const [assignments, setAssignments] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`gurupintar_assignments_${classKey}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return [
      "Laporan Praktikum Gelembung Daun",
      "Sketsa Siklus Air Berwarna",
      "Format Evaluasi Kuis Lisan Fotosintesis",
      "Asesmen Mandiri Merdeka Belajar"
    ];
  });

  // Helper to compute class average score trend for all assignments in this class
  const getTrendData = () => {
    const studentNames = Object.keys(attendance);
    const defaultGradesLocal: { [name: string]: { score: number; feedback: string } } = {
      "Budi Santoso": { score: 95, feedback: "Asimilasi konsep gelembung daun yang istimewa, sketsa terperinci." },
      "Siti Aminah": { score: 88, feedback: "Penjelasan kognitif lengkap, presentasi skema sirkulasi mandiri rapi." },
      "Rian Wijaya": { score: 65, feedback: "Butuh bimbingan mandiri tambahan terkait interpretasi klorofil." },
      "Farhan Alkatiri": { score: 78, feedback: "Sudah memahami kriteria dasar rantai makanan, tingkatkan keaktifan kelas." },
      "Nadia Safira": { score: 91, feedback: "Sangat antusias selama eksperimen kelompok, lembar kerja rapi dan tuntas." }
    };

    return assignments.map((assign) => {
      let grades: { [name: string]: { score: number; feedback: string } } = {};
      try {
        const cached = localStorage.getItem(`gurupintar_grades_${classKey}_${assign}`);
        if (cached) {
          grades = JSON.parse(cached);
        } else {
          const isDefaultAssignment = [
            "Laporan Praktikum Gelembung Daun",
            "Sketsa Siklus Air Berwarna",
            "Format Evaluasi Kuis Lisan Fotosintesis",
            "Asesmen Mandiri Merdeka Belajar"
          ].includes(assign);
          studentNames.forEach((name) => {
            if (isDefaultAssignment) {
              grades[name] = defaultGradesLocal[name] || { score: 80, feedback: "Ikut serta aktif." };
            } else {
              grades[name] = { score: 0, feedback: "" };
            }
          });
        }
      } catch (e) {
        console.error(e);
      }

      const scores = Object.values(grades).map((g) => g.score);
      const total = scores.reduce((sum, val) => sum + val, 0);
      const avg = scores.length > 0 ? Math.round((total / scores.length) * 10) / 10 : 0;

      let displayName = assign;
      if (assign.length > 20) {
        displayName = assign.substring(0, 20) + "...";
      }

      return {
        name: displayName,
        fullName: assign,
        "Rata-rata Kelas": avg,
      };
    });
  };

  const trendData = getTrendData();

  // Reload assignments when classKey changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`gurupintar_assignments_${classKey}`);
      if (stored) {
        setAssignments(JSON.parse(stored));
      } else {
        const defaultList = [
          "Laporan Praktikum Gelembung Daun",
          "Sketsa Siklus Air Berwarna",
          "Format Evaluasi Kuis Lisan Fotosintesis",
          "Asesmen Mandiri Merdeka Belajar"
        ];
        setAssignments(defaultList);
        localStorage.setItem(`gurupintar_assignments_${classKey}`, JSON.stringify(defaultList));
      }
    } catch (e) {
      console.error(e);
    }
  }, [classKey]);

  // Modals for add & delete and their states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Update localStorage when assignments list changes
  useEffect(() => {
    try {
      localStorage.setItem(`gurupintar_assignments_${classKey}`, JSON.stringify(assignments));
    } catch (e) {
      console.error(e);
    }
  }, [assignments, classKey]);

  // Synchronize studentGrades with selectedAssignment and classKey
  useEffect(() => {
    const studentNames = Object.keys(attendance);
    const loadedGrades = getGradesForAssignment(classKey, selectedAssignment, studentNames);
    setStudentGrades(loadedGrades);
  }, [selectedAssignment, classKey, attendance]);

  // Save current grades to corresponding assignment key whenever they change
  useEffect(() => {
    if (selectedAssignment) {
      try {
        localStorage.setItem(
          `gurupintar_grades_${classKey}_${selectedAssignment}`,
          JSON.stringify(studentGrades)
        );
      } catch (e) {
        console.error(e);
      }
    }
  }, [studentGrades, selectedAssignment, classKey]);

  // Confirm and add brand new assignment
  const handleConfirmAddAssignment = () => {
    const title = newAssignmentTitle.trim();
    if (!title) {
      showToast("⚠️ Judul asesmen tidak boleh kosong!");
      return;
    }
    if (assignments.includes(title)) {
      showToast("⚠️ Judul asesmen sudah terdaftar!");
      return;
    }

    // Save current assignment grade status first
    try {
      localStorage.setItem(
        `gurupintar_grades_${classKey}_${selectedAssignment}`,
        JSON.stringify(studentGrades)
      );
    } catch (e) {
      console.error(e);
    }

    const updated = [...assignments, title];
    setAssignments(updated);
    setIsAddModalOpen(false);
    setNewAssignmentTitle("");

    // Clear / reset all scores & feedbacks to initial zero values
    const studentNames = Object.keys(attendance);
    const resetGrades: { [name: string]: { score: number; feedback: string } } = {};
    studentNames.forEach((name) => {
      resetGrades[name] = { score: 0, feedback: "" };
    });

    setStudentGrades(resetGrades);
    setSelectedAssignment(title);

    try {
      localStorage.setItem(
        `gurupintar_grades_${classKey}_${title}`,
        JSON.stringify(resetGrades)
      );
    } catch (e) {
      console.error(e);
    }

    showToast(`✨ Sukses membuat lembar nilai baru "${title}"!`);
    if (onAddActivity) {
      onAddActivity(`Membuat asesmen baru: "${title}" - Kelas ${classKey}`);
    }
  };

  // Confirm and delete selected assignment safely
  const handleConfirmDeleteAssignment = () => {
    const updated = assignments.filter((item) => item !== selectedAssignment);
    const fallbackList = [
      "Laporan Praktikum Gelembung Daun",
      "Sketsa Siklus Air Berwarna",
      "Format Evaluasi Kuis Lisan Fotosintesis",
      "Asesmen Mandiri Merdeka Belajar"
    ];
    const finalAssignments = updated.length > 0 ? updated : fallbackList;

    setAssignments(finalAssignments);

    try {
      localStorage.removeItem(`gurupintar_grades_${classKey}_${selectedAssignment}`);
    } catch (e) {
      console.error(e);
    }

    const nextAssignment = finalAssignments[0];
    setSelectedAssignment(nextAssignment);

    const studentNames = Object.keys(attendance);
    const nextGrades = getGradesForAssignment(classKey, nextAssignment, studentNames);
    setStudentGrades(nextGrades);

    setIsDeleteModalOpen(false);
    showToast(`🗑 Sukses menghapus asesmen "${selectedAssignment}"`);
    if (onAddActivity) {
      onAddActivity(`Menghapus asesmen: "${selectedAssignment}" - Kelas ${classKey}`);
    }
  };

  // Premium automated saving process giving a strong feel of security
  const handleSaveGrades = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveToastOpen(true);
      showToast("💾 Semua data nilai berhasil disimpan!");
      if (onAddActivity) {
        onAddActivity(`Penyimpanan lembar nilai rincian "${selectedAssignment}" - Kelas ${classKey}`);
      }
      // Automatical dismiss toast after 3 seconds
      setTimeout(() => {
        setSaveToastOpen(false);
      }, 3000);
    }, 650);
  };

  const handleAddStudentToGrades = () => {
    const name = newStudentInput.trim();
    if (!name) return;
    if (studentGrades[name]) {
      showToast("⚠️ Siswa sudah ada!");
      return;
    }
    setStudentGrades(prev => ({
      ...prev,
      [name]: { score: 80, feedback: "Aktif mengikuti pembelajaran." }
    }));
    if (setAttendance) {
      setAttendance(prev => ({
        ...prev,
        [name]: {}
      }));
    }
    setNewStudentInput("");
    if (onAddActivity) onAddActivity(`Menambahkan siswa baru: ${name}`);
    showToast(`✅ Siswa "${name}" ditambahkan ke catatan nilai!`);
  };

  // Update Grade Score inline
  const handleUpdateGradeScore = (name: string, score: number) => {
    setStudentGrades((prev) => {
      const copy = { ...prev };
      const current = copy[name] || { score: 80, feedback: "Ikut serta aktif" };
      copy[name] = { ...current, score: Math.min(100, Math.max(0, score)) };
      return copy;
    });
  };

  // Update Grade Feedback inline
  const handleUpdateGradeFeedback = (name: string, feedback: string) => {
    setStudentGrades((prev) => {
      const copy = { ...prev };
      const current = copy[name] || { score: 80, feedback: "Ikut serta aktif" };
      copy[name] = { ...current, feedback };
      return copy;
    });
  };

  // Download XLSX spreadsheet file format (SheetJS)
  const downloadLokerXlsx = () => {
    const data: any[][] = [];

    // Title & Info
    data.push(["REKAPITULASI CATATAN NILAI EVALUASI GURU"]);
    data.push([`Sekolah: ${profileSchool}`, `Kelas: ${classKey}`, `Asesmen: ${selectedAssignment}`]);
    data.push([`Guru Pengampu: ${profileName}`, `NIP: ${profileNip || "-"}`]);
    data.push([]); // Spacer row

    // Header Row
    data.push([
      "No",
      "Nama Lengkap Murid",
      "Mata Pelajaran",
      "Skor Angka (0-100)",
      "Saran / Catatan Umpan Balik Guru",
      "Predikat Kognitif"
    ]);

    // Student Rows
    Object.keys(attendance).forEach((name, idx) => {
      const rec = studentGrades[name] || { score: 80, feedback: "Ikut serta aktif" };
      let predikat = "Sangat Layak (A)";
      if (rec.score < 70) {
        predikat = "Perlu Bimbingan (C)";
      } else if (rec.score < 90) {
        predikat = "Layak (B)";
      }

      data.push([
        idx + 1,
        name,
        subject,
        rec.score,
        rec.feedback,
        predikat
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Nilai ");

    // Write XLSX
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const fileBlob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    const url = URL.createObjectURL(fileBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Rekap_Nilai_Tugas_${selectedAssignment.replace(/\s+/g, "_")}.xlsx`;
    link.click();

    showToast("📥 Rekap Nilai Tugas (.XLSX) sukses diunduh — asli siap pakai!");
    if (onAddActivity) {
      onAddActivity(`Ekspor rekapan Catatan Nilai Asesmen "${selectedAssignment}" - Kelas ${classKey}`);
    }
  };

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* 💡 Step by Step Onboarding Guide */}
      <div id="gradebook-onboarding-banner" className="bg-blue-50 border border-blue-100 p-3 px-4 rounded-xl flex items-start sm:items-center gap-3 text-xs text-[#1E3A8A] font-semibold shadow-xs select-none">
        <span className="text-base shrink-0">💡</span>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
          <span className="font-bold text-[#1E3A8A] whitespace-nowrap">Panduan Pengisian:</span>
          <div className="flex items-center flex-wrap gap-1.5 text-slate-600 text-[11px] sm:text-xs">
            <span className="bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded font-bold text-blue-900">1</span>
            <span>Pilih Tugas</span>
            <span className="text-blue-400 font-bold font-mono">&rarr;</span>
            <span className="bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded font-bold text-blue-900">2</span>
            <span>Tulis Nilai &amp; Umpan Balik Siswa</span>
            <span className="text-blue-400 font-bold font-mono">&rarr;</span>
            <span className="bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded font-bold text-blue-900">3</span>
            <span>Klik Simpan Catatan Nilai</span>
          </div>
        </div>
      </div>

      {/* Selector & Export Bar */}
      <div className="bg-white border border-slate-100 p-4 rounded-[12px] flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shadow-xs select-none">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
          <div className="flex items-center gap-2.5 flex-1 sm:flex-initial">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Tugas Aktif:</span>
            <select
              value={selectedAssignment}
              onChange={(e) => {
                setSelectedAssignment(e.target.value);
                showToast(`Catatan Nilai diubah ke: "${e.target.value}"`);
              }}
              className="bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] flex-1 sm:w-80 cursor-pointer"
            >
              {assignments.map((assignment) => (
                <option key={assignment} value={assignment}>
                  {assignment}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* + Tambah Asesmen Baru button */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-initial bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs py-2 px-3.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-100 whitespace-nowrap h-9"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>+ Tugas Baru</span>
            </button>

            {/* Trash button to DELETE ACTIVE ASSIGNMENT */}
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              title="Hapus Tugas"
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs p-2 rounded-lg flex items-center justify-center transition cursor-pointer border border-rose-100 h-9 w-9 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-550" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 w-full xl:w-auto">
          <button
            onClick={handleSaveGrades}
            disabled={isSaving}
            className="flex-1 bg-[#1E3A8A] hover:bg-blue-800 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 select-none shadow-xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white shrink-0" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-white" />
                Simpan Catatan Nilai
              </>
            )}
          </button>

          <button
            onClick={downloadLokerXlsx}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            Ekspor Rekap (.XLSX)
          </button>

          {onSyncToGoogleSheets && (
            <button
              disabled={isExportingSheets}
              onClick={onSyncToGoogleSheets}
              className="flex-1 bg-[#1E3A8A] hover:bg-[#152a66] disabled:bg-slate-300 text-white font-bold py-2 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:cursor-wait select-none"
            >
              <span className={`w-2 h-2 rounded-full bg-emerald-400 ${isExportingSheets ? "animate-ping" : "animate-pulse"}`}></span>
              <span>{isExportingSheets ? "Menyinkronkan Sheets..." : "Sinkronkan Google Sheets 📊"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Editable Grades table */}
      <div className="bg-white border border-slate-100 rounded-[12px] shadow-xs p-3 sm:p-6">
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 gap-4 select-none">
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 font-sans">
              <Table className="w-4 h-4 text-[#1E3A8A]" />
              Catatan Nilai Kelas
            </h4>
            <p className="text-[11px] text-slate-500 leading-normal mt-0.5 font-sans font-medium">
              Sistem menghitung predikat pencapaian siswa otomatis berdasarkan standar kurikulum Merdeka.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 border border-slate-100 rounded-lg">
              <input
                type="text"
                placeholder="Nama Murid Baru..."
                value={newStudentInput}
                onChange={(e) => setNewStudentInput(e.target.value)}
                className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] text-slate-800"
              />
              <button
                type="button"
                onClick={handleAddStudentToGrades}
                className="bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold text-xs px-3 py-1 rounded transition cursor-pointer flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3 text-white" />
                Tambah Siswa
              </button>
            </div>
            <div className="text-[10.5px] text-[#1E3A8A] font-bold bg-blue-50 border border-blue-100 rounded-lg p-1 px-2.5">
              🟢 Mode Input Aktif
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 font-medium font-sans">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold select-none">
                <th className="py-2.5 px-3 w-12 text-center">No</th>
                <th className="py-2.5 px-3 w-52 text-left">Nama Murid</th>
                <th className="py-2.5 px-3 w-32 text-center">Skor Angka (0-100)</th>
                <th className="py-2.5 px-3 text-left">Umpan Balik / Catatan Guru</th>
                <th className="py-2.5 px-3 text-center w-40">Predikat Pencapaian</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(attendance).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium italic font-sans border-b border-slate-100">
                    Belum ada data murid terdaftar. Tambahkan murid melalui halaman absensi terlebih dahulu.
                  </td>
                </tr>
              ) : (
                Object.keys(attendance).map((name, idx) => {
                  const rec = studentGrades[name] || { score: 80, feedback: "Ikut serta aktif" };
                  const score = rec.score;
                  const feedback = rec.feedback;

                  let badgeColor = "text-emerald-700 bg-emerald-50 border-emerald-100";
                  let label = "Sangat Layak (A)";
                  if (score < 70) {
                    badgeColor = "text-red-700 bg-red-50 border-red-100";
                    label = "Perlu Bimbingan (C)";
                  } else if (score < 90) {
                    badgeColor = "text-amber-700 bg-amber-50 border-amber-100";
                    label = "Layak (B)";
                  }

                  return (
                    <tr key={name} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                      <td className="py-3 px-3 text-center text-slate-400 font-mono font-bold">{idx + 1}</td>
                      <td className="py-3 px-3 font-bold text-slate-800 text-[12.5px] whitespace-normal break-words" title={name}>
                        {name}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={score}
                          onChange={(e) => handleUpdateGradeScore(name, parseInt(e.target.value) || 0)}
                          className="w-20 bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-center font-bold transition-all duration-200 focus:outline-none focus:border-blue-550 focus:bg-white focus:text-slate-900"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={feedback}
                          onChange={(e) => handleUpdateGradeFeedback(name, e.target.value)}
                          placeholder="Tulis umpan balik di sini..."
                          className="w-full bg-slate-50 text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-550 font-semibold focus:bg-white focus:text-slate-900 transition-all duration-200"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`text-[10px] font-bold p-1 px-2.5 rounded-md border ${badgeColor} select-none block text-center w-max mx-auto font-sans`}>
                          {label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Double Save Button: Bottom of the Table */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-3 mt-5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl select-none">
          <span className="text-[11px] text-slate-500 font-bold px-3 py-1 bg-white border border-slate-100 rounded-lg flex items-center gap-1">
            <span className="text-emerald-500">✔</span> Data terisi lengkap? Klik simpan untuk menyimpan nilai kelas:
          </span>
          <button
            type="button"
            onClick={handleSaveGrades}
            disabled={isSaving}
            className="w-full sm:w-auto bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition active:scale-98 select-none disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white shrink-0" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-white" />
                Simpan Catatan Nilai
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-[11px] mt-6 select-none text-slate-500 leading-normal font-sans font-medium">
          💬 <strong className="text-slate-700">Skor Kelulusan &amp; Tindak Lanjut:</strong>
          <p className="mt-1 leading-relaxed text-slate-600 font-sans">
            - Nilai &ge; 90: Kriteria <strong>Sangat Layak (A)</strong>. Siswa siap melaju atau diberikan materi pengayaan.
            <br />
            - Nilai 70-89: Kriteria <strong>Layak (B)</strong>. Siswa menguasai kompetensi dasar dengan baik.
            <br />
            - Nilai &lt; 70: Kriteria <strong>Perlu Bimbingan (C)</strong>. Guru disarankan melakukan bimbingan intensif tambahan.
          </p>
        </div>
      </div>

      {/* 📊 Recharts Class Average Score Trend */}
      <div className="bg-white border border-slate-100 p-4 sm:p-6 rounded-[12px] shadow-xs select-none">
        <div className="flex flex-col md:flex-row md:items-start justify-between pb-4 mb-4 border-b border-slate-100 gap-4">
          <div className="space-y-1.5 flex-1 pr-0 md:pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                📊 Grafik Perkembangan Rata-rata Kelas
              </h4>
              <span className="bg-blue-50 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded-md border border-blue-150 uppercase tracking-wide">
                Kolektif Kelas (Seluruh Siswa)
              </span>
            </div>
            <p className="text-[11px] text-slate-450 font-sans font-medium mt-0.5 leading-relaxed">
              Grafik otomatis menggunakan kriteria penilaian Kurikulum Merdeka untuk memantau fluktuasi rata-rata kognitif siswa di setiap tugas.
            </p>
            <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl mt-2 text-[10.5px] leading-relaxed text-slate-600 space-y-1 max-w-3xl">
              <h5 className="font-extrabold text-slate-850 flex items-center gap-1">
                <span>💡 Bagaimana Cara Kerja Grafik ini?</span>
              </h5>
              <p className="font-semibold text-slate-650">
                Grafik ini adalah <strong>Grafik Rata-rata Seluruh Kelas</strong>, bukan grafik individual per anak. Setiap titik di grafik menunjukkan nilai rata-rata dari seluruh murid digabung untuk asesmen tertentu. Ini membantu Bapak/Ibu memantau perkembangan pemahaman kelas secara umum dari waktu ke waktu. Untuk melihat nilai per anak, silakan lihat rincian langsung di tabel nilai interaktif di atas.
              </p>
            </div>
          </div>
          <div className="text-[11.5px] font-bold text-[#1E3A8A] bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-2 shrink-0 self-start md:self-auto">
            <span>Rata-rata Tertinggi:</span>
            <span className="text-emerald-600 font-extrabold text-sm">
              {trendData.length > 0 ? Math.max(...trendData.map(d => d["Rata-rata Kelas"])) : 0}
            </span>
          </div>
        </div>

        <div className="w-full h-64 md:h-72 mt-2">
          {trendData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 italic">
              Belum ada data tugas untuk dianalisis
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 15, right: 30, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={10.5} 
                  fontWeight="600"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10.5} 
                  fontWeight="600"
                  domain={[0, 100]} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: "600",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                  }}
                  formatter={(value: any, name: any, props: any) => [
                    <span className="font-bold text-slate-800" key="val">{value}</span>,
                    <span className="text-[#1E3A8A] text-xs font-bold" key="name">{props.payload.fullName}</span>
                  ]}
                  labelClassName="hidden"
                />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "11px", fontWeight: "bold", color: "#475569" }}
                />
                <Line
                  name="Rata-rata Kelas"
                  type="monotone"
                  dataKey="Rata-rata Kelas"
                  stroke="#1E3A8A"
                  strokeWidth={3}
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#EA580C" }}
                  dot={{ r: 4, strokeWidth: 2, stroke: "#1E3A8A", fill: "#ffffff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Premium Toast Success for absolute sense of security */}
      {saveToastOpen && (
        <div id="gradebook-success-toast" className="fixed bottom-6 right-6 z-50 transform transition-all duration-300 animate-slide-in-right">
          <div className="bg-emerald-700 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-emerald-500 flex items-center gap-3 font-semibold text-xs tracking-tight">
            <div className="p-1 bg-white/20 rounded-lg">
              <span className="text-sm">✔</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-[12.5px]">Penyimpanan Berhasil!</span>
              <span className="text-[10.5px] text-emerald-100 font-medium">Semua data nilai berhasil disimpan!</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Asesmen Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs select-none animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-150 p-6 max-w-sm w-full mx-auto space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <h3 className="font-extrabold text-[#0D1D34] text-sm uppercase tracking-wider font-sans">
                Buat Asesmen Baru
              </h3>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                Masukkan Judul Asesmen / Tugas Baru
              </label>
              <input
                type="text"
                placeholder="Contoh: Ulangan Harian 1, Tugas Pancasila..."
                value={newAssignmentTitle}
                onChange={(e) => setNewAssignmentTitle(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 border-2 border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-150"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmAddAssignment();
                }}
              />
            </div>

            <div className="flex gap-2 justify-end pt-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewAssignmentTitle("");
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAddAssignment}
                className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-extrabold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Buat Lembar Nilai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus Asesmen Konfirmasi */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs select-none animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-rose-100 p-6 max-w-md w-full mx-auto space-y-4">
            <div className="flex items-start gap-3 text-rose-600">
              <span className="text-2xl shrink-0">⚠️</span>
              <div>
                <h3 className="font-extrabold text-rose-700 text-sm uppercase tracking-wide">
                  Konfirmasi Hapus Asesmen
                </h3>
                <p className="text-xs text-rose-600 font-medium leading-relaxed mt-1">
                  Apakah Anda yakin ingin menghapus Asesmen <strong className="text-slate-900 underline font-black">"{selectedAssignment}"</strong> beserta seluruh data nilai siswa di dalamnya? Tindakan ini tidak dapat dibatalkan!
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAssignment}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
