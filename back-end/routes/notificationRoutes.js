// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const { getNotifications, markAllRead } = require("../controllers/notificationController");
const {authMiddleware }= require("../middlewares/authMiddleware");

router.get("/", authMiddleware, getNotifications);
router.post("/:id/read", authMiddleware, markAllRead);

module.exports = router;