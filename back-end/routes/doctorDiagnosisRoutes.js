// routes/doctorDiagnosisRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/doctorDiagnosisController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

// 👨‍⚕️ Bác sĩ xem ca khám của mình (InProgress hôm nay)
router.get(
  "/appointments",
  authMiddleware,
  authorizeRoles("Doctor"),
  controller.getDoctorAppointments
);

// 👨‍⚕️ Tạo chẩn đoán + dịch vụ + đơn thuốc + hóa đơn (Pending)
router.post(
  "/create",
  authMiddleware,
  authorizeRoles("Doctor"),
  controller.createDiagnosis
);

// 👨‍⚕️ Thêm dịch vụ điều trị vào chẩn đoán (nếu cần tách riêng)
router.post(
  "/:diagnosisId/services",
  authMiddleware,
  authorizeRoles("Doctor"),
  controller.addDiagnosisServices
);

// 👨‍⚕️ Lịch sử chẩn đoán
router.get(
  "/history",
  authMiddleware,
  authorizeRoles("Doctor"),
  controller.getDiagnosisHistory
);

router.get(
  "/:id/medicines",
  authMiddleware,
  authorizeRoles("Doctor"),
  controller.getDiagnosisMedicines
);

module.exports = router;
