// src/utils/fetch.js
export const fetchBookings = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/peminjaman");
    if (!res.ok) throw new Error("Failed to fetch bookings");
    const data = await res.json();
    return data || [];
  } catch (err) {
    console.error("fetchBookings error:", err);
    return [];
  }
};

export const fetchRooms = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/ruangan");
    if (!res.ok) throw new Error("Failed to fetch rooms");
    const data = await res.json();
    return data || [];
  } catch (err) {
    console.error("fetchRooms error:", err);
    return [];
  }
};
