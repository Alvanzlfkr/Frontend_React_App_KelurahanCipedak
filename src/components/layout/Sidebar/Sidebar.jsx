import "./sidebar.css";
import logoJakarta from "../../../assets/logo-jakarta.png";
import { useNavigate, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  FileText,
  Building2,
  UserCog,
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "data-tamu", icon: Users, label: "Data Tamu" },
    { id: "peminjaman-ruangan", icon: FileText, label: "Peminjaman Ruangan" },
    { id: "kelola-ruangan", icon: Building2, label: "Kelola Ruangan" },
    // { id: "kelola-penanganan", icon: UserCog, label: "Kelola Penanganan" },
  ];

  return (
    <aside className="sidebar-container">
      <div className="sidebar-header">
        <img src={logoJakarta} alt="Logo Jakarta" className="sidebar-logo" />
        <div className="sidebar-title">
          <h1>KELURAHAN</h1>
          <h1>CIPEDAK</h1>
        </div>
      </div>

      <div className="sidebar-menu-wrapper">
        <div className="sidebar-menu-title">Menu</div>

        <div className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;

            // ✅ AKTIF UNTUK SEMUA SUB ROUTE
            const isActive =
              location.pathname === `/${item.id}` ||
              location.pathname.startsWith(`/${item.id}/`);

            return (
              <div
                key={item.id}
                className={`sidebar-item ${isActive ? "active" : ""}`}
                onClick={() => navigate(`/${item.id}`)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
