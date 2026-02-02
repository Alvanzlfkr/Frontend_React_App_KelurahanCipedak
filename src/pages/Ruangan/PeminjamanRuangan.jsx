// PeminjamanRuangan.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import TambahDataButton from "../../components/button/TambahData";
import CalendarWidget from "../../components/modals/CalendarWidget";
import GuestPeminjamanDetailModal from "../../components/modals/GuestPeminjamanDetailModal";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { exportPeminjamanRuanganExcel } from "../../utils/export/exportPeminjamanRuanganExcel";
import PilihPeminjamModal from "../../components/modals/PilihPeminjamModal";

import generateSuratPeminjamanPDF from "../../utils/pdf/generateSuratPeminjamanPDF";
import "./PeminjamanRuangan.css";

import dayjs from "dayjs";
import "dayjs/locale/id";

const PeminjamanRuangan = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("data-peminjam");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuestPeminjaman, setSelectedGuestPeminjaman] = useState(null);

  const filterBtnRef = useRef(null);
  const calendarRef = useRef(null);

  const monthName = dayjs(selectedDate).locale("id").format("MMMM");
  const year = selectedDate.getFullYear();

  const [showPilihPeminjam, setShowPilihPeminjam] = useState(false);
  const [selectedPeminjamId, setSelectedPeminjamId] = useState(null);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/peminjaman");
      const json = await res.json();
      setData(json || []);
    } catch (err) {
      console.error("Gagal fetch:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==================== FILTER & SORT (FIXED) ===================

  const filtered = data
    .filter((d) => {
      return dayjs(d.tanggal).isSame(dayjs(selectedDate), "day");
    })
    .sort((a, b) => a.id - b.id); // ID kecil = data lama

  // Nomor urut visual (1, 2, 3...)
  const withNo = filtered.map((item, idx) => ({
    ...item,
    no: idx + 1,
  }));

  const toggleCalendar = () => setShowCalendar(!showCalendar);

  const handlePrevDate = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDate = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

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
  const handleCetakSurat = () => {
    const row = data.find((d) => d.id === Number(selectedPeminjamId));
    if (!row) return;

    generateSuratPeminjamanPDF(
      {
        nama: row.nama_peminjam,
        jabatan: row.jabatan || "-",
        nik: row.nik || "-",
        alamat: row.alamat || "-",
        telp: row.no_telepon || "-",
        tanggal_pinjam: row.tanggal_pinjam,
        waktu:
          row.sesi ||
          `${row.jam_mulai?.slice(0, 5)} - ${row.jam_selesai?.slice(0, 5)}`,
        alat: row.barang
          ? row.barang.split(",").map((item) => item.trim())
          : [],
        tanggal_kembali: row.tanggal_kembali || "-",
        keperluan: row.keperluan || "-",
      },
      pejabat,
    );

    setShowPilihPeminjam(false);
    setSelectedPeminjamId(null);
  };

  const handleTambahData = () => {
    if (isPastDate) {
      alert("Tidak bisa menambah data untuk tanggal yang sudah lewat");
      return;
    }
    navigate("/peminjaman-ruangan/tambah");
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Hapus data ini?")) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/peminjaman/${item.id}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Gagal hapus");
      fetchData();
      alert("Data dihapus!");
    } catch (err) {
      console.error(err);
      alert("Gagal hapus data");
    }
  };

  const handleEdit = (row) => {
    navigate(`/peminjaman-ruangan/edit/${row.id}`, {
      state: { peminjam: row },
    });
  };

  const handleApprove = async (item) => {
    if (!window.confirm("Setujui peminjaman ini?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/peminjaman/${item.id}/validasi`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "DISETUJUI",
            admin_id: 1,
          }),
        },
      );

      if (!res.ok) throw new Error("Gagal validasi");

      alert("Peminjaman berhasil disetujui ✅");
      await res.json();
      fetchData();
    } catch (err) {
      alert("Gagal menyetujui peminjaman ❌");
    }
  };

  const handleReject = async (item) => {
    if (!window.confirm("Tolak peminjaman ini?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/peminjaman/${item.id}/validasi`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "DITOLAK",
            admin_id: 1,
          }),
        },
      );

      if (!res.ok) throw new Error("Gagal validasi");

      alert("Peminjaman berhasil ditolak ❌");
      await res.json();
      fetchData();
    } catch (err) {
      alert("Gagal menolak peminjaman ❌");
    }
  };

  const onExportYear = () => {
    const year = dayjs(selectedDate).year();

    const yearData = data.filter((item) => dayjs(item.tanggal).year() === year);

    exportPeminjamanRuanganExcel(
      yearData,
      pejabat,
      `Peminjaman_Tahun_${year}.xlsx`,
      `DATA PEMINJAMAN RUANGAN TAHUN ${year}`,
    );
  };

  // ==================== DISABLE TAMBAH DATA JIKA TANGGAL LEWAT ====================
  const isPastDate = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    return selected < today;
  })();

  return (
    <div className="layout-container">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="main-content">
        <Header />

        <div className="peminjaman-top">
          <h1 className="peminjaman-title">Data Peminjaman</h1>

          <div className="peminjaman-filter">
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
                  selectedDate={selectedDate}
                  onSelectDate={(date) => {
                    setSelectedDate(date);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="peminjaman-container">
          <TambahDataButton
            onClick={handleTambahData}
            disabled={isPastDate}
            title={
              isPastDate
                ? "Tidak bisa menambah data untuk tanggal yang sudah lewat"
                : "Tambah Data Peminjaman"
            }
          />

          <div className="table-section">
            <h3 className="table-month-title">
              Data Peminjaman{" "}
              {dayjs(selectedDate).locale("id").format("dddd, D MMMM YYYY")}
            </h3>

            <div className="table-wrapper">
              {loading ? (
                <p className="loading-text">Memuat data...</p>
              ) : (
                <table className="peminjaman-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Tanggal</th>
                      <th>Nama Peminjam</th>
                      <th>Ruangan</th>
                      <th>No Telepon</th>
                      <th>Tanggal Pinjam</th>
                      <th>Sesi</th>
                      <th>Barang</th>
                      <th>Detail</th>
                      <th>Status</th>
                      <th>Kelola</th>
                    </tr>
                  </thead>

                  <tbody>
                    {withNo.length === 0 ? (
                      <tr>
                        <td colSpan="11" style={{ textAlign: "center" }}>
                          Tidak ada data
                        </td>
                      </tr>
                    ) : (
                      withNo.map((row) => (
                        <tr key={row.id}>
                          <td>{row.no}</td>
                          <td>
                            {dayjs(row.tanggal)
                              .locale("id")
                              .format("dddd, D MMMM YYYY")}
                          </td>
                          <td>{row.nama_peminjam}</td>
                          <td>{row.ruangan_name}</td>
                          <td>{row.no_telepon}</td>
                          <td>
                            {dayjs(row.tanggal_pinjam)
                              .locale("id")
                              .format("dddd, D MMMM YYYY")}
                          </td>
                          <td>
                            {row.sesi
                              ? row.sesi
                              : row.jam_mulai && row.jam_selesai
                                ? `${row.jam_mulai.slice(
                                    0,
                                    5,
                                  )} - ${row.jam_selesai.slice(0, 5)}`
                                : "-"}
                          </td>
                          <td>{row.barang}</td>
                          <td>
                            <button
                              className="btn-icon"
                              onClick={() => setSelectedGuestPeminjaman(row)}
                              title="Lihat Detail"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                          <td>
                            {row.status === "PENDING" && (
                              <div className="status-buttons">
                                <button
                                  className="btn-status btn-approve"
                                  onClick={() => handleApprove(row)}
                                  title="Setujui"
                                >
                                  ✔
                                </button>
                                <button
                                  className="btn-status btn-reject"
                                  onClick={() => handleReject(row)}
                                  title="Tolak"
                                >
                                  ✖
                                </button>
                              </div>
                            )}

                            {row.status === "DISETUJUI" && (
                              <span className="status-approved">
                                ✔ Disetujui
                              </span>
                            )}

                            {row.status === "DITOLAK" && (
                              <span className="status-rejected">✖ Ditolak</span>
                            )}
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
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <Footer
            handlePrevDate={handlePrevDate}
            handleNextDate={handleNextDate}
            // 🔹 EXPORT PER TANGGAL (SESUSAI FILTER)
            onExportTable={() =>
              exportPeminjamanRuanganExcel(
                withNo,
                pejabat,
                `Peminjaman_Tanggal_${dayjs(selectedDate).format("D_MM_YYYY")}.xlsx`,
                `DATA PEMINJAMAN RUANGAN HARI ${dayjs(selectedDate).locale("id").format("dddd, D MMMM YYYY")}`,
              )
            }
            // 🔹 EXPORT PER BULAN
            onExportMonth={() => {
              const month = dayjs(selectedDate).month();
              const year = dayjs(selectedDate).year();

              const monthData = data.filter((item) => {
                return (
                  dayjs(item.tanggal).month() === month &&
                  dayjs(item.tanggal).year() === year
                );
              });

              exportPeminjamanRuanganExcel(
                monthData,
                pejabat,
                `Peminjaman_Bulan_${month + 1}_${year}.xlsx`,
                `DATA PEMINJAMAN RUANGAN BULAN ${dayjs(selectedDate).locale("id").format("MMMM YYYY")}`,
              );
            }}
            // 🔹 EXPORT PER TAHUN
            onExportYear={onExportYear}
            // 🔹 EXPORT SEMUA DATA
            onExportAll={() =>
              exportPeminjamanRuanganExcel(
                data,
                pejabat,
                "Peminjaman_Semua_Data.xlsx",
                "DATA PEMINJAMAN RUANGAN KESELURUHAN",
              )
            }
            showUpload
            onUpload={() => setShowPilihPeminjam(true)}
          />
        </div>
      </div>

      {/* MODAL PILIH PEMINJAM UNTUK CETAK PDF */}
      {showPilihPeminjam && (
        <PilihPeminjamModal
          data={withNo.filter((d) => d.status === "PENDING")}
          selectedId={selectedPeminjamId}
          setSelectedId={setSelectedPeminjamId}
          onClose={() => setShowPilihPeminjam(false)}
          onSubmit={handleCetakSurat}
        />
      )}

      {/* MODAL DETAIL PEMINJAMAN */}
      {selectedGuestPeminjaman && (
        <GuestPeminjamanDetailModal
          guest={selectedGuestPeminjaman}
          onClose={() => setSelectedGuestPeminjaman(null)}
        />
      )}
    </div>
  );
};

export default PeminjamanRuangan;
