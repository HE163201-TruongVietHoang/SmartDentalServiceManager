import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import axios from "axios";

const API_URL = "http://localhost:5000/api/admin"; // backend URL
const token = localStorage.getItem("token"); // JWT token
const headers = { Authorization: `Bearer ${token}` };

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const initialForm = {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    roleId: 2,
    isActive: true,
    isVerify: false,
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`, { headers });
      setUsers(res.data.users);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa user này?")) return;
    await axios.delete(`${API_URL}/users/${id}`, { headers });
    setUsers(users.filter((u) => u.userId !== id));
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      roleId: user.roleId || 2,
      isActive: user.isActive ?? true,
      isVerify: user.isVerify ?? false,
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingUser) {
      await axios.put(`${API_URL}/users/${editingUser.userId}`, form, {
        headers,
      });
    } else {
      await axios.post(`${API_URL}/users`, form, { headers });
    }
    setShowModal(false);
    fetchUsers();
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div className="container mt-4">
      <h2>Quản lý người dùng</h2>
      <Button className="mb-3" onClick={handleAdd}>
        Thêm user mới
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Avatar</th>
            <th>Full Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Gender</th>
            <th>DOB</th>
            <th>Address</th>
            <th>Role ID</th>
            <th>Active</th>
            <th>Verified</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.userId}>
              <td>{u.userId}</td>
              <td>
                {u.avatar && <img src={u.avatar} alt="avatar" width="50" />}
              </td>
              <td>{u.fullName}</td>
              <td>{u.phone}</td>
              <td>{u.email}</td>
              <td>{u.gender}</td>
              <td>{u.dob ? new Date(u.dob).toLocaleDateString() : ""}</td>
              <td>{u.address}</td>
              <td>{u.roleId}</td>
              <td>{u.isActive ? "Yes" : "No"}</td>
              <td>{u.isVerify ? "Yes" : "No"}</td>
              <td>
                <Button
                  variant="primary"
                  size="sm"
                  className="me-2"
                  onClick={() => handleEdit(u)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(u.userId)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal thêm / chỉnh sửa */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? "Chỉnh sửa user" : "Thêm user mới"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {!editingUser && (
              <Form.Group className="mb-2">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            )}

            <Form.Group className="mb-2">
              <Form.Label>Gender</Form.Label>
              <Form.Select
                name="gender"
                value={form.gender || ""}
                onChange={handleChange}
              >
                <option value="">--Chọn--</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>DOB</Form.Label>
              <Form.Control
                name="dob"
                type="date"
                value={
                  form.dob ? new Date(form.dob).toISOString().split("T")[0] : ""
                }
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Address</Form.Label>
              <Form.Control
                name="address"
                value={form.address || ""}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Role ID</Form.Label>
              <Form.Control
                name="roleId"
                type="number"
                value={form.roleId || 2}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Check
                name="isActive"
                label="Active"
                checked={form.isActive ?? true}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Check
                name="isVerify"
                label="Verified"
                checked={form.isVerify ?? false}
                onChange={handleChange}
              />
            </Form.Group>

            <Button type="submit">{editingUser ? "Cập nhật" : "Tạo"}</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
