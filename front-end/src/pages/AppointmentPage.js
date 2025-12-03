import React, { useState, useEffect } from "react";
import { socket } from "../api/socket";
import Header from "../components/home/Header/Header";
import Footer from "../components/home/Footer/Footer";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AppointmentPage() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState("");
  const [appointmentType, setAppointmentType] = useState("tái khám");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const patientId = user?.userId;

  // 🔹 Lấy danh sách bác sĩ
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/doctors");
        if (!res.ok) throw new Error("Không thể tải danh sách bác sĩ");
        const data = await res.json();
        setDoctors(data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách bác sĩ:", err);
        toast.error("Không thể tải danh sách bác sĩ. Vui lòng thử lại sau!");
      }
    };
    fetchDoctors();
  }, []);

  // 🔹 Lấy slot trống khi chọn bác sĩ và ngày
  useEffect(() => {
    if (selectedDoctor && date) fetchSlots();
  }, [selectedDoctor, date]);

  // 🔹 Nhận realtime khi slot bị đặt
  useEffect(() => {
    if (!patientId) return;
    socket.on("slotBooked", ({ slotId }) => {
      setSlots((prev) =>
        prev.map((s) => (s.slotId === slotId ? { ...s, isBooked: 1 } : s))
      );
    });
    return () => socket.off("slotBooked");
  }, [patientId]);

  // 🔹 Hàm lấy slot
  const fetchSlots = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/appointments/slots?doctorId=${selectedDoctor}&date=${date}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Không thể tải khung giờ");

      let data = await res.json();
      const now = new Date();

      data = data.map((slot) => {
        const slotDateTime = new Date(`${date}T${slot.startTime}`);
        return {
          ...slot,
          isPast: slotDateTime < now,
        };
      });

      setSlots(data);
    } catch (err) {
      console.error("Lỗi khi lấy slot:", err);
      toast.error("Không thể tải danh sách khung giờ. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Xử lý đặt lịch
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientId) {
      toast.warning("Bạn cần đăng nhập để đặt lịch!");
      return navigate("/signin");
    }

    if (!selectedSlot) {
      toast.warning("Vui lòng chọn khung giờ!");
      return;
    }

    try {
      setLoading(true);
      const appointmentData = {
        patientId,
        doctorId: selectedDoctor,
        slotId: selectedSlot,
        reason,
        workDate: date,
        appointmentType,
      };

      const res = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw { response: { status: res.status, data: errData } };
      }

      toast.success("Đặt lịch thành công!");
      setReason("");
      setSelectedSlot(null);
      fetchSlots();
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        toast.warning("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("token");
        navigate("/signin");
      } else {
        toast.error(err.response?.data?.message || "Lỗi khi đặt lịch!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />

      <section className="py-5" style={{ backgroundColor: "#f7fdfc" }}>
        <div className="container">
          <div
            className="card shadow-sm border-0 p-4 mx-auto"
            style={{ maxWidth: "700px", borderRadius: "20px" }}
          >
            <h4
              className="fw-bold mb-4 text-center"
              style={{ color: "#2ECCB6" }}
            >
              Đặt lịch khám
            </h4>

            <form onSubmit={handleSubmit}>
              {/* Bác sĩ */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Bác sĩ</label>
                <select
                  className="form-select"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(Number(e.target.value))}
                  required
                >
                  <option value="">-- Chọn bác sĩ --</option>
                  {doctors.map((d) => (
                    <option key={d.userId} value={d.userId}>
                      {d.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ngày */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Ngày khám</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              {/* Khung giờ */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Khung giờ</label>
                <div className="d-flex flex-wrap gap-2">
                  {loading ? (
                    <p className="text-muted small">Đang tải khung giờ...</p>
                  ) : slots.length === 0 ? (
                    <p className="text-muted small">
                      Vui lòng chọn bác sĩ và ngày để xem khung giờ.
                    </p>
                  ) : (
                    slots.map((slot) => (
                      <button
                        key={slot.slotId}
                        type="button"
                        className={`btn px-3 py-2 rounded-pill ${
                          slot.isBooked || slot.isPast
                            ? "btn-secondary"
                            : selectedSlot === slot.slotId
                            ? "btn-success"
                            : "btn-outline-success"
                        }`}
                        disabled={slot.isBooked || slot.isPast}
                        onClick={() => setSelectedSlot(slot.slotId)}
                      >
                        {slot.startTime} - {slot.endTime}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Lý do */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Lý do khám</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Đau răng, kiểm tra định kỳ..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              {/* Loại khám */}
              <div className="mb-4">
                <label className="form-label fw-semibold">Loại khám</label>
                <select
                  className="form-select"
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                >
                  <option value="tai kham">Tái khám</option>
                  <option value="kham lan dau">Khám lần đầu</option>
                </select>
              </div>

              {/* Nút submit */}
              <div className="text-center">
                <button
                  type="submit"
                  className="btn btn-lg text-white px-5"
                  style={{ backgroundColor: "#2ECCB6" }}
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Đặt lịch ngay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
