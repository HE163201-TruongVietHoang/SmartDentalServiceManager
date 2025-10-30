const express = require("express");
const router = express.Router();
const controller = require("../controllers/materialController");
const authorizeRoles = require("../middlewares/roleMiddleware");

// =============== CLINIC MANAGER =================
// Lấy danh sách vật tư
router.get("/", authorizeRoles("ClinicManager"), controller.getAllMaterials);

// Lấy lịch sử giao dịch
router.get(
  "/transactions",
  authorizeRoles("ClinicManager"),
  controller.getAllTransactions
);

// Nhập kho (IMPORT)
router.post(
  "/import",
  authorizeRoles("ClinicManager"),
  controller.importMaterial
);

// Báo cáo sử dụng vật tư
router.get(
  "/report",
  authorizeRoles("ClinicManager"),
  controller.getMaterialUsageReport
);

// =============== NURSE =================
// Y tá lấy vật tư (USE)
router.post("/use", authorizeRoles("Nurse"), controller.useMaterial);

// Y tá hoàn vật tư (RETURN)
router.post("/return", authorizeRoles("Nurse"), controller.returnMaterial);

// Y tá ghi nhận vật tư thực tế đã dùng
router.post("/used", authorizeRoles("Nurse"), controller.addUsedMaterial);

// Lấy danh sách ca khám hôm nay
router.get(
  "/appointments",
  authorizeRoles("Nurse"),
  controller.getTodayAppointments
);

// Lấy vật tư định mức cho 1 dịch vụ
router.get(
  "/service/:serviceId",
  authorizeRoles("Nurse"),
  controller.getMaterialsByService
);

module.exports = router;
