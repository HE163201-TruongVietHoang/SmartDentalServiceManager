import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");
  const sessionId = localStorage.getItem("sessionId");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleScroll = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  // 🔹 Logout session hiện tại
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    const sessionId = localStorage.getItem("sessionId"); // phải chắc chắn có sessionId

    if (!token || !sessionId) {
      localStorage.clear();
      window.location.href = "/signin";
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/devices/${sessionId}/logout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        console.error(data.message || "Logout thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi logout:", err);
    } finally {
      // Luôn clear token, sessionId và user sau logout
      localStorage.removeItem("token");
      localStorage.removeItem("sessionId");
      localStorage.removeItem("user");
      window.location.href = "/signin";
    }
  };

  const renderDropdown = () => {
    if (!user) return null;

    return (
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
          {user.roleName === "Patient" && (
            <>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => navigate("/appointment/me")}
                >
                  Lịch hẹn của tôi
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => navigate("/medical-record")}
                >
                  Hồ sơ khám bệnh
                </button>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
            </>
          )}
          <li>
            <button
              className="dropdown-item"
              onClick={() => navigate("/profile")}
            >
              Hồ sơ cá nhân
            </button>
          </li>
          <li>
            <button
              className="dropdown-item"
              onClick={() => navigate("/change-password")}
            >
              Đổi mật khẩu
            </button>
          </li>
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
    );
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

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

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
                style={{ color: "#333", fontWeight: 500 }}
                onClick={(e) => {
                  e.preventDefault();
                  handleScroll("contact");
                }}
                onMouseEnter={(e) => (e.target.style.color = "#2ECCB6")}
                onMouseLeave={(e) => (e.target.style.color = "#333")}
              >
                Liên hệ
              </a>
            </li>
          </ul>

          {!user ? (
            <button
              className="btn ms-3 px-4"
              style={{
                borderRadius: "25px",
                backgroundColor: "#2ECCB6",
                borderColor: "#2ECCB6",
                color: "#fff",
                fontWeight: 500,
              }}
              onClick={() => navigate("/signin")}
            >
              Đăng nhập
            </button>
          ) : (
            renderDropdown()
          )}
        </div>
      </div>
    </nav>
  );
}
