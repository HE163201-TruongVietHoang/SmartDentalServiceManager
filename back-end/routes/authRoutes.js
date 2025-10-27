const express = require("express");
const router = express.Router();
const {
  loginController,
  refreshTokenController,
  changePasswordController,
  requestPasswordResetController,
  resetPasswordController,
  registerController,
} = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/authMiddleware");
router.post("/login", loginController);
router.post("/refresh-token", refreshTokenController);
router.post("/change-password", authMiddleware, changePasswordController);
router.post("/request-reset-password", requestPasswordResetController);
router.post("/reset-password", resetPasswordController);
router.post("/register", registerController);

// Account management (require authentication)
const {
  listUsersController,
  getUserController,
  editUserController,
  updateRoleController,
  toggleUserActiveController,
  deleteUserController,
} = require("../controllers/authController");
router.get("/users", listUsersController);
router.get("/users/:id", getUserController);
router.put("/users/:id", editUserController);
router.patch("/users/:id/role", updateRoleController);
router.patch("/users/:id/active", toggleUserActiveController);
router.delete("/users/:id", deleteUserController);
module.exports = router;
