import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash, FaCamera } from "react-icons/fa";
import { toast } from "react-toastify";

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
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Fetch services ---
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

  // --- Add service ---
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
      setNewService({ serviceName: "", description: "", price: "", image: null });
      setPreview(null);
      setShowModal(false);
      fetchServices();
      toast.success("Thêm dịch vụ thành công!");
    } catch (err) {
      console.error("Lỗi khi thêm dịch vụ:", err);
      toast.error("Thêm dịch vụ thất bại");
    }
  };

  // --- Update service ---
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
      setPreview(null);
      setShowModal(false);
      fetchServices();
      toast.success("Cập nhật dịch vụ thành công!");
    } catch (err) {
      console.error("Lỗi khi cập nhật dịch vụ:", err);
      toast.error("Cập nhật thất bại");
    }
  };

  // --- Delete service ---
  const handleDeleteService = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa dịch vụ này không?")) {
      try {
        await axios.delete(`http://localhost:5000/api/services/${id}`);
        fetchServices();
        toast.success("Xóa dịch vụ thành công!");
      } catch (err) {
        console.error("Lỗi khi xóa:", err);
        toast.error("Xóa thất bại");
      }
    }
  };

  // --- File input ---
  const handleFileChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      toast.warning("Chỉ chấp nhận ảnh PNG/JPG/JPEG");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.warning("Ảnh không được vượt quá 10MB");
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

  // --- Upload ảnh cho textarea ---
  const uploadImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post("http://localhost:5000/api/services/upload", formData);
        const imageUrl = res.data.url;

        // Chèn HTML <img> vào description dạng text
        if (editingService) {
          setEditingService({
            ...editingService,
            description: (editingService.description || "") + `<img src="${imageUrl}" />`,
          });
        } else {
          setNewService({
            ...newService,
            description: (newService.description || "") + `<img src="${imageUrl}" />`,
          });
        }
      } catch (err) {
        console.error("Upload thất bại", err);
        toast.error("Upload ảnh thất bại");
      }
    };
  };

  // --- Search & Pagination ---
  const normalizeText = (str, removeTone = true) => {
    if (!str) return "";
    let text = str.toLowerCase();
    return removeTone
      ? text
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
      : text;
  };

  const filteredServices = services.filter((s) => {
    const name = s.serviceName || "";
    return (
      normalizeText(name).includes(normalizeText(searchTerm)) ||
      normalizeText(name, false).includes(normalizeText(searchTerm, false))
    );
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentServices = filteredServices.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  return (
    <div className="container">
      <h3 className="mb-4 fw-bold text-uppercase">Quản lý Dịch vụ</h3>

      {/* Nút tạo mới */}
      <button
        className="btn btn-success mb-3"
        onClick={() => {
          setShowModal(true);
          setNewService({ serviceName: "", description: "", price: "", image: null });
          setPreview(null);
          setEditingService(null);
        }}
      >
        <FaPlus className="me-2" /> Tạo dịch vụ
      </button>

      {/* Modal */}
      {showModal && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setEditingService(null);
                    setPreview(null);
                  }}
                ></button>
              </div>
              <form onSubmit={editingService ? handleUpdateService : handleAddService}>
                <div
                  className="modal-body"
                  style={{ minHeight: "450px", display: "flex", flexDirection: "column", gap: "15px" }}
                >
                  {/* Tên dịch vụ */}
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tên dịch vụ"
                    value={editingService ? editingService.serviceName : newService.serviceName}
                    onChange={(e) =>
                      editingService
                        ? setEditingService({ ...editingService, serviceName: e.target.value })
                        : setNewService({ ...newService, serviceName: e.target.value })
                    }
                    required
                  />

                  {/* Mô tả dạng text */}
                  <div style={{ marginBottom: "40px" }}>
                    <textarea
                      className="form-control"
                      style={{ minHeight: "180px" }}
                      placeholder="Mô tả dịch vụ"
                      value={editingService ? editingService.description : newService.description}
                      onChange={(e) =>
                        editingService
                          ? setEditingService({ ...editingService, description: e.target.value })
                          : setNewService({ ...newService, description: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary mt-2"
                      onClick={uploadImage}
                    >
                      <FaCamera /> Thêm ảnh (dưới dạng text)
                    </button>
                  </div>

                  {/* Giá */}
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Giá"
                    value={editingService ? editingService.price : newService.price}
                    onChange={(e) =>
                      editingService
                        ? setEditingService({ ...editingService, price: e.target.value })
                        : setNewService({ ...newService, price: e.target.value })
                    }
                    required
                    style={{ marginBottom: "15px" }}
                  />

                  {/* Ảnh preview */}
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      ref={fileInputRef}
                      onChange={(e) => handleFileChange(e, !!editingService)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => triggerFileInput(!!editingService)}
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
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-success">
                    {editingService ? "Cập nhật" : "Thêm"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setEditingService(null);
                      setPreview(null);
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="d-flex justify-content-end mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm kiếm dịch vụ..."
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
              <th>Ảnh</th>
              <th>Tên dịch vụ</th>
              <th>Mô tả</th>
              <th>Giá</th>
              <th>Ngày tạo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentServices.map((s) => (
              <tr key={s.serviceId}>
                <td>{s.serviceId}</td>
                <td>
                  {s.imageUrl && (
                    <img
                      src={s.imageUrl}
                      alt="service"
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                  )}
                </td>
                <td>{s.serviceName}</td>
                <td>
                  <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {s.description}
                  </pre>
                </td>
                <td>{Number(s.price).toLocaleString("vi-VN")} ₫</td>
                <td>{new Date(s.createdAt).toLocaleDateString("vi-VN")}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => {
                      setEditingService(s);
                      setPreview(s.imageUrl || null);
                      setShowModal(true);
                    }}
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

        {/* Pagination */}
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
                className={`btn ${currentPage === i + 1 ? "btn-success" : "btn-outline-secondary"}`}
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
