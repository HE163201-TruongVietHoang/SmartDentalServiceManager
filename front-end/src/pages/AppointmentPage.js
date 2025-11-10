import React, { useState, useEffect } from "react";
import { getDoctors, getAvailableSlots, makeAppointment } from "../api/api";
import { socket } from "../api/socket";

export default function AppointmentPage() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState("");
  const [appointmentType, setAppointmentType] = useState("tai kham");

  // Lấy user từ localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const patientId = user?.userId;

 useEffect(() => {
  getDoctors().then(setDoctors).catch(err => console.error(err));
}, []);


  useEffect(() => {
    if (selectedDoctor && date) {
      fetchSlots();
    }
  }, [selectedDoctor, date]);

  useEffect(() => {
    if (!patientId) return;
    // Lắng nghe slot bị booked realtime
    socket.on("slotBooked", ({ slotId }) => {
      setSlots(prev => prev.map(s => s.slotId === slotId ? { ...s, isBooked: 1 } : s));
    });
    return () => socket.off("slotBooked");
  }, [patientId]);

  const fetchSlots = async () => {
    if (!selectedDoctor || !date) return;
    const data = await getAvailableSlots(selectedDoctor, date);
    setSlots(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) return alert("Bạn cần đăng nhập để đặt lịch!");
    if (!selectedSlot) return alert("Chọn slot!");
    try {
      await makeAppointment({
        patientId,
        doctorId: selectedDoctor,
        slotId: selectedSlot,
        reason,
        workDate: date,
        appointmentType
      });
      alert("Đặt lịch thành công!");
      fetchSlots(); // refresh slots
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi đặt lịch");
    }
  };

  return (
    <div className="p-4">
      <h2>Đặt lịch khám</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Bác sĩ: </label>
          <select onChange={e => setSelectedDoctor(Number(e.target.value))} value={selectedDoctor || ""}>
            <option value="">Chọn bác sĩ</option>
            {doctors.map(d => (
              <option key={d.userId} value={d.userId}>{d.fullName}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Ngày: </label>
          <input type="date" onChange={e => setDate(e.target.value)} value={date} />
        </div>

        <div>
          <label>Slot: </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {slots.map(slot => (
              <button
                key={slot.slotId}
                type="button"
                disabled={slot.isBooked}
                style={{
                  padding: "6px 12px",
                  backgroundColor: slot.isBooked ? "#ccc" : selectedSlot === slot.slotId ? "#4caf50" : "#eee"
                }}
                onClick={() => setSelectedSlot(slot.slotId)}
              >
                {slot.startTime} - {slot.endTime}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label>Lý do: </label>
          <input type="text" value={reason} onChange={e => setReason(e.target.value)} />
        </div>

        <div>
          <label>Loại khám: </label>
          <select value={appointmentType} onChange={e => setAppointmentType(e.target.value)}>
            <option value="tai kham">Tái khám</option>
            <option value="kham lan dau">Khám lần đầu</option>
          </select>
        </div>

        <button type="submit">Đặt lịch</button>
      </form>
    </div>
  );
}
