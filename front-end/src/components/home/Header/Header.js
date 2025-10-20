import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("👋 Đăng xuất thành công!");
    navigate("/signin");
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm"
      style={{ padding: "12px 0" }}
    >
      <div className="container-lg">
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

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a
                className="nav-link"
                href="/service"
                style={{ color: "#333", fontWeight: 500 }}
              >
                Dịch vụ
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href="#contact"
                style={{ color: "#333", fontWeight: 500 }}
              >
                Liên hệ
              </a>
            </li>
          </ul>

          {/* ✅ Nếu CHƯA ĐĂNG NHẬP */}
          {!user && (
            <div>
              <button
                className="btn ms-3 px-3"
                style={{
                  borderRadius: "25px",
                  backgroundColor: "#2ECCB6",
                  color: "white",
                  fontWeight: "500",
                }}
                onClick={() => navigate("/signin")}
              >
                Đăng nhập
              </button>
              <button
                className="btn ms-2 px-3"
                style={{
                  borderRadius: "25px",
                  border: "1px solid #2ECCB6",
                  color: "#2ECCB6",
                  fontWeight: "500",
                }}
                onClick={() => navigate("/signup")}
              >
                Đăng ký
              </button>
            </div>
          )}

          {/* ✅ Nếu ĐÃ ĐĂNG NHẬP VỚI ROLE = PATIENT */}
          {user && user.role === "Patient" && (
            <div className="ms-4 position-relative">
              <div
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <i
                  className="fas fa-user-circle"
                  style={{ fontSize: "1.8rem", color: "#2ECCB6" }}
                ></i>
                <span style={{ fontWeight: "bold", color: "#333" }}>
                  {user.fullName}
                </span>
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div
                  className="position-absolute shadow-sm p-2 bg-white rounded"
                  style={{
                    right: 0,
                    marginTop: "5px",
                    width: "180px",
                    zIndex: 10,
                  }}
                >
                  <p
                    style={{
                      padding: "8px 12px",
                      margin: 0,
                      cursor: "pointer",
                    }}
                    onClick={() => navigate("/profile")}
                  >
                    👤 Thông tin tài khoản
                  </p>
                  <hr style={{ margin: "5px 0" }} />
                  <p
                    style={{
                      padding: "8px 12px",
                      margin: 0,
                      cursor: "pointer",
                      color: "red",
                    }}
                    onClick={handleLogout}
                  >
                    🚪 Đăng xuất
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
