import "./Footer.css";
import React, { useState, useRef, useEffect } from "react";
import { Download, Upload, ChevronLeft, ChevronRight } from "lucide-react";

const Footer = ({
  onExportTable,
  onExportMonth,
  onExportAll,
  onUpload,
  handlePrevDate,
  handleNextDate,
  showUpload = false,
}) => {
  const [showExportPopup, setShowExportPopup] = useState(false);
  const exportBtnRef = useRef(null);
  const popupRef = useRef(null);

  const toggleExportPopup = () => setShowExportPopup(!showExportPopup);

  // Klik di luar popup menutupnya
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        exportBtnRef.current &&
        !exportBtnRef.current.contains(event.target)
      ) {
        setShowExportPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="footer">
      <div className="export-buttons">
        <div className="export-popup-wrapper">
          <button
            className="btn-export"
            ref={exportBtnRef}
            onClick={toggleExportPopup}
          >
            <Download size={16} /> Ekspor Excel
          </button>

          {showExportPopup && (
            <div className="export-popup" ref={popupRef}>
              <button onClick={onExportTable}>Tanggal Ini</button>
              <button onClick={onExportMonth}>Bulan Ini</button>
              <button onClick={onExportAll}>Semua</button>
            </div>
          )}
        </div>

        {showUpload && (
          <button className="btn-upload" onClick={onUpload}>
            <Download size={16} /> Unduh PDF
          </button>
        )}
      </div>

      <div className="pagination">
        <button className="pagination-btn" onClick={handlePrevDate}>
          <ChevronLeft size={18} />
        </button>
        <button className="pagination-btn" onClick={handleNextDate}>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Footer;
