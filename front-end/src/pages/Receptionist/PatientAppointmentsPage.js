import React, { useEffect, useState } from "react";
import { Table, Spinner, Alert } from "react-bootstrap";
import axios from "axios";

function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token"); // Lưu token của user

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Lấy danh sách tất cả lịch hẹn
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

  // Khi click vào status "Scheduled" -> chuyển sang "InProgress"
  const handleStatusClick = async (appointment) => {
    if (appointment.status !== "Scheduled") return; // chỉ xử lý Scheduled
    try {
      const res = await axios.put(
        `http://localhost:5000/api/appointments/${appointment.appointmentId}/inprogress`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        // Cập nhật trạng thái ngay trong state
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

  if (loading) return <Spinner animation="border" className="m-3" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-4">
      <h3 className="fw-bold mb-4 text-center text-uppercase">
        Danh sách lịch hẹn
      </h3>
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
          {appointments.map((appointment) => (
            <tr key={appointment.appointmentId}>
              <td>{appointment.appointmentId}</td>
              <td>{appointment.patientName || "Không rõ"}</td>
              <td>{appointment.doctorName || "Không rõ"}</td>
              <td>
                {" "}
                {appointment.workDate
                  ? new Date(appointment.workDate).toLocaleDateString("vi-VN")
                  : "—"}{" "}
              </td>{" "}
              <td>
                {" "}
                {appointment.startTime && appointment.endTime
                  ? `${appointment.startTime} - ${appointment.endTime}`
                  : "—"}{" "}
              </td>
              <td
                onClick={() => handleStatusClick(appointment)}
                style={{
                  cursor:
                    appointment.status === "Scheduled" ? "pointer" : "default",
                  fontWeight: "500",
                  textAlign: "center",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
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
    </div>
  );
}

export default PatientAppointmentsPage;
