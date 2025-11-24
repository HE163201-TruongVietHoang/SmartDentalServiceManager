// const express = require("express");
// const router = express.Router();
// const controller = require("../controllers/prescriptionController");
// const { authMiddleware } = require("../middlewares/authMiddleware");
// const authorizeRoles = require("../middlewares/roleMiddleware");

// router.get(
//   "/waiting",
//   authMiddleware,
//   authorizeRoles("Doctor"),
//   controller.getWaitingForPrescription
// );
// // Bác sĩ kê đơn
// router.post(
//   "/create",
//   authMiddleware,
//   authorizeRoles("Doctor"),
//   controller.createPrescription
// );

// // Lấy đơn thuốc theo diagnosis
// router.get("/:diagnosisId", authMiddleware, controller.getPrescription);

// module.exports = router;
