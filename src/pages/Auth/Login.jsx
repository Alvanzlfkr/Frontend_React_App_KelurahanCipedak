import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";
import logo from "../../assets/logo-jakarta.png";
import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

const RuleItem = ({ ok, text }) => (
  <li style={{ color: ok ? "green" : "red" }}>
    {ok ? "✔" : "✖"} {text}
  </li>
);

const Login = () => {
  const [identifier, setIdentifier] = useState(""); // email / username
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    symbol: false,
  });

  const navigate = useNavigate();

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

  const handleLogin = async () => {
    if (!identifier || !password) {
      alert("❌ Email / Username dan password wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/admin/auth/login", {
        identifier,
        password,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("admin", JSON.stringify(res.data.admin));
        localStorage.setItem("lastActivity", Date.now());
        navigate("/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.message || "❌ Login gagal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="icon-wrapper">
          <img src={logo} alt="Logo" className="icon-image" />
        </div>
        <h2 className="login-title">Login Admin</h2>
        <input
          type="text"
          placeholder="Email atau Username"
          className="login-input"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        {/* Password wrapper */}
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            className="login-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password && (
            <span
              className="login-toggle-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          )}
        </div>
        <button className="login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>
        <p className="forgot-container">
          <span className="forgot-text">Lupa password?</span>
          <button
            onClick={() => navigate("/forgot-password")}
            className="reset-btn"
          >
            Reset Password
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
