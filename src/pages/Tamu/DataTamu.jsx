import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import TambahDataButton from "../../components/button/TambahData";
import CalendarWidget from "../../components/modals/CalendarWidget";
import GuestDetailModal from "../../components/modals/GuestDetailModal";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { exportToExcel } from "../../utils/export/exportToExcel";

import "./DataTamu.css";

const DataTamu = () => {
  const navigate = useNavigate();

  // State
  const [dataTamu, setDataTamu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("data-tamu");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [selectedDateTamu, setSelectedDateTamu] = useState(new Date()); // <-- state khusus tamu

  const filterBtnRef = useRef(null);
  const calendarRef = useRef(null);

  const [pejabat, setPejabat] = useState({
    lurah: null,
    sekretaris: null,
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/penanganan")
      .then((res) => res.json())
      .then((data) => {
        setPejabat({
          lurah: data.find((p) => p.jabatan === "Lurah"),
          sekretaris: data.find((p) => p.jabatan === "Sekretaris"),
        });
      });
  }, []);

  // Toggle kalender
  const toggleCalendar = () => setShowCalendar(!showCalendar);

  // Klik di luar popup kalender menutupnya
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target) &&
        filterBtnRef.current &&
        !filterBtnRef.current.contains(event.target)
      ) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ambil nama bulan dan tahun dari selectedDateTamu
  const monthName = selectedDateTamu.toLocaleString("id-ID", { month: "long" });
  const year = selectedDateTamu.getFullYear();

  // Ambil data dari API
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/tamu");
      const data = await res.json();
      setDataTamu(data);
    } catch (error) {
      console.error("Gagal mengambil data tamu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data sesuai tanggal
  const filteredData = dataTamu
    .filter(
      (tamu) =>
        new Date(tamu.tanggal).toDateString() ===
        selectedDateTamu.toDateString(),
    )
    .sort((a, b) => a.id - b.id); // urutkan berdasarkan id

  // Tambahkan nomor otomatis per tanggal
  const filteredDataWithNo = filteredData.map((tamu, index) => ({
    ...tamu,
    no: index + 1,
  }));

  // Navigasi tanggal
  const handlePrevDate = () => {
    const prev = new Date(selectedDateTamu);
    prev.setDate(prev.getDate() - 1);
    setSelectedDateTamu(prev);
  };

  const handleNextDate = () => {
    const next = new Date(selectedDateTamu);
    next.setDate(next.getDate() + 1);
    setSelectedDateTamu(next);
  };

  // CRUD Handlers
  const handleTambahData = () => navigate("/data-tamu/tambah");

  const handleEdit = (guest) =>
    navigate(`/data-tamu/edit/${guest.id}`, { state: { guest } });

  const handleDelete = async (guest) => {
    if (!window.confirm(`Hapus data ${guest.nama}?`)) return;

    try {
      await fetch(`http://localhost:5000/api/tamu/${guest.id}`, {
        method: "DELETE",
      });
      alert("Data berhasil dihapus");
      fetchData();
    } catch (error) {
      alert("Gagal menghapus data");
      console.error(error);
    }
  };

  // const handleExportYear = () => {
  //   const year = selectedDateTamu.getFullYear();

  //   const yearData = dataTamu.filter((item) => {
  //     const t = new Date(item.tanggal);
  //     return t.getFullYear() === year;
  //   });

  //   exportToExcel(yearData, `DataTamu_Tahun_${year}.xlsx`);
  // };

  // const handlePanggil = (guest) =>
  //   alert(`Memanggil ${guest.nama} untuk keperluan: ${guest.keperluan}`);

  const handleUpload = () => alert("Upload dalam pengembangan...");

  // ==================== DISABLE TAMBAH DATA JIKA TANGGAL LEWAT ====================
  const isPastDate = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected = new Date(selectedDateTamu);
    selected.setHours(0, 0, 0, 0);

    return selected < today;
  })();

  return (
    <div className="layout-container">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="main-content">
        <Header />

        {/* Header */}
        <div className="data-tamu-top">
          <h1 className="data-tamu-title">Data Tamu</h1>
          <div className="data-tamu-filter">
            <button
              className="filter-btn"
              ref={filterBtnRef}
              onClick={toggleCalendar}
            >
              <span className="filter-icon">
                <span></span>
                <span></span>
                <span></span>
              </span>
              {monthName} {year}
            </button>

            {showCalendar && (
              <div ref={calendarRef} className="calendar-popup-wrapper">
                <CalendarWidget
                  selectedDate={selectedDateTamu}
                  onSelectDate={setSelectedDateTamu} // <-- pakai state tamu
                />
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="data-tamu-container">
          <TambahDataButton
            onClick={handleTambahData}
            disabled={isPastDate}
            title={
              isPastDate
                ? "Tidak bisa menambah data untuk tanggal yang sudah lewat"
                : "Tambah Data Tamu"
            }
          />

          <div className="table-section">
            <h3 className="table-month-title">
              Data Tamu{" "}
              {selectedDateTamu.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h3>

            <div className="table-wrapper">
              {loading ? (
                <p className="loading-text">Memuat data...</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Tanggal</th>
                      <th>Nama Tamu</th>
                      <th>Keperluan</th>
                      <th>Detail</th>
                      <th>Kelola</th>
                      {/* <th>Panggil</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDataWithNo.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center" }}>
                          Tidak ada data
                        </td>
                      </tr>
                    ) : (
                      filteredDataWithNo.map((row) => (
                        <tr key={row.id}>
                          <td>{row.no}</td>
                          <td>
                            {new Date(row.tanggal).toLocaleDateString("id-ID", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </td>

                          <td>{row.nama}</td>
                          <td>{row.keperluan}</td>
                          <td>
                            <button
                              className="btn-icon"
                              onClick={() => setSelectedGuest(row)}
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-action btn-edit"
                                onClick={() => handleEdit(row)}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                className="btn-action btn-delete"
                                onClick={() => handleDelete(row)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                          {/* <td>
                            <button
                              className="btn-panggil"
                              onClick={() => handlePanggil(row)}
                            >
                              Panggil
                            </button>
                          </td> */}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Footer dengan navigasi tanggal */}
          <Footer
            onExportTable={() => {
              const tanggal = selectedDateTamu.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              exportToExcel(
                filteredDataWithNo,
                pejabat,
                `DataTamu_${selectedDateTamu.toLocaleDateString("id-ID")}.xlsx`,
                `DATA TAMU HARI ${tanggal}`,
              );
            }}
            onExportMonth={() => {
              const month = selectedDateTamu.getMonth();
              const year = selectedDateTamu.getFullYear();

              const monthData = dataTamu.filter((item) => {
                const t = new Date(item.tanggal);
                return t.getMonth() === month && t.getFullYear() === year;
              });

              const namaBulan = selectedDateTamu.toLocaleDateString("id-ID", {
                month: "long",
              });

              exportToExcel(
                monthData,
                pejabat,
                `DataTamu_Bulan_${month + 1}_${year}.xlsx`,
                `DATA TAMU BULAN ${namaBulan} ${year}`,
              );
            }}
            onExportYear={() => {
              const year = selectedDateTamu.getFullYear();

              const yearData = dataTamu.filter((item) => {
                return new Date(item.tanggal).getFullYear() === year;
              });

              if (!yearData.length) {
                alert(`Tidak ada data untuk tahun ${year}`);
                return;
              }

              exportToExcel(
                yearData,
                pejabat,
                `DataTamu_Tahun_${year}.xlsx`,
                `DATA TAMU TAHUN ${year}`,
              );
            }}
            onExportAll={() =>
              exportToExcel(
                dataTamu,
                pejabat,
                "DataTamu_Semua.xlsx",
                "DATA TAMU KESELURUHAN",
              )
            }
            onUpload={handleUpload}
            handlePrevDate={handlePrevDate}
            handleNextDate={handleNextDate}
          />
        </div>
      </div>

      {/* Modal Detail */}
      {selectedGuest && (
        <GuestDetailModal
          guest={selectedGuest}
          onClose={() => setSelectedGuest(null)}
        />
      )}
    </div>
  );
};

export default DataTamu;
