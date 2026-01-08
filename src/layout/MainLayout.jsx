import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import { useState } from "react";

const MainLayout = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  return (
    <div className="layout-wrapper">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="main-content">
        <Header />

        {/* Di sini halaman akan berubah */}
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
