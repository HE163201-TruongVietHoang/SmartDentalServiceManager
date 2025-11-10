import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DoctorCreateSchedule() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([
    { workDate: "", startTime: "08:00", endTime: "09:00" },
  ]);
  const [note, setNote] = useState("");
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  const addSlot = () =>
    setSlots((s) => [
      ...s,
      { workDate: "", startTime: "08:00", endTime: "09:00" },
    ]);

  const removeSlot = (idx) => setSlots((s) => s.filter((_, i) => i !== idx));

  const updateSlot = (idx, key, value) =>
    setSlots((s) =>
      s.map((it, i) => (i === idx ? { ...it, [key]: value } : it))
    );

  const checkAvailability = async () => {
    setChecking(true);
    setAvailability(null);
    try {
      const res = await fetch(
        "http://localhost:5000/api/schedules/doctor/check-availability",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schedules: slots }),
        }
      );
      const data = await res.json();
      setAvailability(data.result || []);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi kiểm tra phòng trống");
    } finally {
      setChecking(false);
    }
  };

  const submitRequest = async () => {
    if (!token) return navigate("/signin");
    if (!availability || availability.some((a) => !a.available)) {
      alert("Vui lòng kiểm tra phòng trống và đảm bảo tất cả khung giờ rảnh.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/schedules/doctor/create-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ note, schedules: slots }),
        }
      );

      const data = await res.json();
      if (res.status === 201) {
        alert("Gửi yêu cầu tạo lịch thành công!");
        navigate("/doctor/schedule");
      } else if (res.status === 207) {
        alert("Một số khung giờ đã bị đầy, vui lòng điều chỉnh.");
        setAvailability(
          data.unavailable?.map((u) => ({ ...u, available: false })) || []
        );
      } else {
        alert(data.message || "Lỗi khi gửi yêu cầu");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi server khi gửi yêu cầu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#f0fffa", minHeight: "100vh" }}>
      {/* Main Form Section */}
      <section className="py-5">
        <div className="container" style={{ maxWidth: 900 }}>
          <div
            className="card shadow-sm border-0 p-4"
            style={{ borderRadius: "15px" }}
          >
            <h4 className="fw-bold mb-4" style={{ color: "#2ECCB6" }}>
              Nhập thông tin lịch làm việc
            </h4>

            {/* Note Input */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Ghi chú (tuỳ chọn)
              </label>
              <input
                className="form-control"
                placeholder="Ví dụ: Ca sáng trong tuần"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* Slots */}
            <div className="mb-4">
              <h5 className="fw-bold mb-3">Danh sách khung giờ</h5>
              {slots.map((slot, idx) => (
                <div
                  key={idx}
                  className="row g-3 align-items-end mb-3"
                  style={{
                    backgroundColor: "#E8FAF6",
                    borderRadius: "10px",
                    padding: "15px",
                  }}
                >
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Ngày</label>
                    <input
                      type="date"
                      className="form-control"
                      value={slot.workDate}
                      onChange={(e) =>
                        updateSlot(idx, "workDate", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">
                      Bắt đầu
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      value={slot.startTime}
                      onChange={(e) =>
                        updateSlot(idx, "startTime", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">
                      Kết thúc
                    </label>
                    <input
                      type="time"
                      className="form-control"
                      value={slot.endTime}
                      onChange={(e) =>
                        updateSlot(idx, "endTime", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-2 text-end">
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => removeSlot(idx)}
                      disabled={slots.length === 1}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}

              <button
                className="btn btn-outline-primary"
                style={{ borderColor: "#2ECCB6", color: "#2ECCB6" }}
                onClick={addSlot}
              >
                <i className="fas fa-plus me-2"></i> Thêm khung giờ
              </button>
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-3 mb-4 flex-wrap">
              <button
                className="btn btn-lg px-4"
                style={{
                  backgroundColor: "#2ECCB6",
                  color: "#fff",
                  border: "none",
                }}
                onClick={checkAvailability}
                disabled={checking}
              >
                {checking ? "Đang kiểm tra..." : "Kiểm tra phòng trống"}
              </button>
              <button
                className="btn btn-lg btn-outline-success px-4"
                onClick={submitRequest}
                disabled={
                  submitting ||
                  !availability ||
                  availability.some((a) => !a.available)
                }
              >
                {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>

            {/* Availability Result */}
            {availability && (
              <div className="card border-0 shadow-sm p-3 mt-3">
                <h6 className="fw-bold mb-3">Kết quả kiểm tra</h6>
                <ul className="list-group list-group-flush">
                  {availability.map((a, i) => (
                    <li
                      key={i}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{a.workDate}</strong> — {a.startTime} →{" "}
                        {a.endTime}
                        <div className="small text-muted">
                          {a.available
                            ? `Phòng: ${a.room.roomName}`
                            : "Không có phòng trống"}
                        </div>
                      </div>
                      {a.available ? (
                        <span className="badge bg-success">Rảnh</span>
                      ) : (
                        <span className="badge bg-danger">Hết</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
