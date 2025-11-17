import React, { useEffect, useState } from "react";
import ReceptionistLayout from "./ReceptionistLayout"; // ✅ đúng vị trí trong pages/Receptionist/
import { Table, Spinner, Alert } from "react-bootstrap";

function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/appointments", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || `Lỗi: ${response.status}`);
        }

        // ✅ backend trả về { success, data: [...] }
        setAppointments(result.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchAppointments();
  }, [token]);

  return (
    <div className="container mt-4">
      <h3 className="fw-bold mb-4 text-center text-uppercase">
        Danh sách lịch khám bệnh nhân
      </h3>

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Đang tải dữ liệu...</p>
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && appointments.length === 0 && (
        <Alert variant="info" className="text-center">
          Hiện chưa có lịch khám nào.
        </Alert>
      )}

      {!loading && appointments.length > 0 && (
        <div className="table-responsive shadow-sm">
          <Table striped bordered hover className="align-middle">
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
              {appointments.map((item, index) => (
                <tr key={item.id || index}>
                  <td className="text-center">{index + 1}</td>
                  <td>
                    {item.patientName || item.patient?.fullName || "Không rõ"}
                  </td>
                  <td>
                    {item.doctorName || item.doctor?.fullName || "Không rõ"}
                  </td>
                  <td className="text-center">
                    {item.workDate
                      ? new Date(item.workDate).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  <td className="text-center">
                    {item.startTime && item.endTime
                      ? `${item.startTime} - ${item.endTime}`
                      : "—"}
                  </td>
                  <td className="text-center">
                    <span
                      className={`badge ${
                        item.status === "confirmed"
                          ? "bg-success"
                          : item.status === "pending"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default PatientAppointmentsPage;
