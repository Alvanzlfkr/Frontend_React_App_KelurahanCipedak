import {
  LayoutDashboard,
  Users,
  FileText,
  Building2,
  UserCog,
  QrCode,
} from "lucide-react";

export const menuItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "data-tamu", icon: Users, label: "Data Tamu" },
  { id: "peminjaman-ruangan", icon: FileText, label: "Peminjaman Ruangan" },
  { id: "kelola-ruangan", icon: Building2, label: "Kelola Ruangan" },
  { id: "kelola-penanganan", icon: UserCog, label: "Kelola Penanganan" },
  { id: "scan-qr-code-wa", icon: QrCode, label: "Scan QR Code WhatsApp" },
];
