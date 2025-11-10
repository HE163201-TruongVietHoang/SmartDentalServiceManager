const express = require("express");
const { getAllPatients, getPatientDetail } = require("../controllers/patientController");

const router = express.Router();

// Xem tất cả patient (chỉ admin)
router.get("/", getAllPatients);

// Xem chi tiết patient
router.get("/:id", getPatientDetail);

module.exports = router;
