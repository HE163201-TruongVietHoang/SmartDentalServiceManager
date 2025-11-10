const { sql, getPool } = require("../config/db");

// Tạo appointment, dùng transaction
async function create({ patientId, doctorId, slotId, reason, workDate, appointmentType  }, transaction) {
  const request = transaction.request();
  const result = await request
    .input("patientId", sql.Int, patientId)
    .input("doctorId", sql.Int, doctorId)
    .input("slotId", sql.Int, slotId)
    .input("reason", sql.NVarChar, reason)
    .input("workDate", sql.Date, workDate)
    .input("status", sql.NVarChar, "Scheduled")
    .input("appointmentType", sql.NVarChar, appointmentType)
    .query(`
      INSERT INTO Appointments (patientId, doctorId, slotId, reason, status,appointmentType, createdAt, updatedAt)
      VALUES (@patientId, @doctorId, @slotId, @reason, 'Scheduled',@appointmentType, GETDATE(), GETDATE());
      SELECT SCOPE_IDENTITY() AS appointmentId;
    `);
  return result.recordset[0];
}
async function getByUser(userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input("userId", sql.Int, userId)
    .query(`
      SELECT a.appointmentId, a.reason, a.status, a.appointmentType,
             s.startTime, s.endTime, sch.workDate,
             d.fullName AS doctorName, s.slotId
      FROM Appointments a
      JOIN Slots s ON a.slotId = s.slotId
      JOIN Schedules sch ON s.scheduleId = sch.scheduleId
      JOIN Users d ON sch.doctorId = d.userId
      WHERE a.patientId = @userId
      ORDER BY sch.workDate, s.startTime
    `);
  return result.recordset;
}
async function getAll() {
  const pool = await getPool();
  const result = await pool.request()
    .query(`
      SELECT a.*, s.startTime, s.endTime, d.fullName AS doctorName, p.fullName AS patientName, sch.workDate
      FROM Appointments a
      JOIN Slots s ON a.slotId = s.slotId
      JOIN Schedules sch ON s.scheduleId = sch.scheduleId
      JOIN Users d ON a.doctorId = d.userId
      JOIN Users p ON a.patientId = p.userId
      ORDER BY sch.workDate, s.startTime
    `);
  return result.recordset;
}

async function getById(appointmentId) {
  const pool = await getPool();
  const result = await pool.request()
    .input("appointmentId", sql.Int, appointmentId)
    .query(`
      SELECT a.*, s.startTime, s.endTime, sch.workDate, u.fullName AS patientName
      FROM Appointments a
      JOIN Slots s ON a.slotId = s.slotId
      JOIN Schedules sch ON s.scheduleId = sch.scheduleId
      JOIN Users u ON a.patientId = u.userId
      WHERE a.appointmentId = @appointmentId
    `);
  return result.recordset[0];
}

async function cancelAppointment(appointmentId, transaction) {
  const request = transaction.request();
  await request
    .input("appointmentId", sql.Int, appointmentId)
    .query(`UPDATE Appointments SET status = 'Cancelled' WHERE appointmentId = @appointmentId`);
}

async function countUserCancellations(patientId) {
  const pool = await getPool();
  const result = await pool.request()
    .input("patientId", sql.Int, patientId)
    .query(`
      SELECT COUNT(*) AS cancelCount
      FROM Appointments
      WHERE patientId = @patientId
        AND status = 'Cancelled'
        AND updatedAt >= DATEADD(DAY, -7, GETDATE())
    `);
  return result.recordset[0].cancelCount;
}
// Cập nhật trạng thái appointment
async function updateStatus(appointmentId, status, transaction = null) {
  const request = transaction ? transaction.request() : (await getPool()).request();
  await request
    .input("appointmentId", sql.Int, appointmentId)
    .input("status", sql.NVarChar, status)
    .query(`
      UPDATE Appointments
      SET status = @status,
          updatedAt = GETDATE()
      WHERE appointmentId = @appointmentId
    `);
}
module.exports = { create ,getByUser, getAll, getById, cancelAppointment, countUserCancellations, updateStatus };
