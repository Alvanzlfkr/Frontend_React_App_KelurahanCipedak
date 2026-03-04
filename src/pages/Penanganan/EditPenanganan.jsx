import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPenangananById,
  updatePenanganan,
} from "../services/penangananService";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import PenangananForm from "../../components/form/PenangananForm";
import "./TambahPenanganan.css";

const EditPenanganan = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // ✅ WAJIB ADA
  const [data, setData] = useState(null);

  useEffect(() => {
    getPenangananById(id)
      .then((res) => {
        setData(res.data);
      })
      .catch(() => {
        alert("Data tidak ditemukan");
        navigate("/kelola-penanganan"); // ✅ sekarang aman
      });
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    try {
      await updatePenanganan(id, formData);
      alert("Data berhasil diperbarui");
      navigate("/kelola-penanganan");
    } catch {
      alert("Gagal update data");
    }
  };

  const handleCancel = () => {
    navigate("/kelola-penanganan"); // ✅ ini juga sekarang aman
  };

  return (
    <div className="layout-container-penanganan">
      <Sidebar activeMenu="kelola-penanganan" />
      <div className="main-content-penanganan">
        <Header />

        <div className="tambah-penanganan-container">
          <h1 className="title-penanganan">Edit Penanganan</h1>

          {data && (
            <PenangananForm
              initialData={data}
              submitLabel="Update"
              onSubmit={handleSubmit}
              onCancel={handleCancel} // ✅ sekarang ada functionnya
              isEdit={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditPenanganan;
