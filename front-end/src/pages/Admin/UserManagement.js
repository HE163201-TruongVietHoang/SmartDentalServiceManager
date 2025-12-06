import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const API_URL = "http://localhost:5000/api/admin";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    dob: "",
    address: "",
    roleId: 2,
    isActive: true,
    isVerify: false,
  });

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  // fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`, {
        headers: getAuthHeaders(),
      });
      setUsers(res.data.users);
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  // handle form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  // add or update user
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`${API_URL}/users/${editingUser.userId}`, form, {
          headers: getAuthHeaders(),
        });
      } else {
        await axios.post(`${API_URL}/users`, form, {
          headers: getAuthHeaders(),
        });
      }

      fetchUsers();
      resetForm();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setForm({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      gender: "",
      dob: "",
      address: "",
      roleId: 2,
      isActive: true,
      isVerify: false,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc muốn xóa user này?")) return;

    try {
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: getAuthHeaders(),
      });
      fetchUsers();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleEdit = (u) => {
    setEditingUser(u);
    setForm({
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      password: "",
      gender: u.gender,
      dob: u.dob ? u.dob.split("T")[0] : "",
      address: u.address,
      roleId: u.roleId,
      isActive: u.isActive,
      isVerify: u.isVerify,
    });
  };

  // Filtering
  const normalize = (str) =>
    str
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");

  const filteredUsers = users.filter((u) =>
    normalize(u.fullName).includes(normalize(searchTerm))
  );

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);

  const currentList = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container">
      <h3 className="mb-4 fw-bold text-uppercase">Quản lý Người dùng</h3>

      {/* Form thêm user */}
      <form onSubmit={handleSubmit} className="card p-3 shadow-sm mb-4">
        <h5 className="fw-semibold mb-3">
          <FaPlus className="me-2" />
          {editingUser ? "Chỉnh sửa user" : "Thêm user mới"}
        </h5>

        <div className="row g-3 align-items-center">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              name="fullName"
              placeholder="Full name"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-3">
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-2">
            <input
              type="text"
              className="form-control"
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          {!editingUser && (
            <div className="col-md-2">
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="col-md-2">
            <select
              name="gender"
              className="form-select"
              value={form.gender}
              onChange={handleChange}
            >
              <option value="">Giới tính</option>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
              <option value="Other">Khác</option>
            </select>
          </div>

          {/* Date */}
          <div className="col-md-2">
            <input
              type="date"
              className="form-control"
              name="dob"
              value={form.dob}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              name="address"
              placeholder="Địa chỉ"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          {/* Buttons */}
          <div className="col-md-2 d-flex gap-2">
            <button className="btn btn-success w-100">
              {editingUser ? "Lưu" : "Thêm"}
            </button>

            {editingUser && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Hủy
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Search */}
      <div className="d-flex justify-content-end mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm kiếm user..."
          style={{ maxWidth: "300px" }}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div className="table-responsive card shadow-sm p-3">
        <table className="table table-hover align-middle">
          <thead className="table-success">
            <tr>
              <th>ID</th>
              <th>Avatar</th>
              <th>Full name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>DOB</th>
              <th>Role</th>
              <th>Active</th>
              <th>Verify</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {currentList.map((u) => (
              <tr key={u.userId}>
                <td>{u.userId}</td>
                <td>
                  {u.avatar && (
                    <img
                      src={u.avatar}
                      style={{
                        width: "45px",
                        height: "45px",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </td>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.gender}</td>
                <td>{u.dob ? new Date(u.dob).toLocaleDateString() : ""}</td>
                <td>{u.roleId}</td>
                <td>{u.isActive ? "✔️" : "❌"}</td>
                <td>{u.isVerify ? "✔️" : "❌"}</td>

                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleEdit(u)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(u.userId)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-3 gap-2">
            <button
              className="btn btn-outline-secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ←
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`btn ${
                  currentPage === i + 1
                    ? "btn-success"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="btn btn-outline-secondary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
