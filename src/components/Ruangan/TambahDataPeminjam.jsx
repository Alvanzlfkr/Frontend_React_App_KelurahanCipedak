import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import "./TambahDataPeminjam.css";

// ===============================
// MUI TIME PICKER IMPORTS
// ===============================
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/id";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

// Plugin untuk parsing string "HH:mm"
dayjs.extend(customParseFormat);
dayjs.locale("id");

const TambahDataPeminjam = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("data-peminjam");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // ============================
  // KONFIGURASI JAM (MUI)
  // ============================
  const minTime = dayjs().set("hour", 7).set("minute", 30);
  const maxTime = dayjs().set("hour", 16).set("minute", 0);

  const [availableSesi, setAvailableSesi] = useState([
    "Sesi 1 (07:30 - 12:00)",
    "Sesi 2 (13:00 - 16:00)",
    "Sesi 1 & 2 (Full)",
  ]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  const showSnackbar = (message, severity = "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const [disabledSesi, setDisabledSesi] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);

  // [BARU] State untuk menyimpan daftar ruangan dari DB
  const [listRuangan, setListRuangan] = useState([]);

  const [formData, setFormData] = useState({
    tanggal: "",
    namaPeminjam: "",
    jabatan: "",
    nik: "",
    alamat: "",
    noTelepon: "",
    tanggalPinjam: "",
    ruangan: "", // Sekarang ini akan menyimpan ID Ruangan (angka)
    sesi: "",
    startTime: "",
    endTime: "",
    barang: "",
    keperluan: "",
  });

  // ===================================
  // AUTO SET TANGGAL HARI INI
  // ===================================
  useEffect(() => {
    const now = dayjs().format("YYYY-MM-DD");
    setFormData((prev) => ({ ...prev, tanggal: now }));
  }, []);

  // FORMAT TAMPILAN TANGGAL
  const formattedTanggal = formData.tanggal
    ? dayjs(formData.tanggal).format("dddd, DD MMMM YYYY")
    : "";

  // ===================================
  // [BARU] FETCH DATA RUANGAN DARI API
  // ===================================
  useEffect(() => {
    fetch("http://localhost:5000/api/ruangan")
      .then((res) => res.json())
      .then((data) => {
        setListRuangan(data);
      })
      .catch((err) => console.error("Gagal ambil ruangan:", err));
  }, []);

  // [BARU] Helper untuk cek apakah ruangan yang dipilih adalah RPTRA
  const isSelectedRoomRPTRA = () => {
    if (!formData.ruangan) return false;
    // Cari data ruangan berdasarkan ID yang dipilih
    const room = listRuangan.find((r) => r.id === parseInt(formData.ruangan));
    return room && room.tipe === "RPTRA";
  };

  // =====================================
  // FETCH SESI SUDAH DIPESAN
  // =====================================
  useEffect(() => {
    if (!formData.tanggalPinjam || !formData.ruangan) return;

    setDisabledSesi([]);
    setBookedTimes([]);

    fetch(
      `http://localhost:5000/api/peminjaman/cek?ruangan_id=${formData.ruangan}&tanggal_pinjam=${formData.tanggalPinjam}`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("CEK TERPAKAI:", data); // 🔍 DEBUG

        const disabled = {
          sesi1: false,
          sesi2: false,
          full: false,
        };

        data.forEach((d) => {
          if (d.sesi === "Sesi 1 (07:30 - 12:00)") {
            disabled.sesi1 = true;
          }

          if (d.sesi === "Sesi 2 (13:00 - 16:00)") {
            disabled.sesi2 = true;
          }

          if (d.sesi === "Sesi 1 & 2 (Full)") {
            disabled.sesi1 = true;
            disabled.sesi2 = true;
            disabled.full = true;
          }
        });

        // kalau sesi 1 & 2 sama-sama terpakai → full ikut disable
        if (disabled.sesi1 || disabled.sesi2) {
          disabled.full = true;
        }

        const result = [];
        if (disabled.sesi1) result.push("Sesi 1 (07:30 - 12:00)");
        if (disabled.sesi2) result.push("Sesi 2 (13:00 - 16:00)");
        if (disabled.full) result.push("Sesi 1 & 2 (Full)");

        setDisabledSesi(result);

        // MODE JAM (RPTRA)
        const times = data
          .filter((d) => d.jam_mulai && d.jam_selesai)
          .map((d) => ({
            start: d.jam_mulai.substring(0, 5),
            end: d.jam_selesai.substring(0, 5),
          }));

        setBookedTimes(times);
      })
      .catch(console.error);
  }, [formData.tanggalPinjam, formData.ruangan]);

  // =====================================
  // LOGIC DISABLE JAM
  // =====================================
  const isTimeDisabled = (value, view) => {
    if (!value) return false;

    // Gunakan helper baru
    if (!isSelectedRoomRPTRA()) return false;

    const minutes = value.hour() * 60 + value.minute();

    // ⛔ Disable jam istirahat 12:00–13:00
    const breakStart = 12 * 60;
    const breakEnd = 13 * 60;
    if (minutes > breakStart && minutes < breakEnd) return true;

    // ⛔ Disable jam yang sudah dibooking
    return bookedTimes.some(({ start, end }) => {
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);

      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;

      return minutes >= startMin && minutes < endMin;
    });
  };

  const formatNama = (value) => {
    return value
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  // =====================================
  // HANDLE INPUT
  // =====================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    // ===== NAMA (auto Proper Case saat blur) =====
    if (name === "namaPeminjam") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      return;
    }

    // ===== NIK =====
    if (name === "nik") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 16) return;
    }

    // ===== NO TELEPON =====
    if (name === "noTelepon") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 13) return;
    }

    if (name === "ruangan") {
      const selectedRoom = listRuangan.find((r) => r.id === parseInt(value));

      if (selectedRoom && selectedRoom.tipe === "RPTRA") {
        setFormData((prev) => ({
          ...prev,
          ruangan: value,
          sesi: "",
          startTime: "",
          endTime: "",
        }));
      } else {
        setAvailableSesi([
          "Sesi 1 (07:30 - 12:00)",
          "Sesi 2 (13:00 - 16:00)",
          "Sesi 1 & 2 (Full)",
        ]);

        setFormData((prev) => ({
          ...prev,
          ruangan: value,
          sesi: "",
          startTime: "",
          endTime: "",
        }));
      }

      return; // ✅ PENTING
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (newValue, type) => {
    if (!newValue) return;

    if (isTimeDisabled(newValue)) {
      showSnackbar(
        "Jam ini tidak tersedia (sudah dipakai / jam istirahat)",
        "warning"
      );
      return;
    }

    const timeString = newValue.format("HH:mm");

    setFormData((prev) => {
      const newStart = type === "start" ? timeString : prev.startTime;
      const newEnd = type === "end" ? timeString : prev.endTime;

      if (newStart && newEnd) {
        const toMin = (t) => {
          const [h, m] = t.split(":").map(Number);
          return h * 60 + m;
        };

        if (toMin(newEnd) <= toMin(newStart)) {
          showSnackbar("Jam selesai harus lebih besar dari jam mulai", "error");
          return prev;
        }
      }

      return {
        ...prev,
        startTime: newStart,
        endTime: newEnd,
        sesi: newStart && newEnd ? `${newStart} - ${newEnd}` : "",
      };
    });
  };

  // =====================================
  // VALIDASI LOGIC WAKTU (RPTRA)
  // =====================================
  const validateRPTRA = () => {
    // Gunakan helper baru
    if (!isSelectedRoomRPTRA()) return true;

    const start = formData.startTime;
    const end = formData.endTime;

    if (!start || !end) {
      showSnackbar("Harap pilih jam mulai dan jam selesai!", "warning");
      return false;
    }

    const toMinutes = (str) => {
      const [h, m] = str.split(":").map(Number);
      return h * 60 + m;
    };

    const startMin = toMinutes(start);
    const endMin = toMinutes(end);

    const minLimit = 7 * 60 + 30; // 07:30
    const maxLimit = 16 * 60; // 16:00
    const breakStart = 12 * 60; // 12:00
    const breakEnd = 13 * 60; // 13:00

    if (startMin < minLimit || endMin > maxLimit) {
      alert("Waktu peminjaman hanya diperbolehkan antara 07:30 - 16:00");
      return false;
    }

    if (startMin >= breakStart && startMin < breakEnd) {
      alert(
        "Tidak bisa memulai peminjaman tepat di jam istirahat (12:00 - 13:00)."
      );
      return false;
    }

    if (endMin > breakStart && endMin < breakEnd) {
      alert("Tidak bisa mengakhiri peminjaman di tengah jam istirahat.");
      return false;
    }

    if (endMin <= startMin) {
      alert("Jam selesai harus lebih besar dari jam mulai!");
      return false;
    }

    return true;
  };

  // =====================================
  // VALIDASI FORM UMUM
  // =====================================
  const validateForm = () => {
    const newErrors = {};

    if (!formData.namaPeminjam.trim())
      newErrors.namaPeminjam = "Nama wajib diisi";

    if (!formData.noTelepon) newErrors.noTelepon = "Nomor telepon wajib diisi";
    else if (!/^08\d{8,11}$/.test(formData.noTelepon))
      newErrors.noTelepon = "Nomor harus diawali 08 (10–13 digit)";

    if (!formData.nik || formData.nik.length !== 16)
      newErrors.nik = "NIK harus 16 digit";

    if (!formData.tanggalPinjam)
      newErrors.tanggalPinjam = "Tanggal pinjam wajib diisi";

    if (!formData.ruangan) newErrors.ruangan = "Ruangan wajib dipilih";

    // ❗ hanya non-RPTRA wajib sesi
    if (!isSelectedRoomRPTRA() && !formData.sesi)
      newErrors.sesi = "Sesi wajib dipilih";

    if (!formData.keperluan) newErrors.keperluan = "Keperluan wajib diisi";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // =====================================
  // SUBMIT
  // =====================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!validateForm()) return;
    if (!validateRPTRA()) return;

    // Tidak perlu getRuanganId lagi, formData.ruangan sudah ID yang benar
    const isRPTRA = isSelectedRoomRPTRA();

    const payload = {
      tanggal: formData.tanggal,
      nama_peminjam: formData.namaPeminjam,
      jabatan: formData.jabatan,
      nik: formData.nik,
      alamat: formData.alamat,
      no_telepon: formData.noTelepon,
      tanggal_pinjam: formData.tanggalPinjam,
      ruangan_id: formData.ruangan, // Langsung pakai ID
      barang: formData.barang?.trim() || null,
      keperluan: formData.keperluan,

      // Logic payload
      sesi: isRPTRA ? null : formData.sesi,
      jam_mulai: isRPTRA ? formData.startTime : null,
      jam_selesai: isRPTRA ? formData.endTime : null,
    };

    // VALIDASI NOMOR TELEPON (WAJIB 08)
    if (!/^08\d{8,11}$/.test(formData.noTelepon)) {
      showSnackbar(
        "Nomor WhatsApp harus diawali 08 dan minimal 10 digit",
        "warning"
      );
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/peminjaman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        showSnackbar(data.error || "Gagal menyimpan data", "error");
        return;
      }

      showSnackbar("Data berhasil disimpan!", "success");
      navigate("/peminjaman-ruangan");
    } catch (err) {
      console.error(err);
      showSnackbar("Terjadi kesalahan server", "error");
    }
  };

  const handleCancel = () => {
    const hasData = Object.values(formData).some((v) => v !== "");
    if (hasData && !window.confirm("Batalkan pengisian?")) return;
    navigate("/peminjaman-ruangan");
  };

  return (
    <div className="layout-container">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="main-content">
        <Header />

        <div className="tambah-data-container">
          <h1 className="tambah-data-title">Tambah Data Peminjam</h1>

          <div className="form-card">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <form onSubmit={handleSubmit} className="tambah-data-form">
                {/* --- Input Standard (Tanggal - No Telepon) --- */}
                <div className="form-group">
                  <label>Tanggal</label>
                  <div
                    className="form-input"
                    style={{
                      backgroundColor: "#f5f5f5",
                      cursor: "not-allowed",
                      fontWeight: 500,
                    }}
                  >
                    {formattedTanggal}
                  </div>

                  <input
                    type="hidden"
                    name="tanggal"
                    value={formData.tanggal}
                  />
                </div>
                <div className="form-group">
                  <label>Nama Peminjam</label>
                  <input
                    type="text"
                    name="namaPeminjam"
                    value={formData.namaPeminjam}
                    onChange={handleChange}
                    className={`form-input ${
                      submitted
                        ? errors.namaPeminjam
                          ? "input-error"
                          : "input-success"
                        : ""
                    }`}
                  />
                  {submitted && errors.namaPeminjam && (
                    <small className="error-text">{errors.namaPeminjam}</small>
                  )}
                </div>
                <div className="form-group">
                  <label>Jabatan</label>
                  <input
                    type="text"
                    name="jabatan"
                    value={formData.jabatan}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>NIK</label>
                  <input
                    type="text"
                    name="nik"
                    value={formData.nik}
                    onChange={handleChange}
                    className={`form-input ${
                      submitted
                        ? errors.nik
                          ? "input-error"
                          : "input-success"
                        : ""
                    }`}
                  />
                  {submitted && errors.nik && (
                    <small className="error-text">{errors.nik}</small>
                  )}
                </div>
                <div className="form-group">
                  <label>Alamat</label>
                  <input
                    type="text"
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>No Telepon</label>
                  <input
                    type="text"
                    name="noTelepon"
                    value={formData.noTelepon}
                    onChange={handleChange}
                    className={`form-input ${
                      submitted
                        ? errors.noTelepon
                          ? "input-error"
                          : "input-success"
                        : ""
                    }`}
                    placeholder="08xxxxxxxxxx"
                  />
                  {submitted && errors.noTelepon && (
                    <small className="error-text">{errors.noTelepon}</small>
                  )}
                </div>
                <div className="form-group">
                  <label>Tanggal Pinjam</label>
                  <input
                    type="date"
                    name="tanggalPinjam"
                    value={formData.tanggalPinjam}
                    onChange={handleChange}
                    className={`form-input ${
                      submitted
                        ? errors.tanggalPinjam
                          ? "input-error"
                          : "input-success"
                        : ""
                    }`}
                  />
                  {submitted && errors.tanggalPinjam && (
                    <small className="error-text">{errors.tanggalPinjam}</small>
                  )}
                </div>

                {/* --- RUANGAN (DINAMIS DARI DB) --- */}
                <div className="form-group">
                  <label>Ruangan</label>
                  <select
                    name="ruangan"
                    value={formData.ruangan}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">-- Pilih Ruangan --</option>
                    {listRuangan.map((ruang) => (
                      <option key={ruang.id} value={ruang.id}>
                        {ruang.nama}
                      </option>
                    ))}
                  </select>
                  {submitted && errors.ruangan && (
                    <small className="error-text">{errors.ruangan}</small>
                  )}
                </div>

                {/* --- SESI / TIME PICKER (LOGIC BARU) --- */}
                <div className="form-group">
                  <label>Sesi</label>

                  {/* Gunakan helper isSelectedRoomRPTRA() */}
                  {isSelectedRoomRPTRA() ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <TimePicker
                        label="Mulai"
                        ampm={false}
                        format="HH:mm"
                        minTime={minTime}
                        maxTime={maxTime}
                        shouldDisableTime={isTimeDisabled}
                        value={
                          formData.startTime
                            ? dayjs(formData.startTime, "HH:mm")
                            : null
                        }
                        onChange={(newValue) =>
                          handleTimeChange(newValue, "start")
                        }
                        slotProps={{
                          textField: {
                            size: "small",
                            className: "form-input",
                            sx: { backgroundColor: "#fff", width: "150px" },
                          },
                        }}
                      />

                      <span>s/d</span>

                      <TimePicker
                        label="Selesai"
                        ampm={false}
                        format="HH:mm"
                        minTime={minTime}
                        maxTime={maxTime}
                        shouldDisableTime={isTimeDisabled}
                        value={
                          formData.endTime
                            ? dayjs(formData.endTime, "HH:mm")
                            : null
                        }
                        onChange={(newValue) =>
                          handleTimeChange(newValue, "end")
                        }
                        slotProps={{
                          textField: {
                            size: "small",
                            className: "form-input",
                            sx: { backgroundColor: "#fff", width: "150px" },
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <select
                      name="sesi"
                      value={formData.sesi}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">-- Pilih Sesi --</option>
                      {availableSesi.map((s, i) => (
                        <option
                          key={i}
                          value={s}
                          disabled={disabledSesi.includes(s)}
                        >
                          {s}{" "}
                          {disabledSesi.includes(s) ? "(Sudah dipesan)" : ""}
                        </option>
                      ))}
                    </select>
                  )}
                  {!isSelectedRoomRPTRA() && submitted && errors.sesi && (
                    <small className="error-text">{errors.sesi}</small>
                  )}
                </div>

                {/* --- SISA INPUT --- */}
                <div className="form-group">
                  <label>Barang</label>
                  <input
                    type="text"
                    name="barang"
                    value={formData.barang}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Keperluan</label>
                  <textarea
                    name="keperluan"
                    value={formData.keperluan}
                    onChange={handleChange}
                    className={`form-textarea ${
                      submitted
                        ? errors.keperluan
                          ? "input-error"
                          : "input-success"
                        : ""
                    }`}
                  />
                  {submitted && errors.keperluan && (
                    <small className="error-text">{errors.keperluan}</small>
                  )}
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-submit">
                    Simpan
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={handleCancel}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </LocalizationProvider>
          </div>
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <MuiAlert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </MuiAlert>
          </Snackbar>
        </div>
      </div>
    </div>
  );
};

export default TambahDataPeminjam;
