import React, { useEffect, useState } from "react";
import { Card, Button, Spinner, Form, Modal } from "react-bootstrap";
import axios from "axios";

export default function ReceptionistProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const token = localStorage.getItem("token");

  // --- Fetch profile ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setForm({
          fullName: res.data.fullName || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
        });
      } catch (err) {
        console.error(err);
        alert("Không thể tải hồ sơ!");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // --- Handle profile changes ---
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(
        "http://localhost:5000/api/auth/profile",
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(res.data.user || { ...user, ...form });
      setIsEditing(false);
      alert("Cập nhật hồ sơ thành công!");
    } catch (err) {
      console.error(err);
      alert("Cập nhật hồ sơ thất bại!");
    }
  };

  // --- Handle password modal ---
  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const submitPasswordChange = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/change-password",
        {
          oldPassword: currentPassword,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPasswordMessage("✅ Đổi mật khẩu thành công!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error(err);
      setPasswordMessage(`❌ ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (!user) return <p className="text-center py-5">Không có dữ liệu hồ sơ</p>;

  return (
    <div className="container py-4">
      <Card className="shadow-lg border-0">
        <Card.Body className="text-center p-4">
          <img
            src={
              user.avatar ||
              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            }
            alt="avatar"
            className="rounded-circle mb-3"
            width="120"
            height="120"
          />

          {isEditing ? (
            <Form.Control
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="mb-2 text-center"
              style={{ maxWidth: "250px", margin: "0 auto" }}
            />
          ) : (
            <h3 className="mb-0">{user.fullName}</h3>
          )}

          <p className="text-muted">{user.roleName}</p>

          <hr />

          <div className="text-start px-5">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Số điện thoại:</strong>{" "}
              {isEditing ? (
                <Form.Control
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              ) : (
                user.phone
              )}
            </p>
            <p>
              <strong>Địa chỉ:</strong>{" "}
              {isEditing ? (
                <Form.Control
                  as="textarea"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={2}
                />
              ) : (
                user.address
              )}
            </p>
          </div>

          <div className="d-flex justify-content-center gap-3 mt-4">
            {!isEditing ? (
              <>
                <Button variant="primary" onClick={() => setIsEditing(true)}>
                  Chỉnh sửa hồ sơ
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Đổi mật khẩu
                </Button>
              </>
            ) : (
              <>
                <Button variant="success" onClick={handleSave}>
                  Lưu thay đổi
                </Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Hủy
                </Button>
              </>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* --- Password Modal --- */}
      <Modal
        show={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Đổi mật khẩu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu hiện tại</Form.Label>
            <Form.Control
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu mới</Form.Label>
            <Form.Control
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Xác nhận mật khẩu mới</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
            />
          </Form.Group>
          {passwordMessage && (
            <div
              className={`alert ${
                passwordMessage.startsWith("✅")
                  ? "alert-success"
                  : "alert-danger"
              }`}
            >
              {passwordMessage}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowPasswordModal(false)}
          >
            Hủy
          </Button>
          <Button variant="primary" onClick={submitPasswordChange}>
            Cập nhật mật khẩu
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
