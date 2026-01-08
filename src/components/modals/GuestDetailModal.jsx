import React from "react";
import logoJakarta from "../../assets/logo-jakarta.png";
import { X } from "lucide-react";
import "./GuestDetailModal.css";

const GuestDetailModal = ({ guest, onClose }) => {
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
              <div className="modal-label">Nama Tamu</div>
              <div className="modal-colon">:</div>
              <div className="modal-value">{guest.nama}</div>
            </div>

            <div className="modal-field">
              <div className="modal-label">Alamat</div>
              <div className="modal-colon">:</div>
              <div className="modal-value">{guest.alamat}</div>
            </div>

            <div className="modal-field">
              <div className="modal-label">No Telp</div>
              <div className="modal-colon">:</div>
              <div className="modal-value">{guest.no_telepon}</div>
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

export default GuestDetailModal;
