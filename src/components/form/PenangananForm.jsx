import { useState, useEffect } from "react";
import Sidebar from "../layout/Sidebar/Sidebar";
import Header from "../layout/Header/Header";
import axios from "axios";

const PenangananForm = ({ initialData, submitLabel }) => {
  const [activeMenu, setActiveMenu] = useState("data-penanganan");

  const [formData, setFormData] = useState({
    keterangan: "",
    jenis: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const validate = () => {
    const err = {};
    if (!formData.keterangan.trim()) err.keterangan = "Keterangan wajib diisi";
    if (!formData.jenis.trim()) err.jenis = "Jenis wajib diisi";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (initialData) {
      await axios.put(
        `http://localhost:5000/api/penanganan/${initialData.id}`,
        formData
      );
    } else {
      await axios.post("http://localhost:5000/api/penanganan", formData);
    }

    alert("Data berhasil disimpan");
  };

  return (
    <div className="layout-container">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="main-content">
        <Header />

        <div className="form-card">
          <form onSubmit={handleSubmit}>
            {/*Nama*/}
            <div className="form-group">
              <label htmlFor=""></label>
            </div>
            {/* Keterangan */}
            <div className="form-group">
              <label>Keterangan</label>
              <input
                name="keterangan"
                value={formData.keterangan}
                onChange={handleChange}
                placeholder="Contoh: Petugas Loket"
              />
              {errors.keterangan && <small>{errors.keterangan}</small>}
            </div>

            {/* Jenis */}
            <div className="form-group">
              <label>Jenis Penanganan</label>
              <input
                name="jenis"
                value={formData.jenis}
                onChange={handleChange}
                placeholder="Contoh: Verifikasi Dokumen"
              />
              {errors.jenis && <small>{errors.jenis}</small>}
            </div>

            <button type="submit">{submitLabel}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PenangananForm;
