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
              locale="vi"
              height="auto"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={events}
              eventClick={handleEventClick}
              dayMaxEvents={3}
              eventDidMount={(info) => {
                info.el.title = info.event.extendedProps.tooltipContent
                  .replace(/<br\/>/g, "\n")
                  .replace(/<[^>]*>/g, "");
                info.el.classList.add("calendar-event-v2");
              }}
              /** ✅ Tô màu xanh cho ngày có lịch Approved */
              dayCellDidMount={(info) => {
                const dayHasApproved = events.some((e) => {
                  const eventDate = new Date(e.start).toDateString();
                  const cellDate = new Date(info.date).toDateString();
                  return (
                    eventDate === cellDate &&
                    e.extendedProps.status === "Approved"
                  );
                });
                if (dayHasApproved) {
                  info.el.style.backgroundColor = "#b9e1d9ff"; // xanh đậm hơn
                  info.el.style.color = "white";
                  info.el.style.borderRadius = "8px";
                }
              }}
            />
          </div>
        </div>
      </main>

      {/* 🔸 Modal hiển thị slot */}
      {showSlots && (
        <div className="modal-overlay-v2" onClick={() => setShowSlots(false)}>
          <div
            className="modal-content-v2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-v2">
              <div>
                <h2 className="modal-title-v2">Chi tiết ca làm việc</h2>
                <p className="modal-subtitle-v2">Danh sách các slot khả dụng</p>
              </div>
              <button
                className="modal-close-v2"
                onClick={() => setShowSlots(false)}
                aria-label="Đóng modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-body-v2">
              {slots.length > 0 ? (
                <div className="slots-grid-v2">
                  {slots.map((slot) => (
                    <div
                      key={slot.slotId}
                      className={`slot-card-v2 ${
                        slot.isBooked ? "booked" : "available"
                      }`}
                    >
                      <div className="slot-header-v2">
                        <div className="slot-time-v2">
                          🕒 {slot.startTime} - {slot.endTime}
                        </div>
                        <span
                          className={`status-badge-v2 ${
                            slot.isBooked ? "booked" : "available"
                          }`}
                        >
                          {slot.isBooked ? "Đã đặt" : "Trống"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-v2">
                  <p>Không có dữ liệu slot</p>
                </div>
              )}
            </div>

            <div className="modal-footer-v2">
              <button
                className="btn-close-v2"
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
