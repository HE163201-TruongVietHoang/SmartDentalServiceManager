const express = require("express");
const router = express.Router();
const controller = require("../controllers/materialController");

router.get("/", controller.getAllMaterials);
router.get("/transactions", controller.getAllTransactions);
router.post("/use", controller.useMaterial);
router.post("/return", controller.returnMaterial);
router.post("/import", controller.importMaterial);
router.post("/used", controller.addUsedMaterial);
router.get("/appointments", controller.getTodayAppointments);
router.get("/service/:serviceId", controller.getMaterialsByService);
router.get("/report", controller.getMaterialUsageReport);

module.exports = router;
