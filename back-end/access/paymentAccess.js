const { sql, getPool } = require("../config/db");

async function create({ invoiceId, paymentMethod, amount, transactionCode, status, paymentDate, note }) {
  const pool = await getPool();
  const result = await pool.request()
    .input("invoiceId", sql.Int, invoiceId || null)
    .input("paymentMethod", sql.NVarChar, paymentMethod)
    .input("amount", sql.Decimal(18, 2), amount)
    .input("transactionCode", sql.NVarChar, transactionCode || null)
    .input("status", sql.NVarChar, status)
    .input("paymentDate", sql.DateTime, paymentDate || null)
    .input("note", sql.NVarChar, note || null)
    .query(`
      INSERT INTO Payments (invoiceId, paymentMethod, amount, transactionCode, status, paymentDate, note)
      VALUES (@invoiceId, @paymentMethod, @amount, @transactionCode, @status, @paymentDate, @note);
      SELECT SCOPE_IDENTITY() AS paymentId;
    `);
  return result.recordset[0];
}

async function findOneAndUpdate(paymentId, updateData) {
  const pool = await getPool();
  const setClause = Object.keys(updateData).map(key => `${key} = @${key}`).join(', ');
  const request = pool.request()
    .input("paymentId", sql.Int, paymentId);

  Object.keys(updateData).forEach(key => {
    if (key === 'paymentDate') {
      request.input(key, sql.DateTime, updateData[key]);
    } else {
      request.input(key, sql.NVarChar, updateData[key]);
    }
  });

  const result = await request.query(`
    UPDATE Payments
    SET ${setClause}
    WHERE paymentId = @paymentId;
    SELECT * FROM Payments WHERE paymentId = @paymentId;
  `);
  return result.recordset[0];
}

async function findById(paymentId) {
  const pool = await getPool();
  const result = await pool.request()
    .input("paymentId", sql.Int, paymentId)
    .query(`SELECT * FROM Payments WHERE paymentId = @paymentId`);
  return result.recordset[0];
}

module.exports = { create, findOneAndUpdate, findById };