const { sql, getPool } = require("../config/db");

async function create({ patientId, appointmentId, diagnosisId, prescriptionId, promotionId, totalAmount, discountAmount, status }) {
  const pool = await getPool();
  const result = await pool.request()
    .input("patientId", sql.Int, patientId)
    .input("appointmentId", sql.Int, appointmentId)
    .input("diagnosisId", sql.Int, diagnosisId || null)
    .input("prescriptionId", sql.Int, prescriptionId || null)
    .input("promotionId", sql.Int, promotionId || null)
    .input("totalAmount", sql.Decimal(18, 2), totalAmount)
    .input("discountAmount", sql.Decimal(18, 2), discountAmount || 0)
    .input("status", sql.NVarChar, status || 'Pending')
    .query(`
      INSERT INTO Invoices (patientId, appointmentId, diagnosisId, prescriptionId, promotionId, totalAmount, discountAmount, status, issuedDate)
      VALUES (@patientId, @appointmentId, @diagnosisId, @prescriptionId, @promotionId, @totalAmount, @discountAmount, @status, GETDATE());
      SELECT SCOPE_IDENTITY() AS invoiceId;
    `);
  return result.recordset[0];
}

async function getAll() {
  const pool = await getPool();
  const result = await pool.request()
    .query(`
      SELECT 
        i.*,
        u.fullName as patientName,
        sch.workDate,
        s.slotId,
        s.startTime,
        s.endTime,
        pr.code as promotionCode
      FROM Invoices i
      LEFT JOIN Users u ON i.patientId = u.userId
      LEFT JOIN Appointments a ON i.appointmentId = a.appointmentId
      LEFT JOIN Slots s ON a.slotId = s.slotId
      LEFT JOIN Schedules sch ON s.scheduleId = sch.scheduleId
      LEFT JOIN Promotions pr ON i.promotionId = pr.promotionId
      ORDER BY i.issuedDate DESC
    `);
  return result.recordset;
}

async function getById(invoiceId) {
  const pool = await getPool();
  const result = await pool.request()
    .input("invoiceId", sql.Int, invoiceId)
    .query(`
      SELECT 
        i.*,
        u.fullName as patientName,
        sch.workDate,
        s.slotId,
        s.startTime,
        s.endTime,
        pr.code as promotionCode
      FROM Invoices i
      LEFT JOIN Users u ON i.patientId = u.userId
      LEFT JOIN Appointments a ON i.appointmentId = a.appointmentId
      LEFT JOIN Slots s ON a.slotId = s.slotId
      LEFT JOIN Schedules sch ON s.scheduleId = sch.scheduleId
      LEFT JOIN Promotions pr ON i.promotionId = pr.promotionId
      WHERE i.invoiceId = @invoiceId
    `);
  return result.recordset[0];
}

async function update(invoiceId, { status, discountAmount }) {
  const pool = await getPool();
  await pool.request()
    .input("invoiceId", sql.Int, invoiceId)
    .input("status", sql.NVarChar, status)
    .input("discountAmount", sql.Decimal(18, 2), discountAmount)
    .query(`
      UPDATE Invoices
      SET status = @status, discountAmount = @discountAmount
      WHERE invoiceId = @invoiceId
    `);
}

async function getByPatientId(patientId) {
  const pool = await getPool();
  const result = await pool.request()
    .input("patientId", sql.Int, patientId)
    .query(`
      SELECT 
        i.*,
        u.fullName as patientName,
        sch.workDate,
        s.slotId,
        s.startTime,
        s.endTime,
        pr.code as promotionCode
      FROM Invoices i
      LEFT JOIN Users u ON i.patientId = u.userId
      LEFT JOIN Appointments a ON i.appointmentId = a.appointmentId
      LEFT JOIN Slots s ON a.slotId = s.slotId
      LEFT JOIN Schedules sch ON s.scheduleId = sch.scheduleId
      LEFT JOIN Promotions pr ON i.promotionId = pr.promotionId
      WHERE i.patientId = @patientId
      ORDER BY i.issuedDate DESC
    `);
  return result.recordset;
}

module.exports = { create, getAll, getById, update, getByPatientId };