import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import TambahDataButton from "../../components/button/TambahData";
import "./KelolaPenanganan.css";

const KelolaPenanganan = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("kelola-penanganan");

  const [data, setData] = useState([
    { id: 1, nama: "Bpk....", jenis: "Pernikahan" },
    { id: 2, nama: "Ibu...", jenis: "Akta" },
    { id: 3, nama: "Bapak...", jenis: "KTP" },
  ]);

  const handleEdit = (id) => {
    console.log("Edit ID:", id);
    // TODO: buka modal atau navigasi
  };

  const handleDeletePenanganan = (id) => {
    if (window.confirm("Yakin ingin menghapus data?")) {
      setData(data.filter((item) => item.id !== id));
      alert("Data berhasil dihapus!");
    }
  };

  // Handlers
  const handleTambahData = () => {
    navigate("/kelola-penanganan/tambah");
  };

  const handleExport = () => {
    console.log("Export data...");
    // TODO: Implementasi export ke Excel/PDF
    alert("Mengekspor data...");
  };

  const handleUpload = () => {
    console.log("Upload data...");
    // TODO: Implementasi upload file
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls,.csv";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log("File selected:", file.name);
        alert(`File ${file.name} dipilih untuk diupload`);
      }
    };
    input.click();
  };

  return (
    <div className="layout-container">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="main-content">
        <Header />

        {/* Title */}
        <div className="kelola-penanganan-top">
          <h1 className="kelola-penanganan-title">Kelola Penanganan</h1>
        </div>

        {/* Container */}
        <div className="kelola-penanganan-container">
          {/* Tambah Button */}
          <div className="tambah-button-wrapper">
            <TambahDataButton onClick={handleTambahData} />
          </div>
          {/* Table */}
          <div className="table-wrapper">
            <table className="penanganan-table">
              <thead>
                <tr>
                  <th>Nama Penanganan</th>
                  <th>Jenis Penanganan</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {data.map((row) => (
                  <tr key={row.id}>
                    <td>{row.nama}</td>

                    <td>{row.jenis}</td>

                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(row.id)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn-delete"
                          onClick={() => handleDeletePenanganan(row.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <Footer
            onExport={handleExport}
            onUpload={handleUpload}
            onPreviousPage={() => console.log("Previous Page")}
            onNextPage={() => console.log("Next Page")}
          />
        </div>
      </div>
    </div>
  );
};

export default KelolaPenanganan;
