const { sql, getPool } = require("../config/db");

async function getActiveNurses() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT u.userId
    FROM Users u
    JOIN Roles r ON u.roleId = r.roleId
    WHERE r.roleName = 'Nurse'
      AND u.isActive = '1'
  `);

  return result.recordset;
}

async function getActiveNursesWithHours() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT u.userId, ISNULL(SUM(DATEDIFF(MINUTE, s.startTime, s.endTime)),0) AS totalMinutes
    FROM Users u
    JOIN Roles r ON u.roleId = r.roleId
    LEFT JOIN NurseShifts ns ON ns.nurseId = u.userId
    LEFT JOIN Schedules s ON s.scheduleId = ns.scheduleId
    WHERE r.roleName = 'Nurse'
      AND u.isActive = 1
    GROUP BY u.userId
    ORDER BY totalMinutes ASC
  `);

  // Kết quả sắp xếp từ ít giờ làm → nhiều giờ làm
  return result.recordset;
}

async function createNurseShift({ scheduleId, nurseId, assignedBy }) {
  const pool = await getPool();
  await pool
    .request()
    .input("scheduleId", sql.Int, scheduleId)
    .input("nurseId", sql.Int, nurseId)
    .input("assignedBy", sql.Int, assignedBy).query(`
      INSERT INTO NurseShifts (scheduleId, nurseId, assignedBy)
      VALUES (@scheduleId, @nurseId, @assignedBy)
    `);
}
// nurseShiftsAccess.js
async function getAllNurseSchedules(nurseId) {
  const pool = await getPool();
  const result = await pool.request().input("nurseId", sql.Int, nurseId).query(`
            SELECT 
            ns.shiftId,
            s.workDate,
            s.startTime,
            s.endTime,
            d.fullName AS doctorName,
            r.roomName
        FROM NurseShifts ns
        JOIN Schedules s ON ns.scheduleId = s.scheduleId
        JOIN Users d ON s.doctorId = d.userId
        LEFT JOIN Rooms r ON s.roomId = r.roomId
        WHERE ns.nurseId = @nurseId
        ORDER BY s.workDate, s.startTime
    `);

  return result.recordset;
}
async function getNurseScheduleDetail(shiftId) {
  const pool = await getPool();
  const result = await pool.request().input("shiftId", sql.Int, shiftId).query(`
            SELECT 
            ns.shiftId, 
            ns.status AS nurseShiftStatus, 
            ns.createdAt AS shiftCreatedAt,
            s.scheduleId, 
            s.workDate, 
            s.startTime, 
            s.endTime, 
            s.status AS scheduleStatus,
            s.doctorId, 
            d.fullName AS doctorName,
            s.roomId, 
            r.roomName,
            sr.requestId 
        FROM NurseShifts ns
        JOIN Schedules s ON ns.scheduleId = s.scheduleId
        JOIN Users d ON s.doctorId = d.userId
        LEFT JOIN Rooms r ON s.roomId = r.roomId
        LEFT JOIN ScheduleRequests sr ON s.requestId = sr.requestId
        WHERE ns.shiftId = @shiftId
    `);

  return result.recordset;
}

module.exports = {
  getActiveNurses,
  createNurseShift,
  getActiveNursesWithHours,
  getAllNurseSchedules,
  getNurseScheduleDetail,
};
