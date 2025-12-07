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
import Footer from "../../components/home/Footer/Footer";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:5000/api/auth";

export default function ProfileView() {
  const [user, setUser] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [preview, setPreview] = useState("");
  const fileInputRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
    fetchDevices();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setPreview(res.data.avatar || "");
      setForm({
        avatar: res.data.avatar || "",
        fullName: res.data.fullName || "",
        phone: res.data.phone || "",
        gender: res.data.gender || "",
        dob: res.data.dob ? res.data.dob.slice(0, 10) : "",
        address: res.data.address || "",
        citizenIdNumber: res.data.citizenIdNumber || "",
        occupation: res.data.occupation || "",
        ethnicity: res.data.ethnicity || "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải hồ sơ");
    }
  };

  const fetchDevices = async () => {
    try {
      setLoadingDevices(true);
      const res = await axios.get(`${API_BASE}/devices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedDevices = res.data.map((d) => ({
        ...d,
        isCurrentDevice: d.jwtToken === token,
      }));
      setDevices(updatedDevices);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách thiết bị");
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleLogoutDevice = async (sessionId, isCurrent) => {
    try {
      const res = await axios.post(
        `${API_BASE}/devices/${sessionId}/logout`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.warning(
        isCurrent
          ? "Đăng xuất khỏi thiết bị hiện tại"
          : "Đăng xuất thiết bị thành công"
      );
      if (isCurrent) {
        localStorage.clear();
        window.location.href = "/signin";
      } else fetchDevices();
    } catch (err) {
      console.error(err);
      toast.error("Đăng xuất thất bại");
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      await axios.post(`${API_BASE}/devices/logout-all`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Đăng xuất tất cả thiết bị thành công");
      localStorage.clear();
      window.location.href = "/signin";
    } catch (err) {
      console.error(err);
      toast.error("Đăng xuất tất cả thất bại");
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (!form.fullName || form.fullName.trim().length < 3)
      return "Họ tên phải có ít nhất 3 ký tự";
    if (!/^0\d{9,10}$/.test(form.phone)) return "Số điện thoại không hợp lệ";
    if (form.gender && !["Male", "Female", "Other"].includes(form.gender))
      return "Giới tính không hợp lệ";
    if (form.dob && new Date(form.dob) >= new Date())
      return "Ngày sinh phải nhỏ hơn hiện tại";
    if (form.address && form.address.trim().length < 5)
      return "Địa chỉ phải có ít nhất 5 ký tự";
    if (form.citizenIdNumber && !/^\d{1,12}$/.test(form.citizenIdNumber))
      return "Số căn cước không hợp lệ";
    if (form.occupation && form.occupation.trim().length < 2)
      return "Nghề nghiệp phải có ít nhất 2 ký tự";
    if (form.ethnicity && form.ethnicity.trim().length < 2)
      return "Dân tộc phải có ít nhất 2 ký tự";
    return null;
  };

  const handleSave = async () => {
    const error = validateForm();
    if (error) return toast.error(error);
    try {
      const res = await axios.put(`${API_BASE}/profile`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user || { ...user, ...form });
      setIsEditing(false);
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (err) {
      console.error(err);
      toast.success("Cập nhật thất bại");
    }
  };

  const handleAvatarClick = () => fileInputRef.current.click();

  if (!user) return <p className="text-center mt-5">Đang tải hồ sơ...</p>;

  return (
    <>
      <Header />
      <div className="container my-5" style={{ maxWidth: "750px" }}>
        {/* Profile Card */}
        <div className="card shadow-sm rounded-4 p-4 mb-5">
          <AvatarSection
            preview={preview}
            user={user}
            fileInputRef={fileInputRef}
            setPreview={setPreview}
            setUser={setUser}
            token={token}
          />

          <ProfileFields
            user={user}
            form={form}
            isEditing={isEditing}
            handleChange={handleChange}
          />

          <div className="d-flex justify-content-center mt-3 gap-2">
            {!isEditing ? (
              <button
                className="btn btn-outline-primary"
                onClick={() => setIsEditing(true)}
              >
                <FaEdit className="me-2" /> Chỉnh sửa hồ sơ
              </button>
            ) : (
              <>
                <button className="btn btn-success" onClick={handleSave}>
                  <FaSave className="me-2" /> Lưu thay đổi
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setForm({
                      avatar: user.avatar || "",
                      fullName: user.fullName || "",
                      phone: user.phone || "",
                      gender: user.gender || "",
                      dob: user.dob ? user.dob.slice(0, 10) : "",
                      address: user.address || "",
                      citizenIdNumber: user.citizenIdNumber || "",
                      occupation: user.occupation || "",
                      ethnicity: user.ethnicity || "",
                    });
                    setIsEditing(false);
                  }}
                >
                  Hủy
                </button>
              </>
            )}
          </div>
        </div>

        <DevicesList
          devices={devices}
          loading={loadingDevices}
          fetchDevices={fetchDevices}
          handleLogoutDevice={handleLogoutDevice}
          handleLogoutAllDevices={handleLogoutAllDevices}
        />
      </div>
      <Footer />
    </>
  );
}

// Avatar Component
const AvatarSection = ({
  preview,
  user,
  fileInputRef,
  setPreview,
  setUser,
  token,
}) => {
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type))
      return toast.warning("Chỉ chấp nhận PNG/JPG/JPEG");
    if (file.size > 10 * 1024 * 1024)
      return toast.warning("Ảnh không vượt quá 10MB");
    setPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await axios.put(`${API_BASE}/profile/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setUser((prev) => ({ ...prev, avatar: res.data.avatar }));
      toast.success("Cập nhật avatar thành công");
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật avatar thất bại");
    }
  };

  return (
    <div className="d-flex flex-column align-items-center text-center position-relative">
      <div
        className="position-relative"
        style={{ width: "120px", height: "120px" }}
        onClick={() => fileInputRef.current.click()}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <img
          src={
            preview || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          }
          alt="avatar"
          className="rounded-circle shadow"
          style={{
            width: "120px",
            height: "120px",
            objectFit: "cover",
            cursor: "pointer",
          }}
        />
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
      <h3 className="fw-bold text-primary mt-3">{user.fullName}</h3>
      <span className="badge bg-success mt-1">{user.roleName || "—"}</span>
      <hr className="my-4" />
    </div>
  );
};

// Profile Fields Component
const ProfileFields = ({ user, form, isEditing, handleChange }) => (
  <div className="row text-start">
    {[
      {
        label: "Email",
        name: "email",
        value: user.email,
        readOnly: true, // không cho sửa
      },
      { label: "Số điện thoại", value: form.phone, name: "phone" },
      {
        label: "Giới tính",
        value: form.gender,
        name: "gender",
        type: "select",
        options: ["Male", "Female", "Other"],
      },
      { label: "Ngày sinh", value: form.dob, name: "dob", type: "date" },
      {
        label: "Địa chỉ",
        value: form.address,
        name: "address",
        type: "textarea",
      },
      {
        label: "Số căn cước công dân",
        value: form.citizenIdNumber,
        name: "citizenIdNumber",
      },
      { label: "Nghề nghiệp", value: form.occupation, name: "occupation" },
      { label: "Dân tộc", value: form.ethnicity, name: "ethnicity" },
    ].map((f, idx) => (
      <div className="col-6 mb-3" key={idx}>
        <div className="fw-bold">{f.label}:</div>

        {/* Nếu đang edit */}
        {isEditing && f.name ? (
          f.readOnly ? (
            // READ-ONLY FIELD (vd email)
            <input
              className="form-control"
              type="text"
              name={f.name}
              value={f.value}
              readOnly
            />
          ) : f.type === "select" ? (
            <select
              className="form-select"
              name={f.name}
              value={form[f.name]}
              onChange={handleChange}
            >
              <option value="">— Chọn —</option>
              {f.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : f.type === "textarea" ? (
            <textarea
              className="form-control"
              name={f.name}
              value={form[f.name]}
              onChange={handleChange}
              rows={2}
            ></textarea>
          ) : (
            <input
              className="form-control"
              type={f.type || "text"}
              name={f.name}
              value={form[f.name]}
              onChange={handleChange}
            />
          )
        ) : (
          // Chế độ xem
          <div className="text-secondary">{f.value || "—"}</div>
        )}
      </div>
    ))}
  </div>
);

// Devices List Component
const DevicesList = ({
  devices,
  loading,
  fetchDevices,
  handleLogoutDevice,
  handleLogoutAllDevices,
}) => (
  <div className="card shadow-sm rounded-4 p-4 mt-5">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h5>
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
    {loading ? (
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
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleLogoutDevice(d.sessionId, d.isCurrentDevice)}
            >
              <FaSignOutAlt className="me-1" /> Đăng xuất
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);
