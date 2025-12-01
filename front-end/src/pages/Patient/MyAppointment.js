import React, { useState, useEffect } from "react";
import Header from "../../components/home/Header/Header";
import Footer from "../../components/home/Footer/Footer";
import { useNavigate } from "react-router-dom";

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // 🔹 Lấy danh sách lịch hẹn của user
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/appointments/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Không thể tải lịch hẹn");

      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error("Lỗi khi tải lịch hẹn:", err);
      if (err.message.includes("401")) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("token");
        navigate("/signin");
      } else {
        alert("Không thể tải lịch hẹn. Vui lòng thử lại sau!");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // 🔹 Hủy lịch hẹn
  const handleCancel = async (id) => {
    if (!window.confirm("Bạn có chắc muốn hủy lịch hẹn này?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/appointments/${id}/cancel`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json(); // luôn đọc JSON

      // 🔹 TH1: Token hết hạn → backend trả 401
      if (res.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("token");
        navigate("/signin");
        return;
      }

      // 🔹 TH2: Tài khoản bị khóa
      if (data.code === "ACCOUNT_LOCKED") {
        alert(data.message);
        localStorage.removeItem("token");
        localStorage.removeItem("sessionId");
        localStorage.removeItem("user");
        navigate("/signin");
        return;
      }

      // 🔹 TH3: Hủy không được vì lý do khác
      if (!res.ok || !data.success) {
        alert(data.message || "Không thể hủy lịch hẹn!");
        return;
      }

      // 🔹 Thành công
      alert("Hủy lịch hẹn thành công!");
      fetchAppointments();
    } catch (err) {
      console.error(err);
      alert("Không thể hủy lịch hẹn. Vui lòng thử lại!");
    }
  };

  return (
    <div>
      <Header />
      <section className="py-5" style={{ backgroundColor: "#f7fdfc" }}>
        <div className="container">
          <h3 className="mb-4 text-primary text-center">Lịch hẹn của tôi</h3>

          {loading ? (
            <p className="text-center">Đang tải...</p>
          ) : appointments.length === 0 ? (
            <p className="text-center">Bạn chưa có lịch hẹn nào.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead className="table-primary">
                  <tr>
                    <th>Bác sĩ</th>
                    <th>Ngày</th>
                    <th>Khung giờ</th>
                    <th>Loại khám</th>
                    <th>Trạng thái</th>
                    <th style={{ width: "200px" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a.appointmentId}>
                      <td>{a.doctorName || a.doctor?.fullName}</td>
                      <td>{a.workDate}</td>
                      <td>
                        {a.startTime} - {a.endTime}
                      </td>
                      <td>
                        {a.appointmentType === "tai kham"
                          ? "Tái khám"
                          : "Khám lần đầu"}
                      </td>
                      <td>{a.status}</td>
                      <td>
                        <div className="d-flex gap-2">
                          {a.status === "Scheduled" && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancel(a.appointmentId)}
                            >
                              Hủy
                            </button>
                          )}
                          {a.status === "Completed" && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() =>
                                navigate(
                                  `/appointment/${
                                    a.appointmentId
                                  }/review?doctorId=${a.doctorId}&serviceId=${
                                    a.serviceId || ""
                                  }`
                                )
                              }
                            >
                              Đánh giá
                            </button>
                          )}
                          {a.status !== "Scheduled" &&
                            a.status !== "Completed" &&
                            ""}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
