import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import DataTamu from "./pages/Tamu/DataTamu";
import TambahDataTamu from "./pages/Tamu/ScreenTambahDataTamu";
import EditDataTamu from "./pages/Tamu/ScreenEditDataTamu";

import PeminjamanRuangan from "./pages/Ruangan/PeminjamanRuangan";
import TambahDataPeminjam from "./components/Ruangan/TambahDataPeminjam";
import EditDataPeminjam from "./components/Ruangan/EditDataPeminjam";
import KelolaRuangan from "./pages/Ruangan/KelolaRuangan";
// import KelolaPenanganan from "./pages/Penanganan/KelolaPenanganan";
import TambahPenanganan from "./pages/Penanganan/TambahPenanganan";
import EditPenanganan from "./pages/Penanganan/EditPenanganan";
import ProtectedFlowRoute from "./routes/ProtectedFlowRoute";

import ForgotPassword from "./pages/Auth/ForgotPassword";
import VerifyOTP from "./pages/Auth/VerifyOTP";
import ResetPassword from "./pages/Auth/ResetPassword";

import "./App.css";

function App() {
  const [adminExists, setAdminExists] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const MAX_IDLE_TIME = 30 * 60 * 1000;

  // 🔥 INIT AUTH (ADMIN + DEV SESSION)
  useEffect(() => {
    const initAuth = async () => {
      try {
        // cek admin
        const adminRes = await axios.get(
          "http://localhost:5000/api/admin/check"
        );
        setAdminExists(adminRes.data.exists);

        // 🔴 DEV AUTO LOGOUT
        if (import.meta.env.DEV) {
          const res = await axios.get("http://localhost:5000/api/dev-session");

          const serverDevId = res.data.devSessionId;
          const localDevId = localStorage.getItem("devSessionId");

          if (localDevId && localDevId !== serverDevId) {
            localStorage.clear();
          }

          localStorage.setItem("devSessionId", serverDevId);
        }
      } catch (err) {
        setAdminExists(false);
        localStorage.clear();
      } finally {
        setAuthReady(true);
      }
    };

    initAuth();
  }, []);

  // 🕒 IDLE TIMEOUT
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      const lastActivity = localStorage.getItem("lastActivity");

      if (!token || !lastActivity) return;

      if (Date.now() - Number(lastActivity) > MAX_IDLE_TIME) {
        localStorage.clear();
        window.location.href = "/login";
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // 🖱️ ACTIVITY TRACKER
  useEffect(() => {
    const updateActivity = () => {
      localStorage.setItem("lastActivity", Date.now());
    };

    ["click", "keydown", "mousemove"].forEach((e) =>
      window.addEventListener(e, updateActivity)
    );

    return () => {
      ["click", "keydown", "mousemove"].forEach((e) =>
        window.removeEventListener(e, updateActivity)
      );
    };
  }, []);

  // ⛔ TAHAN RENDER
  if (!authReady || adminExists === null) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* AUTO REDIRECT */}
        <Route
          path="/"
          element={
            adminExists ? (
              <Navigate to="/login" replace />
            ) : (
              <Navigate to="/register" replace />
            )
          }
        />

        {/* REGISTER */}
        {!adminExists && <Route path="/register" element={<Register />} />}

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* RESET PASSWORD FLOW */}
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <ProtectedFlowRoute>
              <VerifyOTP />
            </ProtectedFlowRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        {/* HALAMAN UTAMA */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-tamu"
          element={
            <ProtectedRoute>
              <DataTamu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-tamu/tambah"
          element={
            <ProtectedRoute>
              <TambahDataTamu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-tamu/edit/:id"
          element={
            <ProtectedRoute>
              <EditDataTamu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/peminjaman-ruangan"
          element={
            <ProtectedRoute>
              <PeminjamanRuangan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/peminjaman-ruangan/tambah"
          element={
            <ProtectedRoute>
              <TambahDataPeminjam />
            </ProtectedRoute>
          }
        />

        <Route
          path="/peminjaman-ruangan/edit/:id"
          element={
            <ProtectedRoute>
              <EditDataPeminjam />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/data-peminjam"
          element={
            <ProtectedRoute>
              <PeminjamanRuangan />
            </ProtectedRoute>
          }
        /> */}

        <Route
          path="/kelola-ruangan"
          element={
            <ProtectedRoute>
              <KelolaRuangan />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/kelola-penanganan"
          element={
            <ProtectedRoute>
              <KelolaPenanganan />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/kelola-penanganan/tambah"
          element={
            <ProtectedRoute>
              <TambahPenanganan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kelola-penanganan/edit/:id"
          element={
            <ProtectedRoute>
              <EditPenanganan />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
