import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import Header from "../../components/layout/Header/Header";
import CalendarWidget from "../../components/modals/CalendarWidget";
import "./KelolaRuangan.css";

const KelolaRuangan = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("kelola-ruangan");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const filterBtnRef = useRef(null);
  const calendarRef = useRef(null);

  const month = selectedDate.getMonth();
  const year = selectedDate.getFullYear();
  const monthName = selectedDate.toLocaleString("id-ID", { month: "long" });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target) &&
        filterBtnRef.current &&
        !filterBtnRef.current.contains(event.target)
      ) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const roomsRes = await fetch("http://localhost:5000/api/ruangan");
        const roomsData = await roomsRes.json();

        const bookingsRes = await fetch("http://localhost:5000/api/peminjaman");
        const bookingsData = await bookingsRes.json();

        setRooms(roomsData || []);
        setBookings(bookingsData || []);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleCalendar = () => setShowCalendar(!showCalendar);
  const formatTanggalLengkapID = (year, month, day) => {
    const date = new Date(year, month, day);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const validBookings = useMemo(() => {
    return bookings.filter((b) => b.status !== "DITOLAK");
  }, [bookings]);

  // --- LOGIKA UTAMA ---
  const processedRuanganData = useMemo(() => {
    if (!rooms.length) return [];

    return rooms.map((room) => {
      const roomBookings = validBookings.filter((b) => {
        const bookingDate = new Date(b.tanggal_pinjam);
        return (
          b.ruangan_id === room.id &&
          bookingDate.getMonth() === month &&
          bookingDate.getFullYear() === year
        );
      });

      const bookingsByDay = {};
      roomBookings.forEach((b) => {
        const day = new Date(b.tanggal_pinjam).getDate();
        if (!bookingsByDay[day]) bookingsByDay[day] = [];
        bookingsByDay[day].push(b);
      });

      const dayStatusMap = {};

      Object.keys(bookingsByDay).forEach((day) => {
        const dailyBookings = bookingsByDay[day];
        let status = "available";

        if (room.tipe === "KANTOR") {
          // --- LOGIKA KANTOR (SESI) ---
          const hasFullSession = dailyBookings.some(
            (b) => b.sesi && b.sesi.includes("Full")
          );
          const hasSesi1 = dailyBookings.some(
            (b) => b.sesi && b.sesi.includes("Sesi 1")
          );
          const hasSesi2 = dailyBookings.some(
            (b) => b.sesi && b.sesi.includes("Sesi 2")
          );

          if (hasFullSession || (hasSesi1 && hasSesi2)) {
            status = "full";
          } else if (dailyBookings.length > 0) {
            status = "partial";
          }
        } else {
          // --- LOGIKA RPTRA (JAM) YANG DIPERBAIKI ---
          // Total Jam Operasional Efektif:
          // 07:30 - 12:00 = 270 menit
          // 13:00 - 16:00 = 180 menit
          // TOTAL = 450 menit (7.5 Jam)

          let totalDurationMinutes = 0;

          dailyBookings.forEach((b) => {
            if (b.jam_mulai && b.jam_selesai) {
              const [h1, m1] = b.jam_mulai.split(":").map(Number);
              const [h2, m2] = b.jam_selesai.split(":").map(Number);

              const startMin = h1 * 60 + m1;
              const endMin = h2 * 60 + m2;

              // Hitung durasi mentah
              let duration = endMin - startMin;

              // [OPSIONAL] Logika Pintar: Jika booking menyeberangi jam 12:00 - 13:00
              // Kita kurangi 60 menit (istirahat) agar perhitungan lebih akurat.
              // Contoh: Booking 07:30 - 16:00 (510 menit) -> dikurangi 60 = 450 menit.
              const breakStart = 12 * 60; // 720
              const breakEnd = 13 * 60; // 780

              // Jika start sebelum istirahat DAN end setelah istirahat
              if (startMin < breakStart && endMin > breakEnd) {
                duration -= 60;
              }

              totalDurationMinutes += duration;
            }
          });

          // Batas Full adalah 450 menit (7.5 Jam)
          // Kita pakai >= 440 untuk toleransi selisih sedikit (misal kurang 5-10 menit tetap dianggap full)
          if (totalDurationMinutes >= 440) {
            status = "full";
          } else {
            status = "partial";
          }
        }

        dayStatusMap[day] = {
          status: status,
          details: dailyBookings,
        };
      });

      return {
        ...room,
        dayStatusMap: dayStatusMap,
      };
    });
  }, [rooms, bookings, month, year]);

  const calendarDays = useMemo(() => {
    const start = new Date(year, month, 1);
    const firstDay = start.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotal = new Date(year, month, 0).getDate();

    let days = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthTotal - i, isCurrentMonth: false });
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }
    while (days.length < 42) {
      days.push({
        day: days.length - (firstDay + totalDays) + 1,
        isCurrentMonth: false,
      });
    }
    return days;
  }, [month, year]);

  const getAvailableTimeSlots = (details = []) => {
    const slots = [
      { label: "07:30 - 12:00", start: 450, end: 720 },
      { label: "13:00 - 16:00", start: 780, end: 960 },
    ];

    details.forEach((b) => {
      if (!b.jam_mulai || !b.jam_selesai) return;

      const [h1, m1] = b.jam_mulai.split(":").map(Number);
      const [h2, m2] = b.jam_selesai.split(":").map(Number);

      const start = h1 * 60 + m1;
      const end = h2 * 60 + m2;

      slots.forEach((slot) => {
        if (slot.disabled) return;

        // 🔥 OVERLAP = SLOT TERPAKAI
        if (start < slot.end && end > slot.start) {
          slot.disabled = true;
        }
      });
    });

    return slots.filter((s) => !s.disabled).map((s) => s.label);
  };

  // --- HANDLE DAY CLICK ---
  const handleDayClick = (ruangan, day) => {
    const statusData = ruangan.dayStatusMap[day];
    const status = statusData?.status || "available";
    const details = statusData?.details || [];

    // ===== HEADER (SAMA SEPERTI DI ATAS) =====
    let message = `📅 ${ruangan.nama}\n`;
    message += `${formatTanggalLengkapID(year, month, day)}\n`;
    message += `Status: ${status.toUpperCase()}\n\n`;

    // ===== TERISI OLEH =====
    if (details.length === 0) {
      message += "✅ Ruangan masih KOSONG.\n\n";
    } else {
      message += "📋 Terisi oleh:\n";

      const sortedDetails = [...details].sort((a, b) => {
        if (a.jam_mulai && b.jam_mulai)
          return a.jam_mulai.localeCompare(b.jam_mulai);
        if (a.sesi && b.sesi) return a.sesi.localeCompare(b.sesi);
        return 0;
      });

      sortedDetails.forEach((b, i) => {
        const waktu = b.sesi ? b.sesi : `${b.jam_mulai} - ${b.jam_selesai}`;
        message += `${i + 1}. ${b.nama_peminjam} (${waktu})\n`;
      });

      message += "\n";
    }

    // ===== INFO KETERSEDIAAN =====
    message += "💡 Info Ketersediaan:\n";

    if (status === "full") {
      message += "❌ Ruangan sudah PENUH.";
    } else if (ruangan.tipe === "KANTOR") {
      const hasSesi1 = details.some((b) => b.sesi?.includes("Sesi 1"));
      const hasSesi2 = details.some((b) => b.sesi?.includes("Sesi 2"));

      if (!hasSesi1) message += "✅ Sesi 1 (07:30 - 12:00) tersedia\n";
      if (!hasSesi2) message += "✅ Sesi 2 (13:00 - 16:00) tersedia\n";
    } else {
      const freeSlots = getAvailableTimeSlots(details);

      if (freeSlots.length === 0) {
        message += "❌ Tidak ada jam kosong.";
      } else {
        freeSlots.forEach((slot, i) => {
          message += `🟢 ${i + 1}. ${slot}\n`;
        });
      }
    }

    alert(message);
  };

  const getDayClass = (ruangan, day, isCurrentMonth) => {
    if (!isCurrentMonth) return "other-month";
    const statusData = ruangan.dayStatusMap[day];
    if (statusData) return statusData.status;
    return "available";
  };

  return (
    <div className="layout-container">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="main-content">
        <Header />

        <div className="kelola-ruangan-top">
          <h1 className="kelola-ruangan-title">Ruangan Tersedia</h1>
          <div className="kelola-ruangan-filter">
            <button
              className="filter-btn"
              ref={filterBtnRef}
              onClick={toggleCalendar}
            >
              <span className="filter-icon">
                <span></span>
                <span></span>
                <span></span>
              </span>
              {monthName} {year}
            </button>
            {showCalendar && (
              <div ref={calendarRef} className="calendar-popup-wrapper">
                <CalendarWidget
                  selectedDate={selectedDate}
                  onSelectDate={(date) => {
                    setSelectedDate(new Date(date));
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="ruangan-grid">
          {loading ? (
            <p>Loading rooms...</p>
          ) : (
            processedRuanganData.map((ruangan) => (
              <div key={ruangan.id} className="ruangan-card">
                <div className="ruangan-card-header">
                  <h3 className="ruangan-name">{ruangan.nama}</h3>
                  <div className="ruangan-legend">
                    <div className="legend-item">
                      <div className="legend-dot available"></div>
                      <span>Kosong</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot partial"></div>
                      <span>Terisi Sebagian</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot full"></div>
                      <span>Penuh</span>
                    </div>
                  </div>
                </div>

                <div className="ruangan-calendar">
                  <div className="calendar-week">
                    {[
                      "Minggu",
                      "Senin",
                      "Selasa",
                      "Rabu",
                      "Kamis",
                      "Jumat",
                      "Sabtu",
                    ].map((d, i) => (
                      <div key={i} className="calendar-header-cell">
                        {d}
                      </div>
                    ))}
                  </div>

                  {[0, 1, 2, 3, 4, 5].map((week) => (
                    <div key={week} className="calendar-week">
                      {calendarDays
                        .slice(week * 7, week * 7 + 7)
                        .map((d, i) => (
                          <div
                            key={i}
                            className={`calendar-cell ${getDayClass(
                              ruangan,
                              d.day,
                              d.isCurrentMonth
                            )}`}
                            onClick={() =>
                              d.isCurrentMonth && handleDayClick(ruangan, d.day)
                            }
                          >
                            <span className="calendar-number">{d.day}</span>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default KelolaRuangan;
