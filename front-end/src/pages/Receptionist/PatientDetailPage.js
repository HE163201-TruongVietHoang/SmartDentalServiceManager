import React, { useEffect, useState } from "react";
import { Card, Spinner, Alert, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import ReceptionistLayout from "./ReceptionistLayout";

function PatientDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPatientDetail = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/patients/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.message || "Không thể tải thông tin bệnh nhân"
          );
        setPatient(result.patient || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchPatientDetail();
  }, [userId, token]);

  return (
    <div className="container mt-4">
      <Button variant="secondary" onClick={() => navigate(-1)}>
        ← Quay lại
      </Button>

      <h3 className="fw-bold mb-4 text-center text-uppercase">
        Thông tin chi tiết bệnh nhân
      </h3>

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Đang tải thông tin...</p>
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && patient && (
        <Card className="shadow-sm p-4">
          <Card.Body>
            <h5 className="fw-bold mb-3">{patient.fullName}</h5>
            <p>
              <strong>Email:</strong> {patient.email || "—"}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {patient.phone || "—"}
            </p>
            <p>
              <strong>Giới tính:</strong>{" "}
              {patient.gender === "Male"
                ? "Nam"
                : patient.gender === "Female"
                ? "Nữ"
                : "Khác"}
            </p>
            <p>
              <strong>Ngày sinh:</strong>{" "}
              {patient.dob
                ? new Date(patient.dob).toLocaleDateString("vi-VN")
                : "—"}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {patient.address || "—"}
            </p>
            <p>
              <strong>Ghi chú y tế:</strong> {patient.note || "Không có"}
            </p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default PatientDetailPage;
