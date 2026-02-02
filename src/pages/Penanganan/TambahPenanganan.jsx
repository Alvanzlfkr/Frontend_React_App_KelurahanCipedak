import { useLocation, useNavigate } from "react-router-dom";
import { createPenanganan } from "../services/penangananService.jsx";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import PenangananForm from "../../components/form/PenangananForm";
import "./TambahPenanganan.css";

const TambahPenanganan = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 ambil jabatan yang sudah terisi
  const jabatanTerisi = location.state?.jabatanTerisi || [];

  const handleSubmit = async (data) => {
    try {
      await createPenanganan(data);
      alert("Data berhasil ditambahkan");
      navigate("/kelola-penanganan");
    } catch (err) {
      alert("Gagal menyimpan data");
    }
  };

  return (
    <div className="layout-container">
      <Sidebar activeMenu="kelola-penanganan" />
      <div className="main-content">
        <Header />
        <div className="tambah-penanganan-container">
          <h1 className="title-penanganan">Tambah Penanganan</h1>

          <PenangananForm
            submitLabel="Simpan"
            onSubmit={handleSubmit}
            jabatanTerisi={jabatanTerisi}
            isEdit={false}
          />
        </div>
      </div>
    </div>
  );
};

export default TambahPenanganan;
