import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    if (!email) return alert("Email wajib diisi");

    try {
      setLoading(true);
      await api.post("/admin/password/send-otp", { email });

      // simpan email sementara di sessionStorage
      sessionStorage.setItem("resetEmail", email);
      alert("OTP dikirim ke email!");
      navigate("/verify-otp");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mengirim OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Reset Password</h2>
        <input
          type="email"
          placeholder="Email Admin"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="login-btn"
          onClick={handleSendOTP}
          disabled={loading}
        >
          {loading ? "Mengirim..." : "Kirim OTP"}
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
