import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
    <div className="container py-5" style={{ maxWidth: "600px" }}>
      <h3 className="mb-4 text-center text-primary">Đổi mật khẩu</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Mật khẩu hiện tại</label>
          <input
            type="password"
            className="form-control"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Mật khẩu mới</label>
          <input
            type="password"
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
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
  );
}
