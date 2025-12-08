// back-end/routes/medicineRoutes.js
const express = require("express");
const router = express.Router();

const {
  getMedicines,
  addMedicine,
  deleteMedicine,
  updateMedicine,
} = require("../controllers/medicineController");

const { authMiddleware } = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

// Lấy danh sách thuốc
router.get(
  "/",
  authMiddleware,
  authorizeRoles("ClinicManager", "Doctor"),
  getMedicines
);

// Thêm thuốc mới
router.post(
  "/add",
  authMiddleware,
  authorizeRoles("ClinicManager"),
  addMedicine
);

// Xoá thuốc
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("ClinicManager"),
  deleteMedicine
);
// Cập nhật thuốc
router.put(
  "/update/:id",
  authMiddleware,
  authorizeRoles("ClinicManager"),
  updateMedicine
);

module.exports = router;
