// src/pages/VerifyOtp.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const signupUser = JSON.parse(localStorage.getItem("signupUser") || "{}");
    if (!signupUser.email) {
      alert("❌ Không tìm thấy thông tin đăng ký. Vui lòng đăng ký lại.");
      navigate("/signup");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        {
          userId: signupUser.email, // backend sẽ nhận email làm userId
          otp,
        }
      );

      if (res.data) {
        alert("✅ Xác nhận OTP thành công!");
        localStorage.removeItem("signupUser");
        navigate("/signin");
      } else {
        alert("❌ OTP không hợp lệ hoặc đã hết hạn!");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi xác thực OTP!");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh", backgroundColor: "#f0fffa" }}
    >
      <div
        className="card p-4"
        style={{ borderRadius: "15px", width: "400px" }}
      >
        <h3 className="text-center mb-4" style={{ color: "#2ECCB6" }}>
          Xác nhận OTP
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nhập mã OTP</label>
            <input
              type="text"
              className="form-control"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="XXXXXX"
              required
              style={{ borderRadius: "10px" }}
            />
          </div>
          <button
            type="submit"
            className="btn w-100 fw-bold"
            style={{
              backgroundColor: "#2ECCB6",
              color: "#fff",
              borderRadius: "10px",
            }}
          >
            Xác nhận
          </button>
        </form>
      </div>
    </div>
  );
}
