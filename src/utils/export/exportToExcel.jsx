import XLSX from "xlsx-js-style"; // Gunakan library ini agar warna background muncul
import { saveAs } from "file-saver";

export const exportToExcel = (
  data,
  pejabat,
  filename = "data.xlsx",
  titleText = "DATA TAMU",
) => {
  if (!data || data.length === 0) {
    alert("Tidak ada data untuk diekspor!");
    return;
  }

  const lurah = pejabat?.lurah?.nama || "...............................";
  const nip = pejabat?.lurah?.nip || "...............................";

  // ======================
  // 1. PREPARE DATA
  // ======================
  // Sort data berdasarkan tanggal, lalu nomor
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.tanggal);
    const dateB = new Date(b.tanggal);
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    return (a.no || 0) - (b.no || 0);
  });

  // ======================
  // 2. STRUKTUR SHEET
  // ======================
  // Judul Utama (Row 0)
  const title = [[titleText.toUpperCase()]];

  // Header Kolom (Row 1) - Langsung di bawah judul tanpa sela baris kosong
  const headers = [
    "No",
    "Tanggal",
    "Nama",
    "Alamat",
    "No Telepon",
    "Keperluan",
  ];

  // Body Data (Row 2 dst)
  const body = sortedData.map((row, i) => [
    i + 1,
    new Date(row.tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    row.nama,
    row.alamat,
    row.no_telepon,
    row.keperluan,
  ]);

  // Gabungkan semua menjadi satu array data
  const sheetData = [...title, headers, ...body];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // ======================
  // 3. STYLING UTAMA
  // ======================

  // Definisi Style Border (Kotak tipis sekeliling sel)
  const borderStyle = {
    top: { style: "thin", color: { rgb: "000000" } },
    bottom: { style: "thin", color: { rgb: "000000" } },
    left: { style: "thin", color: { rgb: "000000" } },
    right: { style: "thin", color: { rgb: "000000" } },
  };

  // --- Style A: JUDUL (Hitam, Teks Putih) ---
  // Merge cells A1 sampai F1
  worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];

  const titleCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
  if (!worksheet[titleCell]) worksheet[titleCell] = {}; // safety check

  worksheet[titleCell].s = {
    font: {
      name: "Calibri",
      sz: 12,
      bold: true,
      color: { rgb: "FFFFFF" }, // Teks Putih
    },
    fill: {
      fgColor: { rgb: "000000" }, // Background Hitam
    },
    alignment: {
      horizontal: "center",
      vertical: "center",
    },
  };

  // --- Style B: HEADER (Border, Bold, Left Align seperti gambar) ---
  headers.forEach((_, colIndex) => {
    const cellRef = XLSX.utils.encode_cell({ r: 1, c: colIndex });
    if (!worksheet[cellRef]) return;

    worksheet[cellRef].s = {
      font: { bold: true, sz: 11 },
      alignment: { horizontal: "left", vertical: "center", wrapText: true },
      border: borderStyle,
    };
  });

  // --- Style C: BODY DATA (Border) ---
  const startRowBody = 2; // Data mulai di baris ke-3 (index 2)
  const endRowBody = 2 + body.length - 1;

  for (let r = startRowBody; r <= endRowBody; r++) {
    for (let c = 0; c < headers.length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      if (!worksheet[cellRef]) continue;

      worksheet[cellRef].s = {
        font: { sz: 11 },
        alignment: { vertical: "center", wrapText: true }, // Default align
        border: borderStyle,
      };

      // Khusus Kolom "No" (index 0) dibuat center
      if (c === 0) {
        worksheet[cellRef].s.alignment = {
          horizontal: "center",
          vertical: "center",
        };
      }
    }
  }

  // ======================
  // 4. LEBAR KOLOM
  // ======================
  worksheet["!cols"] = [
    { wch: 5 }, // No
    { wch: 15 }, // Tanggal
    { wch: 20 }, // Nama
    { wch: 25 }, // Alamat
    { wch: 15 }, // No Telepon
    { wch: 35 }, // Keperluan
  ];

  // ======================
  // 5. TANDA TANGAN (SIGNATURE)
  // ======================
  // Mulai beberapa baris setelah data terakhir
  const startRowTTD = endRowBody + 3;

  // Menambahkan teks tanda tangan di Kolom E (index 4)
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
    { origin: { r: startRowTTD, c: 4 } },
  );

  // Styling area tanda tangan (Align Center tapi relatif terhadap kolom E-F)
  // Kita loop baris-baris tanda tangan tersebut
  const signatureRows = [0, 1, 5, 6, 7]; // Offset baris relatif thd startRowTTD

  signatureRows.forEach((offset) => {
    const currentRow = startRowTTD + offset;
    // Kita merge kolom 4 dan 5 (E dan F) agar teks terlihat rapi di kanan
    // Cek apakah merges array sudah ada, jika belum buat baru
    if (!worksheet["!merges"]) worksheet["!merges"] = [];

    worksheet["!merges"].push({
      s: { r: currentRow, c: 4 },
      e: { r: currentRow, c: 5 },
    });

    // Beri style alignment center
    const cellRef = XLSX.utils.encode_cell({ r: currentRow, c: 4 });
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = {
        alignment: { horizontal: "center", vertical: "center" },
        font: { sz: 11 },
      };
    }
  });

  // ======================
  // 6. WRITE FILE
  // ======================
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Tamu");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    cellStyles: true, // PENTING: Mengaktifkan styles
  });

  saveAs(new Blob([excelBuffer]), filename);
};

export const exportToExcelYear = (data, pejabat) => {
  const currentYear = new Date().getFullYear();

  const filteredData = data.filter((item) => {
    return new Date(item.tanggal).getFullYear() === currentYear;
  });

  if (!filteredData.length) {
    alert(`Tidak ada data untuk tahun ${currentYear}`);
    return;
  }

  exportToExcel(filteredData, pejabat, `Data_Tamu_Tahun_${currentYear}.xlsx`);
};
