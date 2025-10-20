import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Lấy user từ localStorage (sau khi login)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleScroll = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/"); // Quay lại trang chính
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm"
      style={{ padding: "12px 0" }}
    >
      <div className="container-lg">
        {/* Logo */}
        <a
          className="navbar-brand fw-bold fs-4 d-flex align-items-center"
          href="/"
          style={{ color: "#2ECCB6", textDecoration: "none" }}
        >
          <i
            className="fas fa-tooth me-2"
            style={{ color: "#2ECCB6", fontSize: "1.4rem" }}
          ></i>
          Smart Dental Clinic
        </a>

        {/* Toggle button (mobile) */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a
                className="nav-link"
                href="/service"
                style={{ color: "#333", fontWeight: 500 }}
                onMouseEnter={(e) => (e.target.style.color = "#2ECCB6")}
                onMouseLeave={(e) => (e.target.style.color = "#333")}
              >
                Dịch vụ
              </a>
            </li>

            <li className="nav-item">
              <a
                className="nav-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleScroll("contact");
                }}
                style={{ color: "#333", fontWeight: 500 }}
                onMouseEnter={(e) => (e.target.style.color = "#2ECCB6")}
                onMouseLeave={(e) => (e.target.style.color = "#333")}
              >
                Liên hệ
              </a>
            </li>
          </ul>

          {/* Nếu chưa đăng nhập */}
          {!user ? (
            <button
              className="btn ms-3 px-4"
              style={{
                borderRadius: "25px",
                backgroundColor: "#2ECCB6",
                borderColor: "#2ECCB6",
                color: "#fff",
                fontWeight: "500",
              }}
              onClick={() => navigate("/signin")}
            >
              Đặt lịch
            </button>
          ) : (
            <>
              {/* Nếu là patient → hiển thị dropdown */}
              {user.role === "Patient" && (
                <div className="dropdown ms-3">
                  <button
                    className="btn dropdown-toggle"
                    type="button"
                    id="dropdownMenuButton"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{
                      borderRadius: "25px",
                      backgroundColor: "#2ECCB6",
                      color: "#fff",
                      fontWeight: "500",
                      border: "none",
                      padding: "8px 16px",
                    }}
                  >
                    Xin chào, {user.fullName}
                  </button>
                  <ul
                    className="dropdown-menu dropdown-menu-end shadow-sm"
                    aria-labelledby="dropdownMenuButton"
                  >
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => navigate("/patient/profile")}
                      >
                        Hồ sơ cá nhân
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => navigate("/patient/appointments")}
                      >
                        Lịch hẹn của tôi
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={handleLogout}
                      >
                        Đăng xuất
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
