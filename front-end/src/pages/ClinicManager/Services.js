// src/pages/staff/StaffServices.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

export default function StaffServices() {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({
    serviceName: "",
    description: "",
    price: "",
  });
  const [editingService, setEditingService] = useState(null);

  // 🧾 Lấy danh sách dịch vụ
  const fetchServices = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/services");
      setServices(res.data);
    } catch (err) {
      console.error("Lỗi khi tải dịch vụ:", err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // ➕ Thêm mới dịch vụ
  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/services", newService);
      setNewService({ serviceName: "", description: "", price: "" });
      fetchServices();
    } catch (err) {
      console.error("Lỗi khi thêm dịch vụ:", err);
    }
  };

  // ✏️ Cập nhật dịch vụ
  const handleUpdateService = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/services/${editingService.serviceId}`,
        editingService
      );
      setEditingService(null);
      fetchServices();
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
    }
  };

  // 🗑️ Xóa dịch vụ
  const handleDeleteService = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa dịch vụ này không?")) {
      try {
        await axios.delete(`http://localhost:5000/api/services/${id}`);
        fetchServices();
      } catch (err) {
        console.error("Lỗi khi xóa:", err);
      }
    }
  };

  return (
    <div className="container">
      <h3 className="mb-4 fw-bold text-uppercase">Quản lý Dịch vụ</h3>

      {/* Form thêm dịch vụ */}
      {!editingService ? (
        <form onSubmit={handleAddService} className="mb-4 card p-3 shadow-sm">
          <h5 className="fw-semibold mb-3">
            <FaPlus className="me-2" />
            Thêm dịch vụ mới
          </h5>
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Tên dịch vụ"
                value={newService.serviceName}
                onChange={(e) =>
                  setNewService({ ...newService, serviceName: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="Mô tả"
                value={newService.description}
                onChange={(e) =>
                  setNewService({ ...newService, description: e.target.value })
                }
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Giá"
                value={newService.price}
                onChange={(e) =>
                  setNewService({ ...newService, price: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-1 d-flex justify-content-center">
              <button
                className="btn w-100 fw-semibold"
                style={{
                  backgroundColor: "#d1e7dd",
                  color: "#0f5132",
                  border: "1px solid #bcd0c7",
                }}
              >
                Thêm
              </button>
            </div>
          </div>
        </form>
      ) : (
        <form
          onSubmit={handleUpdateService}
          className="mb-4 card p-3 shadow-sm"
        >
          <h5 className="fw-semibold mb-3">
            <FaEdit className="me-2" />
            Chỉnh sửa dịch vụ
          </h5>
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                value={editingService.serviceName}
                onChange={(e) =>
                  setEditingService({
                    ...editingService,
                    serviceName: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                value={editingService.description}
                onChange={(e) =>
                  setEditingService({
                    ...editingService,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                value={editingService.price}
                onChange={(e) =>
                  setEditingService({
                    ...editingService,
                    price: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-md-1 d-flex justify-content-center align-items-center gap-2">
              <button className="btn btn-sm btn-primary">Lưu</button>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => setEditingService(null)}
              >
                Hủy
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Bảng dịch vụ */}
      <div className="table-responsive card shadow-sm p-3">
        <table className="table table-hover align-middle">
          <thead className="table-success">
            <tr>
              <th>ID</th>
              <th>Tên dịch vụ</th>
              <th>Mô tả</th>
              <th>Giá</th>
              <th>Ngày tạo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.serviceId}>
                <td>{s.serviceId}</td>
                <td>{s.serviceName}</td>
                <td>{s.description}</td>
                <td>{Number(s.price).toLocaleString("vi-VN")} ₫</td>
                <td>{new Date(s.createdAt).toLocaleDateString("vi-VN")}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => setEditingService(s)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteService(s.serviceId)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
