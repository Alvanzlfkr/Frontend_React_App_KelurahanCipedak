// src/utils/fetch.js
import { getModeParams } from "../../config/appConfig";

// 🔗 API BASE URL dari ENV
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ======================================================
   FETCH PEMINJAMAN (BOOKINGS)
====================================================== */
export const fetchBookings = async () => {
  try {
    const res = await fetch(`${API_URL}/api/peminjaman`);
    if (!res.ok) throw new Error("Failed to fetch bookings");

    const data = await res.json();
    const { mode, kode } = getModeParams();

    // 🏢 MODE KELURAHAN → hanya ruangan kantor
    if (mode === "kelurahan") {
      return data.filter((d) => d.ruangan_tipe === "KANTOR");
    }

    // 🌳 MODE RPTRA → hanya RPTRA sesuai kode
    if (mode === "rptra" && kode) {
      return data.filter((d) => d.ruangan_tipe === "RPTRA" && d.kode === kode);
    }

    // fallback (aman)
    return data;
  } catch (err) {
    console.error("❌ fetchBookings error:", err);
    return [];
  }
};

/* ======================================================
   FETCH RUANGAN
====================================================== */
export const fetchRooms = async () => {
  try {
    // mode & kode dikirim sebagai query param
    const params = new URLSearchParams(getModeParams()).toString();

    const res = await fetch(`${API_URL}/api/ruangan?${params}`);

    if (!res.ok) throw new Error("Failed to fetch rooms");

    const data = await res.json();
    return data || [];
  } catch (err) {
    console.error("❌ fetchRooms error:", err);
    return [];
  }
};
