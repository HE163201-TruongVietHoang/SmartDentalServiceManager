// routes/materialRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/materialController");

// 🔹 Nurse
router.get("/appointments", controller.getTodayAppointments);
router.get("/service/:serviceId", controller.getMaterialsByService);
router.post("/use", controller.useMaterial);
router.post("/return", controller.returnMaterial);
router.post("/used", controller.addUsedMaterial);

// 🔹 Admin
router.get("/", controller.getAllMaterials);
router.get("/transactions", controller.getAllTransactions);
router.post("/import", controller.importMaterial);
router.get("/report", controller.getMaterialUsageReport);

module.exports = router;
