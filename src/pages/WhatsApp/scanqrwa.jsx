import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/layout/Header/Header";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import { useNavigate } from "react-router-dom";
import "./scanqrwa.css";

export default function ScanQRWA() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [activeMenu, setActiveMenu] = useState("scan-qr-code-wa");

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/wa/status");
        setStatus(res.data);
      } catch (err) {
        console.error("Gagal ambil status WA");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/wa/logout");
      setStatus({ isReady: false, qr: null });
    } catch (err) {
      console.error("Gagal logout WA");
    }
  };

  return (
    <div className="layout-container">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="main-container">
        <Header />

        <div className="scan-qr-wa-top">
          <h1 className="scan-qr-wa-title">Scan QR Code WhatsApp</h1>
        </div>

        <div className="scan-qr-wa-container">
          {/* ⏳ Loading */}
          {!status && <p className="text-gray-500">Loading...</p>}

          {/* 📱 QR muncul */}
          {status && !status.isReady && status.qr && (
            <>
              <p className="mb-4 text-gray-500">
                Scan QR untuk menghubungkan perangkat
              </p>
              <img src={status.qr} alt="QR WhatsApp" className="mx-auto w-64" />
            </>
          )}

          {/* ⏳ Menunggu QR */}
          {status && !status.isReady && !status.qr && (
            <p className="text-gray-500">Loading...</p>
          )}

          {/* ✅ Sudah terhubung */}
          {status && status.isReady && (
            <div className="wa-connected-card">
              <div className="wa-status-icon">✓</div>

              <h2 className="wa-status-title">WhatsApp Berhasil Terhubung</h2>
              <p className="wa-device-name">
                Perangkat: {status.device?.name || "Unknown Device"}
              </p>
              <p className="wa-status-desc">
                {" "}
                Website dapat digunakan untuk mengirim pesan.
              </p>
              <div className="btn-logout-scanqr-wrapper">
                <button className="btn-logout-scanqr" onClick={handleLogout}>
                  Keluar dari Perangkat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
