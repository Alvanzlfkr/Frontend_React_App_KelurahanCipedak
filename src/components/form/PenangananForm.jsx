import { useState, useEffect } from "react";
import "./PenangananForm.css";

const ALL_JABATAN = ["Lurah", "Sekretaris"];

const PenangananForm = ({
  initialData,
  onSubmit,
  onCancel, // ✅ TAMBAHKAN INI
  submitLabel,
  jabatanTerisi = [],
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    nama: "",
    nip: "",
    jabatan: "",
  });

  const [errors, setErrors] = useState({});

  /* ===============================
     ISI DATA SAAT MODE EDIT
     =============================== */
  useEffect(() => {
    if (!initialData) return;

    setFormData({
      nama: initialData.nama ?? "",
      nip: initialData.nip ?? "",
      jabatan: initialData.jabatan ?? "",
    });
  }, [initialData]);

  /* ===============================
     AUTO SET JABATAN (MODE TAMBAH)
     =============================== */
  useEffect(() => {
    if (isEdit) return;

    const sisaJabatan = ALL_JABATAN.filter((j) => !jabatanTerisi.includes(j));

    if (sisaJabatan.length === 1 && formData.jabatan !== sisaJabatan[0]) {
      setFormData((prev) => ({
        ...prev,
        jabatan: sisaJabatan[0],
      }));
    }
  }, [jabatanTerisi, isEdit]); // ⚠️ aman, tidak infinite loop

  /* ===============================
     OPSI JABATAN DI SELECT
     =============================== */
  const availableJabatan = isEdit
    ? [formData.jabatan]
    : ALL_JABATAN.filter((j) => !jabatanTerisi.includes(j));

  /* ===============================
     VALIDASI FORM
     =============================== */
  /* ===============================
   VALIDASI FORM
=============================== */
  const validate = () => {
    const err = {};

    // Nama wajib diisi
    if (!formData.nama.trim()) {
      err.nama = "Nama wajib diisi";
    }
    // Nama maksimal 26 karakter
    else if (formData.nama.trim().length > 26) {
      err.nama = "Nama tidak boleh lebih dari 26 karakter";
    }

    // Validasi NIP
    if (!formData.nip.trim()) {
      err.nip = "NIP wajib diisi";
    } else if (!/^\d{5,25}$/.test(formData.nip)) {
      err.nip = "NIP harus 5–25 digit angka";
    }

    // Validasi jabatan
    if (!formData.jabatan) {
      err.jabatan = "Jabatan wajib dipilih";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* ===============================
     HANDLER
     =============================== */
  /* ===============================
   HANDLER
   =============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Batasi nama maksimal 26 karakter
    const newValue = name === "nama" ? value.slice(0, 26) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  /* ===============================
     RENDER
     =============================== */
  return (
    <form onSubmit={handleSubmit} className="form-card">
      {/* NAMA */}
      <div className="form-group">
        <label>Nama</label>
        <input
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          placeholder="Nama lengkap"
        />
        {errors.nama && <small className="error">{errors.nama}</small>}

        {/* info tambahan */}
      </div>

      {/* NIP */}
      <div className="form-group">
        <label>NIP</label>
        <input
          name="nip"
          value={formData.nip}
          onChange={(e) => {
            const cleaned = e.target.value.replace(/\D/g, "");

            setFormData((prev) => ({
              ...prev,
              nip: cleaned,
            }));

            setErrors((prev) => ({
              ...prev,
              nip: "",
            }));
          }}
          inputMode="numeric"
          placeholder="Masukkan NIP"
        />
        {errors.nip && <small className="error">{errors.nip}</small>}
      </div>

      {/* JABATAN */}
      <div className="form-group">
        <label>Jabatan</label>
        <select
          name="jabatan"
          value={formData.jabatan}
          onChange={handleChange}
          disabled={isEdit}
        >
          <option value="">-- Pilih Jabatan --</option>
          {availableJabatan.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
        {errors.jabatan && <small className="error">{errors.jabatan}</small>}
      </div>

      {/* INFO FORMAT */}
      <div className="form-info">
        <small>Format Penamaan: Persingkat nama jika terlalu panjang.</small>
        <small>Contoh: Prof. Rahmadi Amirul Mukminin S.KOM M.KOM</small>
        <small>Menjadi: Prof. Rahmadi A M.KOM</small>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="btn-cancel">
          Batal
        </button>
      </div>
    </form>
  );
};

export default PenangananForm;
