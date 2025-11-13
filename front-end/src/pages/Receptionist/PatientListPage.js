import React, { useEffect, useState } from "react";
import { Table, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ReceptionistLayout from "./ReceptionistLayout";

function PatientListPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/patients", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();
        if (!response.ok)
          throw new Error(result.message || "Lỗi tải danh sách bệnh nhân");

        setPatients(result.patients || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchPatients();
  }, [token]);

  const handleViewDetail = (userId) => {
    navigate(`/receptionist/patients/${userId}`);
  };

  return (
    <div className="container mt-4">
      <h3 className="fw-bold mb-4 text-center text-uppercase">
        Quản lý bệnh nhân
      </h3>

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Đang tải danh sách bệnh nhân...</p>
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && patients.length === 0 && (
        <Alert variant="info" className="text-center">
          Hiện chưa có bệnh nhân nào trong hệ thống.
        </Alert>
      )}

      {!loading && patients.length > 0 && (
        <div className="table-responsive shadow-sm">
          <Table striped bordered hover className="align-middle">
            <thead className="table-success text-center">
              <tr>
                <th>#</th>
                <th>Tên bệnh nhân</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Ngày sinh</th>
                <th>Giới tính</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((item, index) => (
                <tr key={item.userId}>
                  <td className="text-center">{index + 1}</td>
                  <td
                    className="fw-semibold"
                    style={{ cursor: "pointer", color: "#2ECCB6" }}
                    onClick={() => handleViewDetail(item.userId)}
                  >
                    {item.fullName || "Không rõ"}
                  </td>
                  <td>{item.email || "—"}</td>
                  <td>{item.phone || "—"}</td>
                  <td className="text-center">
                    {item.dob
                      ? new Date(item.dob).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  <td className="text-center">
                    {item.gender === "Male"
                      ? "Nam"
                      : item.gender === "Female"
                      ? "Nữ"
                      : "Khác"}
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

export default PatientListPage;
