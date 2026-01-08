import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./ResetPassword.css";

const RuleItem = ({ ok, text }) => (
  <li style={{ color: ok ? "green" : "red" }}>
    {ok ? "✔" : "✖"} {text}
  </li>
);

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    symbol: false,
  });

  const navigate = useNavigate();
  const location = useLocation();

  // ambil email dari sessionStorage atau state
  const email = sessionStorage.getItem("resetEmail") || location.state?.email;

  useEffect(() => {
    if (!email) navigate("/forgot-password"); // blok direct access
  }, [email, navigate]);

  // validasi password rules realtime
  useEffect(() => {
    const length = password.length >= 8;
    const upper = /[A-Z]/.test(password);
    const lower = /[a-z]/.test(password);
    const number = /\d/.test(password);
    const symbol = /[\W_]/.test(password);
    setPasswordRules({ length, upper, lower, number, symbol });
  }, [password]);

  // hitung strength bar
  const strengthCount = Object.values(passwordRules).filter(Boolean).length;
  const strengthClass =
    strengthCount <= 2 ? "weak" : strengthCount <= 4 ? "medium" : "strong";
  const strengthLabel =
    strengthCount <= 2 ? "Lemah" : strengthCount <= 4 ? "Sedang" : "Kuat";

  const handleResetPassword = async () => {
    if (!password || !confirmPassword)
      return alert("Password dan konfirmasi wajib diisi");

    if (password !== confirmPassword)
      return alert("Password dan konfirmasi tidak sama");

    const allOk = Object.values(passwordRules).every(Boolean);
    if (!allOk) return alert("Password belum memenuhi semua aturan");

    try {
      setLoading(true);
      await api.post("/admin/password/reset-password", {
        email,
        newPassword: password,
      });

      alert("Password berhasil direset!");
      // hapus email dari sessionStorage agar flow bersih
      sessionStorage.removeItem("resetEmail");
      navigate("/login", { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Gagal reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Password Baru</h2>

        {/* Password input */}
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            className="login-input"
            placeholder="Password Baru"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password && (
            <span
              className="toggle-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          )}
        </div>

        {/* Confirm Password input */}
        <div className="password-wrapper">
          <input
            type={showConfirmPassword ? "text" : "password"}
            className="login-input"
            placeholder="Konfirmasi Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {confirmPassword && (
            <span
              className="toggle-eye"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          )}
        </div>

        {/* Strength bar */}
        {password && (
          <>
            <div className="strength-bar fade-in">
              <div className={`strength-fill ${strengthClass}`} />
            </div>
            <p className={`strength-text ${strengthClass}`}>{strengthLabel}</p>
          </>
        )}
        {/* Password rules */}
        <div className="password-hint-reset">
          <ul>
            <RuleItem ok={passwordRules.length} text="Minimal 8 karakter" />
            <RuleItem ok={passwordRules.upper} text="Huruf besar (A-Z)" />
            <RuleItem ok={passwordRules.lower} text="Huruf kecil (a-z)" />
            <RuleItem ok={passwordRules.number} text="Angka (0-9)" />
            <RuleItem ok={passwordRules.symbol} text="Simbol (!@#$%)" />
          </ul>
        </div>

        <button
          className="login-btn"
          onClick={handleResetPassword}
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Password"}
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
