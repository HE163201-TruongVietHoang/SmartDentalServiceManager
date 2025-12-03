import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash, FaCamera } from "react-icons/fa";

export default function ManagerServices() {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({
    serviceName: "",
    description: "",
    price: "",
    image: null,
  });
  const [editingService, setEditingService] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

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

  // --- Thêm dịch vụ mới ---
  const handleAddService = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("serviceName", newService.serviceName);
    formData.append("description", newService.description);
    formData.append("price", newService.price);
    if (newService.image) formData.append("image", newService.image);

    try {
      await axios.post("http://localhost:5000/api/services", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNewService({
        serviceName: "",
        description: "",
        price: "",
        image: null,
      });
      setPreview(null);
      fetchServices();
    } catch (err) {
      console.error("Lỗi khi thêm dịch vụ:", err);
    }
  };

  // --- Cập nhật dịch vụ ---
  const handleUpdateService = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("serviceName", editingService.serviceName);
    formData.append("description", editingService.description);
    formData.append("price", editingService.price);
    if (editingService.image instanceof File) {
      formData.append("image", editingService.image);
    }

    try {
      await axios.put(
        `http://localhost:5000/api/services/${editingService.serviceId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setEditingService(null);
      fetchServices();
    } catch (err) {
      console.error("Lỗi khi cập nhật dịch vụ:", err);
    }
  };

  // --- Xóa dịch vụ ---
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

  // --- Chọn ảnh ---
  const handleFileChange = (e, isEdit = false) => {
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

    setPreview(URL.createObjectURL(file));

    if (isEdit) {
      setEditingService({ ...editingService, image: file });
    } else {
      setNewService({ ...newService, image: file });
    }
  };

  const triggerFileInput = (isEdit = false) => {
    fileInputRef.current.click();
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
          <div className="row g-3 align-items-center">
            <div className="col-md-3">
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
            <div className="col-md-4">
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
            <div className="col-md-2 d-flex align-items-center gap-2">
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e)}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => triggerFileInput()}
              >
                <FaCamera /> Ảnh
              </button>
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
              )}
            </div>
            <div className="col-md-1 d-flex justify-content-center">
              <button className="btn btn-success w-100">Thêm</button>
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
          <div className="row g-3 align-items-center">
            <div className="col-md-3">
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
            <div className="col-md-4">
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
            <div className="col-md-2 d-flex align-items-center gap-2">
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e, true)}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => triggerFileInput(true)}
              >
                <FaCamera /> Ảnh
              </button>
              {editingService.image && (
                <img
                  src={
                    editingService.image instanceof File
                      ? URL.createObjectURL(editingService.image)
                      : editingService.image
                  }
                  alt="preview"
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
              )}
            </div>
            <div className="col-md-1 d-flex justify-content-center gap-1">
              <button className="btn btn-primary">Lưu</button>
              <button
                type="button"
                className="btn btn-secondary"
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
              <th>Ảnh</th>
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
                <td>
                  {s.image && (
                    <img
                      src={s.image}
                      alt="service"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </td>
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
