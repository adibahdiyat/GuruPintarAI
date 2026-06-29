@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Outfit", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  
  --color-slate-450: #738496;
  --color-slate-455: #556575;
  --color-emerald-605: #059064;
}

/* Custom visual styles for clean slide previews */
.slide-bg-sd {
  background: linear-gradient(135deg, #fef3c7 0%, #ffe4e6 100%);
}
.slide-bg-smp {
  background: linear-gradient(135deg, #e0f2fe 0%, #e0e7ff 100%);
}
.slide-bg-sma {
  background: linear-gradient(135deg, #dcfce7 0%, #ecfdf5 100%);
}
.slide-bg-general {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

/* Navigation Dropdown transitions */
.nav-dropdown {
  position: relative;
}

.nav-dropdown-menu {
  transform-origin: top center;
  transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms cubic-bezier(0.16, 1, 0.3, 1) !important;
}

/* Micro-interaction rotate */
.animate-rotate-180 {
  animation: rotateArrow 200ms ease-out forwards;
}

@keyframes rotateArrow {
  from { transform: rotate(0deg); }
  to { transform: rotate(180deg); }
}

/* Print CSS Browser Optimization */
@media print {
  /* Sembunyikan semua UI kecuali konten RPP */
  body * { visibility: hidden; }
  #rpp-print-area, #rpp-print-area * { visibility: visible !important; }
  
  html, body {
    background: #ffffff !important;
    color: #000000 !important;
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
  }

  /* Reset layout constraints on all parent containers for multi-page print flow */
  #root, .app-container, main, section, div {
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
  }

  #rpp-print-area {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    font-family: "Times New Roman", serif;
    font-size: 12pt;
    color: #000 !important;
    background: #ffffff !important;
    padding: 2cm !important;
    border: none !important;
    box-shadow: none !important;
  }

  /* KOP surat */
  .print-kop {
    border-bottom: 3px double #000;
    padding-bottom: 10px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .print-kop-nama-sekolah {
    font-size: 16pt;
    font-weight: bold;
    text-transform: uppercase;
  }
  .print-kop-sub {
    font-size: 9pt;
    color: #333;
  }

  /* Heading seksi */
  .print-section-title {
    font-size: 13pt;
    font-weight: bold;
    text-decoration: underline;
    margin-top: 18px;
    margin-bottom: 6px;
    text-transform: uppercase;
  }
  .print-subsection {
    font-size: 11pt;
    font-weight: bold;
    margin-top: 10px;
    margin-bottom: 4px;
  }
  .print-body {
    font-size: 11pt;
    line-height: 1.8;
    text-align: justify;
    white-space: pre-wrap;
  }

  /* Tabel soal */
  .print-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 10pt;
  }
  .print-table th {
    background: #000;
    color: #fff;
    padding: 6px 8px;
    text-align: left;
    font-size: 10pt;
  }
  .print-table td {
    border: 1px solid #000;
    padding: 5px 8px;
    vertical-align: top;
  }
  .print-table tr:nth-child(even) td { background: #f5f5f5; }

  /* Tanda tangan */
  .print-ttd {
    margin-top: 40px;
    display: flex;
    justify-content: flex-end;
    text-align: center;
  }
  .print-ttd-box {
    width: 200px;
    font-size: 11pt;
  }
  .print-ttd-line {
    margin-top: 60px;
    border-top: 1px solid #000;
    font-weight: bold;
    font-size: 11pt;
  }

  /* Sembunyikan elemen non-print */
  .no-print, .no-print * { display: none !important; }

  /* Page break */
  .print-page-break { page-break-before: always; }
}

/* High fidelity rendering for sharp navigation logos */
.logo-navbar {
    image-rendering: -webkit-optimize-contrast; /* Buat Safari/Chrome */
    image-rendering: crisp-edges;               /* Buat browser modern */
}

/* Hide scrollbar utility */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
