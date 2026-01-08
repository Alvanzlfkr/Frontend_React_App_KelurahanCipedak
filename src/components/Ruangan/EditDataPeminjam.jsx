import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import "./TambahDataPeminjam.css";

// ================= MUI & DAYJS =================
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/id";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

dayjs.extend(customParseFormat);
dayjs.locale("id");

const EditDataPeminjam = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [submitted, setSubmitted] = useState(false);

  const peminjamFromState = location.state?.peminjam || null;

  const [activeMenu, setActiveMenu] = useState("data-peminjam");

  // ============================
  // KONFIGURASI JAM (MUI)
  // ============================
  const minTime = dayjs().set("hour", 7).set("minute", 30);
  const maxTime = dayjs().set("hour", 16).set("minute", 0);

  // ===================== STATE =====================
  const [listRuangan, setListRuangan] = useState([]);
  const [peminjamData, setPeminjamData] = useState(peminjamFromState);

  const [availableSesi] = useState([
    "Sesi 1 (07:30 - 12:00)",
    "Sesi 2 (13:00 - 16:00)",
    "Sesi 1 & 2 (Full)",
  ]);

  const [disabledSesi, setDisabledSesi] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  const showSnackbar = (message, severity = "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const shouldDisableTimeRPTRA = (value, view) => {
    if (view !== "minutes") return false;

    const m = value.hour() * 60 + value.minute();

    // ⛔ disable 12:01 – 13:29
    return m > 720 && m < 810;
  };

  const konflikMap = {
    "Sesi 1 (07:30 - 12:00)": ["Sesi 1 (07:30 - 12:00)", "Sesi 1 & 2 (Full)"],
    "Sesi 2 (13:00 - 16:00)": ["Sesi 2 (13:00 - 16:00)", "Sesi 1 & 2 (Full)"],
    "Sesi 1 & 2 (Full)": [
      "Sesi 1 (07:30 - 12:00)",
      "Sesi 2 (13:00 - 16:00)",
      "Sesi 1 & 2 (Full)",
    ],
  };

  // =====================================
  // VALIDASI LOGIC WAKTU (RPTRA)
  // =====================================
  const validateRPTRA = (data = formData) => {
    if (!isSelectedRoomRPTRA()) return true;

    const { startTime, endTime } = data;
    if (!startTime || !endTime) {
      showSnackbar("Jam mulai dan jam selesai wajib diisi", "warning");
      return false;
    }

    const toMin = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const startMin = toMin(startTime);
    const endMin = toMin(endTime);

    const minLimit = 450; // 07:30
    const maxLimit = 960; // 16:00
    const breakStart = 720; // 12:00
    const breakEnd = 780; // 13:00
    const minEndAfterBreak = 810; // 13:30

    // batas jam kerja
    if (startMin < minLimit || endMin > maxLimit) {
      showSnackbar("Waktu peminjaman hanya 07:30 – 16:00", "warning");
      return false;
    }

    // jam selesai harus > jam mulai
    if (endMin <= startMin) {
      showSnackbar("Jam selesai harus lebih besar dari jam mulai", "warning");
      return false;
    }

    // ⛔ tidak boleh mulai di jam istirahat
    if (startMin >= breakStart && startMin < breakEnd) {
      showSnackbar(
        "Tidak boleh mulai di jam istirahat (12:00 – 13:00)",
        "warning"
      );
      return false;
    }

    // ⛔ tidak boleh selesai di jam istirahat
    if (endMin > breakStart && endMin < minEndAfterBreak) {
      showSnackbar(
        "Jam selesai tidak boleh antara 12:01 – 13:29. Minimal jam selesai 13:30",
        "warning"
      );
      return false;
    }

    return true;
  };

  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    tanggal: "",
    namaPeminjam: "",
    jabatan: "",
    nik: "",
    alamat: "",
    noTelepon: "",
    tanggalPinjam: "",
    ruangan: "",
    sesi: "",
    startTime: "",
    endTime: "",
    barang: "",
    keperluan: "",
  });

  // ===================== FETCH RUANGAN =====================
  useEffect(() => {
    fetch("http://localhost:5000/api/ruangan")
      .then((res) => res.json())
      .then(setListRuangan)
      .catch(console.error);
  }, []);

  const formattedTanggal = formData.tanggal
    ? dayjs(formData.tanggal).format("dddd, DD MMMM YYYY")
    : "";

  // [BARU] Helper untuk cek apakah ruangan yang dipilih adalah RPTRA
  const isSelectedRoomRPTRA = () => {
    if (!formData.ruangan) return false;
    // Cari data ruangan berdasarkan ID yang dipilih
    const room = listRuangan.find((r) => r.id === parseInt(formData.ruangan));
    return room && room.tipe === "RPTRA";
  };

  // ===================== FETCH DATA (JIKA REFRESH) =====================
  useEffect(() => {
    if (peminjamFromState) return;
    if (!id) return;

    fetch(`http://localhost:5000/api/peminjaman/${id}`)
      .then((res) => res.json())
      .then(setPeminjamData)
      .catch(console.error);
  }, [id, peminjamFromState]);

  // ===================== LOAD DATA KE FORM =====================
  useEffect(() => {
    if (!peminjamData) return;

    const isRptra =
      listRuangan.find((r) => r.id === peminjamData.ruangan_id)?.tipe ===
      "RPTRA";

    setFormData({
      tanggal: peminjamData.tanggal
        ? dayjs(peminjamData.tanggal).format("YYYY-MM-DD")
        : "",

      namaPeminjam: peminjamData.nama_peminjam || "",
      jabatan: peminjamData.jabatan || "",
      nik: peminjamData.nik || "",
      alamat: peminjamData.alamat || "",
      noTelepon: peminjamData.no_telepon || "",
      tanggalPinjam: peminjamData.tanggal_pinjam
        ? dayjs(peminjamData.tanggal_pinjam).format("YYYY-MM-DD")
        : "",
      ruangan: peminjamData.ruangan_id?.toString() || "",
      sesi: isRptra ? "" : peminjamData.sesi || "",
      startTime: isRptra ? peminjamData.jam_mulai?.slice(0, 5) || "" : "",
      endTime: isRptra ? peminjamData.jam_selesai?.slice(0, 5) || "" : "",
      barang: peminjamData.barang || "",
      keperluan: peminjamData.keperluan || "",
    });
  }, [peminjamData, listRuangan]);
  // ===================== HELPER =====================
  const isRPTRA = () => {
    const r = listRuangan.find((x) => x.id === parseInt(formData.ruangan));
    return r?.tipe === "RPTRA";
  };

  // ===================== CEK BOOKING =====================
  useEffect(() => {
    if (!formData.tanggalPinjam || !formData.ruangan) return;

    fetch(
      `http://localhost:5000/api/peminjaman/cek?ruangan_id=${formData.ruangan}&tanggal_pinjam=${formData.tanggalPinjam}&exclude_id=${id}`
    )
      .then((res) => res.json())
      .then((data) => {
        const sesiTerisi = data.map((d) => d.sesi).filter(Boolean);

        const sesiKonflik = new Set();

        sesiTerisi.forEach((s) => {
          // 🔥 JIKA DATA LAMA ADALAH FULL, JANGAN KUNCI SESI 1 & 2
          if (
            peminjamData?.sesi === "Sesi 1 & 2 (Full)" &&
            s === "Sesi 1 & 2 (Full)"
          ) {
            return;
          }

          const konflik = konflikMap[s] || [s];
          konflik.forEach((k) => sesiKonflik.add(k));
        });

        // 🔥 INI KUNCI FIX-NYA
        // hapus sesi milik data yang sedang diedit
        if (formData.sesi) {
          sesiKonflik.delete(formData.sesi);
        }

        setDisabledSesi([...sesiKonflik]);

        setBookedTimes(
          data
            .filter((d) => d.jam_mulai && d.jam_selesai)
            .map((d) => ({
              start: d.jam_mulai.slice(0, 5),
              end: d.jam_selesai.slice(0, 5),
            }))
        );
      })
      .catch(console.error);
  }, [formData.tanggalPinjam, formData.ruangan, formData.sesi, id]);

  // ===================== TIME PICKER HANDLER (SAMA DENGAN TAMBAH DATA) =====================
  const handleTimeChange = (newValue, type) => {
    if (!newValue) return;

    const updatedData = {
      ...formData,
      [type === "start" ? "startTime" : "endTime"]: newValue.format("HH:mm"),
    };

    setFormData(updatedData);

    // 🔥 VALIDASI LANGSUNG SETELAH PILIH JAM
    validateRPTRA(updatedData);
  };

  const isTimeDisabled = (value, view) => {
    if (view !== "minutes") return false;

    const time = value.format("HH:mm");

    // 🔥 IZINKAN JAM ASLI MILIK DATA INI
    if (
      formData.startTime &&
      formData.endTime &&
      time >= formData.startTime &&
      time < formData.endTime
    ) {
      return false;
    }

    return bookedTimes.some((b) => time >= b.start && time < b.end);
  };

  // ===================== HANDLE CHANGE =====================
  const handleChange = (e) => {
    const { name, value } = e.target;

    // ===== VALIDASI NIK =====
    if (name === "nik") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 16) return;
    }

    // ===== VALIDASI NO TELEPON =====
    if (name === "noTelepon") {
      // hanya angka
      if (!/^\d*$/.test(value)) return;

      // maksimal 13 digit (08 + 8–11 digit)
      if (value.length > 13) return;
    }
    // 🔥🔥🔥 FIX UTAMA ADA DI SINI 🔥🔥🔥
    if (name === "ruangan") {
      const selectedRoom = listRuangan.find((r) => r.id === parseInt(value));

      setFormData((prev) => ({
        ...prev,
        ruangan: value,

        // ⛔ RESET SEMUA LOGIC LAMA
        sesi: "",
        startTime: "",
        endTime: "",
      }));

      // ⛔ RESET STATE BOOKING
      setDisabledSesi([]);
      setBookedTimes([]);

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const validateForm = () => {
    const newErrors = {};

    if (!formData.namaPeminjam.trim())
      newErrors.namaPeminjam = "Nama wajib diisi";

    if (!formData.noTelepon) newErrors.noTelepon = "Nomor telepon wajib diisi";
    else if (!/^08\d{8,11}$/.test(formData.noTelepon))
      newErrors.noTelepon = "Nomor harus diawali 08 (10–13 digit)";

    if (!formData.nik) newErrors.nik = "NIK wajib diisi";
    else if (formData.nik.length !== 16) newErrors.nik = "NIK harus 16 digit";

    if (!formData.tanggalPinjam)
      newErrors.tanggalPinjam = "Tanggal pinjam wajib diisi";

    if (!formData.ruangan) newErrors.ruangan = "Ruangan wajib dipilih";

    // ❗ hanya NON-RPTRA wajib sesi
    if (!isSelectedRoomRPTRA() && !formData.sesi)
      newErrors.sesi = "Sesi wajib dipilih";

    if (!formData.keperluan) newErrors.keperluan = "Keperluan wajib diisi";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===================== SUBMIT =====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!validateForm()) {
      showSnackbar("Mohon lengkapi data wajib", "warning");
      return;
    }

    // validasi khusus booking / RPTRA
    if (isRPTRA()) {
      if (!validateRPTRA()) return;
    } else {
      if (disabledSesi.includes(formData.sesi)) {
        showSnackbar("Sesi sudah dibooking, silakan pilih sesi lain");
        return;
      }
    }

    const payload = {
      tanggal: formData.tanggal, // ❗ tetap
      nama_peminjam: formData.namaPeminjam,
      jabatan: formData.jabatan,
      nik: formData.nik,
      alamat: formData.alamat,
      no_telepon: formData.noTelepon,
      tanggal_pinjam: formData.tanggalPinjam,
      ruangan_id: parseInt(formData.ruangan),
      barang: formData.barang?.trim() || null, // ❌ tidak divalidasi
      keperluan: formData.keperluan,
      sesi: isRPTRA() ? null : formData.sesi,
      jam_mulai: isRPTRA() ? formData.startTime : null,
      jam_selesai: isRPTRA() ? formData.endTime : null,
    };

    try {
      const res = await fetch(`http://localhost:5000/api/peminjaman/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      showSnackbar("Data berhasil diperbarui", "success");
      navigate("/peminjaman-ruangan");
    } catch {
      showSnackbar("Gagal update data");
    }
  };

  const handleCancel = () => {
    navigate("/peminjaman-ruangan");
  };

  return (
    <div className="layout-container">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="main-content">
        <Header />

        <div className="tambah-data-container">
          <h1 className="tambah-data-title">Edit Data Peminjam</h1>

          <div className="form-card">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <form onSubmit={handleSubmit} className="tambah-data-form">
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

                  {/* nilai tetap dikirim ke backend */}
                  <input
                    type="hidden"
                    name="tanggal"
                    value={formData.tanggal}
                  />
                </div>

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
                {errors.namaPeminjam && (
                  <small className="error-text">{errors.namaPeminjam}</small>
                )}

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
                    className={`form-input ${errors.nik ? "error" : ""}`}
                  />
                  {errors.nik && (
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
                    className="form-input"
                  />
                </div>

                <input
                  type="date"
                  name="tanggalPinjam"
                  value={formData.tanggalPinjam}
                  onChange={handleChange}
                  className={`form-input ${
                    errors.tanggalPinjam ? "error" : ""
                  }`}
                />
                {errors.tanggalPinjam && (
                  <small className="error-text">{errors.tanggalPinjam}</small>
                )}

                <div className="form-group">
                  <label>Ruangan</label>
                  <select
                    name="ruangan"
                    value={formData.ruangan}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">-- Pilih Ruangan --</option>
                    {listRuangan.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nama}
                      </option>
                    ))}
                  </select>
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
                        shouldDisableTime={shouldDisableTimeRPTRA}
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
                        shouldDisableTime={shouldDisableTimeRPTRA}
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
                  {errors.sesi && (
                    <small className="error-text">{errors.sesi}</small>
                  )}
                </div>

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
                    className="form-textarea"
                    rows="4"
                  />
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
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <MuiAlert severity={snackbar.severity} variant="filled">
              {snackbar.message}
            </MuiAlert>
          </Snackbar>
        </div>
      </div>
    </div>
  );
};

export default EditDataPeminjam;
