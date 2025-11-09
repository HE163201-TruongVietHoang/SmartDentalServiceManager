const { getPool } = require("../config/db");
const sql = require("mssql");
const { normalizeTime } = require("../utils/timeUtils");

//  Tạo slot mới
async function generateSlots({ scheduleId, startTime, endTime }) {
  const pool = await getPool();
  const sStart = normalizeTime(startTime);
  const sEnd = normalizeTime(endTime);

  await pool
    .request()
    .input("scheduleId", sql.Int, scheduleId)
    .input("startTime", sql.Time, sStart)
    .input("endTime", sql.Time, sEnd)
    .query(`
      INSERT INTO Slots (scheduleId, startTime, endTime)
      VALUES (@scheduleId, @startTime, @endTime)
    `);
}

async function getAvailable(doctorId, date) {
  const pool = await getPool();

  const result = await pool.request()
    .input("doctorId", sql.Int, doctorId)
    .input("date", sql.Date, date)
    .query(`
      SELECT s.slotId, s.startTime, s.endTime, s.isBooked, sch.roomId, sch.workDate
      FROM Slots s
      JOIN Schedules sch ON s.scheduleId = sch.scheduleId
      WHERE sch.doctorId = @doctorId
        AND sch.workDate = @date
        AND s.isBooked = 0
        AND sch.status = 'Approved'
      ORDER BY s.startTime
    `);

  // Map dữ liệu trả về
  return result.recordset.map(slot => ({
    slotId: slot.slotId,
    startTime: normalizeTime(slot.startTime),
    endTime: normalizeTime(slot.endTime),
    isBooked: Number(slot.isBooked),
    roomId: slot.roomId,
    workDate: slot.workDate ? slot.workDate.toISOString().slice(0, 10) : null
  }));
}
async function checkSlot(slotId, transaction = null) {
  const request = transaction ? transaction.request() : (await getPool()).request();
  const result = await request
    .input("slotId", sql.Int, slotId)
    .query(`
      SELECT s.slotId, s.isBooked, sch.doctorId, sch.workDate
      FROM Slots s
      JOIN Schedules sch ON s.scheduleId = sch.scheduleId
      WHERE s.slotId = @slotId
    `);
  return result.recordset[0];
}

// Đánh dấu booked, có thể dùng transaction
async function markAsBooked(slotId, transaction = null) {
  const request = transaction ? transaction.request() : (await getPool()).request();
  await request.input("slotId", sql.Int, slotId)
    .query(`UPDATE Slots SET isBooked = 1,updatedAt = GETDATE() WHERE slotId = @slotId`);
}
module.exports = { generateSlots, getAvailable, markAsBooked, checkSlot };
