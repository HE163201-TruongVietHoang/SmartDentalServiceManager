const { login, refreshToken, changePassword, requestPasswordReset, resetPassword, registerUser  } = require('../services/authService');

async function loginController(req, res) {
  try {
    const { email, password } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const device = req.headers['user-agent'] || '';

    const result = await login({ email, password, ip, device });

    res.json({
      message: "Đăng nhập thành công",
      token: result.jwtToken,
      refreshToken: result.refreshToken,
      user: { userId: result.user.userId, fullName: result.user.fullName, role: result.user.roleName }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function refreshTokenController(req, res) {
  try {
    const { refreshToken: oldRefreshToken } = req.body;
    const result = await refreshToken(oldRefreshToken);
    res.json({ token: result.jwtToken });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function changePasswordController(req, res) {
  try {
    const userId = req.user.userId; // lấy từ authMiddleware
    const { oldPassword, newPassword } = req.body;

    const result = await changePassword({ userId, oldPassword, newPassword });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
async function requestPasswordResetController(req, res) {
  try {
    const { email } = req.body;
    const result = await requestPasswordReset(email);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function resetPasswordController(req, res) {
  try {
    const { email, otpCode, newPassword } = req.body;
    const result = await resetPassword({ email, otpCode, newPassword });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function registerController(req, res) {
  try {
    const result = await registerUser(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
module.exports = { loginController, refreshTokenController, changePasswordController, requestPasswordResetController, resetPasswordController ,registerController};
