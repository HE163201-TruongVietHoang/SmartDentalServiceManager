import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaServicestack, FaTags, FaSignOutAlt } from "react-icons/fa";

function StaffLayout({ children }) {
  const location = useLocation();

  const menu = [
    {
      name: "Quản lý dịch vụ",
      icon: <FaServicestack />,
      path: "/staff/services",
    },
    { name: "Quản lý khuyến mãi", icon: <FaTags />, path: "/staff/promotions" },
  ];

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div
        className="d-flex flex-column text-white position-fixed"
        style={{
          width: "240px",
          height: "100vh",
          backgroundColor: "#2ECCB6",
          padding: "20px",
        }}
      >
        {/* Logo / Title */}
        <h4 className="text-center mb-4 fw-bold">Staff Panel</h4>

        {/* Menu */}
        <ul className="nav nav-pills flex-column mb-auto">
          {menu.map((item, index) => (
            <li key={index} className="nav-item mb-2">
              <Link
                to={item.path}
                className={`nav-link text-white d-flex align-items-center ${
                  location.pathname === item.path ? "active" : ""
                }`}
                style={{
                  backgroundColor:
                    location.pathname === item.path ? "#27ae9b" : "transparent",
                  borderRadius: "10px",
                  padding: "10px 15px",
                  transition: "0.3s",
                }}
              >
                <span className="me-2">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Logout Button */}
        <div className="mt-auto">
          <button
            className="btn btn-light w-100 d-flex align-items-center justify-content-center"
            style={{
              borderRadius: "10px",
              fontWeight: 500,
            }}
          >
            <FaSignOutAlt className="me-2" />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main content */}
      <main
        style={{
          marginLeft: "240px",
          padding: "30px",
          backgroundColor: "#f0fffa",
          minHeight: "100vh",
          width: "100%",
          transition: "background-color 0.3s ease",
        }}
      >
        {children}
      </main>
    </div>
  );
}

export default StaffLayout;
