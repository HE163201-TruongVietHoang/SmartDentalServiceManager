// src/pages/VerifyOtp.jsx
import React, { useState } from "react";
import Header from "../../components/home/Header/Header";
import Footer from "../../components/home/Footer/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const storedUser = JSON.parse(localStorage.getItem("signupUser"));
      if (!storedUser || !storedUser.userId) {
        setMessage(
          "Không tìm thấy thông tin người dùng. Vui lòng đăng ký lại."
        );
        setLoading(false);
        return;
      }

      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        {
          userId: storedUser.userId,
          otp,
        }
      );
      localStorage.setItem("token", res.data.token || res.data.jwtToken);
      localStorage.setItem("user", localStorage.getItem("signupUser"));
      localStorage.setItem("sessionId", res.data.sessionId);
      localStorage.removeItem("signupUser");
      setMessage(" Xác minh thành công! Đang đăng nhập...");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setMessage(
        err.response?.data?.error || "❌ Lỗi xác minh OTP, vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <section
        className="d-flex align-items-center justify-content-center"
        style={{
          backgroundColor: "#f0fffa",
          minHeight: "75vh",
        }}
      >
        <div
          className="card shadow-sm p-4 text-center"
          style={{
            borderRadius: "15px",
            border: "none",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <h3
            className="fw-bold mb-3"
            style={{ color: "#2ECCB6", fontSize: "1.6rem" }}
          >
            Xác minh OTP
          </h3>
          <p className="text-muted mb-4" style={{ fontSize: "0.95rem" }}>
            Nhập mã OTP đã gửi đến email của bạn
          </p>

          <form onSubmit={handleVerify}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control text-center fs-5"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Nhập mã OTP"
                required
                style={{
                  borderRadius: "10px",
                  letterSpacing: "3px",
                  fontWeight: "600",
                }}
              />
            </div>

            <button
              type="submit"
              className="btn w-100 fw-bold"
              style={{
                backgroundColor: "#2ECCB6",
                borderColor: "#2ECCB6",
                color: "#fff",
                borderRadius: "10px",
              }}
              disabled={loading}
            >
              {loading ? "Đang xác minh..." : "Xác minh"}
            </button>
          </form>

          {message && (
            <p
              className={`mt-3 mb-0 fw-medium ${
                message.includes("✅") ? "text-success" : "text-danger"
              }`}
              style={{ fontSize: "0.9rem" }}
            >
              {message}
            </p>
          )}

          <p className="mt-3 text-muted" style={{ fontSize: "0.9rem" }}>
            Chưa nhận được mã?{" "}
            <span
              style={{ color: "#2ECCB6", cursor: "pointer" }}
              onClick={() => navigate("/signup")}
            >
              Đăng ký lại
            </span>
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
