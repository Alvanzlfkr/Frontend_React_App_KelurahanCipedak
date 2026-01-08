import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportToExcel = (data, filename = "data.xlsx") => {
  if (!data || data.length === 0) {
    alert("Tidak ada data untuk diekspor!");
    return;
  }

  // Urutkan data berdasarkan tanggal ASC, lalu no ASC
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.tanggal);
    const dateB = new Date(b.tanggal);
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    return (a.no || 0) - (b.no || 0); // fallback urut no
  });

  // Map ulang data untuk hanya mengambil field yang diinginkan
  const mappedData = sortedData.map((row, index) => ({
    No: index + 1, // nomor urut global
    Tanggal: new Date(row.tanggal).toLocaleDateString("id-ID"),
    Nama: row.nama,
    Alamat: row.alamat,
    "No Telepon": row.no_telepon,
    Keperluan: row.keperluan,
  }));

  const worksheet = XLSX.utils.json_to_sheet(mappedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

  saveAs(blob, filename);
};
