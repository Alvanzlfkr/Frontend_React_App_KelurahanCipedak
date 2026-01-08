import { useState, useEffect, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import "./CalendarWidget.css";

export default function CalendarWidget({ selectedDate, onSelectDate }) {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [selectedDay, setSelectedDay] = useState(
    selectedDate ? selectedDate.getDate() : null
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  // Hari dimulai dari Senin
  const daysOfWeek = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu",
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  /* =========================
      CALENDAR DAYS (FIXED)
  ========================== */
  const calendarDays = useMemo(() => {
    const days = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    // 1️⃣ Prev month (awal minggu)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, type: "prev" });
    }

    // 2️⃣ Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, type: "current" });
    }

    // 3️⃣ Next month (isi sisa baris terakhir saja)
    const remaining = days.length % 7;
    if (remaining !== 0) {
      const fill = 7 - remaining;
      for (let i = 1; i <= fill; i++) {
        days.push({ day: i, type: "next" });
      }
    }

    return days;
  }, [month, year]);

  /* =========================
      AUTO SELECTED DAY
  ========================== */
  useEffect(() => {
    if (
      selectedDate &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    ) {
      setSelectedDay(selectedDate.getDate());
    } else {
      setSelectedDay(null);
    }
  }, [selectedDate, month, year]);

  const handleSelectDay = (day) => {
    const newDate = new Date(year, month, day);
    setSelectedDay(day);
    onSelectDate && onSelectDate(newDate);
  };

  /* =========================
        MONTH NAVIGATION
  ========================== */
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  /* =========================
        YEAR DROPDOWN
  ========================== */
  const [yearList, setYearList] = useState([
    year - 2,
    year - 1,
    year,
    year + 1,
    year + 2,
  ]);

  useEffect(() => {
    setYearList([year - 2, year - 1, year, year + 1, year + 2]);
  }, [year]);

  const handleDropdownScroll = (e) => {
    const el = e.target;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
      const last = yearList[yearList.length - 1];
      setYearList([...yearList, last + 1, last + 2, last + 3]);
    }
    if (el.scrollTop <= 5) {
      const first = yearList[0];
      setYearList([first - 3, first - 2, first - 1, ...yearList]);
      el.scrollTop = 40;
    }
  };

  return (
    <div className="calendar-widget-wrapper">
      <div className="calendar-container">
        {/* HEADER */}
        <div className="calendar-header">
          <div
            className="header-select"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span className="header-text">
              {monthNames[month]} {year}
            </span>
            <ChevronDown size={16} />
          </div>
          <div className="nav-buttons">
            <button onClick={prevMonth}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextMonth}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* YEAR DROPDOWN */}
        {showDropdown && (
          <div
            className="header-dropdown"
            ref={dropdownRef}
            onScroll={handleDropdownScroll}
          >
            {yearList.flatMap((y) =>
              monthNames.map((m, i) => (
                <div
                  key={`${m}-${y}`}
                  className="header-dropdown-item"
                  onClick={() => {
                    setCurrentDate(new Date(y, i, 1));
                    setShowDropdown(false);
                  }}
                >
                  {m} {y}
                </div>
              ))
            )}
          </div>
        )}

        {/* DAY HEADERS */}
        <div className="calendar-days-header">
          {daysOfWeek.map((d) => (
            <div key={d} className="day-name">
              {d}
            </div>
          ))}
        </div>

        {/* GRID */}
        <div className="calendar-grid">
          {calendarDays.map((item, idx) => {
            const isSelected =
              item.type === "current" && selectedDay === item.day;
            const isToday =
              item.type === "current" &&
              today.getDate() === item.day &&
              today.getMonth() === month &&
              today.getFullYear() === year;

            return (
              <div
                key={idx}
                className={`
                  calendar-cell
                  ${item.type !== "current" ? "dimmed" : ""}
                  ${isSelected ? "selected" : ""}
                  ${isToday ? "today" : ""}
                `}
                onClick={() =>
                  item.type === "current" && handleSelectDay(item.day)
                }
              >
                {item.day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
