import React from "react";

function Banner() {
  return (
    <section
      style={{
        background: "linear-gradient(to right, #3b82f6, #60a5fa)",
        color: "white",
        padding: "80px 20px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "40px", fontWeight: "bold" }}>
        Nụ cười khỏe mạnh, Tương lai tươi sáng
      </h1>
      <p style={{ fontSize: "18px", marginTop: "10px" }}>
        Phòng khám nha khoa hiện đại, uy tín và tận tâm.
      </p>
      <button
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          backgroundColor: "white",
          color: "#2563eb",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Đặt lịch ngay
      </button>
    </section>
  );
}

export default Banner;
