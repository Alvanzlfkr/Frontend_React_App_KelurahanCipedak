import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import TambahDataButton from "../../components/button/TambahData";
import "./KelolaPenanganan.css";

const KelolaPenanganan = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("kelola-penanganan");
  const [data, setData] = useState([]);

  // 🔹 Ambil data dari backend
  useEffect(() => {
    fetch("http://localhost:5000/api/penanganan")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal fetch data");
        return res.json();
      })
      .then((result) => {
        console.log("DATA PENANGANAN:", result); // 🔍 cek di console
        setData(result);
      })
      .catch((err) => {
        console.error("FETCH ERROR:", err);
      });
  }, []);

  // 🔹 Ambil jabatan yang sudah terisi
  const jabatanTerisi = data.map((item) => item.jabatan);

  const semuaJabatanTerisi =
    jabatanTerisi.includes("Lurah") && jabatanTerisi.includes("Sekretaris");

  const handleEdit = (id) => {
    navigate(`/kelola-penanganan/edit/${id}`);
  };

  // const handleDeletePenanganan = async (id) => {
  //   if (!window.confirm("Yakin ingin menghapus data?")) return;

  //   try {
  //     await fetch(`http://localhost:5000/penanganan/${id}`, {
  //       method: "DELETE",
  //     });

  //     setData(data.filter((item) => item.id !== id));
  //     alert("Data berhasil dihapus!");
  //   } catch (error) {
  //     console.error(error);
  //     alert("Gagal menghapus data");
  //   }
  // };

  const handleTambahData = () => {
    navigate("/kelola-penanganan/tambah", {
      state: { jabatanTerisi },
    });
  };

  return (
    <div className="layout-container">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="main-content">
        <Header />

        <div className="kelola-penanganan-top">
          <h1 className="kelola-penanganan-title">Kelola Penanganan</h1>
        </div>

        <div className="kelola-penanganan-container">
          {/* 🔹 TOMBOL TAMBAH (HILANG JIKA SUDAH PENUH) */}
          <div className="tambah-button-wrapper">
            {!semuaJabatanTerisi && (
              <TambahDataButton onClick={handleTambahData} />
            )}
          </div>

          {/* 🔹 INFO JIKA SUDAH PENUH */}
          {/* {semuaJabatanTerisi && (
            <p
              style={{
                marginTop: "10px",
                color: "#991b1b",
                fontSize: "14px",
              }}
            >
              Jabatan Lurah dan Sekretaris sudah terisi. Silakan edit data yang
              ada.
            </p>
          )} */}

          <div className="table-wrapper">
            <table className="penanganan-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Jabatan</th>
                  <th>NIP</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "#6b7280",
                      }}
                    >
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  data.map((row) => (
                    <tr key={row.id}>
                      <td>{row.nama}</td>
                      <td>{row.jabatan}</td>
                      <td>{row.nip}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn-edit"
                            onClick={() => handleEdit(row.id)}
                          >
                            <Pencil size={14} />
                          </button>
                          {/* <button
                            className="btn-delete"
                            onClick={() => handleDeletePenanganan(row.id)}
                          >
                            Delete
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KelolaPenanganan;
