const { sql, getPool } = require("../config/db");

// Lấy tất cả patient
async function getAll() {
  const pool = await getPool();
  const result = await pool.request()
    .query(`
      SELECT u.userId, u.fullName, u.email, u.address, u.gender, u.dob, u.phone, u.isActive, u.createdAt, u.updatedAt
      FROM Users u
      JOIN Roles r ON u.roleId = r.roleId
      WHERE r.roleName = 'Patient'
      ORDER BY u.fullName
    `);
  return result.recordset;
}

// Lấy patient theo userId
async function getById(patientId) {
  const pool = await getPool();
  const result = await pool.request()
    .input("patientId", sql.Int, patientId)
    .query(`
      SELECT u.userId, u.fullName, u.email, u.address, u.gender, u.dob, u.phone, u.isActive, u.createdAt, u.updatedAt
      FROM Users u
      JOIN Roles r ON u.roleId = r.roleId
      WHERE u.userId = @patientId AND r.roleName = 'Patient'
    `);
  return result.recordset[0];
}

module.exports = { getAll, getById };
