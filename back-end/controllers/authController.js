const { login, refreshToken, changePassword, requestPasswordReset, resetPassword, registerUser, listUsers, getUser, editUser, updateRole, toggleUserActive, removeUser } = require('../services/authService');

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
// --- Admin / account management controllers ---
async function listUsersController(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const search = req.query.search || '';
    const data = await listUsers({ page, pageSize, search });
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getUserController(req, res) {
  try {
    const userId = parseInt(req.params.id);
    const user = await getUser(userId);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function editUserController(req, res) {
  try {
    const userId = parseInt(req.params.id);
    const payload = req.body;
    const result = await editUser(userId, payload);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateRoleController(req, res) {
  try {
    const userId = parseInt(req.params.id);
    const { roleId } = req.body;
    const result = await updateRole(userId, roleId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function toggleUserActiveController(req, res) {
  try {
    const userId = parseInt(req.params.id);
    const { isActive } = req.body;
    const result = await toggleUserActive(userId, isActive);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deleteUserController(req, res) {
  try {
    const userId = parseInt(req.params.id);
    const result = await removeUser(userId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { 
  loginController, 
  refreshTokenController, 
  changePasswordController, 
  requestPasswordResetController, 
  resetPasswordController,
  registerController,
  listUsersController,
  getUserController,
  editUserController,
  updateRoleController,
  toggleUserActiveController,
  deleteUserController
};

