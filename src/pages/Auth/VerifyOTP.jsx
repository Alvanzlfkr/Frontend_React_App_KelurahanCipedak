import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const email = sessionStorage.getItem("resetEmail");

  useEffect(() => {
    if (!email) navigate("/forgot-password");
  }, [email, navigate]);

  const handleVerifyOTP = async () => {
    if (!otp) return alert("OTP wajib diisi");

    try {
      setLoading(true);
      const res = await api.post("/admin/password/verify-otp", { email, otp });

      if (res.data.success) {
        alert("OTP valid! Silakan reset password");
        navigate("/reset-password", { state: { email } }); // kirim email via state
      } else {
        alert(res.data.message || "OTP salah");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal verifikasi OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Verifikasi OTP</h2>
        <input
          type="text"
          placeholder="Masukkan OTP"
          className="login-input"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button
          className="login-btn"
          onClick={handleVerifyOTP}
          disabled={loading}
        >
          {loading ? "Memeriksa..." : "Verifikasi OTP"}
        </button>
      </div>
    </div>
  );
};

export default VerifyOTP;
