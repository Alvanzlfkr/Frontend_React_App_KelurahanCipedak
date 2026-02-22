export function useBookingSesi({
  existingBookings = [],
  selectedDate,
  currentSesi = null, // 🔥 dipakai di Edit
}) {
  const availableSesi = [
    "Sesi 1 (07:30 - 12:00)",
    "Sesi 2 (13:00 - 16:00)",
    "Sesi 1 & 2 (Full)",
  ];

  const disabled = {
    sesi1: false,
    sesi2: false,
    full: false,
  };

  const filtered = existingBookings.filter(
    (item) => item.tanggal === selectedDate,
  );

  filtered.forEach((item) => {
    if (item.sesi === "Sesi 1 (07:30 - 12:00)") disabled.sesi1 = true;
    if (item.sesi === "Sesi 2 (13:00 - 16:00)") disabled.sesi2 = true;
    if (item.sesi === "Sesi 1 & 2 (Full)") {
      disabled.sesi1 = true;
      disabled.sesi2 = true;
      disabled.full = true;
    }
  });

  // FULL mati kalau salah satu sesi sudah dipakai
  if (disabled.sesi1 || disabled.sesi2) {
    disabled.full = true;
  }

  const disabledSesi = [];

  if (disabled.sesi1) disabledSesi.push("Sesi 1 (07:30 - 12:00)");
  if (disabled.sesi2) disabledSesi.push("Sesi 2 (13:00 - 16:00)");
  if (disabled.full) disabledSesi.push("Sesi 1 & 2 (Full)");

  // 🔥 Fitur spesial Edit
  const finalDisabled = disabledSesi.filter((s) => s !== currentSesi);

  return {
    availableSesi,
    disabledSesi: finalDisabled,
  };
}
export default useBookingSesi;
