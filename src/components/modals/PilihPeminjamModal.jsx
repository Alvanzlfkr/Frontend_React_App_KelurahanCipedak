import "./PilihPeminjamModal.css";

const PilihPeminjamModal = ({
  data,
  selectedId,
  setSelectedId,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Pilih Peminjam</h3>

        <select
          value={selectedId || ""}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">-- Pilih Nama Peminjam --</option>
          {data.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nama_peminjam} — {item.ruangan_name}
            </option>
          ))}
        </select>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Batal
          </button>
          <button
            className="btn-submit"
            disabled={!selectedId}
            onClick={onSubmit}
          >
            Cetak Surat
          </button>
        </div>
      </div>
    </div>
  );
};

export default PilihPeminjamModal;
