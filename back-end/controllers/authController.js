const { login, refreshToken, changePassword, requestPasswordReset, resetPassword, registerUser, listUsers, getUser, editUser, updateRole, toggleUserActive, removeUser, getProfile , updateProfile, fetchDevices, logoutDevice, logoutAllDevices} = require('../services/authService');

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
      sessionId: result.sessionId,
      user: {
        userId: result.user.userId,
        fullName: result.user.fullName,
        roleName: result.user.roleName
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function profileController(req, res) {
  try {
    const userId = req.user.userId;
    const user = await getProfile(userId);
    res.json(user);
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
async function updateProfileController(req, res) {
  try {
    await updateProfile(req.user.userId, req.body);
    res.json({ message: 'Cập nhật hồ sơ thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
}

async function getDevicesController(req, res) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const devices = await fetchDevices(req.user.userId, token);
    res.json(devices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
}

async function logoutDeviceController(req, res) {
  try {
    const { sessionId } = req.params;
    await logoutDevice(sessionId);
    res.json({ message: 'Đăng xuất thiết bị thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
}

async function logoutAllDevicesController(req, res) {
  try {
    await logoutAllDevices(req.user.userId);
    res.json({ message: 'Đăng xuất tất cả thiết bị thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
}

module.exports = {
  loginController,
  profileController,
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
  deleteUserController,
  updateProfileController,
  getDevicesController,
  logoutDeviceController,
  logoutAllDevicesController
};

