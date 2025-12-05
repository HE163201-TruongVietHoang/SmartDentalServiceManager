import React, { useEffect, useState } from "react";
import { Table, Spinner, Alert, Form } from "react-bootstrap";
import axios from "axios";

function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]); // list after filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    applyFilter(statusFilter);
  }, [appointments, statusFilter]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data.data || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleStatusClick = async (appointment) => {
    if (appointment.status !== "Scheduled") return;

    try {
      const res = await axios.put(
        `http://localhost:5000/api/appointments/${appointment.appointmentId}/inprogress`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setAppointments((prev) =>
          prev.map((a) =>
            a.appointmentId === appointment.appointmentId
              ? { ...a, status: "InProgress" }
              : a
          )
        );
      }
    } catch (err) {
      console.error("Lỗi khi đổi trạng thái:", err);
    }
  };

  // Filter theo trạng thái
  const applyFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);

    if (status === "All") {
      setFiltered(appointments);
    } else {
      setFiltered(appointments.filter((a) => a.status === status));
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / pageSize);
  const start = (currentPage - 1) * pageSize;
  const paginatedData = filtered.slice(start, start + pageSize);

  if (loading) return <Spinner animation="border" className="m-3" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-4">
      <h3 className="fw-bold mb-4 text-center text-uppercase">
        Danh sách lịch hẹn
      </h3>

      {/* Bộ lọc trạng thái */}
      <div className="d-flex justify-content-end mb-3">
        <Form.Select
          style={{ width: "200px" }}
          value={statusFilter}
          onChange={(e) => applyFilter(e.target.value)}
        >
          <option value="All">Tất cả</option>
          <option value="Scheduled">Scheduled</option>
          <option value="InProgress">InProgress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </Form.Select>
      </div>

      <Table striped bordered hover>
        <thead className="table-success text-center">
          <tr>
            <th>#</th>
            <th>Tên bệnh nhân</th>
            <th>Bác sĩ</th>
            <th>Ngày khám</th>
            <th>Khung giờ</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((appointment) => (
            <tr key={appointment.appointmentId}>
              <td>{appointment.appointmentId}</td>
              <td>{appointment.patientName || "Không rõ"}</td>
              <td>{appointment.doctorName || "Không rõ"}</td>
              <td>
                {appointment.workDate
                  ? new Date(appointment.workDate).toLocaleDateString("vi-VN")
                  : "—"}
              </td>
              <td>
                {appointment.startTime && appointment.endTime
                  ? `${appointment.startTime} - ${appointment.endTime}`
                  : "—"}
              </td>

              <td
                onClick={() => handleStatusClick(appointment)}
                style={{
                  cursor:
                    appointment.status === "Scheduled" ? "pointer" : "default",
                  textAlign: "center",
                }}
              >
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "12px",
                    color: "#fff",
                    backgroundColor:
                      appointment.status === "Scheduled"
                        ? "#2ECCB6"
                        : appointment.status === "InProgress"
                        ? "#3498DB"
                        : appointment.status === "Completed"
                        ? "#27AE60"
                        : appointment.status === "Cancelled"
                        ? "#E74C3C"
                        : "#7f8c8d",
                  }}
                >
                  {appointment.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3 gap-2">
          <button
            className="btn btn-outline-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ←
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`btn ${
                currentPage === i + 1 ? "btn-success" : "btn-outline-secondary"
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="btn btn-outline-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

export default PatientAppointmentsPage;
