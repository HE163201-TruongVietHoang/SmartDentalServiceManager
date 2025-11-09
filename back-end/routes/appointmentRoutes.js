const express = require("express");
const router = express.Router();
const { appointmentController } = require("../controllers/appointmentController");
const { authMiddleware } = require("../middlewares/authMiddleware");
router.get("/slots", appointmentController.getAvailableSlots); // Lấy slot trống
router.post("/", appointmentController.makeAppointment); // Đặt appointment
router.get("/", appointmentController.getAllAppointment); // Lấy tất cả lịch hẹn (admin)
router.get("/me",authMiddleware, appointmentController.getMyAppointments); // Lấy lịch hẹn của user hiện tại
module.exports = router;
