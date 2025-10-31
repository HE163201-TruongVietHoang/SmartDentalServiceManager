const { getPool } = require("../config/db");
const sql = require("mssql");
const { normalizeTime } = require("../utils/timeUtils");

async function findAvailableRoom(workDate, startTime, endTime) {
  const pool = await getPool();

  const sStart = normalizeTime(startTime);
  const sEnd = normalizeTime(endTime);

  if (!sStart || !sEnd) throw new Error("startTime và endTime phải hợp lệ");
  let parsedDate;
  if (typeof workDate === "string") {
    const [day, month, year] = workDate.split("-");
    parsedDate = new Date(`${day}-${month}-${year}`);
  } else if (workDate instanceof Date) {
    parsedDate = workDate;
  } else {
    throw new Error("workDate không hợp lệ");
  }

  if (isNaN(parsedDate)) throw new Error("workDate không phải là ngày hợp lệ");
  const result = await pool.request()
    .input("workDate", sql.Date, parsedDate)
    .input("startTime", sql.NVarChar, sStart)
    .input("endTime", sql.NVarChar, sEnd)
    .query(`
      WITH NewSchedule AS (
        SELECT 
          CAST(@workDate AS DATETIME) + CAST(@startTime AS DATETIME) AS startDT,
          CASE 
            WHEN @endTime < @startTime 
              THEN DATEADD(DAY, 1, CAST(@workDate AS DATETIME) + CAST(@endTime AS DATETIME))
            ELSE CAST(@workDate AS DATETIME) + CAST(@endTime AS DATETIME)
          END AS endDT
      )
      SELECT TOP 1 r.roomId, r.roomName
      FROM Rooms r
      WHERE r.status = 'Available'
        AND r.roomId NOT IN (
          SELECT s.roomId
          FROM Schedules s
          CROSS APPLY (
            SELECT 
              CAST(s.workDate AS DATETIME) + CAST(s.startTime AS DATETIME) AS startDT,
              CASE 
                WHEN s.endTime < s.startTime 
                  THEN DATEADD(DAY, 1, CAST(s.workDate AS DATETIME) + CAST(s.endTime AS DATETIME))
                ELSE CAST(s.workDate AS DATETIME) + CAST(s.endTime AS DATETIME)
              END AS endDT
          ) AS sc
          CROSS JOIN NewSchedule ns
          WHERE s.status IN ('Pending', 'Approved')
            AND sc.startDT < ns.endDT
            AND sc.endDT > ns.startDT
        )
      ORDER BY r.roomId
    `);

  return result.recordset[0] || null;
}
module.exports = { findAvailableRoom };