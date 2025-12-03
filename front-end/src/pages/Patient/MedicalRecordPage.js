import React, { useState, useEffect } from "react";
import Header from "../../components/home/Header/Header";
import Footer from "../../components/home/Footer/Footer";
import { toast } from "react-toastify";

export default function MedicalRecordPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

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
        console.error("Lỗi API:", err);
        toast.error("Không thể tải hồ sơ khám bệnh.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, []);

  const badgeColor = (status) => {
    switch (status) {
      case "Completed":
        return "success";
      case "DiagnosisCompleted":
        return "info";
      case "Scheduled":
        return "primary";
      case "Cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <div>
      <Header />

      <section className="py-5" style={{ backgroundColor: "#f7fdfc" }}>
        <div className="container">
          <h2
            className="fw-bold mb-4 text-center"
            style={{ color: "#2ECCB6", fontSize: "2rem" }}
          >
            Hồ Sơ Khám Bệnh
          </h2>

          <p className="text-center text-muted mb-5">
            Xin chào <strong>{user.fullName}</strong>, đây là lịch sử khám bệnh
            chi tiết của bạn.
          </p>

          {loading ? (
            <p className="text-center">Đang tải...</p>
          ) : records.length === 0 ? (
            <div className="alert alert-info text-center">
              Bạn chưa có hồ sơ khám bệnh nào.
            </div>
          ) : (
            <div className="row g-4">
              {records.map((r) => (
                <div className="col-md-6" key={r.appointmentId}>
                  <div
                    className="card shadow-sm border-0"
                    style={{ borderRadius: "16px" }}
                  >
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="fw-bold mb-0">
                          Cuộc hẹn #{r.appointmentId}
                        </h5>
                        <span
                          className={`badge bg-${badgeColor(
                            r.appointmentStatus
                          )}`}
                        >
                          {r.appointmentStatus}
                        </span>
                      </div>

                      <hr />

                      <p>
                        <strong>Ngày khám:</strong> {r.workDate?.split("T")[0]}
                      </p>
                      <p>
                        <strong>Giờ:</strong> {r.startTime} - {r.endTime}
                      </p>
                      <p>
                        <strong>Bác sĩ:</strong> {r.doctorName}
                      </p>
                      <p>
                        <strong>Lý do:</strong> {r.reason}
                      </p>

                      {/* Diagnosis */}
                      {r.diagnosis && (
                        <div className="mt-3">
                          <h6 className="fw-bold" style={{ color: "#2ECCB6" }}>
                            Chẩn đoán
                          </h6>

                          <p>
                            <strong>Triệu chứng:</strong> {r.diagnosis.symptoms}
                          </p>
                          <p>
                            <strong>Kết quả:</strong>{" "}
                            {r.diagnosis.diagnosisResult}
                          </p>
                          <p>
                            <strong>Ghi chú:</strong> {r.diagnosis.doctorNote}
                          </p>

                          <h6 className="fw-bold mt-3">Dịch vụ thực hiện</h6>

                          {r.diagnosis.services.length > 0 ? (
                            <ul className="mb-0">
                              {r.diagnosis.services.map((svc, i) => (
                                <li key={i}>
                                  {svc.serviceName}
                                  <span className="badge bg-secondary ms-2">
                                    {svc.status}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>Không có dịch vụ.</p>
                          )}
                        </div>
                      )}

                      {/* Prescription */}
                      {r.prescription.length > 0 && (
                        <div className="mt-4">
                          <h6 className="fw-bold" style={{ color: "#2ECCB6" }}>
                            Đơn thuốc
                          </h6>

                          <ul className="list-group">
                            {r.prescription.map((med, idx) => (
                              <li
                                key={idx}
                                className="list-group-item border-0 ps-0"
                                style={{ backgroundColor: "transparent" }}
                              >
                                <strong>{med.medicineName}</strong>
                                <br />
                                <span className="text-muted">
                                  Liều dùng: {med.dosage}
                                </span>
                                <br />
                                <span className="text-muted">
                                  Số lượng: {med.quantity}
                                </span>
                                <br />
                                <span className="text-muted">
                                  Hướng dẫn: {med.usageInstruction}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Invoice */}
                      {r.invoice && (
                        <div className="mt-4">
                          <h6 className="fw-bold" style={{ color: "#2ECCB6" }}>
                            Hóa đơn
                          </h6>
                          <p>
                            <strong>Thành tiền:</strong> {r.invoice.finalAmount}
                            đ
                          </p>
                          <span className="badge bg-success">
                            {r.invoice.status}
                          </span>
                        </div>
                      )}

                      {/* Payment */}
                      {r.payments.length > 0 && (
                        <div className="mt-4">
                          <h6 className="fw-bold">Thanh toán</h6>
                          {r.payments.map((p, i) => (
                            <p key={i}>
                              <strong>{p.paymentMethod}:</strong> {p.amount}đ
                              <span className="badge bg-success ms-2">
                                {p.status}
                              </span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
