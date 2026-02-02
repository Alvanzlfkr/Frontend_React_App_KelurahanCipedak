import { useEffect, useState, useMemo } from "react";

import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import RoomBookingCalendar from "../../components/Ruangan/RoomBookingCalendar";
import VisitorChart from "../../components/charts/VisitorChart";
import DashboardCalendar from "./DashboardCalendar";

import "./Dashboard.css";

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  // 🔑 SOURCE OF TRUTH TANGGAL
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [chartData, setChartData] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const calendarBookings = useMemo(() => {
    return bookings.filter((b) => b.status !== "DITOLAK");
  }, [bookings]);

  /* ================= FETCH DASHBOARD CHART (MINGGUAN) ================= */
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const [tamuRes, pinjamRes] = await Promise.all([
          fetch("http://localhost:5000/api/tamu"),
          fetch("http://localhost:5000/api/peminjaman"),
        ]);

        const tamuData = await tamuRes.json();
        const pinjamData = await pinjamRes.json();

        const days = [
          "Minggu",
          "Senin",
          "Selasa",
          "Rabu",
          "Kamis",
          "Jumat",
          "Sabtu",
        ];

        // 👉 hitung minggu berdasarkan tanggal yang diklik
        const baseDate = new Date(selectedDate);
        const sunday = new Date(baseDate);
        sunday.setDate(baseDate.getDate() - baseDate.getDay());

        const result = days.map((day, index) => {
          const date = new Date(sunday);
          date.setDate(sunday.getDate() + index);
          const dateStr = date.toDateString();

          return {
            label: day,
            tamu: tamuData.filter(
              (t) => new Date(t.tanggal).toDateString() === dateStr,
            ).length,
            pinjam: pinjamData.filter(
              (p) => new Date(p.tanggal).toDateString() === dateStr,
            ).length,
          };
        });

        setChartData(result);
      } catch (err) {
        console.error("Chart error:", err);
      }
    };

    fetchChartData();
  }, [selectedDate]); // 🔥 berubah saat tanggal diklik

  /* ================= FETCH ROOM & BOOKING ================= */
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const [roomRes, bookingRes] = await Promise.all([
          fetch("http://localhost:5000/api/ruangan"),
          fetch("http://localhost:5000/api/peminjaman"),
        ]);

        setRooms(await roomRes.json());
        setBookings(await bookingRes.json());
      } catch (err) {
        console.error("Room calendar error:", err);
      }
    };

    fetchRoomData();
  }, []);

  return (
    <div className="layout-wrapper">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="main-content">
        <Header />

        <div className="dashboard-container">
          {/* TOP ROW */}
          <div className="dashboard-top">
            <DashboardCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            {rooms.length > 0 && (
              <RoomBookingCalendar
                rooms={rooms}
                bookings={calendarBookings}
                month={selectedDate.getMonth()}
                year={selectedDate.getFullYear()}
              />
            )}
          </div>

          {/* BOTTOM */}
          <VisitorChart chartData={chartData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
