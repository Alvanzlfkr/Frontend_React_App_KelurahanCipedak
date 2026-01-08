// src/mappings/sesiMapping.js

export const DEFAULT_SESI = [
  "Sesi 1 (09:00 - 12:00)",
  "Sesi 2 (13:00 - 16:00)",
  "Sesi 1 & 2 (Full)",
];

// Sesi untuk semua RPTRA
export const RPTRA_SESI = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "13:00 - 15:00",
  "15:00 - 17:00",
];

// Mapping normalisasi untuk data dari backend
export const mapSesiLabel = {
  1: DEFAULT_SESI[0],
  2: DEFAULT_SESI[1],
  "1&2": DEFAULT_SESI[2],
  "Sesi 1": DEFAULT_SESI[0],
  "Sesi 2": DEFAULT_SESI[1],
  "Sesi 1 & 2 (Full)": DEFAULT_SESI[2],
};

// === Mapping ruangan → sesi ===
export const RUANGAN_MAP = {
  "Ruang Rapat 1": DEFAULT_SESI,
  "Ruang Rapat 2": DEFAULT_SESI,
  "Ruang Sidang": DEFAULT_SESI,
  "Halaman Kantor": DEFAULT_SESI,

  // Semua RPTRA pakai sesi RPTRA
  "RPTRA Cendekia": RPTRA_SESI,
  "RPTRA Aselih": RPTRA_SESI,
  "RPTRA Gemilang": RPTRA_SESI,
};

// Function dinamis: pilih sesi berdasarkan ruangan
export const getSesiByRuangan = (ruangan) => {
  if (!ruangan) return DEFAULT_SESI;

  return ruangan.startsWith("RPTRA") ? RPTRA_SESI : DEFAULT_SESI;
};
