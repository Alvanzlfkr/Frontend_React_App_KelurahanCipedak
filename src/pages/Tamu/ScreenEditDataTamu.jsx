import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import "./ScreenTambahDataTamu.css";

const EditDataTamu = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState("data-tamu");

  // Ambil data guest dari location state
  const guestData = location.state?.guest;

  const [formData, setFormData] = useState({
    tanggal: "",
    namaTamu: "",
    alamat: "",
    noTelepon: "",
    keperluan: "",
  });

  // Set tanggal otomatis ke hari ini dan load data lainnya
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`; // format YYYY-MM-DD

    setFormData({
      tanggal: todayStr, // otomatis hari ini
      namaTamu: guestData?.nama || "",
      alamat: guestData?.alamat || "",
      noTelepon: guestData?.noTelepon || "",
      keperluan: guestData?.keperluan || "",
    });
  }, [guestData]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validasi form
    if (
      !formData.tanggal ||
      !formData.namaTamu ||
      !formData.alamat ||
      !formData.noTelepon ||
      !formData.keperluan
    ) {
      alert("Mohon lengkapi semua field!");
      return;
    }

    // Validasi nomor telepon dengan format 08xxxx
    const phoneRegex = /^08[0-9]{8,11}$/;
    if (!phoneRegex.test(formData.noTelepon)) {
      alert("Nomor telepon harus dimulai dengan 08 dan hanya berisi angka!");
      return;
    }

    // TODO: Update data via API
    console.log("Data yang akan diupdate:", { id, ...formData });

    alert("Data berhasil diperbarui!");
    navigate("/data-tamu");
  };

  // Cancel
  const handleCancel = () => {
    if (window.confirm("Apakah Anda yakin ingin membatalkan perubahan?")) {
      navigate("/data-tamu");
    }
  };

  return (
    <div className="layout-container">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="main-content">
        <Header />

        <div className="tambah-data-container">
          <h1 className="tambah-data-title">Edit Data Tamu</h1>

          <div className="form-card">
            <form onSubmit={handleSubmit} className="tambah-data-form">
              {/* Tanggal otomatis */}
              <div className="form-group">
                <label className="form-label">Tanggal</label>
                <span className="form-input">
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Nama Tamu */}
              <div className="form-group">
                <label htmlFor="namaTamu" className="form-label">
                  Nama Tamu
                </label>
                <input
                  type="text"
                  id="namaTamu"
                  name="namaTamu"
                  value={formData.namaTamu}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Nama Tamu"
                  required
                />
              </div>

              {/* Alamat */}
              <div className="form-group">
                <label htmlFor="alamat" className="form-label">
                  Alamat
                </label>
                <input
                  type="text"
                  id="alamat"
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Alamat"
                  required
                />
              </div>

              {/* Nomor Telepon */}
              <div className="form-group">
                <label htmlFor="noTelepon" className="form-label">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  id="noTelepon"
                  name="noTelepon"
                  value={formData.noTelepon}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Masukkan nomor telepon (08xxxx)"
                  required
                />
              </div>

              {/* Keperluan */}
              <div className="form-group">
                <label htmlFor="keperluan" className="form-label">
                  Keperluan
                </label>
                <textarea
                  id="keperluan"
                  name="keperluan"
                  value={formData.keperluan}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Keperluan"
                  rows="5"
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

export default EditDataTamu;
