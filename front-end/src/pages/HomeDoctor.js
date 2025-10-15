import React from "react";
import { useNavigate } from "react-router-dom";

function HomeDoctor() {
  const navigate = useNavigate();

  const features = [
    { name: "Profile", path: "/doctor/profile" },
    { name: "View Appointments", path: "/doctor/appointments" },
    { name: "View Patient Records", path: "/doctor/patients" },
    { name: "Schedule", path: "/doctor/schedule" },
    { name: "Perform Examination", path: "/doctor/examination" },
    { name: "Record Diagnosis & Treatment Plan", path: "/doctor/diagnosis" },
    { name: "Prescribe Medication", path: "/doctor/prescription" },
    { name: "Update Treatment Progress", path: "/doctor/progress" },
  ];

  // Hàm xử lý logout
  const handleLogout = () => {
    // Xóa dữ liệu người dùng nếu có (localStorage hoặc sessionStorage)
    localStorage.removeItem("user");
    alert("Đăng xuất thành công!");
    navigate("/signin");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e88e5, #43a047)",
        color: "white",
        padding: "40px 20px",
        fontFamily: "Segoe UI, sans-serif",
        position: "relative",
      }}
    >
      {/* 🔹 Nút Logout ở góc phải trên */}
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "20px",
          right: "30px",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          color: "white",
          border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: "8px",
          padding: "10px 18px",
          cursor: "pointer",
          fontWeight: "bold",
          transition: "all 0.3s",
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = "rgba(255,255,255,0.4)";
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = "rgba(255,255,255,0.2)";
        }}
      >
        🔓 Logout
      </button>

      {/* Header */}
      <h1
        style={{
          textAlign: "center",
          fontSize: "2.8rem",
          marginBottom: "10px",
          letterSpacing: "1px",
        }}
      >
        👨‍⚕️ Doctor Dashboard
      </h1>
      <p
        style={{
          textAlign: "center",
          fontSize: "1.1rem",
          opacity: "0.9",
          marginBottom: "40px",
        }}
      >
        Welcome, Doctor! Please choose one of the functions below 👇
      </p>

      {/* Dashboard grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "25px",
          width: "90%",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {features.map((feature, index) => (
          <div
            key={index}
            onClick={() => navigate(feature.path)}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "16px",
              padding: "30px 20px",
              textAlign: "center",
              cursor: "pointer",
              boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
              backdropFilter: "blur(8px)",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
            }}
          >
            <h3 style={{ fontSize: "1.3rem", marginBottom: "10px" }}>
              {feature.name}
            </h3>
            <p style={{ fontSize: "0.9rem", opacity: "0.8" }}>Click to open</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: "60px",
          fontSize: "0.9rem",
          opacity: "0.8",
        }}
      >
        © 2025 Smart Dental Service Manager
      </div>
    </div>
  );
}

export default HomeDoctor;
