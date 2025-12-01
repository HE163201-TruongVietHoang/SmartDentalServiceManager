import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaCheck, FaTimes } from "react-icons/fa";
import { Modal, Button, Table, Spinner } from "react-bootstrap";

export default function ScheduleRequests() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // 🔹 Lấy danh sách yêu cầu
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/schedules/requests",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải yêu cầu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 🔹 Lấy chi tiết 1 yêu cầu
  const fetchDetail = async (id) => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/schedules/requests/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        setSelectedRequest(res.data.details);
      }
    } catch (err) {
      console.error("Lỗi khi tải chi tiết yêu cầu:", err);
      alert("Không thể tải chi tiết yêu cầu.");
    } finally {
      setModalLoading(false);
    }
  };

  // 🔹 Duyệt yêu cầu
  const handleApprove = async (id) => {
    if (!window.confirm("Bạn có chắc muốn duyệt yêu cầu này không?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/schedules/requests/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Đã duyệt yêu cầu!");
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      console.error("Lỗi khi duyệt:", err);
      alert("Không thể duyệt yêu cầu.");
    }
  };

  // 🔹 Từ chối yêu cầu
  const handleReject = async (id) => {
    const reason = prompt("Nhập lý do từ chối yêu cầu:");
    if (!reason) return;
    if (!window.confirm("Bạn có chắc muốn từ chối yêu cầu này không?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/schedules/requests/${id}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("❌ Đã từ chối yêu cầu!");
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      console.error("Lỗi khi từ chối:", err);
      alert("Không thể từ chối yêu cầu.");
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4 fw-bold text-uppercase">
        Quản lý Yêu cầu Lịch làm việc
      </h3>

      {/* Bảng danh sách yêu cầu */}
      <div className="table-responsive card shadow-sm p-3 mb-4">
        <Table hover className="align-middle">
          <thead className="table-success">
            <tr>
              <th>ID</th>
              <th>Bác sĩ</th>
              <th>Ghi chú</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  ⏳ Đang tải dữ liệu...
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.requestId}>
                  <td>{r.requestId}</td>
                  <td>{r.doctorName}</td>
                  <td>{r.note || "Không có"}</td>
                  <td>{new Date(r.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <span
                      className={`badge ${
                        r.status === "Approved"
                          ? "bg-success"
                          : r.status === "Rejected"
                          ? "bg-danger"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {r.status === "Approved"
                        ? "Đã duyệt"
                        : r.status === "Rejected"
                        ? "Từ chối"
                        : "Đang chờ"}
                    </span>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => fetchDetail(r.requestId)}
                    >
                      <FaEye /> Chi tiết
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal chi tiết yêu cầu */}
      <Modal
        show={!!selectedRequest}
        onHide={() => setSelectedRequest(null)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {modalLoading
              ? "Đang tải..."
              : `Chi tiết yêu cầu #${selectedRequest?.request.requestId}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalLoading ? (
            <div className="text-center py-3">
              <Spinner animation="border" />
            </div>
          ) : selectedRequest ? (
            <>
              <p>
                <b>Bác sĩ:</b> {selectedRequest.request.doctorName}
              </p>
              <p>
                <b>Ngày tạo:</b>{" "}
                {new Date(selectedRequest.request.createdAt).toLocaleString(
                  "vi-VN"
                )}
              </p>
              <p>
                <b>Ghi chú:</b> {selectedRequest.request.note || "Không có"}
              </p>
              <p>
                <b>Trạng thái:</b>{" "}
                <span
                  className={`badge ${
                    selectedRequest.request.status === "Approved"
                      ? "bg-success"
                      : selectedRequest.request.status === "Rejected"
                      ? "bg-danger"
                      : "bg-warning text-dark"
                  }`}
                >
                  {selectedRequest.request.status}
                </span>
              </p>

              <h6 className="mt-4 fw-semibold">Danh sách ca làm việc:</h6>
              <div className="table-responsive mt-2">
                <Table bordered className="text-center">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Ngày</th>
                      <th>Giờ làm</th>
                      <th>Phòng</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRequest.schedules.map((s, i) => (
                      <tr key={s.scheduleId}>
                        <td>{i + 1}</td>
                        <td>
                          {new Date(s.workDate).toLocaleDateString("vi-VN")}
                        </td>
                        <td>
                          {new Date(s.startTime)
                            .getUTCHours()
                            .toString()
                            .padStart(2, "0")}
                          :
                          {new Date(s.startTime)
                            .getUTCMinutes()
                            .toString()
                            .padStart(2, "0")}{" "}
                          -{" "}
                          {new Date(s.endTime)
                            .getUTCHours()
                            .toString()
                            .padStart(2, "0")}
                          :
                          {new Date(s.startTime)
                            .getUTCMinutes()
                            .toString()
                            .padStart(2, "0")}
                        </td>
                        <td>{s.roomId ? `Phòng ${s.roomId}` : "Chưa có"}</td>
                        <td>
                          <span
                            className={`badge ${
                              s.status === "Approved"
                                ? "bg-success"
                                : s.status === "Rejected"
                                ? "bg-danger"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          ) : null}
        </Modal.Body>
        {selectedRequest && selectedRequest.request.status === "Pending" && (
          <Modal.Footer>
            <Button
              variant="success"
              onClick={() => handleApprove(selectedRequest.request.requestId)}
            >
              <FaCheck className="me-1" /> Duyệt
            </Button>
            <Button
              variant="danger"
              onClick={() => handleReject(selectedRequest.request.requestId)}
            >
              <FaTimes className="me-1" /> Từ chối
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    </div>
  );
}
