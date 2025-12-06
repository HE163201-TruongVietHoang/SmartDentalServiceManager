// nurseShiftsService.js
const {
  getAllNurseSchedules,
  getNurseScheduleDetail,
} = require("./../access/nurseAccess");
const { normalizeTime } = require("../utils/timeUtils");
async function fetchAllNurseSchedules(nurseId) {
  const rows = await getAllNurseSchedules(nurseId);
  const schedule = rows.map((r) => ({
    shiftId: r.shiftId,
    workDate: r.workDate,
    startTime: normalizeTime(r.startTime), // <-- fix
    endTime: normalizeTime(r.endTime), // <-- fix
    doctorName: r.doctorName,
    roomName: r.roomName,
  }));

  return schedule;
}

async function fetchNurseScheduleDetail(shiftId) {
  const rows = await getNurseScheduleDetail(shiftId);
  if (rows.length === 0) {
    return null;
  }
  const schedule = {
    shiftId: rows[0].shiftId,
    nurseShiftStatus: rows[0].nurseShiftStatus,
    shiftCreatedAt: rows[0].shiftCreatedAt,
    scheduleId: rows[0].scheduleId,
    workDate: rows[0].workDate,
    startTime: normalizeTime(rows[0].startTime), // <-- fix
    endTime: normalizeTime(rows[0].endTime), // <-- fix
    scheduleStatus: rows[0].scheduleStatus,
    doctorId: rows[0].doctorId,
    doctorName: rows[0].doctorName,
    roomId: rows[0].roomId,
    roomName: rows[0].roomName,
    requestId: rows[0].requestId,
  };

  return schedule;
}

module.exports = { fetchAllNurseSchedules, fetchNurseScheduleDetail };
