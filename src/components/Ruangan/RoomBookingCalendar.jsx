import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./RoomBookingCalendar.css";

const RoomBookingCalendar = ({
  rooms = [],
  bookings = [],
  month,
  year,
  autoSlide = true,
  slideInterval = 4000,
}) => {
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);
  const slideRef = useRef(null);

  const activeRoom = rooms[activeRoomIndex];

  /* ================= AUTO SLIDE ================= */
  useEffect(() => {
    if (!autoSlide || rooms.length <= 1) return;

    slideRef.current = setInterval(() => {
      setActiveRoomIndex((i) => (i + 1) % rooms.length);
    }, slideInterval);

    return () => clearInterval(slideRef.current);
  }, [rooms, autoSlide, slideInterval]);

  const stopAutoSlide = () => {
    if (slideRef.current) clearInterval(slideRef.current);
  };

  /* ================= CALENDAR DAYS ================= */
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
    const remaining = days.length % 7;
    if (remaining !== 0) {
      const fill = 7 - remaining;
      for (let i = 1; i <= fill; i++) {
        days.push({
          day: i,
          isCurrentMonth: false,
        });
      }
    }
    return days;
  }, [month, year]);

  const formatTanggalLengkapID = (year, month, day) => {
    const date = new Date(year, month, day);

    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  /* ================= STATUS MAP ================= */
  const dayStatusMap = useMemo(() => {
    if (!activeRoom) return {};

    const map = {};

    bookings
      .filter((b) => {
        const d = new Date(b.tanggal_pinjam);
        return (
          b.ruangan_id === activeRoom.id &&
          d.getMonth() === month &&
          d.getFullYear() === year
        );
      })
      .forEach((b) => {
        const day = new Date(b.tanggal_pinjam).getDate();
        if (!map[day]) map[day] = [];
        map[day].push(b);
      });

    const hasFreeSlotRPTRA = (details = []) => {
      const slots = [
        [450, 720], // 07:30–12:00
        [780, 960], // 13:00–16:00
      ];

      details.forEach((b) => {
        if (!b.jam_mulai || !b.jam_selesai) return;

        const [h1, m1] = b.jam_mulai.split(":").map(Number);
        const [h2, m2] = b.jam_selesai.split(":").map(Number);

        const start = h1 * 60 + m1;
        const end = h2 * 60 + m2;

        slots.forEach((slot, i) => {
          if (!slot) return;
          const [s, e] = slot;
          if (start <= s && end >= e) slots[i] = null;
        });
      });

      return slots.some(Boolean);
    };

    const result = {};

    Object.keys(map).forEach((day) => {
      const daily = map[day];
      let status = "available";

      // ===== KANTOR =====
      if (activeRoom.tipe === "KANTOR") {
        const full = daily.some((b) => b.sesi?.includes("Full"));
        const s1 = daily.some((b) => b.sesi?.includes("Sesi 1"));
        const s2 = daily.some((b) => b.sesi?.includes("Sesi 2"));

        if (full || (s1 && s2)) status = "full";
        else status = "partial";
      }

      // ===== RPTRA =====
      else {
        const hasFree = hasFreeSlotRPTRA(daily);
        status = hasFree ? "partial" : "full";
      }

      result[day] = status;
    });

    return result;
  }, [activeRoom, bookings, month, year]);

  if (!activeRoom) return null;

  const dayBookingDetails = useMemo(() => {
    if (!activeRoom) return {};

    const map = {};

    bookings
      .filter((b) => {
        const d = new Date(b.tanggal_pinjam);
        return (
          b.ruangan_id === activeRoom.id &&
          d.getMonth() === month &&
          d.getFullYear() === year
        );
      })
      .forEach((b) => {
        const day = new Date(b.tanggal_pinjam).getDate();
        if (!map[day]) map[day] = [];
        map[day].push(b);
      });

    return map;
  }, [activeRoom, bookings, month, year]);

  const getAvailableTimeSlots = (details = []) => {
    const START = 7 * 60 + 30; // 07:30
    const END = 16 * 60; // 16:00
    const BREAK_START = 12 * 60;
    const BREAK_END = 13 * 60;

    let booked = [];

    details.forEach((b) => {
      if (b.jam_mulai && b.jam_selesai) {
        const [h1, m1] = b.jam_mulai.split(":").map(Number);
        const [h2, m2] = b.jam_selesai.split(":").map(Number);
        booked.push([h1 * 60 + m1, h2 * 60 + m2]);
      }
    });

    booked.sort((a, b) => a[0] - b[0]);

    let free = [];
    let cursor = START;

    booked.forEach(([s, e]) => {
      if (cursor < s) free.push([cursor, s]);
      cursor = Math.max(cursor, e);
    });

    if (cursor < END) free.push([cursor, END]);

    // hapus jam istirahat
    free = free
      .map(([s, e]) => {
        if (s < BREAK_START && e > BREAK_END)
          return [
            [s, BREAK_START],
            [BREAK_END, e],
          ];
        if (s < BREAK_END && e > BREAK_START) return null;
        return [[s, e]];
      })
      .flat()
      .filter(Boolean);

    return free.map(
      ([s, e]) =>
        `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
          s % 60
        ).padStart(2, "0")} - ${String(Math.floor(e / 60)).padStart(
          2,
          "0"
        )}:${String(e % 60).padStart(2, "0")}`
    );
  };

  const getAvailableRPTRASlots = (details = []) => {
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

  /* ================= UI ================= */
  return (
    <div className="room-calendar">
      {/* HEADER */}
      <div className="room-calendar-header-wrapper">
        <h3 className="room-calendar-title">{activeRoom.nama}</h3>

        <div className="room-calendar-nav">
          <button
            onClick={() => {
              stopAutoSlide();
              setActiveRoomIndex((i) => (i - 1 + rooms.length) % rooms.length);
            }}
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={() => {
              stopAutoSlide();
              setActiveRoomIndex((i) => (i + 1) % rooms.length);
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      {/* LEGEND */}
      <div className="room-calendar-legend">
        <span>
          <i className="dot available"></i> Kosong
        </span>
        <span>
          <i className="dot partial"></i> Terisi
        </span>
        <span>
          <i className="dot full"></i> Penuh
        </span>
      </div>
      {/* WEEKDAYS */}
      <div className="room-calendar-weekdays">
        {["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map(
          (d) => (
            <div key={d} className="room-weekday-name">
              {d}
            </div>
          )
        )}
      </div>
      {/* GRID */}
      <div className="room-booking-grid">
        {calendarDays.map((d, i) => {
          const status = d.isCurrentMonth
            ? dayStatusMap[d.day] || "available"
            : "other-month";

          return (
            <div
              key={i}
              className={`booking-cell ${status}`}
              onClick={() => {
                if (!d.isCurrentMonth) return;

                const details = dayBookingDetails[d.day] || [];
                const status = dayStatusMap[d.day] || "available";

                // ===== HEADER =====
                let message = `📅 ${activeRoom.nama}\n`;
                message += `${formatTanggalLengkapID(year, month, d.day)}\n`;
                message += `Status: ${status.toUpperCase()}\n\n`;

                // ===== TERISI OLEH =====
                if (details.length === 0) {
                  message += "✅ Ruangan masih KOSONG.\n\n";
                } else {
                  message += "📋 Terisi oleh:\n";

                  details
                    .sort((a, b) =>
                      a.jam_mulai && b.jam_mulai
                        ? a.jam_mulai.localeCompare(b.jam_mulai)
                        : 0
                    )
                    .forEach((b, i) => {
                      const waktu = b.sesi
                        ? b.sesi
                        : `${b.jam_mulai} - ${b.jam_selesai}`;
                      message += `${i + 1}. ${b.nama_peminjam} (${waktu})\n`;
                    });

                  message += "\n";
                }

                // ===== INFO KETERSEDIAAN =====
                message += "💡 Info Ketersediaan:\n";

                if (status === "full") {
                  message += "❌ Ruangan sudah PENUH.";
                } else if (activeRoom.tipe === "KANTOR") {
                  const hasS1 = details.some((b) => b.sesi?.includes("Sesi 1"));
                  const hasS2 = details.some((b) => b.sesi?.includes("Sesi 2"));

                  if (!hasS1) message += "✅ Sesi 1 (07:30 - 12:00) tersedia\n";
                  if (!hasS2) message += "✅ Sesi 2 (13:00 - 16:00) tersedia\n";
                } else {
                  const freeSlots = getAvailableRPTRASlots(details);

                  if (freeSlots.length === 0) {
                    message += "❌ Tidak ada jam kosong.";
                  } else {
                    freeSlots.forEach((slot, i) => {
                      message += `🟢 ${i + 1}. ${slot}\n`;
                    });
                  }
                }

                alert(message);
              }}
            >
              {d.day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoomBookingCalendar;
