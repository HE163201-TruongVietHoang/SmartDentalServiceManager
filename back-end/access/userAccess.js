const sql = require("mssql");
const { getPool } = require("../config/db");

async function findUserByEmail(email) {
  const pool = await getPool();
  const result = await pool.request().input("email", sql.NVarChar, email)
    .query(`SELECT u.userId, u.username, u.fullName, u.password, u.roleId, r.roleName, otpCode, otpExpiresAt
            FROM dbo.Users u
            JOIN dbo.Roles r ON u.roleId = r.roleId
            WHERE u.email = @email`);
  return result.recordset[0];
}

async function getUserById(userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input("userId", sql.Int, userId)
    .query(`
      SELECT 
      u.userId,
      u.fullName,
      u.email,
      u.phone,
      u.gender,
      u.dob,
      u.address,
      r.roleName,
      u.createdAt
    FROM Users u
    JOIN Roles r ON u.roleId = r.roleId
    WHERE u.userId = @userId
    `);

  return result.recordset[0];
}

async function setOtpForUser(userId, otpCode, expiresAt) {
  const pool = await getPool();
  await pool
    .request()
    .input("userId", sql.Int, userId)
    .input("otpCode", sql.NVarChar, otpCode)
    .input("otpExpiresAt", sql.DateTime, expiresAt)
    .query(
      `UPDATE dbo.Users SET otpCode = @otpCode, otpExpiresAt = @otpExpiresAt WHERE userId = @userId`
    );
}

async function updatePassword(userId, hashedPassword) {
  const pool = await getPool();
  await pool
    .request()
    .input("userId", sql.Int, userId)
    .input("password", sql.NVarChar, hashedPassword)
    .query(
      `UPDATE dbo.Users SET password = @password, otpCode = NULL, otpExpiresAt = NULL WHERE userId = @userId`
    );
}

// ✅ ROLEID MẶC ĐỊNH = 4 KHI NGƯỜI DÙNG TỰ ĐĂNG KÝ
async function createUser({
  username,
  email,
  password,
  fullName,
  phone,
  gender,
  dob,
  address,
}) {
  const pool = await getPool();
  const defaultRoleId = 4; // 👈 ROLE mặc định cho Public User

  const result = await pool
    .request()
    .input("username", sql.NVarChar, username)
    .input("email", sql.NVarChar, email)
    .input("password", sql.NVarChar, password)
    .input("fullName", sql.NVarChar, fullName)
    .input("phone", sql.NVarChar, phone)
    .input("gender", sql.NVarChar, gender ?? null)
    .input("dob", sql.Date, dob ?? null)
    .input("address", sql.NVarChar, address ?? null)
    .input("roleId", sql.Int, defaultRoleId) // ✅ FORCE ROLE = 4
    .query(`INSERT INTO dbo.Users
      (username, email, password, fullName, phone, gender, dob, address, roleId)
      VALUES (@username, @email, @password, @fullName, @phone, @gender, @dob, @address, @roleId);
      SELECT SCOPE_IDENTITY() AS userId;`);
  return result.recordset[0];
}

async function getUsers({ page = 1, pageSize = 10, search = "" }) {
  const pool = await getPool();
  const offset = (page - 1) * pageSize;
  const searchPattern = `%${search}%`;

  const result = await pool
    .request()
    .input("search", sql.NVarChar, searchPattern)
    .input("offset", sql.Int, offset)
    .input("pageSize", sql.Int, pageSize)
    .query(`SELECT u.userId, u.username, u.email, u.fullName, u.phone, u.gender, u.dob, u.address, u.roleId, r.roleName, u.isActive
            FROM dbo.Users u
            JOIN dbo.Roles r ON u.roleId = r.roleId
            WHERE u.username LIKE @search OR u.email LIKE @search OR u.fullName LIKE @search
            ORDER BY u.userId DESC
            OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`);

  const countResult = await pool
    .request()
    .input("search", sql.NVarChar, searchPattern)
    .query(
      `SELECT COUNT(*) AS total FROM dbo.Users WHERE username LIKE @search OR email LIKE @search OR fullName LIKE @search`
    );

  return { users: result.recordset, total: countResult.recordset[0].total };
}

async function findUserById(userId) {
  const pool = await getPool();
  const result = await pool.request().input("userId", sql.Int, userId)
    .query(`SELECT u.userId, u.username, u.email, u.fullName, u.phone, u.gender, u.dob, u.address, u.roleId, r.roleName, u.isActive
            FROM dbo.Users u
            JOIN dbo.Roles r ON u.roleId = r.roleId
            WHERE u.userId = @userId`);
  return result.recordset[0];
}

async function updateUser(
  userId,
  { username, fullName, phone, gender, dob, address, roleId }
) {
  const pool = await getPool();
  await pool
    .request()
    .input("userId", sql.Int, userId)
    .input("username", sql.NVarChar, username)
    .input("fullName", sql.NVarChar, fullName)
    .input("phone", sql.NVarChar, phone)
    .input("gender", sql.NVarChar, gender)
    .input("dob", sql.Date, dob)
    .input("address", sql.NVarChar, address)
    .input("roleId", sql.Int, roleId)
    .query(
      `UPDATE dbo.Users SET username = @username, fullName = @fullName, phone = @phone, gender = @gender, dob = @dob, address = @address, roleId = @roleId WHERE userId = @userId`
    );
}

async function changeUserRole(userId, roleId) {
  const pool = await getPool();
  await pool
    .request()
    .input("userId", sql.Int, userId)
    .input("roleId", sql.Int, roleId)
    .query(`UPDATE dbo.Users SET roleId = @roleId WHERE userId = @userId`);
}

async function setUserActive(userId, isActive) {
  const pool = await getPool();
  await pool
    .request()
    .input("userId", sql.Int, userId)
    .input("isActive", sql.Bit, isActive ? 1 : 0)
    .query(`UPDATE dbo.Users SET isActive = @isActive WHERE userId = @userId`);
}

async function deleteUser(userId) {
  const pool = await getPool();
  await pool
    .request()
    .input("userId", sql.Int, userId)
    .query(`DELETE FROM dbo.Users WHERE userId = @userId`);
}


const updateUserProfile = async (userId, data) => {
  const { fullName, phone, gender, dob, address } = data;
  const pool = await getPool();
  await pool.request()
    .input('userId', sql.Int, userId)
    .input('fullName', sql.NVarChar, fullName)
    .input('phone', sql.NVarChar, phone)
    .input('gender', sql.NVarChar, gender)
    .input('dob', sql.Date, dob)
    .input('address', sql.NVarChar, address)
    .query(`
      UPDATE Users
      SET fullName=@fullName, phone=@phone, gender=@gender, dob=@dob, address=@address, updatedAt=GETDATE()
      WHERE userId=@userId
    `);
};

// Lấy các session active của user
const getUserSessions = async (userId) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .query(`
      SELECT sessionId, jwtToken, userAgent, ipAddress, isActive, createdAt 
      FROM UserSessions 
      WHERE userId=@userId AND isActive=1
    `);
  return result.recordset;
};

// Logout 1 session
const logoutSession = async (sessionId) => {
  const pool = await getPool();
  await pool.request()
    .input('sessionId', sql.Int, sessionId)
    .query(`UPDATE UserSessions SET isActive=0 WHERE sessionId=@sessionId`);
};

// Logout tất cả session của user
const logoutAllSessions = async (userId) => {
  const pool = await getPool();
  await pool.request()
    .input('userId', sql.Int, userId)
    .query(`UPDATE UserSessions SET isActive=0 WHERE userId=@userId`);
};

module.exports = {
  findUserByEmail,
  setOtpForUser,
  updatePassword,
  createUser,
  getUsers,
  findUserById,
  updateUser,
  changeUserRole,
  setUserActive,
  deleteUser,
  getUserById,
  updateUserProfile,
  getUserSessions,
  logoutSession,
  logoutAllSessions
};
