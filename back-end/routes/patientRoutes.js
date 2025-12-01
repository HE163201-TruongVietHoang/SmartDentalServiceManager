const express = require("express");
const {
  getAllPatients,
  getPatientDetail,
  getPatientMedicalRecord,
} = require("../controllers/patientController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const router = express.Router();

// Xem tất cả patient (chỉ admin)
router.get("/", getAllPatients);

// Xem chi tiết patient
router.get("/:id", getPatientDetail);

router.get(
  "/:id/medical-record",
  authMiddleware,
  authorizeRoles("Patient"),
  getPatientMedicalRecord
);

module.exports = router;
