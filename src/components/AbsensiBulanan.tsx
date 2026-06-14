import React, { useState, useEffect } from "react";
import { Calendar, UserPlus, Download, Trash2, MoreVertical, AlertTriangle } from "lucide-react";

interface AbsensiBulananProps {
  attendance: { [name: string]: { [day: number]: "Hadir" | "Sakit" | "Izin" | "Alpa" } };
  setAttendance: React.Dispatch<React.SetStateAction<{ [name: string]: { [day: number]: "Hadir" | "Sakit" | "Izin" | "Alpa" } }>>;
  subject: string;
  classLevel: string;
  activeKelas?: string;
  profileName: string;
  profileNip: string;
  profileSchool: string;
  showToast: (msg: string) => void;
  onAddActivity?: (type: string) => void;
  onSyncToGoogleSheets?: () => void;
  isExportingSheets?: boolean;
}

export const AbsensiBulanan: React.FC<AbsensiBulananProps> = ({
  attendance,
  setAttendance,
  subject,
  classLevel,
  activeKelas,
  profileName,
  profileNip,
  profileSchool,
  showToast,
  onAddActivity,
  onSyncToGoogleSheets,
  isExportingSheets = false,
}) => {
  const [activeTab, setActiveTab] = useState<"harian" | "summary">("harian");
  const [selectedDay, setSelectedDay] = useState<number>(28); // Default active day
  const [newStudentName, setNewStudentName] = useState<string>("");
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(now.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(now.getFullYear());
  const [activeKebabStudent, setActiveKebabStudent] = useState<string | null>(null);
  const [isToolsOpen, setIsToolsOpen] = useState<boolean>(false);
  const [isLockSaving, setIsLockSaving] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");

  // Fallback map & State for Indonesian National Holidays
  const [holidays, setHolidays] = useState<{ [dateStr: string]: string }>({
    // 2026 Fallbacks
    "2026-01-01": "Tahun Baru Masehi",
    "2026-01-19": "Isra Mikraj Nabi Muhammad SAW",
    "2026-02-17": "Tahun Baru Imlek",
    "2026-03-22": "Hari Raya Nyepi",
    "2026-03-20": "Hari Raya Idul Fitri 1447 H",
    "2026-03-21": "Hari Raya Idul Fitri 1447 H",
    "2026-04-03": "Wafat Yesus Kristus",
    "2026-05-01": "Hari Buruh Internasional",
    "2026-05-14": "Kenaikan Yesus Kristus",
    "2026-05-24": "Hari Raya Waisak",
    "2026-05-27": "Hari Raya Idul Adha 1447 H",
    "2026-06-01": "Hari Lahir Pancasila",
    "2026-06-16": "Tahun Baru Islam 1448 H",
    "2026-08-17": "Hari Proklamasi Kemerdekaan RI",
    "2026-08-25": "Maulid Nabi Muhammad SAW",
    "2026-12-25": "Hari Raya Natal",

    // 2025 Fallbacks
    "2025-01-01": "Tahun Baru Masehi",
    "2025-01-27": "Isra Mikraj Nabi Muhammad SAW",
    "2025-01-29": "Tahun Baru Imlek",
    "2025-03-29": "Hari Raya Nyepi",
    "2025-03-31": "Hari Raya Idul Fitri 1446 H",
    "2025-04-01": "Hari Raya Idul Fitri 1446 H",
    "2025-04-18": "Wafat Yesus Kristus",
    "2025-05-01": "Hari Buruh Internasional",
    "2025-05-12": "Hari Raya Waisak",
    "2025-05-29": "Kenaikan Yesus Kristus",
    "2025-06-01": "Hari Lahir Pancasila",
    "2025-06-06": "Hari Raya Idul Adha 1446 H",
    "2025-06-27": "Tahun Baru Islam 1447 H",
    "2025-08-17": "Hari Kemerdekaan RI",
    "2025-09-05": "Maulid Nabi Muhammad SAW",
    "2025-12-25": "Hari Raya Natal",
  });

  const classKey = activeKelas || classLevel || "default";

  // State for Day Memos / School Agendas (indexed by "YYYY-MM-DD")
  const [dayMemos, setDayMemos] = useState<{ [dateStr: string]: string }>(() => {
    const key = activeKelas || classLevel || "default";
    const saved = localStorage.getItem(`gurupintar_day_memos_${key}`) || localStorage.getItem("gurupintar_day_memos");
    return saved ? JSON.parse(saved) : {};
  });

  // State for Individual Student Attendance Note (indexed by "studentName | YYYY-MM-DD")
  const [studentNotes, setStudentNotes] = useState<{ [studentKey: string]: string }>(() => {
    const key = activeKelas || classLevel || "default";
    const saved = localStorage.getItem(`gurupintar_student_notes_${key}`) || localStorage.getItem("gurupintar_student_notes");
    return saved ? JSON.parse(saved) : {};
  });

  // Sync state when active class changes to guarantee correct local storage load
  useEffect(() => {
    const key = activeKelas || classLevel || "default";
    const savedMemos = localStorage.getItem(`gurupintar_day_memos_${key}`) || localStorage.getItem("gurupintar_day_memos");
    const savedNotes = localStorage.getItem(`gurupintar_student_notes_${key}`) || localStorage.getItem("gurupintar_student_notes");
    setDayMemos(savedMemos ? JSON.parse(savedMemos) : {});
    setStudentNotes(savedNotes ? JSON.parse(savedNotes) : {});
  }, [activeKelas, classLevel]);

  // Reusable Elegant Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionType: "reset_all" | "clear_day" | null;
  }>({
    isOpen: false,
    title: "",
    message: "",
    actionType: null,
  });

  // Fetch National Holidays on year change with CORS safety fallbacks
  useEffect(() => {
    const fetchHolidays = async () => {
      const endpoints = [
        "https://api-harilibur.vercel.app/api",
        `https://dayoffapi.vercel.app/api?year=${currentYear}`
      ];
      
      for (const url of endpoints) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const arr = await res.json();
            if (Array.isArray(arr)) {
              const map: { [dateStr: string]: string } = {};
              arr.forEach((item: any) => {
                const rawDate = item.holiday_date || item.date || item.tanggal;
                const name = item.holiday_name || item.name || item.keterangan || item.summary;
                if (rawDate && name) {
                  const parts = rawDate.split("-");
                  if (parts.length === 3) {
                    const y = parts[0];
                    const m = parts[1].padStart(2, "0");
                    const d = parts[2].padStart(2, "0");
                    map[`${y}-${m}-${d}`] = name;
                  }
                }
              });
              if (Object.keys(map).length > 0) {
                setHolidays(prev => ({ ...prev, ...map }));
                break; // Stop seeking endpoints if fetch succeeds
              }
            }
          }
        } catch (err) {
          console.warn(`Failed fetching public holiday data from ${url}:`, err);
        }
      }
    };
    fetchHolidays();
  }, [currentYear]);

  // Handle Memo Change & Persistence
  const handleMemoChange = (text: string) => {
    const memoKey = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${selectedDay.toString().padStart(2, "0")}`;
    const newMemos = {
      ...dayMemos,
      [memoKey]: text,
    };
    setDayMemos(newMemos);
    const key = activeKelas || classLevel || "default";
    localStorage.setItem(`gurupintar_day_memos_${key}`, JSON.stringify(newMemos));
    localStorage.setItem("gurupintar_day_memos", JSON.stringify(newMemos));
  };

  // Handle Student Custom Note Change & Persistence
  const handleStudentNoteChange = (studentName: string, noteText: string) => {
    const noteKey = `${studentName} | ${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${selectedDay.toString().padStart(2, "0")}`;
    const newNotes = {
      ...studentNotes,
      [noteKey]: noteText,
    };
    setStudentNotes(newNotes);
    const key = activeKelas || classLevel || "default";
    localStorage.setItem(`gurupintar_student_notes_${key}`, JSON.stringify(newNotes));
    localStorage.setItem("gurupintar_student_notes", JSON.stringify(newNotes));
  };

  const MONTHS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Calculate padding based on local day structure (Monday-start padding)
  let dayOfWeekOfFirst = new Date(currentYear, currentMonth, 1).getDay(); // Sunday=0, Monday=1...
  if (dayOfWeekOfFirst === 0) dayOfWeekOfFirst = 7;
  const paddingDays = dayOfWeekOfFirst - 1;

  const handleMonthChange = (m: number) => {
    setCurrentMonth(m);
    const maxDays = new Date(currentYear, m + 1, 0).getDate();
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  };

  const handleYearChange = (y: number) => {
    setCurrentYear(y);
    const maxDays = new Date(y, currentMonth + 1, 0).getDate();
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  };

  // Reset all student attendance records across all days to clear status back to 0
  const handleResetSelectedDay = (bypassConfirm = false) => {
    if (bypassConfirm || confirm(`⚠️ PERINGATAN: Apakah Anda yakin ingin menghapus seluruh data absensi bulan ${MONTHS[currentMonth]} ${currentYear}? Seluruh data kehadiran murid di kelas ini akan disetel ulang kembali ke 0 bersih!`)) {
      setAttendance((prev) => {
        const resetData: typeof prev = {};
        Object.keys(prev).forEach((studentName) => {
          resetData[studentName] = {};
        });
        return resetData;
      });
      showToast("🔄 Seluruh status presensi berhasil dihapus bersih (Kembali ke 0).");
      if (onAddActivity) {
        onAddActivity("Seluruh status presensi disetel ulang bersih");
      }
    }
  };

  // Clear attendance for the selected day only back to "Belum Absen"
  const handleClearSelectedDayOnly = (bypassConfirm = false) => {
    if (bypassConfirm || confirm(`⚠️ Konfirmasi Hapus Harian: Apakah Anda yakin ingin membersihkan seluruh status presensi siswa pada tanggal ${selectedDay} ${MONTHS[currentMonth]} ${currentYear} saja?`)) {
      setAttendance((prev) => {
        const copy = { ...prev };
        Object.keys(copy).forEach((studentName) => {
          if (copy[studentName]) {
            const updatedStudentDays = { ...copy[studentName] };
            delete updatedStudentDays[selectedDay];
            copy[studentName] = updatedStudentDays;
          }
        });
        return copy;
      });
      showToast(`🧹 Sukses membersihkan data presensi tanggal ${selectedDay} ${MONTHS[currentMonth]} ${currentYear}.`);
      if (onAddActivity) {
        onAddActivity(`Membersihkan status presensi pada tanggal ${selectedDay} ${MONTHS[currentMonth]}`);
      }
    }
  };

  const handleConfirmAction = () => {
    const { actionType } = confirmModal;
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    if (actionType === "clear_day") {
      handleClearSelectedDayOnly(true);
    } else if (actionType === "reset_all") {
      handleResetSelectedDay(true);
    }
  };

  // Lock and Save to LocalStorage
  const handleLockAndSave = () => {
    setIsLockSaving(true);
    setTimeout(() => {
      localStorage.setItem("gurupintar_attendance", JSON.stringify(attendance));
      showToast(`💾 Bersesuaian! Semua data presensi berhasil dikunci dan direkam dalam penyimpanan lokal (LocalStorage).`);
      if (onAddActivity) {
        onAddActivity(`Penguncian & penyimpanan data presensi bulan ${MONTHS[currentMonth]}`);
      }
      setIsLockSaving(false);
    }, 750);
  };

  const DAYS_OF_WEEK = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  // Handle adding new student
  const handleAddStudent = () => {
    const trimmed = newStudentName.trim();
    if (!trimmed) {
      showToast("⚠️ Nama siswa tidak boleh kosong!");
      return;
    }
    if (Object.keys(attendance).includes(trimmed)) {
      showToast("⚠️ Nama siswa sudah ada dalam daftar!");
      return;
    }
    setAttendance(prev => ({
      ...prev,
      [trimmed]: {}
    }));
    setNewStudentName("");
    showToast(`✅ Siswa "${trimmed}" berhasil ditambahkan!`);
    if (onAddActivity) {
      onAddActivity(`Penambahan siswa baru "${trimmed}" ke presensi (${classLevel})`);
    }
  };

  // Remove student
  const handleDeleteStudent = (name: string) => {
    if (!confirm(`Hapus siswa "${name}" dari daftar absensi?`)) return;
    setAttendance(prev => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
    showToast(`🗑 Siswa "${name}" berhasil dihapus dari daftar.`);
    if (onAddActivity) {
      onAddActivity(`Penghapusan siswa "${name}" dari presensi (${classLevel})`);
    }
  };

  const handleRemoveStudent = handleDeleteStudent;

  // Fast Update Status on Click
  const handleQuickStatus = (name: string, status: "Hadir" | "Sakit" | "Izin" | "Alpa") => {
    setAttendance((prev) => {
      const studentData = prev[name] ? { ...prev[name] } : {};
      studentData[selectedDay] = status;
      return {
        ...prev,
        [name]: studentData,
      };
    });
  };

  // Set all students to Hadir for convenience
  const handleSetAllToHadir = () => {
    const studentNames = Object.keys(attendance);
    if (studentNames.length === 0) {
      showToast("⚠️ Belum ada murid di kelas untuk ditandai!");
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menandai seluruh ${studentNames.length} siswa sebagai HADIR pada tanggal aktif terpilih (${selectedDay} ${MONTHS[currentMonth]} ${currentYear})?`)) {
      setAttendance((prev) => {
        const copy = { ...prev };
        studentNames.forEach((studentName) => {
          copy[studentName] = {
            ...copy[studentName],
            [selectedDay]: "Hadir",
          };
        });
        return copy;
      });
      showToast(`🟢 Seluruh ${studentNames.length} siswa berhasil ditandai HADIR pada tanggal ${selectedDay}!`);
      if (onAddActivity) {
        onAddActivity(`Set seluruh siswa Hadir pada tanggal ${selectedDay} ${MONTHS[currentMonth]}`);
      }
    }
  };

  // Horizontal Rekap Excel Export (.XLS)
  const downloadAbsensiXlsx = () => {
    let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; }
          th { background-color: #1E3A8A; color: #FFFFFF; font-weight: bold; font-family: sans-serif; text-align: center; font-size: 11px; padding: 5px; }
          td { font-family: sans-serif; text-align: center; font-size: 11px; padding: 5px; }
          .text-left { text-align: left; }
        </style>
      </head>
      <body>
        <h2 style="font-family: sans-serif; color: #1E3A8A; margin-bottom: 2px;">REKAPITULASI PRESENSI BULANAN SISWA</h2>
        <p style="font-family: sans-serif; font-size: 12px; margin: 2px 0;">Sekolah: <strong>${profileSchool}</strong> | Kelas: <strong>${classLevel}</strong> | Mapel: <strong>${subject}</strong></p>
        <p style="font-family: sans-serif; font-size: 11px; margin: 2px 0; color: #555;">Guru Pengampu: <strong>${profileName}</strong> | NIP: <strong>${profileNip || "-"}</strong></p>
        <table border="1">
          <thead>
            <tr>
              <th rowspan="2" style="background-color: #0F172A; color: #ffffff;">No</th>
              <th rowspan="2" style="background-color: #0F172A; color: #ffffff; text-align: left;">Nama Lengkap Murid</th>
              <th colspan="${totalDays}" style="background-color: #1E3A8A; color: #ffffff;">${MONTHS[currentMonth]} ${currentYear}</th>
              <th colspan="4" style="background-color: #EA580C; color: #ffffff;">Akumulasi</th>
              <th rowspan="2" style="background-color: #10B981; color: #ffffff;">Kehadiran</th>
            </tr>
            <tr>
    `;
    for (let i = 1; i <= totalDays; i++) {
      tableHtml += `<th style="background-color: #3B82F6; color: #ffffff; width: 30px;">${i}</th>`;
    }
    tableHtml += `
              <th style="background-color: #10B981; color: #ffffff;">H</th>
              <th style="background-color: #3B82F6; color: #ffffff;">S</th>
              <th style="background-color: #FBBF24; color: #ffffff;">I</th>
              <th style="background-color: #EF4444; color: #ffffff;">A</th>
            </tr>
          </thead>
          <tbody>
    `;

    Object.entries(attendance).forEach(([name, dateObj], idx) => {
      let hCount = 0;
      let sCount = 0;
      let iCount = 0;
      let aCount = 0;

      tableHtml += `
        <tr>
          <td>${idx + 1}</td>
          <td class="text-left" style="font-weight: bold; text-align: left;">${name}</td>
      `;

      for (let d = 1; d <= totalDays; d++) {
        const status = dateObj[d];
        let shortChar = "-";
        let bg = "#F1F5F9";
        if (status === "Hadir") { shortChar = "H"; bg = "#DCFCE7"; hCount++; }
        else if (status === "Sakit") { shortChar = "S"; bg = "#DBEAFE"; sCount++; }
        else if (status === "Izin") { shortChar = "I"; bg = "#FEF3C7"; iCount++; }
        else if (status === "Alpa") { shortChar = "A"; bg = "#FEE2E2"; aCount++; }

        tableHtml += `<td style="background-color: ${bg}; font-weight: bold; color: #475569;">${shortChar}</td>`;
      }
      const totalDaysLogged = hCount + sCount + iCount + aCount;
      const ratio = totalDaysLogged > 0 ? Math.round((hCount / totalDaysLogged) * 100) : 0;
      tableHtml += `
          <td style="font-weight: bold; background-color: #E6F4EA;">${hCount}</td>
          <td style="font-weight: bold; background-color: #E8F0FE;">${sCount}</td>
          <td style="font-weight: bold; background-color: #FEF7E0;">${iCount}</td>
          <td style="font-weight: bold; background-color: #FCE8E6;">${aCount}</td>
          <td style="font-weight: bold; background-color: #D1FAE5; color: #065F46;">${ratio}%</td>
        </tr>
      `;
    });

    tableHtml += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff" + tableHtml], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Rekap_Presensi_Bulanan_Kelas_${classLevel.replace(/\s+/g, "_")}.xls`;
    link.click();
    showToast("📥 Rekap Absensi Bulanan (.XLSX) berhasil diunduh!");
    if (onAddActivity) {
      onAddActivity(`Ekspor rekapan Absensi Bulanan (.XLS) - Kelas ${classLevel}`);
    }
  };

  // Generate date calculations
  const totalStudents = Object.keys(attendance).length;
  const filteredStudents = Object.entries(attendance).filter(([name]) =>
    name.toLowerCase().includes(searchText.toLowerCase())
  );
  let dayH = 0, dayS = 0, dayI = 0, dayA = 0;
  Object.values(attendance).forEach((stData) => {
    const stStatus = stData[selectedDay];
    if (stStatus === "Hadir") dayH++;
    else if (stStatus === "Sakit") dayS++;
    else if (stStatus === "Izin") dayI++;
    else if (stStatus === "Alpa") dayA++;
  });

  const selectedDateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${selectedDay.toString().padStart(2, "0")}`;
  const activeHolidayName = holidays[selectedDateStr] || null;

  return (
    <div className="bg-white border border-slate-100 rounded-[12px] p-3 sm:p-6 shadow-xs space-y-6">
      {/* Upper bar: Tabs & Export Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("harian")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "harian"
                ? "bg-blue-50 text-[#1E3A8A] border-l-4 border-[#1E3A8A]"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            📅 Pencatatan Harian ({MONTHS[currentMonth]} {currentYear})
          </button>
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "summary"
                ? "bg-blue-50 text-[#1E3A8A] border-l-4 border-[#1E3A8A]"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            📊 Rangkuman Kehadiran
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto self-stretch sm:self-auto justify-end relative">
          {onSyncToGoogleSheets && (
            <button
              disabled={isExportingSheets}
              onClick={onSyncToGoogleSheets}
              className="bg-[#1E3A8A] hover:bg-[#152a66] disabled:bg-slate-300 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer disabled:cursor-wait select-none"
            >
              <span className={`w-2 h-2 rounded-full bg-emerald-400 ${isExportingSheets ? "animate-ping" : "animate-pulse"}`}></span>
              <span>{isExportingSheets ? "Menyinkronkan..." : "Sinkronkan Sheets 📊"}</span>
            </button>
          )}

          <button
            onClick={downloadAbsensiXlsx}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Ekspor Rekap (.XLSX)</span>
          </button>

          {/* Tools/Danger Actions Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className="bg-slate-50 hover:bg-slate-105 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition select-none cursor-pointer border border-slate-100"
            >
              <span>⚙️ Pilihan</span>
              <span className="text-[9px] text-slate-400">▼</span>
            </button>

            {isToolsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={() => setIsToolsOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-xl shadow-lg py-2 z-50 animate-fade-in text-left">
                  <div className="px-4 py-1.5 border-b border-slate-100 mb-1">
                    <p className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider">Opsi Kelas</p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsOpen(false);
                      setConfirmModal({
                        isOpen: true,
                        title: "Bersihkan Absen Hari Ini",
                        message: `Apakah Anda yakin ingin menghapus status absensi siswa pada tanggal ${selectedDay} ${MONTHS[currentMonth]} ${currentYear}?`,
                        actionType: "clear_day",
                      });
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 font-bold flex items-center gap-2 transition border-0 cursor-pointer"
                  >
                    🧹 Bersihkan Absen Hari Ini
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsToolsOpen(false);
                      setConfirmModal({
                        isOpen: true,
                        title: "Reset Seluruh Bulan",
                        message: `Apakah Anda yakin ingin menghapus seluruh data absensi bulan ${MONTHS[currentMonth]} ${currentYear}? Semua data kelas akan disetel ulang kembali kosong bersih.`,
                        actionType: "reset_all",
                      });
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-650 hover:bg-red-50 font-bold flex items-center gap-2 transition border-0 cursor-pointer"
                  >
                    🔄 Reset Seluruh Bulan
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {activeTab === "harian" ? (
        <div className="space-y-4">
          {/* Action buttons panel for layout resetting & locking */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/50 border border-blue-50 p-4 rounded-xl">
            <div className="text-xs text-[#1E3A8A] font-bold flex items-center gap-1.5">
              <span>📅 Tanggal:</span>
              <strong className="bg-[#1E3A8A] text-white py-0.5 px-2 rounded font-sans font-bold text-xs">
                {selectedDay} {MONTHS[currentMonth]} {currentYear}
              </strong>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleLockAndSave}
                disabled={isLockSaving}
                className="bg-[#1E3A8A] hover:bg-blue-800 border-0 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition select-none shadow-xs cursor-pointer active:scale-95 disabled:opacity-75"
              >
                {isLockSaving ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></span>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <span>💾 Simpan Data Absensi</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: 1-Month Calendar Grid */}
          <div className="lg:col-span-7 bg-slate-50/50 border border-slate-100 p-5 rounded-xl">
            
            {/* Interactive Month, Day & Year selector dropdowns */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-200">
              <h4 className="text-xs font-black text-[#0D1D34] flex items-center gap-1.5 uppercase tracking-wide select-none">
                <Calendar className="w-4 h-4 text-[#1E3A8A]" />
                Lompat Tanggal / Tahun:
              </h4>
              
              <div className="flex flex-wrap gap-2">
                {/* Tanggal Dropdown Selection */}
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                  className="bg-white border border-slate-300 text-xs font-bold py-1 px-2.5 rounded-lg focus:outline-[#1E3A8A] text-slate-800"
                  title="Pilih Tanggal Ke"
                >
                  {Array.from({ length: totalDays }).map((_, idx) => {
                    const dayNum = idx + 1;
                    return (
                      <option key={dayNum} value={dayNum}>Tgl: {dayNum}</option>
                    );
                  })}
                </select>

                {/* Month Dropdown Selection */}
                <select
                  value={currentMonth}
                  onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                  className="bg-white border border-slate-300 text-xs font-bold py-1 px-2.5 rounded-lg focus:outline-[#1E3A8A] text-slate-800"
                  title="Pilih Bulan"
                >
                  {MONTHS.map((mName, mIdx) => (
                    <option key={mIdx} value={mIdx}>{mName}</option>
                  ))}
                </select>

                {/* Year Dropdown Selection */}
                <select
                  value={currentYear}
                  onChange={(e) => handleYearChange(parseInt(e.target.value))}
                  className="bg-white border border-slate-300 text-xs font-bold py-1 px-2.5 rounded-lg focus:outline-[#1E3A8A] text-slate-800"
                  title="Pilih Tahun"
                >
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Days criteria headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-1">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="py-1">{day}</div>
              ))}
            </div>

            {/* Calendar Numbers Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Padding for empty Monday~Thursday */}
              {Array.from({ length: paddingDays }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square bg-slate-100/50 rounded-lg"></div>
              ))}

              {/* Day values 1 to totalDays */}
              {Array.from({ length: totalDays }).map((_, i) => {
                const dayNum = i + 1;
                const isSelected = selectedDay === dayNum;
                const hasLog = Object.values(attendance).some((stData) => stData[dayNum]);
                const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${dayNum.toString().padStart(2, "0")}`;
                const holidayName = holidays[dateStr];
                const hasMemo = !!dayMemos[dateStr];
                
                return (
                  <button
                    key={`day-${dayNum}`}
                    onClick={() => setSelectedDay(dayNum)}
                    type="button"
                    title={
                      holidayName 
                        ? `🔴 Hari Libur Nasional: ${holidayName}` 
                        : hasMemo 
                        ? `📝 Agenda: ${dayMemos[dateStr]}` 
                        : undefined
                    }
                    className={`aspect-square rounded-xl text-xs font-black relative flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? "bg-[#1E3A8A] text-white shadow-md scale-102"
                        : holidayName
                        ? "bg-rose-50/75 text-rose-700 border border-rose-200 hover:bg-rose-100"
                        : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100"
                    }`}
                  >
                    <span>{dayNum}</span>
                    {/* Tiny dots showing berbagai aktivitas tanggal */}
                    {(hasLog || hasMemo || holidayName) && (
                      <div className="flex gap-0.5 absolute bottom-1 justify-center items-center">
                        {hasLog && <span className="w-1 h-1 rounded-full bg-emerald-500" title="Ada Presensi"></span>}
                        {hasMemo && <span className="w-1 h-1 rounded-full bg-amber-500" title="Ada Agenda"></span>}
                        {holidayName && <span className="w-1 h-1 rounded-full bg-rose-500" title={`Libur: ${holidayName}`}></span>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-4 gap-2 text-center mt-5 bg-white p-3 border border-slate-200/80 rounded-xl rounded-b-none text-[11px] font-bold font-mono">
              <div className="text-emerald-600 bg-emerald-50 py-1.5 rounded-lg border border-emerald-100">
                🟢 {dayH} Hadir
              </div>
              <div className="text-blue-600 bg-blue-50 py-1.5 rounded-lg border border-blue-100">
                🔵 {dayS} Sakit
              </div>
              <div className="text-amber-600 bg-amber-50 py-1.5 rounded-lg border border-amber-100">
                🟡 {dayI} Izin
              </div>
              <div className="text-red-600 bg-red-50 py-1.5 rounded-lg border border-red-100 animate-fade-in">
                🔴 {dayA} Alpa
              </div>
            </div>

            {/* Agenda & Catatan Sekolah Hari Ini */}
            <div id="school-agenda-section" className="mt-4 bg-white p-4 border border-slate-200.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="school-agenda-textarea" className="text-[10.5px] uppercase font-black text-slate-500 tracking-wider flex items-center gap-1.5 select-none">
                  📝 Agenda &amp; Catatan Sekolah Hari Ini
                </label>
                <div className="text-[9.5px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-xl flex items-center gap-1 select-none font-sans border border-emerald-150">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  Tersimpan Otomatis
                </div>
              </div>
              <textarea
                id="school-agenda-textarea"
                placeholder="Tulis memo kegiatan sekolah hari ini (contoh: Kuis Ujian, Rapat Guru, Classmeeting)..."
                value={dayMemos[`${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${selectedDay.toString().padStart(2, "0")}`] || ""}
                onChange={(e) => handleMemoChange(e.target.value)}
                className="w-full min-h-[85px] text-xs font-semibold p-3 text-slate-800 border border-slate-250 bg-slate-50/50 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1E3A8A] placeholder-slate-400"
              />
              <span className="text-[9.5px] text-slate-400 block font-medium">
                💡 Tersimpan otomatis ke memori lokal. Tanggal dengan catatan memo akan ditandai dengan titik kuning di kalender bulanan.
              </span>
            </div>
          </div>

          {/* RIGHT: Selected Date student list & quick actions */}
          <div className="lg:col-span-5 bg-white border border-slate-100 p-5 rounded-[12px] shadow-3xs flex flex-col justify-between">
            <div>
              {activeHolidayName && (
                <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2 select-none">
                  <span>🚫 Hari Libur: {activeHolidayName}</span>
                </div>
              )}

              <div className="mb-4 pb-2 border-b border-slate-100">
                <span className="text-[10px] bg-blue-50 text-[#1E3A8A] px-2.5 py-0.5 rounded-full font-bold block w-max mb-1 font-sans">
                  {selectedDay} {MONTHS[currentMonth]} {currentYear}
                </span>
                <h5 className="text-sm font-bold text-slate-800">
                  Presensi Tanggal Ini
                </h5>
                <p className="text-[11px] text-slate-500">
                  Klik tombol status di samping nama siswa untuk mengabsen.
                </p>
              </div>

              {/* Add Student row inside page */}
              <div className={`flex gap-2 mb-2 p-1.5 border rounded-xl ${activeHolidayName ? "bg-slate-50 border-slate-100" : "bg-slate-50/50 border-slate-100"}`}>
                <input
                  type="text"
                  placeholder={activeHolidayName ? "🔒 Dikunci saat libur" : "Ketik Nama Siswa Baru..."}
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  disabled={!!activeHolidayName}
                  className="bg-white border border-slate-200 rounded-lg whitespace-nowrap px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] flex-1 min-w-0 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-150"
                />
                <button
                  type="button"
                  onClick={handleAddStudent}
                  disabled={!!activeHolidayName}
                  className="bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold text-xs py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  <UserPlus className="w-3.5 h-3.5 text-white" />
                  Tambah
                </button>
              </div>

              {/* Set All to Hadir button */}
              <button
                type="button"
                onClick={handleSetAllToHadir}
                disabled={!!activeHolidayName}
                className={`w-full mb-4 border text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition select-none cursor-pointer shadow-3xs ${
                  activeHolidayName
                    ? "bg-rose-50 border-rose-100 text-rose-500 cursor-not-allowed opacity-80"
                    : "bg-emerald-50 hover:bg-emerald-100/80 border-emerald-100 text-emerald-800 font-bold"
                }`}
              >
                {activeHolidayName ? (
                  <>
                    <span>🔒</span> Penginputan Terkunci (Hari Libur)
                  </>
                ) : (
                  <>
                    <span>🟢</span> Tandai Semua Hadir ({totalStudents} Murid)
                  </>
                )}
              </button>

              {/* Search/Filter Student Input */}
              {totalStudents > 0 && (
                <div className="mb-3 relative no-print select-none">
                  <input
                    type="text"
                    placeholder="🔍 Cari nama siswa..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-150 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1E3A8A] placeholder-slate-400 transition"
                  />
                  {searchText && (
                    <button
                      type="button"
                      onClick={() => setSearchText("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold leading-none cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}

              {/* Student list active rows */}
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {totalStudents === 0 ? (
                  <p className="text-slate-400 italic text-center py-6 text-[11px]">
                    Belum ada nama murid terdaftar di kelas.
                  </p>
                ) : filteredStudents.length === 0 ? (
                  <p className="text-slate-405 italic text-center py-6 text-[11px]">
                    Tidak ada siswa yang cocok dengan pencarian "{searchText}".
                  </p>
                ) : (
                  filteredStudents.map(([name, daysObj]) => {
                    const status = daysObj[selectedDay] || "Belum Absen";
                    const studentNoteKey = `${name} | ${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${selectedDay.toString().padStart(2, "0")}`;
                    return (
                      <div
                        key={name}
                        className="flex flex-col bg-slate-50 border border-slate-200/80 p-3 rounded-xl hover:border-slate-300 transition gap-2 relative"
                      >
                        {/* Upper Row: Name, Status badge & Circle buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="min-w-0 flex-1 flex items-center justify-between w-full sm:w-auto mr-1 sm:mr-3">
                            <span className="font-extrabold text-slate-800 text-[12.5px] mr-2 whitespace-normal break-words" title={name}>
                              {name}
                            </span>
                            <span
                              className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0 ${
                                status === "Hadir"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : status === "Sakit"
                                  ? "bg-blue-100 text-blue-800"
                                  : status === "Izin"
                                  ? "bg-amber-100 text-amber-800"
                                  : status === "Alpa"
                                  ? "bg-red-100 text-red-805"
                                  : "bg-slate-200/60 text-slate-550 border border-slate-250/30"
                              }`}
                            >
                              {status}
                            </span>
                          </div>
                          
                          {/* Circle status checkers */}
                          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-end sm:self-auto pr-1">
                            <div className="flex gap-1">
                              {(["Hadir", "Sakit", "Izin", "Alpa"] as const).map((st) => {
                                const labelMap = {
                                  Hadir: "H",
                                  Sakit: "S",
                                  Izin: "I",
                                  Alpa: "A",
                                };
                                const styleMap = {
                                  Hadir: status === "Hadir"
                                    ? "bg-emerald-600 text-white border-emerald-700 shadow-sm font-extrabold"
                                    : "bg-white text-emerald-700 hover:bg-emerald-50 border-slate-300/80 hover:text-emerald-850",
                                  Sakit: status === "Sakit"
                                    ? "bg-blue-600 text-white border-blue-700 shadow-sm font-extrabold"
                                    : "bg-white text-blue-700 hover:bg-blue-50 border-slate-300/80 hover:text-blue-850",
                                  Izin: status === "Izin"
                                    ? "bg-amber-500 text-white border-amber-600 shadow-sm font-extrabold"
                                    : "bg-white text-amber-700 hover:bg-amber-50 border-slate-300/80 hover:text-amber-850",
                                  Alpa: status === "Alpa"
                                    ? "bg-red-600 text-white border-red-700 shadow-sm font-extrabold"
                                    : "bg-white text-red-700 hover:bg-red-50 border-slate-300/80 hover:text-red-850",
                                };
                                return (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => handleQuickStatus(name, st)}
                                    disabled={!!activeHolidayName}
                                    className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xs font-black transition-all hover:scale-105 active:scale-95 cursor-pointer select-none ${styleMap[st]} ${
                                      activeHolidayName ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                    title={`Tandai ${st}`}
                                  >
                                    {labelMap[st]}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Kebab Menu (Titik Tiga) Button */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveKebabStudent(activeKebabStudent === name ? null : name);
                                }}
                                className="p-1 px-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer flex items-center justify-center"
                                title="Menu Opsi Guru"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              {activeKebabStudent === name && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-30" 
                                    onClick={() => setActiveKebabStudent(null)}
                                  />
                                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-2 py-1.5 rounded-xl shadow-xl z-40 animate-fade-in text-left">
                                    <div className="px-3 py-1 font-black text-[9px] uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                                      Status Harian Murid
                                    </div>
                                    <button
                                      onClick={() => {
                                        if (!activeHolidayName) {
                                          handleQuickStatus(name, "Hadir");
                                        }
                                        setActiveKebabStudent(null);
                                      }}
                                      disabled={!!activeHolidayName}
                                      className="w-full text-left px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition flex items-center gap-2 disabled:opacity-50"
                                    >
                                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                                      Set Hadir (H)
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (!activeHolidayName) {
                                          handleQuickStatus(name, "Sakit");
                                        }
                                        setActiveKebabStudent(null);
                                      }}
                                      disabled={!!activeHolidayName}
                                      className="w-full text-left px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 transition flex items-center gap-2 disabled:opacity-50"
                                    >
                                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                                      Set Sakit (S)
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (!activeHolidayName) {
                                          handleQuickStatus(name, "Izin");
                                        }
                                        setActiveKebabStudent(null);
                                      }}
                                      disabled={!!activeHolidayName}
                                      className="w-full text-left px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-50 transition flex items-center gap-2 disabled:opacity-50"
                                    >
                                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                                      Set Izin (I)
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (!activeHolidayName) {
                                          handleQuickStatus(name, "Alpa");
                                        }
                                        setActiveKebabStudent(null);
                                      }}
                                      disabled={!!activeHolidayName}
                                      className="w-full text-left px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 transition flex items-center gap-2 disabled:opacity-50"
                                    >
                                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                                      Set Alpa (A)
                                    </button>
                                    <div className="border-t border-slate-100 my-1"></div>
                                    <button
                                      onClick={() => {
                                        handleRemoveStudent(name);
                                        setActiveKebabStudent(null);
                                      }}
                                      className="w-full text-left px-3 py-1.5 text-xs font-extrabold text-red-650 hover:bg-rose-50 transition flex items-center gap-2"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                      Hapus Murid
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Lower Row: Student Specific Mini Note Input */}
                        <div className="pt-2 border-t border-slate-150 flex items-center gap-1.5 w-full">
                          <span className="text-[9px] text-slate-400 shrink-0 font-extrabold uppercase tracking-wider">✍️ Catatan:</span>
                          <input
                            type="text"
                            placeholder="Izin tertulis, surat sakit, alasan alpa, dll..."
                            value={studentNotes[studentNoteKey] || ""}
                            onChange={(e) => handleStudentNoteChange(name, e.target.value)}
                            disabled={!!activeHolidayName}
                            className="bg-white border border-slate-250 select-text px-2.5 py-1 text-[11px] font-semibold text-slate-800 rounded-lg flex-1 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] placeholder-slate-400 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 mt-4 text-[10px] text-slate-400 font-mono italic">
              💡 Rekap harian tersambung langsung dengan data Buku Nilai guru secara terintegrasi.
            </div>
          </div>
        </div>
        </div>
      ) : (
        /* TAB: 30-Day Summary */
        <div className="space-y-4">
          {totalStudents > 0 && (
            <div className="flex justify-end no-print select-none">
              <input
                type="text"
                placeholder="🔍 Cari nama siswa..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full sm:max-w-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1E3A8A] placeholder-slate-400 transition"
              />
            </div>
          )}
          <div className="overflow-x-auto border border-slate-200.5 rounded-2xl bg-[#FCFDFE] shadow-sm">
            <table className="w-full min-w-[780px] text-left text-xs text-slate-705">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-extrabold select-none">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-56 text-left">Nama Lengkap Murid</th>
                  <th className="py-3 px-4 text-center text-emerald-700 bg-emerald-50/40">🟢 Hadir (H)</th>
                  <th className="py-3 px-4 text-center text-blue-700 bg-blue-50/40">🔵 Sakit (S)</th>
                  <th className="py-3 px-4 text-center text-amber-700 bg-amber-50/40">🟡 Izin (I)</th>
                  <th className="py-3 px-4 text-center text-red-700 bg-red-50/40">🔴 Alpa (A)</th>
                  <th className="py-3 px-4 text-center text-indigo-700 bg-indigo-50/30">Rasio Rerata Kehadiran</th>
                  <th className="py-3 px-4 text-center w-20">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {totalStudents === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-medium italic">
                      Belum ada data siswa kelas binaan. silakan tambah nama siswa.
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-medium italic">
                      Tidak ada siswa yang cocok dengan pencarian "{searchText}".
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(([name, daysObj], index) => {
                  let h = 0, s = 0, i = 0, a = 0;
                  for (let d = 1; d <= 31; d++) {
                    const status = daysObj[d];
                    if (status === "Hadir") h++;
                    else if (status === "Sakit") s++;
                    else if (status === "Izin") i++;
                    else if (status === "Alpa") a++;
                  }
                  const totalDaysLogged = h + s + i + a;
                  const ratio = totalDaysLogged > 0 ? Math.round((h / totalDaysLogged) * 100) : 0;

                  return (
                    <tr key={name} className="border-b border-slate-100 hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 text-center text-slate-400 font-mono">{index + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-800 text-[13px]">{name}</td>
                      <td className="py-3 px-4 text-center font-extrabold text-emerald-600 font-mono">{h} hari</td>
                      <td className="py-3 px-4 text-center font-extrabold text-blue-600 font-mono">{s} hari</td>
                      <td className="py-3 px-4 text-center font-extrabold text-amber-600 font-mono">{i} hari</td>
                      <td className="py-3 px-4 text-center font-extrabold text-red-600 font-mono">{a} hari</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block bg-indigo-100 text-indigo-800 font-black px-2.5 py-1 rounded-full text-[10.5px] font-mono">
                          {ratio}% Kehadiran
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleRemoveStudent(name)}
                          className="p-1 px-1.5 text-red-500 hover:bg-red-50 rounded-lg hover:text-red-700 transition"
                          title="Hapus Murid"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* Premium Reusable Confirmation Modal Dialog */}
      {confirmModal.isOpen && (
        <div id="school-confirm-modal" className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${confirmModal.actionType === "reset_all" ? "bg-red-50 text-red-650" : "bg-amber-50 text-amber-600"} shrink-0`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-2">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 text-xs text-slate-550 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-extrabold cursor-pointer border-0 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-4 py-2.5 text-xs text-white rounded-xl font-extrabold cursor-pointer border-0 transition ${
                  confirmModal.actionType === "reset_all"
                    ? "bg-red-600 hover:bg-red-700 active:bg-red-800"
                    : "bg-amber-600 hover:bg-amber-700 active:bg-amber-850"
                }`}
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
