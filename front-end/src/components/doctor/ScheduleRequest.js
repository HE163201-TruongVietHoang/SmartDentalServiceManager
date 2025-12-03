import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../home/Header/Header";
import { toast } from "react-toastify";

export default function ScheduleRequest() {
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
      toast.error("Lỗi khi kiểm tra availability");
    } finally {
      setChecking(false);
    }
  };

  const submitRequest = async () => {
    if (!token) return navigate("/signin");
    // ensure availability exists and all are available
    if (!availability || availability.some((a) => !a.available)) {
      toast.warning(
        "Vui lòng kiểm tra availability và đảm bảo tất cả slot rảnh trước khi gửi."
      );
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
        toast.success("Gửi yêu cầu tạo lịch thành công. Chờ admin duyệt.");
        navigate("/doctor/home");
      } else if (res.status === 207) {
        toast.warning(
          "Một số khung giờ đã bị đầy, vui lòng kiểm tra và điều chỉnh."
        );
        setAvailability(
          data.unavailable?.map((u) => ({ ...u, available: false })) || []
        );
      } else {
        toast.error(data.message || "Lỗi khi gửi yêu cầu");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi server khi gửi yêu cầu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container my-5" style={{ maxWidth: 900 }}>
        <h3 className="mb-4">Tạo yêu cầu lịch làm việc</h3>

        <div className="mb-3">
          <label className="form-label">Ghi chú (tùy chọn)</label>
          <input
            className="form-control"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <h5>Danh sách khung giờ</h5>
          {slots.map((slot, idx) => (
            <div key={idx} className="d-flex gap-2 align-items-end mb-2">
              <div style={{ flex: 1 }}>
                <label className="form-label small">Ngày</label>
                <input
                  type="date"
                  className="form-control"
                  value={slot.workDate}
                  onChange={(e) => updateSlot(idx, "workDate", e.target.value)}
                />
              </div>
              <div>
                <label className="form-label small">Bắt đầu</label>
                <input
                  type="time"
                  className="form-control"
                  value={slot.startTime}
                  onChange={(e) => updateSlot(idx, "startTime", e.target.value)}
                />
              </div>
              <div>
                <label className="form-label small">Kết thúc</label>
                <input
                  type="time"
                  className="form-control"
                  value={slot.endTime}
                  onChange={(e) => updateSlot(idx, "endTime", e.target.value)}
                />
              </div>
              <div>
                <button
                  className="btn btn-outline-danger"
                  onClick={() => removeSlot(idx)}
                  disabled={slots.length === 1}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}

          <div>
            <button className="btn btn-sm btn-secondary" onClick={addSlot}>
              Thêm khung giờ
            </button>
          </div>
        </div>

        <div className="mb-4">
          <button
            className="btn btn-primary me-2"
            onClick={checkAvailability}
            disabled={checking}
          >
            {checking ? "Đang kiểm tra..." : "Kiểm tra phòng trống"}
          </button>
          <button
            className="btn btn-success"
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

        {availability && (
          <div className="card p-3">
            <h6>Kết quả kiểm tra</h6>
            <ul className="list-group list-group-flush">
              {availability.map((a, i) => (
                <li
                  key={i}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <div>
                      <strong>{a.workDate}</strong> {a.startTime} → {a.endTime}
                    </div>
                    <div className="small text-muted">
                      {a.available
                        ? `Phòng: ${a.room.roomName}`
                        : "Không có phòng trống"}
                    </div>
                  </div>
                  <div>
                    {a.available ? (
                      <span className="badge bg-success">Rảnh</span>
                    ) : (
                      <span className="badge bg-danger">Hết</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
