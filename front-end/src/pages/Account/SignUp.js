import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const [name, setName] = useState("");
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
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ " + data.message);
        navigate("/signin"); // 👉 Chuyển về trang đăng nhập sau khi thành công
      } else {
        alert("⚠️ " + data.message);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("❌ Lỗi máy chủ hoặc không thể kết nối!");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#87CEEB", // xanh da trời
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
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold", color: "#333" }}>Họ tên:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nhập họ tên"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginTop: "5px",
              }}
            />
          </div>

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
              backgroundColor: "#10b981", // xanh lá nhẹ
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
        </form>
      </div>
    </div>
  );
}

export default SignUp;
