
const nodemailer = require("nodemailer"); // ✅ Thêm Nodemailer
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  findUserByEmailOrPhone,
  setOtpForUser,
  updatePassword,
  createUser,
  updateUserProfile,
  getUserSessions,
  logoutSession,
  logoutAllSessions,
  getUserById,
  getUsers,
  findUserById,
  updateUser,
  changeUserRole,
  setUserActive,
  deleteUser,
  findUserByPhone,
  findUserByEmail,
  verifyUserOtp,
  activateUser
} = require("../access/userAccess");
const {
  getActiveSessions,
  createSession,
  deactivateSession,
  findSessionByRefreshToken,
  deactivateAllSessionsByUser,
} = require("../access/sessionAccess");
const { getPool, sql } = require("../config/db");
const { get } = require("jquery");
const MAX_SESSIONS = 3;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(0|\+84)(\d{9})$/;
function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.userId, roleName: user.roleName },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

// Login
async function login({ identifier, password, ip, device }) {
  const user = await findUserByEmailOrPhone(identifier);
  if (!user) throw new Error("Email hoặc số điện thoại không tồn tại");
  if (!user.isActive) throw new Error("Tài khoản đã bị vô hiệu hóa");
  if (!user.isVerify) throw new Error("Tài khoản chưa xác minh");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Sai mật khẩu");

  // Giới hạn số session
  const activeSessions = await getActiveSessions(user.userId);
  if (activeSessions.length >= MAX_SESSIONS) {
    await deactivateSession(activeSessions[0].sessionId);
  }

  const jwtToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  const sessionId = await createSession({
    userId: user.userId,
    jwtToken,
    refreshToken,
    ip,
    device,
  });

  return { jwtToken, refreshToken, user, sessionId };
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

  return { message: "Đổi mật khẩu thành công." };
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
    subject: "🔐 Mã OTP",
    html: `
      <h2>Mã OTP</h2>
      <p>Mã OTP của bạn là: <b style="font-size:22px">${otp}</b></p>
      <p>Mã này chỉ có hiệu lực trong <b>10 phút</b>. Không chia sẻ mã này với bất kỳ ai.</p>
      <br>
      <p>Smart Dental Team</p>
    `,
  });

  console.log(" Email OTP đã gửi tới: ", email);
}
// ==========================================

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Bước 1: Yêu cầu reset password
async function requestPasswordReset(email) {
  const user = await findUserByEmailOrPhone(email);
  if (!user) throw new Error("Email không tồn tại");

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await setOtpForUser(user.userId, otp, expiresAt);
  await sendOtpEmail(email, otp);

  return { message: "Mã OTP đã được gửi tới email" };
}

// Bước 2: Reset password bằng OTP
async function resetPassword({ email, otpCode, newPassword }) {
  const user = await findUserByEmailOrPhone(email);
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
async function verifyAccountOtp(userId, otp) {
  const user = await verifyUserOtp(userId, otp);
  if (!user) throw new Error("Người dùng không tồn tại");

  if (user.isVerify) throw new Error("Tài khoản đã được xác minh");

  if (user.otpCode !== otp) throw new Error("OTP không hợp lệ");

  if (new Date() > user.otpExpiresAt) throw new Error("OTP đã hết hạn");

  await activateUser(userId);

  return { message: "Xác minh tài khoản thành công" };
}

async function registerUser({
  email,
  password,
  fullName,
  phone,
  gender,
  dob,
  address,
  roleId,
}) {
  if (!email || !emailRegex.test(email)) {
    throw new Error("Email không hợp lệ");
  }

  if (!phone || !phoneRegex.test(phone)) {
    throw new Error("Số điện thoại không hợp lệ");
  }

  if (!password || password.length < 6) {
    throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
  }
  const emailExists = await findUserByEmail(email);
  if (emailExists) {
    throw new Error("Email đã được sử dụng");
  }

  const phoneExists = await findUserByPhone(phone);
  if (phoneExists) {
    throw new Error("Số điện thoại đã được sử dụng");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const otpCode = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const user = await createUser({
    email,
    password: hashedPassword,
    fullName,
    phone,
    gender,
    dob,
    address,
    roleId,
  });
  await setOtpForUser(user.userId, otpCode, otpExpiresAt);

  // Gửi OTP qua email hoặc SMS
  await sendOtpEmail(email, otpCode);
  return { message: "Đăng ký thành công, vui lòng nhập OTP để xác minh tài khoản", userId: user.userId };
}

// ----- Account management services -----
async function listUsers({ page = 1, pageSize = 10, search = "" }) {
  const data = await getUsers({ page, pageSize, search, roleId: arguments[0]?.roleId });
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
  logoutAllDevices,
  verifyAccountOtp
};
