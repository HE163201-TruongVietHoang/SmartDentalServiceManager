import React, { useState } from "react";
import Header from "../../components/home/Header/Header";
import Footer from "../../components/home/Footer/Footer";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
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
        toast.info("Mã OTP đã được gửi đến email của bạn!");
        setStep(2);
      } else {
        toast.error(data.error || "Không thể gửi OTP, vui lòng thử lại!");
      }
    } catch {
      toast.error("Lỗi máy chủ hoặc không thể kết nối!");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode: otp, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Đặt lại mật khẩu thành công!");
        navigate("/signin");
      } else {
        toast.warning(data.error || "OTP sai hoặc đã hết hạn!");
      }
    } catch {
      toast.error("Lỗi máy chủ hoặc không thể kết nối!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f0fffa",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <Header />

      {/* Form giữa màn hình */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "40px 30px",
            borderRadius: "20px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
            width: "100%",
            maxWidth: "420px",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "25px",
              color: "#2ECCB6",
              fontWeight: "700",
              fontSize: "26px",
            }}
          >
            {step === 1 ? "Khôi phục mật khẩu" : "Đặt lại mật khẩu mới"}
          </h2>

          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    fontWeight: "600",
                    color: "#333",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Nhập email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    fontSize: "15px",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.border = "1px solid #2ECCB6")}
                  onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#2ECCB6",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "600",
                  fontSize: "16px",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#28B89F")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#2ECCB6")}
              >
                {loading ? "Đang gửi..." : "Gửi mã OTP"}
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    fontWeight: "600",
                    color: "#333",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Mã OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Nhập mã OTP"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    fontSize: "15px",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.border = "1px solid #2ECCB6")}
                  onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
                />
              </div>

              <div style={{ marginBottom: "18px", position: "relative" }}>
                <label
                  style={{
                    fontWeight: "600",
                    color: "#333",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Mật khẩu mới
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="********"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 40px 12px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    fontSize: "15px",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.border = "1px solid #2ECCB6")}
                  onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "42px",
                    cursor: "pointer",
                    color: "#2ECCB6",
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <div style={{ marginBottom: "22px", position: "relative" }}>
                <label
                  style={{
                    fontWeight: "600",
                    color: "#333",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Xác nhận mật khẩu
                </label>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 40px 12px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    fontSize: "15px",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.border = "1px solid #2ECCB6")}
                  onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
                />
                <span
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "42px",
                    cursor: "pointer",
                    color: "#2ECCB6",
                  }}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#2ECCB6",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "600",
                  fontSize: "16px",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#28B89F")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#2ECCB6")}
              >
                {loading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
              </button>

              <p
                style={{
                  textAlign: "center",
                  marginTop: "15px",
                  color: "#2ECCB6",
                  cursor: "pointer",
                  fontWeight: "500",
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
              fontSize: "14px",
              color: "#555",
            }}
          >
            Quay lại{" "}
            <span
              onClick={() => navigate("/signin")}
              style={{
                color: "#2ECCB6",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Đăng nhập
            </span>
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
