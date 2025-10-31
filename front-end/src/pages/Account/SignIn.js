import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Đăng nhập thành công:", data);

        // Lưu token & role vào localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("sessionId", data.sessionId);
        alert(data.message || "Đăng nhập thành công!");

        // ✅ Điều hướng theo role
        const roleName = data.user?.roleName;
        if (roleName === "Patient") {
          navigate("/"); // Trang chính của bệnh nhân
        } else if (roleName === "Doctor") {
          navigate("/doctor/home");
        } else if (roleName === "Nurse") {
          navigate("/nurse/materials");
        } else if (roleName === "ClinicManager") {
          navigate("/manager/dashboard");
        } else if (roleName === "Receptionist") {
          navigate("/receptionist/appointments"); // đặt lịch, quản lý lịch
        } else if (roleName === "Admin") {
          navigate("/admin/settings"); // trang cài đặt quản trị
        }
      } else {
        console.warn(" Đăng nhập thất bại:", data);
        alert(data.message || "Đăng nhập thất bại!");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert(" Lỗi máy chủ hoặc không thể kết nối!");
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
          maxWidth: "400px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: "#2563eb",
          }}
        >
          Đăng nhập
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold", color: "#333" }}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginTop: "5px",
              }}
              placeholder="Nhập email của bạn"
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontWeight: "bold", color: "#333" }}>
              Mật khẩu:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginTop: "5px",
              }}
              placeholder="Nhập mật khẩu"
            />
          </div>

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
              transition: "background-color 0.3s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#1e40af")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
          >
            Đăng nhập
          </button>

          {/* 🔽 Đăng ký tài khoản */}
          <p style={{ textAlign: "center", marginTop: "15px" }}>
            Bạn chưa có tài khoản?{" "}
            <span
              onClick={() => navigate("/signup")}
              style={{
                color: "#2563eb",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Đăng ký ngay
            </span>
          </p>

          {/* ✅ QUÊN MẬT KHẨU */}
          <p style={{ textAlign: "center", marginTop: "5px" }}>
            <span
              onClick={() => navigate("/reset-password")}
              style={{
                color: "#d97706",
                cursor: "pointer",
                fontWeight: "bold",
                textDecoration: "underline",
              }}
            >
              Quên mật khẩu?
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignIn;
