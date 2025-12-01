import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  FaDesktop,
  FaUserCircle,
  FaSignOutAlt,
  FaSave,
  FaEdit,
  FaCamera,
} from "react-icons/fa";
import Header from "../../components/home/Header/Header";

export default function ProfileView() {
  const [user, setUser] = useState(null);
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [form, setForm] = useState({});
  const fileInputRef = useRef(null);
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
      if (res.ok) {
        setUser(data);
        setPreview(data.avatar);
        setForm({
          avatar: data.avatar || "",
          fullName: data.fullName || "",
          phone: data.phone || "",
          gender: data.gender || "",
          dob: data.dob ? data.dob.slice(0, 10) : "",
          address: data.address || "",
          citizenIdNumber: data.citizenIdNumber || "",
          occupation: data.occupation || "",
          ethnicity: data.ethnicity || "",
        });
      } else alert(data.message || "Không thể tải hồ sơ");
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
      const updatedDevices = data.map((d) => ({
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
        alert(
          isCurrent
            ? "Đăng xuất khỏi thiết bị hiện tại"
            : "Đăng xuất thiết bị thành công"
        );
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.fullName.trim() || form.fullName.trim().length < 3)
      return "Họ tên phải có ít nhất 3 ký tự";

    if (!/^0\d{9,10}$/.test(form.phone))
      return "Số điện thoại phải bắt đầu bằng 0 và gồm 10–11 chữ số";

    if (form.gender && !["Male", "Female", "Other"].includes(form.gender))
      return "Giới tính không hợp lệ";

    if (form.dob) {
      const dob = new Date(form.dob);
      const today = new Date();
      if (dob >= today) return "Ngày sinh phải nhỏ hơn ngày hiện tại";
    }

    if (form.address && form.address.trim().length < 5)
      return "Địa chỉ phải có ít nhất 5 ký tự";

    if (form.citizenIdNumber && !/^\d{1,12}$/.test(form.citizenIdNumber))
      return "Số căn cước công dân không hợp lệ (tối đa 12 số)";

    if (form.occupation && form.occupation.trim().length < 2)
      return "Nghề nghiệp phải có ít nhất 2 ký tự";

    if (form.ethnicity && form.ethnicity.trim().length < 2)
      return "Dân tộc phải có ít nhất 2 ký tự";

    return null;
  };

  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Cập nhật hồ sơ thành công!");
        setUser(data.user || { ...user, ...form });
        setIsEditing(false);
      } else alert(data.message || "Cập nhật thất bại");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật hồ sơ");
    }
  };

  const handleAvatarClick = () => fileInputRef.current.click();
if (!user) return <p>Đang tải hồ sơ...</p>;
  return (
    <>
      <Header />
      <div className="container my-5" style={{ maxWidth: "750px" }}>
        {/* Profile Card */}
        <div className="card shadow-sm rounded-4 p-4 mb-5">
          <div className="d-flex flex-column align-items-center text-center position-relative">
            {/* Avatar */}
            <div
              className="position-relative"
              style={{ width: "120px", height: "120px" }}
              onClick={handleAvatarClick}
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
                    alert("Chỉ chấp nhận ảnh PNG/JPG/JPEG");
                    return;
                  }

                  if (file.size > 10 * 1024 * 1024) {
                    alert("Ảnh không được vượt quá 10MB");
                    return;
                  }

                  setSelectedFile(file);
                  setPreview(URL.createObjectURL(file));

                  // Upload
                  const formData = new FormData();
                  formData.append("avatar", file);

                  try {
                    const res = await axios.put(
                      `http://localhost:5000/api/auth/profile/avatar`,
                      formData,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                          "Content-Type": "multipart/form-data",
                        },
                      }
                    );
                    setUser({ ...user, avatar: res.data.avatar });
                  } catch (err) {
                    console.error(err);
                    alert("Cập nhật avatar thất bại");
                  }
                }}
              />
              <img
                src={preview || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                alt="avatar"
                className="rounded-circle shadow"
                style={{ width: "120px", height: "120px", objectFit: "cover", cursor: "pointer" }}
              />
              {/* Overlay icon */}
              <div
                className="position-absolute top-0 start-0 w-100 h-100 rounded-circle d-flex justify-content-center align-items-center"
                style={{
                  backgroundColor: "rgba(0,0,0,0.4)",
                  color: "white",
                  opacity: 0,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
              >
                <FaCamera size={24} />
              </div>
            </div>

            <h3 className="fw-bold text-primary mt-3">
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="form-control text-center"
                  style={{ maxWidth: "300px" }}
                />
              ) : (
                user.fullName
              )}
            </h3>
            <span className="badge bg-success mt-1">
              {user.roleName || "—"}
            </span>

            <hr className="my-4" />

            {/* Profile fields */}
            <div className="row text-start">
              {/* Email */}
              <div className="col-6 mb-3">
                <div className="fw-bold">Email:</div>
                <div className="text-secondary">{user.email}</div>
              </div>

              {/* Phone */}
              <div className="col-6 mb-3">
                <div className="fw-bold">Số điện thoại:</div>
                {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="form-control"
                  />
                ) : (
                  <div className="text-secondary">{user.phone || "—"}</div>
                )}
              </div>

              {/* Gender */}
              <div className="col-6 mb-3">
                <div className="fw-bold">Giới tính:</div>
                {isEditing ? (
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">— Chọn giới tính —</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div className="text-secondary">{user.gender || "—"}</div>
                )}
              </div>

              {/* DOB */}
              <div className="col-6 mb-3">
                <div className="fw-bold">Ngày sinh:</div>
                {isEditing ? (
                  <input
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    className="form-control"
                  />
                ) : (
                  <div className="text-secondary">
                    {user.dob
                      ? new Date(user.dob).toLocaleDateString("vi-VN")
                      : "—"}
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="col-6 mb-3">
                <div className="fw-bold">Địa chỉ:</div>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="form-control"
                    rows="2"
                  />
                ) : (
                  <div className="text-secondary">{user.address || "—"}</div>
                )}
              </div>

              {/* Citizen ID */}
              <div className="col-6 mb-3">
                <div className="fw-bold">Số căn cước công dân:</div>
                {isEditing ? (
                  <input
                    type="text"
                    name="citizenIdNumber"
                    value={form.citizenIdNumber}
                    onChange={handleChange}
                    className="form-control"
                  />
                ) : (
                  <div className="text-secondary">{user.citizenIdNumber || "—"}</div>
                )}
              </div>

              {/* Occupation */}
              <div className="col-6 mb-3">
                <div className="fw-bold">Nghề nghiệp:</div>
                {isEditing ? (
                  <input
                    type="text"
                    name="occupation"
                    value={form.occupation}
                    onChange={handleChange}
                    className="form-control"
                  />
                ) : (
                  <div className="text-secondary">{user.occupation || "—"}</div>
                )}
              </div>

              {/* Ethnicity */}
              <div className="col-6 mb-3">
                <div className="fw-bold">Dân tộc:</div>
                {isEditing ? (
                  <input
                    type="text"
                    name="ethnicity"
                    value={form.ethnicity}
                    onChange={handleChange}
                    className="form-control"
                  />
                ) : (
                  <div className="text-secondary">{user.ethnicity || "—"}</div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-center mt-3 gap-2">
              {!isEditing ? (
                <button
                  className="btn btn-outline-primary d-flex align-items-center"
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit className="me-2" /> Chỉnh sửa hồ sơ
                </button>
              ) : (
                <>
                  <button
                    className="btn btn-success d-flex align-items-center"
                    onClick={handleSave}
                  >
                    <FaSave className="me-2" /> Lưu thay đổi
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Hủy
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Devices Card */}
          <div className="card shadow-sm rounded-4 p-4 mt-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">
                <FaDesktop className="me-2" />
                Thiết bị đang đăng nhập
              </h5>
              <div>
                <button
                  className="btn btn-sm btn-secondary me-2"
                  onClick={fetchDevices}
                >
                  Làm mới
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={handleLogoutAllDevices}
                >
                  Đăng xuất tất cả
                </button>
              </div>
            </div>

            {devicesLoading ? (
              <p className="text-center text-secondary">Đang tải...</p>
            ) : devices.length === 0 ? (
              <p className="text-center text-secondary">Chưa có thiết bị nào.</p>
            ) : (
              <ul className="list-group">
                {devices.map((d, idx) => (
                  <li
                    key={idx}
                    className="list-group-item d-flex justify-content-between align-items-center shadow-sm mb-2 rounded-3"
                  >
                    <div>
                      <div className="fw-bold">
                        <FaUserCircle className="me-1" />
                        {d.device || "Thiết bị không xác định"}
                        {d.isCurrentDevice && (
                          <span className="badge bg-primary ms-2">Hiện tại</span>
                        )}
                      </div>
                      <div className="text-secondary" style={{ fontSize: "0.85rem" }}>
                        {d.userAgent || "Trình duyệt không xác định"}
                      </div>
                      <div className="text-secondary" style={{ fontSize: "0.85rem" }}>
                        {d.ipAddress}
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger d-flex align-items-center"
                      onClick={() => handleLogoutDevice(d.sessionId, d.isCurrentDevice)}
                    >
                      <FaSignOutAlt className="me-1" /> Đăng xuất
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
