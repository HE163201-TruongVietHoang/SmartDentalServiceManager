import React from "react";
import { Card, Button, Form } from "react-bootstrap";

export default function NurseProfile() {
  const user = {
    name: "Nguyễn Bảo",
    email: "baonguyen@example.com",
    role: "Quản trị viên",
    phone: "0909 123 456",
    address: "Hà Nội, Việt Nam",
    avatar: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", // ảnh đại diện mặc định
  };

  const handleEdit = () => {
    alert("Tính năng chỉnh sửa hồ sơ đang được phát triển!");
  };

  const handleChangePassword = () => {
    alert("Tính năng đổi mật khẩu đang được phát triển!");
  };

  return (
    <div className="container py-4">
      <Card className="shadow-lg border-0">
        <Card.Body className="text-center p-4">
          <img
            src={user.avatar}
            alt="avatar"
            className="rounded-circle mb-3"
            width="120"
            height="120"
          />
          <h3 className="mb-0">{user.name}</h3>
          <p className="text-muted">{user.role}</p>

          <hr />

          <div className="text-start px-5">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {user.phone}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {user.address}
            </p>
          </div>

          <div className="d-flex justify-content-center gap-3 mt-4">
            <Button variant="primary" onClick={handleEdit}>
              Chỉnh sửa hồ sơ
            </Button>
            <Button variant="outline-secondary" onClick={handleChangePassword}>
              Đổi mật khẩu
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
