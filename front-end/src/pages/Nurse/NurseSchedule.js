import React, { useEffect, useState } from "react";
import { Table, Modal, Button } from "react-bootstrap";

export default function NurseScheduleTable() {
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/nurses/schedules", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("Schedules from backend:", data); // DEBUG
      if (res.ok) setSchedules(data.schedules);
      else console.error("Lỗi khi lấy lịch:", data.message);
    } catch (err) {
      console.error("Lỗi fetchSchedules:", err);
    }
  };

  const handleShiftClick = async (shiftId) => {
    console.log("Clicked shiftId:", shiftId); // DEBUG
    if (!shiftId) {
      console.error("shiftId undefined, không thể fetch chi tiết ca");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/nurses/schedules/${shiftId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      console.log("Shift detail from backend:", data); // DEBUG
      if (res.ok) {
        setSelectedShift(data.detail);
        setShowModal(true);
      } else {
        console.error("Lỗi khi lấy chi tiết ca:", data.message);
      }
    } catch (err) {
      console.error("Lỗi handleShiftClick:", err);
    }
  };

  const days = [
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
    "Chủ nhật",
  ];

  // Group schedules by day (0=Sunday, 1=Monday,...)
  const groupedByDay = days.map((day, idx) =>
    schedules.filter((s) => {
      const date = new Date(s.workDate);
      const dateDay = date.getDay() === 0 ? 7 : date.getDay(); // Sunday = 7
      return dateDay === idx + 1;
    })
  );

  return (
    <div className="container mt-4">
      <h2>Lịch làm việc y tá (Tuần)</h2>
      {/* Container cuộn dọc với chiều cao cố định */}
      <div style={{ maxHeight: "600px", overflowY: "auto" }}>
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Giờ / Thứ</th>
              {days.map((day) => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(24)].map((_, idx) => {
              const hour = idx; // 0 → 23
              const hourStr = hour.toString().padStart(2, "0") + ":00";

              return (
                <tr key={hourStr}>
                  <td>{hourStr}</td>
                  {groupedByDay.map((shifts, dayIdx) => {
                    const shift = shifts.find((s) => {
                      const [startH, startM] = s.startTime
                        .split(":")
                        .map(Number);
                      const [endH, endM] = s.endTime.split(":").map(Number);
                      const startMinutes = startH * 60 + startM;
                      const endMinutes = endH * 60 + endM;
                      const currentMinutes = hour * 60;
                      return (
                        currentMinutes >= startMinutes &&
                        currentMinutes < endMinutes
                      );
                    });

                    return (
                      <td
                        key={dayIdx}
                        style={{
                          cursor: shift ? "pointer" : "default",
                          backgroundColor: shift ? "#d1e7dd" : "",
                        }}
                        onClick={() => shift && handleShiftClick(shift.shiftId)}
                      >
                        {shift ? `${shift.doctorName} (${shift.roomName})` : ""}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết ca làm việc</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedShift ? (
            <div>
              <p>
                <strong>Bác sĩ:</strong> {selectedShift.doctorName}
              </p>
              <p>
                <strong>Phòng:</strong> {selectedShift.roomName}
              </p>
              <p>
                <strong>Ngày làm việc:</strong>{" "}
                {new Date(selectedShift.workDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Giờ bắt đầu:</strong> {selectedShift.startTime}
              </p>
              <p>
                <strong>Giờ kết thúc:</strong> {selectedShift.endTime}
              </p>
              <p>
                <strong>Trạng thái ca:</strong> {selectedShift.nurseShiftStatus}
              </p>
            </div>
          ) : (
            <p>Đang tải...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
