import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/request-reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("✅ Mã OTP đã được gửi đến email của bạn!");
        setStep(2);
      } else {
        alert("⚠️ " + (data.error || "Không thể gửi OTP, vui lòng thử lại!"));
      }
    } catch (error) {
      alert("❌ Lỗi máy chủ hoặc không thể kết nối!");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("❌ Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode: otp, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Đặt lại mật khẩu thành công!");
        window.location.href = "/signin";
      } else {
        alert("⚠️ " + (data.error || "OTP sai hoặc đã hết hạn!"));
      }
    } catch (error) {
      alert("❌ Lỗi máy chủ hoặc không thể kết nối!");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#87CEEB", // ✅ Giống SignIn
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "40px 30px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "25px",
            color: "#2563eb",
          }}
        >
          {step === 1 ? "Khôi phục mật khẩu" : "Xác nhận OTP"}
        </h2>

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <label style={{ fontWeight: "bold", color: "#333" }}>
              Nhập email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="vd: user@gmail.com"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginTop: "8px",
                marginBottom: "20px",
              }}
            />
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#1e40af")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
            >
              Gửi mã OTP
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <label style={{ fontWeight: "bold", color: "#333" }}>Mã OTP:</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="Nhập mã OTP"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginTop: "8px",
                marginBottom: "15px",
              }}
            />
            <label style={{ fontWeight: "bold", color: "#333" }}>
              Mật khẩu mới:
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Mật khẩu mới"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginTop: "8px",
                marginBottom: "15px",
              }}
            />
            <label style={{ fontWeight: "bold", color: "#333" }}>
              Xác nhận mật khẩu:
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Nhập lại mật khẩu"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginTop: "8px",
                marginBottom: "20px",
              }}
            />
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#059669")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#10b981")}
            >
              Xác nhận đổi mật khẩu
            </button>

            <p
              style={{
                textAlign: "center",
                marginTop: "15px",
                color: "#2563eb",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={() => setStep(1)}
            >
              ← Gửi lại OTP
            </p>
          </form>
        )}
        <p
          style={{
            textAlign: "center",
            marginTop: "15px",
            color: "#2563eb",
            cursor: "pointer",
            fontWeight: "bold",
          }}
          onClick={() => navigate("/signin")}
        >
          ← Quay lại đăng nhập
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
