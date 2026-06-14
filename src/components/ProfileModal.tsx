import React, { useState } from "react";
import { X, UserCheck, Plus, Trash2, Users, LogOut, Loader2 } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileName: string;
  setProfileName: (val: string) => void;
  profileNip: string;
  setProfileNip: (val: string) => void;
  profileSchool: string;
  setProfileSchool: (val: string) => void;
  profilePic: string;
  setProfilePic: (val: string) => void;
  showToast: (msg: string) => void;
  activeKelas: string;
  setActiveKelas: (val: string) => void;
  kelasList: string[];
  setKelasList: React.Dispatch<React.SetStateAction<string[]>>;
  onLogout?: () => void;
  profileQuote: string;
  setProfileQuote: (val: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profileName,
  setProfileName,
  profileNip,
  setProfileNip,
  profileSchool,
  setProfileSchool,
  profilePic,
  setProfilePic,
  showToast,
  activeKelas,
  setActiveKelas,
  kelasList,
  setKelasList,
  onLogout,
  profileQuote,
  setProfileQuote,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950/75 select-none backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in no-print">
      {/* Background overlay click */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal element */}
      <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl relative z-10 transform animate-slide-up text-slate-800 p-6 flex flex-col justify-between max-h-[90vh] overflow-y-auto">
        
        {/* Modal Topbar */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4 shrink-0">
          <h4 className="text-sm font-black text-[#0D1D34] font-display uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-5 h-5 text-indigo-700" />
            Pengaturan Akun &amp; KOP RPP Guru
          </h4>
          <button
            onClick={onClose}
            className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg hover:text-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content body */}
        <div className="flex-1 space-y-4 text-xs leading-relaxed text-slate-600">
          <p className="text-[11px] font-semibold text-slate-400 font-sans uppercase tracking-wide">
            Sesuaikan data profil di bawah ini. Semua data ini otomatis disinkronkan ke dalam KOP Surat resmi RPP Anda.
          </p>

          {/* Current avatar preview or initial letters badge */}
          <div className="p-4 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 rounded-2xl flex items-center gap-4 text-white border border-blue-400/20 shadow-md shrink-0">
            {profilePic ? (
              <img
                src={profilePic}
                alt="Foto Profil"
                className="w-12 h-12 rounded-full object-cover border-2 border-white/80 shadow-md shrink-0 aspect-square"
                onError={(e) => {
                  (e.target as HTMLImageElement).onerror = null;
                  (e.target as HTMLImageElement).src = "";
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-900/40 text-white font-extrabold flex items-center justify-center text-sm shrink-0 border-2 border-white/80">
                {profileName.split(" ").map(w => w[0]).filter(c => c && c === c.toUpperCase()).slice(0, 2).join("") || "SD"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h5 className="font-extrabold text-sm truncate text-white font-sans leading-none">{profileName}</h5>
              <p className="text-[9.5px] text-blue-100/90 font-mono mt-1.5 leading-none">NIP: {profileNip || "Belum diatur"}</p>
              <p className="text-[10px] text-blue-50/85 font-semibold truncate mt-1 leading-none">{profileSchool}</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200.5 rounded-xl p-4 space-y-3.5 shadow-3xs">
            {/* Foto Profil */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-slate-500 block">Unggah Foto Profil Baru:</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
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
                  className="hidden"
                  id="modal-profile-uploader"
                />
                <label
                  htmlFor="modal-profile-uploader"
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 py-1.5 px-3 rounded-lg text-xs font-black cursor-pointer transition select-none shadow-3xs"
                >
                  Pilih Foto Komputer...
                </label>
                {profilePic && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Apakah Anda yakin ingin menghapus foto profil ini?")) {
                        setProfilePic("");
                        showToast("Foto profil dihapus.");
                      }
                    }}
                    className="text-red-500 hover:text-red-700 text-xs font-bold"
                  >
                    Hapus
                  </button>
                )}
                <span className="text-[9px] text-slate-400 italic">PNG/JPG max 2MB</span>
              </div>
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-slate-500 block">Nama Lengkap &amp; Gelar:</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Contoh: Bu Sari Dewi, S.Pd."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 text-slate-800 font-extrabold focus:outline-none"
              />
            </div>

            {/* NIP */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-slate-500 block">Nomer Induk Pegawai (NIP):</label>
              <input
                type="text"
                value={profileNip}
                onChange={(e) => setProfileNip(e.target.value)}
                placeholder="Contoh: 19890412 201402 2 003"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-orange-505 text-slate-800 font-mono font-medium focus:outline-none"
              />
            </div>

            {/* Asal Sekolah */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-[#0D1D34] block">Nama Instansi / Sekolah (KOP):</label>
              <input
                type="text"
                value={profileSchool}
                onChange={(e) => setProfileSchool(e.target.value)}
                placeholder="Contoh: SD Negeri Cempaka Indah 01"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 text-slate-800 font-extrabold focus:outline-none"
              />
            </div>

            {/* Quotes Motivasi */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-[#0D1D34] block">Kalimat Motivasi / Bio Quotes:</label>
              <textarea
                value={profileQuote}
                onChange={(e) => setProfileQuote(e.target.value)}
                placeholder="Contoh: Menjadi guru inspiratif adalah panggilan jiwa..."
                rows={2}
                maxLength={120}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 text-slate-800 font-medium focus:outline-none resize-none"
              />
              <span className="text-[9px] text-slate-400 block -mt-1 text-right">Max 120 karakter</span>
            </div>

            {/* Kelola Kelas Aktif */}
            <div className="space-y-1.5 pt-2.5 border-t border-slate-200">
              <label className="text-[10px] uppercase font-black text-[#1E3A8A] block flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#1E3A8A]" />
                Kelola Daftar Kelas &amp; Kelas Aktif:
              </label>
              <div className="flex gap-2">
                <select
                  value={activeKelas}
                  onChange={(e) => {
                    setActiveKelas(e.target.value);
                    showToast(`📌 Kelas aktif diubah ke: ${e.target.value}`);
                  }}
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-850 font-extrabold focus:outline-none"
                >
                  {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                {kelasList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!confirm(`Hapus kelas "${activeKelas}"? Semua data presensi & nilai kelas ini juga akan ikut dibersihkan.`)) return;
                      const newList = kelasList.filter(k => k !== activeKelas);
                      setKelasList(newList);
                      setActiveKelas(newList[0]);
                      localStorage.removeItem(`gurupintar_attendance_${activeKelas}`);
                      localStorage.removeItem(`gurupintar_grades_${activeKelas}`);
                      showToast(`🗑 Kelas "${activeKelas}" dihapus.`);
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 rounded-lg p-1.5 px-3 flex items-center gap-1 font-bold text-xs cursor-pointer select-none"
                    title="Hapus kelas aktif"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                  </button>
                )}
              </div>

              {/* Form Input Tambah Kelas Baru (No prompt dialog) */}
              <div className="flex gap-2 pt-1 border-t border-slate-100 mt-1">
                <input
                  type="text"
                  placeholder="Nama kelas baru (contoh: Kelas 5B)"
                  id="new-kelas-input-profile"
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = e.currentTarget.value;
                      if (val && val.trim()) {
                        const trimmed = val.trim();
                        if (!kelasList.includes(trimmed)) {
                          setKelasList(prev => [...prev, trimmed]);
                          setActiveKelas(trimmed);
                          showToast(`✅ Kelas "${trimmed}" berhasil ditambahkan!`);
                          e.currentTarget.value = "";
                        } else {
                          showToast(`⚠️ Kelas "${trimmed}" sudah ada!`);
                        }
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("new-kelas-input-profile") as HTMLInputElement | null;
                    const val = el ? el.value : "";
                    if (val && val.trim()) {
                      const trimmed = val.trim();
                      if (!kelasList.includes(trimmed)) {
                        setKelasList(prev => [...prev, trimmed]);
                        setActiveKelas(trimmed);
                        showToast(`✅ Kelas "${trimmed}" berhasil ditambahkan!`);
                        if (el) el.value = "";
                      } else {
                        showToast(`⚠️ Kelas "${trimmed}" sudah ada!`);
                      }
                    } else {
                      showToast(`⚠️ Masukkan nama kelas baru!`);
                    }
                  }}
                  className="bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] border border-blue-200 rounded-lg p-1.5 px-3 flex items-center gap-1 font-bold text-xs cursor-pointer select-none"
                  title="Tambah kelas baru"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal footer Close */}
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center shrink-0 select-none">
          {onLogout ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-1.5 px-3.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-red-600" />
              Keluar dari Sesi
            </button>
          ) : <div />}
          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              setIsSaving(true);
              setTimeout(() => {
                onClose();
                showToast("💾 Perubahan Profil Guru Berhasil Disimpan!");
                setIsSaving(false);
              }, 700);
            }}
            className="bg-[#1E3A8A] hover:bg-slate-800 text-white font-extrabold text-xs py-2 px-6 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-75 active:scale-95"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>Simpan Perubahan</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
