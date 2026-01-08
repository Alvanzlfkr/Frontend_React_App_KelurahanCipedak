import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ===============================
// FORMAT HELPER
// ===============================
const formatTanggal = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const exportPeminjamanRuanganExcel = (
  data,
  filename = "PeminjamanRuangan.xlsx"
) => {
  if (!data || data.length === 0) {
    alert("Tidak ada data untuk diekspor!");
    return;
  }

  const mappedData = data.map((row, index) => ({
    No: index + 1,
    Tanggal: formatTanggal(row.tanggal),

    "Nama Peminjam": row.nama_peminjam,
    Jabatan: row.jabatan,
    NIK: row.nik,
    Alamat: row.alamat,
    "No Telepon": row.no_telepon,

    Ruangan: row.ruangan_name,

    "Tanggal Pinjam": formatTanggal(row.tanggal_pinjam),

    // 🔴 FIX SESI & RPTRA
    Sesi:
      row.sesi ||
      (row.jam_mulai && row.jam_selesai
        ? `${row.jam_mulai.slice(0, 5)} - ${row.jam_selesai.slice(0, 5)}`
        : "-"),

    Barang: row.barang || "-",
    Keperluan: row.keperluan || "-",
    Status: row.status || "Menunggu",
  }));

  const worksheet = XLSX.utils.json_to_sheet(mappedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Peminjaman Ruangan");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(blob, filename);
};
