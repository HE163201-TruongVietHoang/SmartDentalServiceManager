import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { parse } from "date-fns";
import "./doctor-schedule-calendar.css";

export default function DoctorSchedule({ doctorId }) {
  const [events, setEvents] = useState([]);
  const [slots, setSlots] = useState([]);
  const [showSlots, setShowSlots] = useState(false);

  // 🔹 Tải lịch làm việc của bác sĩ
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/schedules/doctor",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        if (data.success || Array.isArray(data)) {
          const schedules = data.data || data;
          const formatted = schedules.map((s) => {
            const workDate = parse(s.workDate, "dd-MM-yyyy", new Date());
            const [startHour, startMinute] = s.startTime.split(":");
            const [endHour, endMinute] = s.endTime.split(":");

            const start = new Date(workDate);
            start.setHours(+startHour, +startMinute);
            const end = new Date(workDate);
            end.setHours(+endHour, +endMinute);
            if (end < start) end.setDate(end.getDate() + 1);

            const colors = {
              Approved: "#10b981",
              Pending: "#f59e0b",
              Rejected: "#ef4444",
              Default: "#6b7280",
            };

            return {
              id: s.scheduleId,
              title: `${s.room?.roomName || s.room} (${s.startTime}-${
                s.endTime
              })`,
              start,
              end,
              backgroundColor: colors[s.status] || colors.Default,
              textColor: "#fff",
              borderColor: "transparent",
              extendedProps: {
                scheduleId: s.scheduleId,
                room: s.room?.roomName || s.room,
                status: s.status,
                note: s.note || "Không có ghi chú",
                tooltipContent: `
                  <b style='color:#1f2937'>${
                    s.room?.roomName || s.room
                  }</b><br/>
                  <b>Trạng thái:</b> ${s.status}<br/>
                  ${s.startTime} - ${s.endTime}<br/>
                  <i>${s.note}</i>
                `,
              },
            };
          });

          setEvents(formatted);
        }
      } catch (error) {
        console.error("❌ Lỗi khi tải lịch bác sĩ:", error);
      }
    };

    fetchSchedules();
  }, [doctorId]);

  // 🔹 Khi click vào ca làm việc
  const handleEventClick = async (info) => {
    const { status, scheduleId } = info.event.extendedProps;
    if (status !== "Approved") return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/schedules/doctor/${scheduleId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (data.success && data.data) {
        setSlots(Array.isArray(data.data.slots) ? data.data.slots : []);
        setShowSlots(true);
      }
    } catch (error) {
      console.error("❌ Lỗi khi tải slot:", error);
    }
  };

  return (
    <div className="doctor-schedule-wrapper-v2">
      {/* 🔸 Header */}
      <header className="schedule-header-v2">
        <div className="header-container">
          <div className="header-content-v2">
            <h1 className="header-title-v2">Lịch Làm Việc</h1>
            {/* <p className="header-subtitle-v2">Quản lý ca làm việc hàng tuần</p> */}
          </div>

          {/* <div className="header-stats">
            <div className="stat-card">
              <span className="stat-number">{events.length}</span>
              <span className="stat-label">Ca làm việc</span>
            </div>
          </div> */}
        </div>
      </header>

      {/* 🔸 Calendar */}
      <main className="schedule-main-v2">
        <div className="calendar-wrapper-v2">
          <div className="calendar-card-v2">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              height={500} // 🔹 giới hạn chiều cao, không full trang
              contentHeight={450} // chiều cao thực tế nội dung
              aspectRatio={1.5} // 🔹 giúp calendar nhìn gọn
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={events}
              eventClick={handleEventClick}
              dayMaxEvents={2} // 🔹 show tối đa 2 sự kiện / ngày
              eventDidMount={(info) => {
                info.el.title = info.event.extendedProps.tooltipContent;
                info.el.classList.add("calendar-event-small"); // CSS nhỏ
                info.el.style.fontSize = "0.75rem"; // chữ nhỏ hơn
                info.el.style.padding = "2px 4px"; // padding nhỏ
              }}
              dayCellDidMount={(info) => {
                const hasApproved = events.some(
                  (e) =>
                    e.extendedProps.status === "Approved" &&
                    new Date(e.start).toDateString() ===
                      info.date.toDateString()
                );
                if (hasApproved) {
                  info.el.style.backgroundColor = "#d1fae5";
                  info.el.style.borderRadius = "6px";
                }
              }}
            />
          </div>
        </div>
      </main>

      {/* 🔸 Modal hiển thị slot */}
      {showSlots && (
        <div
          className="modal-overlay-v2"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowSlots(false)}
        >
          <div
            className="modal-content-v2"
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="modal-header-v2"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 24px",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
                  Chi tiết ca làm việc
                </h2>
                <p
                  style={{ margin: 0, color: "#6b7280", fontSize: "0.875rem" }}
                >
                  Danh sách các slot khả dụng
                </p>
              </div>
              <button
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.25rem",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
                onClick={() => setShowSlots(false)}
                aria-label="Đóng modal"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "16px 24px" }}>
              {slots.length > 0 ? (
                <div
                  className="slots-grid-v2"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  {slots.map((slot) => (
                    <div
                      key={slot.slotId}
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        backgroundColor: slot.isBooked ? "#f87171" : "#34d399",
                        color: "#fff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      }}
                    >
                      <span>
                        🕒 {slot.startTime} - {slot.endTime}
                      </span>
                      <span
                        style={{
                          backgroundColor: "rgba(255,255,255,0.2)",
                          padding: "2px 6px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                        }}
                      >
                        {slot.isBooked ? "Đã đặt" : "Trống"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    color: "#6b7280",
                    padding: "24px 0",
                    fontSize: "0.875rem",
                  }}
                >
                  Không có dữ liệu slot
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "12px 24px",
                borderTop: "1px solid #e0e0e0",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#3b82f6",
                  color: "#fff",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
                onClick={() => setShowSlots(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
