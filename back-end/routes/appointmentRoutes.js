const express = require("express");
const router = express.Router();
const { appointmentController } = require("../controllers/appointmentController");
const { authMiddleware } = require("../middlewares/authMiddleware");
// const { appointmentService } = require("../services/appointmentService");
router.get("/slots", appointmentController.getAvailableSlots); // Lấy slot trống
router.post("/", authMiddleware, appointmentController.makeAppointment); // Đặt appointment
router.get("/", authMiddleware, appointmentController.getAllAppointment); // Lấy tất cả lịch hẹn (Receptionist)
router.get("/me",authMiddleware, appointmentController.getMyAppointments); // Lấy lịch hẹn của user hiện tại
router.get("/:appointmentId", authMiddleware, appointmentController.getAppointmentById); // Lấy chi tiết 1 lịch hẹn
router.put("/:appointmentId/inprogress", appointmentController.markInProgress);
router.get("/me",authMiddleware, appointmentController.getMyAppointments); // Lấy lịch hẹn của user hiện tại
router.put("/:id/cancel", authMiddleware, appointmentController.cancelAppointment);
// router.post("/test-auto-cancel", async (req, res) => {
//   try {
//     await appointmentService.autoCancelNoShow();
//     res.json({ success: true, message: "Auto-cancel job executed" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });
router.post("/receptionist", appointmentController.makeAppointmentReceptionistController);
module.exports = router;
