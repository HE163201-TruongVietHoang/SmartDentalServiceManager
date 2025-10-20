import React from "react";

function Sale() {
  return (
    <section
      style={{
        padding: "20px",
        background: "#e9f7ef",
        borderRadius: "10px",
        margin: "20px 0",
      }}
    >
      <h2>Khuyến mãi đặc biệt</h2>
      <p>Giảm giá 30% cho dịch vụ tẩy trắng răng trong tháng này!</p>
      <button
        style={{
          padding: "10px 20px",
          background: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Đặt lịch ngay
      </button>
    </section>
  );
}

export default Sale;
