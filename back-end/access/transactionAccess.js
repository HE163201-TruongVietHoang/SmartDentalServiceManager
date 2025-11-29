const { sql, getPool } = require("../config/db");

async function create({ orderId, amount, bankCode, orderDescription, orderType, language, paymentStatus }) {
  const pool = await getPool();
  const result = await pool.request()
    .input("orderId", sql.Int, orderId)
    .input("amount", sql.Decimal(18, 2), amount)
    .input("bankCode", sql.NVarChar, bankCode || null)
    .input("orderDescription", sql.NVarChar, orderDescription)
    .input("orderType", sql.NVarChar, orderType)
    .input("language", sql.NVarChar, language)
    .input("paymentStatus", sql.NVarChar, paymentStatus)
    .query(`
      INSERT INTO Transactions (orderId, amount, bankCode, orderDescription, orderType, language, paymentStatus, createdAt)
      VALUES (@orderId, @amount, @bankCode, @orderDescription, @orderType, @language, @paymentStatus, GETDATE());
      SELECT SCOPE_IDENTITY() AS transactionId;
    `);
  return result.recordset[0];
}

async function findOneAndUpdate(orderId, updateData) {
  const pool = await getPool();
  const setClause = Object.keys(updateData).map(key => `${key} = @${key}`).join(', ');
  const request = pool.request()
    .input("orderId", sql.Int, orderId);

  Object.keys(updateData).forEach(key => {
    if (key === 'paymentTime') {
      request.input(key, sql.DateTime, updateData[key]);
    } else {
      request.input(key, sql.NVarChar, updateData[key]);
    }
  });

  const result = await request.query(`
    UPDATE Transactions
    SET ${setClause}, updatedAt = GETDATE()
    WHERE orderId = @orderId;
    SELECT * FROM Transactions WHERE orderId = @orderId;
  `);
  return result.recordset[0];
}

async function findByOrderId(orderId) {
  const pool = await getPool();
  const result = await pool.request()
    .input("orderId", sql.Int, orderId)
    .query(`SELECT * FROM Transactions WHERE orderId = @orderId`);
  return result.recordset[0];
}

module.exports = { create, findOneAndUpdate, findByOrderId };