const sql = require('mssql');
const { getPool } = require('../config/db');

async function findUserByEmail(email) {
  const pool = await getPool();
  const result = await pool.request()
    .input('email', sql.NVarChar, email)
    .query(`SELECT u.userId, u.username, u.fullName, u.password, u.roleId, r.roleName, otpCode, otpExpiresAt
            FROM dbo.Users u
            JOIN dbo.Roles r ON u.roleId = r.roleId
            WHERE u.email = @email`);
  return result.recordset[0];
}
async function setOtpForUser(userId, otpCode, expiresAt) {
  const pool = await getPool();
  await pool.request()
    .input('userId', sql.Int, userId)
    .input('otpCode', sql.NVarChar, otpCode)
    .input('otpExpiresAt', sql.DateTime, expiresAt)
    .query(`UPDATE dbo.Users SET otpCode = @otpCode, otpExpiresAt = @otpExpiresAt WHERE userId = @userId`);
}

async function updatePassword(userId, hashedPassword) {
  const pool = await getPool();
  await pool.request()
    .input('userId', sql.Int, userId)
    .input('password', sql.NVarChar, hashedPassword)
    .query(`UPDATE dbo.Users SET password = @password, otpCode = NULL, otpExpiresAt = NULL WHERE userId = @userId`);
}

async function createUser({ username, email, password, fullName, phone, gender, dob, address, roleId }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('username', sql.NVarChar, username)
    .input('email', sql.NVarChar, email)
    .input('password', sql.NVarChar, password)
    .input('fullName', sql.NVarChar, fullName)
    .input('phone', sql.NVarChar, phone)
    .input('gender', sql.NVarChar, gender)
    .input('dob', sql.Date, dob)
    .input('address', sql.NVarChar, address)
    .input('roleId', sql.Int, roleId)
    .query(`INSERT INTO dbo.Users
      (username, email, password, fullName, phone, gender, dob, address, roleId)
      VALUES (@username, @email, @password, @fullName, @phone, @gender, @dob, @address, @roleId);
      SELECT SCOPE_IDENTITY() AS userId;`); // trả về userId mới tạo
  return result.recordset[0];
}
module.exports = { findUserByEmail, setOtpForUser,updatePassword, createUser };
