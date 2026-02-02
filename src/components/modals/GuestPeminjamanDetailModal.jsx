import React from "react";
import logoJakarta from "../../assets/logo-jakarta.png";
import { X } from "lucide-react";
import "./GuestPeminjamanDetailModal.css";

const GuestPeminjamanDetailModal = ({ guest, onClose }) => {
  if (!guest) return null;

  return (
    <>
      {/* Overlay */}
      <div className="modal-overlay" onClick={onClose} />

      {/* Modal */}
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <img src={logoJakarta} alt="Logo" className="modal-logo" />
            <div>
              <div className="modal-subtitle">KELURAHAN CIPEDAK</div>
              <div className="modal-title">
                Data Tamu - {guest.no.toString().padStart(4, "0")}
              </div>
            </div>
          </div>

          <div className="modal-header-right">
            <div className="modal-date">
              {new Date(guest.tanggal).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
            <button onClick={onClose} className="modal-close-btn">
              <X size={24} color="#2c5f7a" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="modal-content">
          <div className="modal-fields">
            <div className="modal-field">
              <div className="modal-label">Nama Peminjam</div>
              <div className="modal-colon">:</div>
              <div className="modal-value">{guest.nama_peminjam}</div>
            </div>

            <div className="modal-field">
              <div className="modal-label">NIK</div>
              <div className="modal-colon">:</div>
              <div className="modal-value">{guest.nik || "-"}</div>
            </div>
            <div className="modal-field">
              <div className="modal-label">Alamat</div>
              <div className="modal-colon">:</div>
              <div className="modal-value">{guest.alamat || "-"}</div>
            </div>
            <div className="modal-field">
              <div className="modal-label">No Telpon</div>
              <div className="modal-colon">:</div>
              <div className="modal-value">{guest.no_telepon}</div>
            </div>
            <div className="modal-field">
              <div className="modal-label">Tanggal Pinjam</div>
              <div className="modal-colon">:</div>
              <div className="modal-value">
                {new Date(guest.tanggal_pinjam).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
            <div className="modal-field">
              <div className="modal-label">Sesi</div>
              <div className="modal-colon">:</div>
              <div className="modal-value">
                {guest.sesi
                  ? guest.sesi
                  : guest.jam_mulai && guest.jam_selesai
                  ? `${guest.jam_mulai.slice(0, 5)} - ${guest.jam_selesai.slice(
                      0,
                      5
                    )}`
                  : "-"}
              </div>
            </div>
            <div className="modal-field">
              <div className="modal-label">Ruangan</div>
              <div className="modal-colon">:</div>
              <div className="modal-value">{guest.ruangan_name}</div>
            </div>

            <div className="modal-field">
              <div className="modal-label">Barang Dipinjam</div>
              <div className="modal-colon">:</div>
              <div className="modal-value">{guest.barang}</div>
            </div>
            <div className="modal-field">
              <div className="modal-label">Tanggal Kembali Barang</div>
              <div className="modal-colon">:</div>
              <div className="modal-value">
                {guest.tanggal_kembali_barang
                  ? new Date(guest.tanggal_kembali_barang).toLocaleDateString(
                      "id-ID",
                      {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )
                  : "-"}
              </div>
            </div>
            <div className="modal-field">
              <div className="modal-label">Keperluan</div>
              <div className="modal-colon">:</div>
              <div className="modal-value">{guest.keperluan}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GuestPeminjamanDetailModal;
