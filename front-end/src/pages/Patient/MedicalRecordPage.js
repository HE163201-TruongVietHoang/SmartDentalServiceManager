import React, { useState, useEffect } from "react";
import { ClipboardList, Stethoscope, Pill, Receipt } from "lucide-react";

import Header from "../../components/home/Header/Header";
import Footer from "../../components/home/Footer/Footer";

export default function MedicalRecordPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/patients/${user.userId}/medical-record`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setRecords(data.medicalRecord || []);
      } catch (err) {
        console.error("API error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, []);

  const badgeColor = (status) => {
    switch (status) {
      case "Completed":
        return "badge bg-success";
      case "Cancelled":
        return "badge bg-danger";
      case "DiagnosisCompleted":
        return "badge bg-info";
      default:
        return "badge bg-secondary";
    }
  };

  return (
    <>
      <Header />

      <div className="min-vh-100 py-4" style={{ backgroundColor: "#f5f7f8" }}>
        <div className="container">
          <h1 className="text-center fw-bold mb-2" style={{ color: "#2ECCB6" }}>
            Hồ Sơ Khám Bệnh
          </h1>
          <p className="text-center text-muted mb-4">
            Danh sách các lần khám bệnh của bạn.
          </p>

          {loading ? (
            <p className="text-center text-muted">Đang tải...</p>
          ) : records.length === 0 ? (
            <div className="alert alert-info text-center">
              Bạn chưa có hồ sơ khám bệnh nào.
            </div>
          ) : (
            <div className="row g-4">
              {records.map((r) => (
                <div key={r.appointmentId} className="col-12">
                  <div className="card shadow-sm border-0">
                    <div className="card-body px-4 py-3">
                      {/* SUMMARY ROW */}
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5
                            className="fw-bold d-flex align-items-center gap-2 mb-2"
                            style={{ color: "#2ECCB6" }}
                          >
                            <ClipboardList size={20} /> Khám #{r.appointmentId}
                          </h5>
                          <div className="row text-muted small">
                            <div className="col-md-6">
                              📅 <strong>Ngày:</strong>{" "}
                              {r.workDate?.split("T")[0]}
                            </div>
                            <div className="col-md-6">
                              ⏰ <strong>Giờ:</strong> {r.startTime} -{" "}
                              {r.endTime}
                            </div>
                            <div className="col-md-6 mt-1">
                              👤 <strong>Bệnh nhân:</strong> {user.fullName}
                            </div>
                            <div className="col-md-6 mt-1">
                              🧑‍⚕️ <strong>Bác sĩ:</strong> {r.doctorName}
                            </div>
                          </div>
                        </div>

                        <div className="text-end">
                          <span
                            className={`${badgeColor(
                              r.appointmentStatus
                            )} mb-2 d-inline-block`}
                          >
                            {r.appointmentStatus}
                          </span>
                          <br />
                          <button
                            className="btn btn-sm text-white mt-2 px-3"
                            style={{ backgroundColor: "#2ECCB6" }}
                            onClick={() =>
                              setOpenId(
                                openId === r.appointmentId
                                  ? null
                                  : r.appointmentId
                              )
                            }
                          >
                            {openId === r.appointmentId
                              ? "Ẩn chi tiết"
                              : "Xem chi tiết"}
                          </button>
                        </div>
                      </div>

                      {/* DETAILS */}
                      {openId === r.appointmentId && (
                        <div className="mt-4 pt-3 border-top">
                          {/* DIAGNOSIS */}
                          {r.diagnosis && (
                            <div className="mb-3">
                              <h6
                                className="fw-bold d-flex align-items-center gap-2 mb-2"
                                style={{ color: "#2ECCB6" }}
                              >
                                <Stethoscope size={18} /> Chẩn đoán
                              </h6>
                              <p className="mb-1">
                                <strong>Triệu chứng:</strong>{" "}
                                {r.diagnosis.symptoms}
                              </p>
                              <p className="mb-1">
                                <strong>Kết luận:</strong>{" "}
                                {r.diagnosis.diagnosisResult}
                              </p>
                              <p className="mb-2">
                                <strong>Ghi chú:</strong>{" "}
                                {r.diagnosis.doctorNote}
                              </p>

                              <h6 className="fw-bold mt-3">
                                Dịch vụ đã thực hiện
                              </h6>
                              <ul className="small ms-3">
                                {r.diagnosis.services.map((svc, i) => (
                                  <li key={i}>
                                    {svc.serviceName}
                                    <span className="badge bg-secondary ms-2">
                                      {svc.status}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* PRESCRIPTIONS */}
                          {r.prescription.length > 0 && (
                            <div className="mb-3">
                              <h6
                                className="fw-bold d-flex align-items-center gap-2 mb-2"
                                style={{ color: "#2ECCB6" }}
                              >
                                <Pill size={18} /> Đơn thuốc
                              </h6>
                              <ul className="list-group small">
                                {r.prescription.map((med, idx) => (
                                  <li key={idx} className="list-group-item">
                                    <strong>{med.medicineName}</strong>
                                    <br />
                                    Liều dùng: {med.dosage}
                                    <br />
                                    Số lượng: {med.quantity}
                                    <br />
                                    Hướng dẫn: {med.usageInstruction}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* INVOICE */}
                          {r.invoice && (
                            <div className="mb-2">
                              <h6
                                className="fw-bold d-flex align-items-center gap-2 mb-2"
                                style={{ color: "#2ECCB6" }}
                              >
                                <Receipt size={18} /> Hóa đơn
                              </h6>
                              <p className="small mb-1">
                                <strong>Thành tiền:</strong>{" "}
                                {r.invoice.finalAmount}đ
                              </p>
                              <span className="badge bg-success">
                                {r.invoice.status}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
