import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ExportButtonsDataTamu = ({ dataTamu, filteredData, selectedDate }) => {
  const exportToExcel = (data, fileName) => {
    if (!data || data.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }

    // Hanya pilih kolom yang dibutuhkan, hilangkan 'id'
    const wsData = data.map((row, index) => ({
      No: index + 1, // nomor urut
      Tanggal: new Date(row.tanggal).toLocaleDateString("id-ID"),
      Nama: row.nama,
      Alamat: row.alamat,
      "No Telepon": row.no_telepon,
      Keperluan: row.keperluan,
    }));

    const worksheet = XLSX.utils.json_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DataTamu");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, fileName);
  };

  const handleExportTable = () =>
    exportToExcel(
      filteredData,
      `DataTamu_${selectedDate.toLocaleDateString("id-ID")}.xlsx`
    );

  const handleExportMonth = () => {
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();
    const monthData = dataTamu.filter((item) => {
      const t = new Date(item.tanggal);
      return t.getMonth() === month && t.getFullYear() === year;
    });
    exportToExcel(monthData, `DataTamu_Bulan_${month + 1}_${year}.xlsx`);
  };

  const handleExportAll = () => exportToExcel(dataTamu, "DataTamu_Semua.xlsx");

  return (
    <div className="export-buttons">
      <button onClick={handleExportTable} className="btn-export">
        Export Tanggal Ini
      </button>
      <button onClick={handleExportMonth} className="btn-export">
        Export Bulan Ini
      </button>
      <button onClick={handleExportAll} className="btn-export">
        Export Semua
      </button>
    </div>
  );
};

export default ExportButtonsDataTamu;
