import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { parse } from "date-fns";
import { Tooltip } from "react-tooltip";
import 'react-tooltip/dist/react-tooltip.css';

export default function DoctorScheduleCalendar({ doctorId }) {
  const [events, setEvents] = useState([]);
  const [slots, setSlots] = useState([]); // danh sách slot của event
  const [showSlots, setShowSlots] = useState(false);

  // Load tất cả schedule của bác sĩ
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/schedules/doctor`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

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

            let bgColor = "#6b7280";
            switch (s.status) {
              case "Approved": bgColor = "#4f46e5"; break;
              case "Pending": bgColor = "#f59e0b"; break;
              case "Rejected": bgColor = "#ef4444"; break;
            }

            return {
              id: s.scheduleId,
              title: `${s.room?.roomName || s.room} (${s.startTime}-${s.endTime})`,
              start,
              end,
              backgroundColor: bgColor,
              textColor: "#fff",
              borderColor: "#fff",
              display: "block",
              extendedProps: {
                scheduleId: s.scheduleId,
                room: s.room?.roomName || s.room,
                status: s.status,
                note: s.note || "Không có ghi chú",
                tooltipContent: `<b style="color:black">${s.room?.roomName || s.room}</b><br/>
                                 <b>Trạng thái:</b> ${s.status || "Không xác định"}<br/>
                                 ${s.startTime} - ${s.endTime}<br/>
                                 <i>${s.note || "Không có ghi chú"}</i>`,
              },
            };
          });

          setEvents(formatted);
        }
      } catch (err) {
        console.error("Lỗi khi tải lịch bác sĩ:", err);
      }
    };

    fetchSchedules();
  }, [doctorId]);

  // Khi click vào 1 event: fetch slot chi tiết
  const handleEventClick = async (info) => {
    const status = info.event.extendedProps.status;
    if (status !== "Approved") {
      return;
    }
    const scheduleId = info.event.extendedProps.scheduleId;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/schedules/doctor/${scheduleId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSlots(Array.isArray(data.data.slots) ? data.data.slots : []);
        setShowSlots(true);
      }
    } catch (err) {
      console.error("Lỗi khi tải slot:", err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
        Lịch làm việc
      </h2>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale="vi"
        height={600}
        headerToolbar={{
          left: "prev,next today",
          center: "",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
        allDaySlot={false}
        events={events}
        eventClick={handleEventClick}
        dayMaxEvents={4}
        eventDidMount={(info) => {
          info.el.setAttribute("data-tooltip-content", info.event.extendedProps.tooltipContent);
          info.el.style.transition = "all 0.2s";
          info.el.style.borderRadius = "6px";
          info.el.style.padding = "2px 4px";
          info.el.addEventListener("mouseenter", () => {
            info.el.style.transform = "scale(1.05)";
            info.el.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
          });
          info.el.addEventListener("mouseleave", () => {
            info.el.style.transform = "scale(1)";
            info.el.style.boxShadow = "none";
          });
        }}
        displayEventTime={false}
      />

      <Tooltip id="global-tooltip" place="top" variant="light" html style={{ zIndex: 1000 }} />

      {/* Modal hiển thị slot */}
      {showSlots && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          onClick={() => setShowSlots(false)} // click background đóng modal
        >
          <div
            className="bg-white p-6 rounded-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()} // ngăn click vào modal đóng
          >
            <h3 className="text-xl font-semibold mb-4">Danh sách slot</h3>
            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {slots.map((slot) => (
                <li key={slot.slotId} className="border p-2 rounded">
                  <b>Giờ:</b> {slot.startTime} - {slot.endTime} <br />
                  <b>Trạng thái:</b> {slot.isBooked ? "Đã đặt" : "Trống"}
                </li>
              ))}
            </ul>
            <button
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => setShowSlots(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
