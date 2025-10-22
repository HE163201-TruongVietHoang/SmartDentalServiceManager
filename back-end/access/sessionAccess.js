const sql = require('mssql');
const { getPool } = require('../config/db');

async function getActiveSessions(userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .query(`SELECT sessionId, createdAt FROM dbo.UserSessions 
            WHERE userId = @userId AND isActive = 1 ORDER BY createdAt ASC`);
  return result.recordset;
}

async function createSession({ userId, jwtToken, refreshToken, ip, device }) {
  const pool = await getPool();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 ngày

  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .input('jwtToken', sql.NVarChar, jwtToken)
    .input('refreshToken', sql.NVarChar, refreshToken)
    .input('ipAddress', sql.NVarChar, ip || '')
    .input('userAgent', sql.NVarChar, device || '')
    .input('isActive', sql.Bit, 1)
    .input('createdAt', sql.DateTime, now)
    .input('expiresAt', sql.DateTime, expiresAt)
    .query(`
      INSERT INTO dbo.UserSessions
        (userId, jwtToken, refreshToken, ipAddress, userAgent, isActive, createdAt, expiresAt)
      OUTPUT INSERTED.sessionId
      VALUES (@userId, @jwtToken, @refreshToken, @ipAddress, @userAgent, @isActive, @createdAt, @expiresAt)
    `);

  return result.recordset[0].sessionId; // trả về sessionId
}

async function deactivateSession(sessionId) {
  const pool = await getPool();
  await pool.request()
    .input('sessionId', sql.Int, sessionId)
    .query(`UPDATE dbo.UserSessions SET isActive = 0 WHERE sessionId = @sessionId`);
}

async function findSessionByRefreshToken(refreshToken) {
  const pool = await getPool();
  const result = await pool.request()
    .input('refreshToken', sql.NVarChar, refreshToken)
    .query(`SELECT * FROM dbo.UserSessions WHERE refreshToken = @refreshToken AND isActive = 1`);
  return result.recordset[0];
}

async function deactivateAllSessionsByUser(userId) {
  const pool = await getPool();
  await pool.request()
    .input('userId', sql.Int, userId)
    .query(`UPDATE dbo.UserSessions SET isActive = 0 WHERE userId = @userId AND isActive = 1`);
}
module.exports = {
  getActiveSessions,
  createSession,
  deactivateSession,
  findSessionByRefreshToken,
  deactivateAllSessionsByUser
};
