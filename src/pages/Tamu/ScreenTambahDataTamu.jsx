import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import "./ScreenTambahDataTamu.css";

const TambahDataTamu = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("data-tamu");

  // ======================
  // TANGGAL LOKAL AMAN
  // ======================
  const today = new Date();

  // YYYY-MM-DD (tanpa UTC bug)
  const tanggalOnly = today.toLocaleDateString("en-CA");

  const formattedDate = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // ======================
  // FORMAT NAMA FORMAL
  // ======================
  const formatNama = (value) => {
    return value
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const [formData, setFormData] = useState({
    nama: "",
    alamat: "",
    noTelepon: "",
    keperluan: "",
  });

  // ======================
  // INPUT CHANGE (TANPA FORMAT)
  // ======================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================
  // SUBMIT
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const namaFix = formatNama(formData.nama);

    if (
      !namaFix ||
      !formData.alamat ||
      !formData.noTelepon ||
      !formData.keperluan
    ) {
      alert("Mohon lengkapi semua field!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/tamu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          nama: namaFix,
          tanggal: tanggalOnly,
        }),
      });

      if (!response.ok) throw new Error("Gagal menyimpan data");

      alert("Data berhasil disimpan!");
      navigate("/data-tamu");
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan data!");
    }
  };

  const handleCancel = () => {
    navigate("/data-tamu");
  };

  return (
    <div className="layout-container-data-tamu">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="main-content-data-tamu">
        <Header />

        <div className="tambah-data-container">
          <h1 className="tambah-data-title">Tambah Data Tamu</h1>

          <div className="form-card">
            <form onSubmit={handleSubmit} className="tambah-data-form">
              {/* Tanggal */}
              <div className="form-group">
                <label className="form-label">Tanggal</label>
                <input
                  type="text"
                  value={formattedDate}
                  className="form-input"
                  readOnly
                />
              </div>

              {/* Nama */}
              <div className="form-group">
                <label className="form-label">Nama Tamu</label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  onBlur={() =>
                    setFormData((prev) => ({
                      ...prev,
                      nama: formatNama(prev.nama),
                    }))
                  }
                  className="form-input"
                  placeholder="Contoh: Alvan Zul"
                  required
                />
              </div>

              {/* Alamat */}
              <div className="form-group">
                <label className="form-label">Alamat</label>
                <input
                  type="text"
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              {/* No Telepon */}
              <div className="form-group">
                <label className="form-label">No Telepon</label>
                <input
                  type="text"
                  name="noTelepon"
                  value={formData.noTelepon}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>

              {/* Keperluan */}
              <div className="form-group">
                <label className="form-label">Keperluan</label>
                <textarea
                  name="keperluan"
                  value={formData.keperluan}
                  onChange={handleChange}
                  className="form-textarea"
                  rows="4"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-cancel"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TambahDataTamu;
