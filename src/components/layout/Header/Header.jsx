import { useState, useEffect } from "react";
import {
  Menu,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Bot,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BantuanAIModal from "../../modals/BantuanAIModal.jsx";
import { useLocation } from "react-router-dom";
import { menuItems } from "../../../constants/menuItems.jsx";
import {
  IS_KELURAHAN,
  IS_RPTRA_CIPEDAK,
  IS_RPTRA_CENDEKIA,
  IS_RPTRA_CINTA_ASELIH,
} from "../../../config/appConfig";

import "./header.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [rooms, setRooms] = useState([]);
  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    const storedAdmin = sessionStorage.getItem("admin");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/login");
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/ruangan/tersedia");
      const json = await res.json();
      setRooms(json || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <header className="header-container">
        {/* KIRI */}
        <div className="header-left">
          <button
            className="header-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu />
          </button>

          {/* BOT AI */}
          <button
            className="header-bantuan-bantuan"
            onClick={() => {
              setShowAIModal(true);
              fetchRooms();
            }}
            title="Bantuan AI"
          >
            <div className="bot-icon-wrapper">
              <Bot size={22} className="bot-icon" />
              <span className="bot-pulse"></span>
            </div>
          </button>
        </div>

        {/* KANAN */}
        <div className="header-user">
          {/* <button className="header-icon-btn">
            <Bell />
            <span className="header-notif-dot"></span>
          </button> */}

          <div
            className="header-user-info clickable"
            onClick={() => setUserMenu(!userMenu)}
          >
            <p className="header-user-name">{admin?.username || "Admin"}</p>
          </div>

          <div
            className="header-user-avatar"
            onClick={() => setUserMenu(!userMenu)}
          >
            <UserIcon />
            <ChevronDown size={10} />
          </div>

          {userMenu && (
            <div className="header-dropdown">
              <button onClick={handleLogout} className="dropdown-item">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      {menuOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={() => setMenuOpen(false)}
        >
          <div className="mobile-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-sidebar-title">Menu</div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === `/${item.id}` ||
                location.pathname.startsWith(`/${item.id}/`);

              return (
                <div
                  key={item.id}
                  className={`mobile-sidebar-item ${isActive ? "active" : ""}`}
                  onClick={() => {
                    navigate(`/${item.id}`);
                    setMenuOpen(false);
                  }}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ✅ MODAL DI LUAR HEADER */}
      <BantuanAIModal
        open={showAIModal}
        onClose={() => setShowAIModal(false)}
        rooms={rooms}
      />
    </>
  );
};

export default Header;
