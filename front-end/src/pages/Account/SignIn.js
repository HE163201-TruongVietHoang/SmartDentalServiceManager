import React, { useState } from "react";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        console.log("✅ Đăng nhập thành công:", data);
        alert(data.message || "Đăng nhập thành công!");
        // ❌ Tạm thời chưa chuyển trang để xem log
        // window.location.href = "/doctor/home";
      } else {
        console.warn("❌ Đăng nhập thất bại:", data);
        alert(data.message || "Đăng nhập thất bại!");
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
        </form>
      </div>
    </div>
  );
}

export default SignIn;
