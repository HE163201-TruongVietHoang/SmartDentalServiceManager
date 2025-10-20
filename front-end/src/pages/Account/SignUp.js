import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState(""); // ✅ Đổi từ name → fullName
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("❌ Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, fullName, email, phone, password }), // ✅ Gửi fullName thay vì name
      });

      const data = await response.json();
      console.log("📌 RESPONSE:", data);

      if (response.ok) {
        alert("✅ " + (data.message || "Đăng ký thành công!"));
        navigate("/signin");
      } else {
        alert("⚠️ " + (data.error || data.message || "Đăng ký thất bại!"));
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("❌ Lỗi máy chủ hoặc không thể kết nối!");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#87CEEB",
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
          maxWidth: "450px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: "#2563eb",
          }}
        >
          Đăng ký tài khoản
        </h2>
        <form onSubmit={handleSubmit}>
          {/* ✅ Username */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold", color: "#333" }}>Tên:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Nhập username"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginTop: "5px",
              }}
            />
          </div>

          {/* ✅ Full Name */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold", color: "#333" }}>
              Họ và tên:
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Nhập đầy đủ họ tên"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginTop: "5px",
              }}
            />
          </div>

          {/* ✅ Email */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold", color: "#333" }}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Nhập email của bạn"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginTop: "5px",
              }}
            />
          </div>

          {/* ✅ Phone */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold", color: "#333" }}>
              Số điện thoại:
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="Nhập số điện thoại"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginTop: "5px",
              }}
            />
          </div>

          {/* ✅ Password */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold", color: "#333" }}>
              Mật khẩu:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Nhập mật khẩu"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginTop: "5px",
              }}
            />
          </div>

          {/* ✅ Confirm Password */}
          <div style={{ marginBottom: "20px" }}>
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
                marginTop: "5px",
              }}
            />
          </div>

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
              transition: "background-color 0.3s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#059669")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#10b981")}
          >
            Đăng ký
          </button>

          <p style={{ textAlign: "center", marginTop: "15px" }}>
            Đã có tài khoản?{" "}
            <span
              onClick={() => navigate("/signin")}
              style={{
                color: "#2563eb",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Đăng nhập ngay
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
