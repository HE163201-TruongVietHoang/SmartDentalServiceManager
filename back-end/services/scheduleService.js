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
const { getActiveNurses, createNurseShift } = require("../access/nurseAccess");
const { sendNotification } = require("../access/notificationAccess");
function normalizeTimeToHHMM(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  return `${h.toString().padStart(2, "0")}:${(m || 0).toString().padStart(2, "0")}`;
}

function isOverlap(startA, endA, startB, endB) {
  const today = "2025-01-01"; // chỉ cần ngày cố định để parse
  const sA = new Date(`${today}T${normalizeTimeToHHMM(startA)}`);
  let eA = new Date(`${today}T${normalizeTimeToHHMM(endA)}`);
  const sB = new Date(`${today}T${normalizeTimeToHHMM(startB)}`);
  let eB = new Date(`${today}T${normalizeTimeToHHMM(endB)}`);

  // xử lý qua đêm
  if (eA <= sA) eA.setDate(eA.getDate() + 1);
  if (eB <= sB) eB.setDate(eB.getDate() + 1);

  return sA < eB && sB < eA; 
}

async function createMultipleSchedules(doctorId, note, schedules) {
  const conflicts = [];
  const roomsForSlots = [];
  const unavailable = [];

  // ======================
  // 1. KIỂM TRA TRÙNG NỘI BỘ
  // ======================
  for (let i = 0; i < schedules.length; i++) {
    for (let j = i + 1; j < schedules.length; j++) {
      const A = schedules[i];
      const B = schedules[j];

      if (A.workDate === B.workDate && isOverlap(A.startTime, A.endTime, B.startTime, B.endTime)) {
        conflicts.push({
          type: "Internal",
          workDate: A.workDate,
          startTime: A.startTime,
          endTime: A.endTime,
          conflictWith: {
            startTime: B.startTime,
            endTime: B.endTime,
          },
          message: `Trùng giữa (${A.startTime}–${A.endTime}) và (${B.startTime}–${B.endTime}) trong cùng ngày ${A.workDate}.`
        });
      }
    }
  }

  // ======================
  // 2. KIỂM TRA TRÙNG VỚI DATABASE
  // ======================
  for (const s of schedules) {
    const exists = await hasOverlappingSchedule(doctorId, s.workDate, s.startTime, s.endTime);
    if (exists) {
      conflicts.push({
        type: "Database",
        workDate: s.workDate,
        startTime: s.startTime,
        endTime: s.endTime,
        message: `(${s.startTime}–${s.endTime}) trùng với lịch đã tồn tại (Phòng: ${exists.roomName}).`
      });
    }
  }

  // Nếu có trùng → trả về ngay
  if (conflicts.length > 0) {
    return {
      requestId: null,
      conflicts,
    };
  }

  // ======================
  // 3. KIỂM TRA PHÒNG TRỐNG
  // ======================
  for (const s of schedules) {
    const room = await findAvailableRoom(s.workDate, s.startTime, s.endTime);

    if (!room) {
      unavailable.push({
        workDate: s.workDate,
        startTime: s.startTime,
        endTime: s.endTime,
        message: "Không còn phòng trống."
      });
    }

    roomsForSlots.push(room);
  }

  if (unavailable.length > 0) {
    return { requestId: null, unavailable };
  }

  // ======================
  // 4. TẠO LỊCH
  // ======================
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
        message: `Đã tạo lịch (Phòng: ${room.roomName}).`
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
  // 1. Approve request
  await approveScheduleRequest(requestId);

  // 2. Lấy danh sách schedule trong request
  const { schedules } = await getScheduleRequestById(requestId);

  // 3. GENERATE SLOTS 
  for (const schedule of schedules) {
    if (!schedule.startTime || !schedule.endTime) continue;

    const start = normalizeTime(String(schedule.startTime));
    const end = normalizeTime(String(schedule.endTime));

    let startMin = timeToMinutes(start);
    let endMin = timeToMinutes(end);

    if (endMin <= startMin) endMin += 24 * 60; // ca đêm

    let currentMin = startMin;
    while (currentMin < endMin) {
      const nextMin = Math.min(currentMin + 30, endMin);

      const slotStart = minutesToHHMMSS(currentMin);
      const slotEnd = minutesToHHMMSS(nextMin);

      console.log("Generating slot:", slotStart, slotEnd);

      await generateSlots({
        scheduleId: schedule.scheduleId,
        startTime: slotStart,
        endTime: slotEnd,
      });

      currentMin = nextMin;
    }
  }

  // 4. LẤY TOÀN BỘ NURSE ĐANG ACTIVE
  const nurses = await getActiveNurses(); // userId, role=Nurse
  if (!nurses || nurses.length === 0) {
    return {
      success: true,
      message:
        "Đã duyệt request & sinh slot nhưng không có nurse active để phân ca.",
    };
  }

  // 5. TỰ ĐỘNG TẠO NURSE SHIFTS CHO TỪNG SCHEDULE
  for (const schedule of schedules) {
    for (const nurse of nurses) {
      await createNurseShift({
        scheduleId: schedule.scheduleId,
        nurseId: nurse.userId,
        assignedBy: adminId,
      });
    }
  }
  for (const schedule of schedules) {
    await sendNotification({
      receiverId: schedule.doctorId,
      senderId: adminId,
      title: "Yêu cầu lịch khám đã được duyệt",
      message: "Yêu cầu lịch khám đã được duyệt",
      type: "schedule_approval",
    });

  }
  return {
    success: true,
    message: "Đã duyệt request, sinh slot 30 phút và tạo lịch trực cho y tá.",
    schedulesGenerated: schedules.length,
    nursesAssigned: nurses.length,
  };
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
