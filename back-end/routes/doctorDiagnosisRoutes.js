// routes/doctorDiagnosisRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/doctorDiagnosisController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

// 👨‍⚕️ Bác sĩ xem ca khám của mình
router.get(
  "/appointments",
  authMiddleware,
  authorizeRoles("Doctor"),
  controller.getDoctorAppointments
);

// 👨‍⚕️ Tạo chẩn đoán cho ca khám
router.post(
  "/create",
  authMiddleware,
  authorizeRoles("Doctor"),
  controller.createDiagnosis
);

// 👨‍⚕️ Thêm dịch vụ điều trị vào chẩn đoán
router.post(
  "/:diagnosisId/services",
  authMiddleware,
  authorizeRoles("Doctor"),
  controller.addDiagnosisServices
);

module.exports = router;
