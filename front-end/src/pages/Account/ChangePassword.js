import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../components/home/Header/Header";
import Footer from "../../components/home/Footer/Footer";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State để bật/tắt xem mật khẩu
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword)
      return toast.warning("Vui lòng nhập đầy đủ thông tin.");

    if (newPassword !== confirmPassword)
      return toast.warning("Mật khẩu xác nhận không khớp.");

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: currentPassword,
            newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Đổi mật khẩu thất bại");

      toast.success("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(`${err.message}`);
    }
  };

  return (
    <div>
      <Header />
      <div className="container py-5" style={{ maxWidth: "600px" }}>
        <h3 className="mb-4 text-center" style={{ color: "#2ECCB6" }}>
          Đổi mật khẩu
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Mật khẩu hiện tại */}
          <div className="mb-3 position-relative">
            <label className="form-label">Mật khẩu hiện tại</label>
            <input
              type={showCurrent ? "text" : "password"}
              className="form-control"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <span
              onClick={() => setShowCurrent(!showCurrent)}
              style={{
                position: "absolute",
                right: "12px",
                top: "38px",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              {showCurrent ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Mật khẩu mới */}
          <div className="mb-3 position-relative">
            <label className="form-label">Mật khẩu mới</label>
            <input
              type={showNew ? "text" : "password"}
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />

            <span
              onClick={() => setShowNew(!showNew)}
              style={{
                position: "absolute",
                right: "12px",
                top: "38px",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              {showNew ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div className="mb-3 position-relative">
            <label className="form-label">Xác nhận mật khẩu mới</label>
            <input
              type={showConfirm ? "text" : "password"}
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />

            <span
              onClick={() => setShowConfirm(!showConfirm)}
              style={{
                position: "absolute",
                right: "12px",
                top: "38px",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            style={{ backgroundColor: "#2ECCB6", border: "none" }}
          >
            Cập nhật mật khẩu
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
