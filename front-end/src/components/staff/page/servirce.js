import React, { useEffect, useState } from "react";
import StaffLayout from "../stafflayout";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";

function Service() {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    ServiceName: "",
    Description: "",
    Price: "",
    Treatment: "",
  });

  // Load More
  // Thêm trạng thái lưu số dịch vụ hiển thị ban đầu
  const initialCount = 8;
  const increment = 8;
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const API_URL = "http://localhost:5000/api/services";

  // Lấy danh sách dịch vụ
  const fetchServices = async () => {
    try {
      const res = await axios.get(API_URL);
      setServices(res.data);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải danh sách dịch vụ");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Mở modal thêm/sửa
  const openModal = (service = null) => {
    setEditingService(service);
    if (service) {
      setFormData({
        ServiceName: service.ServiceName,
        Description: service.Description,
        Price: service.Price,
        Treatment: service.Treatment,
      });
    } else {
      setFormData({
        ServiceName: "",
        Description: "",
        Price: "",
        Treatment: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await axios.put(`${API_URL}/${editingService.ServiceID}`, formData);
        alert("Cập nhật dịch vụ thành công");
      } else {
        await axios.post(API_URL, formData);
        alert("Thêm dịch vụ thành công");
      }
      fetchServices();
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa dịch vụ này?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      alert("Xóa dịch vụ thành công");
      fetchServices();
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra");
    }
  };

  //Load more
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + increment);
  };

  // Thu gọn
  const handleCollapse = () => {
    setVisibleCount(initialCount);
  };

  // Format giá VND
  const formatPrice = (price) => {
    return Number(price).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  return (
    <StaffLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold text-secondary">Quản lý dịch vụ</h3>
        <Button variant="primary" onClick={() => openModal()}>
          Thêm dịch vụ
        </Button>
      </div>
      <p className="text-muted mb-3">
        Đây là khu vực để nhân viên quản lý danh sách dịch vụ của phòng khám.
      </p>

      <div
        className="table-responsive shadow-sm rounded"
        style={{ backgroundColor: "white", padding: "10px" }}
      >
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: "5%" }}>ID</th>
              <th style={{ width: "20%" }}>Tên dịch vụ</th>
              <th>Mô tả</th>
              <th style={{ width: "10%" }}>Giá</th>
              <th style={{ width: "15%" }}>Điều trị</th>
              <th style={{ width: "15%" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {services.slice(0, visibleCount).map((service) => (
              <tr key={service.ServiceID}>
                <td>{service.ServiceID}</td>
                <td>{service.ServiceName}</td>
                <td>{service.Description}</td>
                <td>{formatPrice(service.Price)}</td>
                <td>{service.Treatment}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => openModal(service)}
                      style={{ borderRadius: "8px", flex: 1 }}
                    >
                      <FaEdit className="me-1" /> Sửa
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(service.ServiceID)}
                      style={{ borderRadius: "8px", flex: 1 }}
                    >
                      <FaTrash className="me-1" /> Xóa
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Nút tải thêm */}
        <div className="d-flex justify-content-center mt-3 gap-2">
          {visibleCount < services.length && (
            <Button variant="secondary" onClick={handleLoadMore}>
              Tải thêm
            </Button>
          )}
          {visibleCount > initialCount && (
            <Button variant="secondary" onClick={handleCollapse}>
              Thu gọn
            </Button>
          )}
        </div>
      </div>

      {/* Modal thêm/sửa */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingService ? "Sửa dịch vụ" : "Thêm dịch vụ"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tên dịch vụ</Form.Label>
              <Form.Control
                type="text"
                name="ServiceName"
                value={formData.ServiceName}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                type="text"
                name="Description"
                value={formData.Description}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Giá (VNĐ)</Form.Label>
              <Form.Control
                type="number"
                step="1000"
                name="Price"
                value={formData.Price}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Điều trị</Form.Label>
              <Form.Control
                type="text"
                name="Treatment"
                value={formData.Treatment}
                onChange={handleChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              {editingService ? "Cập nhật" : "Thêm"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </StaffLayout>
  );
}

export default Service;
