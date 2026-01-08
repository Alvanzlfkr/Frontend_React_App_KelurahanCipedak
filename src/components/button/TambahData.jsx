import React from "react";
import "./TambahData.css";

const TambahDataButton = ({ onClick, disabled = false, title }) => {
  const handleClick = () => {
    if (disabled) return; // 🔒 pengaman utama
    onClick();
  };

  return (
    <div className="tambah-data-wrapper">
      <button
        className={`btn-tambah-data ${disabled ? "btn-disabled" : ""}`}
        onClick={handleClick}
        disabled={disabled}
        title={title}
      >
        Tambah Data
      </button>
    </div>
  );
};

export default TambahDataButton;
