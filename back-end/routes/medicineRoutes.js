// back-end/routes/medicineRoutes.js
const express = require("express");
const router = express.Router();

const {
  getMedicines,
  addMedicine,
  deleteMedicine,
} = require("../controllers/medicineController");

const { authMiddleware } = require("../middlewares/authMiddleware");

// Lấy danh sách thuốc
router.get("/", authMiddleware, getMedicines);

// Thêm thuốc mới
router.post("/add", authMiddleware, addMedicine);

// Xoá thuốc
router.delete("/:id", authMiddleware, deleteMedicine);

module.exports = router;
