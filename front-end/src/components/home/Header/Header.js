import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notiOpen, setNotiOpen] = useState(false);
  const [filterUnread, setFilterUnread] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAllNotis, setShowAllNotis] = useState(false);

  const token = localStorage.getItem("token");

  // Load user info
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Fetch initial notifications
  useEffect(() => {
    if (!user || !token) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          const unread = (data.notifications || []).filter(
            (n) => !n.isRead
          ).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error("Fetch notifications error:", err);
      }
    };

    fetchNotifications();
  }, [user, token]);

  // Socket.IO realtime notifications
  useEffect(() => {
    if (!user) return;
    const socket = io("http://localhost:5000");
    socket.emit("join", user.userId);

    socket.on("notification", (noti) => {
      setNotifications((prev) => [noti, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => socket.disconnect();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("sessionId");
    localStorage.removeItem("user");
    window.location.href = "/signin";
  };

  const handleScroll = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const toggleNoti = () => setNotiOpen(!notiOpen);

  const handleNotiClick = async (n) => {
    try {
      if (!n.isRead && token) {
        await fetch(`http://localhost:5000/api/notifications/${n.id}/read`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === n.id ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (err) {
      console.error("Mark notification as read error:", err);
    }

    setNotiOpen(false);
    if (n.type === "appointment") navigate("/appointment/me");
    else if (n.type === "chat") navigate("/chat");
    else navigate("/notifications");
  };

  const displayedNotis = filterUnread
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const notisToShow = showAllNotis
    ? displayedNotis
    : displayedNotis.slice(0, 5);

  // User Dropdown JSX
  const renderUserDropdown = () => {
    if (!user) return null;

    return (
      <div className="ms-3 position-relative">
        <button
          className="btn"
          style={{
            borderRadius: "25px",
            backgroundColor: "#2ECCB6",
            color: "#fff",
            fontWeight: 500,
            border: "none",
            padding: "8px 16px",
          }}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          Xin chào, {user.fullName}
        </button>
        {dropdownOpen && (
          <ul
            className="dropdown-menu shadow-sm"
            style={{
              display: "block", // bắt buộc hiện khi dropdownOpen === true
              position: "absolute", // để không bị ẩn bởi parent
              top: "100%", // hiện ngay dưới nút
              right: 0, // canh phải
              zIndex: 1000, // luôn nổi trên
            }}
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
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/invoice/me")}
                  >
                    Hóa đơn của tôi
                  </button>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/payments/me")}
                  >
                    Thanh toán của tôi
                  </button>
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
        )}
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
          <ul className="navbar-nav ms-auto align-items-center">
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
                href="/alldoctors"
                style={{ color: "#333", fontWeight: 500 }}
                onMouseEnter={(e) => (e.target.style.color = "#2ECCB6")}
                onMouseLeave={(e) => (e.target.style.color = "#333")}
              >
                Đội ngũ bác sĩ
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                href="/contact"
                style={{ color: "#333", fontWeight: 500 }}
                onMouseEnter={(e) => (e.target.style.color = "#2ECCB6")}
                onMouseLeave={(e) => (e.target.style.color = "#333")}
              >
                Liên hệ
              </a>
            </li>
          </ul>

          {/* Notification */}
          {user && (
            <li className="nav-item position-relative ms-3">
              <button className="btn position-relative" onClick={toggleNoti}>
                <i class="bi bi-bell"></i>
                {unreadCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {notiOpen && (
                <div
                  className="shadow-lg"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 5px)",
                    width: "360px",
                    maxHeight: "400px",
                    overflow: "hidden",
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    zIndex: 1000,
                    border: "1px solid rgba(0,0,0,.15)",
                  }}
                >
                  {/* Filter Buttons */}
                  <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
                    <span style={{ fontWeight: 600 }}>Thông báo</span>
                    <div>
                      <button
                        className={`btn btn-sm ${
                          filterUnread ? "btn-outline-secondary" : "btn-primary"
                        } me-1`}
                        onClick={() => setFilterUnread(false)}
                      >
                        Tất cả
                      </button>
                      <button
                        className={`btn btn-sm ${
                          filterUnread ? "btn-primary" : "btn-outline-secondary"
                        }`}
                        onClick={() => setFilterUnread(true)}
                      >
                        Chưa đọc
                      </button>
                    </div>
                  </div>

                  <div
                    className="overflow-y-auto"
                    style={{
                      maxHeight: "300px",
                      scrollbarWidth: "thin",
                      scrollbarColor: "rgba(0,0,0,0.2) transparent",
                    }}
                  >
                    {notisToShow.length === 0 && (
                      <div className="p-3 text-center text-muted">
                        Không có thông báo
                      </div>
                    )}

                    {notisToShow.map((n) => (
                      <div
                        key={n.id}
                        className="p-2 border-bottom cursor-pointer"
                        style={{
                          backgroundColor: n.isRead ? "#fff" : "#e0f7fa",
                          fontWeight: n.isRead ? "400" : "600",
                        }}
                        onClick={() => handleNotiClick(n)}
                      >
                        <strong>{n.title}</strong>
                        <div className="text-sm">{n.message}</div>
                      </div>
                    ))}
                  </div>

                  {!showAllNotis && displayedNotis.length > 5 && (
                    <div className="text-center p-2 border-top">
                      <button
                        className="btn btn-link"
                        onClick={() => setShowAllNotis(true)}
                      >
                        Xem tất cả
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          )}
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
            renderUserDropdown()
          )}
        </div>
      </div>
    </nav>
  );
}
