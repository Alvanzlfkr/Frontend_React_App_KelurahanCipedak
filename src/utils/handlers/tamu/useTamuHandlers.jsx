// src/utils/handlers/tamu/useTamuHandlers.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const useTamuHandlers = () => {
  const navigate = useNavigate();
  const [calledGuest, setCalledGuest] = useState(null);

  const handleTambahData = () => {
    navigate("/data-tamu/tambah");
  };

  const handleEditGuest = (guest) => {
    navigate(`/data-tamu/edit/${guest.no}`, {
      state: { guest },
    });
  };

  const handleDeleteGuest = (guest) => {
    if (
      window.confirm(`Apakah Anda yakin ingin menghapus data ${guest.nama}?`)
    ) {
      console.log("Delete:", guest);
      alert("Data berhasil dihapus!");
    }
  };

  const handlePanggilGuest = (guest) => {
    alert(`Memanggil ${guest.nama} untuk keperluan: ${guest.keperluan}`);
    setCalledGuest(guest.no);
  };

  const handleExportGuest = () => {
    alert("Mengekspor data...");
  };

  const handleUploadGuest = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls,.csv";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        alert(`File ${file.name} dipilih untuk diupload`);
      }
    };

    input.click();
  };

  return {
    handleTambahData,
    handleEditGuest,
    handleDeleteGuest,
    handlePanggilGuest,
    handleExportGuest,
    handleUploadGuest,
    calledGuest,
  };
};
