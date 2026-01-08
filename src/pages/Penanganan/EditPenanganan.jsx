import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPenangananById,
  updatePenanganan,
} from "../services/penangananService";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import PenangananForm from "../../components/form/PenangananForm";

const EditPenanganan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    getPenangananById(id).then((res) => {
      setData(res.data);
    });
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      await updatePenanganan(id, formData);
      alert("Data berhasil diperbarui");
      navigate("/kelola-penanganan");
    } catch {
      alert("Gagal update data");
    }
  };

  return (
    <div className="layout-container">
      <Sidebar activeMenu="kelola-penanganan" />
      <div className="main-content">
        <Header />
        <h1>Edit Penanganan</h1>

        {data && (
          <PenangananForm
            initialData={data}
            submitLabel="Update"
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default EditPenanganan;
