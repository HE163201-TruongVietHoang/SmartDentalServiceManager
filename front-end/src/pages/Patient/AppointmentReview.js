import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../components/home/Header/Header";
import Footer from "../../components/home/Footer/Footer";
import DoctorRating from "../../components/doctor/DoctorRating";
import ServiceRating from "../../components/service/ServiceRating";

export default function AppointmentReview() {
  const { appointmentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy doctorId và serviceId từ URL params
  const doctorId = parseInt(searchParams.get("doctorId"));
  const serviceId = searchParams.get("serviceId") ? parseInt(searchParams.get("serviceId")) : null;

  // Lấy thông tin appointment
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/appointments/${appointmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Không thể tải thông tin lịch hẹn");

        const data = await res.json();
        setAppointment(data);
      } catch (err) {
        console.error(err);
        alert("Không thể tải thông tin lịch hẹn!");
        navigate("/appointment/me");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, token, navigate]);

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3">Đang tải thông tin...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div>
        <Header />
        <div className="container py-5 text-center">
          <div className="alert alert-warning">
            <h5>⚠️ Không tìm thấy lịch hẹn</h5>
            <button
              className="btn btn-primary mt-3"
              onClick={() => navigate("/appointment/me")}
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <section className="py-5" style={{ backgroundColor: "#f7fdfc" }}>
        <div className="container">
          <div
            className="card shadow-lg border-0 p-4 mx-auto"
            style={{ maxWidth: "900px", borderRadius: "20px" }}
          >
            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="text-primary fw-bold">
                📋 Đánh giá cuộc hẹn
              </h2>
              <p className="text-muted">
                Chia sẻ trải nghiệm của bạn để giúp cải thiện chất lượng dịch vụ
              </p>
            </div>

            {/* Thông tin cuộc hẹn */}
            <div
              className="mb-4 p-4"
              style={{
                backgroundColor: "#e8f5f3",
                borderRadius: "15px",
                border: "2px solid #2ECCB6",
              }}
            >
              <h5 className="mb-3 text-primary">
                🗓️ Thông tin cuộc hẹn
              </h5>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <p className="mb-2">
                    <strong>👨‍⚕️ Bác sĩ:</strong>{" "}
                    <span className="text-primary">
                      {appointment.doctorName || "Không rõ"}
                    </span>
                  </p>
                  <p className="mb-2">
                    <strong>📅 Ngày khám:</strong>{" "}
                    {appointment.workDate || "Không rõ"}
                  </p>
                </div>
                <div className="col-md-6 mb-2">
                  <p className="mb-2">
                    <strong>🕐 Khung giờ:</strong>{" "}
                    {appointment.startTime} - {appointment.endTime}
                  </p>
                  <p className="mb-2">
                    <strong>💊 Dịch vụ:</strong>{" "}
                    {appointment.serviceName || "Không rõ"}
                  </p>
                </div>
              </div>
            </div>

            {/* Đánh giá bác sĩ */}
            <div
              className="mb-4 p-4"
              style={{
                backgroundColor: "#fff",
                borderRadius: "15px",
                border: "1px solid #dee2e6",
              }}
            >
              <DoctorRating doctorId={doctorId} appointmentId={parseInt(appointmentId)} />
            </div>

            {/* Đánh giá dịch vụ */}
            {serviceId && (
              <div
                className="mb-4 p-4"
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "15px",
                  border: "1px solid #dee2e6",
                }}
              >
                <ServiceRating serviceId={serviceId} appointmentId={parseInt(appointmentId)} />
              </div>
            )}

            {/* Nút quay lại */}
            <div className="text-center mt-4">
              <button
                type="button"
                className="btn btn-lg px-5"
                style={{
                  backgroundColor: "#2ECCB6",
                  color: "white",
                  borderRadius: "25px",
                }}
                onClick={() => navigate("/appointment/me")}
              >
                ✅ Hoàn tất
              </button>
            </div>

            {/* Note nhỏ */}
            <div className="text-center mt-3">
              <small className="text-muted">
                💡 Bạn có thể quay lại trang này bất cứ lúc nào để chỉnh sửa đánh giá
              </small>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
