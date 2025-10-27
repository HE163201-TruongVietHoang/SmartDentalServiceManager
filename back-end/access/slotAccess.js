const { getPool } = require("../config/db");
const sql = require("mssql");
const { normalizeTime } = require("../utils/timeUtils");

// Tạo slot
async function generateSlots({ scheduleId, startTime, endTime }) {
  const pool = await getPool();
  const sStart = normalizeTime(startTime);
  const sEnd = normalizeTime(endTime);

  await pool
    .request()
    .input("scheduleId", sql.Int, scheduleId)
    .input("startTime", sql.NVarChar, sStart)
    .input("endTime", sql.NVarChar, sEnd)
    .query(`
      INSERT INTO Slots (scheduleId, startTime, endTime)
      VALUES (@scheduleId, @startTime, @endTime)
    `);
}

module.exports = { generateSlots };
