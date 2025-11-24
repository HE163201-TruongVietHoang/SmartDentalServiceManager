const { findAvailableRoom } = require("../access/roomAccess");
const {
  createScheduleRequest,
  createSchedule,
  hasOverlappingSchedule,
  getScheduleRequests,
  getScheduleRequestById,
  approveScheduleRequest,
  rejectScheduleRequest,
  getDoctorSchedules,
  getScheduleDetailByDoctor,
  deleteScheduleByRequestId,
  deleteScheduleRequest
} = require("../access/scheduleAccess");
const { generateSlots } = require("../access/slotAccess");
const { normalizeTime, minutesToHHMM, timeToMinutes, formatSqlTime, formatDateToYMDUTC, minutesToHHMMSS } = require("../utils/timeUtils");
const { getPool } = require("../config/db");
function normalizeTimeToHHMM(timeStr) {
  // Chuẩn hóa "7:0" -> "07:00", "7:30" -> "07:30"
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  return `${h.toString().padStart(2, "0")}:${(m || 0).toString().padStart(2, "0")}`;
}
function isOverlap(startA, endA, startB, endB) {
  const sA = normalizeTimeToHHMM(startA);
  const eA = normalizeTimeToHHMM(endA);
  const sB = normalizeTimeToHHMM(startB);
  const eB = normalizeTimeToHHMM(endB);

  // Tạo thời điểm Date (giả định cùng ngày)
  const today = new Date();
  const start1 = new Date(`${today}T${sA}`);
  let end1 = new Date(`${today}T${eA}`);
  if (end1 <= start1) end1.setDate(end1.getDate() + 1); // qua đêm

  const start2 = new Date(`${today}T${sB}`);
  let end2 = new Date(`${today}T${eB}`);
  if (end2 <= start2) end2.setDate(end2.getDate() + 1); // qua đêm

  // overlap nếu khoảng giao nhau
  return start1 < end2 && start2 < end1;
}

async function createMultipleSchedules(doctorId, note, schedules) {
  const unavailable = [];
  const roomsForSlots = [];
  const duplicates = [];
  const internalConflicts = [];

  // --- 1️⃣ Kiểm tra trùng với lịch đã có trong DB ---
  for (const s of schedules) {
    const { workDate, startTime, endTime } = s;
    const existing = await hasOverlappingSchedule(doctorId, workDate, startTime, endTime);
    if (existing) {
      duplicates.push({
        workDate,
        startTime,
        endTime,
        type: "Database",
        message: `Trùng với lịch đã có trong hệ thống (Phòng: ${existing.roomName})`,
      });
    }
  }

  // --- 2️⃣ Kiểm tra trùng giữa các slot mới ---
  for (let i = 0; i < schedules.length; i++) {
    const a = schedules[i];
    for (let j = i + 1; j < schedules.length; j++) {
      const b = schedules[j];
      if (a.workDate === b.workDate && isOverlap(a.startTime, a.endTime, b.startTime, b.endTime)) {
        internalConflicts.push({
          workDate: a.workDate,
          startTime: a.startTime,
          endTime: a.endTime,
          type: "Internal",
          message: `Hai khung giờ mới (${a.startTime}-${a.endTime}) và (${b.startTime}-${b.endTime}) bị trùng.`,
        });
      }
    }
  }

  // --- ⚠️ Nếu có conflict thì trả về luôn ---
  if (duplicates.length > 0 || internalConflicts.length > 0) {
    return {
      requestId: null,
      conflicts: [...duplicates, ...internalConflicts],
    };
  }

  // --- 3️⃣ Kiểm tra phòng trống ---
  for (const s of schedules) {
    const { workDate, startTime, endTime } = s;
    const room = await findAvailableRoom(workDate, startTime, endTime);
    if (!room) {
      unavailable.push({
        workDate,
        startTime,
        endTime,
        message: "Không còn phòng trống",
      });
    }
    roomsForSlots.push(room);
  }

  if (unavailable.length > 0) {
    return { requestId: null, unavailable };
  }

  // --- 4️⃣ Tạo yêu cầu lịch ---
  const requestId = await createScheduleRequest(doctorId, note);
  const results = [];

  try {
    for (let i = 0; i < schedules.length; i++) {
      const s = schedules[i];
      const room = roomsForSlots[i];
      await createSchedule({
        requestId,
        doctorId,
        roomId: room.roomId,
        workDate: s.workDate,
        startTime: s.startTime,
        endTime: s.endTime,
      });

      results.push({
        workDate: s.workDate,
        startTime: s.startTime,
        endTime: s.endTime,
        status: "Success",
        message: `Đã tạo lịch (Phòng: ${room.roomName})`,
      });
    }

    return { requestId, results };
  } catch (err) {
    const pool = await getPool();
    await pool.request().query(`DELETE FROM Schedules WHERE requestId = ${requestId}`);
    await pool.request().query(`DELETE FROM ScheduleRequests WHERE requestId = ${requestId}`);
    throw err;
  }
}

// Check availability for a list of schedules without persisting anything
async function checkAvailability(schedules) {
  const results = [];
  for (const s of schedules) {
    const { workDate, startTime, endTime } = s;
    const room = await findAvailableRoom(workDate, startTime, endTime);
    results.push({
      workDate,
      startTime,
      endTime,
      available: !!room,
      room: room ? { roomId: room.roomId, roomName: room.roomName } : null,
    });
  }
  return results;
}

async function listScheduleRequests(page, limit) {
  const { requests, total } = await getScheduleRequests(page, limit);

  const totalPages = Math.ceil(total / limit);

  return {
    meta: { page, limit, total, totalPages },
    data: requests,
  };
}

async function getScheduleRequestDetails(requestId) {
  return await getScheduleRequestById(requestId);
}

async function adminApproveRequest(requestId, adminId) {
  await approveScheduleRequest(requestId);

  const { schedules } = await getScheduleRequestById(requestId);

  for (const schedule of schedules) {
    if (!schedule.startTime || !schedule.endTime) continue;

    // Bắt buộc chuyển sang string trước khi normalizeTime
    const start = normalizeTime(String(schedule.startTime)); 
    const end = normalizeTime(String(schedule.endTime));

    let startMin = timeToMinutes(start);
    let endMin = timeToMinutes(end);

    if (endMin <= startMin) endMin += 24*60; // ca đêm

    let currentMin = startMin;
    while (currentMin < endMin) {
      const nextMin = Math.min(currentMin + 30, endMin);

      const slotStart = minutesToHHMMSS(currentMin); // HH:mm:ss
      const slotEnd = minutesToHHMMSS(nextMin);

      console.log("Generating slot:", slotStart, slotEnd); // debug

      await generateSlots({
        scheduleId: schedule.scheduleId,
        startTime: slotStart,
        endTime: slotEnd,
      });

      currentMin = nextMin;
    }
  }

  return { success: true, message: "Đã duyệt request và sinh slot tự động (cả ca đêm)." };
}


async function adminRejectRequest(requestId, adminId, reason = null) {
  return await rejectScheduleRequest(requestId, adminId, reason);
}
async function getSchedulesByDoctor(doctorId) {
  const schedules = await getDoctorSchedules(doctorId);
  return schedules.map((s) => ({
    scheduleId: s.scheduleId,
    workDate: formatDateToYMDUTC(s.workDate),
    startTime: formatSqlTime(s.startTime),
    endTime: formatSqlTime(s.endTime),
    room: s.roomName,
    status: s.status,
    note: s.requestNote || "",
    requestId: s.requestId
  }));
}
async function getDoctorScheduleDetailService(scheduleId, doctorId) {
  const schedule = await getScheduleDetailByDoctor(scheduleId, doctorId);
  if (!schedule) {
    throw new Error("Schedule not found or access denied");
  }
  return schedule;
}
async function cancelScheduleRequestService(requestId) {
  const request = await getScheduleRequestById(requestId);

  if (!request) {
    throw new Error("NOT_FOUND");
  }

  await deleteScheduleByRequestId(requestId);
  await deleteScheduleRequest(requestId);

  return true;
}
module.exports = {
  createMultipleSchedules,
  checkAvailability,
  listScheduleRequests,
  getScheduleRequestDetails,
  adminApproveRequest,
  adminRejectRequest,
  getSchedulesByDoctor,
  getDoctorScheduleDetailService,
  cancelScheduleRequestService
};
