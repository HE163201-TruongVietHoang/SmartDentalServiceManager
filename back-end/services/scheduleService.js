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
function isOverlap(startA, endA, startB, endB) {
  const sA = normalizeTime(startA);
  const eA = normalizeTime(endA);
  const sB = normalizeTime(startB);
  const eB = normalizeTime(endB);
  return sA < eB && sB < eA; // Có giao nhau
}
async function createMultipleSchedules(doctorId, note, schedules) {
  const unavailable = [];
  const roomsForSlots = [];
  const duplicates = [];
  for (let i = 0; i < schedules.length; i++) {
    for (let j = i + 1; j < schedules.length; j++) {
      const a = schedules[i];
      const b = schedules[j];
      if (a.workDate === b.workDate && isOverlap(a.startTime, a.endTime, b.startTime, b.endTime)) {
        duplicates.push({
          conflictType: "internal",
          workDate: a.workDate,
          a: { startTime: a.startTime, endTime: a.endTime },
          b: { startTime: b.startTime, endTime: b.endTime },
          message: "Các khung giờ trong cùng request bị trùng nhau",
        });
      }
    }
  }
  for (const s of schedules) {
    const { workDate, startTime, endTime } = s;
    const existing = await hasOverlappingSchedule(doctorId, workDate, startTime, endTime);
    if (existing) {
      duplicates.push({ workDate, startTime, endTime, existing });
    }
  }

  if (duplicates.length > 0) {
    return { requestId: null, duplicates };
  }

  for (const s of schedules) {
    const { workDate, startTime, endTime } = s;
    const room = await findAvailableRoom(workDate, startTime, endTime);
    if (!room) {
      unavailable.push({ workDate, startTime, endTime, message: "Không còn phòng trống" });
    }
    roomsForSlots.push(room); 
  }

  if (unavailable.length > 0) {
    return { requestId: null, unavailable };
  }

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
    try {
      const pool = await getPool();
      await pool.request().query(`DELETE FROM Schedules WHERE requestId = ${requestId}`);
      await pool.request().query(`DELETE FROM ScheduleRequests WHERE requestId = ${requestId}`);
    } catch (cleanupErr) {
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
  await approveScheduleRequest(requestId);
  const { request, schedules } = await getScheduleRequestById(requestId);
  for (const schedule of schedules) {
    const start = normalizeTime(schedule.startTime); 
    const end = normalizeTime(schedule.endTime);    

    if (!start || !end) continue; 

    let startMin = timeToMinutes(start); 
    let endMin = timeToMinutes(end);   


    if (endMin <= startMin) endMin += 24 * 60;

    let currentMin = startMin;
    while (currentMin < endMin) {
      const nextMin = Math.min(currentMin + 30, endMin);

      const slotStart = minutesToHHMM(currentMin);
      const slotEnd = minutesToHHMM(nextMin);

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
