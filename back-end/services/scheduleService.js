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
  getScheduleDetailByDoctor
} = require("../access/scheduleAccess");
const { generateSlots } = require("../access/slotAccess");
const { normalizeTime, minutesToHHMM, timeToMinutes, formatSqlTime ,formatDateToYMDUTC} = require("../utils/timeUtils");
const { getPool } = require("../config/db");

// 🔹 Dịch vụ tạo nhiều lịch trong 1 request
// Behavior: first check availability for ALL requested slots. If any slot has no available room,
// return the unavailable list and do NOT persist anything. Only when all slots have rooms do we
// create the request and persist the schedules.
async function createMultipleSchedules(doctorId, note, schedules) {
  const unavailable = [];
  const roomsForSlots = [];

  // 0) Ensure user doesn't already have existing schedule(s) overlapping any requested slot
  const duplicates = [];
  for (const s of schedules) {
    const { workDate, startTime, endTime } = s;
    const existing = await hasOverlappingSchedule(doctorId, workDate, startTime, endTime);
    if (existing) {
      duplicates.push({ workDate, startTime, endTime, existing });
    }
  }

  if (duplicates.length > 0) {
    // don't persist anything; notify client which slots conflict
    return { requestId: null, duplicates };
  }

  // 1) Check availability for all schedules first
  for (const s of schedules) {
    const { workDate, startTime, endTime } = s;
    const room = await findAvailableRoom(workDate, startTime, endTime);
    if (!room) {
      unavailable.push({ workDate, startTime, endTime, message: "Không còn phòng trống" });
    }
    roomsForSlots.push(room); // may contain null for unavailable
  }

  if (unavailable.length > 0) {
    // nothing persisted, return unavailable details so client can choose again
    return { requestId: null, unavailable };
  }

  // 2) All slots available -> create request and persist all schedules
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
        message: `Đã tạo lịch (phòng ${room.roomName})`,
      });
    }

    return { requestId, results };
  } catch (err) {
    // If insertion failed for some reason, attempt cleanup: delete any schedules inserted and the request
    try {
      const pool = await getPool();
      await pool.request().query(`DELETE FROM Schedules WHERE requestId = ${requestId}`);
      await pool.request().query(`DELETE FROM ScheduleRequests WHERE requestId = ${requestId}`);
    } catch (cleanupErr) {
      // log cleanup error but keep original error
      console.error('Error during cleanup after failed schedule inserts', cleanupErr);
    }
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
  // 1️⃣ Duyệt request
  await approveScheduleRequest(requestId);

  // 2️⃣ Lấy schedule liên quan
  const { request, schedules } = await getScheduleRequestById(requestId);

  // 3️⃣ Sinh slot 30 phút
  for (const schedule of schedules) {
    const start = normalizeTime(schedule.startTime); // "HH:mm"
    const end = normalizeTime(schedule.endTime);     // "HH:mm"

    if (!start || !end) continue; // skip nếu time không hợp lệ

    let startMin = timeToMinutes(start); // 0..1439
    let endMin = timeToMinutes(end);     // 0..1439

    // Nếu ca qua đêm (vd 20:00 -> 01:00), tăng endMin thêm 24*60
    if (endMin <= startMin) endMin += 24 * 60;

    let currentMin = startMin;
    while (currentMin < endMin) {
      const nextMin = Math.min(currentMin + 30, endMin);

      const slotStart = minutesToHHMM(currentMin);
      const slotEnd = minutesToHHMM(nextMin);

      // gọi tạo slot (await để đảm bảo thứ tự)
      await generateSlots({
        scheduleId: schedule.scheduleId,
        startTime: slotStart,
        endTime: slotEnd,
      });

      currentMin = nextMin;
    }
  }

  return { success: true, message: "Đã duyệt request và sinh slot tự động (kể cả ca đêm)." };
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
  }));
}
async function getDoctorScheduleDetailService(scheduleId, doctorId) {
  const schedule = await getScheduleDetailByDoctor(scheduleId, doctorId);
  if (!schedule) {
    throw new Error("Schedule not found or access denied");
  }
  return schedule;
}

module.exports = {
  createMultipleSchedules,
  checkAvailability,
  listScheduleRequests,
  getScheduleRequestDetails,
  adminApproveRequest,
  adminRejectRequest,
  getSchedulesByDoctor,
  getDoctorScheduleDetailService
};
