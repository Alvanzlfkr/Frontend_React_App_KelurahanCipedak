import XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

// ===============================
// FORMAT TANGGAL
// ===============================
const formatTanggal = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const exportPeminjamanRuanganExcel = (
  data,
  pejabat,
  filename = "Data_Peminjaman_Ruangan.xlsx",
  titleText = "DATA PEMINJAMAN RUANGAN",
) => {
  if (!data || data.length === 0) {
    alert("Tidak ada data untuk diekspor!");
    return;
  }

  const lurah = pejabat?.lurah?.nama || "...............................";
  const nip = pejabat?.lurah?.nip || "...............................";

  // ======================
  // 1. SORT DATA
  // ======================
  const sortedData = [...data].sort(
    (a, b) => new Date(a.tanggal_pinjam) - new Date(b.tanggal_pinjam),
  );

  // ======================
  // 2. STRUKTUR SHEET
  // ======================
  const title = [[titleText.toUpperCase()]];

  const headers = [
    "No",
    "Tanggal Pinjam",
    "Nama Peminjam",
    "Jabatan",
    "NIK",
    "Ruangan",
    "Sesi",
    "Keperluan",
    "Status",
  ];

  const body = sortedData.map((row, i) => [
    i + 1,
    formatTanggal(row.tanggal_pinjam),
    row.nama_peminjam,
    row.jabatan,
    row.nik,
    row.ruangan_name,
    row.sesi ||
      (row.jam_mulai && row.jam_selesai
        ? `${row.jam_mulai.slice(0, 5)} - ${row.jam_selesai.slice(0, 5)}`
        : "-"),
    row.keperluan || "-",
    row.status || "Menunggu",
  ]);

  const sheetData = [...title, headers, ...body];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // ======================
  // 3. STYLING
  // ======================
  const borderStyle = {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  };

  // Merge Judul
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
  ];

  worksheet["A1"].s = {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
    fill: { fgColor: { rgb: "000000" } },
    alignment: { horizontal: "center", vertical: "center" },
  };

  // Header
  headers.forEach((_, c) => {
    const ref = XLSX.utils.encode_cell({ r: 1, c });
    worksheet[ref].s = {
      font: { bold: true },
      alignment: { vertical: "center", wrapText: true },
      border: borderStyle,
    };
  });

  // Body
  const startRow = 2;
  const endRow = startRow + body.length - 1;

  for (let r = startRow; r <= endRow; r++) {
    for (let c = 0; c < headers.length; c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      worksheet[ref].s = {
        alignment: {
          vertical: "center",
          horizontal: c === 0 ? "center" : "left",
          wrapText: true,
        },
        border: borderStyle,
      };
    }
  }

  // ======================
  // 4. LEBAR KOLOM
  // ======================
  worksheet["!cols"] = [
    { wch: 5 },
    { wch: 18 },
    { wch: 22 },
    { wch: 15 },
    { wch: 18 },
    { wch: 20 },
    { wch: 15 },
    { wch: 30 },
    { wch: 15 },
  ];

  // ======================
  // 5. TANDA TANGAN
  // ======================
  const startTTD = endRow + 3;

  XLSX.utils.sheet_add_aoa(
    worksheet,
    [
      ["Mengetahui,"],
      ["Lurah Cipedak"],
      [""],
      [""],
      [""],
      [""],
      [`${lurah}`],
      [`NIP: ${nip}`],
    ],
    { origin: { r: startTTD, c: headers.length - 2 } },
  );

  if (!worksheet["!merges"]) worksheet["!merges"] = [];

  [0, 1, 2, 3, 4, 5, 6, 7].forEach((offset) => {
    for (let i = 0; i < 8; i++) {
      worksheet["!merges"].push({
        s: { r: startTTD + i, c: headers.length - 2 },
        e: { r: startTTD + i, c: headers.length - 1 },
      });

      const ref = XLSX.utils.encode_cell({
        r: startTTD + i,
        c: headers.length - 2,
      });

      worksheet[ref].s = {
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
        font: {
          sz: i === 6 ? 11 : 10,
        },
      };
    }
  });

  // ======================
  // PAGE SETUP PRINT
  // ======================
  worksheet["!pageSetup"] = {
    orientation: "landscape",
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9, // A4
  };

  // ======================
  // 6. EXPORT
  // ======================
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Peminjaman Ruangan");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    cellStyles: true,
  });

  saveAs(new Blob([excelBuffer]), filename);
};
