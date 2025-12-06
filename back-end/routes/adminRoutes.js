// src/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  getAllUsersController,
  getUserController,
  createUserController,
  updateUserController,
  deleteUserController,
} = require("../controllers/adminController");

// Middleware: auth + admin
router.use(authMiddleware);

router.get("/users", getAllUsersController);
router.get("/users/:id", getUserController);
router.post("/users", createUserController);
router.put("/users/:id", updateUserController);
router.delete("/users/:id", deleteUserController);

module.exports = router;
