import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaCheck, FaTimes } from "react-icons/fa";

export default function ScheduleRequests() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);

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
        <table className="table table-hover align-middle">
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
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => fetchDetail(r.requestId)}
                    >
                      <FaEye /> Chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Chi tiết yêu cầu (hiển thị khi chọn) */}
      {selectedRequest && (
        <div className="card p-4 shadow-sm">
          <h5 className="fw-bold mb-3 text-success">
            Chi tiết yêu cầu #{selectedRequest.request.requestId}
          </h5>
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
            <table className="table table-bordered text-center">
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
                    <td>{new Date(s.workDate).toLocaleDateString("vi-VN")}</td>
                    <td>
                      {new Date(s.startTime).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(s.endTime).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
            </table>
          </div>

          {selectedRequest.request.status === "Pending" && (
            <div className="mt-4 d-flex justify-content-center gap-3">
              <button
                className="btn btn-success fw-semibold"
                onClick={() => handleApprove(selectedRequest.request.requestId)}
              >
                <FaCheck className="me-1" /> Duyệt
              </button>
              <button
                className="btn btn-danger fw-semibold"
                onClick={() => handleReject(selectedRequest.request.requestId)}
              >
                <FaTimes className="me-1" /> Từ chối
              </button>
            </div>
          )}

          <div className="text-center mt-3">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setSelectedRequest(null)}
            >
              ← Quay lại danh sách
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
