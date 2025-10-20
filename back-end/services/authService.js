const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer"); // ✅ Thêm Nodemailer
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  findUserByEmail,
  setOtpForUser,
  updatePassword,
  createUser,
  updateUserProfile,
  getUserSessions,
  logoutSession,
  logoutAllSessions
} = require("../access/userAccess");
const {
  getUsers,
  findUserById,
  updateUser,
  changeUserRole,
  setUserActive,
  deleteUser,
} = require("../access/userAccess");
const {
  getActiveSessions,
  createSession,
  deactivateSession,
  findSessionByRefreshToken,
  deactivateAllSessionsByUser,
} = require("../access/sessionAccess");
const { getPool, sql } = require("../config/db");
const MAX_SESSIONS = 3;

function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.userId, role: user.roleName },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

// Login
async function login({ email, password, ip, device }) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Tài khoản không tồn tại");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Sai mật khẩu");

  const activeSessions = await getActiveSessions(user.userId);
  if (activeSessions.length >= MAX_SESSIONS) {
    await deactivateSession(activeSessions[0].sessionId);
  }

  const jwtToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  await createSession({
    userId: user.userId,
    jwtToken,
    refreshToken,
    ip,
    device,
  });

  return { jwtToken, refreshToken, user };
}

// Refresh token
async function refreshToken(oldRefreshToken) {
  const session = await findSessionByRefreshToken(oldRefreshToken);
  if (!session) throw new Error("Refresh token không hợp lệ");

  const user = { userId: session.userId, roleName: session.roleName };
  const newAccessToken = generateAccessToken(user);

  return { jwtToken: newAccessToken };
}

async function changePassword({ userId, oldPassword, newPassword }) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("userId", sql.Int, userId)
    .query(`SELECT password FROM dbo.Users WHERE userId = @userId`);

  const user = result.recordset[0];
  if (!user) throw new Error("User không tồn tại");

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Mật khẩu cũ không đúng");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await pool
    .request()
    .input("userId", sql.Int, userId)
    .input("password", sql.NVarChar, hashedPassword)
    .query(`UPDATE dbo.Users SET password = @password WHERE userId = @userId`);

  await deactivateAllSessionsByUser(userId);

  return { message: "Đổi mật khẩu thành công. Tất cả thiết bị đã bị logout." };
}

async function sendOtpEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Smart Dental Clinic" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "🔐 Mã OTP khôi phục mật khẩu",
    html: `
      <h2>Mã OTP khôi phục mật khẩu</h2>
      <p>Mã OTP của bạn là: <b style="font-size:22px">${otp}</b></p>
      <p>Mã này chỉ có hiệu lực trong <b>10 phút</b>. Không chia sẻ mã này với bất kỳ ai.</p>
      <br>
      <p>Smart Dental Team</p>
    `,
  });

  console.log("✅ Email OTP đã gửi tới: ", email);
}
// ==========================================

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Bước 1: Yêu cầu reset password
async function requestPasswordReset(email) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Email không tồn tại");

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await setOtpForUser(user.userId, otp, expiresAt);

  await sendOtpEmail(email, otp);

  return { message: "Mã OTP đã được gửi tới email" };
}

// Bước 2: Reset password bằng OTP
async function resetPassword({ email, otpCode, newPassword }) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Email không tồn tại");

  if (!user.otpCode || user.otpCode !== otpCode) {
    throw new Error("Mã OTP không hợp lệ");
  }

  if (user.otpExpiresAt < new Date()) {
    throw new Error("Mã OTP đã hết hạn");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await updatePassword(user.userId, hashedPassword);

  await deactivateAllSessionsByUser(user.userId);

  return { message: "Đổi mật khẩu thành công, tất cả thiết bị đã bị logout" };
}

async function registerUser({
  username,
  email,
  password,
  fullName,
  phone,
  gender,
  dob,
  address,
  roleId,
}) {
  const existingUser = await findUserByEmail(email);
  if (existingUser) throw new Error("Email đã được sử dụng");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await createUser({
    username,
    email,
    password: hashedPassword,
    fullName,
    phone,
    gender,
    dob,
    address,
    roleId,
  });

  return { message: "Đăng ký thành công", userId: user.userId };
}

// ----- Account management services -----
async function listUsers({ page = 1, pageSize = 10, search = "" }) {
  const data = await getUsers({ page, pageSize, search });
  return data;
}

async function getUser(userId) {
  const user = await findUserById(userId);
  if (!user) throw new Error("Người dùng không tồn tại");
  return user;
}

async function editUser(userId, payload) {
  await updateUser(userId, payload);
  return { message: "Cập nhật thông tin người dùng thành công" };
}

async function updateRole(userId, roleId) {
  await changeUserRole(userId, roleId);
  return { message: "Cập nhật vai trò thành công" };
}

async function toggleUserActive(userId, isActive) {
  await setUserActive(userId, isActive);
  return {
    message: isActive
      ? "Kích hoạt người dùng thành công"
      : "Vô hiệu hóa người dùng thành công",
  };
}

async function removeUser(userId) {
  await deleteUser(userId);
  return { message: "Xóa người dùng thành công" };
}
async function getProfile(userId) {
  const user = await getUserById(userId);
  if (!user) throw new Error("Không tìm thấy người dùng");
  return user;
}
const updateProfile = async (userId, data) => {
  return await updateUserProfile(userId, data);
};

const fetchDevices = async (userId, currentToken) => {
  const sessions = await getUserSessions(userId);
  return sessions.map(s => ({
    ...s,
    isCurrentDevice: s.jwtToken === currentToken
  }));
};

const logoutDevice = async (sessionId) => {
  return await logoutSession(sessionId);
};

const logoutAllDevices = async (userId) => {
  return await logoutAllSessions(userId);
};

module.exports = {
  login,
  refreshToken,
  changePassword,
  requestPasswordReset,
  resetPassword,
  registerUser,
  listUsers,
  getUser,
  editUser,
  updateRole,
  toggleUserActive,
  removeUser,
  getProfile,
  updateProfile,
  fetchDevices,
  logoutDevice,
  logoutAllDevices
};
