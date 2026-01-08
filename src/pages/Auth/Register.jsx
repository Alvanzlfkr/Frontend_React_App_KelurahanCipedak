import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Register.css";
import logo from "../../assets/logo-jakarta.png";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* ================= PASSWORD RULES ================= */
  const passwordRules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[\W_]/.test(password),
  };

  const strengthScore = Object.values(passwordRules).filter(Boolean).length;
  const strengthLabel =
    strengthScore <= 2 ? "Weak" : strengthScore <= 4 ? "Medium" : "Strong";
  const strengthClass =
    strengthScore <= 2 ? "weak" : strengthScore <= 4 ? "medium" : "strong";

  /* ================= REDIRECT GUARD ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
      return;
    }

    api.get("/admin/auth/check").then((res) => {
      if (res.data.exists) {
        navigate("/login");
      }
    });
  }, []);

  /* ================= REGISTER ================= */
  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      alert("❌ Semua field wajib diisi");
      return;
    }

    if (password !== confirmPassword) {
      alert("❌ Password dan konfirmasi tidak sama");
      return;
    }

    if (strengthScore < 5) {
      alert("❌ Password belum memenuhi semua syarat");
      return;
    }

    try {
      const res = await api.post("/admin/auth/register", {
        username,
        email,
        password,
      });

      if (res.data.success) {
        alert("✅ Registrasi berhasil!");
        navigate("/login");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Registrasi gagal");
    }
  };

  const RuleItem = ({ ok, text }) => (
    <li className={ok ? "ok" : "bad"}>
      {ok ? <CheckCircle size={14} /> : <XCircle size={14} />}
      {text}
    </li>
  );

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="icon-wrapper">
          <img src={logo} alt="Logo" className="icon-image" />
        </div>

        <h2 className="register-title">Registrasi Admin</h2>

        <input
          className="register-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          className="register-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            className="register-input"
            placeholder="Password"
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

        <div className="password-wrapper">
          <input
            type={showConfirmPassword ? "text" : "password"}
            className="register-input"
            placeholder="Confirm Password"
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

        {password && (
          <>
            <div className="strength-bar fade-in">
              <div className={`strength-fill ${strengthClass}`} />
            </div>
            <p className={`strength-text ${strengthClass}`}>{strengthLabel}</p>
          </>
        )}

        <div className="password-hint">
          <ul>
            <RuleItem ok={passwordRules.length} text="Minimal 8 karakter" />
            <RuleItem ok={passwordRules.upper} text="Huruf besar (A-Z)" />
            <RuleItem ok={passwordRules.lower} text="Huruf kecil (a-z)" />
            <RuleItem ok={passwordRules.number} text="Angka (0-9)" />
            <RuleItem ok={passwordRules.symbol} text="Simbol (!@#$%)" />
          </ul>
        </div>

        <button
          className="register-btn"
          disabled={strengthScore < 5}
          onClick={handleRegister}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default Register;
