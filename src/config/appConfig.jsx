export const APP_MODE = import.meta.env.VITE_APP_MODE?.toLowerCase();

if (!APP_MODE) {
  throw new Error("❌ APP_MODE tidak terdefinisi. Build tidak valid.");
}
/* ===============================
   MODE FLAGS
================================ */
export const IS_KELURAHAN = APP_MODE === "kelurahan";
export const IS_RPTRA_CIPEDAK = APP_MODE === "rptra_cipedak";
export const IS_RPTRA_CENDEKIA = APP_MODE === "rptra_cendekia";
export const IS_RPTRA_CINTA_ASELIH = APP_MODE === "rptra_cinta_aselih";

/* ===============================
   MODE → API PARAMS
================================ */
export function getModeParams() {
  if (IS_KELURAHAN) return { mode: "kelurahan" };
  if (IS_RPTRA_CIPEDAK) return { mode: "rptra", kode: "CIPEDAK" };
  if (IS_RPTRA_CENDEKIA) return { mode: "rptra", kode: "CENDEKIA" };
  if (IS_RPTRA_CINTA_ASELIH) return { mode: "rptra", kode: "ASELIH" };
  return {};
}

console.log("APP_MODE:", APP_MODE);
