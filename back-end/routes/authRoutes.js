const express = require('express');
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
    logoutAllDevicesController 
} = require('../controllers/authController');
const {authMiddleware} = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
router.post('/login', loginController);
router.post('/refresh-token', refreshTokenController);
router.post('/change-password', authMiddleware, changePasswordController);
router.post('/request-reset-password', requestPasswordResetController);
router.post('/reset-password', resetPasswordController);
router.post('/register', registerController);
router.get("/profile", authMiddleware, profileController);

// Ví dụ: route chỉ cho doctor truy cập
router.get("/doctor/profile", authMiddleware, authorizeRoles("Doctor"), profileController);
router.put('/profile', authMiddleware,  updateProfileController);

router.get('/devices', authMiddleware, getDevicesController);
router.post('/devices/:sessionId/logout', authMiddleware, logoutDeviceController);
router.post('/devices/logout-all', authMiddleware, logoutAllDevicesController);
// Account management (require authentication)
const { listUsersController, getUserController, editUserController, updateRoleController, toggleUserActiveController, deleteUserController } = require('../controllers/authController');
router.get('/users', listUsersController);
router.get('/users/:id', getUserController);
router.put('/users/:id', editUserController);
router.patch('/users/:id/role', updateRoleController);
router.patch('/users/:id/active', toggleUserActiveController);
router.delete('/users/:id', deleteUserController);
module.exports = router;
