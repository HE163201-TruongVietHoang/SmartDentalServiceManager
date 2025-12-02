const { sql, getPool } = require("../config/db");

async function create({ code, description, discountType, discountValue, startDate, endDate, isActive }) {
  const pool = await getPool();
  const result = await pool.request()
    .input("code", sql.NVarChar, code)
    .input("description", sql.NVarChar, description)
    .input("discountType", sql.NVarChar, discountType)
    .input("discountValue", sql.Decimal(18, 2), discountValue)
    .input("startDate", sql.Date, startDate)
    .input("endDate", sql.Date, endDate)
    .input("isActive", sql.Bit, isActive)
    .query(`
      INSERT INTO Promotions (code, description, discountType, discountValue, startDate, endDate, isActive, createdAt)
      VALUES (@code, @description, @discountType, @discountValue, @startDate, @endDate, @isActive, GETDATE());
      SELECT SCOPE_IDENTITY() AS promotionId;
    `);
  return result.recordset[0];
}

async function getAll() {
  const pool = await getPool();
  const result = await pool.request()
    .query(`SELECT * FROM Promotions ORDER BY createdAt DESC`);
  return result.recordset;
}

async function getById(promotionId) {
  const pool = await getPool();
  const result = await pool.request()
    .input("promotionId", sql.Int, promotionId)
    .query(`SELECT * FROM Promotions WHERE promotionId = @promotionId`);
  return result.recordset[0];
}

async function update(promotionId, { code, description, discountType, discountValue, startDate, endDate, isActive }) {
  const pool = await getPool();
  await pool.request()
    .input("promotionId", sql.Int, promotionId)
    .input("code", sql.NVarChar, code)
    .input("description", sql.NVarChar, description)
    .input("discountType", sql.NVarChar, discountType)
    .input("discountValue", sql.Decimal(18, 2), discountValue)
    .input("startDate", sql.Date, startDate)
    .input("endDate", sql.Date, endDate)
    .input("isActive", sql.Bit, isActive)
    .query(`
      UPDATE Promotions
      SET code = @code, description = @description, discountType = @discountType,
          discountValue = @discountValue, startDate = @startDate, endDate = @endDate,
          isActive = @isActive
      WHERE promotionId = @promotionId
    `);
}

async function deletePromotion(promotionId) {
  const pool = await getPool();
  await pool.request()
    .input("promotionId", sql.Int, promotionId)
    .query(`DELETE FROM Promotions WHERE promotionId = @promotionId`);
}

async function getActivePromotions() {
  const pool = await getPool();
  const result = await pool.request()
    .query(`SELECT * FROM Promotions WHERE isActive = 1 AND startDate <= GETDATE() AND endDate >= GETDATE()`);
  return result.recordset;
}

async function deactivateExpiredPromotions() {
  const pool = await getPool();
  await pool.request().query(`
    UPDATE Promotions
    SET isActive = 0
    WHERE endDate < GETDATE() AND isActive = 1
  `);
}

module.exports = { create, getAll, getById, update, deletePromotion, getActivePromotions, deactivateExpiredPromotions };