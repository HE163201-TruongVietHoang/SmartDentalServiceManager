const express = require("express");
const router = express.Router();
const {

    loginController,
    refreshTokenController,
    changePasswordController,
    requestPasswordResetController,
    resetPasswordController,
    registerController,
    profileController,
    updateProfileController,
    getDevicesController,
    logoutDeviceController,
    logoutAllDevicesController,
    listUsersController,
    getUserController,
    editUserController,
    updateRoleController,
    toggleUserActiveController,
    deleteUserController,
    verifyOtp
} = require('../controllers/authController');
const { authMiddleware } = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
router.post('/login', loginController);
router.post('/register', registerController);
router.post('/refresh-token', refreshTokenController);
router.post("/verify-otp", verifyOtp);
router.post('/request-reset-password', requestPasswordResetController);
router.post('/reset-password', resetPasswordController);
router.post('/change-password', authMiddleware, changePasswordController);
router.get("/profile", authMiddleware, profileController);
router.put('/profile', authMiddleware, updateProfileController);

router.get("/devices", authMiddleware, getDevicesController);
router.post(
  "/devices/:sessionId/logout",
  authMiddleware,
  logoutDeviceController
);
router.post("/devices/logout-all", authMiddleware, logoutAllDevicesController);
// Account management (require authentication)
router.get('/users', authMiddleware, authorizeRoles('ClinicManage'), listUsersController);
router.get('/users/:id',authMiddleware, authorizeRoles('ClinicManage'), getUserController);
router.put('/users/:id',authMiddleware, authorizeRoles('ClinicManage'), editUserController);
router.patch('/users/:id/role',authMiddleware, authorizeRoles('ClinicManage'), updateRoleController);
router.patch('/users/:id/active',authMiddleware, authorizeRoles('ClinicManage'), toggleUserActiveController);
router.delete('/users/:id',authMiddleware, authorizeRoles('ClinicManage'), deleteUserController);
module.exports = router;
