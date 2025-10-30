const express = require("express");
const router = express.Router();
const controller = require("../controllers/materialController");
const authorizeRoles = require("../middlewares/roleMiddleware");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.get(
  "/",
  authMiddleware,
  authorizeRoles("ClinicManager"),
  controller.getAllMaterials
);
router.post(
  "/add",
  authMiddleware,
  authorizeRoles("ClinicManager"),
  controller.addNewMaterial
);

router.get(
  "/transactions",
  authMiddleware,
  authorizeRoles("ClinicManager"),
  controller.getAllTransactions
);
router.post(
  "/import",
  authMiddleware,
  authorizeRoles("ClinicManager"),
  controller.importMaterial
);
router.get(
  "/report",
  authMiddleware,
  authorizeRoles("ClinicManager"),
  controller.getMaterialUsageReport
);

router.get(
  "/appointments",
  authMiddleware,
  authorizeRoles("Nurse"),
  controller.getTodayAppointments
);
router.post(
  "/use",
  authMiddleware,
  authorizeRoles("Nurse"),
  controller.useMaterial
);
router.post(
  "/return",
  authMiddleware,
  authorizeRoles("Nurse"),
  controller.returnMaterial
);
router.post(
  "/used",
  authMiddleware,
  authorizeRoles("Nurse"),
  controller.addUsedMaterial
);
router.get(
  "/service/:serviceId",
  authMiddleware,
  authorizeRoles("Nurse"),
  controller.getMaterialsByService
);

module.exports = router;
