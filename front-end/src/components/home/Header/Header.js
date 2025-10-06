import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header
      style={{
        background: "#007bff",
        color: "white",
        padding: "15px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Logo / Tên hệ thống */}
      <div>
        <h1 style={{ margin: 0, fontSize: "20px" }}>
          Smart Dental Service Manager
        </h1>
      </div>

      {/* Menu chính */}
      <nav style={{ flexGrow: 1, marginLeft: "50px" }}>
        <Link to="/" style={{ color: "white", marginRight: "20px", textDecoration: "none" }}>
          Trang chủ
        </Link>
        <Link to="/services" style={{ color: "white", marginRight: "20px", textDecoration: "none" }}>
          Dịch vụ
        </Link>
        <Link to="/contact" style={{ color: "white", textDecoration: "none" }}>
          Liên hệ
        </Link>
      </nav>

      {/* Nút Sign In / Sign Up */}
      <div>
        <Link to="/signin">
          <button
            style={{
              marginRight: "10px",
              padding: "8px 16px",
              backgroundColor: "#0056b3",
              border: "none",
              borderRadius: "5px",
              color: "white",
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
        </Link>

        <Link to="/signup">
          <button
            style={{
              padding: "8px 16px",
              backgroundColor: "#28a745",
              border: "none",
              borderRadius: "5px",
              color: "white",
              cursor: "pointer",
            }}
          >
            Sign Up
          </button>
        </Link>
      </div>
    </header>
  );
}

export default Header;
