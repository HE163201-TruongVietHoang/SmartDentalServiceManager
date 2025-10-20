import React, { useEffect, useState } from "react";

export default function ProfileView({ role }) {
  const [user, setUser] = useState(null);
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
    fetchDevices();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUser(data);
      else alert(data.message || "Không thể tải hồ sơ");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải hồ sơ");
    }
  };

  const fetchDevices = async () => {
    try {
      setDevicesLoading(true);
      const res = await fetch("http://localhost:5000/api/auth/devices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // đánh dấu thiết bị hiện tại dựa trên token
      const updatedDevices = data.map(d => ({
        ...d,
        isCurrentDevice: d.jwtToken === token,
      }));
      setDevices(updatedDevices);
    } catch (err) {
      console.error(err);
      alert("Không thể tải danh sách thiết bị");
    } finally {
      setDevicesLoading(false);
    }
  };

  const handleLogoutDevice = async (sessionId, isCurrent) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/devices/${sessionId}/logout`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        alert(isCurrent ? "Đăng xuất khỏi thiết bị hiện tại" : "Đăng xuất thiết bị thành công");
        if (isCurrent) {
          localStorage.clear();
          window.location.href = "/signin";
        } else fetchDevices();
      } else {
        const data = await res.json();
        alert(data.message || "Đăng xuất thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi đăng xuất thiết bị");
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/devices/logout-all",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        alert("Đăng xuất tất cả thiết bị thành công");
        localStorage.clear();
        window.location.href = "/signin";
      } else {
        const data = await res.json();
        alert(data.message || "Đăng xuất tất cả thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi đăng xuất tất cả thiết bị");
    }
  };

  if (!user) return <p className="text-center mt-5">Đang tải hồ sơ...</p>;

  return (
    <div className="container mt-5" style={{ maxWidth: "700px", backgroundColor: "#fff", borderRadius: "15px", padding: "30px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
      
      {/* Avatar */}
      <div className="text-center mb-4">
        <img
          src={user.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
          alt="avatar"
          className="rounded-circle shadow"
          style={{ width: "120px", height: "120px", objectFit: "cover" }}
        />
        <h3 className="mt-3 text-primary fw-bold">{user.fullName}</h3>
        <span className="badge bg-success" style={{ fontSize: "0.9rem", padding: "8px 12px" }}>{role}</span>
      </div>

      {/* Personal Info */}
      <div className="mt-4">
        <div className="mb-3">
          <label className="form-label fw-bold">Email:</label>
          <p className="form-control-plaintext">{user.email}</p>
        </div>
        <div className="mb-3">
          <label className="form-label fw-bold">Số điện thoại:</label>
          <p className="form-control-plaintext">{user.phone || "—"}</p>
        </div>
        <div className="mb-3">
          <label className="form-label fw-bold">Địa chỉ:</label>
          <p className="form-control-plaintext">{user.address || "—"}</p>
        </div>
        <div className="mb-3">
          <label className="form-label fw-bold">Ngày sinh:</label>
          <p className="form-control-plaintext">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN") : "—"}</p>
        </div>

        <div className="d-flex justify-content-center mt-4">
          <button className="btn btn-outline-primary px-4" onClick={() => alert("Chức năng chỉnh sửa sắp có!")}>Chỉnh sửa hồ sơ</button>
        </div>
      </div>

      {/* Devices */}
      <div className="mt-5">
        <h5>Thiết bị đang đăng nhập</h5>
        <button className="btn btn-sm btn-secondary mb-2 me-2" onClick={fetchDevices}>Làm mới</button>
        <button className="btn btn-sm btn-danger mb-2" onClick={handleLogoutAllDevices}>Đăng xuất tất cả</button>
        {devicesLoading ? <p>Đang tải...</p> :
          <ul className="list-group mt-2">
            {devices.map((d, idx) => (
              <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{d.device || "Thiết bị không xác định"}</strong>
                  {d.isCurrentDevice && <span className="badge bg-primary ms-2">Hiện tại</span>}
                  <div style={{ fontSize: "0.8rem", color: "#555" }}>{d.userAgent || "Trình duyệt không xác định"}</div>
                  <div style={{ fontSize: "0.8rem", color: "#555" }}>{d.ipAddress}</div>
                </div>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleLogoutDevice(d.sessionId, d.isCurrentDevice)}>Đăng xuất</button>
              </li>
            ))}
          </ul>
        }
      </div>
    </div>
  );
}
