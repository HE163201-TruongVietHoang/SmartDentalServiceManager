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
    .query(`SELECT * FROM Invoices ORDER BY issuedDate DESC`);
  return result.recordset;
}

async function getById(invoiceId) {
  const pool = await getPool();
  const result = await pool.request()
    .input("invoiceId", sql.Int, invoiceId)
    .query(`SELECT * FROM Invoices WHERE invoiceId = @invoiceId`);
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
    .query(`SELECT * FROM Invoices WHERE patientId = @patientId ORDER BY issuedDate DESC`);
  return result.recordset;
}

module.exports = { create, getAll, getById, update, getByPatientId };